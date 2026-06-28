import { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, TrendingUp, TrendingDown, History } from 'lucide-react';

export default function ReportsPage() {
  const [tab, setTab] = useState('inward');
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [filter, setFilter] = useState({ warehouseId: '', startDate: '', endDate: '' });

  useEffect(() => {
    api.get('/warehouses/active').then((r) => setWarehouses(r.data)).catch(console.error);
  }, []);

  const fetchReport = () => {
    setLoading(true);
    const endpoint = tab === 'inward' ? '/inventory/reports/inward' : '/inventory/reports/outward';
    api.get(endpoint, { params: filter })
      .then((res) => setReport(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, [tab, filter]);

  const tabs = [
    { key: 'inward', label: 'Báo cáo nhập kho', icon: TrendingUp },
    { key: 'outward', label: 'Báo cáo xuất kho', icon: TrendingDown },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Báo cáo Xuất - Nhập - Tồn</h1>

      {/* Filter */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Kho</label>
          <select className="select-field w-48" value={filter.warehouseId} onChange={(e) => setFilter({ ...filter, warehouseId: e.target.value })}>
            <option value="">Tất cả kho</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Từ ngày</label>
          <input type="date" className="input-field" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Đến ngày</label>
          <input type="date" className="input-field" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} />
        </div>
        <button onClick={fetchReport} className="btn-primary">Lọc</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--line)' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === t.key ? 'border-brand text-brand' : 'border-transparent'}`}
            style={{ color: tab === t.key ? 'var(--brand)' : 'var(--muted)' }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2 text-left">Sản phẩm</th><th className="px-3 py-2 text-left">SKU</th>
              <th className="px-3 py-2 text-left">Kho</th><th className="px-3 py-2 text-right">{tab === 'inward' ? 'Tổng nhập' : 'Tổng xuất'}</th>
            </tr></thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={i} className="table-row">
                  <td className="px-3 py-2 font-medium">{r.product?.name || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.product?.sku || '—'}</td>
                  <td className="px-3 py-2">{r.warehouse?.name || '—'}</td>
                  <td className="px-3 py-2 text-right font-bold">
                    {tab === 'inward' ? (
                      <span className="text-green-600">+{r.totalIn?.toLocaleString()}</span>
                    ) : (
                      <span className="text-red-600">-{r.totalOut?.toLocaleString()}</span>
                    )}
                    {' '}{r.product?.unit}
                  </td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8" style={{ color: 'var(--muted)' }}>
                  Không có dữ liệu báo cáo trong khoảng thời gian này
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
