import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Storefront() {
  const { products, addProduct } = useAppStore();
  const [open, setOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    imageUrl: '',
    description: '',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      title: newProduct.title,
      price: parseFloat(newProduct.price),
      imageUrl: newProduct.imageUrl,
      description: newProduct.description,
    });
    toast({
      title: 'Product added!',
      description: 'Your product has been added to the storefront.',
    });
    setNewProduct({ title: '', price: '', imageUrl: '', description: '' });
    setOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Storefront
          </h1>
          <p className="text-muted-foreground">
            Manage your digital products and offerings
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product for your storefront
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  placeholder="Brief description of your product..."
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                Add Product
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="border-border bg-card/50 backdrop-blur shadow-card hover:shadow-glow transition-all overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform hover:scale-110"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {product.title}
                  <span className="text-lg font-bold text-primary flex items-center">
                    <DollarSign className="w-4 h-4" />
                    {product.price}
                  </span>
                </CardTitle>
              </CardHeader>
              {product.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </CardContent>
              )}
              <CardFooter>
                <Button className="w-full" variant="outline">
                  Edit Product
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No products yet. Add your first product to get started!
          </p>
        </div>
      )}
    </motion.div>
  );
}
