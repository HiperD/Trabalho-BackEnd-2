import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import styles from './Home.module.css';
import quartoSolteiro from '../assets/images/quartoSolteiro.png';
import quartoCasal from '../assets/images/quartoCasal.png';
import quartoSuite from '../assets/images/quartoSuite.png';
import quartoLuxuoso from '../assets/images/quartoLuxuoso.png';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [quartos, setQuartos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuartos();
  }, []);

  const fetchQuartos = async () => {
    try {
      const response = await api.get('/quartos');
      setQuartos(response.data);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceRange = (tipo) => {
    const quartosDoTipo = quartos.filter(q => q.tipo === tipo);
    if (quartosDoTipo.length === 0) return null;
    
    const precos = quartosDoTipo.map(q => parseFloat(q.valorDiaria));
    const min = Math.min(...precos);
    const max = Math.max(...precos);
    
    if (min === max) {
      return `R$ ${min.toFixed(2)}`;
    }
    return `R$ ${min.toFixed(2)} - R$ ${max.toFixed(2)}`;
  };

  const roomTypes = [
    {
      tipo: 'Solteiro',
      image: quartoSolteiro,
      alt: 'Quarto Solteiro',
      descricao: 'Ideal para hospedagem individual com conforto e praticidade'
    },
    {
      tipo: 'Casal',
      image: quartoCasal,
      alt: 'Quarto Casal',
      descricao: 'Perfeito para casais, com cama queen size e ambiente aconchegante'
    },
    {
      tipo: 'Suíte',
      image: quartoSuite,
      alt: 'Suíte',
      descricao: 'Espaço amplo com banheiro privativo e comodidades extras'
    },
    {
      tipo: 'Luxo',
      image: quartoLuxuoso,
      alt: 'Quarto Luxo',
      descricao: 'Máximo conforto e sofisticação para uma experiência premium'
    }
  ];

  return (
    <div className={styles.homeContainer}>
      <div className="container">
        <h1>Bem-vindo, {user?.nome}! 👋</h1>
        <p className={styles.subtitle}>
          Sistema de Gerenciamento de Hotel - UTFPR
        </p>

        <div className={styles.cardsGrid}>
          <Link to="/clientes" className={styles.homeCard}>
            <div className={styles.icon}>👥</div>
            <h3>Clientes</h3>
            <p>Gerencie os hóspedes do hotel</p>
          </Link>

          <Link to="/quartos" className={styles.homeCard}>
            <div className={styles.icon}>🛏️</div>
            <h3>Quartos</h3>
            <p>Controle de quartos e disponibilidade</p>
          </Link>

          <Link to="/reservas" className={styles.homeCard}>
            <div className={styles.icon}>📅</div>
            <h3>Reservas</h3>
            <p>Gerencie as reservas de quartos</p>
          </Link>
        </div>

        <div className={styles.roomTypesSection}>
          <h2>🏨 Tipos de Quartos Disponíveis</h2>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Carregando informações...</p>
          ) : (
            <div className={styles.roomTypesGrid}>
              {roomTypes.map(room => {
                const priceRange = getPriceRange(room.tipo);
                return (
                  <div key={room.tipo} className={styles.roomCard}>
                    <img src={room.image} alt={room.alt} />
                    <div className={styles.roomCardContent}>
                      <h3>{room.tipo}</h3>
                      <p className={styles.roomDescription}>{room.descricao}</p>
                      {priceRange ? (
                        <div className={styles.priceRange}>
                          <span className={styles.priceLabel}>💰 Faixa de preço:</span>
                          <span className={styles.priceValue}>{priceRange}</span>
                        </div>
                      ) : (
                        <div className={styles.noPrice}>
                          <span>Nenhum quarto cadastrado</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
