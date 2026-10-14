# Life list — bucket list page, lower half (iteration, not yet approved)

Status: built on branch `life-list-iteration`, uncommitted, for review. Keep or discard as a whole.

## Why
The bucket list page was travel only. The client's reference (whereandwander.com/bucketlist) is a *life* list:
travel plus adventures, food, skills, giving back, everyday joys, with done vs to-do. Keep the page's top
(map hero and passport scroll) and replace everything below it.

## Page order
1. Map hero (unchanged)
2. Passport scroll (unchanged)
3. **So far** — countries, cities, continents, share of the world, km of routes from home. Derived from
   `travels.ts`; nothing to maintain.
4. **The life list** — chapter tabs with progress rings: Places, Adventures, Food, Learn & make, Work & giving
   back, Together, Everyday. Places = home plus every real country, each linking to its journal and the map
   (replaces the old ledger, including its keyboard route to every country). Other chapters = item cards
   (done with year, or still on the list; together tag; place; why; links). `?chapter=` keeps the open tab.
   "Surprise me" shows a random item on the map.
5. **Next up** — planned trips as boarding passes.
6. **Moments** — photo wall, one photo per city, each opening its journal page.
7. **How we choose** — four short principles in the couple's voice.
8. **Add to our list** — suggestion form (Netlify Forms, honeypot; failure offers the email address).

## Map integration
Items with a place are on the map (to-do as uncharted rings). "On the map" pushes `#list-<id>`: the map flies
there with a card (status, why, story link). Back, the card's "Back to the list", or the phone's "List" pill
return to the list at the same scroll position. Reset still returns to the whole world in one step.

## Content (client)
Everything outside Places, Moments' links and the numbers is sample (`lifeListIsSample = true`, labelled on the
page). Needed: items per chapter (title, done year, place, together, why, story link), next-up trips, principles.

## Open
- Netlify: enable form detection for the site so submissions are kept.
- JS budget raised 400 → 420 kB for this iteration; per-page bundle splitting brings it back under 400.
- 33 cities (an earlier note said 36; the client's list has 33).
