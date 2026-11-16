import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { useRef, type RefObject } from "react";
import { MathUtils } from "three";

export function useSpaceHover(bodyRef: RefObject<RapierRigidBody>) {
    const targetPositionYRef = useRef(0);
    
    useFrame((_, delta) => {
        const body = bodyRef.current;
        if (!body) return;

        const currentPos = body.translation();

        const targetX = currentPos.x;
        const targetY = MathUtils.damp(currentPos.y, targetPositionYRef.current, 20, delta);
        const targetZ = currentPos.z;

        body.setNextKinematicTranslation({
            x: targetX,
            y: targetY,
            z: targetZ
        });
    });

    const handlePointerOver = () => {
        targetPositionYRef.current = 0.2;
        window.document.body.style.cursor = "pointer";
    };
    const handlePointerOut = () => {
        targetPositionYRef.current = 0;
        window.document.body.style.cursor = "auto";
    };

    return { handlePointerOver, handlePointerOut };
}