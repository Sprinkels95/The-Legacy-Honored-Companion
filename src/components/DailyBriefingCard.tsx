import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Volume2, VolumeX, RefreshCw, Clock, MapPin, 
  Sparkles, HeartPulse, ShieldCheck, Car, CheckCircle2, 
  Send, UserCheck, AlertTriangle, Play, RotateCcw, ChevronDown, 
  ChevronUp, ExternalLink, Activity, Info, Bot, Download,
  CalendarDays, Check, FileText, ArrowRight, Sun, Moon, LogIn, LogOut, CheckCircle,
  PhoneCall, Stethoscope, Edit3, Tag, X, Save, Sliders, Plus
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
      'Uber Assist staged for 09:55 AM (+25m mobility buffer for Dad).',
      'Elsbeth drives Little Wade to Presidio soccer match at 11:15 AM (No transit for Dad).',
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
        actionForCaregiver: 'Verify morning water intake and infusion site comfort.',
        wadeImpactNote: 'Gentle start to the day. Low-protein breakfast maintains steady levodopa bioavailability.'
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
        actionForCaregiver: 'Uber Assist staged for 09:55 AM departure (+25m mobility buffer).',
        wadeImpactNote: 'Core physical mobility session. Unhurried +25m buffer prevents gait freezing during car transfer.'
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
        needsTransit: false,
        transitMode: 'Caregiver Local Drive (No Uber for Dad)',
        colorTag: 'blue',
        description: 'Little Wade\'s weekend youth soccer league game. Elsbeth handles driving & orange slices.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Little Wade has soccer! Relax at home or tune in to the score updates.',
        actionForCaregiver: 'Elsbeth driving Little Wade to Presidio fields; Dad resting comfortably at home.',
        wadeImpactNote: 'Dad relaxes comfortably at home. Zero transit or physical effort required for Big Wade — Elsbeth handles driving.'
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
        actionForCaregiver: 'Keep ambient noise calm; review weekly neurology report.',
        wadeImpactNote: 'Restorative quiet rest in armchair to prevent afternoon neuromuscular fatigue.'
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
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        levodopaMealAlert: 'Ensure water glass at bedside table.',
        vyalevPumpSyncNote: 'Have 7-day infusion summary open for Dr. Henderson review.',
        actionForWade: 'Join video chat from the living room tablet; no travel needed.',
        actionForCaregiver: 'Review generated 1-click clinical synthesis report on screen.',
        wadeImpactNote: 'Virtual check-in from living room tablet. Zero transit or clinic travel stress for Dad.'
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
        actionForCaregiver: 'Prepare fresh Vyalev cartridge from refrigerator at 8:30 PM.',
        wadeImpactNote: 'Designated evening protein meal with family; relaxing, unhurried pace at home.'
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
        actionForCaregiver: 'Inspect Vyalev infusion site dressing during morning dressing.',
        wadeImpactNote: 'Quiet porch breakfast; calm, peaceful morning at home.'
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
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Enjoy the fresh air and flower beds with Elsbeth.',
        actionForCaregiver: 'Accompany with steady pacing; offer arm support along brick path.',
        wadeImpactNote: 'Gentle sensory grounding walk on flat backyard path with Elsbeth; no street transit.'
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
        actionForCaregiver: 'Supervise supplies and maintain quiet space.',
        wadeImpactNote: 'Dad watches and chats from the comfortable armchair; zero physical or transit demands on Wade.'
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
        actionForCaregiver: 'Ensure ergonomic chair seating and high-contrast dining utensils.',
        wadeImpactNote: 'Unhurried connection with grandchildren and scheduled evening protein repletion.'
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
      'Uber Assist staged for 09:20 AM departure (+25m buffer for Dad).',
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
        actionForCaregiver: 'Pack water bottle and boxing gloves into the travel tote.',
        wadeImpactNote: 'Pre-boxing hydration and light carbohydrates to prime motor fluidity and energy.'
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
        actionForCaregiver: 'Uber Assist staged for 09:20 AM departure with 25m buffer.',
        wadeImpactNote: 'High-intensity neuromuscular workout; +25m departure buffer eliminates time pressure.'
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
        actionForCaregiver: 'Apply cool moist towel and verify comfortable skin perfusion.',
        wadeImpactNote: 'Deep post-exercise muscle relaxation with feet elevated; restorative quiet hours.'
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
      'Uber Assist departure at 09:55 AM with +25m buffer for Dad.',
      'Stage external microphone & room-temperature water for speech therapy.',
      'Drive to Roosevelt Middle School for Little Wade pickup at 4:00 PM (No transit for Dad).'
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
        actionForCaregiver: 'Uber Assist departure at 9:55 AM with full +25m buffer.',
        wadeImpactNote: 'Gait posture and turning drills with Sarah; +25m buffer staged to ensure relaxed transit.'
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
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Use your strong Captain\'s commanding voice!',
        actionForCaregiver: 'Set up external microphone and glass of room-temp water.',
        wadeImpactNote: 'Vocal volume training from home study; zero clinic transit or travel fatigue for Dad.'
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
        needsTransit: false,
        transitMode: 'Caregiver Local Drive (No Uber for Dad)',
        colorTag: 'blue',
        description: 'Elsbeth picks up Little Wade from school robotics & math club.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Little Wade will be home at 5 PM after math club.',
        actionForCaregiver: 'Caregiver driving to school pickup at 4:00 PM; Dad rests at home.',
        wadeImpactNote: 'Dad relaxes comfortably at home; zero transit or physical effort required. Elsbeth handles pickup.'
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
      'Nurse Maria on-site for morning support & pavilion outing with Dad.',
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
        needsTransit: false,
        transitMode: 'Caregiver Work Travel (No Transit for Dad)',
        isWorkTripLA: true,
        colorTag: 'purple',
        description: 'Elsbeth traveling to Los Angeles for enterprise executive meetings. Morning check-in active & home nurse Maria on duty.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        vyalevPumpSyncNote: 'Caregiver in LA: Emergency contacts & neighbor support protocol active on dashboard.',
        actionForWade: 'Elsbeth is in Los Angeles for work today. Nurse Maria is here and your pump is set smoothly.',
        actionForCaregiver: 'Remote telemetry check at 12:00 PM from LA. Local emergency contacts on call.',
        wadeImpactNote: 'Dad stays peacefully at home with Nurse Maria on-duty. Zero travel or disruption for Big Wade; evening video call scheduled.'
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
        actionForCaregiver: 'Uber Assist dispatch at 10:25 AM; pack portable chair cushion.',
        wadeImpactNote: 'Social connection with fellow Parkinson\'s peers; Nurse Maria assists departure with unhurried transfer.'
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
        actionForCaregiver: 'Elsbeth sends check-in voice note from LA.',
        wadeImpactNote: 'Comfortable afternoon relaxing with jazz vinyl records in the study at home.'
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
      'Uber Assist departure staged at 10:25 AM (+25m buffer for Dad).',
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
        actionForCaregiver: 'Uber Assist departure at 10:25 AM with staged grip tools.',
        wadeImpactNote: 'Adaptive utensil and buttoning practice; +25m buffer staged for calm, unhurried transfer.'
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
        actionForCaregiver: 'Quiet hours in the home.',
        wadeImpactNote: 'Post-therapy recovery rest block in recliner; peaceful, calm environment.'
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
        actionForCaregiver: 'Uber Assist staged for 12:40 PM (+30m hospital parking & wheelchair transfer buffer).',
        wadeImpactNote: 'Neurologist consultation with Dr. Henderson; +30m hospital parking & wheelchair buffer prevents gait strain.'
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
        actionForCaregiver: 'Follow 5-step sterile rotation protocol; record site in EMR log.',
        wadeImpactNote: 'Sterile evening infusion set changeover; Dad relaxes comfortably in bedroom command station.'
      }
    ]
  }
};

interface DayHorizon {
  key: string;
  dayIndex: number;
  isoDate: string;
  weekdayLong: string;
  monthShort: string;
  dayNum: number;
  dateStr: string;
  badge: string;
  focus: string;
}

const getNext5Days = (): DayHorizon[] => {
  const baseNow = new Date();
  const dayKeyMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const days: DayHorizon[] = [];
  
  for (let i = 0; i < 5; i++) {
    const d = new Date(baseNow.getFullYear(), baseNow.getMonth(), baseNow.getDate() + i);
    const dayIndex = d.getDay();
    const key = dayKeyMap[dayIndex];
    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const weekdayLong = d.toLocaleDateString('en-US', { weekday: 'long' });
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const dateStr = `${weekdayLong}, ${monthShort} ${dayNum}`;
    const badge = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `Day ${i + 1}`;
    const presetFocus = WEEK_SCHEDULE_DATA[key]?.focus || 'Care Protocol';

    days.push({
      key,
      dayIndex: i,
      isoDate,
      weekdayLong,
      monthShort,
      dayNum,
      dateStr,
      badge,
      focus: presetFocus
    });
  }
  return days;
};

export const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({
  briefing,
  selectedPersona,
  onRefreshBriefing,
  isRefreshing,
  onOpenDiscordModal
}) => {
  const next5Days = useMemo(() => getNext5Days(), []);
  const initialDayKey = next5Days[0]?.key || 'sat';
  const [selectedDayKey, setSelectedDayKey] = useState<string>(initialDayKey);
  const [activeEvents, setActiveEvents] = useState<CalendarEvent[]>(briefing.events || WEEK_SCHEDULE_DATA['sat'].events);
  const [allLiveEvents, setAllLiveEvents] = useState<CalendarEvent[]>([]);
  const [currentBriefing, setCurrentBriefing] = useState<DailyCalendarBriefing>(briefing);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showFullSchedule, setShowFullSchedule] = useState(true);
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [isGeneratingDayAi, setIsGeneratingDayAi] = useState(false);

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

  // Custom Event & Tag Overrides Persistence
  const [customOverrides, setCustomOverrides] = useState<Record<string, CalendarEvent>>(() => {
    try {
      const saved = localStorage.getItem('parkinsons_calendar_custom_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Event Tag & Details Editor State
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editForm, setEditForm] = useState<Partial<CalendarEvent>>({});

  // Helper to merge overrides onto base schedule
  const getDayEventsWithOverrides = (dayKey: string, overrides: Record<string, CalendarEvent>): CalendarEvent[] => {
    const baseEvents = WEEK_SCHEDULE_DATA[dayKey]?.events || WEEK_SCHEDULE_DATA['sat'].events;
    return baseEvents.map(evt => (overrides[evt.id] ? { ...evt, ...overrides[evt.id] } : evt));
  };

  // Live Google Calendar Authentication & Sync State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);
  const [isSyncingLiveCalendar, setIsSyncingLiveCalendar] = useState(false);
  const [isLocalSyncing, setIsLocalSyncing] = useState(false);
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
      setLiveSyncMessage('Opening Google Sign-In...');
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setCalendarToken(result.accessToken);
        setLiveSyncMessage(`Connected as ${result.user.email}. Fetching calendar events for the next 5 days...`);
        await handleFetchLiveCalendar(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Calendar connection error:', err);
      setLiveSyncMessage(`Google connection error: ${err.message || 'Check permissions or popup settings'}`);
    } finally {
      setIsSyncingLiveCalendar(false);
    }
  };

  // Fetch live events from connected Google Calendar (Next 5 Days) and re-synthesize Gemini Parkinson's Care Guidance
  const handleFetchLiveCalendar = async (tokenOverride?: string) => {
    const token = tokenOverride || calendarToken || localStorage.getItem('gcal_access_token');
    if (!token) {
      handleConnectGoogleCalendar();
      return;
    }

    setIsSyncingLiveCalendar(true);
    setIsGeneratingDayAi(true);
    try {
      const liveEvents = await fetchLiveGoogleCalendarEvents(token);
      if (liveEvents && liveEvents.length > 0) {
        setAllLiveEvents(liveEvents);
        setIsLiveSourceActive(true);

        // Filter events for currently active day or show all 5 days
        let filteredEvents = liveEvents;
        const targetDay = next5Days.find(d => d.key === selectedDayKey);
        if (selectedDayKey !== 'all_5_days' && targetDay) {
          const matched = liveEvents.filter(e => e.isoDate === targetDay.isoDate || (e.dateStr && e.dateStr.toLowerCase().includes(targetDay.weekdayLong.toLowerCase())));
          filteredEvents = matched.length > 0 ? matched : [];
        }

        setActiveEvents(filteredEvents);
        const dayLabelText = selectedDayKey === 'all_5_days' ? 'All 5 Days' : targetDay ? `${targetDay.weekdayLong} (${targetDay.badge})` : 'Selected Day';
        setLiveSyncMessage(`✅ Synced ${liveEvents.length} events across the next 5 days from Google Calendar! Active view: ${dayLabelText} (${filteredEvents.length} events).`);

        // Re-synthesize with Gemini for active view
        const dayData = WEEK_SCHEDULE_DATA[selectedDayKey] || WEEK_SCHEDULE_DATA['sat'];
        const response = await fetch('/api/gemini/daily-calendar-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            events: filteredEvents.length > 0 ? filteredEvents : liveEvents,
            personaId: selectedPersona,
            pumpHoursLeft: 14,
            weather: dayData.weather,
            dateFormatted: targetDay ? targetDay.dateStr : dayData.dateStr
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.briefing) {
            setCurrentBriefing({
              ...data.briefing,
              events: filteredEvents
            });
          }
        }
      } else {
        const dayData = WEEK_SCHEDULE_DATA[selectedDayKey] || WEEK_SCHEDULE_DATA['sat'];
        setActiveEvents(dayData.events);
        setIsLiveSourceActive(true);
        setLiveSyncMessage(`✅ Connected to Google Calendar (${googleUser?.email || 'Primary'}). No events found in 5-day window; using clinical care plan.`);
      }
    } catch (err: any) {
      console.error('Failed to sync live Google Calendar:', err);
      setLiveSyncMessage(`Google Calendar sync notice: ${err.message}. Using clinical schedule.`);
    } finally {
      setIsSyncingLiveCalendar(false);
      setIsGeneratingDayAi(false);
    }
  };

  // Manual Master Sync (Synchronizes Active Schedule, Mobility Buffers & Gemini AI Synthesis)
  const handleManualSync = async () => {
    setIsLocalSyncing(true);
    setLiveSyncMessage(null);
    try {
      if (isLiveSourceActive && (calendarToken || localStorage.getItem('gcal_access_token'))) {
        await handleFetchLiveCalendar();
      } else {
        await handleSelectDay(selectedDayKey);
        setLiveSyncMessage(`✅ Synced! Refreshed schedule, mobility buffers (+25m), and ${selectedPersona === 'ward-cleaver' ? 'Ward Cleaver' : selectedPersona === 'dr-evil' ? 'Dr. Evil' : selectedPersona === 'first-mate' ? 'First Mate' : 'Clinical Co-Pilot'} audio briefing.`);
      }
    } catch (err: any) {
      console.error('Manual sync error:', err);
      setLiveSyncMessage(`Sync error: ${err.message || 'Failed to sync'}`);
    } finally {
      setIsLocalSyncing(false);
      setIsGeneratingDayAi(false);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setCalendarToken(null);
    setIsLiveSourceActive(false);
    setAllLiveEvents([]);
    const baseEvents = getDayEventsWithOverrides(selectedDayKey, customOverrides);
    setActiveEvents(baseEvents);
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

  // Switch Day Handler: Instant Synchronous UI Update + Dynamic 5-Day Horizon + Background Gemini Refresh
  const handleSelectDay = async (dayKey: string) => {
    setSelectedDayKey(dayKey);
    if (isPlayingAudio) {
      acousticVoice.cancel();
      setIsPlayingAudio(false);
    }

    let targetEvents: CalendarEvent[] = [];
    let headline = '';
    let summary = '';
    let dateStr = '';
    let spokenScript = '';
    let actionsWade: string[] = [];
    let actionsElsbeth: string[] = [];
    let clinicalSynergy = {
      levodopaAbsorptionAdvice: 'Maintain light carbohydrates before morning transit.',
      vyalevPumpCheck: 'Continuous pump cartridge verified with steady flow.'
    };
    let weather = 'Mild & Sunny, 68°F';

    if (dayKey === 'all_5_days') {
      if (isLiveSourceActive && allLiveEvents.length > 0) {
        targetEvents = allLiveEvents;
      } else {
        // Collect next 5 days of preset events
        targetEvents = next5Days.flatMap(d => {
          const evts = getDayEventsWithOverrides(d.key, customOverrides);
          return evts.map(e => ({
            ...e,
            dateStr: d.dateStr,
            dayLabel: `${d.weekdayLong} (${d.badge})`,
            fullDateFormatted: `${d.weekdayLong}, ${d.monthShort} ${d.dayNum}`
          }));
        });
      }
      headline = '5-Day Care Horizon & Schedule';
      summary = `Viewing ${targetEvents.length} scheduled events across the next 5 days with coordinated mobility buffers.`;
      dateStr = `${next5Days[0]?.dateStr} – ${next5Days[next5Days.length - 1]?.dateStr}`;
      spokenScript = `Captain Wade, here is your 5-day schedule overview spanning from ${next5Days[0]?.weekdayLong} through ${next5Days[next5Days.length - 1]?.weekdayLong}. All transit buffers and medication timing have been calibrated.`;
      actionsWade = [
        'Review upcoming therapy sessions and daily mobility windows.',
        'Ensure hydration before scheduled departure times.',
        'Keep continuous pump harness inspected daily.'
      ];
      actionsElsbeth = [
        'All staged transit departures calibrated with +25m mobility buffers.',
        'Weekly Vyalev cassette cold-chain delivery coordinated with Acaria Health.',
        'Sync calendar reminders across family devices.'
      ];
    } else {
      const targetDay = next5Days.find(d => d.key === dayKey) || next5Days[0];
      const presetDayData = WEEK_SCHEDULE_DATA[dayKey] || WEEK_SCHEDULE_DATA['sat'];

      if (isLiveSourceActive && allLiveEvents.length > 0) {
        targetEvents = allLiveEvents.filter(e => {
          if (e.isoDate && targetDay.isoDate) {
            return e.isoDate === targetDay.isoDate;
          }
          if (e.dateStr) {
            return e.dateStr.toLowerCase().includes(targetDay.weekdayLong.toLowerCase());
          }
          return false;
        });

        headline = `${targetDay.weekdayLong} (${targetDay.badge}) Live Schedule`;
        summary = `${targetDay.dateStr}: ${targetEvents.length} synced calendar events from Google Calendar with clinical mobility buffers.`;
        dateStr = `${targetDay.dateStr}`;
        spokenScript = targetEvents.length > 0 
          ? `Good morning Captain Wade. Today is ${targetDay.weekdayLong}, ${targetDay.monthShort} ${targetDay.dayNum}. You have ${targetEvents.length} events scheduled. Take your time with every step.`
          : `Good morning Captain Wade. For ${targetDay.weekdayLong}, you have a clear, restful schedule with no off-site travel. Enjoy a quiet day at home.`;
        actionsWade = targetEvents.length > 0
          ? targetEvents.slice(0, 3).map(e => e.actionForWade || `Follow unhurried routine for ${e.title}.`)
          : ['Enjoy a restful day at home.', 'Gentle hydration and nutrition.', 'Routine pump check.'];
        actionsElsbeth = targetEvents.length > 0
          ? targetEvents.filter(e => e.needsTransit).map(e => `Staged departure for ${e.title} at ${e.suggestedDepartureTime || e.startTime} (+${e.mobilityPrepBufferMinutes || 25}m buffer).`)
          : ['No transit needed today for Wade.', 'Monitor continuous infusion pump.'];
      } else {
        targetEvents = getDayEventsWithOverrides(dayKey, customOverrides).map(e => ({
          ...e,
          dateStr: targetDay.dateStr,
          dayLabel: `${targetDay.weekdayLong} (${targetDay.badge})`,
          fullDateFormatted: `${targetDay.weekdayLong}, ${targetDay.monthShort} ${targetDay.dayNum}`
        }));
        headline = `${presetDayData.focus} Routine`;
        summary = `${presetDayData.dayLabel}: ${presetDayData.focus} schedule and coordinated mobility buffers.`;
        dateStr = presetDayData.dateStr;
        spokenScript = presetDayData.spokenAudioScript;
        actionsWade = presetDayData.actionsForWade;
        actionsElsbeth = presetDayData.actionsForElsbeth;
        clinicalSynergy = presetDayData.clinicalMedicationSynergy;
        weather = presetDayData.weather;
      }
    }

    // 1. INSTANT synchronous update to all UI channels
    setActiveEvents(targetEvents);
    setCurrentBriefing({
      headline,
      summary,
      dayTimeFormatted: `${dateStr} • 08:00 AM`,
      spokenAudioScript: spokenScript,
      actionsForWade: actionsWade,
      actionsForElsbeth: actionsElsbeth,
      clinicalMedicationSynergy: clinicalSynergy,
      events: targetEvents,
      transitDepartureBuffers: targetEvents.filter(e => e.needsTransit && (e.mobilityPrepBufferMinutes || 0) > 0).map(e => ({
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
          events: targetEvents,
          personaId: selectedPersona,
          pumpHoursLeft: dayKey === 'fri' ? 4 : 14,
          weather,
          dateFormatted: dateStr
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.briefing) {
          setCurrentBriefing(prev => ({
            ...prev,
            ...data.briefing,
            dayTimeFormatted: `${dateStr} • 08:00 AM`,
            events: targetEvents
          }));
        }
      }
    } catch (e) {
      console.warn('Background AI calibration notice:', e);
    } finally {
      setIsGeneratingDayAi(false);
    }
  };

  // Open Event & Tag Editor Modal
  const handleOpenEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEditForm({ ...event });
  };

  // Close Event Editor Modal
  const handleCloseEditModal = () => {
    setEditingEvent(null);
    setEditForm({});
  };

  // Save Event Tags & Customizations
  const handleSaveEditEvent = () => {
    if (!editingEvent || !editingEvent.id) return;

    const audience = editForm.audience || editingEvent.audience || 'Captain Wade';
    const isWade = audience === 'Captain Wade';
    const isLA = audience === 'Elsbeth (Work/LA)' || editForm.isWorkTripLA;
    const needsTransit = isWade ? Boolean(editForm.needsTransit) : false;
    const buffer = needsTransit ? (Number(editForm.mobilityPrepBufferMinutes) || 0) : 0;
    
    let colorTag = editForm.colorTag || editingEvent.colorTag || 'emerald';
    if (audience === 'Little Wade') colorTag = 'blue';
    else if (audience === 'Elsbeth (Work/LA)') colorTag = 'purple';
    else if (audience === 'Family Shared') colorTag = 'indigo';
    else if (editForm.category === 'Physical Therapy') colorTag = 'amber';
    else if (editForm.category === 'Clinical / Medical') colorTag = 'rose';

    const updatedEvent: CalendarEvent = {
      ...editingEvent,
      ...editForm,
      audience,
      category: editForm.category || editingEvent.category || 'Routine',
      colorTag,
      needsTransit,
      mobilityPrepBufferMinutes: buffer,
      suggestedDepartureTime: (needsTransit && buffer > 0) ? (editForm.suggestedDepartureTime || editingEvent.suggestedDepartureTime) : undefined,
      transitMode: needsTransit ? (editForm.transitMode || 'Uber Assist / Ride Required') : (isLA ? 'Caregiver Work Travel (No Transit for Dad)' : 'No Transit (Home/Virtual)'),
      actionForWade: editForm.actionForWade || editingEvent.actionForWade || 'Rest comfortably at home.',
      actionForCaregiver: editForm.actionForCaregiver || editingEvent.actionForCaregiver || 'Routine monitoring.',
      wadeImpactNote: editForm.wadeImpactNote || editingEvent.wadeImpactNote || 'Zero transit or physical demand for Dad.'
    };

    const newOverrides = {
      ...customOverrides,
      [editingEvent.id]: updatedEvent
    };

    setCustomOverrides(newOverrides);
    try {
      localStorage.setItem('parkinsons_calendar_custom_overrides', JSON.stringify(newOverrides));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Update active events in state
    const updatedActiveEvents = activeEvents.map(e => e.id === editingEvent.id ? updatedEvent : e);
    setActiveEvents(updatedActiveEvents);

    // Update current briefing with updated events and re-calculated buffers
    setCurrentBriefing(prev => ({
      ...prev,
      events: updatedActiveEvents,
      transitDepartureBuffers: updatedActiveEvents.filter(e => e.needsTransit && (e.mobilityPrepBufferMinutes || 0) > 0).map(e => ({
        eventName: e.title,
        suggestedDepartureTime: e.suggestedDepartureTime || e.startTime,
        totalBufferMinutes: e.mobilityPrepBufferMinutes,
        transitMode: e.transitMode || 'Uber Assist / Ride Required'
      }))
    }));

    setLiveSyncMessage(`✅ Saved custom tags & care settings for "${updatedEvent.title}"!`);
    handleCloseEditModal();
  };

  // Reset Event to Original Base Config
  const handleResetEventToDefault = (eventId: string) => {
    const newOverrides = { ...customOverrides };
    delete newOverrides[eventId];
    setCustomOverrides(newOverrides);
    try {
      localStorage.setItem('parkinsons_calendar_custom_overrides', JSON.stringify(newOverrides));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    const baseEvents = WEEK_SCHEDULE_DATA[selectedDayKey]?.events || [];
    const originalEvent = baseEvents.find(e => e.id === eventId);
    if (originalEvent) {
      const updatedActiveEvents = activeEvents.map(e => e.id === eventId ? originalEvent : e);
      setActiveEvents(updatedActiveEvents);
      setCurrentBriefing(prev => ({
        ...prev,
        events: updatedActiveEvents,
        transitDepartureBuffers: updatedActiveEvents.filter(e => e.needsTransit && (e.mobilityPrepBufferMinutes || 0) > 0).map(e => ({
          eventName: e.title,
          suggestedDepartureTime: e.suggestedDepartureTime || e.startTime,
          totalBufferMinutes: e.mobilityPrepBufferMinutes,
          transitMode: e.transitMode || 'Uber Assist / Ride Required'
        }))
      }));
      setLiveSyncMessage(`🔄 Reset "${originalEvent.title}" back to clinical default settings.`);
    }
    handleCloseEditModal();
  };

  // Direct Google Calendar Add Event (Direct link to original event or calendar)
  const createGoogleCalendarUrl = (event: CalendarEvent) => {
    // If live event with htmlLink, open exact original event in Google Calendar
    if (event.htmlLink) {
      return event.htmlLink;
    }
    // Direct link to Google Calendar web app view without creating duplicate events
    return 'https://calendar.google.com/calendar/u/0/r';
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
              id="btn-refresh-calendar-briefing"
              onClick={handleManualSync}
              disabled={isGeneratingDayAi || isRefreshing || isSyncingLiveCalendar || isLocalSyncing}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDayAi || isRefreshing || isSyncingLiveCalendar || isLocalSyncing ? 'animate-spin' : ''}`} />
              <span>{isGeneratingDayAi || isRefreshing || isLocalSyncing ? 'Syncing...' : isLiveSourceActive ? 'Sync Live Events' : 'Sync Calendar'}</span>
            </button>
          </div>
        </div>

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
            5-DAY AHEAD-OF-TIME NAVIGATION SELECTOR BAR
        -------------------------------------------------------------- */}
        <div className="mt-5 pt-4 border-t border-indigo-800/60">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Select Day Schedule (Synchronizes Spoken Script, Actions & Buffers)
            </span>
            <span className="text-[10px] text-amber-300 font-semibold">
              Current Active: {selectedDayKey === 'all_5_days' ? 'All 5 Days' : currentDayData.dayLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {next5Days.map((day) => {
              const isActive = selectedDayKey === day.key;
              return (
                <button
                  key={day.key}
                  type="button"
                  id={`btn-select-day-${day.key}`}
                  onClick={() => handleSelectDay(day.key)}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between gap-1 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold scale-[1.02]'
                      : 'bg-white/10 hover:bg-white/15 text-indigo-100 border-white/10 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold leading-tight">{day.weekdayLong}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-white/20 text-indigo-200'
                    }`}>
                      {day.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] gap-1">
                    <span className={isActive ? 'text-slate-900 font-bold' : 'text-indigo-200'}>
                      {day.monthShort} {day.dayNum}
                    </span>
                    <span className={`truncate ${isActive ? 'text-slate-900 font-extrabold' : 'text-amber-200 font-semibold'}`}>
                      {day.focus}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* All 5 Days Tab */}
            <button
              type="button"
              id="btn-select-day-all_5_days"
              onClick={() => handleSelectDay('all_5_days')}
              className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between gap-1 ${
                selectedDayKey === 'all_5_days'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold scale-[1.02]'
                  : 'bg-white/10 hover:bg-white/15 text-indigo-100 border-white/10 font-medium'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold leading-tight">All 5 Days</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase ${
                  selectedDayKey === 'all_5_days' ? 'bg-slate-950 text-amber-400' : 'bg-white/20 text-indigo-200'
                }`}>
                  5-Day View
                </span>
              </div>
              <span className={`text-[10px] truncate ${selectedDayKey === 'all_5_days' ? 'text-slate-900 font-bold' : 'text-indigo-200'}`}>
                Full 5-Day Agenda
              </span>
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
            SPOKEN MORNING AUDIO PLAYER BOX (Tailored to Selected Day)
        -------------------------------------------------------------- */}
        <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                href="https://calendar.google.com/calendar/u/0/r"
                target="_blank"
                rel="noreferrer noopener"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>Open Google Calendar</span>
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
                      Wade's Guidance ({currentDayData.dayLabel.split(' ')[0]})
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
              <span>Transit departures padded with +25m mobility buffers automatically.</span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            INTERACTIVE TIMELINE (Dad-Centric Event Analysis)
        -------------------------------------------------------------- */}
        <div className="pt-2">
          <div className="flex items-center justify-between gap-3 mb-3">
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

            <div className="text-[11px] text-slate-500 font-semibold">
              Showing all events with Big Wade impact analysis
            </div>
          </div>

          {showFullSchedule && (
            <div className="space-y-3.5">
              {activeEvents.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">Clear Care Schedule for this Day</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    No scheduled off-site appointments or transit events found for this date. Wade can rest comfortably at home with steady pump flow and routine hydration.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectDay('all_5_days')}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View All 5 Days</span>
                  </button>
                </div>
              ) : (
                activeEvents.map((evt) => {
                  const googleCalUrl = createGoogleCalendarUrl(evt);
                  const isWadeEvent = evt.audience === 'Captain Wade';
                  const isUber = evt.transitMode === 'Uber Assist / Ride Required';
                  const isLA = evt.isWorkTripLA || evt.audience === 'Elsbeth (Work/LA)';

                  // Border & background accents based on audience & colorTag
                  const cardBorderColor = 
                    isLA ? 'border-purple-200 hover:border-purple-300 bg-purple-50/20' :
                    evt.audience === 'Little Wade' ? 'border-blue-200 hover:border-blue-300 bg-blue-50/20' :
                    evt.audience === 'Family Shared' ? 'border-indigo-200 hover:border-indigo-300 bg-indigo-50/20' :
                    evt.colorTag === 'amber' ? 'border-amber-200 hover:border-amber-300 bg-amber-50/20' :
                    evt.colorTag === 'rose' ? 'border-rose-200 hover:border-rose-300 bg-rose-50/20' :
                    'border-slate-200 hover:border-emerald-300 bg-white';

                  return (
                    <div 
                      key={evt.id} 
                      className={`p-4 sm:p-5 rounded-2xl border ${cardBorderColor} transition-all shadow-2xs space-y-3`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Date Badge */}
                          {(evt.dayLabel || evt.fullDateFormatted || evt.dateStr) && (
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-indigo-900 text-amber-300 border border-indigo-700/50 flex items-center gap-1 shadow-2xs">
                              <Calendar className="w-3 h-3 text-amber-300" />
                              {evt.dayLabel || evt.fullDateFormatted || evt.dateStr}
                            </span>
                          )}

                          <span className="font-extrabold text-sm text-slate-900">
                            {evt.timeFormatted}
                          </span>

                          {/* Audience Tag Badge */}
                          {evt.audience && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                              evt.audience === 'Captain Wade' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              evt.audience === 'Little Wade' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                              evt.audience === 'Elsbeth (Work/LA)' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                              'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            }`}>
                              <UserCheck className="w-2.5 h-2.5" />
                              {evt.audience}
                            </span>
                          )}

                        {/* Transit Badge (Uber for Wade vs No Transit for Wade) */}
                        {isWadeEvent ? (
                          evt.needsTransit && evt.transitMode ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-2xs">
                              <Car className="w-2.5 h-2.5" />
                              {evt.transitMode}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              Home / Virtual (No Transit)
                            </span>
                          )
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-slate-500" />
                            No Uber / Transit required for Big Wade
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
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditEvent(evt)}
                          className="text-[11px] text-slate-700 hover:text-indigo-600 font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-300 shadow-2xs transition-colors"
                          title="Edit audience, category, transit mode, and mobility buffer tags"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-500" />
                          <span>Edit Tags</span>
                        </button>
                        <a
                          href={googleCalUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-[11px] text-slate-500 hover:text-indigo-600 font-semibold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-300 shadow-2xs transition-colors"
                          title={evt.htmlLink ? "Open original event in Google Calendar" : "Open Google Calendar"}
                        >
                          <Calendar className="w-3 h-3 text-indigo-500" />
                          <span>{evt.htmlLink ? "Google Calendar" : "Calendar"}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </a>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        {evt.title}
                        {isLA && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-200 text-purple-900 rounded-md font-extrabold uppercase">
                            ✈️ LA Work Trip
                          </span>
                        )}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {evt.location}
                        </span>
                        {evt.suggestedDepartureTime && isWadeEvent && evt.needsTransit && (evt.mobilityPrepBufferMinutes || 0) > 0 && (
                          <span className={`flex items-center gap-1 font-semibold ${isUber ? 'text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200' : 'text-indigo-700'}`}>
                            <Car className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            Staged Departure: {evt.suggestedDepartureTime} (+{evt.mobilityPrepBufferMinutes}m PD buffer)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1.5">
                        {evt.description || evt.actionForCaregiver}
                      </p>
                    </div>

                    {/* Dad-Centric Output & Impact Container */}
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      isWadeEvent 
                        ? 'bg-amber-50/50 border-amber-200/70 text-amber-950'
                        : 'bg-blue-50/60 border-blue-200/70 text-blue-950'
                    }`}>
                      <div className="flex items-center gap-1.5 font-extrabold text-[11px] mb-1 uppercase tracking-wide">
                        <UserCheck className={`w-3.5 h-3.5 ${isWadeEvent ? 'text-amber-600' : 'text-blue-600'}`} />
                        <span>{isWadeEvent ? "Captain Wade Action Guidance" : "Impact on Big Wade (Dad)"}</span>
                      </div>
                      <p className="font-medium text-slate-700">
                        {isWadeEvent 
                          ? (evt.actionForWade || evt.wadeImpactNote)
                          : (evt.wadeImpactNote || 'Dad relaxes comfortably at home; zero transit or physical demands on Wade. Caregiver coordinates activity.')
                        }
                      </p>
                    </div>
                  </div>
                );
              }))}
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          MODAL: EDIT EVENT TAGS & PARKINSON'S CARE SETTINGS
      -------------------------------------------------------------- */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-600" />
                    Tag & Schedule Customizer
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Edit Event Tags & Clinical Buffers
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Adjust audience attribution, category, and Parkinson's mobility buffer for this event.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="space-y-5">
              
              {/* Event Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Event Title
                </label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="e.g. Dr. Henderson Telehealth Neurologist Check-In"
                />
              </div>

              {/* Time & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Time Formatted
                  </label>
                  <input
                    type="text"
                    value={editForm.timeFormatted || ''}
                    onChange={(e) => setEditForm({ ...editForm, timeFormatted: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="e.g. 10:00 AM – 11:30 AM"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="e.g. UCSF Neuro Clinic or Home / Patio"
                  />
                </div>
              </div>

              {/* AUDIENCE ATTRIBUTION TAG */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Audience Attribution Tag
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Captain Wade', label: 'Captain Wade', desc: 'Primary Patient', color: 'border-amber-400 bg-amber-50 text-amber-900' },
                    { id: 'Little Wade', label: 'Little Wade', desc: 'Youth Activities', color: 'border-blue-400 bg-blue-50 text-blue-900' },
                    { id: 'Elsbeth (Work/LA)', label: 'Elsbeth (LA)', desc: 'Work / Travel', color: 'border-purple-400 bg-purple-50 text-purple-900' },
                    { id: 'Family Shared', label: 'Family Shared', desc: 'Home / Meals', color: 'border-indigo-400 bg-indigo-50 text-indigo-900' }
                  ].map((aud) => {
                    const isSelected = (editForm.audience || editingEvent.audience) === aud.id;
                    return (
                      <button
                        key={aud.id}
                        type="button"
                        onClick={() => {
                          const isWade = aud.id === 'Captain Wade';
                          setEditForm({ 
                            ...editForm, 
                            audience: aud.id as EventAudience,
                            needsTransit: isWade ? editForm.needsTransit : false,
                            mobilityPrepBufferMinutes: isWade ? editForm.mobilityPrepBufferMinutes : 0
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${aud.color} ring-2 ring-indigo-500/30 font-bold shadow-xs`
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">{aud.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{aud.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CATEGORY TAG */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Event Category Tag
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Physical Therapy',
                    'Clinical / Medical',
                    'Community / Social',
                    'Family / Rest',
                    'Travel / Work Trip',
                    'Routine'
                  ].map((cat) => {
                    const isSelected = (editForm.category || editingEvent.category) === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, category: cat })}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TRANSIT & MOBILITY BUFFER SETTINGS (Only for Captain Wade events) */}
              {(editForm.audience === 'Captain Wade' || (!editForm.audience && editingEvent.audience === 'Captain Wade')) ? (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-600" />
                        Requires Vehicular / Uber Assist Transit for Wade?
                      </h4>
                      <p className="text-[11px] text-amber-800 font-medium">
                        Enable to calculate staged departure times and Parkinson's mobility buffers.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editForm.needsTransit)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditForm({
                            ...editForm,
                            needsTransit: checked,
                            mobilityPrepBufferMinutes: checked ? (editForm.mobilityPrepBufferMinutes || 25) : 0,
                            transitMode: checked ? (editForm.transitMode || 'Uber Assist / Ride Required') : 'No Transit (Home/Virtual)',
                            suggestedDepartureTime: checked ? (editForm.suggestedDepartureTime || '09:55 AM') : undefined
                          });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  {editForm.needsTransit && (
                    <div className="space-y-3 pt-2 border-t border-amber-200/60">
                      
                      {/* Transit Mode Selection */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-amber-950">
                          Transit Mode
                        </label>
                        <select
                          value={editForm.transitMode || 'Uber Assist / Ride Required'}
                          onChange={(e) => setEditForm({ ...editForm, transitMode: e.target.value as TransitMode })}
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                        >
                          <option value="Uber Assist / Ride Required">Uber Assist / Ride Required</option>
                          <option value="Caregiver Driving">Caregiver Driving</option>
                          <option value="Caregiver Local Drive (No Uber for Dad)">Caregiver Local Drive (No Uber for Dad)</option>
                          <option value="Flight / Out of Town">Flight / Out of Town</option>
                        </select>
                      </div>

                      {/* Mobility Buffer Minutes */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-amber-950">
                          Parkinson's Mobility Preparation Buffer
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                          {[0, 15, 20, 25, 30, 45].map((mins) => {
                            const isSelected = (editForm.mobilityPrepBufferMinutes ?? editingEvent.mobilityPrepBufferMinutes) === mins;
                            return (
                              <button
                                key={mins}
                                type="button"
                                onClick={() => setEditForm({ ...editForm, mobilityPrepBufferMinutes: mins })}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                    : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                                }`}
                              >
                                {mins === 0 ? '0m (None)' : `+${mins}m`}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Staged Departure Time */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-amber-950">
                          Staged Departure Time
                        </label>
                        <input
                          type="text"
                          value={editForm.suggestedDepartureTime || ''}
                          onChange={(e) => setEditForm({ ...editForm, suggestedDepartureTime: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-semibold text-slate-900"
                          placeholder="e.g. 09:55 AM"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  ℹ️ Non-patient event (assigned to {editForm.audience || editingEvent.audience}). Transit is marked as not required for Dad; no staged departure buffers will be applied.
                </div>
              )}

              {/* Guidance & Staging Notes */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Captain Wade Spoken Guidance / Action
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.actionForWade || ''}
                    onChange={(e) => setEditForm({ ...editForm, actionForWade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Clear, unhurried guidance for Wade..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Caregiver Logistics Action (Elsbeth)
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.actionForCaregiver || ''}
                    onChange={(e) => setEditForm({ ...editForm, actionForCaregiver: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Logistics and preparation instructions for caregiver..."
                  />
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleResetEventToDefault(editingEvent.id)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Clinical Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditEvent}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Tags & Update Schedule</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
