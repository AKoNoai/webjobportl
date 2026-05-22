import React, { useEffect, useState } from 'react'
import { companyQuestionPageStyles as s } from '../assets/dummyStyles'
import axios from 'axios';
import { CheckCircle, XCircle, X, Building2, FileText, Upload, HelpCircle, CircleDashed, Download, Lightbulb, Loader2} from 'lucide-react';
import { apiUrl } from '../utils/api';

// Helper functions
// Parses a string like "10k+", "2k+", "500", etc. into a number

const parseCountString = (str) => {
  if (!str) return NaN;
  const trimmed = str.trim().toLowerCase().replace(/,/g, "");
  const match = trimmed.match(/^(\d+(?:\.\d+)?)(k)?\+?$/);
  if (!match) return NaN;
  const num = parseFloat(match[1]);
  const isK = match[2] === "k";
  return isK ? num * 1000 : num;
};

const formatCountShort = (n) => {
  const num = Number(n) || 0;
  if (num >= 1000) {
    const k = num / 1000;
    if (num % 1000 === 0) return `${k}k`;
    return `${parseFloat(k.toFixed(1)).toString()}k+`;
  }
  return String(num);
};

const formatDatePretty = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseCSVText = (text) => {
  const rows = [];
  let i = 0;
  const len = text.length;
  let cur = "";
  let row = [];
  let inQuotes = false;

  while (i < len) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < len && text[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        cur += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }

      if (ch === ",") {
        row.push(cur);
        cur = "";
        i++;
        continue;
      }

      if (ch === "\r") {
        if (i + 1 < len && text[i + 1] === "\n") i++;
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
        i++;
        continue;
      }

      if (ch === "\n") {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
        i++;
        continue;
      }

      cur += ch;
      i++;
      continue;
    }
  }

  if (inQuotes) {
    row.push(cur);
    rows.push(row);
  } else {
    if (cur !== "" || row.length > 0) {
      row.push(cur);
      rows.push(row);
    }
  }

  return rows.map((r) => r.map((cell) => (cell == null ? "" : cell.trim())));
};

const CompanyQuestionPage = () => {
    const [companyName, setCompanyName] = useState("");
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [questionsCount, setQuestionsCount] = useState("");
    const [csvFile, setCsvFile] = useState(null);
    const [parsedQuestions, setParsedQuestions] = useState([]);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if(!toast) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    // for image handling
const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = () =>  setLogoPreview(reader.result);
        reader.readAsDataURL(file); 
      } else {
        setLogoFile(null);
        setLogoPreview("");
      }
    };
// for csv handling
const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = parseCSVText(text);
      if (!rows || rows.length === 0) {
        setParsedQuestions([]);
        return;
      }

      const headers = rows[0].map((h) => (h || "").toString().toLowerCase());
      const questionIdx = headers.findIndex((h) => h.includes("question"));
      const answerIdx = headers.findIndex((h) => h.includes("answer"));
      const keyPointsIdx =
        headers.findIndex((h) => h.includes("key")) >= 0
          ? headers.findIndex((h) => h.includes("key"))
          : headers.findIndex((h) => h.includes("keypoints"));
      const postDateIdx =
        headers.findIndex((h) => h.includes("postdate")) >= 0
          ? headers.findIndex((h) => h.includes("postdate"))
          : headers.findIndex((h) => h.includes("date")) >= 0
            ? headers.findIndex((h) => h.includes("date"))
            : headers.findIndex((h) => h.includes("posted"));

      const fallbackQuestionIdx = questionIdx >= 0 ? questionIdx : 0;
      const fallbackAnswerIdx =
        answerIdx >= 0 ? answerIdx : fallbackQuestionIdx === 0 ? 1 : 0;
      const fallbackKeyPointsIdx =
        keyPointsIdx >= 0
          ? keyPointsIdx
          : Math.max(0, Math.min(rows[0].length - 1, fallbackAnswerIdx + 1));

      const defaultDate = file.lastModified
        ? new Date(file.lastModified)
        : new Date();

      const questions = [];
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        if (!values.some((v) => (v || "").toString().trim() !== "")) continue;

        const question =
          values[questionIdx] ?? values[fallbackQuestionIdx] ?? "";
        const answer = values[answerIdx] ?? values[fallbackAnswerIdx] ?? "";
        const keyRaw =
          values[keyPointsIdx] ?? values[fallbackKeyPointsIdx] ?? "";
        const postRaw =
          (postDateIdx >= 0 ? values[postDateIdx] : undefined) ?? "";

        let finalPostDate = postRaw.split(/[;|\n]/)[0]?.trim();
        const postDateValue = finalPostDate
          ? finalPostDate
          : defaultDate.toISOString();

        const keyPoints = (keyRaw || "")
          .split(/(?:;|\||\r?\n)+/)
          .map((k) => k.trim())
          .filter((k) => k !== "");

        questions.push({
          question: question || "",
          answer: answer || "",
          keyPoints,
          postDate: postDateValue,
        });
      }

      setParsedQuestions(questions);
    };
    reader.readAsText(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = "Company name is required";

    const parsedCount = parseCountString(questionsCount);
    if (!questionsCount.trim() || isNaN(parsedCount) || parsedCount <= 0)
      newErrors.questionsCount =
        "Enter a valid number of questions (e.g., 1600, 10k+)";

    if (!csvFile) newErrors.csvFile = "CSV file is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

// to submit the data to server
const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
        try {
        setIsSubmitting(true);
            const formDataToSend = new FormData();
                formDataToSend.append("companyName", companyName);
                formDataToSend.append("questionsCount", questionsCount);
            if (logoFile) {
                formDataToSend.append("logoFile", logoFile);
            }
            if (csvFile) {
                formDataToSend.append("csvFile", csvFile);
                formDataToSend.append("csvFileName", csvFile.name);
            }
            formDataToSend.append("questionsData", JSON.stringify(parsedQuestions));

            const token = localStorage.getItem("token");
            const response = await axios.post(
                apiUrl('/interview'), 
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                },
            }
        );
        if (response.data.success) {
            setToast({ 
                type: "success", 
                message: "Câu hỏi phỏng vấn đã được thêm thành công!" 
            });
            setCompanyName("");
            setLogoFile(null);
            setLogoPreview("");
            setQuestionsCount("");
            setCsvFile(null);
            setParsedQuestions([]);
            setErrors({});
            const logoEl = document.getElementById("logo-upload");
            const cvsEl = document.getElementById("csv-upload");
            if (logoEl) logoEl.value = "";
            if (cvsEl) cvsEl.value = "";
        
        }

        } catch (err) {
            console.error("Lỗi khi thêm câu hỏi phỏng vấn:", err);
            setToast({
                type: "error",
                message: err.response?.data?.message || 
                "Đã xảy ra lỗi khi thêm câu hỏi phỏng vấn."
            });
        } finally {
            setIsSubmitting(false);
        }
    } else {
        setToast({
            type: "error",
            message: "Vui lòng sửa các lỗi trong biểu mẫu trước khi gửi."
        });
    }
}

const paredCountForDisplay = 
    parseCountString(questionsCount) || parsedQuestions.length;


return (
    <div className={s.pageContainer}>
        {/*toast */}
        {toast && (
            <div className={s.toastWrapper}>
                <div className={`${s.toastBase} ${
                    toast.type === "success" ? s.toastSuccess : s.toastError
                }`}>
                    {toast.type === "success" ? (
                        <CheckCircle size={20} className={s.toastIconSuccess}/>
                    ) : (
                        <XCircle size={20} className={s.toastIconError}/>
                    )}
                    <span className={s.toastMessage}>{toast.message}</span>
                    <button className={s.toastCloseBtn} onClick={() => setToast(null)}>
                        <X size={16} />
                    </button>
                </div>
            </div>
        )}

        <div className={s.contentWrapper}>
            <header className={s.header}>
                <h1 className={s.headerTitle}>Câu hỏi phỏng vấn công ty</h1>
                <p className={s.headerSubtitle}>
                    Thêm thông tin chi tiết về công ty và tải lên file CSV chứa ngân hàng câu hỏi (Câu hỏi, Câu trả lời, Ý chính, Ngày đăng tùy chọn).
                </p>
            </header>

            {/* form card */}
            <div className={s.formCard}>
                <form className={s.form} onSubmit={handleSubmit}>
                    <div className={s.gridRow}>

                        <div className={s.colSpan2}>
                            <label className={s.label}>
                                Tên công ty <span className={s.required}>*</span>
                            </label>
                            <div className={s.inputWrapper}>
                              <Building2 size={18} className={s.inputIcon}/>
                              <input
                                type="text"
                                value={ companyName }
                                onChange={(e) => setCompanyName(e.target.value)}
                                className={`${s.inputField} ${
                                  errors.companyName ? s.inputError : s.inputDefault
                                }`}
                                placeholder="Tên công ty"
                              />
                            </div>
                            {errors.companyName && (
                                <p className={s.errorText}>{errors.companyName}</p>
                            )}
                        </div>

                        <div>
                            <label className={s.label}>
                                Câu hỏi (tổng cộng) <span className={s.required}>*</span>
                            </label>
                            <div className={s.inputWrapper}>
                              <FileText size={18} className={s.inputIcon}/>
                              <input
                                type="text"
                                value={ questionsCount }
                                onChange={(e) => setQuestionsCount(e.target.value)}
                                className={`${s.inputField} ${
                                  errors.questionsCount ? s.inputError : s.inputDefault
                                }`}
                                placeholder="Số lượng câu hỏi"
                              />
                            </div>
                            <div className={s.countHelperRow}>
                                {errors.questionsCount ? (
                                    <p className={s.errorText}>{errors.questionsCount}</p>
                                ) : (
                                    <p className={s.countHelperText}>
                                        Display: {" "}
                                        <span className={s.countDisplayValue}>
                                            {formatCountShort(paredCountForDisplay)}

                                        </span>
                                    </p>
                                )}
                                <p className={s.countHint}>
                                    Bạn có thể sử dụng các con số như 1600 hoặc 10.000+.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={s.gridRow}>
                        <div className={s.logoContainer}>
                            <div className={s.logoPreviewWrapper}>
                                {logoPreview ? (
                                    <div className={s.logoPreviewBox}>
                                        <img src={logoPreview} alt="Logo" className={s.logoPreviewImage} 
                                        
                                        />
                                        {/* btn to remove image after preview */}
                                        <button type="button" onClick={() => {
                                            setLogoFile(null);
                                            setLogoPreview("");
                                            const el = document.getElementById("logo-upload");
                                            if (el) el.value = "";
                                        }} className={s.removeLogoBtn}>
                                            <X size={14} />

                                        </button>
                                    </div>
                                ) : (
                                    <div className={s.logoPlaceholder}>
                                        <Upload size={24}/>
                                    </div>
                                )}

                            </div>
                            
                            <div>
                                <label htmlFor="logo-upload" className={s.logoUploadLabel}>
                                    <Upload size={16} />
                                    <span>Chon logo</span>
                                </label>
                                <input type="file" id="logo-upload" accept="image/*"
                                onChange={handleLogoChange}
                                className={s.fileInputHidden} 
                                />
                                <p className={s.logoHint}>
                                    Định dạng PNG, JPG, GIF, dung lượng tối đa 2MB (tùy chọn)
                                </p>
                            </div>
                        </div>
                        {/* CSV upload */  }
                        <div className={s.colSpan2Alt}>
                            <label className={s.label}>
                                Tải lên file CSV (Câu hỏi, Câu trả lời, Các điểm chính, Ngày đăng (tùy chọn)) {" "} 
                                <span className={s.required}>*</span>
                            </label>
                            <div className={s.csvUploadContainer}>
                                <div className="flex-1">
                                    <label htmlFor="csv-upload" className={s.csvUploadLabel}>
                                        <Upload size={16} />
                                        <span>Chọn file CSV</span>
                                    </label>
                                    <input type="file" id="csv-upload" accept=".csv"
                                        onChange={handleCsvChange}
                                        className={s.fileInputHidden} 
                                    />

                                    {csvFile && (
                                        <p className={s.csvFileName}>{csvFile.name}</p>
                                    )}
                                    
                                </div>
                                {parsedQuestions.length > 0 && (
                                    <div className={s.csvLoadedBadge}>
                                        <CheckCircle size={14} />
                                        {parsedQuestions.length} câu hỏi dang được tải lên

                                    </div>
                                )}

                            </div>
                            {errors.csvFile && (
                                <p className={s.errorText}>{errors.csvFile}</p>
                            )}
                        </div>

                    </div>
                    
                    {/* submit*/ }
                    <div className={s.submitSection}>
                        <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`${s.submitBtn} ${
                            isSubmitting ? s.submitBtnDisabled : ""}`}
                            >
                            {isSubmitting ? (
                                <>
                                <Loader2 className={s.spinner}/>
                                    Đang gửi...
                                </>
                            ) : (
                                "Thêm câu hỏi phỏng vấn"
                            )}                           
                        </button>
                    </div>
                </form>
            </div>   
            {/* display parsed ques */}
            {parsedQuestions.length > 0 && (
                <div className={s.questionsSection}>
                    <h2 className={s.sectionTitle}>
                        <Download size={18} className={s.sectionIcon}/>
                        Câu hỏi đã tải lên ({parsedQuestions.length})
                    </h2>
                    <div className={s.questionsGrid}>
                        {parsedQuestions.map((q, idx) => (
                            <div 
                            key={idx} 
                            className={s.questionCard}
                            style={{
                                animationDelay: `${idx * 50}ms`
                            }}
                        >
                            <div className={s.cardInner}>
                                <div className={s.cardIcon}>
                                    <HelpCircle size={20} />
                                </div>
                                <div className={s.cardContent}>
                                    <div className={s.cardHeader}>
                                        <p className={s.cardQuestion}>
                                            {q.question || (
                                                <span className={s.cardQuestionMissing}> Không có văn bản câu hỏi
                                                </span>
                                                
                                            )}
                                        </p>
                                        <span className={s.cardDateBadge}>
                                            {formatDatePretty(q.postDate)}
                                        </span>
                                        
                                    </div>
                                    <div className={s.answerSection}>
                                        <div className={s.answerLabel}>
                                            <Lightbulb size={14} className={s.answerIcon}/>
                                            Đáp án
                                        </div>
                                        <div className={s.answerContent}>
                                            {q.answer || (
                                                <span className={s.cardAnswerMissing}>
                                                    Không có văn bản câu trả lời
                                                </span>
                                            )}

                                        </div>
                                    </div>
                                    {q.keyPoints && q.keyPoints.length > 0 && (
                                        <div className={s.keyPointsSection}>
                                            <div className={s.keyPointsLabel}>
                                                <CircleDashed size={14} />
                                                Điểm mấu chốt
                                            </div>
                                            <ul className={s.keyPointsList}>
                                                {q.keyPoints.map((kp, kIdx) => (
                                                    <li key={kIdx} className={s.keyPointItem}>
                                                        <CircleDashed size={14} className={s.keyPointIcon}/>
                                                        <span>{kp}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                        </div>
                                    )}
                                </div>
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

        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-card {
          animation: cardFadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
 
    </div>
  )
}

export default CompanyQuestionPage