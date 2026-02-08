import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { loginUser } from '../utils/api';

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    number: '',
    password: '',
    verification: ''
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, number: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await loginUser({
        number: formData.number,
        password: formData.password
      });

      if (response.success) {
        setNotification({ 
          message: 'Login successful! Redirecting to dashboard...', 
          type: 'success' 
        });
        
        // Store token and user data
        // `loginUser` persists token and refresh token; store user/application if returned
        if (response.data && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-token-changed'));
        }
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setNotification({ 
          message: response.message || 'Phone number or password is incorrect', 
          type: 'error' 
        });
      }
    } catch (error) {
      setNotification({ 
        message: 'An error occurred. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.page} id="login-page">
        <div className={styles.logo}>
          <h1>Stoneform Capital</h1>
        </div>
        
        <div className={styles.formTitle}>
          <h2>Login Now</h2>
          <p>Secured, Trusted, High income platform</p>
        </div>
        
        {notification.message && (
          <div className={`${styles.notification} ${styles[notification.type]}`}>
            {notification.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="number">Phone Number</label>
            <div className={styles.inputWithPrefix}>
              <div className={styles.prefix}>+62</div>
              <input 
                type="tel" 
                id="number" 
                className={styles.formControl} 
                placeholder="8xxxxxxxxxxx" 
                value={formData.number}
                onChange={handleNumberChange}
                required 
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className={styles.formControl} 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="verification">Verification Code</label>
            <input 
              type="text" 
              id="verification" 
              className={styles.formControl} 
              placeholder="4217" 
              value={formData.verification}
              onChange={handleChange}
              required 
            />
            <p style={{ fontSize: '0.8rem', marginTop: '5px', color: '#aaa' }}>Enter the code</p>
          </div>
          
          <button 
            type="submit" 
            className={styles.btn} 
            disabled={isLoading}
          >
            {isLoading ? <div className={styles.loading}></div> : 'Login'}
          </button>
        </form>
        
        <div className={styles.formFooter}>
          Not registered yet? <Link href="/register">Create Account</Link>
        </div>
        
        <div className={styles.copyright}>
          © 2025 Stoneform Capital. All rights reserved.
        </div>
      </div>
    </div>
  );
}