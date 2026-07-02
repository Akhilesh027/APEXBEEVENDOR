const API_URL = import.meta.env.VITE_API_URL || 'https://server.apexbee.in/api';

type AgentType = 'Platform' | 'Vendor' | 'Independent';

const getToken = () => localStorage.getItem('token');

const request = async (url: string, options: RequestInit = {}) => {
  const token = getToken();

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || 'Order API request failed');
  }

  return data;
};

const mapTimelineForBackend = (timeline: any[] = []) =>
  timeline.map((t) => ({
    status: t.status === 'New' ? 'Placed' : t.status,
    date: t.timestamp || t.date,
    note: t.description || t.note,
  }));

const updateOrderStatus = async (
  order: any,
  payload: any,
  timelineStep?: { status: string; note: string }
) => {
  const dbId = order._id || order.id;

  const timeline = timelineStep
    ? [
      ...mapTimelineForBackend(order.timeline),
      {
        status: timelineStep.status,
        date: new Date().toISOString(),
        note: timelineStep.note,
      },
    ]
    : undefined;

  return request(`/orders/${dbId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...payload,
      ...(timeline ? { timeline } : {}),
    }),
  });
};

export const orderService = {
  getOrders: () => request('/orders'),

  getOrderById: (orderId: string) => request(`/orders/${orderId}`),

  acceptOrder: (order: any) =>
    updateOrderStatus(
      order,
      { orderStatus: 'Confirmed' },
      {
        status: 'Confirmed',
        note: 'Order confirmed by vendor and is in processing.',
      }
    ),

  packOrder: (order: any) =>
    updateOrderStatus(
      order,
      { orderStatus: 'Packed' },
      {
        status: 'Packed',
        note: 'Items packed securely and ready for pickup.',
      }
    ),

  assignDelivery: (
    order: any,
    agentId: string,
    agentType: AgentType,
    agentName?: string
  ) =>
    updateOrderStatus(
      order,
      {
        orderStatus: 'Shipped',
        deliveryAgentId: agentId,
        deliveryType: agentType,
      },
      {
        status: 'Shipped',
        note: `Delivery agent ${agentName || agentId} (${agentType}) assigned. Package ready for pickup.`,
      }
    ),

  shipOrder: (order: any) =>
    updateOrderStatus(
      order,
      { orderStatus: 'Shipped' },
      {
        status: 'Shipped',
        note: 'Package handed over to shipping courier.',
      }
    ),

  deliverOrder: (order: any) =>
    updateOrderStatus(
      order,
      {
        orderStatus: 'Delivered',
        paymentStatus: 'Paid',
      },
      {
        status: 'Delivered',
        note: 'Package delivered. Cash/UPI settled.',
      }
    ),

  approveReturn: (order: any) => {
    const timeline = [
      ...mapTimelineForBackend(order.timeline),
      {
        status: 'Returned',
        date: new Date().toISOString(),
        note: 'Return request approved by vendor.',
      },
      {
        status: 'Refunded',
        date: new Date().toISOString(),
        note: 'Refund processed successfully.',
      },
    ];

    return request(`/orders/${order._id || order.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        orderStatus: 'Returned',
        paymentStatus: 'Refunded',
        refundStatus: 'Approved',
        timeline,
      }),
    });
  },

  rejectReturn: (order: any) =>
    updateOrderStatus(order, {
      refundStatus: 'Rejected',
    }),

  cancelOrder: (order: any, note?: string) => {
    const orderObj = typeof order === 'string' ? { id: order } : order;
    return updateOrderStatus(
      orderObj,
      { orderStatus: 'Cancelled' },
      {
        status: 'Cancelled',
        note: note || 'Order cancelled.',
      }
    );
  },

  returnOrder: (order: any, note?: string) => {
    const orderObj = typeof order === 'string' ? { id: order } : order;
    return updateOrderStatus(
      orderObj,
      { orderStatus: 'Returned' },
      {
        status: 'Returned',
        note: note || 'Order returned.',
      }
    );
  },
};

export default orderService;