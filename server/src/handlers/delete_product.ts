
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type DeleteProductInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteProduct = async (input: DeleteProductInput): Promise<boolean> => {
  try {
    // Delete product by ID
    const result = await db.delete(productsTable)
      .where(eq(productsTable.id, input.id))
      .execute();

    // Check if any rows were affected (product existed and was deleted)
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Product deletion failed:', error);
    throw error;
  }
};
