import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/invoice';

const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export interface InvoicePayload {
  invoiceNumber: string;
  subtotal: number;
  vendorCommission: number;
  adminCommission: number;
  totalAmount: number;
  pdfUrl?: string;
  
  tripId: number;
  vendorId: number;
  userId: number;
}

// ✅ GET /invoices
export const getInvoices = async () => {
  const res = await axios.get(`${API_BASE}`, authHeaders());
  return res.data;
};

// ✅ GET /invoices/:id
export const getInvoiceById = async (id: number) => {
  const res = await axios.get(`${API_BASE}/${id}`, authHeaders());
  return res.data;
};

// ✅ POST /invoices
export const createInvoice = async (payload: InvoicePayload) => {
  const res = await axios.post(`${API_BASE}`, payload, authHeaders());
  return res.data;
};

// ✅ PATCH /invoices/:id
export const updateInvoice = async (id: number, payload: Partial<InvoicePayload>) => {
  const res = await axios.patch(`${API_BASE}/${id}`, payload, authHeaders());
  return res.data;
};

// ✅ DELETE /invoices/:id
export const deleteInvoice = async (id: number) => {
  const res = await axios.delete(`${API_BASE}/${id}`, authHeaders());
  return res.data;
};
