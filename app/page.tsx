'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './page.module.css';
import { motion } from 'framer-motion';



interface Category {
  id: string;
  name: string;
}

interface Company {
  _id: string;
  name: string;
  logo: string;
  category?: string;
  year?: string;
  pdfUrl?: string;
}

interface Document {
  _id: string;
  companyId: string;
  filename: string;
  createdAt: string;
}

// Portfolyo Sayfası bileşeni
const PortfolioPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    // Sadece istediğiniz kategorileri bırakın
    { id: 'kurumsal-kimlik', name: 'Kurumsal Kimlik' },
    { id: 'logo-tasarimi', name: 'Logo Tasarımı' }
  ]);

  // Verileri API'den çek
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Firmaları çek
        const companiesRes = await fetch('/api/companies');
        const companiesData = await companiesRes.json();
        
        // Dokümanları çek
        const documentsRes = await fetch('/api/documents');
        const documentsData = await documentsRes.json();
        
        if (companiesData.success) {
          setCompanies(companiesData.data);
          
          // Kategorileri firmalara göre güncelle
          const uniqueCategories = [
            ...new Set(
              companiesData.data
                .filter(company => company.category)
                .map(company => company.category?.toLowerCase().replace(/\s+/g, '-'))
            )
          ].filter(Boolean); // undefined değerleri filtrele
          
          // Kategori listesini güncelle
          if (uniqueCategories.length > 0) {
            setCategories(
              uniqueCategories
                .filter(id => id !== 'genel' && id !== 'all') // İstenmeyen kategorileri filtrele
                .map(id => {
                  const name = id
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  return { id, name };
                })
            );
          }
        }
        
        if (documentsData.success) {
          setDocuments(documentsData.data);
        }
        
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

  // Firma seçimi yapıldığında
  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
  };

  // Filtreleme işlemi
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setSelectedCompany(null);
  };

  // Filtrelenmiş firma listesi
  const filteredCompanies = activeFilter === 'all' 
    ? companies 
    : companies.filter(company => {
        if (!company.category) return false;
        const categorySlug = company.category.toLowerCase().replace(/\s+/g, '-');
        return categorySlug === activeFilter;
      });
  
  // Seçili firmayı bul
  const selectedCompanyData = companies.find(company => company._id === selectedCompany);
  
  // Seçili firmaya ait PDF'leri bul
  const companyDocuments = selectedCompany 
    ? documents.filter(doc => doc.companyId === selectedCompany)
    : [];
  
  // En son eklenen PDF'yi bul
  const latestDocument = companyDocuments.length > 0 
    ? companyDocuments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Portfolyo yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.refreshButton}>
          Yeniden Dene
        </button>
      </div>
    );
  }

  // PDF URL'ini parametrelerle birlikte hazırla
  const preparePdfUrl = (url: string) => {
    if (!url) return '';
    return `${url}#view=FitH&navpanes=0&toolbar=0&statusbar=0&scrollbar=0`;
  };

  return (
    <div className={styles.fullscreenPortfolio}>
      {/* Ana menü ve navigasyon bar */}
      <div className={styles.topNavigation}>
        <div className={styles.navContainer}>
          <div className={styles.logoArea}>
            <img src="/logo.svg" alt="Studio Logo" className={styles.navLogo} />
          </div>
          
          <div className={styles.categoryNav}>
            {categories.map((filter) => (
              <button
                key={filter.id}
                className={`${styles.categoryButton} ${activeFilter === filter.id ? styles.activeCategory : ''}`}
                onClick={() => handleFilterChange(filter.id)}
              >
                {filter.name}
              </button>
            ))}
          </div>
          

        </div>
      </div>

      {/* İçerik alanı */}
      <div className={styles.contentArea}>
        {!selectedCompany ? (
          // Firma grid görünümü
          <div className={styles.companyGrid}>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <motion.div
                  key={company._id}
                  className={styles.companyBox}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  onClick={() => handleCompanySelect(company._id)}
                >
                  <div className={styles.companyBoxInner}>
                    <div className={styles.companyLogoArea}>
                      <div className={styles.logoWrapper}>
                        <img 
                          src={company.logo} 
                          alt={`${company.name} Logo`} 
                          className={styles.autoWhiteLogo}
                          onError={(e) => {
                            e.currentTarget.src = "/logo.svg";
                          }}
                        />
                        <img 
                          src={`/bg${((filteredCompanies.indexOf(company) % 22) + 1)}.jpeg`} 
                          alt="Background"
                          className={styles.logoBackground}
                        />
                      </div>
                    </div>
                    <div className={styles.companyBoxFooter}>
                      <h3>{company.name}</h3>
                      <div className={styles.companyMeta}>
                        <span>{company.category}</span>
                        <span className={styles.yearTag}>{company.year}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className={styles.noCompanies}>
                <p>Bu kategoride firma bulunamadı.</p>
              </div>
            )}
          </div>
        ) : (
          // PDF görüntüleme ekranı
          <div className={styles.pdfViewerContainer}>
            {/* Üst firma navigasyonu */}
            <div className={styles.companyNavigation}>
              <button 
                className={styles.backToGridButton}
                onClick={() => setSelectedCompany(null)}
              >
                ← Listeye Dön
              </button>
              
              <div className={styles.companySwitcher}>
                {companies.map(company => (
                  <button
                    key={company._id}
                    className={`${styles.companyTab} ${selectedCompany === company._id ? styles.activeCompanyTab : ''}`}
                    onClick={() => setSelectedCompany(company._id)}
                  >
                    {company.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* PDF görüntüleyici - Güncellenmiş */}
            <div className={styles.embeddedPdfViewer}>
              {latestDocument ? (
                <iframe 
                  src={preparePdfUrl(latestDocument.filename)}
                  className={styles.pdfFrame}
                  title={`${selectedCompanyData?.name || 'Firma'} PDF`}
                  frameBorder="0"
                  scrolling="no"
                  seamless="seamless"
                  allowFullScreen={true}
                />
              ) : selectedCompanyData?.pdfUrl ? (
                <iframe 
                  src={preparePdfUrl(selectedCompanyData.pdfUrl)}
                  className={styles.pdfFrame}
                  title={`${selectedCompanyData.name} PDF`}
                  frameBorder="0"
                  scrolling="no"
                  seamless="seamless"
                  allowFullScreen={true}
                />
              ) : (
                <div className={styles.noPdfMessage}>
                  <p>Bu firma için henüz PDF doküman yüklenmemiş.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Ana bileşen
export default function Home() {
  const [showLogo, setShowLogo] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [bgIndex, setBgIndex] = useState<number>(0);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [introCompleted, setIntroCompleted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobileMessage, setShowMobileMessage] = useState<boolean>(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const imageCount = 22;
  const services = [
    'Logo Tasarımı',
    'Grafik Tasarım',
    'Web Tasarımı & Geliştirme',
    'Mobil Uygulama Tasarımı (UI/UX)',
    'Danışmanlık & Kreatif Yönlendirme',
    'Kurumsal Kimlik & Marka Tasarımı',
  ];
  const trackRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setPortfolioLoading(true);
  
        const companiesRes = await fetch('/api/companies');
        const companiesData = await companiesRes.json();
  
        const documentsRes = await fetch('/api/documents');
        const documentsData = await documentsRes.json();
  
        if (companiesData.success) {
          setCompanies(companiesData.data);
  
          const uniqueCategories = [
            ...new Set(
              companiesData.data
                .filter(company => company.category)
                .map(company => company.category?.toLowerCase().replace(/\s+/g, '-'))
            )
          ].filter(Boolean);
  
          if (uniqueCategories.length > 0) {
            setCategories(
              uniqueCategories
                .filter(id => id !== 'genel' && id !== 'all')
                .map(id => {
                  const name = id
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  return { id, name };
                })
            );
          }
        }
  
        if (documentsData.success) {
          setDocuments(documentsData.data);
        }
  
        setPortfolioError(null);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
        setPortfolioError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setPortfolioLoading(false);
      }
    }
  
    fetchData();
  }, []);
  
  // Cihaz tipini algılama
  useEffect(() => {
    const checkDeviceType = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // İlk yükleme kontrolü
    checkDeviceType();
    
    // Ekran boyutu değişimini izleme
    window.addEventListener('resize', checkDeviceType);
    
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);
  
  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setSelectedCompany(null);
  };

  // Animasyon döngüsü
  useEffect(() => {
    // Merhaba görünecek
    
    // 1.4 saniye sonra logo göster
    const timer2 = setTimeout(() => setShowLogo(true), 1400);
    
    // 2 saniye sonra arka plan değişimine başla
    const timer4 = setTimeout(() => {
      const bgInterval = setInterval(() => {
        setBgIndex((prev) => {
          // İlk fotoğraf geçişinde, mobil cihazdaysak mesajı göster
          if (prev === 0 && isMobile) {
            setShowMobileMessage(true);
          }
          
          if (prev + 1 >= imageCount) {
            clearInterval(bgInterval);
            setShowLogo(false);
            
            // Mobil cihaz değilse menüyü göster
            if (!isMobile) {
              setShowMenu(true);
            } else if (!introCompleted) {
              setIntroCompleted(true); // intro'yu tamamla
            }
            
            return prev;
          }
          return (prev + 1) % imageCount;
        });
      }, 150);
      
      return () => clearInterval(bgInterval);
    }, 2000);
    
    return () => {
      clearTimeout(timer2);
      clearTimeout(timer4);
    };
  }, [isMobile, imageCount, introCompleted]);
  
  useEffect(() => {
    if (showMenu) {
      const interval = setInterval(() => {
        setActiveItemIndex((prev) => {
          if (prev + 1 >= services.length) {
            clearInterval(interval);
            
            setTimeout(() => {
              const fadeOutMenu = setTimeout(() => {
                setShowMenu(false);
                
                setTimeout(() => {
                  // Mobil cihaz değilse intro'yu tamamla
                  if (!isMobile) {
                    setIntroCompleted(true);
                  }
                }, 500);
              }, 1000);
              
              return () => clearTimeout(fadeOutMenu);
            }, 2000);
            
            return prev;
          }
          return (prev + 1) % services.length;
        });
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [showMenu, services.length, isMobile]);
  
  // Eğer intro tamamlandıysa ve mobil cihaz DEĞİLSE portfolyo sayfasını göster
  if (introCompleted && !isMobile) {
    return (
      <PortfolioPage />
    );
  }
  
  return (
    <main className={styles.main}>
      <section className={styles.fullscreen}>
        {/* Arka planda değişen görseller */}
        {bgIndex > 0 && (
          <img
            src={`/bg${(bgIndex % imageCount) + 1}.jpeg`}
            alt="Background"
            className={styles.bgImage}
          />
        )}
        
        {/* Merhaba - sadece başlangıçta göster */}
        {bgIndex < 5 && (
          <motion.h1
            className={styles.merhaba}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 2 }}
          >
            merhaba
          </motion.h1>
        )}
        
        {/* Logo */}
        {showLogo && (
          <motion.div
            className={styles.logo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <img
              src="/logo.svg"
              alt="Studio Logo"
              className={styles.logoImage}
            />
          </motion.div>
        )}

        
        {/* Mobil bilgi mesajı - fotoğraflar görünmeye başladığında */}
        {isMobile && showMobileMessage && (
          <motion.div
            className={styles.mobileInfo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >

            <p className={styles.mobileText}>
              Web sitemizin tam deneyimi için lütfen masaüstü bir cihaz kullanın.
            </p>
          </motion.div>
        )}
        
        {/* SUNUM - Sadece masaüstünde */}
        {showMenu && !isMobile && (
          <motion.section 
            className={styles.menu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={styles.presentationTitle}>SUNUM</h2>
            <div className={styles.presentationItemWrapper}>
              <div className={styles.track} ref={trackRef}>
                {services.map((item, index) => (
                  <div
                    key={index}
                    className={`${styles.presentationItem} ${index === activeItemIndex ? styles.active : styles.inactive}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </section>
    </main>
  );
}