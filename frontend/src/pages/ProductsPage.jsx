import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ sku: '', name: '', unit: 'hộp', category: '', salePrice: '' });
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products', { params: { search, page, limit: 20 } })
      .then((res) => { setProducts(res.data.data); setTotal(res.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [search, page]);

  const openCreate = () => { setForm({ sku: '', name: '', unit: 'hộp', category: '', salePrice: '' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (p) => { setForm({ sku: p.sku, name: p.name, unit: p.unit, category: p.category || '', salePrice: String(p.salePrice) }); setModal({ open: true, mode: 'edit', data: p }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, salePrice: parseFloat(form.salePrice) || 0 };
      if (modal.mode === 'create') await api.post('/products', payload);
      else await api.put(`/products/${modal.data.id}`, payload);
      setModal({ ...modal, open: false });
      fetchProducts();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try { await api.delete(`/products/${id}`); fetchProducts(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={18} /> Thêm sản phẩm</button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input className="input-field pl-9" placeholder="Tìm kiếm sản phẩm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Tổng: {total}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header"><th className="px-3 py-2 text-left">SKU</th><th className="px-3 py-2 text-left">Tên sản phẩm</th><th className="px-3 py-2 text-left">Đơn vị</th><th className="px-3 py-2 text-left">Nhóm hàng</th><th className="px-3 py-2 text-right">Giá bán</th><th className="px-3 py-2 text-center">Thao tác</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="px-3 py-2 font-mono text-xs">{p.sku}</td>
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2">{p.unit}</td>
                  <td className="px-3 py-2">{p.category || '—'}</td>
                  <td className="px-3 py-2 text-right">{Number(p.salePrice).toLocaleString()} đ</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-gray-100 text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--muted)' }}>Không có sản phẩm nào</td></tr>}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1 text-sm">←</button>
            <span className="px-3 py-1 text-sm">Trang {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={products.length < 20} className="btn-secondary px-3 py-1 text-sm">→</button>
          </div>
        )}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.mode === 'create' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'} size="sm">
        <div className="space-y-3">
          {modal.mode === 'edit' && (
            <div><label className="block text-sm font-medium mb-1">SKU</label><input className="input-field" value={form.sku} readOnly /></div>
          )}
          <div><label className="block text-sm font-medium mb-1">Tên sản phẩm *</label><input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên sản phẩm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Đơn vị</label><input className="input-field" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="hộp" /></div>
            <div><label className="block text-sm font-medium mb-1">Giá bán</label><input type="number" className="input-field" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Nhóm hàng</label><input className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Bánh Trung Thu" /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Đang lưu...' : 'Lưu'}</button>
            <button onClick={() => setModal({ ...modal, open: false })} className="btn-secondary flex-1">Hủy</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
