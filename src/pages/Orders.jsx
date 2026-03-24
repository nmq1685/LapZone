import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, updateOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const STATUS_CONFIG = {
    Pending: { label: 'Chờ xác nhận', color: 'warning', icon: 'hourglass-split' },
    Processing: { label: 'Đang xử lý', color: 'info', icon: 'gear' },
    Shipping: { label: 'Đang giao', color: 'primary', icon: 'truck' },
    Delivered: { label: 'Đã giao', color: 'success', icon: 'check-circle-fill' },
    Cancelled: { label: 'Đã huỷ', color: 'danger', icon: 'x-circle-fill' },
};

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders({ userId: user.id });
            setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOrders(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCancel = async (order) => {
        if (!window.confirm('Bạn có chắc muốn huỷ đơn hàng này?')) return;
        setCancelling(order.id);
        try {
            await updateOrder(order.id, { ...order, status: 'Cancelled' });
            toast.success('Huỷ đơn hàng thành công!');
            loadOrders();
        } catch {
            toast.error('Huỷ đơn hàng thất bại.');
        } finally {
            setCancelling(null);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border" style={{ color: '#38bdf8' }}></div>
        </div>
    );

    return (
        <div className="py-4" style={{ background: '#f8fafc', minHeight: '80vh' }}>
            <div className="container" style={{ maxWidth: 900 }}>
                <h3 className="fw-bold mb-4">Đơn hàng của tôi</h3>

                {orders.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="bi bi-bag display-1 text-muted"></i>
                        <h5 className="mt-3 text-muted">Bạn chưa có đơn hàng nào</h5>
                        <Link to="/products" className="btn btn-primary mt-2"><i className="bi bi-grid me-2"></i>Mua sắm ngay</Link>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {orders.map(order => {
                            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
                            const isExpanded = expandedOrder === order.id;
                            return (
                                <div key={order.id} className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="fw-bold small text-muted">Mã đơn: #{order.id}</span>
                                                    <span className={`badge bg-${sc.color} text-${sc.color === 'warning' ? 'dark' : 'white'}`}>
                                                        <i className={`bi bi-${sc.icon} me-1`}></i>{sc.label}
                                                    </span>
                                                </div>
                                                <div className="small text-muted">
                                                    {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="text-end">
                                                    <div className="small text-muted">{order.items?.length} sản phẩm</div>
                                                    <div className="fw-bold" style={{ color: '#2563eb' }}>{formatPrice(order.total)}</div>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    {order.status === 'Pending' && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleCancel(order)}
                                                            disabled={cancelling === order.id}
                                                        >
                                                            {cancelling === order.id ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-x-circle me-1"></i>Huỷ</>}
                                                        </button>
                                                    )}
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                                        <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-top">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <h6 className="small fw-bold text-muted text-uppercase mb-2">Địa chỉ giao hàng</h6>
                                                        <p className="small mb-1"><strong>{order.name || user.name}</strong></p>
                                                        <p className="small mb-1 text-muted">{order.phone}</p>
                                                        <p className="small mb-0 text-muted">{order.address}</p>
                                                        {order.note && <p className="small mt-1 text-muted"><i>Ghi chú: {order.note}</i></p>}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <h6 className="small fw-bold text-muted text-uppercase mb-2">Sản phẩm đặt mua</h6>
                                                        {order.items?.map((item, i) => (
                                                            <div key={i} className="d-flex gap-2 mb-2">
                                                                <img src={item.image} alt={item.name} className="rounded-2" style={{ width: 48, height: 38, objectFit: 'cover', background: '#f1f5f9' }} />
                                                                <div className="flex-grow-1 min-w-0">
                                                                    <Link to={`/products/${item.productId}`} className="text-decoration-none text-dark small fw-medium text-truncate d-block">{item.name}</Link>
                                                                    <span className="small text-muted">{formatPrice(item.price)} × {item.quantity}</span>
                                                                </div>
                                                                <span className="small fw-bold" style={{ color: '#2563eb', whiteSpace: 'nowrap' }}>{formatPrice(item.price * item.quantity)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-end mt-2 pt-2 border-top">
                                                    <span className="small text-muted me-2">Tổng thanh toán:</span>
                                                    <span className="fw-bold" style={{ color: '#2563eb' }}>{formatPrice(order.total)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
