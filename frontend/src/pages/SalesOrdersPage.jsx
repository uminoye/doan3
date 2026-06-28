import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Plus, Eye, Send, X, Check } from 'lucide-react';

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [detailModal, setDetailModal] = useState({ open: false, data: null });
  const [createModal, setCreateModal] = useState(false);
  const [filter, setFilter] = useState({ status: '' });
  const [form, setForm] = useState({ customerId: '', orderDate: new Date().toISOString().split('T')[0], deliveryDate: '', notes: '', items: [{ productId: '', quantity: '', unitPrice: '' }] });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    api.get('/sales-orders', { params: { ...filter } })
      .then((res) => { setOrders(res.data.data); setTotal(res.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchMeta = async () => {
    const [c, p] = await Promise.all([
      api.get('/customers').then((r) => r.data.data),
      api.get('/products').then((r) => r.data.data),
    ]);
    setCustomers(c);
    setProducts(p);
  };

  useEffect(() => { fetch(); }, [filter]);
  useEffect(() => { fetchMeta(); }, []);

  const handleSubmit = async (id) => {
    if (!confirm('Gửi đơn hàng đến logistics?')) return;
    try { await api.post(`/sales-orders/${id}/submit`); fetch(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Hủy đơn hàng?')) return;
    try { await api.post(`/sales-orders/${id}/cancel`); fetch(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa đơn hàng?')) return;
    try { await api.delete(`/sales-orders/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const openCreate = () => {
    setForm({ customerId: '', orderDate: new Date().toISOString().split('T')[0], deliveryDate: '', notes: '', items: [{ productId: '', quantity: '', unitPrice: '' }] });
    setCreateModal(true);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: '', unitPrice: '' }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, key, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [key]: val };
    if (key === 'productId') {
      const p = products.find((x) => x.id === parseInt(val));
      if (p) items[i].unitPrice = String(p.salePrice);
    }
    setForm({ ...form, items });
  };

  const handleSave = async () => {
    if (!form.customerId) return alert('Chọn khách hàng');
    const validItems = form.items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) return alert('Thêm ít nhất 1 sản phẩm');
    setSaving(true);
    try {
      await api.post('/sales-orders', {
        customerId: parseInt(form.customerId),
        orderDate: form.orderDate,
        deliveryDate: form.deliveryDate || null,
        notes: form.notes,
        items: validItems.map((i) => ({ productId: parseInt(i.productId), quantity: parseFloat(i.quantity), unitPrice: parseFloat(i.unitPrice) || 0 })),
      });
      setCreateModal(false);
      fetch();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Đơn hàng Sales</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={18} /> Tạo đơn hàng</button>
      </div>

      <div className="flex gap-3 items-center">
        <select className="select-field w-52" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="submitted">Đã gửi</option>
          <option value="logistics_received">Logistics nhận</option>
          <option value="warehouse_processing">Kho xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <span className="text-sm ml-auto" style={{ color: 'var(--muted)' }}>Tổng: {total}</span>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2 text-left">Số đơn</th><th className="px-3 py-2 text-left">Khách hàng</th>
              <th className="px-3 py-2 text-left">Ngày đặt</th><th className="px-3 py-2 text-left">Ngày giao</th>
              <th className="px-3 py-2 text-left">Trạng thái</th><th className="px-3 py-2 text-center">Thao tác</th>
            </tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="table-row">
                  <td className="px-3 py-2 font-mono text-xs">{o.orderNo}</td>
                  <td className="px-3 py-2 font-medium">{o.customer?.name}</td>
                  <td className="px-3 py-2">{new Date(o.orderDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-3 py-2">{o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => setDetailModal({ open: true, data: o })} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Eye size={16} /></button>
                    {o.status === 'draft' && (
                      <>
                        <button onClick={() => handleSubmit(o.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Gửi đơn"><Send size={16} /></button>
                        <button onClick={() => handleDelete(o.id)} className="p-1.5 rounded hover:bg-gray-100 text-red-600"><X size={16} /></button>
                      </>
                    )}
                    {['submitted', 'logistics_received'].includes(o.status) && (
                      <button onClick={() => handleCancel(o.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Hủy"><X size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--muted)' }}>Không có đơn hàng nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={detailModal.open} onClose={() => setDetailModal({ ...detailModal, open: false })} title={`Chi tiết ${detailModal.data?.orderNo}`} size="lg">
        {detailModal.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Số đơn:</span> {detailModal.data.orderNo}</div>
              <div><span className="font-medium">Khách hàng:</span> {detailModal.data.customer?.name}</div>
              <div><span className="font-medium">Ngày đặt:</span> {new Date(detailModal.data.orderDate).toLocaleDateString('vi-VN')}</div>
              <div><span className="font-medium">Ngày giao:</span> {detailModal.data.deliveryDate ? new Date(detailModal.data.deliveryDate).toLocaleDateString('vi-VN') : '—'}</div>
              <div><span className="font-medium">Trạng thái:</span> <StatusBadge status={detailModal.data.status} /></div>
              <div><span className="font-medium">Người tạo:</span> {detailModal.data.creator?.fullName}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Chi tiết sản phẩm</h4>
              <table className="w-full text-sm">
                <thead><tr className="table-header"><th className="px-3 py-2 text-left">Sản phẩm</th><th className="px-3 py-2 text-right">Số lượng</th><th className="px-3 py-2 text-right">Đơn giá</th><th className="px-3 py-2 text-right">Thành tiền</th></tr></thead>
                <tbody>
                  {detailModal.data.items?.map((item) => (
                    <tr key={item.id} className="table-row">
                      <td className="px-3 py-2">{item.product?.name}</td>
                      <td className="px-3 py-2 text-right">{Number(item.quantity).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{Number(item.unitPrice).toLocaleString()} đ</td>
                      <td className="px-3 py-2 text-right font-medium">{Number(item.quantity * item.unitPrice).toLocaleString()} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tạo đơn hàng" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1">Khách hàng *</label>
              <select className="select-field" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                <option value="">-- Chọn khách hàng --</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Ngày đặt</label><input type="date" className="input-field" value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">Ngày giao dự kiến</label><input type="date" className="input-field" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Ghi chú</label><textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Chi tiết sản phẩm</h4>
              <button onClick={addItem} className="btn-secondary text-xs px-3 py-1">+ Thêm dòng</button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select className="select-field flex-1" value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}>
                  <option value="">-- Sản phẩm --</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} - {Number(p.salePrice).toLocaleString()}đ</option>)}
                </select>
                <input type="number" className="input-field w-24" placeholder="SL" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
                <input type="number" className="input-field w-32" placeholder="Đơn giá" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)} />
                {form.items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-500 px-2">✕</button>}
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Đang lưu...' : 'Tạo đơn hàng'}</button>
            <button onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Hủy</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
