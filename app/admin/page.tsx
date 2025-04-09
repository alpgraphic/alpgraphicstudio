'use client';

import { useState, useEffect } from 'react';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    companies: 0,
    documents: 0,
    images: 0,
    visits: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verileri API'den çek
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Firma sayısını çek
        const companiesRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/companies`);
        const companiesData = await companiesRes.json();
        
        // Doküman sayısını çek
        const documentsRes = await fetch('/api/documents');
        const documentsData = await documentsRes.json();
        
        // Son aktiviteleri çek (örnek için son 5 doküman)
        let activities = [];
        if (documentsData.success && documentsData.data.length > 0) {
          activities = documentsData.data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(doc => ({
              id: doc._id,
              type: 'upload',
              text: `${doc.name} PDF dosyası yüklendi.`,
              time: new Date(doc.createdAt).toLocaleDateString('tr-TR')
            }));
        }
        
        // İstatistikleri güncelle
        setStats({
          companies: companiesData.success ? companiesData.data.length : 0,
          documents: documentsData.success ? documentsData.data.length : 0,
          images: 0, // Eğer resim yönetiminiz varsa bunu da ekleyin
          visits: 0  // Ziyaret sayısı için ayrı bir sistem gerekebilir
        });
        
        setRecentActivities(activities);
        setError(null);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.loadingContainer}>Yükleniyor...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }


}