
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { ProductForm } from '@/components/ProductForm';
import { ProductList } from '@/components/ProductList';
import { LoginForm } from '@/components/LoginForm';
import type { Product, AuthResponse, User } from '../../server/src/schema';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check for existing session on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const loadProducts = useCallback(async () => {
    if (!user) return;
    
    try {
      clearMessages();
      const result = await trpc.auth.getProducts.query();
      setProducts(result);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please try again.');
    }
  }, [user, clearMessages]);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user, loadProducts]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response: AuthResponse = await trpc.login.mutate({ email, password });
      setUser(response.user);
      
      // Save to localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      setSuccess(`Welcome back, ${response.user.name}!`);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setProducts([]);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    clearMessages();
  };

  const handleCreateProduct = async (productData: {
    name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
  }) => {
    setIsLoading(true);
    clearMessages();
    try {
      const newProduct = await trpc.auth.createProduct.mutate(productData);
      setProducts((prev: Product[]) => [...prev, newProduct]);
      setSuccess('Product created successfully!');
    } catch (err) {
      console.error('Failed to create product:', err);
      setError('Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (id: number, updates: {
    name?: string;
    description?: string | null;
    price?: number;
    stock_quantity?: number;
  }) => {
    setIsLoading(true);
    clearMessages();
    try {
      const updatedProduct = await trpc.auth.updateProduct.mutate({ id, ...updates });
      if (updatedProduct) {
        setProducts((prev: Product[]) => 
          prev.map((p: Product) => p.id === id ? updatedProduct : p)
        );
        setSuccess('Product updated successfully!');
      } else {
        setError('Product not found.');
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      setError('Failed to update product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    setIsLoading(true);
    clearMessages();
    try {
      const success = await trpc.auth.deleteProduct.mutate({ id });
      if (success) {
        setProducts((prev: Product[]) => prev.filter((p: Product) => p.id !== id));
        setSuccess('Product deleted successfully!');
      } else {
        setError('Product not found.');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold text-gray-900">
                🏪 Product Manager
              </CardTitle>
              <p className="text-gray-600 mt-2">Sign in to manage your products</p>
            </CardHeader>
            <CardContent className="pt-6">
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
              <LoginForm onLogin={handleLogin} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main authenticated application
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏪</span>
              <h1 className="text-xl font-semibold text-gray-900">Product Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 text-xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-orange-600 text-xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.reduce((sum, p) => sum + p.stock_quantity, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">📋 Manage Products</TabsTrigger>
            <TabsTrigger value="add">➕ Add Product</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📦</span>
                  <span>Your Products</span>
                  <Badge variant="secondary">{products.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductList
                  products={products}
                  onUpdate={handleUpdateProduct}
                  onDelete={handleDeleteProduct}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>➕</span>
                  <span>Add New Product</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductForm onSubmit={handleCreateProduct} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
