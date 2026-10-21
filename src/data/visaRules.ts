// Visa facts from the Ministry of Foreign Affairs page, checked 21 Oct 2026.
// When the MFA changes a rule, update it here and the "last checked" text in dictionaries.ts.

export const MFA_VISA_URL = "https://www.mfa.am/en/visa/";

export const LINKS = {
  visaFreeUnilateral: "https://www.mfa.am/en/visafreelist",
  visaFreeByAgreement: "https://www.mfa.am/en/whoneedvisa",
  exemptionCountries:
    "https://www.mfa.am/filemanager/consular/visa/2025/2026-06-30-LIST-OF-COUNTRIES-TEMPORARY-VISA-EXEMPTION.pdf",
  evisa: "https://evisa.mfa.am",
  invitationOnly: "https://www.mfa.am/en/invitation_only",
  eRequest: "https://e-request.am/en",
};

export const CONTACTS = {
  email: "visa@mfa.am",
  entryPhones: ["+374 60 620553", "+374 60 620516"],
  invitationPhones: ["+374 60 620616", "+374 60 620553"],
};

// Temporary exemption for residence permit holders.
export const EXEMPTION = {
  from: "2026-07-01",
  until: "2027-07-01",
  minPermitMonths: 6,
  // "EU" stands for any EU or Schengen country.
  permitCountries: ["US", "EU", "AE", "BH", "QA", "SA", "KW", "OM"],
};

export type ExemptionResult = "incomplete" | "ok" | "otherCountry" | "outside" | "tooShort";

export function checkExemption(permitFrom: string, entryDate: string, permitExpiry: string): ExemptionResult {
  if (!permitFrom || !entryDate || !permitExpiry) return "incomplete";
  if (!EXEMPTION.permitCountries.includes(permitFrom)) return "otherCountry";
  if (entryDate < EXEMPTION.from || entryDate > EXEMPTION.until) return "outside";
  const needed = new Date(entryDate);
  needed.setMonth(needed.getMonth() + EXEMPTION.minPermitMonths);
  return new Date(permitExpiry) >= needed ? "ok" : "tooShort";
}
