
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type UpdateProductInput, type CreateProductInput } from '../schema';
import { updateProduct } from '../handlers/update_product';
import { eq } from 'drizzle-orm';

// Helper function to create a test product directly
const createTestProduct = async (input: CreateProductInput) => {
  const result = await db.insert(productsTable)
    .values({
      name: input.name,
      description: input.description,
      price: input.price.toString(), // Convert number to string for numeric column
      stock_quantity: input.stock_quantity
    })
    .returning()
    .execute();

  // Convert numeric fields back to numbers before returning
  const product = result[0];
  return {
    ...product,
    price: parseFloat(product.price) // Convert string back to number
  };
};

const testProductInput: CreateProductInput = {
  name: 'Original Product',
  description: 'Original description',
  price: 29.99,
  stock_quantity: 100
};

describe('updateProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update product fields', async () => {
    // Create test product
    const originalProduct = await createTestProduct(testProductInput);

    const updateInput: UpdateProductInput = {
      id: originalProduct.id,
      name: 'Updated Product Name',
      price: 49.99,
      stock_quantity: 75
    };

    const result = await updateProduct(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(originalProduct.id);
    expect(result!.name).toEqual('Updated Product Name');
    expect(result!.description).toEqual('Original description'); // Should remain unchanged
    expect(result!.price).toEqual(49.99);
    expect(result!.stock_quantity).toEqual(75);
    expect(result!.created_at).toEqual(originalProduct.created_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalProduct.updated_at.getTime());
  });

  it('should update only provided fields', async () => {
    // Create test product
    const originalProduct = await createTestProduct(testProductInput);

    const updateInput: UpdateProductInput = {
      id: originalProduct.id,
      name: 'Just Name Updated'
    };

    const result = await updateProduct(updateInput);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Just Name Updated');
    expect(result!.description).toEqual(originalProduct.description); // Unchanged
    expect(result!.price).toEqual(originalProduct.price); // Unchanged
    expect(result!.stock_quantity).toEqual(originalProduct.stock_quantity); // Unchanged
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalProduct.updated_at.getTime());
  });

  it('should handle null description update', async () => {
    // Create test product
    const originalProduct = await createTestProduct(testProductInput);

    const updateInput: UpdateProductInput = {
      id: originalProduct.id,
      description: null
    };

    const result = await updateProduct(updateInput);

    expect(result).not.toBeNull();
    expect(result!.description).toBeNull();
    expect(result!.name).toEqual(originalProduct.name); // Unchanged
    expect(result!.price).toEqual(originalProduct.price); // Unchanged
  });

  it('should save updated product to database', async () => {
    // Create test product
    const originalProduct = await createTestProduct(testProductInput);

    const updateInput: UpdateProductInput = {
      id: originalProduct.id,
      name: 'Database Updated Product',
      price: 99.99
    };

    await updateProduct(updateInput);

    // Verify changes in database
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, originalProduct.id))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].name).toEqual('Database Updated Product');
    expect(parseFloat(products[0].price)).toEqual(99.99);
    expect(products[0].updated_at).toBeInstanceOf(Date);
    expect(products[0].updated_at.getTime()).toBeGreaterThan(originalProduct.updated_at.getTime());
  });

  it('should return null for non-existent product', async () => {
    const updateInput: UpdateProductInput = {
      id: 999999, // Non-existent ID
      name: 'Should Not Work'
    };

    const result = await updateProduct(updateInput);

    expect(result).toBeNull();
  });

  it('should handle numeric type conversions correctly', async () => {
    // Create test product
    const originalProduct = await createTestProduct(testProductInput);

    const updateInput: UpdateProductInput = {
      id: originalProduct.id,
      price: 123.45
    };

    const result = await updateProduct(updateInput);

    expect(result).not.toBeNull();
    expect(typeof result!.price).toBe('number');
    expect(result!.price).toEqual(123.45);

    // Verify in database that numeric conversion works
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, originalProduct.id))
      .execute();

    expect(parseFloat(products[0].price)).toEqual(123.45);
  });
});
