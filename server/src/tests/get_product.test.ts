
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type GetProductInput } from '../schema';
import { getProduct } from '../handlers/get_product';

const testProductInput = {
  name: 'Test Product',
  description: 'A product for testing',
  price: 19.99,
  stock_quantity: 100
};

describe('getProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a product when it exists', async () => {
    // Create a test product first
    const createResult = await db.insert(productsTable)
      .values({
        name: testProductInput.name,
        description: testProductInput.description,
        price: testProductInput.price.toString(),
        stock_quantity: testProductInput.stock_quantity
      })
      .returning()
      .execute();

    const createdProduct = createResult[0];
    
    const input: GetProductInput = {
      id: createdProduct.id
    };

    const result = await getProduct(input);

    // Verify product details
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdProduct.id);
    expect(result!.name).toEqual('Test Product');
    expect(result!.description).toEqual(testProductInput.description);
    expect(result!.price).toEqual(19.99);
    expect(typeof result!.price).toEqual('number');
    expect(result!.stock_quantity).toEqual(100);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when product does not exist', async () => {
    const input: GetProductInput = {
      id: 999 // Non-existent ID
    };

    const result = await getProduct(input);

    expect(result).toBeNull();
  });

  it('should handle product with null description', async () => {
    // Create a test product with null description
    const createResult = await db.insert(productsTable)
      .values({
        name: 'Product No Description',
        description: null,
        price: '49.99',
        stock_quantity: 50
      })
      .returning()
      .execute();

    const createdProduct = createResult[0];
    
    const input: GetProductInput = {
      id: createdProduct.id
    };

    const result = await getProduct(input);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Product No Description');
    expect(result!.description).toBeNull();
    expect(result!.price).toEqual(49.99);
    expect(typeof result!.price).toEqual('number');
  });
});
