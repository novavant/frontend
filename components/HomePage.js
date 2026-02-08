import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.page} id="home-page">
        <div className={styles.logo}>
          <h1>Stoneform Project</h1>
          <p>Secured, Trusted, High income platform</p>
        </div>
        
        <div className={styles.newsletter}>
          <h3>Newsletter: Stoneform</h3>
          <p>Get the latest updates on investment opportunities</p>
        </div>
        
        <Link href="/register" className={styles.btn}>Register Now</Link>
        <Link href="/login" className={`${styles.btn} ${styles.btnSecondary}`}>Login</Link>
        
        <div className={styles.copyright}>
          © 2025 Stoneform Capital. All rights reserved.
        </div>
      </div>
    </div>
  );
}