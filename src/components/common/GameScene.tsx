import { blue, grey } from "@mui/material/colors";
import { Board, SkyDome } from "./Models";
import { Physics, RigidBody } from "@react-three/rapier";
import { ActiveCollisionTypes } from "@dimforge/rapier3d-compat";
import { useContext, useRef, useState } from "react";
import { DirectionalLightHelper, MathUtils, Vector3, type DirectionalLight } from "three";
import { DragControls, Environment, OrbitControls, useHelper, useTexture } from "@react-three/drei";
import { SettingContext } from "../../contexts/SettingContext";
import { useFrame } from "@react-three/fiber";
import { useXRControllerButtonEvent, useXRInputSourceState, XROrigin } from "@react-three/xr";
import { LIGHT_ALPHA, LIGHT_POSITION_RANGE } from "../../constants/SceneProps";

export function TestScene() {
    const settingContext = useContext(SettingContext);
    if (!settingContext) return;
    const { viewMode } = settingContext;

    const floorTexture = useTexture("/textures/test.webp");

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            <group scale={viewMode === "ar" ? 0.2 : 1}>
                <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[10, 10, 64, 64]} />
                    <meshStandardMaterial map={floorTexture} />
                    {/* <MeshReflectorMaterial distortion={0.5} map={floorTexture}/> */}
                </mesh>

                {/* 1. Chrome / Mirror Sphere */}
                <mesh position={[-1.5, 0.5, 0]}>
                    <sphereGeometry args={[0.8, 64, 64]} />
                    <meshStandardMaterial
                        color="white"
                        metalness={1}
                        roughness={0} // Perfectly smooth mirror
                    />
                </mesh>

                {/* 2. Rough Stone / Matte Sphere */}
                <mesh position={[0, 0.5, -1]}>
                    <sphereGeometry args={[0.8, 64, 64]} />
                    <meshStandardMaterial
                        color="#aaaaaa"
                        metalness={0.1}
                        roughness={0.9} // Very rough/matte surface
                    />
                </mesh>

                {/* 3. Glass / Refractive Sphere */}
                <mesh position={[0.5, 0.5, 1]}>
                    <sphereGeometry args={[0.8, 64, 64]} />
                    <meshPhysicalMaterial
                        transmission={1.5} // Makes it glass-like/see-through
                        roughness={0}
                        thickness={1.5} // Refraction depth
                        ior={1.5} // Index of refraction for glass
                    />
                </mesh>
            </group>

            {/* Environment map provides the reflections seen on the shiny spheres */}
            <Environment preset="city" />
            <OrbitControls />
        </>
    );
}

export function MenuGameScene() {
    const settingContext = useContext(SettingContext);
    if (!settingContext) return null;
    const { draggable, viewMode } = settingContext;

    const lightRef = useRef<DirectionalLight>(null!);
    const lightTargetPositionRef = useRef<Vector3>(new Vector3());

    const [isDragging, setIsDragging] = useState(false);

    const rightControllerState = useXRInputSourceState("controller", "right");

    useXRControllerButtonEvent(rightControllerState, "xr-standard-trigger", (state) => {
        if (state === "pressed") {
            
        }
    });

    useHelper(lightRef, DirectionalLightHelper, 2, "yellow");

    useFrame(({ clock }, delta) => {
        const light = lightRef.current;
        if (!light) return;

        const lightCurrentPos = light.position;
        const lightTargetPositionX = MathUtils.damp(lightCurrentPos.x, LIGHT_POSITION_RANGE * Math.cos(clock.elapsedTime * 0.01), 5, delta);
        const lightTargetPositionZ = MathUtils.damp(lightCurrentPos.z, LIGHT_POSITION_RANGE * Math.sin(clock.elapsedTime * 0.01), 5, delta);

        lightTargetPositionRef.current.set(lightTargetPositionX, lightCurrentPos.y, lightTargetPositionZ);
        light.position.lerp(lightTargetPositionRef.current, LIGHT_ALPHA);
    });

    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    return (
        <>
            <XROrigin position={[0, 0, 2]}/>
            <directionalLight ref={lightRef} position={[10, 10, 10]} intensity={1.5} scale={2} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-camera-near={0.5} shadow-camera-far={60} shadow-mapSize={[2048, 2048]} castShadow/>
            <ambientLight position={[0, 5, 0]} intensity={1} />
            {/* <gridHelper args={[100, 100]}/> */}
            {/* <CameraControls ref={cameraControlsRef}/> */}
            {/* <Sky/> */}
            <OrbitControls enableRotate={!isDragging}/>
            <Physics gravity={[0, -9.81 * 3, 0]}>
                <DragControls dragConfig={{ enabled: draggable }} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <group scale={viewMode === "vr" ? 2 : viewMode === "ar" ? 0.04 : 1 }>
                        <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                            <group>
                                <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                                    <planeGeometry args={[48, 48, 128, 128]}/>
                                    <meshStandardMaterial color={blue[500]}/>
                                </mesh>
                                {/* <mesh position={[0, -0.5, 0]}>
                                    <boxGeometry args={[30.5, 1, 30.5]}/>
                                    <meshStandardMaterial color={brown[700]}/>
                                </mesh> */}
                                
                                <group>
                                    <mesh position={[-14.25, -0.425, 13]} receiveShadow>
                                        <boxGeometry args={[2, 1.05, 0.5]}/>
                                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                                    </mesh>
                                    <mesh position={[-13, -0.425, 14.25]} receiveShadow>
                                        <boxGeometry args={[0.5, 1.05, 2]}/>
                                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                                    </mesh>
                                    <mesh position={[-12.75, -0.425, 12]} receiveShadow>
                                        <boxGeometry args={[1, 1.05, 0.5]}/>
                                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                                    </mesh>
                                    <mesh position={[-12, -0.425, 12.75]} receiveShadow>
                                        <boxGeometry args={[0.5, 1.05, 1]}/>
                                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                                    </mesh>
                                </group>

                                <group>
                                    <mesh position={[14.25, -0.425, -13]} receiveShadow>
                                        <boxGeometry args={[2, 1.05, 0.5]}/>
                                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                                    </mesh>
                                    <mesh position={[13, -0.425, -14.25]} receiveShadow>
                                        <boxGeometry args={[0.5, 1.05, 2]}/>
                                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                                    </mesh>
                                    <mesh position={[12.75, -0.425, -12]} receiveShadow>
                                        <boxGeometry args={[1, 1.05, 0.5]}/>
                                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                                    </mesh>
                                    <mesh position={[12, -0.425, -12.75]} receiveShadow>
                                        <boxGeometry args={[0.5, 1.05, 1]}/>
                                        <meshStandardMaterial color={grey[50]} metalness={0.7} roughness={0.2}/>
                                    </mesh>
                                </group>
                            </group>
                        </RigidBody>
                        {/* <Ocean/> */}
                        <SkyDome/>
                        <Board/>
                    </group>
                </DragControls>
            </Physics>
        </>
    );
}