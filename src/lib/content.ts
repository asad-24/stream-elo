export type ProjectCategory = "Film" | "Documentaries" | "Theatre" | "Music";

export type ProjectStatus =
  | "Live"
  | "Upcoming"
  | "Streaming"
  | "Now Showing"
  | "Completed"
  | "In Production";

export type VideoSource =
  | { type: "youtube"; url: string; label: string }
  | { type: "mp4"; url: string; label: string }
  | { type: "hls"; url: string; label: string };

export type Project = {
  title: string;
  slug: string;
  category: ProjectCategory;
  poster: string;
  cover: string;
  shortSynopsis: string;
  fullSynopsis: string;
  director: string;
  cast: string[];
  year: string;
  duration: string;
  location: string;
  productionDate: string;
  status: ProjectStatus;
  video?: VideoSource;
  gallery: string[];
  credits: string[];
};

export const asset = {
  logo: "https://meroestream.com/wp-content/uploads/2026/05/Copy_of_SVG_file-removebg-preview-1.webp",
  heroPoster:
    "https://meroestream.com/wp-content/uploads/2026/07/poster-collage-landscape-1-scaled.png",
  collage:
    "https://meroestream.com/wp-content/uploads/2026/07/merged_collage_landscape-e1783290037195.png",
  heroVideo:
    "https://meroestream.com/wp-content/uploads/2026/07/Copy-of-DW-Trailer_Drums-4K.mp4",
  dwVideo:
    "https://meroestream.com/wp-content/uploads/2026/07/Copy-of-DW-Trailer_Drums-4K-1.mp4",
  ironRiver:
    "https://meroestream.com/wp-content/uploads/2026/06/Meroe_Gold-scaled.jpeg",
  ticketPoster:
    "https://meroestream.com/wp-content/uploads/2026/06/Ticket-To-Life-Poster30.png",
  dwPoster: "https://meroestream.com/wp-content/uploads/2026/06/DW-Poster-2.png",
  dwPosterAlt:
    "https://meroestream.com/wp-content/uploads/2026/06/DW-Poster-1.png",
  palmwine:
    "https://meroestream.com/wp-content/uploads/2026/06/Take-a-look-at-my-Canva-design4-1-scaled-e1783290194226.jpg",
  theatreStill:
    "https://meroestream.com/wp-content/uploads/2026/06/DSC_2275_filtered-scaled.jpg",
  stageWide: "https://meroestream.com/wp-content/uploads/2026/06/TTLSnaps3.jpeg",
  stageDetail:
    "https://meroestream.com/wp-content/uploads/2026/06/TTLSaMba.jpeg",
  rehearsal:
    "https://meroestream.com/wp-content/uploads/2026/06/PHOTO-2025-08-05-11-30-49.jpg",
  portraitA: "https://meroestream.com/wp-content/uploads/2026/06/Tony.png",
  portraitB:
    "https://meroestream.com/wp-content/uploads/2026/06/DSC00541-scaled.png",
  portraitC:
    "https://meroestream.com/wp-content/uploads/2026/06/Take-a-look-at-my-Canva-design9.jpg",
  portraitD:
    "https://meroestream.com/wp-content/uploads/2026/06/Comedy-Call1.jpeg",
};

export const navigation = [
  { label: "About", href: "/about" },
  { label: "Stories", href: "/success-stories" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Films", href: "/films" },
  { label: "Theatre", href: "/theatre" },
  { label: "BTS", href: "/behind-the-scenes" },
  { label: "Contact", href: "/contact" },
];

export const stats = [
  { value: 9, label: "Selections" },
  { value: 6, label: "Nominations" },
  { value: 1, label: "Win" },
];

export const projects: Project[] = [
  {
    title: "The Iron River",
    slug: "the-iron-river",
    category: "Film",
    poster: asset.ironRiver,
    cover: asset.collage,
    shortSynopsis:
      "A feature drama tracing memory, migration, and inheritance along a river that refuses to forget.",
    fullSynopsis:
      "A cinematic drama about a family returning to the river settlement that shaped them, The Iron River explores what happens when personal history meets public myth.",
    director: "Adaeze Okonkwo",
    cast: ["Tori Yusuf", "Korede Olayinka", "Babatunde Lawal"],
    year: "2024",
    duration: "112 min",
    location: "Nigeria / United Kingdom",
    productionDate: "2024",
    status: "Streaming",
    video: {
      type: "youtube",
      url: "https://youtu.be/cGSaA9KtybM?si=XF-FJ-UXRPUtZiWW",
      label: "Watch trailer",
    },
    gallery: [asset.ironRiver, asset.collage, asset.stageWide],
    credits: ["Produced by Meroestream", "Original screenplay", "Festival cut"],
  },
  {
    title: "Ticket to Life",
    slug: "ticket-to-life",
    category: "Film",
    poster: asset.ticketPoster,
    cover: asset.stageWide,
    shortSynopsis:
      "A tense human story about choice, consequence, and the cost of one impossible journey.",
    fullSynopsis:
      "Ticket to Life follows intersecting lives at the edge of a decision, blending intimate character work with a sweeping portrait of ambition and survival.",
    director: "Meroestream Collective",
    cast: ["Elvis", "Tori Yusuf"],
    year: "2026",
    duration: "98 min",
    location: "Lagos / Ibadan",
    productionDate: "2026",
    status: "Completed",
    gallery: [asset.ticketPoster, asset.stageDetail, asset.rehearsal],
    credits: ["Meroestream production", "Original African story"],
  },
  {
    title: "Double Whammy",
    slug: "double-whammy",
    category: "Documentaries",
    poster: asset.dwPoster,
    cover: asset.dwPosterAlt,
    shortSynopsis:
      "A propulsive documentary portrait of art, pressure, rhythm, and resilience.",
    fullSynopsis:
      "Double Whammy moves through rehearsal rooms, streets, and private moments to observe the discipline behind performance and the cost of momentum.",
    director: "Babatunde Lawal",
    cast: ["Meroestream Ensemble"],
    year: "2026",
    duration: "42 min",
    location: "Nigeria",
    productionDate: "2026",
    status: "Now Showing",
    video: { type: "mp4", url: asset.dwVideo, label: "Play excerpt" },
    gallery: [asset.dwPoster, asset.dwPosterAlt, asset.theatreStill],
    credits: ["Edited trailer supplied by client", "Music direction pending"],
  },
  {
    title: "The Palmwine Drinkard",
    slug: "the-palmwine-drinkard",
    category: "Theatre",
    poster: asset.palmwine,
    cover: asset.theatreStill,
    shortSynopsis:
      "A stage reimagining of myth, appetite, and the electric imagination of oral tradition.",
    fullSynopsis:
      "The Palmwine Drinkard turns folklore into a contemporary stage language: precise, musical, funny, and haunted by ancestral memory.",
    director: "Meroestream Stage",
    cast: ["Korede Olayinka", "Elvis", "Company Ensemble"],
    year: "2026",
    duration: "85 min",
    location: "Ibadan",
    productionDate: "2026",
    status: "Live",
    gallery: [asset.palmwine, asset.stageWide, asset.stageDetail],
    credits: ["Live theatre production", "Stage adaptation"],
  },
  {
    title: "Wanderings",
    slug: "wanderings",
    category: "Music",
    poster: asset.stageDetail,
    cover: asset.rehearsal,
    shortSynopsis:
      "A sound-led moving image experiment shaped by memory, distance, and return.",
    fullSynopsis:
      "Wanderings is a music and image piece designed as a companion to Meroestream's performance slate, holding room for rhythm and interior life.",
    director: "Meroestream Music Unit",
    cast: ["Featured vocalists to be confirmed"],
    year: "2026",
    duration: "4 min",
    location: "Lagos",
    productionDate: "2026",
    status: "In Production",
    gallery: [asset.stageDetail, asset.rehearsal, asset.collage],
    credits: ["Original music", "Final credits pending"],
  },
];

export const featuredFilms: Project[] = [
  projects[0],
  projects[1],
  {
    ...projects[2],
    title: "Hidden Hand With a Last Card",
    slug: "hidden-hand-with-a-last-card",
    category: "Film",
    shortSynopsis:
      "A compact thriller about secrets, leverage, and the final move no one sees coming.",
    video: {
      type: "youtube",
      url: "https://youtu.be/5qKA6p2syks?si=A97S1JS052_SFPfR",
      label: "Watch trailer",
    },
  },
];

export const theatreProductions = [
  {
    title: "Daughters of Oya",
    city: "Lagos",
    country: "Nigeria",
    dates: "Autumn 2026",
    status: "Upcoming" as ProjectStatus,
    poster: asset.theatreStill,
    description:
      "A storm-lit ensemble piece about inheritance, matriarchal power, and the women who carry weather in their bones.",
    gallery: [asset.theatreStill, asset.stageWide, asset.stageDetail],
  },
  {
    title: "The Griot's Last Song",
    city: "Ibadan",
    country: "Nigeria",
    dates: "Winter 2026",
    status: "Live" as ProjectStatus,
    poster: asset.stageWide,
    description:
      "Music, memory, and performance meet in a chamber work about the last keeper of a village's forbidden archive.",
    gallery: [asset.stageWide, asset.rehearsal, asset.palmwine],
  },
  {
    title: "Anansi Rising",
    city: "London",
    country: "United Kingdom",
    dates: "2027",
    status: "In Production" as ProjectStatus,
    poster: asset.stageDetail,
    description:
      "A trickster story staged with movement, shadow, and a contemporary diaspora pulse.",
    gallery: [asset.stageDetail, asset.collage, asset.theatreStill],
  },
  {
    title: "Kalahari Dreaming",
    city: "Cape Town",
    country: "South Africa",
    dates: "To be announced",
    status: "Streaming" as ProjectStatus,
    poster: asset.rehearsal,
    description:
      "A dream-play moving between desert silence, family rupture, and the songs that outlive exile.",
    gallery: [asset.rehearsal, asset.stageWide, asset.ironRiver],
  },
];

export const successStories = [
  {
    name: "Korede Olayinka",
    role: "Actor, theatre performer, and story collaborator",
    image: asset.portraitB,
    bio: "Korede works across stage and screen with a physical, emotionally precise style. Meroestream supports his movement from ensemble performance into lead dramatic roles.",
    projects: ["The Palmwine Drinkard", "The Iron River", "The Griot's Last Song"],
  },
  {
    name: "Babatunde Lawal",
    role: "Director and documentary storyteller",
    image: asset.portraitA,
    bio: "Babatunde develops nonfiction and hybrid work about pressure, identity, and everyday genius. His projects sit at the intersection of documentary discipline and theatrical rhythm.",
    projects: ["Double Whammy", "Borrowed Time", "Wanderings"],
  },
  {
    name: "Elvis",
    role: "Performer and emerging screen presence",
    image: asset.portraitD,
    bio: "Elvis brings a direct, charismatic energy to stories about ambition and survival. His work with Meroestream focuses on performance craft and screen confidence.",
    projects: ["Ticket to Life", "The Palmwine Drinkard", "Anansi Rising"],
  },
  {
    name: "Tori Yusuf",
    role: "Actor, writer, and cultural voice",
    image: asset.portraitC,
    bio: "Tori's work is rooted in identity, language, and emotional intelligence. Meroestream is helping shape her transition into larger screen and stage collaborations.",
    projects: ["The Iron River", "Ticket to Life", "Daughters of Oya"],
  },
];

export const btsProjects = [
  {
    title: "Ticket to Life",
    details:
      "Production stills, rehearsal textures, and poster studies from the feature film process.",
    media: [
      { src: asset.ticketPoster, caption: "Official poster study" },
      { src: asset.stageWide, caption: "On-set dramatic still" },
      { src: asset.rehearsal, caption: "Quiet moment between takes" },
    ],
  },
  {
    title: "Double Whammy",
    details: "Trailer frames, documentary references, and production artwork.",
    media: [
      { src: asset.dwPoster, caption: "Poster artwork" },
      { src: asset.dwPosterAlt, caption: "Alternate campaign art" },
      { src: asset.theatreStill, caption: "Performance detail" },
    ],
  },
  {
    title: "Hidden Hand With a Last Card",
    details: "Thriller mood boards and image references awaiting final client stills.",
    media: [
      { src: asset.ironRiver, caption: "Tonal frame reference" },
      { src: asset.collage, caption: "Story world collage" },
      { src: asset.stageDetail, caption: "Character texture" },
    ],
  },
  {
    title: "Borrowed Time",
    details: "Behind-the-scenes placeholder gallery for the upcoming film.",
    media: [
      { src: asset.rehearsal, caption: "Rehearsal image" },
      { src: asset.stageWide, caption: "Production environment" },
      { src: asset.stageDetail, caption: "Movement detail" },
    ],
  },
  {
    title: "The Palmwine Drinkard",
    details: "Stage references from the folklore-driven theatre slate.",
    media: [
      { src: asset.palmwine, caption: "Campaign artwork" },
      { src: asset.theatreStill, caption: "Stage image" },
      { src: asset.stageWide, caption: "Ensemble composition" },
    ],
  },
];

export const partnershipBenefits = [
  {
    label: "I",
    title: "Cultural Credibility",
    text: "Association with critically recognised work at international festivals and live theatre productions.",
  },
  {
    label: "II",
    title: "Audience Access",
    text: "Reach a young, educated, globally conscious African and diaspora audience across film, stage, and digital channels.",
  },
  {
    label: "III",
    title: "Meaningful Impact",
    text: "Support directly funds African talent development and original content.",
  },
  {
    label: "IV",
    title: "Bespoke Activation",
    text: "Create sponsorship packages aligned with partner objectives, including title sponsorship and co-branding.",
  },
];

export const contact = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@meroestream.com",
  alternateEmail: "info@meroestream.com",
  phone: "+234 814 007 0071",
  ukAddress: "14a Hyde Road, Maidstone, Kent, UK ME16 0BW",
  nigeriaAddress: "4 Aderemi Akinsipe Street, Ibadan, Oyo State, Nigeria",
  focusAreas: ["Film", "Documentary", "Theatre", "Music", "Partnerships"],
  reach: [
    "Nigeria",
    "United Kingdom",
    "African diaspora",
    "Festival and digital audiences",
  ],
};
