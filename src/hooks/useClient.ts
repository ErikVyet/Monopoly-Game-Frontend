import { Client } from "@colyseus/sdk";
import { useMemo } from "react";
import type { IGameState } from "../interfaces/IGameState";

export function useClient() {
    const client = useMemo(() => new Client<any, IGameState>(import.meta.env.VITE_SERVER_URL as string), []);
    return client;
}