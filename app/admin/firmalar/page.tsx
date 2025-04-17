'use client';

import { useEffect, useState, useRef } from 'react';
import { UploadButton } from "@uploadthing/react";
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// Firma tipi için arayüz tanımlama
interface Company {
  _id: string;
  name: string;
  logo?: string;
  cover?: string;
  category?: string;
  year?: string;
  pdfUrl?: string;
  order: number // Sıralama için
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const companiesRes = await fetch('/api/companies');
      const data = await companiesRes.json();
      if (data.success && Array.isArray(data.data)) {
        const sorted = [...data.data]
          .filter(c => typeof c.order === 'number')
          .sort((a, b) => a.order - b.order);
        setCompanies(sorted);
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
const handleDragEnd = async (result) => {
  if (!result.destination) return;
  if (result.destination.index === result.source.index) return;

  const items = Array.from(companies);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);

  const updatedItems = items.map((item, index) => ({
    ...item,
    order: index,
  }));

  setCompanies(updatedItems);

  try {
    const res = await fetch('/api/companies/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companies: updatedItems }),
    });

    const data = await res.json();
    if (!data.success) {
      setError('Sıralama kaydedilemedi.');
    } else {
      await fetchCompanies(); // ✅ refresh from DB after reorder
    }
  } catch (err) {
    setError('Sıralama kaydedilirken hata oluştu.');
    console.error(err);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Lütfen bir firma adı girin.');
      return;
    }

    try {
      setUploading(true);

      if (isEditing) {
        // Firma güncelleme - mevcut PUT API'sini kullan
        const res = await fetch(`/api/companies`, {          
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: editingId,
            name: companyName, 
            logo: companyLogo, 
            cover: companyCover,
            category: companyCategory,
            year: companyYear,
            pdfUrl: companyPdfUrl
          }),
        });

        const data = await res.json();
        if (data.success) {
          alert("Firma başarıyla güncellendi!");
          resetForm();
          fetchCompanies();
        } else {
          setError('Firma güncellenemedi.');
        }
      } else {
// Yeni sıra numarası hesapla - mevcut firmaların en yüksek sıra numarası + 1
const newOrder = companies.length > 0 
  ? Math.max(...companies.map(c => c.order || 0)) + 1 
  : 0;

// Yeni firma ekleme
const res = await fetch(`/api/companies`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    name: companyName, 
    logo: companyLogo, 
    cover: companyCover,
    category: companyCategory,
    year: companyYear,
    pdfUrl: companyPdfUrl,
    order: newOrder
  }),
});

        const data = await res.json();
        if (data.success) {
          alert("Firma başarıyla eklendi!");
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
      const res = await fetch(`/api/companies?id=${companyToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert("Firma başarıyla silindi!");
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

          {/* Logo Yükleme - UploadThing */}
          <div>
            <label>Firma Logosu</label>
            {companyLogo ? (
              <div className="uploaded-image-container">
                <img 
                  src={companyLogo} 
                  alt="Firma Logosu" 
                  className="uploaded-image-preview"
                />
                <div className="uploaded-image-actions">
                  <button 
                    type="button" 
                    className="remove-image-button"
                    onClick={() => setCompanyLogo('')}
                  >
                    Logoyu Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-container">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      setCompanyLogo(res[0].url);
                      alert("Logo başarıyla yüklendi");
                    }
                  }}
                  onUploadError={(error) => {
                    alert("Logo yüklenirken bir hata oluştu: " + error.message);
                  }}
                  className="ut-button-container"
                />
              </div>
            )}
          </div>

          {/* Kapak Resmi Yükleme - UploadThing */}
          <div>
            <label>Firma Kapak Resmi</label>
            {companyCover ? (
              <div className="uploaded-image-container">
                <img 
                  src={companyCover} 
                  alt="Firma Kapak Resmi" 
                  className="uploaded-image-preview cover-preview"
                />
                <div className="uploaded-image-actions">
                  <button 
                    type="button" 
                    className="remove-image-button"
                    onClick={() => setCompanyCover('')}
                  >
                    Kapak Resmini Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-container">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      setCompanyCover(res[0].url);
                      alert("Kapak resmi başarıyla yüklendi");
                    }
                  }}
                  onUploadError={(error) => {
                    alert("Kapak resmi yüklenirken bir hata oluştu: " + error.message);
                  }}
                  className="ut-button-container"
                />
              </div>
            )}
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
  <p className="drag-instruction">Sıralamayı değiştirmek için firmaları sürükleyip bırakın</p>

  {loading ? (
    <div>
      <div className="loading-spinner"></div>
    </div>
  ) : companies.length === 0 ? (
    <p className="companies-list-empty">
      Henüz firma eklenmemiş.
    </p>
  ) : (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="companies">
        {(provided) => (
          <ul 
            className="companies-ul"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {companies.map((company: Company, index) => (
              <Draggable 
                key={company._id} 
                draggableId={company._id} 
                index={index}
              >
                {(provided, snapshot) => (
                  <li 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      transform: provided.draggableProps.style?.transform ?? 'none',
                      left: '0px',
                      top: '0px',
                      position: 'relative',
                      zIndex: 10
                    }}
                    className={`company-item ${snapshot.isDragging ? 'dragging' : ''}`}
                  >
                    <div className="company-drag-handle">
                      ⋮⋮
                    </div>
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
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
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
        

.company-item.dragging {
  background-color: #f0f8ff;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  opacity: 0.8;
}

.company-drag-handle {
  margin-right: 10px;
  color: #999;
  font-size: 18px;
  cursor: grab;
}

.drag-instruction {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  text-align: center;
  font-style: italic;
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
        
        .upload-container {
          margin-bottom: 15px;
          width: 100%;
        }
        
        .uploaded-image-container {
          margin-bottom: 15px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .uploaded-image-preview {
          max-width: 200px;
          max-height: 200px;
          object-fit: contain;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px;
          background-color: #fff;
        }
        
        .cover-preview {
          max-width: 300px;
        }
        
        .uploaded-image-actions {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        
        .remove-image-button {
          padding: 6px 12px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .remove-image-button:hover {
          background-color: #d32f2f;
        }

        /* UploadThing bileşeni için özel stiller */
        :global(.ut-button-container) {
          width: 100% !important;
        }
        
        :global(.ut-button) {
          background-color: rgb(31, 31, 31) !important;
          color: white !important;
          font-size: 14px !important;
          border-radius: 4px !important;
          padding: 10px !important;
          border: none !important;
          cursor: pointer !important;
          width: 100% !important;
        }
        
        :global(.ut-button:hover) {
          background-color: #357abf !important;
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