import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const stored = localStorage.getItem('lz_cart');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('lz_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [
                ...prev,
                {
                    productId: Number(product.id),
                    name: product.name,
                    price: product.price,
                    image: product.images?.[0] || '',
                    quantity,
                    stock: product.stock,
                },
            ];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCartItems((prev) =>
            prev.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setCartItems([]);

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
