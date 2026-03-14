import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/StatusBadge';
import { 
  Package, 
  Truck, 
  Warehouse, 
  MapPin, 
  Calendar, 
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  User,
  Leaf,
  Store,
  BarChart,
  DollarSign,
  Users,
  Activity,
  FileText,
  Download
} from 'lucide-react';
import supplyChain from '@/assets/supply-chain.jpg';
import { useLanguage } from '@/components/LanguageProvider';
import PaymentGatewayModal from '@/components/PaymentGatewayModal';

// Types for supply chain data
interface Product {
  id: string;
  name: string;
  category: string;
  farmer: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  harvestDate: string;
  location: string;
  quality: string;
  description: string;
  status: 'available' | 'ordered' | 'sold';
}

interface Order {
  id: string;
  productId: string;
  productName: string;
  retailer: string;
  quantity: number;
  totalPrice: number;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  deliveryAddress: string;
  notes: string;
  payment_method?: string;
  payment_method_details?: any;
  payment_transaction_id?: string;
}

interface Shipment {
  id: string;
  orderId: string;
  productName: string;
  retailer: string;
  quantity: number;
  status: 'preparing' | 'in_transit' | 'out_for_delivery' | 'delivered';
  currentLocation: string;
  estimatedDelivery: string;
  trackingNotes: string;
  transporter?: string;
  transporterContact?: string;
  vehicleNumber?: string;
}

interface PriceForecast {
  crop: string;
  currentPrice: number;
  predictedPrice: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  factors: string[];
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  satisfactionScore: number;
  topCrops: { name: string; orders: number }[];
  monthlyTrend: { month: string; value: number }[];
}

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: 'P001',
    name: 'Organic Rice',
    category: 'Grains',
    farmer: 'Ravi Kumar',
    quantity: 50,
    unit: 'quintals',
    pricePerUnit: 2500,
    harvestDate: '2024-03-01',
    location: 'Mysuru, Karnataka',
    quality: 'Grade A',
    description: 'Premium quality organic basmati rice',
    status: 'available'
  },
  {
    id: 'P002',
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    farmer: 'Lakshmi Devi',
    quantity: 25,
    unit: 'quintals',
    pricePerUnit: 1200,
    harvestDate: '2024-03-10',
    location: 'Kolar, Karnataka',
    quality: 'Premium',
    description: 'Fresh red tomatoes, ideal for retail',
    status: 'available'
  }
];

const mockOrders: Order[] = [
  {
    id: 'ORD001',
    productId: 'P001',
    productName: 'Organic Rice',
    retailer: 'Green Mart Bangalore',
    quantity: 10,
    totalPrice: 25000,
    orderDate: '2024-03-12',
    status: 'confirmed',
    deliveryAddress: 'MG Road, Bangalore',
    notes: 'Urgent delivery required'
  }
];

const mockShipments: Shipment[] = [
  {
    id: 'SHP001',
    orderId: 'ORD001',
    productName: 'Organic Rice',
    retailer: 'Green Mart Bangalore',
    quantity: 10,
    status: 'in_transit',
    currentLocation: 'Highway NH-75, near Ramanagara',
    estimatedDelivery: '2024-03-15',
    trackingNotes: 'On schedule, expected delivery by evening'
  }
];

const SupplyChain = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  
  // Price forecast state
  const [priceForecasts, setPriceForecasts] = useState<PriceForecast[]>([
    {
      crop: 'Rice',
      currentPrice: 2500,
      predictedPrice: 2650,
      trend: 'up',
      confidence: 85,
      factors: ['Monsoon forecast favorable', 'Export demand increasing', 'Storage costs rising']
    },
    {
      crop: 'Tomatoes',
      currentPrice: 1200,
      predictedPrice: 1050,
      trend: 'down',
      confidence: 72,
      factors: ['Harvest season approaching', 'Supply increasing', 'Weather conditions stable']
    },
    {
      crop: 'Cotton',
      currentPrice: 5500,
      predictedPrice: 5500,
      trend: 'stable',
      confidence: 68,
      factors: ['Market equilibrium', 'Steady demand', 'No major disruptions expected']
    }
  ]);

  // Analytics data
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    satisfactionScore: 4.8,
    topCrops: [],
    monthlyTrend: [
      { month: 'Jan', value: 45000 },
      { month: 'Feb', value: 52000 },
      { month: 'Mar', value: 61000 }
    ]
  });

  // User role detection
  const userRole = profile?.role || 'farmer';

  // Fetch data from Supabase
  const fetchProducts = async () => {
    try {
    const { data, error } = await (supabase as any)
      .from('supply_chain_products')
      .select('*')
      .order('created_at', { ascending: false });      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        farmer: p.farmer,
        quantity: p.quantity,
        unit: p.unit,
        pricePerUnit: p.price_per_unit,
        harvestDate: p.harvest_date,
        location: p.location,
        quality: p.quality,
        description: p.description || '',
        status: p.status as 'available' | 'ordered' | 'sold'
      }));

      setProducts(formattedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
    }
  };

  const fetchOrders = async () => {
    try {
    const { data, error } = await (supabase as any)
      .from('supply_chain_orders')
      .select('*')
      .order('created_at', { ascending: false });      if (error) throw error;

      const formattedOrders: Order[] = (data || []).map(o => ({
        id: o.id,
        productId: o.product_id,
        productName: o.product_name,
        retailer: o.retailer,
        quantity: o.quantity,
        totalPrice: o.total_price,
        orderDate: o.order_date,
        status: o.status as 'pending' | 'confirmed' | 'shipped' | 'delivered',
        deliveryAddress: o.delivery_address,
        notes: o.notes || '',
        payment_method: o.payment_method || null,
        payment_method_details: o.payment_method_details || null,
        payment_transaction_id: o.payment_transaction_id || null
      }));

      setOrders(formattedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive'
      });
    }
  };

  const fetchShipments = async () => {
    try {
    const { data, error } = await (supabase as any)
      .from('supply_chain_shipments')
      .select('*')
      .order('created_at', { ascending: false });      if (error) throw error;

      const formattedShipments: Shipment[] = (data || []).map(s => ({
        id: s.id,
        orderId: s.order_id,
        productName: s.product_name,
        retailer: s.retailer,
        quantity: s.quantity,
        status: s.status as 'preparing' | 'in_transit' | 'out_for_delivery' | 'delivered',
        currentLocation: s.current_location || '',
        estimatedDelivery: s.estimated_delivery || '',
        trackingNotes: s.tracking_notes || '',
        transporter: s.transporter,
        transporterContact: s.transporter_contact,
        vehicleNumber: s.vehicle_number
      }));

      setShipments(formattedShipments);
    } catch (error: any) {
      console.error('Error fetching shipments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipments',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchOrders();
      fetchShipments();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      calculateAnalytics();
    }
  }, [user, orders, products]);

  const calculateAnalytics = () => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate top crops
    const cropOrders: { [key: string]: number } = {};
    orders.forEach(order => {
      cropOrders[order.productName] = (cropOrders[order.productName] || 0) + 1;
    });
    const topCrops = Object.entries(cropOrders)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    setAnalytics(prev => ({
      ...prev,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topCrops
    }));
  };

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    farmer: '',
    quantity: '',
    unit: '',
    pricePerUnit: '',
    harvestDate: '',
    location: '',
    quality: '',
    description: ''
  });

  const [orderForm, setOrderForm] = useState({
    productId: '',
    retailer: '',
    quantity: '',
    deliveryAddress: '',
    notes: ''
  });

  const [shipmentUpdate, setShipmentUpdate] = useState({
    shipmentId: '',
    status: '',
    currentLocation: '',
    trackingNotes: ''
  });

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'confirmed':
      case 'delivered':
        return 'text-success';
      case 'pending':
      case 'preparing':
        return 'text-warning';
      case 'in_transit':
      case 'shipped':
        return 'text-primary';
      case 'ordered':
      case 'sold':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <Package className="w-4 h-4" />;
      case 'ordered':
      case 'pending':
        return <ShoppingCart className="w-4 h-4" />;
      case 'confirmed':
      case 'preparing':
        return <Clock className="w-4 h-4" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Handler functions
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('supply_chain_products')
        .insert([{
          user_id: user.id,
          name: productForm.name,
          category: productForm.category,
          farmer: productForm.farmer,
          quantity: parseFloat(productForm.quantity),
          unit: productForm.unit,
          price_per_unit: parseFloat(productForm.pricePerUnit),
          harvest_date: productForm.harvestDate,
          location: productForm.location,
          quality: productForm.quality,
          description: productForm.description,
          status: 'available'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product added successfully',
      });

      // Refresh products list
      await fetchProducts();

      // Reset form
      setProductForm({
        name: '',
        category: '',
        farmer: '',
        quantity: '',
        unit: '',
        pricePerUnit: '',
        harvestDate: '',
        location: '',
        quality: '',
        description: ''
      });
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add product',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const product = products.find(p => p.id === orderForm.productId);
    if (!product) {
      toast({
        title: 'Error',
        description: 'Product not found',
        variant: 'destructive'
      });
      return;
    }

    // Validate quantity
    const orderQuantity = parseFloat(orderForm.quantity);
    if (orderQuantity > product.quantity) {
      toast({
        title: 'Error',
        description: `Only ${product.quantity} ${product.unit} available. Please reduce your order quantity.`,
        variant: 'destructive'
      });
      return;
    }

    // Persist pending order and show payment modal
    const pending = {
      productId: orderForm.productId,
      retailer: orderForm.retailer,
      quantity: orderQuantity,
      deliveryAddress: orderForm.deliveryAddress,
      notes: orderForm.notes
    };

    setPendingOrder(pending);
    localStorage.setItem('pendingSupplyOrder', JSON.stringify(pending));

    // Show demo payment modal
    setShowPaymentModal(true);
    return;


  };

  const handleSupplyChainPaymentSuccess = async (paymentData: any) => {
    try {
      setShowPaymentModal(false);
      setIsPaying(true);

      // Load pending order
      const pendingJson = localStorage.getItem('pendingSupplyOrder');
      if (!pendingJson) throw new Error('Pending order not found');
      const pending = JSON.parse(pendingJson);

      const product = products.find(p => p.id === pending.productId);
      if (!product) throw new Error('Product not found');

      // Get product owner's user_id
      const { data: productData, error: productFetchError } = await (supabase as any)
        .from('supply_chain_products')
        .select('user_id')
        .eq('id', pending.productId)
        .single();

      if (productFetchError) throw productFetchError;
      const productOwnerId = productData.user_id;

      // Create order with payment fields
      const { data: orderData, error: orderError } = await (supabase as any)
        .from('supply_chain_orders')
        .insert([{
          user_id: user.id,
          product_id: pending.productId,
          product_name: product.name,
          retailer: pending.retailer,
          quantity: pending.quantity,
          total_price: pending.quantity * product.pricePerUnit,
          order_date: new Date().toISOString().split('T')[0],
          status: 'confirmed',
          delivery_address: pending.deliveryAddress,
          notes: pending.notes,
          payment_method: paymentData.method,
          payment_method_details: paymentData.details,
          payment_transaction_id: paymentData.transactionId
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Update product quantity and status
      const newQuantity = product.quantity - pending.quantity;
      let newStatus: 'available' | 'ordered' | 'sold' = 'available';
      if (newQuantity <= 0) newStatus = 'sold';
      else if (newQuantity < product.quantity * 0.2) newStatus = 'ordered';

      const { error: updateError } = await (supabase as any)
        .from('supply_chain_products')
        .update({ quantity: newQuantity, status: newStatus })
        .eq('id', pending.productId);

      if (updateError) throw updateError;

      // Create shipment (use current user's ID to comply with RLS)
      const { error: shipmentError } = await (supabase as any)
        .from('supply_chain_shipments')
        .insert([{ 
          user_id: user.id, 
          order_id: orderData.id, 
          product_name: product.name, 
          retailer: pending.retailer, 
          quantity: pending.quantity, 
          status: 'preparing', 
          current_location: product.location, 
          estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        }]);

      if (shipmentError) throw shipmentError;

      // Notify owner
      await supabase.from('notifications' as any).insert([{ user_id: productOwnerId, title: '🛒 New Order Received!', message: `${pending.retailer} ordered ${pending.quantity} ${product.unit} of ${product.name} for ₹${(pending.quantity * product.pricePerUnit).toLocaleString()}.`, type: 'order_placed', related_type: 'order', related_id: orderData.id }]);

      toast({ title: 'Success!', description: `Order placed with payment via ${paymentData.method.toUpperCase()}` });

      await fetchOrders();
      await fetchProducts();
      await fetchShipments();

      setOrderForm({ productId: '', retailer: '', quantity: '', deliveryAddress: '', notes: '' });
      localStorage.removeItem('pendingSupplyOrder');

    } catch (error: any) {
      console.error('Supply chain payment error:', error);
      toast({ title: 'Payment Failed', description: error.message || 'Payment failed', variant: 'destructive' });
    } finally {
      setIsPaying(false);
    }
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Update shipment
      const { error: shipmentError } = await (supabase as any)
        .from('supply_chain_shipments')
        .update({
          status: shipmentUpdate.status,
          current_location: shipmentUpdate.currentLocation,
          tracking_notes: shipmentUpdate.trackingNotes
        })
        .eq('id', shipmentUpdate.shipmentId);

      if (shipmentError) throw shipmentError;

      // Find the shipment to get order ID
      const shipment = shipments.find(s => s.id === shipmentUpdate.shipmentId);
      if (shipment) {
        // Update corresponding order status
        const orderStatus = shipmentUpdate.status === 'delivered' ? 'delivered' : 'shipped';
        const { error: orderError } = await (supabase as any)
          .from('supply_chain_orders')
          .update({ status: orderStatus })
          .eq('id', shipment.orderId);

        if (orderError) throw orderError;
      }

      toast({
        title: 'Success',
        description: 'Shipment updated successfully',
      });

      // Refresh data
      await fetchShipments();
      await fetchOrders();

      // Reset form
      setShipmentUpdate({
        shipmentId: '',
        status: '',
        currentLocation: '',
        trackingNotes: ''
      });
    } catch (error: any) {
      console.error('Error updating shipment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update shipment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-primary/5 to-sky/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-sky rounded-xl flex items-center justify-center shadow-medium">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-poppins">
            {t('supplyChain.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('supplyChain.subtitle')}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('supplyChain.stat.availableProducts')}</p>
                  <p className="text-2xl font-bold text-foreground">{products.filter(p => p.status === 'available').length}</p>
                </div>
                <Leaf className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('supplyChain.stat.activeOrders')}</p>
                  <p className="text-2xl font-bold text-primary">{orders.filter(o => o.status !== 'delivered').length}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('supplyChain.stat.inTransit')}</p>
                  <p className="text-2xl font-bold text-warning">{shipments.filter(s => s.status === 'in_transit').length}</p>
                </div>
                <Truck className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('supplyChain.stat.delivered')}</p>
                  <p className="text-2xl font-bold text-success">{shipments.filter(s => s.status === 'delivered').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              {t('supplyChain.tab.products')}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              {t('supplyChain.tab.orders')}
            </TabsTrigger>
            <TabsTrigger value="shipments" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              {t('supplyChain.tab.shipments')}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('supplyChain.tab.analytics')}
            </TabsTrigger>
          </TabsList>

          {/* Products Tab - Farmer Interface */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Add Product Form */}
              <div className="lg:col-span-1">
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-success" />
                      Add New Product (Farmer)
                    </CardTitle>
                    <CardDescription>List your harvested crops for retailers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Organic Rice"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select value={productForm.category} onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Grains">Grains</SelectItem>
                              <SelectItem value="Vegetables">Vegetables</SelectItem>
                              <SelectItem value="Fruits">Fruits</SelectItem>
                              <SelectItem value="Pulses">Pulses</SelectItem>
                              <SelectItem value="Spices">Spices</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="quality">Quality</Label>
                          <Select value={productForm.quality} onValueChange={(value) => setProductForm(prev => ({ ...prev, quality: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Quality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Premium">Premium</SelectItem>
                              <SelectItem value="Grade A">Grade A</SelectItem>
                              <SelectItem value="Grade B">Grade B</SelectItem>
                              <SelectItem value="Organic">Organic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="farmer">Farmer Name</Label>
                        <Input
                          id="farmer"
                          value={productForm.farmer}
                          onChange={(e) => setProductForm(prev => ({ ...prev, farmer: e.target.value }))}
                          placeholder="Your name"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={productForm.quantity}
                            onChange={(e) => setProductForm(prev => ({ ...prev, quantity: e.target.value }))}
                            placeholder="100"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="unit">Unit</Label>
                          <Select value={productForm.unit} onValueChange={(value) => setProductForm(prev => ({ ...prev, unit: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">Kilograms</SelectItem>
                              <SelectItem value="quintals">Quintals</SelectItem>
                              <SelectItem value="tons">Tons</SelectItem>
                              <SelectItem value="pieces">Pieces</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pricePerUnit">Price per {productForm.unit || 'Unit'} (₹)</Label>
                        <Input
                          id="pricePerUnit"
                          type="number"
                          value={productForm.pricePerUnit}
                          onChange={(e) => setProductForm(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                          placeholder="2500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="harvestDate">Harvest Date</Label>
                          <Input
                            id="harvestDate"
                            type="date"
                            value={productForm.harvestDate}
                            onChange={(e) => setProductForm(prev => ({ ...prev, harvestDate: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={productForm.location}
                            onChange={(e) => setProductForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="City, State"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your product quality, special features..."
                          rows={3}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Products List */}
              <div className="lg:col-span-2">
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle>Available Products</CardTitle>
                    <CardDescription>Products listed by farmers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No products listed yet</p>
                        </div>
                      ) : (
                        products.map((product) => (
                          <div key={product.id} className="border rounded-lg p-4 hover:shadow-soft transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">By {product.farmer}</p>
                              </div>
                              <Badge 
                                variant={
                                  product.status === 'available' ? 'default' : 
                                  product.status === 'ordered' ? 'secondary' : 
                                  'destructive'
                                }
                                className="flex items-center gap-1"
                              >
                                {product.status === 'sold' && '🔴'}
                                {product.status === 'ordered' && '🟡'}
                                {product.status === 'available' && '🟢'}
                                {product.status === 'sold' ? 'FULLY BOOKED' : 
                                 product.status === 'ordered' ? 'LOW STOCK' : 
                                 'AVAILABLE'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground">Category:</span>
                                <p className="font-medium">{product.category}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Quantity:</span>
                                <p className="font-medium">
                                  {product.quantity} {product.unit}
                                  {product.quantity === 0 && ' (Out of Stock)'}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <p className="font-medium">₹{product.pricePerUnit}/{product.unit}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Quality:</span>
                                <p className="font-medium">{product.quality}</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-1" />
                                {product.location}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 mr-1" />
                                Harvested: {product.harvestDate}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab - Retailer Interface */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Place Order Form */}
              <div className="lg:col-span-1">
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-primary" />
                      Place Order (Retailer)
                    </CardTitle>
                    <CardDescription>Order products from farmers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="productSelect">Select Product</Label>
                        <Select value={orderForm.productId} onValueChange={(value) => setOrderForm(prev => ({ ...prev, productId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose product">
                              {orderForm.productId && products.find(p => p.id === orderForm.productId) && (
                                <span>
                                  {products.find(p => p.id === orderForm.productId)?.name} - 
                                  ₹{products.find(p => p.id === orderForm.productId)?.pricePerUnit}/{products.find(p => p.id === orderForm.productId)?.unit}
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {products.filter(p => p.status === 'available').map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ₹{product.pricePerUnit}/{product.unit} (by {product.farmer}) - {product.quantity} {product.unit} available
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="retailer">Retailer Name</Label>
                        <Input
                          id="retailer"
                          value={orderForm.retailer}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, retailer: e.target.value }))}
                          placeholder="Your business name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orderQuantity">Quantity</Label>
                        <Input
                          id="orderQuantity"
                          type="number"
                          value={orderForm.quantity}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder="10"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryAddress">Delivery Address</Label>
                        <Textarea
                          id="deliveryAddress"
                          value={orderForm.deliveryAddress}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                          placeholder="Complete delivery address"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orderNotes">Special Instructions</Label>
                        <Textarea
                          id="orderNotes"
                          value={orderForm.notes}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any special requirements..."
                          rows={2}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Place Order
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Orders List */}
              <div className="lg:col-span-2">
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>Track all placed orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:shadow-soft transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{order.id}</h3>
                              <p className="text-sm text-muted-foreground">{order.productName}</p>
                            </div>
                            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                            <div>
                              <span className="text-muted-foreground">Retailer:</span>
                              <p className="font-medium">{order.retailer}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>
                              <p className="font-medium">{order.quantity}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total:</span>
                              <p className="font-medium">₹{order.totalPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Order Date:</span>
                              <p className="font-medium">{order.orderDate}</p>
                            </div>
                          </div>
                          
                          {order.payment_method && (
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <span className="text-muted-foreground">Payment:</span>
                              <Badge variant="outline" className="capitalize">
                                {order.payment_method}
                              </Badge>
                              {order.payment_transaction_id && (
                                <span className="text-muted-foreground text-xs">ID: {order.payment_transaction_id}</span>
                              )}
                            </div>
                          )}
                          
                          {order.payment_method && (
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <span className="text-muted-foreground">Payment:</span>
                              <Badge variant="outline" className="capitalize">
                                {order.payment_method}
                              </Badge>
                              {order.payment_transaction_id && (
                                <span className="text-muted-foreground text-xs">ID: {order.payment_transaction_id}</span>
                              )}
                            </div>
                          )}
                          
                          {order.notes && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Notes:</span>
                              <p className="mt-1">{order.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Shipments Tab - Distributor Interface */}
          <TabsContent value="shipments" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Update Shipment Form */}
              <div className="lg:col-span-1">
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-warning" />
                      Update Shipment (Distributor)
                    </CardTitle>
                    <CardDescription>Update shipment status and location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateShipment} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="shipmentSelect">Select Shipment</Label>
                        <Select value={shipmentUpdate.shipmentId} onValueChange={(value) => setShipmentUpdate(prev => ({ ...prev, shipmentId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose shipment">
                              {shipmentUpdate.shipmentId && shipments.find(s => s.id === shipmentUpdate.shipmentId) && (
                                <span>
                                  {shipments.find(s => s.id === shipmentUpdate.shipmentId)?.productName} to {shipments.find(s => s.id === shipmentUpdate.shipmentId)?.retailer}
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {shipments.map((shipment) => (
                              <SelectItem key={shipment.id} value={shipment.id}>
                                {shipment.productName} to {shipment.retailer} - {shipment.quantity} units ({shipment.status})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shipmentStatus">Update Status</Label>
                        <Select value={shipmentUpdate.status} onValueChange={(value) => setShipmentUpdate(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="New status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currentLocation">Current Location</Label>
                        <Input
                          id="currentLocation"
                          value={shipmentUpdate.currentLocation}
                          onChange={(e) => setShipmentUpdate(prev => ({ ...prev, currentLocation: e.target.value }))}
                          placeholder="e.g., Highway NH-75, near Tumkur"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trackingNotes">Tracking Notes</Label>
                        <Textarea
                          id="trackingNotes"
                          value={shipmentUpdate.trackingNotes}
                          onChange={(e) => setShipmentUpdate(prev => ({ ...prev, trackingNotes: e.target.value }))}
                          placeholder="Current status update..."
                          rows={3}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        <Truck className="w-4 h-4 mr-2" />
                        Update Shipment
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Shipments List */}
              <div className="lg:col-span-2">
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle>Active Shipments</CardTitle>
                    <CardDescription>Track delivery status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {shipments.map((shipment) => (
                        <div key={shipment.id} className="border rounded-lg p-4 hover:shadow-soft transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{shipment.id}</h3>
                              <p className="text-sm text-muted-foreground">{shipment.productName}</p>
                            </div>
                            <Badge variant={shipment.status === 'delivered' ? 'default' : 'secondary'}>
                              {shipment.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                              <span className="text-muted-foreground">Retailer:</span>
                              <p className="font-medium">{shipment.retailer}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Quantity:</span>
                              <p className="font-medium">{shipment.quantity}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current Location:</span>
                              <p className="font-medium">{shipment.currentLocation}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expected Delivery:</span>
                              <p className="font-medium">{shipment.estimatedDelivery}</p>
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <span className="text-muted-foreground">Latest Update:</span>
                            <p className="mt-1">{shipment.trackingNotes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {orders.filter(o => o.status === 'delivered').length} delivered
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-purple-600" />
                    Avg Order Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{Math.round(analytics.avgOrderValue).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per transaction
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.satisfactionScore}/5</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer rating
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Supply Chain Overview */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Supply Chain Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Products Listed</span>
                      <span className="font-bold">{products.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Available Products</span>
                      <span className="font-bold text-green-600">
                        {products.filter(p => p.status === 'available').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Shipments</span>
                      <span className="font-bold text-blue-600">
                        {shipments.filter(s => s.status !== 'delivered').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery Success Rate</span>
                      <span className="font-bold text-green-600">
                        {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Farmers</span>
                      <span className="font-bold">{new Set(products.map(p => p.farmer)).size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Buyers</span>
                      <span className="font-bold">{new Set(orders.map(o => o.retailer)).size}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Crops */}
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top Performing Crops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topCrops.length > 0 ? (
                      analytics.topCrops.map((crop, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{crop.name}</span>
                            <span className="text-sm text-muted-foreground">{crop.orders} orders</span>
                          </div>
                          <Progress value={(crop.orders / analytics.totalOrders) * 100} className="h-2" />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Leaf className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No order data available yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Price Forecasting */}
              <Card className="shadow-medium lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Price Forecasting (AI-Powered)
                  </CardTitle>
                  <CardDescription>
                    Predictive analytics for upcoming market trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {priceForecasts.map((forecast, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{forecast.crop}</h4>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {forecast.confidence}%
                            </p>
                          </div>
                          <Badge 
                            variant={forecast.trend === 'up' ? 'default' : forecast.trend === 'down' ? 'destructive' : 'secondary'}
                            className="flex items-center gap-1"
                          >
                            {forecast.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                             forecast.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : 
                             <Activity className="w-3 h-3" />}
                            {forecast.trend}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-muted-foreground">Current Price</span>
                            <p className="text-lg font-bold">₹{forecast.currentPrice}/quintal</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Predicted Price</span>
                            <p className="text-lg font-bold text-primary">₹{forecast.predictedPrice}/quintal</p>
                          </div>
                        </div>

                        <div>
                          <span className="text-sm font-medium">Key Factors:</span>
                          <ul className="mt-2 space-y-1">
                            {forecast.factors.map((factor, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingOrder(null);
          setIsPaying(false);
        }}
        onSuccess={handleSupplyChainPaymentSuccess}
        amount={pendingOrder ? (pendingOrder.quantity * (products.find(p => p.id === pendingOrder.productId)?.pricePerUnit || 0)) : 0}
      />
    </div>
  );
};

export default SupplyChain;