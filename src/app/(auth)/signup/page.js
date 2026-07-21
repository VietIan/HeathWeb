'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase/auth';
import { Heart, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import styles from '../login/login.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        const { user, error: authError } = await signUpWithEmail(email, password, name);

        if (authError) {
            setError(getErrorMessage(authError));
            setLoading(false);
        } else if (user) {
            router.push('/dashboard');
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError('');

        const { user, error: authError } = await signInWithGoogle();

        if (authError) {
            setError(getErrorMessage(authError));
            setLoading(false);
        } else if (user) {
            router.push('/dashboard');
        }
    };

    const getErrorMessage = (error) => {
        if (error.includes('email-already-in-use')) return 'Email đã được sử dụng';
        if (error.includes('invalid-email')) return 'Email không hợp lệ';
        if (error.includes('weak-password')) return 'Mật khẩu quá yếu';
        return 'Đã xảy ra lỗi, vui lòng thử lại';
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <Link href="/" className={styles.logo}>
                        <Heart className={styles.logoIcon} />
                        <span>HealWeb</span>
                    </Link>
                    <h1>Đăng ký</h1>
                    <p>Tạo tài khoản miễn phí</p>
                </div>

                <form onSubmit={handleSignup} className={styles.authForm}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Họ tên</label>
                        <div className={styles.inputWrapper}>
                            <User className={styles.inputIcon} size={18} />
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Nguyễn Văn A"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} size={18} />
                            <input
                                type="email"
                                className="glass-input"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Mật khẩu</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="glass-input"
                                placeholder="Ít nhất 6 ký tự"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Xác nhận mật khẩu</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="glass-input"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className={styles.spinner} size={18} /> : 'Đăng ký'}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>hoặc</span>
                </div>

                <button
                    className={styles.googleBtn}
                    onClick={handleGoogleSignup}
                    disabled={loading}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Đăng ký với Google
                </button>

                <p className={styles.authFooter}>
                    Đã có tài khoản?{' '}
                    <Link href="/login" className={styles.authLink}>
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
