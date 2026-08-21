import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('naivadyam_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [darkMode, setDarkMode] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('naivadyam_theme', 'dark');
  }, []);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('naivadyam_user', JSON.stringify(data));
      showToast(`Welcome back, ${data.name}!`, 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const googleLogin = async (googleEmail, googleName, googleAvatar) => {
    try {
      const email = googleEmail || 'user@gmail.com';
      const name = googleName || email.split('@')[0];
      const avatar = googleAvatar || '';

      const { data } = await api.post('/auth/google', { email, name, avatar });
      setUser(data);
      localStorage.setItem('naivadyam_user', JSON.stringify(data));
      showToast(`Signed in with Google as ${data.name}!`, 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Google sign-in failed';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };


  const sendRegistrationOtp = async (name, email, phone) => {
    try {
      const { data } = await api.post('/auth/send-registration-otp', { name, email, phone });
      showToast('Verification code sent to your email!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification code';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, phone, emailOtp) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone, emailOtp });
      setUser(data);
      localStorage.setItem('naivadyam_user', JSON.stringify(data));
      showToast('Account created & verified successfully!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('naivadyam_user');
    showToast('Logged out successfully', 'info');
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      setUser(data);
      localStorage.setItem('naivadyam_user', JSON.stringify(data));
      showToast('Profile updated', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const addAddress = async (addressData) => {
    try {
      const { data } = await api.post('/auth/address', addressData);
      setUser((prev) => {
        const updated = { ...prev, savedAddresses: data };
        localStorage.setItem('naivadyam_user', JSON.stringify(updated));
        return updated;
      });
      showToast('New address saved', 'success');
      return { success: true };
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving address', 'error');
      return { success: false };
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const { data } = await api.delete(`/auth/address/${addressId}`);
      setUser((prev) => {
        const updated = { ...prev, savedAddresses: data };
        localStorage.setItem('naivadyam_user', JSON.stringify(updated));
        return updated;
      });
      showToast('Address deleted', 'info');
    } catch (error) {
      showToast('Error deleting address', 'error');
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      showToast('Password reset code sent to your email!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error requesting password reset';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
      showToast('Password reset successful! Please sign in.', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error resetting password';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        darkMode,
        setDarkMode,
        login,
        googleLogin,
        sendRegistrationOtp,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        forgotPassword,
        resetPassword,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
