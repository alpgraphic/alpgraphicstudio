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
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  
  // Uyarı mesajı durumu
  const [showRotateMessage, setShowRotateMessage] = useState<boolean>(false);

  // PDF görüntüleme ayarları
  const options = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  }), []);

  // Ekran boyutunu ve yönünü takip eden effect
  useEffect(() => {
    const checkDeviceAndOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowWidth(width);
      setIsMobile(width < 768);
      setIsLandscape(width > height);
    };
    
    // İlk yükleme
    checkDeviceAndOrientation();
    
    // Ekran değişiklikleri için listener'lar
    window.addEventListener('resize', checkDeviceAndOrientation);
    window.addEventListener('orientationchange', checkDeviceAndOrientation);
    
    return () => {
      window.removeEventListener('resize', checkDeviceAndOrientation);
      window.removeEventListener('orientationchange', checkDeviceAndOrientation);
    };
  }, []);

  // Mobil cihazlar için döndürme uyarısını gösteren effect
  useEffect(() => {
    if (isMobile && !isLandscape) {
      setShowRotateMessage(true);
      
      // 5 saniye sonra uyarıyı kaldır
      const timer = setTimeout(() => {
        setShowRotateMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setShowRotateMessage(false);
    }
  }, [isMobile, isLandscape]);

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
    setCurrentPage(prevPage => {
      // İlk sayfada isek geri gidemeyiz
      if (prevPage <= 1) return 1;
      
      // Eğer 2. veya 3. sayfada isek, 1. sayfaya git (kapak sayfası)
      if (prevPage <= 3) return 1;
      
      // Diğer durumlarda 2 sayfa geri git (kitap görünümünde 2 sayfa atlıyoruz)
      return prevPage - 2;
    });
  }

  function goToNextPage() {
    setCurrentPage(prevPage => {
      // Son sayfada isek ileri gidemeyiz
      if (!numPages || prevPage >= numPages) return prevPage;
      
      // İlk sayfada isek (kapak sayfası), 2. sayfaya git
      if (prevPage === 1) return 2;
      
      // Diğer durumlarda 2 sayfa ileri git
      return Math.min(numPages, prevPage + 2);
    });
  }

  // Mevcut sayfa çiftini belirle
  const getCurrentPages = () => {
    if (!numPages) return [1, null];
    
    // İlk sayfa her zaman tek başına (kapak sayfası)
    if (currentPage === 1) return [1, null];
    
    // 2. sayfadan itibaren çift sayfalar göster
    const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const rightPage = leftPage + 1 <= numPages ? leftPage + 1 : null;
    
    return [leftPage, rightPage];
  };

  // Sayfa numarası gösterimi
  const getPageDisplay = () => {
    if (!numPages) return "0/0";
    
    // Toplam kitap sayfası (çift sayfa olarak)
    const totalBookPages = Math.ceil((numPages - 1) / 2) + 1; // İlk sayfa + diğer çift sayfalar
    
    // Mevcut kitap sayfası
    let currentBookPage = 1; // İlk sayfa için
    if (currentPage > 1) {
      currentBookPage = 1 + Math.ceil((currentPage - 1) / 2);
    }
    
    return `${currentBookPage}/${totalBookPages}`;
  };

  return (
    <div className={styles.pdfViewerContainer || "pdfViewerContainer"} style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh',
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
      
      {/* Ekran döndürme uyarısı - 5 saniye sonra kaybolur */}
      {showRotateMessage && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(52, 152, 219, 0.95)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 100,
          textAlign: 'center',
          maxWidth: '90%',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h10z"/>
              <path d="M12 17v.01"/>
              <path d="m11 7 2 2 2-2"/>
              <path d="M15 11H9"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '16px', margin: 0 }}>En iyi görünüm için ekranınızı yatay çevirin</p>
          </div>
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
      
      {/* PDF görüntüleme alanı */}
      <div style={{ 
        width: '100%', 
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0px 0 170px 0', // Alt butonlar için boşluk
        backgroundColor: '#f8f9fa',
        overflow: 'hidden'
      }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          options={options}
        >
          {(() => {
            // Mevcut sayfa çiftini al
            const [leftPage, rightPage] = getCurrentPages();
            
            // Kapak sayfası (ilk sayfa)
            if (leftPage === 1 && !rightPage) {
              return (
                <div style={{
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  maxWidth: '100%'
                }}>
                  <Page
                    pageNumber={1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={windowWidth > 1200 ? 750 : Math.min(windowWidth - 200, 300)}                    className={styles.pdfPage || 'pdfPage'}
                  />
                </div>
              );
            }
            
            // İkili sayfa görünümü (kitap görünümü)
            return (
              <div style={{
                display: 'flex',
                flexDirection: isLandscape || !isMobile ? 'row' : 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1px',
                width: '100%',
                maxWidth: '1600px'
              }}>
                {/* Sol sayfa */}
                <div style={{
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px 0 0 8px',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <Page
                    pageNumber={leftPage}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={(isLandscape || !isMobile) ? (windowWidth > 1600 ? 600 : Math.min((windowWidth - 200) / 2, 500)) : Math.min(windowWidth - 80, 650)}
                    className={styles.pdfPage || 'pdfPage'}
                  />
                </div>
                
                {/* Sağ sayfa */}
                {rightPage && (
                  <div style={{
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                    borderRadius: '0 8px 8px 0',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'flex-start'
                  }}>
                    <Page
                      pageNumber={rightPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={(isLandscape || !isMobile) ? (windowWidth > 1600 ? 600 : Math.min((windowWidth - 200) / 2, 500)) : Math.min(windowWidth - 80, 650)}

                      className={styles.pdfPage || 'pdfPage'}
                    />
                  </div>
                )}
              </div>
            );
          })()}
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
            style={{ 
              padding: '10px 20px', 
              backgroundColor: currentPage <= 1 ? '#e2e8f0' : '#3498db',
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
            style={{ 
              padding: '10px 20px',
              backgroundColor: !numPages || currentPage >= numPages ? '#e2e8f0' : '#3498db',
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