// Pure helpers for JoSAA data normalization. Safe for client and server.

export type InstituteType = "IIT" | "NIT" | "IIIT" | "GFTI";

export const INSTITUTE_TYPES: InstituteType[] = ["IIT", "NIT", "IIIT", "GFTI"];

export const SEAT_TYPES = [
  "OPEN",
  "OBC-NCL",
  "EWS",
  "SC",
  "ST",
  "OPEN (PwD)",
  "OBC-NCL (PwD)",
  "EWS (PwD)",
  "SC (PwD)",
  "ST (PwD)",
] as const;
export type SeatType = (typeof SEAT_TYPES)[number];

export const GENDERS = ["Gender-Neutral", "Female-only (including Supernumerary)"] as const;
export type Gender = (typeof GENDERS)[number];

export const QUOTAS = ["AI", "HS", "OS", "GO", "JK", "LA"] as const;
export type Quota = (typeof QUOTAS)[number];

export const ROUNDS = ["1", "2", "3", "4", "5", "6"] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Ladakh",
];

// Classify an institute name into IIT / NIT / IIIT / GFTI.
export function classifyInstitute(name: string): InstituteType {
  const n = name.toLowerCase();
  if (n.includes("indian institute of technology") || /\biit\b/.test(n)) return "IIT";
  if (
    n.includes("national institute of technology") ||
    /\bnit\b/.test(n) ||
    n.includes("mnnit") ||
    n.includes("vnit") ||
    n.includes("svnit")
  )
    return "NIT";
  if (n.includes("information technology") || /\biiit\b/.test(n)) return "IIIT";
  return "GFTI";
}

// City/state keyword map. Order matters — first match wins.
const STATE_RULES: Array<[RegExp, string]> = [
  [/\bbombay\b|\bmumbai\b|nagpur|pune|aurangabad|maharashtra/i, "Maharashtra"],
  [/\bdelhi\b/i, "Delhi"],
  [/madras|chennai|tiruchirappalli|trichy|nit ?t|coimbatore|kanchee?puram|salem|tamil nadu/i, "Tamil Nadu"],
  [/bangalore|bengaluru|surathkal|karnataka|raichur|dharwad|mangalore/i, "Karnataka"],
  [/hyderabad|warangal|telangana/i, "Telangana"],
  [/kanpur|allahabad|prayagraj|varanasi|bhu|lucknow|gorakhpur|ghaziabad|noida|jhansi|uttar pradesh/i, "Uttar Pradesh"],
  [/kharagpur|kalyani|durgapur|shibpur|west bengal|kolkata/i, "West Bengal"],
  [/guwahati|silchar|assam|kokrajar|tezpur/i, "Assam"],
  [/roorkee|srinagar.*garhwal|uttarakhand|pauri/i, "Uttarakhand"],
  [/jaipur|jodhpur|kota|rajasthan|ajmer/i, "Rajasthan"],
  [/gandhinagar|surat|vadodara|ahmedabad|gujarat|gujrat|diu/i, "Gujarat"],
  [/bhubaneswar|rourkela|odisha|orissa|berhampur/i, "Odisha"],
  [/patna|bhagalpur|bihar/i, "Bihar"],
  [/raipur|bhilai|chhattisgarh/i, "Chhattisgarh"],
  [/bhopal|indore|gwalior|jabalpur|madhya pradesh|sagar/i, "Madhya Pradesh"],
  [/ranchi|jamshedpur|mesra|deoghar|jharkhand/i, "Jharkhand"],
  [/calicut|kozhikode|kerala|kottayam|palakkad|trivandrum/i, "Kerala"],
  [/agartala|tripura/i, "Tripura"],
  [/imphal|manipur|senapati/i, "Manipur"],
  [/aizawl|mizoram/i, "Mizoram"],
  [/shillong|meghalaya/i, "Meghalaya"],
  [/dimapur|nagaland/i, "Nagaland"],
  [/itanagar|yupia|arunachal/i, "Arunachal Pradesh"],
  [/gangtok|sikkim/i, "Sikkim"],
  [/jalandhar|patiala|amritsar|punjab|pec/i, "Punjab"],
  [/kurukshetra|hamirpur|haryana|sonepat|sonipat/i, "Haryana"],
  [/hamirpur|himachal|mandi|una|solan|shimla/i, "Himachal Pradesh"],
  [/srinagar|jammu|kashmir/i, "Jammu and Kashmir"],
  [/leh|ladakh/i, "Ladakh"],
  [/puducherry|pondicherry/i, "Puducherry"],
  [/goa\b/i, "Goa"],
  [/andhra|tirupati|sri city|chittoor|vizag|visakhapatnam/i, "Andhra Pradesh"],
  [/chandigarh/i, "Chandigarh"],
];

export function inferState(institute: string): string | null {
  for (const [re, st] of STATE_RULES) if (re.test(institute)) return st;
  return null;
}

// Common short name for display
export function shortName(institute: string): string {
  const n = institute;
  // IITs
  let m = n.match(/Indian Institute of Technology\s*\(?[A-Z ]*\)?\s*([A-Za-z]+)/i);
  if (m) return `IIT ${m[1]}`;
  m = n.match(/National Institute of Technology[^,]*[, ]+([A-Za-z]+)/i);
  if (m) return `NIT ${m[1]}`;
  if (/MNNIT/i.test(n)) return "MNNIT Allahabad";
  if (/VNIT/i.test(n)) return "VNIT Nagpur";
  if (/SVNIT|Sardar Vallabhbhai/i.test(n)) return "SVNIT Surat";
  if (/Dr\.?\s*B\.?\s*R\.?\s*Ambedkar/i.test(n)) return "NIT Jalandhar";
  m = n.match(/Indian Institute of Information Technology[^,]*[, ]+([A-Za-z]+)/i);
  if (m) return `IIIT ${m[1]}`;
  m = n.match(/IIIT[, ]+([A-Za-z]+)/i);
  if (m) return `IIIT ${m[1]}`;
  // Fallback: trim to first 32 chars
  return n.length > 36 ? n.slice(0, 34).trim() + "…" : n;
}

// Strip "(4 Years, Bachelor of Technology)" trailing parenthetical.
export function cleanProgram(program: string): string {
  return program.replace(/\s*\([^()]*\)\s*$/g, "").trim();
}

// Derive a coarse branch group for filtering.
export function branchGroup(program: string): string {
  const p = cleanProgram(program).toLowerCase();
  if (/(computer|cse|software|information technology|^it\b|data sci|data engineering|artificial intelligence|machine learning|\bai\b|\bml\b)/.test(p))
    return "Computer Science";
  if (/electronic|\bece\b|communication|vlsi|microelectronic|electronics and instrumentation/.test(p))
    return "Electronics";
  if (/electrical|\beee\b|\bee\b|power|energy/.test(p)) return "Electrical";
  if (/mechanical|\bme\b|production|industrial|manufacturing|thermal|automobile/.test(p))
    return "Mechanical";
  if (/civil|structural|construction|transportation engineering/.test(p)) return "Civil";
  if (/chemical|petroleum|polymer|petrochemical/.test(p)) return "Chemical";
  if (/aero|avion|aviation/.test(p)) return "Aerospace";
  if (/metallurg|material|mineral|mining/.test(p)) return "Metallurgy & Materials";
  if (/architecture|planning|design/.test(p)) return "Architecture & Design";
  if (/biotech|bio[- ]?med|bio[- ]?engineering|bio[- ]?science/.test(p)) return "Biotech & Biomedical";
  if (/math|computing|statistics|physics|chemistry|life sci|earth|geo|ocean|nano/.test(p))
    return "Sciences";
  if (/agricultur|food|textile|leather|handloom|carpet|fashion/.test(p)) return "Other Engineering";
  return "Other";
}

export const BRANCH_GROUPS = [
  "Computer Science",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical",
  "Aerospace",
  "Metallurgy & Materials",
  "Architecture & Design",
  "Biotech & Biomedical",
  "Sciences",
  "Other Engineering",
  "Other",
];

// Parse rank string — trailing "P" means "preparatory" rank, still numeric.
export function parseRank(v: string | null | undefined): number | null {
  if (!v) return null;
  const m = v.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

export type Recommendation = "Safe" | "Moderate" | "Risky" | "Very Risky";

export function recommend(userRank: number, closingRank: number): {
  label: Recommendation;
  chance: number;
  diff: number;
} {
  const diff = closingRank - userRank; // positive => user is ahead (better)
  const ratio = userRank / closingRank;
  let chance: number;
  if (ratio <= 0.5) chance = 98;
  else if (ratio <= 0.75) chance = 92;
  else if (ratio <= 0.9) chance = 82;
  else if (ratio <= 1.0) chance = 65;
  else if (ratio <= 1.15) chance = 42;
  else if (ratio <= 1.35) chance = 22;
  else if (ratio <= 1.6) chance = 10;
  else chance = 3;

  let label: Recommendation;
  if (chance >= 80) label = "Safe";
  else if (chance >= 45) label = "Moderate";
  else if (chance >= 15) label = "Risky";
  else label = "Very Risky";

  return { label, chance, diff };
}
