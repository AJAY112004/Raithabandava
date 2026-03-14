import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { useLanguage } from '@/components/LanguageProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import marketplace from '@/assets/marketplace.jpg';
import PaymentGatewayModal from '@/components/PaymentGatewayModal';

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
  shipping_address?: string;
  payment_method?: string;
  payment_method_details?: any;
  payment_transaction_id?: string;
  created_at: string;
  items: {
    listing: MarketplaceListing;
    quantity: number;
    unit_price: number;
  }[];
}

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
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
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    deliveryOption: 'standard',
    deliveryDate: '',
    notes: ''
  });

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

  // Sync tab with URL hash (e.g., /marketplace#orders)
  useEffect(() => {
    const hash = (location.hash || '').replace('#', '');
    if (hash && ['browse','sell','orders','messages','dashboard'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'orders') setActiveTab('orders');
  }, []);

  useEffect(() => {
    if (userProfile) {
      setCheckoutForm((prev) => ({
        ...prev,
        fullName: userProfile.full_name || prev.fullName,
        phone: userProfile.phone || prev.phone,
        city: userProfile.district || prev.city,
        state: userProfile.state || prev.state,
      }));
    }
  }, [userProfile]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        console.log('Creating user profile for:', user.email);
        const { data: newProfile, error: createError } = await (supabase as any)
          .from('user_profiles')
          .insert({
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'User',
            phone: '',
            village: '',
            district: '',
            state: 'Karnataka'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }
        
        setUserProfile(newProfile);
        return;
      }
      
      if (error) {
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
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch seller profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((listing: any) => listing.user_id))];
        const { data: profiles } = await (supabase as any)
          .from('user_profiles')
          .select('user_id, full_name, phone, rating, total_reviews, is_verified')
          .in('user_id', userIds);
        
        // Map profiles to listings
        const listingsWithSellers = data.map((listing: any) => ({
          ...listing,
          seller: profiles?.find((p: any) => p.user_id === listing.user_id) || {
            full_name: 'Unknown',
            phone: '',
            rating: 0,
            total_reviews: 0,
            is_verified: false
          }
        }));
        
        setListings(listingsWithSellers);
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: t('marketplace.error'),
        description: t('marketplace.failedLoad'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      const { data: cartData, error } = await (supabase as any)
        .from('cart_items')
        .select('*, listing:marketplace_listings(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Fetch seller profiles for cart items
      if (cartData && cartData.length > 0) {
        const userIds = [...new Set(cartData.map((item: any) => item.listing?.user_id).filter(Boolean))];
        const { data: profiles } = await (supabase as any)
          .from('user_profiles')
          .select('user_id, full_name, phone, rating, total_reviews, is_verified')
          .in('user_id', userIds);
        
        // Map profiles to cart items
        const cartWithSellers = cartData.map((item: any) => ({
          ...item,
          listing: {
            ...item.listing,
            seller: profiles?.find((p: any) => p.user_id === item.listing?.user_id) || {
              full_name: 'Unknown',
              phone: '',
              rating: 0,
              total_reviews: 0,
              is_verified: false
            }
          }
        }));
        
        setCartItems(cartWithSellers);
      } else {
        setCartItems([]);
      }
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
        title: t('marketplace.loginRequired'),
        description: t('marketplace.loginRequiredDesc'),
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.listing.id === listing.id);
      
      if (existingItem) {
        // If exists, increment quantity
        const { error } = await (supabase as any)
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);

        if (error) throw error;
      } else {
        // If doesn't exist, insert new
        const { error } = await (supabase as any)
          .from('cart_items')
          .insert({ 
            user_id: user.id, 
            listing_id: listing.id, 
            quantity 
          });

        if (error) throw error;
      }

      await fetchCartItems();
      toast({
        title: t('marketplace.addedToCart'),
        description: t('marketplace.addedToCartDesc').replace('{title}', listing.title)
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: t('marketplace.error'),
        description: t('marketplace.failedAddToCart'),
        variant: 'destructive'
      });
    }
  };

  const updateCartQuantity = async (cartItemId: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;

    try {
      const { error } = await (supabase as any)
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', cartItemId);

      if (error) throw error;

      await fetchCartItems();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      toast({
        title: t('marketplace.error'),
        description: 'Failed to update quantity',
        variant: 'destructive'
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      await fetchCartItems();
      toast({
        title: 'Removed',
        description: 'Item removed from cart'
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: t('marketplace.error'),
        description: 'Failed to remove item',
        variant: 'destructive'
      });
    }
  };

  const addToWishlist = async (listingId: string) => {
    if (!user) {
      toast({
        title: t('marketplace.loginRequired'),
        description: t('marketplace.loginRequiredDesc'),
        variant: "destructive"
      });
      return;
    }

    try {
      if (wishlistItems.includes(listingId)) {
        const { error } = await (supabase as any)
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
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
    if (!user) {
      toast({
        title: t('marketplace.loginRequired'),
        description: t('marketplace.loginRequiredDesc'),
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
        
        const { error: uploadError, data } = await (supabase as any).storage
          .from('product-images')
          .upload(fileName, productForm.image);

        if (uploadError) throw uploadError;
        
        const res: any = (supabase as any).storage
          .from('product-images')
          .getPublicUrl(fileName);
        const publicUrl = res?.data?.publicUrl ?? '';
        
        imageUrl = publicUrl;
      }

      const { error } = await (supabase as any)
        .from('marketplace_listings')
        .insert({
          user_id: user.id,
          title: productForm.title,
          category: productForm.category,
          price: parseFloat(productForm.price),
          unit: productForm.unit,
          description: productForm.description,
          quantity: productForm.quantity,
          location: productForm.location || userProfile?.district || '',
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
        title: t('marketplace.productListed'),
        description: t('marketplace.productListedDesc')
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: t('marketplace.error'),
        description: t('marketplace.error'),
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
      
      const { error } = await (supabase as any)
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
        title: t('marketplace.messageSentTitle'),
        description: t('marketplace.messageSentDesc')
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('marketplace.error'),
        description: t('marketplace.failedSendMessage'),
        variant: 'destructive'
      });
    }
  };

  const createOrder = async (shippingAddressStr: string | any, paymentData?: any, skipNavigation: boolean = false) => {
    if (!user || cartItems.length === 0) return;

    try {
      // Handle both old string format and new object format
      const addressString = typeof shippingAddressStr === 'string' 
        ? shippingAddressStr 
        : [
            shippingAddressStr.addressLine1,
            shippingAddressStr.addressLine2,
            shippingAddressStr.city,
            shippingAddressStr.state,
            shippingAddressStr.pincode
          ].filter(Boolean).join(', ');

      const totalAmount = cartItems.reduce((sum, item) => 
        sum + (item.listing.price * item.quantity), 0
      );

      const orderData: any = {
        buyer_id: user.id,
        seller_id: cartItems[0].listing.user_id,
        total_amount: totalAmount,
        shipping_address: addressString,
        status: 'confirmed',
        payment_status: 'paid'
      };

      // Add payment method details if provided
      if (paymentData) {
        orderData.payment_method = paymentData.method;
        orderData.payment_method_details = paymentData.details;
        orderData.payment_transaction_id = paymentData.transactionId;
        if (paymentData.method === 'cod') {
          // For Cash on Delivery, mark payment as pending until delivery confirmation
          orderData.payment_status = 'pending';
          orderData.status = 'pending';
        }
      }

      const { data: order, error: orderError } = await (supabase as any)
        .from('orders')
        .insert(orderData)
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
      setShowCheckout(false);
      setCheckoutStep(1);
      
      toast({
        title: t('marketplace.orderPlacedTitle'),
        description: t('marketplace.orderPlacedDesc').replace('{orderNumber}', order.order_number)
      });

      // Navigate to payment success page only if not skipped
      if (!skipNavigation) {
        navigate(`/payment-success?orderId=${order.id}`);
      }

      return order; // Return the order for the caller to use
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: t('marketplace.error'),
        description: t('marketplace.failedPlaceOrder'),
        variant: 'destructive'
      });
      throw error; // Re-throw so caller can handle
    }
  };

  const shippingAddressString = () => {
    const parts = [
      checkoutForm.addressLine1,
      checkoutForm.addressLine2,
      checkoutForm.city,
      checkoutForm.state,
      checkoutForm.pincode
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleStartCheckout = () => {
    if (cartItems.length === 0) return;
    setShowCheckout(true);
    setCheckoutStep(1);
  };

  const handleCheckoutNext = () => {
    if (checkoutStep === 1) {
      // Basic validation for address
      if (!checkoutForm.fullName || !checkoutForm.phone || !checkoutForm.addressLine1 || !checkoutForm.city || !checkoutForm.pincode) {
        toast({ title: 'Missing details', description: 'Please fill required address fields', variant: 'destructive' });
        return;
      }
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      setCheckoutStep(3);
    }
  };

  const initiatePayment = async () => {
    try {
      setIsPaying(true);
      // Prepare pending data for potential COD flow or metadata
      const pending = {
        buyerId: user?.id,
        sellerId: cartItems[0]?.listing?.user_id,
        address: shippingAddressString(),
        total: cartTotal,
        items: cartItems.map(ci => ({
          listingId: ci.listing.id,
          title: ci.listing.title,
          qty: ci.quantity,
          price: ci.listing.price
        }))
      };
      localStorage.setItem('pendingCheckout', JSON.stringify(pending));

      // For Stripe we directly show modal to pick method (COD vs card) then redirect
      setShowPaymentModal(true);
      setIsPaying(false);
      
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({ title: 'Payment Error', description: error.message, variant: 'destructive' });
      setIsPaying(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      setShowPaymentModal(false);
      setIsPaying(true);

      // Get pending checkout data
      const pendingJson = localStorage.getItem('pendingCheckout');
      if (!pendingJson) {
        throw new Error('Checkout data not found');
      }
      const pending = JSON.parse(pendingJson);
      
      // ALL PAYMENT METHODS IN MOCK MODE - Create order immediately for all methods
      const shippingAddress = {
        fullName: checkoutForm.fullName,
        phone: checkoutForm.phone,
        addressLine1: checkoutForm.addressLine1,
        addressLine2: checkoutForm.addressLine2,
        city: checkoutForm.city,
        state: checkoutForm.state,
        pincode: checkoutForm.pincode,
        deliveryOption: checkoutForm.deliveryOption,
        deliveryDate: checkoutForm.deliveryDate,
        notes: checkoutForm.notes
      };
      
      // Create order immediately for all payment methods (mock mode)
      const order = await createOrder(shippingAddress, paymentData, true);
      setCartItems([]);
      setShowCheckout(false);
      setCheckoutStep(1);
      localStorage.removeItem('pendingCheckout');
      sessionStorage.setItem('lastOrderId', order.id);
      navigate(`/payment-success?local=true&method=${paymentData.method}`);
      
      /* STRIPE INTEGRATION (Disabled - uncomment when API keys are set)
      if (paymentData.method === 'cod') {
        // COD flow
        const order = await createOrder(shippingAddress, paymentData, true);
        setCartItems([]);
        setShowCheckout(false);
        setCheckoutStep(1);
        localStorage.removeItem('pendingCheckout');
        sessionStorage.setItem('lastOrderId', order.id);
        navigate(`/payment-success?local=true&method=cod`);
      } else {
        // Stripe flow: create Checkout Session then redirect
        const origin = window.location.origin;

        const { data, error } = await (supabase as any).functions.invoke('stripe-create-checkout', {
          body: {
            items: pending.items,
            buyerId: pending.buyerId,
            sellerId: pending.sellerId,
            shippingAddress,
            successUrl: `${origin}/payment-success`,
            cancelUrl: `${origin}/marketplace?payment=cancelled`
          }
        });
        
        console.log('Stripe checkout response:', JSON.stringify({ data, error }, null, 2));
        
        if (error) {
          console.error('Stripe checkout error details:', error);
          throw new Error(error.message || 'Stripe session creation failed');
        }
        
        if (!data?.success) {
          console.error('Stripe checkout failed:', data);
          throw new Error(data?.error || 'Stripe session creation failed');
        }
        
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
      */
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: 'Order Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsPaying(false);
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
                      <div className="space-y-4">
                        {/* Payment Information */}
                        {order.payment_method && (
                          <div className="flex items-center gap-2 text-sm p-2 bg-green-50 dark:bg-green-950 rounded">
                            <span className="font-medium text-green-700 dark:text-green-300">
                              💳 Paid via {order.payment_method.toUpperCase()}
                            </span>
                            {order.payment_method_details && (
                              <span className="text-muted-foreground">
                                {order.payment_method === 'upi' && order.payment_method_details.upiId && 
                                  `(${order.payment_method_details.upiId})`}
                                {order.payment_method === 'card' && order.payment_method_details.last4 && 
                                  `(****${order.payment_method_details.last4})`}
                                {order.payment_method === 'netbanking' && order.payment_method_details.bank && 
                                  `(${order.payment_method_details.bank})`}
                                {order.payment_method === 'wallet' && order.payment_method_details.provider && 
                                  `(${order.payment_method_details.provider})`}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Order Items */}
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
                        
                        {/* Shipping Address */}
                        {order.shipping_address && (
                          <div className="text-sm p-2 bg-muted rounded">
                            <p className="font-medium text-muted-foreground mb-1">📦 Shipping To:</p>
                            <p className="text-foreground">{order.shipping_address}</p>
                          </div>
                        )}
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
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 w-7 p-0"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[2rem] text-center font-medium">{item.quantity}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 w-7 p-0"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="font-bold min-w-[5rem] text-right">₹{(item.listing.price * item.quantity).toLocaleString()}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total: ₹{cartTotal.toLocaleString()}</span>
                </div>
                <Button 
                  onClick={handleStartCheckout} 
                  className="w-full mt-4" 
                  variant="hero"
                  disabled={cartItems.length === 0}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Checkout Dialog */}
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Checkout</DialogTitle>
              <DialogDescription>
                {checkoutStep === 1 && 'Enter delivery details'}
                {checkoutStep === 2 && 'Review your order'}
                {checkoutStep === 3 && 'Secure payment'}
              </DialogDescription>
            </DialogHeader>

            {checkoutStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input value={checkoutForm.fullName} onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone *</label>
                    <Input value={checkoutForm.phone} onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Address Line 1 *</label>
                  <Input value={checkoutForm.addressLine1} onChange={(e) => setCheckoutForm({ ...checkoutForm, addressLine1: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Address Line 2</label>
                  <Input value={checkoutForm.addressLine2} onChange={(e) => setCheckoutForm({ ...checkoutForm, addressLine2: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">City *</label>
                    <Input value={checkoutForm.city} onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">State *</label>
                    <Input value={checkoutForm.state} onChange={(e) => setCheckoutForm({ ...checkoutForm, state: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pincode *</label>
                    <Input value={checkoutForm.pincode} onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Delivery Option</label>
                    <Select value={checkoutForm.deliveryOption} onValueChange={(v) => setCheckoutForm({ ...checkoutForm, deliveryOption: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                        <SelectItem value="express">Express (1-2 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Preferred Delivery Date</label>
                    <Input type="date" value={checkoutForm.deliveryDate} onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Order Notes</label>
                  <Textarea placeholder="Any instructions for delivery..." value={checkoutForm.notes} onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })} />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowCheckout(false)}>Cancel</Button>
                  <Button variant="hero" onClick={handleCheckoutNext}>Continue</Button>
                </div>
              </div>
            )}

            {checkoutStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Delivery Address</h4>
                  <p className="text-sm">{checkoutForm.fullName}</p>
                  <p className="text-sm">{shippingAddressString()}</p>
                  <p className="text-sm">Phone: {checkoutForm.phone}</p>
                  <p className="text-sm capitalize">Delivery: {checkoutForm.deliveryOption}</p>
                  {checkoutForm.deliveryDate && <p className="text-sm">Preferred Date: {checkoutForm.deliveryDate}</p>}
                  {checkoutForm.notes && <p className="text-sm">Notes: {checkoutForm.notes}</p>}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Order Summary</h4>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.listing.title}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.listing.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">₹{(item.quantity * item.listing.price).toLocaleString()}</p>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setCheckoutStep(1)}>Back</Button>
                  <Button variant="hero" onClick={handleCheckoutNext}>Proceed to Payment</Button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Pay securely</h4>
                  <p className="text-sm text-muted-foreground">You will be charged ₹{cartTotal.toLocaleString()}.</p>
                </div>
                <Button className="w-full" variant="hero" onClick={initiatePayment} disabled={isPaying}>
                  {isPaying ? 'Processing...' : 'Pay Now'}
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setCheckoutStep(2)} disabled={isPaying}>
                  Back
                </Button>
              </div>
            )}
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

        {/* Payment Gateway Modal */}
        <PaymentGatewayModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={cartTotal}
          onSuccess={handlePaymentSuccess}
        />
        
      </div>
    </div>
  );
};

export default Marketplace;