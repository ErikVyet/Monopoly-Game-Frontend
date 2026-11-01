import { ActiveCollisionTypes } from "@dimforge/rapier3d-compat";
import { Bolt, DirectionsTransit, QuestionMark, WaterDrop, West } from "@mui/icons-material";
import { blue, brown, green, grey, orange, pink, red, yellow } from "@mui/material/colors";
import { Center, Edges, Float, Html, Text, Text3D, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { AnimationClip, Euler, Mesh, MeshStandardMaterial, type Group } from "three";
import { Group as SpaceGroup } from "../../constants/Group";
import type { GLTF } from "three-stdlib";
import { Box, Stack, Typography } from "@mui/material";
import { properties, railroads, utilities, taxes, chests, chances } from "../../assets/data/board.json";

/* ------------------------------------------------------------------------------------------------------------------ */

type SpaceCommonProps = {
    position: [x: number, y: number, z: number],
    rotation?: [x: number, y: number, z: number]
}

/* ------------------------------------------------------------------------------------------------------------------ */

type BuildingCommonProps = {
    position: [x: number, y: number, z: number],
    rotation?: [x: number, y: number, z: number]
}

/* ------------------------------------------------------------------------------------------------------------------ */

type FoundationCommonProps = {
    position: [x: number, y: number, z: number],
    rotation?: [x: number, y: number, z: number]
}

/* ------------------------------------------------------------------------------------------------------------------ */

type CarCommonProps = {
    position: [x: number, y: number, z: number],
    rotation?: [x: number, y: number, z: number]
}

/* ------------------------------------------------------------------------------------------------------------------ */

type OtherCommonProps = {
    position: [x: number, y: number, z: number],
    rotation?: [x: number, y: number, z: number]
}

/* ------------------------------------------------------------------------------------------------------------------ */

export function SkyDome() {
    const { scene } = useGLTF("/models/others/sky-day-dome.glb");

    const skyDomeRef = useRef<Group>(null!);
    const targetRotation = useRef<Euler>(new Euler());

    useFrame(() => {
        const skyDome = skyDomeRef.current;
        if (!skyDome) return;

        const currentRotation = skyDome.rotation;
        targetRotation.current.set(currentRotation.x, currentRotation.y + 0.0002, currentRotation.z);

        skyDome.setRotationFromEuler(targetRotation.current);
    });

    return (
        <group ref={skyDomeRef} position={[0, 10.4, 0]} scale={8} castShadow>
            <primitive object={scene}/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function StartLine() {
    return (
        <RigidBody type={"fixed"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh position={[-1, 0.85, -1]}>
                <cylinderGeometry args={[0.06, 0.06, 1.5, 32]} />
                <meshStandardMaterial color={grey[100]} metalness={0.8} roughness={0.2}/>
                <Edges color={"black"} lineWidth={1.5}/>
            </mesh>
            <mesh position={[-1, 1.4, 0]}>
                <boxGeometry args={[0.05, 0.35, 1.9]} />
                <meshStandardMaterial color={blue[400]} metalness={0.2} roughness={0.2}/>
                <Text font={"/fonts/Fredoka-Regular.ttf"} fontSize={0.2} position={[-0.026, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>Start</Text>
                <Text font={"/fonts/Fredoka-Regular.ttf"} fontSize={0.2} position={[0.026, 0, 0]} rotation={[0, Math.PI / 2, 0]}>Start</Text>
                <Edges color={"black"} lineWidth={1.5}/>
            </mesh>
            <mesh position={[-1, 0.85, 1]}>
                <cylinderGeometry args={[0.06, 0.06, 1.5, 32]} />
                <meshStandardMaterial color={grey[100]} metalness={0.8} roughness={0.2}/>
                <Edges color={"black"} lineWidth={1.5}/>
            </mesh>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function FinishLine() {
    return (
        <RigidBody type={"fixed"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh position={[1, 0.85, -1]}>
                <cylinderGeometry args={[0.06, 0.06, 1.5, 32]} />
                <meshStandardMaterial color={grey[100]} metalness={0.8} roughness={0.2}/>
                <Edges color={"black"} lineWidth={1.5}/>
            </mesh>
            <mesh position={[0, 1.4, -1]}>
                <boxGeometry args={[1.9, 0.35, 0.05]} />
                <meshStandardMaterial color={red[400]} metalness={0.2} roughness={0.2}/>
                <Text font={"/fonts/Fredoka-Regular.ttf"} fontSize={0.2} position={[0, 0, -0.026]} rotation={[0, Math.PI, 0]}>Finish</Text>
                <Text font={"/fonts/Fredoka-Regular.ttf"} fontSize={0.2} position={[0, 0, 0.026]} rotation={[0, -Math.PI * 2, 0]}>Finish</Text>
                <Edges color={"black"} lineWidth={1.5}/>
            </mesh>
            <mesh position={[-1, 0.85, -1]}>
                <cylinderGeometry args={[0.06, 0.06, 1.5, 32]} />
                <meshStandardMaterial color={grey[100]} metalness={0.8} roughness={0.2}/>
                <Edges color={"black"} lineWidth={1.5}/>
            </mesh>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type ActionName = 'Chest_UpChest_Open_Close' | 'ChestBodyChest_Rotation' | 'ChestBodyChest_Shake';

interface GLTFChestAction extends AnimationClip { 
    name: ActionName 
}

type GLTFChestResult = GLTF & {
    nodes: {
        Chest_Up_Material001_0: Mesh
        Chest_Bottom_Material001_0: Mesh
    }
    materials: {
        ['Material.001']: MeshStandardMaterial
    }
    animations: GLTFChestAction[]
}

function Chest() {
    const chestRef = useRef<Group>(null!);
    const { nodes, materials, animations } = useGLTF('/models/others/chest.glb') as unknown as GLTFChestResult;
    const { actions } = useAnimations(animations, chestRef);

    useEffect(() => {
        actions?.["ChestBodyChest_Shake"].reset().fadeIn(1).play();
    }, [actions]);

    return (
        <RigidBody type={"fixed"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group ref={chestRef} position={[0, 0.105, -0.75]} rotation={[0, Math.PI, 0]} scale={0.7}>
                <group name="Sketchfab_Scene">
                    <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
                        <group name="5d3129b8be9b44bc9a31100571ea4b98fbx" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
                            <group name="Object_2">
                                <group name="RootNode">
                                    <group name="ChestBody">
                                        <group name="Chest_Up" position={[0, 45.788, 26.662]}>
                                            <mesh name="Chest_Up_Material001_0" geometry={nodes.Chest_Up_Material001_0.geometry} material={materials['Material.001']} />
                                        </group>
                                        <group name="Chest_Bottom">
                                            <mesh name="Chest_Bottom_Material001_0" geometry={nodes.Chest_Bottom_Material001_0.geometry} material={materials['Material.001']} />
                                        </group>
                                    </group>
                                </group>
                            </group>
                        </group>
                    </group>
                </group>
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type GLTFBankResult = GLTF & {
    nodes: {
        cespugli_foglie_0: Mesh
        cespugli001_foglie_0: Mesh
        colonna_TEXTURE_0: Mesh
        colonna001_TEXTURE_0: Mesh
        colonna002_TEXTURE_0: Mesh
        colonna003_TEXTURE_0: Mesh
        Cube_TEXTURE_0: Mesh
        GRADINI_TEXTURE_0: Mesh
        piante_terra_0: Mesh
        piante_vasi_0: Mesh
        piante001_terra_0: Mesh
        piante001_vasi_0: Mesh
        SERRAMENTI_TEXTURE_0: Mesh
        struttura_TEXTURE_0: Mesh
        TETTOIA_TEXTURE_0: Mesh
        TETTU_TEXTURE_0: Mesh
        Text_TEXTURE_0: Mesh
        Text001_TEXTURE_0: Mesh
        VETRI_FINESTRE_VETRI_0: Mesh
        VETRI_PORTA_VETRI_0: Mesh
    }
    materials: {
        foglie: MeshStandardMaterial
        TEXTURE: MeshStandardMaterial
        terra: MeshStandardMaterial
        vasi: MeshStandardMaterial
        VETRI: MeshStandardMaterial
    }
}

function Bank() {
    const { nodes, materials } = useGLTF('/models/buildings/bank.glb') as unknown as GLTFBankResult;
    
    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group position={[0, 0.13, -1.89]} rotation={[0, -Math.PI / 2, 0]} scale={0.0012}>
                <group position={[562.027, 128.547, 586.928]} rotation={[-Math.PI / 2, 0, 0]} scale={[98.072, 118.406, 98.072]}>
                    <mesh geometry={nodes.piante_terra_0.geometry} material={materials.terra} />
                    <mesh geometry={nodes.piante_vasi_0.geometry} material={materials.vasi} />
                </group>
                <group position={[562.027, 128.547, -588.181]} rotation={[-Math.PI / 2, 0, 0]} scale={[98.072, 118.406, 98.072]}>
                    <mesh geometry={nodes.piante001_terra_0.geometry} material={materials.terra} />
                    <mesh geometry={nodes.piante001_vasi_0.geometry} material={materials.vasi} />
                </group>
                <mesh geometry={nodes.cespugli_foglie_0.geometry} material={materials.foglie} position={[560.182, 182, 587.864]} rotation={[-Math.PI / 2, 0, 0]} scale={[98.072, 118.406, 129.266]} />
                <mesh geometry={nodes.cespugli001_foglie_0.geometry} material={materials.foglie} position={[560.182, 182, -587.245]} rotation={[-Math.PI / 2, 0, 0]} scale={[98.072, 118.406, 129.266]} />
                <mesh geometry={nodes.colonna_TEXTURE_0.geometry} material={materials.TEXTURE} position={[492.584, 297.701, 205.066]} rotation={[-Math.PI / 2, 0, 0]} scale={[121.442, 121.442, 100]} />
                <mesh geometry={nodes.colonna001_TEXTURE_0.geometry} material={materials.TEXTURE} position={[492.584, 291.946, -207.444]} rotation={[-Math.PI / 2, 0, 0]} scale={[121.442, 121.442, 100]} />
                <mesh geometry={nodes.colonna002_TEXTURE_0.geometry} material={materials.TEXTURE} position={[492.584, 297.701, 463.866]} rotation={[-Math.PI / 2, 0, 0]} scale={[121.442, 121.442, 100]} />
                <mesh geometry={nodes.colonna003_TEXTURE_0.geometry} material={materials.TEXTURE} position={[492.584, 297.701, -496.73]} rotation={[-Math.PI / 2, 0, 0]} scale={[121.442, 121.442, 100]} />
                <mesh geometry={nodes.Cube_TEXTURE_0.geometry} material={materials.TEXTURE} position={[434.989, 655.381, -11.492]} rotation={[-Math.PI / 2, 0, 0]} scale={[136.325, 111.397, 111.397]} />
                <mesh geometry={nodes.GRADINI_TEXTURE_0.geometry} material={materials.TEXTURE} position={[0, 302.47, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
                <mesh geometry={nodes.SERRAMENTI_TEXTURE_0.geometry} material={materials.TEXTURE} position={[0, 302.47, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
                <mesh geometry={nodes.struttura_TEXTURE_0.geometry} material={materials.TEXTURE} position={[0, 302.47, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
                <mesh geometry={nodes.TETTOIA_TEXTURE_0.geometry} material={materials.TEXTURE} position={[459.951, 658.943, -28.117]} rotation={[-Math.PI / 2, 0, 0]} scale={[136.325, 111.397, 111.397]} />
                <mesh geometry={nodes.TETTU_TEXTURE_0.geometry} material={materials.TEXTURE} position={[0, 296.715, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
                <mesh geometry={nodes.Text_TEXTURE_0.geometry} material={materials.TEXTURE} position={[568.401, 672.237, 208.965]} rotation={[0, Math.PI / 2, 0]} scale={112.846} />
                <mesh geometry={nodes.Text001_TEXTURE_0.geometry} material={materials.TEXTURE} position={[301.659, 1004.683, 43.544]} rotation={[0, 1.571, 0]} scale={176.406} />
                <mesh geometry={nodes.VETRI_FINESTRE_VETRI_0.geometry} material={materials.VETRI} position={[0, 296.715, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
                <mesh geometry={nodes.VETRI_PORTA_VETRI_0.geometry} material={materials.VETRI} position={[0, 296.715, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
            </group>
        </RigidBody>
    )
}

/* ------------------------------------------------------------------------------------------------------------------ */

function Chance() {
    return (
        <RigidBody type={"fixed"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <Center disableX disableY disableZ>
                <Float position={[-0.25, 0.25, -0.75]} speed={8} floatingRange={[0.02, 0.1]} rotationIntensity={1} floatIntensity={2}>
                    <Text3D font={"/fonts/Fredoka-Regular.json"} size={0.8} height={0.08} receiveShadow castShadow>
                        {"?"}
                        <meshStandardMaterial color={yellow[600]} metalness={0.5}/>
                        <Edges color={"black"} lineWidth={0.5}/>
                    </Text3D>
                </Float>
            </Center>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function MetroEntrance() {
    const { nodes, materials } = useGLTF("/models/others/metro-entrance.glb");

    return (
        <RigidBody position={[0, 0.13, -1.315]} scale={0.35} type={"fixed"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["metro_entrance_01"] as Mesh).geometry} material={materials["lowpoly"]}/>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type GLTFJailResult = GLTF & {
    nodes: {
        defaultMaterial: Mesh
        defaultMaterial_1: Mesh
        defaultMaterial_2: Mesh
        defaultMaterial_3: Mesh
        defaultMaterial_4: Mesh
    }
    materials: {
        openPBR_shader1: MeshStandardMaterial
    }
}

function Jail() {
    const { nodes, materials } = useGLTF('/models/others/jail.glb') as unknown as GLTFJailResult;
    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group position={[0.5, 0.105, -0.5]} rotation={[-Math.PI / 2, 0, 0]} scale={0.004}>
                <group rotation={[Math.PI / 2, 0, 0]}>
                    <mesh position={[-98, 0, 10]} rotation={[0, Math.PI / 4, 0]} geometry={nodes.defaultMaterial.geometry} material={materials.openPBR_shader1} />
                    <mesh geometry={nodes.defaultMaterial_1.geometry} material={materials.openPBR_shader1} />
                    <mesh geometry={nodes.defaultMaterial_2.geometry} material={materials.openPBR_shader1} />
                    <mesh geometry={nodes.defaultMaterial_3.geometry} material={materials.openPBR_shader1} />
                    <mesh geometry={nodes.defaultMaterial_4.geometry} material={materials.openPBR_shader1} />
                </group>
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function WaterTower({ position, rotation = [0, 0, 0] }: BuildingCommonProps) {
    const { nodes, materials } = useGLTF("/models/buildings/water-tower.glb");

    return (
        <RigidBody type={"fixed"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["Object_84"] as Mesh).geometry} material={materials["LPMW-MaHa-_CityAssetPack"]} position={position} rotation={rotation} scale={0.25}/>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type GLTFPoliceCarResult = GLTF & {
    nodes: {
        Object_10: Mesh
        Object_11: Mesh
        Object_12: Mesh
        Object_13: Mesh
        Object_14: Mesh
        Object_4: Mesh
        Object_5: Mesh
        Object_6: Mesh
        Object_7: Mesh
        Object_8: Mesh
        Object_9: Mesh
        Object_16: Mesh
        Object_18: Mesh
        Object_19: Mesh
        Object_21: Mesh
        Object_23: Mesh
        Object_25: Mesh
        Object_29: Mesh
        Object_30: Mesh
        Object_31: Mesh
        Object_37: Mesh
        Object_39: Mesh
        Object_40: Mesh
        Object_41: Mesh
        Object_43: Mesh
        Object_44: Mesh
        Object_46: Mesh
        Object_47: Mesh
        Object_48: Mesh
        Object_49: Mesh
        Object_50: Mesh
        Object_52: Mesh
        Object_54: Mesh
        Object_56: Mesh
        Object_57: Mesh
        Object_58: Mesh
        Object_60: Mesh
        Object_61: Mesh
        Object_62: Mesh
        Object_64: Mesh
        Object_65: Mesh
        Object_66: Mesh
        Object_68: Mesh
        Object_72: Mesh
        Object_73: Mesh
    }
    materials: {
        ['Material.007']: MeshStandardMaterial
        ['Material.008']: MeshStandardMaterial
        car_black_remaining: MeshStandardMaterial
        Car_Black_Part: MeshStandardMaterial
        Grill_Back_Design: MeshStandardMaterial
        front_grill: MeshStandardMaterial
        material: MeshStandardMaterial
        Remaining_black_side_part: MeshStandardMaterial
        Headlight_back: MeshStandardMaterial
        Car_Glass: MeshStandardMaterial
        upper_yre_border: MeshStandardMaterial
        ['Material.003']: MeshStandardMaterial
        Mirrror_Border: MeshStandardMaterial
        Mirror_Glass: MeshStandardMaterial
        ['back_design.001']: MeshStandardMaterial
        back_design: MeshStandardMaterial
        yellow_light: MeshStandardMaterial
        Tyre_Outer_Design: MeshStandardMaterial
        Tyre__part: MeshStandardMaterial
        Tyre_design: MeshStandardMaterial
        back_bottom_metal: MeshStandardMaterial
        ['Material.002']: MeshStandardMaterial
        front_bar_design: MeshStandardMaterial
        ['Material.005']: MeshStandardMaterial
        HeadLight_Border: MeshStandardMaterial
        Headlight: MeshStandardMaterial
        Police_Siren: MeshStandardMaterial
        siren_midden_part: MeshStandardMaterial
        siren_red_light: MeshStandardMaterial
        Siren_Blue_light: MeshStandardMaterial
        siren_bottom: MeshStandardMaterial
        star_design: MeshStandardMaterial
        tail_lightt: MeshStandardMaterial
        til_light_border: MeshStandardMaterial
    }
}

function PoliceCar({ position, rotation = [0, 0, 0] }: CarCommonProps) {
    const { nodes, materials } = useGLTF('/models/cars/police-car.glb') as unknown as GLTFPoliceCarResult;
    
    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group position={position} rotation={rotation} scale={0.035} dispose={null} castShadow receiveShadow>
                <group position={[0.077, -0.141, 7.143]} scale={[3.09, 0.28, 0.28]}>
                    <mesh geometry={nodes.Object_10.geometry} material={materials['Material.007']} position={[0, 4.77, -26.732]} />
                    <mesh geometry={nodes.Object_11.geometry} material={materials['Material.008']} position={[0, 6.415, -26.777]} />
                    <mesh geometry={nodes.Object_12.geometry} material={materials.car_black_remaining} position={[0, 6.319, -3.519]} />
                    <mesh geometry={nodes.Object_13.geometry} material={materials.Car_Black_Part} position={[0.002, 3.021, -16.702]} />
                    <mesh geometry={nodes.Object_14.geometry} material={materials.Grill_Back_Design} position={[0, 3.548, -0.862]} />
                    <mesh geometry={nodes.Object_4.geometry} material={materials.front_grill} position={[0, 3.474, -0.758]} />
                    <mesh geometry={nodes.Object_5.geometry} material={materials.material} position={[0.004, 5.891, -19.936]} />
                    <mesh geometry={nodes.Object_6.geometry} material={materials.Remaining_black_side_part} position={[0, 5.363, -43.71]} />
                    <mesh geometry={nodes.Object_7.geometry} material={materials.Headlight_back} position={[0, 3.712, -2.411]} />
                    <mesh geometry={nodes.Object_8.geometry} material={materials.Car_Glass} position={[0, 9.224, -26.612]} />
                    <mesh geometry={nodes.Object_9.geometry} material={materials.upper_yre_border} position={[0, 2.468, -26.004]} />
                </group>
                <group position={[3.317, 1.256, -0.929]} scale={[0.151, 0.199, 0.434]}>
                    <mesh geometry={nodes.Object_16.geometry} material={materials['Material.003']} position={[-21.27, -0.054, -0.492]} />
                </group>
                <group position={[3.459, 1.734, 2.445]} scale={[0.214, 0.178, 0.081]}>
                    <mesh geometry={nodes.Object_18.geometry} material={materials.Mirrror_Border} position={[-16.192, 0.01, -2.994]} />
                    <mesh geometry={nodes.Object_19.geometry} material={materials.Mirror_Glass} position={[-16.775, 0.559, -3.281]} />
                </group>
                <group position={[0.077, 1.069, -4.007]} scale={[1.345, 0.523, 0.102]}>
                    <mesh geometry={nodes.Object_21.geometry} material={materials['back_design.001']} position={[0, 0.942, -30.172]} />
                </group>
                <group position={[0.077, 1.09, -3.961]} scale={[1.345, 0.443, 0.102]}>
                    <mesh geometry={nodes.Object_23.geometry} material={materials.back_design} position={[0, -0.347, -30.787]} />
                </group>
                <group position={[3.375, 1.185, -6.3]} rotation={[1.582, -1.397, 1.582]} scale={[0.629, 0.523, 0.102]}>
                    <mesh geometry={nodes.Object_25.geometry} material={materials.yellow_light} position={[-0.351, 1.175, 34.346]} />
                </group>
                <group position={[3.218, 0.042, 4.657]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[0.83, 0.32, 0.83]}>
                    <mesh geometry={nodes.Object_29.geometry} material={materials.Tyre_Outer_Design} position={[0, 0, 0.002]} />
                    <mesh geometry={nodes.Object_30.geometry} material={materials.Tyre__part} position={[0, -0.005, -0.014]} />
                    <mesh geometry={nodes.Object_31.geometry} material={materials.Tyre_design} position={[0, -0.002, 0]} />
                </group>
                <group position={[0.077, -0.141, 7.143]}>
                    <mesh geometry={nodes.Object_37.geometry} material={materials.back_bottom_metal} position={[0, 0.35, -14.188]} />
                </group>
                <group position={[0.077, -0.141, 3.175]} scale={[3.09, 0.28, 0.28]}>
                    <mesh geometry={nodes.Object_39.geometry} material={materials['Material.002']} position={[0, 0.687, 12.263]} />
                    <mesh geometry={nodes.Object_40.geometry} material={materials.front_bar_design} position={[0, 0.938, 13.315]} />
                    <mesh geometry={nodes.Object_41.geometry} material={materials['Material.005']} position={[0, 1.841, 12.306]} />
                </group>
                <group position={[0.077, -0.141, 7.089]}>
                    <mesh geometry={nodes.Object_43.geometry} material={materials.HeadLight_Border} position={[0, 1.037, -0.614]} />
                    <mesh geometry={nodes.Object_44.geometry} material={materials.Headlight} position={[0, 1.035, -0.627]} />
                </group>
                <group position={[11.099, 2.111, 5.512]}>
                    <mesh geometry={nodes.Object_46.geometry} material={materials.Police_Siren} position={[-12.879, 1.428, -5.834]} />
                    <mesh geometry={nodes.Object_47.geometry} material={materials.siren_midden_part} position={[-11.038, 1.983, -5.848]} />
                    <mesh geometry={nodes.Object_48.geometry} material={materials.siren_red_light} position={[-9.462, 1.735, -5.847]} />
                    <mesh geometry={nodes.Object_49.geometry} material={materials.Siren_Blue_light} position={[-12.607, 1.728, -5.849]} />
                    <mesh geometry={nodes.Object_50.geometry} material={materials.siren_bottom} position={[-9.186, 1.428, -5.841]} />
                </group>
                <group position={[0.077, -0.141, 7.143]} scale={[3.09, 0.28, 0.28]}>
                    <mesh geometry={nodes.Object_52.geometry} material={materials.siren_bottom} position={[0, 12.767, -26.433]} />
                </group>
                <group position={[3.357, 1.185, 6.017]} rotation={[1.615, -1.527, 1.615]} scale={[0.629, 0.523, 0.102]}>
                    <mesh geometry={nodes.Object_54.geometry} material={materials.yellow_light} position={[-0.347, 0.292, 33.837]} />
                </group>
                <group position={[-3.114, 0.042, 4.657]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[0.83, 0.32, 0.83]}>
                    <mesh geometry={nodes.Object_56.geometry} material={materials.Tyre_Outer_Design} position={[0, 0, 0.002]} />
                    <mesh geometry={nodes.Object_57.geometry} material={materials.Tyre__part} position={[0, -0.005, -0.014]} />
                    <mesh geometry={nodes.Object_58.geometry} material={materials.Tyre_design} position={[0, -0.002, 0]} />
                </group>
                <group position={[3.218, 0.042, -5.07]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
                    <mesh geometry={nodes.Object_60.geometry} material={materials.Tyre_Outer_Design} position={[-0.001, 0, 0.005]} />
                    <mesh geometry={nodes.Object_61.geometry} material={materials.Tyre__part} position={[-0.002, -0.007, -0.026]} />
                    <mesh geometry={nodes.Object_62.geometry} material={materials.Tyre_design} position={[0.003, -0.001, 0.001]} />
                </group>
                <group position={[-3.114, 0.042, -5.07]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[0.83, 0.32, 0.83]}>
                    <mesh geometry={nodes.Object_64.geometry} material={materials.Tyre_Outer_Design} position={[0, 0, 0.002]} />
                    <mesh geometry={nodes.Object_65.geometry} material={materials.Tyre__part} position={[0, -0.005, -0.014]} />
                    <mesh geometry={nodes.Object_66.geometry} material={materials.Tyre_design} position={[0, -0.002, 0]} />
                </group>
                <group position={[3.381, 0.936, 1.396]} rotation={[2.219, 0.037, -1.603]} scale={[0.492, 0.073, 0.492]}>
                    <mesh geometry={nodes.Object_68.geometry} material={materials.star_design} position={[0.205, -45.363, -0.233]} />
                </group>
                <group position={[2.896, 0.879, -7.097]}>
                    <mesh geometry={nodes.Object_72.geometry} material={materials.tail_lightt} position={[-2.819, -0.009, -0.08]} />
                    <mesh geometry={nodes.Object_73.geometry} material={materials.til_light_border} position={[-2.819, -0.008, 0.052]} />
                </group>
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function Crosswalk({ position, rotation = [0, 0, 0] }: FoundationCommonProps) {
    const { nodes, materials } = useGLTF("/models/foundations/road-crossing-curbcut.glb");

    return (
        <RigidBody>
            <mesh geometry={(nodes["road_crossing_curbcut_01"] as Mesh).geometry} material={materials["lowpoly"]} position={position} rotation={rotation} scale={0.25}/>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function ParkingBay({ position, rotation = [0, 0, 0] }: FoundationCommonProps) {
    const { nodes, materials } = useGLTF("/models/foundations/parking-bay.glb");

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["parking_bay_accessible_01"] as Mesh).geometry} material={materials["lowpoly"]} position={position} rotation={rotation} scale={0.25} />
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function RoadStraight({ position, rotation = [0, 0, 0] }: FoundationCommonProps) {
    const { nodes, materials } = useGLTF("/models/foundations/road-straight.glb");

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["road_straight_accessible_01"] as Mesh).geometry} material={materials["lowpoly"]} position={position} rotation={rotation} scale={0.25}/>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function ParkingSign({ position, rotation = [0, 0, 0] }: OtherCommonProps) {
    const { nodes, materials } = useGLTF("/models/others/parking-sign.glb");

    return (
        <RigidBody type={"fixed"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["sign_accessible_symbol_01"] as Mesh).geometry} material={materials["lowpoly"]} position={position} rotation={rotation} scale={0.25}/>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function GoSpace() {
    return (
        <group position={[7.75, 0, 7.75]}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[2, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshStandardMaterial attach={`material-${index}`} color={index === 2 ? grey[100] : grey[500]} key={`go-space-material-${index}`} />
                    )}
                    {/* <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.2} position={[0, 0.105, -0.55]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]}>{"Collect 200$ Salary\nAs You Pass"}</Text>
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.5} position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]}>GO</Text>
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={1} position={[0, 0.105, 0.55]} rotation={[-Math.PI / 2, 0, 0]} color={red[700]}>←</Text> */}
                    <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Box className="relative size-133 bg-zinc-200">
                            <Stack className="size-full justify-center items-center select-none -rotate-45" spacing={2}>
                                <Typography className="max-w-md font-fredoka! text-5xl! text-center leading-snug">Collect 200$ Salary As You Pass</Typography>
                                <Typography className="font-fredoka! text-8xl!">GO</Typography>
                            </Stack>
                            <West className="absolute bottom-0 left-1/2 -translate-x-1/2 size-35! scale-x-250 text-red-600"/>
                        </Box>
                    </Html>
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            <StartLine/>
            <FinishLine/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function JailSpace() {
    return (
        <group position={[-7.75, 0, 7.75]}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[2, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshStandardMaterial attach={`material-${index}`} color={index === 2 ? grey[100] : grey[500]} key={`go-space-material-${index}`} />
                    )}
                    <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Box className="relative size-133 select-none bg-zinc-200">
                            <Typography className="absolute bottom-25 right-15 font-fredoka! text-7xl!">Visiting</Typography>
                            <Typography className="absolute top-35 left-15 font-fredoka! text-7xl! rotate-90">Just</Typography>
                        </Box>
                    </Html>
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            <Jail/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function FreeParkingSpace() {
    return (
        <group position={[-7.75, 0, -7.75]}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <group receiveShadow>
                    <mesh position={[0, -0.021, 0.5]} receiveShadow>
                        <boxGeometry args={[2, 0.159, 1]} />
                        <meshStandardMaterial color={grey[500]}/>
                        <Edges color={"black"} lineWidth={1.5} />
                    </mesh>
                    <mesh position={[0, 0, -0.5]} receiveShadow>
                        <boxGeometry args={[2, 0.2, 1]}/>
                        {Array.from({ length: 6 }).map((_, index) =>
                            <meshStandardMaterial attach={`material-${index}`} color={index === 2 ? grey[100] : grey[500]} key={`go-space-material-${index}`} />
                        )}
                        <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                            <Stack className="w-133 h-66.5 justify-center items-center select-none bg-zinc-200 rotate-180" spacing={2}>
                                <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">Free Parking</Typography>
                            </Stack>
                        </Html>
                        <Edges color={"black"} lineWidth={1.5} />
                    </mesh>
                </group>
            </RigidBody>
            <ParkingBay position={[0.5, 0.06, 0.5]} rotation={[0, -Math.PI / 2, 0]}/>
            <Crosswalk position={[-0.5, 0.06, 0.5]} rotation={[0, -Math.PI / 2, 0]}/>
            <ParkingSign position={[0, 0.1, 0.05]} rotation={[0, -Math.PI / 2, 0]}/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function GoToJailSpace() {
    return (
        <group position={[7.75, 0, -7.75]} receiveShadow>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[2, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshStandardMaterial attach={`material-${index}`} color={index === 2 ? grey[100] : grey[500]} key={`go-space-material-${index}`} />
                    )}
                    <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Stack className="size-133 justify-center items-center select-none bg-zinc-200 -rotate-90" spacing={2}>
                            <Box className="place-content-center place-items-center -rotate-45">
                                <Typography className="font-fredoka! text-6xl! text-center leading-snug whitespace-break-spaces">Go To Jail</Typography>
                                <Box className="size-40" component={"img"} src={"/images/jail.png"} draggable={false}/>
                            </Box>
                        </Stack>
                    </Html>
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            <PoliceCar position={[-0.5, 0.14, 0.5]} rotation={[0, Math.PI / 4, 0]}/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function CommunityChestSpace({ position, rotation = [0, 0, 0] }: SpaceCommonProps) {
    return (
        <group position={position} rotation={rotation}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshStandardMaterial attach={`material-${index}`} color={index === 2 ? grey[100] : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Box className="w-97.75 h-133.5 place-content-end place-items-center bg-zinc-100 select-none">
                            <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">{"Community\nChest"}</Typography>
                            <Box className="size-60" component={"img"} src={"/images/community_chest.png"} draggable={false}/>
                        </Box>
                    </Html>
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            <Chest/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type TaxSpaceProps = {
    taxValue: number,
    label: string
}

function TaxSpace({ position, rotation = [0, 0, 0], label, taxValue }: SpaceCommonProps & TaxSpaceProps) {
    return (
        <group position={position} rotation={rotation}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshStandardMaterial attach={`material-${index}`} color={index === 2 ? grey[100] : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Box className="w-97.75 h-133.5 place-content-center place-items-center bg-zinc-100 select-none">
                            <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">{label}</Typography>
                            <Typography className="mt-30! font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">Pay {taxValue}$</Typography>
                        </Box>
                    </Html>
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            <Bank />
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function ChanceSpace({ position, rotation = [0, 0, 0] }: SpaceCommonProps) {
    return (
        <group position={position} rotation={rotation}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshStandardMaterial attach={`material-${index}`} color={index === 2 ? grey[100] : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Stack className="w-97.75 h-133.5 justify-center items-center bg-zinc-100 select-none">
                            <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">Chance</Typography>
                            <QuestionMark className="size-50! mt-10! text-zinc-800"/>
                        </Stack>
                    </Html>
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            <Chance/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type RailroadSpaceProps = {
    label: string
}

function RailroadSpace({ position, rotation = [0, 0, 0], label }: SpaceCommonProps & RailroadSpaceProps) {
    return (
        <group position={position} rotation={rotation}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshStandardMaterial attach={`material-${index}`} color={index === 2 ? grey[100] : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Stack className="w-97.75 h-133.5 justify-center items-center bg-zinc-100 select-none">
                            <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">{label}</Typography>
                            <DirectionsTransit className={"size-50! mt-5! text-zinc-800"}/>
                        </Stack>
                    </Html>
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            <MetroEntrance/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type UtilitySpaceProps = {
    type: "ELECTRIC" | "WATER"
}

function UtilitySpace({ position, rotation = [0, 0, 0], type }: SpaceCommonProps & UtilitySpaceProps) {
    
    return (
        <group position={position} rotation={rotation}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshStandardMaterial attach={`material-${index}`} color={index === 2 ? grey[100] : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Stack className="w-97.75 h-133.5 justify-center items-center bg-zinc-100 select-none">
                            <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">{type === "ELECTRIC" ? "Electric\nCompany" : "Water\nWorks"}</Typography>
                            {type === "ELECTRIC" ? (
                                <Bolt className={"size-50! mt-5! text-yellow-300"} />
                            ) : (
                                <WaterDrop className={"size-50! mt-5! text-blue-400"} />
                            )}
                        </Stack>
                    </Html>
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            {type === "ELECTRIC" ? (
                <></>
            ) : (
                <WaterTower position={[0, 0.13, -1.75]} rotation={[0, -Math.PI / 2, 0]}/>
            )};
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type PropertySpaceProps = {
    group: SpaceGroup
    label: string
}

function PropertySpace({ position, rotation = [0, 0, 0], group, label }: SpaceCommonProps & PropertySpaceProps) {
    const propertyGroupColor = useMemo(() => {
        switch (group) {
            case "BROWN": return brown[500];
            case "CYAN": return blue[300];
            case "PINK": return pink[300];
            case "ORANGE": return orange[500];
            case "RED": return red[500];
            case "YELLOW": return yellow[500];
            case "GREEN": return green[500];
            case "BLUE": return blue[900];
            default: return grey[200];
        }
    }, [group]);

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group position={position} rotation={rotation} receiveShadow castShadow>
                <mesh position={[0, 0, 0]} receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshStandardMaterial attach={`material-${index}`} color={index === 2 ? grey[100] : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    {/* <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.2} position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]}>{label}</Text> */}
                    <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Box className="w-97.75 h-133.5 select-none">
                            <Box className={`w-full h-30`} sx={{ bgcolor: propertyGroupColor }}/>
                            <Stack className="size-full items-center bg-zinc-100">
                                <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">{label}</Typography>
                            </Stack>
                        </Box>
                    </Html>
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

export function Board() {
    
    return (
        <group position={[0, 0, 0]}>
            {/* Middle square */}
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh position={[0, 0, 0]} receiveShadow>
                    <boxGeometry args={[13.5, 0.2, 13.5]} />
                    <meshStandardMaterial color={green[400]} />
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>

            <GoSpace/>
            <JailSpace/>
            <FreeParkingSpace/>
            <GoToJailSpace/>

            {properties.map(property =>
                <PropertySpace position={property.position as [x: number, y: number, z: number]} rotation={property.rotation as [x: number, y: number, z: number]} group={property.group as SpaceGroup} label={property.name} key={property.id}/>
            )}

            {railroads.map(railroad =>
                <RailroadSpace position={railroad.position as [x: number, y: number, z: number]} rotation={railroad.rotation as [x: number, y: number, z: number]} label={railroad.name} key={railroad.id}/>
            )}

            {utilities.map(utility =>
                <UtilitySpace position={utility.position as [x: number, y: number, z: number]} rotation={utility.rotation as [x: number, y: number, z: number]} type={utility.type as "ELECTRIC" | "WATER"} key={utility.id}/>
            )}

            {taxes.map(tax => 
                <TaxSpace position={tax.position as [x: number, y: number, z: number]} rotation={tax.rotation as [x: number, y: number, z: number]} label={tax.name} taxValue={tax.taxValue} key={tax.id}/>
            )}

            {chests.map(chest =>
                <CommunityChestSpace position={chest.position as [x: number, y: number, z: number]} rotation={chest.rotation as [x: number, y: number, z: number]} key={chest.id}/>
            )}

            {chances.map(chance =>
                <ChanceSpace position={chance.position as [x: number, y: number, z: number]} rotation={chance.rotation as [x: number, y: number, z: number]} key={chance.id}/>
            )}

            {/* <PropertySpace position={[6, 0, 7.75]} group={"BROWN"} label={"Mediterranean\nAvenue"}/>
            <CommunityChestSpace position={[4.5, 0, 7.75]}/>
            <PropertySpace position={[3, 0, 7.75]}  group={"BROWN"} label={"Baltic\nAvenue"}/>
            <TaxSpace position={[1.5, 0, 7.75]} label={"Income Tax"} taxValue={200}/>
            <RailroadSpace position={[0, 0, 7.75]} label={"Reading\nRailroad"}/>
            <PropertySpace position={[-1.5, 0, 7.75]} group={"CYAN"} label={"Oriental\nAvenue"}/>
            <ChanceSpace position={[-3, 0, 7.75]}/>
            <PropertySpace position={[-4.5, 0, 7.75]} group={"CYAN"} label={"Vermont\nAvenue"}/>
            <PropertySpace position={[-6, 0, 7.75]} group={"CYAN"} label={"Connecticut\nAvenue"}/>

            <PropertySpace position={[-7.75, 0, 6]} rotation={[0, -Math.PI / 2, 0]} group={"PINK"} label={"St. Charles\nPlace"}/>
            <UtilitySpace position={[-7.75, 0, 4.5]} rotation={[0, -Math.PI / 2, 0]} type={"ELECTRIC"}/>
            <PropertySpace position={[-7.75, 0, 3]} rotation={[0, -Math.PI / 2, 0]} group={"PINK"} label={"States\nAvenue"}/>
            <PropertySpace position={[-7.75, 0, 1.5]} rotation={[0, -Math.PI / 2, 0]} group={"PINK"} label={"Virginia\nAvenue"}/>
            <RailroadSpace position={[-7.75, 0, 0]} rotation={[0, -Math.PI / 2, 0]} label={"Pennsylvania\nRailroad"}/>
            <PropertySpace position={[-7.75, 0, -1.5]} rotation={[0, -Math.PI / 2, 0]} group={"ORANGE"} label={"St. James\nPlace"}/>
            <CommunityChestSpace position={[-7.75, 0, -3]} rotation={[0, -Math.PI / 2, 0]}/>
            <PropertySpace position={[-7.75, 0, -4.5]} rotation={[0, -Math.PI / 2, 0]} group={"ORANGE"} label={"Tennessee\nAvenue"}/>
            <PropertySpace position={[-7.75, 0, -6]} rotation={[0, -Math.PI / 2, 0]} group={"ORANGE"} label={"New York\nAvenue"}/>
            
            <PropertySpace position={[-6, 0, -7.75]} rotation={[0, -Math.PI, 0]} group={"RED"} label={"Kentucky\nAvenue"}/>
            <ChanceSpace position={[-4.5, 0, -7.75]} rotation={[0, -Math.PI, 0]}/>
            <PropertySpace position={[-3, 0, -7.75]} rotation={[0, -Math.PI, 0]} group={"RED"} label={"Indiana\nAvenue"}/>
            <PropertySpace position={[-1.5, 0, -7.75]} rotation={[0, -Math.PI, 0]} group={"RED"} label={"Illinois\nAvenue"}/>
            <RailroadSpace position={[0, 0, -7.75]} rotation={[0, -Math.PI, 0]} label={"B&O\nRailroad"}/>
            <PropertySpace position={[1.5, 0, -7.75]} rotation={[0, -Math.PI, 0]} group={"YELLOW"} label={"Atlantic\nAvenue"}/>
            <PropertySpace position={[3, 0, -7.75]} rotation={[0, -Math.PI, 0]} group={"YELLOW"} label={"Ventnor\nAvenue"}/>
            <UtilitySpace position={[4.5, 0, -7.75]} rotation={[0, -Math.PI, 0]} type={"WATER"}/>
            <PropertySpace position={[6, 0, -7.75]} rotation={[0, -Math.PI, 0]} group={"YELLOW"} label={"Marvin\nGardens"}/>
            
            <PropertySpace position={[7.75, 0, -6]} rotation={[0, Math.PI / 2, 0]} group={"GREEN"} label={"Pacific\nAvenue"}/>
            <PropertySpace position={[7.75, 0, -4.5]} rotation={[0, Math.PI / 2, 0]} group={"GREEN"} label={"North Carolina\nAvenue"}/>
            <CommunityChestSpace position={[7.75, 0, -3]} rotation={[0, Math.PI / 2, 0]}/>
            <PropertySpace position={[7.75, 0, -1.5]} rotation={[0, Math.PI / 2, 0]} group={"GREEN"} label={"Pennsylvania\nAvenue"}/>
            <RailroadSpace position={[7.75, 0, 0]} rotation={[0, Math.PI / 2, 0]} label={"Short Line\nRailroad"}/>
            <ChanceSpace position={[7.75, 0, 1.5]} rotation={[0, Math.PI / 2, 0]}/>
            <PropertySpace position={[7.75, 0, 3]} rotation={[0, Math.PI / 2, 0]} group={"BLUE"} label={"Park\nPlace"}/>
            <TaxSpace position={[7.75, 0, 4.5]} rotation={[0, Math.PI / 2, 0]} label={"Luxury Tax"} taxValue={100}/>
            <PropertySpace position={[7.75, 0, 6]} rotation={[0, Math.PI / 2, 0]} group={"BLUE"} label={"Boardwalk"}/> */}

            <RoadStraight position={[-9.25, 0.05675, -7.25]} rotation={[0, -Math.PI / 2, 0]}/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

useGLTF.preload("/models/others/sky-day-dome.glb");
useGLTF.preload("/models/others/chest.glb");
useGLTF.preload("/models/buildings/bank.glb");
useGLTF.preload("/models/others/metro-entrance.glb");
useGLTF.preload("/models/others/jail.glb");
useGLTF.preload("/models/foundations/parking-bay.glb");
useGLTF.preload("/models/foundations/road-crossing-curbcut.glb");
useGLTF.preload("/models/others/parking-sign.glb");
useGLTF.preload("/models/foundations/road-straight.glb");
useGLTF.preload("/models/buildings/water-tower.glb");
useGLTF.preload("/models/cars/police-car.glb");