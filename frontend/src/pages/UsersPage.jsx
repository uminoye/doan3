import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

const ROLES = [
  { value: '1', label: 'Admin' },
  { value: '2', label: 'Sales' },
  { value: '3', label: 'Logistics' },
  { value: '4', label: 'Warehouse' },
  { value: '5', label: 'Factory' },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ fullName: '', email: '', password: '', roleId: '2', status: 'active' });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    api.get('/users', { params: { search } })
      .then((res) => { setUsers(res.data.data); setTotal(res.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [search]);

  const openCreate = () => { setForm({ fullName: '', email: '', password: '', roleId: '2', status: 'active' }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (u) => { setForm({ fullName: u.fullName, email: u.email, password: '', roleId: String(u.roleId), status: u.status }); setModal({ open: true, mode: 'edit', data: u }); };

  const handleSave = async () => {
    if (!form.fullName || !form.email) return alert('Nhập đầy đủ thông tin');
    if (modal.mode === 'create' && !form.password) return alert('Nhập mật khẩu');
    setSaving(true);
    try {
      const payload = { ...form, roleId: parseInt(form.roleId) };
      if (!payload.password) delete payload.password;
      if (modal.mode === 'create') await api.post('/users', payload);
      else await api.put(`/users/${modal.data.id}`, payload);
      setModal({ ...modal, open: false });
      fetch();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa người dùng này?')) return;
    try { await api.delete(`/users/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const roleColors = { admin: 'badge-draft', sales: 'badge-submitted', logistics: 'badge-logistics', warehouse: 'badge-warehouse', factory: 'badge-draft' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Người dùng</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={18} /> Thêm người dùng</button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input className="input-field pl-9" placeholder="Tìm tên, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Tổng: {total}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2 text-left">Họ tên</th><th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Vai trò</th><th className="px-3 py-2 text-left">Trạng thái</th><th className="px-3 py-2 text-center">Thao tác</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="table-row">
                  <td className="px-3 py-2 font-medium">{u.fullName}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2"><span className={`badge ${roleColors[u.role?.name] || 'badge-draft'}`}>{u.role?.name}</span></td>
                  <td className="px-3 py-2"><span className={`badge ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.status === 'active' ? 'Hoạt động' : 'Tắt'}</span></td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-gray-100 text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded hover:bg-gray-100 text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} className="text-center py-8" style={{ color: 'var(--muted)' }}>Không có người dùng nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.mode === 'create' ? 'Thêm người dùng' : 'Sửa người dùng'} size="sm">
        <div className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Họ tên *</label><input className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">{modal.mode === 'create' ? 'Mật khẩu *' : 'Mật khẩu mới (bỏ trống nếu không đổi)'}</label><input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Vai trò</label>
              <select className="select-field" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Trạng thái</label>
              <select className="select-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tắt</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Đang lưu...' : 'Lưu'}</button>
            <button onClick={() => setModal({ ...modal, open: false })} className="btn-secondary flex-1">Hủy</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
