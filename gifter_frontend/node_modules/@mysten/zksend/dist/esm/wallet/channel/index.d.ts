import type { Output } from 'valibot';
import type { StashedRequestData, StashedResponsePayload, StashedResponseTypes } from './events.js';
import { StashedRequest, StashedResponse } from './events.js';
export declare const DEFAULT_STASHED_ORIGIN = "https://getstashed.com";
export { StashedRequest, StashedResponse };
interface StashedPopupOptions {
    origin?: string;
    name: string;
}
export declare class StashedPopup {
    #private;
    constructor({ origin, name }: StashedPopupOptions);
    createRequest<T extends StashedRequestData>(request: T): Promise<StashedResponseTypes[T['type']]>;
    close(): void;
}
export declare class StashedHost {
    #private;
    constructor(request: Output<typeof StashedRequest>);
    static fromUrl(url?: string): StashedHost;
    getRequestData(): {
        id: string;
        origin: string;
        payload: {
            type: "connect";
        } | {
            address: string;
            type: "sign-transaction-block";
            data: string;
        } | {
            address: string;
            type: "sign-personal-message";
            bytes: string;
        };
        name?: string | undefined;
    };
    sendMessage(payload: StashedResponsePayload): void;
    close(payload?: StashedResponsePayload): void;
}
