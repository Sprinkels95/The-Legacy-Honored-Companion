export type AgentPersonaId = 'dr-evil' | 'clinical-copilot';

export type EnergyState = 'GOOD_ENERGY' | 'MODERATE_FATIGUE' | 'LOW_ENERGY_OFF_STATE';
export type BrevityMode = 'STANDARD_SENTENCE' | 'ULTRA_CONCISE_SINGLE_WORD';

export interface SpeechAcousticEvent {
  id: string;
  timestamp: string;
  rawInput: string;
  durationSeconds: number;
  detectedCadenceWpm: number;
  pitchProfile: 'Normal Resonant' | 'Low Baritone Drop' | 'Slurred / Hypophonic Pitch';
  fatigueScore: number; // 0-100
  energyClassification: EnergyState;
  brevityModeApplied: BrevityMode;
  agentSpokenResponse: string;
  notes: string;
  discordNotificationSent?: boolean;
  suggestedCheckIn?: string;
}

export interface DailyGeminiBriefing {
  id: string;
  date: string;
  dayTimeFormatted: string;
  headline: string;
  audioScript: string;
  personaId: AgentPersonaId;
  pumpHoursLeft: number;
  weatherMood: string;
  keyReminders: string[];
  generatedAt: string;
}

export interface AgentDynamicPanelConfig {
  activeLayout: 'standard' | 'rest-mode' | 'hydration-focus' | 'quick-orders';
  reason: string;
  updatedBy: string;
  lastChanged: string;
}

export interface AgentPersona {
  id: AgentPersonaId;
  name: string;
  subtitle: string;
  tag: string;
  avatarIcon: string;
  voiceStyle: string;
  description: string;
  sampleReassurance: string;
  promptGuidance: string;
}

export type RefillStatus = 'OK' | 'REFILL_NEEDED' | 'CALL_IN_PROGRESS' | 'REFILL_CONFIRMED' | 'PRIOR_AUTH_REQUIRED' | 'READY_FOR_PICKUP' | 'SHIPPED';

export interface MedicationRefillItem {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  deliveryMethod: 'Oral Tablet' | 'Subcutaneous Continuous Infusion' | 'Extended Release Capsule' | 'Transdermal Patch';
  currentPillCountOrVials: number;
  totalPrescriptionQuantity: number;
  dailyUsageRate: number;
  daysRemaining: number;
  refillThresholdDays: number;
  refillStatus: RefillStatus;
  prescribingDoctor: string;
  pharmacyName: string;
  pharmacyPhone: string;
  rxNumber: string;
  lastRefillDate: string;
  nextEstimatedRefillDate: string;
  instructions: string;
  isRefrigerated?: boolean;
  specialHandling?: string;
  notes?: string;
  refillCallType?: 'SPECIALTY_LIVE_VERIFICATION' | 'RETAIL_TOUCH_TONE_PROMPT';
  touchToneSequence?: string;
}

export interface PharmacyCallDialogueStep {
  speaker: 'AGENT' | 'PHARMACY_IVR' | 'PHARMACIST';
  text: string;
  timeOffset: string;
  dtmfTone?: string;
  questionCategory?: 'NAME_DOB' | 'ADDRESS' | 'VIALS_REMAINING' | 'COLD_CHAIN' | 'PRESCRIBER' | 'TOUCH_TONE' | 'CONFIRMATION' | 'GENERAL';
}

export interface PharmacyCallLog {
  id: string;
  medicationId: string;
  medicationName: string;
  rxNumber: string;
  pharmacyName: string;
  pharmacyPhone: string;
  timestamp: string;
  callDurationSeconds: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'ESCALATED';
  confirmationNumber: string;
  estimatedReadyDate: string;
  estimatedReadyTime: string;
  fulfillmentType: 'Express Courier (Refrigerated Cold-Chain)' | 'Pharmacy Counter Pickup' | 'Standard Priority Mail';
  dialogueScript: PharmacyCallDialogueStep[];
  fullTranscript: string;
  priorAuthStatus: 'ACTIVE_VALID' | 'PENDING_REAUTHORIZATION' | 'NOT_REQUIRED';
  caregiverAlertDispatched: boolean;
  alertChannel: 'Discord Webhook' | 'Twilio SMS' | 'Caregiver Mobile App';
}

export interface PantryItem {
  id: string;
  name: string;
  category: 'Groceries' | 'Hydration' | 'Medical/Pump Supplies' | 'Household' | 'Personal Care';
  quantity: number;
  unit: string;
  location: 'Kitchen Pantry' | 'Refrigerator' | 'Medicine Cabinet' | 'Supply Closet';
  inStock: boolean;
  minThreshold: number;
  lastUpdated: string;
  notes?: string;
}

export type RetailerId = 'walmart' | 'instacart' | 'amazon' | 'costco';

export interface RetailerCartOption {
  retailer: RetailerId;
  retailerName: string;
  badge: 'WALMART+' | 'INSTACART+' | 'PRIME' | 'COSTCO';
  price: number;
  deliveryEstimate: string; // e.g. "Today by 2:00 PM", "Tomorrow 8 AM", "2-Day Delivery"
  speedRating: 'ULTRA_FAST' | 'SAME_DAY' | 'NEXT_DAY' | 'STANDARD';
  unitPriceComparison?: string; // e.g. "$0.12/oz vs $0.18/oz"
  cartAddUrl: string;
  inStock: boolean;
  notes?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: 'Groceries' | 'Hydration' | 'Medical/Pump Supplies' | 'Household' | 'Personal Care';
  quantity: number;
  unit: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Immediate';
  addedBy: string;
  dateAdded: string;
  purchased: boolean;
  originPrompt?: string;
  preferredRetailer?: RetailerId;
  retailerOptions?: RetailerCartOption[];
  recommendedOption?: {
    retailer: RetailerId;
    reason: 'CHEAPEST_PRICE' | 'FASTEST_DELIVERY' | 'BEST_BULK_VALUE' | 'SPECIALTY_AVAILABILITY';
    explanation: string;
  };
}

export interface NeedsAuditLog {
  id: string;
  timestamp: string;
  rawInput: string;
  personaUsed: AgentPersonaId;
  extractedItemName: string;
  status: 'SUPPRESSED_DUPLICATE' | 'ADDED_TO_SHOPPING_LIST' | 'RESTOCK_TRIGGERED' | 'ALREADY_STOCKED';
  confidenceScore: number;
  reassuranceText: string;
  reasoning: string;
  source: 'voice' | 'quick-tap' | 'text-input';
}

export interface QuickTapSuggestion {
  id: string;
  label: string;
  item: string;
  category: 'Groceries' | 'Hydration' | 'Medical/Pump Supplies' | 'Household' | 'Personal Care';
  iconName: string;
  timeContext: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
  frequencyScore: number;
  reasoning: string;
}

export interface AdaptiveVoiceOrderItem {
  id: string;
  name: string;
  spokenPhrase: string;
  subtitle: string;
  category: 'Treats/Dessert' | 'Hydration' | 'Groceries' | 'Medical/Pump Supplies' | 'Rest/Comfort';
  iconType: 'pudding' | 'rootbeer' | 'icecream' | 'juice' | 'water' | 'pads' | 'rest' | 'coffee' | 'snack' | 'generic';
  colorTheme: 'amber' | 'emerald' | 'indigo' | 'sky' | 'rose' | 'purple' | 'teal' | 'orange';
  orderCount: number;
  lastOrderedAt?: string;
  isCustom?: boolean;
}

export interface MotorSymptomEntry {
  id: string;
  timestamp: string;
  state: 'ON_GOOD' | 'ON_DYSKINESIA' | 'OFF_FREEZING' | 'OFF_TREMOR' | 'OFF_RIGIDITY';
  severity: 1 | 2 | 3 | 4 | 5; // 1 = mild, 5 = severe
  mealRelation?: 'Pre-meal' | 'Post-meal (High Protein)' | 'Post-meal (Low Protein)' | 'Fasting';
  notes?: string;
}

export interface VyalevPumpCycle {
  id: string;
  date: string;
  pumpStartTime: string;
  dailyDoseMg: number;
  extraDoseBolusCount: number;
  siteLocation: 'Abdomen Upper-Right' | 'Abdomen Lower-Left' | 'Abdomen Upper-Left' | 'Abdomen Lower-Right' | 'Thigh' | string;
  cannulaChangeDate: string;
  flowRateMlHr: number;
  alarms: string[];
}

export interface SyringeRefillLog {
  id: string;
  timestamp: string;
  date: string;
  syringeVolumeMl: number; // typically 10ml, 20ml
  concentrationMgMl: number; // e.g. 240 mg/ml (Foscarbidopa/Foslevodopa)
  totalLoadedMg: number; // volume * concentration e.g. 2400 mg
  basalHourlyRateMl: number; // e.g. 0.56 ml/hr
  bolusesAllowedPerHour: number;
  bolusVolumeMl: number; // e.g. 0.15 ml
  hoursOfSupply: number; // calculated e.g. volume / hourlyRate => 10 / 0.56 = 17.85h or 24h
  syringeLotNumber?: string;
  vialsDrawnCount: number; // e.g. 1 or 2 vials
  siteRotatedToday: boolean;
  cannulaSiteChanged: boolean;
  cannulaClockPosition?: ClockPosition;
  skinCondition: 'Clear & Healthy' | 'Faint Pink' | 'Irritated / Swollen' | 'Quarantined';
  caregiverName: string;
  notes?: string;
}

export interface RoutineLog {
  id: string;
  date: string;
  activity: 'Shower/Grooming' | 'Physical Therapy' | 'Rock Steady Boxing' | 'Hydration Check' | 'Rest Period';
  assisted: boolean;
  durationMinutes: number;
  mobilityScore: 1 | 2 | 3 | 4 | 5; // 1 = minimal movement, 5 = fluid movement
}

export type ClockPosition = '12:00 (Top / Superior)' | '1:30 (Upper-Right)' | '3:00 (Direct Right)' | '4:30 (Lower-Right)' | '6:00 (Bottom / Inferior)' | '7:30 (Lower-Left)' | '9:00 (Direct Left)' | '10:30 (Upper-Left)';

export interface InfusionSiteLog {
  id: string;
  timestamp: string;
  date: string;
  clockPosition: ClockPosition;
  quadrant: 'Upper-Right' | 'Lower-Right' | 'Lower-Left' | 'Upper-Left' | 'Top-Center' | 'Bottom-Center';
  angleDegrees: number; // 0 to 360 around navel
  distanceFromNavelInches: number; // 1.0 inch default circular perimeter
  activeDays: number;
  cannulaLotNumber?: string;
  reactions: {
    erythemaRedness: boolean;
    erythemaSeverity?: 'None' | 'Mild (Faint pink <1cm)' | 'Moderate (Redness 1-2cm)' | 'Significant (>2cm induration)';
    tendernessPain: boolean;
    tendernessSeverity?: 'None' | 'Mild' | 'Moderate' | 'Severe';
    edemaSwelling: boolean;
    noduleFormation: boolean;
    leakageDischarge: boolean;
    itchinessPruritus: boolean;
  };
  caregiverNotes?: string;
  status: 'ACTIVE_INFUSING' | 'HEALING' | 'RESTED_READY' | 'FLAGGED_IRRITATED';
  photoAttachmentSimulated?: boolean;
}

export interface WeeklySynthesisReport {
  id: string;
  periodStart: string;
  periodEnd: string;
  overallScore: number; // 0-100 stability score
  totalOnHoursEstimate: number;
  totalOffHoursEstimate: number;
  dyskinesiaEpisodes: number;
  vyalevPumpSummary: {
    averageDailyInfusionMg: number;
    totalExtraBoluses: number;
    cannulaIntegrityIssues: number;
    pumpAdherencePercent: number;
    siteRotationAdherencePercent?: number;
    activeSiteLocation?: string;
    siteReactionAlerts?: string[];
  };
  keyClinicalFindings: string[];
  levodopaMealInteractions: string[];
  neurologistRecommendations: string[];
  caregiverOffloadingSummary: string;
  markdownContent: string;
  generatedAt: string;
}

export interface DriverDetails {
  name: string;
  vehicle: string;
  licensePlate: string;
  rating: number;
  phone: string;
  etaMinutes: number;
  avatarColor?: string;
}

export interface InsuranceReimbursementClaim {
  id: string;
  proposalId: string;
  appointmentTitle: string;
  clinicName: string;
  doctorName: string;
  doctorNpi?: string;
  dateOfService: string;
  originAddress: string;
  destinationAddress: string;
  distanceMiles: number;
  fareAmount: number;
  fareFormatted: string;
  receiptNumber: string;
  transitMode: 'Uber Assist' | 'Uber WAV' | 'Uber Health' | 'Specialty NEMT';
  primaryDiagnosisIcd10: string; // e.g. 'G20 - Parkinson\'s Disease'
  secondaryDiagnosisIcd10?: string; // e.g. 'R26.81 - Unsteadiness on feet'
  hcpcsCode: string; // e.g. 'A0100 - Non-Emergency Transportation: Taxi/Rideshare'
  medicalNecessityStatement: string;
  proofOfAttendance: 'Verified Clinic EHR Check-In' | 'Caregiver Attestation' | 'Pending Provider Sign-off';
  payerName: string; // e.g. 'Blue Shield of California / Medicare Advantage'
  memberId: string; // e.g. 'BSC-99201482-W'
  groupNumber?: string;
  claimStatus: 'READY_TO_SUBMIT' | 'SUBMITTED' | 'REIMBURSED' | 'PENDING_DOCUMENTATION';
  submittedDate?: string;
  reimbursedAmount?: number;
  reimbursementCheckNumber?: string;
  generatedByAgent: string;
  createdAt: string;
}

export interface MobilityProposal {
  id: string;
  appointmentTitle: string;
  clinicName: string;
  doctorName: string;
  appointmentTime: string;
  destinationAddress: string;
  pickupAddress?: string;
  distanceMiles: number;
  estimatedDriveMinutes: number;
  mobilityPreparationBufferMinutes: number;
  suggestedDepartureTime: string;
  transitServiceType: 'Uber Assist' | 'Wheelchair Van' | 'Caregiver Driven' | 'Medical Transport';
  uberTier?: 'Uber Assist' | 'Uber WAV' | 'Uber Health' | 'Uber Comfort';
  fareEstimate: string;
  fatigueRiskLevel: 'Low' | 'Moderate' | 'High';
  status: 'PROPOSED' | 'APPROVED' | 'DISPATCHED' | 'COMPLETED';
  driverDetails?: DriverDetails;
  specialInstructions?: string[];
  uberDeepLink?: string;
  caregiverPhoneNotified?: boolean;
  insuranceClaim?: InsuranceReimbursementClaim;
  timeline?: Array<{
    timestamp: string;
    step: string;
    status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
  }>;
}

export interface CommunityEvent {
  id: string;
  title: string;
  organization: string;
  eventType: 'Rock Steady Boxing' | 'Dance for PD' | 'Caregiver Support' | 'Aquatic Therapy' | 'Educational Forum';
  date: string;
  time: string;
  location: string;
  address: string;
  virtualAvailable: boolean;
  cost: 'Free' | '$10 drop-in' | '$15 donation' | 'Covered by Grant';
  description: string;
  contactEmail?: string;
  calendarLink?: string;
}

export interface NeedsIntakeResponse {
  success: boolean;
  reassuranceText: string;
  extractedItems: Array<{
    name: string;
    category: 'Groceries' | 'Hydration' | 'Medical/Pump Supplies' | 'Household' | 'Personal Care';
    quantity: number;
    unit: string;
    isDuplicate: boolean;
    stockedLocation?: string;
    pantryQuantity?: number;
    actionTaken: 'SUPPRESSED' | 'ADDED_TO_SHOPPING_QUEUE' | 'UPDATED_EXISTING';
    reasoning: string;
  }>;
  auditEntry: NeedsAuditLog;
}

export type EventAudience = 'Captain Wade' | 'Little Wade' | 'Elsbeth (Work/LA)' | 'Family Shared';
export type TransitMode = 
  | 'Uber Assist / Ride Required' 
  | 'Caregiver Driving' 
  | 'Caregiver Local Drive (No Uber for Dad)' 
  | 'Caregiver Work Travel (No Transit for Dad)'
  | 'No Transit (Home/Virtual)' 
  | 'Flight / Out of Town';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  timeFormatted: string;
  location: string;
  address?: string;
  attendees?: string[];
  category: 'Clinical / Medical' | 'Physical Therapy' | 'Community / Social' | 'Family / Rest' | 'Routine' | 'Travel / Work Trip';
  description?: string;
  
  // Date and Day Context (for multi-day scheduling & live calendar syncing)
  dateStr?: string; // e.g. "Saturday, Aug 29"
  isoDate?: string; // e.g. "2026-08-29"
  dayLabel?: string; // e.g. "Today", "Tomorrow", "Monday", "Tuesday"
  fullDateFormatted?: string; // e.g. "Today (Sat, Aug 29)"

  // Color-coded Audience & Family Tagging
  audience?: EventAudience;
  needsTransit?: boolean;
  transitMode?: TransitMode;
  isWorkTripLA?: boolean;
  colorTag?: 'amber' | 'blue' | 'purple' | 'emerald' | 'rose' | 'indigo';
  wadeImpactNote?: string; // Explicit impact assessment for Big Wade (Dad)
  htmlLink?: string; // Direct link to original Google Calendar event

  mobilityPrepBufferMinutes: number; // e.g. +20-30 min PD mobility buffer
  suggestedDepartureTime?: string;
  estimatedDriveMinutes?: number;
  fatigueRiskLevel: 'Low' | 'Moderate' | 'High';
  levodopaMealAlert?: string;
  vyalevPumpSyncNote?: string;
  actionForWade: string;
  actionForCaregiver: string;
}

export interface TransitBuffer {
  eventId: string;
  eventTitle: string;
  appointmentTime: string;
  departureTime: string;
  bufferMinutes: number; // +20 min PD mobility buffer
  driveMinutes: number;
  instructions: string;
}

export interface DailyCalendarBriefing {
  id: string;
  date: string;
  dayTimeFormatted: string;
  headline: string;
  spokenAudioScript: string;
  personaId: AgentPersonaId;
  pumpHoursLeft: number;
  weatherCondition: string;
  
  // Temporal Rhythm Anchors
  morningAnchor: string;
  middayAnchor: string;
  afternoonRest: string;
  eveningRoutine: string;
  
  // Clinical & Medication Synergy
  clinicalMedicationSynergy: {
    levodopaAbsorptionAdvice: string;
    vyalevPumpCheck: string;
    hydrationTiming: string;
  };
  
  // Action Items
  actionsForWade: string[];
  actionsForElsbeth: string[];
  
  // Chronological Schedule & Mobility Buffers
  events: CalendarEvent[];
  transitBuffers: TransitBuffer[];
  
  discordAlertSent?: boolean;
  generatedAt: string;
}

export interface FirefighterCareerMilestone {
  id: string;
  years: string;
  role: string;
  division: string;
  badgeCode: string;
  icon: string;
  description: string;
  memories: string;
  exposureContext?: string;
}
