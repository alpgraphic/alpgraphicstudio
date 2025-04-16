import { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import styles from '/app/page.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.mjs';

interface HomePDFViewerProps {
  pdfUrl: string;
  companyName: string;
}

export default function HomePDFViewer({ pdfUrl, companyName }: HomePDFViewerProps) {
  // Temel durumlar
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ekran ve cihaz durumları
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(0);
  
  // PDF görüntüleme ayarları
  const options = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  }), []);

  // Ekran boyutunu takip eden effect
  useEffect(() => {
    const checkDeviceAndSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowWidth(width);
      setWindowHeight(height);
      setIsMobile(width < 768);
    };
    
    // İlk yükleme
    checkDeviceAndSize();
    
    // Ekran değişiklikleri için listener'lar
    window.addEventListener('resize', checkDeviceAndSize);
    
    return () => {
      window.removeEventListener('resize', checkDeviceAndSize);
    };
  }, []);

  // PDF URL'i değiştiğinde ilk sayfaya dön
  useEffect(() => {
    setCurrentPage(1);
  }, [pdfUrl]);

  // PDF yükleme işleyicileri
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF yükleme hatası:', error);
    setError('PDF dokümanı yüklenirken bir hata oluştu.');
    setLoading(false);
  }

  // Sayfa geçiş işleyicileri
  function goToPrevPage() {
    setCurrentPage(prevPage => (prevPage <= 1 ? 1 : prevPage - 1));
  }

  function goToNextPage() {
    setCurrentPage(prevPage => (!numPages || prevPage >= numPages ? prevPage : prevPage + 1));
  }

  // Sayfa numarası gösterimi
  const getPageDisplay = () => {
    if (!numPages) return "0/0";
    return `${currentPage}/${numPages}`;
  };

  // PDF sayfa boyutunu hesapla - hem genişlik hem yüksekliğe göre dinamik olarak
  const calculatePageDimensions = () => {
    // Toplam alanın yaklaşık %90'ını kullan
    const maxWidth = windowWidth * 0.9;
    // Navigasyon çubuğu ve diğer UI elementleri için alan bırakarak yüksekliği hesapla
    const maxHeight = windowHeight * 0.75;
    
    // Mobil cihazlarda daha küçük değerler kullan
    const width = isMobile ? Math.min(maxWidth, 580) : Math.min(maxWidth, 800);
    
    return {
      width,
      height: maxHeight
    };
  };

  const pageDimensions = calculatePageDimensions();

  return (
    <div className={styles.pdfViewerContainer || "pdfViewerContainer"} style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
    }}>
      {/* Yükleme göstergesi */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '24px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '50%',
            borderTopColor: '#3498db',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: 500 }}>PDF yükleniyor...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      {/* Hata mesajı */}
      {error && (
        <div style={{
          padding: '24px',
          backgroundColor: '#fff5f5',
          color: '#e53e3e',
          borderRadius: '8px',
          textAlign: 'center',
          margin: '24px',
          maxWidth: '80%',
          boxShadow: '0 2px 10px rgba(229, 62, 62, 0.1)'
        }}>
          <p style={{ fontWeight: 500 }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              marginTop: '16px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background-color 0.2s ease'
            }}
          >
            Yeniden Dene
          </button>
        </div>
      )}
      
      {/* PDF görüntüleme alanı */}
      <div style={{ 
        width: '100%',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 10px 80px 10px', // Alt navigasyon için boşluk
        overflow: 'auto',
        backgroundColor: '#f8f9fa'
      }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          options={options}
        >
          <div style={{
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white',
            maxWidth: '100%'
          }}>
            <Page
              pageNumber={currentPage}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={pageDimensions.width}
              height={pageDimensions.height}
              className={styles.pdfPage || 'pdfPage'}
              scale={1}
            />
          </div>
        </Document>
      </div>
      
      {/* Sayfa navigasyon butonları */}
      {numPages && numPages > 1 && (
        <div style={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.03)',
          zIndex: 5,
          backdropFilter: 'blur(5px)'
        }}>
          <button 
            onClick={goToPrevPage} 
            disabled={currentPage <= 1}
            className={styles.pdfNavigationButton}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: currentPage <= 1 ? '#e2e8f0' : '#000000',
              color: currentPage <= 1 ? '#718096' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              fontSize: '15px'
            }}
          >
            <span style={{ marginRight: '6px' }}>&#8592;</span> Önceki
          </button>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontWeight: 600,
            color: '#2d3748',
            background: '#edf2f7',
            padding: '8px 16px',
            borderRadius: '24px',
            fontSize: '15px'
          }}>
            {getPageDisplay()}
          </div>
          
          <button 
            onClick={goToNextPage} 
            disabled={!numPages || currentPage >= numPages}
            className={styles.pdfNavigationButton}
            style={{ 
              padding: '10px 20px',
              backgroundColor: !numPages || currentPage >= numPages ? '#e2e8f0' : '#000000',
              color: !numPages || currentPage >= numPages ? '#718096' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !numPages || currentPage >= numPages ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              fontSize: '15px'
            }}
          >
            Sonraki <span style={{ marginLeft: '6px' }}>&#8594;</span>
          </button>
        </div>
      )}
    </div>
  );
}