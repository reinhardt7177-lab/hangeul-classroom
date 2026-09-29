"""
한글날 릴스 — 3D 제목 장면 (Blender 4.2+, bpy)

릴스 3–4마디(4–8초)의 「한글날」을 두께 있는 3D 글자로 다시 만든다. 박자는 릴스와 같은
timeline.json 에서 읽는다 — 음절이 모이는 순간, 킥, 줌 시각이 그림·소리와 한 프레임도 어긋나지 않는다.
투명 바탕 PNG 열로 렌더해 릴스 위에 얹거나, 그대로 따로 쓴다.

    node tools/render.cjs timeline                       # blender/timeline.json
    blender -b -P blender/title3d.py                     # title3d.blend 저장
    blender -b -P blender/title3d.py -- --render         # out/blender/0001.png …

주의: 이 스크립트는 블렌더가 없는 환경에서 작성했다. 문법만 검사했고 블렌더에서 돌려 보지 않았다.
"""
import bpy
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
with open(os.path.join(HERE, "timeline.json"), encoding="utf-8") as f:
    TL = json.load(f)

FPS = TL["FPS"]
BEAT = TL["BEAT"]
START, END = TL["title"]["start"], TL["title"]["end"]  # 초 — 3마디 시작 ~ 4마디 끝
frame = lambda t: 1 + round((t - START) * FPS)

INK = (0.0145, 0.0423, 0.0302, 1)  # #1F3A30 (선형)
PAPER = (0.955, 0.939, 0.879, 1)  # #FAF8F1
ACCENT = (0.846, 0.147, 0.044, 1)  # #ED6B36

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, frame(END) - 1
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
sc.render.film_transparent = True
sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
sc.render.filepath = os.path.join(ROOT, "out", "blender", "")

font_path = os.path.join(ROOT, "fonts", "PretendardVariable.ttf")
FONT = bpy.data.fonts.load(font_path) if os.path.exists(font_path) else None


def mat(name, color, rough=0.35, emit=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    if emit and "Emission Strength" in b.inputs:
        b.inputs["Emission Color"].default_value = color
        b.inputs["Emission Strength"].default_value = emit
    return m


M_FACE = mat("face", PAPER, 0.4)  # 두께의 옆면은 주황 역광(아래 rim)이 물들인다


def syllable(ch, x):
    bpy.ops.object.text_add(location=(x, 0, 0))
    o = bpy.context.object
    o.data.body = ch
    if FONT:
        o.data.font = FONT
    o.data.align_x = "CENTER"
    o.data.align_y = "CENTER"
    o.data.size = 1.0
    o.data.extrude = 0.12
    o.data.bevel_depth = 0.012
    o.data.bevel_resolution = 3
    o.data.materials.append(M_FACE)
    o.rotation_euler = (math.radians(90), 0, 0)
    return o


SYL = TL["title"]["syl"]  # [{"syl": "한", "merge": 4.5, "hits": [...]}, …]
objs = []
for i, s in enumerate(SYL):
    o = syllable(s["syl"], (i - 1) * 1.02)
    objs.append((o, s))

# 음절마다: 모이기 전엔 위에서 떨어져 있다가, merge 박에 쾅 — 튕기며 제자리
for o, s in objs:
    x0 = o.location.x
    t_hit, t_merge = s["hits"][0], s["merge"]
    o.location = (x0, 0, 3.2)
    o.scale = (1.8, 1.8, 1.8)
    o.rotation_euler[2] = math.radians(-20)
    for p in ("location", "scale", "rotation_euler"):
        o.keyframe_insert(p, frame=max(1, frame(t_hit)))
    o.location = (x0, 0, 0)
    o.scale = (1.08, 1.08, 1.08)
    o.rotation_euler[2] = 0
    for p in ("location", "scale", "rotation_euler"):
        o.keyframe_insert(p, frame=frame(t_merge))
    o.scale = (1, 1, 1)
    o.keyframe_insert("scale", frame=frame(t_merge) + 6)

# 킥마다 1.5% 숨 쉬기 — 화면의 pump() 와 같은 킥 목록
root = bpy.data.objects.new("title", None)
sc.collection.objects.link(root)
for o, _ in objs:
    o.parent = root
for k in TL["KICKS"]:
    if START <= k < END:
        root.scale = (1.015,) * 3
        root.keyframe_insert("scale", frame=frame(k))
        root.scale = (1,) * 3
        root.keyframe_insert("scale", frame=frame(k) + 7)

# 카메라 — 천천히 돌다가 줌 박(4마디 3.5박)에 「한」 쪽으로 빨려 든다
cam_data = bpy.data.cameras.new("cam")
cam_data.lens = 50
cam = bpy.data.objects.new("cam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
track = cam.constraints.new("TRACK_TO")
target = bpy.data.objects.new("target", None)
sc.collection.objects.link(target)
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"
cam.location = (-1.2, -7.5, 0.9)
cam.keyframe_insert("location", frame=1)
cam.location = (0.4, -6.6, 0.4)
cam.keyframe_insert("location", frame=frame(TL["title"]["zoom0"]))
cam.location = (objs[0][0].location.x, -1.2, 0.05)
cam.keyframe_insert("location", frame=frame(END) - 1)
target.location = (0, 0, 0)
target.keyframe_insert("location", frame=frame(TL["title"]["zoom0"]))
target.location = (objs[0][0].location.x, 0, 0.05)
target.keyframe_insert("location", frame=frame(END) - 1)

# 빛 — 위에서 하나, 뒤에서 주황 역광
bpy.ops.object.light_add(type="AREA", location=(0, -3, 5))
key = bpy.context.object
key.data.energy = 900
key.data.size = 5
bpy.ops.object.light_add(type="POINT", location=(0, 2.5, 1))
rim = bpy.context.object
rim.data.color = ACCENT[:3]
rim.data.energy = 600

# 마디 표시
for b in range(3, 5):
    sc.timeline_markers.new(f"bar {b}", frame=frame((b - 1) * 4 * BEAT))

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "title3d.blend"))
print("saved title3d.blend", sc.frame_end, "frames")
if "--render" in ARGS:
    bpy.ops.render.render(animation=True)
