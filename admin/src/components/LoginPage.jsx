import React, { useEffect, useState } from 'react'
import { loginPageStyles as s } from '../assets/dummyStyles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail, LogIn, X } from 'lucide-react';
import { apiUrl } from '../utils/api';

const LoginPage = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState({
         visible: false,
            message: "",
            type: "success",
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (toast.visible) {
            const timer = setTimeout(() => {
                setToast({ visible: false, message: "", type: "success" });
            }, 3000);
            return () => clearTimeout(timer);
            }
        }, [toast]);

        // to submit the data and logged in
        const handleSubmit = async (e) => {
            e.preventDefault();

            if (!email || !password) {
                setToast({ 
                    visible: true, 
                    message: "Please fill in all fields", 
                    type: "error" 
                });
                return;
            }

            try {
                const res = await axios.post(apiUrl('/auth/login'), { 
                    email, 
                    password, 
                });

                if (res.data.user.role !== "admin") {
                    setToast({ 
                        visible: true, 
                        message: "Access denied. Admins only.", 
                        type: "error" 
                    });
                    return;
                }
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                setToast({ 
                    visible: true, 
                    message: "Login successful!", 
                    type: "success" 
                });
                setTimeout(() => {
                    navigate("/");
                }, 1000);

            }
             catch (error) {
                setToast({ 
                    visible: true, 
                    message: "Invalid email or password.", 
                    type: "error" 
                });
            }
        };

        const closeToast = () => {
            setToast({ visible: false, message: "", type: "success" });
        };
        const toastIcon = 
        toast.type === "success" ? (
            <CheckCircle className={s.toastIconSuccess} size={20}/>
        ) : (
            <AlertCircle className={s.toastIconError} size={20}/>
        );

        const toastBoderColor = 
        toast.type === "success" ? s.toastBorderSuccess : s.toastBorderError;
    

    return (
        <div className={s.pageContainer}>
            {toast.visible && (
                <div className={`${s.toastContainer} ${toastBoderColor}`} role="alert">
                    {toastIcon}
                    <p className={s.toastMessage}>{toast.message}</p>

                    <button onClick={closeToast} className={s.toastCloseButton}>
                        <X size={18} />
                    </button>
                </div>
            )}
            <div className={s.card}>
                <div className={s.header}>
                    <h1 className={s.title}>Admin Panel</h1>
                    <p className={s.subtitle}>Job Portal Administration</p>
                </div>

                <form onSubmit={handleSubmit} class={s.form}>
                    <div className={s.formGroup}>
                        <label htmlFor="email" className={s.label}>
                            Địa chỉ email
                        </label>
                        <div className={s.inputWrapper}>
                            <div className={s.iconWrapper}>
                                <Mail className={s.iconDefault} size={18}/>
                            </div>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className={`${s.inputBase} ${s.inputPr3}`} placeholder="admin@example.com" required
                             />

                        </div>
                    </div>

                    <div className={s.formGroup}>
                        <label htmlFor="password" className={s.label}>
                            Mật khẩu
                        </label>
                        <div className={s.inputWrapper}>
                            <div className={s.iconWrapper}>
                                <Lock className={s.iconDefault} size={18}/>
                            </div>
                            <input type={showPassword ? "text" : "password"}
                            id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className={`${s.inputBase} ${s.inputPr12}`} placeholder="••••" required
                             />
                             {/* toggle eye password */}
                             <div className={s.eyeButtonWrapper}>
                                <button type="button" onClick={() => setShowPassword((s) => !s)}
                                    className={s.eyeButton}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}

                                </button>

                             </div>
                        </div>
                    </div>

                    {/* submit*/}
                    <button type="submit" className={s.submitBtn}>
                        <LogIn size={18} className={s.submitIcon} />
                        Đăng nhập
                    </button>

                </form>

            </div>
        </div>
    )
};

export default LoginPage;