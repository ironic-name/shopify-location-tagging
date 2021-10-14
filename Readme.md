# Shopify product location availibility tagging

A quick hack script to add product availability as tags to products

# Running this script

1. Install dependencies: `npm install`
2. Create a .env file
3. Create a Shopify private app with the following scopes: read_locations, read_inventory, read_products, write_products
4. Add the private app access details to the .env file:

```
SHOPIFY_API_KEY=Your API key
SHOPIFY_API_PASSWORD=Your API password
SHOPIFY_API_DOMAIN=your-domain.myshopify.com
```
5. Run `npm start`