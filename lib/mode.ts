// Assisted is the safe default: a page view or scheduled run can never buy model calls.
export const assistedMode=()=>process.env.KNIGHTLEDGER_AI_MODE!=='automatic';
