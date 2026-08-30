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

const TOKEN_STORAGE_KEY = 'gcal_access_token';

let isSigningIn = false;
let cachedAccessToken: string | null = (() => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  } catch {
    return null;
  }
})();

// Initialize auth state listener
export const initCalendarAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const storedToken = cachedAccessToken || localStorage.getItem(TOKEN_STORAGE_KEY) || '';
      if (storedToken) {
        cachedAccessToken = storedToken;
        if (onAuthSuccess) onAuthSuccess(user, storedToken);
      } else if (!isSigningIn) {
        if (onAuthSuccess) onAuthSuccess(user, '');
      }
    } else {
      cachedAccessToken = null;
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } catch {}
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup and obtain access token in memory + localStorage
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    if (!token) {
      throw new Error('Google Sign-In succeeded, but calendar access token was not returned.');
    }

    cachedAccessToken = token;
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {}

    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken || localStorage.getItem(TOKEN_STORAGE_KEY) || null;
};

export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
};

// Fetch live events from Google Calendar API (focused on the next 5 days)
export const fetchLiveGoogleCalendarEvents = async (token?: string): Promise<CalendarEvent[]> => {
  const activeToken = token || cachedAccessToken || localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!activeToken) {
    throw new Error('Google Calendar access token is required to fetch live events.');
  }

  const now = new Date();
  // Start of today (00:00:00 local time)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  // Next 5 days window (End of Day 5 at 23:59:59)
  const endOfWindow = new Date(startOfToday.getTime() + 5 * 24 * 60 * 60 * 1000 - 1);

  const timeMin = startOfToday.toISOString();
  const timeMax = endOfWindow.toISOString();

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

    // Date calculations
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    const weekdayLong = startDate.toLocaleDateString('en-US', { weekday: 'long' });
    const monthShort = startDate.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = startDate.getDate();
    const dateStr = `${weekdayLong}, ${monthShort} ${dayNum}`;

    // Relative day label
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowIso = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;
    
    let dayLabel = weekdayLong;
    let fullDateFormatted = dateStr;
    if (isoDate === todayIso) {
      dayLabel = 'Today';
      fullDateFormatted = `Today (${weekdayLong.slice(0, 3)}, ${monthShort} ${dayNum})`;
    } else if (isoDate === tomorrowIso) {
      dayLabel = 'Tomorrow';
      fullDateFormatted = `Tomorrow (${weekdayLong.slice(0, 3)}, ${monthShort} ${dayNum})`;
    } else {
      fullDateFormatted = `${weekdayLong.slice(0, 3)}, ${monthShort} ${dayNum}`;
    }

    const title = item.summary || 'Scheduled Care Event';
    const description = item.description || '';
    const location = item.location || 'Home / Local';

    // Clinical, location & audience heuristics
    const titleLower = title.toLowerCase() + ' ' + description.toLowerCase();
    const locationLower = location.toLowerCase().trim();

    let category: CalendarEvent['category'] = 'Routine';
    let bufferMinutes = 0;
    let fatigueRisk: 'Low' | 'Moderate' | 'High' = 'Low';
    let audience: CalendarEvent['audience'] = 'Captain Wade';
    let needsTransit = false;
    let transitMode: CalendarEvent['transitMode'] = 'No Transit (Home/Virtual)';
    let isWorkTripLA = false;
    let colorTag: CalendarEvent['colorTag'] = 'emerald';

    // Explicit Home / Virtual / In-Home activity check (e.g. Shower, Bath, Bed, Rest, Zoom, Phone)
    const isExplicitHomeRoutine =
      titleLower.includes('shower') ||
      titleLower.includes('bath') ||
      titleLower.includes('wake') ||
      titleLower.includes('sleep') ||
      titleLower.includes('bed') ||
      titleLower.includes('rest') ||
      titleLower.includes('breakfast') ||
      titleLower.includes('lunch') ||
      titleLower.includes('dinner') ||
      titleLower.includes('walk') ||
      titleLower.includes('garden') ||
      titleLower.includes('patio') ||
      titleLower.includes('tv') ||
      titleLower.includes('reading') ||
      titleLower.includes('zoom') ||
      titleLower.includes('telehealth') ||
      titleLower.includes('virtual') ||
      titleLower.includes('phone') ||
      locationLower.includes('at home') ||
      locationLower.includes('home') ||
      locationLower.includes('zoom') ||
      locationLower.includes('meet') ||
      locationLower.includes('virtual') ||
      locationLower.includes('phone') ||
      locationLower === '' ||
      locationLower === 'home / local';

    const hasSpecificAddressOrVenue = 
      !isExplicitHomeRoutine && 
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
      bufferMinutes = needsTransit ? 15 : 0;
    }
    // 3. Detect Elsbeth (Caregiver Work/Personal)
    else if (titleLower.includes('elsbeth') || titleLower.includes('work meeting') || titleLower.includes('client') || titleLower.includes('office') || titleLower.includes('zoom meeting')) {
      audience = 'Elsbeth (Work/LA)';
      colorTag = 'purple';
      needsTransit = hasSpecificAddressOrVenue && !isExplicitHomeRoutine;
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
      bufferMinutes = 0;
    }
    // 4. Clinical Medical & Doctor Visits for Captain Wade
    else if (titleLower.includes('doctor') || titleLower.includes('clinic') || titleLower.includes('neurolog') || titleLower.includes('telehealth') || titleLower.includes('dr.') || titleLower.includes('ucsf') || titleLower.includes('sutter') || titleLower.includes('henderson')) {
      category = 'Clinical / Medical';
      audience = 'Captain Wade';
      colorTag = 'rose';
      const isTelehealth = isExplicitHomeRoutine || titleLower.includes('telehealth') || titleLower.includes('zoom') || titleLower.includes('virtual');
      needsTransit = !isTelehealth && (hasSpecificAddressOrVenue || !isExplicitHomeRoutine);
      bufferMinutes = needsTransit ? 25 : 0;
      fatigueRisk = isTelehealth ? 'Low' : 'Moderate';
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
    }
    // 5. Physical Therapy & Boxing
    else if (titleLower.includes('physical therapy') || titleLower.includes('pt') || titleLower.includes('gait') || titleLower.includes('boxing') || titleLower.includes('rock steady')) {
      category = 'Physical Therapy';
      audience = 'Captain Wade';
      colorTag = 'amber';
      needsTransit = hasSpecificAddressOrVenue || !isExplicitHomeRoutine;
      bufferMinutes = needsTransit ? 25 : 0;
      fatigueRisk = 'Moderate';
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
    }
    // 6. Community / Social
    else if (titleLower.includes('support') || titleLower.includes('coffee') || titleLower.includes('social') || titleLower.includes('circle') || titleLower.includes('pavilion')) {
      category = 'Community / Social';
      audience = 'Captain Wade';
      colorTag = 'emerald';
      needsTransit = hasSpecificAddressOrVenue || !isExplicitHomeRoutine;
      bufferMinutes = needsTransit ? 20 : 0;
      fatigueRisk = 'Low';
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
    }
    // 7. Family / Dinner / Rest / Routine
    else if (titleLower.includes('dinner') || titleLower.includes('lunch') || titleLower.includes('rest') || titleLower.includes('family') || titleLower.includes('roast')) {
      category = 'Family / Rest';
      audience = 'Family Shared';
      colorTag = 'indigo';
      bufferMinutes = 0;
      fatigueRisk = 'Low';
      needsTransit = hasSpecificAddressOrVenue && !isExplicitHomeRoutine;
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
    } else {
      // Default: Home routine unless explicit venue address is specified
      needsTransit = hasSpecificAddressOrVenue && !isExplicitHomeRoutine;
      transitMode = needsTransit ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)';
      bufferMinutes = needsTransit ? 20 : 0;
      colorTag = needsTransit ? 'amber' : 'emerald';
    }

    // Departure time with PD mobility buffer (STRICTLY only when transit is required with > 0m buffer)
    const departureTime = (needsTransit && bufferMinutes > 0)
      ? new Date(startDate.getTime() - bufferMinutes * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : undefined;

    let wadeNote = `Keep an unhurried, comfortable pace for ${title}.`;
    if (audience === 'Little Wade') {
      wadeNote = `Little Wade has ${title}. You can cheer him on or relax at home!`;
    } else if (audience === 'Elsbeth (Work/LA)') {
      wadeNote = isWorkTripLA 
        ? `Elsbeth is traveling to LA for work. Support team and morning check-ins are active.`
        : `Elsbeth has ${title}. Your routine continues smoothly with all pump checks set.`;
    } else if (titleLower.includes('shower') || titleLower.includes('bath')) {
      wadeNote = `Take plenty of time in the shower with warm water, grab bars, and non-slip mat support.`;
    }

    return {
      id: item.id || `live-cal-${index}`,
      title,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      timeFormatted: `${startTimeFormatted} – ${endTimeFormatted}`,
      location: location || (isExplicitHomeRoutine ? 'Home' : 'Local'),
      address: item.location,
      dateStr,
      isoDate,
      dayLabel,
      fullDateFormatted,
      attendees: item.attendees?.map((a: any) => a.displayName || a.email),
      category,
      audience,
      needsTransit,
      transitMode,
      isWorkTripLA,
      colorTag,
      htmlLink: item.htmlLink,
      description: description || `Live Google Calendar event from ${item.organizer?.email || 'primary calendar'}.`,
      mobilityPrepBufferMinutes: bufferMinutes,
      suggestedDepartureTime: departureTime,
      estimatedDriveMinutes: needsTransit ? 15 : 0,
      fatigueRiskLevel: fatigueRisk,
      levodopaMealAlert: category === 'Physical Therapy' ? 'Keep meals light on protein before movement therapy.' : undefined,
      vyalevPumpSyncNote: isWorkTripLA ? 'Caregiver traveling to LA: Ensure emergency contacts & local support on standby.' : 'Continuous pump infusion nominal.',
      actionForWade: wadeNote,
      actionForCaregiver: needsTransit && departureTime
        ? `Transit Required (${transitMode}): Stage departure for ${departureTime} (+${bufferMinutes}m buffer).` 
        : `Home/Virtual routine: Routine monitoring and comfort checks.`
    };
  });
};
