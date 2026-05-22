import React, { useState, useRef, useEffect } from 'react'
import { contactPageStyles as s } from '../assets/dummyStyles'
import { Briefcase, Mail, MapPin, MessageSquare, Phone, User, Send } from 'lucide-react';



// toast
 const Toast = ({ message, type = "success", onClose }) => {
    const [isExiting, setIsExiting] = useState(false);
    const handleClose = () => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    };
    React.useEffect(() => {
      const t = setTimeout(handleClose, 3000);
      return () => clearTimeout(t);
    }, []); // eslint-disable-line

    const borderClass =
      type === "success" ? "border-green-500" : "border-red-500";

    return (
      <div
        className={s.toastContainer(borderClass, isExiting)}
        role="status"
        aria-live="polite"
      >
        {type === "success" ? (
          <svg className={s.toastSuccessIcon} viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M7 13l2.5 2.5L17 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg className={s.toastErrorIcon} viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M15 9L9 15M9 9l6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <p className={s.toastMessage}>{message}</p>
        <button
          onClick={handleClose}
          className={s.toastCloseButton}
          aria-label="Close notification"
        >
          <svg className={s.toastCloseIcon} viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M6 18L18 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  };





const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const formRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, phone: digitsOnly.slice(0, 10) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      setToast({
        message: "Số điện thoại phải có 10 chữ số",
        type: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setToast({
          message:
            "Tin nhắn đã được gửi - Chúng tôi sẽ liên lạc lại với bạn trong thời gian ngắn!",
          type: "success",
        });
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setToast({ message: data.message || "Không thể gửi tin nhắn", type: "error" });
      }
    } catch (error) {
      console.error("Lỗi gửi yêu cầu:", error);
      setToast({ message: "Đã xảy ra lỗi khi gửi yêu cầu, vui lòng thử lại sau", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.pageContainer}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <div className={s.mainWrapper}>
        <div className={s.header}>
          <h1 className={s.headerTitle}>Liên hệ với chúng tôi</h1>
          <p className={s.headerSubtitle}>
            Chúng tôi rất mong nhận được phản hồi từ bạn. Hãy cùng hợp tác và tạo ra những điều tuyệt vời nhé!
          </p>       
        </div>

        <div className={s.formCardContainer}>
          <div className={s.formCardInner}>
            <div className={s.formCard}>
              <div className={s.grid}>
                <div className={s.leftPanel}>
                  <div>
                    <h3 className={s.leftPanelTitle}>Let's Talk</h3>
                    <p className={s.leftPanelDescription}>
                      Have a project in mind or just want to chat? Reach out to
                      us through any of these channels.
                    </p>
                    <div className={s.contactInfoList}>
                      <div className={s.contactItem}>
                        <div className={s.contactIconWrapper}>
                          <MapPin className={s.mapIcon} />
                        </div>
                        <div>
                          <p className={s.contactLabel}>Visit us</p>
                          <p className={s.contactValue}>
                            123 Business Ave, Suite 100
                            <br />
                            San Francisco, CA 94107
                          </p>
                        </div>
                      </div>

                      <div className={s.contactItem}>
                        <div className={s.contactIconWrapper}>
                          <Mail className={s.mailIcon} />
                        </div>
                        <div>
                          <p className={s.contactLabel}>Email us</p>
                          <p className={s.contactValue}>
                            hello@jobportal.com
                            <br />
                            support@jobportal.com
                          </p>
                        </div>
                      </div>

                      <div className={s.contactItem}>
                        <div className={s.contactIconWrapper}>
                          <Phone className={s.phoneIcon} />
                        </div>
                        <div>
                          <p className={s.contactLabel}>Call us</p>
                          <p className={s.contactValue}>+1 (555) 123-4567</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={s.leftPanelFooter}>
                    We typically reply within 1–2 business days.
                  </div>
                </div>
                <div className={s.rightPanel}>
                  <h2 className={s.rightPanelTitle}>
                    <Briefcase className={s.briefcaseIcon} />
                    Send Your Inquiry
                  </h2>

                  <form 
                  ref={formRef} 
                  onSubmit={handleSubmit} 
                  className={s.form}
                  >
                    <div className={s.formGrid}>
                      <div className={s.fieldGroup}>
                     <label className={s.fieldLabel}>Full name</label>
                     <div className={s.inputWrapper}>
                      <div className={s.inputGlow}></div>
                      <div className={s.inputContainer}>
                        <User className={s.userIcon} />
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={s.inputField}
                            placeholder="Alex Johnson"
                            required
                          />
                      </div>
                     </div>
                    </div>

                    <div className={s.fieldGroup}>
                      <label className={s.fieldLabel}>Email</label>
                      <div className={s.inputWrapper}>
                        <div className={s.inputGlow}></div>
                        <div className={s.inputContainer}>
                          <Mail className={s.emailIcon} />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={s.inputField}
                            placeholder="alex@example.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className={s.fieldGroup}>
                      <label className={s.fieldLabel}>Phone</label>
                      <div className={s.inputWrapper}>
                        <div className={s.inputGlow}></div>
                        <div className={s.inputContainer}>
                          <Phone className={s.phoneInputIcon} />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={s.inputField}
                            placeholder="1234567890"
                            maxLength={10} 
                            inputMode="numeric" 
                            pattern="\d{10}"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className={s.fieldGroup}>
                      <label className={s.fieldLabel}>Subject</label>
                      <div className={s.inputWrapper}>
                        <div className={s.inputGlow}></div>
                        <div className={s.inputContainer}>
                          <Briefcase className={s.subjectIcon} />
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className={s.inputField}
                            placeholder="Job inquiry, partnership..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                    </div>

                    <div className={s.fieldGroup}>
                      <label className={s.fieldLabel}>Message</label>
                      <div className={s.inputWrapper}>
                        <div className={s.inputGlow}></div>
                        <div className={s.inputContainer}>
                          <MessageSquare className={s.messageIcon} />
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            className={s.textareaField}
                            placeholder="Your message here..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                    {/* submit btn */}
                    <div className={s.submitButtonContainer}>
                      <button type="submit" 
                      disabled={loading}
                      className={`${s.submitButton} ${
                        loading ? s.submitButtonLoading : ""
                        }`}
                      >

                        <span className={s.submitButtonText}>
                          <Send className={s.sendIcon} />
                          {loading ? "Sending..." : "Send Message"}

                        </span>

                      </button>

                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{s.globalStyles}</style>
    </div>
  )
}

export default ContactPage