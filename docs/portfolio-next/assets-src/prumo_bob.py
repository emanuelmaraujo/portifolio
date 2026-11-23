"""Plumb bob for the Feixe prototype. Run: blender --background --python prumo_bob.py -- <out.glb>
A turned brass body with a knurled collar, a cap and an eyelet. Tip at the origin, +Y up in glTF."""
import bpy, bmesh, math, sys

out = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)

# (radius, height) from the tip up. Height of the whole piece is 1.
PROFILE = [(0.0, 0.0), (0.012, 0.004), (0.035, 0.08), (0.10, 0.20), (0.17, 0.34), (0.22, 0.48), (0.235, 0.60),
           (0.215, 0.70), (0.17, 0.755), (0.105, 0.785), (0.10, 0.80), (0.132, 0.806), (0.132, 0.866), (0.10, 0.872),
           (0.062, 0.885), (0.062, 0.922), (0.086, 0.93), (0.086, 0.972), (0.07, 0.99), (0.0, 0.99)]
STEPS = 72

mesh = bpy.data.meshes.new("PrumoBob")
bm = bmesh.new()
rings = []
for r, h in PROFILE:
    if r == 0.0:
        rings.append([bm.verts.new((0, 0, h))])
    else:
        rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / STEPS), r * math.sin(2 * math.pi * i / STEPS), h)) for i in range(STEPS)])
for a, b in zip(rings, rings[1:]):
    for i in range(STEPS):
        j = (i + 1) % STEPS
        if len(a) == 1: bm.faces.new((a[0], b[j], b[i]))
        elif len(b) == 1: bm.faces.new((a[i], a[j], b[0]))
        else: bm.faces.new((a[i], a[j], b[j], b[i]))
# Knurling: push every other column of the collar outwards.
for ring in (rings[11], rings[12]):
    for i, v in enumerate(ring):
        if i % 2: v.co.x *= 1.045; v.co.y *= 1.045
# The eyelet the line is tied to.
bmesh.ops.create_cone  # noqa: keeps bmesh.ops imported for older builds
torus = bmesh.new()
MAJ, MIN, SEG, RSEG = 0.05, 0.014, 28, 10
tv = [[torus.verts.new(((MAJ + MIN * math.cos(2 * math.pi * k / RSEG)) * math.cos(2 * math.pi * s / SEG), MIN * math.sin(2 * math.pi * k / RSEG),
                        0.99 + MAJ - 0.012 + (MAJ + MIN * math.cos(2 * math.pi * k / RSEG)) * math.sin(2 * math.pi * s / SEG))) for k in range(RSEG)] for s in range(SEG)]
for s in range(SEG):
    for k in range(RSEG):
        torus.faces.new((tv[s][k], tv[(s + 1) % SEG][k], tv[(s + 1) % SEG][(k + 1) % RSEG], tv[s][(k + 1) % RSEG]))
tmp = bpy.data.meshes.new("eyelet"); torus.to_mesh(tmp); torus.free(); bm.from_mesh(tmp)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
for f in bm.faces: f.smooth = True
for e in bm.edges:
    if len(e.link_faces) == 2 and e.calc_face_angle(0) > math.radians(32): e.smooth = False
bm.to_mesh(mesh); bm.free()

obj = bpy.data.objects.new("PrumoBob", mesh)
bpy.context.scene.collection.objects.link(obj)
mat = bpy.data.materials.new("Brass"); mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.78, 0.57, 0.24, 1); bsdf.inputs["Metallic"].default_value = 1.0; bsdf.inputs["Roughness"].default_value = 0.28
mesh.materials.append(mat)
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_apply=True, export_yup=True, export_normals=True, export_materials="EXPORT")
print("OK", len(mesh.vertices), "verts")
