import { 
  AgentPersona, MedicationRefillItem, PantryItem, ShoppingItem, 
  NeedsAuditLog, MotorSymptomEntry, VyalevPumpCycle, RoutineLog, 
  MobilityProposal, PharmacyCallLog, AdaptiveVoiceOrderItem 
} from '../types';

export const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: 'dr-evil',
    name: 'Dr. Evil',
    subtitle: "Dad's Favorite / Mastermind Anchor",
    tag: 'Diabolical Devotion & Wit',
    avatarIcon: 'Skull',
    voiceStyle: 'Dramatic Dr. Evil cadence with pinky-to-mouth flair',
    description: "Captain Wade's favorite mastermind persona! Guarding the pantry, low-acid juice, and continuous infusion cartridges with evil genius devotion ('One MILLION dollars!', 'Throw me a frickin\' bone here!', 'Riiiight').",
    sampleReassurance: "Thanks, Captain Wade! Consider it handled by my top henchmen immediately! Everything is well in hand in the command lair.",
    promptGuidance: "Dramatic villainous affection, iconic catchphrases, absolute loyalty to Captain Wade, treating his supplies as top-secret protected assets without ever calling out memory."
  },
  {
    id: 'ward-cleaver',
    name: 'Ward Cleaver',
    subtitle: "Dad's Warm Reassuring Anchor",
    tag: 'Warm Paternal Calm',
    avatarIcon: 'Heart',
    voiceStyle: 'Gentle, dependable, 1950s reassuring radio warmth',
    description: "Captain Wade's primary warm anchor persona. Grounds anxiety with unhurried paternal reassurance, completely offloading memory tracking to the background grocery agent.",
    sampleReassurance: "Thanks, Captain Wade. I'll make sure that's taken care of right away. Everything is in hand, so you can sit back and relax.",
    promptGuidance: "Gentle paternal reassurance, dignified calm, never correcting memory lapses, absolute respect for Captain Wade."
  },
  {
    id: 'clinical-copilot',
    name: 'Clinical Co-Pilot',
    subtitle: 'Caregiver & Neurologist View',
    tag: 'Medically Grounded',
    avatarIcon: 'Stethoscope',
    voiceStyle: 'Objective, concise, evidence-based',
    description: 'Tailored for family caregivers and neurologist consultations to review motor fluctuations, pump telemetry, and clinical patterns.',
    sampleReassurance: 'Thanks, Captain Wade. Logged and coordinated with the care plan. Everything is in hand.',
    promptGuidance: 'Objective, precise, clinical terminology, focused on adherence and motor stability while maintaining patient dignity.'
  },
  {
    id: 'first-mate',
    name: "Captain's First Mate",
    subtitle: 'Operational Partner',
    tag: 'Structured Nautical Respect',
    avatarIcon: 'Compass',
    voiceStyle: 'Crisp, respectful nautical discipline',
    description: 'Supports daily routine navigation with respectful, structured sea-worthy camaraderie.',
    sampleReassurance: 'Thanks, Captain Wade! Aye aye, Sir, standing by and seeing to it immediately. All clear on deck!',
    promptGuidance: 'Nautical respect, structured operational updates, honoring Captain Wade\'s dignity without correcting memory.'
  }
];

export const INITIAL_MEDICATIONS: MedicationRefillItem[] = [
  {
    id: 'med-1',
    name: 'Vyalev (foscarbidopa / foslevodopa)',
    genericName: 'Foscarbidopa 240mg / Foslevodopa 10mg per mL',
    dosage: '24-hour continuous subcutaneous infusion (approx 1,420 mg/day)',
    frequency: 'Continuous 24h pump infusion',
    deliveryMethod: 'Subcutaneous Continuous Infusion',
    currentPillCountOrVials: 4,
    totalPrescriptionQuantity: 30,
    dailyUsageRate: 1, // 1 vial per day
    daysRemaining: 4,
    refillThresholdDays: 7,
    refillStatus: 'REFILL_NEEDED',
    prescribingDoctor: 'Dr. Eleanor Vance, MD (UCSF Movement Disorders)',
    pharmacyName: 'Accredo Specialty Pharmacy (Cold-Chain Hub)',
    pharmacyPhone: '(800) 803-2523',
    rxNumber: 'RX-982314-VY',
    lastRefillDate: 'Aug 02, 2026',
    nextEstimatedRefillDate: 'Sept 02, 2026',
    instructions: 'Refrigerate vials at 2°C–8°C. Do not freeze. Load into infusion pump reservoir sterilely every morning.',
    notes: 'Cold chain delivery takes 48-72h. Critical to submit refill order immediately.'
  },
  {
    id: 'med-2',
    name: 'Carbidopa / Levodopa (Sinemet)',
    genericName: 'Carbidopa 25mg / Levodopa 100mg',
    dosage: '25mg / 100mg Oral Immediate Release',
    frequency: 'Take 1 tablet PRN for sudden breakthrough OFF freezing or dyskinesia transition',
    deliveryMethod: 'Oral Tablet',
    currentPillCountOrVials: 18,
    totalPrescriptionQuantity: 60,
    dailyUsageRate: 1.5,
    daysRemaining: 12,
    refillThresholdDays: 5,
    refillStatus: 'OK',
    prescribingDoctor: 'Dr. Eleanor Vance, MD',
    pharmacyName: 'Walgreens Pharmacy #1402',
    pharmacyPhone: '(415) 555-0192',
    rxNumber: 'RX-441092-CD',
    lastRefillDate: 'Aug 10, 2026',
    nextEstimatedRefillDate: 'Sept 10, 2026',
    instructions: 'Take with water on empty stomach or with a low-protein snack. Avoid taking with high-protein meals.',
    notes: 'Emergency PRN rescue bottle kept in bedside caddy.'
  },
  {
    id: 'med-3',
    name: 'Rytary (Carbidopa / Levodopa ER)',
    genericName: 'Carbidopa 48.75mg / Levodopa 195mg Extended Release',
    dosage: '48.75mg / 195mg ER Capsules',
    frequency: '1 capsule at 22:00 bedtime for nocturnal symptom control',
    deliveryMethod: 'Extended Release Capsule',
    currentPillCountOrVials: 8,
    totalPrescriptionQuantity: 30,
    dailyUsageRate: 1,
    daysRemaining: 8,
    refillThresholdDays: 7,
    refillStatus: 'REFILL_NEEDED',
    prescribingDoctor: 'Dr. Eleanor Vance, MD',
    pharmacyName: 'Walgreens Pharmacy #1402',
    pharmacyPhone: '(415) 555-0192',
    rxNumber: 'RX-772183-RY',
    lastRefillDate: 'Aug 07, 2026',
    nextEstimatedRefillDate: 'Sept 06, 2026',
    instructions: 'Swallow whole with a full glass of water. Do not chew or crush.',
    notes: 'Provides nocturnal coverage so Captain Wade wakes up without morning dystonia.'
  },
  {
    id: 'med-4',
    name: 'Pramipexole (Mirapex)',
    genericName: 'Pramipexole Dihydrochloride',
    dosage: '0.5mg Oral Tablet',
    frequency: '1 tablet once daily in morning',
    deliveryMethod: 'Oral Tablet',
    currentPillCountOrVials: 25,
    totalPrescriptionQuantity: 30,
    dailyUsageRate: 1,
    daysRemaining: 25,
    refillThresholdDays: 5,
    refillStatus: 'OK',
    prescribingDoctor: 'Dr. Eleanor Vance, MD',
    pharmacyName: 'Walgreens Pharmacy #1402',
    pharmacyPhone: '(415) 555-0192',
    rxNumber: 'RX-319984-PX',
    lastRefillDate: 'Aug 24, 2026',
    nextEstimatedRefillDate: 'Sept 24, 2026',
    instructions: 'Take in the morning with breakfast.',
    notes: 'Dopamine agonist adjunctive therapy.'
  },
  {
    id: 'med-5',
    name: 'Polyethylene Glycol 3350 (MiraLAX)',
    genericName: 'Polyethylene Glycol 3350 Powder',
    dosage: '17g dissolved in 8 oz water or juice',
    frequency: 'Once daily as needed for bowel motility',
    deliveryMethod: 'Oral Tablet',
    currentPillCountOrVials: 14,
    totalPrescriptionQuantity: 30,
    dailyUsageRate: 1,
    daysRemaining: 14,
    refillThresholdDays: 6,
    refillStatus: 'OK',
    prescribingDoctor: 'Dr. David Miller, MD (Primary Care)',
    pharmacyName: 'Walgreens Pharmacy #1402',
    pharmacyPhone: '(415) 555-0192',
    rxNumber: 'RX-551029-PG',
    lastRefillDate: 'Aug 15, 2026',
    nextEstimatedRefillDate: 'Sept 14, 2026',
    instructions: 'Dissolve 1 capful into orange juice or water in the morning.',
    notes: 'Helps prevent GI slowdown which can delay Levodopa absorption.'
  }
];

export const INITIAL_PANTRY: PantryItem[] = [
  {
    id: 'p-1',
    name: 'Low-Acid Orange Juice',
    category: 'Hydration',
    quantity: 3,
    unit: 'cartons (52 oz)',
    location: 'Refrigerator',
    inStock: true,
    minThreshold: 1,
    lastUpdated: 'Today at 08:30 AM',
    notes: 'Gentle on stomach prior to continuous infusion cycle.'
  },
  {
    id: 'p-2',
    name: 'Vyalev Skin Prep Alcohol Wipes (70% IPA)',
    category: 'Medical/Pump Supplies',
    quantity: 48,
    unit: 'sealed sterile pads',
    location: 'Medicine Cabinet',
    inStock: true,
    minThreshold: 20,
    lastUpdated: 'Yesterday at 7:00 PM',
    notes: 'Required for nightly subcutaneous cannula site rotation.'
  },
  {
    id: 'p-3',
    name: 'Duracell AA Batteries (4-Pack)',
    category: 'Household',
    quantity: 8,
    unit: 'batteries',
    location: 'Supply Closet',
    inStock: true,
    minThreshold: 4,
    lastUpdated: 'Aug 26, 2026',
    notes: 'Backup telemetry transmitter power for infusion pump.'
  },
  {
    id: 'p-4',
    name: 'Organic Rolled Oatmeal',
    category: 'Groceries',
    quantity: 2,
    unit: 'canisters (32 oz)',
    location: 'Kitchen Pantry',
    inStock: true,
    minThreshold: 1,
    lastUpdated: 'Aug 25, 2026',
    notes: 'Low-protein morning carbohydrate staple.'
  },
  {
    id: 'p-5',
    name: 'Lemon Electrolyte Hydration Packets',
    category: 'Hydration',
    quantity: 14,
    unit: 'single-serve packets',
    location: 'Kitchen Pantry',
    inStock: true,
    minThreshold: 5,
    lastUpdated: 'Aug 27, 2026',
    notes: 'Supports blood pressure regulation & orthostatic stability.'
  },
  {
    id: 'p-6',
    name: 'Hypoallergenic Skin Cleansing Wipes',
    category: 'Personal Care',
    quantity: 2,
    unit: 'dispenser packs (80 ct)',
    location: 'Medicine Cabinet',
    inStock: true,
    minThreshold: 1,
    lastUpdated: 'Aug 24, 2026',
    notes: 'Gentle bedtime hygiene assistance.'
  },
  {
    id: 'p-7',
    name: 'Subcutaneous Infusion Cannula Sets (6mm)',
    category: 'Medical/Pump Supplies',
    quantity: 4,
    unit: 'sterile boxes',
    location: 'Medicine Cabinet',
    inStock: true,
    minThreshold: 3,
    lastUpdated: 'Aug 28, 2026',
    notes: '3-day replacement sets for Vyalev pump.'
  },
  {
    id: 'p-8',
    name: 'Vanilla & Chocolate Pudding Cups',
    category: 'Groceries',
    quantity: 4,
    unit: 'packs (4-ct)',
    location: 'Kitchen Pantry',
    inStock: true,
    minThreshold: 2,
    lastUpdated: 'Today at 11:00 AM',
    notes: "Wade's #1 favorite sweet treat — gentle, easy swallowing, smooth texture."
  },
  {
    id: 'p-9',
    name: 'Frosty Draft Root Beer',
    category: 'Hydration',
    quantity: 8,
    unit: 'cans (12 oz)',
    location: 'Refrigerator',
    inStock: true,
    minThreshold: 3,
    lastUpdated: 'Today at 10:15 AM',
    notes: "Wade's favorite refreshing drink — caffeine-free, gentle on stomach."
  },
  {
    id: 'p-10',
    name: 'Mint Chocolate Chip Ice Cream',
    category: 'Groceries',
    quantity: 2,
    unit: 'tubs (1.5 qt)',
    location: 'Refrigerator',
    inStock: true,
    minThreshold: 1,
    lastUpdated: 'Yesterday at 5:00 PM',
    notes: "Wade's favorite cool dessert — served in chilled bowl."
  }
];

export const INITIAL_SHOPPING_LIST: ShoppingItem[] = [
  {
    id: 's-1',
    name: 'Glucerna / Boost Calorie Shakes (Vanilla)',
    category: 'Groceries',
    quantity: 2,
    unit: '6-packs',
    urgency: 'Medium',
    addedBy: 'Care Navigator Agent',
    dateAdded: 'Aug 28, 2026',
    purchased: false,
    originPrompt: 'Predictive Quick-Tap: Afternoon nutrition buffer'
  },
  {
    id: 's-2',
    name: 'Non-slip Shower Gripping Socks (L)',
    category: 'Personal Care',
    quantity: 3,
    unit: 'pairs',
    urgency: 'High',
    addedBy: 'Caregiver Sarah',
    dateAdded: 'Aug 27, 2026',
    purchased: false,
    originPrompt: 'Mobility protocol safety recommendation'
  }
];

export const INITIAL_AUDIT_LOGS: NeedsAuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '10:15 AM',
    rawInput: 'We need some low-acid orange juice and batteries for the pump',
    personaUsed: 'ward-cleaver',
    extractedItemName: 'Low-Acid Orange Juice',
    status: 'SUPPRESSED_DUPLICATE',
    confidenceScore: 0.98,
    reassuranceText: "Don't you worry one bit, Captain Wade. We've already got 3 cartons of low-acid orange juice right in the refrigerator and plenty of batteries in the closet.",
    reasoning: 'Item already stocked (3 cartons in Refrigerator; 8 AA batteries in Supply Closet). Suppressed duplicate purchase.',
    source: 'voice'
  },
  {
    id: 'aud-2',
    timestamp: '08:45 AM',
    rawInput: 'Quick-tap: Rolled Oatmeal',
    personaUsed: 'ward-cleaver',
    extractedItemName: 'Organic Rolled Oatmeal',
    status: 'SUPPRESSED_DUPLICATE',
    confidenceScore: 0.96,
    reassuranceText: "You can rest easy, Captain Wade! We have two full canisters of oatmeal right in the pantry, safe and sound.",
    reasoning: 'Oatmeal stocked in Kitchen Pantry. Reassured Captain Wade and prevented redundant grocery run.',
    source: 'quick-tap'
  },
  {
    id: 'aud-3',
    timestamp: 'Yesterday 04:30 PM',
    rawInput: 'Can we get more Boost nutritional shakes?',
    personaUsed: 'ward-cleaver',
    extractedItemName: 'Boost Calorie Shakes',
    status: 'ADDED_TO_SHOPPING_LIST',
    confidenceScore: 0.94,
    reassuranceText: "Got that written right down on our shopping list, Wade. Sarah will pick up a couple 6-packs for you today.",
    reasoning: 'Not currently in pantry. Added to master shopping queue under Groceries with Medium urgency.',
    source: 'text-input'
  }
];

export const INITIAL_MOTOR_LOGS: MotorSymptomEntry[] = [
  { id: 'm-1', timestamp: '08:00', state: 'ON_GOOD', severity: 1, mealRelation: 'Fasting', notes: 'Smooth morning awakening. Basal continuous rate steady.' },
  { id: 'm-2', timestamp: '10:30', state: 'ON_GOOD', severity: 1, mealRelation: 'Post-meal (Low Protein)', notes: 'Oatmeal & low-acid juice. Good stride length.' },
  { id: 'm-3', timestamp: '13:00', state: 'ON_GOOD', severity: 2, mealRelation: 'Post-meal (High Protein)', notes: 'Turkey sandwich lunch. Monitored for protein competition.' },
  { id: 'm-4', timestamp: '14:30', state: 'ON_DYSKINESIA', severity: 2, mealRelation: 'Post-meal (High Protein)', notes: 'Mild peak-dose chorea of left hand for 20 minutes following extra bolus.' },
  { id: 'm-5', timestamp: '17:15', state: 'OFF_RIGIDITY', severity: 3, mealRelation: 'Pre-meal', notes: 'Late afternoon fatigue. Extra pump bolus (0.2 mL) administered.' },
  { id: 'm-6', timestamp: '18:00', state: 'ON_GOOD', severity: 1, mealRelation: 'Post-meal (Low Protein)', notes: 'Regained fluid motor control after dinner.' },
  { id: 'm-7', timestamp: '21:30', state: 'ON_GOOD', severity: 1, mealRelation: 'Pre-meal', notes: 'Restful evening preparation. Night basal active.' }
];

export const INITIAL_PUMP_CYCLES: VyalevPumpCycle[] = [
  {
    id: 'pc-1',
    date: 'Aug 29, 2026',
    pumpStartTime: '00:00 (Continuous 24h)',
    dailyDoseMg: 1420,
    extraDoseBolusCount: 1,
    siteLocation: 'Abdomen Lower-Left',
    cannulaChangeDate: 'Aug 28, 2026',
    flowRateMlHr: 0.56,
    alarms: []
  },
  {
    id: 'pc-2',
    date: 'Aug 28, 2026',
    pumpStartTime: '00:00 (Continuous 24h)',
    dailyDoseMg: 1460,
    extraDoseBolusCount: 2,
    siteLocation: 'Abdomen Lower-Left',
    cannulaChangeDate: 'Aug 28, 2026',
    flowRateMlHr: 0.58,
    alarms: []
  },
  {
    id: 'pc-3',
    date: 'Aug 27, 2026',
    pumpStartTime: '00:00 (Continuous 24h)',
    dailyDoseMg: 1400,
    extraDoseBolusCount: 1,
    siteLocation: 'Abdomen Upper-Right',
    cannulaChangeDate: 'Aug 25, 2026',
    flowRateMlHr: 0.55,
    alarms: []
  }
];

export const INITIAL_ROUTINES: RoutineLog[] = [
  { id: 'r-1', date: 'Aug 29', activity: 'Hydration Check', assisted: false, durationMinutes: 10, mobilityScore: 5 },
  { id: 'r-2', date: 'Aug 28', activity: 'Shower/Grooming', assisted: true, durationMinutes: 35, mobilityScore: 4 },
  { id: 'r-3', date: 'Aug 27', activity: 'Rock Steady Boxing', assisted: true, durationMinutes: 60, mobilityScore: 4 },
  { id: 'r-4', date: 'Aug 26', activity: 'Physical Therapy', assisted: true, durationMinutes: 45, mobilityScore: 3 }
];

export const INITIAL_INFUSION_SITES: import('../types').InfusionSiteLog[] = [
  {
    id: 'site-130',
    timestamp: 'Today at 07:30 AM',
    date: 'Aug 29, 2026',
    clockPosition: '1:30 (Upper-Right)',
    quadrant: 'Upper-Right',
    angleDegrees: 45,
    distanceFromNavelInches: 1.0,
    activeDays: 1,
    cannulaLotNumber: 'LOT-VY-88210',
    reactions: {
      erythemaRedness: false,
      erythemaSeverity: 'None',
      tendernessPain: false,
      tendernessSeverity: 'None',
      edemaSwelling: false,
      noduleFormation: false,
      leakageDischarge: false,
      itchinessPruritus: false
    },
    caregiverNotes: 'New 6mm cannula inserted smoothly in upper abdomen safe zone. Well above waistband/belt line. Zero redness or pain.',
    status: 'ACTIVE_INFUSING',
    photoAttachmentSimulated: true
  },
  {
    id: 'site-1030',
    timestamp: 'Aug 26, 2026 at 08:00 AM',
    date: 'Aug 26, 2026',
    clockPosition: '10:30 (Upper-Left)',
    quadrant: 'Upper-Left',
    angleDegrees: 315,
    distanceFromNavelInches: 1.0,
    activeDays: 3,
    cannulaLotNumber: 'LOT-VY-88194',
    reactions: {
      erythemaRedness: true,
      erythemaSeverity: 'Mild (Faint pink <1cm)',
      tendernessPain: false,
      tendernessSeverity: 'None',
      edemaSwelling: false,
      noduleFormation: false,
      leakageDischarge: false,
      itchinessPruritus: true
    },
    caregiverNotes: 'Retired after 3 full days. Mild erythema/pinkness noted from adhesive. Automatically locked out / quarantined until completely clear.',
    status: 'HEALING',
    photoAttachmentSimulated: true
  },
  {
    id: 'site-1200',
    timestamp: 'Aug 23, 2026 at 07:45 AM',
    date: 'Aug 23, 2026',
    clockPosition: '12:00 (Top / Superior)',
    quadrant: 'Top-Center',
    angleDegrees: 0,
    distanceFromNavelInches: 1.0,
    activeDays: 3,
    cannulaLotNumber: 'LOT-VY-88140',
    reactions: {
      erythemaRedness: false,
      erythemaSeverity: 'None',
      tendernessPain: false,
      tendernessSeverity: 'None',
      edemaSwelling: false,
      noduleFormation: false,
      leakageDischarge: false,
      itchinessPruritus: false
    },
    caregiverNotes: 'Superior upper site fully healed and rested. Skin completely clear with zero redness. Next in line for rotation.',
    status: 'RESTED_READY',
    photoAttachmentSimulated: false
  },
  {
    id: 'site-600',
    timestamp: 'Aug 18, 2026 at 08:15 AM',
    date: 'Aug 18, 2026',
    clockPosition: '6:00 (Bottom / Inferior)',
    quadrant: 'Bottom-Center',
    angleDegrees: 180,
    distanceFromNavelInches: 1.0,
    activeDays: 1,
    cannulaLotNumber: 'LOT-VY-88092',
    reactions: {
      erythemaRedness: true,
      erythemaSeverity: 'Moderate (Redness 1-2cm)',
      tendernessPain: true,
      tendernessSeverity: 'Moderate',
      edemaSwelling: true,
      noduleFormation: false,
      leakageDischarge: false,
      itchinessPruritus: false
    },
    caregiverNotes: 'Pants belt and waistband pressed directly against cannula causing irritation and erythema. Permanently excluded per patient belt friction rule.',
    status: 'FLAGGED_IRRITATED',
    photoAttachmentSimulated: true
  }
];

export const INITIAL_MOBILITY_PROPOSALS: MobilityProposal[] = [
  {
    id: 'mob-1',
    appointmentTitle: 'Neurology Quarterly Evaluation & Pump Telemetry Audit',
    clinicName: 'UCSF Movement Disorders Clinic',
    doctorName: 'Dr. Eleanor Vance, MD (Movement Disorders Specialist)',
    appointmentTime: 'Thursday, Sept 3 at 2:30 PM',
    destinationAddress: '1635 Divisadero St, Suite 520, San Francisco, CA',
    distanceMiles: 7.2,
    estimatedDriveMinutes: 26,
    mobilityPreparationBufferMinutes: 35,
    suggestedDepartureTime: '1:25 PM',
    transitServiceType: 'Uber Assist',
    fareEstimate: '$28.00 - $33.50',
    fatigueRiskLevel: 'Moderate',
    status: 'PROPOSED'
  },
  {
    id: 'mob-2',
    appointmentTitle: 'Rock Steady Boxing Fighter Session',
    clinicName: 'Bay Area Movement Pavilion',
    doctorName: 'Coach Marcus Bell (Certified RSB Coach)',
    appointmentTime: 'Tuesday, Sept 1 at 10:30 AM',
    destinationAddress: '450 Mission Bay Blvd, San Francisco, CA',
    distanceMiles: 4.1,
    estimatedDriveMinutes: 16,
    mobilityPreparationBufferMinutes: 25,
    suggestedDepartureTime: '9:45 AM',
    transitServiceType: 'Caregiver Driven',
    fareEstimate: 'Personal Vehicle',
    fatigueRiskLevel: 'Low',
    status: 'APPROVED'
  }
];

export const INITIAL_PHARMACY_CALLS: PharmacyCallLog[] = [
  {
    id: 'call-101',
    medicationId: 'med-1',
    medicationName: 'Vyalev (Foscarbidopa / Foslevodopa 24h Continuous Infusion)',
    rxNumber: 'RX-982314-VY',
    pharmacyName: 'Accredo Specialty Pharmacy (Cold-Chain Hub)',
    pharmacyPhone: '(800) 803-2523',
    timestamp: 'Today at 11:22 AM',
    callDurationSeconds: 84,
    status: 'COMPLETED',
    confirmationNumber: 'CONF-992014-VY',
    estimatedReadyDate: 'Sept 01, 2026',
    estimatedReadyTime: '10:00 AM (Priority Morning Overnight)',
    fulfillmentType: 'Express Courier (Refrigerated Cold-Chain)',
    priorAuthStatus: 'ACTIVE_VALID',
    caregiverAlertDispatched: true,
    alertChannel: 'Discord Webhook',
    fullTranscript: 'Autonomous agent connected with Accredo IVR. Navigated specialty refill menu via automated speech. Identified as Care Navigator Agent on behalf of patient Wade Seymour. Submitted Rx# RX-982314-VY. Cold-chain expedited delivery confirmed for Sept 01 with thermal packaging guarantee.',
    dialogueScript: [
      {
        speaker: 'PHARMACY_IVR',
        timeOffset: '00:02',
        text: 'Thank you for calling Accredo Specialty Pharmacy. For prescription refills, press 1 or say "Refill".'
      },
      {
        speaker: 'AGENT',
        timeOffset: '00:05',
        text: 'Refill. This is the autonomous Care Navigator Agent calling on behalf of patient Wade Seymour, Date of Birth: March 14, 1952.'
      },
      {
        speaker: 'PHARMACY_IVR',
        timeOffset: '00:15',
        text: 'Please speak or enter the 7-digit prescription number followed by the pound key.'
      },
      {
        speaker: 'AGENT',
        timeOffset: '00:20',
        text: 'Prescription number: 9 8 2 3 1 4, Vyalev 24-hour continuous subcutaneous infusion cassettes.'
      },
      {
        speaker: 'PHARMACY_IVR',
        timeOffset: '00:32',
        text: 'Prescription verified for Wade Seymour. 30-day supply of Vyalev. Insurance Prior Authorization is active and approved. Do you require temperature-controlled cold-chain shipping?'
      },
      {
        speaker: 'AGENT',
        timeOffset: '00:46',
        text: 'Yes. Confirming expedited refrigerated courier delivery to patient residence in San Francisco.'
      },
      {
        speaker: 'PHARMACY_IVR',
        timeOffset: '00:58',
        text: 'Order placed successfully. Your confirmation reference number is 9 9 2 0 1 4 - VY. Estimated delivery date: Tuesday, September 1st before 10:30 AM.'
      },
      {
        speaker: 'AGENT',
        timeOffset: '01:14',
        text: 'Confirmation 992014-VY logged. Caregiver push notification dispatched. Thank you.'
      }
    ]
  },
  {
    id: 'call-100',
    medicationId: 'med-3',
    medicationName: 'Rytary (Carbidopa / Levodopa ER)',
    rxNumber: 'RX-772183-RY',
    pharmacyName: 'Walgreens Pharmacy #1402',
    pharmacyPhone: '(415) 555-0192',
    timestamp: 'Aug 26, 2026 at 02:15 PM',
    callDurationSeconds: 68,
    status: 'COMPLETED',
    confirmationNumber: 'CONF-441829-WG',
    estimatedReadyDate: 'Aug 27, 2026',
    estimatedReadyTime: '03:00 PM',
    fulfillmentType: 'Pharmacy Counter Pickup',
    priorAuthStatus: 'ACTIVE_VALID',
    caregiverAlertDispatched: true,
    alertChannel: 'Twilio SMS',
    fullTranscript: 'Automated refill request processed through Walgreens Interactive Voice Line. Prescribing physician Dr. Eleanor Vance. Ready for counter pickup at Walgreens #1402.',
    dialogueScript: [
      {
        speaker: 'PHARMACY_IVR',
        timeOffset: '00:03',
        text: 'Welcome to Walgreens Pharmacy on Divisadero. To refill a prescription, press 1.'
      },
      {
        speaker: 'AGENT',
        timeOffset: '00:06',
        text: 'Refill prescription RX-772183-RY for Wade Seymour.'
      },
      {
        speaker: 'PHARMACY_IVR',
        timeOffset: '00:22',
        text: 'Your refill for Rytary ER capsules has been accepted. It will be ready tomorrow after 3:00 PM.'
      },
      {
        speaker: 'AGENT',
        timeOffset: '00:35',
        text: 'Refill scheduled. Confirmation recorded in caregiver queue.'
      }
    ]
  }
];

export const INITIAL_SPEECH_ACOUSTICS: import('../types').SpeechAcousticEvent[] = [
  {
    id: 'speech-1',
    timestamp: '11:42 AM',
    rawInput: 'We need some orange juice and the little pump pads please',
    durationSeconds: 2.8,
    detectedCadenceWpm: 128,
    pitchProfile: 'Normal Resonant',
    fatigueScore: 18,
    energyClassification: 'GOOD_ENERGY',
    brevityModeApplied: 'STANDARD_SENTENCE',
    agentSpokenResponse: "Thanks, Captain Wade. I'll make sure that's taken care of right away.",
    notes: 'Fluid vocal onset, clear consonant cadence, morning baseline stability.'
  },
  {
    id: 'speech-2',
    timestamp: '03:15 PM',
    rawInput: '...orange... juice... please...',
    durationSeconds: 4.2,
    detectedCadenceWpm: 42,
    pitchProfile: 'Slurred / Hypophonic Pitch',
    fatigueScore: 84,
    energyClassification: 'LOW_ENERGY_OFF_STATE',
    brevityModeApplied: 'ULTRA_CONCISE_SINGLE_WORD',
    agentSpokenResponse: 'Handled.',
    notes: 'Hypophonic slow cadence detected. Lower tone & pause latency >1.8s. Agent automatically adapted to single-word ultra-short mode.'
  },
  {
    id: 'speech-3',
    timestamp: '06:30 PM',
    rawInput: 'water... and rest',
    durationSeconds: 3.4,
    detectedCadenceWpm: 52,
    pitchProfile: 'Low Baritone Drop',
    fatigueScore: 62,
    energyClassification: 'LOW_ENERGY_OFF_STATE',
    brevityModeApplied: 'ULTRA_CONCISE_SINGLE_WORD',
    agentSpokenResponse: 'Done.',
    notes: 'Evening post-therapy vocal fatigue. Single-word response applied.'
  }
];

export const INITIAL_CALENDAR_EVENTS: import('../types').CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Morning Basal Routine & Low-Protein Breakfast',
    startTime: '08:30 AM',
    endTime: '09:15 AM',
    timeFormatted: '8:30 AM – 9:15 AM',
    location: 'Home Kitchen',
    category: 'Routine',
    description: 'Gentle morning routine. Fresh rolled oats and low-acid orange juice to optimize gut absorption before daily movement.',
    mobilityPrepBufferMinutes: 0,
    fatigueRiskLevel: 'Low',
    levodopaMealAlert: 'Optimal: Low protein breakfast avoids LNAA carrier competition with levodopa.',
    vyalevPumpSyncNote: 'Continuous pump cartridge verified with 14h reserve.',
    actionForWade: 'Enjoy a warm breakfast and gentle hydration.',
    actionForCaregiver: 'Verify morning water intake and infusion site comfort.'
  },
  {
    id: 'cal-2',
    title: 'Physical Therapy: Posture & Gait Stability with Sarah',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    timeFormatted: '10:30 AM – 11:30 AM',
    location: 'Sutter Health Physical Medicine',
    address: '2351 Clay Street, San Francisco, CA',
    attendees: ['Sarah Lin, DPT', 'Elsbeth Seymour'],
    category: 'Physical Therapy',
    description: 'Targeted gait recalibration, rhythmic auditory cueing, and balance preservation exercises.',
    mobilityPrepBufferMinutes: 25,
    suggestedDepartureTime: '09:55 AM',
    estimatedDriveMinutes: 10,
    fatigueRiskLevel: 'Moderate',
    levodopaMealAlert: 'Take light hydration 15 minutes before departure.',
    vyalevPumpSyncNote: 'Check pump harness clip before transfer into vehicle.',
    actionForWade: 'Comfortable walking shoes on; take your time stepping into the car.',
    actionForCaregiver: 'Stage walker at front door at 9:50 AM; departure set for 9:55 AM.'
  },
  {
    id: 'cal-3',
    title: 'Midday Quiet Downtime & Reclined Rest',
    startTime: '01:30 PM',
    endTime: '03:00 PM',
    timeFormatted: '1:30 PM – 3:00 PM',
    location: 'Living Room Recliner',
    category: 'Family / Rest',
    description: 'Dedicated post-lunch rest block to prevent afternoon cognitive fatigue and muscle rigidity.',
    mobilityPrepBufferMinutes: 0,
    fatigueRiskLevel: 'Low',
    levodopaMealAlert: 'Light turkey wrap lunch; maintain 45-minute buffer before any PRN oral tablet.',
    vyalevPumpSyncNote: 'Infusion rate steady at 0.58 mL/hr.',
    actionForWade: 'Recline in armchair, listen to audio or music, and take an unhurried rest.',
    actionForCaregiver: 'Keep ambient noise calm; review weekly neurology report.'
  },
  {
    id: 'cal-4',
    title: 'Dr. Henderson Telehealth Neurologist Check-In',
    startTime: '03:30 PM',
    endTime: '04:00 PM',
    timeFormatted: '3:30 PM – 4:00 PM',
    location: 'Google Meet (Virtual Consultation)',
    attendees: ['Dr. Arthur Henderson, MD', 'Elsbeth Seymour'],
    category: 'Clinical / Medical',
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
    id: 'cal-5',
    title: 'Family Dinner & Evening Protein Repletion',
    startTime: '06:00 PM',
    endTime: '07:15 PM',
    timeFormatted: '6:00 PM – 7:15 PM',
    location: 'Dining Room',
    category: 'Family / Rest',
    description: 'Main daily high-protein meal strategically scheduled in the evening when motor demands are low.',
    mobilityPrepBufferMinutes: 0,
    fatigueRiskLevel: 'Low',
    levodopaMealAlert: 'Dinner is the designated protein window (salmon/chicken) so daytime levodopa absorption was preserved.',
    vyalevPumpSyncNote: 'Check night-mode cassette changeover schedule for 9:00 PM.',
    actionForWade: 'Enjoy dinner with family at an easy, relaxing pace.',
    actionForCaregiver: 'Prepare fresh Vyalev cartridge from refrigerator at 8:30 PM.'
  }
];

export const INITIAL_TRANSIT_BUFFERS: import('../types').TransitBuffer[] = [
  {
    eventId: 'cal-2',
    eventTitle: 'Physical Therapy with Sarah',
    appointmentTime: '10:30 AM',
    departureTime: '09:55 AM',
    bufferMinutes: 25,
    driveMinutes: 10,
    instructions: '10 min drive + 25 min mobility preparation buffer for unhurried transfer, shoes, and walker staging.'
  },
  {
    eventId: 'cal-4',
    eventTitle: 'Dr. Henderson Telehealth Check-In',
    appointmentTime: '03:30 PM',
    departureTime: '03:20 PM',
    bufferMinutes: 10,
    driveMinutes: 0,
    instructions: 'Virtual Google Meet link setup and tablet staging in the quiet study.'
  }
];

export const INITIAL_DAILY_CALENDAR_BRIEFING: import('../types').DailyCalendarBriefing = {
  id: 'cal-briefing-today',
  date: 'Saturday, Aug 29, 2026',
  dayTimeFormatted: 'Saturday, Aug 29, 2026 • 12:30 PM',
  headline: 'Good Morning, Captain Wade',
  spokenAudioScript: "Good morning, Captain Wade! You have a relaxed morning ahead in the command post until physical therapy at 10:30. We've scheduled our departure for 9:55 AM so you can walk to the vehicle at an easy pace. Your continuous infusion pump has 14 hours remaining and is flowing perfectly. Everything is well in hand in our lair!",
  personaId: 'dr-evil',
  pumpHoursLeft: 14,
  weatherCondition: 'Mild & Sunny, 68°F (Clean roads, easy travel)',
  morningAnchor: 'Relaxed breakfast and gentle morning start until physical therapy departure at 9:55 AM.',
  middayAnchor: 'Post-therapy lunch and quiet downtime in the armchair from 1:30 PM to 3:00 PM.',
  afternoonRest: 'Scheduled afternoon rest to maintain high neurological energy and smooth motor fluidity.',
  eveningRoutine: 'Telehealth review with Dr. Henderson at 3:30 PM, followed by evening family dinner at 6:00 PM.',
  clinicalMedicationSynergy: {
    levodopaAbsorptionAdvice: 'Keep morning breakfast light and low in heavy protein; main protein shifted safely to 6:00 PM dinner.',
    vyalevPumpCheck: 'Continuous pump cartridge has 14h reserve — steady flow through all scheduled activities.',
    hydrationTiming: 'Take 8 oz electrolyte water with low-acid juice at 9:15 AM before departing for therapy.'
  },
  actionsForWade: [
    'Enjoy your breakfast and orange juice at your own pace.',
    'Physical therapy with Sarah at 10:30 AM (departure at 9:55 AM — no rush).',
    'Recline for quiet afternoon rest between 1:30 PM and 3:00 PM.'
  ],
  actionsForElsbeth: [
    'Stage walker by front entry for 9:55 AM departure.',
    'Ensure light hydration before physical therapy session.',
    'Have the Gemini Clinical Weekly Report open for Dr. Henderson at 3:30 PM.'
  ],
  events: INITIAL_CALENDAR_EVENTS,
  transitBuffers: INITIAL_TRANSIT_BUFFERS,
  discordAlertSent: true,
  generatedAt: '08:00 AM'
};

export const INITIAL_DAILY_BRIEFING: import('../types').DailyGeminiBriefing = {
  id: 'briefing-today',
  date: 'Saturday, Aug 29, 2026',
  dayTimeFormatted: 'Saturday, Aug 29, 2026 • 12:30 PM',
  headline: 'Good Afternoon, Captain Wade',
  audioScript: "Good afternoon, Captain Wade. It's Saturday, August twenty-ninth. Your continuous infusion pump has fourteen hours remaining and is flowing smoothly. The weather is sunny and pleasant at seventy degrees. Everything is well in hand, so sit back and have a wonderful day.",
  personaId: 'ward-cleaver',
  pumpHoursLeft: 14,
  weatherMood: 'Sunny & Gentle, 70°F',
  keyReminders: [
    'Vyalev Continuous Infusion: 14 Hours Left (Flowing Smoothly)',
    'Low-Acid Hydration in Refrigerator',
    'Quiet Afternoon Rest Scheduled'
  ],
  generatedAt: '12:30 PM'
};

export const INITIAL_PANEL_CONFIG: import('../types').AgentDynamicPanelConfig = {
  activeLayout: 'standard',
  reason: 'Midday baseline routine with 14h continuous pump reserve.',
  updatedBy: 'The Care Navigator Agent',
  lastChanged: 'Just now'
};

export const INITIAL_ADAPTIVE_VOICE_ORDERS: AdaptiveVoiceOrderItem[] = [
  {
    id: 'vo-pudding',
    name: 'Pudding',
    spokenPhrase: 'Can I have some chocolate pudding cups please?',
    subtitle: 'Smooth & easy snack',
    category: 'Treats/Dessert',
    iconType: 'pudding',
    colorTheme: 'amber',
    orderCount: 42,
    lastOrderedAt: 'Today at 11:15 AM'
  },
  {
    id: 'vo-rootbeer',
    name: 'Root Beer',
    spokenPhrase: 'A cold root beer please',
    subtitle: 'Frosty & refreshing',
    category: 'Hydration',
    iconType: 'rootbeer',
    colorTheme: 'orange',
    orderCount: 38,
    lastOrderedAt: 'Today at 10:05 AM'
  },
  {
    id: 'vo-icecream',
    name: 'Mint Chocolate Chip Ice Cream',
    spokenPhrase: 'Mint chocolate chip ice cream in a bowl please',
    subtitle: 'Cool favorite dessert',
    category: 'Treats/Dessert',
    iconType: 'icecream',
    colorTheme: 'emerald',
    orderCount: 35,
    lastOrderedAt: 'Yesterday at 4:30 PM'
  },
  {
    id: 'vo-juice',
    name: 'Low-Acid Orange Juice',
    spokenPhrase: 'We need some low-acid orange juice please',
    subtitle: 'Gentle breakfast citrus',
    category: 'Hydration',
    iconType: 'juice',
    colorTheme: 'amber',
    orderCount: 22,
    lastOrderedAt: 'Aug 27, 2026'
  },
  {
    id: 'vo-water',
    name: 'Electrolyte Water',
    spokenPhrase: 'Electrolyte water please',
    subtitle: 'Steady blood pressure hydration',
    category: 'Hydration',
    iconType: 'water',
    colorTheme: 'sky',
    orderCount: 19,
    lastOrderedAt: 'Aug 26, 2026'
  },
  {
    id: 'vo-pads',
    name: 'Pump Prep Alcohol Pads',
    spokenPhrase: 'Vyalev skin prep alcohol pads',
    subtitle: 'Nightly cannula hygiene',
    category: 'Medical/Pump Supplies',
    iconType: 'pads',
    colorTheme: 'rose',
    orderCount: 15,
    lastOrderedAt: 'Aug 25, 2026'
  },
  {
    id: 'vo-rest',
    name: 'Afternoon Rest',
    spokenPhrase: 'I am resting now',
    subtitle: 'Quiet recliner break',
    category: 'Rest/Comfort',
    iconType: 'rest',
    colorTheme: 'indigo',
    orderCount: 11,
    lastOrderedAt: 'Aug 24, 2026'
  },
  {
    id: 'vo-oatmeal',
    name: 'Warm Oatmeal',
    spokenPhrase: 'Bowl of warm rolled oatmeal please',
    subtitle: 'Low-protein morning staple',
    category: 'Groceries',
    iconType: 'snack',
    colorTheme: 'purple',
    orderCount: 8,
    lastOrderedAt: 'Aug 22, 2026'
  }
];


