import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Truck, Check, X } from 'lucide-react';

export default function LogisticsPage() {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '' });
  const [detailModal, setDetailModal] = useState({ open: false, data: null });
  const [transferModal, setTransferModal] = useState({ open: false, data: null, note: '' });

  const fetch = () => {
    setLoading(true);
    api.get('/delivery-requests', { params: { ...filter } })
      .then((res) => { setRequests(res.data.data); setTotal(res.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter]);

  const handleTransfer = async () => {
    try {
      await api.post(`/delivery-requests/${transferModal.data.id}/transfer`, { note: transferModal.note });
      setTransferModal({ open: false, data: null, note: '' });
      fetch();
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Điều phối Logistics</h1>
      </div>

      <div className="flex gap-3 items-center">
        <select className="select-field w-52" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="transferred">Đã chuyển kho</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <span className="text-sm ml-auto" style={{ color: 'var(--muted)' }}>Tổng: {total}</span>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2 text-left">Đơn hàng</th><th className="px-3 py-2 text-left">Khách hàng</th>
              <th className="px-3 py-2 text-left">Ngày giao</th><th className="px-3 py-2 text-left">Trạng thái</th>
              <th className="px-3 py-2 text-left">Người nhận</th><th className="px-3 py-2 text-center">Thao tác</th>
            </tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="table-row">
                  <td className="px-3 py-2 font-mono text-xs">{r.salesOrder?.orderNo}</td>
                  <td className="px-3 py-2 font-medium">{r.salesOrder?.customer?.name}</td>
                  <td className="px-3 py-2">{r.salesOrder?.deliveryDate ? new Date(r.salesOrder.deliveryDate).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-2">{r.receiver?.fullName}</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => setDetailModal({ open: true, data: r })} className="p-1.5 rounded hover:bg-gray-100 text-gray-600">Chi tiết</button>
                    {r.status === 'confirmed' && (
                      <button onClick={() => setTransferModal({ open: true, data: r, note: '' })} className="ml-2 p-1.5 rounded hover:bg-green-50 text-green-600 font-medium text-xs">
                        Chuyển kho
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--muted)' }}>Không có yêu cầu nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={detailModal.open} onClose={() => setDetailModal({ ...detailModal, open: false })} title="Chi tiết yêu cầu giao hàng" size="lg">
        {detailModal.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Đơn hàng:</span> {detailModal.data.salesOrder?.orderNo}</div>
              <div><span className="font-medium">Khách hàng:</span> {detailModal.data.salesOrder?.customer?.name}</div>
              <div><span className="font-medium">Địa chỉ:</span> {detailModal.data.salesOrder?.customer?.address || '—'}</div>
              <div><span className="font-medium">Ngày giao:</span> {detailModal.data.salesOrder?.deliveryDate ? new Date(detailModal.data.salesOrder.deliveryDate).toLocaleDateString('vi-VN') : '—'}</div>
              <div><span className="font-medium">Trạng thái:</span> <StatusBadge status={detailModal.data.status} /></div>
              <div><span className="font-medium">Ghi chú logistics:</span> {detailModal.data.note || '—'}</div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sản phẩm trong đơn</h4>
              <table className="w-full text-sm">
                <thead><tr className="table-header"><th className="px-3 py-2 text-left">Sản phẩm</th><th className="px-3 py-2 text-right">Số lượng</th></tr></thead>
                <tbody>
                  {detailModal.data.salesOrder?.items?.map((item) => (
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

      <Modal open={transferModal.open} onClose={() => setTransferModal({ ...transferModal, open: false })} title="Chuyển đơn sang kho" size="sm">
        <div className="space-y-4">
          <p className="text-sm">Chuyển đơn <strong>{transferModal.data?.salesOrder?.orderNo}</strong> sang kho để chuẩn bị hàng?</p>
          <div><label className="block text-sm font-medium mb-1">Ghi chú logistics</label><textarea className="input-field" rows={3} value={transferModal.note} onChange={(e) => setTransferModal({ ...transferModal, note: e.target.value })} placeholder="Ghi chú thêm..." /></div>
          <div className="flex gap-2">
            <button onClick={handleTransfer} className="btn-accent flex-1">Xác nhận chuyển kho</button>
            <button onClick={() => setTransferModal({ ...transferModal, open: false })} className="btn-secondary flex-1">Hủy</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
