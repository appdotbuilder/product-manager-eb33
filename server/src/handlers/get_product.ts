
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type GetProductInput, type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const getProduct = async (input: GetProductInput): Promise<Product | null> => {
  try {
    // Query product by ID
    const result = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, input.id))
      .execute();

    // Return null if product not found
    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const product = result[0];
    return {
      ...product,
      price: parseFloat(product.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Product retrieval failed:', error);
    throw error;
  }
};
