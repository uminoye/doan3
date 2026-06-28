import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Plus, Eye, Check, X } from 'lucide-react';

export default function ProductionReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [detailModal, setDetailModal] = useState({ open: false, data: null });
  const [createModal, setCreateModal] = useState(false);
  const [filter, setFilter] = useState({ warehouseId: '', status: '' });
  const [form, setForm] = useState({ warehouseId: '', receiptDate: new Date().toISOString().split('T')[0], notes: '', items: [{ productId: '', quantity: '' }] });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    api.get('/production-receipts', { params: { ...filter } })
      .then((res) => { setReceipts(res.data.data); setTotal(res.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchMeta = async () => {
    const [wh, pr] = await Promise.all([
      api.get('/warehouses/active').then((r) => r.data),
      api.get('/products').then((r) => r.data.data),
    ]);
    setWarehouses(wh);
    setProducts(pr);
  };

  useEffect(() => { fetch(); }, [filter]);
  useEffect(() => { fetchMeta(); }, []);

  const handleConfirm = async (id) => {
    if (!confirm('Xác nhận phiếu nhập? Hệ thống sẽ tự động cộng tồn kho.')) return;
    try {
      await api.post(`/production-receipts/${id}/confirm`);
      fetch();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Hủy phiếu nhập?')) return;
    try { await api.post(`/production-receipts/${id}/cancel`); fetch(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa phiếu nhập?')) return;
    try { await api.delete(`/production-receipts/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const openCreate = () => {
    setForm({ warehouseId: '', receiptDate: new Date().toISOString().split('T')[0], notes: '', items: [{ productId: '', quantity: '' }] });
    setCreateModal(true);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: '' }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, key, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [key]: val };
    setForm({ ...form, items });
  };

  const handleSave = async () => {
    if (!form.warehouseId) return alert('Chọn kho nhận');
    const validItems = form.items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) return alert('Thêm ít nhất 1 sản phẩm');
    setSaving(true);
    try {
      await api.post('/production-receipts', {
        warehouseId: parseInt(form.warehouseId),
        receiptDate: form.receiptDate,
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
        <h1 className="text-2xl font-bold">Phiếu nhập thành phẩm</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={18} /> Tạo phiếu nhập</button>
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
              <th className="px-3 py-2 text-left">Số phiếu</th><th className="px-3 py-2 text-left">Ngày nhập</th>
              <th className="px-3 py-2 text-left">Kho nhận</th><th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-left">Người tạo</th><th className="px-3 py-2 text-center">Thao tác</th>
            </tr></thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={r.id} className="table-row">
                  <td className="px-3 py-2 font-mono text-xs">{r.receiptNo}</td>
                  <td className="px-3 py-2">{new Date(r.receiptDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-3 py-2">{r.warehouse?.name}</td>
                  <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-2">{r.creator?.fullName}</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => setDetailModal({ open: true, data: r })} className="p-1.5 rounded hover:bg-gray-100 text-gray-600"><Eye size={16} /></button>
                    {r.status === 'draft' && (
                      <>
                        <button onClick={() => handleConfirm(r.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600"><Check size={16} /></button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-gray-100 text-red-600"><X size={16} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--muted)' }}>Không có phiếu nhập nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chi tiết phiếu nhập */}
      <Modal open={detailModal.open} onClose={() => setDetailModal({ ...detailModal, open: false })} title={`Chi tiết ${detailModal.data?.receiptNo}`} size="md">
        {detailModal.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Số phiếu:</span> {detailModal.data.receiptNo}</div>
              <div><span className="font-medium">Kho nhận:</span> {detailModal.data.warehouse?.name}</div>
              <div><span className="font-medium">Ngày nhập:</span> {new Date(detailModal.data.receiptDate).toLocaleDateString('vi-VN')}</div>
              <div><span className="font-medium">Trạng thái:</span> <StatusBadge status={detailModal.data.status} /></div>
              <div><span className="font-medium">Người tạo:</span> {detailModal.data.creator?.fullName}</div>
              <div><span className="font-medium">Ghi chú:</span> {detailModal.data.notes || '—'}</div>
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

      {/* Tạo phiếu nhập */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Tạo phiếu nhập thành phẩm" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Kho nhận *</label>
              <select className="select-field" value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
                <option value="">-- Chọn kho --</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Ngày nhập</label><input type="date" className="input-field" value={form.receiptDate} onChange={(e) => setForm({ ...form, receiptDate: e.target.value })} /></div>
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
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
                <input type="number" className="input-field w-32" placeholder="Số lượng" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
                {form.items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-500 px-2">✕</button>}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Đang lưu...' : 'Tạo phiếu nhập'}</button>
            <button onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Hủy</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
