'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function ImagesPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/images`);
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error('Veri çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      fetchImages();
      setFile(null);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/images?id=${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchImages();
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Yükleniyor...</div>;
  }

  return (
    <div className={styles.imagesContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Görsel Yönetimi</h1>
      </div>

      <div className={styles.pageContent}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUpload}>Yükle</button>

        <div className={styles.imagesGrid}>
          {images.map((img) => (
            <div key={img._id} className={styles.imageItem}>
              <img src={img.url} alt="Görsel" width={200} />
              <button onClick={() => handleDelete(img._id)}>Sil</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}