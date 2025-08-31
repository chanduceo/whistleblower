export function categorize(text: string): string {
  const t = text.toLowerCase();
  if (/(bribe|cash|envelope|kickback)/.test(t)) return "Bribery";
  if (/(embezzle|misappropriation|funds)/.test(t)) return "Embezzlement";
  if (/(extort|threat|coerc)/.test(t)) return "Extortion";
  if (/(favorit|nepot|crony)/.test(t)) return "Favoritism";
  return "Other";
}

export function scorePriority(text: string): number {
  // 1 (highest) to 5 (lowest)
  let score = 3;
  if (/(threat|violence|large amount|lakhs|crore)/i.test(text)) score -= 2;
  if (/(repeat|multiple times|many victims)/i.test(text)) score -= 1;
  if (/(rumor|uncertain|maybe)/i.test(text)) score += 1;
  return Math.min(5, Math.max(1, score));
}