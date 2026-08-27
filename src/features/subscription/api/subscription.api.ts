const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'https://server.apexbee.in/api';
};

const getHeaders = () => {
  const token = localStorage.getItem('vendor_token') || localStorage.getItem('token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const safeFetch = async (url: string, options: RequestInit = {}) => {
  try {
    const res = await fetch(url, { ...options, headers: { ...getHeaders(), ...(options.headers || {}) } });
    if (!res.ok) {
      return { success: false, status: res.status, message: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`[subscriptionApi] Network or server unavailable for ${url}:`, err.message);
    return { success: false, message: err.message };
  }
};

export const subscriptionApi = {
  getSummary: async () => {
    return safeFetch(`${getApiBaseUrl()}/vendor/subscriptions/summary`);
  },

  getEntitlements: async () => {
    return safeFetch(`${getApiBaseUrl()}/vendor/subscriptions/entitlements`);
  },

  getAvailablePlans: async () => {
    return safeFetch(`${getApiBaseUrl()}/vendor/subscription-products/plans`);
  },

  getAvailableAddons: async () => {
    return safeFetch(`${getApiBaseUrl()}/vendor/subscription-products/addons`);
  },

  createQuote: async (data: {
    productId: string;
    priceId?: string;
    billingCycle?: string;
    quantity?: number;
    couponCode?: string;
    applyWalletCredits?: boolean;
  }) => {
    return safeFetch(`${getApiBaseUrl()}/vendor/subscription-quotes`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  createOrder: async (quoteId: string) => {
    return safeFetch(`${getApiBaseUrl()}/vendor/subscription-orders`, {
      method: 'POST',
      body: JSON.stringify({ quoteId })
    });
  },

  processPayment: async (data: { orderId: string; paymentMethod: string; sandboxSuccess?: boolean; productId?: string; priceId?: string }) => {
    return safeFetch(`${getApiBaseUrl()}/vendor/subscription-payments/create`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getInvoices: async () => {
    return safeFetch(`${getApiBaseUrl()}/vendor/subscription-invoices`);
  }
};
