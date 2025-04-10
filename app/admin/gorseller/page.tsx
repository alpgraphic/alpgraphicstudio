'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { UploadButton } from "@uploadthing/react"; // UploadThing'i doğrudan paket üzerinden import ediyoruz

interface Image {
  _id: string;
  url: string;
  name?: string;
  createdAt?: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images');
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error('Veri çekme hatası:', err);
      alert("Görseller yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu görseli silmek istediğinize emin misiniz?")) {
      try {
        const res = await fetch(`/api/images?id=${id}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          alert("Görsel başarıyla silindi");
          fetchImages();
        } else {
          alert("Görsel silinirken bir hata oluştu");
        }
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Görsel silinirken bir hata oluştu");
      }
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
        <div className={styles.uploadSection}>
          <h2>Yeni Görsel Yükle</h2>
          
          <div className={styles.uploadthingContainer}>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                // Yükleme tamamlandığında
                if (res && res.length > 0) {
                  alert("Görsel başarıyla yüklendi");
                  
                  // Görsel listesini güncelle
                  fetchImages();
                }
              }}
              onUploadError={(error) => {
                // Yükleme hatası
                alert("Görsel yüklenirken bir hata oluştu: " + error.message);
              }}
              className={styles.uploadButton}
            />
          </div>
        </div>

        <div className={styles.imagesGrid}>
          {images.length === 0 ? (
            <div className={styles.noImages}>
              <p>Henüz yüklenmiş görsel bulunmuyor</p>
            </div>
          ) : (
            images.map((img) => (
              <div key={img._id} className={styles.imageItem}>
                <div className={styles.imageWrapper}>
                  <img src={img.url} alt={img.name || "Görsel"} className={styles.image} />
                </div>
                <div className={styles.imageActions}>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(img._id)}
                  >
                    Sil
                  </button>
                  <button 
                    className={styles.copyUrlButton}
                    onClick={() => {
                      navigator.clipboard.writeText(img.url);
                      alert("Görsel URL'si panoya kopyalandı");
                    }}
                  >
                    URL Kopyala
                  </button>
                </div>
                {img.name && <p className={styles.imageName}>{img.name}</p>}
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .imagesContainer {
          padding: 20px;
        }
        
        .pageHeader {
          margin-bottom: 30px;
        }
        
        .pageTitle {
          font-size: 24px;
          color: #333;
        }
        
        .uploadSection {
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .uploadSection h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 18px;
          color: #333;
        }
        
        .uploadthingContainer {
          width: 100%;
        }
        
        .imagesGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .imageItem {
          display: flex;
          flex-direction: column;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        
        .imageItem:hover {
          transform: translateY(-5px);
        }
        
        .imageWrapper {
          height: 200px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
        }
        
        .image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .imageActions {
          display: flex;
          padding: 10px;
          gap: 5px;
        }
        
        .deleteButton, .copyUrlButton {
          flex: 1;
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .deleteButton {
          background-color: #f44336;
          color: white;
        }
        
        .deleteButton:hover {
          background-color: #d32f2f;
        }
        
        .copyUrlButton {
          background-color: #2196f3;
          color: white;
        }
        
        .copyUrlButton:hover {
          background-color: #0c84e4;
        }
        
        .imageName {
          padding: 0 10px 10px;
          margin: 0;
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .noImages {
          grid-column: 1 / -1;
          padding: 30px;
          text-align: center;
          background-color: #f5f5f5;
          border-radius: 8px;
          color: #757575;
        }
        
        /* UploadThing bileşeni için özel stiller */
        :global(.ut-button-container) {
          width: 100% !important;
        }
        
        :global(.ut-button) {
          background-color: #2196f3 !important;
          color: white !important;
          font-size: 14px !important;
          border-radius: 4px !important;
          padding: 12px !important;
          border: none !important;
          cursor: pointer !important;
          width: 100% !important;
        }
        
        :global(.ut-button:hover) {
          background-color: #0c84e4 !important;
        }
      `}</style>
    </div>
  );
}