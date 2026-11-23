"""The drafting table of "Três verbos": a ceramic maquette in three strata, a glass bell jar, brass instruments.

Run:  blender --background --python mesa.py -- <out dir> <still|seq|depth> [--portrait] [--samples N] [--scale PCT] [--frames A B]
Assets: ./cc0 (Poly Haven, CC0; see fetch-cc0.mjs) and the plumb bob made by prumo_bob.py.
Units are metres. The maquette is about 30 cm across.
"""
import bpy, bmesh, math, os, random, sys
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index("--") + 1:]
OUT, MODE = argv[0], argv[1]
PORTRAIT = "--portrait" in argv
def opt(name, default):
    return type(default)(argv[argv.index(name) + 1]) if name in argv else default
SAMPLES, SCALE = opt("--samples", 96), opt("--scale", 100)
APOS_GAP = opt("--apos", -0.04)
LANG = opt("--lang", "pt")
SEEN = []
MIG = 22  # frames of the last view turning from paper into the touch table
# The words written on the table, in English for the English take. Screens of the real products stay as they are.
EN = {
    "24/7 COLETA DE PREÇOS": "24/7 PRICE COLLECTION", "78 MIGRAÇÕES REVERSÍVEIS": "78 REVERSIBLE MIGRATIONS", "8 ADAPTADORES DE LOJAS": "8 STORE ADAPTERS",
    "ACESSO": "ACCESS", "ADMINISTRADOR · ATENDENTE · ENTREGADOR": "ADMIN · ATTENDANT · COURIER", "AGUARDANDO PAGAMENTO": "AWAITING PAYMENT", "ALERTAS": "ALERTS",
    "AMEAÇAS BLOQUEADAS": "THREATS BLOCKED", "ANÁLISE DE SEGURANÇA": "SECURITY ANALYSIS", "APROVAR": "APPROVE", "APROXIME OU ESCANEIE": "TAP OR SCAN", "ARTIGOS": "ARTICLES",
    "ATUALIZAÇÕES": "UPDATES", "AUTONOMIA · PRATICIDADE": "AUTONOMY · PRACTICALITY", "AVALIAÇÃO": "EVALUATION", "AVALIAÇÕES": "REVIEWS", "AVANÇAR PEDIDO": "ADVANCE ORDER",
    "CAMADAS DE PROTEÇÃO": "PROTECTION LAYERS", "CAMPANHA": "CAMPAIGN", "CARDÁPIO ONLINE": "ONLINE MENU", "CENTRAL DE LINKS": "LINK HUB", "CENÁRIO": "SCENARIO",
    "CHECKOUT COM PIX": "CHECKOUT WITH PIX", "COLETA": "COLLECTION", "CONTEXTO": "CONTEXT", "COZINHA · IMPRESSÃO DO TÍQUETE": "KITCHEN · TICKET PRINTING",
    "CÓDIGO": "UNIQUE", "ÚNICO": "CODE", "CÓDIGO ÚNICO POR PLACA": "ONE UNIQUE CODE PER PLATE", "CÓPIA ISOLADA": "ISOLATED COPY", "DA JANELA OBSERVADA": "IN THE OBSERVED WINDOW",
    "DESCONTO INFLADO": "INFLATED DISCOUNT", "DESTINO": "DESTINATION", "DESTINO DEFINIDO NO PAINEL": "DESTINATION SET IN THE PANEL", "DISPOSITIVOS": "DEVICES",
    "DISTRIBUIÇÃO": "DISTRIBUTION", "DO RUÍDO À OFERTA VERIFICADA": "FROM NOISE TO A VERIFIED OFFER", "ENTREGUE": "DELIVERED", "ESTADO DO AMBIENTE": "ENVIRONMENT STATUS",
    "EXPOSTO": "EXPOSED", "FILTRADA": "FILTERED", "GOVERNANÇA": "GOVERNANCE", "GOVERNANÇA · SEGURANÇA": "GOVERNANCE · SECURITY", "HISTÓRICO": "HISTORY",
    "HISTÓRICO CURTO": "SHORT HISTORY", "HISTÓRICO CURTO PARA COMPARAR": "HISTORY TOO SHORT TO COMPARE", "HISTÓRICO DE PREÇO · JANELA DE 90 DIAS": "PRICE HISTORY · 90-DAY WINDOW",
    "HOJE": "TODAY", "HOJE 02:00": "TODAY 02:00", "HÁ 90 DIAS": "90 DAYS AGO", "IDENTIDADE": "IDENTITY", "IDENTIDADES": "IDENTITIES", "IMPLEMENTAR": "IMPLEMENT",
    "INTELIGÊNCIA COMERCIAL · EM PRODUÇÃO": "COMMERCE INTELLIGENCE · IN PRODUCTION", "INTERFACE REAL, DADOS DE TESTE": "REAL INTERFACE, TEST DATA",
    "MENOR OBSERVADO": "LOWEST OBSERVED", "MENOR PREÇO": "LOWEST PRICE", "MESMA PLACA, MESMO CÓDIGO. SÓ O DESTINO MUDA.": "SAME PLATE, SAME CODE. ONLY THE DESTINATION CHANGES.",
    "MFA ATIVO": "MFA ON", "MONITORAMENTO": "MONITORING", "NA FILA": "IN QUEUE", "NORMALIZAÇÃO": "NORMALIZATION", "NOVO PEDIDO": "NEW ORDER",
    "O PREÇO SUBIU ANTES DO DESCONTO": "THE PRICE ROSE BEFORE THE DISCOUNT", "OBSERVAÇÃO RECENTE": "RECENT OBSERVATION", "PAGAMENTO": "PAYMENT", "PARCIAL": "PARTIAL",
    "PIX E CARTÃO · PREÇOS RECALCULADOS NO SERVIDOR": "PIX AND CARD · PRICES RECALCULATED ON THE SERVER", "PONTO DE VENDA E OPERAÇÕES · SISTEMA PARA CLIENTE": "POINT OF SALE AND OPERATIONS · CLIENT SYSTEM",
    "PRODUTOS NFC E QR · PRODUTO PÚBLICO": "NFC AND QR PRODUCTS · PUBLIC PRODUCT", "PRONTO": "READY", "PRONTO PARCIAL": "PARTLY READY", "PROTEGIDO": "PROTECTED",
    "PÁGINA DE AVALIAÇÕES": "REVIEWS PAGE", "PÁGINA DE CAMPANHA": "CAMPAIGN PAGE", "REDE": "NETWORK", "RESOLVIDO NA BORDA": "RESOLVED AT THE EDGE", "REVISAR": "REVIEW",
    "SAIU PARA ENTREGA": "OUT FOR DELIVERY", "SERVIDORES": "SERVERS", "TI · IA · SEGURANÇA": "IT · AI · SECURITY", "UM PEDIDO, ACOMPANHADO EM CADA ESTADO": "ONE ORDER, FOLLOWED THROUGH EVERY STATE",
    "VALIDAÇÃO": "VALIDATION", "VEREDITO": "VERDICT", "VERIFICAR": "VERIFY", "VOLTAR": "BACK", "5.000+ testes": "5,000+ tests", "600+ commits com agentes": "600+ commits with agents",
}
def tr(text):
    if LANG != "en": return text
    if text in EN: return EN[text]
    return text.replace(" ATIVAS", " ACTIVE").replace("PEDIDO ", "ORDER ")
FRAMES = (int(argv[argv.index("--frames") + 1]), int(argv[argv.index("--frames") + 2])) if "--frames" in argv else (1, 40)
HERE = os.path.dirname(os.path.abspath(__file__))
CC0 = os.path.join(HERE, "cc0")
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection

# Materials ---------------------------------------------------------------------------------------------------------
def image(path, non_color=False):
    img = bpy.data.images.load(path, check_existing=True)
    if non_color: img.colorspace_settings.name = "Non-Color"
    return img

def textured(name, folder, tint=(1, 1, 1), scale=1.0, bump=1.0, rough_add=0.0, box=True, value=1.0):
    """A Principled material driven by a Poly Haven set, box-projected so blocks need no UVs."""
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    coord = nt.nodes.new("ShaderNodeTexCoord"); mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (scale, scale, scale)
    nt.links.new(coord.outputs["Object" if box else "UV"], mapping.inputs["Vector"])
    def tex(file, non_color):
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = image(os.path.join(CC0, "textures", folder, file), non_color)
        if box: t.projection = "BOX"; t.projection_blend = 0.25
        nt.links.new(mapping.outputs["Vector"], t.inputs["Vector"]); return t
    diff, nor, rough = tex("diff.jpg", False), tex("nor.jpg", True), tex("rough.jpg", True)
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"; mix.inputs["Factor"].default_value = 1.0
    hsv = nt.nodes.new("ShaderNodeHueSaturation"); hsv.inputs["Saturation"].default_value = 0.0; hsv.inputs["Value"].default_value = value
    nt.links.new(diff.outputs["Color"], hsv.inputs["Color"])
    # Each object reads slightly differently, the way hand-cut blocks do.
    info = nt.nodes.new("ShaderNodeObjectInfo"); vary = nt.nodes.new("ShaderNodeMapRange")
    vary.inputs["To Min"].default_value = 0.86; vary.inputs["To Max"].default_value = 1.06
    nt.links.new(info.outputs["Random"], vary.inputs["Value"])
    tintn = nt.nodes.new("ShaderNodeMix"); tintn.data_type = "RGBA"; tintn.blend_type = "MULTIPLY"; tintn.inputs["Factor"].default_value = 1.0
    tintn.inputs["B"].default_value = (*tint, 1)
    nt.links.new(hsv.outputs["Color"], tintn.inputs["A"])
    nt.links.new(tintn.outputs["Result"], mix.inputs["A"]); nt.links.new(vary.outputs["Result"], mix.inputs["B"])
    nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
    radd = nt.nodes.new("ShaderNodeMath"); radd.operation = "ADD"; radd.use_clamp = True; radd.inputs[1].default_value = rough_add
    nt.links.new(rough.outputs["Color"], radd.inputs[0]); nt.links.new(radd.outputs["Value"], b.inputs["Roughness"])
    nmap = nt.nodes.new("ShaderNodeNormalMap"); nmap.inputs["Strength"].default_value = bump
    nt.links.new(nor.outputs["Color"], nmap.inputs["Color"]); nt.links.new(nmap.outputs["Normal"], b.inputs["Normal"])
    return m

def plain(name, color, rough=0.5, metallic=0.0, **more):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metallic
    for k, v in more.items(): b.inputs[k].default_value = v
    return m

def brass_material():
    m = plain("Brass", (0.86, 0.62, 0.27), 0.24, 1.0); nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    # Fine brushing and a little uneven tarnish, so the metal is not a mirror.
    noise = nt.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 260; noise.inputs["Detail"].default_value = 6
    coord = nt.nodes.new("ShaderNodeTexCoord"); stretch = nt.nodes.new("ShaderNodeMapping"); stretch.inputs["Scale"].default_value = (1, 1, 30)
    nt.links.new(coord.outputs["Object"], stretch.inputs["Vector"]); nt.links.new(stretch.outputs["Vector"], noise.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeMapRange"); ramp.inputs["To Min"].default_value = 0.16; ramp.inputs["To Max"].default_value = 0.38
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Value"]); nt.links.new(ramp.outputs["Result"], b.inputs["Roughness"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.06; bump.inputs["Distance"].default_value = 0.0002
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m

def glass_material():
    m = bpy.data.materials.new("Glass"); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.97, 0.985, 0.98, 1); b.inputs["Roughness"].default_value = 0.0
    b.inputs["Transmission Weight"].default_value = 1.0; b.inputs["IOR"].default_value = 1.48
    # Shadow rays pass mostly through: the jar throws a faint shadow, not a black one.
    out = nt.nodes["Material Output"]; path = nt.nodes.new("ShaderNodeLightPath"); clear = nt.nodes.new("ShaderNodeBsdfTransparent")
    clear.inputs["Color"].default_value = (0.86, 0.9, 0.9, 1); mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(path.outputs["Is Shadow Ray"], mix.inputs["Fac"]); nt.links.new(b.outputs["BSDF"], mix.inputs[1]); nt.links.new(clear.outputs["BSDF"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    return m

def ceramic(name, color, rough=0.62):
    """Unglazed fired clay: a fine tooth, soft mottling, and a slightly different tone on every block."""
    m = plain(name, color, rough); nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    coord = nt.nodes.new("ShaderNodeTexCoord")
    grain = nt.nodes.new("ShaderNodeTexNoise"); grain.inputs["Scale"].default_value = 520; grain.inputs["Detail"].default_value = 8; grain.inputs["Roughness"].default_value = 0.7
    cloud = nt.nodes.new("ShaderNodeTexNoise"); cloud.inputs["Scale"].default_value = 22; cloud.inputs["Detail"].default_value = 4
    for n in (grain, cloud): nt.links.new(coord.outputs["Object"], n.inputs["Vector"])
    info = nt.nodes.new("ShaderNodeObjectInfo")
    tone = nt.nodes.new("ShaderNodeMath"); tone.operation = "MULTIPLY_ADD"; tone.inputs[1].default_value = 0.16; tone.inputs[2].default_value = 0.86
    nt.links.new(info.outputs["Random"], tone.inputs[0])
    mott = nt.nodes.new("ShaderNodeMapRange"); mott.inputs["To Min"].default_value = 0.9; mott.inputs["To Max"].default_value = 1.08
    nt.links.new(cloud.outputs["Fac"], mott.inputs["Value"])
    both = nt.nodes.new("ShaderNodeMath"); both.operation = "MULTIPLY"; nt.links.new(tone.outputs["Value"], both.inputs[0]); nt.links.new(mott.outputs["Result"], both.inputs[1])
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"; mix.inputs["Factor"].default_value = 1.0
    mix.inputs["A"].default_value = (*color, 1); nt.links.new(both.outputs["Value"], mix.inputs["B"]); nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.2; bump.inputs["Distance"].default_value = 0.00035
    nt.links.new(grain.outputs["Fac"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    rr = nt.nodes.new("ShaderNodeMapRange"); rr.inputs["To Min"].default_value = rough - 0.1; rr.inputs["To Max"].default_value = rough + 0.14
    nt.links.new(cloud.outputs["Fac"], rr.inputs["Value"]); nt.links.new(rr.outputs["Result"], b.inputs["Roughness"])
    return m
BONE = ceramic("CeramicBone", (0.83, 0.74, 0.6))
ORANGE = ceramic("CeramicOrange", (0.82, 0.17, 0.028), 0.55)
HOLO, HOLO_EM = [], {}
def hologram(mat, color, strength):
    nt = mat.node_tree; out = nt.nodes["Material Output"]; solid = out.inputs["Surface"].links[0].from_socket
    dial = nt.nodes.new("ShaderNodeValue"); dial.outputs[0].default_value = 0.0; HOLO.append(dial)
    lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.3
    geo = nt.nodes.new("ShaderNodeNewGeometry"); xyz = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Position"], xyz.inputs["Vector"])
    wave = nt.nodes.new("ShaderNodeMath"); wave.operation = "MULTIPLY"; wave.inputs[1].default_value = 2200.0; nt.links.new(xyz.outputs["Z"], wave.inputs[0])
    sine = nt.nodes.new("ShaderNodeMath"); sine.operation = "SINE"; nt.links.new(wave.outputs[0], sine.inputs[0])
    rows = nt.nodes.new("ShaderNodeMath"); rows.operation = "MULTIPLY_ADD"; rows.inputs[1].default_value = 0.05; rows.inputs[2].default_value = 0.08; nt.links.new(sine.outputs[0], rows.inputs[0])
    alpha = nt.nodes.new("ShaderNodeMath"); alpha.operation = "MULTIPLY_ADD"; alpha.use_clamp = True; alpha.inputs[1].default_value = 0.55; nt.links.new(lw.outputs["Facing"], alpha.inputs[0]); nt.links.new(rows.outputs[0], alpha.inputs[2])
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (*color, 1); em.inputs["Strength"].default_value = strength; HOLO_EM[mat.name] = em
    clear = nt.nodes.new("ShaderNodeBsdfTransparent"); light = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(alpha.outputs[0], light.inputs["Fac"]); nt.links.new(clear.outputs["BSDF"], light.inputs[1]); nt.links.new(em.outputs["Emission"], light.inputs[2])
    both = nt.nodes.new("ShaderNodeMixShader"); nt.links.new(dial.outputs[0], both.inputs["Fac"]); nt.links.new(solid, both.inputs[1]); nt.links.new(light.outputs["Shader"], both.inputs[2])
    nt.links.new(both.outputs["Shader"], out.inputs["Surface"])
hologram(BONE, (1.0, 0.5, 0.12), 1.5); hologram(ORANGE, (1.0, 0.16, 0.01), 5.0)
WOOD = textured("Table", "wood_table_worn", (0.55, 0.5, 0.46), 1.4, 1.0, 0.0, box=False)
WALL = textured("Wall", "painted_plaster_wall", (0.2, 0.185, 0.17), 0.8, 0.6, 0.1, value=0.9)
PAPER = plain("Paper", (0.7, 0.63, 0.52), 0.88)
GRAPHITE = plain("Graphite", (0.16, 0.16, 0.17), 0.55)
PENCIL = plain("OrangePencil", (0.9, 0.2, 0.03), 0.6)
BRASS, GLASS = brass_material(), glass_material()
STRING = plain("String", (0.55, 0.5, 0.42), 0.8)
# Paper fibre: a faint, fine bump.
nt = PAPER.node_tree; fibre = nt.nodes.new("ShaderNodeTexNoise"); fibre.inputs["Scale"].default_value = 900; fibre.inputs["Detail"].default_value = 8
pb = nt.nodes.new("ShaderNodeBump"); pb.inputs["Strength"].default_value = 0.12; pb.inputs["Distance"].default_value = 0.0002
nt.links.new(fibre.outputs["Fac"], pb.inputs["Height"]); nt.links.new(pb.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])
geo = nt.nodes.new("ShaderNodeNewGeometry"); xyz = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Position"], xyz.inputs["Vector"])
SWEEP = nt.nodes.new("ShaderNodeValue"); SWEEP.outputs[0].default_value = -2.0  # everything left of this x is glass
glassy = nt.nodes.new("ShaderNodeMath"); glassy.operation = "LESS_THAN"; nt.links.new(xyz.outputs["X"], glassy.inputs[0]); nt.links.new(SWEEP.outputs[0], glassy.inputs[1])
tone = nt.nodes.new("ShaderNodeMix"); tone.data_type = "RGBA"; tone.inputs[6].default_value = (0.7, 0.63, 0.52, 1); tone.inputs[7].default_value = (0.012, 0.007, 0.004, 1)
nt.links.new(glassy.outputs[0], tone.inputs["Factor"]); nt.links.new(tone.outputs[2], nt.nodes["Principled BSDF"].inputs["Base Color"])
polish = nt.nodes.new("ShaderNodeMath"); polish.operation = "MULTIPLY_ADD"; polish.inputs[1].default_value = -0.8; polish.inputs[2].default_value = 0.88
nt.links.new(glassy.outputs[0], polish.inputs[0]); nt.links.new(polish.outputs[0], nt.nodes["Principled BSDF"].inputs["Roughness"])
tooth = nt.nodes.new("ShaderNodeMath"); tooth.operation = "MULTIPLY_ADD"; tooth.inputs[1].default_value = -0.12; tooth.inputs[2].default_value = 0.12
nt.links.new(glassy.outputs[0], tooth.inputs[0]); nt.links.new(tooth.outputs[0], pb.inputs["Strength"])

hologram(BRASS, (1.0, 0.5, 0.1), 2.6); hologram(PENCIL, (1.0, 0.3, 0.03), 3.0); hologram(STRING, (1.0, 0.5, 0.1), 4.0)
# Geometry helpers ----------------------------------------------------------------------------------------------------
def add(obj):
    col.objects.link(obj); return obj

def box(name, x, y, z0, w, d, h, mat, bevel=0.0012, wobble=0.5):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    mesh = bpy.data.meshes.new(name); bm.to_mesh(mesh); bm.free()
    o = add(bpy.data.objects.new(name, mesh)); o.scale = (w, d, h); o.location = (x, y, z0 + h / 2)
    o.rotation_euler = Euler((0, 0, math.radians(random.uniform(-wobble, wobble))))
    mesh.materials.append(mat)
    if bevel:
        mod = o.modifiers.new("Bevel", "BEVEL"); mod.width = bevel; mod.segments = 3; mod.limit_method = "ANGLE"
    for p in mesh.polygons: p.use_smooth = True
    return o

def lathe(name, profile, mat, steps=96, smooth=True):
    """Spins (radius, height) pairs round the vertical axis."""
    bm = bmesh.new(); rings = []
    for r, h in profile:
        rings.append([bm.verts.new((0, 0, h))] if r == 0 else [bm.verts.new((r * math.cos(2 * math.pi * i / steps), r * math.sin(2 * math.pi * i / steps), h)) for i in range(steps)])
    for a, b in zip(rings, rings[1:]):
        for i in range(steps):
            j = (i + 1) % steps
            if len(a) == 1 and len(b) == 1: continue
            if len(a) == 1: bm.faces.new((a[0], b[i], b[j]))
            elif len(b) == 1: bm.faces.new((a[i], a[j], b[0]))
            else: bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name); bm.to_mesh(mesh); bm.free()
    for p in mesh.polygons: p.use_smooth = smooth
    o = add(bpy.data.objects.new(name, mesh)); mesh.materials.append(mat); return o

def rod(name, a, b, radius, mat, taper=1.0):
    a, b = Vector(a), Vector(b); length = (b - a).length
    o = lathe(name, [(0, 0), (radius, 0), (radius * taper, length), (0, length)], mat, 32)
    o.location = a; o.rotation_euler = Vector((0, 0, 1)).rotation_difference(b - a).to_euler(); return o

def line(name, pts, depth, mat, cyclic=False, z=0.0011):
    c = bpy.data.curves.new(name, "CURVE"); c.dimensions = "3D"; c.bevel_depth = depth; c.bevel_resolution = 2
    s = c.splines.new("POLY"); s.points.add(len(pts) - 1)
    for p, (x, y) in zip(s.points, pts): p.co = (x, y, z, 1)
    s.use_cyclic_u = cyclic
    o = add(bpy.data.objects.new(name, c)); c.materials.append(mat); return o

def circle(name, cx, cy, r, depth=0.00028, mat=None, n=160, arc=(0, 2 * math.pi)):
    pts = [(cx + r * math.cos(arc[0] + (arc[1] - arc[0]) * i / n), cy + r * math.sin(arc[0] + (arc[1] - arc[0]) * i / n)) for i in range(n + (0 if arc[1] - arc[0] >= 2 * math.pi - 1e-6 else 1))]
    return line(name, pts, depth, mat or GRAPHITE, cyclic=arc[1] - arc[0] >= 2 * math.pi - 1e-6)

# The table, the sheet and the wall ---------------------------------------------------------------------------------
def plane(name, w, d, mat, z=0.0, uv=1.0):
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    uvl = bm.loops.layers.uv.new()
    for f in bm.faces:
        for l in f.loops: l[uvl].uv = ((l.vert.co.x + 0.5) * uv * w, (l.vert.co.y + 0.5) * uv * d)
    mesh = bpy.data.meshes.new(name); bm.to_mesh(mesh); bm.free()
    o = add(bpy.data.objects.new(name, mesh)); o.scale = (w, d, 1); o.location.z = z; mesh.materials.append(mat); return o

plane("Table", 3.2, 2.2, WOOD, 0.0)
sheet = box("Sheet", 0.02, 0.02, 0.0, 1.5, 1.02, 0.0006, PAPER, bevel=0, wobble=0)
sheet.rotation_euler.z = math.radians(-2.2)
wall = plane("Wall", 6, 3, WALL, 0.0); wall.rotation_euler = (math.radians(90), 0, 0); wall.location = (0, 1.25, 1.2)

# The drawing under the maquette: construction circles, axes, ticks, and one orange line across the sheet.
CX, CY = 0.03, 0.02
for r in (0.11, 0.19, 0.27, 0.36): circle(f"Circle{r}", CX, CY, r)
circle("ArcA", CX + 0.38, CY - 0.12, 0.2, arc=(math.radians(100), math.radians(250)))
circle("ArcB", CX - 0.42, CY + 0.1, 0.26, arc=(math.radians(-60), math.radians(70)))
for ang in range(0, 180, 30):
    a = math.radians(ang + 7); line(f"Axis{ang}", [(CX - 0.6 * math.cos(a), CY - 0.6 * math.sin(a)), (CX + 0.6 * math.cos(a), CY + 0.6 * math.sin(a))], 0.0002, GRAPHITE)
for i in range(-14, 15):
    x = CX + i * 0.04; line(f"Tick{i}", [(x, CY - 0.44), (x, CY - 0.44 + (0.014 if i % 5 else 0.026))], 0.00022, GRAPHITE)
line("OrangeLine", [(-0.74, -0.36), (0.76, 0.33)], 0.0011, PENCIL, z=0.0014)

# The maquette: three strata ------------------------------------------------------------------------------------------
maquette = []
def block(*args, **kw):
    o = box(*args, **kw); maquette.append(o); return o
G = 0.0012  # the gap between blocks
# Base stratum, bone: a broad platform cut into pieces.
base = [(-0.085, -0.045, 0.110, 0.090, 0.042), (0.030, -0.050, 0.116, 0.080, 0.046), (-0.098, 0.045, 0.084, 0.086, 0.040),
        (-0.010, 0.050, 0.088, 0.078, 0.048), (0.090, 0.040, 0.094, 0.098, 0.044), (0.112, -0.052, 0.046, 0.076, 0.036)]
for i, (x, y, w, d, h) in enumerate(base): block(f"Base{i}", CX + x, CY + y, 0.0006, w - G, d - G, h, BONE)
# Stairs up the front left and a narrower flight on the right.
for i in range(7): block(f"StairA{i}", CX - 0.118, CY - 0.104 - i * 0.0085 + 0.03, 0.0006, 0.05, 0.0085, 0.036 - i * 0.005, BONE, bevel=0.0005, wobble=0)
for i in range(6): block(f"StairB{i}", CX + 0.158 + i * 0.008 - 0.02, CY + 0.0, 0.0006, 0.008, 0.04, 0.036 - i * 0.0058, BONE, bevel=0.0005, wobble=0)
# Middle stratum, orange: a ring of blocks with a gateway through it.
mid = [(-0.070, -0.030, 0.070, 0.062, 0.040), (0.004, -0.044, 0.066, 0.034, 0.040), (0.072, -0.026, 0.060, 0.068, 0.036),
       (-0.052, 0.040, 0.094, 0.062, 0.038), (0.050, 0.046, 0.094, 0.052, 0.042)]
for i, (x, y, w, d, h) in enumerate(mid): block(f"Mid{i}", CX + x, CY + y, 0.046, w - G, d - G, h, ORANGE)
block("Lintel", CX + 0.004, CY - 0.004, 0.046 + 0.026, 0.05, 0.04, 0.014, ORANGE)
# Top stratum, bone, with one orange cube: the piece the whole thing is built to carry.
top = [(-0.046, -0.006, 0.062, 0.058, 0.034), (0.020, 0.018, 0.064, 0.070, 0.044), (-0.020, 0.052, 0.050, 0.034, 0.026)]
for i, (x, y, w, d, h) in enumerate(top): block(f"Top{i}", CX + x, CY + y, 0.086, w - G, d - G, h, BONE)
block("Keystone", CX + 0.014, CY + 0.012, 0.086 + 0.044, 0.036, 0.036, 0.034, ORANGE)
for i in range(5): block(f"StairC{i}", CX + 0.074 + i * 0.007, CY - 0.012, 0.086, 0.007, 0.03, 0.03 - i * 0.0056, BONE, bevel=0.0004, wobble=0)

for dx in (-0.017, 0.017):
    for dy in (-0.014, 0.014):
        maquette.append(lathe(f"Column{dx}{dy}", [(0, 0), (0.0042, 0), (0.0042, 0.002), (0.0032, 0.003), (0.003, 0.023), (0.0042, 0.0245), (0.0042, 0.026), (0, 0.026)], BONE, 24))
        maquette[-1].location = (CX + 0.004 + dx, CY - 0.004 + dy, 0.046)
block("SlabA", CX - 0.062, CY - 0.052, 0.086, 0.07, 0.03, 0.004, BONE, bevel=0.0006)
block("SlabB", CX + 0.092, CY + 0.048, 0.088, 0.05, 0.06, 0.004, BONE, bevel=0.0006)
block("SlabC", CX - 0.03, CY + 0.07, 0.12, 0.06, 0.02, 0.0035, ORANGE, bevel=0.0006)
block("Plinth", CX - 0.104, CY + 0.046, 0.04, 0.03, 0.03, 0.018, ORANGE)
rail = []
for i in range(7):  # a brass rail along the front of the middle stratum
    rail.append(rod(f"RailPost{i}", (CX - 0.1 + i * 0.03, CY - 0.062, 0.0426), (CX - 0.1 + i * 0.03, CY - 0.062, 0.0546), 0.0007, BRASS))
rail.append(rod("Rail", (CX - 0.1, CY - 0.062, 0.0546), (CX + 0.08, CY - 0.062, 0.0546), 0.0008, BRASS))
PAWN = [(0, 0), (0.0052, 0), (0.0056, 0.0012), (0.0042, 0.0026), (0.0026, 0.0052), (0.0022, 0.0105), (0.0034, 0.012), (0.0022, 0.0134), (0.0036, 0.0158), (0.0039, 0.0185), (0.0029, 0.021), (0, 0.022)]
PAWNS = [(-0.088, -0.05, 0.0426), (-0.046, 0.004, 0.12), (0.03, -0.05, 0.0466), (0.058, 0.03, 0.13), (0.094, -0.03, 0.082), (0.014, 0.012, 0.164)]
pawns = []
for i, (x, y, z) in enumerate(PAWNS):  # the six stages of the agent workflow stand on the model
    pawns.append(lathe(f"Pawn{i}", PAWN, BRASS, 40)); pawns[-1].location = (CX + x, CY + y, z)

# A pencil left on the sheet, the one that drew the orange line.
def pencil(x, y, turn):
    holder = add(bpy.data.objects.new("Pencil", None)); holder.location = (x, y, 0.0045); holder.rotation_euler = (0, 0, math.radians(turn))
    body = lathe("PencilBody", [(0, 0), (0.0039, 0), (0.0039, 0.15), (0, 0.15)], plain("PencilPaint", (0.86, 0.19, 0.03), 0.34), 6, smooth=False)
    wood = lathe("PencilWood", [(0.0039, 0.15), (0.0012, 0.168)], plain("PencilWood", (0.72, 0.55, 0.36), 0.7), 6, smooth=False)
    lead = lathe("PencilLead", [(0.0012, 0.168), (0.0, 0.172)], GRAPHITE, 12)
    ferrule = lathe("PencilFerrule", [(0.0041, -0.012), (0.0041, 0.0), (0, 0.0)], BRASS, 24)
    rubber = lathe("PencilRubber", [(0, -0.021), (0.0038, -0.02), (0.0038, -0.012), (0, -0.012)], plain("Rubber", (0.78, 0.5, 0.46), 0.9), 24)
    for part in (body, wood, lead, ferrule, rubber): part.parent = holder; part.rotation_euler = (0, math.radians(90), 0)
pencil(CX - 0.3, CY - 0.33, 24.5)

# The bell jar --------------------------------------------------------------------------------------------------------
R, HJ, T = 0.2, 0.25, 0.0032
outer = [(R, 0.0), (R, 0.11), (R * 0.985, 0.15), (R * 0.93, 0.19), (R * 0.82, 0.222), (R * 0.64, 0.243), (R * 0.42, 0.256), (R * 0.2, 0.262), (0.03, 0.264)]
knob = [(0.012, 0.266), (0.011, 0.276), (0.02, 0.286), (0.03, 0.302), (0.031, 0.318), (0.022, 0.334), (0.0, 0.34)]
# One skin from the rim to the top of the knob; the wall thickness comes from a Solidify modifier, so the glass is a
# closed shell with consistent normals.
jar = lathe("BellJar", outer + knob, GLASS, 128)
shell = jar.modifiers.new("Solidify", "SOLIDIFY"); shell.thickness = T; shell.offset = -1.0
sub = jar.modifiers.new("Subsurf", "SUBSURF"); sub.levels = 1; sub.render_levels = 1
JAR_HOME = Vector((CX + 0.012, CY + 0.004, 0.0008))
JAR_UP = Vector((CX + 0.135, CY + 0.075, 0.2))

# Brass: the plumb stand, a pair of compasses, a rule ---------------------------------------------------------------
_before_stand = set(bpy.data.objects)
SX, SY = CX - 0.44, CY + 0.12
lathe("StandFoot", [(0, 0), (0.05, 0), (0.052, 0.003), (0.05, 0.007), (0.034, 0.011), (0.03, 0.016), (0.012, 0.02), (0.0, 0.02)], BRASS).location = (SX, SY, 0.0008)
rod("StandPost", (SX, SY, 0.018), (SX, SY, 0.33), 0.0052, BRASS)
for z in (0.06, 0.3): lathe(f"Collar{z}", [(0, 0), (0.008, 0), (0.0095, 0.004), (0.008, 0.008), (0, 0.008)], BRASS, 48).location = (SX, SY, z)
lathe("Finial", [(0, 0), (0.007, 0.001), (0.011, 0.008), (0.008, 0.016), (0.0, 0.02)], BRASS, 48).location = (SX, SY, 0.33)
rod("StandArm", (SX - 0.016, SY, 0.312), (SX + 0.14, SY, 0.312), 0.004, BRASS)
for x in (SX - 0.016, SX + 0.14):
    k = lathe("ArmEnd", [(0, -0.006), (0.007, -0.004), (0.008, 0), (0.007, 0.004), (0, 0.006)], BRASS, 48); k.location = (x, SY, 0.312); k.rotation_euler = (0, math.radians(90), 0)
BOBX = SX + 0.128
rod("PlumbLine", (BOBX, SY, 0.118), (BOBX, SY, 0.31), 0.0005, STRING)
try:
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(HERE, "prumo.glb"))
    for o in set(bpy.data.objects) - before:
        if o.type == "MESH":
            o.data.materials.clear(); o.data.materials.append(BRASS)
            o.scale = (0.078,) * 3; o.location = (BOBX, SY, 0.042)
except Exception as error:  # the scene still stands without the bob
    print("plumb bob not imported:", error)
stand_parts = [o for o in set(bpy.data.objects) - _before_stand if o.parent is None]

def compasses(x, y, turn):
    hinge = Vector((x, y, 0.016)); spread = 0.07
    parent = add(bpy.data.objects.new("Compasses", None)); parent.location = hinge; parent.rotation_euler = (0, 0, math.radians(turn))
    for side in (-1, 1):
        tip = Vector((0.17, side * spread, -0.0125))
        leg = rod(f"Leg{side}", (0, 0, 0), tip * 0.82, 0.0042, BRASS, taper=0.72); leg.parent = parent
        point = rod(f"Point{side}", tip * 0.82, tip, 0.003, plain(f"Steel{side}", (0.55, 0.56, 0.58), 0.22, 1.0), taper=0.08); point.parent = parent
        nut = lathe(f"Nut{side}", [(0, 0), (0.0075, 0), (0.0085, 0.003), (0.0075, 0.006), (0, 0.006)], BRASS, 12, smooth=False); nut.parent = parent; nut.location = tip * 0.5 + Vector((0, 0, 0.002))
    head = lathe("Hinge", [(0, -0.004), (0.013, -0.004), (0.014, 0.0), (0.013, 0.009), (0.007, 0.011), (0.006, 0.02), (0.0, 0.021)], BRASS, 64); head.parent = parent
compasses(CX + 0.44, CY - 0.2, 158)

RULE = (CX + 0.2, CY - 0.4, math.radians(-7))
rule = box("Rule", RULE[0], RULE[1], 0.0008, 0.62, 0.034, 0.0022, BRASS, bevel=0.0005, wobble=0); rule.rotation_euler.z = RULE[2]
for i in range(0, 61):  # engraved graduations along the far edge
    length = 0.006 if i % 5 else 0.011
    lx, ly = -0.3 + i * 0.01, 0.017 - length / 2 - 0.001
    x = RULE[0] + lx * math.cos(RULE[2]) - ly * math.sin(RULE[2]); y = RULE[1] + lx * math.sin(RULE[2]) + ly * math.cos(RULE[2])
    t = box(f"Mark{i}", x, y, 0.003, 0.0006, length, 0.00005, GRAPHITE, bevel=0, wobble=0); t.rotation_euler.z = RULE[2]

# A magnifying glass from Poly Haven, resting on the sheet.
try:
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(CC0, "models", "magnifying_glass_01", "magnifying_glass_01.gltf"))
    for o in set(bpy.data.objects) - before:
        bpy.data.objects.remove(o, do_unlink=True)  # tried it: it stood upright and took the frame; left out for now
except Exception as error:
    print("magnifying glass not imported:", error)

# Context for each verb, kept small ----------------------------------------------------------------------------------
# Projeto: an architecture diagram pencilled on the sheet, the kind a system starts as.
DX, DY = CX + 0.4, CY + 0.21
def rect(name, x, y, w, d): line(name, [(x - w / 2, y - d / 2), (x + w / 2, y - d / 2), (x + w / 2, y + d / 2), (x - w / 2, y + d / 2)], 0.00028, GRAPHITE, cyclic=True)
for i, (x, y) in enumerate([(0, 0), (0.11, 0), (0.11, 0.075), (0.22, 0.04)]): rect(f"Node{i}", DX + x, DY + y, 0.066, 0.038)
for i, pts in enumerate([[(0.033, 0), (0.077, 0)], [(0.11, 0.019), (0.11, 0.056)], [(0.143, 0), (0.165, 0), (0.165, 0.04), (0.187, 0.04)], [(0.143, 0.075), (0.165, 0.075), (0.165, 0.04)]]):
    line(f"Wire{i}", [(DX + x, DY + y) for x, y in pts], 0.00024, GRAPHITE)
for i in range(3): circle(f"Store{i}", DX, DY + 0.07 + i * 0.008, 0.02, depth=0.00024, n=48)  # a data store, drawn as stacked rings
line("WireStore", [(DX, DY + 0.019), (DX, DY + 0.05)], 0.00024, GRAPHITE)
# Protejo: a low wall round the model with one gate, and a padlock on the gate.
JC = (CX + 0.012, CY + 0.004)
perimeter = []
for i in range(16):
    ang = math.radians(i * 22.5 - 90)
    if i == 0: continue  # the gate
    w = box(f"Wall{i}", JC[0] + 0.186 * math.cos(ang), JC[1] + 0.186 * math.sin(ang), 0.0006, 0.064, 0.006, 0.017, BONE, bevel=0.0008, wobble=0)
    w.rotation_euler.z = ang + math.pi / 2; perimeter.append(w)
lock = box("LockBody", JC[0], JC[1] - 0.186, 0.0006, 0.018, 0.008, 0.014, BRASS, bevel=0.001, wobble=0); perimeter.append(lock)
bpy.ops.mesh.primitive_torus_add(major_radius=0.0055, minor_radius=0.0013, major_segments=32, minor_segments=10, location=(JC[0], JC[1] - 0.186, 0.0155), rotation=(math.radians(90), 0, 0))
shackle = bpy.context.active_object; shackle.name = "LockShackle"; shackle.data.materials.append(BRASS); perimeter.append(shackle)
for p in shackle.data.polygons: p.use_smooth = True
# Orquestro: six containers, one for each worker.
def container_material(name, color):
    m = plain(name, color, 0.5); nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    coord = nt.nodes.new("ShaderNodeTexCoord"); wave = nt.nodes.new("ShaderNodeTexWave"); wave.inputs["Scale"].default_value = 26; wave.inputs["Distortion"].default_value = 0
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.9; bump.inputs["Distance"].default_value = 0.0006
    nt.links.new(coord.outputs["Object"], wave.inputs["Vector"]); nt.links.new(wave.outputs["Fac"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m
CONTAINER = (0.068, 0.029, 0.029)
containers, paints = [], []
STEEL = plain("ContainerSteel", (0.05, 0.05, 0.055), 0.42, 0.7)
for i, color in enumerate([(0.8, 0.72, 0.6), (0.8, 0.72, 0.6), (0.8, 0.72, 0.6), (0.8, 0.72, 0.6), (0.8, 0.72, 0.6), (0.82, 0.2, 0.04)]):
    paints.append(container_material(f"ContainerPaint{i}", color))
    c = box(f"Container{i}", 0, 0, 0, *CONTAINER, paints[-1], bevel=0.0007, wobble=0); c.hide_render = True; containers.append(c)
    # A steel frame on every edge, corner castings, and the lock rods of the doors at one end, in the same mesh.
    c.data.materials.append(STEEL); bm = bmesh.new(); bm.from_mesh(c.data); t = 0.0026; tx, ty, tz = (t / d for d in CONTAINER)
    def beam(x, y, z, w, d, h):
        made = bmesh.ops.create_cube(bm, size=1.0)["verts"]
        for v in made: v.co = Vector((x + v.co.x * w, y + v.co.y * d, z + v.co.z * h))
        for face in {fc for v in made for fc in v.link_faces}: face.material_index = 1
    for y in (-0.5, 0.5):
        for z in (-0.5, 0.5): beam(0, y * (1 - ty * 0.6), z * (1 - tz * 0.6), 1.0 + tx * 0.3, ty, tz)
    for x in (-0.5, 0.5):
        for z in (-0.5, 0.5): beam(x * (1 - tx * 0.6), 0, z * (1 - tz * 0.6), tx, 1.0 + ty * 0.3, tz)
        for y in (-0.5, 0.5):
            beam(x * (1 - tx * 0.6), y * (1 - ty * 0.6), 0, tx, ty, 1.0 + tz * 0.3)
            for z in (-0.5, 0.5): beam(x * (1 - tx * 0.2), y * (1 - ty * 0.2), z * (1 - tz * 0.2), tx * 1.5, ty * 1.5, tz * 1.5)
    for y in (-0.31, -0.1, 0.1, 0.31): beam(0.5 + tx * 0.25, y, 0, tx * 0.45, ty * 0.45, 0.9)
    for y in (-0.31, -0.1, 0.1, 0.31): beam(0.5 + tx * 0.4, y, -0.12, tx * 0.5, ty * 1.5, tz * 0.8)
    beam(0.5 + tx * 0.1, 0, 0, tx * 0.3, ty * 0.25, 0.94)
    bm.to_mesh(c.data); bm.free()
# Protejo: the sheet turns into a dark glass screen (a sweep crosses it), and a dome of light can close over the model.
# The interface on the screen is drawn live by the page; only the glass, the glow and the dome are rendered.
def emitter(name, color, strength):
    return plain(name, (0, 0, 0), 0.6, **{"Emission Color": (*color, 1), "Emission Strength": strength})
scan = box("ScanBar", 0, 0.02, 0.0007, 0.005, 1.06, 0.0014, emitter("ScanLight", (0.3, 0.92, 1.0), 40), bevel=0, wobble=0); scan.hide_render = True
shield_dials = []
def energy(name, wire):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.remove(nt.nodes["Principled BSDF"]); out = nt.nodes["Material Output"]
    geo = nt.nodes.new("ShaderNodeNewGeometry"); xyz = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Position"], xyz.inputs["Vector"])
    t = nt.nodes.new("ShaderNodeValue"); t.outputs[0].default_value = 0.0; shield_dials.append(t)
    top = nt.nodes.new("ShaderNodeMath"); top.operation = "MULTIPLY"; top.inputs[1].default_value = 0.26; nt.links.new(t.outputs[0], top.inputs[0])  # how high the dome has grown
    below = nt.nodes.new("ShaderNodeMath"); below.operation = "LESS_THAN"; nt.links.new(xyz.outputs["Z"], below.inputs[0]); nt.links.new(top.outputs[0], below.inputs[1])
    gap = nt.nodes.new("ShaderNodeMath"); gap.operation = "SUBTRACT"; nt.links.new(top.outputs[0], gap.inputs[0]); nt.links.new(xyz.outputs["Z"], gap.inputs[1])
    edge = nt.nodes.new("ShaderNodeMapRange"); edge.inputs["From Min"].default_value = 0.0; edge.inputs["From Max"].default_value = 0.03; edge.inputs["To Min"].default_value = 1.0; edge.inputs["To Max"].default_value = 0.0
    nt.links.new(gap.outputs[0], edge.inputs["Value"])  # 1 at the growing rim, fading below it
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (1.0, 0.56, 0.16, 1)
    power = nt.nodes.new("ShaderNodeMath"); power.operation = "MULTIPLY_ADD"; power.inputs[1].default_value = 26.0 if wire else 9.0; power.inputs[2].default_value = 7.0 if wire else 1.6
    nt.links.new(edge.outputs["Result"], power.inputs[0]); nt.links.new(power.outputs[0], em.inputs["Strength"])
    clear = nt.nodes.new("ShaderNodeBsdfTransparent"); mix = nt.nodes.new("ShaderNodeMixShader"); fac = below
    if not wire:  # the panes are faint, brighter where they turn away from the eye and at the rim
        lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.35
        soft = nt.nodes.new("ShaderNodeMath"); soft.operation = "MULTIPLY_ADD"; soft.inputs[1].default_value = 0.4; soft.inputs[2].default_value = 0.05; nt.links.new(lw.outputs["Facing"], soft.inputs[0])
        rim = nt.nodes.new("ShaderNodeMath"); rim.operation = "MULTIPLY_ADD"; rim.inputs[1].default_value = 0.5; nt.links.new(edge.outputs["Result"], rim.inputs[0]); nt.links.new(soft.outputs[0], rim.inputs[2])
        fac = nt.nodes.new("ShaderNodeMath"); fac.operation = "MULTIPLY"; fac.use_clamp = True; nt.links.new(below.outputs[0], fac.inputs[0]); nt.links.new(rim.outputs[0], fac.inputs[1])
    nt.links.new(fac.outputs[0], mix.inputs["Fac"]); nt.links.new(clear.outputs["BSDF"], mix.inputs[1]); nt.links.new(em.outputs["Emission"], mix.inputs[2]); nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    return m
bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=3, radius=0.222)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.004], context="VERTS")
bmesh.ops.bevel(bm, geom=list(bm.verts), offset=33.0, offset_type="PERCENT", affect="VERTICES", segments=1)  # triangles become hexagons
dome_mesh = bpy.data.meshes.new("Shield"); bm.to_mesh(dome_mesh); bm.free()
dome = add(bpy.data.objects.new("ShieldPanes", dome_mesh)); dome_mesh.materials.append(energy("ShieldPane", False))
struts = add(bpy.data.objects.new("ShieldStruts", dome_mesh.copy())); struts.data.materials.clear(); struts.data.materials.append(energy("ShieldStrut", True))
wf = struts.modifiers.new("Wire", "WIREFRAME"); wf.thickness = 0.0016; wf.use_replace = True
for o in (dome, struts): o.location = (JC[0], JC[1], 0.0008); o.hide_render = True; o.visible_shadow = False

# Light ---------------------------------------------------------------------------------------------------------------
world = bpy.data.worlds.new("World"); scene.world = world; world.use_nodes = True
wn = world.node_tree; bg = wn.nodes["Background"]; env = wn.nodes.new("ShaderNodeTexEnvironment")
env.image = bpy.data.images.load(os.path.join(CC0, "hdri", "artist_workshop_2k.hdr"))
wc = wn.nodes.new("ShaderNodeTexCoord"); wm = wn.nodes.new("ShaderNodeMapping"); wm.inputs["Rotation"].default_value = (0, 0, math.radians(200))
wn.links.new(wc.outputs["Generated"], wm.inputs["Vector"]); wn.links.new(wm.outputs["Vector"], env.inputs["Vector"]); wn.links.new(env.outputs["Color"], bg.inputs["Color"])
bg.inputs["Strength"].default_value = 0.3
sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 6.4; sun.angle = math.radians(1.6); sun.color = (1.0, 0.8, 0.58)
so = add(bpy.data.objects.new("Sun", sun)); so.rotation_euler = (math.radians(66), math.radians(4), math.radians(-62))
# A window between the sun and the table: its bars fall across the sheet as long soft shadows.
back = Vector((0, 0, 1)); back.rotate(so.rotation_euler)  # the direction towards the sun
BLACK = plain("Blocker", (0, 0, 0), 1.0)
frame = add(bpy.data.objects.new("Window", None)); frame.location = back * 2.6 + Vector((-0.12, 0.1, 0)); frame.rotation_euler = so.rotation_euler
for i, (x, w) in enumerate([(-1.2, 0.9), (-0.52, 0.035), (-0.06, 0.035), (0.4, 0.035), (1.3, 0.9)]):
    b = box(f"Mullion{i}", 0, 0, 0, w, 3.0, 0.02, BLACK, bevel=0, wobble=0); b.parent = frame; b.location = (x, 0, 0)
for i, (y, h) in enumerate([(-1.3, 0.9), (-0.36, 0.03), (0.32, 0.03), (1.5, 0.9)]):
    b = box(f"Transom{i}", 0, 0, 0, 3.0, h, 0.02, BLACK, bevel=0, wobble=0); b.parent = frame; b.location = (0, y, 0)
pivot = add(bpy.data.objects.new("SunPivot", None)); so.parent = pivot; frame.parent = pivot  # turning it moves the hour
fill = bpy.data.lights.new("Fill", "AREA"); fill.energy = 9; fill.size = 1.6; fill.color = (0.72, 0.8, 1.0)
fo = add(bpy.data.objects.new("Fill", fill)); fo.location = (0.9, -0.9, 0.7); fo.rotation_euler = (math.radians(58), 0, math.radians(42))

# Camera and the animation of the jar ---------------------------------------------------------------------------------
cam = bpy.data.cameras.new("Camera"); co = add(bpy.data.objects.new("Camera", cam)); scene.camera = co
aim = add(bpy.data.objects.new("Aim", None))
if PORTRAIT:
    cam.lens = 47; co.location = (CX - 0.16, CY - 1.3, 0.7); aim.location = (CX + 0.01, CY + 0.02, 0.15)
else:
    cam.lens = 47; co.location = (CX - 0.3, CY - 1.12, 0.38); aim.location = (CX - 0.05, CY + 0.0, 0.1)
track = co.constraints.new("TRACK_TO"); track.target = aim; track.track_axis = "TRACK_NEGATIVE_Z"; track.up_axis = "UP_Y"
focus = add(bpy.data.objects.new("Focus", None)); focus.location = aim.location
JOURNEY = MODE in ("journey", "anchors", "shield", "matte", "states")
cam.dof.use_dof = True; cam.dof.focus_object = focus if JOURNEY else aim; cam.dof.aperture_fstop = 2.8
def key(obj, frame, loc=None, rot=None, scale=None):
    if loc is not None: obj.location = loc; obj.keyframe_insert("location", frame=frame)
    if rot is not None: obj.rotation_euler = rot; obj.keyframe_insert("rotation_euler", frame=frame)
    if scale is not None: obj.scale = scale; obj.keyframe_insert("scale", frame=frame)
def interp(kind):
    try: bpy.context.preferences.edit.keyframe_new_interpolation_type = kind
    except Exception as error: print("interpolation stays default:", error)
deg = math.radians
if JOURNEY:
    # One take in four acts. The plan on the sheet rises into the model (projeto), the jar comes down (protejo), it
    # lifts while the six pawns take their places (orquestro), and it settles again over the whole (sistemas).
    # Then one stop for each project: its container comes forward, takes the project's colour, and the table follows.
    # To add a project, add a line here (there are six containers) and render again; the page reads the same order.
    PROJECTS = [("prumo", (0.578, 0.888, 0.07)), ("torvya", (0.105, 0.15, 1.0)), ("kreps", (1.0, 0.75, 0.01))]
    STOP0, GAP = 208, 28
    STOPS = [STOP0 + GAP * k for k in range(len(PROJECTS))]
    LAST = STOPS[-1] + 44
    M0, END2 = LAST, LAST + MIG
    scene.frame_start, scene.frame_end = 1, END2
    if "--frames" not in argv: FRAMES = (1, END2)
    def appear(o, f):
        o.hide_render = True; o.keyframe_insert("hide_render", frame=f - 1)
        o.hide_render = False; o.keyframe_insert("hide_render", frame=f)
    def grow(o, f0, f1, hidden=True):
        loc, sc = o.location.copy(), o.scale.copy()
        key(o, f0, Vector((loc.x, loc.y, 0.0007)), scale=Vector((sc.x, sc.y, sc.z * 0.002)))
        key(o, f1, loc, scale=sc)
        if hidden: appear(o, f0)
    def vanish(o, f):
        o.hide_render = False; o.keyframe_insert("hide_render", frame=f - 1)
        o.hide_render = True; o.keyframe_insert("hide_render", frame=f)
    by = lambda prefix: [o for o in maquette if o.name.startswith(prefix)]
    interp("BACK")
    for i, o in enumerate(by("Base")): grow(o, 14 + i * 3, 28 + i * 3, hidden=False)  # the footprints lie on the plan from the start
    for i, o in enumerate(by("StairA")): grow(o, 30 + i, 40 + i)
    for i, o in enumerate(by("StairB")): grow(o, 32 + i, 42 + i)
    for i, o in enumerate(by("Mid")): grow(o, 34 + i * 3, 48 + i * 3)
    for o in by("Plinth"): grow(o, 40, 52)
    for i, o in enumerate(by("Column")): grow(o, 46 + i, 56 + i)
    for o in by("Lintel"): grow(o, 50, 60)
    for i, o in enumerate(rail): grow(o, 50 + i, 58 + i)
    for i, o in enumerate(by("Top")): grow(o, 52 + i * 3, 64 + i * 3)
    for i, o in enumerate(by("Slab")): grow(o, 58 + i * 2, 68 + i * 2)
    for i, o in enumerate(by("StairC")): grow(o, 60 + i, 68 + i)
    interp("BEZIER")
    for o in by("Keystone"):  # the last piece is set down by hand
        home = o.location.copy(); key(o, 62, home + Vector((0.02, 0.01, 0.24))); key(o, 74, home); appear(o, 62)
    # Things written on the table: paper tags, brass plates, pencilled words. One typeface for all of them.
    try: FONT = bpy.data.fonts.load("C:/Windows/Fonts/consolab.ttf")
    except Exception as error: FONT = None; print("font stays default:", error)
    CARD, INK = plain("Card", (0.84, 0.8, 0.72), 0.85), plain("Ink", (0.035, 0.032, 0.03), 0.6)
    def label(name, text, x, y, z, size, rot, mat=INK, align="CENTER"):
        SEEN.append(text); text = tr(text)
        cu = bpy.data.curves.new(name, "FONT"); cu.body = text; cu.size = size; cu.align_x = align; cu.align_y = "CENTER"
        if FONT: cu.font = FONT
        o = add(bpy.data.objects.new(name, cu)); o.location = (x, y, z); o.rotation_euler.z = rot; cu.materials.append(mat); return o
    if PORTRAIT:
        small_label = label
        def label(name, text, x, y, z, size, rot, mat=INK, align="CENTER"): return small_label(name, text, x, y, z, size * (1.3 if size < 0.02 else 1.0), rot, mat, align)
    def slip(name, text, x, y, w, d, rot, size, mat=CARD, thick=0.0005, ink=INK):  # a piece of paper (or a brass plate) with a word on it
        base = box(name, x, y, 0.0008, w, d, thick, mat, bevel=0, wobble=0); base.rotation_euler.z = rot
        return [base, label(name + "Text", text, x, y, 0.0008 + thick + 0.00015, size, rot, ink)]
    def cable(name, pts, radius, mat):
        cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = radius; cu.bevel_resolution = 4; cu.use_fill_caps = True
        sp = cu.splines.new("BEZIER"); sp.bezier_points.add(len(pts) - 1)
        for q, v in zip(sp.bezier_points, pts): q.co = Vector(v); q.handle_left_type = q.handle_right_type = "AUTO"
        o = add(bpy.data.objects.new(name, cu)); cu.materials.append(mat); return o
    def bead(name, at3, mat, r=0.0036):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=20, ring_count=10, location=at3); o = bpy.context.active_object; o.name = name; o.data.materials.append(mat)
        for pl in o.data.polygons: pl.use_smooth = True
        return o
    T = lambda x, y, z=0.0: Vector((CX + x, CY + y, z))

    # Protejo: the sheet turns into a touch screen of black glass, lit in the amber of the brand. Nothing of the paper
    # drawing stays: the model becomes a hologram at the centre of a radar, the eight layers are a dock along the front
    # edge, square with the table, and the panels at the back say what the system sees.
    guard = []; THREAT_FROM = {}
    AMBER, GREEN, RED = (1.0, 0.4, 0.045), (0.1, 1.0, 0.32), (1.0, 0.07, 0.03)
    LIT, DIM, FILL = emitter("TouchLit", AMBER, 10), emitter("TouchDim", AMBER, 1.8), emitter("TouchFill", AMBER, 0.45)
    OK, BAD, OKDIM = emitter("SignalOk", GREEN, 10), emitter("SignalBad", RED, 10), emitter("SignalOkFill", GREEN, 0.5)
    SR = math.radians(-2.2) - (math.pi / 2 if PORTRAIT else 0)  # square with the sheet; upright, the screen is read from its short side
    HOTS = {}
    def hot_add(frame, name, c, w, d, rot): HOTS.setdefault(frame, {})[name] = (Vector((c.x, c.y, 0.002)), w, d, rot)
    def axes(rot): return Vector((math.cos(rot), math.sin(rot), 0)), Vector((-math.sin(rot), math.cos(rot), 0))
    SU, SV = axes(SR)
    def S(x, y, z=0.0): return Vector((0.02, 0.02, z)) + SU * x + SV * y
    SHEET_AT = S
    def S2(wide, tall, z=0.0): return S(*(tall if PORTRAIT else wide), z)
    BEZEL = (0.98, 1.46) if PORTRAIT else (1.46, 0.98)
    def outline(name, c, w, d, mat, rot, depth=0.0007):
        u, v = axes(rot)
        return line(name, [((c + u * sx * w / 2 + v * sy * d / 2).x, (c + u * sx * w / 2 + v * sy * d / 2).y) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))], depth, mat, cyclic=True, z=0.0017)
    def stroke(name, a, b, mat, depth=0.0006): return line(name, [(a.x, a.y), (b.x, b.y)], depth, mat, z=0.0017)
    def pane(name, c, w, d, mat, rot):
        o = box(name, c.x, c.y, 0.001, w, d, 0.0002, mat, bevel=0, wobble=0); o.rotation_euler.z = rot; return o
    def touch_key(name, text, c, w, d, rot, on, size, dot=True):
        u, v = axes(rot); made = [outline("Key" + name, c, w, d, LIT if on else DIM, rot)]
        if on: made.append(pane("KeyFill" + name, c, w - 0.004, d - 0.004, FILL, rot))
        shift = u * (0.008 if dot else 0)
        made.append(label("KeyWord" + name, text, c.x + shift.x, c.y + shift.y, 0.002, size, rot, LIT if on else DIM))
        if dot: made.append(bead("KeyDot" + name, c - u * (w / 2 - 0.011) + Vector((0, 0, 0.002)), OK if on else DIM, 0.0028))
        return made
    def hexlight(name, color, strength, scale):
        m = bpy.data.materials.new(name); m.use_nodes = True; n = m.node_tree; n.nodes.remove(n.nodes["Principled BSDF"]); out = n.nodes["Material Output"]
        tc = n.nodes.new("ShaderNodeTexCoord"); vo = n.nodes.new("ShaderNodeTexVoronoi"); vo.feature = "DISTANCE_TO_EDGE"; vo.inputs["Scale"].default_value = scale
        n.links.new(tc.outputs["Object"], vo.inputs["Vector"])
        edge = n.nodes.new("ShaderNodeMath"); edge.operation = "LESS_THAN"; edge.inputs[1].default_value = 0.04; n.links.new(vo.outputs["Distance"], edge.inputs[0])
        fac = n.nodes.new("ShaderNodeMath"); fac.operation = "MULTIPLY_ADD"; fac.inputs[1].default_value = 0.7; fac.inputs[2].default_value = 0.07; n.links.new(edge.outputs[0], fac.inputs[0])
        em = n.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (*color, 1); em.inputs["Strength"].default_value = strength
        clear = n.nodes.new("ShaderNodeBsdfTransparent"); mix = n.nodes.new("ShaderNodeMixShader")
        n.links.new(fac.outputs[0], mix.inputs["Fac"]); n.links.new(clear.outputs["BSDF"], mix.inputs[1]); n.links.new(em.outputs["Emission"], mix.inputs[2]); n.links.new(mix.outputs["Shader"], out.inputs["Surface"]); return m
    def flat_ring(name, r, mat, depth, arc=(0, 2 * math.pi), z=0.0017):
        pts = [(JC[0] + r * math.cos(arc[0] + (arc[1] - arc[0]) * i / 200), JC[1] + r * math.sin(arc[0] + (arc[1] - arc[0]) * i / 200)) for i in range(201)]
        return line(name, pts, depth, mat, z=z)
    J = Vector((JC[0], JC[1], 0))
    # The paper drawing and its orange line leave with the paper.
    drawn = [o for o in bpy.data.objects if o.type == "CURVE" and o.data.materials and o.data.materials[0] in (GRAPHITE, PENCIL) and not o.name.startswith("Mark")]
    for o in drawn:
        for fr, hid in ((95, False), (96, True), (132, True), (133, False), (STOP0 - 10, False), (STOP0 - 9, True), (LAST - 9, True), (LAST - 8, False), (M0 + 8, False), (M0 + 9, True)):
            o.hide_render = hid; o.keyframe_insert("hide_render", frame=fr)
    for dial in HOLO:
        for fr, v in ((92, 0.0), (102, 1.0), (126, 1.0), (136, 0.0), (STOP0 - 18, 0.0), (STOP0 - 8, 1.0), (LAST - 12, 1.0), (LAST - 5, 0.0), (M0 + 4, 0.0), (M0 + 14, 1.0)):
            dial.outputs[0].default_value = v; dial.outputs[0].keyframe_insert("default_value", frame=fr)
    # The screen: a bezel line, the radar round the model, and the dock.
    guard.append(outline("Bezel", S(0, 0), *BEZEL, DIM, SR, 0.0005))
    RAD = 0.31 if PORTRAIT else 0.345
    guard += [flat_ring("Radar0", RAD, LIT, 0.0008), flat_ring("Radar1", RAD + 0.014, DIM, 0.0004), flat_ring("Radar2", 0.3, DIM, 0.0004)]
    for k in range(72):
        a = SR + k * math.pi / 36; d = Vector((math.cos(a), math.sin(a), 0)); guard.append(stroke(f"RadarTick{k}", J + d * RAD, J + d * (RAD + (0.014 if k % 9 == 0 else 0.007)), LIT if k % 9 == 0 else DIM, 0.0004))
        # Monitoring: the sweep of the radar.
    W0, W1 = math.radians(18), math.radians(62)
    bmw = bmesh.new(); hub = bmw.verts.new((0, 0, 0)); rimv = [bmw.verts.new((RAD * math.cos(W0 + (W1 - W0) * i / 24), RAD * math.sin(W0 + (W1 - W0) * i / 24), 0)) for i in range(25)]
    for a, b in zip(rimv, rimv[1:]): bmw.faces.new((hub, a, b))
    wm_ = bpy.data.meshes.new("Sweep"); bmw.to_mesh(wm_); bmw.free(); wedge = add(bpy.data.objects.new("RadarSweep", wm_)); wm_.materials.append(FILL); wedge.location = (JC[0], JC[1], 0.0011); guard.append(wedge)
    key(wedge, 96, rot=Euler((0, 0, 0))); key(wedge, 132, rot=Euler((0, 0, math.radians(-300))))
    guard.append(stroke("RadarHand", J, J + Vector((math.cos(W0), math.sin(W0), 0)) * RAD, LIT, 0.0008)); guard[-1].parent = None
    # The dock: the eight layers in the order they stand between the outside and the data.
    BUTTONS = [("Firewall", "FIREWALL"), ("Identity", "IDENTIDADE"), ("Uem", "UEM"), ("Edr", "EDR"), ("Servers", "SERVIDORES"), ("Backup", "BACKUP"), ("Monitor", "MONITORAMENTO"), ("Govern", "GOVERNANÇA")]
    DY = -0.425
    KW, KD, KT = (0.22, 0.1, 0.0165) if PORTRAIT else (0.132, 0.062, 0.0122)
    def keyc(k): return S((k % 4 - 1.5) * 0.235, -0.545 - (k // 4) * 0.115) if PORTRAIT else S((k - 3.5) * 0.142, DY)
    for k, (nm, text) in enumerate(BUTTONS):
        c = keyc(k); guard.append(outline("KeyBase" + nm, c, KW, KD, DIM, SR)); guard += touch_key(nm, text, c, KW, KD, SR, True, KT, dot=False); hot_add(120, nm.lower(), c, KW, KD, SR)
        if not PORTRAIT: kn = c - SU * (KW / 2 - 0.008) + SV * (KD / 2 + 0.009); guard.append(label("KeyNo" + nm, f"0{k + 1}", kn.x, kn.y, 0.002, 0.0095, SR, LIT, "LEFT"))
    DL, DR, DT = S2((-0.565, DY + 0.052), (-0.46, -0.455)), S2((0.565, DY + 0.052), (0.46, -0.455)), SV * (0.022 if PORTRAIT else 0.018)
    guard.append(stroke("DockLine", DL, DR, DIM, 0.0004))
    guard.append(label("DockTitle", "CAMADAS DE PROTEÇÃO", (DL + DT + SU * (0 if PORTRAIT else 0.365)).x, (DL + DT + SU * (0 if PORTRAIT else 0.365)).y, 0.002, 0.014, SR, LIT, "LEFT"))
    guard.append(label("DockCount", "8/8 ATIVAS", (DR + DT).x, (DR + DT).y, 0.002, 0.014, SR, OK, "RIGHT"))
    # Status, top left: the ring that closes when every layer is on.
    GC = S2((-0.555, -0.13), (-0.3, 0.57)); GR = 0.105
    for nm, r, mat, depth in (("GaugeTrack", GR + 0.012, DIM, 0.0004), ("GaugeRing", GR, OK, 0.0032)):
        guard.append(line(nm, [(GC.x + r * math.cos(i * math.pi / 60), GC.y + r * math.sin(i * math.pi / 60)) for i in range(120)], depth, mat, cyclic=True, z=0.002))
    guard.append(label("GaugeValue", "100%", (GC + SV * 0.014).x, (GC + SV * 0.014).y, 0.002, 0.052, SR, OK)); guard.append(label("GaugeWord", "PROTEGIDO", (GC - SV * 0.038).x, (GC - SV * 0.038).y, 0.002, 0.018, SR, OK))
    guard.append(label("GaugeTitle", "ESTADO DO AMBIENTE", (GC - SV * (GR + 0.04)).x, (GC - SV * (GR + 0.04)).y, 0.002, 0.0145, SR, LIT))
    gauges = {}
    for n in range(8):
        tone_g = LIT if n else BAD; made = []
        if n: made.append(line(f"G{n}Ring", [(GC.x + GR * math.cos(SR + math.pi / 2 - i * math.pi / 60), GC.y + GR * math.sin(SR + math.pi / 2 - i * math.pi / 60)) for i in range(int(120 * n / 8) + 1)], 0.0032, tone_g, z=0.002))
        made.append(label(f"G{n}Value", f"{round(n / 8 * 100)}%", (GC + SV * 0.014).x, (GC + SV * 0.014).y, 0.002, 0.052, SR, tone_g)); made.append(label(f"G{n}Word", "PARCIAL" if n else "EXPOSTO", (GC - SV * 0.038).x, (GC - SV * 0.038).y, 0.002, 0.018, SR, tone_g))
        made.append(label(f"G{n}Count", f"{n}/8 ATIVAS", (DR + DT).x, (DR + DT).y, 0.002, 0.014, SR, tone_g, "RIGHT"))
        for o in made: o.hide_render = True
        gauges[n] = made
    # Analysis, front right, close to the eye: what the system is watching, line by line.
    AC = S2((0.53, -0.14), (0.27, 0.57)); AW = 0.28; AD, AT, A0, AS = (0.3, 0.125, 0.082, 0.048) if PORTRAIT else (0.38, 0.16, 0.108, 0.062)
    guard.append(outline("AnalysisBox", AC, AW, AD, DIM, SR, 0.0005))
    q = AC - SU * (AW / 2 - 0.016) + SV * AT; guard.append(label("AnalysisTitle", "ANÁLISE DE SEGURANÇA", q.x, q.y, 0.002, 0.0145, SR, LIT, "LEFT"))
    for k, (text, value, part) in enumerate((("REDE", "FILTRADA", 1.0), ("IDENTIDADES", "MFA ATIVO", 1.0), ("DISPOSITIVOS", "12/12", 1.0), ("BACKUP", "HOJE 02:00", 1.0), ("ALERTAS", "0", 0.03))):
        row = AC + SV * (A0 - k * AS); l0, r0 = row - SU * (AW / 2 - 0.016), row + SU * (AW / 2 - 0.016)
        guard.append(label(f"AnalysisRow{k}", text, l0.x, l0.y, 0.002, 0.0125, SR, LIT, "LEFT")); guard.append(label(f"AnalysisValue{k}", value, r0.x, r0.y, 0.002, 0.0125, SR, OK, "RIGHT"))
        b0, b1 = l0 - SV * 0.021, r0 - SV * 0.021; guard.append(stroke(f"AnalysisTrack{k}", b0, b1, DIM, 0.0004)); guard.append(stroke(f"AnalysisBar{k}", b0, b0 + (b1 - b0) * part, OK, 0.0016))
    # Firewall: a wall of light closes round every block. What it stops ends there.
    WR, WH = 0.262, 0.07
    bpy.ops.mesh.primitive_cylinder_add(vertices=128, radius=WR, depth=WH, end_fill_type="NOTHING", location=(JC[0], JC[1], 0.001 + WH / 2)); fw = bpy.context.active_object; fw.name = "FireWall"
    fw.data.materials.append(hexlight("FireWallLight", AMBER, 7, 38)); fw.visible_shadow = False; guard.append(fw)
    for nm, z, minor in (("FireWallFoot", 0.002, 0.0016), ("FireWallTop", 0.001 + WH, 0.0011)):
        bpy.ops.mesh.primitive_torus_add(major_radius=WR, minor_radius=minor, major_segments=160, minor_segments=8, location=(JC[0], JC[1], z)); rim = bpy.context.active_object; rim.name = nm; rim.data.materials.append(LIT); rim.visible_shadow = False; guard.append(rim)
    for k, (a0, r0) in enumerate(((118, 0.47), (98, 0.46), (138, 0.48)) if PORTRAIT else ((172, 0.6), (150, 0.62), (128, 0.6))):
        d = Vector((math.cos(math.radians(a0)), math.sin(math.radians(a0)), 0)); q0, q1 = J + d * r0, J + d * (WR + 0.02)
        guard.append(stroke(f"ThreatPath{k}", q0, q1, emitter(f"ThreatTrail{k}", RED, 1.6), 0.0005)); guard.append(bead(f"Threat{k}", Vector((q1.x, q1.y, 0.005)), BAD, 0.0042)); THREAT_FROM[f"Threat{k}"] = Vector((q0.x, q0.y, 0.005))
    q = S2((-0.7, 0.36), (-0.47, 0.34)); guard.append(label("ThreatCount", "03", q.x, q.y, 0.002, 0.036, SR, BAD, "LEFT")); guard.append(label("ThreatWord", "AMEAÇAS BLOQUEADAS", (q - SV * 0.036).x, (q - SV * 0.036).y, 0.002, 0.012, SR, BAD, "LEFT"))
    # Identity: the only way in is a gate, and it opens to who proves who they are.
    for sx in (-1, 1): guard.append(rod(f"GatePost{sx}", J + SU * sx * 0.03 - SV * WR + Vector((0, 0, 0.001)), J + SU * sx * 0.03 - SV * WR + Vector((0, 0, WH + 0.02)), 0.0014, OK))
    guard.append(rod("GateBar", J - SU * 0.03 - SV * WR + Vector((0, 0, WH + 0.02)), J + SU * 0.03 - SV * WR + Vector((0, 0, WH + 0.02)), 0.0014, OK))
    # UEM: every block carries its seal.
    for k, o in enumerate(by("Top") + by("Mid") + by("Slab")): guard.append(bead(f"Seal{k}", Vector((o.location.x, o.location.y, o.location.z + o.scale.z / 2 + 0.004)), OK, 0.0024))
    # EDR: a second layer, the dome, right over the blocks.
    for t in shield_dials: t.outputs[0].default_value = 1.12
    guard += [dome, struts]
    # Servers: the platform under the model lights up.
    guard.append(flat_ring("ServerRing", 0.215, LIT, 0.0018)); guard.append(flat_ring("ServerRing2", 0.228, DIM, 0.0005))
    # Backup: one more block comes up on its own pad, tied to the model by a line of light but kept apart.
    BK = S2((0.5, 0.3), (0.37, 0.31))
    guard.append(box("Spare", BK.x, BK.y, 0.0008, 0.06, 0.068, 0.04, ORANGE)); guard[-1].rotation_euler.z = SR
    guard.append(outline("SparePad", BK, 0.12, 0.12, LIT, SR))
    bd = (BK - J).normalized(); guard.append(stroke("SpareLink", J + bd * (RAD + 0.03), BK - bd * 0.075, LIT, 0.0007))
    guard.append(label("SpareWord", "CÓPIA ISOLADA", (BK - SV * 0.082).x, (BK - SV * 0.082).y, 0.002, 0.013, SR, LIT))
    # Governance: the outer ring closes, in green, when everything else is in place.
    guard.append(flat_ring("GovernRing", RAD + 0.03, OK, 0.0014))
    LAYER_PARTS = {"Firewall": ("FireWall", "Threat", "AnalysisValue0", "AnalysisBar0"), "Identity": ("Gate", "AnalysisValue1", "AnalysisBar1"), "Uem": ("Seal", "AnalysisValue2", "AnalysisBar2"), "Edr": ("Shield",),
                   "Servers": ("ServerRing",), "Backup": ("Spare", "AnalysisValue3", "AnalysisBar3"), "Monitor": ("RadarSweep", "RadarHand", "AnalysisValue4", "AnalysisBar4"), "Govern": ("GovernRing",)}
    FULL_PARTS = ("GaugeRing", "GaugeValue", "GaugeWord", "DockCount")
    def armed(o): return o.name in FULL_PARTS or any(o.name.startswith(pre) for pres in LAYER_PARTS.values() for pre in pres) or any(o.name in ("Key" + nm, "KeyFill" + nm) for nm in LAYER_PARTS)
    for i, o in enumerate(guard): appear(o, 121 if armed(o) else 96 + int(15 * i / len(guard))); vanish(o, 132 - int(4 * (1 - i / len(guard))))
    for o in gauges[0]: appear(o, 106); vanish(o, 121)
    for fr, v in ((88, -2.0), (104, 2.0), (126, 2.0), (140, -2.0), (STOP0 - 20, -2.0), (STOP0 - 7, 2.0), (LAST - 14, 2.0), (LAST - 4, -2.0), (M0, -2.0)):
        SWEEP.outputs[0].default_value = v; SWEEP.outputs[0].keyframe_insert("default_value", frame=fr)
    # The last view turns into the touch table under one more sweep, at an even pace, with a bar of light on its edge.
    SW0, SW1, SX0, SX1 = M0 + 2, M0 + 15, -0.8, 0.84
    def sweep_at(x): return SW0 + (min(max(x, SX0), SX1) - SX0) / (SX1 - SX0) * (SW1 - SW0)
    def centre_x(o): return sum((o.matrix_world @ Vector(c)).x for c in o.bound_box) / 8
    interp("LINEAR")
    for fr, v in ((M0 + 1, SX0 - 0.02), (SW0, SX0), (SW1, SX1), (SW1 + 1, 2.0)):
        SWEEP.outputs[0].default_value = v; SWEEP.outputs[0].keyframe_insert("default_value", frame=fr)
    migbar = box("MigBar", SX0, 0.02, 0.0012, 0.006, 1.03, 0.0012, emitter("MigLight", AMBER, 34), bevel=0, wobble=0); migbar.visible_shadow = False
    key(migbar, SW0, Vector((SX0, 0.02, 0.0012))); key(migbar, SW1, Vector((SX1, 0.02, 0.0012))); appear(migbar, SW0); vanish(migbar, SW1 + 1)
    interp("BEZIER")

    # Orquestro: the model puts itself together. Its upper pieces come off and wait in rows at the start of a lane drawn
    # round the model. Then they flow along it one after another, past each skill written beside the lane, through the
    # brass hoop where the work is checked, and home. The orange keystone goes last: that is the approval.
    named = {o.name: o for o in maquette}
    ORDER = ["Mid0", "Mid1", "Mid2", "Plinth", "Mid3", "Mid4"] + [o.name for o in maquette if o.name.startswith("Column")] + ["Lintel", "SlabA", "SlabB", "SlabC", "Top0", "Top1", "Top2"] + [f"StairC{i}" for i in range(5)] + ["Keystone"]
    VIEW = math.radians(-54); TR = VIEW + math.pi / 2
    def polar(r, a, z=0.0): return Vector((JC[0] + r * math.cos(math.radians(a)), JC[1] + r * math.sin(math.radians(a)), z))
    SKILLS = ["BRIEFING", "CONTEXTO", "IMPLEMENTAR", "VERIFICAR", "REVISAR", "APROVAR"]
    LR = 0.34; STATIONS = [-146 + k * 24 for k in range(6)]; HOOP_Z = 0.074
    faces, work = [], []
    work.append(circle("Lane", JC[0], JC[1], LR, depth=0.0007, arc=(math.radians(-170), math.radians(STATIONS[-1]))))
    for k, (skill, a) in enumerate(zip(SKILLS, STATIONS)):
        q = polar(LR + 0.075, a); faces.append(Vector((q.x, q.y, 0.002)))
        work.append(label("Skill" + skill, skill, q.x, q.y, 0.0016, 0.021, TR, GRAPHITE))
        t0, t1 = polar(LR - 0.012, a), polar(LR + 0.012, a); work.append(line(f"Tick{k}", [(t0.x, t0.y), (t1.x, t1.y)], 0.0005, GRAPHITE))
    HA = STATIONS[3]
    bpy.ops.mesh.primitive_torus_add(major_radius=0.066, minor_radius=0.0032, major_segments=96, minor_segments=14, location=polar(LR, HA, HOOP_Z)); hoop = bpy.context.active_object; hoop.name = "Hoop"
    hoop.rotation_euler = Euler((math.pi / 2, 0, math.radians(HA))); hoop.data.materials.append(BRASS); work.append(hoop)
    for pl in hoop.data.polygons: pl.use_smooth = True
    foot = box("HoopFoot", polar(LR, HA).x, polar(LR, HA).y, 0.0008, 0.07, 0.018, 0.0075, BRASS, bevel=0.001, wobble=0); foot.rotation_euler.z = math.radians(HA); work.append(foot)
    for j, nm in enumerate(ORDER):
        o = named[nm]; home, rot = o.location.copy(), o.rotation_euler.copy()
        rest_z = 0.0008 if nm.startswith("Column") else 0.0008 + o.scale.z / 2
        pile = polar(0.3 + (j // 6) * 0.07, -176 + (j % 6) * 11 - (j // 6) * 2, rest_z)
        key(o, 126, home, rot); key(o, 133 + j * 0.3, home + Vector((0, 0, 0.11)), rot); key(o, 141 + j * 0.25, pile, rot)
        t0 = 147 + j * 1.25; key(o, t0, pile, rot)
        key(o, t0 + 2, polar(LR, -160, 0.05), rot)
        for n, a in enumerate(STATIONS): key(o, t0 + 4 + n * 1.9, polar(LR, a, HOOP_Z - (0 if nm.startswith("Column") else o.scale.z / 2) * 0.5 if n == 3 else 0.055), rot)
        key(o, t0 + 15.5, home + Vector((0, 0, 0.09)) + (polar(LR, STATIONS[-1]) - Vector((JC[0], JC[1], 0))) * 0.25, rot); key(o, t0 + 17.5, home, rot)
    note = polar(0.42, 40); NR = TR + math.radians(4)
    work.append(box("StatsNote", note.x, note.y, 0.0008, 0.25, 0.14, 0.0005, CARD, bevel=0, wobble=0)); work[-1].rotation_euler.z = NR
    for k, (text, size) in enumerate((("AUTONOMIA · PRATICIDADE", 0.0125), ("GOVERNANÇA · SEGURANÇA", 0.0125), ("24 agent skills", 0.0105), ("600+ commits com agentes", 0.0105), ("5.000+ testes", 0.0105))):
        off = Vector((-math.sin(NR), math.cos(NR), 0)) * (0.048 - k * 0.024)
        work.append(label(f"Stat{k}", text, note.x + off.x, note.y + off.y, 0.0016, size, NR))
    for i, o in enumerate(work): appear(o, 138); vanish(o, 193 + int(5 * i / len(work)))
    CORE_AT = faces[5]; PYR = polar(LR, HA, 0.0008)
    for i, pw in enumerate(pawns):  # the brass figures leave the table before the second act and stay away
        wait = Vector((CX - 0.19 + i * 0.076, CY - 0.255, 0.0008)); post = Vector((wait.x * 1.5, CY - 0.62, 0.0008))
        key(pw, 1, wait); key(pw, 80 + i, wait); key(pw, 85 + i, (wait + post) / 2 + Vector((0, 0, 0.04))); key(pw, 90 + i, post); vanish(pw, 96)
    # The containers of the project stops wait in a neat stack beside the model, and leave with the last stop.
    CH = CONTAINER[2]; docks = []; base_scale = Vector(CONTAINER)
    for i, c in enumerate(containers):
        docks.append(Vector((CX - 0.42 + (i % 3) * 0.074, CY - 0.13, 0.0008 + (1 - i // 3) * (CH + 0.0006) + CH / 2)))
        c.location = docks[i]; c.rotation_euler = Euler((0, 0, 0)); c.scale = base_scale
        if i < len(PROJECTS): grow(c, 186 + i, 194 + i); key(c, 196, docks[i], Euler((0, 0, 0)), scale=base_scale); vanish(c, LAST - 12)

    # Three systems, one stop each, on the same touch table in the colour of each brand. The model steps aside: the
    # centre of the table shows the thing itself. Prumo: a plumb comes down on ninety days of price. Torvya: one tap on
    # an acrylic plate, and where it leads. Marcos Krep's: one order, from the customer's phone to the kitchen.
    WORKDIR = os.path.join(HERE, "..", "..", "..", "public", "work")
    # The model does not vanish: it shrinks to a small hologram docked in a corner of the screen, like a window put
    # away, and comes back to the centre for the last view. The instruments fold away and unfold the same way.
    root = add(bpy.data.objects.new("ModelRoot", None)); root.location = (JC[0], JC[1], 0); bpy.context.view_layer.update()
    for o in maquette + perimeter + rail:
        if o.parent is None: o.parent = root; o.matrix_parent_inverse = root.matrix_world.inverted()
    DOCKP = S2((0.6, 0.425), (0.38, 0.665), 0.004); one = Vector((1, 1, 1))
    key(root, STOP0 - 14, Vector((JC[0], JC[1], 0)), scale=one); key(root, STOP0 - 4, DOCKP, scale=one * 0.2)
    key(root, LAST - 22, DOCKP, scale=one * 0.2); key(root, LAST - 10, Vector((JC[0], JC[1], 0)), scale=one)
    for o in [x for x in bpy.data.objects if x.name.startswith("Pencil")]:
        for fr, hid in ((93, False), (94, True)) if PORTRAIT else ((STOP0 - 12, False), (STOP0 - 11, True), (LAST - 13, True), (LAST - 12, False)): o.hide_render = hid; o.keyframe_insert("hide_render", frame=fr)
    taken = set(maquette + perimeter + rail + work + pawns)
    for o in [x for x in bpy.data.objects if x.type in ('MESH', 'CURVE') and x.data.materials and x.data.materials[0] in (BRASS, STRING) and x not in taken]:
        full = o.scale.copy()
        key(o, STOP0 - 13, scale=full); key(o, STOP0 - 6, scale=full * 0.001); key(o, LAST - 16, scale=full * 0.001); key(o, LAST - 8, scale=full)
    if PORTRAIT:  # upright, the rule and the pencil would lie across the keys: they stay away once the table lights up
        for o in [x for x in bpy.data.objects if x.name == "Rule" or x.name.startswith("Mark")]:
            for fr, hid in ((93, False), (94, True)): o.hide_render = hid; o.keyframe_insert("hide_render", frame=fr)
        for o in [x for x in bpy.data.objects if x.type in ("MESH", "CURVE") and x.name != "Rule" and x.data.materials and x.data.materials[0] in (BRASS, STRING) and x not in taken]:
            for fr, hid in ((93, False), (94, True), (133, True), (134, False), (STOP0 - 10, False), (STOP0 - 9, True), (LAST - 15, True), (LAST - 14, False)): o.hide_render = hid; o.keyframe_insert("hide_render", frame=fr)
    TONES = []
    def tones(nm, c): TONES.append((emitter(nm + "Lit", c, 10), emitter(nm + "Dim", c, 2.2), emitter(nm + "Fill", c, 0.5), emitter(nm + "Body", c, 1.3))); return TONES[-1]
    def lab(nm, text, q, size, mat, align="CENTER"): return label(nm, text, q.x, q.y, 0.002, size, SR, mat, align)
    def soft_key(nm, text, c, w, d, on, size, L, D, F):
        made = [outline("SK" + nm, c, w, d, L if on else D, SR)]
        if on: made.append(pane("SKF" + nm, c, w - 0.004, d - 0.004, F, SR))
        made.append(lab("SKW" + nm, text, c, size, L)); return made
    def ring_at(nm, c, r, mat, depth): return line(nm, [(c.x + r * math.cos(i * math.pi / 40), c.y + r * math.sin(i * math.pi / 40)) for i in range(80)], depth, mat, cyclic=True, z=0.0017)
    def screen(nm, path, c, w, h, v0, glow=0.9):
        m = bpy.data.materials.new(nm); m.use_nodes = True; n2 = m.node_tree; tx = n2.nodes.new("ShaderNodeTexImage"); tx.image = image(path); b2 = n2.nodes["Principled BSDF"]
        n2.links.new(tx.outputs["Color"], b2.inputs["Base Color"]); n2.links.new(tx.outputs["Color"], b2.inputs["Emission Color"]); b2.inputs["Emission Strength"].default_value = glow
        bm2 = bmesh.new(); vs = [bm2.verts.new((sx * w / 2, sy * h / 2, 0)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]; f2 = bm2.faces.new(vs); uvl = bm2.loops.layers.uv.new()
        for l2, uv in zip(f2.loops, ((0, v0), (1, v0), (1, 1), (0, 1))): l2[uvl].uv = uv
        me = bpy.data.meshes.new(nm); bm2.to_mesh(me); bm2.free(); me.materials.append(m)
        o = add(bpy.data.objects.new(nm, me)); o.location = (c.x, c.y, 0.0016); o.rotation_euler.z = SR; return o
    def title_parts(nm, title, L):  # the apostrophe of this face sits in the middle of a wide cell: set what follows it by the measured width
        at = S2((-0.7, 0.425), (-0.46, 0.675)); out = []
        for n, part in enumerate(title.split("'")):
            o = lab(nm + f"Title{n}", ("'" if n else "") + part, at, 0.044, L, "LEFT"); out.append(o)
            bpy.context.view_layer.update(); at = at + SU * (o.dimensions.x + 0.044 * APOS_GAP)
        return out
    def header(nm, title, kind, L, D):
        return [outline(nm + "Bezel", S(0, 0), *BEZEL, D, SR, 0.0005), *title_parts(nm, title, L), lab(nm + "Kind", kind, S2((-0.7, 0.375), (-0.46, 0.628)), 0.013, L, "LEFT"),
                stroke(nm + "Rule", S2((-0.7, 0.35), (-0.46, 0.6)), S2((0.7, 0.35), (0.46, 0.6)), D, 0.0004), stroke(nm + "DockRule", S2((-0.7, -0.365), (-0.46, -0.53)), S2((0.7, -0.365), (0.46, -0.53)), D, 0.0004)]
    DKY = -0.64 if PORTRAIT else -0.425
    SKW, SKD, SKT = (0.3, 0.11, 0.0175) if PORTRAIT else (0.3, 0.06, 0.014)
    def skc(k): return S((k - 1) * 0.315, DKY) if PORTRAIT else S(-0.3 + k * 0.33, DKY)
    DKL = S2((-0.7, -0.425), (-0.46, -0.558))
    scenes = []

    # Prumo.
    L, D, F, B = tones("Prumo", PROJECTS[0][1]); sc = header("Prumo", "PRUMO", "INTELIGÊNCIA COMERCIAL · EM PRODUÇÃO", L, D)
    CW, CHT, C0 = (0.8, 0.4, S(-0.4, -0.22)) if PORTRAIT else (0.5, 0.36, S(-0.2, -0.25))
    sc += [stroke("PrumoAxisX", C0, C0 + SU * CW, L, 0.0006), stroke("PrumoAxisY", C0, C0 + SV * CHT, L, 0.0006)]
    for k in range(1, 5): sc.append(stroke(f"PrumoGrid{k}", C0 + SV * (CHT * k / 4), C0 + SU * CW + SV * (CHT * k / 4), D, 0.0003))
    sc.append(lab("PrumoChartTitle", "HISTÓRICO DE PREÇO · JANELA DE 90 DIAS", C0 + SV * (CHT + 0.03), 0.0125, L, "LEFT"))
    sc.append(lab("PrumoDay0", "HÁ 90 DIAS", C0 - SV * 0.02, 0.0115, L, "LEFT")); sc.append(lab("PrumoDay1", "HOJE", C0 + SU * CW - SV * 0.02, 0.0115, L, "RIGHT"))
    q = S2((-0.7, 0.27), (-0.46, 0.555)); sc.append(lab("PrumoPipe", "DO RUÍDO À OFERTA VERIFICADA", q, 0.013, L, "LEFT"))
    for k, text in enumerate(("COLETA", "NORMALIZAÇÃO", "HISTÓRICO", "AVALIAÇÃO", "VALIDAÇÃO", "DISTRIBUIÇÃO")):
        q = S(-0.44, 0.5 - k * 0.046) if PORTRAIT else S(-0.68, 0.2 - k * 0.075); sc.append(ring_at(f"PrumoStep{k}", q, 0.012, L, 0.0009)); sc.append(lab(f"PrumoStepNo{k}", str(k + 1), q, 0.011, L)); sc.append(lab(f"PrumoStepWord{k}", text, q + SU * 0.028, 0.013, L, "LEFT"))
        if k: sc.append(stroke(f"PrumoStepLink{k}", q + SV * 0.014, q + SV * (0.032 if PORTRAIT else 0.061), D, 0.0004))
    VC = S2((0.52, -0.06), (0.0, -0.39)); VW, VD = (0.72, 0.19) if PORTRAIT else (0.34, 0.2); CARD_AT = S2((0.52, 0.2), (0.3, 0.44))
    sc.append(lab("PrumoVerdictTitle", "VEREDITO", VC + SV * 0.066, 0.013, L))
    sc.append(screen("PrumoCard", os.path.join(WORKDIR, "prumo", "card-oferta-prumo.png"), CARD_AT, 0.2, 0.25, 0.0)); sc.append(outline("PrumoCardFrame", CARD_AT, 0.212, 0.262, L, SR, 0.0006))
    for k, text in enumerate(("24/7 COLETA DE PREÇOS", "8 ADAPTADORES DE LOJAS", "78 MIGRAÇÕES REVERSÍVEIS")): sc.append(lab(f"PrumoFact{k}", text, S(-0.13, 0.5 - k * 0.04) if PORTRAIT else S(0.36, -0.215 - k * 0.04), 0.012, L, "LEFT"))
    sc.append(lab("PrumoDock", "CENÁRIO", DKL, 0.013, L, "LEFT"))
    KEYS = ("MENOR PREÇO", "DESCONTO INFLADO", "HISTÓRICO CURTO")
    base_p = [0.62, 0.62, 0.7, 0.7, 0.66, 0.74, 0.74, 0.8, 0.72, 0.72, 0.68, 0.76, 0.76, 0.7, 0.64, 0.64, 0.7, 0.58, 0.58, 0.66, 0.66, 0.6, 0.52, 0.52, 0.6, 0.56, 0.48, 0.48, 0.4, 0.34]
    infl = [0.5, 0.5, 0.52, 0.52, 0.5, 0.5, 0.48, 0.5, 0.5, 0.52, 0.5, 0.5, 0.5, 0.48, 0.5, 0.5, 0.52, 0.5, 0.5, 0.5, 0.5, 0.52, 0.5, 0.62, 0.74, 0.84, 0.84, 0.84, 0.84, 0.5]
    SCEN = ((base_p, 0, "MENOR PREÇO", "DA JANELA OBSERVADA", OK, GREEN, True), (infl, 0, "DESCONTO INFLADO", "O PREÇO SUBIU ANTES DO DESCONTO", BAD, RED, True), (base_p, 27, "OBSERVAÇÃO RECENTE", "HISTÓRICO CURTO PARA COMPARAR", L, PROJECTS[0][1], False))
    pv = []
    for v, (prices, first, verdict, note, tone_v, rgb, has_low) in enumerate(SCEN):
        made = []; pts = []
        for i, val in enumerate(prices):
            if i >= first: pts += [C0 + SU * (i / len(prices) * CW) + SV * (val * CHT), C0 + SU * ((i + 1) / len(prices) * CW) + SV * (val * CHT)]
        made.append(line(f"PrumoPrice{v}", [(q.x, q.y) for q in pts], 0.0013, L, z=0.0018))
        for i in range(0, len(pts) // 2, 2): made.append(bead(f"PrumoObs{v}_{i}", Vector((pts[i * 2].x, pts[i * 2].y, 0.0024)), D, 0.0022))
        if has_low:
            low = C0 + SV * (min(prices) * CHT); made.append(stroke(f"PrumoLow{v}", low, low + SU * CW, OK, 0.0005)); made.append(lab(f"PrumoLowWord{v}", "MENOR OBSERVADO", low + SV * 0.016 + SU * 0.004, 0.0122, OK, "LEFT"))
        today = pts[-1]; made.append(ring_at(f"PrumoToday{v}", today, 0.016, tone_v, 0.0012)); made.append(bead(f"PrumoTodayDot{v}", Vector((today.x, today.y, 0.004)), tone_v, 0.005))
        made.append(rod(f"PrumoString{v}", Vector((today.x, today.y, 0.3)), Vector((today.x, today.y, 0.075)), 0.0007, STRING)); made.append(bead(f"PrumoHook{v}", Vector((today.x, today.y, 0.3)), L, 0.004))
        bob = lathe(f"PrumoBob{v}", [(0, 0), (0.003, 0.008), (0.011, 0.03), (0.0135, 0.043), (0.009, 0.053), (0.0035, 0.059), (0.0035, 0.064), (0, 0.065)], BRASS, 48); bob.location = (today.x, today.y, 0.012); made.append(bob)
        made.append(outline(f"PrumoVerdictBox{v}", VC, VW, VD, tone_v, SR, 0.0008)); made.append(pane(f"PrumoVerdictFill{v}", VC, VW - 0.004, VD - 0.004, emitter(f"PrumoVerdictTone{v}", rgb, 0.25), SR))
        made.append(lab(f"PrumoVerdict{v}", verdict, VC + SV * 0.012, 0.026, tone_v)); made.append(lab(f"PrumoVerdictNote{v}", note, VC - SV * 0.04, 0.0105, tone_v))
        for k, text in enumerate(KEYS):
            made += soft_key(f"Prumo{v}_{k}", text, skc(k), SKW, SKD, k == v, SKT, L, D, F)
            if v == 0: hot_add(STOPS[0], f"k{k}", skc(k), SKW, SKD, SR)
        pv.append(made)
    scenes.append(sc); variants = [pv]

    # Torvya.
    L, D, F, B = tones("Torvya", (0.2, 0.27, 1.0)); sc = header("Torvya", "TORVYA", "PRODUTOS NFC E QR · PRODUTO PÚBLICO", L, D)
    PQ = S2((-0.26, 0.02), (0.0, 0.3)); PS = 0.21; FD = -SV if PORTRAIT else SU
    plate = box("TorvyaPlate", PQ.x, PQ.y, 0.014, PS, 0.008, PS, B, bevel=0.002, wobble=0); plate.rotation_euler.z = SR; sc.append(plate)
    foot = box("TorvyaFoot", PQ.x, PQ.y, 0.0012, PS + 0.03, 0.05, 0.013, F, bevel=0.002, wobble=0); foot.rotation_euler.z = SR; sc.append(foot)
    face = PQ - SV * 0.0055
    for i in range(9):
        for j in range(9):
            if (i * 7 + j * 13 + i * j) % 3 == 0 or (i < 3 and j > 5) or (i > 5 and j > 5) or (i < 3 and j < 3):
                q = face + SU * ((i - 4) * 0.0122); cell = box(f"TorvyaQr{i}{j}", q.x, q.y, 0.014 + PS * 0.36 + j * 0.0122, 0.0115, 0.002, 0.013, L, bevel=0, wobble=0); cell.rotation_euler.z = SR; sc.append(cell)
    word = label("TorvyaPlateWord", "TORVYA", face.x, face.y - 0.001, 0.014 + PS * 0.2, 0.024, SR, L); word.rotation_euler = Euler((math.pi / 2, 0, SR)); sc.append(word)
    tap = label("TorvyaPlateTap", "APROXIME OU ESCANEIE", face.x, face.y - 0.001, 0.014 + PS * 0.08, 0.0095, SR, L); tap.rotation_euler = Euler((math.pi / 2, 0, SR)); sc.append(tap)
    PH = PQ + SU * 0.19 - SV * 0.13; phone = box("TorvyaPhone", PH.x, PH.y, 0.05, 0.085, 0.009, 0.17, B, bevel=0.004, wobble=0); phone.rotation_euler = Euler((math.radians(-58), 0, SR + math.radians(38))); sc.append(phone)
    for k, r in enumerate((0.03, 0.052, 0.074)):
        bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=0.0013, major_segments=72, minor_segments=8, location=(PQ - SV * (0.04 + k * 0.026)) + Vector((0, 0, 0.15))); w = bpy.context.active_object; w.name = f"TorvyaWave{k}"
        w.rotation_euler = Euler((math.pi / 2, 0, SR)); w.data.materials.append(L); w.visible_shadow = False; sc.append(w)
    bpy.context.view_layer.update()
    for o in [x for x in sc if x.name.startswith(("TorvyaQr", "TorvyaPlateWord", "TorvyaPlateTap"))]: o.parent = plate; o.matrix_parent_inverse = plate.matrix_world.inverted()
    plate.rotation_euler = Euler((math.radians(-42), 0, SR)); plate.location.z = 0.006 + PS / 2 * math.cos(math.radians(42)); foot.location = (PQ + SV * 0.075).to_tuple()[:2] + (foot.location.z,)
    pc, hc = Vector((PQ.x, PQ.y, 0.085)), Vector((PH.x, PH.y, 0.135)); aimq = (hc - pc).normalized().to_track_quat('Z', 'Y').to_euler()
    for k, w in enumerate([x for x in sc if x.name.startswith("TorvyaWave")]): w.location = pc.lerp(hc, 0.3 + k * 0.2); w.rotation_euler = aimq
    N1 = S2((0.08, 0.02), (0.0, 0.0)); sc.append(stroke("TorvyaLinkA", PQ + FD * (PS / 2 + 0.03), N1 - FD * 0.062, L, 0.0009)); sc.append(ring_at("TorvyaNode", N1, 0.06, L, 0.0012)); sc.append(ring_at("TorvyaNode2", N1, 0.072, D, 0.0004))
    sc.append(lab("TorvyaNodeWord", "CÓDIGO", N1 + SV * 0.01, 0.014, L)); sc.append(lab("TorvyaNodeWord2", "ÚNICO", N1 - SV * 0.014, 0.014, L)); sc.append(lab("TorvyaNodeNote", "RESOLVIDO NA BORDA", N1 - SV * 0.1, 0.012, L))
    DC = S2((0.5, 0.02), (0.0, -0.31)); sc.append(stroke("TorvyaLinkB", N1 + FD * 0.062, DC - FD * (0.15 if PORTRAIT else 0.19), L, 0.0009)); sc.append(outline("TorvyaDestBox", DC, 0.38, 0.3, L, SR, 0.0008))
    sc.append(lab("TorvyaDestTitle", "DESTINO DEFINIDO NO PAINEL", DC - SU * 0.17 + SV * 0.115, 0.013, L, "LEFT"))
    for k, text in enumerate(("100 × 100 MM", "NFC + QR", "CÓDIGO ÚNICO POR PLACA", "TORVYA REVIEW", "TORVYA CONNECT")): sc.append(lab(f"TorvyaSpec{k}", text, S(-0.46 if PORTRAIT else -0.7, (0.52 if PORTRAIT else 0.27) - k * 0.045 - (0.03 if k > 2 else 0)), 0.0125, L, "LEFT"))
    sc.append(lab("TorvyaSame", "MESMA PLACA, MESMO CÓDIGO. SÓ O DESTINO MUDA.", S2((0, -0.31), (0, -0.497)), 0.0155, L))
    sc.append(lab("TorvyaDock", "DESTINO", DKL, 0.013, L, "LEFT"))
    tv = []
    for v in range(3):
        made = []
        for k, text in enumerate(("PÁGINA DE AVALIAÇÕES", "CENTRAL DE LINKS", "PÁGINA DE CAMPANHA")):
            row = DC + SV * (0.05 - k * 0.07); made.append(outline(f"TorvyaDest{v}_{k}", row, 0.34, 0.054, L if k == v else D, SR, 0.0006)); made.append(lab(f"TorvyaDestWord{v}_{k}", text, row - SU * 0.135, 0.0135, L, "LEFT"))
            if k == v: made.append(pane(f"TorvyaDestFill{v}", row, 0.336, 0.05, F, SR)); made.append(bead(f"TorvyaDestDot{v}", Vector((row.x, row.y, 0.003)) + SU * 0.15, OK, 0.004))
        for k, text in enumerate(("AVALIAÇÕES", "LINKS", "CAMPANHA")):
            made += soft_key(f"Torvya{v}_{k}", text, skc(k), SKW, SKD, k == v, SKT, L, D, F)
            if v == 0: hot_add(STOPS[1], f"k{k}", skc(k), SKW, SKD, SR)
        tv.append(made)
    scenes.append(sc); variants.append(tv)

    # Marcos Krep's.
    L, D, F, B = tones("Kreps", PROJECTS[2][1]); sc = header("Kreps", "MARCOS KREP'S", "PONTO DE VENDA E OPERAÇÕES · SISTEMA PARA CLIENTE", L, D)
    STATES = ("AGUARDANDO PAGAMENTO", "NA FILA", "PRONTO PARCIAL", "PRONTO", "SAIU PARA ENTREGA", "ENTREGUE"); SY = -0.14
    ST = 0.3 if PORTRAIT else 0.22
    def st(k): return S(-0.3 + (k % 3) * 0.3, 0.0 - (k // 3) * 0.24) if PORTRAIT else S(-0.55 + k * 0.22, SY)
    for k, text in enumerate(STATES): sc.append(lab(f"KrepsStateWord{k}", text, st(k) - SV * 0.068, 0.0122, L))
    sc.append(lab("KrepsFlowTitle", "UM PEDIDO, ACOMPANHADO EM CADA ESTADO", S2((-0.59, SY + 0.085), (-0.46, 0.1)), 0.0125, L, "LEFT"))
    for k, (text, name, v0, x) in enumerate((("CARDÁPIO ONLINE", "menu.png", 1 - 780 / 2081, -0.6), ("CHECKOUT COM PIX", "pagamento.png", 1 - 780 / 1036, -0.44))):
        c = S(x + 0.23, 0.4) if PORTRAIT else S(x, 0.17); sc.append(screen(f"KrepsShot{k}", os.path.join(WORKDIR, "kreps", name), c, 0.12, 0.24, v0)); sc.append(outline(f"KrepsShotFrame{k}", c, 0.13, 0.25, L, SR, 0.0008)); sc.append(lab(f"KrepsShotWord{k}", text, c - SV * 0.145, 0.0118, L))
    sc.append(lab("KrepsShotNote", "INTERFACE REAL, DADOS DE TESTE", S2((-0.52, 0.32), (-0.29, 0.555)), 0.0118, L))
    PRN = S2((0.5, 0.17), (0.28, 0.4))
    body = box("KrepsPrinter", PRN.x, PRN.y, 0.0012, 0.17, 0.13, 0.085, B, bevel=0.006, wobble=0); body.rotation_euler.z = SR; sc.append(body)
    sc.append(outline("KrepsPrinterPad", PRN, 0.24, 0.2, L, SR, 0.0006)); sc.append(lab("KrepsPrinterWord", "COZINHA · IMPRESSÃO DO TÍQUETE", PRN - SV * 0.125, 0.0122, L))
    for k, (title, text) in enumerate((("PAGAMENTO", "PIX E CARTÃO · PREÇOS RECALCULADOS NO SERVIDOR"), ("ACESSO", "ADMINISTRADOR · ATENDENTE · ENTREGADOR"))):
        q = S(-0.46 + k * 0.48, 0.215) if PORTRAIT else S(-0.18, 0.27 - k * 0.075); sc.append(lab(f"KrepsPoint{k}", title, q, 0.0125, L, "LEFT")); sc.append(lab(f"KrepsPointText{k}", text, q - SV * 0.026, 0.0118, L, "LEFT"))
    kv = []
    for v in range(6):
        made = []
        for k in range(6):
            q = st(k); done = k <= v; tone_k = (OK if k < v else L) if done else D
            made.append(ring_at(f"KrepsState{v}_{k}", q, 0.04, tone_k, 0.0016 if done else 0.0006)); made.append(lab(f"KrepsStateNo{v}_{k}", str(k + 1), q, 0.026, tone_k))
            if k and not (PORTRAIT and k == 3): made.append(stroke(f"KrepsStateLink{v}_{k}", q - SU * (ST - 0.04), q - SU * 0.042, OK if k <= v else D, 0.0012 if k <= v else 0.0005))
            if PORTRAIT and k == 3:
                p2 = st(2); made.append(line(f"KrepsStateTurn{v}", [((p2 - SV * 0.1).x, (p2 - SV * 0.1).y), ((p2 - SV * 0.135).x, (p2 - SV * 0.135).y), ((q + SV * 0.105).x, (q + SV * 0.105).y), ((q + SV * 0.042).x, (q + SV * 0.042).y)], 0.0012 if k <= v else 0.0005, OK if k <= v else D, z=0.0017))
            if k == v:
                made.append(pane(f"KrepsStateFill{v}", q, 0.11, 0.11, F, SR))
                t = box(f"KrepsTicket{v}", q.x, q.y, 0.07, 0.07, 0.002, 0.1, B, bevel=0, wobble=0); t.rotation_euler = Euler((math.radians(-58 if PORTRAIT else -14), 0, SR)); made.append(t)
                for n in range(5):
                    ln = box(f"KrepsTicketLine{v}_{n}", (q - SV * 0.003).x, (q - SV * 0.003).y + n * 0.0042, 0.15 - n * 0.016, 0.05 - (n % 2) * 0.014, 0.0012, 0.004, L, bevel=0, wobble=0); ln.rotation_euler = Euler((math.radians(-14), 0, SR)); ln.hide_render = PORTRAIT; made.append(ln) if not PORTRAIT else None
        if v >= 1:  # once paid, the kitchen has its ticket
            slipo = box(f"KrepsPrinterSlip{v}", (PRN - SV * 0.05).x, (PRN - SV * 0.05).y, 0.06, 0.075, 0.0015, 0.085, L, bevel=0, wobble=0); slipo.rotation_euler = Euler((math.radians(-60 if PORTRAIT else -28), 0, SR)); made.append(slipo)
        made.append(lab(f"KrepsDock{v}", f"PEDIDO {v + 1}/6", DKL, 0.013, L, "LEFT"))
        for k, text in enumerate(("VOLTAR", "AVANÇAR PEDIDO", "NOVO PEDIDO")):
            made += soft_key(f"Kreps{v}_{k}", text, skc(k), SKW, SKD, k == 1, SKT, L, D, F)
            if v == 0: hot_add(STOPS[2], f"k{k}", skc(k), SKW, SKD, SR)
        kv.append(made)
    scenes.append(sc); variants.append(kv)
    DEFAULTS = (0, 0, 3)

    for k, (S0, sc) in enumerate(zip(STOPS, scenes)):
        last = k == len(scenes) - 1; shown = sc + variants[k][DEFAULTS[k]]
        for i, o in enumerate(shown): appear(o, S0 - 11 + int(9 * i / len(shown))); vanish(o, (LAST - 19 if last else S0 + 15) - int(5 * (1 - i / len(shown))))
        for v, made in enumerate(variants[k]):
            if v != DEFAULTS[k]:
                for o in made: o.hide_render = True
    def fade(mat, keys):
        power = mat.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]; full = power.default_value
        for fr, part in keys: power.default_value = full * part; power.keyframe_insert("default_value", frame=fr)
        power.default_value = full
    stop_keys = [k for i, S0 in enumerate(STOPS) for k in ((S0 - 12, 0.0), (S0 - 3, 1.0), (LAST - 24 if i == len(STOPS) - 1 else S0 + 9, 1.0), (LAST - 18 if i == len(STOPS) - 1 else S0 + 15, 0.0))]
    act_keys = [(95, 0.0), (105, 1.0), (126, 1.0), (133, 0.0)]; end_keys = [(M0 + 1, 0.0), (M0 + 2, 1.0)]
    for mat in (LIT, DIM, FILL, OKDIM): fade(mat, act_keys + end_keys)
    for mat in (OK, BAD): fade(mat, act_keys + stop_keys + end_keys)
    for i, set_ in enumerate(TONES):
        for mat in set_: fade(mat, stop_keys[i * 4:i * 4 + 4])
    for kk, em in HOLO_EM.items():
        if kk.lower().startswith(("brass", "string", "ceramic")):
            own = tuple(em.inputs["Color"].default_value[:3])
            for fr, c in [(STOP0 - 14, own)] + [(S0 + d, a) for S0, a in zip(STOPS, (PROJECTS[0][1], (0.2, 0.27, 1.0), PROJECTS[2][1])) for d in (-8, 12)] + [(LAST - 14, own)]:
                em.inputs["Color"].default_value = (*c, 1); em.inputs["Color"].keyframe_insert("default_value", frame=fr)

    # The last view: who made the table, in papers lying on it. Each is a link on the page, where it lies.
    papers = []
    def photo(x, y, w, h, rot, glow=0.0):
        m = bpy.data.materials.new("Photo"); m.use_nodes = True; nt2 = m.node_tree; tx = nt2.nodes.new("ShaderNodeTexImage")
        tx.image = image(os.path.join(HERE, "..", "..", "..", "public", "identity", "portrait.jpg")); nt2.links.new(tx.outputs["Color"], nt2.nodes["Principled BSDF"].inputs["Base Color"]); nt2.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.55
        nt2.links.new(tx.outputs["Color"], nt2.nodes["Principled BSDF"].inputs["Emission Color"]); power = nt2.nodes["Principled BSDF"].inputs["Emission Strength"]
        for fr, v in ((M0 + 6, 0.0), (M0 + 15, glow)): power.default_value = v; power.keyframe_insert("default_value", frame=fr)
        bm2 = bmesh.new(); vs = [bm2.verts.new((sx * w / 2, sy * h / 2, 0)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]; f2 = bm2.faces.new(vs); uvl = bm2.loops.layers.uv.new()
        for l2, uv in zip(f2.loops, ((0.16, 0.34), (0.84, 0.34), (0.84, 0.99), (0.16, 0.99))): l2[uvl].uv = uv
        me = bpy.data.meshes.new("PhotoPrint"); bm2.to_mesh(me); bm2.free(); me.materials.append(m)
        o = add(bpy.data.objects.new("PhotoPrint", me)); o.location = (x, y, 0.0015); o.rotation_euler.z = rot
        mount = box("PhotoMount", x, y, 0.0008, w + 0.016, h + 0.016, 0.0005, plain("PhotoPaper", (0.9, 0.88, 0.84), 0.6), bevel=0, wobble=0); mount.rotation_euler.z = rot
        for q in (o, mount): key(q, M0 + 5, rot=Euler((0, 0, rot))); key(q, M0 + 13, rot=Euler((0, 0, 0)))
        return [o, mount]
    r5 = math.radians
    if PORTRAIT:
        papers += photo(CX - 0.2, CY + 0.38, 0.16, 0.2, r5(-4), 1.1)
        papers += slip("NameCard", "EMANUEL ARAÚJO", CX + 0.14, CY + 0.41, 0.28, 0.056, r5(3), 0.02)
        papers += slip("RoleCard", "TI · IA · SEGURANÇA", CX + 0.14, CY + 0.345, 0.28, 0.04, r5(1), 0.0125)
        tags = [("E-MAIL", -0.17, -0.235), ("LINKEDIN", 0.17, -0.235), ("GITHUB", -0.17, -0.3), ("ARTIGOS", 0.17, -0.3), ("NOTION · SKILLS", -0.17, -0.365), ("ATUALIZAÇÕES", 0.17, -0.365)]
        chips = [(-0.265, -0.445), (-0.018, -0.445), (0.229, -0.445)]
    else:
        papers += photo(CX - 0.445, CY - 0.07, 0.19, 0.228, r5(-4), 1.1)
        papers += slip("NameCard", "EMANUEL ARAÚJO", CX - 0.445, CY - 0.238, 0.24, 0.046, r5(2), 0.0175)
        papers += slip("RoleCard", "TI · IA · SEGURANÇA", CX - 0.445, CY - 0.288, 0.24, 0.032, r5(-1), 0.0108)
        tags = [("E-MAIL", 0.36, 0.17), ("LINKEDIN", 0.39, 0.11), ("GITHUB", 0.365, 0.05), ("ARTIGOS", 0.39, -0.01), ("NOTION · SKILLS", 0.37, -0.07), ("ATUALIZAÇÕES", 0.39, -0.13)]
        chips = [(-0.01, -0.262), (0.2, -0.262), (0.41, -0.262)]
    lights_end = []
    PH_AT, PH_SIZE = (Vector((CX - 0.2, CY + 0.38, 0)), (0.16, 0.2)) if PORTRAIT else (Vector((CX - 0.445, CY - 0.07, 0)), (0.19, 0.228))
    TKW, TKD = (0.25, 0.052) if PORTRAIT else (0.22, 0.046)
    def tkey(k): return Vector((CX + tags[k][1], CY + tags[k][2], 0)) if PORTRAIT else Vector((CX + 0.385, CY + 0.17 - k * 0.062, 0))
    for fr in (LAST, END2):
        hot_add(fr, "model", Vector((JC[0], JC[1], 0)), 0.3, 0.3, 0); hot_add(fr, "photo", PH_AT, PH_SIZE[0], PH_SIZE[1], 0)
        for k, (x, y) in enumerate(chips): hot_add(fr, f"chip{k}", Vector((CX + x + 0.018, CY + y, 0)), 0.2, 0.05, 0)
    for k, (text, x, y) in enumerate(tags): hot_add(LAST, f"link{k}", Vector((CX + x, CY + y, 0)), 0.2, 0.042, 0); hot_add(END2, f"link{k}", tkey(k), TKW, TKD, 0)
    if True:
        for o in perimeter: vanish(o, M0 + 9)
        ER = 0.225
        NAME_AT = Vector((CX + 0.14, CY + 0.4, 0)) if PORTRAIT else Vector((CX - 0.445, CY - 0.232, 0))
        lights_end.append(label("NameLight", "EMANUEL ARAÚJO", NAME_AT.x, NAME_AT.y, 0.002, 0.024, 0, LIT)); lights_end.append(label("RoleLight", "TI · IA · SEGURANÇA", NAME_AT.x, NAME_AT.y - 0.04, 0.002, 0.012, 0, LIT))
        PC = PH_AT; lights_end.append(outline("PhotoLight", PC, PH_SIZE[0] + 0.024, PH_SIZE[1] + 0.024, LIT, 0))
        for sx in (-1, 1):
            for sy in (-1, 1):
                c0 = PC + Vector((sx * (PH_SIZE[0] / 2 + 0.027), sy * (PH_SIZE[1] / 2 + 0.027), 0)); lights_end.append(line(f"PhotoCorner{sx}{sy}", [(c0.x - sx * 0.03, c0.y), (c0.x, c0.y), (c0.x, c0.y - sy * 0.03)], 0.0011, LIT, z=0.0017))
        lights_end += [flat_ring("EndRadar0", ER, LIT, 0.001), flat_ring("EndRadar1", ER + 0.014, DIM, 0.0004)]
        for k in range(72):
            a = k * math.pi / 36; d = Vector((math.cos(a), math.sin(a), 0)); lights_end.append(stroke(f"EndTick{k}", J + d * ER, J + d * (ER + (0.014 if k % 9 == 0 else 0.007)), LIT if k % 9 == 0 else DIM, 0.0004))
        sw = add(bpy.data.objects.new("EndSweep", wm_)); sw.scale = (ER / RAD,) * 3; sw.location = (JC[0], JC[1], 0.0011); sw.rotation_euler.z = math.radians(95); lights_end.append(sw)
        def node(name, q): lights_end.append(bead(name, Vector((q.x, q.y, 0.0022)), LIT, 0.0026))
        for k, (text, x, y) in enumerate(tags):
            c = tkey(k); lights_end += touch_key(f"End{k}", text, c, TKW, TKD, 0, k == 1, 0.0135)
            if not PORTRAIT:
                dy = c.y - JC[1]; q = Vector((JC[0] + math.sqrt(max((ER + 0.014) ** 2 - dy * dy, 0.0)), c.y, 0)); lights_end.append(stroke(f"EndTrace{k}", q, c - Vector((0.11, 0, 0)), DIM, 0.0005)); node(f"EndNode{k}", q)
        if not PORTRAIT:
            dy = PC.y - JC[1]; q = Vector((JC[0] - math.sqrt((ER + 0.014) ** 2 - dy * dy), PC.y, 0)); lights_end.append(stroke("PhotoTrace", PC + Vector((0.107, 0, 0)), q, DIM, 0.0005)); node("PhotoNode", q)
        for k, ((x, y), (nm, accent)) in enumerate(zip(chips, PROJECTS)):
            tone = emitter(f"EndTone{k}", accent, 6); c = Vector((CX + x + 0.018, CY + y, 0))
            lights_end.append(outline(f"EndChip{k}", c, 0.2, 0.05, tone, 0)); lights_end.append(label(f"EndChipWord{k}", {"prumo": "PRUMO", "torvya": "TORVYA", "kreps": "MARCOS KREP'S"}[nm], c.x, c.y, 0.002, 0.0135, 0, tone))
            if not PORTRAIT:
                a = math.radians(-90 + k * 14); q = J + Vector((math.cos(a), math.sin(a), 0)) * (ER + 0.014); top = c + Vector((0, 0.025, 0))
                lights_end.append(line(f"ChipTrace{k}", [(top.x, top.y), (top.x, top.y + 0.012), (q.x, q.y)], 0.0005, tone, z=0.0017))
        bpy.context.view_layer.update()
        for o in lights_end: appear(o, int(sweep_at(centre_x(o))) + 1)
    for k, (text, x, y) in enumerate(tags): papers += slip(f"Link{k}", text, CX + x, CY + y, 0.2, 0.042, r5((k % 3 - 1) * 2.5), 0.015)
    for k, ((x, y), (nm, accent)) in enumerate(zip(chips, PROJECTS)):
        papers += slip(f"Chip{k}", {"prumo": "PRUMO", "torvya": "TORVYA", "kreps": "MARCOS KREP'S"}[nm], CX + x + 0.018, CY + y, 0.2, 0.05, r5((k - 1) * -2), 0.0135)
        papers.append(box(f"ChipTone{k}", CX + x - 0.075, CY + y, 0.0014, 0.026, 0.026, 0.0004, plain(f"Tone{k}", accent, 0.6), bevel=0, wobble=0))
    TC = Vector((CX, CY, 0)); bpy.context.view_layer.update()
    for o in papers:
        if not o.name.startswith("Photo"): vanish(o, int(sweep_at(centre_x(o))) + 1)  # each paper goes as the sweep reaches it; the photograph stays, lit
    for o in papers:  # the papers are dealt onto the table from outside, one after another round the sheet
        rest = o.location.copy(); d = Vector((rest.x - TC.x, rest.y - TC.y, 0)); ang = math.atan2(d.y, d.x); d = d.normalized() if d.length > 1e-4 else Vector((0, -1, 0))
        t0 = LAST - 18 + (ang + math.pi) / (2 * math.pi) * 6
        key(o, t0, rest + d * 0.9 + Vector((0, 0, 0.05))); key(o, t0 + 5, rest + d * 0.1 + Vector((0, 0, 0.03))); key(o, t0 + 8.5, rest); appear(o, int(t0))
    interp("BACK")
    for i, o in enumerate(perimeter): grow(o, 84 + i, 94 + i)
    interp("LINEAR")
    interp("BEZIER")
    def slide(objs, delta):  # the instruments make room, and come back for the last view
        for o in objs:
            home = o.location.copy(); key(o, 82, home); key(o, 96, home + delta)
    slide([o for o in bpy.data.objects if o.name == "Rule" or o.name.startswith("Mark")], Vector((0.1, -0.21, 0)))
    pen = bpy.data.objects["Pencil"]; slide([pen], Vector((-0.25, -0.02, 0))); pen_home = pen.location - Vector((-0.25, -0.02, 0)); key(pen, LAST - 26, pen.location.copy()); key(pen, LAST - 10, pen_home); slide([bpy.data.objects["Compasses"]], Vector((0.34, -0.2, 0)))
    HOVER, TILT = Vector((CX + 0.12, CY + 0.22, 0.95)), Euler((deg(-12), deg(16), 0))
    jar.hide_render = True  # the glass jar gave way to the dome of light
    cam.lens = 35 if PORTRAIT else 47
    PATH = [(1, (0, -0.06, 1.5), (0, 0, 0)), (22, (-0.02, -0.1, 1.36), (0, 0, 0)), (76, (-0.42, -1.0, 0.6), (-0.02, 0, 0.07)),
            (120, (0.0, -1.5, 1.25), (0.0, -0.08, 0.0)), (172, (0.759, -1.083, 0.847), (0.1, -0.18, 0.03))]
    stages = []
    for k, S in enumerate(STOPS):  # the camera walks round the front of the table, a new side for each project
        az = deg(-90); eye = Vector(((k - 1) * 0.07, -1.5, 1.25)); look_at = Vector((0.0, -0.08, 0.0))
        PATH.append((S, tuple(eye), tuple(look_at)))
        side = Vector((-math.sin(az), math.cos(az), 0)) * (-0.05 if PORTRAIT else -0.1)  # a little to the left of the line of sight
        flat_to = look_at + (eye - look_at) * (0.3 if PORTRAIT else 0.38) + side
        stages.append((Vector((CX + flat_to.x, CY + flat_to.y, 0.24 if PORTRAIT else 0.155)), az + math.pi / 2 + deg(24)))
    PATH.append((LAST, (0, -0.06, 1.4 if PORTRAIT else 1.5), (0, 0, 0)))
    for f, c, a in PATH:
        drop = 0.085 if PORTRAIT and 76 <= f < LAST else 0.0
        c, a = Vector(c), Vector(a)
        if PORTRAIT and (f == 120 or f in STOPS): c, a, drop = Vector((-0.4497, 0.0173, 1.85)), Vector((-0.06, 0.0023, 0.0)), 0.0  # over the short side of the table, looking down its length
        if PORTRAIT and f in (1, 22, 76): c, a = {1: (Vector((-0.06, 0, 1.5)), a), 22: (Vector((-0.1, 0.0, 1.38)), a), 76: (Vector((-1.1, -0.3, 0.95)), Vector((0.0, 0.0, 0.07)))}[f]
        key(co, f, Vector((CX + c[0], CY + c[1], c[2]))); key(aim, f, Vector((CX + a[0], CY + a[1], a[2] - drop)))
        if f not in STOPS: key(focus, f, Vector((CX + a[0], CY + a[1], a[2] - drop)))
    for k, (S, (name, accent), (stage, yaw)) in enumerate(zip(STOPS, PROJECTS, stages)):
        c = containers[k]; flat = Euler((0, 0, 0))
        if S - 16 < 198: pass  # the first one comes straight off the stack
        else: key(c, S - 16, docks[k], flat, scale=base_scale)
        key(c, S - 2, stage, Euler((deg(8), deg(-6), yaw)), scale=base_scale * 2.2)
        key(c, S + 8, stage + Vector((0, 0, 0.008)), Euler((deg(6), deg(-4), yaw + deg(12))), scale=base_scale * 2.2)
        key(c, S + 22, docks[k], flat, scale=base_scale)
        key(focus, S - 2, stage); key(focus, S + 8, stage)
        paint = paints[k].node_tree.nodes["Principled BSDF"].inputs["Base Color"]
        paint.keyframe_insert("default_value", frame=S - 16); paint.default_value = (*accent, 1); paint.keyframe_insert("default_value", frame=S - 4)
    for S0 in STOPS:
        for d in (-2, 8): key(focus, S0 + d, Vector((CX, CY - 0.1, 0.03)))
    for c in containers: c.animation_data_clear(); c.hide_render = True
    key(focus, 172, PYR + Vector((0, 0, 0.02)))
    key(focus, 120, Vector((CX, CY - 0.1, 0.03)))
    for f, stop in ((1, 4.0), (76, 2.8), (100, 9.0), (122, 9.0), (150, 5.6), (176, 5.6), (STOP0 - 4, 11.0), (STOPS[-1] + 10, 11.0), (LAST, 8.0)):
        cam.dof.aperture_fstop = stop; cam.dof.keyframe_insert("aperture_fstop", frame=f)
    key(pivot, 1, rot=Euler((0, 0, deg(12)))); key(pivot, LAST, rot=Euler((0, 0, deg(-14))))  # the light moves on while one scrolls
    # Four worlds on one table. Each act has its own paper, clay, lines and light; they cross-fade while the camera travels.
    def unlinked_mix(mat, socket):
        return next(n for n in mat.node_tree.nodes if n.type == "MIX" and not n.inputs[6 if socket == "A" else 7].is_linked).inputs[6 if socket == "A" else 7]
    P = lambda mat: mat.node_tree.nodes["Principled BSDF"].inputs
    dials = {"paper": unlinked_mix(PAPER, "A"), "bone": unlinked_mix(BONE, "A"), "clay": unlinked_mix(ORANGE, "A"), "wall": unlinked_mix(WALL, "B"),
             "line": P(GRAPHITE)["Base Color"], "line_emit": P(GRAPHITE)["Emission Color"], "line_glow": P(GRAPHITE)["Emission Strength"], "clay_glow": P(ORANGE)["Emission Strength"], "world": bg.inputs["Strength"]}
    P(GRAPHITE)["Emission Color"].default_value = (1, 1, 1, 1)
    wnodes = ORANGE.node_tree; wnodes.links.new(next(n for n in wnodes.nodes if n.type == "MIX").outputs[2], P(ORANGE)["Emission Color"])
    gnodes = GRAPHITE.node_tree
    LOOKS = {  # paper, bone, clay, wall, line, line glow, clay glow, world, sun colour, sun energy, fill colour, fill energy
        "day":   ((0.7, 0.63, 0.52), (0.83, 0.74, 0.6), (0.82, 0.17, 0.028), (0.2, 0.185, 0.17), (0.16, 0.16, 0.17), 0.0, 0.0, 0.3, (1.0, 0.8, 0.58), 6.4, (0.72, 0.8, 1.0), 9),
        "night": ((0.03, 0.02, 0.012), (0.8, 0.7, 0.56), (0.82, 0.17, 0.028), (0.014, 0.01, 0.007), (1.0, 0.4, 0.045), 3.2, 0.0, 0.035, (1.0, 0.76, 0.5), 0.55, (1.0, 0.6, 0.3), 3.0),
        "dusk":  ((0.74, 0.1, 0.16), (0.96, 0.78, 0.66), (0.02, 0.1, 0.62), (0.22, 0.02, 0.1), (1.0, 0.82, 0.66), 0.5, 0.0, 0.2, (1.0, 0.5, 0.3), 8.0, (1.0, 0.35, 0.7), 9),
        "prumo": ((0.03, 0.02, 0.012), (0.8, 0.7, 0.56), (0.82, 0.17, 0.028), (0.014, 0.01, 0.007), (0.0, 0.0, 0.0), 0.0, 0.0, 0.035, (1.0, 0.9, 0.8), 0.5, (0.6, 1.0, 0.2), 3.0),
        "torvya": ((0.03, 0.02, 0.012), (0.8, 0.7, 0.56), (0.82, 0.17, 0.028), (0.014, 0.01, 0.007), (0.0, 0.0, 0.0), 0.0, 0.0, 0.035, (1.0, 0.9, 0.8), 0.5, (0.3, 0.4, 1.0), 3.0),
        "kreps": ((0.03, 0.02, 0.012), (0.8, 0.7, 0.56), (0.82, 0.17, 0.028), (0.014, 0.01, 0.007), (0.0, 0.0, 0.0), 0.0, 0.0, 0.035, (1.0, 0.9, 0.8), 0.5, (1.0, 0.8, 0.2), 3.0),
    }
    def look(frame, name):
        paper, bone, clay, wall, ln, lglow, cglow, w, sc, se, fc, fe = LOOKS[name]
        for k, v in (("paper", paper), ("bone", bone), ("clay", clay), ("wall", wall), ("line", ln), ("line_emit", ln)):
            dials[k].default_value = (*v, 1); dials[k].keyframe_insert("default_value", frame=frame)
        for k, v in (("line_glow", lglow), ("clay_glow", cglow), ("world", w)):
            dials[k].default_value = v; dials[k].keyframe_insert("default_value", frame=frame)
        sun.color, sun.energy, fill.color, fill.energy = sc, se, fc, fe
        for light in (sun, fill): light.keyframe_insert("color", frame=frame); light.keyframe_insert("energy", frame=frame)
    shots = [(1, "day"), (82, "day"), (108, "night"), (124, "night"), (146, "day"), (176, "day")]
    for S, (name, accent) in zip(STOPS, PROJECTS): shots += [(S - 6, name), (S + 6, name)]
    for frame, name in shots + [(LAST - 10, "day"), (LAST, "day"), (M0 + 4, "day"), (M0 + 17, "night")]: look(frame, name)
else:
    scene.frame_start, scene.frame_end = 1, 40
    key(jar, 1, JAR_UP, Euler((deg(-13), deg(24), 0)))
    key(jar, 26, JAR_HOME + Vector((0.006, 0.004, 0.05)), Euler((deg(-2), deg(4), 0)))
    key(jar, 40, JAR_HOME, Euler((0, 0, 0)))
    # The camera leans in a little as the jar comes down.
    start = co.location.copy(); key(co, 1, start); key(co, 40, start + (aim.location - start) * 0.07)

# Render --------------------------------------------------------------------------------------------------------------
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
scene.cycles.max_bounces = 10; scene.cycles.transmission_bounces = 10; scene.cycles.glossy_bounces = 6
scene.cycles.caustics_reflective = False; scene.cycles.caustics_refractive = False
W, H = (1080, 1920) if PORTRAIT else (1920, 1080)
scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = W, H, SCALE
scene.view_settings.view_transform = "AgX"
try: scene.view_settings.look = "AgX - Medium High Contrast"
except Exception: pass
scene.render.image_settings.file_format = "PNG" if MODE == "depth" else "JPEG"
scene.render.image_settings.quality = 93
scene.render.use_persistent_data = True  # the scene is kept between frames of one run
if "--glow" in argv:
    # A soft bloom round what is lit, in the compositor: the lines of the touch table glow, the paper is left alone.
    try:
        tree = bpy.data.node_groups.new("Glow", "CompositorNodeTree")
        tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        rl = tree.nodes.new("CompositorNodeRLayers"); gl = tree.nodes.new("CompositorNodeGlare"); go = tree.nodes.new("NodeGroupOutput")
        for name, value in (("Type", "Bloom"), ("Quality", "High"), ("Threshold", 2.2), ("Smoothness", 0.4), ("Strength", 0.55), ("Saturation", 1.0), ("Size", 0.42)):
            try: gl.inputs[name].default_value = value
            except Exception as error: print("glare input", name, error)
        tree.links.new(rl.outputs["Image"], gl.inputs["Image"]); tree.links.new(gl.outputs["Image"], go.inputs[0])
        scene.compositing_node_group = tree; scene.render.use_compositing = True
        print("GLOW on", [i.name for i in gl.inputs])
    except Exception as error: print("GLOW unavailable:", error)
os.makedirs(OUT, exist_ok=True)
tag = "p" if PORTRAIT else "l"

if MODE == "anchors":
    # Where things land on screen at each stop, as fractions of the frame from its top left: the page pins its notes there.
    import json
    from bpy_extras.object_utils import world_to_camera_view
    # Every key the visitor can touch, as a box on screen at the rest where it is used.
    def rect4(c, w, d, rot):
        u, v = axes(rot); return [Vector((c.x, c.y, 0.002)) + u * sx * w / 2 + v * sy * d / 2 for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    hot = {f: {k: rect4(*v) for k, v in items.items()} for f, items in HOTS.items()}
    found = {}
    for f, items in hot.items():
        scene.frame_set(f); bpy.context.view_layer.update()
        eye = co.evaluated_get(bpy.context.evaluated_depsgraph_get())
        found[f] = {}
        for k, pts in items.items():
            xy = [(world_to_camera_view(scene, eye, q).x, 1 - world_to_camera_view(scene, eye, q).y) for q in pts]
            found[f][k] = [round(min(q[0] for q in xy), 4), round(min(q[1] for q in xy), 4), round(max(q[0] for q in xy), 4), round(max(q[1] for q in xy), 4)]
    print("ANCHORS", tag, json.dumps(found))
    print("TEXTS", json.dumps(sorted(set(SEEN)), ensure_ascii=False))
elif MODE == "shield":
    # The dome closing over the model, seen from the rest of the second act. The page plays these when the last module is armed.
    scene.frame_set(120)
    for o in (dome, struts): o.hide_render = False
    for i in range(1, 25):
        for t in shield_dials: t.outputs[0].default_value = i / 24 * 1.12
        path = os.path.join(OUT, f"s{tag}-{i:03d}.jpg")
        if os.path.exists(path): continue
        scene.render.filepath = path; bpy.ops.render.render(write_still=True)
elif MODE == "matte":
    # White where the sheet shows at that rest, black where anything stands in front of it: the page masks its live interface with this.
    def flat(name, v):
        m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
        out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (v, v, v, 1); nt.links.new(em.outputs["Emission"], out.inputs["Surface"]); return m
    white, black = flat("MatteWhite", 1.0), flat("MatteBlack", 0.0)
    scene.frame_set(120)
    for o in scene.objects:
        if o.type in ("MESH", "CURVE", "FONT"):
            for i in range(len(o.material_slots)): o.material_slots[i].material = white if o.name == "Sheet" else black
            if not o.material_slots: o.data.materials.append(black)
    for o in scene.objects:
        if o.type == "CURVE" and o.name != "Sheet": o.hide_render = True  # the drawn lines lie on the sheet, they hide nothing
    scene.cycles.samples = 48; scene.view_settings.view_transform = "Standard"; scene.view_settings.look = "None"; bg.inputs["Strength"].default_value = 0.0
    scene.render.filepath = os.path.join(OUT, f"matte-{tag}.jpg"); bpy.ops.render.render(write_still=True)
elif MODE == "depth":
    # Distance from the camera as a grey image, for parallax and for hiding particles behind things.
    m = bpy.data.materials.new("Depth"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission"); cd = nt.nodes.new("ShaderNodeCameraData"); mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 0.45; mr.inputs["From Max"].default_value = 2.4; mr.inputs["To Min"].default_value = 1.0; mr.inputs["To Max"].default_value = 0.0
    nt.links.new(cd.outputs["View Z Depth"], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], em.inputs["Color"]); nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    bpy.context.view_layer.material_override = m
    scene.cycles.samples = 8; scene.cycles.use_denoising = False; cam.dof.use_dof = False
    scene.view_settings.view_transform = "Raw"; scene.view_settings.look = "None"; bg.inputs["Strength"].default_value = 0.0
    for f in sorted(set(FRAMES)):
        scene.frame_set(f); scene.render.filepath = os.path.join(OUT, f"depth-{tag}-{f:03d}.png"); bpy.ops.render.render(write_still=True)
elif MODE == "states":
    def freeze(objs):  # hold the pose of this frame, and let visibility be set by hand
        for o in objs:
            pose = (o.location.copy(), o.rotation_euler.copy(), o.scale.copy()); o.animation_data_clear(); o.location, o.rotation_euler, o.scale = pose
    def shot(name):
        path = os.path.join(OUT, f"{tag}-{name}.jpg")
        if not os.path.exists(path): scene.render.filepath = path; bpy.ops.render.render(write_still=True)
    which = opt("--which", "protejo,stops").split(",")
    if "protejo" in which:
        scene.frame_set(120); bpy.context.view_layer.update()
        LAYERS = LAYER_PARTS
        full = [o for o in guard if o.name in FULL_PARTS]
        groups = {nm: [o for o in guard if o.name.startswith(pre) or o.name in ("Key" + nm, "KeyFill" + nm)] for nm, pre in LAYERS.items()}
        every = [o for g in groups.values() for o in g] + full + [o for g in gauges.values() for o in g]
        freeze(guard + [o for g in gauges.values() for o in g])
        for o in guard: o.hide_render = False
        def show(layer=None, gauge=None):
            for o in every: o.hide_render = True
            for o in groups.get(layer, []): o.hide_render = False
            for o in (full if gauge == 8 else gauges.get(gauge, [])): o.hide_render = False
        show(); shot("s120-base")
        for nm in LAYERS: show(layer=nm); shot("s120-" + nm.lower())
        for n in range(9): show(gauge=n); shot(f"s120-g{n}")
        if "arm" in which:
            # The same rest, armed while one scrolls: six frames for each layer, each with a movement of its own.
            N = 6; home = {o.name: (o.location.copy(), o.scale.copy(), o.rotation_euler.copy()) for o in every}; names = list(LAYERS)
            seals = len([o for o in groups["Uem"] if o.name.startswith("Seal")]); FLOOR = Vector((JC[0], JC[1], 0.001))
            def about(o, c, sx, sy, sz):  # scale about a point of the table, whatever the object's own origin
                loc, sc, _ = home[o.name]
                o.location = Vector((c.x + (loc.x - c.x) * sx, c.y + (loc.y - c.y) * sy, c.z + (loc.z - c.z) * sz)); o.scale = Vector((sc.x * sx, sc.y * sy, sc.z * sz))
            def intro(nm, t):
                e = 1 - (1 - t) ** 2
                for d in shield_dials: d.outputs[0].default_value = 1.12 * (e if nm == "Edr" else 1.0)
                for o in groups[nm]:
                    n = o.name; loc, sc, rot = home[n]; o.hide_render = False
                    if n.startswith("Analysis") or n in ("ThreatCount", "ThreatWord", "SpareWord", "GateBar"): o.hide_render = t < 0.65
                    elif n in ("FireWall", "FireWallTop"): about(o, FLOOR, 1, 1, max(e, 0.03))
                    elif n.startswith("ThreatPath"): pass
                    elif n.startswith("Threat"): o.location = THREAT_FROM[n] + (loc - THREAT_FROM[n]) * e
                    elif n.startswith("GatePost"): o.scale = Vector((sc.x, sc.y, sc.z * max(e, 0.03)))
                    elif n.startswith("Seal"): o.hide_render = t < (int(n[4:]) + 1) / seals - 1e-6
                    elif n.startswith("ServerRing"): about(o, J, 0.5 + 0.5 * e, 0.5 + 0.5 * e, 1)
                    elif n == "Spare": about(o, Vector((loc.x, loc.y, 0.0008)), 1, 1, max(e, 0.03))
                    elif n == "SpareLink": o.hide_render = t < 0.5
                    elif n == "RadarSweep": o.rotation_euler = Euler((rot.x, rot.y, rot.z + math.radians(170) * (1 - e))); about(o, J, max(e, 0.05), max(e, 0.05), 1)
                    elif n == "GovernRing": about(o, J, 1.24 - 0.24 * e, 1.24 - 0.24 * e, 1)
            for k, nm in enumerate(names):
                for j in range(1, N + 1):
                    for o in every: o.hide_render = True
                    for prev in names[:k]:
                        for o in groups[prev]: o.hide_render = False
                    intro(nm, j / N)
                    g = k + (1 if j >= 4 else 0)
                    for o in (full if g == 8 else gauges[g]): o.hide_render = False
                    shot(f"a{k * N + j:02d}")
        for o in guard + [o for g in gauges.values() for o in g]: o.hide_render = True
    if "stops" in which:
        for k, S0 in enumerate(STOPS):
            scene.frame_set(S0); bpy.context.view_layer.update()
            for made in variants[k]: freeze(made)
            for v, made in enumerate(variants[k]):
                for w, other in enumerate(variants[k]):
                    for o in other: o.hide_render = w != v
                shot(f"s{S0}-{v}")
            for made in variants[k]:
                for o in made: o.hide_render = True
elif JOURNEY:
    only = [int(n) for n in opt("--only", "").split(",") if n]
    for f in only or range(FRAMES[0], FRAMES[1] + 1):  # resumable: frames already on disk are kept
        path = os.path.join(OUT, f"{tag}-{f:03d}.jpg")
        if os.path.exists(path): continue
        scene.frame_set(f); scene.render.filepath = path; bpy.ops.render.render(write_still=True)
elif MODE == "still":
    for f in sorted(set(FRAMES)):
        scene.frame_set(f); scene.render.filepath = os.path.join(OUT, f"still-{tag}-{f:03d}.jpg"); bpy.ops.render.render(write_still=True)
else:
    for f in range(FRAMES[0], FRAMES[1] + 1):
        scene.frame_set(f); scene.render.filepath = os.path.join(OUT, f"jar-{tag}-{f:03d}.jpg"); bpy.ops.render.render(write_still=True)
print("RENDERED", MODE, tag, FRAMES)
