import styles from './AlertModal.module.css';

const AlertModal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
        </div>
        <div className={styles.body}>
          <p>{message}</p>
        </div>
        <div className={styles.footer}>
          <button className={styles.btnClose} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
