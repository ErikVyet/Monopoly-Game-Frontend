import { createContext, type Dispatch, type SetStateAction } from "react";

export const SettingContext = createContext<{
    viewMode: "vr" | "ar" | "default",
    setViewMode: Dispatch<SetStateAction<"vr" | "ar" | "default">>,
    draggable: boolean,
    setDraggable: Dispatch<SetStateAction<boolean>>
} | null>(null);