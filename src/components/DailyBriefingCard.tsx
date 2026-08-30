import React, { useState, useEffect } from 'react';
import { 
  Calendar, Volume2, VolumeX, RefreshCw, Clock, MapPin, 
  Sparkles, HeartPulse, ShieldCheck, Car, CheckCircle2, 
  Send, UserCheck, AlertTriangle, Play, RotateCcw, ChevronDown, 
  ChevronUp, ExternalLink, Activity, Info, Bot, Download,
  CalendarDays, Check, FileText, ArrowRight, Sun, Moon, LogIn, LogOut, CheckCircle,
  PhoneCall, Stethoscope
} from 'lucide-react';
import { DailyCalendarBriefing, AgentPersonaId, CalendarEvent, TransitBuffer, EventAudience, TransitMode } from '../types';
import { acousticVoice } from '../utils/acousticVoiceEngine';
import { 
  initCalendarAuth, 
  googleSignIn, 
  logoutGoogle, 
  fetchLiveGoogleCalendarEvents, 
  getAccessToken 
} from '../services/googleCalendarService';
import { User } from 'firebase/auth';

interface DailyBriefingCardProps {
  briefing: DailyCalendarBriefing;
  selectedPersona: AgentPersonaId;
  onRefreshBriefing: () => void;
  isRefreshing: boolean;
  onOpenDiscordModal?: () => void;
}

// 7-Day Pre-Configured Parkinson's Clinical Calendar & Family Schedule with Synchronous Full Guidance
interface DayConfig {
  dayLabel: string;
  dateStr: string;
  focus: string;
  focusColor: string;
  weather: string;
  spokenAudioScript: string;
  actionsForWade: string[];
  actionsForElsbeth: string[];
  clinicalMedicationSynergy: {
    levodopaAbsorptionAdvice: string;
    vyalevPumpCheck: string;
  };
  events: CalendarEvent[];
}

const WEEK_SCHEDULE_DATA: Record<string, DayConfig> = {
  'sat': {
    dayLabel: 'Saturday (Today)',
    dateStr: 'Saturday, Aug 29, 2026',
    focus: 'PT & Telehealth',
    focusColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    weather: 'Mild & Sunny, 68°F',
    spokenAudioScript: "Good morning Captain Wade. Today is Saturday, August twenty-ninth. Your pump is running smoothly. We have Physical Therapy with Sarah at 10:30, and Dr. Henderson joins us for a brief video check-in this afternoon. Take your time with every step.",
    actionsForWade: [
      'Enjoy a warm breakfast and morning hydration.',
      'Physical therapy with Sarah at 10:30 AM — unhurried steps.',
      'Afternoon video check-in with Dr. Henderson from home.'
    ],
    actionsForElsbeth: [
      'Uber Assist staged for 09:55 AM (+25m mobility buffer).',
      'Elsbeth drives Little Wade to Presidio soccer match at 11:15 AM.',
      'Prepare 1-click clinical dossier on screen for Dr. Henderson.'
    ],
    clinicalMedicationSynergy: {
      levodopaAbsorptionAdvice: 'Light morning carbohydrates to avoid carrier competition with daytime levodopa.',
      vyalevPumpCheck: 'Continuous pump cartridge verified with 14h reserve.'
    },
    events: [
      {
        id: 'cal-sat-1',
        title: 'Morning Basal Routine & Low-Protein Breakfast',
        startTime: '08:30 AM',
        endTime: '09:15 AM',
        timeFormatted: '8:30 AM – 9:15 AM',
        location: 'Home Kitchen',
        category: 'Routine',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Gentle morning routine. Fresh rolled oats and low-acid orange juice to optimize gut absorption before daily movement.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        levodopaMealAlert: 'Optimal: Low protein breakfast avoids LNAA carrier competition with levodopa.',
        vyalevPumpSyncNote: 'Continuous pump cartridge verified with 14h reserve.',
        actionForWade: 'Enjoy a warm breakfast and gentle hydration.',
        actionForCaregiver: 'Verify morning water intake and infusion site comfort.'
      },
      {
        id: 'cal-sat-2',
        title: 'Physical Therapy: Posture & Gait Stability with Sarah',
        startTime: '10:30 AM',
        endTime: '11:30 AM',
        timeFormatted: '10:30 AM – 11:30 AM',
        location: 'Sutter Health Physical Medicine',
        address: '2351 Clay Street, San Francisco, CA',
        attendees: ['Sarah Lin, DPT', 'Elsbeth Seymour'],
        category: 'Physical Therapy',
        audience: 'Captain Wade',
        needsTransit: true,
        transitMode: 'Uber Assist / Ride Required',
        colorTag: 'amber',
        description: 'Targeted gait recalibration, rhythmic auditory cueing, and balance preservation exercises.',
        mobilityPrepBufferMinutes: 25,
        suggestedDepartureTime: '09:55 AM',
        estimatedDriveMinutes: 10,
        fatigueRiskLevel: 'Moderate',
        levodopaMealAlert: 'Take light hydration 15 minutes before departure.',
        vyalevPumpSyncNote: 'Check pump harness clip before transfer into vehicle.',
        actionForWade: 'Comfortable walking shoes on; take your time stepping into the car.',
        actionForCaregiver: 'Uber Assist staged for 09:55 AM departure (+25m mobility buffer).'
      },
      {
        id: 'cal-sat-2b',
        title: 'Little Wade Soccer Match & Team Snack Duty',
        startTime: '11:30 AM',
        endTime: '01:00 PM',
        timeFormatted: '11:30 AM – 1:00 PM',
        location: 'Presidio Sports Complex',
        address: '610 Graham St, San Francisco, CA',
        attendees: ['Little Wade (Son)', 'Elsbeth Seymour'],
        category: 'Family / Rest',
        audience: 'Little Wade',
        needsTransit: true,
        transitMode: 'Uber Assist / Ride Required',
        colorTag: 'blue',
        description: 'Little Wade\'s weekend youth soccer league game. Elsbeth handles driving & orange slices.',
        mobilityPrepBufferMinutes: 15,
        suggestedDepartureTime: '11:15 AM',
        fatigueRiskLevel: 'Low',
        actionForWade: 'Little Wade has soccer! Relax at home or tune in to the score updates.',
        actionForCaregiver: 'Elsbeth driving Little Wade to Presidio fields; Wade resting at home.'
      },
      {
        id: 'cal-sat-3',
        title: 'Midday Quiet Downtime & Reclined Rest',
        startTime: '01:30 PM',
        endTime: '03:00 PM',
        timeFormatted: '1:30 PM – 3:00 PM',
        location: 'Living Room Recliner',
        category: 'Family / Rest',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Dedicated post-lunch rest block to prevent afternoon cognitive fatigue and muscle rigidity.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        levodopaMealAlert: 'Light turkey wrap lunch; maintain 45-minute buffer before any PRN oral tablet.',
        vyalevPumpSyncNote: 'Infusion rate steady at 0.58 mL/hr.',
        actionForWade: 'Recline in armchair, listen to audio or music, and take an unhurried rest.',
        actionForCaregiver: 'Keep ambient noise calm; review weekly neurology report.'
      },
      {
        id: 'cal-sat-4',
        title: 'Dr. Henderson Telehealth Neurologist Check-In',
        startTime: '03:30 PM',
        endTime: '04:00 PM',
        timeFormatted: '3:30 PM – 4:00 PM',
        location: 'Google Meet (Virtual Consultation)',
        attendees: ['Dr. Arthur Henderson, MD', 'Elsbeth Seymour'],
        category: 'Clinical / Medical',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'rose',
        description: 'Quarterly review of Vyalev 24h pump continuous metrics and motor ON/OFF stability diary.',
        mobilityPrepBufferMinutes: 10,
        suggestedDepartureTime: '03:20 PM (Computer Setup)',
        fatigueRiskLevel: 'Low',
        levodopaMealAlert: 'Ensure water glass at bedside table.',
        vyalevPumpSyncNote: 'Have 7-day infusion summary open for Dr. Henderson review.',
        actionForWade: 'Join video chat from the living room tablet; no travel needed.',
        actionForCaregiver: 'Review generated 1-click clinical synthesis report on screen.'
      },
      {
        id: 'cal-sat-5',
        title: 'Family Dinner & Evening Protein Repletion',
        startTime: '06:00 PM',
        endTime: '07:15 PM',
        timeFormatted: '6:00 PM – 7:15 PM',
        location: 'Dining Room',
        category: 'Family / Rest',
        audience: 'Family Shared',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'indigo',
        description: 'Main daily high-protein meal strategically scheduled in the evening when motor demands are low.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        levodopaMealAlert: 'Dinner is the designated protein window (salmon/chicken) so daytime levodopa absorption was preserved.',
        vyalevPumpSyncNote: 'Check night-mode cassette changeover schedule for 9:00 PM.',
        actionForWade: 'Enjoy dinner with family at an easy, relaxing pace.',
        actionForCaregiver: 'Prepare fresh Vyalev cartridge from refrigerator at 8:30 PM.'
      }
    ]
  },
  'sun': {
    dayLabel: 'Sunday',
    dateStr: 'Sunday, Aug 30, 2026',
    focus: 'Quiet Rest & Family',
    focusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    weather: 'Sunny & Gentle, 70°F',
    spokenAudioScript: "Good morning Captain Wade. Today is a peaceful Sunday, August thirtieth. No clinic visits today. Enjoy a quiet coffee on the patio, a gentle garden walk with Elsbeth, and family roast dinner tonight.",
    actionsForWade: [
      'Relax on the back patio with your morning coffee.',
      'Gentle garden walk at 11:00 AM in the fresh air.',
      'Enjoy Sunday roast dinner with the visiting grandchildren.'
    ],
    actionsForElsbeth: [
      'Inspect Vyalev infusion site dressing during morning routine.',
      'Supervise Little Wade\'s science project in craft area.',
      'Prepare Sunday roast dinner; prime high-contrast dining table.'
    ],
    clinicalMedicationSynergy: {
      levodopaAbsorptionAdvice: 'Designated weekly protein repletion dinner window at 5:30 PM.',
      vyalevPumpCheck: 'Basal infusion rate steady. Sunday restful mode active.'
    },
    events: [
      {
        id: 'cal-sun-1',
        title: 'Leisurely Sunday Breakfast & Coffee',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        timeFormatted: '9:00 AM – 10:00 AM',
        location: 'Kitchen Patio',
        category: 'Routine',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Zero-rush morning with fresh fruit, decaf coffee, and sourdough toast.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        levodopaMealAlert: 'Light carbohydrate breakfast; optimal gastric emptying.',
        vyalevPumpSyncNote: 'Basal infusion rate steady. Sunday restful mode active.',
        actionForWade: 'Sip morning coffee on the back patio at your own pace.',
        actionForCaregiver: 'Inspect Vyalev infusion site dressing during morning dressing.'
      },
      {
        id: 'cal-sun-2',
        title: 'Backyard Garden Walk & Gentle Breathing',
        startTime: '11:00 AM',
        endTime: '11:45 AM',
        timeFormatted: '11:00 AM – 11:45 AM',
        location: 'Backyard Rose Garden',
        category: 'Routine',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Gentle flat-surface walking with trekking pole or walker for sensory grounding.',
        mobilityPrepBufferMinutes: 10,
        suggestedDepartureTime: '10:50 AM',
        fatigueRiskLevel: 'Low',
        actionForWade: 'Enjoy the fresh air and flower beds with Elsbeth.',
        actionForCaregiver: 'Accompany with steady pacing; offer arm support along brick path.'
      },
      {
        id: 'cal-sun-2b',
        title: 'Little Wade Science Project Workshop',
        startTime: '02:00 PM',
        endTime: '03:30 PM',
        timeFormatted: '2:00 PM – 3:30 PM',
        location: 'Family Craft Area',
        category: 'Family / Rest',
        audience: 'Little Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'blue',
        description: 'Little Wade working on school solar system model. Wade can watch and supervise.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Encourage Little Wade with his school project.',
        actionForCaregiver: 'Supervise supplies and maintain quiet space.'
      },
      {
        id: 'cal-sun-3',
        title: 'Sunday Family Roast Dinner',
        startTime: '05:30 PM',
        endTime: '07:00 PM',
        timeFormatted: '5:30 PM – 7:00 PM',
        location: 'Dining Room',
        category: 'Family / Rest',
        audience: 'Family Shared',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'indigo',
        description: 'Traditional family dinner with roast chicken, mashed potatoes, and visiting grandchildren.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        levodopaMealAlert: 'Designated weekly high-protein window.',
        actionForWade: 'Enjoy visiting with the grandkids and sharing stories.',
        actionForCaregiver: 'Ensure ergonomic chair seating and high-contrast dining utensils.'
      }
    ]
  },
  'mon': {
    dayLabel: 'Monday',
    dateStr: 'Monday, Aug 31, 2026',
    focus: 'Rock Steady Boxing',
    focusColor: 'bg-amber-100 text-amber-800 border-amber-200',
    weather: 'Partly Cloudy, 65°F',
    spokenAudioScript: "Rise and shine, Captain Wade. Today is Monday, August thirty-first. Time for Rock Steady Boxing at 10:00 AM. We'll head out unhurried at 9:20 AM. Show them that heavyweight punch!",
    actionsForWade: [
      'Hydrate well and wear athletic shoes for boxing.',
      'Rock Steady Boxing at 10:00 AM — powerful punches, rest as needed.',
      'Restorative afternoon siesta with feet up.'
    ],
    actionsForElsbeth: [
      'Uber Assist staged for 09:20 AM departure (+25m buffer).',
      'Pack boxing gloves, water bottle, and electrolyte pack.',
      'Apply cool compress and monitor skin perfusion post-workout.'
    ],
    clinicalMedicationSynergy: {
      levodopaAbsorptionAdvice: 'No heavy proteins prior to boxing to ensure peak motor ON mobility.',
      vyalevPumpCheck: 'Sport harness waistband secured comfortably across abdomen.'
    },
    events: [
      {
        id: 'cal-mon-1',
        title: 'Morning Fuel & Hydration Routine',
        startTime: '08:00 AM',
        endTime: '08:45 AM',
        timeFormatted: '8:00 AM – 8:45 AM',
        location: 'Home Kitchen',
        category: 'Routine',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Pre-boxing hydration and light complex carbs (banana and oatmeal).',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        levodopaMealAlert: 'No heavy proteins before boxing class to guarantee max motor ON state.',
        actionForWade: 'Hydrate well and wear your comfortable athletic shoes.',
        actionForCaregiver: 'Pack water bottle and boxing gloves into the travel tote.'
      },
      {
        id: 'cal-mon-2',
        title: 'Rock Steady Boxing for Parkinson\'s (Fighter Session)',
        startTime: '10:00 AM',
        endTime: '11:15 AM',
        timeFormatted: '10:00 AM – 11:15 AM',
        location: 'Bay Area PD Fitness Center',
        address: '1420 Ocean Ave, San Francisco, CA',
        category: 'Community / Social',
        audience: 'Captain Wade',
        needsTransit: true,
        transitMode: 'Uber Assist / Ride Required',
        colorTag: 'amber',
        description: 'High-intensity non-contact boxing, footwork drills, and vocal projection shouting exercises.',
        mobilityPrepBufferMinutes: 25,
        suggestedDepartureTime: '09:20 AM',
        estimatedDriveMinutes: 15,
        fatigueRiskLevel: 'Moderate',
        levodopaMealAlert: 'Electrolyte hydration during training breaks.',
        vyalevPumpSyncNote: 'Secure pump sport waistband snugly across abdomen.',
        actionForWade: 'Show off your heavyweight punching power! Rest whenever needed.',
        actionForCaregiver: 'Uber Assist staged for 09:20 AM departure with 25m buffer.'
      },
      {
        id: 'cal-mon-3',
        title: 'Post-Boxing Recline & Recovery Nap',
        startTime: '01:30 PM',
        endTime: '03:30 PM',
        timeFormatted: '1:30 PM – 3:30 PM',
        location: 'Living Room Recliner',
        category: 'Family / Rest',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Deep restorative muscle recovery and leg elevation.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Recline with feet up and enjoy a well-deserved afternoon nap.',
        actionForCaregiver: 'Apply cool moist towel and verify comfortable skin perfusion.'
      }
    ]
  },
  'tue': {
    dayLabel: 'Tuesday',
    dateStr: 'Tuesday, Sep 1, 2026',
    focus: 'PT & Speech Therapy',
    focusColor: 'bg-blue-100 text-blue-800 border-blue-200',
    weather: 'Sunny & Clear, 69°F',
    spokenAudioScript: "Good morning Captain. Today is Tuesday, September first. We have gait stability training with Sarah at 10:30 AM, followed by your LSVT LOUD speech session from the study at 2:00 PM.",
    actionsForWade: [
      'Focus on big, tall steps at physical therapy with Sarah.',
      'LSVT LOUD speech session at 2:00 PM from home.',
      'Welcome Little Wade home from after-school math club.'
    ],
    actionsForElsbeth: [
      'Uber Assist departure at 09:55 AM with +25m buffer.',
      'Stage external microphone & room-temperature water for speech therapy.',
      'Drive to Roosevelt Middle School for Little Wade pickup at 4:00 PM.'
    ],
    clinicalMedicationSynergy: {
      levodopaAbsorptionAdvice: 'Light citrus hydration 20 minutes before afternoon speech exercises.',
      vyalevPumpCheck: 'Flow telemetry nominal with steady continuous delivery.'
    },
    events: [
      {
        id: 'cal-tue-1',
        title: 'Physical Therapy: Balance & Turning Drills with Sarah',
        startTime: '10:30 AM',
        endTime: '11:30 AM',
        timeFormatted: '10:30 AM – 11:30 AM',
        location: 'Sutter Health Physical Medicine',
        address: '2351 Clay Street, San Francisco, CA',
        category: 'Physical Therapy',
        audience: 'Captain Wade',
        needsTransit: true,
        transitMode: 'Uber Assist / Ride Required',
        colorTag: 'amber',
        description: 'Laser cueing gait practice and wide-base turning mechanics.',
        mobilityPrepBufferMinutes: 25,
        suggestedDepartureTime: '09:55 AM',
        estimatedDriveMinutes: 10,
        fatigueRiskLevel: 'Moderate',
        actionForWade: 'Focus on tall posture and taking big, deliberate steps.',
        actionForCaregiver: 'Uber Assist departure at 9:55 AM with full +25m buffer.'
      },
      {
        id: 'cal-tue-2',
        title: 'LSVT LOUD Speech Therapy (Virtual Session)',
        startTime: '02:00 PM',
        endTime: '02:45 PM',
        timeFormatted: '2:00 PM – 2:45 PM',
        location: 'Google Meet (Speech Clinic)',
        category: 'Clinical / Medical',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'rose',
        description: 'Vocal volume calibration, sustained phonation, and diaphragmatic breathing with speech therapist.',
        mobilityPrepBufferMinutes: 10,
        suggestedDepartureTime: '01:50 PM',
        fatigueRiskLevel: 'Low',
        actionForWade: 'Use your strong Captain\'s commanding voice!',
        actionForCaregiver: 'Set up external microphone and glass of room-temp water.'
      },
      {
        id: 'cal-tue-3',
        title: 'Little Wade After-School Math Club Pickup',
        startTime: '04:15 PM',
        endTime: '05:00 PM',
        timeFormatted: '4:15 PM – 5:00 PM',
        location: 'Roosevelt Middle School',
        address: '460 Arguello Blvd, San Francisco, CA',
        category: 'Family / Rest',
        audience: 'Little Wade',
        needsTransit: true,
        transitMode: 'Uber Assist / Ride Required',
        colorTag: 'blue',
        description: 'Elsbeth picks up Little Wade from school robotics & math club.',
        mobilityPrepBufferMinutes: 15,
        suggestedDepartureTime: '04:00 PM',
        fatigueRiskLevel: 'Low',
        actionForWade: 'Little Wade will be home at 5 PM after math club.',
        actionForCaregiver: 'Caregiver driving to school pickup at 4:00 PM.'
      }
    ]
  },
  'wed': {
    dayLabel: 'Wednesday',
    dateStr: 'Wednesday, Sep 2, 2026',
    focus: 'Elsbeth LA Work Trip & Care Backup',
    focusColor: 'bg-purple-100 text-purple-800 border-purple-200',
    weather: 'Breezy & Mild, 66°F',
    spokenAudioScript: "Good morning Captain Wade. Today is Wednesday, September second. Elsbeth is traveling to Los Angeles for client meetings today. Nurse Maria is here with you at home. You have peer coffee circle at 11:00 AM.",
    actionsForWade: [
      'Elsbeth is in LA for work today; Nurse Maria is on duty with you.',
      'Parkinson\'s peer coffee circle at 11:00 AM at the pavilion.',
      'Listen to your favorite jazz records this afternoon.'
    ],
    actionsForElsbeth: [
      'Elsbeth in Los Angeles: remote telemetry check at 12:00 PM.',
      'Nurse Maria on-site for morning support & pavilion outing.',
      'Uber Assist scheduled for 10:25 AM departure with Maria.'
    ],
    clinicalMedicationSynergy: {
      levodopaAbsorptionAdvice: 'Nurse Maria oversees low-protein lunch and hydration schedule.',
      vyalevPumpCheck: 'LA Remote Caregiver telemetry monitor active with local emergency backup.'
    },
    events: [
      {
        id: 'cal-wed-la',
        title: 'Elsbeth Flight to Los Angeles (LA Work Trip / Client Summit)',
        startTime: '07:30 AM',
        endTime: '06:00 PM',
        timeFormatted: '7:30 AM – 6:00 PM (All Day)',
        location: 'SFO → LAX (Century City Client Office)',
        category: 'Travel / Work Trip',
        audience: 'Elsbeth (Work/LA)',
        needsTransit: true,
        transitMode: 'Flight / Out of Town',
        isWorkTripLA: true,
        colorTag: 'purple',
        description: 'Elsbeth traveling to Los Angeles for enterprise executive meetings. Morning check-in active & home nurse Maria on duty.',
        mobilityPrepBufferMinutes: 45,
        suggestedDepartureTime: '06:00 AM (Airport Ride)',
        fatigueRiskLevel: 'Low',
        vyalevPumpSyncNote: 'Caregiver in LA: Emergency contacts & neighbor support protocol active on dashboard.',
        actionForWade: 'Elsbeth is in Los Angeles for work today. Nurse Maria is here and your pump is set smoothly.',
        actionForCaregiver: 'Remote telemetry check at 12:00 PM from LA. Local emergency contacts on call.'
      },
      {
        id: 'cal-wed-1',
        title: 'Parkinson\'s Peer Coffee & Support Circle (Nurse Maria Assisted)',
        startTime: '11:00 AM',
        endTime: '12:30 PM',
        timeFormatted: '11:00 AM – 12:30 PM',
        location: 'Community Garden Pavilion',
        address: '500 Parnassus Ave, San Francisco, CA',
        category: 'Community / Social',
        audience: 'Captain Wade',
        needsTransit: true,
        transitMode: 'Uber Assist / Ride Required',
        colorTag: 'emerald',
        description: 'Informal social gathering with fellow PD patients. Supported by visiting nurse Maria.',
        mobilityPrepBufferMinutes: 20,
        suggestedDepartureTime: '10:25 AM',
        estimatedDriveMinutes: 15,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Enjoy catching up with friends in the open garden with Maria.',
        actionForCaregiver: 'Uber Assist dispatch at 10:25 AM; pack portable chair cushion.'
      },
      {
        id: 'cal-wed-2',
        title: 'Afternoon Music & Firefighter History Reading',
        startTime: '03:00 PM',
        endTime: '04:30 PM',
        timeFormatted: '3:00 PM – 4:30 PM',
        location: 'Command Post Study',
        category: 'Routine',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Enjoying favorite jazz vinyls and historic firehouse archives.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Listen to Dave Brubeck and browse the Captain\'s album.',
        actionForCaregiver: 'Elsbeth sends check-in voice note from LA.'
      }
    ]
  },
  'thu': {
    dayLabel: 'Thursday',
    dateStr: 'Thursday, Sep 3, 2026',
    focus: 'Occupational Therapy & Refill Day',
    focusColor: 'bg-teal-100 text-teal-800 border-teal-200',
    weather: 'Sunny & Warm, 72°F',
    spokenAudioScript: "Good morning Captain Wade. Today is Thursday, September third. We have Occupational Therapy at 11:00 AM for fine motor practice, followed by a restful afternoon siesta.",
    actionsForWade: [
      'Take your time with fine motor exercises; zero rush.',
      'Occupational therapy at Sutter Health at 11:00 AM.',
      'Quiet afternoon rest and music in the recliner.'
    ],
    actionsForElsbeth: [
      'Uber Assist departure staged at 10:25 AM (+25m buffer).',
      'Stage adaptive button hooks and utensil grip tools for clinic.',
      'Call Acaria Health specialty pharmacy for weekly cartridge replenishment.'
    ],
    clinicalMedicationSynergy: {
      levodopaAbsorptionAdvice: 'High-protein dinner reserved for 6:00 PM to keep daytime motor channels clear.',
      vyalevPumpCheck: 'Confirm 7-day cartridge delivery status before Friday cassette swap.'
    },
    events: [
      {
        id: 'cal-thu-1',
        title: 'Occupational Therapy: Fine Motor & Buttoning Practice',
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        timeFormatted: '11:00 AM – 12:00 PM',
        location: 'Sutter Health Rehabilitation',
        address: '2351 Clay Street, San Francisco, CA',
        category: 'Physical Therapy',
        audience: 'Captain Wade',
        needsTransit: true,
        transitMode: 'Uber Assist / Ride Required',
        colorTag: 'amber',
        description: 'Adaptive utensil training, shirt button hooks, and tremor compensation techniques.',
        mobilityPrepBufferMinutes: 25,
        suggestedDepartureTime: '10:25 AM',
        estimatedDriveMinutes: 10,
        fatigueRiskLevel: 'Moderate',
        actionForWade: 'Take your time with hand exercises; no rushing.',
        actionForCaregiver: 'Uber Assist departure at 10:25 AM with staged grip tools.'
      },
      {
        id: 'cal-thu-2',
        title: 'Quiet Afternoon Siesta & Hydration',
        startTime: '01:30 PM',
        endTime: '03:30 PM',
        timeFormatted: '1:30 PM – 3:30 PM',
        location: 'Living Room Recliner',
        category: 'Family / Rest',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Post-therapy recovery rest block.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Comfortable afternoon rest.',
        actionForCaregiver: 'Quiet hours in the home.'
      }
    ]
  },
  'fri': {
    dayLabel: 'Friday',
    dateStr: 'Friday, Sep 4, 2026',
    focus: 'Neurologist Clinic & Cassette Swap',
    focusColor: 'bg-rose-100 text-rose-800 border-rose-200',
    weather: 'Clear Skies, 71°F',
    spokenAudioScript: "Good morning Captain Wade. Today is Friday, September fourth. We have our in-person neurology appointment with Dr. Arthur Henderson at UCSF at 1:30 PM, and your weekly Vyalev cassette swap tonight at 8:30 PM.",
    actionsForWade: [
      'Wear comfortable clothes for Dr. Henderson\'s motor exam.',
      'UCSF Movement Disorders Clinic evaluation at 1:30 PM.',
      'Relax during sterile Vyalev cassette changeover at 8:30 PM tonight.'
    ],
    actionsForElsbeth: [
      'Uber Assist staged for 12:40 PM departure (+30m hospital transfer buffer).',
      'Hand 1-Click Clinical EMR Dossier PDF to Dr. Arthur Henderson, MD.',
      'Perform sterile 5-step infusion site rotation to Upper Right Abdomen at 8:30 PM.'
    ],
    clinicalMedicationSynergy: {
      levodopaAbsorptionAdvice: 'Light midday soup lunch before 1:30 PM clinic motor evaluation.',
      vyalevPumpCheck: 'Weekly cassette swap & sterile site rotation scheduled for 8:30 PM.'
    },
    events: [
      {
        id: 'cal-fri-1',
        title: 'UCSF Movement Disorders Clinic In-Person Evaluation (Dr. Henderson)',
        startTime: '01:30 PM',
        endTime: '03:00 PM',
        timeFormatted: '1:30 PM – 3:00 PM',
        location: 'UCSF Neurology Center',
        address: '400 Parnassus Ave, Suite 800, San Francisco, CA',
        attendees: ['Dr. Arthur Henderson, MD', 'Elsbeth Seymour'],
        category: 'Clinical / Medical',
        audience: 'Captain Wade',
        needsTransit: true,
        transitMode: 'Uber Assist / Ride Required',
        colorTag: 'rose',
        description: 'Comprehensive MDS-UPDRS Part III motor assessment, Vyalev continuous pump telemetry log review, and infusion site examination.',
        mobilityPrepBufferMinutes: 30,
        suggestedDepartureTime: '12:40 PM',
        estimatedDriveMinutes: 20,
        fatigueRiskLevel: 'Moderate',
        vyalevPumpSyncNote: 'Print 1-Click Clinical EMR Dossier PDF for Dr. Henderson.',
        actionForWade: 'Comfortable clothing for motor evaluation; doctor will check walking.',
        actionForCaregiver: 'Uber Assist staged for 12:40 PM (+30m hospital parking & wheelchair transfer buffer).'
      },
      {
        id: 'cal-fri-2',
        title: 'Weekly Vyalev Continuous Infusion Cassette Protocol',
        startTime: '08:30 PM',
        endTime: '09:00 PM',
        timeFormatted: '8:30 PM – 9:00 PM',
        location: 'Bedroom Command Station',
        category: 'Routine',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Sterile subcutaneous infusion site rotation to Upper Right Abdomen and fresh cassette priming.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Relax during clean skin prep and site swap.',
        actionForCaregiver: 'Follow 5-step sterile rotation protocol; record site in EMR log.'
      }
    ]
  }
};

export const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({
  briefing,
  selectedPersona,
  onRefreshBriefing,
  isRefreshing,
  onOpenDiscordModal
}) => {
  const [selectedDayKey, setSelectedDayKey] = useState<string>('sat');
  const [activeEvents, setActiveEvents] = useState<CalendarEvent[]>(briefing.events || WEEK_SCHEDULE_DATA['sat'].events);
  const [currentBriefing, setCurrentBriefing] = useState<DailyCalendarBriefing>(briefing);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(true);
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [showWeeklyPrep, setShowWeeklyPrep] = useState(false);
  const [isGeneratingDayAi, setIsGeneratingDayAi] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Day-Of Refill & Advance Doctor Visit Alert Action States (with local persistence)
  const [isAcariaRefillConfirmed, setIsAcariaRefillConfirmed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('acaria_refill_confirmed') === 'true';
    } catch {
      return false;
    }
  });
  const [isDoctorVisitPrepDone, setIsDoctorVisitPrepDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem('doctor_prep_done') === 'true';
    } catch {
      return false;
    }
  });

  // Audience Filter State
  const [audienceFilter, setAudienceFilter] = useState<EventAudience | 'All'>('All');

  // Live Google Calendar Authentication & Sync State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);
  const [isSyncingLiveCalendar, setIsSyncingLiveCalendar] = useState(false);
  const [liveSyncMessage, setLiveSyncMessage] = useState<string | null>(null);
  const [isLiveSourceActive, setIsLiveSourceActive] = useState(false);

  // Initialize Auth state listener on mount
  useEffect(() => {
    const unsubscribe = initCalendarAuth(
      (user, token) => {
        setGoogleUser(user);
        if (token) setCalendarToken(token);
      },
      () => {
        setGoogleUser(null);
        setCalendarToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Google Sign In / Connect Live Calendar
  const handleConnectGoogleCalendar = async () => {
    try {
      setIsSyncingLiveCalendar(true);
      setLiveSyncMessage(null);
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setCalendarToken(result.accessToken);
        setLiveSyncMessage(`Connected as ${result.user.email}. Fetching live calendar events...`);
        await handleFetchLiveCalendar(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Calendar connection error:', err);
      setLiveSyncMessage(`Google connection error: ${err.message || 'Check permissions'}`);
    } finally {
      setIsSyncingLiveCalendar(false);
    }
  };

  // Fetch live events from connected Google Calendar and re-synthesize Gemini Parkinson's Care Guidance
  const handleFetchLiveCalendar = async (tokenOverride?: string) => {
    const token = tokenOverride || calendarToken;
    if (!token) {
      handleConnectGoogleCalendar();
      return;
    }

    setIsSyncingLiveCalendar(true);
    try {
      const liveEvents = await fetchLiveGoogleCalendarEvents(token);
      if (liveEvents && liveEvents.length > 0) {
        setActiveEvents(liveEvents);
        setIsLiveSourceActive(true);
        setLiveSyncMessage(`✅ Synced ${liveEvents.length} live events from your Google Calendar (${googleUser?.email || 'Primary'}) as source of truth!`);

        // Re-synthesize with Gemini
        setIsGeneratingDayAi(true);
        const dayData = WEEK_SCHEDULE_DATA[selectedDayKey] || WEEK_SCHEDULE_DATA['sat'];
        const response = await fetch('/api/gemini/daily-calendar-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            events: liveEvents,
            personaId: selectedPersona,
            pumpHoursLeft: 14,
            weather: dayData.weather,
            dateFormatted: dayData.dateStr
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.briefing) {
            setCurrentBriefing({
              ...data.briefing,
              events: liveEvents
            });
          }
        }
      } else {
        setLiveSyncMessage('No upcoming events found in primary Google Calendar for the next 7 days. Showing clinical regimen.');
      }
    } catch (err: any) {
      console.error('Failed to sync live Google Calendar:', err);
      setLiveSyncMessage(`Google Calendar sync error: ${err.message}`);
    } finally {
      setIsSyncingLiveCalendar(false);
      setIsGeneratingDayAi(false);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setCalendarToken(null);
    setIsLiveSourceActive(false);
    setActiveEvents(WEEK_SCHEDULE_DATA[selectedDayKey].events);
    setLiveSyncMessage('Disconnected from live Google Calendar. Switched back to Parkinson\'s clinical protocol.');
  };

  // Audio Playback
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      acousticVoice.cancel();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      acousticVoice.speak(
        currentBriefing.spokenAudioScript,
        selectedPersona,
        {
          rawBriefingMode: true,
          playStartEarcon: true,
          playEndEarcon: true,
          onEnd: () => setIsPlayingAudio(false),
          onError: () => setIsPlayingAudio(false)
        }
      );
    }
  };

  // Switch Day Handler: Instant Synchronous UI Update + Background Gemini Refresh
  const handleSelectDay = async (dayKey: string) => {
    setSelectedDayKey(dayKey);
    const dayData = WEEK_SCHEDULE_DATA[dayKey];
    if (!dayData) return;

    if (isPlayingAudio) {
      acousticVoice.cancel();
      setIsPlayingAudio(false);
    }

    // 1. INSTANT synchronous update to all UI channels
    setActiveEvents(dayData.events);
    setCurrentBriefing({
      headline: `${dayData.focus} Routine`,
      summary: `${dayData.dayLabel}: ${dayData.focus} schedule and coordinated mobility buffers.`,
      dayTimeFormatted: `${dayData.dateStr} • 08:00 AM`,
      spokenAudioScript: dayData.spokenAudioScript,
      actionsForWade: dayData.actionsForWade,
      actionsForElsbeth: dayData.actionsForElsbeth,
      clinicalMedicationSynergy: dayData.clinicalMedicationSynergy,
      events: dayData.events,
      transitDepartureBuffers: dayData.events.filter(e => e.needsTransit).map(e => ({
        eventName: e.title,
        suggestedDepartureTime: e.suggestedDepartureTime || e.startTime,
        totalBufferMinutes: e.mobilityPrepBufferMinutes,
        transitMode: e.transitMode || 'Uber Assist / Ride Required'
      }))
    });

    // 2. Background non-blocking fetch to calibrate with Gemini API if available
    setIsGeneratingDayAi(true);
    try {
      const response = await fetch('/api/gemini/daily-calendar-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: dayData.events,
          personaId: selectedPersona,
          pumpHoursLeft: dayKey === 'fri' ? 4 : 14,
          weather: dayData.weather,
          dateFormatted: dayData.dateStr
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.briefing) {
          setCurrentBriefing(prev => ({
            ...prev,
            ...data.briefing,
            dayTimeFormatted: `${dayData.dateStr} • 08:00 AM`,
            events: dayData.events
          }));
        }
      }
    } catch (e) {
      console.warn('Background AI calibration notice:', e);
    } finally {
      setIsGeneratingDayAi(false);
    }
  };

  // Direct Google Calendar Add Event (Creates Live Google Calendar URL)
  const createGoogleCalendarUrl = (event: CalendarEvent) => {
    const title = encodeURIComponent(`[Care Plan] ${event.title}`);
    const details = encodeURIComponent(
      `Parkinson's Care Schedule & Clinical Buffers:\n` +
      `• Patient: Captain Wade Seymour\n` +
      `• Staged Departure: ${event.suggestedDepartureTime || event.startTime} (+${event.mobilityPrepBufferMinutes}m Parkinson's Mobility Buffer)\n` +
      `• Wade Guidance: ${event.actionForWade}\n` +
      `• Caregiver Staging: ${event.actionForCaregiver}\n` +
      (event.levodopaMealAlert ? `• Clinical Meal Alert: ${event.levodopaMealAlert}\n` : '') +
      `\nSource of Truth: Google Calendar Sync Engine`
    );
    const location = encodeURIComponent(event.address || event.location);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  // Export 7-Day Schedule to .ICS File for Google Calendar / Apple Calendar
  const handleExportICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Captain Wade Caregiving Command//PD Shared Calendar 1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Captain Wade 7-Day Parkinson\'s Care Schedule'
    ];

    Object.entries(WEEK_SCHEDULE_DATA).forEach(([key, dayData]) => {
      dayData.events.forEach((evt) => {
        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:wade-event-${evt.id}@carecommand.internal`);
        icsContent.push(`SUMMARY:${evt.title.replace(/,/g, '\\,')}`);
        icsContent.push(`DESCRIPTION:${(evt.description || evt.actionForWade).replace(/,/g, '\\,')} [Departure Buffer: +${evt.mobilityPrepBufferMinutes}m]`);
        icsContent.push(`LOCATION:${(evt.address || evt.location).replace(/,/g, '\\,')}`);
        icsContent.push('STATUS:CONFIRMED');
        icsContent.push('END:VEVENT');
      });
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'captain_wade_7day_care_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('✅ 7-Day .ICS Care Schedule Downloaded! Ready to import into Google Calendar or Apple Calendar.');
    setTimeout(() => setExportNotice(null), 5000);
  };

  const currentDayData = WEEK_SCHEDULE_DATA[selectedDayKey] || WEEK_SCHEDULE_DATA['sat'];

  return (
    <div id="gemini-calendar-daily-briefing-card" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all space-y-0">
      
      {/* -------------------------------------------------------------
          TOP HERO BANNER: Status, Date, Audio Briefing & Controls
      -------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-950 text-white p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Gemini 3.7 Shared Calendar AI
              </span>
              <span className="text-xs text-indigo-200 font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-300" />
                {currentDayData.dateStr}
              </span>
              <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Google Calendar Source of Truth
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
              7-Day Care Schedule & Dual-Channel Orchestration
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-indigo-200/90">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-indigo-100 font-semibold border border-white/10">
                Active Focus: "{currentBriefing.headline || currentDayData.focus}"
              </span>
              <span className="text-[11px] text-amber-300 font-bold">
                ⚡ Synchronized with spoken audio & caregiver staging channels
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {googleUser ? (
              <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/50 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-emerald-200 font-bold max-w-[140px] truncate" title={googleUser.email || ''}>
                  {googleUser.email}
                </span>
                <button
                  type="button"
                  id="btn-fetch-live-google-cal"
                  onClick={() => handleFetchLiveCalendar()}
                  disabled={isSyncingLiveCalendar}
                  className="p-1 text-emerald-300 hover:text-white cursor-pointer"
                  title="Pull latest events from Google Calendar"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLiveCalendar ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  id="btn-disconnect-google-cal"
                  onClick={handleDisconnectGoogleCalendar}
                  className="text-[10px] text-rose-300 hover:text-rose-100 font-bold ml-1 cursor-pointer"
                  title="Disconnect Google Calendar"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-connect-google-calendar"
                onClick={handleConnectGoogleCalendar}
                disabled={isSyncingLiveCalendar}
                className="gsi-material-button px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                title="Connect your personal Google Calendar as live source of truth"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>{isSyncingLiveCalendar ? 'Connecting...' : 'Connect Live Google Calendar'}</span>
              </button>
            )}

            <button
              type="button"
              id="btn-open-weekly-prep"
              onClick={() => setShowWeeklyPrep(!showWeeklyPrep)}
              className="px-3 py-2 rounded-xl bg-indigo-800/60 hover:bg-indigo-700/80 text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-indigo-600/40 cursor-pointer"
              title="View 7-day preparation overview"
            >
              <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
              <span>{showWeeklyPrep ? 'Hide Weekly Prep' : 'Weekly Prep Matrix'}</span>
            </button>

            <button
              type="button"
              id="btn-export-care-schedule-ics"
              onClick={handleExportICS}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 backdrop-blur-xs cursor-pointer border border-white/15"
              title="Download standard .ICS file for Google Calendar"
            >
              <Download className="w-3.5 h-3.5 text-indigo-200" />
              <span>Export .ICS</span>
            </button>

            <button
              type="button"
              id="btn-refresh-calendar-briefing"
              onClick={() => isLiveSourceActive ? handleFetchLiveCalendar() : handleSelectDay(selectedDayKey)}
              disabled={isGeneratingDayAi || isRefreshing || isSyncingLiveCalendar}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDayAi || isRefreshing || isSyncingLiveCalendar ? 'animate-spin' : ''}`} />
              <span>{isGeneratingDayAi ? 'Recalibrating...' : isLiveSourceActive ? 'Sync Live Events' : 'Sync Calendar'}</span>
            </button>
          </div>
        </div>

        {/* Download Success Notice */}
        {exportNotice && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-900/80 border border-emerald-400/50 text-xs text-emerald-100 font-semibold animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Live Sync Status Notice */}
        {liveSyncMessage && (
          <div className={`mt-3 p-3 rounded-xl border text-xs font-semibold animate-in fade-in flex items-center justify-between gap-2 ${
            liveSyncMessage.includes('error') || liveSyncMessage.includes('Error')
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-400/50 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{liveSyncMessage}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setLiveSyncMessage(null)}
              className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}



        {/* -------------------------------------------------------------
            WEEKLY PREPARATION & LOGISTICS DRAWER (Ahead-of-Time Planning)
        -------------------------------------------------------------- */}
        {showWeeklyPrep && (
          <div className="mt-5 p-5 rounded-2xl bg-indigo-900/70 border border-indigo-700/60 text-xs text-indigo-100 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-indigo-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-sm text-white uppercase tracking-wide">
                  7-Day Ahead-of-Time Clinical & Logistics Preparation Matrix
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowWeeklyPrep(false)}
                className="text-indigo-300 hover:text-white font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Cold-Chain Cartridges */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-indigo-600/40 space-y-1.5">
                <span className="text-[11px] font-black uppercase text-amber-300 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
                  Vyalev Continuous Infusion Cartridges
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  <strong>7 Cassettes Staged:</strong> Refrigerated cold-chain supply verified. Mandatory cassette rotation scheduled for <strong>Friday, Sep 4 at 8:30 PM</strong>.
                </p>
              </div>

              {/* Transit Departure Buffers Staged */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-indigo-600/40 space-y-1.5">
                <span className="text-[11px] font-black uppercase text-emerald-300 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  Transit Mobility Buffers
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  <strong>+135 Total Minutes Staged:</strong> Out-of-house medical and therapy departures padded with +25m unhurried transfer buffers to prevent gait freezing.
                </p>
              </div>

              {/* Levodopa Protein Spacing */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-indigo-600/40 space-y-1.5">
                <span className="text-[11px] font-black uppercase text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Protein / Levodopa Coordination
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  <strong>Active Strategy:</strong> High-protein meals strictly reserved for 6:00 PM dinner on therapy days (Sat, Mon, Tue, Thu) to keep daytime Levodopa absorption clear.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            SPOKEN MORNING AUDIO PLAYER BOX (Tailored to Selected Day)
        -------------------------------------------------------------- */}
        <div className="mt-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <button
              type="button"
              id="btn-play-spoken-briefing"
              onClick={handleToggleAudio}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-400 text-slate-950 scale-105 shadow-md animate-pulse'
                  : 'bg-white text-indigo-900 hover:bg-indigo-50 shadow-sm'
              }`}
              title="Preview Wade's Spoken Audio Guidance for this Day"
            >
              {isPlayingAudio ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  Spoken Morning Audio Script ({currentDayData.dayLabel})
                </span>
                <span className="text-[10px] text-indigo-200 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-700/50">
                  {selectedPersona.replace('-', ' ').toUpperCase()} PERSONA
                </span>
              </div>
              <p className="text-xs text-indigo-100 italic mt-0.5 line-clamp-2 sm:line-clamp-none">
                "{currentBriefing.spokenAudioScript}"
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-indigo-200">
              {isPlayingAudio ? 'Speaking...' : 'Tap Play to Listen'}
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          MAIN CARD CONTENT: Dual-Channel Guidance & Clinical Alerts
      -------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 space-y-6">

        {/* -------------------------------------------------------------
            CLINICAL PRIORITY ALERTS (Acaria Refill & Doctor Advance Notice)
        -------------------------------------------------------------- */}
        <div className="space-y-3">
          
          {/* DAY-OF ALERT: Call Acaria Health For Refill */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/80 text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-black">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    Day-Of Priority Action
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Call Acaria Health for Weekly Vyalev Cartridge Refill
                  </h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Call Acaria Health Specialty Pharmacy to authorize cold-chain delivery of Wade's 7-day <strong>Vyalev continuous infusion cassettes (Rx #VY-89240-SE)</strong> before Friday site swap.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 font-semibold pt-0.5">
                  <span>📞 Pharmacy: <strong>Acaria Health (1-800-511-5144)</strong></span>
                  <span>📦 Delivery: <strong>Cold-Chain Express to Home</strong></span>
                  <span>💉 Patient: <strong>Captain Wade Seymour</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="tel:18005115144"
                id="btn-call-acaria-health"
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 1-800-511-5144</span>
              </a>
              <button
                type="button"
                id="btn-toggle-acaria-refill-confirmed"
                onClick={() => {
                  const nextState = !isAcariaRefillConfirmed;
                  setIsAcariaRefillConfirmed(nextState);
                  try {
                    localStorage.setItem('acaria_refill_confirmed', String(nextState));
                  } catch {}
                }}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isAcariaRefillConfirmed
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isAcariaRefillConfirmed ? 'text-white' : 'text-slate-400'}`} />
                <span>{isAcariaRefillConfirmed ? 'Refill Confirmed ✓' : 'Mark as Called'}</span>
              </button>
            </div>
          </div>

          {/* 2-DAYS-BEFORE ALERT: Doctor Visit & Location Matching */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm font-black">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                    2-Day Advance Alert • Doctor Visit
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Upcoming Neurologist Evaluation: Dr. Arthur Henderson, MD
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
                  <span className="flex items-center gap-1 font-bold text-rose-900">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    Friday, Sep 4 • 1:30 PM – 3:00 PM
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <strong>UCSF Neurology Center</strong> (400 Parnassus Ave, Suite 800, San Francisco, CA)
                  </span>
                  <span className="flex items-center gap-1 text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md font-bold">
                    <Car className="w-3.5 h-3.5 text-amber-700" />
                    Uber Assist Required • Staged Departure: 12:40 PM (+30m buffer)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Match: <strong>Dr. Arthur Henderson, MD</strong> at <strong>UCSF Neurology Center (400 Parnassus Ave)</strong>. Address requires vehicular transport with +30m transfer and hospital parking buffer.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=[Care%20Plan]%20Dr.%20Arthur%20Henderson%20Neurology%20Visit&location=400%20Parnassus%20Ave,%20San%20Francisco,%20CA&details=UCSF%20Neurology%20MDS-UPDRS%20Evaluation%20with%20+30m%20Uber%20Assist%20Departure%20Buffer"
                target="_blank"
                rel="noreferrer noopener"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>View in Google Calendar</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <button
                type="button"
                onClick={() => {
                  const nextState = !isDoctorVisitPrepDone;
                  setIsDoctorVisitPrepDone(nextState);
                  try {
                    localStorage.setItem('doctor_prep_done', String(nextState));
                  } catch {}
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isDoctorVisitPrepDone
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isDoctorVisitPrepDone ? 'Pre-Visit Dossier Staged ✓' : 'Stage Pre-Visit Checklist'}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Dynamic Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-slate-900 block">
                {currentDayData.dayLabel} Active Safeguards: {currentDayData.focus}
              </span>
              <span className="text-slate-600 text-[11px]">
                {currentDayData.weather} • Low-protein morning meals • Continuous pump flow steady • {activeEvents.length} scheduled events
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAiDetails(!showAiDetails)}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              {showAiDetails ? 'Hide AI Details' : 'AI Synergy Details'}
            </button>
          </div>
        </div>

        {/* Expandable AI Synergy Drawer */}
        {showAiDetails && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 animate-in fade-in">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Gemini Clinical Synthesis for {currentDayData.dayLabel}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="font-bold text-indigo-900 block text-[11px] mb-0.5">Levodopa Absorption & Protein Advice</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {currentBriefing.clinicalMedicationSynergy?.levodopaAbsorptionAdvice || 'Light morning carbohydrates to avoid carrier competition with daytime levodopa.'}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="font-bold text-emerald-900 block text-[11px] mb-0.5">Vyalev Infusion & Hydration</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {currentBriefing.clinicalMedicationSynergy?.vyalevPumpCheck || 'Continuous basal rate nominal. Cartridge reserve sufficient through scheduled activities.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            DUAL-OUTPUT COORDINATION: Wade Guidance vs Caregiver Logistics
        -------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Wade's Spoken Guidance Channel */}
          <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Wade's Spoken Guidance ({currentDayData.dayLabel.split(' ')[0]})
                    </h4>
                    <p className="text-xs text-indigo-700/80 font-medium">
                      Zero-pressure, single-focus clarity
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Spoken Channel
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-700">
                {currentBriefing.actionsForWade.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-indigo-100/80 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium text-slate-800">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[11px] text-indigo-800/80 font-medium bg-indigo-100/50 px-3 py-2 rounded-xl flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Memory offloaded entirely — Wade is never corrected or burdened.</span>
            </div>
          </div>

          {/* Caregiver Command Logistics */}
          <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Caregiver Logistics & Clinical Prep
                    </h4>
                    <p className="text-xs text-emerald-800/80 font-medium">
                      Behind-the-scenes staging & transit buffers
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Caregiver Channel
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-700">
                {currentBriefing.actionsForElsbeth.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-emerald-100/80 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium text-slate-800">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[11px] text-emerald-800/80 font-medium bg-emerald-100/50 px-3 py-2 rounded-xl flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Transit departures padded with +20m mobility buffers automatically.</span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            INTERACTIVE TIMELINE & GOOGLE CALENDAR DIRECT INTEGRATION
        -------------------------------------------------------------- */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="toggle-schedule-details-btn"
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-indigo-600 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>{currentDayData.dayLabel} Schedule Timeline ({activeEvents.length} Events)</span>
                {showFullSchedule ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Audience Filter Pills */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                {(['All', 'Captain Wade', 'Little Wade', 'Elsbeth (Work/LA)', 'Family Shared'] as const).map((filterOpt) => (
                  <button
                    key={filterOpt}
                    type="button"
                    onClick={() => setAudienceFilter(filterOpt)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      audienceFilter === filterOpt
                        ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {filterOpt === 'Captain Wade' ? 'Captain Wade' :
                     filterOpt === 'Little Wade' ? 'Little Wade' :
                     filterOpt === 'Elsbeth (Work/LA)' ? 'LA / Work' :
                     filterOpt === 'Family Shared' ? 'Family' : 'All Events'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showFullSchedule && (
            <div className="space-y-3">
              {activeEvents
                .filter(evt => audienceFilter === 'All' || evt.audience === audienceFilter)
                .map((evt) => {
                  const googleCalUrl = createGoogleCalendarUrl(evt);
                  const isUber = evt.transitMode === 'Uber Assist / Ride Required';
                  const isLA = evt.isWorkTripLA || evt.audience === 'Elsbeth (Work/LA)';

                  // Border & background accents based on colorTag
                  const cardBorderColor = 
                    evt.colorTag === 'purple' ? 'border-purple-200 hover:border-purple-300 bg-purple-50/20' :
                    evt.colorTag === 'blue' ? 'border-blue-200 hover:border-blue-300 bg-blue-50/20' :
                    evt.colorTag === 'amber' ? 'border-amber-200 hover:border-amber-300 bg-amber-50/20' :
                    evt.colorTag === 'rose' ? 'border-rose-200 hover:border-rose-300 bg-rose-50/20' :
                    evt.colorTag === 'indigo' ? 'border-indigo-200 hover:border-indigo-300 bg-indigo-50/20' :
                    'border-slate-200 hover:border-emerald-300 bg-white';

                  return (
                    <div 
                      key={evt.id} 
                      className={`p-4 sm:p-5 rounded-2xl border ${cardBorderColor} transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4`}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            {evt.timeFormatted}
                          </span>

                          {/* Audience Tag Badge */}
                          {evt.audience && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                              evt.audience === 'Captain Wade' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              evt.audience === 'Little Wade' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                              evt.audience === 'Elsbeth (Work/LA)' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                              'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            }`}>
                              <UserCheck className="w-2.5 h-2.5" />
                              {evt.audience}
                            </span>
                          )}

                          {/* Transit Need Badge (Uber Assist vs Flight vs Drive) */}
                          {evt.needsTransit && evt.transitMode && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight flex items-center gap-1 ${
                              isUber ? 'bg-amber-500 text-white shadow-2xs' :
                              isLA ? 'bg-purple-600 text-white' :
                              'bg-slate-700 text-white'
                            }`}>
                              <Car className="w-2.5 h-2.5" />
                              {evt.transitMode}
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            evt.category === 'Physical Therapy' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            evt.category === 'Clinical / Medical' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            evt.category === 'Travel / Work Trip' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            evt.category === 'Community / Social' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            evt.category === 'Routine' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {evt.category}
                          </span>

                          {evt.fatigueRiskLevel && !isLA && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              evt.fatigueRiskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              evt.fatigueRiskLevel === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {evt.fatigueRiskLevel} Fatigue Risk
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          {evt.title}
                          {isLA && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-200 text-purple-900 rounded-md font-extrabold uppercase">
                              ✈️ LA Work Trip
                            </span>
                          )}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {evt.location}
                          </span>
                          {evt.suggestedDepartureTime && (
                            <span className={`flex items-center gap-1 font-semibold ${isUber ? 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200' : 'text-indigo-700'}`}>
                              <Car className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              Staged Departure: {evt.suggestedDepartureTime} (+{evt.mobilityPrepBufferMinutes}m PD buffer)
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {evt.description || evt.actionForCaregiver}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-1 text-xs">
                        <span className="text-[11px] text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          Wade Guidance: {evt.actionForWade}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
