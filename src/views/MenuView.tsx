import { Canvas } from "@react-three/fiber";
import { CameraControlsImpl, Loader, OrbitControls, useProgress } from "@react-three/drei";
import { MenuGameScene } from "../components/common/GameScene";
import { Physics } from "@react-three/rapier";
import { useRef, useState } from "react";
import { MenuContext } from "../contexts/MenuContext";
import { MenuState } from "../constants/MenuState";

export default function MenuView() {
    const { active } = useProgress();

    const cameraControlsRef = useRef<CameraControlsImpl>(null!);

    const [menuState, setMenuState] = useState<MenuState>("START");

    return (
        active ? (
            <Loader containerStyles={{ background: "#0f172a" }} innerStyles={{ width: "300px" }} barStyles={{ background: "#9333ea" }} dataInterpolation={(progress) => `Loading Monopoly Board ${progress.toFixed(0)}%`}/>
        ) : (
            <MenuContext.Provider value={{ cameraControlsRef, menuState, setMenuState }}>
                <Canvas className="h-screen!" frameloop="always" camera={{ position: [0, 10, 15], fov: 50 }} shadows>
                    <directionalLight position={[0, 20, 0]} intensity={1.5}/>
                    <ambientLight position={[0, 5, 0]} intensity={1}/>
                    <gridHelper args={[100, 100]}/>
                    {/* <CameraControls ref={cameraControlsRef}/> */}
                    <OrbitControls/>
                    <Physics gravity={[0, -9.81 * 3, 0]}>
                        <MenuGameScene/>
                    </Physics>
                </Canvas>
            </MenuContext.Provider>
        )
    );
}