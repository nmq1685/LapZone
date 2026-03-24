import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

const BRANDS = ['ASUS', 'MSI', 'Lenovo', 'Dell', 'HP', 'Apple', 'Acer', 'Razer', 'LG', 'Microsoft'];
const PRICE_RANGES = [
    { label: 'Dưới 15 triệu', min: 0, max: 15000000 },
    { label: '15 - 25 triệu', min: 15000000, max: 25000000 },
    { label: '25 - 35 triệu', min: 25000000, max: 35000000 },
    { label: '35 - 50 triệu', min: 35000000, max: 50000000 },
    { label: 'Trên 50 triệu', min: 50000000, max: 999000000 },
];

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        priceRange: '',
        tag: searchParams.get('tag') || '',
        search: searchParams.get('q') || '',
    });
    const [sort, setSort] = useState('');
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
    const limit = 12;

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = { visible: true };
            if (filters.category) params.categoryId = filters.category;
            if (filters.brand) params.brand = filters.brand;
            if (filters.tag) params['tags_like'] = filters.tag;
            if (filters.search) params.name_like = filters.search;

            let data = await getProducts(params);

            // Price filter client-side
            if (filters.priceRange) {
                const range = PRICE_RANGES.find(r => r.label === filters.priceRange);
                if (range) data = data.filter(p => p.price >= range.min && p.price <= range.max);
            }

            // Sort
            if (sort === 'price_asc') data.sort((a, b) => a.price - b.price);
            else if (sort === 'price_desc') data.sort((a, b) => b.price - a.price);
            else if (sort === 'rating') data.sort((a, b) => b.rating - a.rating);
            else if (sort === 'newest') data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            else if (sort === 'popular') data.sort((a, b) => b.reviewCount - a.reviewCount);

            setTotal(data.length);
            setProducts(data.slice((page - 1) * limit, page * limit));
        } finally {
            setLoading(false);
        }
    }, [filters, sort, page]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ category: '', brand: '', priceRange: '', tag: '', search: '' });
        setSearchInput('');
        setPage(1);
        setSearchParams({});
    };

    const handleSearch = (e) => {
        e.preventDefault();
        updateFilter('search', searchInput);
    };

    const totalPages = Math.ceil(total / limit);
    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="py-4" style={{ background: '#f8fafc', minHeight: '80vh' }}>
            <div className="container">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a href="/" className="text-decoration-none">Trang chủ</a></li>
                        <li className="breadcrumb-item active">Sản phẩm</li>
                    </ol>
                </nav>

                <div className="row g-4">
                    {/* ===== SIDEBAR ===== */}
                    <div className="col-lg-3">
                        <div className="filter-sidebar">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                    <i className="bi bi-funnel"></i> Bộ lọc
                                    {activeFiltersCount > 0 && <span className="badge bg-primary rounded-pill">{activeFiltersCount}</span>}
                                </h6>
                                {activeFiltersCount > 0 && (
                                    <button className="btn btn-link btn-sm text-danger p-0" onClick={clearFilters}>Xóa tất cả</button>
                                )}
                            </div>

                            {/* Search */}
                            <form onSubmit={handleSearch} className="mb-3">
                                <div className="input-group input-group-sm">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tìm kiếm..."
                                        value={searchInput}
                                        onChange={e => setSearchInput(e.target.value)}
                                    />
                                    <button className="btn btn-primary" type="submit"><i className="bi bi-search"></i></button>
                                </div>
                            </form>

                            {/* Categories */}
                            <div className="filter-group">
                                <h6 className="filter-group-title">Danh mục</h6>
                                <div className="d-flex flex-column gap-1">
                                    <label className="filter-radio">
                                        <input type="radio" name="cat" value="" checked={!filters.category} onChange={() => updateFilter('category', '')} />
                                        <span>Tất cả</span>
                                    </label>
                                    {categories.map(cat => (
                                        <label key={cat.id} className="filter-radio">
                                            <input type="radio" name="cat" value={cat.id} checked={filters.category === String(cat.id)} onChange={() => updateFilter('category', String(cat.id))} />
                                            <span>{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Brands */}
                            <div className="filter-group">
                                <h6 className="filter-group-title">Thương hiệu</h6>
                                <div className="d-flex flex-wrap gap-1">
                                    {BRANDS.map(brand => (
                                        <button
                                            key={brand}
                                            className={`btn btn-xs ${filters.brand === brand ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => updateFilter('brand', filters.brand === brand ? '' : brand)}
                                        >
                                            {brand}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price range */}
                            <div className="filter-group">
                                <h6 className="filter-group-title">Khoảng giá</h6>
                                <div className="d-flex flex-column gap-1">
                                    <label className="filter-radio">
                                        <input type="radio" name="price" value="" checked={!filters.priceRange} onChange={() => updateFilter('priceRange', '')} />
                                        <span>Tất cả</span>
                                    </label>
                                    {PRICE_RANGES.map(r => (
                                        <label key={r.label} className="filter-radio">
                                            <input type="radio" name="price" value={r.label} checked={filters.priceRange === r.label} onChange={() => updateFilter('priceRange', r.label)} />
                                            <span>{r.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== PRODUCT LIST ===== */}
                    <div className="col-lg-9">
                        {/* Toolbar */}
                        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                            <div className="text-muted small">
                                <strong className="text-dark">{total}</strong> sản phẩm tìm thấy
                                {filters.search && <span> cho "<strong>{filters.search}</strong>"</span>}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <label className="small text-muted">Sắp xếp:</label>
                                <select className="form-select form-select-sm" style={{ width: 180 }} value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                                    <option value="">Mặc định</option>
                                    <option value="price_asc">Giá tăng dần</option>
                                    <option value="price_desc">Giá giảm dần</option>
                                    <option value="rating">Đánh giá cao nhất</option>
                                    <option value="newest">Mới nhất</option>
                                    <option value="popular">Phổ biến nhất</option>
                                </select>
                            </div>
                        </div>

                        {/* Active filter tags */}
                        {activeFiltersCount > 0 && (
                            <div className="d-flex gap-2 mb-3 flex-wrap">
                                {filters.category && categories.find(c => String(c.id) === filters.category) && (
                                    <span className="filter-tag">
                                        {categories.find(c => String(c.id) === filters.category)?.name}
                                        <button onClick={() => updateFilter('category', '')}><i className="bi bi-x"></i></button>
                                    </span>
                                )}
                                {filters.brand && (
                                    <span className="filter-tag">
                                        {filters.brand}
                                        <button onClick={() => updateFilter('brand', '')}><i className="bi bi-x"></i></button>
                                    </span>
                                )}
                                {filters.priceRange && (
                                    <span className="filter-tag">
                                        {filters.priceRange}
                                        <button onClick={() => updateFilter('priceRange', '')}><i className="bi bi-x"></i></button>
                                    </span>
                                )}
                                {filters.search && (
                                    <span className="filter-tag">
                                        "{filters.search}"
                                        <button onClick={() => { updateFilter('search', ''); setSearchInput(''); }}><i className="bi bi-x"></i></button>
                                    </span>
                                )}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" style={{ color: '#38bdf8' }}></div>
                                <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-search display-1 text-muted"></i>
                                <h5 className="mt-3 text-muted">Không tìm thấy sản phẩm</h5>
                                <button className="btn btn-primary mt-2" onClick={clearFilters}>Xóa bộ lọc</button>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {products.map(p => (
                                    <div key={p.id} className="col-lg-4 col-md-6 col-6">
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4">
                                <nav>
                                    <ul className="pagination pagination-sm">
                                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(p => p - 1)}>&laquo;</button>
                                        </li>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                            <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => setPage(p => p + 1)}>&raquo;</button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
