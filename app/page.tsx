'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './page.module.css';
import { motion } from 'framer-motion';
import Head from 'next/head';
import HomePDFViewer from './components/HomePDFViewer';

// AuthForm bileşeni (Login ve Kayıt İşlemleri)
const AuthForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [currentBgIndex, setCurrentBgIndex] = useState<number>(1);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setInviteCode('');
    setError('');
    setSuccess('');
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/portfolio-login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (res.status === 200) {
        localStorage.setItem('portfolio-auth', 'true');
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.message || 'Hatalı giriş bilgileri.');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword || !email || !inviteCode) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/portfolio-register', {
        method: 'POST',
        body: JSON.stringify({ username, password, email, inviteCode }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setSuccess('Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');
        setTimeout(() => {
          setIsLoginMode(true);
          setSuccess('');
          setUsername('');
          setPassword('');
        }, 3000);
      } else {
        setError(data.message || 'Kayıt olurken bir hata oluştu.');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      isLoginMode ? handleLogin() : handleRegister();
    }
  };

  return (
    <div className={styles.authWrapper}>
      <h2 className={styles.authTitle}>
        {isLoginMode ? 'Portfolyo Giriş' : 'Hesap Oluştur'}
      </h2>
      <p className={styles.authSubtitle}>
        {isLoginMode 
          ? 'Portfolyo alanına erişmek için giriş yapın' 
          : 'Yeni bir portfolyo hesabı oluşturun'}
      </p>
      
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        
        {!isLoginMode && (
          <>
            <input
              type="email"
              placeholder="E-posta Adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <input
              type="text"
              placeholder="Davet Kodu"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyPress={handleKeyPress}
            />

          </>
        )}
        
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        
        {!isLoginMode && (
          <input
            type="password"
            placeholder="Şifreyi Tekrar Girin"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        )}
        
        <button 
          type="submit" 
          className={loading ? styles.authButtonLoading : ''}
          disabled={loading}
        >
          {loading 
            ? 'İşleniyor...' 
            : isLoginMode 
              ? 'Giriş Yap' 
              : 'Hesap Oluştur'}
        </button>
      </form>
      
      {error && <p className={styles.errorText}>{error}</p>}
      {success && <p className={styles.successText}>{success}</p>}
      
      <div className={styles.authToggle}>
        <p>
          {isLoginMode 
            ? 'Hesabınız yok mu?' 
            : 'Zaten hesabınız var mı?'}
        </p>
        <button onClick={toggleMode} className={styles.authToggleButton}>
          {isLoginMode ? 'Hesap Oluştur' : 'Giriş Yap'}
        </button>
      </div>
    </div>
  );
};

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
const PortfolioPage = ({ preloadedData }: any) => {
  const [companies, setCompanies] = useState<Company[]>(preloadedData?.companies || []);
  const [documents, setDocuments] = useState<Document[]>(preloadedData?.documents || []);
  const [currentBgIndex, setCurrentBgIndex] = useState<number>(1);
  
  useEffect(() => {
    setCompanies(preloadedData?.companies || []);
    setDocuments(preloadedData?.documents || []);
  }, [preloadedData]);
  
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Footer arka plan görseli değişimi için interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(prev => prev >= 22 ? 1 : prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Kategorileri oluşturmak için
  useEffect(() => {
    if (preloadedData?.companies?.length > 0) {
      const uniqueCategories = [
        ...new Set(
          preloadedData.companies
            .filter((company: Company) => company.category)
            .map((company: Company) => company.category?.toLowerCase().replace(/\s+/g, '-'))
        )
      ].filter(Boolean);

      if (uniqueCategories.length > 0) {
        setCategories(
          uniqueCategories
            .filter((id: string) => id !== 'genel' && id !== 'all')
            .map((id: string) => {
              const name = id
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              return { id, name };
            })
        );
      }
    }
  }, [preloadedData]);

  // Mobil cihaz tespiti
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

  useEffect(() => {
    if (selectedCompany && isMobile) {
      const switcher = document.querySelector(`.${styles.companySwitcher}`);
      if (switcher) {
        switcher.scrollTo({ left: 50, behavior: 'smooth' });
        setTimeout(() => {
          switcher.scrollTo({ left: 0, behavior: 'smooth' });
        }, 500);
      }
    }
  }, [selectedCompany, isMobile]);

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
        <img src="/logo.svg" alt="Studio Logo" className={styles.loadingLogo} />
        <div className={styles.progressBarWrapper}>
          <div className={styles.progressBar}></div>
        </div>
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

  return (
    <div className={styles.fullscreenPortfolio}>
      {/* Kozmik arka plan */}
      <div className={styles.cosmicBackground}></div>
      
      {/* Yıldız efektleri */}
      <div className={styles.stars}></div>
      
      {/* Güncellenen Ana menü ve navigasyon bar */}
      <header className={styles.topNavigation}>
        <div className={styles.navContainer}>
          <div className={styles.logoArea}>
            <img src="/logo.svg" alt="Studio Logo" className={styles.navLogo} />
          </div>
          
          <div className={styles.categoryNav}>
            {/* Tüm kategorileri görmek için "Tümü" butonu */}
            <button
              className={`${styles.categoryButton} ${activeFilter === 'all' ? styles.activeCategory : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              Anasayfa
            </button>
            
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
      </header>

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
            
            {/* PDF görüntüleyici */}
            <div className={styles.embeddedPdfViewer}>
              {latestDocument ? (
                <HomePDFViewer 
                  pdfUrl={latestDocument.filename}
                  companyName={selectedCompanyData?.name || 'Firma'}
                />
              ) : selectedCompanyData?.pdfUrl ? (
                <HomePDFViewer 
                  pdfUrl={selectedCompanyData.pdfUrl}
                  companyName={selectedCompanyData.name}
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
      
      {/* Basit Footer */}
      <footer className={styles.simpleFooter}>
        <div className={styles.footerBg} style={{ backgroundImage: `url(/bg${currentBgIndex}.jpeg)` }}></div>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <img src="/logo.svg" alt="Studio Logo" />
          </div>
          <div className={styles.footerInfo}>
            <div>
              <strong>E-posta:</strong> info@alpgraphicstudio.com
            </div>
            <div>
              <strong>Telefon:</strong> +90 535 727 4040
            </div>
            <div>
              <strong>Adres:</strong> Güvenevler mahallesi 29023 nolu cadde no:2A/7 Şehitkamil/Gaziantep 
            </div>
          </div>
          <div className={styles.footerCopyright}>
            &copy; {new Date().getFullYear()} alpgraphics studio. Tüm Hakları Saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Ana bileşen
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogo, setShowLogo] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [bgIndex, setBgIndex] = useState<number>(0); // 0'dan başlat (beyaz arka planla başlar)
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [introCompleted, setIntroCompleted] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [bgLoopActive, setBgLoopActive] = useState<boolean>(false);
  const imageCount = 22;
  const [preloadedData, setPreloadedData] = useState<{ companies: Company[]; documents: Document[] }>({
    companies: [],
    documents: [],
  });
  
  // Veri ön yükleme
  useEffect(() => {
    async function preloadData() {
      try {
        const companiesRes = await fetch('/api/companies');
        const companiesData = await companiesRes.json();

        const documentsRes = await fetch('/api/documents');
        const documentsData = await documentsRes.json();

        setPreloadedData({
          companies: (companiesData.data || []).sort((a, b) => a.order - b.order),
          documents: documentsData.data || [],
        });
      } catch (error) {
        console.error('Veri ön yüklemesi hatası:', error);
      }
    }

    preloadData();
  }, []);

  const services = [
    'Logo Tasarımı',
    'Grafik Tasarım',
    'Web Tasarımı & Geliştirme',
    'Mobil Uygulama Tasarımı (UI/UX)',
    'Danışmanlık & Kreatif Yönlendirme',
    'Kurumsal Kimlik & Marka Tasarımı',
  ];
  const trackRef = useRef<HTMLDivElement>(null);
  
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

  // LocalStorage kontrolü - önceden giriş yapıldı mı?
  useEffect(() => {
    const isAuth = localStorage.getItem('portfolio-auth') === 'true';
    if (isAuth) {
      setIsLoggedIn(true);
      setIntroCompleted(true);
    }
  }, []);
  
  // Auth ekranı arka plan değişim döngüsü
  useEffect(() => {
    if (!bgLoopActive) return;
    
    // Auth ekranı arka plan değişimi
    const bgInterval = setInterval(() => {
      setBgIndex((prev) => {
        // 0 ise, ilk görsele geç
        if (prev === 0) return 1;
        return (prev % imageCount) + 1;
      });
    }, 4000); // 4 saniyede bir değiştir
    
    return () => clearInterval(bgInterval);
  }, [bgLoopActive, imageCount]);
  
  // Intro animasyonu döngüsü
  useEffect(() => {
    // Eğer zaten giriş yapıldıysa animasyonu atlayalım
    if (isLoggedIn) return;
    
    // 1.4 saniye sonra logo göster
    const timer2 = setTimeout(() => setShowLogo(true), 1400);
    
    // 2 saniye sonra arka plan değişimine başla
    const timer4 = setTimeout(() => {
      const bgInterval = setInterval(() => {
        setBgIndex((prev) => {
          if (prev + 1 >= imageCount) {
            clearInterval(bgInterval);
            setShowLogo(false);
            
            // Mobil cihaz olup olmadığına bakmaksızın menüyü göster
            setShowMenu(true);
            
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
  }, [imageCount, isLoggedIn]);
  
  // Servis menüsü animasyonu
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
                  // Auth ekranını göster ve döngüyü aktifleştir
                  setBgLoopActive(true);
                  setShowAuth(true);
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
  }, [showMenu, services.length]);
  
  // 1. Giriş yapıldıysa PortfolioPage'i göster
  if (isLoggedIn) {
    return <PortfolioPage preloadedData={preloadedData} />;
  }

  // 2. Animasyon tamamlandı ve auth gerekiyorsa auth ekranını göster
  if (showAuth) {
    return (
      <main className={styles.main}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        
        {/* Kozmik arka plan */}
        <div className={styles.cosmicBackground}></div>
 
        {/* Arka planı sadece bgIndex > 0 olduğunda göster */}
        {bgIndex > 0 && (
          <img
            src={`/bg${bgIndex}.jpeg`}
            alt="Background"
            className={styles.bgImage}
          />
        )}
        
        {/* Gezegen ve yıldız efektleri */}
        <div className={styles.planet}></div>
        <div className={styles.stars}></div>
 
        <AuthForm 
          onSuccess={() => { 
            setIsLoggedIn(true); 
            setIntroCompleted(true); 
          }} 
        />
      </main>
    );
  }

  // 3. Diğer durumlarda intro animasyonu göster
  return (
    <main className={styles.main}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      
      {/* Kozmik arka plan */}
      <div className={styles.cosmicBackground}></div>
      
      <section className={styles.fullscreen}>
        {/* Arka planda değişen görseller - sadece bgIndex > 0 olduğunda göster */}
        {bgIndex > 0 && (
          <img
            src={`/bg${bgIndex}.jpeg`}
            alt="Background"
            className={styles.bgImage}
          />
        )}
        
        {/* Yıldız efektleri */}
        <div className={styles.stars}></div>
        
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
        
        {/* Logo - camda duruyormuş gibi efekt */}
        {showLogo && (
          <motion.div
            className={styles.logo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <div className={styles.glassOrb}>
              <img
                src="/logo.svg"
                alt="Studio Logo"
                className={styles.logoImage}
              />
            </div>
          </motion.div>
        )}
        
        {/* SUNUM - modern görünüm */}
        {showMenu && (
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