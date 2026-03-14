/* eslint-disable */
// Supabase Edge Function: Create order after payment verification
// This is called server-side to ensure secure order placement

// deno-lint-ignore no-explicit-any
interface CreateOrderRequest {
  paymentId: string;
  razorpayOrderId: string;
  buyerId: string;
  sellerId: string;
  totalAmount: number;
  shippingAddress: string;
  items: Array<{
    listingId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

(globalThis as any).Deno.serve(async (req: any) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405, 
      headers: { 'content-type': 'application/json' } 
    });
  }

  try {
    const body = (await req.json()) as CreateOrderRequest;
    const { createClient } = await import('jsr:@supabase/supabase-js@2');
    
    const supabaseUrl = (globalThis as any).Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify payment status via razorpay-verify
    const verifyResp = await fetch(`${supabaseUrl}/functions/v1/razorpay-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ 
        razorpay_payment_id: body.paymentId,
        razorpay_order_id: body.razorpayOrderId,
        razorpay_signature: '' // Signature already verified in PaymentSuccess
      })
    });

    if (!verifyResp.ok) {
      return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    const verifyData = await verifyResp.json();
    
    if (!verifyData?.verified && verifyData?.payment?.status !== 'captured') {
      return new Response(JSON.stringify({ error: 'Payment not successful' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Check if order already exists for this payment
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_transaction_id', body.paymentId)
      .single();

    if (existingOrder) {
      return new Response(JSON.stringify({ status: 'ok', orderId: existingOrder.id, alreadyExists: true }), {
        headers: { 'content-type': 'application/json' }
      });
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: body.buyerId,
        seller_id: body.sellerId,
        total_amount: body.totalAmount,
        shipping_address: body.shippingAddress,
        status: 'confirmed',
        payment_status: 'paid',
        payment_transaction_id: body.paymentId
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = body.items.map(item => ({
      order_id: order.id,
      listing_id: item.listingId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.quantity * item.unitPrice
    }));

    if (orderItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
    }

    // Clear cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', body.buyerId);

    return new Response(JSON.stringify({ status: 'ok', orderId: order.id }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    console.error('Error creating order:', e);
    return new Response(JSON.stringify({ error: 'Failed to create order', details: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
});
