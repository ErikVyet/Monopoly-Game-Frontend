
export interface IPlayer {
    id: string,
    name: string,
    cash: number,
    position: number,
    inJail: boolean,
    jailTurns: number,
    getOutOfJailCards: number,
    isBankrupt: boolean,
    isReady: boolean
}