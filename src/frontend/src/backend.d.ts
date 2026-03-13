import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface AssetBalance {
    balance: number;
    asset: Asset;
}
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: bigint;
    direction: Direction;
    asset: Asset;
    note: string;
    counterparty: string;
    timestamp: Time;
    amount: number;
}
export enum Asset {
    BNB = "BNB",
    BTC = "BTC",
    ETH = "ETH",
    ICP = "ICP",
    SOL = "SOL",
    TSLA = "TSLA",
    USDT = "USDT"
}
export enum Direction {
    receive = "receive",
    send = "send"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMockBalance(asset: Asset, amount: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getBalances(): Promise<Array<AssetBalance>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDisplayName(): Promise<string>;
    getTransactionHistory(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeWallet(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    receiveAsset(asset: Asset, amount: number, counterparty: string, note: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendAsset(asset: Asset, amount: number, counterparty: string, note: string): Promise<void>;
    setDisplayName(name: string): Promise<void>;
}
