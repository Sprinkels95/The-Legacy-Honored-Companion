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

// 7-Day Pre-Configured Parkinson's Clinical Calendar & Family Schedule with Synchronous Guidance
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
    focusColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
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
        actionForWade: 'Recline comfortably with feet elevated. Rest your eyes.',
        actionForCaregiver: 'Dim ambient living room lighting and ensure quiet environment.',
        wadeImpactNote: 'Restorative rest interval with elevated legs to prevent dependent edema and recharge motor circuits.'
      },
      {
        id: 'cal-sat-4',
        title: 'Dr. Henderson Telehealth Neurologist Check-In',
        startTime: '03:30 PM',
        endTime: '04:15 PM',
        timeFormatted: '3:30 PM – 4:15 PM',
        location: 'Google Meet (Telehealth Video)',
        attendees: ['Dr. Arthur Henderson, MD', 'Captain Wade', 'Elsbeth Seymour'],
        category: 'Clinical / Medical',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'indigo',
        description: 'Routine 14-day motor fluctuation assessment, Vyalev cartridge telemetry review, and acoustic voice pitch review.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        levodopaMealAlert: 'No immediate food intake within 45m of tele-exam to ensure clear vocal tone.',
        vyalevPumpSyncNote: 'Stream telemetry logs via AI Studio interface for instant physician review.',
        actionForWade: 'Sit comfortably in front of the tablet screen in the study.',
        actionForCaregiver: 'Position iPad on study desk stand and launch 1-click clinical dossier.',
        wadeImpactNote: 'Relaxed at-home video visit. Zero road transit stress or waiting room fatigue.'
      }
    ]
  },
  'sun': {
    dayLabel: 'Sunday',
    dateStr: 'Sunday, Aug 30, 2026',
    focus: 'Quiet Rest & Family',
    focusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
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
    focusColor: 'bg-amber-50 text-amber-800 border-amber-200',
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
    focusColor: 'bg-blue-50 text-blue-800 border-blue-200',
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
        actionForWade: 'Speak with power and projection through each phonation vowel.',
        actionForCaregiver: 'Set up room-temperature water and position external microphone.',
        wadeImpactNote: 'Vocal projection and breathing control session; conducted from the comfort of the study desk.'
      }
    ]
  },
  'wed': {
    dayLabel: 'Wednesday',
    dateStr: 'Wednesday, Sep 2, 2026',
    focus: 'Community & Art Therapy',
    focusColor: 'bg-purple-50 text-purple-800 border-purple-200',
    weather: 'Mild Fog & Sunshine, 64°F',
    spokenAudioScript: "Good morning Captain Wade. Today is Wednesday, September second. You have your Parkinson's Art & Clay Therapy class at the de Young Museum at 11:00 AM. Unhurried transit is set for 10:20 AM.",
    actionsForWade: [
      'Gentle wrist and finger warm-up stretches before art class.',
      'Sculpting and watercolor expression at de Young Museum at 11:00 AM.',
      'Afternoon coffee and music in the conservatory.'
    ],
    actionsForElsbeth: [
      'Uber Assist departure staged for 10:20 AM (+25m buffer for Dad).',
      'Pack artist smock, wipes, and adaptive gripper tools.',
      'Coordinate afternoon tea at the museum cafe.'
    ],
    clinicalMedicationSynergy: {
      levodopaAbsorptionAdvice: 'Keep lunch light with fresh fruit to prevent afternoon bradykinesia.',
      vyalevPumpCheck: 'Pump reservoir at 50% capacity; ample reserve for day outing.'
    },
    events: [
      {
        id: 'cal-wed-1',
        title: 'Adaptive Fine-Motor Art & Clay Therapy',
        startTime: '11:00 AM',
        endTime: '12:30 PM',
        timeFormatted: '11:00 AM – 12:30 PM',
        location: 'de Young Museum Art Studio',
        address: '50 Hagiwara Tea Garden Dr, San Francisco, CA',
        category: 'Community / Social',
        audience: 'Captain Wade',
        needsTransit: true,
        transitMode: 'Uber Assist / Ride Required',
        colorTag: 'purple',
        description: 'Tactile clay modeling and watercolor brushwork designed to stimulate fine motor control and dopamine release.',
        mobilityPrepBufferMinutes: 25,
        suggestedDepartureTime: '10:20 AM',
        estimatedDriveMinutes: 15,
        fatigueRiskLevel: 'Moderate',
        actionForWade: 'Enjoy feeling the textures of the clay and expressing your creativity.',
        actionForCaregiver: 'Uber Assist staged for 10:20 AM departure; pack adaptive tool grips.',
        wadeImpactNote: 'Fine motor rehabilitation in an enriching, creative museum environment; +25m buffer staged.'
      },
      {
        id: 'cal-wed-2',
        title: 'Museum Cafe Lunch & Golden Gate Park Stroll',
        startTime: '12:45 PM',
        endTime: '02:00 PM',
        timeFormatted: '12:45 PM – 2:00 PM',
        location: 'de Young Cafe & Sculpture Garden',
        category: 'Family / Rest',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Leisurely outdoor lunch amidst the eucalyptus trees and sculpture path.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Sip your tea and take in the beautiful sculptures.',
        actionForCaregiver: 'Secure outdoor seating with shade and level paved footing.',
        wadeImpactNote: 'Relaxed outdoor lunch in Golden Gate Park with zero scheduling rush.'
      }
    ]
  },
  'thu': {
    dayLabel: 'Thursday',
    dateStr: 'Thursday, Sep 3, 2026',
    focus: 'Occupational Therapy & Rest',
    focusColor: 'bg-teal-50 text-teal-800 border-teal-200',
    weather: 'Bright & Pleasant, 67°F',
    spokenAudioScript: "Good morning Captain. Today is Thursday, September third. Occupational therapist Mark visits at 10:00 AM to practice daily rhythm mechanics. Afternoon is dedicated to rest and listening to music.",
    actionsForWade: [
      'Morning home routine with OT Mark at 10:00 AM.',
      'Practice kitchen reaching and adaptive buttoning grips.',
      'Restorative afternoon rest with your favorite jazz records.'
    ],
    actionsForElsbeth: [
      'Review bathroom grab bar positions and entryway lighting with Mark.',
      'Refill low-protein snack containers in pantry hub.',
      'Confirm tomorrow\'s in-person neurology appointment with Dr. Henderson.'
    ],
    clinicalMedicationSynergy: {
      levodopaAbsorptionAdvice: 'Take morning hydration before OT fine motor trials.',
      vyalevPumpCheck: 'Inspect cannula insertion site for clean adhesion.'
    },
    events: [
      {
        id: 'cal-thu-1',
        title: 'Occupational Therapy: Home Ergonomics with Mark',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        timeFormatted: '10:00 AM – 11:00 AM',
        location: 'Home (Kitchen & Bedroom)',
        category: 'Physical Therapy',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Adaptive daily living coaching: dressing strategies, utensil stabilization, and home safety checks.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Work through the morning movement drills at your own natural pace.',
        actionForCaregiver: 'Walk through bedroom and hallway safety suggestions with Mark.',
        wadeImpactNote: 'Home-based daily living coaching; zero transit stress.'
      },
      {
        id: 'cal-thu-2',
        title: 'Afternoon Classical Music & Recline',
        startTime: '02:00 PM',
        endTime: '04:00 PM',
        timeFormatted: '2:00 PM – 4:00 PM',
        location: 'Living Room Audio Station',
        category: 'Family / Rest',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: 'Auditory relaxation with Bach cello suites to soothe motor tremor and encourage deep rest.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Close your eyes and let the rhythm of the music relax your muscles.',
        actionForCaregiver: 'Set warm lighting and ensure supportive neck pillow positioning.',
        wadeImpactNote: 'Auditory motor relaxation; deeply restorative afternoon rest.'
      }
    ]
  },
  'fri': {
    dayLabel: 'Friday',
    dateStr: 'Friday, Sep 4, 2026',
    focus: 'Neurology Visit & Site Rotation',
    focusColor: 'bg-rose-50 text-rose-800 border-rose-200',
    weather: 'Breezy & Cool, 63°F',
    spokenAudioScript: "Good morning Captain. Today is Friday, September fourth. We have our in-person neurology follow-up with Dr. Henderson at UCSF Neuro Clinic at 1:30 PM. Unhurried Uber Assist will be ready at 12:45 PM.",
    actionsForWade: [
      'Low-protein morning meals to keep your motor pathways sharp.',
      'In-person visit with Dr. Henderson at UCSF at 1:30 PM.',
      'Evening sterile Vyalev pump infusion site rotation.'
    ],
    actionsForElsbeth: [
      'Uber Assist staged for 12:45 PM departure (+25m buffer for Dad).',
      'Export and print weekly acoustic voice & motor tremor summaries for Dr. Henderson.',
      'Perform evening sterile infusion set rotation and record in log.'
    ],
    clinicalMedicationSynergy: {
      levodopaAbsorptionAdvice: 'Keep midday lunch light prior to in-person motor examination.',
      vyalevPumpCheck: 'Scheduled 72h sterile cassette swap & infusion site change tonight.'
    },
    events: [
      {
        id: 'cal-fri-1',
        title: 'Dr. Henderson In-Person Neurology Comprehensive Follow-Up',
        startTime: '01:30 PM',
        endTime: '02:45 PM',
        timeFormatted: '1:30 PM – 2:45 PM',
        location: 'UCSF Movement Disorders Clinic',
        address: '1635 Divisadero St, San Francisco, CA',
        attendees: ['Dr. Arthur Henderson, MD', 'Captain Wade', 'Elsbeth Seymour'],
        category: 'Clinical / Medical',
        audience: 'Captain Wade',
        needsTransit: true,
        transitMode: 'Uber Assist / Ride Required',
        colorTag: 'rose',
        description: 'Comprehensive UPDRS motor evaluation, Vyalev pump flow rate check, and acoustic speech trajectory review.',
        mobilityPrepBufferMinutes: 25,
        suggestedDepartureTime: '12:45 PM',
        estimatedDriveMinutes: 20,
        fatigueRiskLevel: 'Moderate',
        actionForWade: 'Comfortable clothing for motor exams; take unhurried steps into the clinic.',
        actionForCaregiver: 'Uber Assist departure staged for 12:45 PM with full +25m buffer.',
        wadeImpactNote: 'Major comprehensive neurology evaluation; staged +25m departure ensures relaxed clinic arrival.'
      },
      {
        id: 'cal-fri-2',
        title: 'Sterile Vyalev Infusion Set Rotation & Cassette Swap',
        startTime: '07:30 PM',
        endTime: '08:15 PM',
        timeFormatted: '7:30 PM – 8:15 PM',
        location: 'Master Bedroom Station',
        category: 'Routine',
        audience: 'Captain Wade',
        needsTransit: false,
        transitMode: 'No Transit (Home/Virtual)',
        colorTag: 'emerald',
        description: '72-hour sterile site changeover and fresh refrigerated Vyalev cassette loading.',
        mobilityPrepBufferMinutes: 0,
        fatigueRiskLevel: 'Low',
        actionForWade: 'Relax in the command chair while Elsbeth prepares the fresh site.',
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

const getNext7Days = (): DayHorizon[] => {
  const baseNow = new Date();
  const dayKeyMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const days: DayHorizon[] = [];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseNow.getFullYear(), baseNow.getMonth(), baseNow.getDate() + i);
    const dayIndex = d.getDay();
    const key = dayKeyMap[dayIndex];
    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const weekdayLong = d.toLocaleDateString('en-US', { weekday: 'long' });
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const dateStr = `${weekdayLong}, ${monthShort} ${dayNum}`;
    const badge = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekdayLong.slice(0, 3);
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
  const next7Days = useMemo(() => getNext7Days(), []);
  const initialDayKey = next7Days[0]?.key || 'sat';
  const [selectedDayKey, setSelectedDayKey] = useState<string>(initialDayKey);
  const [activeEvents, setActiveEvents] = useState<CalendarEvent[]>(briefing.events || WEEK_SCHEDULE_DATA['sat'].events);
  const [allLiveEvents, setAllLiveEvents] = useState<CalendarEvent[]>([]);
  const [currentBriefing, setCurrentBriefing] = useState<DailyCalendarBriefing>(briefing);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingDayAi, setIsGeneratingDayAi] = useState(false);

  // View Mode: 'timeline' (clean events list, default) vs 'checklist' (dual action guidance)
  const [calendarViewMode, setCalendarViewMode] = useState<'timeline' | 'checklist'>('timeline');

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
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [isLiveSourceActive, setIsLiveSourceActive] = useState(false);

  // Initialize Auth state listener on mount
  useEffect(() => {
    const unsubscribe = initCalendarAuth(
      (user, token) => {
        setGoogleUser(user);
        if (token) {
          setCalendarToken(token);
          setIsLiveSourceActive(true);
        }
      },
      () => {
        setGoogleUser(null);
        setCalendarToken(null);
        setIsLiveSourceActive(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Filter events for a specific day from live events list
  const filterLiveEventsForDay = (liveEvents: CalendarEvent[], dayKey: string): CalendarEvent[] => {
    if (dayKey === 'all_week') {
      const validHorizonDates = new Set(next7Days.map(d => d.isoDate));
      return liveEvents.filter(e => !e.isoDate || validHorizonDates.has(e.isoDate));
    }
    const targetDay = next7Days.find(d => d.key === dayKey);
    if (!targetDay) return liveEvents;

    return liveEvents.filter(e => {
      if (e.isoDate) {
        return e.isoDate === targetDay.isoDate;
      }
      if (e.dateStr) {
        const shortDate = `${targetDay.monthShort.toLowerCase()} ${targetDay.dayNum}`;
        return e.dateStr.toLowerCase().includes(shortDate);
      }
      return false;
    });
  };

  // Handle Google Sign In / Connect Live Calendar
  const handleConnectGoogleCalendar = async () => {
    try {
      setIsSyncingLiveCalendar(true);
      setLiveSyncMessage('Connecting to Google Calendar...');
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setCalendarToken(result.accessToken);
        setIsLiveSourceActive(true);
        setLiveSyncMessage(`Connected as ${result.user.email}. Synchronizing events...`);
        await handleFetchLiveCalendar(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Calendar connection error:', err);
      const isPopupBlocked = err?.code === 'auth/popup-blocked' || err?.message?.includes('popup');
      if (isPopupBlocked) {
        setLiveSyncMessage('⚠️ Browser blocked sign-in popup. Please allow popups for this site and try again.');
      } else {
        setLiveSyncMessage(`Google connection notice: ${err.message || 'Check permissions or sign-in popup'}`);
      }
    } finally {
      setIsSyncingLiveCalendar(false);
    }
  };

  // Fetch live events from connected Google Calendar
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
      const nowTimeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setLastSyncedTime(nowTimeStr);
      setAllLiveEvents(liveEvents);
      setIsLiveSourceActive(true);

      const filteredEvents = filterLiveEventsForDay(liveEvents, selectedDayKey);
      setActiveEvents(filteredEvents);

      const targetDay = next7Days.find(d => d.key === selectedDayKey);
      const dayLabelText = selectedDayKey === 'all_week' 
        ? 'All 7 Days' 
        : targetDay ? `${targetDay.weekdayLong} (${targetDay.badge})` : 'Selected Day';

      setLiveSyncMessage(`✅ Synced ${liveEvents.length} events from Google Calendar at ${nowTimeStr}. Showing: ${dayLabelText} (${filteredEvents.length} events).`);

      // Synthesize with Gemini for active view
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
    } catch (err: any) {
      console.error('Failed to sync live Google Calendar:', err);
      if (err.message && err.message.includes('re-authenticate')) {
        setCalendarToken(null);
        setLiveSyncMessage(`⚠️ ${err.message}`);
      } else {
        setLiveSyncMessage(`Sync notice: ${err.message || 'Error fetching events'}. Showing clinical care plan.`);
      }
    } finally {
      setIsSyncingLiveCalendar(false);
      setIsGeneratingDayAi(false);
    }
  };

  // Manual Master Sync button
  const handleManualSync = async () => {
    setIsLocalSyncing(true);
    setLiveSyncMessage(null);
    try {
      const storedToken = calendarToken || localStorage.getItem('gcal_access_token');
      if (storedToken) {
        await handleFetchLiveCalendar(storedToken);
      } else {
        // If not connected yet, trigger Google Connect
        await handleConnectGoogleCalendar();
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
    setLiveSyncMessage('Disconnected from Google Calendar. Showing Parkinson\'s clinical care protocol.');
  };

  // Switch to Clinical Schedule (Demo Mode)
  const handleSwitchToClinicalSchedule = () => {
    setIsLiveSourceActive(false);
    const baseEvents = getDayEventsWithOverrides(selectedDayKey, customOverrides);
    setActiveEvents(baseEvents);
    setLiveSyncMessage('Switched view to Parkinson\'s Clinical Care Protocol.');
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

  // Switch Day Handler
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

    if (dayKey === 'all_week') {
      if (isLiveSourceActive && allLiveEvents.length > 0) {
        targetEvents = allLiveEvents;
      } else {
        targetEvents = next7Days.flatMap(d => {
          const evts = getDayEventsWithOverrides(d.key, customOverrides);
          return evts.map(e => ({
            ...e,
            dateStr: d.dateStr,
            dayLabel: `${d.weekdayLong} (${d.badge})`,
            fullDateFormatted: `${d.weekdayLong}, ${d.monthShort} ${d.dayNum}`
          }));
        });
      }
      headline = "Week's Care Horizon & Schedule";
      summary = `Viewing ${targetEvents.length} scheduled events across the full week with coordinated transit buffers.`;
      dateStr = `${next7Days[0]?.dateStr} – ${next7Days[next7Days.length - 1]?.dateStr}`;
      spokenScript = `Captain Wade, here is your full week overview spanning from ${next7Days[0]?.weekdayLong} through ${next7Days[next7Days.length - 1]?.weekdayLong}. All transit buffers and medication timing have been calibrated.`;
      actionsWade = [
        'Review upcoming therapy sessions and daily mobility windows.',
        'Ensure hydration before scheduled departure times.',
        'Keep continuous pump harness inspected daily.'
      ];
      actionsElsbeth = [
        'Review Uber Assist staging times across the 7-day schedule.',
        'Verify Friday neurology in-person exam preparation dossier.',
        'Ensure weekend rest periods are protected.'
      ];
    } else {
      const dayData = WEEK_SCHEDULE_DATA[dayKey] || WEEK_SCHEDULE_DATA['sat'];
      const matchedHorizonDay = next7Days.find(d => d.key === dayKey);

      if (isLiveSourceActive && allLiveEvents.length > 0 && matchedHorizonDay) {
        targetEvents = filterLiveEventsForDay(allLiveEvents, dayKey);
      } else {
        targetEvents = getDayEventsWithOverrides(dayKey, customOverrides);
      }

      headline = dayData.focus;
      summary = `Schedule for ${matchedHorizonDay ? matchedHorizonDay.dateStr : dayData.dateStr} featuring ${targetEvents.length} staged events.`;
      dateStr = matchedHorizonDay ? `${matchedHorizonDay.weekdayLong}, ${matchedHorizonDay.monthShort} ${matchedHorizonDay.dayNum}` : dayData.dateStr;
      spokenScript = dayData.spokenAudioScript;
      actionsWade = dayData.actionsForWade;
      actionsElsbeth = dayData.actionsForElsbeth;
      clinicalSynergy = dayData.clinicalMedicationSynergy;
      weather = dayData.weather;
    }

    setActiveEvents(targetEvents);
    setCurrentBriefing({
      headline,
      summary,
      dateFormatted: dateStr,
      spokenAudioScript: spokenScript,
      keyReminders: actionsWade,
      fatigueForecast: {
        morning: 'Low' as any,
        afternoon: dayKey === 'mon' || dayKey === 'fri' ? 'Moderate' : 'Low' as any,
        evening: 'Low' as any,
        clinicalReasoning: 'Calibrated based on scheduled travel and therapy activities.'
      },
      caregiverCoordination: {
        actionsForWade: actionsWade,
        actionsForCaregiver: actionsElsbeth,
        clinicalMedicationSynergy: clinicalSynergy
      },
      events: targetEvents
    });
  };

  // Open Edit Event Modal
  const handleOpenEditEvent = (evt: CalendarEvent) => {
    setEditingEvent(evt);
    setEditForm({ ...evt });
  };

  const handleCloseEditModal = () => {
    setEditingEvent(null);
    setEditForm({});
  };

  const handleSaveEditEvent = () => {
    if (!editingEvent) return;
    const updated: CalendarEvent = {
      ...editingEvent,
      ...editForm
    };

    const newOverrides = {
      ...customOverrides,
      [editingEvent.id]: updated
    };

    setCustomOverrides(newOverrides);
    try {
      localStorage.setItem('parkinsons_calendar_custom_overrides', JSON.stringify(newOverrides));
    } catch (e) {
      console.error('Failed to persist override to localStorage', e);
    }

    setActiveEvents(prev => prev.map(e => e.id === editingEvent.id ? updated : e));
    handleCloseEditModal();
    setLiveSyncMessage(`Saved custom tags and transit settings for "${updated.title}".`);
  };

  const handleResetEventToDefault = (eventId: string) => {
    const newOverrides = { ...customOverrides };
    delete newOverrides[eventId];
    setCustomOverrides(newOverrides);
    try {
      localStorage.setItem('parkinsons_calendar_custom_overrides', JSON.stringify(newOverrides));
    } catch (e) {
      console.error(e);
    }
    const freshEvents = getDayEventsWithOverrides(selectedDayKey, newOverrides);
    setActiveEvents(freshEvents);
    handleCloseEditModal();
    setLiveSyncMessage('Reset event to default clinical schedule.');
  };

  const activeHorizonDay = next7Days.find(d => d.key === selectedDayKey);
  const currentDayData = WEEK_SCHEDULE_DATA[selectedDayKey] || WEEK_SCHEDULE_DATA['sat'];

  return (
    <div id="calendar-schedule-view" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all space-y-0">
      
      {/* -------------------------------------------------------------
          1. CALM TOP BAR: Clean Heading, Google Status & Sync
      -------------------------------------------------------------- */}
      <div className="bg-slate-50/80 border-b border-slate-200/80 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
                Calendar
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                This Week
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Weekly Parkinson's care agenda synchronized with Google Calendar and automated mobility buffers.
            </p>
          </div>

          {/* Google Calendar Connection & Refresh Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {googleUser ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-emerald-900 font-semibold max-w-[150px] truncate" title={googleUser.email || ''}>
                  {googleUser.email}
                </span>
                <button
                  type="button"
                  id="btn-fetch-live-google-cal"
                  onClick={() => handleFetchLiveCalendar()}
                  disabled={isSyncingLiveCalendar}
                  className="p-1 text-emerald-700 hover:text-emerald-950 cursor-pointer"
                  title="Pull latest events from Google Calendar"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLiveCalendar ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  id="btn-disconnect-google-cal"
                  onClick={handleDisconnectGoogleCalendar}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-medium ml-1 cursor-pointer"
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
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
                title="Connect your personal Google Calendar as live source of truth"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-3.5 h-3.5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>{isSyncingLiveCalendar ? 'Connecting...' : 'Connect Google Calendar'}</span>
              </button>
            )}

            <button
              type="button"
              id="btn-refresh-calendar-briefing"
              onClick={handleManualSync}
              disabled={isGeneratingDayAi || isRefreshing || isSyncingLiveCalendar || isLocalSyncing}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingDayAi || isRefreshing || isSyncingLiveCalendar || isLocalSyncing ? 'animate-spin' : ''}`} />
              <span>{isGeneratingDayAi || isRefreshing || isLocalSyncing ? 'Syncing...' : 'Sync Week'}</span>
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {liveSyncMessage && (
          <div className="mt-3 p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 text-xs text-indigo-900 font-medium flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{liveSyncMessage}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setLiveSyncMessage(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          2. CLEAR 7-DAY SELECTOR: Explicit Days of the Week
      -------------------------------------------------------------- */}
      <div className="p-4 sm:p-6 bg-slate-50/40 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            This Week's Horizon
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {selectedDayKey === 'all_week' ? 'Showing All 7 Days' : `Active: ${activeHorizonDay ? activeHorizonDay.weekdayLong : currentDayData.dayLabel}`}
          </span>
        </div>

        {/* Responsive Horizontal Strip of Clear Day Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {next7Days.map((day) => {
            const isActive = selectedDayKey === day.key;
            return (
              <button
                key={day.key}
                type="button"
                id={`btn-select-day-${day.key}`}
                onClick={() => handleSelectDay(day.key)}
                className={`p-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold ring-2 ring-indigo-500/30'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 font-medium hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-extrabold uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {day.weekdayLong.slice(0, 3)}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isActive 
                      ? 'bg-amber-400 text-slate-950' 
                      : day.badge === 'Today' 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-slate-100 text-slate-600'
                  }`}>
                    {day.badge}
                  </span>
                </div>

                <div>
                  <div className={`text-sm font-bold leading-tight ${isActive ? 'text-indigo-200' : 'text-slate-900'}`}>
                    {day.monthShort} {day.dayNum}
                  </div>
                  <div className={`text-[10px] truncate mt-0.5 font-medium ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                    {day.focus}
                  </div>
                </div>
              </button>
            );
          })}

          {/* All Week Tab */}
          <button
            type="button"
            id="btn-select-day-all_week"
            onClick={() => handleSelectDay('all_week')}
            className={`p-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between gap-1.5 ${
              selectedDayKey === 'all_week'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold ring-2 ring-indigo-500/30'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 font-medium hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-xs font-extrabold uppercase ${selectedDayKey === 'all_week' ? 'text-white' : 'text-slate-900'}`}>
                ALL
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                selectedDayKey === 'all_week' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
              }`}>
                7 Days
              </span>
            </div>
            <div>
              <div className={`text-sm font-bold leading-tight ${selectedDayKey === 'all_week' ? 'text-indigo-200' : 'text-slate-900'}`}>
                Full Week
              </div>
              <div className={`text-[10px] truncate mt-0.5 font-medium ${selectedDayKey === 'all_week' ? 'text-slate-300' : 'text-slate-500'}`}>
                All Staged Events
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          3. ACTIVE DAY SUMMARY BAR & SOOTHING AUDIO BRIEFING
      -------------------------------------------------------------- */}
      <div className="p-4 sm:p-6 space-y-4">
        
        {/* Day Header with View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedDayKey === 'all_week' 
                  ? "This Week's Schedule" 
                  : activeHorizonDay 
                    ? `${activeHorizonDay.weekdayLong}, ${activeHorizonDay.monthShort} ${activeHorizonDay.dayNum}` 
                    : currentDayData.dateStr}
              </h3>
              {selectedDayKey !== 'all_week' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {currentDayData.focus}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {currentDayData.weather} • {activeEvents.length} scheduled {activeEvents.length === 1 ? 'event' : 'events'}
            </p>
          </div>

          {/* Simple View Switcher: Events Timeline vs Care Checklist */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              id="view-mode-timeline"
              onClick={() => setCalendarViewMode('timeline')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                calendarViewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Events ({activeEvents.length})</span>
            </button>
            <button
              type="button"
              id="view-mode-checklist"
              onClick={() => setCalendarViewMode('checklist')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                calendarViewMode === 'checklist'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Care Guidance</span>
            </button>
          </div>
        </div>

        {/* Compact, Soothing Audio Player Bar */}
        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <button
              type="button"
              id="btn-play-spoken-briefing"
              onClick={handleToggleAudio}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs ${
                isPlayingAudio 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              title={isPlayingAudio ? 'Stop Audio' : 'Listen to Spoken Calendar Guidance'}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {isPlayingAudio ? 'Playing Spoken Briefing...' : 'Spoken Audio Guidance'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Voice: {selectedPersona === 'ward-cleaver' ? 'Ward Cleaver (Reassuring Dad)' : selectedPersona === 'dr-evil' ? 'Dr. Evil' : selectedPersona === 'first-mate' ? 'First Mate' : 'Clinical Co-Pilot'}
                </span>
              </div>
              <p className="text-xs text-slate-600 italic line-clamp-2">
                "{currentBriefing.spokenAudioScript || currentDayData.spokenAudioScript}"
              </p>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            4. PRIMARY EVENTS TIMELINE (Zero Clutter, High Readability)
        -------------------------------------------------------------- */}
        {calendarViewMode === 'timeline' && (
          <div className="space-y-3 pt-2">
            {activeEvents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-3">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">No scheduled events for this day.</p>
                  <p className="mt-1 text-slate-500">
                    {isLiveSourceActive 
                      ? `No personal Google Calendar appointments found for ${activeHorizonDay ? activeHorizonDay.weekdayLong : 'this day'}.` 
                      : 'Enjoy a restful, unhurried day at home.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {isLiveSourceActive && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSelectDay('all_week')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
                      >
                        View All Week's Events ({allLiveEvents.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleSwitchToClinicalSchedule}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
                      >
                        Show Care Protocol Schedule
                      </button>
                      <a
                        href="https://calendar.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <span>Open Google Calendar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                  {!isLiveSourceActive && (
                    <button
                      type="button"
                      onClick={handleConnectGoogleCalendar}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Sync Real Google Calendar</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              activeEvents.map((evt, evtIndex) => {
                const isWadeEvent = !evt.audience || evt.audience === 'Captain Wade';
                const isUber = evt.needsTransit && evt.transitMode && evt.transitMode.includes('Uber');
                const googleCalUrl = evt.htmlLink || `https://calendar.google.com/calendar/r/search?q=${encodeURIComponent(evt.title)}`;

                return (
                  <div
                    key={`${evt.id || 'evt'}-${evt.isoDate || ''}-${evt.startTime}-${evtIndex}`}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all hover:shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      
                      {/* Left: Time & Core Details */}
                      <div className="space-y-1.5 flex-1">
                        
                        {/* Tags Strip */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            {evt.timeFormatted || `${evt.startTime} – ${evt.endTime}`}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            evt.category === 'Physical Therapy' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                            evt.category === 'Clinical / Medical' ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' :
                            evt.category === 'Routine' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {evt.category}
                          </span>

                          {evt.audience && evt.audience !== 'Captain Wade' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                              {evt.audience}
                            </span>
                          )}

                          {isUber && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Car className="w-3 h-3 text-amber-700" />
                              Uber Assist (+{evt.mobilityPrepBufferMinutes || 25}m buffer)
                            </span>
                          )}
                        </div>

                        {/* Event Title */}
                        <h4 className="text-sm sm:text-base font-bold text-slate-900">
                          {evt.title}
                        </h4>

                        {/* Location */}
                        {evt.location && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{evt.location}</span>
                            {evt.address && evt.address !== evt.location && (
                              <span className="text-slate-400 hidden sm:inline">• {evt.address}</span>
                            )}
                          </div>
                        )}

                        {/* 1-Line Description / Guidance */}
                        <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                          {evt.description || evt.actionForCaregiver || evt.wadeImpactNote}
                        </p>

                        {/* Departure Staging Notice if Ride Required */}
                        {isWadeEvent && evt.needsTransit && evt.suggestedDepartureTime && (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-amber-700 shrink-0" />
                              <span className="font-bold">Staged Departure: {evt.suggestedDepartureTime}</span>
                              <span className="text-amber-800 text-[11px]">(Includes +{evt.mobilityPrepBufferMinutes || 25}m unhurried buffer)</span>
                            </div>
                            <a
                              href={`https://m.uber.com/ul/?action=setPickup&client_id=vVS_4V7z_Hm39eMHy91_ETX4ADnyXoBx&pickup[formatted_address]=1200%204th%20St%2C%20San%20Francisco%2C%20CA&dropoff[formatted_address]=${encodeURIComponent(evt.location || '1635 Divisadero St, San Francisco, CA')}&product_id=uber_assist`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
                            >
                              <span>Open in Uber</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-start">
                        <button
                          type="button"
                          onClick={() => handleOpenEditEvent(evt)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Edit event tags and buffer minutes"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>
                        <a
                          href={googleCalUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Open event in Google Calendar"
                        >
                          <Calendar className="w-3 h-3 text-indigo-600" />
                          <span>Google Cal</span>
                          <ExternalLink className="w-2.5 h-2.5 text-indigo-400" />
                        </a>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            5. CARE GUIDANCE & CHECKLIST (Dual Captain Wade & Caregiver)
        -------------------------------------------------------------- */}
        {calendarViewMode === 'checklist' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Captain Wade Action Guidance */}
            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                  W
                </div>
                <h4 className="text-sm font-bold text-amber-950">
                  Actions for Captain Wade
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {(currentBriefing.caregiverCoordination?.actionsForWade || currentDayData.actionsForWade).map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Caregiver Logistics Coordination */}
            <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  E
                </div>
                <h4 className="text-sm font-bold text-indigo-950">
                  Caregiver Logistics (Elsbeth)
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {(currentBriefing.caregiverCoordination?.actionsForCaregiver || currentDayData.actionsForElsbeth).map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>

      {/* -------------------------------------------------------------
          6. MODAL: EDIT EVENT TAGS & PARKINSON'S CARE SETTINGS
      -------------------------------------------------------------- */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900">
                  Edit Event Details & Transit Buffer
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update title, audience tag, and mobility staging parameters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="space-y-4">
              
              {/* Event Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Event Title
                </label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Physical Therapy with Sarah"
                />
              </div>

              {/* Time & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Time Formatted
                  </label>
                  <input
                    type="text"
                    value={editForm.timeFormatted || ''}
                    onChange={(e) => setEditForm({ ...editForm, timeFormatted: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                    placeholder="e.g. 10:30 AM – 11:30 AM"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                    placeholder="e.g. Sutter Health Physical Medicine"
                  />
                </div>
              </div>

              {/* Audience Attribution */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Audience Attribution
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Captain Wade', label: 'Captain Wade' },
                    { id: 'Little Wade', label: 'Little Wade' },
                    { id: 'Elsbeth (Work/LA)', label: 'Elsbeth' },
                    { id: 'Family Shared', label: 'Family' }
                  ].map((aud) => {
                    const isSelected = (editForm.audience || editingEvent.audience) === aud.id;
                    return (
                      <button
                        key={aud.id}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, audience: aud.id as EventAudience })}
                        className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {aud.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transit & Buffer (for Wade) */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950">
                    Requires Uber Assist / Transit?
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.needsTransit)}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      needsTransit: e.target.checked,
                      mobilityPrepBufferMinutes: e.target.checked ? (editForm.mobilityPrepBufferMinutes || 25) : 0,
                      transitMode: e.target.checked ? 'Uber Assist / Ride Required' : 'No Transit (Home/Virtual)'
                    })}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                </div>

                {editForm.needsTransit && (
                  <div className="space-y-2 pt-2 border-t border-amber-200/60">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-amber-950">
                        Mobility Buffer (Minutes)
                      </label>
                      <div className="flex gap-2">
                        {[0, 15, 20, 25, 30].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, mobilityPrepBufferMinutes: mins })}
                            className={`py-1 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              (editForm.mobilityPrepBufferMinutes ?? editingEvent.mobilityPrepBufferMinutes) === mins
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            +{mins}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleResetEventToDefault(editingEvent.id)}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                Reset to Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditEvent}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
