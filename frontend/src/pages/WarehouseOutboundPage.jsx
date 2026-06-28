import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Plus, Eye, Check, X } from 'lucide-react';

export default function WarehouseOutboundPage() {
  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [detailModal, setDetailModal] = useState({ open: false, data: null });
  const [createModal, setCreateModal] = useState(false);
  const [filter, setFilter] = useState({ warehouseId: '', status: '' });
  const [form, setForm] = useState({ warehouseId: '', salesOrderId: '', exportDate: new Date().toISOString().split('T')[0], notes: '', items: [{ productId: '', quantity: '' }] });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    api.get('/stock-outbounds', { params: { ...filter } })
      .then((res) => { setNotes(res.data.data); setTotal(res.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchMeta = async () => {
    const [wh, pr, ord] = await Promise.all([
      api.get('/warehouses/active').then((r) => r.data),
      api.get('/products').then((r) => r.data.data),
      api.get('/sales-orders', { params: { status: 'warehouse_processing' } }).then((r) => r.data.data),
    ]);
    setWarehouses(wh);
    setProducts(pr);
    setOrders(ord);
  };

  const [orders, setOrders] = useState([]);

  useEffect(() => { fetch(); }, [filter]);
  useEffect(() => { fetchMeta(); }, []);

  const handleConfirm = async (id) => {
    if (!confirm('Xác nhận xuất kho? Hệ thống sẽ tự động trừ tồn kho.')) return;
    try {
      await api.post(`/stock-outbounds/${id}/confirm`);
      fetch();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Hủy phiếu xuất?')) return;
    try { await api.post(`/stock-outbounds/${id}/cancel`); fetch(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa phiếu xuất?')) return;
    try { await api.delete(`/stock-outbounds/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const openCreate = () => {
    setForm({ warehouseId: '', salesOrderId: '', exportDate: new Date().toISOString().split('T')[0], notes: '', items: [{ productId: '', quantity: '' }] });
    setCreateModal(true);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: '' }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, key, val) => { const items = [...form.items]; items[i] = { ...items[i], [key]: val }; setForm({ ...form, items }); };

  const handleSave = async () => {
    if (!form.warehouseId) return alert('Chọn kho');
    const validItems = form.items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) return alert('Thêm ít nhất 1 sản phẩm');
    setSaving(true);
    try {
      await api.post('/stock-outbounds', {
        warehouseId: parseInt(form.warehouseId),
        salesOrderId: form.salesOrderId ? parseInt(form.salesOrderId) : null,
        exportDate: form.exportDate,
        notes: form.notes,
        items: validItems.map((i) => ({ productId: parseInt(i.productId), quantity: parseFloat(i.quantity) })),
      });
      setCreateModal(false);
      fetch();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phiếu xuất kho</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={18} /> Tạo phiếu xuất</button>
      </div>

      <div className="flex gap-3 items-center">
        <select className="select-field w-48" value={filter.warehouseId} onChange={(e) => setFilter({ ...filter, warehouseId: e.target.value })}>
          <option value="">Tất cả kho</option>
          {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select className="select-field w-40" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <span className="text-sm ml-auto" style={{ color: 'var(--muted)' }}>Tổng: {total}</span>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2 text-left">Số phiếu</th><th className="px-3 py-2 text-left">Kho</th>
              <th className="px-3 py-2 text-left">Đơn hàng</th><th className="px-3 py-2 text-left">Ngày xuất</th>
              <th className="px-3 py-2 text-left">Trạng thái</th><th className="px-3 py-2 text-center">Thao tác</th>
            </tr></thead>
            <tbody>
              {notes.map((n) => (
                <tr key={n.id} className="table-row">
                  <td className="px-3 py-2 font-mono text-xs">{n.noteNo}</td>
                  <td className="px-3 py-2">{n.warehouse?.name}</td>
                  <td className="px-3 py-2 text-xs">{n.salesOrder?.orderNo || '—'}</td>
                  <td className="px-3 py-2">{new Date(n.exportDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-3 py-2"><StatusBadge status={n.status} /></td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => setDetailModal({ open: true, data: n })} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Eye size={16} /></button>
                    {n.status === 'draft' && (
                      <>
                        <button onClick={() => handleConfirm(n.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600"><Check size={16} /></button>
                        <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded hover:bg-gray-100 text-red-600"><X size={16} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {notes.length === 0 && <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--muted)' }}>Không có phiếu xuất nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={detailModal.open} onClose={() => setDetailModal({ ...detailModal, open: false })} title={`Chi tiết ${detailModal.data?.noteNo}`} size="md">
        {detailModal.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Số phiếu:</span> {detailModal.data.noteNo}</div>
              <div><span className="font-medium">Kho:</span> {detailModal.data.warehouse?.name}</div>
              <div><span className="font-medium">Đơn hàng:</span> {detailModal.data.salesOrder?.orderNo || '—'}</div>
              <div><span className="font-medium">Ngày xuất:</span> {new Date(detailModal.data.exportDate).toLocaleDateString('vi-VN')}</div>
              <div><span className="font-medium">Trạng thái:</span> <StatusBadge status={detailModal.data.status} /></div>
              <div><span className="font-medium">Người tạo:</span> {detailModal.data.creator?.fullName}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Chi tiết sản phẩm</h4>
              <table className="w-full text-sm">
                <thead><tr className="table-header"><th className="px-3 py-2 text-left">Sản phẩm</th><th className="px-3 py-2 text-right">Số lượng</th></tr></thead>
                <tbody>
                  {detailModal.data.items?.map((item) => (
                    <tr key={item.id} className="table-row">
                      <td className="px-3 py-2">{item.product?.name}</td>
                      <td className="px-3 py-2 text-right font-medium">{Number(item.quantity).toLocaleString()} {item.product?.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tạo phiếu xuất kho" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1">Kho *</label>
              <select className="select-field" value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
                <option value="">-- Chọn kho --</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Đơn hàng (tùy chọn)</label>
              <select className="select-field" value={form.salesOrderId} onChange={(e) => setForm({ ...form, salesOrderId: e.target.value })}>
                <option value="">-- Không liên kết --</option>
                {orders.map((o) => <option key={o.id} value={o.id}>{o.orderNo} - {o.customer?.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Ngày xuất</label><input type="date" className="input-field" value={form.exportDate} onChange={(e) => setForm({ ...form, exportDate: e.target.value })} /></div>
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
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" className="input-field w-32" placeholder="Số lượng" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
                {form.items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-500 px-2">✕</button>}
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Đang lưu...' : 'Tạo phiếu xuất'}</button>
            <button onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Hủy</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
