import type { RoomStatus } from "../constants/RoomStatus";
import type { IChatMessage } from "./IChatMessage";
import type { IPlayer } from "./IPlayer";

export interface IGameState {
    hostId: string,
    name: string,
    status: RoomStatus,
    players: Map<string, IPlayer>,
    availableHouses: number,
    availableHotels: number,
    messages: IChatMessage[]
}