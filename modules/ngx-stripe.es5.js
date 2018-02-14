import { Component, EventEmitter, Inject, Injectable, InjectionToken, Input, NgModule, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
var WindowRef = (function () {
    function WindowRef() {
    }
    /**
     * @return {?}
     */
    WindowRef.prototype.getNativeWindow = function () {
        return window;
    };
    return WindowRef;
}());
var DocumentRef = (function () {
    function DocumentRef() {
    }
    /**
     * @return {?}
     */
    DocumentRef.prototype.getNativeDocument = function () {
        return document;
    };
    return DocumentRef;
}());
var LazyStripeAPILoader = (function () {
    /**
     * @param {?} window
     * @param {?} document
     */
    function LazyStripeAPILoader(window, document) {
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
    LazyStripeAPILoader.prototype.asStream = function () {
        this.load();
        return this.status.asObservable();
    };
    /**
     * @return {?}
     */
    LazyStripeAPILoader.prototype.isReady = function () {
        return this.status.getValue().loaded;
    };
    /**
     * @return {?}
     */
    LazyStripeAPILoader.prototype.load = function () {
        var _this = this;
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
                var /** @type {?} */ script = this.document.getNativeDocument().createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.defer = true;
                script.src = 'https://js.stripe.com/v3/';
                script.onload = function () {
                    _this.status.next({
                        error: false,
                        loaded: true,
                        loading: false
                    });
                };
                script.onerror = function () {
                    _this.status.next({
                        error: true,
                        loaded: false,
                        loading: false
                    });
                };
                this.document.getNativeDocument().body.appendChild(script);
            }
        }
    };
    return LazyStripeAPILoader;
}());
LazyStripeAPILoader.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
LazyStripeAPILoader.ctorParameters = function () { return [
    { type: WindowRef, },
    { type: DocumentRef, },
]; };
var STRIPE_PUBLISHABLE_KEY = new InjectionToken('Stripe Publishable Key');
var STRIPE_OPTIONS = new InjectionToken('Stripe Options');
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
var StripeService = (function () {
    /**
     * @param {?} key
     * @param {?} options
     * @param {?} loader
     * @param {?} window
     */
    function StripeService(key, options, loader, window) {
        var _this = this;
        this.key = key;
        this.options = options;
        this.loader = loader;
        this.window = window;
        this.loader.asStream()
            .filter(function (status) { return status.loaded === true; })
            .subscribe(function () {
            var Stripe = _this.window.getNativeWindow().Stripe;
            _this.stripe = _this.options
                ? Stripe(_this.key, _this.options)
                : Stripe(_this.key);
        });
    }
    /**
     * @param {?=} options
     * @return {?}
     */
    StripeService.prototype.elements = function (options) {
        var _this = this;
        return this.loader.asStream()
            .filter(function (status) { return status.loaded === true; })
            .map(function () { return _this.stripe.elements(options); });
    };
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    StripeService.prototype.createToken = function (a, b) {
        if (isBankAccount(a) && isBankAccountData(b)) {
            return Observable.fromPromise(this.stripe.createToken(a, b));
        }
        else if (isPii(a) && isPiiData(b)) {
            return Observable.fromPromise(this.stripe.createToken(a, b));
        }
        else {
            return Observable.fromPromise(this.stripe.createToken(/** @type {?} */ (a), /** @type {?} */ (b)));
        }
    };
    /**
     * @param {?} a
     * @param {?=} b
     * @return {?}
     */
    StripeService.prototype.createSource = function (a, b) {
        if (isSourceData(a)) {
            return Observable.fromPromise(this.stripe.createSource(/** @type {?} */ (a)));
        }
        return Observable.fromPromise(this.stripe.createSource(/** @type {?} */ (a), b));
    };
    /**
     * @param {?} source
     * @return {?}
     */
    StripeService.prototype.retrieveSource = function (source) {
        return Observable.fromPromise(this.stripe.retrieveSource(source));
    };
    return StripeService;
}());
StripeService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
StripeService.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: Inject, args: [STRIPE_PUBLISHABLE_KEY,] },] },
    { type: undefined, decorators: [{ type: Inject, args: [STRIPE_OPTIONS,] },] },
    { type: LazyStripeAPILoader, },
    { type: WindowRef, },
]; };
var StripeCardComponent = (function () {
    /**
     * @param {?} stripeService
     */
    function StripeCardComponent(stripeService) {
        this.stripeService = stripeService;
        this.onCard = new EventEmitter();
        this.options$ = new BehaviorSubject({});
        this.elementsOptions$ = new BehaviorSubject({});
    }
    Object.defineProperty(StripeCardComponent.prototype, "options", {
        /**
         * @param {?} optionsIn
         * @return {?}
         */
        set: function (optionsIn) {
            this.options$.next(optionsIn);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StripeCardComponent.prototype, "elementsOptions", {
        /**
         * @param {?} optionsIn
         * @return {?}
         */
        set: function (optionsIn) {
            this.elementsOptions$.next(optionsIn);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    StripeCardComponent.prototype.ngOnInit = function () {
        var _this = this;
        var /** @type {?} */ elements$ = this.elementsOptions$
            .asObservable()
            .switchMap(function (options) {
            if (Object.keys(options).length > 0) {
                return _this.stripeService.elements(options);
            }
            return _this.stripeService.elements();
        });
        Observable
            .combineLatest(elements$, this.options$.filter(function (options) { return Boolean(options); }))
            .subscribe(function (_a) {
            var elements = _a[0], options = _a[1];
            _this.element = elements.create('card', options);
            _this.element.mount(_this.card.nativeElement);
            _this.onCard.emit(_this.element);
        });
    };
    /**
     * @return {?}
     */
    StripeCardComponent.prototype.getCard = function () {
        return this.element;
    };
    return StripeCardComponent;
}());
StripeCardComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-stripe-card',
                template: "<div class=\"field\" #card></div>"
            },] },
];
/**
 * @nocollapse
 */
StripeCardComponent.ctorParameters = function () { return [
    { type: StripeService, },
]; };
StripeCardComponent.propDecorators = {
    'onCard': [{ type: Output },],
    'card': [{ type: ViewChild, args: ['card',] },],
    'options': [{ type: Input },],
    'elementsOptions': [{ type: Input },],
};
var NgxStripeModule = (function () {
    function NgxStripeModule() {
    }
    /**
     * @param {?} publishableKey
     * @param {?=} options
     * @return {?}
     */
    NgxStripeModule.forRoot = function (publishableKey, options) {
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
    };
    return NgxStripeModule;
}());
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
NgxStripeModule.ctorParameters = function () { return []; };
// Public classes.
/**
 * Entry point for all public APIs of the package.
 */
/**
 * Generated bundle index. Do not edit.
 */
export { NgxStripeModule, StripeCardComponent, StripeService, LazyStripeAPILoader, WindowRef, DocumentRef, isSourceData, STRIPE_PUBLISHABLE_KEY, STRIPE_OPTIONS, isBankAccount, isBankAccountData, isPii, isPiiData };
//# sourceMappingURL=ngx-stripe.es5.js.map
