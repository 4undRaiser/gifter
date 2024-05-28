import { SuiClient } from '@mysten/sui.js/client';
import type { Keypair, Signer } from '@mysten/sui.js/cryptography';
import type { TransactionObjectArgument, TransactionObjectInput } from '@mysten/sui.js/transactions';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import type { ZkBagContractOptions } from './zk-bag.js';
interface ZkSendLinkRedirect {
    url: string;
    name?: string;
}
export interface ZkSendLinkBuilderOptions {
    host?: string;
    path?: string;
    keypair?: Keypair;
    network?: 'mainnet' | 'testnet';
    client?: SuiClient;
    sender: string;
    redirect?: ZkSendLinkRedirect;
    contract?: ZkBagContractOptions | null;
}
export interface CreateZkSendLinkOptions {
    transactionBlock?: TransactionBlock;
    calculateGas?: (options: {
        balances: Map<string, bigint>;
        objects: TransactionObjectInput[];
        gasEstimateFromDryRun: bigint;
    }) => Promise<bigint> | bigint;
}
export declare class ZkSendLinkBuilder {
    #private;
    objectIds: Set<string>;
    objectRefs: {
        ref: TransactionObjectArgument;
        type: string;
    }[];
    balances: Map<string, bigint>;
    sender: string;
    keypair: Keypair;
    constructor({ host, path, keypair, network, client, sender, redirect, contract, }: ZkSendLinkBuilderOptions);
    addClaimableMist(amount: bigint): void;
    addClaimableBalance(coinType: string, amount: bigint): void;
    addClaimableObject(id: string): void;
    addClaimableObjectRef(ref: TransactionObjectArgument, type: string): void;
    getLink(): string;
    create({ signer, ...options }: CreateZkSendLinkOptions & {
        signer: Signer;
        waitForTransactionBlock?: boolean;
    }): Promise<import("@mysten/sui.js/client").SuiTransactionBlockResponse>;
    createSendTransaction({ transactionBlock, calculateGas, }?: CreateZkSendLinkOptions): Promise<TransactionBlock>;
    createSendToAddressTransaction({ transactionBlock, address, }: CreateZkSendLinkOptions & {
        address: string;
    }): Promise<TransactionBlock>;
    static createLinks({ links, network, client, transactionBlock, contract: contractIds, }: {
        transactionBlock?: TransactionBlock;
        client?: SuiClient;
        network?: 'mainnet' | 'testnet';
        links: ZkSendLinkBuilder[];
        contract?: ZkBagContractOptions;
    }): Promise<TransactionBlock>;
}
export {};
