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

// ✅ POST /invoice/generate/:tripId
export const generateInvoice = async (tripId: number) => {
  const res = await axios.post(`${API_BASE}/generate/${tripId}`, null, authHeaders());
  return res.data;
};

// ✅ DOWNLOAD PDF of Invoice
export const downloadInvoicePdf = async (id: number) => {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(`${API_BASE}/download/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    responseType: 'blob', // 👈 required for binary
  });

  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `INV-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
