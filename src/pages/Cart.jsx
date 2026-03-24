import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
        } else {
            navigate('/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container py-5 text-center">
                <div className="empty-state">
                    <i className="bi bi-cart-x display-1" style={{ color: '#38bdf8' }}></i>
                    <h4 className="mt-3">Giỏ hàng trống</h4>
                    <p className="text-muted">Hãy khám phá và thêm sản phẩm vào giỏ hàng nhé!</p>
                    <Link to="/products" className="btn btn-primary mt-2">
                        <i className="bi bi-grid me-2"></i>Khám phá sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4" style={{ background: '#f8fafc', minHeight: '80vh' }}>
            <div className="container">
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Giỏ hàng</li>
                    </ol>
                </nav>
                <h3 className="fw-bold mb-4">Giỏ hàng ({cartItems.length} sản phẩm)</h3>

                <div className="row g-4">
                    {/* Cart items */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-0">
                                {cartItems.map((item, idx) => (
                                    <div key={item.productId} className={`cart-item p-3 ${idx < cartItems.length - 1 ? 'border-bottom' : ''}`}>
                                        <div className="d-flex gap-3 align-items-start">
                                            <Link to={`/products/${item.productId}`}>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="rounded-3"
                                                    style={{ width: 90, height: 70, objectFit: 'cover', background: '#f1f5f9' }}
                                                />
                                            </Link>
                                            <div className="flex-grow-1 min-w-0">
                                                <Link to={`/products/${item.productId}`} className="text-decoration-none text-dark">
                                                    <h6 className="fw-semibold mb-1 text-truncate">{item.name}</h6>
                                                </Link>
                                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-2">
                                                    <div className="qty-control qty-sm">
                                                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>
                                                            <i className="bi bi-dash"></i>
                                                        </button>
                                                        <span>{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                                                            <i className="bi bi-plus"></i>
                                                        </button>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <span className="fw-bold" style={{ color: '#2563eb' }}>{formatPrice(item.price * item.quantity)}</span>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item.productId)}>
                                                            <i className="bi bi-trash3"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                                <Link to="/products" className="btn btn-outline-secondary btn-sm">
                                    <i className="bi bi-arrow-left me-1"></i>Tiếp tục mua
                                </Link>
                                <button className="btn btn-outline-danger btn-sm" onClick={clearCart}>
                                    <i className="bi bi-trash3 me-1"></i>Xóa tất cả
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">Tóm tắt đơn hàng</h6>
                                <div className="d-flex justify-content-between mb-2 small">
                                    <span className="text-muted">Tạm tính ({cartItems.reduce((s, i) => s + i.quantity, 0)} SP)</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 small">
                                    <span className="text-muted">Phí vận chuyển</span>
                                    <span className="text-success fw-medium">Miễn phí</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fw-bold mb-4">
                                    <span>Tổng cộng</span>
                                    <span className="fs-5" style={{ color: '#2563eb' }}>{formatPrice(cartTotal)}</span>
                                </div>
                                <button className="btn btn-primary w-100 btn-lg" onClick={handleCheckout}>
                                    <i className="bi bi-bag-check me-2"></i>Thanh toán
                                </button>
                                {!user && (
                                    <p className="small text-muted text-center mt-2">
                                        <i className="bi bi-info-circle me-1"></i>Yêu cầu đăng nhập để thanh toán
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-body">
                                {[
                                    ['shield-check', 'text-success', 'Hàng chính hãng 100%'],
                                    ['truck', 'text-info', 'Giao hàng miễn phí'],
                                    ['arrow-counterclockwise', 'text-warning', 'Đổi trả 30 ngày'],
                                ].map(([icon, cls, label]) => (
                                    <div key={label} className={`d-flex align-items-center gap-2 mb-2 small ${cls}`}>
                                        <i className={`bi bi-${icon}`}></i><span className="text-dark">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
