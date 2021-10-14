/* eslint-disable no-console */
const rp = require('request-promise');
const { getAllOfResource } = require("../util/getAllOfResource");

class ShopifyClient {

  constructor(key, secret, domain) {
    this._key = key;
    this._secret = secret;
    this._domain = domain;
    this._baseUrl = `https://${this._key}:${this._secret}@${this._domain}/admin/api/2020-10`;

    this._baseRequest = {
      method: 'GET',
      baseUrl: this._baseUrl,
      json: true,
    };
  }

  // MARK: Shopify API - Customer methods
  getCustomer(id, query) {
    return rp({
      ...this._baseRequest,
      ...{
        qs: query,
        url: `/customers/${id}.json`,
      },
    });
  }

  // MARK: Shopify API - Product methods
  listProducts(query = null) {
    return getAllOfResource(
      {
        key: this._key,
        secret: this._secret,
        domain: this._domain,
      },
      'products',
      query
    );
  }

  getProduct(id, query = null) {
    return rp({
      ...this._baseRequest,
      ...{
        url: `/products/${id}.json`,
        qs: query,
      },
    });
  }

  getListOfSmartCollections(query = null) {
    return rp({
      ...this._baseRequest,
      ...{
        url: '/smart_collections.json',
        qs: query,
      },
    });
  }

  updateProduct(id, update) {
    return rp({
      ...this._baseRequest,
      ...{
        method: 'PUT',
        url: `/products/${id}.json`,
        body: { product: update },
      },
    });
  }

  // MARK: Shopify API - Variant methods
  updateVariant(id, update) {
    return rp({
      ...this._baseRequest,
      ...{
        method: 'PUT',
        url: `/variants/${id}.json`,
        body: { variant: update },
      },
    });
  }

  // MARK: Shopify API - inventory level at location
  inventoryLevels(inventoryItemIds, locationId) {
    return rp({
      ...this._baseRequest,
      ...{
        url: '/inventory_levels.json',
        qs: {
          inventory_item_ids: inventoryItemIds.join(','),
          location_ids: locationId,
        },
      },
    });
  }

  getProductMetaFields(id) {
    return rp({
      ...this._baseRequest,
      ...{
        url: `/products/${id}/metafields.json`,
      },
    });
  }

  addProductMetaFields(id, metafield) {
    return rp({
      ...this._baseRequest,
      ...{
        method: 'POST',
        url: `/products/${id}/metafields.json`,
        body: { metafield },
      },
    });
  }

  updateProductMetaField(metafieldId, metafield) {
    return rp({
      ...this._baseRequest,
      ...{
        method: 'PUT',
        url: `/metafields/${metafieldId}.json`,
        body: { metafield },
      },
    });
  }

  listLocations(query = null) {
    return getAllOfResource(
      {
        key: this._key,
        secret: this._secret,
        domain: this._domain,
      },
      'locations',
      query
    );
  }
}

module.exports = ShopifyClient;