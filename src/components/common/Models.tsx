import { ActiveCollisionTypes } from "@dimforge/rapier3d-compat";
import { blue, brown, green, grey, orange, pink, red, yellow } from "@mui/material/colors";
import { Center, Edges, Float, Image, Instance, Instances, Text, Text3D, useAnimations, useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import { RapierRigidBody, RigidBody, type IntersectionEnterPayload } from "@react-three/rapier";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimationClip, Euler, MathUtils, Mesh, MeshStandardMaterial, PlaneGeometry, RepeatWrapping, Vector3, type Group } from "three";
import { Group as SpaceGroup } from "../../constants/Group";
import { SkeletonUtils, type GLTF } from "three-stdlib";
import { Water } from "three/examples/jsm/objects/Water.js";
import { properties, railroads, utilities, taxes, chests, chances } from "../../assets/data/board.json";
import { foundations, cars, buildings, others } from "../../assets/data/scenery.json";
import { SceneryContext } from "../../contexts/SceneryContext";
import { useSpaceHover } from "../../hooks/useSpaceHover";
import { CAR_RUN_VECLOTIY_LAMBDA, CAR_STOP_VELOCITY_LAMBDA, OAK_MAX_SCALE, OAK_MIN_SCALE, PINE_MAX_SCALE, PINE_MIN_SCALE } from "../../constants/SceneProps";
import { extend } from "@react-three/fiber";
import { Smoke } from "./Effects";
import type { SkinnedMesh } from "three";
import type { Bone } from "three";

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
    initialPosition: [x: number, y: number, z: number],
    initialRotation?: [x: number, y: number, z: number]
}

/* ------------------------------------------------------------------------------------------------------------------ */

type OtherCommonProps = {
    position: [x: number, y: number, z: number],
    rotation?: [x: number, y: number, z: number]
}

/* ------------------------------------------------------------------------------------------------------------------ */

extend({ Water });

// TypeScript type augmentation (optional if using TS)
declare module "@react-three/fiber" {
    interface ThreeElements {
        water: any
    }
}

export function Ocean() {
    const ref = useRef<Water>(null!);

    // Load a normal map for the water ripples 
    // (Three.js examples usually use 'waternormals.jpg')
    const waterTexture = useTexture("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg");

    waterTexture.wrapS = waterTexture.wrapT = RepeatWrapping;

    // Create the water geometry (a large flat plane)
    const geometry = useMemo(() => new PlaneGeometry(60, 60), []);

    // Configure the water shader parameters using useMemo
    const config = useMemo(() => ({
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterTexture,
        sunDirection: new Vector3(),
        sunColor: 0xffffff,
        waterColor: blue[800],
        distortionScale: 3.7,
        fog: false,
    }), [waterTexture]);

    // Animate the water wave time factor on every frame
    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.material.uniforms["time"].value += delta * 0.3;
        }
    });

    return <water ref={ref} args={[geometry, config]} rotation={[-Math.PI / 2, 0, 0]} />;
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
        targetRotation.current.set(currentRotation.x, currentRotation.y - 0.0002, currentRotation.z);

        skyDome.setRotationFromEuler(targetRotation.current);
    });

    return (
        <group ref={skyDomeRef} position={[0, 11.4, 0]} scale={9} castShadow>
            <primitive object={scene}/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function StartLine() {
    return (
        <RigidBody type={"fixed"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh position={[-1.25, 0.85, -0.75]} receiveShadow castShadow>
                <cylinderGeometry args={[0.06, 0.06, 1.5, 32]} />
                <meshStandardMaterial color={grey[100]} metalness={0.8} roughness={0.2}/>
                <Edges color={"black"} lineWidth={1.5}/>
            </mesh>
            <mesh position={[-1.25, 1.4, 0.25]} receiveShadow castShadow>
                <boxGeometry args={[0.05, 0.35, 1.9]} />
                <meshStandardMaterial color={blue[400]} metalness={0.2} roughness={0.2}/>
                <Text font={"/fonts/Fredoka-Regular.ttf"} fontSize={0.2} position={[-0.026, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>Start</Text>
                <Text font={"/fonts/Fredoka-Regular.ttf"} fontSize={0.2} position={[0.026, 0, 0]} rotation={[0, Math.PI / 2, 0]}>Start</Text>
                <Edges color={"black"} lineWidth={1.5}/>
            </mesh>
            <mesh position={[-1.25, 0.85, 1.25]} receiveShadow castShadow>
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
            <mesh position={[1.25, 0.85, -1.25]} receiveShadow castShadow>
                <cylinderGeometry args={[0.06, 0.06, 1.5, 32]} />
                <meshStandardMaterial color={grey[100]} metalness={0.8} roughness={0.2}/>
                <Edges color={"black"} lineWidth={1.5}/>
            </mesh>
            <mesh position={[0.25, 1.4, -1.25]} receiveShadow castShadow>
                <boxGeometry args={[1.9, 0.35, 0.05]} />
                <meshStandardMaterial color={red[400]} metalness={0.2} roughness={0.2}/>
                <Text font={"/fonts/Fredoka-Regular.ttf"} fontSize={0.2} position={[0, 0, -0.026]} rotation={[0, Math.PI, 0]}>Finish</Text>
                <Text font={"/fonts/Fredoka-Regular.ttf"} fontSize={0.2} position={[0, 0, 0.026]} rotation={[0, -Math.PI * 2, 0]}>Finish</Text>
                <Edges color={"black"} lineWidth={1.5}/>
            </mesh>
            <mesh position={[-0.75, 0.85, -1.25]} receiveShadow castShadow>
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
        actions?.["ChestBodyChest_Shake"]?.reset().fadeIn(1).play();
    }, [actions]);

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group ref={chestRef} position={[0, 0.105, -0.75]} rotation={[0, Math.PI, 0]} scale={0.7}>
                <group name="Sketchfab_Scene">
                    <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
                        <group name="5d3129b8be9b44bc9a31100571ea4b98fbx" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
                            <group name="Object_2">
                                <group name="RootNode">
                                    <group name="ChestBody">
                                        <group name="Chest_Up" position={[0, 45.788, 26.662]}>
                                            <mesh name="Chest_Up_Material001_0" geometry={nodes.Chest_Up_Material001_0.geometry} material={materials['Material.001']} castShadow/>
                                        </group>
                                        <group name="Chest_Bottom">
                                            <mesh name="Chest_Bottom_Material001_0" geometry={nodes.Chest_Bottom_Material001_0.geometry} material={materials['Material.001']} castShadow/>
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

// function Apartment(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/apartment.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["apartment_block_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.2} castShadow receiveShadow/>
//         </RigidBody>
//     );
// }

function ApartmentInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/apartment.glb");

    const { apartments } = buildings;
    
    return (
        <Instances geometry={(nodes["apartment_block_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {apartments.map((apartment, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`apartment-${index}`} ccd>
                    <Instance position={apartment.position as [x: number, y: number, z: number]} rotation={apartment.rotation as [x: number, y: number, z: number]} scale={0.18}/>
                </RigidBody>
            )}
        </Instances>
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
                    <mesh geometry={nodes.piante_terra_0.geometry} material={materials.terra} castShadow />
                    <mesh geometry={nodes.piante_vasi_0.geometry} material={materials.vasi} castShadow />
                </group>
                <group position={[562.027, 128.547, -588.181]} rotation={[-Math.PI / 2, 0, 0]} scale={[98.072, 118.406, 98.072]}>
                    <mesh geometry={nodes.piante001_terra_0.geometry} material={materials.terra} castShadow />
                    <mesh geometry={nodes.piante001_vasi_0.geometry} material={materials.vasi} castShadow />
                </group>
                <mesh geometry={nodes.cespugli_foglie_0.geometry} material={materials.foglie} position={[560.182, 182, 587.864]} rotation={[-Math.PI / 2, 0, 0]} scale={[98.072, 118.406, 129.266]} castShadow />
                <mesh geometry={nodes.cespugli001_foglie_0.geometry} material={materials.foglie} position={[560.182, 182, -587.245]} rotation={[-Math.PI / 2, 0, 0]} scale={[98.072, 118.406, 129.266]} castShadow />
                <mesh geometry={nodes.colonna_TEXTURE_0.geometry} material={materials.TEXTURE} position={[492.584, 297.701, 205.066]} rotation={[-Math.PI / 2, 0, 0]} scale={[121.442, 121.442, 100]} castShadow />
                <mesh geometry={nodes.colonna001_TEXTURE_0.geometry} material={materials.TEXTURE} position={[492.584, 291.946, -207.444]} rotation={[-Math.PI / 2, 0, 0]} scale={[121.442, 121.442, 100]} castShadow />
                <mesh geometry={nodes.colonna002_TEXTURE_0.geometry} material={materials.TEXTURE} position={[492.584, 297.701, 463.866]} rotation={[-Math.PI / 2, 0, 0]} scale={[121.442, 121.442, 100]} castShadow />
                <mesh geometry={nodes.colonna003_TEXTURE_0.geometry} material={materials.TEXTURE} position={[492.584, 297.701, -496.73]} rotation={[-Math.PI / 2, 0, 0]} scale={[121.442, 121.442, 100]} castShadow />
                <mesh geometry={nodes.Cube_TEXTURE_0.geometry} material={materials.TEXTURE} position={[434.989, 655.381, -11.492]} rotation={[-Math.PI / 2, 0, 0]} scale={[136.325, 111.397, 111.397]} castShadow />
                <mesh geometry={nodes.GRADINI_TEXTURE_0.geometry} material={materials.TEXTURE} position={[0, 302.47, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} castShadow receiveShadow/>
                <mesh geometry={nodes.SERRAMENTI_TEXTURE_0.geometry} material={materials.TEXTURE} position={[0, 302.47, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} castShadow />
                <mesh geometry={nodes.struttura_TEXTURE_0.geometry} material={materials.TEXTURE} position={[0, 302.47, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} castShadow receiveShadow/>
                <mesh geometry={nodes.TETTOIA_TEXTURE_0.geometry} material={materials.TEXTURE} position={[459.951, 658.943, -28.117]} rotation={[-Math.PI / 2, 0, 0]} scale={[136.325, 111.397, 111.397]} castShadow />
                <mesh geometry={nodes.TETTU_TEXTURE_0.geometry} material={materials.TEXTURE} position={[0, 296.715, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} castShadow />
                <mesh geometry={nodes.Text_TEXTURE_0.geometry} material={materials.TEXTURE} position={[568.401, 672.237, 208.965]} rotation={[0, Math.PI / 2, 0]} scale={112.846} castShadow />
                <mesh geometry={nodes.Text001_TEXTURE_0.geometry} material={materials.TEXTURE} position={[301.659, 1004.683, 43.544]} rotation={[0, 1.571, 0]} scale={176.406} castShadow receiveShadow/>
                <mesh geometry={nodes.VETRI_FINESTRE_VETRI_0.geometry} material={materials.VETRI} position={[0, 296.715, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} castShadow receiveShadow/>
                <mesh geometry={nodes.VETRI_PORTA_VETRI_0.geometry} material={materials.VETRI} position={[0, 296.715, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} castShadow receiveShadow/>
            </group>
        </RigidBody>
    )
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function CafeBrasserie(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/cafe-brasserie.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["cafe_brasserie_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.25} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function CafeBrasserieInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/cafe-brasserie.glb");

    const { cafeBrasseries } = buildings;

    return (
        <Instances geometry={(nodes["cafe_brasserie_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {cafeBrasseries.map((cafeBrasserie, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`cafe-brasserie-${index}`} ccd>
                    <Instance position={cafeBrasserie.position as [x: number, y: number, z: number]} rotation={cafeBrasserie.rotation as [x: number, y: number, z: number]} scale={0.1925}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function Boulangerie(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/boulangerie.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["boulangerie_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.26} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function BoulangerieInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/boulangerie.glb");

    const { boulangeries } = buildings;

    return (
        <Instances geometry={(nodes["boulangerie_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {boulangeries.map((boulangerie, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`boulangerie-${index}`} ccd>
                    <Instance position={boulangerie.position as [x: number, y: number, z: number]} rotation={boulangerie.rotation as [x: number, y: number, z: number]} scale={0.2}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function ConvenienceStore(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/convenience-store.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["convenience_store_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.25} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function ConvenienceStoreInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/convenience-store.glb");

    const { convenienceStores } = buildings;

    return (
        <Instances geometry={(nodes["convenience_store_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {convenienceStores.map((convenienceStore, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`convenience-store-${index}`} ccd>
                    <Instance position={convenienceStore.position as [x: number, y: number, z: number]} rotation={convenienceStore.rotation as [x: number, y: number, z: number]} scale={0.2}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function CornerStore(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/corner-store.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["corner_store_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.25} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function CornerStoreInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/corner-store.glb");

    const { cornerStores } = buildings;

    return (
        <Instances geometry={(nodes["corner_store_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {cornerStores.map((cornerStore, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`corner-store-${index}`} ccd>
                    <Instance position={cornerStore.position as [x: number, y: number, z: number]} rotation={cornerStore.rotation as [x: number, y: number, z: number]} scale={0.25}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function DecoHotel(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/deco-hotel.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["deco_hotel_three_bay"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.2} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function DecoHotelInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/deco-hotel.glb");

    const { decoHotels } = buildings;

    return (
        <Instances geometry={(nodes["deco_hotel_three_bay"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {decoHotels.map((decoHotel, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`deco-hotel-${index}`} ccd>
                    <Instance position={decoHotel.position as [x: number, y: number, z: number]} rotation={decoHotel.rotation as [x: number, y: number, z: number]} scale={0.2}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function DecoShopfrontRow(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/deco-shopfront-row.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["deco_shopfront_row"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.18} castShadow receiveShadow/>
//         </RigidBody>
//     );
// }

function DecoShopfrontRowInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/deco-shopfront-row.glb");

    const { decoShopfrontRows } = buildings;

    return (
        <Instances geometry={(nodes["deco_shopfront_row"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {decoShopfrontRows.map((decoShopfrontRow, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`deco-shopfront-row-${index}`} ccd>
                    <Instance position={decoShopfrontRow.position as [x: number, y: number, z: number]} rotation={decoShopfrontRow.rotation as [x: number, y: number, z: number]} scale={0.18}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function StationBuilding(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/station-building.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["station_building"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.18} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function StationBuildingInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/station-building.glb");

    const { stationBuildings } = buildings;

    return (
        <Instances geometry={(nodes["station_building"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {stationBuildings.map((stationBuilding, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`station-building-${index}`} ccd>
                    <Instance position={stationBuilding.position as [x: number, y: number, z: number]} rotation={stationBuilding.rotation as [x: number, y: number, z: number]} scale={0.18}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function HaussmannApartmentInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/haussmann-apartment.glb");
    
    const { haussmannApartments } = buildings;

    return (
        <Instances geometry={(nodes["haussmann_apartment_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {haussmannApartments.map((haussmannApartment, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`haussmann-apartment-${index}`} ccd>
                    <Instance position={haussmannApartment.position as [x: number, y: number, z: number]} rotation={haussmannApartment.rotation as [x: number, y: number, z: number]} scale={0.2}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function HomeCottage(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/home-cottage.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["home_cottage_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.25} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function HomeCottageInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/home-cottage.glb");

    const { homeCottages } = buildings;

    return (
        <Instances geometry={(nodes["home_cottage_01"] as Mesh).geometry} material={materials["lowpoly"]} castShadow receiveShadow>
            {homeCottages.map((homeCottage, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`home-cottage-${index}`} ccd>
                    <Instance position={homeCottage.position as [x: number, y: number, z: number]} rotation={homeCottage.rotation as [x: number, y: number, z: number]} scale={0.25}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function TwoStoryHouse(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/two-story-house.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["two_story_house"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.18} castShadow receiveShadow/>
//         </RigidBody>
//     );
// }

function TwoStoryHouseInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/two-story-house.glb");

    const { twoStoryHouses } = buildings;

    return (
        <Instances geometry={(nodes["two_story_house"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {twoStoryHouses.map((twoStoryHouse, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`two-story-house-${index}`} ccd>
                    <Instance position={twoStoryHouse.position as [x: number, y: number, z: number]} rotation={twoStoryHouse.rotation as [x: number, y: number, z: number]} scale={0.18}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function FarmHouse(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/farmhouse.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["farmhouse"] as Mesh).geometry} material={materials["lowpoly"]} scale={0.16} {...props} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function FarmHouseInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/farmhouse.glb");

    const { farmHouses } = buildings;

    return (
        <Instances geometry={(nodes["farmhouse"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {farmHouses.map((farmHouse, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`farm-house-${index}`} ccd>
                    <Instance position={farmHouse.position as [x: number, y: number, z: number]} rotation={farmHouse.rotation as [x: number, y: number, z: number]} scale={0.16}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function RanchHouseInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/ranch-house.glb");

    const { ranchHouses } = buildings;

    return (
        <Instances geometry={(nodes["ranch_house"] as Mesh).geometry} material={materials["lowpoly"]} castShadow receiveShadow>
            {ranchHouses.map((ranchHouse, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`ranch-house-${index}`} ccd>
                    <Instance position={ranchHouse.position as [x: number, y: number, z: number]} rotation={ranchHouse.rotation as [x: number, y: number, z: number]} scale={0.18}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function ConstructionSiteIntances() {
    const concreteFrameWipModel = useGLTF("/models/buildings/concrete-frame-wip.glb");
    const scaffoldFacadeModel = useGLTF("/models/others/scaffold-facade.glb");
    const cementBagPalletModel = useGLTF("/models/others/cement-bag-pallet.glb");
    const brickPalletModel = useGLTF("/models/others/brick-pallet.glb");
    const crateModel = useGLTF("/models/others/crate.glb");

    const { constructionSites } = buildings;

    return (
        <Instances geometry={(concreteFrameWipModel.nodes["concrete_frame_wip"] as Mesh).geometry} material={concreteFrameWipModel.materials["lowpoly"]} receiveShadow castShadow>
            {constructionSites.map((constructionSite, index) =>
                <group position={constructionSite.position as [x: number, y: number, z: number]} rotation={constructionSite.rotation as [x: number, y: number, z: number]} key={`construction-site-${index}`}>
                    <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                        <Instance scale={0.18}/>
                    </RigidBody>
                    <Instances geometry={(scaffoldFacadeModel.nodes["scaffold_facade"] as Mesh).geometry} material={scaffoldFacadeModel.materials["lowpoly"]} receiveShadow castShadow>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[0.9, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.18} />
                        </RigidBody>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[0, 0, -0.75]} rotation={[0, Math.PI, 0]} scale={0.18} />
                        </RigidBody>
                    </Instances>
                    <Instances geometry={(cementBagPalletModel.nodes["cement_bag_pallet"] as Mesh).geometry} material={cementBagPalletModel.materials["lowpoly"]} receiveShadow castShadow>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[-0.9, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.18}/>
                        </RigidBody>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[-0.9, 0, 0.2]} rotation={[0, -Math.PI / 2, 0]} scale={0.18}/>
                        </RigidBody>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[-0.9, 0, 0.4]} rotation={[0, Math.PI / 2, 0]} scale={0.18}/>
                        </RigidBody>
                    </Instances>
                    <Instances geometry={(brickPalletModel.nodes["brick_pallet"] as Mesh).geometry} material={brickPalletModel.materials["lowpoly"]} receiveShadow castShadow>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[-0.6, 0, 0.75]} rotation={[0, Math.PI / 2, 0]} scale={0.18}/>
                        </RigidBody>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[-0.4, 0, 0.75]} rotation={[0, 0, 0]} scale={0.18}/>
                        </RigidBody>
                    </Instances>
                    <Instances geometry={(crateModel.nodes["crate_01"] as Mesh).geometry} material={crateModel.materials["lowpoly"]} receiveShadow castShadow>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[0.6, 0, 0.75]} rotation={[0, 0, 0]} scale={0.18}/>
                        </RigidBody>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[0.48, 0, 0.75]} rotation={[0, 0, 0]} scale={0.18}/>
                        </RigidBody>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[0.36, 0, 0.75]} rotation={[0, 0, 0]} scale={0.18}/>
                        </RigidBody>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <Instance position={[0.54, 0.11, 0.75]} rotation={[0, Math.PI / 4, 0]} scale={0.18}/>
                        </RigidBody>
                    </Instances>
                </group>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function RetailPodium(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/retail-podium.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["retail_podium_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.18} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function RetailPodiumInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/retail-podium.glb");

    const { retailPodiums } = buildings;

    return (
        <Instances geometry={(nodes["retail_podium_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {retailPodiums.map((retailPodium, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`retail-podium-${index}`} ccd>
                    <Instance position={retailPodium.position as [x: number, y: number, z: number]} rotation={retailPodium.rotation as [x: number, y: number, z: number]} scale={0.18}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function ShopAwning(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/shop-awning.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["shop_awning_01"] as Mesh).geometry} material={materials["lowpoly"]} scale={0.2} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function ShopAwningInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/shop-awning.glb");

    const { shopAwnings } = buildings;

    return (
        <Instances geometry={(nodes["shop_awning_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {shopAwnings.map((shopAwning, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`shop-awning-${index}`} ccd>
                    <Instance position={shopAwning.position as [x: number, y: number, z: number]} rotation={shopAwning.rotation as [x: number, y: number, z: number]} scale={0.2}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function GlassSkyscraper(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/glass-skyscraper.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["glass_skyscraper_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.18} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function GlassSkyScraperInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/glass-skyscraper.glb");

    const { glassSkyscrapers } = buildings;

    return (
        <Instances geometry={(nodes["glass_skyscraper_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {glassSkyscrapers.map((glassSkyscraper, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`glass-skyscraper-${index}`} ccd>
                    <Instance position={glassSkyscraper.position as [x: number, y: number, z: number]} rotation={glassSkyscraper.rotation as [x: number, y: number, z: number]} scale={0.18}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function GlassSupertall(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/glass-supertall.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["glass_supertall_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.18} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function GlassSupertallInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/glass-supertall.glb");

    const { glassSupertalls } = buildings;

    return (
        <Instances geometry={(nodes["glass_supertall_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {glassSupertalls.map((glassSupertall, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`glass-supertall-${index}`} ccd>
                    <Instance position={glassSupertall.position as [x: number, y: number, z: number]} rotation={glassSupertall.rotation as [x: number, y: number, z: number]} scale={0.18}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function MidriseOffice(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/midrise-office.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["midrise_office_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.18} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function MidriseOfficeInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/midrise-office.glb");

    const { midriseOffices } = buildings;

    return (
        <Instances geometry={(nodes["midrise_office_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {midriseOffices.map((midriseOffice, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`midrise-office-${index}`} ccd>
                    <Instance position={midriseOffice.position as [x: number, y: number, z: number]} rotation={midriseOffice.rotation as [x: number, y: number, z: number]} scale={0.18}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function WaterfrontCondoTower(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/waterfront-condo-tower.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["waterfront_condo_tower"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.2} castShadow receiveShadow/>
//         </RigidBody>
//     );
// }

function WaterfrontCondoTowerInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/waterfront-condo-tower.glb");

    const { waterfrontCondoTowers } = buildings;

    return (
        <Instances geometry={(nodes["waterfront_condo_tower"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {waterfrontCondoTowers.map((waterfrontCondoTower, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`waterfront-condo-tower-${index}`} ccd>
                    <Instance position={waterfrontCondoTower.position as [x: number, y: number, z: number]} rotation={waterfrontCondoTower.rotation as [x: number, y: number, z: number]} scale={0.2}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function PorchHouseFront(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/porch-house-front.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["porch_house_front_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.2} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function PorchHouseFrontInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/porch-house-front.glb");

    const { porchHouseFronts } = buildings;

    return (
        <Instances geometry={(nodes["porch_house_front_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {porchHouseFronts.map((porchHouseFront, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`porch-house-front-${index}`} ccd>
                    <Instance position={porchHouseFront.position as [x: number, y: number, z: number]} rotation={porchHouseFront.rotation as [x: number, y: number, z: number]} scale={0.2}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

// function TurfDwelling(props: BuildingCommonProps) {
//     const { nodes, materials } = useGLTF("/models/buildings/turf-dwelling.glb");

//     return (
//         <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
//             <mesh geometry={(nodes["turf_dwelling"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.2} receiveShadow castShadow/>
//         </RigidBody>
//     );
// }

function TurfDwellingInstances() {
    const { nodes, materials } = useGLTF("/models/buildings/turf-dwelling.glb");

    const { turfDwellings } = buildings;

    return (
        <Instances geometry={(nodes["turf_dwelling"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {turfDwellings.map((turfDwelling, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`turf-dwelling-${index}`} ccd>
                    <Instance position={turfDwelling.position as [x: number, y: number, z: number]} rotation={turfDwelling.rotation as [x: number, y: number, z: number]} scale={0.2}/>
                </RigidBody>
            )}
        </Instances>
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

function PoliceCar({ initialPosition, initialRotation = [0, 0, 0] }: CarCommonProps) {
    const { nodes, materials } = useGLTF('/models/cars/police-car.glb') as unknown as GLTFPoliceCarResult;

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group position={initialPosition} rotation={initialRotation} scale={0.035} dispose={null}>
                <group position={[0.077, -0.141, 7.143]} scale={[3.09, 0.28, 0.28]}>
                    <mesh geometry={nodes.Object_10.geometry} material={materials['Material.007']} position={[0, 4.77, -26.732]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_11.geometry} material={materials['Material.008']} position={[0, 6.415, -26.777]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_12.geometry} material={materials.car_black_remaining} position={[0, 6.319, -3.519]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_13.geometry} material={materials.Car_Black_Part} position={[0.002, 3.021, -16.702]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_14.geometry} material={materials.Grill_Back_Design} position={[0, 3.548, -0.862]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_4.geometry} material={materials.front_grill} position={[0, 3.474, -0.758]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_5.geometry} material={materials.material} position={[0.004, 5.891, -19.936]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_6.geometry} material={materials.Remaining_black_side_part} position={[0, 5.363, -43.71]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_7.geometry} material={materials.Headlight_back} position={[0, 3.712, -2.411]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_8.geometry} material={materials.Car_Glass} position={[0, 9.224, -26.612]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_9.geometry} material={materials.upper_yre_border} position={[0, 2.468, -26.004]} castShadow receiveShadow/>
                </group>
                <group position={[3.317, 1.256, -0.929]} scale={[0.151, 0.199, 0.434]}>
                    <mesh geometry={nodes.Object_16.geometry} material={materials['Material.003']} position={[-21.27, -0.054, -0.492]} castShadow receiveShadow/>
                </group>
                <group position={[3.459, 1.734, 2.445]} scale={[0.214, 0.178, 0.081]}>
                    <mesh geometry={nodes.Object_18.geometry} material={materials.Mirrror_Border} position={[-16.192, 0.01, -2.994]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_19.geometry} material={materials.Mirror_Glass} position={[-16.775, 0.559, -3.281]} castShadow receiveShadow/>
                </group>
                <group position={[0.077, 1.069, -4.007]} scale={[1.345, 0.523, 0.102]}>
                    <mesh geometry={nodes.Object_21.geometry} material={materials['back_design.001']} position={[0, 0.942, -30.172]} castShadow receiveShadow/>
                </group>
                <group position={[0.077, 1.09, -3.961]} scale={[1.345, 0.443, 0.102]}>
                    <mesh geometry={nodes.Object_23.geometry} material={materials.back_design} position={[0, -0.347, -30.787]} castShadow receiveShadow/>
                </group>
                <group position={[3.375, 1.185, -6.3]} rotation={[1.582, -1.397, 1.582]} scale={[0.629, 0.523, 0.102]}>
                    <mesh geometry={nodes.Object_25.geometry} material={materials.yellow_light} position={[-0.351, 1.175, 34.346]} castShadow receiveShadow/>
                </group>
                <group position={[3.218, 0.042, 4.657]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[0.83, 0.32, 0.83]}>
                    <mesh geometry={nodes.Object_29.geometry} material={materials.Tyre_Outer_Design} position={[0, 0, 0.002]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_30.geometry} material={materials.Tyre__part} position={[0, -0.005, -0.014]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_31.geometry} material={materials.Tyre_design} position={[0, -0.002, 0]} castShadow receiveShadow/>
                </group>
                <group position={[0.077, -0.141, 7.143]}>
                    <mesh geometry={nodes.Object_37.geometry} material={materials.back_bottom_metal} position={[0, 0.35, -14.188]} castShadow receiveShadow/>
                </group>
                <group position={[0.077, -0.141, 3.175]} scale={[3.09, 0.28, 0.28]}>
                    <mesh geometry={nodes.Object_39.geometry} material={materials['Material.002']} position={[0, 0.687, 12.263]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_40.geometry} material={materials.front_bar_design} position={[0, 0.938, 13.315]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_41.geometry} material={materials['Material.005']} position={[0, 1.841, 12.306]} castShadow receiveShadow/>
                </group>
                <group position={[0.077, -0.141, 7.089]}>
                    <mesh geometry={nodes.Object_43.geometry} material={materials.HeadLight_Border} position={[0, 1.037, -0.614]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_44.geometry} material={materials.Headlight} position={[0, 1.035, -0.627]} castShadow receiveShadow/>
                </group>
                <group position={[11.099, 2.111, 5.512]}>
                    <mesh geometry={nodes.Object_46.geometry} material={materials.Police_Siren} position={[-12.879, 1.428, -5.834]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_47.geometry} material={materials.siren_midden_part} position={[-11.038, 1.983, -5.848]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_48.geometry} material={materials.siren_red_light} position={[-9.462, 1.735, -5.847]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_49.geometry} material={materials.Siren_Blue_light} position={[-12.607, 1.728, -5.849]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_50.geometry} material={materials.siren_bottom} position={[-9.186, 1.428, -5.841]} castShadow receiveShadow/>
                </group>
                <group position={[0.077, -0.141, 7.143]} scale={[3.09, 0.28, 0.28]}>
                    <mesh geometry={nodes.Object_52.geometry} material={materials.siren_bottom} position={[0, 12.767, -26.433]} castShadow receiveShadow/>
                </group>
                <group position={[3.357, 1.185, 6.017]} rotation={[1.615, -1.527, 1.615]} scale={[0.629, 0.523, 0.102]}>
                    <mesh geometry={nodes.Object_54.geometry} material={materials.yellow_light} position={[-0.347, 0.292, 33.837]} castShadow receiveShadow/>
                </group>
                <group position={[-3.114, 0.042, 4.657]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[0.83, 0.32, 0.83]}>
                    <mesh geometry={nodes.Object_56.geometry} material={materials.Tyre_Outer_Design} position={[0, 0, 0.002]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_57.geometry} material={materials.Tyre__part} position={[0, -0.005, -0.014]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_58.geometry} material={materials.Tyre_design} position={[0, -0.002, 0]} castShadow receiveShadow/>
                </group>
                <group position={[3.218, 0.042, -5.07]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
                    <mesh geometry={nodes.Object_60.geometry} material={materials.Tyre_Outer_Design} position={[-0.001, 0, 0.005]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_61.geometry} material={materials.Tyre__part} position={[-0.002, -0.007, -0.026]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_62.geometry} material={materials.Tyre_design} position={[0.003, -0.001, 0.001]} castShadow receiveShadow/>
                </group>
                <group position={[-3.114, 0.042, -5.07]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[0.83, 0.32, 0.83]}>
                    <mesh geometry={nodes.Object_64.geometry} material={materials.Tyre_Outer_Design} position={[0, 0, 0.002]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_65.geometry} material={materials.Tyre__part} position={[0, -0.005, -0.014]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_66.geometry} material={materials.Tyre_design} position={[0, -0.002, 0]} castShadow receiveShadow/>
                </group>
                <group position={[3.381, 0.936, 1.396]} rotation={[2.219, 0.037, -1.603]} scale={[0.492, 0.073, 0.492]}>
                    <mesh geometry={nodes.Object_68.geometry} material={materials.star_design} position={[0.205, -45.363, -0.233]} castShadow receiveShadow/>
                </group>
                <group position={[2.896, 0.879, -7.097]}>
                    <mesh geometry={nodes.Object_72.geometry} material={materials.tail_lightt} position={[-2.819, -0.009, -0.08]} castShadow receiveShadow/>
                    <mesh geometry={nodes.Object_73.geometry} material={materials.til_light_border} position={[-2.819, -0.008, 0.052]} castShadow receiveShadow/>
                </group>
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function OrdinalSedanCar({ initialPosition, initialRotation = [0, 0, 0] }: CarCommonProps) {
    const sceneryContext = useContext(SceneryContext);
    if (!sceneryContext) return null;
    const { trafficLightStates } = sceneryContext;
    
    const { nodes, materials } = useGLTF("/models/cars/car-sedan.glb");

    const carRef = useRef<RapierRigidBody>(null!);
    const velocityMultiplerRef = useRef(0.15);
    const targetPositionRef = useRef<Vector3>(new Vector3());
    // const targetAngleRef = useRef<Quaternion>(new Quaternion());

    const [trafficName, setTrafficName] = useState<string | null>(null);
    const [stop, setStop] = useState(false);
    const [velocityLambda, setVelocityLambda] = useState(CAR_RUN_VECLOTIY_LAMBDA);

    useEffect(() => {
        if (stop) {
            const interval = setInterval(() => {
                const trafficLightState = trafficLightStates.get(trafficName);
                if (trafficLightState) {
                    if (trafficLightState === "green") {
                        setStop(false);
                        setTrafficName(null);
                    }
                }
            }, 1000);
            return () => { clearInterval(interval); }
        }
    }, [stop]);

    useFrame((_, delta) => {
        const car = carRef.current;
        if (!car) return;

        const currentPos = car.translation();
        if (stop) {
            const currentVel = car.linvel();
            const targetVelX = MathUtils.damp(currentVel.x, 0, velocityLambda, delta);
            car.setLinvel({ x: targetVelX, y: 0, z: 0 }, true);
            velocityMultiplerRef.current = 0;
        }
        else {
            targetPositionRef.current.set(-7.75, currentPos.y, currentPos.z);
            velocityMultiplerRef.current = MathUtils.damp(velocityMultiplerRef.current, 0.15, 1, delta);
            car.setLinvel({ x: (targetPositionRef.current.x) * velocityMultiplerRef.current, y: 0, z: 0 }, true);
        }
    });

    const handleIntersectionEnter = (payload: IntersectionEnterPayload) => {
        if (payload.other.rigidBodyObject?.name?.includes("traffic")) {
            setTrafficName(payload.other.rigidBodyObject.name);
            setVelocityLambda(CAR_STOP_VELOCITY_LAMBDA);
            setStop(true);
        }
        else if (payload.other.rigidBodyObject?.name?.includes("car")) {
            setVelocityLambda(CAR_STOP_VELOCITY_LAMBDA);
            setStop(true);
        }
    };

    return (
        <group position={initialPosition} rotation={initialRotation}>
            <RigidBody name={"car"} ref={carRef} type={"kinematicVelocity"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd sensor onIntersectionEnter={handleIntersectionEnter}>
                <mesh geometry={(nodes["car_sedan_01"] as Mesh).geometry} material={materials["lowpoly"]} scale={0.2} castShadow receiveShadow/>
                <mesh position={[0, 0.1, 0.5]}>
                    <boxGeometry args={[0.25, 0.1, 0.05]}/>
                    <meshStandardMaterial color={"red"} opacity={0.5} transparent/>
                </mesh>
                <mesh position={[0, 0.1, -0.2]}>
                    <boxGeometry args={[0.25, 0.1, 0.05]}/>
                    <meshStandardMaterial color={"red"} opacity={0.5} transparent/>
                </mesh>
            </RigidBody>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function Chance() {
    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
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
        <RigidBody position={[0, 0.085, -1.5]} scale={0.25} type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["metro_entrance_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow/>
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
                    <mesh position={[-98, 0, 10]} rotation={[0, Math.PI / 4, 0]} geometry={nodes.defaultMaterial.geometry} material={materials.openPBR_shader1} castShadow receiveShadow/>
                    <mesh geometry={nodes.defaultMaterial_1.geometry} material={materials.openPBR_shader1} castShadow receiveShadow/>
                    <mesh geometry={nodes.defaultMaterial_2.geometry} material={materials.openPBR_shader1} castShadow receiveShadow/>
                    <mesh geometry={nodes.defaultMaterial_3.geometry} material={materials.openPBR_shader1} castShadow receiveShadow/>
                    <mesh geometry={nodes.defaultMaterial_4.geometry} material={materials.openPBR_shader1} castShadow receiveShadow/>
                </group>
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function WaterTower({ position, rotation = [0, 0, 0] }: BuildingCommonProps) {
    const { nodes, materials } = useGLTF("/models/others/water-tower.glb");

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["Object_84"] as Mesh).geometry} material={materials["LPMW-MaHa-_CityAssetPack"]} position={position} rotation={rotation} scale={0.2} receiveShadow castShadow/>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function ElectricStation(props: BuildingCommonProps) {
    const { nodes, materials } = useGLTF("/models/buildings/portacabin-office.glb");

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["portacabin_office"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.2} castShadow receiveShadow/>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type GLTFTransmissionTowerResult = GLTF & {
    nodes: {
        SingleMast_1: Mesh
        SingleMast_2: Mesh
        SingleMast_3: Mesh
        SingleMast_4: Mesh
        SingleMast_5: Mesh
    }
    materials: {
        Isolator2_002: MeshStandardMaterial
        Isolator1_002: MeshStandardMaterial
        Steel_002: MeshStandardMaterial
        Forsterkning_002: MeshStandardMaterial
        Concrete: MeshStandardMaterial
    }
}
  
function TransmissionTower(props: OtherCommonProps) {
    const { nodes, materials } = useGLTF("/models/others/transmission-tower.glb") as unknown as GLTFTransmissionTowerResult;
    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group {...props} scale={0.0025}>
                <mesh geometry={nodes.SingleMast_1.geometry} material={materials.Isolator2_002} castShadow receiveShadow/>
                <mesh geometry={nodes.SingleMast_2.geometry} material={materials.Isolator1_002} castShadow receiveShadow/>
                <mesh geometry={nodes.SingleMast_3.geometry} material={materials.Steel_002} castShadow receiveShadow/>
                <mesh geometry={nodes.SingleMast_4.geometry} material={materials.Forsterkning_002} castShadow receiveShadow/>
                <mesh geometry={nodes.SingleMast_5.geometry} material={materials.Concrete} castShadow receiveShadow/>
            </group>
        </RigidBody>
    )
}

/* ------------------------------------------------------------------------------------------------------------------ */

type TrafficLightProps = {
    name?: string,
    duration?: [redLightDuration: number, yellowLightDuration: number, greenLightDuration: number],
    
}

type GLTFTrafficLightResult = GLTF & {
    nodes: {
        tl_galv: Mesh
        tl_conc: Mesh
        tl_steelDark: Mesh
        tl_bolt: Mesh
        tl_plateYel: Mesh
        tl_rubber: Mesh
        tl_reflect: Mesh
        tl_reflectY: Mesh
        tl_boardBlk: Mesh
        tl_boardWht: Mesh
        tl_body: Mesh
        tl_cavity: Mesh
        tl_ledRedLit: Mesh
        tl_lensRed: Mesh
        tl_hood: Mesh
        tl_ledAmbOff: Mesh
        tl_lensAmb: Mesh
        tl_ledGrnOff: Mesh
        tl_lensGrn: Mesh
        tl_plateWht: Mesh
        tl_plateBlk: Mesh
        tl_figRedOff: Mesh
        tl_figGrnLit: Mesh
        tl_segLit: Mesh
        tl_segOff: Mesh
        tl_lensPed: Mesh
        tl_pbBody: Mesh
        tl_pbPanel: Mesh
        tl_pbLegend: Mesh
        tl_pbBtn: Mesh
        tl_cab: Mesh
        tl_cabDark: Mesh
        tl_brass: Mesh
        tl_tar: Mesh
    }
    materials: {}
}

function TrafficLight({ name, position, rotation = [0, 0, 0], duration = [15, 3, 15] }: OtherCommonProps & TrafficLightProps) {
    const sceneryContext = useContext(SceneryContext);
    if (!sceneryContext) return null;
    const { trafficLightStates } = sceneryContext;
    
    const { nodes } = useGLTF('/models/others/traffic-light.glb') as unknown as GLTFTrafficLightResult;

    const [light, setLight] = useState<"red" | "yellow" | "green">("green");

    useEffect(() => {
        let timer = 0;
        const triggerTimer = {
            GREEN: duration[2],
            YELLOW: duration[2] + duration[1],
            RED: duration[2] + duration[1] + duration[0]
        };
        const interval = setInterval(() => {
            timer++;
            setLight(() => {
                if (timer < triggerTimer.GREEN) {
                    return "green";
                }
                else if (timer < triggerTimer.YELLOW) {
                    return "yellow"
                }
                else if (timer < triggerTimer.RED) {
                    return "red";
                }
                else {
                    timer = 0;
                    return "green";
                }
            });
        }, 1000);

        return () => { clearInterval(interval); }
    }, []);

    useEffect(() => {
        trafficLightStates.set(name, light);
    }, [light]);

    return (
        <group position={position} rotation={rotation} scale={0.15}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <group position={[-0.315, 0.69, -0.08]}>
                    <mesh geometry={nodes.tl_galv.geometry} material={nodes.tl_galv.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_conc.geometry} material={nodes.tl_conc.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_steelDark.geometry} material={nodes.tl_steelDark.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_bolt.geometry} material={nodes.tl_bolt.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_plateYel.geometry} material={nodes.tl_plateYel.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_rubber.geometry} material={nodes.tl_rubber.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_reflect.geometry} material={nodes.tl_reflect.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_reflectY.geometry} material={nodes.tl_reflectY.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_boardBlk.geometry} material={nodes.tl_boardBlk.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_boardWht.geometry} material={nodes.tl_boardWht.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_body.geometry} material={nodes.tl_body.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_cavity.geometry} material={nodes.tl_cavity.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_ledRedLit.geometry} material={nodes.tl_ledRedLit.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_lensRed.geometry} material={nodes.tl_lensRed.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_hood.geometry} material={nodes.tl_hood.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_ledAmbOff.geometry} material={nodes.tl_ledAmbOff.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_lensAmb.geometry} material={nodes.tl_lensAmb.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_ledGrnOff.geometry} material={nodes.tl_ledGrnOff.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_lensGrn.geometry} material={nodes.tl_lensGrn.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_plateWht.geometry} material={nodes.tl_plateWht.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_plateBlk.geometry} material={nodes.tl_plateBlk.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_figRedOff.geometry} material={nodes.tl_figRedOff.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_figGrnLit.geometry} material={nodes.tl_figGrnLit.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_segLit.geometry} material={nodes.tl_segLit.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_segOff.geometry} material={nodes.tl_segOff.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_lensPed.geometry} material={nodes.tl_lensPed.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_pbBody.geometry} material={nodes.tl_pbBody.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_pbPanel.geometry} material={nodes.tl_pbPanel.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_pbLegend.geometry} material={nodes.tl_pbLegend.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_pbBtn.geometry} material={nodes.tl_pbBtn.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_cab.geometry} material={nodes.tl_cab.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_cabDark.geometry} material={nodes.tl_cabDark.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_brass.geometry} material={nodes.tl_brass.material} receiveShadow castShadow />
                    <mesh geometry={nodes.tl_tar.geometry} material={nodes.tl_tar.material} receiveShadow castShadow />
                </group>
                <group>
                    {/* Red light */}
                    <mesh position={[-0.313, 3.89, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.11, 0.11, 0.1]} />
                        <meshStandardMaterial color={light === "red" ? red.A700 : grey[700]} />
                    </mesh>
                    {/* Yellow light */}
                    <mesh position={[-0.313, 3.59, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.11, 0.11, 0.1]} />
                        <meshStandardMaterial color={light === "yellow" ? yellow.A700 : grey[700]} />
                    </mesh>
                    {/* Green light */}
                    <mesh position={[-0.313, 3.29, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.11, 0.11, 0.1]} />
                        <meshStandardMaterial color={light === "green" ? green.A700 : grey[700]} />
                    </mesh>
                </group>
            </RigidBody>
            {light === "red" && (
                <RigidBody name={name} type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                    <mesh position={[-2.95, 1, 1.5]}>
                        <boxGeometry args={[2, 1, 3]}/>
                        <meshStandardMaterial color={"black"} opacity={0.5} transparent/>
                    </mesh>
                </RigidBody>
            )}
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function HotAirBalloon() {
    const { nodes, materials } = useGLTF("/models/others/hot-air-balloon.glb");

    const balloonRef = useRef<RapierRigidBody>(null!);

    const targetPositionXRef = useRef(0);
    const targetPositionZRef = useRef(0);

    const range = 15;
    const speed = 0.05;

    useFrame(({ clock }) => {
        const balloon = balloonRef.current;
        if (!balloon) return;

        const currentPos = balloon.translation();

        targetPositionXRef.current = (range * Math.cos(clock.elapsedTime * speed)) / (1 + Math.pow(Math.sin(clock.elapsedTime * speed), 2));
        targetPositionZRef.current = (range * Math.sin(clock.elapsedTime * speed) * Math.cos(clock.elapsedTime * speed)) / (1 + Math.pow(Math.sin(clock.elapsedTime * speed), 2));

        balloon.setNextKinematicTranslation({
            x: targetPositionXRef.current,
            y: currentPos.y,
            z: targetPositionZRef.current
        });
    });

    return (
        <RigidBody ref={balloonRef} type={"kinematicPosition"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["Hot_Air_Balloon_Material001_0"] as Mesh).geometry} material={materials["Material.001"]} position={[0, 8, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.04} castShadow receiveShadow/>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type GLTFGoldenTrophyStatueResult = GLTF & {
    nodes: {
        Trophy_Material001_0: Mesh
        Trophy_Material002_0: Mesh
    },
    materials: {
        ['Material.001']: MeshStandardMaterial
        ['Material.002']: MeshStandardMaterial
    }
}

function GoldenTrophyStatue(props: OtherCommonProps) {
    const { nodes } = useGLTF('/models/others/golden-trophy.glb') as unknown as GLTFGoldenTrophyStatueResult;
    return (
        <RigidBody type={"fixed"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group {...props}>
                <group position={[0, 1, 0]} scale={0.4} dispose={null}>
                    <mesh geometry={nodes.Trophy_Material001_0.geometry} castShadow receiveShadow>
                        <meshPhysicalMaterial color={yellow[500]} emissive={yellow[800]} emissiveIntensity={0.8} metalness={0.5} roughness={0.2} anisotropy={0.8} thickness={0.5} ior={2}/>
                    </mesh>
                    <mesh geometry={nodes.Trophy_Material002_0.geometry} castShadow receiveShadow>
                        <meshPhysicalMaterial color={grey[100]} emissive={grey[400]} emissiveIntensity={0.8} metalness={0.2} roughness={0.2} anisotropy={0.8} thickness={0.5} ior={2}/>
                    </mesh>
                </group>
                <group position={[0, 0.16, 0]}>
                    <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.25, 0.12, 1.25]}/>
                        <meshPhysicalMaterial color={grey[100]} clearcoatRoughness={0.1} clearcoat={1} roughness={0.2}/>
                    </mesh>
                    <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1, 0.78, 1]}/>
                        <meshPhysicalMaterial color={grey[100]} clearcoatRoughness={0.1} clearcoat={1} roughness={0.2}/>
                        <Center disableY disableZ>
                            <Text3D font={"/fonts/Fredoka-Regular.json"} position={[0, -0.05, 0.5]} scale={0.08} receiveShadow>
                                {"Golden Trophy"}
                                <meshPhysicalMaterial color={yellow[600]} emissive={yellow[500]} emissiveIntensity={0.8} metalness={0.8} roughness={0.2} anisotropy={0.8} thickness={0.5} ior={2}/>
                            </Text3D>
                        </Center>
                        <Center disableY disableZ>
                            <Text3D font={"/fonts/Fredoka-Regular.json"} position={[0, -0.2, 0.5]} scale={0.08} receiveShadow>
                                {"07/11/2026"}
                                <meshPhysicalMaterial color={yellow[600]} emissive={yellow[500]} emissiveIntensity={0.8} metalness={0.8} roughness={0.2} anisotropy={0.8} thickness={0.5} ior={2}/>
                            </Text3D>
                        </Center>
                    </mesh>
                    <mesh position={[0, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[1.5, 0.12, 1.5]}/>
                        <meshPhysicalMaterial color={grey[100]} clearcoatRoughness={0.1} clearcoat={1} roughness={0.2}/>
                    </mesh>
                </group>
            </group>
        </RigidBody>
    )
}

/* ------------------------------------------------------------------------------------------------------------------ */

function SplitRailFenceInstances() {
    const { nodes, materials } = useGLTF("/models/others/split-rail-fence.glb");

    const { splitRailFences } = others;

    return (
        <Instances geometry={(nodes["split_rail_fence"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow castShadow>
            {splitRailFences.map((splitRailFence, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`split-rail-fence-${index}`} ccd>
                    <Instance position={splitRailFence.position as [x: number, y: number, z: number]} rotation={splitRailFence.rotation as [x: number, y: number, z: number]} scale={0.1875}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function WildTreeInstances() {
    const bushModel = useGLTF("/models/others/bush.glb");
    const fernModel = useGLTF("/models/others/fern.glb");
    const oakModel = useGLTF("/models/others/oak.glb");
    const pineModel = useGLTF("/models/others/pine.glb");

    const { bushes, ferns, oaks, pines } = others;

    const oakScales = useMemo(() => {
        const scales = new Float32Array(oaks.length);
        for (let i = 0; i < oaks.length; i++) {
            scales[i] = MathUtils.randFloat(OAK_MIN_SCALE, OAK_MAX_SCALE);
        }
        return scales;
    }, [oaks, oakModel]);

    const pineScales = useMemo(() => {
        const scales = new Float32Array(pines.length);
        for (let i = 0; i < pines.length; i++) {
            scales[i] = MathUtils.randFloat(PINE_MIN_SCALE, PINE_MAX_SCALE);
        }
        return scales;
    }, [pines, pineModel]);

    return (
        <>
            <Instances geometry={(bushModel.nodes["bush"] as Mesh).geometry} material={bushModel.materials["lowpoly"]} receiveShadow castShadow>
                {bushes.map((bush, index) =>
                    <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`bush-${index}`} ccd>
                        <Instance position={bush.position as [x: number, y: number, z: number]} rotation={bush.rotation as [x: number, y: number, z: number]} scale={0.25}/>
                    </RigidBody>
                )}
            </Instances>
            <Instances geometry={(fernModel.nodes["fern"] as Mesh).geometry} material={fernModel.materials["lowpoly"]} receiveShadow castShadow>
                {ferns.map((fern, index) =>
                    <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`fern-${index}`} ccd>
                        <Instance position={fern.position as [x: number, y: number, z: number]} rotation={fern.rotation as [x: number, y: number, z: number]} scale={0.25}/>
                    </RigidBody>
                )}
            </Instances>
            <Instances geometry={(pineModel.nodes["pine"] as Mesh).geometry} material={pineModel.materials["lowpoly"]} receiveShadow castShadow>
                {pines.map((pine, index) =>
                    <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`pine-${index}`} ccd>
                        <Instance position={pine.position as [x: number, y: number, z: number]} rotation={pine.rotation as [x: number, y: number, z: number]} scale={pineScales[index]}/>
                    </RigidBody>
                )}
            </Instances>
            <Instances geometry={(oakModel.nodes["oak"] as Mesh).geometry} material={oakModel.materials["lowpoly"]} receiveShadow castShadow>
                {oaks.map((oak, index) =>
                    <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`oak-${index}`} ccd>
                        <Instance position={oak.position as [x: number, y: number, z: number]} rotation={oak.rotation as [x: number, y: number, z: number]} scale={oakScales[index]}/>
                    </RigidBody>
                )}
            </Instances>
        </>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

interface GLTFClownFishAction extends AnimationClip {
    name: 'swim' | 'idle' | 'bite' | 'idle_left' | 'swim_left' | 'idle_right' | 'swim_right'
}

type GLTFClownFishResult = GLTF & {
    nodes: {
        Object_7: SkinnedMesh
        _rootJoint: Bone
    }
    materials: {
        fishclown: MeshStandardMaterial
    }
    animations: GLTFClownFishAction[]
}

export function ClownFish(props: OtherCommonProps) {
    const { scene, animations } = useGLTF("/models/others/clown-fish.glb");

    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

    const { nodes, materials } = useGraph(clone) as unknown as GLTFClownFishResult;

    const fishRef = useRef<Group>(null!);

    const { actions } = useAnimations(animations, fishRef);

    useEffect(() => {
        actions["idle"].fadeIn(0.75).play();
    }, [scene]);

    return (
        <group ref={fishRef} {...props} scale={0.5} dispose={null}>
            <group name="Sketchfab_Scene">
                <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
                    <group name="de8a6d993d1648139d961f02b30f3fb3fbx" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
                        <group name="Object_2">
                            <group name="RootNode">
                                <group name="Object_4">
                                    <primitive object={nodes._rootJoint} />
                                    <group name="Object_6" position={[0, 0.137, -2.214]} rotation={[-Math.PI / 2, 0, 0]} />
                                    <group name="fishClown" position={[0, 0.137, -2.214]} rotation={[-Math.PI / 2, 0, 0]} />
                                    <skinnedMesh name="Object_7" geometry={nodes.Object_7.geometry} material={materials.fishclown} skeleton={nodes.Object_7.skeleton} />
                                </group>
                            </group>
                        </group>
                    </group>
                </group>
            </group>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function BasketballPlayground(props: OtherCommonProps) {
    const hoopModel = useGLTF("/models/others/basketball-hoop.glb");
    const fenceModel = useGLTF("/models/others/chain-link-fence.glb");

    const hoopAttributes = useMemo(() => [
        { position: [0, 0, -1.25] as [x: number, y: number, z: number] },
        { position: [0, 0, 1.25] as [x: number, y: number, z: number], rotation: [0, Math.PI, 0] as [x: number, y: number, z: number] }
    ], [hoopModel]);

    const fenceAttributes = useMemo(() => [
        { position: [-1, 0, -1] as [x: number, y: number, z: number], rotation: [0, -Math.PI / 2, 0] as [x: number, y: number, z: number] },
        { position: [-1, 0, 1] as [x: number, y: number, z: number], rotation: [0, -Math.PI / 2, 0] as [x: number, y: number, z: number] },
        { position: [0.5, 0, -1.5] as [x: number, y: number, z: number], rotation: [0, Math.PI, 0] as [x: number, y: number, z: number] },
        { position: [-0.5, 0, -1.5] as [x: number, y: number, z: number], rotation: [0, Math.PI, 0] as [x: number, y: number, z: number] },
        { position: [1, 0, -1] as [x: number, y: number, z: number], rotation: [0, Math.PI / 2, 0] as [x: number, y: number, z: number] },
        { position: [1, 0, 0] as [x: number, y: number, z: number], rotation: [0, Math.PI / 2, 0] as [x: number, y: number, z: number] },
        { position: [1, 0, 1] as [x: number, y: number, z: number], rotation: [0, Math.PI / 2, 0] as [x: number, y: number, z: number] },
        { position: [0.5, 0, 1.5] as [x: number, y: number, z: number], rotation: [0, 0, 0] as [x: number, y: number, z: number] },
        { position: [-0.5, 0, 1.5] as [x: number, y: number, z: number], rotation: [0, 0, 0] as [x: number, y: number, z: number] }
    ], [fenceModel]);

    return (
        <group {...props}>
            <Instances geometry={(hoopModel.nodes["basketball_hoop"] as Mesh).geometry} material={hoopModel.materials["lowpoly"]} castShadow receiveShadow>
                {hoopAttributes.map((hoopAttribute, index) =>
                    <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`basketball-hoop-${index}`} ccd>
                        <Instance {...hoopAttribute} scale={0.25}/>
                    </RigidBody>
                )}
            </Instances>
            <Instances geometry={(fenceModel.nodes["chain_link_fence"] as Mesh).geometry} material={fenceModel.materials["lowpoly"]} receiveShadow castShadow>
                {fenceAttributes.map((fenceAttribute, index) =>
                    <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`fence-${index}`} ccd>
                        <Instance {...fenceAttribute} scale={0.25}/>
                    </RigidBody>
                )}
            </Instances>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function Campsite(props: OtherCommonProps) {
    const campTentModel = useGLTF("/models/others/camp-tent.glb");
    const campfireModel = useGLTF("/models/others/stone-ring-campfire.glb");
    const lanternModel = useGLTF("/models/others/lantern.glb");
    const logBenchModel = useGLTF("/models/others/log-bench.glb");

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group {...props}>
                <Instances geometry={(campTentModel.nodes["camp_tent"] as Mesh).geometry} material={campTentModel.materials["lowpoly"]} receiveShadow castShadow>
                    <Instance position={[0, 0, -0.65]} scale={0.25}/>
                    <Instance position={[0, 0, 0.65]} rotation={[0, Math.PI, 0]} scale={0.25}/>
                </Instances>
                <group>
                    <mesh geometry={(campfireModel.nodes["stone_ring_campfire"] as Mesh).geometry} material={campfireModel.materials["lowpoly"]} scale={0.25}/>
                </group>
                <Instances geometry={(logBenchModel.nodes["log_bench"] as Mesh).geometry} material={logBenchModel.materials["lowpoly"]} castShadow receiveShadow>
                    <Instance position={[-0.3, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.25}/>
                    <Instance position={[0.2, 0, -0.2]} rotation={[0, -Math.PI / 4, 0]} scale={0.25}/>
                </Instances>
                <Instances geometry={(lanternModel.nodes["lantern"] as Mesh).geometry} material={lanternModel.materials["lowpoly"]} receiveShadow castShadow>
                    <Instance position={[-0.1, 0, 0.36]} rotation={[0, -Math.PI / 4, 0]} scale={0.25}/>
                    <Instance position={[0.15, 0.117, -0.25]} scale={0.25}/>
                </Instances>
                {/* <Sparkles position={[0, 0.5, 0]} scale={0.01} size={20} speed={0.4} color={grey[600]} /> */}
                <Smoke position={[0, 0.2, 0]}/>
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function Dock(props: OtherCommonProps) {
    const dockJettyModel = useGLTF("/models/others/dock-jetty.glb");
    const fishingPoleModel = useGLTF("/models/others/fishing-pole.glb");


    return (
        <group {...props}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh geometry={(dockJettyModel.nodes["dock_jetty"] as Mesh).geometry} material={dockJettyModel.materials["lowpoly"]} scale={0.25} receiveShadow castShadow/>
            </RigidBody>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh geometry={(fishingPoleModel.nodes["fishing_pole"] as Mesh).geometry} material={fishingPoleModel.materials["lowpoly"]} position={[-0.13, 0.0975, 0.3]} rotation={[0, -Math.PI / 2, 0]} scale={0.15} receiveShadow castShadow/>
            </RigidBody>
            <ClownFish position={[0.75, 0.055, 0.75]}/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function ParkingBay(props: FoundationCommonProps) {
    const { nodes, materials } = useGLTF("/models/foundations/parking-bay.glb");

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["parking_bay_accessible_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.25} receiveShadow/>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type CrosswalkProps = {
    trafficLights?: boolean
    trafficLightNames?: [string, string],
    trafficLightDuration?: [red: number, yellow: number, green: number]
}

function Crosswalk(props: FoundationCommonProps & CrosswalkProps) {
    const { trafficLights = false, trafficLightNames, trafficLightDuration } = props;

    const { nodes, materials } = useGLTF("/models/foundations/road-crossing-curbcut.glb");

    return (
        <group {...props}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh geometry={(nodes["road_crossing_curbcut_01"] as Mesh).geometry} material={materials["lowpoly"]} scale={0.25} receiveShadow/>
            </RigidBody>
            {trafficLights && trafficLightNames && trafficLightDuration && (
                <group>
                    {trafficLightNames[0] && (
                        <TrafficLight name={trafficLightNames[0]} position={[-0.597, -0.06, -0.3]} rotation={[0, Math.PI, 0]} duration={trafficLightDuration}/>
                    )}
                    {trafficLightNames[1] && (
                        <TrafficLight name={trafficLightNames[1]} position={[0.597, -0.06, 0.3]} duration={trafficLightDuration}/>
                    )}
                </group>
            )}
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function RoadStraightInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/road-straight.glb");

    const { roadStraights } = foundations;

    return (
        <Instances geometry={(nodes["road_straight_accessible_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {roadStraights.map((straight, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`road-straight-${index}`} ccd>
                    <group position={straight.position as [x: number, y: number, z: number]} rotation={straight.rotation as [x: number, y: number, z: number]}>
                        <Instance scale={0.25}/>
                    </group>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function RoadTJunctionInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/road-t-junction.glb");

    const { roadTJunctions } = foundations;

    return (
        <Instances geometry={(nodes["road_t_junction_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {roadTJunctions.map((roadTJunction, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`road-t-junction-${index}`} ccd>
                    <Instance position={roadTJunction.position as [x: number, y: number, z: number]} rotation={roadTJunction.rotation as [x: number, y: number, z: number]} scale={0.25}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function RoadCornerInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/road-corner.glb");

    const { roadCorners } = foundations;

    return (
        <Instances geometry={(nodes["road_corner_accessible_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {roadCorners.map((roadCorner, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`road-corner-${index}`} ccd>
                    <group>
                        <Instance position={roadCorner.position as [x: number, y: number, z: number]} rotation={roadCorner.rotation as [x: number, y: number, z: number]} scale={0.25}/>
                    </group>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function SidewalkInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/sidewalk.glb");

    const { sidewalks } = foundations;

    return (
        <Instances geometry={(nodes["sidewalk_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {sidewalks.map((sidewalk, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`sidewalk-${index}`} ccd>
                    <Instance position={sidewalk.position as [x: number, y: number, z: number]} rotation={sidewalk.rotation as [x: number, y: number, z: number]} scale={0.25} />
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function PlazaPavingInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/plaza-paving.glb");

    const { plazaPavings } = foundations;

    return (
        <Instances geometry={(nodes["plaza_paving_01"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {plazaPavings.map((plazaPaving, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`plaza-paving-${index}`} ccd>
                    <Instance position={plazaPaving.position as [x: number, y: number, z: number]} rotation={plazaPaving.rotation as [x: number, y: number, z: number]} scale={0.25}/>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function PlatformApronTile(props: FoundationCommonProps) {
    const { nodes, materials } = useGLTF("/models/foundations/platform-apron-tile.glb");

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group {...props}>
                <mesh geometry={(nodes["platform_apron_tile"] as Mesh).geometry} material={materials["lowpoly"]} scale={0.375} receiveShadow/>
                <mesh position={[0, -0.475, 0]} receiveShadow castShadow>
                    <boxGeometry args={[1.5, 0.95, 1.5]} />
                    <meshStandardMaterial color={brown[600]} />
                </mesh>
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function PlatformApronTileInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/platform-apron-tile.glb");

    const { platformApronTiles } = foundations;

    return (
        <Instances geometry={(nodes["platform_apron_tile"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {platformApronTiles.map((platformApronTile, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`platform-apron-tile-${index}`} ccd>
                    <group position={platformApronTile.position as [x: number, y: number, z: number]} rotation={platformApronTile.rotation as [x: number, y: number, z: number]}>
                        <Instance scale={0.375}/>
                        <mesh position={[0, -0.475, 0]} receiveShadow castShadow>
                            <boxGeometry args={[1.5, 0.95, 1.5]}/>
                            <meshStandardMaterial color={brown[600]}/>
                        </mesh>
                    </group>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type GrassTileProps = {
    dirtOnly?: boolean
}

function GrassTile(props: FoundationCommonProps & GrassTileProps) {
    const { nodes, materials } = useGLTF("/models/foundations/grass-tile.glb");

    const { dirtOnly = false } = props;

    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group {...props}>
                {!dirtOnly && (
                    <mesh geometry={(nodes["grass_tile"] as Mesh).geometry} material={materials["lowpoly"]} scale={0.375} receiveShadow/>
                )}
                <mesh position={[0, dirtOnly ? -0.45 : -0.5, 0]} receiveShadow castShadow>
                    <boxGeometry args={[1.5, 1, 1.5]}/>
                    <meshStandardMaterial color={brown[700]}/>
                </mesh>
            </group>
        </RigidBody>
    )
}

function GrassTileInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/grass-tile.glb");

    const { grassTiles } = foundations;

    return (
        <Instances geometry={(nodes["grass_tile"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {grassTiles.map((grassTile, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`grass-tile-${index}`} ccd>
                    <group position={grassTile.position as [x: number, y: number, z: number]} rotation={grassTile.rotation as [x: number, y: number, z: number]}>
                        <Instance scale={0.375} />
                        <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
                            <boxGeometry args={[1.5, 1, 1.5]}/>
                            <meshStandardMaterial color={brown[700]}/>
                        </mesh>
                    </group>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function DirtTrailInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/dirt-trail.glb");

    const { dirtTrails } = foundations;

    return (
        <Instances geometry={(nodes["dirt_trail"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {dirtTrails.map((dirtTrail, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`dirt-trail-${index}`} ccd>
                    <group position={dirtTrail.position as [x: number, y: number, z: number]} rotation={dirtTrail.rotation as [x: number, y: number, z: number]}>
                        <Instance scale={0.375} />
                        <mesh position={[0, -0.5, 0]} receiveShadow>
                            <boxGeometry args={[1.5, 1, 1.5]}/>
                            <meshStandardMaterial color={brown[700]}/>
                        </mesh>
                    </group>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function PackedEarthTileInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/packed-earth-tile.glb");

    const { packedEarthTiles } = foundations;

    return (
        <Instances geometry={(nodes["packed_earth_tile"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {packedEarthTiles.map((packedEarthTile, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`packed-earth-tile-${index}`} ccd>
                    <group position={packedEarthTile.position as [x: number, y: number, z: number]} rotation={packedEarthTile.rotation as [x: number, y: number, z: number]}>
                        <Instance scale={0.375}/>
                        <mesh position={[0, -0.505, 0]} receiveShadow castShadow>
                            <boxGeometry args={[1.5, 1.01, 1.5]}/>
                            <meshStandardMaterial color={brown[700]}/>
                        </mesh>
                    </group>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function ForestFloorInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/forest-floor.glb");

    const { forestFloors } = foundations;

    return (
        <Instances geometry={(nodes["forest_floor"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {forestFloors.map((forestFloor, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`forest-floor-${index}`} ccd>
                    <group position={forestFloor.position as [x: number, y: number, z: number]} rotation={forestFloor.rotation as [x: number, y: number, z: number]}>
                        <Instance scale={0.375}/>
                        <mesh position={[0, -0.505, 0]} receiveShadow castShadow>
                            <boxGeometry args={[1.5, 1.01, 1.5]}/>
                            <meshStandardMaterial color={brown[700]}/>
                        </mesh>
                    </group>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function LakeShoreStraightInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/lake-shore-straight.glb");

    const { lakeShoreStraights } = foundations;

    return (
        <Instances geometry={(nodes["lake_shore_straight"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {lakeShoreStraights.map((lakeShoreStraight, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`lake-shore-straight-${index}`} ccd>
                    <group position={lakeShoreStraight.position as [x: number, y: number, z: number]} rotation={lakeShoreStraight.rotation as [x: number, y: number, z: number]}>
                        <Instance scale={0.375}/>
                        <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
                            <boxGeometry args={[1.5, 0.915, 1.5]}/>
                            <meshStandardMaterial color={brown[700]}/>
                        </mesh>
                    </group>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function LakeShoreCornerInInstances() {
    const { nodes, materials } = useGLTF("/models/foundations/lake-shore-corner-in.glb");

    const { lakeShoreCornerIns } = foundations;

    return (
        <Instances geometry={(nodes["lake_shore_corner_in"] as Mesh).geometry} material={materials["lowpoly"]} receiveShadow>
            {lakeShoreCornerIns.map((lakeShoreCornerIn, index) =>
                <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} key={`lake-shore-straight-${index}`} ccd>
                    <group position={lakeShoreCornerIn.position as [x: number, y: number, z: number]} rotation={lakeShoreCornerIn.rotation as [x: number, y: number, z: number]}>
                        <Instance scale={0.375}/>
                        <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
                            <boxGeometry args={[1.5, 0.915, 1.5]}/>
                            <meshStandardMaterial color={brown[700]}/>
                        </mesh>
                    </group>
                </RigidBody>
            )}
        </Instances>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function ParkingSign(props: OtherCommonProps) {
    const { nodes, materials } = useGLTF("/models/others/parking-sign.glb");

    return (
        <RigidBody type={"fixed"} colliders={"hull"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <mesh geometry={(nodes["sign_accessible_symbol_01"] as Mesh).geometry} material={materials["lowpoly"]} {...props} scale={0.25} receiveShadow castShadow/>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function GoSpace() {
    const texture = useTexture("/textures/go_space.webp");
    
    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group position={[9, 0, 9]}>
                <mesh receiveShadow>
                    <boxGeometry args={[2.5, 0.2, 2.5]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} map={index === 2 ? texture : undefined} key={`go-space-material-${index}`} />
                    )}
                    {/* <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.2} position={[0, 0.105, -0.55]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]}>{"Collect 200$ Salary\nAs You Pass"}</Text>
                        <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.5} position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]}>GO</Text>
                        <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={1} position={[0, 0.105, 0.55]} rotation={[-Math.PI / 2, 0, 0]} color={red[700]}>←</Text> */}
                    {/* <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                            <Box className="relative size-133 bg-zinc-200">
                                <Stack className="size-full justify-center items-center select-none -rotate-45" spacing={2}>
                                    <Typography className="max-w-md font-fredoka! text-5xl! text-center leading-snug">Collect 200$ Salary As You Pass</Typography>
                                    <Typography className="font-fredoka! text-8xl!">GO</Typography>
                                </Stack>
                                <West className="absolute bottom-0 left-1/2 -translate-x-1/2 size-35! scale-x-250 text-red-600"/>
                            </Box>
                        </Html> */}
                    <Edges color={"black"} lineWidth={2} />
                </mesh>
                <group>
                    <mesh position={[-1.75, -0.425, -1]} receiveShadow>
                        <boxGeometry args={[1, 1.05, 0.5]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                    <mesh position={[-1, -0.425, -1.75]} receiveShadow>
                        <boxGeometry args={[0.5, 1.05, 1]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                </group>
                <StartLine />
                <FinishLine />
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function JailSpace() {
    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group position={[-9, 0, 9]}>
                <mesh receiveShadow>
                    <boxGeometry args={[2.5, 0.2, 2.5]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} key={`go-space-material-${index}`} />
                    )}
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.3} position={[-0.6, 0.105, -0.5]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} color={grey[900]}>Just</Text>
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.3} position={[0.5, 0.105, 0.6]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]}>Visiting</Text>
                    {/* <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                            <Box className="relative size-133 select-none bg-zinc-200">
                                <Typography className="absolute bottom-25 right-15 font-fredoka! text-7xl!">Visiting</Typography>
                                <Typography className="absolute top-35 left-15 font-fredoka! text-7xl! rotate-90">Just</Typography>
                            </Box>
                        </Html> */}
                    <Edges color={"black"} lineWidth={2} />
                </mesh>
                <group>
                    <mesh position={[1.75, -0.425, -1]} receiveShadow>
                        <boxGeometry args={[1, 1.05, 0.5]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                    <mesh position={[1, -0.425, -1.75]} receiveShadow>
                        <boxGeometry args={[0.5, 1.05, 1]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                    <mesh position={[-1.75, -0.425, 1]} receiveShadow>
                        <boxGeometry args={[1, 1.05, 0.5]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                    <mesh position={[-1, -0.425, 1.75]} receiveShadow>
                        <boxGeometry args={[0.5, 1.05, 1]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                </group>
                <Jail />
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function FreeParkingSpace() {
    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group position={[-9.25, 0, -9.25]}>
                <mesh position={[0.25, 0, 1.25]} receiveShadow>
                    <boxGeometry args={[2.5, 0.2, 0.5]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} key={`go-space-material-${index}`} />
                    )}
                    <Edges color={"black"} lineWidth={2} />
                </mesh>
                <mesh position={[0.25, -0.021, 0.5]} receiveShadow>
                    <boxGeometry args={[2.5, 0.159, 1]} />
                    <meshStandardMaterial color={grey[500]} />
                    <Edges color={"black"} lineWidth={2} />
                </mesh>
                <mesh position={[0.25, 0, -0.5]} receiveShadow>
                    <boxGeometry args={[2.5, 0.2, 1]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} key={`go-space-material-${index}`} />
                    )}
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.3} position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, Math.PI]} color={grey[900]} receiveShadow>Free Parking</Text>
                    {/* <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                            <Stack className="w-133 h-66.5 justify-center items-center select-none bg-zinc-200 rotate-180" spacing={2}>
                                <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">Free Parking</Typography>
                            </Stack>
                        </Html> */}
                    <Edges color={"black"} lineWidth={2} />
                </mesh>
                <group>
                    <mesh position={[2, -0.425, 1.25]} receiveShadow>
                        <boxGeometry args={[1, 1.05, 0.5]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                    <mesh position={[1.25, -0.425, 2]} receiveShadow>
                        <boxGeometry args={[0.5, 1.05, 1]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                </group>
                <ParkingBay position={[1, 0.06, 0.5]} rotation={[0, -Math.PI / 2, 0]} />
                <Crosswalk position={[0, 0.06, 0.5]} rotation={[0, -Math.PI / 2, 0]} />
                <ParkingSign position={[0.5, 0.1, 0.05]} rotation={[0, -Math.PI / 2, 0]} />
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function GoToJailSpace() {
    return (
        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group position={[9, 0, -9]}>
                <mesh receiveShadow >
                    <boxGeometry args={[2.5, 0.2, 2.5]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} key={`go-space-material-${index}`} />
                    )}
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.3} position={[-0.4, 0.105, 0.4]} rotation={[-Math.PI / 2, 0, Math.PI / 1.32]} color={grey[900]} receiveShadow>Go To Jail</Text>
                    <Image url={"/textures/jail.webp"} position={[0.2, 0.1005, -0.2]} rotation={[-Math.PI / 2, 0, Math.PI / 1.32]} transparent receiveShadow />
                    {/* <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                            <Stack className="size-133 justify-center items-center select-none bg-zinc-200 -rotate-90" spacing={2}>
                                <Box className="place-content-center place-items-center -rotate-45">
                                    <Typography className="font-fredoka! text-6xl! text-center leading-snug whitespace-break-spaces">Go To Jail</Typography>
                                    <Box className="size-40" component={"img"} src={"/images/jail.png"} draggable={false}/>
                                </Box>
                            </Stack>
                        </Html> */}
                    <Edges color={"black"} lineWidth={2} />
                </mesh>
                <group>
                    <mesh position={[1.75, -0.425, -1]} receiveShadow>
                        <boxGeometry args={[1, 1.05, 0.5]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                    <mesh position={[1, -0.425, -1.75]} receiveShadow>
                        <boxGeometry args={[0.5, 1.05, 1]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                    <mesh position={[-1.75, -0.425, 1]} receiveShadow>
                        <boxGeometry args={[1, 1.05, 0.5]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                    <mesh position={[-1, -0.425, 1.75]} receiveShadow>
                        <boxGeometry args={[0.5, 1.05, 1]}/>
                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                    </mesh>
                </group>
                <PoliceCar initialPosition={[-0.75, 0.14, 0.75]} initialRotation={[0, Math.PI / 4, 0]} />
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function CommunityChestSpace(props: SpaceCommonProps) {
    return (
        <group {...props}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.2} position={[0, 0.105, -0.25]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]} receiveShadow>{"Community\nChest"}</Text>
                    <Image url={"/textures/community_chest.webp"} position={[0, 0.1005, 0.45]} rotation={[-Math.PI / 2, 0, 0]} scale={1} transparent receiveShadow/>
                    {/* <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Box className="w-97.75 h-133.5 place-content-end place-items-center bg-zinc-100 select-none">
                            <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">{"Community\nChest"}</Typography>
                            <Box className="size-60" component={"img"} src={"/images/community_chest.png"} draggable={false}/>
                        </Box>
                    </Html> */}
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            <GrassTile position={[0, 0.0255, -1.75]}/>
            <Chest/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type TaxSpaceProps = {
    taxValue: number,
    label: string
}

function TaxSpace(props: SpaceCommonProps & TaxSpaceProps) {
    const { label, taxValue } = props;
    
    return (
        <group {...props}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.2} position={[0, 0.105, -0.5]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]} receiveShadow>{label}</Text>
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.2} position={[0, 0.105, 0.4]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]} receiveShadow>Pay {taxValue}$</Text>
                    {/* <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Box className="w-97.75 h-133.5 place-content-center place-items-center bg-zinc-100 select-none">
                            <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">{label}</Typography>
                            <Typography className="mt-30! font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">Pay {taxValue}$</Typography>
                        </Box>
                    </Html> */}
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            <GrassTile position={[0, 0.0255, -1.75]}/>
            <Bank />
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

function ChanceSpace(props: SpaceCommonProps) {
    return (
        <group {...props}>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.2} position={[0, 0.105, -0.55]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]} receiveShadow>Chance</Text>
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.9} position={[0, 0.105, 0.25]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]} receiveShadow>?</Text>
                    {/* <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Stack className="w-97.75 h-133.5 justify-center items-center bg-zinc-100 select-none">
                            <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">Chance</Typography>
                            <QuestionMark className="size-50! mt-10! text-zinc-800"/>
                        </Stack>
                    </Html> */}
                    <Edges color={"black"} lineWidth={1.5} />
                </mesh>
            </RigidBody>
            <GrassTile position={[0, 0.0255, -1.75]}/>
            <Chance/>
        </group>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type RailroadSpaceProps = {
    label: string
}

function RailroadSpace(props: SpaceCommonProps & RailroadSpaceProps) {
    const { label } = props;

    const spaceRef = useRef<RapierRigidBody>(null!);
    
    const { handlePointerOver, handlePointerOut } = useSpaceHover(spaceRef);
    
    return (
        <RigidBody ref={spaceRef} type={"kinematicPosition"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group {...props} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
                <mesh receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.2} position={[0, 0.105, -0.55]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]} receiveShadow>{label}</Text>
                    <Image url={"/textures/train.webp"} position={[0, 0.1005, 0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={1.1} transparent receiveShadow />
                    {/* <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                            <Stack className="w-97.75 h-133.5 justify-center items-center bg-zinc-100 select-none">
                                <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">{label}</Typography>
                                <DirectionsTransit className={"size-50! mt-5! text-zinc-800"}/>
                            </Stack>
                        </Html> */}
                    <Edges color={"black"} lineWidth={2} />
                </mesh>
                <MetroEntrance />
                <PlatformApronTile position={[0, 0, -1.75]} />
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type UtilitySpaceProps = {
    type: "ELECTRIC" | "WATER"
}

function UtilitySpace(props: SpaceCommonProps & UtilitySpaceProps) {
    const { type } = props;

    const spaceRef = useRef<RapierRigidBody>(null!);
    
    const { handlePointerOver, handlePointerOut } = useSpaceHover(spaceRef);
    
    return (
        <RigidBody ref={spaceRef} type={"kinematicPosition"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group {...props} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
                <mesh receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 2]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.2} position={[0, 0.105, -0.55]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]} receiveShadow>{type === "ELECTRIC" ? "Electric\nCompany" : "Water Works"}</Text>
                    <Image url={`/textures/${type === "ELECTRIC" ? "electric.webp" : "water.webp"}`} position={[0, 0.1005, 0.3]} rotation={[-Math.PI / 2, 0, 0]} scale={0.9} transparent receiveShadow />
                    {/* <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                            <Stack className="w-97.75 h-133.5 justify-center items-center bg-zinc-100 select-none">
                                <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">{type === "ELECTRIC" ? "Electric\nCompany" : "Water\nWorks"}</Typography>
                                {type === "ELECTRIC" ? (
                                    <Bolt className={"size-50! mt-5! text-yellow-300"} />
                                ) : (
                                    <WaterDrop className={"size-50! mt-5! text-blue-400"} />
                                )}
                            </Stack>
                        </Html> */}
                    <Edges color={"black"} lineWidth={2} />
                </mesh>
                {type === "ELECTRIC" ? (
                    <>
                        <ElectricStation position={[0, 0.11, -1.4]} />
                        <TransmissionTower position={[0, 0, -2.1]} rotation={[0, Math.PI / 2, 0]} />
                    </>
                ) : (
                    <WaterTower position={[0, 0.1, -1.75]} rotation={[0, -Math.PI / 2, 0]} />
                )};
                <GrassTile position={[0, 0.0255, -1.75]} />
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

type PropertySpaceProps = {
    group: SpaceGroup
    label: string
}

function PropertySpace(props: SpaceCommonProps & PropertySpaceProps) {
    const { group, label } = props;

    const spaceRef = useRef<RapierRigidBody>(null!);
    
    const { handlePointerOver, handlePointerOut } = useSpaceHover(spaceRef);

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
        <RigidBody ref={spaceRef} type={"kinematicPosition"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
            <group {...props} receiveShadow onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
                <mesh position={[0, 0, 0.25]} receiveShadow>
                    <boxGeometry args={[1.5, 0.2, 1.5]} />
                    {Array.from({ length: 6 }).map((_, index) =>
                        <meshBasicMaterial attach={`material-${index}`} color={index === 2 ? "white" : grey[500]} key={`other-space-material-${index}`} />
                    )}
                    <Text font={"/fonts/Fredoka-Regular.ttf"} textAlign={"center"} fontSize={0.2} position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]} color={grey[900]}>{label}</Text>
                    {/* <Html position={[0, 0.1005, 0]} rotation={[-Math.PI / 2, 0, 0]} distanceFactor={1.5} occlude={"blending"} transform receiveShadow>
                        <Box className="w-97.75 h-133.5 select-none">
                            <Box className={`w-full h-30`} sx={{ bgcolor: propertyGroupColor }}/>
                            <Stack className="size-full items-center bg-zinc-100">
                                <Typography className="font-fredoka! text-5xl! text-center leading-snug whitespace-break-spaces">{label}</Typography>
                            </Stack>
                        </Box>
                    </Html> */}
                    <Edges color={"black"} lineWidth={2} />
                </mesh>
                <mesh position={[0, 0, -0.75]}>
                    <boxGeometry args={[1.5, 0.2, 0.5]}/>
                    <meshStandardMaterial color={propertyGroupColor}/>
                    <Edges color={"black"} lineWidth={2} />
                </mesh>
                <GrassTile position={[0, 0.0255, -1.75]}/>
            </group>
        </RigidBody>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

export function Board() {
    const trafficLightStates: Map<string, "red" | "yellow" | "green"> = new Map();

    const { basketballPlaygrounds, campsites, docks } = others;

    return (
        <SceneryContext.Provider value={{ trafficLightStates }}>
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

            <GrassTileInstances/>
            <ForestFloorInstances/>
            <LakeShoreStraightInstances/>
            <LakeShoreCornerInInstances/>
            <DirtTrailInstances/>
            <PackedEarthTileInstances/>
            <SidewalkInstances/>
            <PlazaPavingInstances/>
            <PlatformApronTileInstances/>
            <RoadStraightInstances/>
            <RoadTJunctionInstances/>
            <RoadCornerInstances/>
            {foundations.crosswalks.map((crosswalk, index) =>
                <Crosswalk position={crosswalk.position as [x: number, y: number, z: number]} rotation={crosswalk.rotation as [x: number, y: number, z: number]} trafficLightNames={[`traffic-light-${index * 2}`, `traffic-light-${index * 2 + 1}`]} trafficLightDuration={[20, 3, 1]} trafficLights key={`crosswalk-${index}`}/>
            )}

            <ApartmentInstances/>
            <BoulangerieInstances/>
            <ConvenienceStoreInstances/>
            <CafeBrasserieInstances/>
            <CornerStoreInstances/>
            <DecoHotelInstances/>
            <DecoShopfrontRowInstances/>
            <StationBuildingInstances/>
            <HaussmannApartmentInstances/>
            <TwoStoryHouseInstances/>
            <ConstructionSiteIntances/>
            <HomeCottageInstances/>
            <FarmHouseInstances/>
            <RanchHouseInstances/>
            <RetailPodiumInstances/>
            <ShopAwningInstances/>
            <GlassSkyScraperInstances/>
            <GlassSupertallInstances/>
            <MidriseOfficeInstances/>
            <WaterfrontCondoTowerInstances/>
            <PorchHouseFrontInstances/>
            <TurfDwellingInstances/>

            {cars.ordinalSedan.map((ordinalSedan, index) =>
                <OrdinalSedanCar initialPosition={ordinalSedan.initialPosition as [x: number, y: number, z: number]} initialRotation={ordinalSedan.initialRotation as [x: number, y: number, z: number]} key={`car-${index}`}/>
            )}

            <SplitRailFenceInstances/>
            <WildTreeInstances/>
            <HotAirBalloon/>
            <GoldenTrophyStatue position={[0, 0, 0]}/>
            {basketballPlaygrounds.map((basketballPlayground, index) =>
                <BasketballPlayground position={basketballPlayground.position as [x: number, y: number, z: number]} rotation={basketballPlayground.rotation as [x: number, y: number, z: number]} key={`basketball-playground-${index}`}/>
            )}
            {campsites.map((campsite, index) =>
                <Campsite position={campsite.position as [x: number, y: number, z: number]} rotation={campsite.rotation as [x: number, y: number, z: number]} key={`campsite-${index}`}/>
            )}
            {docks.map((dock, index) =>
                <Dock position={dock.position as [x: number, y: number, z: number]} rotation={dock.rotation as [x: number, y: number, z: number]} key={`dock-${index}`}/>
            )}
        </SceneryContext.Provider>
    );
}

/* ------------------------------------------------------------------------------------------------------------------ */

useGLTF.preload("/models/buildings/apartment.glb");
useGLTF.preload("/models/buildings/bank.glb");
useGLTF.preload("/models/buildings/boulangerie.glb");
useGLTF.preload("/models/buildings/brownstone.glb");
useGLTF.preload("/models/buildings/bungalow-house.glb");
useGLTF.preload("/models/buildings/cafe-brasserie.glb");
useGLTF.preload("/models/buildings/concrete-frame-wip.glb");
useGLTF.preload("/models/buildings/convenience-store.glb");
useGLTF.preload("/models/buildings/corner-store.glb");
useGLTF.preload("/models/buildings/deco-hotel.glb");
useGLTF.preload("/models/buildings/deco-shopfront-row.glb");
useGLTF.preload("/models/buildings/farmhouse.glb");
useGLTF.preload("/models/buildings/glass-skyscraper.glb");
useGLTF.preload("/models/buildings/glass-supertall.glb");
useGLTF.preload("/models/buildings/haussmann-apartment.glb");
useGLTF.preload("/models/buildings/home-cottage.glb");
useGLTF.preload("/models/buildings/midrise-office.glb");
useGLTF.preload("/models/buildings/porch-house-front.glb");
useGLTF.preload("/models/buildings/portacabin-office.glb");
useGLTF.preload("/models/buildings/range-house.glb");
useGLTF.preload("/models/buildings/retail-podium.glb");
useGLTF.preload("/models/buildings/shop-awning.glb");
useGLTF.preload("/models/buildings/station-building.glb");
useGLTF.preload("/models/buildings/turf-dwelling.glb");
useGLTF.preload("/models/buildings/two-story-house.glb");
useGLTF.preload("/models/buildings/waterfront-condo-tower.glb");
useGLTF.preload("/models/cars/car-sedan.glb");
useGLTF.preload("/models/cars/metropolis-taxi.glb");
useGLTF.preload("/models/cars/pastel-sedan.glb");
useGLTF.preload("/models/cars/police-car.glb");
useGLTF.preload("/models/cars/suv-minivan.glb");
useGLTF.preload("/models/foundations/dirt-trail.glb");
useGLTF.preload("/models/foundations/forest-floor.glb");
useGLTF.preload("/models/foundations/grass-tile.glb");
useGLTF.preload("/models/foundations/lake-shore-corner-in.glb");
useGLTF.preload("/models/foundations/lake-shore-straight.glb");
useGLTF.preload("/models/foundations/lake-tiel.glb");
useGLTF.preload("/models/foundations/packed-earth-tile.glb");
useGLTF.preload("/models/foundations/parking-bay.glb");
useGLTF.preload("/models/foundations/platform-apron-tile.glb");
useGLTF.preload("/models/foundations/plaza-paving.glb");
useGLTF.preload("/models/foundations/road-corner.glb");
useGLTF.preload("/models/foundations/road-crossing-curbcut.glb");
useGLTF.preload("/models/foundations/road-straight.glb");
useGLTF.preload("/models/foundations/road-t-junction.glb");
useGLTF.preload("/models/foundations/sidewalk.glb");
useGLTF.preload("/models/others/autumn-maple.glb");
useGLTF.preload("/models/others/basketball-hoop.glb");
useGLTF.preload("/models/others/bench.glb");
useGLTF.preload("/models/others/birch-tree.glb");
useGLTF.preload("/models/others/brick-pallet.glb");
useGLTF.preload("/models/others/bus-shelter.glb");
useGLTF.preload("/models/others/bush.glb");
useGLTF.preload("/models/others/campt-tent.glb");
useGLTF.preload("/models/others/cement-bag-pallet.glb");
useGLTF.preload("/models/others/chain-link-fence.glb");
useGLTF.preload("/models/others/chest.glb");
useGLTF.preload("/models/others/clown-fish.glb");
useGLTF.preload("/models/others/crate.glb");
useGLTF.preload("/models/others/dock-jetty.glb");
useGLTF.preload("/models/others/fern.glb");
useGLTF.preload("/models/others/fire-hydrant.glb");
useGLTF.preload("/models/others/fishing-pole.glb");
useGLTF.preload("/models/others/flower-planter.glb");
useGLTF.preload("/models/others/golden-trophy.glb");
useGLTF.preload("/models/others/granite-rock-cluster.glb");
useGLTF.preload("/models/others/hot-air-balloon.glb");
useGLTF.preload("/models/others/jail.glb");
useGLTF.preload("/models/others/latern.glb");
useGLTF.preload("/models/others/lichen-granite-boulder.glb");
useGLTF.preload("/models/others/log-bench.glb");
useGLTF.preload("/models/others/metro-entrance.glb");
useGLTF.preload("/models/others/oak.glb");
useGLTF.preload("/models/others/park-bench.glb");
useGLTF.preload("/models/others/parking-sign.glb");
useGLTF.preload("/models/others/pine.glb");
useGLTF.preload("/models/others/scaffold-facade.glb");
useGLTF.preload("/models/others/sky-day-dome.glb");
useGLTF.preload("/models/others/stone-ring-campfire.glb");
useGLTF.preload("/models/others/street-lamp.glb");
useGLTF.preload("/models/others/street-stop-sign.glb");
useGLTF.preload("/models/others/street-tree.glb");
useGLTF.preload("/models/others/traffic-light.glb");
useGLTF.preload("/models/others/transmission-tower.glb");
useGLTF.preload("/models/others/trash-bin.glb");
useGLTF.preload("/models/others/water-tower.glb");
useGLTF.preload("/models/others/wheelie-bins.glb");
useGLTF.preload("/models/others/split-rail-fence.glb");