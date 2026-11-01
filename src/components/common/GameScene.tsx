import { blue } from "@mui/material/colors";
import { Board, SkyDome } from "./Models";
import { RigidBody } from "@react-three/rapier";
import { ActiveCollisionTypes } from "@dimforge/rapier3d-compat";

export function MenuGameScene() {

    return (
        <>
            <RigidBody type={"fixed"} colliders={"cuboid"} activeCollisionTypes={ActiveCollisionTypes.ALL} ccd>
                <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[1000, 1000, 128, 128]}/>
                    <meshStandardMaterial color={blue[500]} />
                </mesh>
            </RigidBody>
            <SkyDome/>
            <Board/>
        </>
    );
}