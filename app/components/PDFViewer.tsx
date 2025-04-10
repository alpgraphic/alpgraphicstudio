import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styles from '../../app/admin/admin.module.css';

// PDF.js worker'ı için
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  onClose: () => void;
}

export default function PDFViewer({ pdfUrl, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);

  // Mobil cihaz tespiti
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // İlk yükleme
    checkIsMobile();
    
    // Ekran boyutu değiştiğinde yeniden kontrol et
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF yükleme hatası:', error);
    setError('PDF dokümanı yüklenirken bir hata oluştu.');
    setLoading(false);
  }

  // Önceki sayfa
  function goToPrevPage() {
    setPageNumber(pageNumber <= 1 ? 1 : pageNumber - 1);
  }

  // Sonraki sayfa
  function goToNextPage() {
    setPageNumber(pageNumber >= (numPages || 1) ? numPages || 1 : pageNumber + 1);
  }

  // Yakınlaştırma kontrolü
  function handleZoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  }

  function handleZoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  }

  function handleZoomReset() {
    setScale(1.0);
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} style={{ width: '90%', height: '90%' }}>
        <div className={styles.modalHeader}>
          <h2>PDF Önizleme</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.pdfControls}>
          <div className={styles.pdfNavigation}>
            <button 
              onClick={goToPrevPage} 
              disabled={pageNumber <= 1}
              className={styles.pdfNavButton}
            >
              &lt; Önceki
            </button>
            
            <span className={styles.pdfPageInfo}>
              {pageNumber} / {numPages || '-'}
            </span>
            
            <button 
              onClick={goToNextPage} 
              disabled={pageNumber >= (numPages || 1)}
              className={styles.pdfNavButton}
            >
              Sonraki &gt;
            </button>
          </div>
          
          <div className={styles.pdfZoom}>
            <button onClick={handleZoomOut} className={styles.pdfZoomButton}>-</button>
            <button onClick={handleZoomReset} className={styles.pdfZoomButton}>%{Math.round(scale * 100)}</button>
            <button onClick={handleZoomIn} className={styles.pdfZoomButton}>+</button>
          </div>
        </div>
        
        <div className={styles.pdfContainer}>
          {loading && (
            <div className={styles.pdfLoading}>
              <div className={styles.spinner}></div>
              <p>PDF yükleniyor...</p>
            </div>
          )}
          
          {error && (
            <div className={styles.pdfError}>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className={styles.refreshButton}
              >
                Yeniden Dene
              </button>
            </div>
          )}
          
          {!isMobile ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className={styles.pdfLoading}>Yükleniyor...</div>}
              className={styles.pdfDocument}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                className={styles.pdfPage}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          ) : (
            <div className={styles.mobilePdfMessage}>
              <p>PDF dosyasını indirmek için aşağıdaki bağlantıyı kullanabilirsiniz:</p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.pdfDownloadLink}
              >
                PDF Dosyasını İndir
              </a>
              <p className={styles.pdfMobileNote}>
                Not: Daha iyi bir görüntüleme deneyimi için bilgisayar kullanmanızı öneririz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}