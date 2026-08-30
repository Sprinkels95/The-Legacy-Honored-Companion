import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { CalendarEvent } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Required Google Calendar Scopes
provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initCalendarAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If logged in via Firebase session but token not cached in memory, prompt popup on next action
        if (onAuthSuccess) onAuthSuccess(user, '');
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup and obtain access token in memory
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google sign in');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Fetch live events from Google Calendar API
export const fetchLiveGoogleCalendarEvents = async (token?: string): Promise<CalendarEvent[]> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Google Calendar access token is required to fetch live events.');
  }

  const now = new Date();
  // Fetch from start of today to 7 days ahead
  const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=50`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Calendar API error: ${response.statusText}`);
  }

  const data = await response.json();
  const rawItems = data.items || [];

  return rawItems.map((item: any, index: number): CalendarEvent => {
    const startDateTimeStr = item.start?.dateTime || item.start?.date;
    const endDateTimeStr = item.end?.dateTime || item.end?.date;

    const startDate = startDateTimeStr ? new Date(startDateTimeStr) : new Date();
    const endDate = endDateTimeStr ? new Date(endDateTimeStr) : new Date(startDate.getTime() + 60 * 60 * 1000);

    const startTimeFormatted = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endTimeFormatted = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const title = item.summary || 'Scheduled Care Event';
    const description = item.description || '';
    const location = item.location || 'Home / Local';

    // Clinical, location & audience heuristics
    const titleLower = title.toLowerCase() + ' ' + description.toLowerCase();
    const locationLower = location.toLowerCase().trim();

    let category: CalendarEvent['category'] = 'Routine';
    let bufferMinutes = 15;
    let fatigueRisk: 'Low' | 'Moderate' | 'High' = 'Low';
    let audience: CalendarEvent['audience'] = 'Captain Wade';
    let needsTransit = false;
    let transitMode: CalendarEvent['transitMode'] = 'No Transit (Home/Virtual)';
    let isWorkTripLA = false;
    let colorTag: CalendarEvent['colorTag'] = 'amber';

    // Check location rule: if "at home" or virtual -> No transit; if address / clinic -> Uber Assist
    const isHomeOrVirtual = 
      locationLower.includes('at home') || 
      locationLower.includes('home') || 
      locationLower.includes('zoom') || 
      locationLower.includes('meet') || 
      locationLower.includes('virtual') || 
      locationLower.includes('phone') ||
      locationLower === '' ||
      locationLower === 'home / local';

    const hasSpecificAddressOrVenue = 
      !isHomeOrVirtual && 
      (location.length > 5 || /\d/.test(location) || location.includes(',') || locationLower.includes('ave') || locationLower.includes('st') || locationLower.includes('blvd') || locationLower.includes('dr') || locationLower.includes('center') || locationLower.includes('clinic') || locationLower.includes('hospital'));

    // 1. Detect Work Trip / LA (Elsbeth)
    if (titleLower.includes('la') || titleLower.includes('los angeles') || titleLower.includes('work trip') || titleLower.includes('conference') || titleLower.includes('flight') || titleLower.includes('sfo')) {
      category = 'Travel / Work Trip';
      audience = 'Elsbeth (Work/LA)';
      isWorkTripLA = true;
      colorTag = 'purple';
      needsTransit = true;
      transitMode = 'Flight / Out of Town';
      bufferMinutes = 45;
    }
    // 2. Detect Little Wade (Son)
    else if (titleLower.includes('little wade') || titleLower.includes('son') || titleLower.includes('soccer') || titleLower.includes('school') || titleLower.includes('practice') || titleLower.includes('pickup') || titleLower.includes('dropoff') || titleLower.includes('tutor') || titleLower.includes('game')) {
      audience = 'Little Wade';
      category = 'Family / Rest';
      colorTag = 'blue';
      needsTransit = hasSpecificAddressOrVenue || titleLower.includes('practice') || titleLower.includes('game') || titleLower.includes('pickup') || titleLower.includes('school');
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
      bufferMinutes = 15;
    }
    // 3. Detect Elsbeth (Caregiver Work/Personal)
    else if (titleLower.includes('elsbeth') || titleLower.includes('work meeting') || titleLower.includes('client') || titleLower.includes('office') || titleLower.includes('zoom meeting')) {
      audience = 'Elsbeth (Work/LA)';
      colorTag = 'purple';
      needsTransit = hasSpecificAddressOrVenue && !isHomeOrVirtual;
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
    }
    // 4. Clinical Medical & Doctor Visits for Captain Wade
    else if (titleLower.includes('doctor') || titleLower.includes('clinic') || titleLower.includes('neurolog') || titleLower.includes('telehealth') || titleLower.includes('dr.') || titleLower.includes('ucsf') || titleLower.includes('sutter') || titleLower.includes('henderson')) {
      category = 'Clinical / Medical';
      audience = 'Captain Wade';
      colorTag = 'rose';
      const isTelehealth = isHomeOrVirtual || titleLower.includes('telehealth') || titleLower.includes('zoom') || titleLower.includes('virtual');
      bufferMinutes = isTelehealth ? 10 : 25;
      fatigueRisk = isTelehealth ? 'Low' : 'Moderate';
      needsTransit = !isTelehealth && (hasSpecificAddressOrVenue || !isHomeOrVirtual);
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
    }
    // 5. Physical Therapy & Boxing
    else if (titleLower.includes('physical therapy') || titleLower.includes('pt') || titleLower.includes('gait') || titleLower.includes('boxing') || titleLower.includes('rock steady')) {
      category = 'Physical Therapy';
      audience = 'Captain Wade';
      colorTag = 'amber';
      bufferMinutes = 25;
      fatigueRisk = 'Moderate';
      needsTransit = hasSpecificAddressOrVenue || !isHomeOrVirtual;
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
    }
    // 6. Community / Social
    else if (titleLower.includes('support') || titleLower.includes('coffee') || titleLower.includes('social') || titleLower.includes('circle') || titleLower.includes('pavilion')) {
      category = 'Community / Social';
      audience = 'Captain Wade';
      colorTag = 'emerald';
      bufferMinutes = 20;
      fatigueRisk = 'Low';
      needsTransit = hasSpecificAddressOrVenue || !isHomeOrVirtual;
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
    }
    // 7. Family / Dinner / Rest
    else if (titleLower.includes('dinner') || titleLower.includes('lunch') || titleLower.includes('rest') || titleLower.includes('family') || titleLower.includes('roast')) {
      category = 'Family / Rest';
      audience = 'Family Shared';
      colorTag = 'indigo';
      bufferMinutes = 0;
      fatigueRisk = 'Low';
      needsTransit = hasSpecificAddressOrVenue && !isHomeOrVirtual;
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
    } else {
      // Default: check if location has an address requiring Uber
      needsTransit = hasSpecificAddressOrVenue && !isHomeOrVirtual;
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
      bufferMinutes = needsTransit ? 20 : 0;
      colorTag = needsTransit ? 'amber' : 'emerald';
    }

    // Departure time with PD mobility buffer
    const departureTime = new Date(startDate.getTime() - bufferMinutes * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    let wadeNote = `Keep an unhurried, comfortable pace for ${title}.`;
    if (audience === 'Little Wade') {
      wadeNote = `Little Wade has ${title}. You can cheer him on or relax at home!`;
    } else if (audience === 'Elsbeth (Work/LA)') {
      wadeNote = isWorkTripLA 
        ? `Elsbeth is traveling to LA for work. Support team and morning check-ins are active.`
        : `Elsbeth has ${title}. Your routine continues smoothly with all pump checks set.`;
    }

    return {
      id: item.id || `live-cal-${index}`,
      title,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      timeFormatted: `${startTimeFormatted} – ${endTimeFormatted}`,
      location,
      address: item.location,
      attendees: item.attendees?.map((a: any) => a.displayName || a.email),
      category,
      audience,
      needsTransit,
      transitMode,
      isWorkTripLA,
      colorTag,
      description: description || `Live Google Calendar event from ${item.organizer?.email || 'primary calendar'}.`,
      mobilityPrepBufferMinutes: bufferMinutes,
      suggestedDepartureTime: departureTime,
      estimatedDriveMinutes: 15,
      fatigueRiskLevel: fatigueRisk,
      levodopaMealAlert: category === 'Physical Therapy' ? 'Keep meals light on protein before movement therapy.' : undefined,
      vyalevPumpSyncNote: isWorkTripLA ? 'Caregiver traveling to LA: Ensure emergency contacts & local support on standby.' : 'Continuous pump infusion nominal.',
      actionForWade: wadeNote,
      actionForCaregiver: needsTransit 
        ? `Transit Required (${transitMode}): Stage departure for ${departureTime} (+${bufferMinutes}m buffer).` 
        : `Home/Virtual routine: Routine monitoring and comfort checks.`
    };
  });
};
