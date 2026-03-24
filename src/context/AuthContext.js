import React, { createContext, useContext, useState } from 'react';
import { getUserByEmail, createUser, updateUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('lz_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const login = async (email, password) => {
        const users = await getUserByEmail(email);
        if (!users.length) throw new Error('Email không tồn tại');
        const found = users[0];
        if (found.password !== password) throw new Error('Mật khẩu không đúng');
        setUser(found);
        localStorage.setItem('lz_user', JSON.stringify(found));
        return found;
    };

    const register = async ({ name, email, password, phone, address }) => {
        const existing = await getUserByEmail(email);
        if (existing.length) throw new Error('Email đã được sử dụng');
        const newUser = await createUser({
            name,
            email,
            password,
            phone: phone || '',
            address: address || '',
            role: 'user',
            avatar: '',
        });
        setUser(newUser);
        localStorage.setItem('lz_user', JSON.stringify(newUser));
        return newUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('lz_user');
    };

    const updateProfile = async (data) => {
        const updated = await updateUser(user.id, { ...user, ...data });
        setUser(updated);
        localStorage.setItem('lz_user', JSON.stringify(updated));
        return updated;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
