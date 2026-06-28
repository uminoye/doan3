import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ customerCode: '', name: '', phone: '', address: '', contactPerson: '' });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    api.get('/customers', { params: { search, page, limit: 20 } })
      .then((res) => { setCustomers(res.data.data); setTotal(res.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [search, page]);

  const openCreate = () => { setForm({ customerCode: '', name: '', phone: '', address: '', contactPerson: '' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (c) => { setForm({ customerCode: c.customerCode, name: c.name, phone: c.phone || '', address: c.address || '', contactPerson: c.contactPerson || '' }); setModal({ open: true, mode: 'edit', data: c }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'create') await api.post('/customers', form);
      else await api.put(`/customers/${modal.data.id}`, form);
      setModal({ ...modal, open: false });
      fetch();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa khách hàng này?')) return;
    try { await api.delete(`/customers/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Khách hàng</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={18} /> Thêm khách hàng</button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input className="input-field pl-9" placeholder="Tìm kiếm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Tổng: {total}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header"><th className="px-3 py-2 text-left">Mã KH</th><th className="px-3 py-2 text-left">Tên khách hàng</th><th className="px-3 py-2 text-left">SĐT</th><th className="px-3 py-2 text-left">Địa chỉ</th><th className="px-3 py-2 text-left">Người LH</th><th className="px-3 py-2 text-center">Thao tác</th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="px-3 py-2 font-mono text-xs">{c.customerCode}</td>
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2">{c.phone || '—'}</td>
                  <td className="px-3 py-2 max-w-xs truncate">{c.address || '—'}</td>
                  <td className="px-3 py-2">{c.contactPerson || '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-gray-100 text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--muted)' }}>Không có khách hàng nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.mode === 'create' ? 'Thêm khách hàng' : 'Sửa khách hàng'} size="sm">
        <div className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Mã khách hàng *</label><input className="input-field" value={form.customerCode} onChange={(e) => setForm({ ...form, customerCode: e.target.value })} placeholder="KH001" /></div>
          <div><label className="block text-sm font-medium mb-1">Tên khách hàng *</label><input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cửa hàng..." /></div>
          <div><label className="block text-sm font-medium mb-1">Số điện thoại</label><input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="090..." /></div>
          <div><label className="block text-sm font-medium mb-1">Địa chỉ</label><textarea className="input-field" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Người liên hệ</label><input className="input-field" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Đang lưu...' : 'Lưu'}</button>
            <button onClick={() => setModal({ ...modal, open: false })} className="btn-secondary flex-1">Hủy</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
