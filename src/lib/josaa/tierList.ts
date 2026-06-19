// Canonical ordering of institutes within each tier (IIT, NIT, IIIT, GFTI).
// Used to display predictor results grouped by tier in a fixed institute order.

export const TIER_ORDER: Record<"IIT" | "NIT" | "IIIT" | "GFTI", string[]> = {
  IIT: [
    "Indian Institute of Technology Bombay",
    "Indian Institute of Technology Delhi",
    "Indian Institute of Technology Madras",
    "Indian Institute of Technology Kanpur",
    "Indian Institute of Technology Kharagpur",
    "Indian Institute of Technology Roorkee",
    "Indian Institute of Technology Guwahati",
    "Indian Institute of Technology Hyderabad",
    "Indian Institute of Technology (BHU) Varanasi",
    "Indian Institute of Technology Indore",
    "Indian Institute of Technology Dhanbad",
    "Indian Institute of Technology Ropar",
    "Indian Institute of Technology Gandhinagar",
    "Indian Institute of Technology Mandi",
    "Indian Institute of Technology Jodhpur",
    "Indian Institute of Technology Patna",
    "Indian Institute of Technology Bhubaneswar",
    "Indian Institute of Technology Tirupati",
    "Indian Institute of Technology Palakkad",
    "Indian Institute of Technology Bhilai",
    "Indian Institute of Technology Jammu",
    "Indian Institute of Technology Dharwad",
    "Indian Institute of Technology Goa",
  ],
  NIT: [
    "National Institute of Technology Tiruchirappalli",
    "National Institute of Technology Karnataka Surathkal",
    "National Institute of Technology Rourkela",
    "National Institute of Technology Warangal",
    "National Institute of Technology Calicut",
    "Malaviya National Institute of Technology Jaipur",
    "Visvesvaraya National Institute of Technology Nagpur",
    "National Institute of Technology Silchar",
    "National Institute of Technology Durgapur",
    "Motilal Nehru National Institute of Technology Allahabad",
    "Dr. B R Ambedkar National Institute of Technology Jalandhar",
    "National Institute of Technology Delhi",
    "National Institute of Technology Patna",
    "Maulana Azad National Institute of Technology Bhopal",
    "National Institute of Technology Jamshedpur",
    "National Institute of Technology Kurukshetra",
    "Sardar Vallabhbhai National Institute of Technology Surat",
    "National Institute of Technology Raipur",
    "National Institute of Technology Hamirpur",
    "National Institute of Technology Agartala",
    "National Institute of Technology Srinagar",
    "National Institute of Technology Goa",
    "National Institute of Technology Meghalaya",
    "National Institute of Technology Andhra Pradesh",
    "National Institute of Technology Puducherry",
    "National Institute of Technology Uttarakhand",
    "National Institute of Technology Manipur",
    "National Institute of Technology Nagaland",
    "National Institute of Technology Sikkim",
    "National Institute of Technology Mizoram",
    "National Institute of Technology Arunachal Pradesh",
  ],
  IIIT: [
    "IIIT Allahabad",
    "ABV-IIITM Gwalior",
    "IIITDM Jabalpur",
    "IIITDM Kancheepuram",
    "IIIT Lucknow",
    "IIIT Sri City",
    "IIIT Guwahati",
    "IIIT Vadodara",
    "IIIT Kota",
    "IIIT Tiruchirappalli",
    "IIIT Kottayam",
    "IIIT Pune",
    "IIIT Nagpur",
    "IIIT Kalyani",
    "IIIT Una",
    "IIIT Sonipat",
    "IIIT Dharwad",
    "IIIT Ranchi",
    "IIIT Bhopal",
    "IIIT Surat",
    "IIIT Bhagalpur",
    "IIITDM Kurnool",
    "IIIT Agartala",
    "IIIT Manipur",
    "IIIT Raichur",
    "IIIT Nagaland",
  ],
  GFTI: [
    "Birla Institute of Technology Mesra",
    "Punjab Engineering College Chandigarh",
    "Assam University",
    "Sant Longowal Institute of Engineering and Technology",
    "University of Hyderabad",
    "Shri Mata Vaishno Devi University",
    "Institute of Infrastructure Technology Research and Management",
    "International Institute of Information Technology Naya Raipur",
    "International Institute of Information Technology Bhubaneswar",
    "Pondicherry Engineering College",
    "School of Planning and Architecture Delhi",
    "School of Planning and Architecture Bhopal",
    "School of Planning and Architecture Vijayawada",
    "National Institute of Foundry and Forge Technology",
    "Institute of Technology Guru Ghasidas Vishwavidyalaya",
    "Jawaharlal Nehru University",
    "Mizoram University",
    "Tezpur University",
    "Central Institute of Technology Kokrajhar",
    "North Eastern Regional Institute of Science and Technology",
    "HNB Garhwal University",
    "Central University of Rajasthan",
    "North-Eastern Hill University",
  ],
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Returns canonical tier-list index for an institute name; 9999 if not matched.
export function tierIndex(
  type: "IIT" | "NIT" | "IIIT" | "GFTI",
  instituteName: string,
): number {
  const list = TIER_ORDER[type];
  if (!list) return 9999;
  const n = norm(instituteName);
  // Strongest match: contains the canonical name (or vice-versa).
  let best = 9999;
  for (let i = 0; i < list.length; i++) {
    const li = norm(list[i]);
    if (!li) continue;
    if (n === li) return i;
    if (n.includes(li) || li.includes(n)) {
      if (i < best) best = i;
    }
  }
  if (best !== 9999) return best;
  // Fallback: match by last token (typically the city).
  const lastTok = (s: string) => {
    const parts = s.trim().split(/\s+/);
    return norm(parts[parts.length - 1] ?? "");
  };
  const tok = lastTok(instituteName);
  if (tok) {
    for (let i = 0; i < list.length; i++) {
      if (lastTok(list[i]) === tok) return i;
    }
  }
  return 9999;
}

export const TIER_LABEL: Record<"IIT" | "NIT" | "IIIT" | "GFTI", string> = {
  IIT: "IITs",
  NIT: "NITs",
  IIIT: "IIITs",
  GFTI: "GFTIs",
};

export const TIER_SEQUENCE: Array<"IIT" | "NIT" | "IIIT" | "GFTI"> = [
  "IIT",
  "NIT",
  "IIIT",
  "GFTI",
];
