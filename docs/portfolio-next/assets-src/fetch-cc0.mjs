// Downloads the CC0 assets the Blender scene uses from Poly Haven (https://polyhaven.com/license: CC0).
// Usage: node fetch-cc0.mjs <output dir>
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const out = process.argv[2];
const agent = { headers: { "User-Agent": "portfolio-prototype/1.0" } };
const get = async url => { const r = await fetch(url, agent); if (!r.ok) throw new Error(r.status + " " + url); return r; };
const save = async (url, file) => {
  if (existsSync(file)) return;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(await (await get(url)).arrayBuffer()));
  console.log("saved", file);
};
const files = async id => (await get("https://api.polyhaven.com/files/" + id)).json();

const hdri = "artist_workshop";
await save((await files(hdri)).hdri["2k"].hdr.url, join(out, "hdri", hdri + "_2k.hdr"));

for (const id of ["wood_table_worn", "white_plaster_02", "painted_plaster_wall"]) {
  const f = await files(id);
  for (const [map, short] of [["Diffuse", "diff"], ["nor_gl", "nor"], ["Rough", "rough"]]) {
    const pick = f[map]?.["2k"]?.jpg;
    if (pick) await save(pick.url, join(out, "textures", id, `${short}.jpg`));
    else console.log("missing", id, map);
  }
}

for (const id of ["magnifying_glass_01", "seadogs_compass"]) {
  const g = (await files(id)).gltf["2k"].gltf;
  await save(g.url, join(out, "models", id, id + ".gltf"));
  for (const [path, item] of Object.entries(g.include || {})) await save(item.url, join(out, "models", id, path));
}
console.log("done");
