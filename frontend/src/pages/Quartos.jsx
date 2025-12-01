import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Crud.module.css';
import quartoSolteiro from '../assets/images/quartoSolteiro.png';
import quartoCasal from '../assets/images/quartoCasal.png';
import quartoSuite from '../assets/images/quartoSuite.png';
import quartoLuxuoso from '../assets/images/quartoLuxuoso.png';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';

const Quartos = () => {
  const [quartos, setQuartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, quartoId: null });
  const [filterTipo, setFilterTipo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterValorMin, setFilterValorMin] = useState('');
  const [filterValorMax, setFilterValorMax] = useState('');
  
  const [formData, setFormData] = useState({
    numero: '',
    tipo: 'Solteiro',
    valorDiaria: '',
    disponivel: true,
    descricao: '',
  });

  useEffect(() => {
    fetchQuartos();
  }, []);

  const fetchQuartos = async () => {
    try {
      const response = await api.get('/quartos');
      setQuartos(response.data);
    } catch (error) {
      showMessage('error', 'Erro ao carregar quartos');
    } finally {
      setLoading(false);
    }
  };

  const getRoomImage = (tipo) => {
    const imageMap = {
      'Solteiro': quartoSolteiro,
      'Casal': quartoCasal,
      'Suíte': quartoSuite,
      'Luxo': quartoLuxuoso
    };
    return imageMap[tipo] || quartoSolteiro;
  };

  const showMessage = (type, message) => {
    setAlertModal({ isOpen: true, type, message });
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      tipo: 'Solteiro',
      valorDiaria: '',
      disponivel: true,
      descricao: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/quartos/${editingId}`, formData);
        showMessage('success', 'Quarto atualizado com sucesso!');
      } else {
        await api.post('/quartos', formData);
        showMessage('success', 'Quarto cadastrado com sucesso!');
      }
      fetchQuartos();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao salvar quarto';
      if (error.response?.status === 400) {
        setAlertModal({ isOpen: true, message: errorMessage });
      } else {
        showMessage('error', errorMessage);
      }
    }
  };

  const handleEdit = (quarto) => {
    setFormData({
      numero: quarto.numero,
      tipo: quarto.tipo,
      valorDiaria: quarto.valorDiaria,
      disponivel: quarto.disponivel,
      descricao: quarto.descricao || '',
    });
    setEditingId(quarto.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setConfirmModal({ isOpen: true, quartoId: id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/quartos/${confirmModal.quartoId}`);
      showMessage('success', 'Quarto excluído com sucesso!');
      fetchQuartos();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao excluir quarto';
      showMessage('error', errorMessage);
    } finally {
      setConfirmModal({ isOpen: false, quartoId: null });
    }
  };

  const clearFilters = () => {
    setFilterTipo('');
    setFilterStatus('');
    setFilterValorMin('');
    setFilterValorMax('');
  };

  const filteredQuartos = quartos.filter((quarto) => {
    const tipoMatch = !filterTipo || quarto.tipo === filterTipo;
    const statusMatch = !filterStatus || (filterStatus === 'disponivel' ? quarto.disponivel : !quarto.disponivel);
    const valorMinMatch = !filterValorMin || parseFloat(quarto.valorDiaria) >= parseFloat(filterValorMin);
    const valorMaxMatch = !filterValorMax || filterValorMax === '1500' || parseFloat(quarto.valorDiaria) <= parseFloat(filterValorMax);
    
    return tipoMatch && statusMatch && valorMinMatch && valorMaxMatch;
  });

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className={styles.crudContainer}>
      <div className="container">
        <div className={styles.header}>
          <h1>🛏️ Gerenciamento de Quartos</h1>
          <button
            className={showForm ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancelar' : '+ Novo Quarto'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <div className={styles.formHeader}>
              <h2>{editingId ? '✏️ Editar Quarto' : '➕ Novo Quarto'}</h2>
              <p className={styles.formSubtitle}>
                {editingId 
                  ? 'Atualize as informações do quarto' 
                  : 'Preencha os dados para cadastrar um novo quarto'}
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>🔢 Número *</label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    placeholder="Ex: 101, 202..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>🏛️ Tipo *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Solteiro">🛏️ Solteiro</option>
                    <option value="Casal">🛏️🛏️ Casal</option>
                    <option value="Suíte">✨ Suíte</option>
                    <option value="Luxo">👑 Luxo</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>💵 Valor da Diária (R$) *</label>
                  <input
                    type="number"
                    name="valorDiaria"
                    value={formData.valorDiaria}
                    onChange={handleInputChange}
                    placeholder="Ex: 150.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>📝 Descrição</label>
                  <input
                    type="text"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Características do quarto..."
                  />
                </div>
              </div>
              <div className={styles.formButtons}>
                <button type="submit" className="btn btn-success">
                  {editingId ? '✓ Atualizar' : '✓ Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.listingContainer}>
          {/* Painel de Filtros */}
          <aside className={styles.filterPanel}>
            <div className={styles.filterHeader}>
              <h3>🔍 Filtros</h3>
            </div>
            
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>🏛️ Tipo do Quarto</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className={styles.filterInput}
              >
                <option value="">Todos os tipos</option>
                <option value="Solteiro">🛏️ Solteiro</option>
                <option value="Casal">🛏️🛏️ Casal</option>
                <option value="Suíte">✨ Suíte</option>
                <option value="Luxo">👑 Luxo</option>
              </select>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>🟢 Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterInput}
              >
                <option value="">Todos</option>
                <option value="disponivel">✓ Disponível</option>
                <option value="ocupado">✗ Ocupado</option>
              </select>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>💵 Valor da Diária (R$)</label>
              <div className={styles.priceDisplay}>
                R$ {filterValorMin || '0'} - {filterValorMax === '1500' ? 'R$ 1500 e mais' : `R$ ${filterValorMax || '1500'}`}
              </div>
              <div className={styles.priceRangeContainer}>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="50"
                  value={filterValorMin || 0}
                  onChange={(e) => {
                    const min = parseInt(e.target.value);
                    const max = parseInt(filterValorMax || 1500);
                    if (min <= max) {
                      setFilterValorMin(e.target.value);
                    }
                  }}
                  className={styles.rangeSlider}
                />
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="50"
                  value={filterValorMax || 1500}
                  onChange={(e) => {
                    const min = parseInt(filterValorMin || 0);
                    const max = parseInt(e.target.value);
                    if (max >= min) {
                      setFilterValorMax(e.target.value);
                    }
                  }}
                  className={styles.rangeSlider}
                />
              </div>
              <div className={styles.priceOptions}>
                <button 
                  className={styles.priceOption}
                  onClick={() => { setFilterValorMin('0'); setFilterValorMax('250'); }}
                >
                  Até R$250
                </button>
                <button 
                  className={styles.priceOption}
                  onClick={() => { setFilterValorMin('250'); setFilterValorMax('500'); }}
                >
                  R$250 a R$500
                </button>
                <button 
                  className={styles.priceOption}
                  onClick={() => { setFilterValorMin('500'); setFilterValorMax('750'); }}
                >
                  R$500 a R$750
                </button>
                <button 
                  className={styles.priceOption}
                  onClick={() => { setFilterValorMin('750'); setFilterValorMax('1000'); }}
                >
                  R$750 a R$1000
                </button>
                <button 
                  className={styles.priceOption}
                  onClick={() => { setFilterValorMin('1000'); setFilterValorMax('1500'); }}
                >
                  Mais de R$1000
                </button>
              </div>
            </div>

            {(filterTipo || filterStatus || filterValorMin || filterValorMax) && (
              <button 
                onClick={clearFilters}
                className={styles.clearFiltersBtn}
              >
                🗑️ Limpar Filtros
              </button>
            )}
          </aside>

          {/* Lista de Quartos */}
          <div className={styles.listContent}>
            <div className="card">
              <div className={styles.listHeader}>
                <h2>Lista de Quartos</h2>
                <span className={styles.resultsCount}>
                  {filteredQuartos.length === 1 
                    ? '1 quarto encontrado' 
                    : `${filteredQuartos.length} quartos encontrados`}
                </span>
              </div>
              {filteredQuartos.length === 0 ? (
                <p>Nenhum quarto encontrado com os filtros selecionados.</p>
              ) : (
                <div className={styles.cardsGrid}>
                  {filteredQuartos.map((quarto) => (
                <div key={quarto.id} className={styles.itemCard}>
                  <img 
                    src={getRoomImage(quarto.tipo)} 
                    alt={quarto.tipo}
                    className={styles.cardImage}
                  />
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIcon}>🛏️</div>
                    <h3>Quarto {quarto.numero}</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>🏛️ Tipo:</span>
                      <span className={styles.value}>{quarto.tipo}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>💵 Valor Diária:</span>
                      <span className={styles.value} style={{ color: '#16a34a', fontWeight: '600' }}>
                        R$ {parseFloat(quarto.valorDiaria).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>🟢 Status:</span>
                      <span className={styles.badge} style={{
                        backgroundColor: quarto.disponivel ? '#dcfce7' : '#fee2e2',
                        color: quarto.disponivel ? '#15803d' : '#b91c1c',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {quarto.disponivel ? '✓ Disponível' : '✗ Ocupado'}
                      </span>
                    </div>
                    {quarto.descricao && (
                      <div className={styles.infoRow}>
                        <span className={styles.label}>📝 Descrição:</span>
                        <span className={styles.value}>{quarto.descricao}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.btnEdit}
                      onClick={() => handleEdit(quarto)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className={styles.btnDelete}
                      onClick={() => handleDelete(quarto.id)}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        type={alertModal.type}
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, type: '', message: '' })}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Excluir Quarto"
        message="Tem certeza que deseja excluir este quarto? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, quartoId: null })}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title="Ação não permitida"
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />
    </div>
  );
};

export default Quartos;
