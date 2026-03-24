import React, { useEffect, useState } from 'react';
import { getOrders, updateOrder, deleteOrder, getUsers } from '../../services/api';
import { toast } from 'react-toastify';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const STATUSES = ['Pending', 'Processing', 'Shipping', 'Delivered', 'Cancelled'];
const STATUS_COLORS = { Pending: 'warning', Processing: 'info', Shipping: 'primary', Delivered: 'success', Cancelled: 'danger' };
const STATUS_LABELS = { Pending: 'Chờ duyệt', Processing: 'Đang xử lý', Shipping: 'Đang giao', Delivered: 'Đã giao', Cancelled: 'Đã huỷ' };

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const [ords, usrs] = await Promise.all([getOrders(), getUsers()]);
            const userMap = {};
            usrs.forEach(u => { userMap[u.id] = u; });
            setUsers(userMap);
            setOrders(ords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch {
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleStatusChange = async (order, newStatus) => {
        setProcessingId(order.id);
        try {
            await updateOrder(order.id, { ...order, status: newStatus });
            toast.success(`Đơn #${order.id}: ${STATUS_LABELS[order.status]} → ${STATUS_LABELS[newStatus]}`);
            await load();
        } catch {
            toast.error(`Cập nhật trạng thái đơn #${order.id} thất bại`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (order) => {
        if (!window.confirm(`Xoá đơn hàng #${order.id}?`)) return;
        try {
            await deleteOrder(order.id);
            toast.success('Đã xoá đơn hàng');
            load();
        } catch {
            toast.error('Xoá đơn hàng thất bại');
        }
    };

    const filtered = statusFilter ? orders.filter(o => o.status === statusFilter) : orders;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Quản lý đơn hàng</h4>
                <div className="d-flex gap-2 align-items-center">
                    <span className="text-muted small">{filtered.length} đơn</span>
                    <select className="form-select form-select-sm" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th className="small text-muted fw-semibold px-4">Mã đơn</th>
                                <th className="small text-muted fw-semibold">Khách hàng</th>
                                <th className="small text-muted fw-semibold">Tổng tiền</th>
                                <th className="small text-muted fw-semibold">Trạng thái</th>
                                <th className="small text-muted fw-semibold">Ngày đặt</th>
                                <th className="small text-muted fw-semibold" style={{ minWidth: 220 }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4"><div className="spinner-border spinner-border-sm"></div></td></tr>
                            ) : filtered.map(order => {
                                const u = users[order.userId];
                                const isExp = expandedOrder === order.id;
                                return (
                                    <React.Fragment key={order.id}>
                                        <tr className={isExp ? 'table-active' : ''}>
                                            <td className="px-4 fw-medium">#{order.id}</td>
                                            <td>
                                                <div className="small fw-medium">{order.name || u?.name || 'Khách'}</div>
                                                <div className="small text-muted">{order.phone}</div>
                                            </td>
                                            <td className="small fw-bold" style={{ color: '#2563eb' }}>{formatPrice(order.total)}</td>
                                            <td>
                                                <span className={`badge bg-${STATUS_COLORS[order.status] || 'secondary'} ${order.status === 'Pending' ? 'text-dark' : ''}`}>
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>
                                            </td>
                                            <td className="small text-muted">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <div className="d-flex gap-1 flex-wrap align-items-center">
                                                    {/* Workflow action buttons */}
                                                    {order.status === 'Pending' && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleStatusChange(order, 'Processing')}
                                                            disabled={processingId === order.id}
                                                            title="Duyệt đơn hàng"
                                                        >
                                                            {processingId === order.id
                                                                ? <span className="spinner-border spinner-border-sm"></span>
                                                                : <><i className="bi bi-check2-circle me-1"></i>Duyệt</>}
                                                        </button>
                                                    )}
                                                    {order.status === 'Processing' && (
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleStatusChange(order, 'Shipping')}
                                                            disabled={processingId === order.id}
                                                            title="Chuyển sang đang giao"
                                                        >
                                                            {processingId === order.id
                                                                ? <span className="spinner-border spinner-border-sm"></span>
                                                                : <><i className="bi bi-truck me-1"></i>Giao hàng</>}
                                                        </button>
                                                    )}
                                                    {order.status === 'Shipping' && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleStatusChange(order, 'Delivered')}
                                                            disabled={processingId === order.id}
                                                            title="Xác nhận đã giao"
                                                        >
                                                            {processingId === order.id
                                                                ? <span className="spinner-border spinner-border-sm"></span>
                                                                : <><i className="bi bi-check-circle-fill me-1"></i>Đã giao</>}
                                                        </button>
                                                    )}
                                                    {(order.status === 'Pending' || order.status === 'Processing') && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleStatusChange(order, 'Cancelled')}
                                                            disabled={processingId === order.id}
                                                            title="Huỷ đơn hàng"
                                                        >
                                                            <i className="bi bi-x-circle"></i>
                                                        </button>
                                                    )}
                                                    {/* Status dropdown for manual override */}
                                                    <select
                                                        className="form-select form-select-sm"
                                                        style={{ width: 'auto', fontSize: '0.75rem' }}
                                                        value={order.status}
                                                        onChange={e => handleStatusChange(order, e.target.value)}
                                                        disabled={processingId === order.id}
                                                        title="Đổi trạng thái thủ công"
                                                    >
                                                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                                                    </select>
                                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setExpandedOrder(isExp ? null : order.id)}>
                                                        <i className={`bi bi-chevron-${isExp ? 'up' : 'down'}`}></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(order)} disabled={processingId === order.id}>
                                                        <i className="bi bi-trash3"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExp && (
                                            <tr>
                                                <td colSpan={6} className="p-0">
                                                    <div className="p-3 bg-light">
                                                        <div className="row g-3">
                                                            <div className="col-md-4">
                                                                <strong className="small text-muted">Địa chỉ giao hàng</strong>
                                                                <p className="small mt-1 mb-0">{order.address}</p>
                                                                {order.note && <p className="small text-muted mt-1"><i>Ghi chú: {order.note}</i></p>}
                                                            </div>
                                                            <div className="col-md-8">
                                                                <strong className="small text-muted">Sản phẩm</strong>
                                                                <div className="mt-1">
                                                                    {order.items?.map((item, i) => (
                                                                        <div key={i} className="d-flex gap-2 align-items-center mb-1">
                                                                            <img src={item.image} alt={item.name} className="rounded-2" style={{ width: 40, height: 32, objectFit: 'cover' }} />
                                                                            <span className="small flex-grow-1">{item.name}</span>
                                                                            <span className="small text-muted">{item.quantity} × {formatPrice(item.price)}</span>
                                                                            <span className="small fw-bold" style={{ color: '#2563eb' }}>{formatPrice(item.price * item.quantity)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
