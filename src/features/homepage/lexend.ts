import { Lexend } from "next/font/google";

// Scoped to the Stitch landing page ("/") only -- imported once here and
// its `variable` class applied to that page's own wrapper, so the rest of
// the app (auth, registration, profiles) keeps using --font-sans/Inter.
export const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
