
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateProductInput = {
  name: 'Test Product',
  description: 'A product for testing',
  price: 19.99,
  stock_quantity: 100
};

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a product', async () => {
    const result = await createProduct(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Product');
    expect(result.description).toEqual(testInput.description);
    expect(result.price).toEqual(19.99);
    expect(typeof result.price).toEqual('number');
    expect(result.stock_quantity).toEqual(100);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toEqual('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save product to database', async () => {
    const result = await createProduct(testInput);

    // Query using proper drizzle syntax
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].name).toEqual('Test Product');
    expect(products[0].description).toEqual(testInput.description);
    expect(parseFloat(products[0].price)).toEqual(19.99);
    expect(products[0].stock_quantity).toEqual(100);
    expect(products[0].created_at).toBeInstanceOf(Date);
    expect(products[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description', async () => {
    const inputWithNullDescription: CreateProductInput = {
      name: 'Product with null description',
      description: null,
      price: 25.50,
      stock_quantity: 50
    };

    const result = await createProduct(inputWithNullDescription);

    expect(result.description).toBeNull();
    expect(result.name).toEqual('Product with null description');
    expect(result.price).toEqual(25.50);
    expect(typeof result.price).toEqual('number');
  });

  it('should handle zero stock quantity', async () => {
    const inputWithZeroStock: CreateProductInput = {
      name: 'Out of stock product',
      description: 'This product is out of stock',
      price: 15.00,
      stock_quantity: 0
    };

    const result = await createProduct(inputWithZeroStock);

    expect(result.stock_quantity).toEqual(0);
    expect(result.name).toEqual('Out of stock product');
    expect(result.price).toEqual(15.00);
  });
});
