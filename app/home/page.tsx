'use client';

import { useEffect, useState } from 'react';
import styles from './home.module.css';

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string>('/export.pdf'); // Varsayılan PDF dosyası

  // Eğer API'den PDF URL'si alınacaksa
  useEffect(() => {
    async function loadPdfData() {
      try {
        // Örnek: API'den PDF URL'si alıyoruz
        // const response = await fetch('/api/pdf-document');
        // const data = await response.json();
        // if (data && data.url) {
        //   setPdfUrl(data.url);
        // }
      } catch (error) {
        console.error('PDF veri yükleme hatası:', error);
      }
    }

    // loadPdfData();
  }, []);

  return (
    <div className={styles.fullScreenContainer}>
      {/* Basit bir yükleme göstergesi */}
      {!pdfUrl && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>PDF yükleniyor...</p>
        </div>
      )}
      
      {/* Tam ekran PDF görüntüleyici */}
      {pdfUrl && (
        <div className={styles.pdfContainer}>
          <iframe 
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
            className={styles.pdfViewer} 
            title="PDF Görüntüleyici"
            frameBorder="0"
          />
        </div>
      )}
    </div>
  );
}