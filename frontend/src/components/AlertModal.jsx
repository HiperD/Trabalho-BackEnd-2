import styles from './AlertModal.module.css';

const AlertModal = ({ isOpen, type = 'info', message, onClose }) => {
  if (!isOpen) return null;

  const getTitle = () => {
    switch(type) {
      case 'success':
        return 'Operação realizada com sucesso';
      case 'error':
        return 'Erro na operação';
      case 'warning':
        return 'Atenção';
      default:
        return 'Informação';
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{getTitle()}</h3>
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
