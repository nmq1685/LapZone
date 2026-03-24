import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import { toast } from 'react-toastify';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        note: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
        if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại';
        else if (!/^0\d{9}$/.test(form.phone)) e.phone = 'Số điện thoại không hợp lệ';
        if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await createOrder({
                userId: user.id,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                })),
                total: cartTotal,
                status: 'Pending',
                address: form.address,
                phone: form.phone,
                name: form.name,
                paymentMethod: 'COD',
                note: form.note,
                createdAt: new Date().toISOString(),
            });
            clearCart();
            toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.', { autoClose: 4000 });
            navigate('/orders');
        } catch {
            toast.error('Đặt hàng thất bại, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container py-5 text-center">
                <i className="bi bi-cart-x display-1" style={{ color: '#38bdf8' }}></i>
                <h4 className="mt-3">Giỏ hàng trống</h4>
                <Link to="/products" className="btn btn-primary mt-2">Mua sắm ngay</Link>
            </div>
        );
    }

    return (
        <div className="py-4" style={{ background: '#f8fafc', minHeight: '80vh' }}>
            <div className="container">
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/cart" className="text-decoration-none">Giỏ hàng</Link></li>
                        <li className="breadcrumb-item active">Thanh toán</li>
                    </ol>
                </nav>
                <h3 className="fw-bold mb-4">Thanh toán</h3>

                <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                        {/* Delivery Info */}
                        <div className="col-lg-7">
                            <div className="card border-0 shadow-sm mb-3">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3"><i className="bi bi-geo-alt me-2 text-primary"></i>Thông tin giao hàng</h6>
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Họ và tên *</label>
                                        <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Số điện thoại *</label>
                                        <input type="tel" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} name="phone" value={form.phone} onChange={handleChange} placeholder="0901234567" />
                                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Địa chỉ giao hàng *</label>
                                        <textarea className={`form-control ${errors.address ? 'is-invalid' : ''}`} name="address" value={form.address} onChange={handleChange} placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành" rows={3} />
                                        {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Ghi chú (tuỳ chọn)</label>
                                        <textarea className="form-control" name="note" value={form.note} onChange={handleChange} placeholder="Ghi chú cho đơn hàng..." rows={2} />
                                    </div>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3"><i className="bi bi-wallet2 me-2 text-primary"></i>Phương thức thanh toán</h6>
                                    <div className="payment-option active">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="radio-dot active"></div>
                                            <i className="bi bi-cash-stack fs-4 text-success"></i>
                                            <div>
                                                <div className="fw-medium">Thanh toán khi nhận hàng (COD)</div>
                                                <small className="text-muted">Thanh toán bằng tiền mặt khi nhận hàng</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order summary */}
                        <div className="col-lg-5">
                            <div className="card border-0 shadow-sm sticky-top" style={{ top: 80 }}>
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">Đơn hàng của bạn</h6>
                                    <div className="order-items-list">
                                        {cartItems.map(item => (
                                            <div key={item.productId} className="d-flex gap-2 mb-3">
                                                <div className="position-relative">
                                                    <img src={item.image} alt={item.name} className="rounded-2" style={{ width: 56, height: 44, objectFit: 'cover', background: '#f1f5f9' }} />
                                                    <span className="position-absolute top-0 end-0 badge rounded-pill bg-primary translate-middle-y" style={{ fontSize: 10 }}>{item.quantity}</span>
                                                </div>
                                                <div className="flex-grow-1 min-w-0">
                                                    <div className="small fw-medium text-truncate">{item.name}</div>
                                                    <div className="small text-muted">{formatPrice(item.price)} × {item.quantity}</div>
                                                </div>
                                                <div className="small fw-bold" style={{ color: '#2563eb', whiteSpace: 'nowrap' }}>{formatPrice(item.price * item.quantity)}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-muted">Tạm tính</span>
                                        <span>{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-muted">Phí vận chuyển</span>
                                        <span className="text-success">Miễn phí</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between fw-bold">
                                        <span>Tổng thanh toán</span>
                                        <span className="fs-5" style={{ color: '#2563eb' }}>{formatPrice(cartTotal)}</span>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 btn-lg mt-3" disabled={submitting}>
                                        {submitting
                                            ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
                                            : <><i className="bi bi-bag-check me-2"></i>Đặt hàng</>}
                                    </button>
                                    <p className="small text-muted text-center mt-2">
                                        <i className="bi bi-shield-lock me-1"></i>Mua sắm an toàn & bảo mật
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
