import { sdk } from '../core';

export const ShopifyAdapter = {
    init: (apiKey: string) => {
        sdk.init(apiKey);
        console.log('[Shopify Adapter] ClientLabs listening for checkout events');
    },

    captureCart: (cartData: any) => {
        sdk.track('add_to_cart', {
            source: 'shopify_cart',
            payload: cartData
        });
    },

    captureCheckout: (checkoutData: any) => {
        sdk.track('checkout', {
            source: 'shopify_checkout',
            payload: checkoutData
        });
    }
};
