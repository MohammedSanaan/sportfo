// Centralized sports-gallery dataset for the homepage's #sports section.
// Reuses the same photography already licensed for the hero/mosaic
// carousels (public/images/carousel/**) rather than a separate asset set.
// `discoveryValue` maps to PRIMARY_SPORTS in athlete-options.ts where a
// matching filter exists on /athletes -- sports without one just don't get
// a "View athletes" link in the expanded card.
export interface SportsGalleryItem {
  key: string;
  name: string;
  image: string;
  discoveryValue: string | null;
}

// Order matches the sport list as given. Ball Badminton has no usable
// free-licensed photo anywhere checked (Pexels, Openverse, Wikimedia
// Commons -- the only "ball badminton"-tagged Commons photo is a
// mislabeled backyard rope-game snapshot, not the sport). It borrows the
// badminton photo as a stand-in until a real one is supplied.
export const SPORTS_GALLERY_ITEMS: SportsGalleryItem[] = [
  { key: "hockey", name: "Hockey", image: "/images/carousel/hockey.jpg", discoveryValue: null },
  { key: "football", name: "Football", image: "/images/carousel/football.jpg", discoveryValue: "football" },
  { key: "badminton", name: "Badminton", image: "/images/carousel/badminton.jpg", discoveryValue: "badminton" },
  { key: "tennis", name: "Tennis", image: "/images/carousel/tennis.jpg", discoveryValue: "tennis" },
  { key: "athletics", name: "Athletics", image: "/images/carousel/athletics.jpg", discoveryValue: "athletics" },
  { key: "cricket", name: "Cricket", image: "/images/carousel/cricket.jpg", discoveryValue: "cricket" },
  { key: "ball-badminton", name: "Ball Badminton", image: "/images/carousel/badminton.jpg", discoveryValue: null },
  { key: "volleyball", name: "Volleyball", image: "/images/carousel/volleyball.jpg", discoveryValue: "volleyball" },
  { key: "basketball", name: "Basketball", image: "/images/carousel/basketball.jpg", discoveryValue: "basketball" },
  { key: "swimming", name: "Swimming", image: "/images/carousel/swimming.jpg", discoveryValue: "swimming" },
  { key: "table-tennis", name: "Table Tennis", image: "/images/carousel/table-tennis.jpg", discoveryValue: null },
  { key: "kabaddi", name: "Kabaddi", image: "/images/carousel/kabaddi.jpg", discoveryValue: null },
  { key: "wrestling", name: "Wrestling", image: "/images/carousel/wrestling.jpg", discoveryValue: null },
  { key: "kho-kho", name: "Kho-Kho", image: "/images/carousel/kho-kho.jpg", discoveryValue: null },
  { key: "chess", name: "Chess", image: "/images/carousel/chess.jpg", discoveryValue: null },
  { key: "gymnastics", name: "Gymnastics", image: "/images/carousel/gymnastics.jpg", discoveryValue: null },
];
