import type { Story } from "./types";

// Editorial content, not user data -- kept in English only, the same
// choice made for public athlete profile content (see
// src/lib/athlete/public-profile.ts). Translating four long-form stories
// into five more scripts would multiply the words-that-can-drift-stale
// surface for very little payoff on a marketing/editorial route; the
// surrounding page chrome (nav, back links, section headings) is still
// fully localized via the i18n dictionary (see storiesPage/storyDetail in
// src/i18n/translations/*.ts).
//
// None of these stories are attributed biographies of a specific named
// real person -- each is an original SportFo Editorial narrative built
// from patterns that are well documented across Indian grassroots sport
// (gully cricket feeding district trials, youth athletics injury cycles,
// small-town girls' access to badminton courts, open-water swimmers
// training without a pool). That's a deliberate choice: it lets the
// writing be specific and grounded without claiming verified facts,
// quotes, or statistics about any one real athlete.
export const STORIES: Story[] = [
  {
    id: "story-1",
    slug: "gully-cricket-to-state-trials",
    title: "From Gully Cricket to State Trials",
    category: "Grassroots Cricket",
    excerpt:
      "Before the state trial and the proper turf, there was a strip of concrete between two buildings, a tennis ball wrapped in electrical tape, and a wall that doubled as the third stump.",
    coverImage: "/images/carousel/cricket.jpg",
    heroImage: "/images/carousel/cricket.jpg",
    imageAlt: "Silhouette of a young cricketer holding a bat against a rooftop sunset",
    author: "SportFo Editorial",
    publishedAt: "2026-01-12",
    readTimeMinutes: 5,
    relatedSlugs: ["breaking-barriers-one-match-at-a-time", "two-injuries-one-comeback"],
    content: [
      {
        type: "paragraph",
        text: "Every evening, for as long as anyone in the lane can remember, the same twenty feet of concrete between two apartment blocks turns into a cricket ground. A chalked crease. A wall with a rough rectangle drawn on it for a stump. A tennis ball, its shine long gone, wound in electrical tape to make it bite off the rough surface. Six and out. Tip and run if the ball goes past the gate. Everyone knows the rules because nobody wrote them down — they were just inherited, the way a lane inherits its own version of the game.",
      },
      {
        type: "heading",
        text: "The Lane Before the Ground",
      },
      {
        type: "paragraph",
        text: "Gully cricket is often treated as a warm-up act to the real sport — something children do before they're old enough for a proper club. In practice, it's closer to the opposite: an unglamorous, unfunded, endlessly repeated apprenticeship. A batter facing a taped ball on uneven concrete learns to adjust to bounce that no coaching manual can simulate. A bowler learns to set a field with three fielders instead of nine. Nobody is scouting the lane, so the only thing that matters is whether you can actually play — not how you look doing it.",
      },
      {
        type: "paragraph",
        text: "That distinction matters more than it sounds. Across Indian cities, this informal cricket economy — played on rooftops, in narrow streets, in the fifteen minutes between school and homework — is where an enormous amount of raw cricketing instinct is actually built. The gap has never really been talent. It's visibility: almost none of these games are watched by anyone who could do something with what they see.",
      },
      {
        type: "quote",
        text: "Talent doesn't need a stadium to exist. It needs one person to notice it.",
      },
      {
        type: "heading",
        text: "When Someone Finally Watches",
      },
      {
        type: "paragraph",
        text: "The turning point, when it comes, is rarely dramatic. It's a school PE teacher who happens to walk past a lane game and clocks a clean bat swing. A local club coach running an open trial who notices a bowler getting awkward bounce out of a rank concrete pitch and wonders what that arm could do with a proper seam. An older cousin who plays league cricket and drags a promising kid along to a real net session, half out of pride and half out of curiosity.",
      },
      {
        type: "paragraph",
        text: "What follows is a genuinely difficult adjustment. A tennis ball wrapped in tape behaves nothing like a leather ball — it doesn't seam, it doesn't hurt when it hits your knuckles, and it doesn't demand the same defensive technique. The first few sessions with a real ball are often humbling: shots that worked perfectly in the lane get exposed by proper bounce and carry. Coaches watching this transition describe it less as teaching cricket from scratch and more as correcting instincts that were built for the wrong equipment.",
      },
      {
        type: "heading",
        text: "The Trial Nobody Sees",
      },
      {
        type: "paragraph",
        text: "District and state trials in India are enormous, crowded, and unforgiving — a reflection of just how many players are competing for a small number of slots. What rarely gets discussed is everything that happens before a player even reaches the boundary rope: the cost of the kit, the bus fare to a trial ground that might be three hours away, a day of missed school or missed wages for a parent who has to accompany a minor. For every player who walks in with a proper club behind them, there's another who is just as capable and simply couldn't make the trip that year.",
      },
      {
        type: "paragraph",
        text: "This is the part of the journey that a scoreboard never captures, and it's exactly the gap platforms built for athlete visibility are trying to close — not by replacing the trial, but by making sure a player's performance, once it happens anywhere, doesn't just disappear into a coach's notebook that nobody else will ever read.",
      },
      {
        type: "paragraph",
        text: "Whether or not a given trial ends in selection, something has already changed by the time a player gets there. The lane doesn't go away — the habits it built, the ability to read a game with almost no information, the comfort with pressure that comes from playing in front of an audience of neighbours who will absolutely let you know if you got out cheaply — all of that travels with them onto the bigger ground. The trial is a single afternoon. The lane is years.",
      },
    ],
  },
  {
    id: "story-2",
    slug: "two-injuries-one-comeback",
    title: "Two Injuries, One Comeback",
    category: "Athletics",
    excerpt:
      "A torn hamstring, a rushed comeback, and a second tear in the same season — the quiet, unglamorous work of learning to treat a young body as a career, not a deadline.",
    coverImage: "/images/carousel/athletics.jpg",
    heroImage: "/images/carousel/athletics.jpg",
    imageAlt: "Silhouette of a runner training on an athletics track at dusk",
    author: "SportFo Editorial",
    publishedAt: "2026-01-19",
    readTimeMinutes: 5,
    relatedSlugs: ["gully-cricket-to-state-trials", "discipline-behind-every-practice"],
    content: [
      {
        type: "paragraph",
        text: "Most mornings at the track start the same way for every runner in the group: a warm-up jog, a set of strides, then the main session — repetitions, intervals, whatever the week calls for. On one particular morning, one runner is doing none of that. She's on a mat off to the side, working through a resistance-band routine a physiotherapist wrote out by hand, while the rest of the group's spikes click past on the inside lane. This is also training. It just doesn't look like it.",
      },
      {
        type: "heading",
        text: "The First Tear",
      },
      {
        type: "paragraph",
        text: "The initial hamstring injury happened the way these things usually do — not from one bad step, but from an accumulation of load a young body wasn't quite ready to absorb. It came at a state meet, mid-race, the kind of sudden tightening that every middle-distance runner learns to recognise and dread. Scans, a diagnosis, a recovery timeline measured in months rather than weeks. For an athlete used to measuring progress in seconds, being handed a calendar instead was its own kind of injury.",
      },
      {
        type: "heading",
        text: "Coming Back Too Soon",
      },
      {
        type: "paragraph",
        text: "The rehab went reasonably well, but the timing didn't. A selection trial was approaching, and the pressure to be ready for it — some of it external, plenty of it self-imposed — meant returning to full training before the muscle had genuinely finished healing. Three weeks later, in a session that wasn't even particularly hard, the same hamstring gave way again. A second tear, in the same season, is a distinctly different experience from the first. It doesn't just cost more recovery time. It costs confidence in your own body's word.",
      },
      {
        type: "quote",
        text: "The first injury asks how strong you are. The second asks how patient you are.",
      },
      {
        type: "heading",
        text: "Rebuilding Differently",
      },
      {
        type: "paragraph",
        text: "The second rehab looked almost nothing like the first. It was slower on purpose — a structured strength programme, staged reintroduction to running load with hard caps on weekly mileage increases, and regular check-ins with a physiotherapist instead of a single injury assessment followed by guesswork. For an athlete, this kind of access — consistent, ongoing sports-science support rather than a one-time fix — is exactly the resource that's hardest to come by outside a handful of major academies, and it's often the real deciding factor in who recovers properly and who re-injures on a loop.",
      },
      {
        type: "paragraph",
        text: "It also required a mental shift that had nothing to do with fitness. Treating a young athletic career as something to be managed over years, not sprinted through in a single season, meant accepting slower progress in the short term in exchange for actually still being able to run in the long term.",
      },
      {
        type: "heading",
        text: "Running Again, Wiser",
      },
      {
        type: "paragraph",
        text: "The eventual return to competition wasn't a dramatic redemption race — it was a modestly-timed run in a modest regional meet, notable mainly for the fact that nothing hurt afterward. That absence of pain was the actual victory. What changed permanently wasn't just the hamstring; it was the relationship with training itself; pacing, recovery days, and listening to a body's warning signs became as much a part of the sport as the running. Stories like this rarely make headlines, mostly because the outcome is unglamorous — an athlete who's simply still competing, two years on, instead of one who quietly disappeared after a second setback nobody heard about.",
      },
    ],
  },
  {
    id: "story-3",
    slug: "breaking-barriers-one-match-at-a-time",
    title: "Breaking Barriers, One Match at a Time",
    category: "Grassroots Badminton",
    excerpt:
      "In a small town, the only badminton court is shared with the boys' evening batch. Getting real court time — and then permission to travel for a tournament — takes as much work as the game itself.",
    coverImage: "/images/carousel/badminton.jpg",
    heroImage: "/images/carousel/badminton.jpg",
    imageAlt: "Silhouette of a badminton player smashing a shuttle in an open field at sunset",
    author: "SportFo Editorial",
    publishedAt: "2026-01-26",
    readTimeMinutes: 5,
    relatedSlugs: ["discipline-behind-every-practice", "gully-cricket-to-state-trials"],
    content: [
      {
        type: "paragraph",
        text: "The community court opens at 6 a.m., and the earliest slot belongs, by long-standing unspoken arrangement, to the girls' batch. Not because it's convenient — it's the coldest, darkest hour of the day — but because it's the only slot that doesn't clash with the boys' evening sessions, school, or the household chores that are expected of them the moment they're home. Six girls, one badminton net with a slightly sagging middle, and about ninety minutes before the court has to be cleared.",
      },
      {
        type: "heading",
        text: "A Court Shared, Not Owned",
      },
      {
        type: "paragraph",
        text: "This kind of scheduling isn't unusual in small-town India — it's closer to the norm. Community courts and school grounds serve far more players than they were built for, and access tends to sort itself along familiar lines: whoever asks first, whoever's family carries more weight locally, whoever is willing to play at 6 a.m. because no other hour is available. For a girl trying to get serious about the sport, the first real opponent isn't across the net. It's the timetable.",
      },
      {
        type: "heading",
        text: "The First Tournament Away From Home",
      },
      {
        type: "paragraph",
        text: "Getting good enough for a district tournament is one hurdle. Getting permission to actually travel to it is often a separate, harder one. A tournament two towns over means an overnight stay, a chaperone, a travel cost that has to be weighed against a dozen other household priorities, and — for many families — a conversation about whether it's appropriate for a teenage girl to travel for sport at all. None of that shows up in a draw sheet. It happens entirely at the kitchen table, days before the entry form is even submitted.",
      },
      {
        type: "quote",
        text: "Every small-town girl who plays a district tournament has already won an argument nobody put on the scoreboard.",
      },
      {
        type: "heading",
        text: "Small Wins That Don't Make Headlines",
      },
      {
        type: "paragraph",
        text: "Progress at this level rarely looks like a trophy. It looks like getting listed on a district ranking sheet for the first time. It looks like being added to a WhatsApp group where coaches and players across the region quietly share information about upcoming trials, open coaching camps, and which academies are actually taking new players — the informal network that, in the absence of a formal one, is how grassroots Indian sport actually organises itself. Getting into that group is sometimes as valuable as any single match result.",
      },
      {
        type: "heading",
        text: "What Changes When Someone Can Find You",
      },
      {
        type: "paragraph",
        text: "The persistent problem underneath all of this is reputation without reach — a player can be genuinely known and respected within her own district and still be completely invisible to an academy scout two states away who has no way of hearing about her. That's the specific gap a verified, shareable athlete profile is built to close: not replacing the court time, the family conversations, or the tournament grind, but making sure that once a player has actually done the work, someone outside her immediate circle has a real chance of finding out.",
      },
    ],
  },
  {
    id: "story-4",
    slug: "discipline-behind-every-practice",
    title: "Discipline Behind Every Practice",
    category: "Open-Water Swimming",
    excerpt:
      "Long before a pool, a lake, before dawn. The unglamorous, repetitive discipline of open-water training is the part of a swimmer's story that never makes it to competition day.",
    coverImage: "/images/carousel/swimming.jpg",
    heroImage: "/images/carousel/swimming.jpg",
    imageAlt: "Swimmer's legs breaking the surface of open water during an early-morning training session",
    author: "SportFo Editorial",
    publishedAt: "2026-02-02",
    readTimeMinutes: 4,
    relatedSlugs: ["two-injuries-one-comeback", "breaking-barriers-one-match-at-a-time"],
    content: [
      {
        type: "paragraph",
        text: "At five in the morning, the lake is the same temperature as the air, which is to say: cold enough that getting in requires a small negotiation with yourself every single day. There's no lane rope, no chlorine smell, no wall to push off. Just open water, a fixed buoy marking the turnaround point, and a coach standing on the bank with a stopwatch and a torch.",
      },
      {
        type: "heading",
        text: "Water Before a Pool",
      },
      {
        type: "paragraph",
        text: "In much of India, a formal 25-metre or 50-metre pool is a rare and often expensive resource — something that exists in a handful of clubs and academies in larger towns. Long before many young swimmers ever see one, they learn to swim in rivers, lakes, temple tanks, and stretches of coastline, usually taught by an older family member out of necessity rather than ambition. It's in this open water, not in a regulation pool, that a coach often first spots raw aptitude: a natural feel for the water, a stroke rhythm that holds up over distance, a comfort in conditions most people find intimidating.",
      },
      {
        type: "heading",
        text: "The Discipline Nobody Sees",
      },
      {
        type: "paragraph",
        text: "What separates a promising young swimmer from a talented one isn't usually visible in a single session — it's the accumulation of hundreds of near-identical mornings. The same stretch of water, the same pre-dawn cold, the same stroke count, repeated with almost no variation and almost no audience. There's nothing cinematic about it. It's simply the price of the sport, paid daily, well before there's any competition to show for it.",
      },
      {
        type: "quote",
        text: "Nobody claps for the four hundredth lap. That's exactly why it matters.",
      },
      {
        type: "heading",
        text: "From River to Regulation Pool",
      },
      {
        type: "paragraph",
        text: "The eventual move to a formal pool — for those who get the chance — is its own adjustment. Open water rewards endurance and a stable rhythm; a regulation pool introduces turns, lane discipline, and precise stroke correction against a backdrop of black lines and pace clocks. Coaches who train swimmers who started in open water often note the same thing: the technique needs polishing, but the engine — the sheer capacity to keep going — rarely needs to be built from scratch. It's already there, put in over years of unglamorous repetition.",
      },
      {
        type: "heading",
        text: "Why the Habit Matters More Than the Talent",
      },
      {
        type: "paragraph",
        text: "It's tempting to talk about swimming talent as something a person either has or doesn't. What actually tends to decide how far it goes is closer to habit: whether a young athlete can keep showing up to cold water at five in the morning long after it's stopped feeling like an adventure and started feeling like a routine. That discipline, built with no audience at all, is usually the exact thing that holds up once an audience finally arrives.",
      },
    ],
  },
];

export function getAllStories(): Story[] {
  return STORIES;
}

export function getStoryBySlug(slug: string): Story | undefined {
  return STORIES.find((story) => story.slug === slug);
}

export function getAllStorySlugs(): string[] {
  return STORIES.map((story) => story.slug);
}

// Prefers a story's own curated relatedSlugs; falls back to other stories
// in the same category, then to any other stories, so the section never
// renders empty even as new stories are added without relatedSlugs set.
export function getRelatedStories(slug: string, limit = 3): Story[] {
  const current = getStoryBySlug(slug);
  if (!current) return [];

  const bySlug = (current.relatedSlugs ?? [])
    .map((relatedSlug) => getStoryBySlug(relatedSlug))
    .filter((story): story is Story => Boolean(story) && story!.slug !== slug);

  const seen = new Set(bySlug.map((story) => story.slug));
  const sameCategory = STORIES.filter(
    (story) => story.slug !== slug && story.category === current.category && !seen.has(story.slug),
  );
  const rest = STORIES.filter(
    (story) => story.slug !== slug && story.category !== current.category && !seen.has(story.slug),
  );

  return [...bySlug, ...sameCategory, ...rest].slice(0, limit);
}
