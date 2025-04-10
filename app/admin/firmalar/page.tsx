'use client';

import { useEffect, useState, useRef } from 'react';

// Firma tipi için arayüz tanımlama
interface Company {
  _id: string;
  name: string;
  logo?: string;
  cover?: string;
  category?: string;
  year?: string;
  pdfUrl?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyCover, setCompanyCover] = useState('');
  const [companyCategory, setCompanyCategory] = useState('Genel');
  const [companyYear, setCompanyYear] = useState(new Date().getFullYear().toString());
  const [companyPdfUrl, setCompanyPdfUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/companies`);      
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data);
      } else {
        setError('Firma listesi alınamadı.');
      }
    } catch (err) {
      console.error(err);
      setError('Firma listesi alınırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise<string>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = async () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.fileUrl);
          } else {
            reject(new Error('Dosya yüklenemedi'));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Ağ hatası'));
        };

        xhr.open('POST', `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, true);        
        xhr.send(formData);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Lütfen bir firma adı girin.');
      return;
    }

    const logoFile = logoInputRef.current?.files?.[0];
    const coverFile = coverInputRef.current?.files?.[0];

    let logo = companyLogo;
    let cover = companyCover;

    try {
      setUploading(true);
      setUploadProgress(0);

      if (logoFile) {
        logo = await uploadFile(logoFile);
      }

      if (coverFile) {
        cover = await uploadFile(coverFile);
      }

      if (isEditing) {
        // Firma güncelleme - mevcut PUT API'sini kullan
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/companies`, {          
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: editingId,
            name: companyName, 
            logo, 
            cover,
            category: companyCategory,
            year: companyYear,
            pdfUrl: companyPdfUrl
          }),
        });

        const data = await res.json();
        if (data.success) {
          resetForm();
          fetchCompanies();
        } else {
          setError('Firma güncellenemedi.');
        }
      } else {
        // Yeni firma ekleme
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/companies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: companyName, 
            logo, 
            cover,
            category: companyCategory,
            year: companyYear,
            pdfUrl: companyPdfUrl
          }),
        });

        const data = await res.json();
        if (data.success) {
          resetForm();
          fetchCompanies();
        } else {
          setError('Firma eklenemedi.');
        }
      }
    } catch (err) {
      console.error(err);
      setError(isEditing ? 'Firma güncellenirken hata oluştu.' : 'Firma eklenirken hata oluştu.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (company: Company) => {
    setCompanyName(company.name);
    setCompanyLogo(company.logo || '');
    setCompanyCover(company.cover || '');
    setCompanyCategory(company.category || 'Genel');
    setCompanyYear(company.year || new Date().getFullYear().toString());
    setCompanyPdfUrl(company.pdfUrl || '');
    setEditingId(company._id);
    setIsEditing(true);
    
    // Form alanına odaklan
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;
    
    try {
      // Mevcut DELETE API'sini kullan (query parameter ile)
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/companies?id=${companyToDelete._id}`, {        
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        fetchCompanies();
        setShowDeleteConfirm(false);
        setCompanyToDelete(null);
      } else {
        setError('Firma silinemedi.');
      }
    } catch (err) {
      console.error(err);
      setError('Firma silinirken hata oluştu.');
    }
  };

  const confirmDelete = (company: Company) => {
    setCompanyToDelete(company);
    setShowDeleteConfirm(true);
  };

  const resetForm = () => {
    setCompanyName('');
    setCompanyLogo('');
    setCompanyCover('');
    setCompanyCategory('Genel');
    setCompanyYear(new Date().getFullYear().toString());
    setCompanyPdfUrl('');
    setIsEditing(false);
    setEditingId('');
    if (logoInputRef.current) logoInputRef.current.value = '';
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  return (
    <div className="companies-container">
      <div className="companies-form">
        <h1 className="companies-title">Firmalar</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Firma Adı</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Firma adını girin"
              className="form-input"
              disabled={uploading}
            />
          </div>

          <div>
            <label>
              Firma Logosu
              {companyLogo && <span className="small-text"> (Mevcut logo var)</span>}
            </label>
            <input
              type="file"
              ref={logoInputRef}
              accept="image/*"
              className="form-input"
              disabled={uploading}
            />
          </div>

          <div>
            <label>
              Firma Kapak Resmi
              {companyCover && <span className="small-text"> (Mevcut kapak resmi var)</span>}
            </label>
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              className="form-input"
              disabled={uploading}
            />
          </div>

          <div>
            <label>Kategori</label>
            <input
              type="text"
              value={companyCategory}
              onChange={(e) => setCompanyCategory(e.target.value)}
              placeholder="Kategori"
              className="form-input"
              disabled={uploading}
            />
          </div>

          <div>
            <label>Yıl</label>
            <input
              type="text"
              value={companyYear}
              onChange={(e) => setCompanyYear(e.target.value)}
              placeholder="Yıl"
              className="form-input"
              disabled={uploading}
            />
          </div>

          <div>
            <label>PDF URL (İsteğe bağlı)</label>
            <input
              type="text"
              value={companyPdfUrl}
              onChange={(e) => setCompanyPdfUrl(e.target.value)}
              placeholder="PDF dosyasının URL'si"
              className="form-input"
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="upload-progress-container">
              <div 
                className="upload-progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className="upload-progress-text">{uploadProgress}%</span>
            </div>
          )}

          <div className="button-group">
            <button 
              type="submit" 
              className="form-button"
              disabled={uploading}
            >
              {uploading ? 'Yükleniyor...' : isEditing ? 'Firmayı Güncelle' : 'Firma Ekle'}
            </button>
            
            {isEditing && (
              <button 
                type="button" 
                className="form-button cancel-button"
                onClick={resetForm}
                disabled={uploading}
              >
                İptal
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="companies-list">
          <h2 className="companies-list-title">Firma Listesi</h2>

          {loading ? (
            <div>
              <div className="loading-spinner"></div>
            </div>
          ) : companies.length === 0 ? (
            <p className="companies-list-empty">
              Henüz firma eklenmemiş.
            </p>
          ) : (
            <ul className="companies-ul">
              {companies.map((company: Company) => (
                <li 
                  key={company._id} 
                  className="company-item"
                >
                  <div className="company-info">
                    <span className="company-name">{company.name}</span>
                    {company.logo && <span className="company-has-logo">Logo ✓</span>}
                    {company.cover && <span className="company-has-cover">Kapak ✓</span>}
                    <span className="company-category">{company.category || 'Genel'}</span>
                  </div>
                  <div className="company-actions">
                    <button 
                      className="edit-button"
                      onClick={() => handleEdit(company)}
                    >
                      Düzenle
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => confirmDelete(company)}
                    >
                      Sil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Silme Onayı Modal */}
      {showDeleteConfirm && companyToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Firma Silme Onayı</h3>
            <p>
              <strong>{companyToDelete.name}</strong> firmasını silmek istediğinizden emin misiniz?
              <br />
              Bu işlem geri alınamaz!
            </p>
            <div className="modal-buttons">
              <button 
                className="delete-confirm-button"
                onClick={handleDelete}
              >
                Evet, Sil
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .companies-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .companies-title {
          margin-bottom: 20px;
          color: #333;
        }
        
        .form-input {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 10px;
        }
        
        .form-button {
          padding: 10px 15px;
          background-color:rgb(31, 31, 31);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        }
        
        .form-button:hover {
          background-color: #357abf;
        }
        
        .form-button:disabled {
          background-color: #a0c3e8;
          cursor: not-allowed;
        }
        
        .cancel-button {
          background-color: #e2e2e2;
          color: #333;
        }
        
        .cancel-button:hover {
          background-color: #d0d0d0;
        }
        
        .button-group {
          display: flex;
          margin-bottom: 20px;
        }
        
        .error-message {
          padding: 10px;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .companies-list {
          margin-top: 30px;
        }
        
        .companies-list-title {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .company-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid #eee;
          border-radius: 4px;
          margin-bottom: 10px;
          background-color: #f9f9f9;
        }
        
        .company-info {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .company-name {
          font-weight: 500;
        }
        
        .company-has-logo, .company-has-cover, .company-category {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 10px;
        }
        
        .company-has-logo {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .company-has-cover {
          background-color: #e3f2fd;
          color: #1565c0;
        }
        
        .company-category {
          background-color: #f3e5f5;
          color: #6a1b9a;
        }
        
        .company-actions {
          display: flex;
        }
        
        .edit-button, .delete-button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 8px;
          font-size: 14px;
        }
        
        .edit-button {
          background-color: #ffc107;
          color: #212121;
        }
        
        .edit-button:hover {
          background-color: #ffb300;
        }
        
        .delete-button {
          background-color: #f44336;
          color: white;
        }
        
        .delete-button:hover {
          background-color: #e53935;
        }
        
        .upload-progress-container {
          width: 100%;
          height: 20px;
          background-color: #e0e0e0;
          border-radius: 10px;
          margin-bottom: 15px;
          position: relative;
          overflow: hidden;
        }
        
        .upload-progress-bar {
          height: 100%;
          background-color: #4caf50;
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        
        .upload-progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-size: 12px;
          text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
        }
        
        .small-text {
          font-size: 12px;
          color: #666;
          font-weight: normal;
        }
        
        .companies-ul {
          list-style: none;
          padding: 0;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          padding: 25px;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .modal-content h3 {
          margin-top: 0;
          color: #333;
        }
        
        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        
        .delete-confirm-button {
          padding: 8px 16px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 10px;
        }
        
        .delete-confirm-button:hover {
          background-color: #d32f2f;
        }
        
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-radius: 50%;
          border-top: 4px solid #3498db;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .companies-list-empty {
          text-align: center;
          color: #757575;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}