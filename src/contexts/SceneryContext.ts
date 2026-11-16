import { createContext } from "react";

export const SceneryContext = createContext<{
    trafficLightStates: Map<string, "red" | "yellow" | "green">
} | null>(null);