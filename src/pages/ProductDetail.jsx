import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, getReviews, createReview, updateProduct, getOrders } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { toast } from 'react-toastify';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [selectedImg, setSelectedImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('desc');

    // Review form
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [, setHasPurchased] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const load = async () => {
            setLoading(true);
            try {
                const [prod, revs] = await Promise.all([
                    getProductById(id),
                    getReviews({ productId: id, visible: true }),
                ]);
                setProduct(prod);
                setReviews(revs);

                if (user) {
                    const allRevs = await getReviews({ productId: id, userId: user.id });
                    setHasReviewed(allRevs.length > 0);
                    const orders = await getOrders({ userId: user.id });
                    const purchased = orders.some(o =>
                        o.items.some(i => String(i.productId) === String(id)) &&
                        (o.status === 'Delivered' || o.status === 'Shipping')
                    );
                    setHasPurchased(purchased);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, user]);

    const handleAddToCart = () => {
        addToCart(product, qty);
        toast.success(`Đã thêm ${qty} "${product.name}" vào giỏ!`, { position: 'bottom-right', autoClose: 2000 });
    };

    const handleBuyNow = () => {
        addToCart(product, qty);
        navigate('/cart');
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        if (!reviewComment.trim()) { toast.error('Vui lòng nhập nội dung đánh giá'); return; }
        setSubmitting(true);
        try {
            const newReview = await createReview({
                productId: Number(id),
                userId: user.id,
                userName: user.name,
                rating: reviewRating,
                comment: reviewComment,
                visible: true,
                createdAt: new Date().toISOString(),
            });
            // Update product rating
            const allReviews = [...reviews, newReview];
            const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
            await updateProduct(id, { ...product, rating: Math.round(avgRating * 10) / 10, reviewCount: product.reviewCount + 1 });

            setReviews(prev => [...prev, newReview]);
            setHasReviewed(true);
            setReviewComment('');
            toast.success('Đánh giá của bạn đã được gửi!');
        } catch {
            toast.error('Gửi đánh giá thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="spinner-border" style={{ color: '#38bdf8' }}></div>
        </div>
    );
    if (!product) return <div className="container py-5 text-center"><h4>Không tìm thấy sản phẩm</h4><Link to="/products" className="btn btn-primary mt-3">Quay lại</Link></div>;

    const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;

    return (
        <div className="py-4" style={{ background: '#f8fafc', minHeight: '80vh' }}>
            <div className="container">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none">Sản phẩm</Link></li>
                        <li className="breadcrumb-item active text-truncate" style={{ maxWidth: 200 }}>{product.name}</li>
                    </ol>
                </nav>

                {/* Main product */}
                <div className="card border-0 shadow-sm p-3 p-lg-4 mb-4">
                    <div className="row g-4">
                        {/* Images */}
                        <div className="col-lg-5">
                            <div className="product-detail-img-main mb-2">
                                <img src={product.images?.[selectedImg]} alt={product.name} className="w-100 rounded-3 object-fit-contain" style={{ height: 380, background: '#f1f5f9' }} />
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                                {product.images?.map((img, i) => (
                                    <div
                                        key={i}
                                        className={`product-thumb ${selectedImg === i ? 'active' : ''}`}
                                        onClick={() => setSelectedImg(i)}
                                    >
                                        <img src={img} alt="" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="col-lg-7">
                            <div className="d-flex gap-2 mb-2 flex-wrap">
                                {product.tags?.includes('new') && <span className="badge" style={{ background: '#7c3aed' }}>Mới</span>}
                                {product.tags?.includes('hot') && <span className="badge bg-warning text-dark">Hot</span>}
                                {product.tags?.includes('bestseller') && <span className="badge bg-success">Bán chạy</span>}
                                {discount && <span className="badge bg-danger">-{discount}%</span>}
                            </div>

                            <p className="text-muted small mb-1">{product.brand}</p>
                            <h2 className="fw-bold mb-2">{product.name}</h2>

                            <div className="d-flex align-items-center gap-3 mb-3">
                                <StarRating value={product.rating} size="md" showValue />
                                <span className="text-muted small">{product.reviewCount} đánh giá</span>
                                <span className="text-muted small">|</span>
                                <span className={`small fw-medium ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
                                    <i className={`bi bi-${product.stock > 0 ? 'check-circle' : 'x-circle'} me-1`}></i>
                                    {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
                                </span>
                            </div>

                            <div className="price-block mb-3">
                                <span className="detail-price">{formatPrice(product.price)}</span>
                                {product.oldPrice && (
                                    <span className="detail-old-price ms-3">{formatPrice(product.oldPrice)}</span>
                                )}
                                {discount && (
                                    <span className="badge bg-danger ms-2">Tiết kiệm {formatPrice(product.oldPrice - product.price)}</span>
                                )}
                            </div>

                            {/* Quick specs */}
                            <div className="row g-2 mb-3">
                                {Object.entries(product.specs || {}).map(([key, val]) => (
                                    <div key={key} className="col-6">
                                        <div className="spec-item">
                                            <span className="spec-key">{key.toUpperCase()}</span>
                                            <span className="spec-val">{val}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Qty + Cart */}
                            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                                <div className="qty-control">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))}><i className="bi bi-dash"></i></button>
                                    <span>{qty}</span>
                                    <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}><i className="bi bi-plus"></i></button>
                                </div>
                                <button className="btn btn-add-cart btn-lg flex-grow-1" onClick={handleAddToCart} disabled={product.stock === 0}>
                                    <i className="bi bi-cart-plus me-2"></i>Thêm vào giỏ
                                </button>
                                <button className="btn btn-buy-now btn-lg flex-grow-1" onClick={handleBuyNow} disabled={product.stock === 0}>
                                    <i className="bi bi-lightning me-2"></i>Mua ngay
                                </button>
                            </div>

                            {/* Benefits */}
                            <div className="d-flex gap-3 flex-wrap">
                                {[
                                    ['shield-check-fill', 'text-success', 'Bảo hành chính hãng'],
                                    ['truck', 'text-info', 'Giao hàng miễn phí'],
                                    ['arrow-counterclockwise', 'text-warning', 'Đổi trả 30 ngày'],
                                ].map(([icon, cls, label]) => (
                                    <div key={label} className={`d-flex align-items-center gap-1 small ${cls}`}>
                                        <i className={`bi bi-${icon}`}></i><span className="text-dark">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-0 pt-3 px-4">
                        <ul className="nav nav-tabs border-0">
                            {[['desc', 'Mô tả'], ['specs', 'Cấu hình'], ['reviews', `Đánh giá (${reviews.length})`]].map(([key, label]) => (
                                <li key={key} className="nav-item">
                                    <button className={`nav-link fw-medium ${activeTab === key ? 'active' : 'text-muted'}`} onClick={() => setActiveTab(key)}>
                                        {label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="card-body px-4 py-4">
                        {activeTab === 'desc' && (
                            <p className="text-muted lh-lg">{product.description}</p>
                        )}
                        {activeTab === 'specs' && (
                            <div className="table-responsive">
                                <table className="table table-bordered specs-table">
                                    <tbody>
                                        {Object.entries(product.specs || {}).map(([k, v]) => (
                                            <tr key={k}>
                                                <td className="fw-medium text-muted" style={{ width: '30%', background: '#f8fafc' }}>{k.toUpperCase()}</td>
                                                <td>{v}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div>
                                {/* Review summary */}
                                <div className="d-flex gap-4 align-items-center mb-4 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                                    <div className="text-center">
                                        <div className="display-5 fw-bold" style={{ color: '#f59e0b' }}>{product.rating}</div>
                                        <StarRating value={product.rating} size="md" />
                                        <div className="small text-muted mt-1">{product.reviewCount} đánh giá</div>
                                    </div>
                                    <div className="flex-grow-1">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = reviews.filter(r => r.rating === star).length;
                                            const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                                            return (
                                                <div key={star} className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="small" style={{ width: 20 }}>{star}</span>
                                                    <i className="bi bi-star-fill small" style={{ color: '#f59e0b' }}></i>
                                                    <div className="progress flex-grow-1" style={{ height: 8 }}>
                                                        <div className="progress-bar bg-warning" style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                    <span className="small text-muted" style={{ width: 30 }}>{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Review list */}
                                {reviews.length === 0 ? (
                                    <p className="text-muted text-center py-3">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                                ) : (
                                    <div className="d-flex flex-column gap-3 mb-4">
                                        {reviews.map(r => (
                                            <div key={r.id} className="review-item">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <div className="avatar-sm">{r.userName?.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <div className="fw-medium small">{r.userName}</div>
                                                        <div className="text-muted small">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                                                    </div>
                                                    <div className="ms-auto"><StarRating value={r.rating} size="sm" /></div>
                                                </div>
                                                <p className="mb-0 small text-dark">{r.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Submit review */}
                                {user ? (
                                    hasReviewed ? (
                                        <div className="alert alert-success"><i className="bi bi-check-circle me-2"></i>Bạn đã đánh giá sản phẩm này.</div>
                                    ) : (
                                        <div className="review-form-wrap">
                                            <h6 className="fw-bold mb-3">Viết đánh giá của bạn</h6>
                                            <form onSubmit={handleSubmitReview}>
                                                <div className="mb-3">
                                                    <label className="form-label small">Đánh giá</label>
                                                    <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label small">Nội dung</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={3}
                                                        placeholder="Chia sẻ trải nghiệm của bạn..."
                                                        value={reviewComment}
                                                        onChange={e => setReviewComment(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                                    {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send me-2"></i>}
                                                    Gửi đánh giá
                                                </button>
                                            </form>
                                        </div>
                                    )
                                ) : (
                                    <div className="alert alert-info">
                                        <Link to="/login" className="fw-medium">Đăng nhập</Link> để viết đánh giá.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
