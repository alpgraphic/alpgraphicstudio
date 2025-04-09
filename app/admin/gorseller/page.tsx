// app/admin/gorseller/page.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function ImagesPage() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Burada gerekirse veri çekme işlemleri yapılabilir
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className={styles.loadingContainer}>Yükleniyor...</div>;
  }

  return (
    <div className={styles.imagesContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Görsel Yönetimi</h1>
      </div>
      
      <div className={styles.pageContent}>
        <p>Görsel yönetimi sayfası yapım aşamasındadır.</p>
      </div>
    </div>
  );
}