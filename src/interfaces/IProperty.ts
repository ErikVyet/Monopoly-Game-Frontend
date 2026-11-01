import type { Group } from "../constants/Group";
import type { IRentTier } from "./IRentTier";
import type { IPropertyState } from "./IPropertyState";

export interface IProperty {
    id: string,
    name: string,
    position: number,
    group: Group,
    price: number,
    houseCost: number,
    mortgageValue: number,
    rentTiers: IRentTier[],
    state: IPropertyState
}