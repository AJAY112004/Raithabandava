import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Star,
  Plus,
  Package,
  Tractor,
  Sprout,
  Droplets,
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Trash2,
  Send,
  Clock,
  CheckCircle,
  X,
  Upload,
  ImageIcon,
  ShoppingBag,
  Minus,
  BarChart3,
  IndianRupee,
  Truck,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import marketplace from '@/assets/marketplace.jpg';

// Types for marketplace data
interface MarketplaceListing {
  id: string;
  user_id: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  quantity: string;
  location: string;
  image_url?: string;
  status: 'active' | 'sold' | 'inactive';
  created_at: string;
  updated_at: string;
  seller?: {
    full_name: string;
    phone?: string;
    rating: number;
    total_reviews: number;
    is_verified: boolean;
  };
}

interface CartItem {
  id: string;
  listing: MarketplaceListing;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: {
    listing: MarketplaceListing;
    quantity: number;
    unit_price: number;
  }[];
}

const Marketplace = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    title: '',
    category: '',
    price: '',
    unit: '',
    description: '',
    quantity: '',
    location: '',
    image: null as File | null
  });

  useEffect(() => {
    if (user) {
      fetchListings();
      fetchCartItems();
      fetchWishlist();
      fetchUserProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('marketplace_listings')
        .select(`
          *,
          seller:user_profiles!marketplace_listings_user_id_fkey(
            full_name,
            phone,
            rating,
            total_reviews,
            is_verified
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('cart_items')
        .select(`
          *,
          listing:marketplace_listings(
            *,
            seller:user_profiles!marketplace_listings_user_id_fkey(
              full_name,
              phone,
              rating,
              total_reviews,
              is_verified
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('wishlist')
        .select('listing_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setWishlistItems(data?.map(item => item.listing_id) || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('orders')
        .select(`
          *,
          order_items(
            quantity,
            unit_price,
            listing:marketplace_listings(*)
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const addToCart = async (listing: MarketplaceListing, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to login to add items to cart",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({ 
          user_id: user.id, 
          listing_id: listing.id, 
          quantity 
        });

      if (error) throw error;

      await fetchCartItems();
      toast({
        title: "Added to cart",
        description: `${listing.title} added to your cart`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };

  const addToWishlist = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to login to add items to wishlist",
        variant: "destructive"
      });
      return;
    }

    try {
      if (wishlistItems.includes(listingId)) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, listing_id: listingId });

        if (error) throw error;
      }

      await fetchWishlist();
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) {
      toast({
        title: "Please complete your profile",
        description: "You need to complete your profile to sell products",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      
      if (productForm.image) {
        const fileExt = productForm.image.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        // Upload image to storage (temporary cast to any to avoid typed DB issues)
        const { error: uploadError } = await (supabase as any)
          .storage
          .from('product-images')
          .upload(fileName, productForm.image);

        if (uploadError) throw uploadError;

        // Get public URL for the uploaded file
        const res: any = (supabase as any)
          .storage
          .from('product-images')
          .getPublicUrl(fileName);

        imageUrl = res?.data?.publicUrl ?? '';
      }

      const { error } = await supabase
        .from('marketplace_listings')
        .insert({
          user_id: user.id,
          title: productForm.title,
          category: productForm.category,
          price: parseFloat(productForm.price),
          unit: productForm.unit,
          description: productForm.description,
          quantity: productForm.quantity,
          location: productForm.location || userProfile.district || '',
          image_url: imageUrl
        });

      if (error) throw error;

      setProductForm({
        title: '',
        category: '',
        price: '',
        unit: '',
        description: '',
        quantity: '',
        location: '',
        image: null
      });
      
      setShowProductForm(false);
      await fetchListings();
      
      toast({
        title: "Product listed successfully",
        description: "Your product is now available in the marketplace"
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create product listing",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId: string, listingId?: string) => {
    if (!user || !messageText.trim()) return;

    try {
      const conversationId = [user.id, receiverId].sort().join('-');
      
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: receiverId,
          listing_id: listingId,
          message: messageText.trim()
        });

      if (error) throw error;

      setMessageText('');
      setShowMessageDialog(false);
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const createOrder = async () => {
    if (!user || cartItems.length === 0) return;

    try {
      const totalAmount = cartItems.reduce((sum, item) => 
        sum + (item.listing.price * item.quantity), 0
      );

      const { data: order, error: orderError } = await (supabase as any)
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: cartItems[0].listing.user_id,
          total_amount: totalAmount,
          shipping_address: userProfile?.village || ''
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        listing_id: item.listing.id,
        quantity: item.quantity,
        unit_price: item.listing.price,
        total_price: item.listing.price * item.quantity
      }));

      const { error: itemsError } = await (supabase as any)
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const { error: cartError } = await (supabase as any)
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (cartError) throw cartError;

      await fetchCartItems();
      await fetchOrders();
      setShowCart(false);
      
      toast({
        title: "Order placed successfully",
        description: `Order ${order.order_number} has been placed`
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive"
      });
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Seeds':
        return <Sprout className="w-4 h-4" />;
      case 'Fertilizers':
        return <Package className="w-4 h-4" />;
      case 'Equipment':
        return <Tractor className="w-4 h-4" />;
      case 'Irrigation':
        return <Droplets className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Seeds':
        return 'bg-success/20 text-success border-success/30';
      case 'Fertilizers':
        return 'bg-earth/20 text-earth-dark border-earth/30';
      case 'Equipment':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'Irrigation':
        return 'bg-sky/20 text-sky border-sky/30';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(1)}k`;
    }
    return `₹${price}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'confirmed':
        return 'bg-success/20 text-success border-success/30';
      case 'processing':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'shipped':
        return 'bg-blue/20 text-blue border-blue/30';
      case 'delivered':
        return 'bg-success/20 text-success border-success/30';
      case 'cancelled':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.listing.price * item.quantity), 0);

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-earth/10 to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-earth to-primary rounded-xl flex items-center justify-center shadow-medium">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-poppins">
            Farmer Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete farmer-to-farmer commerce platform. Buy and sell agricultural products, 
            equipment, seeds, and fertilizers directly with fellow farmers.
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold">{listings.length}</p>
              <p className="text-sm text-muted-foreground">Active Products</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-success" />
              </div>
              <p className="text-2xl font-bold">150+</p>
              <p className="text-sm text-muted-foreground">Verified Sellers</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Orders Completed</p>
            </Card>
            <Card className="p-4 text-center relative">
              <div className="flex items-center justify-center mb-2">
                <ShoppingBag className="w-6 h-6 text-earth" />
              </div>
              <p className="text-2xl font-bold">{cartItems.length}</p>
              <p className="text-sm text-muted-foreground">Items in Cart</p>
              {cartItems.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setShowCart(true)}
                >
                  View Cart
                </Button>
              )}
            </Card>
          </div>
        </div>

        {/* Enhanced Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Sell
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          {/* Browse Products Tab */}
          <TabsContent value="browse">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Seeds">Seeds</SelectItem>
                  <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Irrigation">Irrigation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse">
                    <div className="h-48 bg-muted"></div>
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedListings.map((listing) => (
                  <Card key={listing.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-br from-earth/10 to-primary/5 rounded-t-lg flex items-center justify-center">
                        {listing.image_url ? (
                          <img 
                            src={listing.image_url} 
                            alt={listing.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 p-2"
                        onClick={() => addToWishlist(listing.id)}
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            wishlistItems.includes(listing.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </Button>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight mb-2">
                            {listing.title}
                          </CardTitle>
                          {listing.seller && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>by {listing.seller.full_name}</span>
                              {listing.seller.is_verified && (
                                <CheckCircle className="w-4 h-4 text-success" />
                              )}
                              <div className="flex items-center">
                                <Star className="w-3 h-3 fill-warning text-warning mr-1" />
                                <span>{listing.seller.rating?.toFixed(1) || 'New'}</span>
                                <span className="text-xs ml-1">({listing.seller.total_reviews})</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <Badge className={getCategoryColor(listing.category)}>
                          {getCategoryIcon(listing.category)}
                          <span className="ml-1">{listing.category}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-foreground line-clamp-2">{listing.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-success">
                            {formatPrice(listing.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">{listing.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{listing.quantity}</p>
                          <p className="text-xs text-muted-foreground">Available</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {listing.location}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="nature" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => addToCart(listing)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedListing(listing);
                            setShowMessageDialog(true);
                          }}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {sortedListings.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or explore different categories
                </p>
              </div>
            )}
          </TabsContent>

          {/* Sell Products Tab */}
          <TabsContent value="sell">
            <Card className="shadow-medium max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>List Your Product</CardTitle>
                <CardDescription>
                  Sell your agricultural products, equipment, or supplies to fellow farmers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProductSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Product Title *</label>
                      <Input 
                        placeholder="e.g., High Quality Rice Seeds" 
                        value={productForm.title}
                        onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category *</label>
                      <Select 
                        value={productForm.category}
                        onValueChange={(value) => setProductForm({...productForm, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Seeds">Seeds</SelectItem>
                          <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                          <SelectItem value="Equipment">Equipment</SelectItem>
                          <SelectItem value="Irrigation">Irrigation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price *</label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unit *</label>
                      <Select 
                        value={productForm.unit}
                        onValueChange={(value) => setProductForm({...productForm, unit: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per kg">per kg</SelectItem>
                          <SelectItem value="per quintal">per quintal</SelectItem>
                          <SelectItem value="per ton">per ton</SelectItem>
                          <SelectItem value="per piece">per piece</SelectItem>
                          <SelectItem value="per packet">per packet</SelectItem>
                          <SelectItem value="fixed price">fixed price</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity Available *</label>
                      <Input 
                        placeholder="e.g., 500 kg" 
                        value={productForm.quantity}
                        onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description *</label>
                    <Textarea 
                      placeholder="Describe your product in detail..." 
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input 
                      placeholder="Village, District, State" 
                      value={productForm.location}
                      onChange={(e) => setProductForm({...productForm, location: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Image</label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setProductForm({...productForm, image: e.target.files?.[0] || null})}
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Posting..." : "Post Product"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-6">
              {orders.length === 0 ? (
                <Card className="shadow-medium">
                  <CardContent className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">
                      Start shopping to see your orders here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="shadow-medium">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                          <CardDescription>
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <p className="text-lg font-bold mt-1">₹{order.total_amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <p className="font-medium">{item.listing.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × ₹{item.unit_price}
                              </p>
                            </div>
                            <p className="font-medium">₹{item.quantity * item.unit_price}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Chat with buyers and sellers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p className="text-muted-foreground">
                    Contact sellers to start conversations
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    Sales Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Sales</span>
                      <span className="font-bold">₹{orders.filter(o => o.seller_id === user?.id).reduce((sum, o) => sum + o.total_amount, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Orders Received</span>
                      <span className="font-bold">{orders.filter(o => o.seller_id === user?.id).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    My Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Active Products</span>
                      <span className="font-bold">{listings.filter(l => l.user_id === user?.id).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wishlist Items</span>
                      <span className="font-bold">{wishlistItems.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-warning" />
                    Profile Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Profile Rating</span>
                      <span className="font-bold">{userProfile?.rating?.toFixed(1) || 'New'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Reviews</span>
                      <span className="font-bold">{userProfile?.total_reviews || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Shopping Cart Dialog */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Shopping Cart</DialogTitle>
              <DialogDescription>
                Review your items before placing the order
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.listing.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.listing.seller?.full_name}</p>
                    <p className="text-sm">₹{item.listing.price} {item.listing.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Qty: {item.quantity}</span>
                    <span className="font-bold">₹{(item.listing.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total: ₹{cartTotal.toLocaleString()}</span>
                </div>
                <Button 
                  onClick={createOrder} 
                  className="w-full mt-4" 
                  variant="hero"
                  disabled={cartItems.length === 0}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>
                Contact the seller about {selectedListing?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <Button 
                onClick={() => selectedListing && sendMessage(selectedListing.user_id, selectedListing.id)}
                className="w-full"
                disabled={!messageText.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Marketplace;