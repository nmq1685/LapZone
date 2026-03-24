import React from 'react';

const StarRating = ({ value = 0, onChange, size = 'md', showValue = false }) => {
    const stars = [1, 2, 3, 4, 5];
    const starSize = size === 'sm' ? '0.85rem' : size === 'lg' ? '1.5rem' : '1.1rem';

    return (
        <span className="d-inline-flex align-items-center gap-1">
            {stars.map((star) => {
                const filled = star <= Math.floor(value);
                const half = !filled && star === Math.ceil(value) && value % 1 >= 0.5;
                return onChange ? (
                    <i
                        key={star}
                        className={`bi bi-star${filled ? '-fill' : ''}`}
                        style={{ fontSize: starSize, color: '#f59e0b', cursor: 'pointer' }}
                        onClick={() => onChange(star)}
                    />
                ) : (
                    <i
                        key={star}
                        className={`bi bi-star${filled ? '-fill' : half ? '-half' : ''}`}
                        style={{ fontSize: starSize, color: '#f59e0b' }}
                    />
                );
            })}
            {showValue && <span style={{ fontSize: starSize, color: '#64748b', marginLeft: 2 }}>{value}</span>}
        </span>
    );
};

export default StarRating;
