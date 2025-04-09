'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '../admin.module.css';

export default function DocumentsPage() {
  type PDF = {
    name: string;
    companyId?: string;
    // başka özellikler varsa buraya ekle
  };
  
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [companies, setCompanies] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState<PDF | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    file: null
  });
  
  // Dosya referansı
  const fileInputRef = useRef(null);
  
  // Verileri API'den çek
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Firmaları çek
        const companiesRes = await fetch('/api/companies');
        const companiesData = await companiesRes.json();
        
        if (companiesData.success) {
          setCompanies(companiesData.data || []);
        } else {
          console.error('Firma verisi alınamadı:', companiesData.message);
        }
        
        // Dokümanları çek
        const documentsRes = await fetch('/api/documents');
        const documentsData = await documentsRes.json();
        
        if (documentsData.success) {
          setPdfs(documentsData.data || []);
        } else {
          console.error('Doküman verisi alınamadı:', documentsData.message);
        }
        
        setError(null);
      } catch (err: any) {
  setError('Veriler yüklenirken bir hata oluştu: ' + err.message);

        console.error('Veri çekme hatası:', err);
        setError('Veriler yüklenirken bir hata oluştu: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Filtrelenmiş PDF listesi
  const filteredPdfs = pdfs.filter(pdf => {
    return (
      pdf?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCompany === '' || pdf.companyId?.toString() === filterCompany)
    );
  });
  
  // Yeni PDF ekleme
  const openAddModal = () => {
    setSelectedPdf(null);
    setFormData({
      name: '',
      companyId: '',
      file: null
    });
    setIsModalOpen(true);
  };
  
  // PDF düzenleme
  const openEditModal = (pdf: PDF) => {
    setSelectedPdf(pdf);
    setFormData({
      name: pdf.name || '',
      companyId: pdf.companyId || '',
      file: null
    });
    setIsModalOpen(true);
  };
  
  // Form değerlerini güncelle
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Dosya yükleme
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        file: e.target.files[0]
      }));
    }
  };
  
  // PDF silme
  const deletePdf = async (id) => {
    if (!id) {
      alert('Geçersiz doküman ID!');
      return;
    }
    
    if (confirm('Bu PDF dosyasını silmek istediğinize emin misiniz?')) {
      try {
        const res = await fetch(`/api/documents?id=${id}`, {
          method: 'DELETE'
        });
        
        const data = await res.json();
        
        if (data.success) {
          // Başarılı silme işleminden sonra listeyi güncelle
          setPdfs(prev => prev.filter(pdf => pdf._id !== id));
          alert('Doküman başarıyla silindi!');
        } else {
          alert('Silme işlemi başarısız oldu: ' + (data.message || 'Bilinmeyen hata'));
        }
      } catch (err) {
        console.error('Silme hatası:', err);
        alert('Silme işlemi sırasında bir hata oluştu: ' + err.message);
      }
    }
  };
  
  // Modal kapatma
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // PDF önizleme
  const openPdfPreview = (pdfUrl) => {
    if (!pdfUrl) {
      alert('PDF URL bulunamadı!');
      return;
    }
    
    setPreviewPdfUrl(pdfUrl);
    setIsPdfPreviewOpen(true);
  };
  
  // PDF önizleme kapatma
  const closePdfPreview = () => {
    setIsPdfPreviewOpen(false);
    setPreviewPdfUrl('');
  };
  
  // Dosya seçim diyaloğunu aç
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // PDF'i kaydet
  const savePdf = async () => {
    // Form validasyonu
    if (!formData.name) {
      alert('Lütfen PDF adını girin.');
      return;
    }
    
    if (!formData.companyId) {
      alert('Lütfen bir firma seçin.');
      return;
    }
    
    if (!selectedPdf && !formData.file) {
      alert('Lütfen bir PDF dosyası seçin.');
      return;
    }
    
    try {
      let fileUrl = selectedPdf ? selectedPdf.filename : null;
      
      // Yeni dosya yüklendiyse
      if (formData.file) {
        const fileForm = new FormData();
        fileForm.append('file', formData.file);
        fileForm.append('companyId', formData.companyId);
        fileForm.append('name', formData.name);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: fileForm
        });
        
        if (!uploadRes.ok) {
          alert(`Yükleme başarısız: ${uploadRes.status} ${uploadRes.statusText}`);
          return;
        }
        
        const uploadData = await uploadRes.json();
        
        if (!uploadData.success) {
          alert('Dosya yüklenemedi: ' + (uploadData.error || 'Bilinmeyen hata'));
          return;
        }
        
        fileUrl = uploadData.fileUrl;
        
        // Doküman doğrudan oluşturulduysa, listeyi güncelleyip modalı kapat
        if (uploadData.document) {
          setPdfs(prev => [...prev, uploadData.document]);
          closeModal();
          alert('PDF başarıyla yüklendi!');
          return;
        }
      }
      
      // Eğer upload/document otomatik oluşturulmadıysa, manuel oluştur
      if (!uploadData?.document) {
        // PDF verilerini kaydet
        const pdfData = {
          name: formData.name,
          companyId: formData.companyId,
          filename: fileUrl,
          size: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(2)} MB` : (selectedPdf ? selectedPdf.size : '0 MB')
        };
        
        // Düzenleme veya yeni ekleme
        if (selectedPdf) {
          // Mevcut PDF'i güncelle
          const updateRes = await fetch(`/api/documents`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: selectedPdf._id,
              ...pdfData
            })
          });
          
          if (!updateRes.ok) {
            alert(`Güncelleme başarısız: ${updateRes.status} ${updateRes.statusText}`);
            return;
          }
          
          const updateData = await updateRes.json();
          
          if (updateData.success) {
            // Listeyi güncelle
            setPdfs(prev => prev.map(pdf => 
              pdf._id === selectedPdf._id ? updateData.data : pdf
            ));
            alert('PDF başarıyla güncellendi!');
          } else {
            alert('Güncelleme başarısız: ' + (updateData.message || 'Bilinmeyen hata'));
            return;
          }
        } else {
          // Yeni PDF ekle
          const createRes = await fetch('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pdfData)
          });
          
          if (!createRes.ok) {
            alert(`Ekleme başarısız: ${createRes.status} ${createRes.statusText}`);
            return;
          }
          
          const createData = await createRes.json();
          
          if (createData.success) {
            // Listeye yeni PDF'i ekle
            setPdfs(prev => [...prev, createData.data]);
            alert('PDF başarıyla eklendi!');
          } else {
            alert('Ekleme başarısız: ' + (createData.message || 'Bilinmeyen hata'));
            return;
          }
        }
      }
      
      // Başarılı işlem sonrası modalı kapat
      closeModal();
      
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      alert('Kaydetme işlemi sırasında bir hata oluştu: ' + err.message);
    }
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Veriler yükleniyor...</p>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Hata!</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={styles.refreshButton}
        >
          Sayfayı Yenile
        </button>
      </div>
    );
  }

  // Firma adlarını al
  const getCompanyName = (companyId) => {
    if (!companyId) return 'Firma Seçilmedi';
    const company = companies.find(c => c._id === companyId);
    return company?.name || 'Bilinmeyen Firma';
  };

// Tarihi formatla
const formatDate = (dateString) => {
  if (!dateString) return 'Tarih Bilgisi Yok';
  try {
    return new Date(dateString).toLocaleDateString('tr-TR');
  } catch {
    return dateString;
  }
};

  return (
    <div className={styles.documentsContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>PDF Dokümanlar</h1>
        <button className={styles.addButton} onClick={openAddModal}>+ Yeni PDF Ekle</button>
      </div>
      
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="PDF ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterBox}>
          <select 
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Tüm Firmalar</option>
            {companies.map(company => (
              <option key={company._id} value={company._id}>
                {company?.name || 'Bilinmeyen Firma'}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredPdfs.length === 0 ? (
        <div className={styles.noDocuments}>
          <p>Henüz PDF doküman bulunmuyor veya filtrelere uygun sonuç yok.</p>
          <button className={styles.addButton} onClick={openAddModal}>
            İlk Dokümanı Ekle
          </button>
        </div>
      ) : (
        <div className={styles.documentsGrid}>
          {filteredPdfs.map(pdf => (
            <div key={pdf._id} className={styles.documentCard}>
              <div className={styles.documentIcon}>
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path fill="#e74c3c" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                  <path fill="white" d="M9 8h6v2H9zm0 4h6v2H9zm0 4h6v2H9z"/>
                </svg>
              </div>
              
              <div className={styles.documentInfo}>
                <h3 className={styles.documentName}>{pdf.name || 'İsimsiz Doküman'}</h3>
                <p className={styles.documentMeta}>
                  <span className={styles.documentCompany}>{getCompanyName(pdf.companyId)}</span>
                  <span className={styles.documentSize}>{pdf.size || 'Boyut bilgisi yok'}</span>
                </p>
                <p className={styles.documentDate}>
                  Yükleme: {formatDate(pdf.createdAt || pdf.uploadDate)}
                </p>
              </div>
              
              <div className={styles.documentActions}>
                <button 
                  className={styles.viewButton}
                  onClick={() => openPdfPreview(pdf.filename)}
                  disabled={!pdf.filename}
                >
                  Önizle
                </button>
                <button 
                  className={styles.editButton}
                  onClick={() => openEditModal(pdf)}
                >
                  Düzenle
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={() => deletePdf(pdf._id)}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* PDF Ekleme/Düzenleme Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{selectedPdf ? 'PDF Düzenle' : 'Yeni PDF Ekle'}</h2>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
            </div>
            <div className={styles.modalContent}>
              <form className={styles.documentForm} onSubmit={(e) => { e.preventDefault(); savePdf(); }}>
                <div className={styles.formGroup}>
                  <label>PDF Adı <span className={styles.requiredField}>*</span></label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={styles.formInput}
                    placeholder="Örn: Marka Kılavuzu"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Firma <span className={styles.requiredField}>*</span></label>
                  <select 
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleFormChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">Firma Seçin</option>
                    {companies.map(company => (
                      <option key={company._id} value={company._id}>
                        {company?.name || 'Bilinmeyen Firma'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>
                    PDF Dosyası 
                    {!selectedPdf && <span className={styles.requiredField}>*</span>}
                  </label>
                  <div className={styles.fileUploader}>
                    <div className={styles.uploadPreview}>
                      {formData.file ? (
                        <p className={styles.currentFile}>
                          Seçilen dosya: {formData.file.name} ({(formData.file.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      ) : selectedPdf?.filename ? (
                        <p className={styles.currentFile}>
                          Mevcut dosya: {selectedPdf.filename.split('/').pop()}
                        </p>
                      ) : (
                        <p>Henüz dosya seçilmedi.</p>
                      )}
                    </div>
                    <div className={styles.uploadButton} onClick={triggerFileUpload}>
                      <span>PDF Dosyası Yükle</span>
                      <input 
                        type="file" 
                        accept=".pdf"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        required={!selectedPdf}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={closeModal}>İptal</button>
              <button className={styles.saveButton} onClick={savePdf}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
      
      {/* PDF Önizleme Modal */}
      {isPdfPreviewOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ width: '90%', height: '90%' }}>
            <div className={styles.modalHeader}>
              <h2>PDF Önizleme</h2>
              <button className={styles.closeButton} onClick={closePdfPreview}>×</button>
            </div>
            <div className={styles.modalContent} style={{ flex: 1, padding: 0 }}>
              <iframe 
                src={previewPdfUrl} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="PDF Önizleme"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}