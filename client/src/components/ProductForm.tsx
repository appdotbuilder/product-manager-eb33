
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CreateProductInput } from '../../../server/src/schema';

interface ProductFormProps {
  onSubmit: (data: CreateProductInput) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CreateProductInput>;
  buttonText?: string;
}

export function ProductForm({ 
  onSubmit, 
  isLoading = false, 
  initialData = {}, 
  buttonText = 'Create Product' 
}: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductInput>({
    name: initialData.name || '',
    description: initialData.description || null,
    price: initialData.price || 0,
    stock_quantity: initialData.stock_quantity || 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    
    // Reset form after successful submission (only if not editing)
    if (!initialData.name) {
      setFormData({
        name: '',
        description: null,
        price: 0,
        stock_quantity: 0
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateProductInput) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter product name"
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price * ($)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateProductInput) => ({ 
                ...prev, 
                price: parseFloat(e.target.value) || 0 
              }))
            }
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="stock">Stock Quantity *</Label>
        <Input
          id="stock"
          type="number"
          value={formData.stock_quantity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateProductInput) => ({ 
              ...prev, 
              stock_quantity: parseInt(e.target.value) || 0 
            }))
          }
          placeholder="0"
          min="0"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData((prev: CreateProductInput) => ({
              ...prev,
              description: e.target.value || null
            }))
          }
          placeholder="Enter product description"
          rows={3}
          disabled={isLoading}
        />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? '⏳ Processing...' : `✨ ${buttonText}`}
      </Button>
    </form>
  );
}
