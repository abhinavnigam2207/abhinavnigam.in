// Builds the coastlines the Expedition Map draws, from Natural Earth land data (public domain, via the
// world-atlas package). Run with `pnpm exec tsx scripts/build-coastlines.ts`; the outputs are committed.
//
//   client/public/travel/coast-110.json  the whole world, coarse; fetched when the map page opens
//   client/public/travel/coast-50.json   finer detail; fetched only when a visitor zooms into a country
//
// They are files rather than bundled code so that no other page of the site downloads them.
//
// Each ring is a flat list [lon, lat, lon, lat, …]. Only land outlines are stored: no borders.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);

function rings(file: string, digits: number, minPoints: number): number[][] {
  const topology = JSON.parse(readFileSync(require.resolve(`world-atlas/${file}`), "utf8"));
  const land = feature(topology, topology.objects.land) as unknown as { features?: { geometry: Geometry }[]; geometry?: Geometry };
  type Geometry = { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
  const geometries = land.features ? land.features.map(item => item.geometry) : [land.geometry!];
  const round = (value: number) => Number(value.toFixed(digits));
  const out: number[][] = [];
  for (const geometry of geometries) {
    const polygons = (geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates) as number[][][][];
    for (const polygon of polygons) {
      // Outer ring only; lakes inside continents are not drawn.
      const ring = polygon[0];
      if (ring.length < minPoints) continue;
      out.push(ring.flatMap(([lon, lat]) => [round(lon), round(lat)]));
    }
  }
  return out;
}

const coarse = rings("land-110m.json", 2, 4);
const fine = rings("land-50m.json", 2, 5);

mkdirSync("client/public/travel", { recursive: true });
writeFileSync("client/public/travel/coast-110.json", JSON.stringify(coarse), "utf8");
writeFileSync("client/public/travel/coast-50.json", JSON.stringify(fine), "utf8");
const size = (value: unknown) => `${Math.round(JSON.stringify(value).length / 1024)} kB`;
console.log(`coarse: ${coarse.length} rings, ${size(coarse)}; fine: ${fine.length} rings, ${size(fine)}`);
