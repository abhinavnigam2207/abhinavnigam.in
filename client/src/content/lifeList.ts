// The life list: everything Abhinav and his wife want to do, travel being one chapter of it.
//
// SAMPLE ENTRIES. The Places chapter is built from their real travels (travels.ts). Every other entry below,
// the "next up" plans and the principles are stand-ins written to show the design; none of them is a claim
// about the couple. Replace them with their own list, then set `lifeListIsSample` to false.
import { countries, home, stories, type Photo } from "./travels";

export const lifeListIsSample = true;

export type ChapterId = "places" | "adventures" | "food" | "learn" | "giving" | "together" | "everyday";
export const chapters: { id: ChapterId; title: string; old: string; line: string }[] = [
  { id: "places", title: "Places", old: "Places", line: "Every country so far, each with its journal." },
  { id: "adventures", title: "Adventures", old: "Daring deeds", line: "The ones that need a deep breath first." },
  { id: "food", title: "Food", old: "The table", line: "Dishes worth crossing a border for." },
  { id: "learn", title: "Learn & make", old: "Crafts and learning", line: "Skills to pick up and things to build." },
  { id: "giving", title: "Work & giving back", old: "Service", line: "Small ways to make the craft, and the people in it, better." },
  { id: "together", title: "Together", old: "Together", line: "Plans that only make sense as two." },
  { id: "everyday", title: "Everyday", old: "Every day", line: "No ticket needed. Worth doing again and again." },
];

/**
 * One thing to do. `done` is the year it was done (absent while it is still on the list). `place` puts it on
 * the map; `story` links to a journal page. `together` marks a shared plan.
 */
export type LifeItem = {
  id: string; chapter: Exclude<ChapterId, "places">; title: string;
  done?: number; together?: boolean; why?: string;
  place?: { name: string; lon: number; lat: number };
  story?: string;
};

export const lifeItems: LifeItem[] = [
  { id: "northern-lights", chapter: "adventures", title: "See the northern lights", place: { name: "Tromsø, Norway", lon: 18.96, lat: 69.65 }, together: true, why: "Sample. One line on why this one matters." },
  { id: "scuba", chapter: "adventures", title: "Learn to scuba dive", done: 2023, place: { name: "Bali, Indonesia", lon: 115.19, lat: -8.41 }, story: "/bucket-list/indonesia/bali", why: "Sample. One line on how it went." },
  { id: "balloon", chapter: "adventures", title: "Fly over Cappadocia at sunrise", done: 2024, together: true, place: { name: "Cappadocia, Turkey", lon: 34.83, lat: 38.64 }, story: "/bucket-list/turkey/cappadocia" },
  { id: "patagonia", chapter: "adventures", title: "Trek in Patagonia", place: { name: "Torres del Paine, Chile", lon: -72.98, lat: -50.94 } },
  { id: "skydive", chapter: "adventures", title: "Jump out of a plane, on purpose" },
  { id: "omakase", chapter: "food", title: "An omakase counter in Tokyo", done: 2025, together: true, place: { name: "Tokyo, Japan", lon: 139.69, lat: 35.68 }, story: "/bucket-list/japan/tokyo" },
  { id: "pho", chapter: "food", title: "Pho for breakfast in Hanoi", done: 2022, place: { name: "Hanoi, Vietnam", lon: 105.85, lat: 21.03 }, story: "/bucket-list/vietnam/hanoi" },
  { id: "pasta", chapter: "food", title: "Learn fresh pasta from an Italian nonna", place: { name: "Bologna, Italy", lon: 11.34, lat: 44.49 } },
  { id: "street-food", chapter: "food", title: "Eat our way through a night market", done: 2019, together: true },
  { id: "language", chapter: "learn", title: "Hold a conversation in a new language" },
  { id: "open-source", chapter: "learn", title: "Ship an open-source tool other teams use" },
  { id: "instrument", chapter: "learn", title: "Learn one song well on an instrument" },
  { id: "write", chapter: "learn", title: "Write the essay that has been in drafts for years", done: 2020, why: "Sample. The micro-frontend article finally went out." },
  { id: "mentor", chapter: "giving", title: "Mentor a hundred engineers", why: "Sample. One line on why it matters." },
  { id: "talk", chapter: "giving", title: "Give a talk at a conference" },
  { id: "referrals", chapter: "giving", title: "Help people find their next role", done: 2025, why: "Sample. The referral page on this site is part of it." },
  { id: "road-trip", chapter: "together", title: "A long road trip with no fixed plan", together: true },
  { id: "every-continent", chapter: "together", title: "Watch a sunrise on every continent", together: true, why: "Sample. Two down, five to go." },
  { id: "home-cooked", chapter: "together", title: "Cook a dish from every country we visit", together: true },
  { id: "sunrise-sunset", chapter: "everyday", title: "See the sun rise and set on the same day", done: 2024 },
  { id: "unplugged", chapter: "everyday", title: "A full day with the phone switched off" },
  { id: "note", chapter: "everyday", title: "Leave a kind note for a stranger" },
  { id: "new-route", chapter: "everyday", title: "Walk home a different way" },
];

// Plans already in motion, shown as boarding passes.
export const nextUp: { code: string; place: string; what: string; when: string; lon: number; lat: number }[] = [
  { code: "ISL", place: "Iceland", what: "Chase the northern lights", when: "Sample · 2027", lon: -19, lat: 64.9 },
  { code: "PER", place: "Peru", what: "Walk the Inca Trail", when: "Sample · someday", lon: -72.5, lat: -13.2 },
  { code: "RUS", place: "Trans-Siberian", what: "Seven days on one train", when: "Sample · someday", lon: 104.3, lat: 56 },
];

// How the list is chosen, in their words (sample until they write their own).
export const principles: { title: string; text: string }[] = [
  { title: "Experiences over places.", text: "Sample. A city is a starting point; the list is about what we do there." },
  { title: "Small counts.", text: "Sample. A walk home a new way belongs here as much as a summit." },
  { title: "Two of us, mostly.", text: "Sample. Most of this list only makes sense together." },
  { title: "Never finished.", text: "Sample. Every item ticked off adds two more." },
];

// A wall of moments from the journals: one photo per city, each opening its page.
export const moments: { photo: Photo; title: string; href: string }[] = [
  ["japan", "osaka"], ["turkey", "cappadocia"], ["switzerland", "interlaken"], ["vietnam", "hanoi"], ["croatia", "split"], ["indonesia", "bali"], ["czech-republic", "prague"], ["united-kingdom", "london"],
].flatMap(([storySlug, citySlug]) => {
  const story = stories.find(item => item.slug === storySlug);
  const city = story?.cities.find(item => item.slug === citySlug);
  return story && city ? [{ photo: city.cover, title: `${city.name}, ${story.name}`, href: `/bucket-list/${story.slug}/${city.slug}` }] : [];
});

// ---------- The numbers ----------
const RAD = Math.PI / 180;
const distanceKm = (a: { lon: number; lat: number }, b: { lon: number; lat: number }) => {
  const h = Math.sin((b.lat - a.lat) * RAD / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin((b.lon - a.lon) * RAD / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
// Which continent each country belongs to, for the count (Turkey is counted with Europe, by Istanbul).
const asia = new Set(["MYS", "SGP", "THA", "VNM", "IDN", "JPN"]);
const routeKm = countries.reduce((sum, item) => sum + distanceKm(home, item), 0);
export const numbers = {
  countries: countries.length,
  cities: stories.reduce((sum, story) => sum + story.cities.length, 0),
  continents: new Set(countries.map(item => (asia.has(item.code) ? "Asia" : "Europe"))).size,
  // The red routes on the map, home to each country, added together.
  routeKm: Math.round(routeKm / 100) * 100,
  routeLeagues: Math.round(routeKm / 5.556 / 10) * 10,
  // Of the 195 countries in the world.
  worldShare: Math.round((countries.length / 195) * 100),
  done: lifeItems.filter(item => item.done).length,
  listed: lifeItems.length,
};
