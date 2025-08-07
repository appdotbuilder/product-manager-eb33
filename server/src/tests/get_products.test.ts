
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { getProducts } from '../handlers/get_products';

describe('getProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const result = await getProducts();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all products', async () => {
    // Create test products
    await db.insert(productsTable).values([
      {
        name: 'Product 1',
        description: 'First test product',
        price: '19.99',
        stock_quantity: 50
      },
      {
        name: 'Product 2',
        description: 'Second test product',
        price: '29.99',
        stock_quantity: 100
      },
      {
        name: 'Product 3',
        description: null,
        price: '9.99',
        stock_quantity: 25
      }
    ]).execute();

    const result = await getProducts();

    expect(result).toHaveLength(3);
    
    // Check first product
    expect(result[0].name).toEqual('Product 1');
    expect(result[0].description).toEqual('First test product');
    expect(result[0].price).toEqual(19.99);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].stock_quantity).toEqual(50);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check second product
    expect(result[1].name).toEqual('Product 2');
    expect(result[1].description).toEqual('Second test product');
    expect(result[1].price).toEqual(29.99);
    expect(typeof result[1].price).toBe('number');
    expect(result[1].stock_quantity).toEqual(100);

    // Check third product with null description
    expect(result[2].name).toEqual('Product 3');
    expect(result[2].description).toBeNull();
    expect(result[2].price).toEqual(9.99);
    expect(typeof result[2].price).toBe('number');
    expect(result[2].stock_quantity).toEqual(25);
  });

  it('should handle products with different price formats', async () => {
    // Create products with various price formats
    await db.insert(productsTable).values([
      {
        name: 'Cheap Product',
        description: 'Low price product',
        price: '0.99',
        stock_quantity: 10
      },
      {
        name: 'Expensive Product',
        description: 'High price product',
        price: '999.99',
        stock_quantity: 1
      }
    ]).execute();

    const result = await getProducts();

    expect(result).toHaveLength(2);
    expect(result[0].price).toEqual(0.99);
    expect(result[1].price).toEqual(999.99);
    
    // Verify all prices are proper numbers
    result.forEach(product => {
      expect(typeof product.price).toBe('number');
      expect(product.price).toBeGreaterThan(0);
    });
  });
});
