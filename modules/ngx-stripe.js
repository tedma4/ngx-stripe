import { Component, EventEmitter, Inject, Injectable, InjectionToken, Input, NgModule, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

class WindowRef {
    /**
     * @return {?}
     */
    getNativeWindow() {
        return window;
    }
}

class DocumentRef {
    /**
     * @return {?}
     */
    getNativeDocument() {
        return document;
    }
}

class LazyStripeAPILoader {
    /**
     * @param {?} window
     * @param {?} document
     */
    constructor(window, document) {
        this.window = window;
        this.document = document;
        this.status = new BehaviorSubject({
            error: false,
            loaded: false,
            loading: false
        });
    }
    /**
     * @return {?}
     */
    asStream() {
        this.load();
        return this.status.asObservable();
    }
    /**
     * @return {?}
     */
    isReady() {
        return this.status.getValue().loaded;
    }
    /**
     * @return {?}
     */
    load() {
        if (this.window.getNativeWindow().hasOwnProperty('Stripe')) {
            this.status.next({
                error: false,
                loaded: true,
                loading: false
            });
        }
        else {
            if (!this.status.getValue().loaded && !this.status.getValue().loading) {
                this.status.next(Object.assign({}, this.status.getValue(), { loading: true }));
                const /** @type {?} */ script = this.document.getNativeDocument().createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.defer = true;
                script.src = 'https://js.stripe.com/v3/';
                script.onload = () => {
                    this.status.next({
                        error: false,
                        loaded: true,
                        loading: false
                    });
                };
                script.onerror = () => {
                    this.status.next({
                        error: true,
                        loaded: false,
                        loading: false
                    });
                };
                this.document.getNativeDocument().body.appendChild(script);
            }
        }
    }
}
LazyStripeAPILoader.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
LazyStripeAPILoader.ctorParameters = () => [
    { type: WindowRef, },
    { type: DocumentRef, },
];

const STRIPE_PUBLISHABLE_KEY = new InjectionToken('Stripe Publishable Key');
const STRIPE_OPTIONS = new InjectionToken('Stripe Options');

/**
 * @param {?} sourceData
 * @return {?}
 */
function isSourceData(sourceData) {
    return 'type' in sourceData;
}

/**
 * @param {?} account
 * @return {?}
 */
function isBankAccount(account) {
    return account === 'bank_account';
}
/**
 * @param {?} bankAccountData
 * @return {?}
 */
function isBankAccountData(bankAccountData) {
    return 'country' in bankAccountData &&
        'currency' in bankAccountData &&
        'routing_number' in bankAccountData &&
        'account_number' in bankAccountData &&
        'account_holder_name' in bankAccountData &&
        'account_holder_type' in bankAccountData &&
        (bankAccountData.account_holder_type === 'individual' ||
            bankAccountData.account_holder_type === 'company');
}
/**
 * @param {?} pii
 * @return {?}
 */
function isPii(pii) {
    return pii === 'pii';
}
/**
 * @param {?} piiData
 * @return {?}
 */
function isPiiData(piiData) {
    return 'personal_id_number' in piiData;
}

class StripeService {
    /**
     * @param {?} key
     * @param {?} options
     * @param {?} loader
     * @param {?} window
     */
    constructor(key, options, loader, window) {
        this.key = key;
        this.options = options;
        this.loader = loader;
        this.window = window;
        this.loader.asStream()
            .filter((status) => status.loaded === true)
            .subscribe(() => {
            const Stripe = this.window.getNativeWindow().Stripe;
            this.stripe = this.options
                ? Stripe(this.key, this.options)
                : Stripe(this.key);
        });
    }
    /**
     * @param {?=} options
     * @return {?}
     */
    elements(options) {
        return this.loader.asStream()
            .filter((status) => status.loaded === true)
            .map(() => this.stripe.elements(options));
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    createToken(a, b) {
        if (isBankAccount(a) && isBankAccountData(b)) {
            return Observable.fromPromise(this.stripe.createToken(a, b));
        }
        else if (isPii(a) && isPiiData(b)) {
            return Observable.fromPromise(this.stripe.createToken(a, b));
        }
        else {
            return Observable.fromPromise(this.stripe.createToken(/** @type {?} */ (a), /** @type {?} */ (b)));
        }
    }
    /**
     * @param {?} a
     * @param {?=} b
     * @return {?}
     */
    createSource(a, b) {
        if (isSourceData(a)) {
            return Observable.fromPromise(this.stripe.createSource(/** @type {?} */ (a)));
        }
        return Observable.fromPromise(this.stripe.createSource(/** @type {?} */ (a), b));
    }
    /**
     * @param {?} source
     * @return {?}
     */
    retrieveSource(source) {
        return Observable.fromPromise(this.stripe.retrieveSource(source));
    }
}
StripeService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
StripeService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [STRIPE_PUBLISHABLE_KEY,] },] },
    { type: undefined, decorators: [{ type: Inject, args: [STRIPE_OPTIONS,] },] },
    { type: LazyStripeAPILoader, },
    { type: WindowRef, },
];

class StripeCardComponent {
    /**
     * @param {?} stripeService
     */
    constructor(stripeService) {
        this.stripeService = stripeService;
        this.onCard = new EventEmitter();
        this.options$ = new BehaviorSubject({});
        this.elementsOptions$ = new BehaviorSubject({});
    }
    /**
     * @param {?} optionsIn
     * @return {?}
     */
    set options(optionsIn) {
        this.options$.next(optionsIn);
    }
    /**
     * @param {?} optionsIn
     * @return {?}
     */
    set elementsOptions(optionsIn) {
        this.elementsOptions$.next(optionsIn);
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        const /** @type {?} */ elements$ = this.elementsOptions$
            .asObservable()
            .switchMap((options) => {
            if (Object.keys(options).length > 0) {
                return this.stripeService.elements(options);
            }
            return this.stripeService.elements();
        });
        Observable
            .combineLatest(elements$, this.options$.filter((options) => Boolean(options)))
            .subscribe(([elements, options]) => {
            this.element = elements.create('card', options);
            this.element.mount(this.card.nativeElement);
            this.onCard.emit(this.element);
        });
    }
    /**
     * @return {?}
     */
    getCard() {
        return this.element;
    }
}
StripeCardComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-stripe-card',
                template: `<div class="field" #card></div>`
            },] },
];
/**
 * @nocollapse
 */
StripeCardComponent.ctorParameters = () => [
    { type: StripeService, },
];
StripeCardComponent.propDecorators = {
    'onCard': [{ type: Output },],
    'card': [{ type: ViewChild, args: ['card',] },],
    'options': [{ type: Input },],
    'elementsOptions': [{ type: Input },],
};

class NgxStripeModule {
    /**
     * @param {?} publishableKey
     * @param {?=} options
     * @return {?}
     */
    static forRoot(publishableKey, options) {
        return {
            ngModule: NgxStripeModule,
            providers: [
                LazyStripeAPILoader,
                StripeService,
                WindowRef,
                DocumentRef,
                {
                    provide: STRIPE_PUBLISHABLE_KEY,
                    useValue: publishableKey
                },
                {
                    provide: STRIPE_OPTIONS,
                    useValue: options
                }
            ]
        };
    }
}
NgxStripeModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    StripeCardComponent
                ],
                exports: [
                    StripeCardComponent
                ]
            },] },
];
/**
 * @nocollapse
 */
NgxStripeModule.ctorParameters = () => [];

// Public classes.

/**
 * Entry point for all public APIs of the package.
 */

/**
 * Generated bundle index. Do not edit.
 */

export { NgxStripeModule, StripeCardComponent, StripeService, LazyStripeAPILoader, WindowRef, DocumentRef, isSourceData, STRIPE_PUBLISHABLE_KEY, STRIPE_OPTIONS, isBankAccount, isBankAccountData, isPii, isPiiData };
//# sourceMappingURL=ngx-stripe.js.map
