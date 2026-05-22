import React, { useEffect, useRef, useState } from 'react';
import { companiesPageStyles as s } from '../assets/dummyStyles';
import axios from 'axios';
import { CheckCircle, X, Upload, Link2, Trash2, Loader2 } from 'lucide-react';
import { apiUrl } from '../utils/api';

const Companies = () => {

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);


// to fetch companies from server side
useEffect(() => {
    const fetchCompanies = async () => {
        try{
            const token = localStorage.getItem('token');
            const res = await axios.get(apiUrl('/company/'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCompanies(res.data.companies);
        }
        catch(err){
            console.error(err);
        }
    };

    fetchCompanies();
}, []);

useEffect(() => {
    if (!toast || toast.confrim) return;

    const timer = setTimeout(() => {
        setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
}, [toast]);

// for image
const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result);

            try {
                if (fileInputRef.current) fileInputRef.current.value = "";

            }
            catch(err){
                // ignore
            }
        };
        reader.readAsDataURL(file);
    } else {
        setLogoFile(null);
        setLogoPreview("");
    }
};

// to validate form the data field
  const validateForm = () => {
    const newErrors = {};
    if (!logoFile) newErrors.logo = "Logo is required";
    if (!website.trim()) {
      newErrors.website = "Website URL is required";
    } else if (!/^https?:\/\/.+\..+/.test(website)) {
      newErrors.website = "Enter a valid URL (e.g., https://example.com)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // to submit the data to server
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('logo', logoFile);
        formData.append('website', website);

        const res = await axios.post(
            apiUrl('/company/'), 
            formData, 
            {
            headers: { 'Authorization': `Bearer ${token}` },
        },
    );
        setCompanies(prev => [...prev, res.data.company]);
        setToast({ type: 'success', message: 'Công ty đã được thêm thành công!' });
    // reset the form
        setLogoFile(null);
        setLogoPreview("");
        setWebsite("");
        setErrors({});
  
  } catch (err) {
    setToast({ 
        type: 'error', 
        message: err.response?.data?.message || 'Thêm công ty không thành công.',
    });
    } finally {
        setIsLoading(false);
    }
};

// to delete a company
const requestDeleteCompany = (companyId) => {
    setPendingDeleteId(companyId);
    setToast({
        type: 'confirm',
        confirm: true,
        message: 'Bạn có chắc muốn xóa công ty này?',
    });
};


const handleConfirmDelete = async () => {
    try{
        const token = localStorage.getItem('token');
        await axios.delete(apiUrl(`/company/${pendingDeleteId}`), {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        setCompanies(prev => prev.filter(c => c._id !== pendingDeleteId));
        setPendingDeleteId(null);
        setToast({ type: 'success', message: 'Công ty đã được xóa thành công!' });

    } catch(err){
        setToast({ 
            type: 'error', 
            message: err.response?.data?.message || 'Xóa công ty không thành công.',
        });
    } finally {
        setPendingDeleteId(null);
    }
}

// to cancel delete
const handleCancelDelete = () => {
    setPendingDeleteId(null);
    setToast(null);
}


    
  return (
    <div className={s.pageContainer}>
        {toast && (
            <div className={s.toastWrapper}>
                <div 
                className={`${s.toastBase} ${
                    toast.type === 'success' 
                    ? s.toastSuccess 
                    : toast.type === 'error' 
                        ? s.toastError 
                        : s.toastConfirm
                    }`}
                >
                        {toast.type === "success" ? (
                            <CheckCircle size={20} className={s.toastIconSuccess}/>
                        ) : toast.type === "error" ? (
                            <CheckCircle size={20} className={s.toastIconError}/>
                        ) : (
                            <X size={20} className={s.toastIconConfirm}/>
                        )}

                        <div className={s.toastContent}>
                            <span className={s.toastMessage}>{toast.message}</span>

                            {toast.confirm && (
                                <div className={s.toastActionRow}>
                                    <button 
                                    onClick={handleConfirmDelete} 
                                    className={s.toastConfirmBtn} 
                                    >
                                        Xác nhận
                                    </button>
                                    <button 
                                    onClick={handleCancelDelete} 
                                    className={s.toastCancelBtn}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            )}
                        </div>
                        {!toast.confirm && (
                            <button onClick={() => setToast(null)} className={s.toastCloseBtn}>
                                <X size={16}/>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className={s.contentWrapper}>
                <header className={s.header}>
                    <h1 className={s.headerTitle}>Thêm công ty</h1>
                    <p className={s.headerSubtitle}>
                        Tải lên logo và cung cấp trang web
                    </p>
                </header>

                <div className={s.formCard}>
                    <form onSubmit={handleSubmit} className={s.form}>
                        {/* logo upload field */}
                        <div>
                            <label className={s.logoLabel} >
                                Logo công ty
                                <span className={s.requiredS}>*</span>
                            </label>
                            <div className={s.logoContainer}>
                                <div className={s.logoPreview}>
                                    {logoPreview ? (
                                        <div className={s.previewBox}>
                                            <img src={logoPreview} alt="Logo" className={s.previewImage}/>
                                            <button type="button" onClick={() =>{
                                                setLogoFile(null);
                                                setLogoPreview("");
                                                try{
                                                    if(fileInputRef.current) 
                                                        fileInputRef.current.value = "";
                                                } catch(error){
                                                    //ignore
                                                }
                                            }} className={s.removeLogoBtn}>
                                                <X size={14}/>
                                            </button>

                                        </div>
                                    ) : (
                                        <div className={s.placeholderBox}>
                                            <Upload size={24}/>
                                        </div>
                                    )}          
                                </div>
                                
                                <div className={s.uploadArea}>
                                    <label htmlFor="logo-upload" className={s.uploadLabel}>
                                        <Upload size={16}/>
                                        <span>Chọn tệp</span>
                                    </label>
                                    <input type="file" id="logo-upload" ref={fileInputRef}
                                    accept="image/*,jpeg,image/svg+xml,.ico" onChange={handleLogoChange} 
                                    className={s.fileInputHidden}/>
                                </div>
                            </div>
                            {errors.logo && <p className={s.errorText}>{errors.logo}</p>}
                        </div>
                        <div>
                            <label className={s.websiteLabel}>
                                Website URL <span className={s.requiredS}>*</span>
                            </label>
                            <div className={s.inputWrapper}>
                                <Link2 size={18} className={s.inputIcon}/>
                                <input 
                                type="url" 
                                value={website} 
                                onChange={(e) => setWebsite(e.target.value)}
                                className={`${s.websiteInput} ${
                                    errors.website ? s.inputError : s.inputDefault
                                }`} placeholder="https://example.com" />
                            </div>
                            {errors.website && (
                                <p className={s.errorText}>{errors.website}</p>
                            )}
                        </div>
                        {/* submit btn */}
                        <div className={s.submitSection}>
                            <button 
                                type="submit"                          
                                disabled={isLoading}                             
                                className={`${s.submitBtn} ${
                                    isLoading ? s.submitBtnDisabled: ""
                                    }`}
                                    >
                                    {isLoading ? (
                                        <>
                                        <Loader2 size={20} className={s.spinner}/>
                                        </>
                                    ) : (
                                        "Thêm công ty"
                                    )}
                            </button>
                        </div>
                    </form>
                </div>
                {/* company list */}
                {companies.length > 0 && (
                    <div className={s.listSection}>
                        <h2 className={s.listTitle}>Công ty</h2>
                        <div className={s.grid}>
                            {companies.map((c) => (
                                <div key={c._id} className={s.companyCard}>
                                    {/* logo */}
                                    <div className={s.cardLogoBox}>
                                        {c.logo ? (
                                            <img src={c.logo} alt="logo" className={s.cardLogoImage} />
                                        ) : (
                                            <div className={s.cardNoImage}>Không có hình ảnh</div>
                                        )}
                                    </div>

                                    <div className={s.cardDetails}>
                                        <a 
                                            href={c.website} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className={s.cardLink}>
                                            {c.name || c.website}
                                        </a>
                                    </div>

                                    {/* delete btn */}
                                    <div className={s.cardDeleteWrapper}>
                                        <button 
                                            onClick={() => requestDeleteCompany(c._id)}
                                            className={s.cardDeleteBtn}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
                }
                .animate-slideIn {
                animation: slideIn 0.3s ease-out forwards;
                }
            `}
        </style>
        
        </div>
    );
}
 
export default Companies