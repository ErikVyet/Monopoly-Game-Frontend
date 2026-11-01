import type { Group } from "../constants/Group";
import type { IRailroadState } from "./IRailroadState";

export interface IRailroad {
    id: string,
    name: string,
    position: number,
    group: Group,
    price: number,
    mortgageValue: number,
    state: IRailroadState
}