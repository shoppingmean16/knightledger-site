import { useState, useEffect, useRef } from "react";

var STEPS = [
  { n: "01", t: "Analyze", d: "We map your systems end to end — ERP, close tools, payment platforms, reporting stack — and identify where AI creates the highest-impact change. You receive a specific proposal: what we’d build, how it integrates with what you already use, and the fixed fee." },
  { n: "02", t: "Build", d: "Powered by Anthropic’s Claude, built against your real data, your actual chart of accounts, your specific workflows. We integrate into your existing platforms — not a separate tool your team has to learn. Testing happens in your environment with your data." },
  { n: "03", t: "Deploy", d: "The system goes live alongside your team for at least one full cycle — a close, a reconciliation period, a reporting deadline. You validate the output against your current process. We work on-site or remote depending on what the engagement needs. Payment is due only after it’s working." },
  { n: "04", t: "Own It", d: "Once live, the system is yours. Full documentation, prompt libraries, configuration guides — your team adjusts workflows and adapts to business changes without reengaging us. Model upgrades apply automatically." }
];

var SCOPES = [
  { name: "Per Process", price: "$2K – $12K", desc: "Any single workflow — a reconciliation, AP coding, flux analysis, lease analysis, any individual process.", icon: "\u25C7" },
  { name: "Full Close Cycle", price: "$8K – $25K", desc: "End-to-end: reconciliations, commentary, reporting, IC eliminations, close orchestration.", icon: "\u25C6" },
  { name: "Full Department", price: "$25K – $75K+", desc: "Accounting and finance redesigned around AI from the ground up.", icon: "\u2B21" },
  { name: "DIY Kits", price: "$500 – $10K", desc: "Prompt libraries, blueprints, and guides your team uses to implement independently.", icon: "\u25B3" }
];

var AUTOS = [
  { cat: "Close & Reporting", name: "Close Compression", desc: "Reconciliations across every balance sheet account, variance commentary, reporting packages, close checklist orchestration. 15-day closes compressed to under 5." },
  { cat: "Close & Reporting", name: "Multi-Entity Consolidation", desc: "IC elimination, currency translation, subsidiary validation, management fee allocations. Mismatches flagged before close, elimination entries generated with full documentation." },
  { cat: "Close & Reporting", name: "Financial Statements / MD&A / Notes", desc: "AI drafts complete financial statements, MD&A, and notes — auto-reconciled to trial balance with source data linkage. Roll-forward schedules tied out for auditors." },
  { cat: "Close & Reporting", name: "iXBRL / SEC Tagging", desc: "Inline XBRL tagging mapped to US GAAP taxonomy. Machine-readable output validated against SEC filing requirements." },
  { cat: "Close & Reporting", name: "Board & Investor Packages", desc: "Management reports, board decks, investor materials from live financial data. Formatted, footnoted, review-ready." },
  { cat: "Close & Reporting", name: "IC Reconciliation", desc: "Automated matching of IC balances across entities, exception identification, elimination entry preparation before close." },
  { cat: "Close & Reporting", name: "Bank Reconciliation", desc: "Transaction matching to GL, timing difference categorization, exception surfacing, documented automatically." },
  { cat: "Close & Reporting", name: "Fixed Assets & Depreciation", desc: "Asset tracking, depreciation schedules, disposal processing, impairment testing, CIP monitoring — maintained continuously." },
  { cat: "Close & Reporting", name: "Accrual Identification", desc: "AI identifies missing accruals from historical patterns, open POs, and contract terms. Entries generated with supporting documentation." },
  { cat: "Close & Reporting", name: "Journal Entry Testing", desc: "Continuous analysis of all JEs for anomalies, SOD violations, unusual patterns, and policy exceptions." },
  { cat: "AP & Procurement", name: "AP Intake & GL Coding", desc: "Reads invoices in any format — PDF, image, email — extracts line items, matches vendors, assigns GL codes, three-way match, approval routing. Exceptions only." },
  { cat: "AP & Procurement", name: "Expense Report Review", desc: "Reviews submissions against policy, flags violations, verifies receipts, checks duplicates, routes compliant reports for payment." },
  { cat: "AP & Procurement", name: "Vendor & Supply Chain Risk", desc: "Continuous monitoring of vendor financial health, delivery performance, concentration risk, geopolitical exposure." },
  { cat: "AP & Procurement", name: "Purchase Order Management", desc: "PO creation, approval routing, budget checking, goods receipt matching, accrual generation — end to end." },
  { cat: "Revenue", name: "Multi-Channel Revenue Reconciliation", desc: "Matching across payment processors, marketplaces, wholesale channels. Settlement-to-GL. Exceptions only." },
  { cat: "Revenue", name: "Deferred Revenue & ASC 606", desc: "Revenue waterfalls, churn handling, recognition scheduling, contract modification tracking, performance obligation analysis at scale." },
  { cat: "Revenue", name: "Contract Parsing & Analysis", desc: "AI reads contracts, extracts economic terms, identifies performance obligations, flags non-standard clauses. Thousands processed in hours." },
  { cat: "Revenue", name: "AR Aging & Collections", desc: "Aging analysis, payment pattern recognition, collection priority scoring, dunning letter generation." },
  { cat: "Revenue", name: "Billing Reconciliation", desc: "Billing system to GL, unbilled revenue identification, sub-ledger to GL reconciliation automated." },
  { cat: "Compliance & Audit", name: "SOX & Continuous Controls", desc: "Continuous control testing replacing quarterly sampling. Evidence packaged, walkthrough docs generated, exceptions flagged in real time." },
  { cat: "Compliance & Audit", name: "Audit Evidence & PBC Assembly", desc: "Continuous documentation organization, completeness tracking, binder assembly by audit area. PBC built before auditors arrive." },
  { cat: "Compliance & Audit", name: "ASC 842 Lease Analysis", desc: "Embedded lease identification, completeness analysis, new lease setup, initial recognition, modification tracking, ongoing amortization. Full population management." },
  { cat: "Compliance & Audit", name: "Covenant Monitoring", desc: "Continuous monitoring of all debt covenants — leverage ratios, interest coverage, fixed charge coverage, liquidity minimums, capex limits. AI ingests loan agreements, extracts every covenant definition, monitors financials against each threshold in real time. Breach probability scoring triggers escalation before violation. Critical for AI infrastructure debt, GPU-collateralized facilities, and SPV structures." },
  { cat: "Compliance & Audit", name: "ESG & Sustainability Reporting", desc: "Data aggregation for sustainability disclosures, regulatory tracking, gap analysis. SEC climate rules and EU CSRD making this mandatory." },
  { cat: "Compliance & Audit", name: "Multi-Jurisdiction Compliance", desc: "Filing deadline tracking, automated alerts, status monitoring, compliance documentation across all jurisdictions." },
  { cat: "Compliance & Audit", name: "Policy Compliance Scanning", desc: "Transactions, expenses, and JEs reviewed against internal policies. Violations flagged before they become audit findings." },
  { cat: "FP&A & Treasury", name: "Variance & Flux Analysis", desc: "First-pass narratives for every material variance — B/A, PY, forecast. Review and edit instead of writing from scratch." },
  { cat: "FP&A & Treasury", name: "Cash Forecasting", desc: "Rolling forecasts that learn your business cycles. Daily cash positioning, bank reconciliation, liquidity analysis." },
  { cat: "FP&A & Treasury", name: "Real-Time Dashboards", desc: "Live ERP data in CFO-ready dashboards — cash, revenue, expense anomalies, KPIs — updated continuously." },
  { cat: "FP&A & Treasury", name: "Budget vs. Actual Reporting", desc: "Automated comparison, department drill-downs, trend analysis, narrative generation for material variances." },
  { cat: "FP&A & Treasury", name: "Debt & Equity Accounting", desc: "Issuance accounting, amortization schedules, covenant tracking, fair value adjustments, disclosure preparation." },
  { cat: "FP&A & Treasury", name: "Scenario Modeling", desc: "Multiple scenarios from variable inputs — rates, revenue, costs — with automated output comparison." },
  { cat: "Tax", name: "Tax Provision & Compliance", desc: "Data gathering, schedule preparation, return assembly, provision calculations at speed." },
  { cat: "Tax", name: "Transfer Pricing", desc: "IC transaction monitoring, arm’s-length benchmarking, exposure flagging, documentation generation." },
  { cat: "Tax", name: "1099 & Information Returns", desc: "Vendor data validation, threshold monitoring, form generation, filing preparation across jurisdictions." },
  { cat: "Tax", name: "Tariff & Trade Compliance", desc: "HTS classification, duty exposure calculation, trade policy monitoring, supply chain cost modeling." },
  { cat: "Tax", name: "Sales Tax Nexus", desc: "Nexus determination, rate application, return preparation, GL reconciliation across jurisdictions." },
  { cat: "M&A", name: "Acquisition Integration", desc: "COA mapping with confidence scoring, TB conversion, IC setup, compliance gap analysis, audit evidence packaging. Each deal trains the system." },
  { cat: "M&A", name: "Purchase Price Allocation", desc: "Data assembly for PPA, intangible identification, useful life estimation, disclosure preparation." },
  { cat: "M&A", name: "Goodwill Impairment Testing", desc: "Triggering event monitoring, data assembly, reporting unit allocation, disclosure preparation." },
  { cat: "M&A", name: "Due Diligence Data Rooms", desc: "AI organizes, indexes, quality-checks data room contents. Flags missing items and red flags automatically." },
  { cat: "Operations", name: "Payroll Validation", desc: "Multi-state withholding verification, classification checks, benefit deduction validation, overtime calculations." },
  { cat: "Operations", name: "Anomaly Detection", desc: "Continuous monitoring of transactions, JEs, operational data. Patterns and outliers surfaced — not periodic, continuous." },
  { cat: "Operations", name: "Workers Comp & Benefits", desc: "Premium reconciliation, classification auditing, experience mod tracking, benefits enrollment validation." },
  { cat: "Operations", name: "Inventory & COGS", desc: "Perpetual inventory reconciliation, LCNRV testing, cost layer analysis, shrinkage identification." },
  { cat: "Operations", name: "Workflow Automation", desc: "Approval routing, status tracking, notification triggers, SLA monitoring across any process." },
  { cat: "Government", name: "CAFR / ACFR Preparation", desc: "Automated Comprehensive Annual Financial Reports. Government-wide and fund-level statements, notes, RSI, statistical section from ERP data." },
  { cat: "Government", name: "Single Audit (2 CFR 200)", desc: "Continuous federal award monitoring against Uniform Guidance. SEFA prepared automatically. Major program determination and compliance documentation." },
  { cat: "Government", name: "Fund Accounting", desc: "Reconciliation across governmental, proprietary, fiduciary funds. Interfund matching, elimination for government-wide conversion." },
  { cat: "Government", name: "Grant Management", desc: "Award to closeout: budget tracking, drawdown scheduling, cost allocation, match requirements, deadline alerts, compliance docs." },
  { cat: "Government", name: "GASB Implementation", desc: "New standard adoption: lease inventories (GASB 87), subscription IT (GASB 96), compensated absences (GASB 101). Schedules, JEs, disclosures." },
  { cat: "Government", name: "DoD Audit Readiness", desc: "DoD has failed its audit every year since 2018. Evidence assembly, universe of transactions documentation, JV preparation, control monitoring." },
  { cat: "Government", name: "DCAA Compliance", desc: "Incurred cost submissions, indirect rate calculations, timekeeping compliance, CAS-compliant cost accounting with full documentation." },
  { cat: "Industry", name: "Healthcare — Claims & Denials", desc: "Analysis by payer, code, clinician, state. Denial pattern recognition, appeal tracking, recovery monitoring." },
  { cat: "Industry", name: "Gaming — Multi-Property", desc: "Property-level P&L, gaming tax, promotional allowance tracking, regulatory compliance across jurisdictions." },
  { cat: "Industry", name: "SaaS — ARR/MRR & Cohorts", desc: "Subscription metrics, cohort retention, usage-based billing reconciliation, investor dashboards." },
  { cat: "Industry", name: "PE — Portfolio Standardization", desc: "COA normalization, standardized reporting, fund consolidation, carried interest calculations." },
  { cat: "Industry", name: "Insurance — Reserving", desc: "Loss reserve analysis, IBNR estimation, claims processing, policy administration reconciliation." },
  { cat: "Industry", name: "Manufacturing — Costing & WIP", desc: "BOM reconciliation, WIP analysis, standard cost variance reporting, production efficiency." },
  { cat: "Industry", name: "Real Estate — Leases", desc: "Rent roll reconciliation, CAM charges, percentage rent, tenant improvements, lease abstraction." },
  { cat: "Industry", name: "Defense — Contract Costs", desc: "DCAA-compliant tracking, incurred cost submissions, indirect rates, contract revenue recognition." },
  { cat: "Industry", name: "Pharma — R&D Capitalization", desc: "Clinical trial cost tracking, milestone-based capitalization, collaboration arrangement accounting." },
  { cat: "Industry", name: "Crypto — Digital Assets", desc: "Wallet tracking, on-chain to GL mapping, fair value under new FASB standard, tax lot reporting." },
  { cat: "Industry", name: "Banking — AI Debt Monitoring", desc: "Portfolio monitoring of AI/datacenter lending — GPU facilities, SPV structures, hyperscaler credit, utilization covenants. $250B–$300B projected 2026 issuance." },
  { cat: "Industry", name: "Construction — % Completion", desc: "Project cost tracking, ASC 606 revenue recognition, change orders, retainage tracking." },
  { cat: "Industry", name: "Hospitality — Revenue Mgmt", desc: "Room revenue reconciliation, F&B cost analysis, loyalty liability, franchise fee calculations." },
  { cat: "Industry", name: "Media — Licensing & Royalties", desc: "Content amortization, royalty calculations, minimum guarantees, participation accounting, rights management." },
  { cat: "Industry", name: "Retail — POS & Shrinkage", desc: "POS reconciliation, shrinkage analysis, loyalty accounting, gift card breakage estimation." },
  { cat: "Industry", name: "Nonprofit — Grants & Funds", desc: "Grant tracking, donor restriction monitoring, fund-level reporting, federal award compliance." }
];

var ALL_CATS = ["All", "Close & Reporting", "AP & Procurement", "Revenue", "Compliance & Audit", "FP&A & Treasury", "Tax", "M&A", "Operations", "Government", "Industry"];

function cn() { var r = []; for (var i = 0; i < arguments.length; i++) { if (arguments[i]) r.push(arguments[i]); } return r.join(" "); }

function Logo(props) {
  var s = props.size || 36;
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
      <path d="M20 3L6 12v16l14 9 14-9V12L20 3z" stroke="#00e5a0" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M20 8L10 14v12l10 6 10-6V14L20 8z" stroke="#00e5a0" strokeWidth="1" fill="rgba(0,229,160,0.05)"/>
      <line x1="20" y1="8" x2="20" y2="32" stroke="#00e5a0" strokeWidth="0.8" opacity="0.4"/>
      <line x1="10" y1="14" x2="30" y2="14" stroke="#00e5a0" strokeWidth="0.6" opacity="0.3"/>
      <line x1="10" y1="26" x2="30" y2="26" stroke="#00e5a0" strokeWidth="0.6" opacity="0.3"/>
      <circle cx="20" cy="20" r="3" fill="#00e5a0" opacity="0.8"/>
      <circle cx="20" cy="20" r="1.2" fill="#08090b"/>
    </svg>
  );
}

function Counter(props) {
  var end = props.end;
  var suffix = props.suffix || "";
  var duration = props.duration || 1600;
  var ref = useRef(null);
  var started = useRef(false);
  var _s = useState(0);
  var val = _s[0]; var setVal = _s[1];
  useEffect(function() {
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        var t0 = performance.now();
        var tick = function(now) {
          var p = Math.min((now - t0) / duration, 1);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return function() { obs.disconnect(); };
  }, [end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function FadeIn(props) {
  var delay = props.delay || 0;
  var ref = useRef(null);
  var _s = useState(false);
  var vis = _s[0]; var setVis = _s[1];
  useEffect(function() {
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) setVis(true);
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return function() { obs.disconnect(); };
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: "opacity .7s cubic-bezier(.22,1,.36,1) " + delay + "s, transform .7s cubic-bezier(.22,1,.36,1) " + delay + "s"
    }}>{props.children}</div>
  );
}


export default function KnightLedger() {
  var _cat = useState("All"); var activeCat = _cat[0]; var setActiveCat = _cat[1];
  var _exp = useState(null); var expandedAuto = _exp[0]; var setExpandedAuto = _exp[1];
    var _step = useState(null);
    var expandedStep = _step[0];
    var setExpandedStep = _step[1];
  var _menu = useState(false); var mobileMenu = _menu[0]; var setMobileMenu = _menu[1];
  var filtered = activeCat === "All" ? AUTOS : AUTOS.filter(function(a) { return a.cat === activeCat; });
  var grouped = {};
  filtered.forEach(function(a) { if (!grouped[a.cat]) grouped[a.cat] = []; grouped[a.cat].push(a); });
  var scrollTo = function(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); };
  var navItems = [["Thesis", "thesis"], ["Process", "process"], ["Pricing", "pricing"], ["Automations", "automations"]];
  return (
    <div style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif", background: "#08090b", color: "#e0e0e0", minHeight: "100vh", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: "*{box-sizing:border-box;margin:0;padding:0}::selection{background:#00e5a0;color:#08090b}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#08090b}::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:3px}.accent{color:#00e5a0}.mono{font-family:'JetBrains Mono',monospace}.card{background:#0f1012;border:1px solid #1a1c1e;border-radius:12px;transition:all .3s}.card:hover{border-color:rgba(0,229,160,0.2);box-shadow:0 0 30px rgba(0,229,160,.04)}.bp{background:#00e5a0;color:#08090b;font-weight:600;padding:14px 32px;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-family:'DM Sans',sans-serif;transition:all .25s;text-decoration:none;display:inline-block}.bp:hover{background:#00cc8e;transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,229,160,.25)}.bgh{background:transparent;color:#00e5a0;border:1px solid rgba(0,229,160,0.2);padding:14px 32px;border-radius:8px;cursor:pointer;font-size:15px;font-family:'DM Sans',sans-serif;transition:all .25s;text-decoration:none;display:inline-block}.bgh:hover{border-color:#00e5a0;background:rgba(0,229,160,.04)}.pill{padding:6px 16px;border-radius:100px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid #1a1c1e;background:transparent;color:#888;transition:all .25s;font-family:'DM Sans',sans-serif;white-space:nowrap}.pill:hover{border-color:#333;color:#ccc}.pill.active{background:#00e5a0;color:#08090b;border-color:#00e5a0;font-weight:600}.arow{padding:16px 20px;border-bottom:1px solid #1a1c1e;cursor:pointer;transition:background .2s}.arow:hover{background:#131416}.arow:last-child{border-bottom:none}.section{padding:80px 20px;max-width:1100px;margin:0 auto}.nlink{color:#666;text-decoration:none;font-size:14px;transition:color .2s;cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif}.nlink:hover{color:#e0e0e0}.gridbg{position:absolute;inset:0;background-image:linear-gradient(rgba(0,229,160,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,160,.02) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse at center,black 20%,transparent 70%)}.sn{font-family:'JetBrains Mono',monospace;font-size:42px;font-weight:600;color:#00e5a0;line-height:1}.hmb{display:none;background:none;border:none;cursor:pointer;padding:8px}.cm{background:#0f1012;border:1px solid #1a1c1e;border-radius:12px;padding:24px;text-align:center;transition:all .3s;text-decoration:none;display:block}.cm:hover{border-color:rgba(0,229,160,0.2)}@media(max-width:768px){.section{padding:48px 16px}.hmb{display:block}.dknav{display:none!important}.sn{font-size:32px}}@media(min-width:769px){.mbnav{display:none!important}}" }} />
      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,9,11,.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1a1c1e" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={function() { window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <Logo size={30} />
            <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: "#e0e0e0", letterSpacing: "-0.5px" }}>KnightLedger</span>
          </div>
          <div className="dknav" style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {navItems.map(function(item) { return <button key={item[1]} className="nlink" onClick={function() { scrollTo(item[1]); }}>{item[0]}</button>; })}
            <button className="bp" style={{ padding: "10px 24px", fontSize: 13 }} onClick={function() { scrollTo("contact"); }}>Get Started</button>
          </div>
          <button className="hmb" onClick={function() { setMobileMenu(!mobileMenu); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="2">
              {mobileMenu ? <path d="M18 6L6 18M6 6l12 12" /> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
        {mobileMenu && (
          <div className="mbnav" style={{ background: "#08090b", borderTop: "1px solid #1a1c1e", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {navItems.map(function(item) { return <button key={item[1]} className="nlink" style={{ textAlign: "left", fontSize: 16 }} onClick={function() { scrollTo(item[1]); }}>{item[0]}</button>; })}
            <button className="bp" style={{ width: "100%", marginTop: 8 }} onClick={function() { scrollTo("contact"); }}>Get Started</button>
          </div>
        )}
      </nav>
      {/* HERO */}
      <section style={{ position: "relative", paddingTop: 140, paddingBottom: 80, overflow: "hidden" }}>
        <div className="gridbg" />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
          <FadeIn><div className="mono" style={{ fontSize: 13, color: "#00e5a0", marginBottom: 24, letterSpacing: "0.5px", opacity: 0.8 }}>AI IMPLEMENTATION FOR ACCOUNTING & FINANCE</div></FadeIn>
          <FadeIn delay={0.1}><h1 style={{ fontSize: "clamp(32px,6vw,64px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-2px", color: "#fff", marginBottom: 28, maxWidth: 800 }}>AI can now run your entire accounting function. <span style={{ color: "#555" }}>Most companies haven’t let it.</span></h1></FadeIn>
          <FadeIn delay={0.2}><p style={{ fontSize: "clamp(16px,2.2vw,20px)", color: "#888", lineHeight: 1.65, maxWidth: 620, marginBottom: 16 }}>We redesign accounting and finance processes around AI — not bolt it onto what you already have.</p></FadeIn>
          <FadeIn delay={0.3}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button className="bp" onClick={function() { scrollTo("contact"); }}>Talk to Us</button>
              <button className="bgh" onClick={function() { scrollTo("automations"); }}>See What We Build</button>
            </div>
          </FadeIn>
          <FadeIn delay={0.45}>
            <div style={{ marginTop: 72, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 1, background: "#1a1c1e", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: "#0f1012", padding: "28px 24px", textAlign: "center" }}><div className="sn"><Counter end={70} suffix="%+" /></div><div style={{ fontSize: 13, color: "#666", marginTop: 8 }}>Cost reduction vs. traditional advisory</div></div>
              <div style={{ background: "#0f1012", padding: "28px 24px", textAlign: "center" }}><div className="sn">$0</div><div style={{ fontSize: 13, color: "#666", marginTop: 8 }}>Payment until it’s working</div></div>
            </div>
          </FadeIn>
        </div>
      </section>
      {/* THESIS */}
      <section id="thesis" className="section" style={{ borderTop: "1px solid #1a1c1e" }}>
        <FadeIn>
          <div className="mono accent" style={{ fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>THE DISCONNECT</div>
          <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 32, maxWidth: 700 }}>AI handles every accounting task now — including the ones that require judgment. So why hasn’t anything changed?</h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {[
            { t: "The capability exists", d: "Current AI handles the full range of accounting and finance processes — including those that require interpretation, judgment, and technical conclusions. Not just data entry and pattern matching. The complex work." },
            { t: "Companies aren’t seeing results", d: "Most report no meaningful productivity gains from AI. Not because the technology is lacking — because they’re bolting AI onto processes designed for humans." },
            { t: "Advisory firms aren’t pushing it", d: "Traditional consulting firms should be driving AI implementation for their clients. Most aren’t. AI implementation directly impacts the hourly billing model that funds their operations." }
          ].map(function(c, i) {
            return (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card" style={{ padding: 32, height: "100%" }}>
                  <div className="mono accent" style={{ fontSize: 12, marginBottom: 12 }}>{String(i + 1).padStart(2, "0")}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 12 }}>{c.t}</h3>
                  <p style={{ fontSize: 15, color: "#888", lineHeight: 1.7 }}>{c.d}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
        <FadeIn delay={0.3}>
          <div style={{ marginTop: 40, padding: "28px 32px", borderRadius: 12, border: "1px solid rgba(0,229,160,0.13)", background: "rgba(0,229,160,0.02)" }}>
            <p style={{ fontSize: 17, color: "#ccc", lineHeight: 1.7, marginBottom: 16 }}><strong style={{ color: "#00e5a0" }}>Our position:</strong> Any accounting or finance function can and should be fully run by AI at the preparer level. Humans become the review layer — designing, maintaining, and continuously improving the system. One controller overseeing automated systems, at any company size, any industry, any complexity level.</p>
            <a href="/close-process" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontFamily: "'JetBrains Mono',monospace", color: "#00e5a0", textDecoration: "none", letterSpacing: ".05em", padding: "8px 0", borderBottom: "1px solid rgba(0,229,160,.3)" }}>SEE THE CLOSE REDESIGNED →</a>
          </div>
        </FadeIn>
      </section>
      {/* PROCESS */}
      <section id="process" className="section" style={{ borderTop: "1px solid #1a1c1e" }}>
        <FadeIn><div className="mono accent" style={{ fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>HOW IT WORKS</div><h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 48 }}>Four phases.</h2></FadeIn>
        {STEPS.map(function(s, i) {
          var isOpen = expandedStep === s.n;
          return (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="arow" style={{ display: "grid", gridTemplateColumns: "64px 1fr", borderBottom: i < 3 ? "1px solid #1a1c1e" : "none", padding: "24px 0", cursor: "pointer" }} onClick={function() { setExpandedStep(isOpen ? null : s.n); }}>
                <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: "#00e5a0", opacity: 0.5 }}>{s.n}</div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", margin: 0 }}>{s.t}</h3>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .25s" }}><path d="M4 6l4 4 4-4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  {isOpen && <p style={{ marginTop: 12, fontSize: 15, color: "#888", lineHeight: 1.7, maxWidth: 640 }}>{s.d}</p>}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </section>
      {/* PRICING */}
      <section id="pricing" className="section" style={{ borderTop: "1px solid #1a1c1e" }}>
        <FadeIn>
          <div className="mono accent" style={{ fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>PRICING</div>
          <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 12 }}>Fixed fee. Stated upfront. Pay only if it works.</h2>
          <p style={{ fontSize: 16, color: "#888", marginBottom: 48, maxWidth: 600, lineHeight: 1.6 }}>70–90% less than traditional advisory. We’re AI-native — engagements close in days or hours, not weeks or months.</p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {SCOPES.map(function(s, i) {
            return (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
                  <div className="mono accent" style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{s.price}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 10 }}>{s.name}</h3>
                  <p style={{ fontSize: 14, color: "#777", lineHeight: 1.6, flex: 1 }}>{s.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
        <FadeIn delay={0.35}><p style={{ marginTop: 24, fontSize: 14, color: "#555" }}>All fees scoped per engagement. No recurring charges, no hourly billing.</p></FadeIn>
      </section>
      {/* SECURITY */}
      <section id="security" className="section" style={{ borderTop: "1px solid #1a1c1e" }}>
        <FadeIn><div className="mono accent" style={{ fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>DATA PRIVACY & SECURITY</div><h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 32, maxWidth: 700 }}>Your data stays yours.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {[
            { t: "Zero data retention", d: "All AI processing runs through Anthropic’s API with zero data retention. Your financial data is not stored, logged, or used for model training." },
            { t: "Your environment", d: "Automations run within your existing infrastructure. We don’t host your data on third-party platforms." },
            { t: "Scoped access", d: "Each automation receives only the minimum data required. Access defined per-process, not org-wide." },
            { t: "Full audit trail", d: "Every AI action logged — data accessed, output generated, decisions made. Full traceability for audit and regulatory review." },
            { t: "Encryption", d: "All data transmitted via TLS 1.3. Locally cached data encrypted at rest, purged after processing." },
            { t: "SOC 2 aligned", d: "Anthropic maintains SOC 2 Type II compliance. Deployment follows enterprise access control and incident response standards." }
          ].map(function(s, i) {
            return (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="card" style={{ padding: 28 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 10 }}>{s.t}</h4>
                  <p style={{ fontSize: 14, color: "#777", lineHeight: 1.6 }}>{s.d}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>
      {/* AUTOMATIONS */}
      <section id="automations" className="section" style={{ borderTop: "1px solid #1a1c1e" }}>
        <FadeIn>
          <div className="mono accent" style={{ fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>WHAT WE BUILD</div>
          <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 12 }}>Name the process.</h2>
          <p style={{ fontSize: 15, color: "#666", marginBottom: 32, maxWidth: 600 }}>This is a sample — not a comprehensive list. Every engagement is scoped to your specific systems, workflows, and pain points.</p>
        </FadeIn>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {ALL_CATS.map(function(c) {
            var count = c === "All" ? AUTOS.length : AUTOS.filter(function(a) { return a.cat === c; }).length;
            return <button key={c} className={cn("pill", activeCat === c && "active")} onClick={function() { setActiveCat(c); setExpandedAuto(null); }}>{c + " (" + count + ")"}</button>;
          })}
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          {Object.entries(grouped).map(function(entry) {
            var cat = entry[0]; var items = entry[1];
            return (
              <div key={cat}>
                <div style={{ padding: "12px 20px", background: "#0b0c0e", borderBottom: "1px solid #1a1c1e" }}>
                  <span className="mono" style={{ fontSize: 11, color: "#00e5a0", letterSpacing: 1, textTransform: "uppercase" }}>{cat}</span>
                </div>
                {items.map(function(a, i) {
                  var key = cat + a.name;
                  var open = expandedAuto === key;
                  return (
                    <div key={i} className="arow" onClick={function() { setExpandedAuto(open ? null : key); }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: "#ddd" }}>{a.name}</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .25s" }}>
                          <path d="M4 6l4 4 4-4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {open && <p style={{ marginTop: 10, fontSize: 14, color: "#888", lineHeight: 1.65, paddingRight: 24 }}>{a.desc}</p>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
      {/* TECH */}
      <section className="section" style={{ borderTop: "1px solid #1a1c1e" }}>
        <FadeIn><div className="mono accent" style={{ fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>THE STACK</div><h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 32 }}>What runs under the hood</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {[
            { t: "Anthropic Claude (Opus 4.6 / Sonnet)", d: "Document extraction, analysis, narrative generation, account mapping, contract parsing, variance commentary. The reasoning layer." },
            { t: "Python + API Integrations", d: "Data processing, matching logic, system integration, report generation. Connects to any ERP, billing system, payroll provider, banking platform." },
            { t: "Browser & Desktop Automation", d: "Scheduled automations for portal downloads, balance pulls, report generation, settlement retrieval. Any web-based system." },
            { t: "Your ongoing cost: $50–$150/mo", d: "API usage. No per-seat licensing, no platform fees, no additional headcount." }
          ].map(function(s, i) {
            return (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="card" style={{ padding: 28 }}><h4 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 10 }}>{s.t}</h4><p style={{ fontSize: 14, color: "#777", lineHeight: 1.6 }}>{s.d}</p></div>
              </FadeIn>
            );
          })}
        </div>
      </section>
        {/* ABOUT */}
        <section id="founder" className="section" style={{ borderTop: "1px solid #1a1c1e" }}>
          <FadeIn>
            <div className="mono accent" style={{ fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>ABOUT</div>
            <div style={{ maxWidth: 700 }}>
              <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 20 }}>Jason Forrester, CPA</h2>
              <div style={{ fontSize: 14, color: "#00e5a0", marginBottom: 24, fontWeight: 500 }}>Implementation & Design</div>
              <p style={{ fontSize: 15, color: "#888", lineHeight: 1.7, marginBottom: 20 }}>CPA with 10+ years across Big 4 audit, internal audit at a Fortune 50 media conglomerate, and advisory consulting at the senior manager level. Since the emergence of generative AI, focused exclusively on deploying it across accounting and finance — close optimization, automated workpaper and evidence generation, controls testing, analytics, ERP implementations, and workflow design.</p>
              <a href="https://www.linkedin.com/in/jasonforrester1/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "#00e5a0", textDecoration: "none", borderBottom: "1px solid rgba(0,229,160,0.3)", paddingBottom: 2 }}>LinkedIn</a>
            </div>
          </FadeIn>
        </section>

      {/* CTA */}
      <section id="contact" style={{ borderTop: "1px solid #1a1c1e" }}>
        <div className="section">
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(24px,5vw,44px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-1.5px", marginBottom: 16 }}>Tell us what you’d automate first.</h2>
              <p style={{ fontSize: 17, color: "#888", maxWidth: 500, margin: "0 auto" }}>We’ll respond with a specific proposal — what we’d build, how it integrates, and the fixed fee.</p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, marginBottom: 40 }}>
            <FadeIn delay={0.05}>
              <a href="https://tally.so/r/PdYBp1" target="_blank" rel="noopener noreferrer" className="cm" style={{ padding: 28, display: "block" }}>
                <div className="mono accent" style={{ fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>START HERE</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Tell us what you'd automate</div>
                <div style={{ fontSize: 13, color: "#666" }}>Quick assessment — email is the only required field</div>
              </a>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <a href="https://calendly.com/jason-knightledger/ai-automation-intro-discussion" target="_blank" rel="noopener noreferrer" className="cm">
                  <div className="mono accent" style={{ fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>SCHEDULE A CALL</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Book an intake call</div>
                  <div style={{ fontSize: 13, color: "#666" }}>Pick a time that works</div>
                </a>
                <a href="mailto:jason@knightledger.com" className="cm">
                  <div className="mono accent" style={{ fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>EMAIL</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>jason@knightledger.com</div>
                </a>
                <a href="tel:+17322676522" className="cm">
                  <div className="mono accent" style={{ fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>CALL OR TEXT</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>(732) 267-6522</div>
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1a1c1e", padding: "32px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Logo size={20} /><span className="mono" style={{ fontSize: 13, color: "#444" }}>KnightLedger</span></div>
          <div className="mono" style={{ fontSize: 12, color: "#333" }}>AI implementation for accounting & finance</div>
        </div>
      </footer>
    </div>
  );
}
