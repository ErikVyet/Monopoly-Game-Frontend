import { createContext } from "react";

export const SceneryContext = createContext<{
    time: "day" | "night",
    trafficLightStates: Map<string, "red" | "yellow" | "green">
} | null>(null);