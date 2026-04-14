import React, { useState, useEffect } from "react";

// ============================================================================
// CASE STUDIES — Field work from real engagements (anonymized)
// ============================================================================

var STUDIES = [
  {
    id: "subscription",
    tag: "CONSUMER / SUBSCRIPTION",
    scope: "Multi-channel revenue architecture",
    title: "Multi-Channel Subscription Revenue Reconciliation",
    subtitle: "A hardware + subscription consumer tech company with revenue flowing through five distinct channels.",
    problem: "Revenue moved through Shopify, Amazon, Chewy, Costco, and a subscription billing platform — each with its own settlement timing, fee structure, refund logic, and reporting format. Every month, the accounting team manually reconciled each channel's payouts to GL revenue, untangling timing differences, processor fees, chargebacks, and the split between one-time hardware revenue and recurring subscription revenue. A single misposted journal entry could sit undetected for weeks.",
    built: "A nine-agent reconciliation architecture. Channel-specific ingestion agents normalize raw data from each platform into a common schema. A matching engine ties settlements to GL activity with confidence scoring, handling the timing offsets and fee structures inherent to each channel. Exceptions route to a reviewer with AI-suggested resolutions — the default mode is exception-only review, not transaction-by-transaction checking. A variance commentary generator drafts the narrative layer the controller would otherwise write from scratch.",
    agents: [
      { n: "01", name: "Channel Ingestion Agents", desc: "Per-channel adapters (marketplace, D2C, club retailer, subscription billing) normalize raw payout and settlement data into a unified schema. Each adapter handles the channel's specific fee logic, refund handling, and reporting cadence." },
      { n: "02", name: "Settlement-to-GL Matcher", desc: "Matches channel settlements to GL revenue postings. Handles timing differentials, processor fees, chargebacks, and the hardware-versus-subscription split. Assigns a confidence score per match; low-confidence items route to exception review." },
      { n: "03", name: "Exception Triage & Commentary", desc: "Exceptions clustered by root cause. Each cluster gets an AI-drafted explanation and suggested resolution. Variance commentary for the close package generated directly from the reconciled data." }
    ],
    stack: ["Python orchestration", "Claude API — matching & narrative", "Direct billing & GL integrations", "Structured exception reporting"],
    note: "Built against live production data during a senior revenue accounting assessment. A deliberately misposted test entry was flagged on the first reconciliation pass."
  },
  {
    id: "homehealth",
    tag: "HEALTHCARE / MULTI-STATE",
    scope: "Full close rearchitecture · 100-day plan",
    title: "13 Agents. One Controller.",
    subtitle: "A PE-backed, multi-state home health operator running close in 15 days. Target: 5 days in 90. And a plan to absorb acquisitions without a rebuild.",
    problem: "The close was running 15 business days — not because the accounting was complex, but because the process had grown organically. Tasks ran sequentially where parallelism was possible. Reconciliations lived in spreadsheets outside the ERP. Upstream data had no hard deadlines. The reporting package was assembled from scratch each month. And the company was acquiring — every new entity was a new rebuild.",
    built: "A rearchitected close function built around a thirteen-agent AI layer with a single controller operating as reviewer and system designer. The architecture was designed ERP-agnostic — extensible so each acquisition inherits the COA, reporting dimensions, and elimination rules rather than triggering a rebuild. Close target: 8 days by first cycle, 5 by Day 90.",
    principle: "AI handles volume — data extraction, matching, pattern recognition, first-pass analysis. The controller handles judgment — technical conclusions, sign-off, controls design, system architecture.",
    agents: [
      { n: "01", name: "AP Intake Agent", desc: "Invoices arrive via email or upload. The agent extracts vendor, amount, date, line items, and PO reference; matches against the vendor master; suggests GL coding from historical patterns; flags duplicates via fuzzy matching; and routes to approval. Manual data entry in the AP workflow approaches zero." },
      { n: "02", name: "Variance Commentary Generator", desc: "At close, the agent ingests current and prior-period trial balance data and drafts first-pass variance narratives for every material account — budget vs. actual, prior period, forecast. The controller reviews, adds operational context, finalizes. A weekend of writing becomes hours of review." },
      { n: "03", name: "Acquisition Integration Agent", desc: "When a new entity is acquired, the agent handles Day 1 accounting onboarding — COA mapping with confidence scoring, trial balance conversion, intercompany relationship setup, opening balance entries, and audit evidence packaging. Each acquisition trains the system. The next one closes faster." }
    ],
    stack: ["Python orchestration", "Claude API — extraction, matching, narrative", "Direct APIs (billing, payroll, banking, Ramp)", "ERP-native write-back"],
    note: "The thirteen-agent architecture and full 100-day plan were designed during a controller assessment against the company's live multi-state operations."
  }
];

function Logo(props) {
  var s = props.size || 30;
  return React.createElement("svg", { width: s, height: s, viewBox: "0 0 40 40", fill: "none" },
    React.createElement("path", { d: "M20 3L6 12v16l14 9 14-9V12L20 3z", stroke: "#00e5a0", strokeWidth: "1.5", fill: "none", opacity: "0.6" }),
    React.createElement("path", { d: "M20 8L10 14v12l10 6 10-6V14L20 8z", stroke: "#00e5a0", strokeWidth: "1", fill: "rgba(0,229,160,0.05)" }),
    React.createElement("circle", { cx: 20, cy: 20, r: 3, fill: "#00e5a0", opacity: "0.8" }),
    React.createElement("circle", { cx: 20, cy: 20, r: 1.2, fill: "#08090b" })
  );
}

export default function CaseStudies() {
  var _exp = useState(null);
  var expanded = _exp[0], setExpanded = _exp[1];

  useEffect(function () {
    var link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    var style = document.createElement("style");
    style.innerHTML = [
      "*{box-sizing:border-box;margin:0;padding:0}",
      "body,html{background:#08090b}",
      "::selection{background:#00e5a0;color:#08090b}",
      "::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#08090b}::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:3px}",
      ".cs-back{font-family:'JetBrains Mono',monospace;font-size:12px;color:#555;text-decoration:none;letter-spacing:.1em;display:inline-flex;align-items:center;gap:8px;transition:color .2s}",
      ".cs-back:hover{color:#00e5a0}",
      ".cs-card{background:#0f1012;border:1px solid #1a1c1e;border-radius:14px;padding:40px;transition:border-color .3s, box-shadow .3s;cursor:pointer;position:relative}",
      ".cs-card:hover{border-color:rgba(0,229,160,.22);box-shadow:0 0 40px rgba(0,229,160,.05)}",
      ".cs-tag{display:inline-block;padding:4px 10px;border:1px solid rgba(0,229,160,.25);border-radius:100px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#00e5a0;letter-spacing:.12em;margin-bottom:18px}",
      ".cs-agent{padding:20px 0;border-bottom:1px solid #1a1c1e;display:grid;grid-template-columns:48px 1fr;gap:18px;align-items:flex-start}",
      ".cs-agent:last-child{border-bottom:none}",
      ".cs-agent-n{font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:700;color:#00e5a0;opacity:.5;line-height:1}",
      ".cs-stack-chip{display:inline-flex;align-items:center;padding:6px 14px;background:#131416;border:1px solid #1a1c1e;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#888;margin:4px 6px 4px 0}",
      ".cs-note{margin-top:26px;padding:16px 20px;background:rgba(0,229,160,.03);border:1px solid rgba(0,229,160,.13);border-radius:8px;font-size:13px;color:#aaa;line-height:1.65}",
      ".cs-chev{transition:transform .25s}",
      ".cs-chev.open{transform:rotate(180deg)}",
      ".cs-principle{padding:22px 26px;background:rgba(0,229,160,.04);border-left:3px solid #00e5a0;border-radius:6px;margin:22px 0;font-size:15px;color:#ccc;line-height:1.65;font-style:italic}",
      "@media(max-width:700px){.cs-card{padding:28px 22px}.cs-agent{grid-template-columns:36px 1fr;gap:14px}}"
    ].join("");
    document.head.appendChild(style);

    return function () {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  return React.createElement("div", {
    style: { minHeight: "100vh", background: "#08090b", color: "#e0e0e0", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", padding: "24px 20px 100px" }
  },
    // BACK LINK
    React.createElement("div", { style: { maxWidth: 960, margin: "0 auto 32px" } },
      React.createElement("a", { href: "/", className: "cs-back" }, "← KNIGHTLEDGER")
    ),

    // HEADER
    React.createElement("div", { style: { maxWidth: 960, margin: "0 auto 56px" } },
      React.createElement("div", {
        style: {
          fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
          color: "#00e5a0", letterSpacing: ".15em", marginBottom: 18
        }
      }, "FROM THE FIELD"),
      React.createElement("h1", {
        style: { fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-1.2px", marginBottom: 20, maxWidth: 780 }
      }, "Two close redesigns. Built against live operations."),
      React.createElement("p", {
        style: { fontSize: 16, color: "#888", lineHeight: 1.7, maxWidth: 680 }
      }, "Each of these was architected during a real engagement, against the company's live data, systems, and pain points. Industries and identifying details anonymized. Click either to expand.")
    ),

    // CASE STUDIES
    React.createElement("div", { style: { maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 } },
      STUDIES.map(function (s) {
        var isOpen = expanded === s.id;
        return React.createElement("div", {
          key: s.id,
          className: "cs-card",
          onClick: function () { setExpanded(isOpen ? null : s.id); }
        },
          // TAG ROW
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" } },
            React.createElement("div", null,
              React.createElement("div", { className: "cs-tag" }, s.tag),
              React.createElement("div", { style: { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#555", marginBottom: 14, letterSpacing: ".05em" } }, s.scope)
            ),
            React.createElement("svg", {
              className: "cs-chev" + (isOpen ? " open" : ""),
              width: 18, height: 18, viewBox: "0 0 16 16", fill: "none",
              style: { flexShrink: 0, marginTop: 4 }
            },
              React.createElement("path", { d: "M4 6l4 4 4-4", stroke: "#555", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" })
            )
          ),

          // TITLE
          React.createElement("h2", {
            style: { fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "#fff", lineHeight: 1.2, letterSpacing: "-.8px", marginBottom: 12 }
          }, s.title),

          // SUBTITLE
          React.createElement("p", {
            style: { fontSize: 15, color: "#888", lineHeight: 1.65, marginBottom: isOpen ? 32 : 0 }
          }, s.subtitle),

          // EXPANDED CONTENT
          isOpen && React.createElement("div", null,
            // THE PROBLEM
            React.createElement("div", { style: { marginBottom: 28 } },
              React.createElement("div", { style: { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#00e5a0", letterSpacing: ".12em", marginBottom: 10 } }, "THE PROBLEM"),
              React.createElement("p", { style: { fontSize: 15, color: "#ccc", lineHeight: 1.75 } }, s.problem)
            ),
            // WHAT WAS BUILT
            React.createElement("div", { style: { marginBottom: 28 } },
              React.createElement("div", { style: { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#00e5a0", letterSpacing: ".12em", marginBottom: 10 } }, "WHAT WAS BUILT"),
              React.createElement("p", { style: { fontSize: 15, color: "#ccc", lineHeight: 1.75 } }, s.built)
            ),
            // PRINCIPLE (Fira only)
            s.principle && React.createElement("div", { className: "cs-principle" }, s.principle),

            // AGENTS
            React.createElement("div", { style: { marginTop: 32, marginBottom: 28 } },
              React.createElement("div", { style: { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#00e5a0", letterSpacing: ".12em", marginBottom: 18 } }, "ARCHITECTURE HIGHLIGHTS"),
              s.agents.map(function (a) {
                return React.createElement("div", { key: a.n, className: "cs-agent" },
                  React.createElement("div", { className: "cs-agent-n" }, a.n),
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 } }, a.name),
                    React.createElement("div", { style: { fontSize: 13, color: "#888", lineHeight: 1.7 } }, a.desc)
                  )
                );
              })
            ),

            // STACK
            React.createElement("div", { style: { marginBottom: 12 } },
              React.createElement("div", { style: { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#00e5a0", letterSpacing: ".12em", marginBottom: 12 } }, "STACK"),
              React.createElement("div", { style: { display: "flex", flexWrap: "wrap" } },
                s.stack.map(function (t, i) {
                  return React.createElement("span", { key: i, className: "cs-stack-chip" }, t);
                })
              )
            ),

            // NOTE
            React.createElement("div", { className: "cs-note" }, s.note)
          )
        );
      })
    ),

    // FOOTER CTA
    React.createElement("div", {
      style: { maxWidth: 960, margin: "72px auto 0", paddingTop: 40, borderTop: "1px solid #1a1c1e", textAlign: "center" }
    },
      React.createElement("p", { style: { fontSize: 14, color: "#666", marginBottom: 20 } },
        "Every engagement is scoped and architected to the specific systems and pain points of the client."
      ),
      React.createElement("a", {
        href: "/#contact",
        style: {
          display: "inline-flex", alignItems: "center", gap: 8,
          fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#00e5a0",
          textDecoration: "none", letterSpacing: ".1em",
          padding: "10px 0", borderBottom: "1px solid rgba(0,229,160,.3)"
        }
      }, "START THE CONVERSATION →")
    )
  );
}
