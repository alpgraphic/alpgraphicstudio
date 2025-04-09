'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Kullanıcı oluşturma formu için state
  const [showRegister, setShowRegister] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');

  // Kullanıcının zaten giriş yapmış olup olmadığını kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          // Kullanıcı zaten giriş yapmış, dashboard'a yönlendir
          router.push('/admin');
        }
      } catch { // catch try ile aynı satırda veya } ile bitişik olmalı
        // Hata durumunda sessizce devam et, login sayfasını göster
      }
    
    checkAuth();
  }, [router]);

  // Giriş formu gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifre giriniz');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      // Yanıt boş olabilir mi diye kontrol et
      const text = await res.text();
      
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('JSON parse hatası:', e, 'Yanıt metni:', text);
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
      
      if (!res.ok) {
        throw new Error(data.message || 'Giriş yapılamadı');
      }
      
      console.log('Giriş başarılı:', data);
      
      // Başarılı giriş, dashboard'a yönlendir
      router.push('/admin');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Giriş sırasında bir hata oluştu');
      }
      console.error('Giriş hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Kullanıcı oluşturma
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!newUsername || !newPassword || !confirmPassword || !secretKey) {
      setError('Lütfen tüm alanları doldurunuz');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    // Basit bir güvenlik anahtarı kontrolü (gerçek uygulamada daha güvenli bir yöntem kullanılmalı)
    if (secretKey !== 'admin123') {
      setError('Geçersiz güvenlik anahtarı');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: newUsername, 
          password: newPassword,
          isAdmin: true
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Kullanıcı oluşturulamadı');
      }
      
      setSuccess('Kullanıcı başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
      
      // Kayıt formunu temizle ve gizle
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setSecretKey('');
      setShowRegister(false);
      
      // Giriş formuna kullanıcı adını doldur
      setUsername(newUsername);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Kullanıcı oluşturulurken bir hata oluştu');
      }
      console.error('Kayıt hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h1 className={styles.loginTitle}>Admin Girişi</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        {!showRegister ? (
          <>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="username">Kullanıcı Adı:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="password">Şifre:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.loginButton}
                disabled={loading}
              >
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
            
            <div className={styles.registerLink}>
              <button 
                onClick={() => setShowRegister(true)}
                className={styles.linkButton}
                disabled={loading}
              >
                Yeni Admin Kullanıcısı Oluştur
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleRegister}>
              <div className={styles.formGroup}>
                <label htmlFor="newUsername">Kullanıcı Adı:</label>
                <input
                  type="text"
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="newPassword">Şifre:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Şifre Tekrar:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="secretKey">Güvenlik Anahtarı:</label>
                <input
                  type="password"
                  id="secretKey"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  disabled={loading}
                  required
                />
                <small className={styles.hint}>Admin kullanıcısı oluşturmak için güvenlik anahtarını giriniz.</small>
              </div>
              
              <button 
                type="submit" 
                className={styles.loginButton}
                disabled={loading}
              >
                {loading ? 'Kullanıcı Oluşturuluyor...' : 'Kullanıcı Oluştur'}
              </button>
            </form>
            
            <div className={styles.registerLink}>
              <button 
                onClick={() => setShowRegister(false)}
                className={styles.linkButton}
                disabled={loading}
              >
                Giriş Formuna Dön
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}