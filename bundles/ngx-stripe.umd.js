(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs/BehaviorSubject'), require('rxjs/Observable'), require('rxjs/add/observable/combineLatest'), require('rxjs/add/observable/fromPromise'), require('rxjs/add/operator/switchMap'), require('rxjs/add/operator/filter'), require('rxjs/add/operator/map')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', 'rxjs/BehaviorSubject', 'rxjs/Observable', 'rxjs/add/observable/combineLatest', 'rxjs/add/observable/fromPromise', 'rxjs/add/operator/switchMap', 'rxjs/add/operator/filter', 'rxjs/add/operator/map'], factory) :
	(factory((global.ng = global.ng || {}, global.ng.stripe = global.ng.stripe || {}),global.ng.core,global.Rx,global.Rx));
}(this, (function (exports,_angular_core,rxjs_BehaviorSubject,rxjs_Observable) { 'use strict';

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
        this.status = new rxjs_BehaviorSubject.BehaviorSubject({
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
    { type: _angular_core.Injectable },
];
/**
 * @nocollapse
 */
LazyStripeAPILoader.ctorParameters = function () { return [
    { type: WindowRef, },
    { type: DocumentRef, },
]; };
var STRIPE_PUBLISHABLE_KEY = new _angular_core.InjectionToken('Stripe Publishable Key');
var STRIPE_OPTIONS = new _angular_core.InjectionToken('Stripe Options');
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
            return rxjs_Observable.Observable.fromPromise(this.stripe.createToken(a, b));
        }
        else if (isPii(a) && isPiiData(b)) {
            return rxjs_Observable.Observable.fromPromise(this.stripe.createToken(a, b));
        }
        else {
            return rxjs_Observable.Observable.fromPromise(this.stripe.createToken(/** @type {?} */ (a), /** @type {?} */ (b)));
        }
    };
    /**
     * @param {?} a
     * @param {?=} b
     * @return {?}
     */
    StripeService.prototype.createSource = function (a, b) {
        if (isSourceData(a)) {
            return rxjs_Observable.Observable.fromPromise(this.stripe.createSource(/** @type {?} */ (a)));
        }
        return rxjs_Observable.Observable.fromPromise(this.stripe.createSource(/** @type {?} */ (a), b));
    };
    /**
     * @param {?} source
     * @return {?}
     */
    StripeService.prototype.retrieveSource = function (source) {
        return rxjs_Observable.Observable.fromPromise(this.stripe.retrieveSource(source));
    };
    return StripeService;
}());
StripeService.decorators = [
    { type: _angular_core.Injectable },
];
/**
 * @nocollapse
 */
StripeService.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: _angular_core.Inject, args: [STRIPE_PUBLISHABLE_KEY,] },] },
    { type: undefined, decorators: [{ type: _angular_core.Inject, args: [STRIPE_OPTIONS,] },] },
    { type: LazyStripeAPILoader, },
    { type: WindowRef, },
]; };
var StripeCardComponent = (function () {
    /**
     * @param {?} stripeService
     */
    function StripeCardComponent(stripeService) {
        this.stripeService = stripeService;
        this.onCard = new _angular_core.EventEmitter();
        this.options$ = new rxjs_BehaviorSubject.BehaviorSubject({});
        this.elementsOptions$ = new rxjs_BehaviorSubject.BehaviorSubject({});
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
        rxjs_Observable.Observable
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
    { type: _angular_core.Component, args: [{
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
    'onCard': [{ type: _angular_core.Output },],
    'card': [{ type: _angular_core.ViewChild, args: ['card',] },],
    'options': [{ type: _angular_core.Input },],
    'elementsOptions': [{ type: _angular_core.Input },],
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
    { type: _angular_core.NgModule, args: [{
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

exports.NgxStripeModule = NgxStripeModule;
exports.StripeCardComponent = StripeCardComponent;
exports.StripeService = StripeService;
exports.LazyStripeAPILoader = LazyStripeAPILoader;
exports.WindowRef = WindowRef;
exports.DocumentRef = DocumentRef;
exports.isSourceData = isSourceData;
exports.STRIPE_PUBLISHABLE_KEY = STRIPE_PUBLISHABLE_KEY;
exports.STRIPE_OPTIONS = STRIPE_OPTIONS;
exports.isBankAccount = isBankAccount;
exports.isBankAccountData = isBankAccountData;
exports.isPii = isPii;
exports.isPiiData = isPiiData;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-stripe.umd.js.map
