from pathlib import Path
import json

import bpy
from math import radians, sin, pi
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools/vendor/plewr-character/characterRIGGED.glb"
OUT = ROOT / "src/assets/images/art/prototype/hunt-demo/south-gate/traveler"
FRAME_DIR = OUT / "frames"
FRAME_SIZE = 192
PIVOT = {"x": 96, "y": 174}
DIRECTIONS = [
    ("south", 0),
    ("southwest", 45),
    ("west", 90),
    ("northwest", 135),
    ("north", 180),
    ("northeast", 225),
    ("east", 270),
    ("southeast", 315),
]
ANIMATIONS = {
    "idle": {"frames": 4, "fps": 6, "loop": True},
    "walk": {"frames": 8, "fps": 10, "loop": True},
    "roll": {"frames": 8, "fps": 14, "loop": False},
}


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def material(name, color, metallic=0.0, roughness=0.7):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.metallic = metallic
    mat.roughness = roughness
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def add_hood_and_cloak(armature):
    cloth = material("TravelerCloth", (0.075, 0.105, 0.12), roughness=0.9)
    leather = material("TravelerLeather", (0.18, 0.075, 0.03), roughness=0.72)

    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=2.25, radius2=1.15, depth=3.2,
                                    location=(0, 0.02, 8.6))
    hood = bpy.context.object
    hood.name = "TravelerHood"
    hood.data.materials.append(cloth)
    hood.scale.y = 0.72

    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=3.2, radius2=1.5, depth=8.7,
                                    location=(0, 0.52, 3.1))
    cloak = bpy.context.object
    cloak.name = "TravelerCloak"
    cloak.data.materials.append(cloth)
    cloak.scale.y = 0.38
    cloak.rotation_euler.x = radians(-4)

    bpy.ops.mesh.primitive_torus_add(major_radius=1.75, minor_radius=0.17,
                                    location=(0, -0.02, 6.55), rotation=(radians(90), 0, 0))
    clasp = bpy.context.object
    clasp.name = "TravelerClasp"
    clasp.data.materials.append(leather)

    void = material("TravelerFaceVoid", (0.002, 0.002, 0.003), roughness=1)
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=24,
        ring_count=12,
        location=(0, -0.83, 8.75),
        scale=(0.72, 0.2, 0.64)
    )
    face = bpy.context.object
    face.name = "TravelerFaceVoid"
    face.data.materials.append(void)

    for obj in (hood, cloak, clasp, face):
        modifier = obj.modifiers.new("FollowRoot", "ARMATURE")
        modifier.object = armature
        world_matrix = obj.matrix_world.copy()
        obj.parent = armature
        obj.matrix_world = world_matrix


def setup_scene():
    clear_scene()
    bpy.ops.import_scene.gltf(filepath=str(SOURCE))
    armature = next(obj for obj in bpy.data.objects if obj.type == "ARMATURE")
    armature.rotation_euler = (0, 0, 0)
    armature.location = (0, 0, 7)

    for obj in bpy.data.objects:
        if obj.type == "MESH":
            for slot in obj.material_slots:
                if slot.material:
                    slot.material.diffuse_color = (0.16, 0.12, 0.085, 1)
                    slot.material.metallic = 0.16
                    slot.material.roughness = 0.7
                    if slot.material.use_nodes:
                        bsdf = slot.material.node_tree.nodes.get("Principled BSDF")
                        if bsdf:
                            bsdf.inputs["Base Color"].default_value = (0.13, 0.075, 0.035, 1)
                            bsdf.inputs["Metallic"].default_value = 0.16
                            bsdf.inputs["Roughness"].default_value = 0.7
    add_hood_and_cloak(armature)

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = FRAME_SIZE
    scene.render.resolution_y = FRAME_SIZE
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.look = "AgX - Medium High Contrast"

    bpy.ops.object.camera_add(location=(19, -24, 21))
    camera = bpy.context.object
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 18
    direction = Vector((0, 0, 3.1)) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.camera = camera

    bpy.ops.object.light_add(type="AREA", location=(-8, -12, 24))
    key = bpy.context.object
    key.data.energy = 1250
    key.data.shape = "DISK"
    key.data.size = 11
    bpy.ops.object.light_add(type="AREA", location=(12, 4, 12))
    rim = bpy.context.object
    rim.data.energy = 650
    rim.data.color = (0.35, 0.48, 0.62)
    rim.data.size = 8
    bpy.ops.object.light_add(type="AREA", location=(-7, 5, 7))
    fill = bpy.context.object
    fill.data.energy = 380
    fill.data.color = (0.72, 0.44, 0.24)
    fill.data.size = 7
    scene.world.color = (0.006, 0.008, 0.012)
    return armature


def reset_pose(armature):
    for bone in armature.pose.bones:
        bone.rotation_mode = "XYZ"
        bone.rotation_euler = (0, 0, 0)
        bone.location = (0, 0, 0)
    armature.pose.bones["Bone.004"].rotation_euler.z = radians(72)
    armature.pose.bones["Bone.005"].rotation_euler.z = radians(-72)


def apply_pose(armature, animation, frame_index, frame_count):
    reset_pose(armature)
    phase = frame_index / frame_count * 2 * pi
    root = armature.pose.bones.get("Bone.001")
    torso = armature.pose.bones.get("Bone")
    left_leg = armature.pose.bones.get("Bone.011")
    right_leg = armature.pose.bones.get("Bone.013")
    left_arm = armature.pose.bones.get("Bone.004")
    right_arm = armature.pose.bones.get("Bone.005")
    if animation == "idle":
        torso.rotation_euler.y = radians(1.5 * sin(phase))
        root.location.z = 0.08 * sin(phase)
    elif animation == "walk":
        swing = radians(24 * sin(phase))
        left_leg.rotation_euler.x = swing
        right_leg.rotation_euler.x = -swing
        left_arm.rotation_euler.z += -swing * 0.72
        right_arm.rotation_euler.z += swing * 0.72
        root.location.z = 0.18 * abs(sin(phase))
        torso.rotation_euler.y = radians(2.2 * sin(phase))
    else:
        progress = frame_index / max(1, frame_count - 1)
        tuck = sin(progress * pi)
        torso.rotation_euler.x = radians(22 + 150 * progress)
        root.location.z = -0.9 * tuck
        left_leg.rotation_euler.x = radians(-30 * tuck)
        right_leg.rotation_euler.x = radians(-30 * tuck)
        left_arm.rotation_euler.z += radians(28 * tuck)
        right_arm.rotation_euler.z -= radians(28 * tuck)


def render_frames(armature):
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    for direction, angle in DIRECTIONS:
        armature.rotation_euler.z = radians(angle)
        for animation, spec in ANIMATIONS.items():
            for frame in range(spec["frames"]):
                apply_pose(armature, animation, frame, spec["frames"])
                bpy.context.view_layer.update()
                path = FRAME_DIR / f"{animation}-{direction}-{frame:02}.png"
                bpy.context.scene.render.filepath = str(path)
                bpy.ops.render.render(write_still=True)


def write_metadata():
    row_offsets = {}
    row_cursor = 0
    for name in ANIMATIONS:
        row_offsets[name] = row_cursor
        row_cursor += len(DIRECTIONS)
    metadata = {
        "image": "traveler-atlas.webp",
        "frameSize": {"width": FRAME_SIZE, "height": FRAME_SIZE},
        "pivot": PIVOT,
        "directions": [name for name, _ in DIRECTIONS],
        "animations": {
            name: {
                "fps": spec["fps"],
                "loop": spec["loop"],
                "frames": [
                    {
                        "x": frame * FRAME_SIZE,
                        "y": (row_offsets[name] + row) * FRAME_SIZE,
                        "width": FRAME_SIZE,
                        "height": FRAME_SIZE,
                        "pivot": PIVOT,
                    }
                    for row, (direction, _) in enumerate(DIRECTIONS)
                    for frame in range(spec["frames"])
                ],
                "rows": {
                    direction: row_offsets[name] + row
                    for row, (direction, _) in enumerate(DIRECTIONS)
                },
                "frameCount": spec["frames"],
            }
            for name, spec in ANIMATIONS.items()
        },
    }
    (OUT / "traveler-atlas.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    armature = setup_scene()
    render_frames(armature)
    write_metadata()
    print(f"Rendered traveler frames to {FRAME_DIR}")


if __name__ == "__main__":
    main()
