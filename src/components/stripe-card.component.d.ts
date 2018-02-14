import { OnInit, EventEmitter } from '@angular/core';
import { Element as StripeElement } from '../interfaces/element';
import { StripeService } from '../services/stripe.service';
export declare class StripeCardComponent implements OnInit {
    private stripeService;
    onCard: EventEmitter<StripeElement>;
    private card;
    private element;
    private options;
    private options$;
    private elementsOptions;
    private elementsOptions$;
    constructor(stripeService: StripeService);
    ngOnInit(): void;
    getCard(): StripeElement;
}
