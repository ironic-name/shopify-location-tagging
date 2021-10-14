/* eslint-disable no-console */
const ShopifyClient = require('./shopify');

class ShopifyProducts {
  constructor(key, secret, domain) {
    this.client = new ShopifyClient(key, secret, domain);
  }

  listProducts(query = null) {
    return this.client.listProducts(query);
  }

  getProduct(productId, query = null) {
    return this.client.getProduct(productId, query);
  }

  getListOfSmartCollections() {
    return this.client.getListOfSmartCollections();
  }

  updateProduct(productId, product, fields = null) {
    // Filter out unused fields if specified
    if (!fields) {
      fields = Object.keys(product);
    } else {
      fields = ['id', ...fields];
    }

    let updatedProduct = {};

    fields.forEach((field) => (updatedProduct[field] = product[field]));

    return this.client.updateProduct(productId, updatedProduct);
  }

  inventoryLevel(inventoryItemIds, locationId) {
    return this.client.inventoryLevels(inventoryItemIds, locationId);
  }

  getProductMetafields(id) {
    return this.client.getProductMetaFields(id);
  }

  addMetaFieldToProduct(id, metafield) {
    return this.client.addProductMetaFields(id, metafield);
  }

  updateMetafieldOfProduct(metafieldId, metafield) {
    return this.client.updateProductMetaField(metafieldId, metafield);
  }

  listLocations(query = null) {
    return this.client.listLocations(query);
  }
}

module.exports = ShopifyProducts;