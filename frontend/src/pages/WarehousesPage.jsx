import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ warehouseCode: '', name: '', location: '' });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    api.get('/warehouses', { params: { search } })
      .then((res) => { setWarehouses(res.data.data); setTotal(res.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [search]);

  const openCreate = () => { setForm({ warehouseCode: '', name: '', location: '' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (w) => { setForm({ warehouseCode: w.warehouseCode, name: w.name, location: w.location || '' }); setModal({ open: true, mode: 'edit', data: w }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'create') await api.post('/warehouses', form);
      else await api.put(`/warehouses/${modal.data.id}`, form);
      setModal({ ...modal, open: false });
      fetch();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa kho này?')) return;
    try { await api.delete(`/warehouses/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Kho</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={18} /> Thêm kho</button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input className="input-field pl-9" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Tổng: {total}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header"><th className="px-3 py-2 text-left">Mã kho</th><th className="px-3 py-2 text-left">Tên kho</th><th className="px-3 py-2 text-left">Địa điểm</th><th className="px-3 py-2 text-center">Thao tác</th></tr></thead>
            <tbody>
              {warehouses.map((w) => (
                <tr key={w.id} className="table-row">
                  <td className="px-3 py-2 font-mono text-xs">{w.warehouseCode}</td>
                  <td className="px-3 py-2 font-medium">{w.name}</td>
                  <td className="px-3 py-2">{w.location || '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => openEdit(w)} className="p-1.5 rounded hover:bg-gray-100 text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded hover:bg-gray-100 text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {warehouses.length === 0 && <tr><td colSpan={4} className="text-center py-8" style={{ color: 'var(--muted)' }}>Không có kho nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.mode === 'create' ? 'Thêm kho' : 'Sửa kho'} size="sm">
        <div className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Mã kho *</label><input className="input-field" value={form.warehouseCode} onChange={(e) => setForm({ ...form, warehouseCode: e.target.value })} placeholder="WH001" /></div>
          <div><label className="block text-sm font-medium mb-1">Tên kho *</label><input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Địa điểm</label><input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Đang lưu...' : 'Lưu'}</button>
            <button onClick={() => setModal({ ...modal, open: false })} className="btn-secondary flex-1">Hủy</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
