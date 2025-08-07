
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type DeleteProductInput, type CreateProductInput } from '../schema';
import { deleteProduct } from '../handlers/delete_product';
import { eq } from 'drizzle-orm';

// Simple test input for product deletion
const testDeleteInput: DeleteProductInput = {
  id: 1
};

// Test product data to create first
const testProductInput: CreateProductInput = {
  name: 'Test Product',
  description: 'A product for deletion testing',
  price: 29.99,
  stock_quantity: 50
};

describe('deleteProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing product', async () => {
    // First create a product to delete
    const created = await db.insert(productsTable)
      .values({
        name: testProductInput.name,
        description: testProductInput.description,
        price: testProductInput.price.toString(),
        stock_quantity: testProductInput.stock_quantity
      })
      .returning()
      .execute();

    const productId = created[0].id;

    // Delete the product
    const result = await deleteProduct({ id: productId });

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify product no longer exists in database
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .execute();

    expect(products).toHaveLength(0);
  });

  it('should return false for non-existent product', async () => {
    // Try to delete a product that doesn't exist
    const result = await deleteProduct({ id: 9999 });

    // Should return false when product doesn't exist
    expect(result).toBe(false);
  });

  it('should not affect other products when deleting one', async () => {
    // Create two products
    const product1 = await db.insert(productsTable)
      .values({
        name: 'Product 1',
        description: 'First product',
        price: '19.99',
        stock_quantity: 10
      })
      .returning()
      .execute();

    const product2 = await db.insert(productsTable)
      .values({
        name: 'Product 2',
        description: 'Second product',
        price: '39.99',
        stock_quantity: 20
      })
      .returning()
      .execute();

    // Delete only the first product
    const result = await deleteProduct({ id: product1[0].id });

    // Should successfully delete
    expect(result).toBe(true);

    // Verify first product is gone
    const deletedProducts = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, product1[0].id))
      .execute();

    expect(deletedProducts).toHaveLength(0);

    // Verify second product still exists
    const remainingProducts = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, product2[0].id))
      .execute();

    expect(remainingProducts).toHaveLength(1);
    expect(remainingProducts[0].name).toEqual('Product 2');
  });
});
