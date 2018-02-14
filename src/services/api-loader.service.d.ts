import { Observable } from 'rxjs/Observable';
import { WindowRef } from './window-ref';
import { DocumentRef } from './document-ref';
export interface Status {
    loaded: boolean;
    loading: boolean;
    error: boolean;
}
export declare class LazyStripeAPILoader {
    private window;
    private document;
    private status;
    constructor(window: WindowRef, document: DocumentRef);
    asStream(): Observable<Status>;
    isReady(): boolean;
    load(): void;
}
