import React, { useState, useEffect } from "react";

// ============================================================================
// BEFORE: The Manual Monthly Close
// 5 swim lanes, 32 nodes, authentic detail
// ============================================================================

var BEFORE_NODES = [
  // ── SOURCE SYSTEMS (lane -1) — generalized cylinders ──
  { id: "b_erp",     label: "ERP System",              shape: "cylinder", lane: -1, x: 60,   y: 20, w: 140, h: 75, desc: "Core general ledger, sub-ledgers, and chart of accounts.", pain: "Exports are manual and formats vary across modules." },
  { id: "b_bank",    label: "Banking\nPortals",        shape: "cylinder", lane: -1, x: 220,  y: 20, w: 140, h: 75, desc: "Multiple bank portals, one per account.", pain: "Each has different logins, session timeouts, and file formats." },
  { id: "b_ap",      label: "AP / Expense\nPlatform",  shape: "cylinder", lane: -1, x: 380,  y: 20, w: 150, h: 75, desc: "Invoice intake and expense management.", pain: "Late-posting invoices block close every month." },
  { id: "b_payroll", label: "Payroll\nProvider",       shape: "cylinder", lane: -1, x: 550,  y: 20, w: 140, h: 75, desc: "Payroll registers, wage data, tax withholdings.", pain: "Requires separate HR coordination." },
  { id: "b_sub",     label: "Sub-ledgers\n(FA, Rev)",  shape: "cylinder", lane: -1, x: 710,  y: 20, w: 150, h: 75, desc: "Fixed assets, revenue, inventory, lease subledgers.", pain: "Tie-outs to GL done manually in spreadsheets." },
  { id: "b_close",   label: "Close Mgmt\nPlatform",    shape: "cylinder", lane: -1, x: 880,  y: 20, w: 150, h: 75, desc: "Reconciliation and close task tracking.", pain: "Controllers babysit status dashboards instead of reviewing work." },
  { id: "b_hr",      label: "HR / Ops\n(Email)",       shape: "cylinder", lane: -1, x: 1050, y: 20, w: 140, h: 75, desc: "Other departments providing context and backup.", pain: "Communication via email chains and Slack threads." },

  // ── STAFF ACCOUNTANT LANE (lane 0) — Day 1-3 data gathering ──
  { id: "b1",  label: "Export trial\nbalance",        shape: "trapezoid",  lane: 0, x: 40,   y: 135, w: 150, h: 65, time: "45 min",  desc: "Run TB report from ERP, save as CSV.", pain: "Stale by the time export completes." },
  { id: "b2",  label: "Download bank\nstatements",    shape: "trapezoid",  lane: 0, x: 210,  y: 135, w: 150, h: 65, time: "60 min",  desc: "Manually pull statements from each bank portal.", pain: "2FA, session timeouts, inconsistent formats." },
  { id: "b3",  label: "Pull AP aging\n& AR aging",    shape: "trapezoid",  lane: 0, x: 380,  y: 135, w: 150, h: 65, time: "30 min",  desc: "Export payables and receivables agings.", pain: "Unapplied cash and disputes flagged inconsistently." },
  { id: "b4",  label: "Pull payroll\n& benefits",     shape: "trapezoid",  lane: 0, x: 550,  y: 135, w: 150, h: 65, time: "25 min",  desc: "Payroll register, commissions, accruals.", pain: "Off-cycle pay runs create reconciliation gaps." },
  { id: "b5",  label: "Pull FA, rev,\nlease sub-ldgs",shape: "trapezoid",  lane: 0, x: 720,  y: 135, w: 150, h: 65, time: "30 min",  desc: "Fixed asset roll-forward, revenue waterfall, lease amortization.", pain: "Multiple systems, multiple exports, multiple formats." },
  { id: "b6",  label: "Gather open\nPO/accrual data", shape: "trapezoid",  lane: 0, x: 890,  y: 135, w: 150, h: 65, time: "25 min",  desc: "Open purchase orders for accrual calculation.", pain: "Requires email chains with procurement and ops." },
  { id: "b7",  label: "Build recon\nworkpapers",      shape: "rectangle",  lane: 0, x: 1060, y: 135, w: 150, h: 65, time: "4-6 hrs", desc: "Build Excel workpapers for every account.", pain: "VLOOKUP chains break when source data shifts." },

  // ── STAFF ACCOUNTANT — Day 3-5 reconciliation ──
  { id: "b8",  label: "Reconcile cash\n(all accounts)", shape: "rectangle", lane: 0, x: 40,  y: 240, w: 150, h: 65, time: "2-4 hrs", desc: "Match bank transactions to GL line by line.", pain: "Manual matching, outstanding items carried forward for months." },
  { id: "b9",  label: "Reconcile AR\nsub-ldg to GL",   shape: "rectangle", lane: 0, x: 210, y: 240, w: 150, h: 65, time: "1-2 hrs", desc: "Tie AR aging to GL balance, research differences.", pain: "Unapplied cash and credit memos cause timing differences." },
  { id: "b10", label: "Reconcile AP\nsub-ldg to GL",   shape: "rectangle", lane: 0, x: 380, y: 240, w: 150, h: 65, time: "1-2 hrs", desc: "Tie AP aging to GL balance.", pain: "Cutoff errors create phantom variances." },
  { id: "b11", label: "Calc accruals\n& prepaids",     shape: "rectangle", lane: 0, x: 550, y: 240, w: 150, h: 65, time: "2-3 hrs", desc: "Estimate unbilled expenses, amortize prepaids.", pain: "Relies on tribal knowledge of vendor billing cycles." },
  { id: "b12", label: "Tie sub-ledgers\nto GL",        shape: "rectangle", lane: 0, x: 720, y: 240, w: 150, h: 65, time: "2-3 hrs", desc: "Fixed asset, revenue, lease sub-ledger reconciliation.", pain: "One mismatch requires hours of transaction-level investigation." },
  { id: "b13", label: "Identify\nvariances",           shape: "rectangle", lane: 0, x: 890, y: 240, w: 150, h: 65, time: "1-2 hrs", desc: "Flag variances above materiality threshold.", pain: "Thresholds inconsistent across accounts." },

  // ── DECISION: variances need research? (lane 0) ──
  { id: "b14", label: "Variances\nrequire research?", shape: "diamond", lane: 0, x: 890, y: 345, w: 180, h: 95, desc: "Decide which variances need further investigation." },

  // ── HR / OPS lane (lane 1) — blocking waits ──
  { id: "b15", label: "Request backup\nfrom ops/HR",   shape: "trapezoid", lane: 1, x: 890, y: 475, w: 180, h: 65, time: "1-3 day wait", desc: "Email AP, ops, sales, HR for context on flagged items.", pain: "Multiple follow-ups common. A frequent source of close delays." },
  { id: "b16", label: "Wait for\nresponses",           shape: "rectangle", lane: 1, x: 890, y: 560, w: 180, h: 55, desc: "Work is blocked pending responses from other departments.", pain: "Blocks downstream work for 1-3 days." },

  // ── SENIOR ACCOUNTANT lane (lane 2) — Day 5-8 analysis ──
  { id: "b17", label: "Research\nvariances",           shape: "rectangle", lane: 2, x: 40,  y: 640, w: 150, h: 65, time: "3-5 hrs", desc: "Investigate root cause of material variances.", pain: "Requires cross-referencing multiple systems and periods." },
  { id: "b18", label: "Write flux\ncommentary",        shape: "rectangle", lane: 2, x: 210, y: 640, w: 150, h: 65, time: "4-6 hrs", desc: "Draft B/A, PY, forecast variance narratives.", pain: "Writing the same explanations every month with small variations." },
  { id: "b19", label: "Prepare JEs\n(accruals, reclass)", shape: "rectangle", lane: 2, x: 380, y: 640, w: 150, h: 65, time: "2-3 hrs", desc: "Draft journal entries in Excel template.", pain: "Manual calculations, prone to errors." },
  { id: "b20", label: "Route JEs for\napproval (email)", shape: "trapezoid", lane: 2, x: 550, y: 640, w: 150, h: 65, time: "1 day", desc: "Send entries via email for review.", pain: "Approvals stall in inboxes." },
  { id: "b21", label: "Upload JEs\nto ERP",            shape: "trapezoid", lane: 2, x: 720, y: 640, w: 150, h: 65, time: "1-2 hrs", desc: "Manually enter approved JEs into ERP one at a time.", pain: "Upload format errors require rework." },
  { id: "b22", label: "IC elim &\nconsolidation",      shape: "rectangle", lane: 2, x: 890, y: 640, w: 150, h: 65, time: "2-4 hrs", desc: "Match IC balances, draft eliminations, run consolidation.", pain: "FX translation and cutoff differences break consolidation." },
  { id: "b23", label: "Assemble close\nbinder",        shape: "document",  lane: 2, x: 1060, y: 640, w: 150, h: 65, time: "2-3 hrs", desc: "Organize workpapers, schedules, approvals, sign-offs.", pain: "Version control chaos if late entries post." },

  // ── CONTROLLER / CFO lane (lane 3) — Day 8-15 review ──
  { id: "b24", label: "Controller\nreview",            shape: "rectangle", lane: 3, x: 40,  y: 780, w: 150, h: 65, time: "3-5 hrs", desc: "Review every workpaper, JE, and reconciliation.", pain: "Time pressure forces spot-checks instead of full review." },
  { id: "b25", label: "Issues\nfound?",                shape: "diamond",   lane: 3, x: 210, y: 775, w: 170, h: 90, desc: "Controller identifies errors or missing support." },
  { id: "b26", label: "Draft financial\nstatements",   shape: "document",  lane: 3, x: 400, y: 780, w: 150, h: 65, time: "3-4 hrs", desc: "Format BS, IS, CF statements and footnotes.", pain: "Manual cross-referencing and tie-outs." },
  { id: "b27", label: "Build mgmt\nreporting pkg",     shape: "document",  lane: 3, x: 570, y: 780, w: 150, h: 65, time: "3-5 hrs", desc: "KPI dashboard, department P&Ls, trend analysis.", pain: "Copy-paste from Excel into slides." },
  { id: "b28", label: "Build board\ndeck",             shape: "document",  lane: 3, x: 740, y: 780, w: 150, h: 65, time: "2-4 hrs", desc: "Investor and board presentation.", pain: "One late adjustment ripples through every slide." },
  { id: "b29", label: "CFO review\n& sign-off",        shape: "rectangle", lane: 3, x: 910, y: 780, w: 150, h: 65, time: "2-3 hrs", desc: "Final executive review and approval.", pain: "Requires meetings and walkthroughs." },
  { id: "b30", label: "CLOSE\nCOMPLETE",               shape: "pill",      lane: 3, x: 1080, y: 785, w: 150, h: 55, time: "Day 12-18", desc: "Books closed. Next close starts in ~10 business days." }
];
var BEFORE_EDGES = [
  // sources to staff acct
  { from: "b_erp",    to: "b1" }, { from: "b_bank", to: "b2" }, { from: "b_ap", to: "b3" },
  { from: "b_payroll", to: "b4" }, { from: "b_sub", to: "b5" }, { from: "b_close", to: "b7" },
  // gathering to recs
  { from: "b1", to: "b8" }, { from: "b2", to: "b8" }, { from: "b3", to: "b9" }, { from: "b3", to: "b10" },
  { from: "b4", to: "b11" }, { from: "b5", to: "b12" }, { from: "b6", to: "b11" }, { from: "b7", to: "b13" },
  // recs to variance decision
  { from: "b8",  to: "b13" }, { from: "b9", to: "b13" }, { from: "b10", to: "b13" },
  { from: "b11", to: "b13" }, { from: "b12", to: "b13" },
  { from: "b13", to: "b14" },
  // decision splits
  { from: "b14", to: "b15", label: "Yes", type: "rework" },
  { from: "b_hr", to: "b15" },
  { from: "b15", to: "b16", type: "dashed", label: "BLOCKED" },
  { from: "b16", to: "b17", type: "dashed" },
  { from: "b14", to: "b17", label: "No" },
  // senior acct chain
  { from: "b17", to: "b18" }, { from: "b18", to: "b19" }, { from: "b19", to: "b20" },
  { from: "b20", to: "b21" }, { from: "b21", to: "b22" }, { from: "b22", to: "b23" },
  // controller chain
  { from: "b23", to: "b24" }, { from: "b24", to: "b25" },
  { from: "b25", to: "b17", label: "Yes", type: "rework" },
  { from: "b25", to: "b26", label: "No" },
  { from: "b26", to: "b27" }, { from: "b27", to: "b28" }, { from: "b28", to: "b29" }, { from: "b29", to: "b30" }
];

// ============================================================================
// AFTER: KnightLedger AI-Powered Close
// 3 lanes, 9 consolidated nodes — showing engine architecture, not a task list
// ============================================================================

var AFTER_NODES = [
  // ── SOURCE SYSTEMS (lane -1) — your existing infrastructure, connected ──
  { id: "a_erp",     label: "ERP System",              shape: "cylinder", lane: -1, x: 60,   y: 20, w: 140, h: 70, badge: "API", desc: "Your existing ERP, connected through authorized channels.", auto: "Same system your team uses today." },
  { id: "a_bank",    label: "Banking",                 shape: "cylinder", lane: -1, x: 220,  y: 20, w: 140, h: 70, badge: "API", desc: "Bank transaction data through authenticated connections.", auto: "Continuous sync within existing banking integrations." },
  { id: "a_ap",      label: "AP / Expense\nPlatform",  shape: "cylinder", lane: -1, x: 380,  y: 20, w: 150, h: 70, badge: "API", desc: "Your existing AP and expense management platform.", auto: "Invoices processed as they arrive." },
  { id: "a_payroll", label: "Payroll\nProvider",       shape: "cylinder", lane: -1, x: 550,  y: 20, w: 140, h: 70, badge: "API", desc: "Payroll provider integration for register and wage data.", auto: "Synced on the provider's schedule." },
  { id: "a_sub",     label: "Sub-ledgers",             shape: "cylinder", lane: -1, x: 710,  y: 20, w: 140, h: 70, badge: "API", desc: "Fixed assets, revenue, lease, and other sub-ledgers.", auto: "Continuous tie-out to the general ledger." },
  { id: "a_close",   label: "Close Mgmt\nPlatform",    shape: "cylinder", lane: -1, x: 870,  y: 20, w: 150, h: 70, badge: "API", desc: "Your existing close management platform.", auto: "Output written into the tool your team already uses." },

  // ── AI ENGINE LANE (lane 0) — 5 engines + decision gate ──
  { id: "a1", label: "Data Integration", shape: "hex", lane: 0, x: 60,  y: 145, w: 290, h: 90, time: "continuous", badge: "AI", desc: "Continuously pulls trial balances, bank feeds, AP/AR agings, payroll registers, and sub-ledger data from every connected source. Normalizes formats across systems, validates completeness, runs data quality checks, and flags anomalies before close begins.", auto: "Runs throughout the period \u2014 data is clean and ready on day one." },

  { id: "a2", label: "Reconciliation Engine", shape: "hex", lane: 0, x: 380, y: 145, w: 290, h: 90, time: "minutes", badge: "AI", desc: "Reconciles every balance sheet account in parallel \u2014 cash across all bank accounts, AR and AP sub-ledgers to GL, fixed assets, prepaids, accruals, and intercompany. Matches transactions across systems, categorizes timing differences, resolves known patterns automatically, and surfaces true exceptions with proposed entries.", auto: "Full balance sheet reconciled simultaneously." },

  { id: "a3", label: "Adjustment Engine", shape: "hex", lane: 0, x: 700, y: 145, w: 290, h: 90, time: "minutes", badge: "AI", desc: "Drafts every journal entry the close requires \u2014 accruals from open POs and contracts, prepaid amortization, revenue deferrals, reclassifications, and standard month-end adjustments. Each entry calculated from source data with full supporting documentation, audit trail, and historical comparison.", auto: "Entries queued for approval with calculation logic and evidence attached." },

  { id: "a4", label: "Consolidation & Close", shape: "hex", lane: 0, x: 60,  y: 275, w: 290, h: 90, time: "minutes", badge: "AI", desc: "Matches intercompany balances across all entities, generates elimination entries, applies currency translation, runs consolidation, and validates tie-outs. Surfaces IC mismatches and cutoff differences before close so nothing blocks the final package.", auto: "Consolidation runs automatically once sub-entities close." },

  { id: "a5", label: "Reporting & Evidence", shape: "hex", lane: 0, x: 380, y: 275, w: 290, h: 90, time: "minutes", badge: "AI", desc: "Generates complete financial statements, flux and variance commentary, management reporting packages, board decks, and audit-ready workpapers. Every figure traced to source data. All outputs are data-linked \u2014 one late adjustment updates everything simultaneously.", auto: "Financials, commentary, and audit evidence produced together." },

  { id: "a6", label: "Exceptions for\nreview?", shape: "diamond", lane: 0, x: 735, y: 275, w: 220, h: 95, badge: "AI", desc: "Isolates items that call for human judgment \u2014 unusual transactions, materiality edge cases, policy exceptions, and flagged anomalies.", auto: "Routed by materiality and confidence." },

  // ── CONTROLLER LANE (lane 1) — review and approve ──
  { id: "a7", label: "Review exceptions\nin close dashboard", shape: "rectangle", lane: 1, x: 100, y: 460, w: 300, h: 80, time: "hours", badge: "HUMAN", desc: "Close dashboard surfaces reconciliations, journal entries, and commentary for review. Exceptions and judgment calls are flagged \u2014 everything else is prepared and documented." },

  { id: "a8", label: "Sign off\nin close dashboard", shape: "rectangle", lane: 1, x: 460, y: 460, w: 260, h: 80, time: "hours", badge: "HUMAN", desc: "Controller signs off on the complete close package directly in the dashboard \u2014 financial statements, reporting, and supporting workpapers in one view." },

  { id: "a9", label: "CLOSE\nCOMPLETE", shape: "pill", lane: 1, x: 760, y: 470, w: 180, h: 60, time: "Day 2-3", desc: "Close is complete, reviewed, and documented." }
];

var AFTER_EDGES = [
  // sources to data integration
  { from: "a_erp", to: "a1" }, { from: "a_bank", to: "a1" }, { from: "a_ap", to: "a1" },
  { from: "a_payroll", to: "a1" }, { from: "a_sub", to: "a1" },
  // AI engine chain
  { from: "a1", to: "a2" }, { from: "a2", to: "a3" },
  { from: "a3", to: "a4" }, { from: "a4", to: "a5" }, { from: "a5", to: "a6" },
  // writeback to close platform
  { from: "a5", to: "a_close" },
  // to controller
  { from: "a6", to: "a7", label: "Flagged" },
  { from: "a7", to: "a8" }, { from: "a8", to: "a9" }
];
// ============================================================================
// RENDERING
// ============================================================================

var BEFORE_LANES = [
  { name: "SOURCE SYSTEMS", y: 0,   h: 115 },
  { name: "STAFF ACCT",     y: 115, h: 215 },
  { name: "HR / OPS",       y: 450, h: 170 },
  { name: "SENIOR ACCT",    y: 620, h: 125 },
  { name: "CONTROLLER",     y: 755, h: 120 }
];

var AFTER_LANES = [
  { name: "SOURCE SYSTEMS", y: 0,   h: 115 },
  { name: "AI ENGINES",     y: 115, h: 310 },
  { name: "CONTROLLER",     y: 425, h: 160 }
];

function renderNode(node, onClick, selected) {
  var isBefore = node.type !== "after" && !node.badge || (node.badge !== "AI" && node.badge !== "HUMAN" && node.badge !== "API");
  // Determine if before/after based on id prefix
  isBefore = node.id[0] === "b";

  var w = node.w, h = node.h;
  var bg, borderColor, textColor, timeColor;

  if (isBefore) {
    bg = node.shape === "cylinder" ? "#2e2a38" : "#242431";
    borderColor = node.pain ? "#ff8c00aa" : "#555";
    textColor = "#ccc";
    timeColor = "#ff8c00";
  } else {
    if (node.badge === "HUMAN") {
      bg = "#0d1a14";
      borderColor = "#00e5a0";
    } else {
      bg = "#0a1210";
      borderColor = "#00e5a0aa";
    }
    textColor = "#fff";
    timeColor = "#00e5a0";
  }

  var isSelected = selected === node.id;
  var boxShadow = isSelected
    ? (isBefore ? "0 0 0 2px #ff8c00, 0 0 20px rgba(255,140,0,.4)" : "0 0 0 2px #00e5a0, 0 0 25px rgba(0,229,160,.5)")
    : (isBefore ? "none" : "0 0 12px rgba(0,229,160,.1)");

  var baseStyle = {
    position: "absolute", left: node.x, top: node.y, width: w, height: h,
    cursor: "pointer", zIndex: 10, transition: "all .2s",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "6px 10px", boxSizing: "border-box", boxShadow: boxShadow
  };

  var textEl = React.createElement("div", {
    style: {
      fontSize: 10.5, lineHeight: 1.25, color: textColor, fontWeight: isBefore ? 400 : 500,
      whiteSpace: "pre-line", textAlign: "center", fontFamily: "'DM Sans',sans-serif"
    }
  }, node.label);

  var timeEl = node.time ? React.createElement("div", {
    style: {
      fontSize: 9, marginTop: 3, fontFamily: "'JetBrains Mono',monospace",
      color: timeColor, fontWeight: 600
    }
  }, node.time) : null;

  var badgeEl = node.badge ? React.createElement("div", {
    style: {
      position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
      padding: "2px 8px", fontSize: 8, fontWeight: 700, letterSpacing: ".05em",
      borderRadius: 12, border: "1px solid #00e5a0",
      background: node.badge === "HUMAN" ? "#00e5a0" : "#050908",
      color: node.badge === "HUMAN" ? "#08090b" : "#00e5a0",
      zIndex: 20, whiteSpace: "nowrap"
    }
  }, node.badge) : null;

  var inner = React.createElement("div", {
    style: {
      position: "relative", zIndex: 2, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", width: "100%", height: "100%"
    }
  }, textEl, timeEl);

  // CYLINDER
  if (node.shape === "cylinder") {
    var ry = 10;
    var topFill = isBefore ? "#3a3245" : "#0d2018";
    return React.createElement("div", {
      key: node.id, className: "kl-node", onClick: function() { onClick(node); },
      style: Object.assign({}, baseStyle, { padding: 0, background: "transparent", boxShadow: "none" })
    },
      badgeEl,
      React.createElement("svg", { width: w, height: h, style: { position: "absolute", top: 0, left: 0 } },
        React.createElement("ellipse", { cx: w/2, cy: ry, rx: w/2 - 1, ry: ry, fill: bg, stroke: borderColor, strokeWidth: 1.5 }),
        React.createElement("line", { x1: 1, y1: ry, x2: 1, y2: h - ry, stroke: borderColor, strokeWidth: 1.5 }),
        React.createElement("line", { x1: w - 1, y1: ry, x2: w - 1, y2: h - ry, stroke: borderColor, strokeWidth: 1.5 }),
        React.createElement("path", { d: "M 1 " + ry + " Q 1 " + (h - ry) + " " + (w/2) + " " + (h - 1) + " Q " + (w - 1) + " " + (h - ry) + " " + (w - 1) + " " + ry, fill: bg, stroke: "none" }),
        React.createElement("path", { d: "M 1 " + (h - ry) + " Q " + (w/2) + " " + (h + ry/2) + " " + (w - 1) + " " + (h - ry), fill: "none", stroke: borderColor, strokeWidth: 1.5 }),
        React.createElement("ellipse", { cx: w/2, cy: ry, rx: w/2 - 4, ry: ry - 2, fill: topFill, stroke: "none" })
      ),
      React.createElement("div", { style: { position: "relative", zIndex: 2, paddingTop: ry + 2 } },
        React.createElement("div", { style: { fontSize: 10, lineHeight: 1.25, color: textColor, fontWeight: 500, whiteSpace: "pre-line", textAlign: "center", fontFamily: "'DM Sans',sans-serif" } }, node.label)
      )
    );
  }

  // DIAMOND
  if (node.shape === "diamond") {
    return React.createElement("div", {
      key: node.id, className: "kl-node", onClick: function() { onClick(node); },
      style: Object.assign({}, baseStyle, { background: "transparent", padding: 0, boxShadow: "none" })
    },
      badgeEl,
      React.createElement("svg", { width: w, height: h, style: { position: "absolute", top: 0, left: 0, filter: isSelected ? "drop-shadow(0 0 8px " + (isBefore ? "#ff8c00" : "#00e5a0") + ")" : "none" } },
        React.createElement("polygon", {
          points: (w/2) + ",2 " + (w - 2) + "," + (h/2) + " " + (w/2) + "," + (h - 2) + " 2," + (h/2),
          fill: bg, stroke: borderColor, strokeWidth: 1.8
        })
      ),
      inner
    );
  }

  // TRAPEZOID (manual operation)
  if (node.shape === "trapezoid") {
    return React.createElement("div", {
      key: node.id, className: "kl-node", onClick: function() { onClick(node); },
      style: Object.assign({}, baseStyle, { background: "transparent", padding: 0, boxShadow: "none" })
    },
      badgeEl,
      React.createElement("svg", { width: w, height: h, style: { position: "absolute", top: 0, left: 0, filter: isSelected ? "drop-shadow(0 0 8px " + (isBefore ? "#ff8c00" : "#00e5a0") + ")" : "none" } },
        React.createElement("polygon", {
          points: "12,2 " + (w - 12) + ",2 " + (w - 2) + "," + (h - 2) + " 2," + (h - 2),
          fill: bg, stroke: borderColor, strokeWidth: 1.5
        })
      ),
      inner
    );
  }

  // DOCUMENT
  if (node.shape === "document") {
    return React.createElement("div", {
      key: node.id, className: "kl-node", onClick: function() { onClick(node); },
      style: Object.assign({}, baseStyle, { background: "transparent", padding: 0, boxShadow: "none" })
    },
      badgeEl,
      React.createElement("svg", { width: w, height: h + 8, style: { position: "absolute", top: 0, left: 0, filter: isSelected ? "drop-shadow(0 0 8px " + (isBefore ? "#ff8c00" : "#00e5a0") + ")" : "none" } },
        React.createElement("path", {
          d: "M 2 2 L " + (w - 2) + " 2 L " + (w - 2) + " " + (h - 6) + " Q " + (w * 0.75) + " " + (h + 4) + " " + (w/2) + " " + (h - 4) + " Q " + (w * 0.25) + " " + (h - 12) + " 2 " + (h - 4) + " Z",
          fill: bg, stroke: borderColor, strokeWidth: 1.5
        })
      ),
      inner
    );
  }

  // PILL (terminator)
  if (node.shape === "pill") {
    return React.createElement("div", {
      key: node.id, className: "kl-node", onClick: function() { onClick(node); },
      style: Object.assign({}, baseStyle, { background: bg, border: "2px solid " + borderColor, borderRadius: 999 })
    }, badgeEl, inner);
  }

  // DOUBLE-BORDER (predefined process)
  if (node.shape === "double") {
    return React.createElement("div", {
      key: node.id, className: "kl-node", onClick: function() { onClick(node); },
      style: Object.assign({}, baseStyle, { background: bg, border: "4px double " + borderColor, borderRadius: 4 })
    }, badgeEl, inner);
  }

  // HEX (AI engine — futuristic hexagon)
  if (node.shape === "hex") {
    var hexInset = 18;
    var hexPath = "M " + hexInset + ",2 L " + (w - hexInset) + ",2 L " + (w - 2) + "," + (h/2) + " L " + (w - hexInset) + "," + (h - 2) + " L " + hexInset + "," + (h - 2) + " L 2," + (h/2) + " Z";
    return React.createElement("div", {
      key: node.id, className: "kl-node", onClick: function() { onClick(node); },
      style: Object.assign({}, baseStyle, { background: "transparent", padding: 0, boxShadow: "none" })
    },
      badgeEl,
      React.createElement("svg", {
        width: w, height: h,
        style: {
          position: "absolute", top: 0, left: 0,
          filter: isSelected ? "drop-shadow(0 0 10px " + borderColor + ")" : "drop-shadow(0 0 6px rgba(0,229,160,.15))"
        }
      },
        // outer hex
        React.createElement("path", {
          d: hexPath, fill: bg, stroke: borderColor, strokeWidth: 2
        }),
        // inner accent line (futuristic detail)
        React.createElement("path", {
          d: "M " + (hexInset + 6) + ",6 L " + (w - hexInset - 6) + ",6",
          stroke: "rgba(0,229,160,.4)", strokeWidth: 1, fill: "none"
        }),
        React.createElement("path", {
          d: "M " + (hexInset + 6) + "," + (h - 6) + " L " + (w - hexInset - 6) + "," + (h - 6),
          stroke: "rgba(0,229,160,.4)", strokeWidth: 1, fill: "none"
        })
      ),
      inner
    );
  }

  // RECTANGLE (default)
  return React.createElement("div", {
    key: node.id, className: "kl-node", onClick: function() { onClick(node); },
    style: Object.assign({}, baseStyle, { background: bg, border: "2px solid " + borderColor, borderRadius: 4 })
  }, badgeEl, inner);
}
function getAnchor(node, side) {
  var w = node.w, h = node.h;
  if (side === "bottom") return { x: node.x + w/2, y: node.y + h };
  if (side === "top")    return { x: node.x + w/2, y: node.y };
  if (side === "left")   return { x: node.x,        y: node.y + h/2 };
  if (side === "right")  return { x: node.x + w,    y: node.y + h/2 };
  return { x: node.x + w/2, y: node.y + h/2 };
}

function buildPath(from, to) {
  // Orthogonal routing
  var dx = to.x - from.x;
  var dy = to.y - from.y;

  if (Math.abs(dx) < 5) {
    return "M " + from.x + " " + from.y + " L " + to.x + " " + to.y;
  }
  if (Math.abs(dy) < 5) {
    return "M " + from.x + " " + from.y + " L " + to.x + " " + to.y;
  }
  var midY = from.y + dy * 0.5;
  return "M " + from.x + " " + from.y + " L " + from.x + " " + midY + " L " + to.x + " " + midY + " L " + to.x + " " + to.y;
}

function renderEdges(nodes, edges, isBefore) {
  var byId = {};
  nodes.forEach(function(n) { byId[n.id] = n; });

  return React.createElement("svg", {
    style: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }
  },
    React.createElement("defs", null,
      React.createElement("marker", { id: isBefore ? "arr-b" : "arr-a", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" },
        React.createElement("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: isBefore ? "#555" : "rgba(0,229,160,.6)" })
      ),
      React.createElement("marker", { id: "arr-rework", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" },
        React.createElement("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#cc3333" })
      )
    ),
    edges.map(function(edge, i) {
      var from = byId[edge.from], to = byId[edge.to];
      if (!from || !to) return null;

      // Choose anchor points based on relative position
      var fromSide = "bottom", toSide = "top";
      if (from.lane === to.lane) {
        if (to.x > from.x + from.w) { fromSide = "right"; toSide = "left"; }
        else if (to.x + to.w < from.x) { fromSide = "left"; toSide = "right"; }
      } else if (to.lane < from.lane) {
        fromSide = "top"; toSide = "bottom";
      }

      var a = getAnchor(from, fromSide);
      var b = getAnchor(to, toSide);
      var d = buildPath(a, b);

      var stroke = edge.type === "rework" ? "#cc3333" : (isBefore ? "#555" : "rgba(0,229,160,.5)");
      var marker = edge.type === "rework" ? "url(#arr-rework)" : "url(#" + (isBefore ? "arr-b" : "arr-a") + ")";
      var dash = edge.type === "dashed" ? "4,4" : "none";

      return React.createElement("g", { key: "e" + i },
        React.createElement("path", {
          d: d, fill: "none", stroke: stroke, strokeWidth: 1.6,
          strokeDasharray: dash, markerEnd: marker
        }),
        edge.label ? React.createElement("text", {
          x: (a.x + b.x) / 2 + 6, y: (a.y + b.y) / 2 - 4,
          fill: edge.type === "rework" ? "#cc3333" : (isBefore ? "#888" : "#00e5a0"),
          fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace"
        }, edge.label) : null
      );
    })
  );
}

function renderLanes(lanes, isBefore) {
  return lanes.map(function(lane, i) {
    return React.createElement("div", {
      key: "lane" + i,
      style: {
        position: "absolute", top: lane.y, left: 0, right: 0, height: lane.h,
        borderBottom: "1px solid " + (isBefore ? "#2a2a35" : "rgba(0,229,160,.1)"),
        background: i % 2 === 0 ? "transparent" : (isBefore ? "rgba(255,255,255,.01)" : "rgba(0,229,160,.015)")
      }
    },
      React.createElement("div", {
        style: {
          position: "absolute", left: 0, top: 0, bottom: 0, width: 32,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRight: "1px solid " + (isBefore ? "#2a2a35" : "rgba(0,229,160,.15)"),
          background: isBefore ? "#15151a" : "rgba(0,229,160,.03)"
        }
      },
        React.createElement("div", {
          style: {
            fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
            color: isBefore ? "#666" : "#00e5a0",
            transform: "rotate(-90deg)", whiteSpace: "nowrap",
            letterSpacing: ".1em", fontWeight: 600
          }
        }, lane.name)
      )
    );
  });
}
// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MonthlyCloseFlowchart() {
  var _view = useState("split");
  var view = _view[0], setView = _view[1];
  var _sel = useState(null);
  var selected = _sel[0], setSelected = _sel[1];

  useEffect(function() {
    var link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    var style = document.createElement("style");
    style.innerHTML = [
      "@keyframes kl-pulse-border {",
      "  0%, 100% { box-shadow: 0 0 0 1px rgba(0,229,160,.4), 0 0 30px rgba(0,229,160,.12), 0 30px 80px rgba(0,0,0,.6), 0 8px 24px rgba(0,0,0,.5); }",
      "  50% { box-shadow: 0 0 0 1px rgba(0,229,160,.7), 0 0 60px rgba(0,229,160,.25), 0 30px 80px rgba(0,0,0,.6), 0 8px 24px rgba(0,0,0,.5); }",
      "}",
      "@keyframes kl-float {",
      "  0%, 100% { transform: translateY(0); }",
      "  50% { transform: translateY(-4px); }",
      "}",
      ".kl-canvas-before, .kl-canvas-after {",
      "  transform-style: preserve-3d;",
      "  transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease;",
      "  will-change: transform;",
      "}",
      ".kl-canvas-before {",
      "  box-shadow: 0 2px 4px rgba(0,0,0,.4), 0 12px 32px rgba(0,0,0,.5), 0 32px 80px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.03);",
      "}",
      ".kl-canvas-after {",
      "  animation: kl-pulse-border 4s ease-in-out infinite;",
      "}",
      ".kl-mode-compare .kl-canvas-before { transform: perspective(2400px) rotateY(-3deg) rotateX(2deg) translateZ(0); }",
      ".kl-mode-compare .kl-canvas-after  { transform: perspective(2400px) rotateY(3deg) rotateX(2deg) translateZ(20px); }",
      ".kl-mode-manual .kl-canvas-before { transform: perspective(2400px) rotateX(1deg) translateZ(40px); }",
      ".kl-mode-automated .kl-canvas-after { transform: perspective(2400px) rotateX(1deg) translateZ(40px); }",
      ".kl-canvas-wrap { perspective: 2400px; padding: 20px 0; }",
      ".kl-node { transition: transform 0.2s ease, filter 0.25s ease; }",
      ".kl-node:hover { transform: scale(1.06); filter: brightness(1.2) drop-shadow(0 8px 16px rgba(0,0,0,.6)); z-index: 50 !important; }",
      ".kl-toggle-btn { transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }",
      ".kl-toggle-btn:hover { color: #fff !important; }",
      ".kl-badge-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }",
      ".kl-badge-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.4), 0 0 0 1px rgba(0,229,160,.15); }"
    ].join("\n");
    document.head.appendChild(style);

    return function() {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  var selectNode = function(node) {
    if (selected && selected.id === node.id) setSelected(null);
    else setSelected(node);
  };

  var beforeCanvas = React.createElement("div", {
    className: "kl-canvas-before",
    style: {
      position: "relative", width: 1250, height: 875,
      background: "#111115", borderRadius: 12,
      border: "1px solid #2a2a35", flexShrink: 0, overflow: "hidden"
    }
  },
    renderLanes(BEFORE_LANES, true),
    renderEdges(BEFORE_NODES, BEFORE_EDGES, true),
    BEFORE_NODES.map(function(n) { return renderNode(n, selectNode, selected && selected.id); })
  );

  var afterCanvas = React.createElement("div", {
    className: "kl-canvas-after",
    style: {
      position: "relative", width: 1250, height: 585,
      background: "#08090b", borderRadius: 12,
      border: "1px solid rgba(0,229,160,.3)", flexShrink: 0, overflow: "hidden"
    }
  },
    React.createElement("div", {
      style: {
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(0,229,160,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,.025) 1px,transparent 1px)",
        backgroundSize: "32px 32px", pointerEvents: "none"
      }
    }),
    renderLanes(AFTER_LANES, false),
    renderEdges(AFTER_NODES, AFTER_EDGES, false),
    AFTER_NODES.map(function(n) { return renderNode(n, selectNode, selected && selected.id); })
  );
  return React.createElement("div", {
    style: {
      minHeight: "100vh", background: "#08090b", color: "#fff",
      fontFamily: "'DM Sans',sans-serif", padding: "24px 16px 80px"
    }
  },
    // BACK LINK
    React.createElement("div", { style: { maxWidth: 1300, margin: "0 auto 20px" } },
      React.createElement("a", {
        href: "/",
        style: {
          fontSize: 12, fontFamily: "'JetBrains Mono',monospace",
          color: "#555", textDecoration: "none", letterSpacing: ".1em",
          display: "inline-flex", alignItems: "center", gap: 6,
          transition: "color .2s"
        },
        onMouseEnter: function(e) { e.target.style.color = "#00e5a0"; },
        onMouseLeave: function(e) { e.target.style.color = "#555"; }
      }, "\u2190 KNIGHTLEDGER")
    ),
    // HEADER
    React.createElement("div", { style: { maxWidth: 1300, margin: "0 auto 32px", textAlign: "center" } },
      React.createElement("div", {
        style: {
          fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
          color: "#00e5a0", letterSpacing: ".15em", marginBottom: 12
        }
      }, "THE MONTHLY CLOSE"),
      React.createElement("h1", {
        style: {
          fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 700,
          letterSpacing: "-1px", marginBottom: 10, color: "#fff"
        }
      }, "Before vs. After KnightLedger"),
      React.createElement("div", { style: { height: 24 } }),
      // VIEW TOGGLE
      React.createElement("div", {
        style: {
          display: "inline-flex", background: "#111", padding: 4,
          borderRadius: 8, border: "1px solid #222"
        }
      },
        ["split", "before", "after"].map(function(v) {
          var active = view === v;
          var label = v === "split" ? "Compare" : v === "before" ? "Manual" : "Automated";
          return React.createElement("button", {
            key: v, className: "kl-toggle-btn", onClick: function() { setView(v); },
            style: {
              padding: "8px 20px", border: "none", borderRadius: 6,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              background: active ? (v === "after" ? "rgba(0,229,160,.15)" : v === "before" ? "#2a2a35" : "#1a1a22") : "transparent",
              color: active ? (v === "before" ? "#fff" : "#00e5a0") : "#666"
            }
          }, label);
        })
      )
    ),    // STATS — 3 badges: Days to Close, AI Handles, Controller Focus
    React.createElement("div", {
      style: {
        maxWidth: 900, margin: "0 auto 32px",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14
      }
    },
      // BADGE 1: DAYS TO CLOSE
      React.createElement("div", {
        className: "kl-badge-card",
        style: {
          background: "#0f0f14", border: "1px solid #1c1c24",
          padding: "18px 16px", borderRadius: 12, textAlign: "center"
        }
      },
        React.createElement("div", {
          style: {
            fontSize: 10, color: "#666", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 14
          }
        }, "Days to Close"),
        React.createElement("div", {
          style: { display: "flex", alignItems: "baseline", justifyContent: "center", gap: 10 }
        },
          React.createElement("span", {
            style: {
              fontSize: 13, fontFamily: "'JetBrains Mono',monospace",
              color: "#ff8c0099", textDecoration: "line-through"
            }
          }, "12-18"),
          React.createElement("span", { style: { color: "#444", fontSize: 12 } }, "\u2192"),
          React.createElement("span", {
            style: {
              fontSize: 22, fontFamily: "'JetBrains Mono',monospace",
              color: "#00e5a0", fontWeight: 700
            }
          }, "2-3"),
          React.createElement("span", {
            style: { fontSize: 11, color: "#00e5a0", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }
          }, "days")
        )
      ),

      // BADGE 2: AI AUTOMATION
      React.createElement("div", {
        className: "kl-badge-card",
        style: {
          background: "#0f0f14", border: "1px solid #1c1c24",
          padding: "18px 16px", borderRadius: 12, textAlign: "center"
        }
      },
        React.createElement("div", {
          style: {
            fontSize: 10, color: "#666", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 14
          }
        }, "AI Handles"),
        React.createElement("div", {
          style: { display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8 }
        },
          React.createElement("span", {
            style: { fontSize: 22, fontFamily: "'JetBrains Mono',monospace", color: "#00e5a0", fontWeight: 700 }
          }, "100%"),
          React.createElement("span", {
            style: { fontSize: 11, color: "#888", fontFamily: "'DM Sans',sans-serif" }
          }, "of preparation")
        ),
        React.createElement("div", {
          style: { fontSize: 10, color: "#555", marginTop: 8 }
        }, "Reconciliation \u00b7 Adjustments \u00b7 Reporting")
      ),
      // BADGE 3: CONTROLLER FOCUS (visual stacked bars showing shift)
      React.createElement("div", {
        className: "kl-badge-card",
        style: {
          background: "#0f0f14", border: "1px solid #1c1c24",
          padding: "18px 16px", borderRadius: 12
        }
      },
        React.createElement("div", {
          style: {
            fontSize: 10, color: "#666", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 14, textAlign: "center"
          }
        }, "Controller Focus"),
        React.createElement("div", {
          style: { display: "flex", flexDirection: "column", gap: 8 }
        },
          // BEFORE stacked bar: 90% prep / 10% review
          React.createElement("div", null,
            React.createElement("div", {
              style: {
                display: "flex", height: 16, borderRadius: 4, overflow: "hidden",
                border: "1px solid #2a2a35"
              }
            },
              React.createElement("div", {
                style: {
                  width: "90%", background: "#ff8c00", opacity: 0.65,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }
              },
                React.createElement("span", {
                  style: { fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#0a0a0a", fontWeight: 700, letterSpacing: ".05em" }
                }, "DATA PREP")
              ),
              React.createElement("div", {
                style: {
                  width: "10%", background: "#2a2a35"
                }
              })
            )
          ),
          // AFTER stacked bar: 10% setup / 90% review
          React.createElement("div", null,
            React.createElement("div", {
              style: {
                display: "flex", height: 16, borderRadius: 4, overflow: "hidden",
                border: "1px solid rgba(0,229,160,.3)",
                boxShadow: "0 0 10px rgba(0,229,160,.15)"
              }
            },
              React.createElement("div", {
                style: {
                  width: "10%", background: "#2a2a35"
                }
              }),
              React.createElement("div", {
                style: {
                  width: "90%", background: "#00e5a0",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }
              },
                React.createElement("span", {
                  style: { fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: "#0a0a0a", fontWeight: 700, letterSpacing: ".05em" }
                }, "REVIEW & JUDGMENT")
              )
            )
          )
        )
      )
    ),    // CANVASES
    React.createElement("div", {
      className: "kl-canvas-wrap " + (view === "split" ? "kl-mode-compare" : view === "before" ? "kl-mode-manual" : "kl-mode-automated"),
      style: { overflowX: "auto", paddingBottom: 20 }
    },
      React.createElement("div", {
        style: {
          display: "flex", flexDirection: "column", gap: 48,
          width: "max-content", margin: "0 auto", padding: "0 20px"
        }
      },
        (view === "split" || view === "before") ? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          React.createElement("h2", {
            style: { fontSize: 16, fontWeight: 700, color: "#ccc", display: "flex", alignItems: "center", gap: 8, margin: 0 }
          }, "\u26a0 MANUAL CLOSE"),
          beforeCanvas
        ) : null,
        (view === "split" || view === "after") ? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          React.createElement("h2", {
            style: { fontSize: 16, fontWeight: 700, color: "#00e5a0", display: "flex", alignItems: "center", gap: 8, margin: 0 }
          }, "\u26a1 AUTOMATED CLOSE"),
          afterCanvas
        ) : null
      )
    ),
    // DETAIL PANEL
    selected ? React.createElement("div", {
      style: {
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 32px)", maxWidth: 520, zIndex: 100
      }
    },
      React.createElement("div", {
        style: {
          padding: 24, borderRadius: 14,
          background: selected.id[0] === "b" ? "rgba(26,26,34,.97)" : "rgba(10,18,16,.97)",
          border: "1px solid " + (selected.id[0] === "b" ? "rgba(255,140,0,.4)" : "rgba(0,229,160,.5)"),
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,.6)"
        }
      },
        React.createElement("button", {
          onClick: function() { setSelected(null); },
          style: {
            position: "absolute", top: 14, right: 14, background: "none", border: "none",
            color: "#666", cursor: "pointer", fontSize: 18, lineHeight: 1
          }
        }, "\u00d7"),
        React.createElement("div", { style: { marginBottom: 14, paddingRight: 24 } },
          React.createElement("div", {
            style: {
              fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
              color: selected.id[0] === "b" ? "#ff8c00" : "#00e5a0",
              letterSpacing: ".1em", marginBottom: 6
            }
          }, selected.time ? ("TIME \u00b7 " + selected.time) : selected.shape === "cylinder" ? "SOURCE SYSTEM" : selected.shape === "diamond" ? "DECISION" : "STEP"),
          React.createElement("h3", {
            style: { fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.3 }
          }, selected.label.replace(/\n/g, " "))
        ),
        React.createElement("p", {
          style: { fontSize: 13, color: "#aaa", lineHeight: 1.65, marginBottom: 12 }
        }, selected.desc),
        selected.pain ? React.createElement("div", {
          style: {
            background: "rgba(255,140,0,.08)", border: "1px solid rgba(255,140,0,.25)",
            borderRadius: 8, padding: "10px 14px"
          }
        },
          React.createElement("div", {
            style: {
              fontSize: 9, fontFamily: "'JetBrains Mono',monospace",
              color: "#ff8c00", letterSpacing: ".1em", marginBottom: 4, fontWeight: 700
            }
          }, "PAIN POINT"),
          React.createElement("div", {
            style: { fontSize: 12, color: "#ffb870", lineHeight: 1.5 }
          }, selected.pain)
        ) : null,
        selected.auto ? React.createElement("div", {
          style: {
            background: "rgba(0,229,160,.06)", border: "1px solid rgba(0,229,160,.3)",
            borderRadius: 8, padding: "10px 14px"
          }
        },
          React.createElement("div", {
            style: {
              fontSize: 9, fontFamily: "'JetBrains Mono',monospace",
              color: "#00e5a0", letterSpacing: ".1em", marginBottom: 4, fontWeight: 700
            }
          }, "AUTOMATION"),
          React.createElement("div", {
            style: { fontSize: 12, color: "#7fe8c0", lineHeight: 1.5 }
          }, selected.auto)
        ) : null
      )
    ) : null
  );
}
