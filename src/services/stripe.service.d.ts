import { Observable } from 'rxjs/Observable';
import { WindowRef } from './window-ref';
import { LazyStripeAPILoader } from './api-loader.service';
import { Element } from '../interfaces/element';
import { Elements, ElementsOptions } from '../interfaces/elements';
import { SourceData, SourceResult, SourceParams } from '../interfaces/sources';
import { CardDataOptions, TokenResult, BankAccount, BankAccountData, PiiData, Pii } from '../interfaces/token';
export declare class StripeService {
    private key;
    private options;
    private loader;
    private window;
    private stripe;
    constructor(key: string, options: string, loader: LazyStripeAPILoader, window: WindowRef);
    elements(options?: ElementsOptions): Observable<Elements>;
    createToken(a: Element | BankAccount | Pii, b: CardDataOptions | BankAccountData | PiiData | undefined): Observable<TokenResult>;
    createSource(a: Element | SourceData, b?: SourceData | undefined): Observable<SourceResult>;
    retrieveSource(source: SourceParams): Observable<SourceResult>;
}
