import type { Group } from "../constants/Group";
import type { IUtilityState } from "./IUtilityState";

export interface IUtility {
    id: string,
    name: string,
    position: number,
    group: Group,
    price: number,
    mortgageValue: number,
    state: IUtilityState
}