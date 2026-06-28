import { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Users, ShoppingCart, Factory, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="p-3 rounded-xl" style={{ background: `${color}20` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value ?? '—'}</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/inventory/dashboard')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">Đang tải dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Tổng sản phẩm" value={data?.totalProducts} color="#a63d40" />
        <StatCard icon={Users} label="Tổng khách hàng" value={data?.totalCustomers} color="#1d6f5f" />
        <StatCard icon={ShoppingCart} label="Tổng đơn hàng" value={data?.totalOrders} color="#3a6ea5" />
        <StatCard icon={Factory} label="Phiếu nhập kho" value={data?.totalReceipts} color="#e07b30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nhập kho gần đây */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="font-semibold">Nhập kho gần đây</h2>
          </div>
          {data?.recentInward?.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>Chưa có dữ liệu</p>}
          <div className="space-y-3">
            {data?.recentInward?.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.product?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{t.warehouse?.name}</p>
                </div>
                <span className="text-sm font-semibold text-green-600">+{Number(t.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Xuất kho gần đây */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-red-500" />
            <h2 className="font-semibold">Xuất kho gần đây</h2>
          </div>
          {data?.recentOutward?.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>Chưa có dữ liệu</p>}
          <div className="space-y-3">
            {data?.recentOutward?.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.product?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{t.warehouse?.name}</p>
                </div>
                <span className="text-sm font-semibold text-red-600">-{Number(t.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cảnh báo tồn kho thấp */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-semibold">Cảnh báo tồn kho thấp</h2>
          </div>
          {data?.lowStock?.length === 0 && <p className="text-sm text-green-600">Tất cả sản phẩm có tồn kho đủ</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-2 text-left">Sản phẩm</th>
                  <th className="px-3 py-2 text-left">Kho</th>
                  <th className="px-3 py-2 text-right">Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {data?.lowStock?.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td className="px-3 py-2">{item.product?.name}</td>
                    <td className="px-3 py-2">{item.warehouse?.name}</td>
                    <td className="px-3 py-2 text-right font-semibold text-amber-600">
                      {Number(item.onHandQty).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
