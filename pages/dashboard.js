import React, { useState, useEffect } from "react";

// ============================================================================
// MOCK DATA — Meridian Industries (synthetic ~$200M industrial company)
// ============================================================================

var ENGINES = [
  { id: "data", name: "Data Integration",       status: "Complete", lastRun: "2026-03-31 02:14:08", processed: "847,219 txns",  exceptions: 0, started: 1.5,  ended: 2.23 },
  { id: "recon", name: "Reconciliation Engine", status: "Complete", lastRun: "2026-03-31 03:47:22", processed: "52 accounts",  exceptions: 8, started: 2.4,  ended: 3.78 },
  { id: "adj",   name: "Adjustment Engine",     status: "Complete", lastRun: "2026-03-31 04:02:51", processed: "14 entries",   exceptions: 0, started: 3.85, ended: 4.05 },
  { id: "cons",  name: "Consolidation & Close", status: "Complete", lastRun: "2026-03-31 04:11:33", processed: "4 entities",   exceptions: 1, started: 4.1,  ended: 4.19 },
  { id: "rep",   name: "Reporting & Evidence",  status: "Running",  lastRun: "2026-03-31 04:32:00", processed: "11 documents", exceptions: 0, started: 4.2,  ended: 4.55 }
];

var KPI = {
  reconsComplete: 47, reconsTotal: 52,
  exceptionsOpen: 8,
  variancesFlagged: 12,
  jesPending: 6
};

var CONTROLLER_TASKS = [
  { id: 1, priority: "high",   text: "Review SG&A flux — Q1 software amortization",       tab: "variances" },
  { id: 2, priority: "high",   text: "Approve $284K accrual reversal — legal settlement", tab: "jes" },
  { id: 3, priority: "med",    text: "Sign off on IC elimination set 4",                  tab: "consolidation" },
  { id: 4, priority: "high",   text: "Decision needed: lease modification — Building 7",  tab: "exceptions" },
  { id: 5, priority: "med",    text: "Resolve unmatched bank txns (3)",                   tab: "exceptions" },
  { id: 6, priority: "low",    text: "Final review — Q1 board deck draft",                tab: "reporting" }
];

var RECONS = [
  { acct: "1010", name: "Cash — Operating (BoA)",      gl: 14728492.18, sub: 14728492.18, status: "Complete",  conf: 99 },
  { acct: "1015", name: "Cash — Payroll (BoA)",        gl: 2104881.00,  sub: 2104881.00,  status: "Complete",  conf: 99 },
  { acct: "1020", name: "Cash — Money Market (JPM)",   gl: 31200000.00, sub: 31200000.00, status: "Complete",  conf: 100 },
  { acct: "1030", name: "Cash — UK GBP",               gl: 4882104.55,  sub: 4882104.55,  status: "Complete",  conf: 98 },
  { acct: "1200", name: "Accounts Receivable",         gl: 38442917.00, sub: 38439200.00, status: "Exception", conf: 87 },
  { acct: "1210", name: "Allowance for Doubtful Accts",gl: -1450000.00, sub: -1450000.00, status: "Complete",  conf: 96 },
  { acct: "1300", name: "Inventory — Raw Materials",   gl: 18227450.00, sub: 18227450.00, status: "Complete",  conf: 95 },
  { acct: "1310", name: "Inventory — WIP",             gl: 9114882.00,  sub: 9089114.00,  status: "Exception", conf: 78 },
  { acct: "1320", name: "Inventory — Finished Goods",  gl: 22458190.00, sub: 22458190.00, status: "Complete",  conf: 97 },
  { acct: "1400", name: "Prepaid Expenses",            gl: 3204088.00,  sub: 3204088.00,  status: "Complete",  conf: 94 },
  { acct: "1500", name: "PP&E — Land",                 gl: 12500000.00, sub: 12500000.00, status: "Complete",  conf: 100 },
  { acct: "1510", name: "PP&E — Buildings",            gl: 87420000.00, sub: 87420000.00, status: "Complete",  conf: 99 },
  { acct: "1520", name: "PP&E — Machinery & Equip",    gl: 142880000.00,sub: 142880000.00,status: "Complete",  conf: 98 },
  { acct: "1590", name: "Accumulated Depreciation",    gl: -78420118.00,sub: -78420118.00,status: "Complete",  conf: 99 },
  { acct: "1700", name: "Intangibles — Customer Lists",gl: 8200000.00,  sub: 8200000.00,  status: "Complete",  conf: 96 },
  { acct: "1800", name: "Goodwill",                    gl: 24800000.00, sub: 24800000.00, status: "Complete",  conf: 100 },
  { acct: "2000", name: "Accounts Payable",            gl: 19884227.00, sub: 19881400.00, status: "Exception", conf: 82 },
  { acct: "2100", name: "Accrued Expenses",            gl: 7440882.00,  sub: 7440882.00,  status: "Complete",  conf: 91 },
  { acct: "2150", name: "Accrued Payroll",             gl: 4218771.00,  sub: 4218771.00,  status: "Complete",  conf: 96 },
  { acct: "2200", name: "Income Taxes Payable",        gl: 2884000.00,  sub: 2884000.00,  status: "Complete",  conf: 95 },
  { acct: "2300", name: "Deferred Revenue",            gl: 11200000.00, sub: 11138000.00, status: "Manual",    conf: 64 },
  { acct: "2400", name: "Lease Liability — ST",        gl: 3422000.00,  sub: 3422000.00,  status: "Complete",  conf: 97 },
  { acct: "2500", name: "Long-Term Debt",              gl: 95000000.00, sub: 95000000.00, status: "Complete",  conf: 100 },
  { acct: "2510", name: "Lease Liability — LT",        gl: 18900000.00, sub: 18900000.00, status: "Complete",  conf: 98 },
  { acct: "3000", name: "Common Stock",                gl: 100000.00,   sub: 100000.00,   status: "Complete",  conf: 100 },
  { acct: "3100", name: "Additional Paid-In Capital",  gl: 42000000.00, sub: 42000000.00, status: "Complete",  conf: 100 },
  { acct: "3200", name: "Retained Earnings",           gl: 118420991.00,sub: 118420991.00,status: "Complete",  conf: 99 }
];

var VARIANCES_MOM = [
  { acct: "5100", name: "Direct Labor",            cur: 8442000, prior: 7918000, conf: 94, kind: "clean",
    commentary: "Direct labor up $524K (6.6%) vs Feb. Driven by merit increase cycle effective March 1 (+4.2%) and 1,840 incremental production hours at the Cincinnati plant tied to the Northrop order. Pattern matches historical March increases following annual review cycle." },
  { acct: "5200", name: "Materials & Supplies",    cur: 14228000, prior: 14102000, conf: 92, kind: "clean",
    commentary: "Materials up $126K (0.9%) vs Feb. Steel index +1.4% offset by improved scrap recovery at Cincinnati (-$58K). Within normal monthly fluctuation band." },
  { acct: "6100", name: "Salaries & Benefits",     cur: 4884000, prior: 4612000, conf: 95, kind: "clean",
    commentary: "S&B up $272K (5.9%) vs Feb. Same merit cycle driver as direct labor plus 4 net hires (3 engineering, 1 finance). All hires confirmed against approved March headcount plan." },
  { acct: "6200", name: "Software — Capitalized",  cur: 1218000, prior: 482000, conf: 71, kind: "judgment",
    commentary: "Software costs up $736K vs Feb. The Aurora ERP migration project hit a development milestone with $400K of contractor costs that may qualify for capitalization under ASC 350-40. Project has not yet reached the application development stage per current documentation. Recommend controller review of capitalization threshold before finalizing." },
  { acct: "6300", name: "Legal & Professional",    cur: 1842000, prior: 614000, conf: 68, kind: "judgment",
    commentary: "Legal expense up $1.23M vs Feb. New $284K accrual booked for the Henderson matter (vendor dispute, complaint filed Feb 26). External counsel estimates 60-70% probability of unfavorable outcome with $250-400K range. Requires controller judgment on whether ASC 450 probable threshold is met." },
  { acct: "6400", name: "Repairs & Maintenance",   cur: 1024000, prior: 487000, conf: 52, kind: "outlier",
    commentary: "R&M up $537K vs Feb. $180K spike concentrated at the Toledo plant with no corresponding work order documentation in the maintenance system. AI could not identify a driver. Recommend investigation before close." },
  { acct: "6500", name: "Depreciation",            cur: 2188000, prior: 2042000, conf: 96, kind: "clean",
    commentary: "Depreciation up $146K (7.2%) vs Feb. Q1 capex of $4.8M placed in service mid-March, primarily the Cincinnati CNC machine ($3.2M, 7-yr life). Calculation traces to fixed asset register." },
  { acct: "4100", name: "Revenue — Industrial",    cur: 12420000, prior: 14102000, conf: 58, kind: "outlier",
    commentary: "Industrial segment revenue down $1.68M (11.9%) vs Feb. AI identified 4 large orders shifted into April but cannot fully account for the gap. No corresponding pricing changes or returns. Recommend review with sales operations." },
  { acct: "4200", name: "Revenue — Aerospace",     cur: 8842000, prior: 8104000, conf: 94, kind: "clean",
    commentary: "Aerospace revenue up $738K (9.1%) vs Feb. Three milestone billings on the Northrop program recognized in March (totaling $720K). Matches contract billing schedule." },
  { acct: "5500", name: "Freight & Logistics",     cur: 884000, prior: 812000, conf: 91, kind: "clean",
    commentary: "Freight up $72K (8.9%) vs Feb. Higher shipment volume on aerospace deliveries plus 2.1% fuel surcharge increase. Within historical variability." },
  { acct: "6800", name: "Insurance",               cur: 412000, prior: 398000, conf: 97, kind: "clean",
    commentary: "Insurance up $14K (3.5%) vs Feb. Renewal premium catch-up for property policy renewed Mar 15. No coverage changes." },
  { acct: "7100", name: "Interest Expense",        cur: 542000, prior: 538000, conf: 99, kind: "clean",
    commentary: "Interest expense up $4K (0.7%) vs Feb. Standard amortization of $95M term loan at SOFR + 2.25%. No new borrowings." }
];

var JES = [
  { num: "JE-2026-0341", desc: "Accrue Q1 audit fees — KPMG",               dr: "6300 Legal & Prof",   cr: "2100 Accrued Exp", amt: 142000, type: "Accrual",   src: "Adjustment Engine", docs: 3, status: "Pending" },
  { num: "JE-2026-0342", desc: "Reverse Henderson legal settlement accrual",dr: "2100 Accrued Exp",    cr: "6300 Legal & Prof",amt: 284000, type: "Reversal",  src: "Adjustment Engine", docs: 4, status: "Pending" },
  { num: "JE-2026-0343", desc: "Reclass software dev — Aurora project",     dr: "1700 Intangibles",    cr: "6200 Software Exp",amt: 400000, type: "Reclass",   src: "Adjustment Engine", docs: 6, status: "Pending" },
  { num: "JE-2026-0344", desc: "March depreciation — Cincinnati CNC",       dr: "6500 Depreciation",   cr: "1590 Accum Depr",  amt: 38095,  type: "Adjustment",src: "Adjustment Engine", docs: 2, status: "Pending" },
  { num: "JE-2026-0345", desc: "FX revaluation — UK GBP cash",              dr: "1030 Cash UK",        cr: "7200 FX Gain/Loss",amt: 18420,  type: "Adjustment",src: "Adjustment Engine", docs: 2, status: "Pending" },
  { num: "JE-2026-0346", desc: "Accrue March utilities — Toledo",           dr: "6700 Utilities",      cr: "2100 Accrued Exp", amt: 87400,  type: "Accrual",   src: "Adjustment Engine", docs: 2, status: "Pending" },
  { num: "JE-2026-0347", desc: "Prepaid insurance amortization",            dr: "6800 Insurance",      cr: "1400 Prepaid Exp", amt: 34333,  type: "Adjustment",src: "Adjustment Engine", docs: 1, status: "Approved" },
  { num: "JE-2026-0348", desc: "Lease interest — Building 4 (ASC 842)",     dr: "7100 Interest Exp",   cr: "2510 Lease Liab",  amt: 12108,  type: "Adjustment",src: "Adjustment Engine", docs: 2, status: "Approved" },
  { num: "JE-2026-0349", desc: "Reclass — misposted freight invoice",       dr: "5500 Freight",        cr: "5200 Materials",   amt: 8420,   type: "Correction",src: "Adjustment Engine", docs: 2, status: "Approved" },
  { num: "JE-2026-0350", desc: "March payroll accrual — incomplete period", dr: "6100 Salaries",       cr: "2150 Acc Payroll", amt: 218400, type: "Accrual",   src: "Adjustment Engine", docs: 3, status: "Approved" },
  { num: "JE-2026-0351", desc: "Customer credit memo — Acme Industrial",    dr: "4100 Revenue Ind",    cr: "1200 AR",          amt: 42000,  type: "Adjustment",src: "Adjustment Engine", docs: 2, status: "Approved" },
  { num: "JE-2026-0352", desc: "Bad debt provision — quarterly true-up",    dr: "6900 Bad Debt Exp",   cr: "1210 ADA",         amt: 88000,  type: "Adjustment",src: "Adjustment Engine", docs: 2, status: "Approved" },
  { num: "JE-2026-0353", desc: "Capitalize WIP — Cincinnati CNC final",     dr: "1520 Machinery",      cr: "1310 WIP",         amt: 218000, type: "Reclass",   src: "Adjustment Engine", docs: 4, status: "Approved" },
  { num: "JE-2026-0354", desc: "Defer Q2 service revenue — Henderson",      dr: "4200 Revenue Aero",   cr: "2300 Deferred Rev",amt: 62000,  type: "Adjustment",src: "Adjustment Engine", docs: 3, status: "Approved" }
];

var EXCEPTIONS = [
  { type: "Unmatched bank transactions", items: [
    { id: "BX-1", desc: "ACH credit $42,180.00 — \"INDUST RFND 03/24\"",            conf: 62, guess: "Possible refund from Allied Steel — supplier credit memo not yet posted" },
    { id: "BX-2", desc: "Wire debit $158,000.00 — \"OUTGOING WIRE TRF\" Mar 27",   conf: 48, guess: "No matching invoice found; may be intercompany funding to Meridian UK" },
    { id: "BX-3", desc: "ACH debit $8,420.00 — \"AMEX MERCH 03/29\"",              conf: 71, guess: "Likely merchant processing fee — no invoice in AP system" }
  ]},
  { type: "Vendor invoices missing PO match", items: [
    { id: "VX-1", desc: "Henderson Engineering — INV #44218 — $87,400",            conf: 55, guess: "Engineering services; PO threshold may have been bypassed for emergency repair" },
    { id: "VX-2", desc: "Toledo Industrial Supply — INV #99821 — $14,200",         conf: 68, guess: "Consumables; vendor typically uses blanket PO that may have expired" }
  ]},
  { type: "Intercompany imbalance", items: [
    { id: "IC-1", desc: "Meridian UK ↔ Meridian GmbH — Management fee allocation", conf: 0, guess: "UK side: $42,000 charge | GmbH side: $38,400 received | $3,600 difference, likely FX timing" }
  ]},
  { type: "Lease classification ambiguity", items: [
    { id: "LX-1", desc: "Building 7 lease modification — March 15",                conf: 0, guess: "Original 5-yr operating lease modified to add 18 months and reduce rent by 8%. Modification may require remeasurement under ASC 842 or could qualify as separate lease — depends on whether the modification grants additional right of use." }
  ]},
  { type: "Revenue contract — non-standard clause", items: [
    { id: "RX-1", desc: "Northrop master agreement — Amendment 3",                 conf: 0, guess: "Amendment adds a customer acceptance clause that may delay revenue recognition for milestone billings. Requires ASC 606 performance obligation review before next month's close." }
  ]}
];

var ENTITIES = [
  { name: "Meridian Industries (Parent)", code: "MIN-100", tb: "Loaded", icMatch: "12 of 12", fx: "USD",       elims: 6 },
  { name: "Meridian UK Ltd",              code: "MIN-200", tb: "Loaded", icMatch: "8 of 8",   fx: "GBP 1.2814", elims: 4 },
  { name: "Meridian Manufacturing GmbH",  code: "MIN-300", tb: "Loaded", icMatch: "5 of 6",   fx: "EUR 1.0942", elims: 3 },
  { name: "Meridian Services LLC",        code: "MIN-400", tb: "Loaded", icMatch: "4 of 4",   fx: "USD",       elims: 2 }
];

var ELIMS = [
  { id: "EL-01", desc: "IC sales — Parent → UK",                  amt: 1842000, status: "Approved" },
  { id: "EL-02", desc: "IC sales — Parent → GmbH",                amt: 924000,  status: "Approved" },
  { id: "EL-03", desc: "IC AR/AP — Parent ↔ UK",                  amt: 482000,  status: "Approved" },
  { id: "EL-04", desc: "IC AR/AP — Parent ↔ GmbH",                amt: 218000,  status: "Approved" },
  { id: "EL-05", desc: "IC interest — Parent loan to GmbH",       amt: 42000,   status: "Approved" },
  { id: "EL-06", desc: "Mgmt fee — UK → Parent",                  amt: 88000,   status: "Approved" },
  { id: "EL-07", desc: "Mgmt fee — GmbH → Parent (FX timing)",    amt: 38400,   status: "Manual override" },
  { id: "EL-08", desc: "IC dividend — Services → Parent",         amt: 250000,  status: "Approved" },
  { id: "EL-09", desc: "Investment in subs — eliminate equity",   amt: 42000000,status: "Approved" }
];

var REPORTS = [
  { folder: "Financial Statements", items: [
    { name: "Balance Sheet",          ext: "PDF",  time: "04:12", status: "Draft" },
    { name: "Income Statement",       ext: "PDF",  time: "04:12", status: "Draft" },
    { name: "Cash Flow Statement",    ext: "PDF",  time: "04:13", status: "Draft" },
    { name: "Statement of Equity",    ext: "PDF",  time: "04:13", status: "Draft" }
  ]},
  { folder: "Management Reporting", items: [
    { name: "Executive KPI Dashboard",ext: "HTML", time: "04:18", status: "Draft" },
    { name: "Department P&Ls",        ext: "XLSX", time: "04:19", status: "Draft" },
    { name: "Trend Analysis",         ext: "PDF",  time: "04:21", status: "Draft" }
  ]},
  { folder: "Board Package", items: [
    { name: "Q1 2026 Board Deck",     ext: "PDF",  time: "04:25", status: "Draft" }
  ]},
  { folder: "MD&A & Notes", items: [
    { name: "Draft MD&A",             ext: "DOCX", time: "04:30", status: "Draft" },
    { name: "Footnote disclosures",   ext: "DOCX", time: "04:32", status: "Draft" }
  ]}
];

var AUDIT_AREAS = [
  { area: "Cash",          pct: 100, collected: 18, needed: 0,  items: ["Bank confirmations (4)", "Bank reconciliations (4)", "Outstanding check listings", "Wire transfer logs"] },
  { area: "AR",            pct: 92,  collected: 24, needed: 2,  items: ["Aging schedule", "Customer confirmations (sample of 18)", "Subsequent receipts test"] },
  { area: "AP",            pct: 88,  collected: 19, needed: 3,  items: ["Aging schedule", "Search for unrecorded liabilities", "Vendor statements"] },
  { area: "Revenue",       pct: 76,  collected: 32, needed: 10, items: ["Contract sample (40)", "Cutoff testing", "ASC 606 5-step memo", "Performance obligation analysis"] },
  { area: "Leases",        pct: 95,  collected: 14, needed: 1,  items: ["Lease inventory", "ASC 842 schedules", "Right-of-use asset rollforward", "New lease memos"] },
  { area: "Debt",          pct: 100, collected: 8,  needed: 0,  items: ["Loan agreement", "Covenant compliance certs", "Interest expense recalc"] },
  { area: "Equity",        pct: 100, collected: 6,  needed: 0,  items: ["Stock register", "APIC rollforward", "Stock comp expense"] },
  { area: "Inventory",     pct: 84,  collected: 22, needed: 4,  items: ["Physical count results", "Cost layer analysis", "LCNRV testing", "Obsolescence reserve"] },
  { area: "Fixed Assets",  pct: 91,  collected: 17, needed: 2,  items: ["Asset register", "Capex additions", "Disposal documentation", "Depreciation recalc"] },
  { area: "Income Tax",    pct: 68,  collected: 11, needed: 5,  items: ["Provision workpapers", "Deferred tax rollforward", "Uncertain tax positions"] }
];

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

function fmt(n) {
  if (n === 0) return "0";
  var neg = n < 0;
  var abs = Math.abs(n);
  var s = abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return neg ? "(" + s + ")" : s;
}

function fmtVar(n) {
  var s = fmt(Math.abs(n));
  return n >= 0 ? "+" + s : "-" + s;
}

function pct(a, b) {
  if (!b) return "—";
  var v = ((a - b) / b) * 100;
  return (v >= 0 ? "+" : "") + v.toFixed(1) + "%";
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CloseDashboard() {
  var _tab = useState("overview");
  var tab = _tab[0], setTab = _tab[1];
  var _slide = useState(null);
  var slide = _slide[0], setSlide = _slide[1];
  var _fade = useState(true);
  var fade = _fade[0], setFade = _fade[1];
  var _reconFilter = useState("All");
  var reconFilter = _reconFilter[0], setReconFilter = _reconFilter[1];
  var _varPeriod = useState("MoM");
  var varPeriod = _varPeriod[0], setVarPeriod = _varPeriod[1];
  var _expArea = useState(AUDIT_AREAS[0].area);
  var expArea = _expArea[0], setExpArea = _expArea[1];

  useEffect(function () {
    setFade(false);
    var t = setTimeout(function () { setFade(true); }, 30);
    return function () { clearTimeout(t); };
  }, [tab]);

  var changeTab = function (t) { setSlide(null); setTab(t); };

  var TABS = [
    { id: "overview",      label: "Overview" },
    { id: "reconciliations", label: "Reconciliations" },
    { id: "variances",     label: "Variances & Flux" },
    { id: "jes",           label: "Journal Entries" },
    { id: "exceptions",    label: "Exceptions" },
    { id: "consolidation", label: "Consolidation" },
    { id: "reporting",     label: "Reporting" },
    { id: "audit",         label: "Audit Evidence" }
  ];

  // ─── STYLE BLOCK ───
  var STYLE = "" +
    "*{box-sizing:border-box;margin:0;padding:0}" +
    "body,html,#root{background:#08090b}" +
    "::selection{background:#00e5a0;color:#08090b}" +
    "::-webkit-scrollbar{width:8px;height:8px}" +
    "::-webkit-scrollbar-track{background:#08090b}" +
    "::-webkit-scrollbar-thumb{background:#1a1c1e;border-radius:4px}" +
    "::-webkit-scrollbar-thumb:hover{background:#2a2c2e}" +
    ".cc{font-family:'DM Sans','Helvetica Neue',sans-serif;background:#08090b;color:#e0e0e0;min-height:100vh}" +
    ".mono{font-family:'JetBrains Mono','SF Mono',Consolas,monospace}" +
    ".panel{background:#0f1012;border:1px solid #1a1c1e;border-radius:10px}" +
    ".tab-btn{background:none;border:none;color:#666;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;padding:14px 18px;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;letter-spacing:.01em}" +
    ".tab-btn:hover{color:#ccc}" +
    ".tab-btn.active{color:#00e5a0;border-bottom-color:#00e5a0}" +
    ".kpi{padding:20px;background:#0f1012;border:1px solid #1a1c1e;border-radius:10px;transition:border-color .2s}" +
    ".kpi:hover{border-color:#2a2c2e}" +
    ".kpi-label{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:12px}" +
    ".kpi-num{font-size:32px;font-weight:700;line-height:1;color:#fff}" +
    ".kpi-sub{font-size:11px;color:#666;margin-top:8px}" +
    ".dot{display:inline-block;width:6px;height:6px;border-radius:50%}" +
    ".dot-em{background:#00e5a0;box-shadow:0 0 8px rgba(0,229,160,.5)}" +
    ".dot-am{background:#ff8c00;box-shadow:0 0 8px rgba(255,140,0,.5)}" +
    ".dot-rd{background:#cc3333;box-shadow:0 0 8px rgba(204,51,51,.5)}" +
    ".dot-gr{background:#444}" +
    ".pill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:100px;font-size:10px;font-weight:600;font-family:'JetBrains Mono',monospace;letter-spacing:.05em;text-transform:uppercase}" +
    ".pill-em{background:rgba(0,229,160,.1);color:#00e5a0;border:1px solid rgba(0,229,160,.3)}" +
    ".pill-am{background:rgba(255,140,0,.1);color:#ff8c00;border:1px solid rgba(255,140,0,.3)}" +
    ".pill-rd{background:rgba(204,51,51,.1);color:#ff5555;border:1px solid rgba(204,51,51,.3)}" +
    ".pill-gr{background:#1a1c1e;color:#888;border:1px solid #2a2c2e}" +
    ".tbl{width:100%;border-collapse:collapse;font-size:13px}" +
    ".tbl th{text-align:left;padding:10px 14px;font-size:10px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #1a1c1e;background:#0a0b0d}" +
    ".tbl td{padding:12px 14px;border-bottom:1px solid #15171a;color:#ccc}" +
    ".tbl tr{cursor:pointer;transition:background .15s}" +
    ".tbl tbody tr:hover{background:#131416}" +
    ".tbl .num{font-family:'JetBrains Mono',monospace;text-align:right;color:#e0e0e0}" +
    ".btn{background:#00e5a0;color:#08090b;border:none;padding:9px 18px;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}" +
    ".btn:hover{background:#00cc8e}" +
    ".btn-ghost{background:transparent;color:#00e5a0;border:1px solid rgba(0,229,160,.3);padding:8px 16px;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}" +
    ".btn-ghost:hover{border-color:#00e5a0;background:rgba(0,229,160,.05)}" +
    ".btn-rd{background:transparent;color:#ff5555;border:1px solid rgba(204,51,51,.3);padding:8px 16px;border-radius:6px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}" +
    ".btn-rd:hover{border-color:#cc3333;background:rgba(204,51,51,.06)}" +
    ".filter-pill{padding:6px 14px;border-radius:100px;font-size:11px;font-weight:500;border:1px solid #1a1c1e;background:transparent;color:#888;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}" +
    ".filter-pill:hover{color:#ccc;border-color:#2a2c2e}" +
    ".filter-pill.active{background:#00e5a0;color:#08090b;border-color:#00e5a0;font-weight:600}" +
    ".slide-over{position:fixed;top:0;right:0;width:520px;max-width:90vw;height:100vh;background:#0a0b0d;border-left:1px solid #1a1c1e;box-shadow:-20px 0 60px rgba(0,0,0,.5);z-index:100;overflow-y:auto;animation:slideIn .3s cubic-bezier(.2,.8,.2,1)}" +
    "@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}" +
    ".overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:99;animation:fadeIn .2s}" +
    "@keyframes fadeIn{from{opacity:0}to{opacity:1}}" +
    ".task-row{padding:14px 16px;border-bottom:1px solid #15171a;cursor:pointer;transition:background .15s;display:flex;align-items:flex-start;gap:12px}" +
    ".task-row:hover{background:#131416}" +
    ".task-row:last-child{border-bottom:none}" +
    ".tab-fade{opacity:0;transform:translateY(8px);transition:opacity .35s ease, transform .35s ease}" +
    ".tab-fade.in{opacity:1;transform:translateY(0)}" +
    ".vc{padding:20px;background:#0f1012;border:1px solid #1a1c1e;border-radius:10px;margin-bottom:14px;transition:border-color .2s}" +
    ".vc:hover{border-color:#2a2c2e}" +
    ".vc-judgment{border-left:3px solid #ff8c00}" +
    ".vc-outlier{border-left:3px solid #cc3333}" +
    ".vc-clean{border-left:3px solid #00e5a0}" +
    ".ai-block{background:#0a0b0d;border:1px solid #15171a;border-radius:6px;padding:14px;margin:14px 0;font-size:13px;color:#aaa;line-height:1.6;position:relative}" +
    ".ai-tag{position:absolute;top:-9px;left:14px;background:#0a0b0d;padding:0 8px;font-size:9px;font-family:'JetBrains Mono',monospace;color:#666;letter-spacing:.1em;text-transform:uppercase}" +
    ".eng-row{display:grid;grid-template-columns:1.6fr 1fr 1.4fr 1fr 0.8fr;gap:14px;padding:14px 18px;border-bottom:1px solid #15171a;align-items:center;font-size:12px}" +
    ".eng-row:last-child{border-bottom:none}" +
    ".gantt{position:relative;height:200px;background:#0a0b0d;border:1px solid #15171a;border-radius:8px;padding:14px}" +
    ".gantt-row{position:relative;height:24px;margin-bottom:6px;display:flex;align-items:center;gap:12px}" +
    ".gantt-label{font-size:10px;color:#888;width:140px;font-family:'JetBrains Mono',monospace;flex-shrink:0}" +
    ".gantt-track{flex:1;height:14px;background:#0f1012;border-radius:3px;position:relative}" +
    ".gantt-bar{position:absolute;top:0;height:100%;background:linear-gradient(90deg,rgba(0,229,160,.6),rgba(0,229,160,.85));border-radius:3px;box-shadow:0 0 12px rgba(0,229,160,.2)}" +
    ".gantt-axis{position:absolute;left:158px;right:14px;bottom:6px;display:flex;justify-content:space-between;font-size:9px;color:#444;font-family:'JetBrains Mono',monospace}" +
    ".file-row{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #15171a;transition:background .15s}" +
    ".file-row:last-child{border-bottom:none}" +
    ".file-row:hover{background:#131416}" +
    ".prog{height:6px;background:#1a1c1e;border-radius:3px;overflow:hidden;position:relative}" +
    ".prog-bar{height:100%;background:linear-gradient(90deg,#00e5a0,#00cc8e);border-radius:3px;transition:width .4s}" +
    ".prog-bar.am{background:linear-gradient(90deg,#ff8c00,#cc7000)}" +
    ".sect-h{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:14px;padding:0 4px}";

  return React.createElement("div", { className: "cc" },
    React.createElement("link", { href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap", rel: "stylesheet" }),
    React.createElement("style", { dangerouslySetInnerHTML: { __html: STYLE } }),

    // ─── TOP BAR ───
    React.createElement("div", { style: { borderBottom: "1px solid #1a1c1e", background: "#0a0b0d", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 } },
      React.createElement("a", { href: "/", title: "Back to knightledger.com", style: { display: "flex", alignItems: "center", gap: 14, textDecoration: "none", cursor: "pointer" } },
        React.createElement("svg", { width: 26, height: 26, viewBox: "0 0 40 40", fill: "none" },
          React.createElement("path", { d: "M20 3L6 12v16l14 9 14-9V12L20 3z", stroke: "#00e5a0", strokeWidth: "1.5", fill: "none", opacity: ".6" }),
          React.createElement("path", { d: "M20 8L10 14v12l10 6 10-6V14L20 8z", stroke: "#00e5a0", strokeWidth: "1", fill: "rgba(0,229,160,0.05)" }),
          React.createElement("circle", { cx: 20, cy: 20, r: 3, fill: "#00e5a0", opacity: ".8" }),
          React.createElement("circle", { cx: 20, cy: 20, r: 1.2, fill: "#08090b" })
        ),
        React.createElement("div", null,
          React.createElement("div", { className: "mono", style: { fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-.3px" } }, "KnightLedger"),
          React.createElement("div", { style: { fontSize: 10, color: "#666", marginTop: 2, letterSpacing: ".05em" } }, "CLOSE OS")
        )
      ),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 24 } },
        React.createElement("div", { style: { textAlign: "right" } },
          React.createElement("div", { style: { fontSize: 13, color: "#fff", fontWeight: 600 } }, "Meridian Industries"),
          React.createElement("div", { className: "mono", style: { fontSize: 10, color: "#666", marginTop: 2 } }, "MARCH 2026  ·  DAY 2 OF 3")
        ),
        React.createElement("div", { className: "pill pill-em" },
          React.createElement("span", { className: "dot dot-em" }), "ON TRACK"
        )
      )
    ),


    React.createElement("div", {
      style: {
        background: "#0a0b0d", borderBottom: "1px solid #1a1c1e",
        padding: "14px 28px", display: "flex", alignItems: "center",
        gap: 18, flexWrap: "wrap"
      }
    },
      React.createElement("div", {
        style: {
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
          color: "#00e5a0", letterSpacing: ".15em", fontWeight: 600,
          padding: "4px 10px", border: "1px solid rgba(0,229,160,.3)", borderRadius: 100,
          whiteSpace: "nowrap"
        }
      }, "HOW THIS RUNS"),
      React.createElement("div", { style: { fontSize: 12, color: "#aaa", lineHeight: 1.6, maxWidth: 820 } },
        "Two paths. Built into your existing close platform via API — BlackLine, FloQast, Numeric, Workiva, or similar. Or delivered as part of the engagement, deployed on your cloud and connected to your ERP."
      )
    ),
    // ─── TAB NAV ───
    React.createElement("div", { style: { borderBottom: "1px solid #1a1c1e", background: "#0a0b0d", padding: "0 20px", display: "flex", overflowX: "auto" } },
      TABS.map(function (t) {
        return React.createElement("button", {
          key: t.id, className: "tab-btn" + (tab === t.id ? " active" : ""),
          onClick: function () { changeTab(t.id); }
        }, t.label);
      })
    ),

    // ─── BODY ───
    React.createElement("div", { className: "tab-fade" + (fade ? " in" : ""), style: { padding: "28px", maxWidth: 1500, margin: "0 auto" } },

      // ════════ OVERVIEW ════════
      tab === "overview" && React.createElement("div", null,
        // KPIs
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 } },
          React.createElement("div", { className: "kpi" },
            React.createElement("div", { className: "kpi-label" }, "Reconciliations Complete"),
            React.createElement("div", { className: "kpi-num mono" }, KPI.reconsComplete, React.createElement("span", { style: { color: "#444", fontSize: 22, fontWeight: 500 } }, " / " + KPI.reconsTotal)),
            React.createElement("div", { className: "prog", style: { marginTop: 12 } },
              React.createElement("div", { className: "prog-bar", style: { width: (KPI.reconsComplete / KPI.reconsTotal * 100) + "%" } })
            )
          ),
          React.createElement("div", { className: "kpi" },
            React.createElement("div", { className: "kpi-label" }, "Exceptions Open"),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
              React.createElement("div", { className: "kpi-num mono" }, KPI.exceptionsOpen),
              React.createElement("span", { className: "dot dot-am", style: { width: 8, height: 8 } })
            ),
            React.createElement("div", { className: "kpi-sub" }, "Across 5 categories")
          ),
          React.createElement("div", { className: "kpi" },
            React.createElement("div", { className: "kpi-label" }, "Variances Flagged"),
            React.createElement("div", { className: "kpi-num mono", style: { color: "#fff" } }, KPI.variancesFlagged),
            React.createElement("div", { className: "kpi-sub" }, "3 require judgment")
          ),
          React.createElement("div", { className: "kpi" },
            React.createElement("div", { className: "kpi-label" }, "JEs Pending Approval"),
            React.createElement("div", { className: "kpi-num mono", style: { color: "#00e5a0" } }, KPI.jesPending),
            React.createElement("div", { className: "kpi-sub" }, "$1.07M total impact")
          )
        ),

        // Engine Status + Tasks
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 18 } },
          React.createElement("div", { className: "panel" },
            React.createElement("div", { style: { padding: "16px 18px", borderBottom: "1px solid #1a1c1e", display: "flex", alignItems: "center", justifyContent: "space-between" } },
              React.createElement("div", { className: "sect-h", style: { margin: 0 } }, "AI ENGINE STATUS"),
              React.createElement("div", { className: "mono", style: { fontSize: 10, color: "#444" } }, "AS OF 04:32:14")
            ),
            React.createElement("div", { className: "eng-row", style: { background: "#0a0b0d", padding: "10px 18px", borderBottom: "1px solid #1a1c1e" } },
              React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em" } }, "Engine"),
              React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em" } }, "Status"),
              React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em" } }, "Last Run"),
              React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em" } }, "Processed"),
              React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em", textAlign: "right" } }, "Excptns")
            ),
            ENGINES.map(function (e) {
              var dotClass = e.status === "Running" ? "dot-am" : e.status === "Complete" ? "dot-em" : "dot-gr";
              var pillClass = e.status === "Running" ? "pill pill-am" : e.status === "Complete" ? "pill pill-em" : "pill pill-gr";
              return React.createElement("div", { key: e.id, className: "eng-row" },
                React.createElement("div", { style: { color: "#e0e0e0", fontWeight: 500 } }, e.name),
                React.createElement("div", null, React.createElement("span", { className: pillClass }, React.createElement("span", { className: "dot " + dotClass }), e.status)),
                React.createElement("div", { className: "mono", style: { color: "#888", fontSize: 11 } }, e.lastRun.split(" ")[1]),
                React.createElement("div", { className: "mono", style: { color: "#aaa", fontSize: 11 } }, e.processed),
                React.createElement("div", { className: "mono", style: { textAlign: "right", color: e.exceptions > 0 ? "#ff8c00" : "#444", fontWeight: 600 } }, e.exceptions)
              );
            })
          ),

          React.createElement("div", { className: "panel" },
            React.createElement("div", { style: { padding: "16px 18px", borderBottom: "1px solid #1a1c1e" } },
              React.createElement("div", { className: "sect-h", style: { margin: 0 } }, "TODAY'S CONTROLLER TASKS")
            ),
            CONTROLLER_TASKS.map(function (t) {
              var dc = t.priority === "high" ? "dot-rd" : t.priority === "med" ? "dot-am" : "dot-gr";
              return React.createElement("div", { key: t.id, className: "task-row", onClick: function () { changeTab(t.tab); } },
                React.createElement("span", { className: "dot " + dc, style: { marginTop: 6, flexShrink: 0 } }),
                React.createElement("div", { style: { fontSize: 12, color: "#ccc", lineHeight: 1.5 } }, t.text)
              );
            })
          )
        ),

        // Gantt
        React.createElement("div", { className: "panel", style: { padding: 18 } },
          React.createElement("div", { className: "sect-h", style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", null, "CLOSE TIMELINE — MARCH 2026"),
            React.createElement("span", { className: "mono", style: { fontSize: 9, color: "#444" } }, "OVERNIGHT RUN  ·  01:00 → 05:00")
          ),
          React.createElement("div", { className: "gantt" },
            ENGINES.map(function (e) {
              var pctL = ((e.started - 1) / 4) * 100;
              var pctW = ((e.ended - e.started) / 4) * 100;
              return React.createElement("div", { key: e.id, className: "gantt-row" },
                React.createElement("div", { className: "gantt-label" }, e.name.toUpperCase()),
                React.createElement("div", { className: "gantt-track" },
                  React.createElement("div", { className: "gantt-bar", style: { left: pctL + "%", width: pctW + "%" } })
                )
              );
            }),
            React.createElement("div", { className: "gantt-axis" },
              ["01:00", "02:00", "03:00", "04:00", "05:00"].map(function (t) {
                return React.createElement("span", { key: t }, t);
              })
            )
          )
        )
      ),

      // ════════ RECONCILIATIONS ════════
      tab === "reconciliations" && React.createElement("div", null,
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 } },
          React.createElement("div", null,
            React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#fff" } }, "Balance Sheet Reconciliations"),
            React.createElement("div", { style: { fontSize: 12, color: "#666", marginTop: 4 } }, "27 of 52 in scope shown · click any row for detail")
          ),
          React.createElement("div", { style: { display: "flex", gap: 8 } },
            ["All", "Complete", "Exception", "Manual"].map(function (f) {
              return React.createElement("button", { key: f, className: "filter-pill" + (reconFilter === f ? " active" : ""), onClick: function () { setReconFilter(f); } }, f);
            })
          )
        ),
        React.createElement("div", { className: "panel", style: { overflow: "hidden" } },
          React.createElement("table", { className: "tbl" },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", null, "Account"),
                React.createElement("th", null, "Name"),
                React.createElement("th", { style: { textAlign: "right" } }, "GL Balance"),
                React.createElement("th", { style: { textAlign: "right" } }, "Sub-ledger"),
                React.createElement("th", { style: { textAlign: "right" } }, "Variance"),
                React.createElement("th", null, "Status"),
                React.createElement("th", { style: { textAlign: "right" } }, "Confidence")
              )
            ),
            React.createElement("tbody", null,
              RECONS.filter(function (r) { return reconFilter === "All" || r.status === reconFilter; }).map(function (r) {
                var v = r.gl - r.sub;
                var pillC = r.status === "Complete" ? "pill pill-em" : r.status === "Exception" ? "pill pill-am" : "pill pill-rd";
                var dc = r.status === "Complete" ? "dot-em" : r.status === "Exception" ? "dot-am" : "dot-rd";
                return React.createElement("tr", { key: r.acct, onClick: function () { setSlide({ kind: "recon", data: r }); } },
                  React.createElement("td", { className: "mono", style: { color: "#888" } }, r.acct),
                  React.createElement("td", null, r.name),
                  React.createElement("td", { className: "num" }, fmt(r.gl)),
                  React.createElement("td", { className: "num" }, fmt(r.sub)),
                  React.createElement("td", { className: "num", style: { color: v === 0 ? "#444" : "#ff8c00" } }, v === 0 ? "—" : fmtVar(v)),
                  React.createElement("td", null, React.createElement("span", { className: pillC }, React.createElement("span", { className: "dot " + dc }), r.status)),
                  React.createElement("td", { className: "num", style: { color: r.conf >= 90 ? "#00e5a0" : r.conf >= 75 ? "#ff8c00" : "#cc3333" } }, r.conf + "%")
                );
              })
            )
          )
        )
      ),

      // ════════ VARIANCES & FLUX ════════
      tab === "variances" && React.createElement("div", null,
        React.createElement("div", { style: { marginBottom: 18 } },
          React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 4 } }, "Variance Review"),
          React.createElement("div", { style: { fontSize: 12, color: "#666" } }, "12 material variances flagged for controller review · AI commentary drafted")
        ),
        React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 20 } },
          [["MoM", "Mar 26 vs Feb 26"], ["YoY", "Mar 26 vs Mar 25"], ["Fcst", "Mar 26 vs Forecast"]].map(function (p) {
            return React.createElement("button", { key: p[0], className: "filter-pill" + (varPeriod === p[0] ? " active" : ""), onClick: function () { setVarPeriod(p[0]); } }, p[1]);
          })
        ),
        VARIANCES_MOM.map(function (v) {
          var diff = v.cur - v.prior;
          var diffPct = pct(v.cur, v.prior);
          var kindClass = "vc vc-" + v.kind;
          var confColor = v.conf >= 90 ? "#00e5a0" : v.conf >= 70 ? "#ff8c00" : "#cc3333";
          return React.createElement("div", { key: v.acct, className: kindClass },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 16 } },
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 14, fontWeight: 600, color: "#fff" } }, v.name),
                React.createElement("div", { className: "mono", style: { fontSize: 11, color: "#666", marginTop: 3 } }, "ACCT " + v.acct)
              ),
              React.createElement("div", { style: { textAlign: "right" } },
                React.createElement("div", { className: "mono", style: { fontSize: 16, fontWeight: 700, color: diff >= 0 ? "#00e5a0" : "#ff8c00" } }, fmtVar(diff)),
                React.createElement("div", { className: "mono", style: { fontSize: 11, color: "#666", marginTop: 3 } }, diffPct)
              )
            ),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: "12px 0", borderTop: "1px solid #15171a", borderBottom: "1px solid #15171a" } },
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 } }, "March 2026"),
                React.createElement("div", { className: "mono", style: { fontSize: 14, color: "#fff" } }, "$" + fmt(v.cur))
              ),
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 } }, "February 2026"),
                React.createElement("div", { className: "mono", style: { fontSize: 14, color: "#aaa" } }, "$" + fmt(v.prior))
              ),
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 } }, "AI Confidence"),
                React.createElement("div", { className: "mono", style: { fontSize: 14, color: confColor, fontWeight: 600 } }, v.conf + "%")
              )
            ),
            React.createElement("div", { className: "ai-block" },
              React.createElement("span", { className: "ai-tag" }, "AI-DRAFTED COMMENTARY"),
              v.commentary
            ),
            React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" } },
              React.createElement("button", { className: "btn" }, "Accept commentary"),
              React.createElement("button", { className: "btn-ghost" }, "Edit & accept"),
              React.createElement("button", { className: "btn-rd" }, "Flag for investigation"),
              React.createElement("div", { style: { marginLeft: "auto", fontSize: 11, color: "#555" } },
                React.createElement("span", { className: "mono" }, "Source: "),
                React.createElement("span", { style: { color: "#00e5a0", textDecoration: "underline", cursor: "pointer" } }, Math.round(v.cur / 50000) + " transactions →")
              )
            )
          );
        })
      ),

      // ════════ JOURNAL ENTRIES ════════
      tab === "jes" && React.createElement("div", null,
        React.createElement("div", { style: { marginBottom: 18 } },
          React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 4 } }, "Journal Entry Queue"),
          React.createElement("div", { style: { fontSize: 12, color: "#666" } }, "14 entries drafted by Adjustment Engine · 6 pending approval")
        ),
        React.createElement("div", { className: "panel", style: { overflow: "hidden" } },
          React.createElement("table", { className: "tbl" },
            React.createElement("thead", null,
              React.createElement("tr", null,
                React.createElement("th", null, "JE #"),
                React.createElement("th", null, "Description"),
                React.createElement("th", null, "Type"),
                React.createElement("th", { style: { textAlign: "right" } }, "Amount"),
                React.createElement("th", null, "Source"),
                React.createElement("th", null, "Status")
              )
            ),
            React.createElement("tbody", null,
              JES.map(function (j) {
                var pillC = j.status === "Pending" ? "pill pill-am" : j.status === "Approved" ? "pill pill-em" : "pill pill-rd";
                return React.createElement("tr", { key: j.num, onClick: function () { setSlide({ kind: "je", data: j }); } },
                  React.createElement("td", { className: "mono", style: { color: "#888" } }, j.num),
                  React.createElement("td", null, j.desc),
                  React.createElement("td", { style: { color: "#888", fontSize: 12 } }, j.type),
                  React.createElement("td", { className: "num" }, "$" + fmt(j.amt)),
                  React.createElement("td", { style: { color: "#666", fontSize: 11 } }, j.src),
                  React.createElement("td", null, React.createElement("span", { className: pillC }, j.status))
                );
              })
            )
          )
        )
      ),

      // ════════ EXCEPTIONS ════════
      tab === "exceptions" && React.createElement("div", null,
        React.createElement("div", { style: { marginBottom: 18 } },
          React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 4 } }, "Exception Triage"),
          React.createElement("div", { style: { fontSize: 12, color: "#666" } }, "Items the AI engines could not resolve confidently · routed for human judgment")
        ),
        EXCEPTIONS.map(function (group, gi) {
          return React.createElement("div", { key: gi, className: "panel", style: { marginBottom: 14, overflow: "hidden" } },
            React.createElement("div", { style: { padding: "14px 18px", borderBottom: "1px solid #1a1c1e", display: "flex", justifyContent: "space-between", alignItems: "center" } },
              React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#fff" } }, group.type),
              React.createElement("span", { className: "pill pill-am" }, group.items.length + " items")
            ),
            group.items.map(function (item, ii) {
              return React.createElement("div", { key: ii, style: { padding: "16px 18px", borderBottom: ii < group.items.length - 1 ? "1px solid #15171a" : "none" } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 16 } },
                  React.createElement("div", { className: "mono", style: { fontSize: 12, color: "#ccc" } }, item.desc),
                  item.conf > 0 && React.createElement("div", { className: "mono", style: { fontSize: 11, color: item.conf >= 70 ? "#ff8c00" : "#cc3333", flexShrink: 0 } }, "AI: " + item.conf + "%")
                ),
                React.createElement("div", { style: { fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 12 } }, item.guess),
                React.createElement("button", { className: "btn-ghost" }, "Resolve →")
              );
            })
          );
        })
      ),

      // ════════ CONSOLIDATION ════════
      tab === "consolidation" && React.createElement("div", null,
        React.createElement("div", { style: { marginBottom: 18 } },
          React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 4 } }, "Multi-Entity Consolidation"),
          React.createElement("div", { style: { fontSize: 12, color: "#666" } }, "4 entities · IC matching and elimination")
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 18 } },
          ENTITIES.map(function (e) {
            var icOk = e.icMatch.split(" of ")[0] === e.icMatch.split(" of ")[1];
            return React.createElement("div", { key: e.code, className: "panel", style: { padding: 18 } },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 } },
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 14, fontWeight: 600, color: "#fff" } }, e.name),
                  React.createElement("div", { className: "mono", style: { fontSize: 10, color: "#666", marginTop: 3 } }, e.code)
                ),
                React.createElement("span", { className: "pill pill-em" },
                  React.createElement("span", { className: "dot dot-em" }), e.tb
                )
              ),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 } },
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 } }, "IC Matches"),
                  React.createElement("div", { className: "mono", style: { fontSize: 12, color: icOk ? "#00e5a0" : "#ff8c00" } }, e.icMatch)
                ),
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 } }, "FX Rate"),
                  React.createElement("div", { className: "mono", style: { fontSize: 12, color: "#aaa" } }, e.fx)
                ),
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 } }, "Elims"),
                  React.createElement("div", { className: "mono", style: { fontSize: 12, color: "#aaa" } }, e.elims)
                )
              )
            );
          })
        ),
        React.createElement("div", { className: "panel", style: { overflow: "hidden" } },
          React.createElement("div", { style: { padding: "14px 18px", borderBottom: "1px solid #1a1c1e" } },
            React.createElement("div", { className: "sect-h", style: { margin: 0 } }, "ELIMINATION JOURNAL")
          ),
          React.createElement("table", { className: "tbl" },
            React.createElement("tbody", null,
              ELIMS.map(function (el) {
                var manual = el.status === "Manual override";
                return React.createElement("tr", { key: el.id },
                  React.createElement("td", { className: "mono", style: { color: "#888", width: 80 } }, el.id),
                  React.createElement("td", null, el.desc),
                  React.createElement("td", { className: "num" }, "$" + fmt(el.amt)),
                  React.createElement("td", { style: { width: 160 } },
                    React.createElement("span", { className: "pill " + (manual ? "pill-am" : "pill-em") },
                      React.createElement("span", { className: "dot " + (manual ? "dot-am" : "dot-em") }),
                      manual ? "Manual override" : "Approved by AI"
                    )
                  )
                );
              })
            )
          )
        )
      ),

      // ════════ REPORTING ════════
      tab === "reporting" && React.createElement("div", null,
        React.createElement("div", { style: { marginBottom: 18 } },
          React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 4 } }, "Generated Outputs"),
          React.createElement("div", { style: { fontSize: 12, color: "#666" } }, "11 documents drafted by Reporting & Evidence engine")
        ),
        REPORTS.map(function (r, i) {
          return React.createElement("div", { key: i, className: "panel", style: { marginBottom: 14, overflow: "hidden" } },
            React.createElement("div", { style: { padding: "12px 18px", borderBottom: "1px solid #1a1c1e", background: "#0a0b0d" } },
              React.createElement("div", { className: "mono", style: { fontSize: 11, color: "#00e5a0", letterSpacing: ".1em", textTransform: "uppercase" } }, r.folder + "/")
            ),
            r.items.map(function (it, ii) {
              return React.createElement("div", { key: ii, className: "file-row" },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14 } },
                  React.createElement("div", { className: "mono", style: { fontSize: 9, color: "#666", padding: "3px 8px", border: "1px solid #2a2c2e", borderRadius: 3, minWidth: 42, textAlign: "center" } }, it.ext),
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 13, color: "#e0e0e0" } }, it.name),
                    React.createElement("div", { className: "mono", style: { fontSize: 10, color: "#555", marginTop: 3 } }, "Generated " + it.time)
                  )
                ),
                React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
                  React.createElement("span", { className: "pill pill-gr" }, it.status),
                  React.createElement("button", { className: "btn-ghost", style: { padding: "6px 12px", fontSize: 11 } }, "Preview"),
                  React.createElement("button", { className: "btn", style: { padding: "6px 12px", fontSize: 11 } }, "Approve")
                )
              );
            })
          );
        })
      ),

      // ════════ AUDIT EVIDENCE ════════
      tab === "audit" && React.createElement("div", null,
        React.createElement("div", { style: { marginBottom: 18 } },
          React.createElement("h2", { style: { fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 4 } }, "Audit Evidence Binder"),
          React.createElement("div", { style: { fontSize: 12, color: "#666" } }, "Continuous PBC assembly · 10 audit areas")
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 } },
          React.createElement("div", { className: "panel", style: { overflow: "hidden" } },
            AUDIT_AREAS.map(function (a) {
              var active = expArea === a.area;
              return React.createElement("div", {
                key: a.area,
                style: { padding: "14px 18px", borderBottom: "1px solid #15171a", cursor: "pointer", background: active ? "#131416" : "transparent", borderLeft: active ? "2px solid #00e5a0" : "2px solid transparent", transition: "all .15s" },
                onClick: function () { setExpArea(a.area); }
              },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
                  React.createElement("div", { style: { fontSize: 13, fontWeight: 500, color: "#e0e0e0" } }, a.area),
                  React.createElement("div", { className: "mono", style: { fontSize: 11, color: a.pct >= 90 ? "#00e5a0" : a.pct >= 75 ? "#ff8c00" : "#cc3333", fontWeight: 600 } }, a.pct + "%")
                ),
                React.createElement("div", { className: "prog" },
                  React.createElement("div", { className: "prog-bar" + (a.pct < 90 ? " am" : ""), style: { width: a.pct + "%" } })
                ),
                React.createElement("div", { className: "mono", style: { fontSize: 10, color: "#555", marginTop: 6 } }, a.collected + " collected · " + a.needed + " needed")
              );
            })
          ),
          React.createElement("div", { className: "panel", style: { padding: 22 } },
            (function () {
              var area = AUDIT_AREAS.find(function (a) { return a.area === expArea; });
              return React.createElement("div", null,
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 } },
                  React.createElement("div", null,
                    React.createElement("div", { className: "sect-h", style: { margin: 0 } }, "EVIDENCE INDEX"),
                    React.createElement("h3", { style: { fontSize: 20, fontWeight: 600, color: "#fff", marginTop: 8 } }, area.area)
                  ),
                  React.createElement("span", { className: "pill " + (area.pct >= 90 ? "pill-em" : "pill-am") },
                    React.createElement("span", { className: "dot " + (area.pct >= 90 ? "dot-em" : "dot-am") }),
                    area.pct + "% complete"
                  )
                ),
                area.items.map(function (it, ii) {
                  return React.createElement("div", { key: ii, style: { padding: "12px 0", borderBottom: ii < area.items.length - 1 ? "1px solid #15171a" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
                      React.createElement("span", { className: "dot dot-em" }),
                      React.createElement("span", { style: { fontSize: 13, color: "#ccc" } }, it)
                    ),
                    React.createElement("div", { className: "mono", style: { fontSize: 10, color: "#555" } }, "WP-" + (Math.floor(Math.random() * 900) + 100))
                  );
                })
              );
            })()
          )
        )
      )
    ),

    // ─── SLIDE-OVER ───
    slide && React.createElement("div", null,
      React.createElement("div", { className: "overlay", onClick: function () { setSlide(null); } }),
      React.createElement("div", { className: "slide-over" },
        React.createElement("div", { style: { padding: 24, borderBottom: "1px solid #1a1c1e", display: "flex", justifyContent: "space-between", alignItems: "center" } },
          React.createElement("div", { className: "sect-h", style: { margin: 0 } }, slide.kind === "recon" ? "RECONCILIATION DETAIL" : "JOURNAL ENTRY DETAIL"),
          React.createElement("button", { onClick: function () { setSlide(null); }, style: { background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 22, lineHeight: 1 } }, "×")
        ),
        slide.kind === "recon" && React.createElement("div", { style: { padding: 24 } },
          React.createElement("div", { className: "mono", style: { fontSize: 11, color: "#888", marginBottom: 4 } }, "ACCT " + slide.data.acct),
          React.createElement("h3", { style: { fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 18 } }, slide.data.name),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 } },
            React.createElement("div", { className: "kpi", style: { padding: 16 } },
              React.createElement("div", { className: "kpi-label" }, "GL Balance"),
              React.createElement("div", { className: "mono", style: { fontSize: 18, color: "#fff", marginTop: 6 } }, "$" + fmt(slide.data.gl))
            ),
            React.createElement("div", { className: "kpi", style: { padding: 16 } },
              React.createElement("div", { className: "kpi-label" }, "Sub-ledger"),
              React.createElement("div", { className: "mono", style: { fontSize: 18, color: "#fff", marginTop: 6 } }, "$" + fmt(slide.data.sub))
            )
          ),
          React.createElement("div", { className: "ai-block" },
            React.createElement("span", { className: "ai-tag" }, "AI RESOLUTION PROPOSAL"),
            slide.data.status === "Complete"
              ? "All transactions matched. " + Math.round(slide.data.gl / 10000) + " items reconciled across the GL and sub-ledger. No outstanding differences. Confidence: " + slide.data.conf + "%."
              : slide.data.status === "Exception"
                ? "Variance of $" + fmt(Math.abs(slide.data.gl - slide.data.sub)) + " identified. Likely cause: timing difference between sub-ledger posting and GL update for in-transit transactions. Recommend acceptance pending sub-ledger refresh tomorrow morning."
                : "Manual review required. AI confidence below acceptable threshold. Sub-ledger contains contract modifications that may impact recognition timing under ASC 606. Controller judgment needed."
          ),
          React.createElement("div", { style: { fontSize: 11, color: "#666", marginBottom: 14, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600 } }, "Supporting Evidence"),
          React.createElement("div", { style: { fontSize: 12, color: "#aaa", lineHeight: 1.8, marginBottom: 22 } },
            "• GL detail report (" + Math.round(slide.data.gl / 50000) + " transactions)", React.createElement("br"),
            "• Sub-ledger extract dated 2026-03-31", React.createElement("br"),
            "• Bank confirmation / vendor statement", React.createElement("br"),
            "• Prior period reconciliation"
          ),
          React.createElement("div", { style: { display: "flex", gap: 10 } },
            React.createElement("button", { className: "btn" }, "Approve"),
            React.createElement("button", { className: "btn-ghost" }, "Reassign"),
            React.createElement("button", { className: "btn-rd" }, "Reject")
          )
        ),
        slide.kind === "je" && React.createElement("div", { style: { padding: 24 } },
          React.createElement("div", { className: "mono", style: { fontSize: 11, color: "#888", marginBottom: 4 } }, slide.data.num),
          React.createElement("h3", { style: { fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 18 } }, slide.data.desc),
          React.createElement("div", { className: "panel", style: { padding: 16, marginBottom: 18 } },
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, fontSize: 12, paddingBottom: 10, borderBottom: "1px solid #15171a", color: "#666", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, fontSize: 9 } },
              React.createElement("div", null, "Account"),
              React.createElement("div", { style: { textAlign: "right" } }, "Debit"),
              React.createElement("div", { style: { textAlign: "right" } }, "Credit")
            ),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "10px 0", fontSize: 12, alignItems: "center" } },
              React.createElement("div", { style: { color: "#ccc" } }, slide.data.dr),
              React.createElement("div", { className: "mono", style: { textAlign: "right", color: "#fff" } }, "$" + fmt(slide.data.amt)),
              React.createElement("div", { className: "mono", style: { textAlign: "right", color: "#444" } }, "—")
            ),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "10px 0", fontSize: 12, alignItems: "center", borderTop: "1px solid #15171a" } },
              React.createElement("div", { style: { color: "#ccc" } }, slide.data.cr),
              React.createElement("div", { className: "mono", style: { textAlign: "right", color: "#444" } }, "—"),
              React.createElement("div", { className: "mono", style: { textAlign: "right", color: "#fff" } }, "$" + fmt(slide.data.amt))
            )
          ),
          React.createElement("div", { className: "ai-block" },
            React.createElement("span", { className: "ai-tag" }, "CALCULATION LOGIC"),
            slide.data.type + " entry generated by " + slide.data.src + ". Source data pulled from " + slide.data.docs + " supporting document(s) including ERP transactions, contract terms, and historical patterns. Full audit trail available on approval."
          ),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 } },
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 } }, "Type"),
              React.createElement("div", { style: { fontSize: 13, color: "#ccc" } }, slide.data.type)
            ),
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 } }, "Supporting Docs"),
              React.createElement("div", { style: { fontSize: 13, color: "#ccc" } }, slide.data.docs + " attached")
            )
          ),
          slide.data.status === "Pending" && React.createElement("div", { style: { display: "flex", gap: 10 } },
            React.createElement("button", { className: "btn" }, "Approve"),
            React.createElement("button", { className: "btn-ghost" }, "Edit"),
            React.createElement("button", { className: "btn-rd" }, "Reject")
          )
        )
      )
    )
  );
}
