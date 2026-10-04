/** Conservative result checks for telemetry; these do not certify SEO eligibility. */
export function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.length > 0;
  } catch { return false; }
}

/** ISO calendar dates and date-times used by the existing schema fields. */
export function isValidSchemaDate(value: string): boolean {
  const text = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.exec(text);
  if (!match) return false;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1] &&
    (!hourText || (Number(hourText) < 24 && Number(minuteText) < 60 && (!secondText || Number(secondText) < 60))) &&
    Number.isFinite(Date.parse(text));
}

function isDuration(value: string): boolean {
  const text = value.trim();
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(text);
  return Boolean(match && match.slice(1).some(part => part !== undefined) && (!text.includes("T") || match.slice(2).some(part => part !== undefined)));
}

/** Required-field and basic typed-value validity for the generator's existing fields. */
export function hasValidSchemaValues(type: string, values: Record<string, string>, requiredKeys: readonly string[]): boolean {
  const present = (key: string) => Boolean(values[key]?.trim());
  if (!requiredKeys.every(present)) return false;
  if (["image", "url", "logo", "sameAs"].some(key => present(key) && !isAbsoluteHttpUrl(values[key]))) return false;
  if (["datePublished", "dateModified", "startDate", "endDate"].some(key => present(key) && !isValidSchemaDate(values[key]))) return false;

  if (type === "Product") {
    const price = values.price?.trim() ?? "";
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(price) || !Number.isFinite(Number(price))) return false;
    if (!/^[A-Z]{3}$/.test(values.priceCurrency?.trim() ?? "")) return false;
  }
  if (type === "Recipe" && ["cookTime", "prepTime"].some(key => present(key) && !isDuration(values[key]))) return false;
  if (type === "Event" && present("endDate") && Date.parse(values.endDate.trim()) < Date.parse(values.startDate.trim())) return false;
  if (type === "Organization" && present("foundingDate")) {
    const date = values.foundingDate.trim();
    if (!(/^\d{4}$/.test(date) && Number(date) > 0) && !isValidSchemaDate(date)) return false;
  }
  return true;
}
