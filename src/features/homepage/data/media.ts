/**
 * Photography manifest.
 *
 * Every file lives in /public/media and is openly licensed (see
 * public/media/CREDITS.json for per-image attribution). Sources vary wildly
 * in colour and era, so nothing here is ever rendered raw — `EditorialImage`
 * applies the navy grade and grain that makes the set read as one shoot.
 *
 * `focus` is the object-position used when the image is cropped hard, which
 * on this page is most of the time.
 */

export interface Media {
  src: string;
  alt: string;
  focus?: string;
}

export const MEDIA = {
  heroAthlete: {
    src: "/media/hero-athlete.jpg",
    alt: "A sprinter bursting from starting blocks under dramatic stadium floodlights",
    focus: "55% 40%",
  },
  floodlights: {
    src: "/media/floodlights.jpg",
    alt: "A floodlit pitch at night, players small under a single tower of light",
    focus: "50% 45%",
  },
  stadiumNight: {
    src: "/media/stadium-night.jpg",
    alt: "A full stadium seen from above at night, the pitch lit green",
    focus: "50% 55%",
  },
  stadiumFull: {
    src: "/media/stadium-full.jpg",
    alt: "A packed stadium bowl under evening light",
  },
  stadiumTrails: {
    src: "/media/stadium-trails.jpg",
    alt: "A stadium exterior glowing red above light trails from passing traffic",
  },
  tunnel: {
    src: "/media/tunnel.jpg",
    alt: "Players silhouetted at the far end of a players' tunnel",
    focus: "50% 50%",
  },
  tunnelFigures: {
    src: "/media/tunnel-figures.jpg",
    alt: "Figures backlit in a dark stadium tunnel",
  },
  crowd: {
    src: "/media/crowd.jpg",
    alt: "A dense crowd photographed in black and white",
  },
  trackLanes: {
    src: "/media/track-lanes.jpg",
    alt: "Numbered lanes painted on a running track",
    focus: "50% 60%",
  },
  laneNumeral: {
    src: "/media/lane-numeral.jpg",
    alt: "The numeral four painted across a running-track lane",
  },
  track1500: {
    src: "/media/track-1500.jpg",
    alt: "The 1500m start marking on a running track",
  },
  blocks: {
    src: "/media/blocks.jpg",
    alt: "A sprinter set in the starting blocks on an outdoor track",
    focus: "50% 40%",
  },
  blocksClose: {
    src: "/media/blocks-close.jpg",
    alt: "A close view of a sprinter's feet in the starting blocks",
  },
  poolLanes: {
    src: "/media/pool-lanes.jpg",
    alt: "Lane ropes stretched across a swimming pool seen from above",
  },
  swimmer: {
    src: "/media/swimmer.jpg",
    alt: "A swimmer mid-stroke between lane ropes",
    focus: "50% 45%",
  },
  pitchCorner: {
    src: "/media/pitch-corner.jpg",
    alt: "The corner arc marked on a grass pitch",
  },
  footballPitch: {
    src: "/media/football-pitch.jpg",
    alt: "A match ball resting on the grass in front of an empty stand",
  },
  tennisGeometry: {
    src: "/media/tennis-geometry.jpg",
    alt: "The painted lines of a tennis court meeting at an angle",
  },
  tennisClay: {
    src: "/media/tennis-clay.jpg",
    alt: "A racket and ball resting on clay",
  },
  tennisCourtBlue: {
    src: "/media/tennis-court-blue.jpg",
    alt: "A player reaching for a shot on a blue hard court",
    focus: "50% 45%",
  },
  basketballCourt: {
    src: "/media/basketball-court.jpg",
    alt: "A player dribbling across an outdoor basketball court",
    focus: "50% 45%",
  },
  basketballOutdoor: {
    src: "/media/basketball-outdoor.jpg",
    alt: "An outdoor basketball hoop silhouetted against a sunset",
  },
  basketballBall: {
    src: "/media/basketball-ball.jpg",
    alt: "A basketball resting on asphalt",
  },
  hockeyIce: {
    src: "/media/hockey-ice.jpg",
    alt: "Two players contesting the puck on an outdoor rink in the snow",
  },
  racketDark: {
    src: "/media/racket-dark.jpg",
    alt: "A player standing with a racket beside a floodlit court cage",
    focus: "50% 40%",
  },
  athletesBw: {
    src: "/media/athletes-bw.jpg",
    alt: "Athletes lifting in low light, photographed in black and white",
  },
  footballer: {
    src: "/media/footballer.jpg",
    alt: "A footballer raising an arm in celebration, ball under the other",
    focus: "50% 35%",
  },
  sprinter: {
    src: "/media/sprinter.jpg",
    alt: "A sprinter crouched in the set position on a track",
    focus: "45% 40%",
  },
  sprintStart: {
    src: "/media/sprint-start.jpg",
    alt: "A runner driving out of the blocks on a red track",
    focus: "50% 40%",
  },
  trackAthlete: {
    src: "/media/track-athlete.jpg",
    alt: "An athlete photographed from above, standing on a running track",
    focus: "50% 35%",
  },
  portraitA: {
    src: "/media/portrait-a.jpg",
    alt: "An athlete in training kit outdoors, arms open",
    focus: "50% 30%",
  },
  portraitB: {
    src: "/media/portrait-b.jpg",
    alt: "An athlete in a race vest and sunglasses, hands on hips",
    focus: "50% 30%",
  },
  portraitC: {
    src: "/media/portrait-c.jpg",
    alt: "An athlete in a red training jacket on a wooded path",
    focus: "50% 28%",
  },
  portraitE: {
    src: "/media/portrait-e.jpg",
    alt: "An athlete photographed in profile against a dark background",
    focus: "55% 30%",
  },
  sportCricket: {
    src: "/media/sport-cricket.jpg",
    alt: "A cricket batsman playing a shot, ball in flight",
    focus: "50% 40%",
  },
  sportBadminton: {
    src: "/media/sport-badminton.jpg",
    alt: "Two badminton doubles pairs contesting a point at the net",
    focus: "50% 55%",
  },
  sportHockey: {
    src: "/media/sport-hockey.jpg",
    alt: "Field hockey players contesting the ball with sticks raised",
    focus: "50% 55%",
  },
  sportVolleyball: {
    src: "/media/sport-volleyball.jpg",
    alt: "A volleyball player mid-air spiking the ball",
    focus: "50% 40%",
  },
  sportTableTennis: {
    src: "/media/sport-table-tennis.jpg",
    alt: "A table tennis player returning a shot across the table",
    focus: "40% 45%",
  },
} as const satisfies Record<string, Media>;

export type MediaKey = keyof typeof MEDIA;
