import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  CheckCircle,
  Loader2,
  Lock,
  QrCode
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (paymentData: {
    method: string;
    transactionId: string;
    details: any;
  }) => void;
}

const PaymentGatewayModal = ({ isOpen, onClose, amount, onSuccess }: PaymentGatewayModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod' | 'qrcode'>('upi');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form states
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  // QR (UPI) states
  const [upiQrId, setUpiQrId] = useState('demo@upi');
  const [upiQrName, setUpiQrName] = useState('Demo Store');
  const [upiQrNote, setUpiQrNote] = useState('Order Payment');

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiQrId)}&pn=${encodeURIComponent(upiQrName)}&am=${encodeURIComponent(amount.toFixed(2))}&cu=INR&tn=${encodeURIComponent(upiQrNote)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

  const handlePayment = async () => {
    setProcessing(true);

    // Validation (skip for COD mock)
    if (selectedMethod !== 'cod' && selectedMethod !== 'qrcode') {
      if (selectedMethod === 'upi' && !upiId) {
        toast({ title: 'Invalid UPI ID', description: 'Please enter a valid UPI ID', variant: 'destructive' });
        setProcessing(false);
        return;
      }
      if (selectedMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
        toast({ title: 'Incomplete card details', description: 'Please fill all card information', variant: 'destructive' });
        setProcessing(false);
        return;
      }
      if (selectedMethod === 'netbanking' && !selectedBank) {
        toast({ title: 'Select bank', description: 'Please select your bank', variant: 'destructive' });
        setProcessing(false);
        return;
      }
      if (selectedMethod === 'wallet' && !selectedWallet) {
        toast({ title: 'Select wallet', description: 'Please select a wallet', variant: 'destructive' });
        setProcessing(false);
        return;
      }
    }

    // Simulate payment / order placement
    if (selectedMethod === 'cod') {
      toast({ 
        title: '🧾 COD Order Placing', 
        description: `Creating order (Cash on Delivery) for ₹${amount.toFixed(2)}...`,
        duration: 2000
      });
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else if (selectedMethod === 'qrcode') {
      toast({
        title: '📷 Awaiting QR Payment',
        description: 'Scan the QR with any UPI app, then confirm.',
        duration: 2000
      });
      await new Promise(resolve => setTimeout(resolve, 2500));
    } else {
      toast({ 
        title: '💳 Processing Payment', 
        description: `Processing ₹${amount.toFixed(2)} via ${selectedMethod.toUpperCase()}...`,
        duration: 2000
      });
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    // Show success animation
    setShowSuccess(true);
    
    // Prepare payment data
    const paymentData = {
      method: selectedMethod,
      transactionId: selectedMethod === 'cod'
        ? `COD-PENDING-${Date.now()}`
        : `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      details: selectedMethod === 'upi' ? { upiId } :
               selectedMethod === 'card' ? { last4: cardNumber.slice(-4), cardType: 'Debit Card' } :
               selectedMethod === 'netbanking' ? { bank: selectedBank } :
               selectedMethod === 'wallet' ? { wallet: selectedWallet } :
               selectedMethod === 'qrcode' ? { upiId: upiQrId, payee: upiQrName, note: upiQrNote, upiUri } :
               { payment_due: 'Cash on delivery', status: 'pending' }
    };

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProcessing(false);
    onSuccess(paymentData);
  };

  const banks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 
    'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank'
  ];

  const wallets = [
    'PhonePe', 'Google Pay', 'Paytm', 'Amazon Pay', 'MobiKwik', 'Freecharge'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="payment-gateway-description">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                Secure Payment Gateway
              </DialogTitle>
              <DialogDescription id="payment-gateway-description">
                Choose your preferred payment method to complete your order
              </DialogDescription>
              <p className="text-2xl font-bold text-primary mt-2">₹{amount.toFixed(2)}</p>
            </DialogHeader>

            {/* ALL PAYMENT METHODS IN MOCK MODE - No real payment gateway required */}
            <Tabs value={selectedMethod} onValueChange={(v: any) => setSelectedMethod(v)} className="w-full">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="upi" className="gap-2">
                  <Smartphone className="w-4 h-4" />
                  UPI
                </TabsTrigger>
                <TabsTrigger value="card" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="netbanking" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Net Banking
                </TabsTrigger>
                <TabsTrigger value="wallet" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet
                </TabsTrigger>
                <TabsTrigger value="qrcode" className="gap-2">
                  <QrCode className="w-4 h-4" />
                  UPI QR
                </TabsTrigger>
                <TabsTrigger value="cod" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  COD
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upi" className="space-y-4 mt-4">
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">Pay using your UPI ID</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input
                    id="upi"
                    placeholder="username@bank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: 9876543210@paytm, username@oksbi
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setUpiId('test@paytm')}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Paytm_logo.png" alt="Paytm" className="h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setUpiId('test@ybl')}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.png" alt="PhonePe" className="h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setUpiId('test@oksbi')}>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpC8RCN_pJlF0aKqLEP58vC_Vb7vCBqJqX1g&s" alt="SBI" className="h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="card" className="space-y-4 mt-4">
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">Card Payment</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                      <Input
                        id="expiry"
                        placeholder="12/25"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 2) setCardExpiry(val);
                          else setCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setCardNumber('4111 1111 1111 1111');
                      setCardName('Test User');
                      setCardExpiry('12/25');
                      setCardCvv('123');
                    }}
                  >
                    Use Test Card
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="netbanking" className="space-y-4 mt-4">
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">Select your bank</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {banks.map((bank) => (
                    <Card
                      key={bank}
                      className={`cursor-pointer transition-all ${
                        selectedBank === bank ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent'
                      }`}
                      onClick={() => setSelectedBank(bank)}
                    >
                      <CardContent className="p-3 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                          {selectedBank === bank && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="text-sm">{bank}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="wallet" className="space-y-4 mt-4">
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">Select your wallet</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {wallets.map((wallet) => (
                    <Card
                      key={wallet}
                      className={`cursor-pointer transition-all ${
                        selectedWallet === wallet ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent'
                      }`}
                      onClick={() => setSelectedWallet(wallet)}
                    >
                      <CardContent className="p-4 text-center">
                        <Wallet className={`w-8 h-8 mx-auto mb-2 ${selectedWallet === wallet ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{wallet}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="qrcode" className="space-y-4 mt-4">
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">Scan with any UPI app and confirm payment</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="upiQrId">Payee UPI ID</Label>
                    <Input id="upiQrId" value={upiQrId} onChange={(e) => setUpiQrId(e.target.value.trim())} />
                    <Label htmlFor="upiQrName">Payee Name</Label>
                    <Input id="upiQrName" value={upiQrName} onChange={(e) => setUpiQrName(e.target.value)} />
                    <Label htmlFor="upiQrNote">Note</Label>
                    <Input id="upiQrNote" value={upiQrNote} onChange={(e) => setUpiQrNote(e.target.value)} />
                    <div className="text-xs text-muted-foreground">Amount: ₹{amount.toFixed(2)} · Currency: INR</div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <img src={qrUrl} alt="UPI QR Code" className="border rounded p-2 bg-white" />
                    <Button type="button" variant="outline" size="sm" onClick={() => { }}>
                      Refresh QR
                    </Button>
                    <div className="text-[11px] text-muted-foreground break-all max-w-[260px]">
                      {upiUri}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cod" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Cash on Delivery (COD) - Pay when the product is delivered.</p>
                  <ul className="text-xs list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>No online payment required now.</li>
                    <li>Order will be marked as <strong>Pending Payment</strong>.</li>
                    <li>Seller will dispatch after confirmation.</li>
                    <li>Pay cash to delivery agent.</li>
                  </ul>
                  <div className="p-3 rounded-md bg-amber-50 border text-xs text-amber-800">
                    This is a mock COD flow for testing. Integrate logistics API later for real-world confirmation.
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <Lock className="w-4 h-4" />
              Your payment information is encrypted and secure
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1" disabled={processing}>
                Cancel
              </Button>
              <Button onClick={handlePayment} className="flex-1" disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {selectedMethod === 'cod' ? 'Placing COD Order...' : selectedMethod === 'qrcode' ? 'Confirming QR Payment...' : 'Processing...'}
                  </>
                ) : (
                  selectedMethod === 'cod' ? `Confirm COD Order (₹${amount.toFixed(2)})` : selectedMethod === 'qrcode' ? `I've Paid via QR` : `Pay ₹${amount.toFixed(2)}`
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            {selectedMethod === 'cod' ? (
              <>
                <h3 className="text-2xl font-bold text-green-600">COD Order Placed!</h3>
                <p className="text-muted-foreground">Your order is pending cash payment on delivery.</p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-green-600">Payment Successful!</h3>
                <p className="text-muted-foreground">Processing your order...</p>
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentGatewayModal;
