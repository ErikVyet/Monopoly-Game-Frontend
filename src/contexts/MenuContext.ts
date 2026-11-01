import type { CameraControlsImpl } from "@react-three/drei";
import { createContext, type Dispatch, type RefObject, type SetStateAction } from "react";
import type { MenuState } from "../constants/MenuState";

export const MenuContext = createContext<{
    cameraControlsRef: RefObject<CameraControlsImpl>,
    menuState: MenuState,
    setMenuState: Dispatch<SetStateAction<MenuState>>
} | null>(null);