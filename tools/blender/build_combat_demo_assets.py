import math
import os
import sys

import bpy


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_DIR = os.path.join(ROOT, "src", "assets", "models", "combat-demo")
SOURCE_DIR = os.path.join(ROOT, "tools", "blender", "sources")


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def material(name, color, metallic=0.0, roughness=0.8):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    principled = mat.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = (*color, 1.0)
    principled.inputs["Metallic"].default_value = metallic
    principled.inputs["Roughness"].default_value = roughness
    return mat


def apply_transform(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.select_set(False)


def cube(name, location, scale, mat, parent=None, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    apply_transform(obj)
    if bevel:
        modifier = obj.modifiers.new("SoftEdges", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def cylinder(name, location, radius, depth, mat, vertices=10, parent=None):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def sphere(name, location, scale, mat, parent=None, subdivisions=2):
    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=subdivisions,
        radius=1.0,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    apply_transform(obj)
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def cone(name, location, radius, depth, mat, rotation=(0.0, 0.0, 0.0), parent=None):
    bpy.ops.mesh.primitive_cone_add(
        vertices=10,
        radius1=radius,
        radius2=0.0,
        depth=depth,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj


def empty(name):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    return obj


def export_glb(path):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_animations=True,
        export_apply=True,
    )


def build_map_kit():
    reset_scene()
    stone = material("WeatheredStone", (0.20, 0.22, 0.20), roughness=0.94)
    stone_dark = material("DarkStone", (0.105, 0.12, 0.11), roughness=0.98)
    moss = material("Moss", (0.16, 0.24, 0.14), roughness=1.0)
    wood = material("OldWood", (0.22, 0.13, 0.07), roughness=0.9)
    steel = material("Steel", (0.36, 0.39, 0.40), metallic=0.72, roughness=0.35)
    leather = material("Leather", (0.20, 0.095, 0.045), roughness=0.82)

    tile = empty("GroundTile")
    cube("GroundTile_Mesh", (0, 0, -0.12), (2.0, 2.0, 0.12), stone_dark, tile, 0.05)
    cube("GroundTile_Inset", (0, 0, 0.015), (1.88, 1.88, 0.02), stone, tile)
    for x, y, sx, sy in (
        (-1.1, -0.55, 0.65, 0.04),
        (0.8, 0.72, 0.85, 0.035),
        (0.15, -1.35, 0.04, 0.48),
    ):
        cube("GroundTile_Crack", (x, y, 0.05), (sx, sy, 0.012), moss, tile)

    wall = empty("WallStraight")
    cube("WallStraight_Base", (0, 0, 0.32), (2.0, 0.34, 0.32), stone_dark, wall, 0.08)
    cube("WallStraight_Body", (0, 0, 1.05), (1.88, 0.29, 0.72), stone, wall, 0.09)
    for x in (-1.45, -0.5, 0.55, 1.45):
        cube("WallStraight_Block", (x, 0.01, 1.78), (0.36, 0.34, 0.18), stone, wall, 0.04)

    corner = empty("WallCorner")
    cube("WallCorner_A", (0, 0, 0.95), (2.0, 0.33, 0.95), stone, corner, 0.08)
    cube("WallCorner_B", (-1.67, 1.67, 0.95), (0.33, 2.0, 0.95), stone, corner, 0.08)

    pillar = empty("Pillar")
    cylinder("Pillar_Base", (0, 0, 0.16), 0.66, 0.32, stone_dark, 10, pillar)
    cylinder("Pillar_Shaft", (0, 0, 1.3), 0.42, 2.25, stone, 10, pillar)
    cylinder("Pillar_Cap", (0, 0, 2.5), 0.62, 0.25, stone_dark, 10, pillar)

    rock = empty("RockCluster")
    sphere("Rock_A", (-0.22, 0.0, 0.42), (0.72, 0.58, 0.48), stone_dark, rock)
    sphere("Rock_B", (0.48, 0.12, 0.3), (0.52, 0.44, 0.34), stone, rock)
    sphere("Rock_C", (0.05, -0.38, 0.23), (0.42, 0.35, 0.28), stone, rock)

    arch = empty("BrokenArch")
    cube("BrokenArch_Left", (-1.5, 0, 1.25), (0.38, 0.42, 1.25), stone, arch, 0.08)
    cube("BrokenArch_Right", (1.5, 0, 1.25), (0.38, 0.42, 1.25), stone, arch, 0.08)
    cube(
        "BrokenArch_Top",
        (-0.15, 0, 2.52),
        (1.72, 0.42, 0.28),
        stone_dark,
        arch,
        0.07,
    )

    sword = empty("TrainingSword")
    cube("Sword_Blade", (0, 0, 0.72), (0.055, 0.018, 0.72), steel, sword, 0.018)
    cone("Sword_Tip", (0, 0, 1.49), 0.082, 0.18, steel, parent=sword)
    cube("Sword_Guard", (0, 0, -0.02), (0.27, 0.055, 0.055), steel, sword, 0.025)
    cylinder("Sword_Grip", (0, 0, -0.31), 0.055, 0.54, leather, 8, sword)

    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(SOURCE_DIR, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE_DIR, "combat_demo_kit.blend"))
    export_glb(os.path.join(MODEL_DIR, "combat-demo-kit.glb"))


def build_monster():
    reset_scene()
    hide = material("BeastHide", (0.22, 0.07, 0.055), roughness=0.9)
    hide_dark = material("BeastDark", (0.075, 0.035, 0.03), roughness=0.96)
    horn = material("Horn", (0.32, 0.285, 0.22), roughness=0.72)
    eye = material("Eye", (1.0, 0.22, 0.035), metallic=0.0, roughness=0.25)

    root = empty("TrainingBeast")
    root["demo_role"] = "monster"
    cylinder("Body", (0, 0, 1.28), 0.56, 1.4, hide, 10, root)
    sphere("Shoulders", (0, 0, 1.72), (0.76, 0.44, 0.36), hide_dark, root)
    sphere("Head", (0, -0.05, 2.22), (0.48, 0.42, 0.45), hide, root)
    cube("Snout", (0, -0.38, 2.12), (0.28, 0.24, 0.18), hide_dark, root, 0.08)

    for side in (-1, 1):
        cylinder(
            f"Leg_{side}",
            (side * 0.27, 0, 0.48),
            0.18,
            0.92,
            hide_dark,
            9,
            root,
        )
        arm = cylinder(
            f"ClawArm_{side}",
            (side * 0.67, -0.02, 1.35),
            0.16,
            1.12,
            hide,
            9,
            root,
        )
        arm.rotation_euler = (0.12, side * 0.48, side * 0.12)
        for claw_index in range(3):
            cone(
                f"Claw_{side}_{claw_index}",
                (
                    side * (0.84 + claw_index * 0.04),
                    -0.08 - claw_index * 0.07,
                    0.81 + claw_index * 0.06,
                ),
                0.055,
                0.36,
                horn,
                rotation=(math.radians(72), 0, side * math.radians(14)),
                parent=root,
            )

        horn_obj = cone(
            f"Horn_{side}",
            (side * 0.31, 0.02, 2.63),
            0.15,
            0.62,
            horn,
            rotation=(0, side * math.radians(25), 0),
            parent=root,
        )
        horn_obj.rotation_euler[1] = side * math.radians(25)
        sphere(
            f"Eye_{side}",
            (side * 0.17, -0.43, 2.28),
            (0.055, 0.03, 0.055),
            eye,
            root,
            subdivisions=2,
        )

    for ridge_index in range(4):
        cone(
            f"BackRidge_{ridge_index}",
            (0, 0.35, 1.25 + ridge_index * 0.28),
            0.09,
            0.38,
            horn,
            rotation=(math.radians(88), 0, 0),
            parent=root,
        )

    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(SOURCE_DIR, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE_DIR, "training_beast.blend"))
    export_glb(os.path.join(MODEL_DIR, "training-beast.glb"))


if __name__ == "__main__":
    build_map_kit()
    build_monster()
    print("Combat demo Blender assets generated.")
