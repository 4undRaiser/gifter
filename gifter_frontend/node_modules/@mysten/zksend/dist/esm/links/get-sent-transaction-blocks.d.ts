import { SuiClient } from '@mysten/sui.js/client';
import { ZkSendLink } from './claim.js';
import type { ZkBagContractOptions } from './zk-bag.js';
export declare function getSentTransactionBlocksWithLinks({ address, cursor, limit, network, contract, client, loadClaimedAssets, ...linkOptions }: {
    address: string;
    contract?: ZkBagContractOptions;
    cursor?: string;
    limit?: number;
    network?: 'mainnet' | 'testnet';
    loadClaimedAssets?: boolean;
    host?: string;
    path?: string;
    claimApi?: string;
    client?: SuiClient;
}): Promise<{
    data: {
        transactionBlock: import("@mysten/sui.js/client").SuiTransactionBlockResponse;
        links: ZkSendLink[];
    }[];
    nextCursor: string | null | undefined;
    hasNextPage: boolean;
}>;
