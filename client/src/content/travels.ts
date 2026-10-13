// Travel page content.
//
// SAMPLE DATA. Every place below is a stand-in so the page can be designed and reviewed; none of it is
// Abhinav's real travel history. Replace the three lists with his own, then set `travelsAreSample` to false:
// that removes the on-page notice and lets search engines index the page (see scripts/prerender.ts).
export const travelsAreSample = true;

// `story` is the slug of a country page under /bucket-list/ (see `stories` below), when one has been written.
export type Place = { name: string; spot: string; code: string; lon: number; lat: number; note: string; story?: string };

// Arcs and routes start here.
export const home = { name: "India", code: "IND", lon: 77.21, lat: 28.61 };

// Hidden on the map for visitors to find. The line is shown when they do.
export const chest = { lon: -138, lat: -24, title: "You found the chest.", line: "Placeholder. A favourite photo or a line from Abhinav goes here as the reward." };

// Countries, in the order the page tours them.
export const countries: Place[] = [
  { name: "Nepal", spot: "Kathmandu", code: "NPL", lon: 85.32, lat: 27.72, note: "A line about this trip goes here." },
  { name: "Sri Lanka", spot: "Colombo", code: "LKA", lon: 79.86, lat: 6.93, note: "A line about this trip goes here." },
  { name: "United Arab Emirates", spot: "Dubai", code: "ARE", lon: 55.27, lat: 25.2, note: "A line about this trip goes here." },
  { name: "Thailand", spot: "Bangkok", code: "THA", lon: 100.5, lat: 13.75, note: "A line about this trip goes here." },
  { name: "Singapore", spot: "Singapore", code: "SGP", lon: 103.82, lat: 1.35, note: "A line about this trip goes here." },
  { name: "Vietnam", spot: "Hanoi", code: "VNM", lon: 105.85, lat: 21.03, note: "A line about this trip goes here." },
  { name: "Indonesia", spot: "Bali", code: "IDN", lon: 115.19, lat: -8.41, note: "A line about this trip goes here." },
  { name: "Japan", spot: "Tokyo", code: "JPN", lon: 139.69, lat: 35.68, note: "Neon, noodles and the quietest trains on earth.", story: "japan" },
  { name: "Australia", spot: "Sydney", code: "AUS", lon: 151.21, lat: -33.87, note: "A line about this trip goes here." },
  { name: "Italy", spot: "Rome", code: "ITA", lon: 12.5, lat: 41.9, note: "A line about this trip goes here." },
  { name: "Switzerland", spot: "Zurich", code: "CHE", lon: 8.54, lat: 47.37, note: "A line about this trip goes here." },
  { name: "France", spot: "Paris", code: "FRA", lon: 2.35, lat: 48.86, note: "A line about this trip goes here." },
  { name: "United Kingdom", spot: "London", code: "GBR", lon: -0.13, lat: 51.51, note: "A line about this trip goes here." },
  { name: "United States", spot: "New York", code: "USA", lon: -74.0, lat: 40.71, note: "A line about this trip goes here." },
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

// The bucket list proper: things still to do, and a few already done.
// `lon`/`lat` put a to-do item on the map as uncharted territory.
export const bucketList: { title: string; where: string; done: boolean; lon?: number; lat?: number }[] = [
  { title: "Watch the northern lights", where: "Iceland", done: false, lon: -19.0, lat: 64.9 },
  { title: "Trek in Patagonia", where: "Chile and Argentina", done: false, lon: -72.5, lat: -49.5 },
  { title: "Set foot on Antarctica", where: "Antarctica", done: false },
  { title: "Walk the Inca Trail", where: "Peru", done: false, lon: -72.5, lat: -13.2 },
  { title: "See the cherry blossom", where: "Japan", done: true },
  { title: "Dive a coral reef", where: "Andaman", done: true },
  { title: "Ride the Trans-Siberian", where: "Russia", done: false, lon: 104.3, lat: 56.0 },
  { title: "Drive the Manali to Leh road", where: "India", done: true },
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

// SAMPLE STORY. Text and photos are placeholders written to show the layout.
export const stories: Story[] = [
  {
    slug: "japan", code: "JPN", name: "Japan", lon: 138.2, lat: 36.2,
    tagline: "Neon, noodles and the quietest trains on earth.",
    intro: "Placeholder introduction. Two or three sentences in Abhinav's own voice go here: why Japan, what surprised him, and the one thing he would tell a friend before they go.",
    cover: { caption: "Cover photo for Japan", tone: 350 },
    facts: [{ label: "When", value: "Month, year" }, { label: "Days", value: "00" }, { label: "Cities", value: "3" }, { label: "Travelled with", value: "To add" }],
    cities: [
      {
        slug: "tokyo", name: "Tokyo", lon: 139.69, lat: 35.68,
        tagline: "A city that never runs late.",
        intro: "Placeholder introduction for Tokyo. A short paragraph about the first impression of the city.",
        cover: { caption: "Cover photo for Tokyo", tone: 215 },
        photos: [{ caption: "Photo caption", tone: 215 }, { caption: "Photo caption", tone: 245, tall: true }, { caption: "Photo caption", tone: 190 }],
        highlights: [{ title: "Highlight one", text: "A sentence about it." }, { title: "Highlight two", text: "A sentence about it." }, { title: "Highlight three", text: "A sentence about it." }],
        facts: [{ label: "Nights", value: "00" }, { label: "Best meal", value: "To add" }, { label: "Would return", value: "To add" }],
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
    ],
  },
];

export const storyMeta = (story: Story, city?: City) => city
  ? { title: `${city.name}, ${story.name} Travel Story | Abhinav Nigam`, description: `Abhinav Nigam in ${city.name}, ${story.name}: ${city.tagline} Photos, highlights and notes from the trip, part of his travel log and bucket list.` }
  : { title: `${story.name} Travel Story and Photos | Abhinav Nigam`, description: `Abhinav Nigam in ${story.name}: ${story.tagline} The cities he visited, photos and notes from the trip, part of his travel log and bucket list.` };
