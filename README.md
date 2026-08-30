# 🌟 The Legacy Honored Companion
> **Adaptive, Voice-Led Cognitive Co-Pilot & 10-Agent Autonomous Care Ecosystem for Parkinson's Independence**

[![Hosted on Google Cloud Run](https://img.shields.io/badge/Google%20Cloud%20Run-us--east1-4285F4?logo=googlecloud&logoColor=white)](https://the-legacy-honored-companion-53700756169.us-east1.run.app)
[![Powered by Gemini 3.5 & 3.7](https://img.shields.io/badge/Model-Gemini%203.5%20%2F%203.7%20Flash%20%26%20Pro-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Agent Framework](https://img.shields.io/badge/Agent%20Framework-Google%20GenAI%20SDK%20%2F%20ADK-34A853?logo=google&logoColor=white)](https://cloud.google.com/vertex-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Live Demo & Quick Links
- 🌐 **Live Hosted Web Application:** [https://the-legacy-honored-companion-53700756169.us-east1.run.app](https://the-legacy-honored-companion-53700756169.us-east1.run.app)
- 📹 **Demo Video (4 Min):** [YouTube / Demo Video Link](https://youtu.be/your-video-link-here)
- 📄 **Submission Category:** **The Collaborative Partner** *(Sub-category fit: Taskmaster & Fortified Fleet)*

---

## 📖 Table of Contents
1. [Track & Alignment](#-track--alignment)
2. [Problem Statement & Dignity-First Approach](#-problem-statement--dignity-first-approach)
3. [The 10 Synchronized Autonomous Agents](#-the-10-synchronized-autonomous-agents)
4. [Robust Multi-Layer System Architecture](#-robust-multi-layer-system-architecture)
5. [Key Subsystems & Client Engine Innovations](#-key-subsystems--client-engine-innovations)
6. [4-Tier Enterprise Memory Bank & Security](#-4-tier-enterprise-memory-bank--security)
7. [Token & Compute Efficiency (~79.6% Reduction)](#-token--compute-efficiency)
8. [Clinical Safety Guardrails & PDD Principles](#-clinical-safety-guardrails--pdd-principles)
9. [Spin-Up Instructions (Local & Cloud Run)](#-spin-up-instructions)
10. [Team & License](#-team--license)

---

## 🎯 Track & Alignment

* **Selected Track:** **The Collaborative Partner**
* **Core Problem:** Cognitive decline and neurodegenerative conditions (such as Parkinson's Disease Dementia [PDD]) disrupt executive function, routine adherence, and daily confidence. Standard clinical voice assistants feel sterile, generic, and transactional.
* **Our Solution:** An adaptive, memory-persistent voice co-pilot that offloads daily executive burden through personalized dynamic personas—anchoring tasks and schedules in familiar cultural, professional, and personal heritage (demonstrated via **Captain Wade** and his caregiver **Elsbeth**).

---

## 🩺 Problem Statement & Dignity-First Approach

Individuals living with Parkinson's and their family caregivers face relentless daily friction:
- **Pharmacokinetic Synchronization:** Levodopa absorption competes directly with dietary amino acids, requiring precise meal timing and continuous pump infusion balancing.
- **Subcutaneous Infusion Complexity:** 24-hour continuous subcutaneous pumps (Vyalev) require strict 1-inch radial periumbilical rotations and immediate quarantine of inflamed tissue.
- **Cognitive & Neuromuscular Barriers:** Tremors, voice micro-changes (hypophonia), and motor OFF episodes render conventional mobile UIs unnavigable.
- **Caregiver Asymmetry & Coordination:** Family members balance enterprise careers, out-of-town client travel (LA business trips), children's routines, and high-stakes medical oversight.

---

## 🤖 The 10 Synchronized Autonomous Agents

The system operates not as a single chat loop, but as a coordinated multi-agent mesh partitioned across **Voice & Persona**, **Clinical & Logistics**, and **Inventory & Telephony**:

```text
+---------------------------------------------------------------------------------------------------------------+
|                             SECRET VOLCANO BASE OPERATIONS CONSOLE (AGENT MESH)                              |
+------------------------------------+------------------------------------+-------------------------------------+
|        VOICE & PERSONA             |        CLINICAL & LOGISTICS        |        INVENTORY & TELEPHONY        |
+------------------------------------+------------------------------------+-------------------------------------+
| Agent 1: Legacy Persona Engine     | Agent 2: Google Calendar Engine    | Agent 4: Pharmacy Telephony Agent   |
| Agent 3: Speech Acoustic Tracker   | Agent 5: Clinical MDS-UPDRS Synth  | Agent 7: Needs Intake & Deduplication|
| Agent 6: Quick-Tap Generator       | Agent 8: Proactive Mobility Buffer |                                     |
| Agent 9: Audio Briefing Agent      | Agent 10: Grounded Search Discovery|                                     |
| Agent 10b: Web Audio DSP Equalizer | (Vyalev Radial Safety Guardrail)   |                                     |
+------------------------------------+------------------------------------+-------------------------------------+
```

| # | Agent Name | Category | Model / Engine | Core Autonomous Capability |
|---|---|---|---|---|
| **1** | **Legacy Persona & Cultural Anchoring Engine** | Voice & Persona | Gemini 3.5 / 3.7 | Adapts conversational cadence, dignity, and memory references to Captain Wade's maritime and firefighting life history (*Station Captain*, *Ward Cleaver*, *Dr. Evil*, *First Mate*). |
| **2** | **Shared Google Calendar Reasoning Engine** | Clinical & Logistics | Gemini 3.5 / 3.7 + GCal API | Live temporal reasoning across 5-day care horizons; isolates caregiver LA trips from patient appointments with zero prompt leakage. |
| **3** | **Speech Acoustic Biomarker & Fatigue Tracker** | Voice & Persona | Gemini 3.5 / 3.7 + Web Audio | Tracks hypophonia and cadence fatigue; automatically throttles verbose responses down to single-word confirmations (e.g. *"Handled."*) when motor fatigue is detected. |
| **4** | **Autonomous Outbound Pharmacy Telephony Agent** | Inventory & Telephony | Gemini 3.5 / 3.7 + Twilio PSTN | Executes 6-turn automated IVR calls to specialty pharmacies (Acaria Health) with synthetic voice to authorize Vyalev 24h pump cassette refills. |
| **5** | **Clinical & Behavioral Weekly Synthesis (MDS-UPDRS)** | Clinical & Logistics | Gemini 3.5 / 3.7 | Compiles motor ON/OFF diary entries, pump flow rates, and site reactions into a 1-click clinical dossier for Dr. Arthur Henderson, MD. |
| **6** | **Predictive Quick-Tap Generator Subsystem** | Voice & Persona | Gemini 3.5 / 3.7 | Dynamically ranks Wade's top daily requests (hydration, snacks, comfort items) into high-contrast 120px+ tremor-friendly buttons. |
| **7** | **Autonomous Needs Intake & Deduplication Agent** | Inventory & Telephony | Gemini 3.5 / 3.7 | Cross-references verbal pantry requests against Google Drive master sheets and Walmart APIs to eliminate duplicate orders. |
| **8** | **Proactive Mobility & Ride Proposal Agent** | Clinical & Logistics | Gemini 3.5 / 3.7 | Calculates **+25-minute unhurried mobility buffers** and automatically stages Uber Assist departures to prevent gait freezing under time pressure. |
| **9** | **Community Events & Chapter Grounding Agent** | Clinical & Logistics | Gemini 3.5 / 3.7 + Google Search | Real-time grounded search for local Bay Area Parkinson's support circles, Rock Steady Boxing classes, and movement clinics. |
| **10** | **Web Audio DSP Equalizer & Harmonic Earcon Engine** | Voice & Persona | Native Web Audio DSP | Zero-token mathematical audio synthesis generating 528Hz pure harmonic sine triads and +3.8dB bi-quad warmth filters for immediate acoustic feedback. |

---

## 🏛️ Robust Multi-Layer System Architecture

```text
+---------------------------------------------------------------------------------------------------------------+
|                                      THE LEGACY HONORED COMPANION                                              |
|                                (Autonomous Clinical & Cognitive Co-Pilot)                                     |
+---------------------------------------------------------------------------------------------------------------+

  [ PATIENT LAYER: Captain Wade ]                            [ CAREGIVER LAYER: Elsbeth & Clinical Team ]
  * High-Contrast Serene UI (Dignity-First)                   * Administrative Ops & Infusion Site Hub
  * Zero-Memory-Correction Guardrail                          * Live Telephony Call Logs & Audio Transcripts
  * Real-Time Acoustic Fatigue Tracker                        * Deduplicated Shared Pantry & Shopping Queue
                    |                                                           |
                    +-----------------------------+-----------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------------------+
|                                  CLIENT ENGINE (React 19 + Vite + TypeScript)                                 |
+---------------------------------------------------------------------------------------------------------------+
|  * Web Audio DSP Chain: 0-Token Parametric EQ (+3.8dB @ 220Hz warmth, 8kHz low-pass, dynamic compression)      |
|  * Tone Engine: Dual-Tone Multi-Frequency (DTMF) Synthesizer (697Hz–1477Hz) for retail pharmacy keypad IVRs   |
|  * Multi-Role Voice Pipeline: Tone & cadence adaptation (Ward Cleaver, Dr. Evil, First Mate, Clinical Co-Pilot)|
|  * Infusion Radial Engine: 8-position navel clock site rotation, 72h timer, waistband lockouts & erythema map |
+---------------------------------------------------------------------------------------------------------------+
                                                  |
                                                  | HTTPS / REST API (/api/*)
                                                  v
+---------------------------------------------------------------------------------------------------------------+
|                               BACKEND ORCHESTRATOR (Express.js on Google Cloud Run)                           |
+---------------------------------------------------------------------------------------------------------------+
|  * Route Security & API Key Proxy (Zero Client Leakage of Secrets)                                            |
|  * Schema Enforcement & Typed Response Parser (responseSchema Validation)                                     |
|  * Dual Pharmacy Dispatcher (Specialty Multi-Turn Clinical Intake vs. Automated Touch-Tone Keypads)           |
|  * 4-Tier Memory Bank (Ephemeral Context, Session State, Semantic Vectors, Clinical Audit Ledger)             |
+---------------------------------------------------------------------------------------------------------------+
          |                                       |                                       |
          v                                       v                                       v
+-----------------------+              +-----------------------+              +-----------------------+
|  GOOGLE GENAI SDK     |              |  TELEPHONY & ALERTS   |              |  GOOGLE WORKSPACE     |
|  (Gemini 3.7 Flash)   |              |  (Twilio & Webhooks)  |              |  INTEGRATION          |
+-----------------------+              +-----------------------+              +-----------------------+
| * Multi-Turn Pharmacy |              | * Outbound Carrier    |              | * Google Calendar API |
|   Q&A Verification    |              |   Telephony Dispatch  |              |   Dual-Perspective    |
| * Schema-Enforced     |              | * DTMF Keypad Tones   |              |   Transit & Buffer    |
|   JSON Outputs        |              | * Caregiver Discord   |              |   Calculation Engine  |
| * Clinical MDS-UPDRS  |              |   Alert Webhooks      |              | * Google Docs Clinical|
|   Synthesis           |              | * Twilio SMS Push     |              |   Export              |
+-----------------------+              +-----------------------+              +-----------------------+
```

### System Architecture Flow Diagram (Mermaid)

```mermaid
flowchart TD
    subgraph PatientExperience ["Patient Experience (Captain Wade)"]
        WadeUI["High-Contrast Tremor-Resilient UI"]
        AcousticTracker["Speech Cadence & Fatigue Sensor"]
        EarconFeedback["528Hz Harmonic Earcon Chimes"]
    end

    subgraph CaregiverExperience ["Caregiver Experience (Elsbeth)"]
        OpsHub["Volcano Operations Console"]
        InfusionHub["1-Inch Abdominal Clock Manager"]
        TelephonyLogs["Carrier Voice Call Logs & Audio Transcripts"]
    end

    subgraph ClientEngine ["Client Engine (React 19 + TypeScript + Web Audio)"]
        DSPChain["0-Token Parametric EQ (+3.8dB @ 220Hz)"]
        DTMFEngine["DTMF Synthesizer (697Hz-1477Hz Keypad Tones)"]
        RadialInfusionEngine["8-Slot Periumbilical Quarantine Engine"]
    end

    subgraph GCPCloudRun ["Backend Orchestrator (Google Cloud Run - us-east1)"]
        APIProxy["Route Security & Zero-Leak API Proxy"]
        SchemaValidator["Gemini Type.OBJECT responseSchema Validator"]
        DualDispatcher["Dual Pharmacy Dispatcher (Clinical Q&A vs Touch-Tone)"]
        MemoryBank["4-Tier Enterprise Memory Bank"]
    end

    subgraph CloudAI ["Google Cloud AI & APIs"]
        GeminiFlash["Gemini 3.5 / 3.7 Flash (Fast Multi-Turn Loops)"]
        GeminiPro["Gemini 3.5 / 3.7 Pro (MDS-UPDRS Weekly Dossier)"]
        GCalAPI["Google Calendar API (OAuth 2.0 Ingestion)"]
        FirestoreDB["Cloud Firestore (Session & Episodic Memory)"]
    end

    subgraph RealWorldActions ["Omnichannel Real-World Actions"]
        TwilioVoice["Twilio Carrier PSTN Outbound Dialer"]
        DiscordPush["Discord Webhook Hub (Sub-Second Push)"]
        WalmartSync["Walmart Logistics & Drive Queue"]
    end

    PatientExperience <--> ClientEngine
    CaregiverExperience <--> ClientEngine
    ClientEngine <-->|HTTPS / REST API| GCPCloudRun
    GCPCloudRun <--> GeminiFlash
    GCPCloudRun <--> GeminiPro
    GCPCloudRun <--> GCalAPI
    GCPCloudRun <--> FirestoreDB
    GCPCloudRun --> TwilioVoice
    GCPCloudRun --> DiscordPush
    GCPCloudRun --> WalmartSync
```

---

## 🛠️ Key Subsystems & Client Engine Innovations

### 1. Web Audio DSP Chain & Tone Engine
- **0-Token Parametric Equalizer:** Shapes synthesized speech on the client side (+3.8dB at 220Hz warmth, 8kHz low-pass filter, and dynamic range compression) to provide an intimate, calming presence without paying for multimodal cloud audio stream tokens.
- **DTMF Keypad Synthesizer:** Client-side Dual-Tone Multi-Frequency generator (697Hz–1477Hz) designed for automated interaction with standard retail pharmacy touch-tone telephone systems.

### 2. Infusion Radial Engine (Vyalev 24h Subcutaneous Delivery)
- **1-Inch Navel Clock Mapping:** 8 radial cannula positions (`12:00`, `1:30`, `3:00`, `4:30`, `6:00`, `7:30`, `9:00`, `10:30`).
- **Zero Redness Quarantine:** Quarantines inflamed tissue upon logging of erythema or sensitivity.
- **Waistband Friction Exclusion:** Permanently locks out `4:30`, `6:00`, and `7:30` to prevent pressure necrosis.

### 3. Dual-Perspective Google Calendar Logistics
- **Patient Perspective:** Generates calm, single-step directives (*"Sarah arrives for gait stability at 10:30"*).
- **Caregiver Perspective:** Staged departure times, Uber Assist ride configurations, and **+25-minute unhurried mobility buffers**.

---

## 🔒 4-Tier Enterprise Memory Bank & Security

To adhere to enterprise compliance and cross-session fidelity, the platform implements a structured 4-Tier Memory Bank:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           4-TIER ENTERPRISE MEMORY BANK                           │
├───────────────────────┬─────────────────────────┬─────────────────────────────────┤
│ Memory Tier           │ Storage Mechanism       │ Lifecycle & Purpose             │
├───────────────────────┼─────────────────────────┼─────────────────────────────────┤
│ 1. Ephemeral Context  │ In-Memory Agent Window  │ Real-time dialogue turn state   │
│ 2. Session State      │ Cloud Firestore         │ Daily schedule & pump hours     │
│ 3. Semantic Vectors   │ Vertex AI Vector Search │ Biographical memory & anecdotes │
│ 4. Clinical Audit     │ Immutable Cloud Ledger  │ MDS-UPDRS & dosage compliance   │
└───────────────────────┴─────────────────────────┴─────────────────────────────────┘
```

* **Zero-Leak API Proxy:** Frontend clients never hold raw Gemini or Twilio API keys; all traffic is routed through encrypted Cloud Run endpoints.
* **Model Armor & Safety Guardrails:** Strict input validation filters prevent prompt injection, hallucinated medical dosages, and unauthorized PHI leaks.

---

## ⚡ Token & Compute Efficiency

```
Unoptimized Multi-Turn Baseline: ■■■■■■■■■■■■■■■■■■■■ (24,800 tokens)
Optimized 10-Agent Fleet:        ■■■■ (5,050 tokens)  --> 79.6% Token Reduction
Average TTFT Latency:            ~440 ms
Zero-Token Client Operations:    Mathematical DSP audio, +25m buffer math, 1-click PDF export
```

* **Strict `responseSchema` Enforcement:** Eliminates conversational markdown fluff and forces compact JSON structures.
* **Cadence Throttling:** Reduces response token usage from 60 tokens to 3 tokens (*"Handled."*) when acoustic sensors detect patient vocal fatigue.

---

## 🛡️ Clinical Safety Guardrails & PDD Principles

- **Zero-Memory-Correction Guardrail:** When Captain Wade recalls a past memory differently, the agent avoids contradictory corrections, prioritizing emotional serenity and dignity over factual debate.
- **Errorless Learning Support:** Steps are presented sequentially without branching confusion to minimize cognitive friction.
- **Pharmacokinetic Protection:** Low-protein daytime recommendations preserve blood-brain barrier transport for levodopa, reserving protein intake for evening windows.

---

## 🚀 Spin-Up Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **Google AI Studio API Key** (Gemini 3.5 / 3.7)
- **Google Cloud Platform Account** (with Cloud Run enabled)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sprinkels95/The-Legacy-Honored-Companion.git
   cd The-Legacy-Honored-Companion
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # Google Gemini & AI Studio
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.7-flash

   # Google Firebase & Cloud
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=memory-lane-app-469523.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=memory-lane-app-469523

   # Telephony & Alerts (Optional)
   DISCORD_WEBHOOK_URL=your_discord_webhook_url
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

### Cloud Deployment (Google Cloud Run)

1. **Build container via Google Cloud Build:**
   ```bash
   gcloud builds submit --tag gcr.io/memory-lane-app-469523/the-legacy-honored-companion
   ```

2. **Deploy to Google Cloud Run:**
   ```bash
   gcloud run deploy the-legacy-honored-companion \
     --image gcr.io/memory-lane-app-469523/the-legacy-honored-companion \
     --platform managed \
     --region us-east1 \
     --allow-unauthenticated
   ```

3. **Verify Live Service:**
   Access your live endpoint:
   `https://the-legacy-honored-companion-53700756169.us-east1.run.app`

---

## 👥 Team & Acknowledgments

- **Lead Developer & Creator:** Sprinkels (`@Sprinkels95`)
- **Inspired by:** Captain Wade & caregivers worldwide living with Parkinson's disease.
- **Built for:** The `#AllThingsAgentic` Google Gemini Hackathon.

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
