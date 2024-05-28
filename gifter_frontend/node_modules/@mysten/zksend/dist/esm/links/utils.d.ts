import type { ObjectOwner, SuiObjectChange, SuiTransactionBlockResponse } from '@mysten/sui.js/client';
import type { TransactionBlock } from '@mysten/sui.js/transactions';
export interface LinkAssets {
    balances: {
        coinType: string;
        amount: bigint;
    }[];
    nfts: {
        objectId: string;
        type: string;
        version: string;
        digest: string;
    }[];
    coins: {
        objectId: string;
        type: string;
        version: string;
        digest: string;
    }[];
}
export declare function isClaimTransaction(txb: TransactionBlock, options: {
    packageId: string;
}): boolean;
export declare function getAssetsFromTxnBlock({ transactionBlock, address, isSent, }: {
    transactionBlock: SuiTransactionBlockResponse;
    address: string;
    isSent: boolean;
}): LinkAssets;
export declare function ownedAfterChange(objectChange: SuiObjectChange, address: string): objectChange is Extract<SuiObjectChange, {
    type: 'created' | 'transferred' | 'mutated';
}>;
export declare function isOwner(owner: ObjectOwner, address: string): owner is {
    AddressOwner: string;
};
