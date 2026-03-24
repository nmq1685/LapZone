import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

const BRANDS = ['ASUS', 'MSI', 'Lenovo', 'Dell', 'HP', 'Apple', 'Acer', 'Razer', 'LG', 'Microsoft'];

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [flashSaleProducts, setFlashSaleProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [prods, cats] = await Promise.all([getProducts({ visible: true }), getCategories()]);
                setFeaturedProducts(prods.filter(p => p.featured).slice(0, 8));
                setFlashSaleProducts(prods.filter(p => p.oldPrice).slice(0, 4));
                setCategories(cats);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const catIcons = { 1: 'controller', 2: 'briefcase', 3: 'phone', 4: 'mortarboard', 5: 'palette2' };
    const catColors = { 1: '#ef4444', 2: '#3b82f6', 3: '#06b6d4', 4: '#22c55e', 5: '#a855f7' };

    return (
        <div>
            {/* ===== HERO ===== */}
            <section className="hero-section">
                <div className="hero-bg"></div>
                <div className="container hero-content">
                    <div className="row align-items-center min-vh-75">
                        <div className="col-lg-6">
                            <div className="badge mb-3 px-3 py-2" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                                🔥 Black Friday - Giảm đến 30%
                            </div>
                            <h1 className="hero-title">
                                Tìm Laptop<br />
                                <span style={{ color: '#38bdf8' }}>Hoàn Hảo</span><br />
                                Cho Bạn
                            </h1>
                            <p className="hero-subtitle">
                                Hơn 100+ mẫu laptop chính hãng từ các thương hiệu hàng đầu.
                                Bảo hành chính hãng, giao hàng nhanh toàn quốc.
                            </p>
                            <div className="d-flex gap-3 flex-wrap">
                                <button onClick={() => navigate('/products')} className="btn btn-hero-primary btn-lg">
                                    <i className="bi bi-grid me-2"></i>Khám phá ngay
                                </button>
                                <button onClick={() => navigate('/products?tag=sale')} className="btn btn-hero-secondary btn-lg">
                                    <i className="bi bi-tag me-2"></i>Xem khuyến mãi
                                </button>
                            </div>
                            <div className="d-flex gap-4 mt-4 flex-wrap">
                                {[['100+', 'Mẫu laptop'], ['50K+', 'Khách hàng'], ['99%', 'Hài lòng']].map(([num, label]) => (
                                    <div key={label}>
                                        <div className="fw-bold fs-4" style={{ color: '#38bdf8' }}>{num}</div>
                                        <div className="small text-white-50">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-lg-6 d-none d-lg-flex justify-content-center">
                            <div className="hero-laptop-wrap">
                                <img
                                    src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&q=80"
                                    alt="Gaming Laptop"
                                    className="hero-laptop-img"
                                />
                                <div className="hero-float-card card-1">
                                    <i className="bi bi-shield-check text-success"></i> Bảo hành chính hãng
                                </div>
                                <div className="hero-float-card card-2">
                                    <i className="bi bi-truck text-info"></i> Giao hàng miễn phí
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== BRANDS ===== */}
            <section className="py-4" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <div className="container">
                    <div className="d-flex align-items-center gap-4 flex-wrap justify-content-center">
                        <small className="text-muted fw-bold text-uppercase" style={{ letterSpacing: 2 }}>Thương hiệu</small>
                        {BRANDS.map(b => (
                            <span key={b} className="brand-pill" onClick={() => navigate(`/products?brand=${b}`)}>
                                {b}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CATEGORIES ===== */}
            <section className="py-5">
                <div className="container">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Danh Mục Sản Phẩm</h2>
                        <p className="section-subtitle">Chọn danh mục phù hợp với nhu cầu của bạn</p>
                    </div>
                    <div className="row g-3">
                        {categories.map((cat) => (
                            <div key={cat.id} className="col-lg col-md-4 col-6">
                                <Link to={`/products?category=${cat.id}`} className="text-decoration-none">
                                    <div className="category-card">
                                        <div className="category-icon" style={{ background: `${catColors[cat.id]}22`, color: catColors[cat.id] }}>
                                            <i className={`bi bi-${catIcons[cat.id] || 'laptop'}`}></i>
                                        </div>
                                        <h6 className="category-name">{cat.name}</h6>
                                        <small className="category-desc d-none d-md-block">{cat.description?.slice(0, 40)}...</small>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FLASH SALE ===== */}
            {flashSaleProducts.length > 0 && (
                <section className="py-5" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
                    <div className="container">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div className="d-flex align-items-center gap-3">
                                <div className="flash-badge">⚡ FLASH SALE</div>
                                <div className="flash-timer">
                                    <span className="timer-digit">02</span>:<span className="timer-digit">30</span>:<span className="timer-digit">00</span>
                                </div>
                            </div>
                            <Link to="/products?tag=sale" className="btn btn-outline-light btn-sm">Xem tất cả</Link>
                        </div>
                        <div className="row g-3">
                            {flashSaleProducts.map(p => (
                                <div key={p.id} className="col-lg-3 col-md-6 col-6">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== FEATURED PRODUCTS ===== */}
            <section className="py-5">
                <div className="container">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
                        <p className="section-subtitle">Những mẫu laptop được yêu thích nhất</p>
                    </div>
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border" style={{ color: '#38bdf8' }}></div></div>
                    ) : (
                        <div className="row g-4">
                            {featuredProducts.map(p => (
                                <div key={p.id} className="col-xl-3 col-lg-4 col-md-6">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-center mt-5">
                        <Link to="/products" className="btn btn-view-all btn-lg px-5">
                            Xem tất cả sản phẩm <i className="bi bi-arrow-right ms-2"></i>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== WHY US ===== */}
            <section className="py-5" style={{ background: '#f8fafc' }}>
                <div className="container">
                    <div className="section-header text-center mb-5">
                        <h2 className="section-title">Tại Sao Chọn LaptopZone?</h2>
                    </div>
                    <div className="row g-4">
                        {[
                            { icon: 'shield-check-fill', color: '#22c55e', title: 'Hàng chính hãng 100%', desc: 'Tất cả sản phẩm đều có hóa đơn VAT và bảo hành chính hãng từ nhà sản xuất.' },
                            { icon: 'truck', color: '#3b82f6', title: 'Giao hàng nhanh', desc: 'Giao hàng trong 2h nội thành HCM, 24h toàn quốc. Miễn phí giao hàng cho đơn từ 5 triệu.' },
                            { icon: 'arrow-counterclockwise', color: '#f59e0b', title: 'Đổi trả 30 ngày', desc: 'Chính sách đổi trả 30 ngày không cần lý do nếu có lỗi từ nhà sản xuất.' },
                            { icon: 'headset', color: '#a855f7', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ kỹ thuật viên sẵn sàng hỗ trợ bạn mọi lúc qua hotline 1800 1234.' },
                        ].map((item, idx) => (
                            <div key={idx} className="col-lg-3 col-md-6">
                                <div className="why-card text-center">
                                    <div className="why-icon" style={{ background: `${item.color}22`, color: item.color }}>
                                        <i className={`bi bi-${item.icon}`}></i>
                                    </div>
                                    <h6 className="why-title">{item.title}</h6>
                                    <p className="why-desc">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
