
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '../../../server/src/schema';

interface ProductListProps {
  products: Product[];
  onUpdate: (id: number, updates: {
    name?: string;
    description?: string | null;
    price?: number;
    stock_quantity?: number;
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export function ProductList({ products, onUpdate, onDelete, isLoading = false }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
  }>({
    name: '',
    description: null,
    price: 0,
    stock_quantity: 0
  });

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    await onUpdate(editingProduct.id, editFormData);
    setEditingProduct(null);
  };

  const handleDeleteClick = async (id: number) => {
    await onDelete(id);
  };

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return 'destructive';
    if (stock < 10) return 'secondary';
    return 'default';
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
        <p className="text-gray-600">Create your first product to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <Input
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredProducts.length} found</Badge>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: Product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                <Badge variant={getStockBadgeVariant(product.stock_quantity)}>
                  {getStockLabel(product.stock_quantity)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              )}
              
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-green-600">
                  ${product.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  Stock: {product.stock_quantity}
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                Created: {product.created_at.toLocaleDateString()}
              </div>
              
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditClick(product)}
                      disabled={isLoading}
                    >
                      ✏️ Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Product Name</Label>
                        <Input
                          id="edit-name"
                          value={editFormData.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditFormData(prev => ({ ...prev, name: e.target.value }))
                          }
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-price">Price ($)</Label>
                          <Input
                            id="edit-price"
                            type="number"
                            value={editFormData.price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEditFormData(prev => ({ 
                                ...prev, 
                                price: parseFloat(e.target.value) || 0 
                              }))
                            }
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-stock">Stock</Label>
                          <Input
                            id="edit-stock"
                            type="number"
                            value={editFormData.stock_quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setEditFormData(prev => ({ 
                                ...prev, 
                                stock_quantity: parseInt(e.target.value) || 0 
                              }))
                            }
                            min="0"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={editFormData.description || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setEditFormData(prev => ({
                              ...prev,
                              description: e.target.value || null
                            }))
                          }
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex space-x-2 pt-4">
                        <Button type="submit" className="flex-1" disabled={isLoading}>
                          {isLoading ? 'Updating...' : 'Update Product'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      🗑️ Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{product.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteClick(product.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Product
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
}
