// Travel page content.
//
// The countries and their cities are Abhinav's real travels (his list, October 2026). The places across India
// and every journal's words and photos are still placeholders (the life list beyond travel is in lifeList.ts).
// Once those are his own, set `travelsAreSample` to false: that removes the on-page notices and lets search
// engines index the travel pages (see scripts/prerender.ts).
export const travelsAreSample = true;

// `story` is the slug of a country page under /bucket-list/ (see `stories` below), when one has been written.
export type Place = { name: string; spot: string; code: string; lon: number; lat: number; note: string; story?: string };

// Arcs and routes start here.
export const home = { name: "India", code: "IND", lon: 77.21, lat: 28.61 };

// Hidden on the map for visitors to find. The line is shown when they do.
export const chest = { lon: -138, lat: -24, title: "You found the chest.", line: "Placeholder. A favourite photo or a line from Abhinav goes here as the reward." };

// Countries, in the order the page tours them. Each opens its own journal (see `stories` below), which
// lists its cities; the map's mark sits on the first city.
export const countries: Place[] = [
  { name: "Malaysia", spot: "Kuala Lumpur", code: "MYS", lon: 101.69, lat: 3.14, note: "Kuala Lumpur.", story: "malaysia" },
  { name: "Singapore", spot: "Singapore", code: "SGP", lon: 103.82, lat: 1.35, note: "Singapore.", story: "singapore" },
  { name: "Thailand", spot: "Bangkok", code: "THA", lon: 100.5, lat: 13.75, note: "Bangkok, Krabi, Phuket and Pattaya.", story: "thailand" },
  { name: "Vietnam", spot: "Ho Chi Minh City", code: "VNM", lon: 106.63, lat: 10.82, note: "Ho Chi Minh City, Da Nang and Hanoi.", story: "vietnam" },
  { name: "United Kingdom", spot: "Manchester", code: "GBR", lon: -2.24, lat: 53.48, note: "Manchester and London.", story: "united-kingdom" },
  { name: "Scotland", spot: "Edinburgh", code: "SCT", lon: -3.19, lat: 55.95, note: "Edinburgh.", story: "scotland" },
  { name: "Netherlands", spot: "Amsterdam", code: "NLD", lon: 4.9, lat: 52.37, note: "Amsterdam.", story: "netherlands" },
  { name: "France", spot: "Paris", code: "FRA", lon: 2.35, lat: 48.86, note: "Paris.", story: "france" },
  { name: "Germany", spot: "Berlin", code: "DEU", lon: 13.4, lat: 52.52, note: "Berlin.", story: "germany" },
  { name: "Czech Republic", spot: "Prague", code: "CZE", lon: 14.44, lat: 50.08, note: "Prague.", story: "czech-republic" },
  { name: "Austria", spot: "Vienna", code: "AUT", lon: 16.37, lat: 48.21, note: "Vienna.", story: "austria" },
  { name: "Hungary", spot: "Budapest", code: "HUN", lon: 19.04, lat: 47.5, note: "Budapest.", story: "hungary" },
  { name: "Indonesia", spot: "Bali", code: "IDN", lon: 115.19, lat: -8.41, note: "Bali.", story: "indonesia" },
  { name: "Switzerland", spot: "Zurich", code: "CHE", lon: 8.54, lat: 47.37, note: "Zurich, Lucerne, Interlaken and Bellinzona.", story: "switzerland" },
  { name: "Italy", spot: "Milan", code: "ITA", lon: 9.19, lat: 45.46, note: "Milan.", story: "italy" },
  { name: "Croatia", spot: "Split", code: "HRV", lon: 16.44, lat: 43.51, note: "Split, Zadar and Zagreb.", story: "croatia" },
  { name: "Turkey", spot: "Istanbul", code: "TUR", lon: 28.98, lat: 41.01, note: "Istanbul, Cappadocia and Antalya.", story: "turkey" },
  { name: "Japan", spot: "Osaka", code: "JPN", lon: 135.5, lat: 34.69, note: "Osaka, Kyoto and Tokyo.", story: "japan" },
];

// Places within India, north to south.
export const indiaPlaces: Place[] = [
  { name: "Ladakh", spot: "Leh", code: "IXL", lon: 77.58, lat: 34.15, note: "" },
  { name: "Spiti", spot: "Kaza", code: "SPT", lon: 78.07, lat: 32.22, note: "" },
  { name: "Rishikesh", spot: "Uttarakhand", code: "RSK", lon: 78.27, lat: 30.09, note: "" },
  { name: "Darjeeling", spot: "West Bengal", code: "DAR", lon: 88.26, lat: 27.04, note: "" },
  { name: "Jaipur", spot: "Rajasthan", code: "JAI", lon: 75.79, lat: 26.91, note: "" },
  { name: "Meghalaya", spot: "Shillong", code: "SHL", lon: 91.88, lat: 25.57, note: "" },
  { name: "Varanasi", spot: "Uttar Pradesh", code: "VNS", lon: 83.0, lat: 25.32, note: "" },
  { name: "Udaipur", spot: "Rajasthan", code: "UDR", lon: 73.71, lat: 24.58, note: "" },
  { name: "Hampi", spot: "Karnataka", code: "HMP", lon: 76.46, lat: 15.34, note: "" },
  { name: "Goa", spot: "Goa", code: "GOI", lon: 74.12, lat: 15.3, note: "" },
  { name: "Andaman", spot: "Port Blair", code: "IXZ", lon: 92.73, lat: 11.62, note: "" },
  { name: "Kerala", spot: "Alleppey", code: "COK", lon: 76.34, lat: 9.5, note: "" },
];

// ---------- Country and city pages ----------
//
// Each story becomes /bucket-list/<country>/ and each of its cities /bucket-list/<country>/<city>/.
// The pages are generated from this data: adding a trip here adds its pages, its links and (once
// `travelsAreSample` is false) its sitemap entries.
//
// A photo without `src` renders as a labelled placeholder block. `tone` is the hue (0-360) of that block.
// `video` is a clip to play in place of the still (the still, if given, is its poster frame).
export type Photo = { caption: string; tone: number; src?: string; video?: string; tall?: boolean };
export type City = {
  slug: string; name: string; lon: number; lat: number;
  tagline: string; intro: string;
  cover: Photo; photos: Photo[];
  highlights: { title: string; text: string }[];
  facts: { label: string; value: string }[];
};
export type Story = {
  slug: string; code: string; name: string; lon: number; lat: number;
  tagline: string; intro: string;
  cover: Photo;
  facts: { label: string; value: string }[];
  cities: City[];
};

// A city page with the journal still to be written: the layout's placeholders around its real name and place.
// `tone` is the hue of its placeholder photos.
const cityToCome = (slug: string, name: string, lon: number, lat: number, tagline: string, tone: number): City => ({
  slug, name, lon, lat, tagline,
  intro: `Placeholder introduction for ${name}. A short paragraph in their own words about the first impression of the place.`,
  cover: { caption: `Cover photo for ${name}`, tone },
  photos: [{ caption: "Photo caption", tone }, { caption: "Photo caption", tone: (tone + 30) % 360, tall: true }, { caption: "Photo caption", tone: (tone + 330) % 360 }],
  highlights: [{ title: "Highlight one", text: "A sentence about it." }, { title: "Highlight two", text: "A sentence about it." }, { title: "Highlight three", text: "A sentence about it." }],
  facts: [{ label: "Nights", value: "00" }, { label: "Best meal", value: "To add" }, { label: "Would return", value: "To add" }],
});
// A country journal still to be written. Its centre (where the map dives to) is the middle of its cities.
const storyToCome = (slug: string, code: string, name: string, tagline: string, tone: number, cities: City[]): Story => ({
  slug, code, name, tagline,
  lon: (Math.min(...cities.map(city => city.lon)) + Math.max(...cities.map(city => city.lon))) / 2,
  lat: (Math.min(...cities.map(city => city.lat)) + Math.max(...cities.map(city => city.lat))) / 2,
  intro: `Placeholder introduction. Two or three sentences in their own voice go here: why ${name}, what surprised them, and the one thing they would tell a friend before they go.`,
  cover: { caption: `Cover photo for ${name}`, tone },
  facts: [{ label: "When", value: "Month, year" }, { label: "Days", value: "00" }, { label: "Cities", value: String(cities.length) }, { label: "Travelled with", value: "To add" }],
  cities,
});

// The journals. Every country and city is real; taglines describe the places themselves, and the words and
// photos of each journal are placeholders until Abhinav and his wife write their own.
export const stories: Story[] = [
  storyToCome("malaysia", "MYS", "Malaysia", "Twin towers, hawker stalls and a skyline that never sleeps.", 160, [
    cityToCome("kuala-lumpur", "Kuala Lumpur", 101.69, 3.14, "Twin towers above a city of hawker stalls.", 160),
  ]),
  storyToCome("singapore", "SGP", "Singapore", "A garden city on the equator, built for walking at night.", 140, [
    cityToCome("singapore", "Singapore", 103.82, 1.35, "Gardens by the bay and supper at the hawker centre.", 140),
  ]),
  storyToCome("thailand", "THA", "Thailand", "Temples and street food in the city, limestone and sea on the coast.", 45, [
    cityToCome("bangkok", "Bangkok", 100.5, 13.75, "Temples, tuk-tuks and street food until late.", 45),
    cityToCome("krabi", "Krabi", 98.91, 8.09, "Limestone cliffs rising out of a green sea.", 175),
    cityToCome("phuket", "Phuket", 98.39, 7.88, "Long beaches and the old town in pastel.", 195),
    cityToCome("pattaya", "Pattaya", 100.88, 12.93, "A beach town that stays up all night.", 15),
  ]),
  storyToCome("vietnam", "VNM", "Vietnam", "Scooters, coffee and a coastline running the length of the country.", 95, [
    cityToCome("ho-chi-minh-city", "Ho Chi Minh City", 106.63, 10.82, "Scooters, strong coffee and a city in a hurry.", 95),
    cityToCome("da-nang", "Da Nang", 108.22, 16.05, "Beaches, bridges and the mountains behind.", 185),
    cityToCome("hanoi", "Hanoi", 105.85, 21.03, "Lakes, old streets and a bowl of pho at dawn.", 65),
  ]),
  storyToCome("united-kingdom", "GBR", "United Kingdom", "Red brick in the north, red buses in the capital.", 0, [
    cityToCome("manchester", "Manchester", -2.24, 53.48, "Red brick, music and football on every corner.", 0),
    cityToCome("london", "London", -0.13, 51.51, "Red buses, old museums and the river through it all.", 220),
  ]),
  storyToCome("scotland", "SCT", "Scotland", "A castle on a rock and a city of old stone and closes.", 260, [
    cityToCome("edinburgh", "Edinburgh", -3.19, 55.95, "A castle on a rock above a city of old stone.", 260),
  ]),
  storyToCome("netherlands", "NLD", "Netherlands", "Canals, bicycles and tall houses leaning over the water.", 25, [
    cityToCome("amsterdam", "Amsterdam", 4.9, 52.37, "Canals, bicycles and narrow houses on the water.", 25),
  ]),
  storyToCome("france", "FRA", "France", "Boulevards, cafés and the iron tower over the river Seine.", 230, [
    cityToCome("paris", "Paris", 2.35, 48.86, "Boulevards, cafés and the tower over the Seine.", 230),
  ]),
  storyToCome("germany", "DEU", "Germany", "A capital of history, art and a wall that came down.", 50, [
    cityToCome("berlin", "Berlin", 13.4, 52.52, "History on every street and art on every wall.", 50),
  ]),
  storyToCome("czech-republic", "CZE", "Czech Republic", "Spires, a stone bridge and red roofs over the river.", 10, [
    cityToCome("prague", "Prague", 14.44, 50.08, "A hundred spires and a stone bridge over the river.", 10),
  ]),
  storyToCome("austria", "AUT", "Austria", "Palaces, coffee houses and music in the old capital.", 300, [
    cityToCome("vienna", "Vienna", 16.37, 48.21, "Palaces, coffee houses and music in the air.", 300),
  ]),
  storyToCome("hungary", "HUN", "Hungary", "Two cities on the Danube joined by a chain of bridges.", 35, [
    cityToCome("budapest", "Budapest", 19.04, 47.5, "Two cities, one river and the warm baths.", 35),
  ]),
  storyToCome("indonesia", "IDN", "Indonesia", "Rice terraces, temples and surf on the island of gods.", 130, [
    cityToCome("bali", "Bali", 115.19, -8.41, "Rice terraces, temples and surf on one island.", 130),
  ]),
  storyToCome("switzerland", "CHE", "Switzerland", "Lakes, mountains and trains that run to the minute.", 205, [
    cityToCome("zurich", "Zurich", 8.54, 47.37, "A lake city with the Alps on the horizon.", 205),
    cityToCome("lucerne", "Lucerne", 8.31, 47.05, "A wooden bridge, a lake and the mountains around.", 180),
    cityToCome("interlaken", "Interlaken", 7.86, 46.69, "A town between two lakes under the high peaks.", 150),
    cityToCome("bellinzona", "Bellinzona", 9.02, 46.19, "Three castles and the Italian side of the Alps.", 40),
  ]),
  storyToCome("italy", "ITA", "Italy", "Fashion, a marble cathedral and the north of Italy.", 355, [
    cityToCome("milan", "Milan", 9.19, 45.46, "A marble cathedral and the city of fashion.", 355),
  ]),
  storyToCome("croatia", "HRV", "Croatia", "An old palace by the sea, island sunsets and a capital inland.", 190, [
    cityToCome("split", "Split", 16.44, 43.51, "A Roman palace that became an old town by the sea.", 190),
    cityToCome("zadar", "Zadar", 15.23, 44.12, "Sunsets over the islands and an organ played by the sea.", 210),
    cityToCome("zagreb", "Zagreb", 15.98, 45.81, "Old upper town, cafés and red roofs inland.", 20),
  ]),
  storyToCome("turkey", "TUR", "Turkey", "Bazaars, balloons over the valleys and a turquoise coast.", 30, [
    cityToCome("istanbul", "Istanbul", 28.98, 41.01, "Two continents, the bazaars and the call to prayer.", 30),
    cityToCome("cappadocia", "Cappadocia", 34.83, 38.64, "Hot air balloons over valleys of stone chimneys.", 25),
    cityToCome("antalya", "Antalya", 30.71, 36.9, "Old harbour walls on a turquoise coast.", 185),
  ]),
  {
    slug: "japan", code: "JPN", name: "Japan", lon: 138.2, lat: 36.2,
    tagline: "Neon, noodles and the quietest trains on earth.",
    intro: "Placeholder introduction. Two or three sentences in their own voice go here: why Japan, what surprised them, and the one thing they would tell a friend before they go.",
    cover: { caption: "Cover photo for Japan", tone: 350 },
    facts: [{ label: "When", value: "Month, year" }, { label: "Days", value: "00" }, { label: "Cities", value: "3" }, { label: "Travelled with", value: "To add" }],
    cities: [
      {
        slug: "osaka", name: "Osaka", lon: 135.5, lat: 34.69,
        tagline: "Came for the castle, stayed for the street food.",
        intro: "Placeholder introduction for Osaka. Three or four sentences in Abhinav's own voice: what the city felt like on the first evening, what he ate, and the moment he still thinks about.",
        cover: { caption: "Cover photo for Osaka", tone: 320 },
        photos: [
          { caption: "Dotonbori at night. Placeholder caption.", tone: 320 },
          { caption: "Osaka Castle. Placeholder caption.", tone: 150, tall: true },
          { caption: "Street food. Placeholder caption.", tone: 22 },
          { caption: "A quiet side street. Placeholder caption.", tone: 205, tall: true },
          { caption: "The view from above. Placeholder caption.", tone: 265 },
        ],
        highlights: [
          { title: "Best meal", text: "Placeholder. One sentence about the meal he still talks about." },
          { title: "Best moment", text: "Placeholder. One sentence about the moment that made the trip." },
          { title: "Would skip", text: "Placeholder. One honest sentence about what was not worth it." },
          { title: "Tip for a friend", text: "Placeholder. One sentence of advice." },
        ],
        facts: [{ label: "Nights", value: "00" }, { label: "Stayed in", value: "To add" }, { label: "Got around by", value: "To add" }, { label: "Would return", value: "To add" }],
      },
      {
        slug: "kyoto", name: "Kyoto", lon: 135.77, lat: 35.01,
        tagline: "Temples before breakfast.",
        intro: "Placeholder introduction for Kyoto. A short paragraph about the first impression of the city.",
        cover: { caption: "Cover photo for Kyoto", tone: 28 },
        photos: [{ caption: "Photo caption", tone: 28 }, { caption: "Photo caption", tone: 48, tall: true }, { caption: "Photo caption", tone: 12 }],
        highlights: [{ title: "Highlight one", text: "A sentence about it." }, { title: "Highlight two", text: "A sentence about it." }, { title: "Highlight three", text: "A sentence about it." }],
        facts: [{ label: "Nights", value: "00" }, { label: "Best meal", value: "To add" }, { label: "Would return", value: "To add" }],
      },
      {
        slug: "tokyo", name: "Tokyo", lon: 139.69, lat: 35.68,
        tagline: "A city that never runs late.",
        intro: "Placeholder introduction for Tokyo. A short paragraph about the first impression of the city.",
        cover: { caption: "Cover photo for Tokyo", tone: 215 },
        photos: [{ caption: "Photo caption", tone: 215 }, { caption: "Photo caption", tone: 245, tall: true }, { caption: "Photo caption", tone: 190 }],
        highlights: [{ title: "Highlight one", text: "A sentence about it." }, { title: "Highlight two", text: "A sentence about it." }, { title: "Highlight three", text: "A sentence about it." }],
        facts: [{ label: "Nights", value: "00" }, { label: "Best meal", value: "To add" }, { label: "Would return", value: "To add" }],
      },
    ],
  },
];

export const storyMeta = (story: Story, city?: City) => city
  ? { title: `${city.name}, ${story.name} Travel Story | Abhinav Nigam`, description: `Abhinav Nigam in ${city.name}, ${story.name}: ${city.tagline} Photos, highlights and notes from the trip, part of his travel log and bucket list.` }
  : { title: `${story.name} Travel Story and Photos | Abhinav Nigam`, description: `Abhinav Nigam in ${story.name}: ${story.tagline} The cities he visited, photos and notes from the trip, part of his travel log and bucket list.` };
