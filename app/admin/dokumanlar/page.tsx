'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '../admin.module.css';
import { UploadButton } from "@uploadthing/react"; // UploadThing bileşenini içe aktar
import PDFViewer from '../../components/PDFViewer';

export default function DocumentsPage() {
  type PDF = {
    _id?: string;
    name: string;
    companyId?: string;
    filename?: string;
    size?: string;
    createdAt?: string;
    uploadDate?: string;
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
  const [formData, setFormData] = useState<{
    name: string;
    companyId: string;
    file: File | null;
    fileUrl: string | null; // PDF dosyasının URL'sini saklamak için
  }>({
    name: '',
    companyId: '',
    file: null,
    fileUrl: null
  });
  
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
// Doküman sayısını çekme kısmını da benzer şekilde değiştirin
const documentsRes = await fetch('/api/documents');
        const documentsData = await documentsRes.json();
        
        if (documentsData.success) {
          setPdfs(documentsData.data || []);
        } else {
          console.error('Doküman verisi alınamadı:', documentsData.message);
        }
        
        setError(null);
      } catch (err: any) {
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
      file: null,
      fileUrl: null
    });
    setIsModalOpen(true);
  };
  
  // PDF düzenleme
  const openEditModal = (pdf: PDF) => {
    setSelectedPdf(pdf);
    setFormData({
      name: pdf.name || '',
      companyId: pdf.companyId || '',
      file: null,
      fileUrl: pdf.filename || null
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
          alert("Doküman başarıyla silindi!");
        } else {
          alert("Silme işlemi başarısız oldu: " + (data.message || "Bilinmeyen hata"));
        }
      } catch (err) {
        console.error('Silme hatası:', err);
        alert("Silme işlemi sırasında bir hata oluştu");
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
      alert("PDF URL bulunamadı!");
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
  
  // PDF'i kaydet
  const savePdf = async () => {
    // Form validasyonu
    if (!formData.name) {
      alert("Lütfen PDF adını girin.");
      return;
    }
    
    if (!formData.companyId) {
      alert("Lütfen bir firma seçin.");
      return;
    }
    
    // Dosya kontrolü - ya mevcut dosya URL'si ya da yeni bir dosya URL'si olmalı
    if (!selectedPdf?.filename && !formData.fileUrl) {
      alert("Lütfen bir PDF dosyası yükleyin.");
      return;
    }
    
    try {
      // PDF verilerini hazırla
      const pdfData = {
        name: formData.name,
        companyId: formData.companyId,
        filename: formData.fileUrl || selectedPdf?.filename, // UploadThing'den gelen URL veya mevcut URL
        // Dosya boyutunu UploadThing sonuçlarından alabiliriz veya varsayılan değer kullanabiliriz
        size: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(2)} MB` : (selectedPdf?.size || 'Boyut bilgisi yok')
      };
      
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
          throw new Error(`Güncelleme başarısız: ${updateRes.status} ${updateRes.statusText}`);
        }
        
        const updateData = await updateRes.json();
        
        if (updateData.success) {
          // Listeyi güncelle
          setPdfs(prev => prev.map(pdf => 
            pdf._id === selectedPdf._id ? updateData.data : pdf
          ));
          alert("PDF başarıyla güncellendi!");
        } else {
          throw new Error('Güncelleme başarısız: ' + (updateData.message || 'Bilinmeyen hata'));
        }
      } else {
        // Yeni PDF ekle
        const createRes = await fetch(`/api/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pdfData)
        });
        
        if (!createRes.ok) {
          throw new Error(`Ekleme başarısız: ${createRes.status} ${createRes.statusText}`);
        }
        
        const createData = await createRes.json();
        
        if (createData.success) {
          // Listeye yeni PDF'i ekle
          setPdfs(prev => [...prev, createData.data]);
          alert("PDF başarıyla eklendi!");
        } else {
          throw new Error('Ekleme başarısız: ' + (createData.message || 'Bilinmeyen hata'));
        }
      }
      
      // Başarılı işlem sonrası modalı kapat
      closeModal();
      
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      alert(err.message || "Kaydetme işlemi sırasında bir hata oluştu");
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
                  
                  {/* UploadThing Entegrasyonu */}
                  <div className={styles.uploadthingContainer}>
                    {formData.fileUrl || selectedPdf?.filename ? (
                      <div className={styles.uploadedFileInfo}>
                        <p className={styles.currentFile}>
                          {formData.fileUrl ? "Yeni dosya yüklendi" : "Mevcut dosya"}: 
                          {formData.fileUrl || selectedPdf?.filename?.split('/').pop()}
                        </p>
                        <button 
                          type="button"
                          className={styles.removeFileButton}
                          onClick={() => setFormData({...formData, fileUrl: null})}
                        >
                          Dosyayı Kaldır
                        </button>
                      </div>
                    ) : (
                      <UploadButton
                        endpoint="pdfUploader"
                        onClientUploadComplete={(res) => {
                          // Yükleme tamamlandığında
                          if (res && res.length > 0) {
                            setFormData({
                              ...formData, 
                              fileUrl: res[0].ufsUrl,
                              file: new File([], res[0].name, { type: 'application/pdf' })
                            });
                            
                            alert("PDF dosyası başarıyla yüklendi");
                          }
                        }}
                        onUploadError={(error) => {
                          // Yükleme hatası
                          alert("PDF yüklenirken bir hata oluştu: " + error.message);
                        }}
                        className={styles.uploadButton}
                      />
                    )}
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
  <PDFViewer 
    pdfUrl={previewPdfUrl} 
    onClose={closePdfPreview} 
  />
)}
    </div>
  );
}