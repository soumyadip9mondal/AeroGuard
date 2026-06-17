// ---------------------------------------------------------------------------
// AeroGuard – Mock AI Assistant Data (Conversations & Prompts)
// ---------------------------------------------------------------------------

// ── Types ───────────────────────────────────────────────────────────────────

export interface Citation {
  label: string;
  type: 'report' | 'regulation' | 'manual' | 'inspection';
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: AssistantMessage[];
}

// ── Pre‑built Conversations ─────────────────────────────────────────────────

export const conversations: Conversation[] = [
  // ── Conversation 1 — Recurring defects on N737AB ──────────────────────────
  {
    id: 'CONV-001',
    title: 'Recurring defects on N737AB',
    messages: [
      {
        role: 'user',
        content: 'Show recurring defects on N737AB',
      },
      {
        role: 'assistant',
        content: `Based on the last 18 months of borescope inspection data for **N737AB** (Boeing 737‑800, CFM56‑7B26), I've identified the following recurring defect patterns:

### 1. Stage 1 Fan Blade Leading‑Edge Erosion
- **Occurrences**: 4 inspections (INS‑001, INS‑048, INS‑092, INS‑137)
- **Blades affected**: 03, 07, 11
- **Trend**: Erosion rate has accelerated from 0.8 mm/1,000 FH to 1.4 mm/1,000 FH over the past 6,000 flight hours, exceeding the expected wear profile per CMM 72‑00‑00 §5‑4.
- **Root cause assessment**: High‑frequency sand/dust ingestion on Middle Eastern route segments (DOH–DXB–MCT). Cross‑referencing METAR data confirms >40 % of departures occurred during elevated PM10 conditions.
- **Recommendation**: Apply enhanced polyurethane erosion shield (SB CFM56‑72‑0347, Rev 3) at next shop visit. Consider route‑rotation optimisation to reduce cumulative exposure.

### 2. HPT Stage 1 Thermal Barrier Coating Spallation
- **Occurrences**: 3 inspections (INS‑001, INS‑092, INS‑137)
- **Blades affected**: 12, 24 (paired positions)
- **Trend**: TBC loss area has grown from 8 mm² to 23 mm² between INS‑092 and INS‑001 — a 187 % increase in one inspection interval.
- **Root cause assessment**: Localised hot‑spot traced to fuel nozzle #6 spray‑pattern deviation. EGT spread data shows 18 °C delta on sector 6 vs fleet average of 7 °C.
- **Recommendation**: Immediate fuel nozzle #6 flow‑check per AMM 73‑21‑01. Replace HPT blades 12 & 24 with part number 1862M41G03. Schedule follow‑up borescope at 500 FH post‑repair.

### 3. Fan Blade Mid‑Chord FOD Denting
- **Occurrences**: 2 inspections (INS‑001, INS‑048)
- **Blades affected**: 09
- **Severity**: All within blendable limits per AC 33.76‑1A, but recurrence on the same blade suggests a possible fan‑case foreign‑object retention issue.
- **Recommendation**: Inspect fan‑case acoustic liner panels for delamination or loose hardware during next C‑check.

**Summary**: N737AB shows a clear pattern of environmentally driven erosion and a developing thermal issue linked to fuel nozzle degradation. I recommend prioritising the nozzle flow‑check and scheduling a consolidated shop visit within the next 1,200 FH to address all three recurring findings.`,
        citations: [
          { label: 'Report #2847', type: 'report' },
          { label: 'Report #2691', type: 'report' },
          { label: 'FAA AC 33.27-1', type: 'regulation' },
          { label: 'FAA AC 33.76-1A', type: 'regulation' },
          { label: 'CMM 72-00-00', type: 'manual' },
          { label: 'SB CFM56-72-0347', type: 'manual' },
          { label: 'INS-001', type: 'inspection' },
        ],
      },
      {
        role: 'user',
        content: 'What is the estimated cost impact if we defer the HPT blade replacement to the next C-check?',
      },
      {
        role: 'assistant',
        content: `Good question. Here's a cost‑impact analysis for deferring the HPT Stage 1 blade replacement on N737AB:

### Immediate Replacement (Recommended)
| Item | Cost |
|------|------|
| HPT blade pair (1862M41G03 × 2) | $134,400 |
| Fuel nozzle #6 replacement | $8,200 |
| Unscheduled borescope labour (8 hrs) | $4,800 |
| **Total** | **$147,400** |

### Deferred to Next C‑Check (~3,200 FH)
| Item | Cost |
|------|------|
| HPT blade pair replacement | $134,400 |
| Potential NGV segment replacement (40 % probability) | $124,000 × 0.4 = $49,600 |
| Additional EGT margin loss → 1.2 % fuel‑burn penalty | $38,400 |
| Risk of unplanned engine removal (15 % probability) | $1,200,000 × 0.15 = $180,000 |
| **Expected total** | **$402,400** |

### Risk Assessment
The TBC spallation growth rate of 187 % per interval suggests the damage will exceed serviceable limits within 800–1,200 FH. Operating beyond that point with an uncorrected fuel nozzle increases the probability of:
- **Substrate oxidation** leading to blade liberation (ref: FAA AC 33.27‑1, §7.2)
- **NGV cascade damage** from hot‑gas path migration
- **IFSD event** requiring AOG engine change ($1.2M+ direct cost, plus revenue loss)

**Bottom line**: Deferral carries a **2.7× cost multiplier** on an expected‑value basis. I strongly recommend proceeding with the immediate replacement per CMM 72‑00‑00 workscope.`,
        citations: [
          { label: 'FAA AC 33.27-1', type: 'regulation' },
          { label: 'CMM 72-00-00', type: 'manual' },
          { label: 'Report #2847', type: 'report' },
        ],
      },
    ],
  },

  // ── Conversation 2 — Fleet health summary ────────────────────────────────
  {
    id: 'CONV-002',
    title: 'Fleet health summary',
    messages: [
      {
        role: 'user',
        content: 'Fleet health summary',
      },
      {
        role: 'assistant',
        content: `Here's the current fleet health overview as of 16 Jun 2026:

### Overall Fleet Status
- **Fleet health score**: 94.2 / 100 (+2.1 pts MoM)
- **Aircraft inspected (rolling 12 mo)**: 1,247
- **Active defect findings**: 3,891 (−3.1 % MoM)
- **Critical findings open**: 23 (−8.7 % MoM)
- **Open work orders**: 47

### Aircraft Requiring Attention

| Tail # | Model | Health | Status | Key Issue |
|--------|-------|--------|--------|-----------|
| N738CD | 737‑800 | 72 | 🔧 Maintenance | 6 defects from INS‑002 — HPC fatigue crack requires rotor pull per AD 2025‑18‑09 |
| N778WB | 777‑300ER | 74 | 🚫 Grounded | Full inspection in progress (INS‑012); engine EGT margin below fleet minimum |
| N330HJ | A330‑300 | 76 | 🔧 Maintenance | Critical HPT crack on Trent 772B (INS‑007) — engine removed, awaiting replacement disk |

### Top Performers

| Tail # | Model | Health | Last Inspected |
|--------|-------|--------|----------------|
| N320NE | A320neo | 98 | 2026‑06‑10 |
| N190E2 | E190‑E2 | 97 | 2026‑06‑13 |
| N739MX | 737 MAX 8 | 96 | 2026‑06‑14 |

### Fleet‑Wide Trends
1. **HPT defects** are trending upward across CFM56 and Trent‑powered aircraft — 11 major/critical HPT findings in the last 90 days vs. 6 in the prior quarter. Recommend fleet‑wide borescope campaign targeting HPT Stage 1.
2. **Fan blade erosion** remains the highest‑volume defect category (34 minor, 12 moderate) but is well‑managed through existing blend‑and‑monitor protocols.
3. **Parts availability**: Trent 772B HPT blades (JE21934) are currently **out of stock** with a critical order (ORD‑001) pending — ETA 28 Jun. This is gating the N330HJ engine return‑to‑service.

### Recommended Actions
1. Expedite ORD‑001 (Trent HPT blades) — contact Pratt & Whitney for AOG priority processing.
2. Schedule fleet‑wide CFM56 HPT borescope campaign for Q3 2026.
3. Review fuel nozzle spray‑pattern data across all CFM56‑7B engines to identify early‑stage thermal degradation.
4. Reassess N778WB grounding criteria once INS‑012 pipeline completes (currently at 62 % defect detection).`,
        citations: [
          { label: 'Report #2847', type: 'report' },
          { label: 'Report #2831', type: 'report' },
          { label: 'Report #2819', type: 'report' },
          { label: 'FAA AC 33.27-1', type: 'regulation' },
          { label: 'AD 2025-18-09', type: 'regulation' },
          { label: 'INS-002', type: 'inspection' },
          { label: 'INS-007', type: 'inspection' },
          { label: 'INS-012', type: 'inspection' },
        ],
      },
      {
        role: 'user',
        content: 'Which aircraft should we prioritize for the next maintenance window?',
      },
      {
        role: 'assistant',
        content: `Based on health scores, open defect severity, flight‑hour accumulation, and parts availability, here's the prioritised maintenance schedule:

### Priority 1 — Immediate (This Week)
**N330HJ** (Airbus A330‑300, Trent 772B)
- Health score: 76
- Reason: Critical HPT Stage 1 circumferential crack (DEF‑018, confidence 98.1 %). Engine already removed. Awaiting Trent HPT blade delivery (ORD‑001, ETA 28 Jun).
- Action: Stage engine in shop, prepare tooling. Begin reassembly as soon as parts arrive.
- Estimated downtime: 5–7 days post‑parts receipt.

### Priority 2 — Next 2 Weeks
**N738CD** (Boeing 737‑800, CFM56‑7B)
- Health score: 72
- Reason: Stage 2 HPC fatigue crack (DEF‑005) requiring rotor pull per AD 2025‑18‑09. HPC blades on order (ORD‑002, shipped, ETA 19 Jun).
- Action: Schedule engine removal for 20 Jun. Perform FPI on full Stage 2 blade set.
- Estimated downtime: 8–10 days.

### Priority 3 — Next 30 Days
**N778WB** (Boeing 777‑300ER, GE90‑115B)
- Health score: 74
- Reason: Currently grounded pending INS‑012 results. Historical EGT margin concerns suggest HPT work likely required.
- Action: Complete INS‑012 analysis. Pre‑position GE90 HPT Stage 2 blades (ORD‑006, shipped, ETA 17 Jun).
- Estimated downtime: TBD pending inspection results.

### Priority 4 — Schedule at Next C‑Check
**N777ER** (Boeing 777‑300ER, GE90‑115B)
- Health score: 81
- Reason: Moderate corrosion in LPT Stage 5 (DEF‑014) and erosion on fan blade (DEF‑013). Both within serviceable limits but trending.
- Action: Plan LPT refurbishment and fan‑blade LE strip replacement during C‑check (due Aug 2026).

### Maintenance Window Recommendation
I recommend blocking **Bay 3** from 18–30 Jun for N330HJ and N738CD back‑to‑back, which optimises tooling changeover and inspector availability (J. Rivera and M. Patel are both qualified on CFM56 and Trent platforms).`,
        citations: [
          { label: 'Report #2847', type: 'report' },
          { label: 'AD 2025-18-09', type: 'regulation' },
          { label: 'CMM 72-00-00', type: 'manual' },
          { label: 'INS-007', type: 'inspection' },
          { label: 'INS-002', type: 'inspection' },
          { label: 'INS-012', type: 'inspection' },
        ],
      },
    ],
  },
];

// ── Suggested Prompts ───────────────────────────────────────────────────────

export const suggestedPrompts: string[] = [
  'Show recurring defects',
  'Fleet health summary',
  'Generate compliance report',
  'Compare inspection history',
  'Predict next maintenance',
  'Parts availability check',
];
