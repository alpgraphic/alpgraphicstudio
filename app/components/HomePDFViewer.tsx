import { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import styles from '/app/page.module.css';


// Worker'ı kendin set et
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.1.91/pdf.worker.min.js`;
interface HomePDFViewerProps {
  pdfUrl: string;
  companyName: string;
}

export default function HomePDFViewer({ pdfUrl, companyName }: HomePDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const options = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  }), []);
  // Cihaz tespiti ve ekran genişliği
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
      
      // iOS tespiti
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setIsIOS(isIOSDevice);
      
      // Ekran boyutuna göre ölçeklendirme ayarla
      if (width < 400) {
        setScale(0.5); // Çok küçük ekranlar için
      } else if (width < 768) {
        setScale(0.7); // Mobil cihazlar için
      } else if (width < 1024) {
        setScale(0.8); // Tablet cihazlar için
      } else {
        setScale(1.0); // Masaüstü için
      }
    };
    
    // İlk yükleme
    checkDevice();
    
    // Ekran boyutu değiştiğinde yeniden kontrol et
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
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

  return (
    <div className={styles.pdfViewerContainer} style={{ 
      position: 'relative', 
      width: '100%', 
      height: isMobile ? 'calc(100vh - 120px)' : '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {loading && (
        <div className={styles.pdfLoading || 'pdfLoading'} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '20px',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className={styles.spinner || 'spinner'} style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '50%',
            borderTopColor: '#e74c3c',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '10px' }}>PDF yükleniyor...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      {error && (
        <div className={styles.pdfError || 'pdfError'} style={{
          padding: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '5px',
          textAlign: 'center',
          margin: '20px'
        }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Yeniden Dene
          </button>
        </div>
      )}
      
      <div style={{ 
        width: '100%', 
        flex: 1,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch', // iOS için daha iyi kaydırma
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: numPages && numPages > 1 ? '60px' : '20px'
      }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null} // Kendi yükleme göstergemiz var
          className={styles.pdfDocument || 'pdfDocument'}
          options={options}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            className={styles.pdfPage || 'pdfPage'}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={windowWidth > 1200 ? 1000 : windowWidth - 40}
          />
        </Document>
      </div>
      
      {numPages && numPages > 1 && (
        <div style={{ 
          position: isMobile ? 'fixed' : 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px',
          borderTop: '1px solid #ddd',
          zIndex: 5
        }}>
          <button 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1}
            style={{ 
              padding: '5px 15px', 
              marginRight: '10px', 
              backgroundColor: pageNumber <= 1 ? '#ccc' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            &lt; Önceki
          </button>
          
          <span style={{ margin: '0 10px' }}>
            {pageNumber} / {numPages}
          </span>
          
          <button 
            onClick={goToNextPage} 
            disabled={pageNumber >= (numPages || 1)}
            style={{ 
              padding: '5px 15px', 
              marginLeft: '10px',
              backgroundColor: pageNumber >= (numPages || 1) ? '#ccc' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: pageNumber >= (numPages || 1) ? 'not-allowed' : 'pointer'
            }}
          >
            Sonraki &gt;
          </button>
        </div>
      )}
    </div>
  );
}