"""'Núcleo': one LED-lit environment the camera goes deeper into, for the cyberpunk cut of the portfolio.

A desk with a heavy terminal; its screen is an opening into a corridor of racks and light; the corridor ends in a
chamber with a ring core. The camera starts at the desk, goes through the screen, down the corridor past three
project cartridges, round the core, and into its light. The last frame is white, so the journey loops.

Run:  blender --background --python nucleo.py -- <out dir> <still|seq> [--samples N] [--scale PCT] [--frames A B ...]
Units are metres at desk scale; inside the screen the same units read as a full-size corridor.
"""
import bpy, bmesh, math, os, random, sys
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index("--") + 1:]
OUT, MODE = argv[0], argv[1]
def opt(name, default):
    return type(default)(argv[argv.index(name) + 1]) if name in argv else default
SAMPLES, SCALE = opt("--samples", 72), opt("--scale", 100)
FRAMES = [int(v) for v in argv[argv.index("--frames") + 1:] if v.lstrip("-").isdigit()] if "--frames" in argv else [1, 200]
random.seed(11)
GAIN = 0.13  # one dial for every LED in the scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection

CYAN, ORANGE, MAGENTA, WHITE = (0.05, 0.78, 1.0), (1.0, 0.17, 0.02), (1.0, 0.08, 0.5), (1.0, 0.95, 0.9)
LIME, INDIGO, YELLOW = (0.6, 1.0, 0.12), (0.2, 0.26, 1.0), (1.0, 0.82, 0.05)

# Materials ---------------------------------------------------------------------------------------------------------
def plain(name, color, rough=0.5, metallic=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metallic
    return m
_glow = {}
def glow(color, strength):
    key = (color, strength)
    if key not in _glow:
        m = bpy.data.materials.new(f"Glow{len(_glow)}"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
        out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission")
        em.inputs["Color"].default_value = (*color, 1); em.inputs["Strength"].default_value = strength * GAIN
        nt.links.new(em.outputs["Emission"], out.inputs["Surface"]); _glow[key] = m
    return _glow[key]
def worn(name, color, rough, metallic, scale=40):
    """Dark machined metal or plastic with uneven sheen, so LED reflections break up instead of mirroring."""
    m = plain(name, color, rough, metallic); nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    co = nt.nodes.new("ShaderNodeTexCoord"); n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = scale; n.inputs["Detail"].default_value = 6
    nt.links.new(co.outputs["Object"], n.inputs["Vector"])
    r = nt.nodes.new("ShaderNodeMapRange"); r.inputs["To Min"].default_value = max(rough - 0.12, 0.02); r.inputs["To Max"].default_value = rough + 0.2
    nt.links.new(n.outputs["Fac"], r.inputs["Value"]); nt.links.new(r.outputs["Result"], b.inputs["Roughness"])
    return m
SHELL = worn("Shell", (0.035, 0.038, 0.045), 0.42, 0.6)
PANEL = worn("Panel", (0.02, 0.022, 0.028), 0.5, 0.8, 90)
DESK = worn("Desk", (0.012, 0.013, 0.016), 0.12, 0.3, 14)
FLOOR = worn("Floor", (0.01, 0.011, 0.014), 0.07, 0.6, 30)
KEY = plain("Key", (0.03, 0.03, 0.035), 0.5)
RUBBER = plain("Rubber", (0.015, 0.015, 0.017), 0.8)
STEEL = worn("Steel", (0.35, 0.36, 0.38), 0.3, 1.0, 120)

# Geometry ------------------------------------------------------------------------------------------------------------
def add(o): col.objects.link(o); return o
def box(name, lo, hi, mat, bevel=0.0):
    lo, hi = Vector(lo), Vector(hi); size = hi - lo
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); mesh = bpy.data.meshes.new(name); bm.to_mesh(mesh); bm.free()
    o = add(bpy.data.objects.new(name, mesh)); o.scale = size; o.location = (lo + hi) / 2; mesh.materials.append(mat)
    if bevel:
        mod = o.modifiers.new("Bevel", "BEVEL"); mod.width = bevel; mod.segments = 2; mod.limit_method = "ANGLE"
        for p in mesh.polygons: p.use_smooth = True
    return o
def frame(name, y0, y1, x, z0, z1, t, mat, bevel=0.0):
    """Four bars round an opening x in [-x, x], z in [z0, z1], thickness t outwards."""
    return [box(name + "T", (-x - t, y0, z1), (x + t, y1, z1 + t), mat, bevel), box(name + "B", (-x - t, y0, z0 - t), (x + t, y1, z0), mat, bevel),
            box(name + "L", (-x - t, y0, z0), (-x, y1, z1), mat, bevel), box(name + "R", (x, y0, z0), (x + t, y1, z1), mat, bevel)]
def tube(name, a, b, radius, mat, segments=16):
    a, b = Vector(a), Vector(b); bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=radius, radius2=radius, depth=(b - a).length)
    mesh = bpy.data.meshes.new(name); bm.to_mesh(mesh); bm.free()
    for p in mesh.polygons: p.use_smooth = True
    o = add(bpy.data.objects.new(name, mesh)); o.location = (a + b) / 2; o.rotation_euler = Vector((0, 0, 1)).rotation_difference(b - a).to_euler(); mesh.materials.append(mat); return o
def torus(name, center, major, minor, mat, axis="Y", seg=128):
    bm = bmesh.new(); verts = []
    for i in range(seg):
        a = 2 * math.pi * i / seg; ring = []
        for j in range(12):
            t = 2 * math.pi * j / 12; r = major + minor * math.cos(t)
            ring.append(bm.verts.new((r * math.cos(a), minor * math.sin(t), r * math.sin(a))))
        verts.append(ring)
    for i in range(seg):
        for j in range(12): bm.faces.new((verts[i][j], verts[(i + 1) % seg][j], verts[(i + 1) % seg][(j + 1) % 12], verts[i][(j + 1) % 12]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name); bm.to_mesh(mesh); bm.free()
    for p in mesh.polygons: p.use_smooth = True
    o = add(bpy.data.objects.new(name, mesh)); o.location = center; mesh.materials.append(mat)
    if axis == "Z": o.rotation_euler = (math.radians(90), 0, 0)
    return o
def cable(name, pts, radius, mat):
    c = bpy.data.curves.new(name, "CURVE"); c.dimensions = "3D"; c.bevel_depth = radius; c.bevel_resolution = 3
    s = c.splines.new("NURBS"); s.points.add(len(pts) - 1)
    for p, v in zip(s.points, pts): p.co = (*v, 1)
    s.use_endpoint_u = True; s.order_u = 3
    o = add(bpy.data.objects.new(name, c)); c.materials.append(mat); return o

SX, Z0, Z1 = 0.26, 0.38, 0.70   # the screen opening: x in [-SX, SX], z in [Z0, Z1]
ZC = (Z0 + Z1) / 2

# The room and the desk ---------------------------------------------------------------------------------------------
box("Desk", (-1.7, -1.15, 0.26), (1.7, 0.36, 0.30), DESK, 0.004)
frame("Wall", 0.36, 0.4, SX, Z0, Z1, 3.0, PANEL)   # the back wall, with a hole hidden behind the terminal
for i in range(46):  # panelling and greebles on the wall
    x = random.uniform(-1.7, 1.7); z = random.uniform(0.34, 1.6); w = random.uniform(0.06, 0.34); h = random.uniform(0.04, 0.26)
    if abs(x) < 0.5 and z < 0.95: continue
    box(f"Greeble{i}", (x - w / 2, 0.33, z - h / 2), (x + w / 2, 0.362, z + h / 2), PANEL if i % 3 else SHELL, 0.003)
for x, colr in ((-1.12, MAGENTA), (-0.98, CYAN), (1.02, CYAN), (1.16, ORANGE)):  # light bars on the wall
    tube(f"Bar{x}", (x, 0.32, 0.36), (x, 0.32, 1.5), 0.008, glow(colr, 26))
tube("DeskStrip", (-1.6, 0.3, 0.305), (1.6, 0.3, 0.305), 0.005, glow(ORANGE, 22))
for z in (0.98, 1.22):
    tube(f"Rail{z}", (-0.8, 0.33, z), (0.8, 0.33, z), 0.004, glow(CYAN, 8))

# The terminal: a heavy housing round the opening -------------------------------------------------------------------
frame("Housing", -0.03, 0.34, SX, Z0, Z1, 0.085, SHELL, 0.012)
frame("Bezel", -0.045, -0.03, SX, Z0, Z1, 0.022, PANEL, 0.004)
for b in frame("BezelLight", -0.047, -0.044, SX + 0.004, Z0 - 0.004, Z1 + 0.004, 0.004, glow(ORANGE, 30)): pass
box("Chin", (-SX - 0.085, -0.06, 0.305), (SX + 0.085, 0.3, Z0 - 0.085), SHELL, 0.01)
for i in range(5):  # knobs and a row of status lights on the chin
    tube(f"Knob{i}", (-0.28 + i * 0.045, -0.075, 0.345), (-0.28 + i * 0.045, -0.058, 0.345), 0.012, STEEL, 24)
for i in range(9):
    box(f"Status{i}", (0.02 + i * 0.03, -0.0615, 0.338), (0.034 + i * 0.03, -0.0595, 0.352), glow((CYAN, ORANGE, CYAN, MAGENTA)[i % 4], 14 if i % 3 else 2))
for i in range(12):  # vents along the top
    box(f"Vent{i}", (-0.22 + i * 0.04, 0.02, Z1 + 0.084), (-0.2 + i * 0.04, 0.28, Z1 + 0.088), RUBBER)
tube("Antenna", (0.27, 0.2, Z1 + 0.085), (0.31, 0.22, Z1 + 0.42), 0.004, STEEL); box("AntennaTip", (0.303, 0.213, Z1 + 0.415), (0.317, 0.227, Z1 + 0.429), glow(MAGENTA, 40))
box("Handle", (-0.1, 0.12, Z1 + 0.085), (0.1, 0.16, Z1 + 0.11), STEEL, 0.006)
for side in (-1, 1):
    box(f"Foot{side}", (side * 0.3 - 0.05, -0.02, 0.3), (side * 0.3 + 0.05, 0.3, 0.306), RUBBER)
    for i in range(6): box(f"Rib{side}{i}", (side * (SX + 0.086), 0.02 + i * 0.05, Z0), (side * (SX + 0.092), 0.04 + i * 0.05, Z1), PANEL)

# What sits on the desk ---------------------------------------------------------------------------------------------
box("KeyBase", (-0.27, -0.6, 0.3), (0.27, -0.4, 0.312), SHELL, 0.004)
box("KeyGlow", (-0.262, -0.592, 0.3125), (0.262, -0.408, 0.3135), glow(ORANGE, 5))
for r in range(5):
    for c in range(17):
        if r == 4 and 4 < c < 12: continue
        x = -0.256 + c * 0.0302 + (r % 2) * 0.006; y = -0.59 + r * 0.036
        box(f"Key{r}{c}", (x, y, 0.3145), (x + 0.0256, y + 0.031, 0.3225), KEY, 0.0025)
box("Space", (-0.256 + 5 * 0.0302, -0.59 + 4 * 0.036, 0.3145), (-0.256 + 12 * 0.0302 - 0.005, -0.59 + 4 * 0.036 + 0.031, 0.3225), KEY, 0.0025)
for i, (x, n) in enumerate(((-0.86, 4), (-0.6, 2))):  # stacks of hardware with rows of lights
    for k in range(n):
        box(f"Module{i}{k}", (x - 0.11, -0.12, 0.3 + k * 0.062), (x + 0.11, 0.26, 0.356 + k * 0.062), SHELL, 0.006)
        for d in range(8):
            box(f"Dot{i}{k}{d}", (x - 0.09 + d * 0.022, -0.1215, 0.322 + k * 0.062), (x - 0.08 + d * 0.022, -0.1195, 0.332 + k * 0.062), glow((CYAN, ORANGE, MAGENTA)[(d + k) % 3], 18 if random.random() > 0.3 else 1.5))
side = box("SideScreen", (-0.16, -0.008, -0.1), (0.16, 0.008, 0.1), SHELL, 0.006); side.location = (0.78, -0.1, 0.44); side.rotation_euler = (math.radians(-12), 0, math.radians(-28))
sg = box("SideGlow", (-0.145, -0.0095, -0.088), (0.145, -0.008, 0.088), glow(CYAN, 6)); sg.parent = side; sg.location = (0, -0.0006, 0) ; sg.scale = (0.29, 0.0016, 0.176)
for i in range(7):
    ln = box(f"SideLine{i}", (0, 0, 0), (1, 1, 1), glow(WHITE, 16)); ln.parent = side; ln.scale = (random.uniform(0.08, 0.24), 0.0012, 0.006); ln.location = (-0.02 - random.uniform(0, 0.03), -0.0102, 0.07 - i * 0.022)
box("SideStand", (0.76, -0.06, 0.3), (0.84, 0.04, 0.345), SHELL, 0.004)
tube("Mug", (0.42, -0.5, 0.3), (0.42, -0.5, 0.39), 0.038, plain("Mug", (0.02, 0.02, 0.022), 0.25), 48)
cable("CableA", [(-0.3, 0.25, 0.32), (-0.42, 0.1, 0.305), (-0.55, -0.02, 0.31), (-0.75, -0.13, 0.33)], 0.006, RUBBER)
cable("CableB", [(0.3, 0.22, 0.32), (0.45, 0.05, 0.305), (0.6, -0.02, 0.305), (0.78, -0.04, 0.31)], 0.005, RUBBER)
cable("CableC", [(0.0, -0.4, 0.306), (0.04, -0.25, 0.304), (-0.05, -0.12, 0.304), (0.0, -0.05, 0.31)], 0.004, glow(CYAN, 2.5))

# Inside the screen: the corridor -----------------------------------------------------------------------------------
END = 5.0
box("CorFloor", (-SX, 0.0, Z0 - 0.02), (SX, END, Z0), FLOOR)
box("CorCeil", (-SX, 0.0, Z1), (SX, END, Z1 + 0.02), PANEL)
for s in (-1, 1): box(f"CorWall{s}", (s * SX, 0.0, Z0), (s * (SX + 0.02), END, Z1), PANEL)
n = 0
y = 0.12
while y < END:
    colr = ORANGE if n % 4 == 3 else CYAN
    for part in frame(f"Rib{n}", y, y + 0.03, SX - 0.016, Z0 + 0.004, Z1 - 0.012, 0.014, SHELL, 0.003): pass
    for part in frame(f"RibLight{n}", y + 0.012, y + 0.018, SX - 0.018, Z0 + 0.006, Z1 - 0.014, 0.003, glow(colr, 34)): pass
    y += 0.25; n += 1
for s in (-1, 1):  # racks: slabs along the walls with lines of status lights
    y = 0.16
    while y < END - 0.2:
        box(f"Rack{s}{y:.2f}", (s * (SX - 0.035), y, Z0 + 0.03), (s * (SX - 0.004), y + 0.19, Z1 - 0.05), SHELL, 0.003)
        for r in range(7):
            for d in range(5):
                if random.random() < 0.45: continue
                colr = (CYAN, CYAN, ORANGE, MAGENTA, WHITE)[random.randrange(5)]
                x = s * (SX - 0.0365)
                box(f"Led{s}{y:.2f}{r}{d}", (x - 0.0006, y + 0.02 + d * 0.034, Z0 + 0.05 + r * 0.03), (x + 0.0006, y + 0.03 + d * 0.034, Z0 + 0.056 + r * 0.03), glow(colr, 30))
        y += 0.25
for i in range(3):  # light running along the floor, and cables overhead
    x = -0.12 + i * 0.12
    box(f"FloorLine{i}", (x - 0.0015, 0.05, Z0), (x + 0.0015, END, Z0 + 0.0008), glow(ORANGE if i == 1 else CYAN, 12))
for i in range(5):
    x = -0.18 + i * 0.09
    cable(f"Over{i}", [(x, 0.05, Z1 - 0.012), (x + random.uniform(-0.03, 0.03), 1.6, Z1 - 0.03), (x + random.uniform(-0.03, 0.03), 3.3, Z1 - 0.014), (x, END, Z1 - 0.026)], 0.0045, RUBBER)

# Three project cartridges, one per stop -----------------------------------------------------------------------------
CARTS = [(1.3, -1, LIME), (2.5, 1, INDIGO), (3.7, -1, YELLOW)]
for i, (y, s, colr) in enumerate(CARTS):
    holder = add(bpy.data.objects.new(f"Cart{i}", None)); holder.location = (s * 0.125, y, ZC); holder.rotation_euler = (0, 0, math.radians(s * 34))
    parts = [box(f"CartBody{i}", (-0.085, -0.006, -0.055), (0.085, 0.006, 0.055), SHELL, 0.004)]
    parts += frame(f"CartEdge{i}", -0.0075, -0.006, 0.078, -0.048, 0.048, 0.003, glow(colr, 38))
    parts.append(box(f"CartFace{i}", (-0.076, -0.0068, -0.046), (0.076, -0.0064, 0.046), glow(colr, 0.9)))
    for k in range(4): parts.append(box(f"CartLine{i}{k}", (-0.066, -0.0074, 0.03 - k * 0.018), (-0.066 + random.uniform(0.05, 0.12), -0.0072, 0.034 - k * 0.018), glow(WHITE, 14)))
    for p in parts: p.parent = holder
    tube(f"CartBeam{i}", (s * 0.125, y, Z0 + 0.001), (s * 0.125, y, ZC - 0.06), 0.0012, glow(colr, 20))
    torus(f"CartBase{i}", (s * 0.125, y, Z0 + 0.002), 0.05, 0.0018, glow(colr, 26), axis="Z", seg=64)

# The chamber and its core --------------------------------------------------------------------------------------------
CORE = Vector((0, 6.1, ZC))
box("ChamberFloor", (-2.2, END, Z0 - 0.3), (2.2, 8.2, Z0 - 0.28), FLOOR)
for r, colr, power in ((0.5, CYAN, 4), (0.8, CYAN, 3), (1.15, ORANGE, 3), (1.6, CYAN, 2)):
    torus(f"FloorRing{r}", (0, CORE.y, Z0 - 0.279), r, 0.004, glow(colr, power * 6), axis="Z")
torus("CoreOuter", CORE, 0.46, 0.022, glow(CYAN, 46))
torus("CoreMid", CORE + Vector((0, 0.06, 0)), 0.34, 0.012, glow(CYAN, 50))
torus("CoreInner", CORE + Vector((0, 0.12, 0)), 0.22, 0.014, glow(ORANGE, 44))
for i in range(24):  # the housing of the ring: segments with gaps
    a = 2 * math.pi * i / 24
    if i % 4 == 3: continue
    seg = box(f"CoreSeg{i}", (-0.055, -0.03, -0.022), (0.055, 0.03, 0.022), SHELL, 0.006)
    seg.location = CORE + Vector((0.53 * math.cos(a), 0, 0.53 * math.sin(a))); seg.rotation_euler = (0, -a + math.radians(90), 0)
for i in range(6):  # six nodes on the ring: the stages of the agent workflow
    a = 2 * math.pi * i / 6 + math.radians(30)
    p = CORE + Vector((0.46 * math.cos(a), -0.03, 0.46 * math.sin(a)))
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=0.03); mesh = bpy.data.meshes.new(f"Node{i}"); bm.to_mesh(mesh); bm.free()
    for f in mesh.polygons: f.use_smooth = True
    o = add(bpy.data.objects.new(f"Node{i}", mesh)); o.location = p; mesh.materials.append(glow(ORANGE, 40))
    tube(f"Spoke{i}", p, CORE + Vector((0.22 * math.cos(a), 0.12, 0.22 * math.sin(a))), 0.0016, glow(ORANGE, 12))
disc = bpy.data.meshes.new("Portal"); bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=64, radius=0.2); bm.to_mesh(disc); bm.free()
po = add(bpy.data.objects.new("Portal", disc)); po.location = CORE + Vector((0, 0.5, 0)); po.rotation_euler = (math.radians(90), 0, 0); disc.materials.append(glow(WHITE, 240))
for i in range(14):  # pillars standing in the dark round the core
    a = math.radians(-70 + i * 20); r = 1.9
    x, y = r * math.sin(a), CORE.y + r * math.cos(a) * 0.9
    if y < END + 0.3: continue
    box(f"Pillar{i}", (x - 0.06, y - 0.06, Z0 - 0.28), (x + 0.06, y + 0.06, Z0 + 1.6), SHELL, 0.008)
    tube(f"PillarLight{i}", (x, y - 0.062, Z0 - 0.2), (x, y - 0.062, Z0 + 1.5), 0.004, glow(CYAN if i % 3 else MAGENTA, 16))

# Light and camera ----------------------------------------------------------------------------------------------------
world = bpy.data.worlds.new("World"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.002, 0.003, 0.006, 1)
def area(name, loc, rot, energy, size, color):
    l = bpy.data.lights.new(name, "AREA"); l.energy = energy; l.size = size; l.color = color
    o = add(bpy.data.objects.new(name, l)); o.location = loc; o.rotation_euler = [math.radians(v) for v in rot]; return o
area("RoomKey", (-1.3, -1.0, 1.7), (52, 0, -50), 62, 1.2, (0.45, 0.7, 1.0))
area("RoomRim", (1.5, -0.2, 1.3), (60, 0, 70), 44, 0.8, (1.0, 0.2, 0.5))
area("ChamberFill", (0, 5.4, 1.6), (20, 0, 0), 30, 1.5, (0.4, 0.7, 1.0))

cam = bpy.data.cameras.new("Camera"); co = add(bpy.data.objects.new("Camera", cam)); scene.camera = co
cam.clip_start = 0.004; cam.clip_end = 60
aim = add(bpy.data.objects.new("Aim", None))
track = co.constraints.new("TRACK_TO"); track.target = aim; track.track_axis = "TRACK_NEGATIVE_Z"; track.up_axis = "UP_Y"
PATH = [  # frame, camera, aim, lens
    (1, (-0.74, -1.5, 0.86), (0, 0.0, 0.52), 40), (30, (-0.26, -0.78, 0.66), (0, 0.3, ZC), 34), (48, (0, -0.24, ZC + 0.004), (0, 1.2, ZC), 26),
    (60, (0, 0.16, ZC), (0, 1.6, ZC), 20), (82, (0.04, 1.02, ZC + 0.004), (-0.1, 1.32, ZC), 20), (108, (-0.04, 2.22, ZC), (0.1, 2.52, ZC), 20),
    (134, (0.04, 3.42, ZC + 0.004), (-0.1, 3.72, ZC), 20), (150, (0, 4.55, ZC), (0, 6.1, ZC), 20), (172, (0.42, 5.2, ZC + 0.1), (0, 6.1, ZC), 22),
    (188, (0.05, 5.62, ZC), (0, 6.6, ZC), 22), (200, (0, 6.5, ZC), (0, 6.6, ZC), 22),
]
for f, c, a, lens in PATH:
    co.location = c; co.keyframe_insert("location", frame=f)
    aim.location = a; aim.keyframe_insert("location", frame=f)
    cam.lens = lens; cam.keyframe_insert("lens", frame=f)
scene.frame_start, scene.frame_end = 1, 200

scene.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
for kind in ("OPTIX", "CUDA"):
    try:
        prefs.compute_device_type = kind; prefs.get_devices()
        for d in prefs.devices: d.use = d.type != "CPU"
        if any(d.use for d in prefs.devices): scene.cycles.device = "GPU"; break
    except Exception:
        continue
scene.cycles.samples = SAMPLES; scene.cycles.use_denoising = True
try: scene.cycles.denoiser = "OPTIX"
except Exception: pass
scene.cycles.max_bounces = 6; scene.cycles.glossy_bounces = 4; scene.cycles.sample_clamp_indirect = 6.0
scene.cycles.caustics_reflective = False; scene.cycles.caustics_refractive = False
scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = 1600, 900, SCALE
# Standard, not AgX: LEDs should clip to their own colour, not wash out to white.
scene.view_settings.view_transform = "Standard"
scene.view_settings.exposure = -0.2
scene.render.image_settings.file_format = "JPEG"; scene.render.image_settings.quality = 92
os.makedirs(OUT, exist_ok=True)
frames = FRAMES if MODE == "still" else range(FRAMES[0], FRAMES[1] + 1)
for f in frames:
    target = os.path.join(OUT, f"{'still' if MODE == 'still' else 'run'}-{f:03d}.jpg")
    if MODE != "still" and os.path.exists(target): continue  # resumable
    scene.frame_set(f); scene.render.filepath = target; bpy.ops.render.render(write_still=True)
print("RENDERED", MODE, len(list(frames)))
