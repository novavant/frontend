import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { registerUser } from '../utils/api';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    password: '',
    confirmPassword: '',
    referral_code: '',
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
    
    if (formData.password !== formData.confirmPassword) {
      setNotification({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await registerUser({
        name: formData.name,
        number: formData.number,
        password: formData.password,
        password_confirmation: formData.password,
        referral_code: formData.referral_code
      });

      if (response.success) {
        setNotification({ 
          message: 'Registration successful! Please login.', 
          type: 'success' 
        });
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setNotification({ 
          message: response.message || 'An error occurred. Please try again.', 
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
      <div className={styles.page} id="register-page">
        <div className={styles.logo}>
          <h1>Stoneform Capital</h1>
        </div>
        
        <div className={styles.formTitle}>
          <h2>Register Now</h2>
          <p>Secured, Trusted, High income platform</p>
        </div>
        
        {notification.message && (
          <div className={`${styles.notification} ${styles[notification.type]}`}>
            {notification.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              className={styles.formControl} 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>
          
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
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              className={styles.formControl} 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="referral_code">Referral Code (Optional)</label>
            <input 
              type="text" 
              id="referral_code" 
              className={styles.formControl} 
              value={formData.referral_code}
              onChange={handleChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="verification">Verification Code</label>
            <input 
              type="text" 
              id="verification" 
              className={styles.formControl} 
              placeholder="9150" 
              value={formData.verification}
              onChange={handleChange}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.btn} 
            disabled={isLoading}
          >
            {isLoading ? <div className={styles.loading}></div> : 'Register'}
          </button>
        </form>
        
        <div className={styles.formFooter}>
          Already registered? <Link href="/login">Login now</Link>
        </div>
        
        <div className={styles.copyright}>
          © 2025 Stoneform Capital. All rights reserved.
        </div>
      </div>
    </div>
  );
}