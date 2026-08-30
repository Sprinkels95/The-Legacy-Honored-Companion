/**
 * Local Storage Persistence Utility for Parkinson's Care Navigator
 * Ensures state (pantry items, shopping lists, adaptive voice orders, infusion site logs,
 * pump cycles, and acoustic events) persists reliably across browser refreshes and syncs.
 */

const STORAGE_KEYS = {
  PANTRY: 'pcn_pantry_items_v2',
  SHOPPING: 'pcn_shopping_items_v2',
  AUDIT_LOGS: 'pcn_audit_logs_v2',
  MEDICATIONS: 'pcn_medications_v2',
  PHARMACY_CALLS: 'pcn_pharmacy_calls_v2',
  SPEECH_ACOUSTICS: 'pcn_speech_acoustics_v2',
  DAILY_BRIEFING: 'pcn_daily_briefing_v2',
  CALENDAR_BRIEFING: 'pcn_calendar_briefing_v2',
  ADAPTIVE_VOICE_ORDERS: 'pcn_adaptive_voice_orders_v2',
  INFUSION_SITES: 'pcn_infusion_sites_v2',
  SYRINGE_REFILLS: 'pcn_syringe_refills_v2',
  PUMP_CYCLES: 'pcn_pump_cycles_v2',
  SELECTED_PERSONA: 'pcn_selected_persona_v2',
  ENERGY_STATE: 'pcn_energy_state_v2',
  BREVITY_MODE: 'pcn_brevity_mode_v2',
  UBER_INSURANCE_RECORDS: 'pcn_uber_insurance_records_v2',
  UBER_CONNECTED_ACCOUNTS: 'pcn_uber_connected_accounts_v2',
  UBER_DEVELOPER_TOKEN: 'pcn_uber_developer_token_v2',
  UBER_CLIENT_ID: 'pcn_uber_client_id_v2',
  UBER_ENVIRONMENT: 'pcn_uber_environment_v2',
  UBER_AUTO_OPEN_APP: 'pcn_uber_auto_open_app_v2'
};

export function loadStoredState<T>(key: keyof typeof STORAGE_KEYS, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[key]);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch (error) {
    console.warn(`[Persistence] Error loading ${key} from localStorage:`, error);
    return fallback;
  }
}

export function saveStoredState<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  } catch (error) {
    console.warn(`[Persistence] Error saving ${key} to localStorage:`, error);
  }
}

export function clearStoredState(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  } catch (error) {
    console.warn('[Persistence] Error clearing localStorage:', error);
  }
}
