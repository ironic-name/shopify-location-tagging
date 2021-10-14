/* eslint-disable no-console */
const ShopifyProducts = require('../../integrations/shopify-products');
const _ = require(`lodash`);
const { sleep } = require("../../util/sleep");

require('dotenv').config()

const shopifyClient = new ShopifyProducts(
  process.env.SHOPIFY_API_KEY,
  process.env.SHOPIFY_API_PASSWORD,
  process.env.SHOPIFY_API_DOMAIN
);

const getAllProducts = async () => new Promise((resolve) => {
  const products = [];

  shopifyClient
    .listProducts('limit=250&fields=id,variants,tags')
    .subscribe(
      newProducts => { products.push(...newProducts) },
      error => { console.error(error) },
      () => { resolve(products) },
    );
});

const getAllLocations = async () => new Promise((resolve) => {
  const locations = [];

  shopifyClient
    .listLocations('limit=250')
    .subscribe(
      newLocations => { locations.push(...newLocations) },
      error => { console.error(error) },
      () => { resolve(locations) },
    );
});

const tagAvailibility = async () => {
  console.log('Locations:', 'Fetching all locations');

  const allLocations = await getAllLocations();

  console.log('Locations:', 'Fetching all products');
  const allProducts = await getAllProducts();

  console.log('Locations:', 'Building variant => product map');
  const allVariants = allProducts.flatMap(product =>
    product.variants.map(variant => {
      const productCopy = _.clone(product);

      delete productCopy.variants;

      return ({ ...variant, product: productCopy });
    })
  );

  const allLocationTags = allLocations.flatMap(location => [
    `Available: ${location.name}`,
    `Unavailable: ${location.name}`,
  ]);

  // Chunk variants into groups of 50
  const chunkedVariants = _.chunk(allVariants, 50);

  const variantsWithInventory = [];

  console.log('Locations:', 'Fetching inventory per variant');
  for (const variantGroup of chunkedVariants) {
    const inventoryItemIds = variantGroup.map(variant => variant.inventory_item_id)

    for (const location of allLocations) {
      const { inventory_levels: inventoryLevels } = await shopifyClient.inventoryLevel(inventoryItemIds, location.id);

      // Add inventoryLevels to variants per location
      variantGroup.forEach(variant => {
        variantsWithInventory.push({
          ...variant,
          location_inventory: {
            location,
            level: inventoryLevels.find(inventoryLevel => inventoryLevel.inventory_item_id === variant.inventory_item_id) || null,
          }
        });
      });

      await sleep(250);
    }
  }

  console.log('Locations:', 'Building per product per location inventory counts');
  let productsWithInventory = variantsWithInventory
    .reduce((variantsArray, variant) => {
      const inventory = variant.location_inventory;
      delete variant.location_inventory;

      if (!variantsArray.some(v => v.id === variant.id)) {
        // Doesn't exist in array yet. Add
        variantsArray.push(variant);
      }

      variantsArray = variantsArray.map(v => {
        if (v.id !== variant.id) return v;

        v.inventory = v.inventory || [];

        v.inventory.push(inventory);

        return v;
      });

      return variantsArray;
    }, [])
    .reduce((productsArray, variant) => {
      if (!productsArray.some(p => p.id === variant.product_id)) {
        // Doesn't exist in array yet. Add
        productsArray.push(variant.product);
      }

      productsArray = productsArray.map(p => {
        if (p.id !== variant.product_id) return p;

        p.variants = p.variants || [];

        p.variants.push(variant);

        return p;
      });

      return productsArray;
    }, []);

  productsWithInventory = productsWithInventory.map(product => {
    const inventoryLevels = product.variants.reduce((locationsArray, variant) => {
      if (!locationsArray.length) {
        locationsArray = variant.inventory.map(inv => ({ ...inv.location, total: 0 }));
      }

      locationsArray = locationsArray.map(location => {
        const locationLevel = variant.inventory.find(x => x.location.id === location.id);
        if (locationLevel.level) {
          location.total = location.total + locationLevel.level.available;
        }

        return location;
      });

      return locationsArray;
    }, []);

    const inventoryTags = inventoryLevels.map(location => {
      if (location.total > 0) {
        return `Available: ${location.name}`;
      } else {
        return `Unavailable: ${location.name}`;
      }
    });

    product.newTags = [
      ...new Set([
        ...product.tags.split(',').map(tag => tag.trim()).filter(tag => !allLocationTags.includes(tag)),
        ...inventoryTags,
      ]),
    ].filter(tag => tag).join(', ');

    delete product.variants;

    return product;
  });

  const productsToUpdate = productsWithInventory
    .filter(product => {
      const newTags = product.newTags.split(',').map(tag => tag.trim());
      const originalTags = product.tags.split(',').map(tag => tag.trim());

      return !originalTags.every(originalTag => newTags.includes(originalTag));
    })
    .map(product => {
      product.tags = product.newTags;

      delete product.newTags;

      return product;
    });

  console.log('Locations:', `Updating ${productsToUpdate.length} product tags`);
  for (const product of productsToUpdate) {
    try {
      await shopifyClient.updateProduct(product.id, product);
      console.log('Locations:', 'Updated product', product.id);
      sleep(300);
    } catch (error) {
      console.error(error);
    }
  }

  return;
};

tagAvailibility()
  .then(console.log)
  .then(console.error)
