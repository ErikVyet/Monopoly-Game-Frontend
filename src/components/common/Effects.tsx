import { grey } from "@mui/material/colors";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, MathUtils, Vector3 } from "three";
import { SMOKE_MAX_HEIGHT } from "../../constants/SceneProps";

type SmokeProps = {
    position?: [x: number, y: number, z: number],
    rotation?: [x: number, y: number, z: number],
    scale?: number,
    size?: number
}

export function Smoke(props: SmokeProps) {
    const { size = 40 } = props;
    
    const positionsRef = useRef<BufferAttribute>(null!);
    const tempPositionRef = useRef<Vector3>(new Vector3());

    const initialPositions = useMemo(() => {
        const positions = new Float32Array(size * 3);
        for (let i = 0; i < size; i++) {
            positions[i * 3] = MathUtils.randFloatSpread(0.1);
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = MathUtils.randFloatSpread(0.1);
        }
        return positions;
    }, [props.position, props.rotation, props.scale, size]);
    const basePositions = useMemo(() => new Float32Array(initialPositions), [initialPositions]);
    const spreadAreas = useMemo(() => {
        const spreads = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            spreads[i] = MathUtils.randFloat(0.1, 0.2);
        }
        return spreads;
    }, [initialPositions]);
    const flyingSpeeds = useMemo(() => {
        const speeds = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            speeds[i] = MathUtils.randFloat(0.1, 0.25);
        }
        return speeds;
    }, [initialPositions]);

    useFrame(({ clock }) => {
        const positions = positionsRef.current;
        if (!positions) return;

        for (let i = 0; i < size; i++) {
            tempPositionRef.current.fromBufferAttribute(positions, i);
            tempPositionRef.current.x = basePositions[i * 3] + Math.sin(clock.elapsedTime * 2 + i * 0.6) * spreadAreas[i];
            tempPositionRef.current.y = basePositions[i * 3 + 1] + (clock.elapsedTime * flyingSpeeds[i] + i * 0.2) % SMOKE_MAX_HEIGHT;
            tempPositionRef.current.z = basePositions[i * 3 + 2] + Math.cos(clock.elapsedTime * 2 + i * 0.6) * spreadAreas[i];
            positions.setXYZ(i, tempPositionRef.current.x, tempPositionRef.current.y, tempPositionRef.current.z);
        }

        positions.needsUpdate = true;
    });

    return (
        <group {...props}>
            <points>
                <bufferGeometry>
                    <bufferAttribute ref={positionsRef} attach={"attributes-position"} args={[initialPositions, 3]}/>
                </bufferGeometry>
                <pointsMaterial size={0.15} color={grey[500]} depthWrite={false} opacity={0.8} transparent/>
            </points>
        </group>
    );
}