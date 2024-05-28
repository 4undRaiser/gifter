import type { TransactionArgument, TransactionBlock, TransactionObjectArgument } from '@mysten/sui.js/transactions';
export interface ZkBagContractOptions {
    packageId: string;
    bagStoreId: string;
    bagStoreTableId: string;
}
export declare const MAINNET_CONTRACT_IDS: ZkBagContractOptions;
export declare class ZkBag<IDs> {
    #private;
    ids: IDs;
    constructor(packageAddress: string, ids: IDs);
    new(txb: TransactionBlock, { arguments: [store, receiver], }: {
        arguments: [
            store: TransactionObjectArgument | string,
            receiver: TransactionArgument | string
        ];
    }): void;
    add(txb: TransactionBlock, { arguments: [store, receiver, item], typeArguments, }: {
        arguments: [
            store: TransactionObjectArgument | string,
            receiver: TransactionArgument | string,
            item: TransactionObjectArgument | string
        ];
        typeArguments: [string];
    }): Extract<TransactionArgument, {
        kind: 'Result';
    }>;
    init_claim(txb: TransactionBlock, { arguments: [store], }: {
        arguments: [store: TransactionObjectArgument | string];
    }): readonly [{
        index: number;
        resultIndex: number;
        kind: "NestedResult";
    }, {
        index: number;
        resultIndex: number;
        kind: "NestedResult";
    }];
    reclaim(txb: TransactionBlock, { arguments: [store, receiver], }: {
        arguments: [
            store: TransactionObjectArgument | string,
            receiver: TransactionArgument | string
        ];
    }): readonly [{
        index: number;
        resultIndex: number;
        kind: "NestedResult";
    }, {
        index: number;
        resultIndex: number;
        kind: "NestedResult";
    }];
    claim(txb: TransactionBlock, { arguments: [bag, claim, id], typeArguments, }: {
        arguments: [
            bag: TransactionObjectArgument | string,
            claim: Extract<TransactionArgument, {
                kind: 'NestedResult';
            }>,
            id: TransactionObjectArgument | string
        ];
        typeArguments: [string];
    }): Extract<TransactionArgument, {
        kind: 'Result';
    }>;
    finalize(txb: TransactionBlock, { arguments: [bag, claim], }: {
        arguments: [
            bag: TransactionObjectArgument | string,
            claim: Extract<TransactionArgument, {
                kind: 'NestedResult';
            }>
        ];
    }): void;
    update_receiver(txb: TransactionBlock, { arguments: [bag, from, to], }: {
        arguments: [
            bag: TransactionObjectArgument | string,
            from: TransactionArgument | string,
            to: TransactionArgument | string
        ];
    }): void;
}
