import styles from './Footer.module.css';
import utfprClaro from '../assets/images/logos/utfprClaro.png';
import utfprEscuro from '../assets/images/logos/utfprEscuro.png';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.info}>
            <div className={styles.logoSection}>
              <img 
                src={utfprEscuro} 
                alt="UTFPR Logo" 
                className={`${styles.logo} ${styles.logoLight}`}
              />
              <img 
                src={utfprClaro} 
                alt="UTFPR Logo" 
                className={`${styles.logo} ${styles.logoDark}`}
              />
            </div>
            <p className={styles.universityName}>Universidade Tecnológica Federal do Paraná</p>
            <p className={styles.year}>© 2025 - Todos os direitos reservados</p>
          </div>
          <div className={styles.developers}>
            <p className={styles.label}>Desenvolvido por:</p>
            <div className={styles.names}>
              <span>Pedro</span>
              <span className={styles.separator}>•</span>
              <span>Lucas</span>
              <span className={styles.separator}>•</span>
              <span>Leo</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
