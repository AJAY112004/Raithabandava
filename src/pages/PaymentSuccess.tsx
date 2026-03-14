import { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [orderId, setOrderId] = useState<string | null>(query.get('orderId'));
  const stripeSessionId = query.get('session_id');
  const isLocal = query.get('local') === 'true'; // COD fallback flow
  const method = query.get('method') || undefined; // 'cod' when COD
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const verifyStripeSession = async () => {
    if (!stripeSessionId) return;
    setVerifying(true);
    setStatus('pending');
    try {
      const { data, error } = await (supabase as any).functions.invoke('stripe-session', { body: { sessionId: stripeSessionId } });
      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Unable to fetch session');
      }
      if (data.payment_status === 'paid') {
        setStatus('success');
      } else if (data.payment_status === 'unpaid') {
        setStatus('failed');
        setErrorMessage('Payment not completed');
      } else {
        setStatus('pending');
      }
    } catch (e: any) {
      console.error('Stripe session verify error', e);
      setStatus('failed');
      setErrorMessage(e.message);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    // Stripe success flow
    if (stripeSessionId) {
      verifyStripeSession();
      return;
    }
    // Mock payment success simulation (all payment methods)
    if (isLocal) {
      setStatus('pending');
      setVerifying(true);
      const timer = setTimeout(() => {
        const storedOrderId = sessionStorage.getItem('lastOrderId');
        if (storedOrderId) {
          setOrderId(storedOrderId);
          sessionStorage.removeItem('lastOrderId');
        }
        setStatus('success');
        setVerifying(false);
      }, 3000); // 3 second confirmation for all mock payments
      return () => clearTimeout(timer);
    }
  }, [stripeSessionId, isLocal, method]);

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-earth/10 to-primary/5">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="shadow-medium">
          <CardHeader className="text-center">
            {status === 'pending' && (
              <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 rounded-full bg-success/20 mx-auto flex items-center justify-center mb-3">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
            )}
            {status === 'failed' && (
              <div className="w-16 h-16 rounded-full bg-destructive/20 mx-auto flex items-center justify-center mb-3">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
            )}
            <CardTitle>
              {status === 'pending' && 'Processing Payment'}
              {status === 'success' && 'Payment Successful'}
              {status === 'failed' && 'Payment Failed'}
            </CardTitle>
            <CardDescription>
              {status === 'pending' && 'Please wait while we confirm your payment...'}
              {status === 'success' && (
                method === 'cod' ? 'COD order placed. Pay on delivery.' :
                method === 'upi' ? 'UPI payment confirmed successfully.' :
                method === 'card' ? 'Card payment successful.' :
                method === 'netbanking' ? 'Net banking payment confirmed.' :
                method === 'wallet' ? 'Wallet payment successful.' :
                method === 'qrcode' ? 'QR payment confirmed successfully.' :
                'Your order has been placed successfully.'
              )}
              {status === 'failed' && (errorMessage || 'Payment could not be verified.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            {orderId && <p className="text-sm font-semibold">Order ID: {orderId}</p>}
            {status === 'success' && (
              <p className="text-sm text-muted-foreground">We'll notify you when the seller confirms shipping.</p>
            )}
            {status === 'pending' && verifying && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming payment and placing your order...</span>
              </div>
            )}
            {status === 'failed' && (
              <div className="space-y-3">
                <p className="text-sm text-destructive">{errorMessage}</p>
                <Link to="/marketplace">
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Back to Marketplace
                  </Button>
                </Link>
              </div>
            )}
            <div className="pt-4 flex gap-2 justify-center">
              <Link to="/marketplace">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
              {status === 'success' && orderId && (
                <Link to="/marketplace#orders">
                  <Button variant="hero">View Orders</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
