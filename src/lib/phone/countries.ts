export interface Country {
  iso2: string;
  name: string;
  dialCode: string;
  flag: string;
}

// Deliberately not exhaustive of every ITU-assigned code -- a curated list
// covering the MVP's priority markets (India, Qatar) plus the rest of the
// Gulf, South/Southeast Asia, and other major regions. Ordered with the
// priority countries first (India leads -- SportFo's primary market and
// the default selection on /auth), then alphabetically by name. Sourced
// from public ITU-T E.164 country calling codes; no third-party
// dependency needed for a static list like this.
export const PRIORITY_COUNTRY_CODES = ["IN", "QA"];

export const COUNTRIES: Country[] = [
  { iso2: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { iso2: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { iso2: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { iso2: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" },
  { iso2: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { iso2: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { iso2: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { iso2: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { iso2: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { iso2: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { iso2: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { iso2: "HK", name: "Hong Kong", dialCode: "+852", flag: "🇭🇰" },
  { iso2: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { iso2: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
  { iso2: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { iso2: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { iso2: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴" },
  { iso2: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { iso2: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { iso2: "LB", name: "Lebanon", dialCode: "+961", flag: "🇱🇧" },
  { iso2: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { iso2: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { iso2: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵" },
  { iso2: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { iso2: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿" },
  { iso2: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { iso2: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { iso2: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
  { iso2: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { iso2: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { iso2: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱" },
  { iso2: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { iso2: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺" },
  { iso2: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { iso2: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { iso2: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { iso2: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { iso2: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { iso2: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰" },
  { iso2: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { iso2: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { iso2: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭" },
  { iso2: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷" },
  { iso2: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { iso2: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { iso2: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];
