import React, { useEffect, useState } from 'react';
import { getReviews, updateReview, deleteReview } from '../../services/api';
import { toast } from 'react-toastify';
import StarRating from '../../components/StarRating';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, visible, hidden

    const load = async () => {
        setLoading(true);
        const [revs, prods] = await Promise.all([getReviews(), import('../../services/api').then(m => m.getProducts())]);
        const prodMap = {};
        prods.forEach(p => { prodMap[p.id] = p; });
        setProducts(prodMap);
        setReviews(revs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const toggleVisible = async (review) => {
        await updateReview(review.id, { ...review, visible: !review.visible });
        toast.success(review.visible ? 'Đã ẩn đánh giá' : 'Đã hiện đánh giá');
        load();
    };

    const handleDelete = async (review) => {
        if (!window.confirm('Xoá đánh giá này?')) return;
        await deleteReview(review.id);
        toast.success('Đã xoá đánh giá');
        load();
    };

    const filtered = reviews.filter(r =>
        filter === 'all' ? true : filter === 'visible' ? r.visible : !r.visible
    );

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Quản lý đánh giá</h4>
                <div className="d-flex gap-2">
                    {['all', 'visible', 'hidden'].map(f => (
                        <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter(f)}>
                            {f === 'all' ? 'Tất cả' : f === 'visible' ? 'Hiển thị' : 'Đã ẩn'}
                            <span className="badge bg-white text-dark ms-1">
                                {f === 'all' ? reviews.length : f === 'visible' ? reviews.filter(r => r.visible).length : reviews.filter(r => !r.visible).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="d-flex flex-column gap-3">
                {loading ? (
                    <div className="text-center py-4"><div className="spinner-border spinner-border-sm"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-5 text-muted">Không có đánh giá nào</div>
                ) : filtered.map(review => (
                    <div key={review.id} className={`card border-0 shadow-sm ${!review.visible ? 'opacity-75' : ''}`}>
                        <div className="card-body">
                            <div className="d-flex gap-3">
                                <div className="avatar-sm flex-shrink-0">{review.userName?.charAt(0).toUpperCase()}</div>
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                                        <div>
                                            <span className="fw-medium small">{review.userName}</span>
                                            <span className="text-muted small mx-2">→</span>
                                            <span className="small text-primary">{products[review.productId]?.name || `Sản phẩm #${review.productId}`}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="text-muted small">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                            {!review.visible && <span className="badge bg-secondary">Đã ẩn</span>}
                                        </div>
                                    </div>
                                    <div className="my-1"><StarRating value={review.rating} size="sm" /></div>
                                    <p className="small mb-3 text-dark">{review.comment}</p>
                                    <div className="d-flex gap-2">
                                        <button className={`btn btn-sm ${review.visible ? 'btn-outline-warning' : 'btn-outline-success'}`} onClick={() => toggleVisible(review)}>
                                            <i className={`bi bi-eye${review.visible ? '-slash' : ''} me-1`}></i>
                                            {review.visible ? 'Ẩn' : 'Hiện'}
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(review)}>
                                            <i className="bi bi-trash3 me-1"></i>Xoá
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminReviews;
