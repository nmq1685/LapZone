import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: '#94a3b8' }}>
            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-lg-4 col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-laptop fs-3" style={{ color: '#38bdf8' }}></i>
                            <div>
                                <span className="fw-bold fs-4" style={{ color: '#38bdf8' }}>Laptop</span>
                                <span className="fw-bold fs-4 text-white">Zone</span>
                            </div>
                        </div>
                        <p className="small lh-lg">
                            Chuyên cung cấp laptop chính hãng với giá tốt nhất thị trường.
                            Bảo hành chính hãng 12-24 tháng. Giao hàng toàn quốc.
                        </p>
                        <div className="d-flex gap-3 mt-3">
                            {['facebook', 'youtube', 'tiktok', 'instagram'].map(s => (
                                <a key={s} href="#!" className="text-decoration-none" style={{ color: '#38bdf8', transition: 'opacity .2s' }}>
                                    <i className={`bi bi-${s} fs-5`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-6">
                        <h6 className="text-white fw-bold mb-3 text-uppercase" style={{ letterSpacing: 1 }}>Danh mục</h6>
                        <ul className="list-unstyled">
                            {[['gaming', 'Gaming'], ['van-phong', 'Văn phòng'], ['sieu-mong', 'Siêu mỏng'], ['sinh-vien', 'Sinh viên'], ['do-hoa', 'Đồ họa']].map(([slug, name]) => (
                                <li key={slug} className="mb-1">
                                    <Link to={`/products?slug=${slug}`} className="text-decoration-none footer-link">{name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <h6 className="text-white fw-bold mb-3 text-uppercase" style={{ letterSpacing: 1 }}>Hỗ trợ</h6>
                        <ul className="list-unstyled">
                            {[['Chính sách bảo hành', '#!'], ['Chính sách đổi trả', '#!'], ['Phương thức thanh toán', '#!'], ['Hướng dẫn mua hàng', '#!'], ['Liên hệ', '#!']].map(([label, href]) => (
                                <li key={label} className="mb-1">
                                    <a href={href} className="text-decoration-none footer-link">{label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <h6 className="text-white fw-bold mb-3 text-uppercase" style={{ letterSpacing: 1 }}>Liên hệ</h6>
                        <ul className="list-unstyled small">
                            <li className="mb-2 d-flex gap-2"><i className="bi bi-geo-alt-fill" style={{ color: '#38bdf8' }}></i><span>123 Nguyễn Huệ, Quận 1, TP.HCM</span></li>
                            <li className="mb-2 d-flex gap-2"><i className="bi bi-telephone-fill" style={{ color: '#38bdf8' }}></i><span>1800 1234 (Miễn phí)</span></li>
                            <li className="mb-2 d-flex gap-2"><i className="bi bi-envelope-fill" style={{ color: '#38bdf8' }}></i><span>support@laptopzone.vn</span></li>
                            <li className="mb-2 d-flex gap-2"><i className="bi bi-clock-fill" style={{ color: '#38bdf8' }}></i><span>8:00 - 21:00 (T2 - CN)</span></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="container py-3">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <small>© 2024 LaptopZone. All rights reserved.</small>
                        <div className="d-flex gap-2">
                            {['visa', 'credit-card', 'paypal', 'cash-stack'].map(icon => (
                                <span key={icon} className="badge rounded-pill px-2 py-1" style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                                    <i className={`bi bi-${icon}`}></i>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
