import type { Order } from '../types';

export function mapVendorOrder(order: any): Order {
  const timeline = (order.timeline || []).map((t: any) => ({
    status: t.status === 'Placed' ? 'New' : t.status as any,
    timestamp: t.date || new Date().toISOString(),
    description: t.note || ''
  }));

  const subtotal = Number(order.orderSummary?.subtotal ?? order.subtotal ?? order.totalAmount ?? 0);
  const discount = Number(order.orderSummary?.discount ?? order.discount ?? 0);
  const shippingCharge = Number(order.orderSummary?.shipping ?? order.orderSummary?.shippingFee ?? order.orderSummary?.deliveryFee ?? order.shippingCharge ?? order.shippingFee ?? 0);
  const packingCharge = Number(order.orderSummary?.packing ?? order.orderSummary?.packageCharge ?? order.packingCharge ?? 0);
  const totalAmount = Number(order.orderSummary?.grandTotal ?? order.orderSummary?.total ?? order.totalAmount ?? 0);

  const paymentMethod = order.paymentDetails?.method === 'upi' ? 'UPI' :
    order.paymentDetails?.method === 'cod' ? 'COD' :
      order.paymentDetails?.method === 'wallet' ? 'Card' : (order.paymentMethod || 'COD');

  const paymentStatus =
    order.paymentStatus === 'Paid' ||
      order.paymentStatus === 'Payment Verified' ||
      order.paymentDetails?.status === 'completed' ||
      order.isPaid === true ||
      order.orderStatus === 'Delivered' ||
      order.deliveryStatus === 'Delivered'
      ? 'Paid'
      : order.paymentStatus === 'Refunded'
        ? 'Refunded'
        : 'Pending';

  let deliveryStatus: any = 'New';
  if (order.orderStatus === 'Placed' || order.orderStatus === 'placed' || order.orderStatus === 'pending_payment') deliveryStatus = 'New';
  else if (['Accepted', 'Assigned', 'assigned'].includes(order.orderStatus)) deliveryStatus = 'Accepted';
  else if (['Reached Vendor', 'Pickup OTP Verified'].includes(order.orderStatus)) deliveryStatus = 'Reached Vendor';
  else if (['Picked Up', 'Shipped', 'Out for Delivery'].includes(order.orderStatus)) deliveryStatus = 'Shipped';
  else if (['Reached Customer', 'Delivery OTP Verified'].includes(order.orderStatus)) deliveryStatus = 'Reached Customer';
  else if (['Confirmed', 'confirmed', 'preparing', 'Preparing', 'Processing', 'processing'].includes(order.orderStatus)) deliveryStatus = 'Processing';
  else if (['Packed', 'packed'].includes(order.orderStatus)) deliveryStatus = 'Packed';
  else if (['Delivered', 'delivered'].includes(order.orderStatus)) deliveryStatus = 'Delivered';
  else if (['Returned', 'returned'].includes(order.orderStatus)) deliveryStatus = 'Returned';
  else if (order.orderStatus === 'Payment Verified') deliveryStatus = 'Processing';
  else deliveryStatus = order.orderStatus || 'New';

  const items = (order.orderItems || order.items || []).map((it: any) => ({
    productId: it.productId?._id || it.productId,
    productName: it.name || it.productName || 'Product',
    sku: it.sku || '',
    quantity: it.quantity || 1,
    price: Number(it.price || 0),
    originalPrice: Number(it.originalPrice || it.mrp || it.price || 0),
    image: it.image || '/placeholder.png',
    variantAttributes: it.variantAttributes || it.selectedAttributes || it.attributes || null,
    brand: it.brand || ''
  }));

  const orderSummary = order.orderSummary ? {
    ...order.orderSummary,
    subtotal: Number(order.orderSummary.subtotal ?? subtotal),
    mrp: Number(order.orderSummary.mrp ?? order.orderSummary.totalMrp ?? 0),
    discount: Number(order.orderSummary.discount ?? order.orderSummary.mrpDiscount ?? discount),
    cgst: order.orderSummary.cgst != null ? Number(order.orderSummary.cgst) : undefined,
    sgst: order.orderSummary.sgst != null ? Number(order.orderSummary.sgst) : undefined,
    tax: order.orderSummary.tax != null ? Number(order.orderSummary.tax) : undefined,
    shipping: Number(order.orderSummary.shipping ?? shippingCharge),
    packing: Number(order.orderSummary.packing ?? packingCharge),
    platformFee: Number(order.orderSummary.platformFee ?? 0),
    couponDiscount: Number(order.orderSummary.couponDiscount ?? 0),
    grandTotal: Number(order.orderSummary.grandTotal ?? order.orderSummary.total ?? totalAmount)
  } : {
    subtotal,
    mrp: items.reduce((sum: number, it: any) => sum + (it.originalPrice * it.quantity), 0) || subtotal,
    discount,
    shipping: shippingCharge,
    packing: packingCharge,
    grandTotal: totalAmount
  };

  return {
    ...order,
    id: order.orderNumber || order._id,
    _id: order._id,
    orderNumber: order.orderNumber || order.id || order._id,
    estimatedDeliveryTime: order.estimatedDeliveryTime || undefined,
    estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
    customerName: order.shippingAddress?.name || order.customerId?.name || 'Customer',
    customerPhone: order.shippingAddress?.phone || order.customerId?.phone || '',
    deliveryAddress: order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}` : 'No address',
    items,
    subtotal,
    shippingCharge,
    packingCharge,
    discount,
    totalAmount,
    paymentMethod,
    paymentStatus,
    deliveryStatus,
    orderDate: order.createdAt || new Date().toISOString(),
    timeline,
    assignedDeliveryAgent: order.assignedDeliveryAgent || order.deliveryAgentName || '',
    assignedDeliveryAgentType: order.assignedDeliveryAgentType || 'Platform',
    assignedDeliveryAgentPhone: order.assignedDeliveryAgentPhone || order.deliveryAgentPhone || '',
    returnReason: order.returnReason || '',
    customerNotes: order.customerNotes || '',
    refundStatus: order.refundStatus || 'None',
    isScheduledSubscription: Boolean(order.isScheduledSubscription || order.isSubscription),
    scheduleDetails: order.scheduleDetails || null,
    fulfillment: order.fulfillment || null,
    isSelfPickup: Boolean(order.isSelfPickup || order.fulfillment?.type === 'pickup' || order.deliveryType === 'pickup'),
    deliveryType: order.deliveryType || order.fulfillment?.type || (order.isSelfDelivery ? 'self_delivery' : 'home_delivery'),
    deliveryMode: order.deliveryMode || order.fulfillment?.deliveryMode || 'standard',
    pickupVerification: order.pickupVerification || null,
    deliveryDetails: order.deliveryDetails || null,
    deliverySlot: order.deliverySlot || order.preOrderTimeSlot || undefined,
    preOrderTimeSlot: order.preOrderTimeSlot || undefined,
    slotExtended: Boolean(order.slotExtended),
    slotExtendedUntil: order.slotExtendedUntil || undefined,
    slotExtensionReason: order.slotExtensionReason || undefined,
    slotMissed: Boolean(order.slotMissed),
    orderSummary,
    couponCode: order.couponCode || order.coupon?.code || orderSummary?.couponCode || '',
    couponDiscount: Number(order.couponDiscount || order.coupon?.discount || orderSummary?.couponDiscount || 0),
    commissionAmount: order.vendorCommissionAmount ?? order.commissionAmount
  };
}
