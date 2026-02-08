// components/Layout.js
import Navbar from './Navbar';
import styles from '../styles/Home.module.css';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className={styles.container}>
        {children}
      </main>
    </>
  );
}