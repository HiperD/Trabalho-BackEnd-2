import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import styles from './Crud.module.css';
import quartoSolteiro from '../assets/images/quartoSolteiro.png';
import quartoSolteiroDuas from '../assets/images/quartoSolteiroDuas.png';
import quartoCasal from '../assets/images/quartoCasal.png';
import quartoSuite from '../assets/images/quartoSuite.png';
import quartoLuxuoso from '../assets/images/quartoLuxuoso.png';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, reservaId: null });
  const [clienteSearch, setClienteSearch] = useState('');
  const [quartoSearch, setQuartoSearch] = useState('');
  const [quartoNumeroFilter, setQuartoNumeroFilter] = useState('');
  const [tipoQuartoFilter, setTipoQuartoFilter] = useState('');
  const [faixaPrecoFilter, setFaixaPrecoFilter] = useState('');
  const [filterCpf, setFilterCpf] = useState('');
  const [filterQuartoNumero, setFilterQuartoNumero] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterReservaId, setFilterReservaId] = useState('');
  const [availableQuartos, setAvailableQuartos] = useState([]);
  const [hospedesModal, setHospedesModal] = useState({ isOpen: false, reserva: null });
  const datePickerRef = useRef(null);
  const flatpickrInstance = useRef(null);
  
  const [selectedHospedes, setSelectedHospedes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginação
  const [reservasDisplayCount, setReservasDisplayCount] = useState(10);
  const [clientesDisplayCount, setClientesDisplayCount] = useState(10);
  const [quartosDisplayCount, setQuartosDisplayCount] = useState(10);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    quartoId: '',
    numeroHospedes: 1,
    dataCheckIn: '',
    dataCheckOut: '',
  });

  // Calcular capacidade máxima dos quartos disponíveis
  const maxCapacidade = quartos.length > 0 
    ? Math.max(...quartos.map(q => q.capacidade || 1))
    : 10;
  
  // Atualizar numeroHospedes e clienteId quando selecionar/remover hóspedes
  useEffect(() => {
    setFormData(prev => ({ ...prev, numeroHospedes: selectedHospedes.length || 1 }));
    if (selectedHospedes.length > 0) {
      setFormData(prev => ({ ...prev, clienteId: selectedHospedes[0].id.toString() }));
    } else {
      setFormData(prev => ({ ...prev, clienteId: '' }));
    }
  }, [selectedHospedes]);

  // Resetar contadores de paginação quando filtros mudarem
  useEffect(() => {
    setClientesDisplayCount(10);
  }, [clienteSearch]);
  
  useEffect(() => {
    setQuartosDisplayCount(10);
  }, [quartoNumeroFilter, tipoQuartoFilter, faixaPrecoFilter]);
  
  useEffect(() => {
    setReservasDisplayCount(10);
  }, [filterCpf, filterQuartoNumero, filterStatus, filterReservaId]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (datePickerRef.current && window.flatpickr && showForm && formStep === 2) {
      // Destruir instância anterior se existir
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
      }

      flatpickrInstance.current = window.flatpickr(datePickerRef.current, {
        mode: 'range',
        dateFormat: 'd/m/Y',
        locale: 'pt',
        minDate: editingId ? undefined : 'today',
        onChange: function(selectedDates) {
          if (selectedDates.length === 2) {
            const [checkIn, checkOut] = selectedDates;
            setFormData(prev => ({
              ...prev,
              dataCheckIn: checkIn.toISOString().split('T')[0],
              dataCheckOut: checkOut.toISOString().split('T')[0]
            }));
            // Filtrar quartos disponíveis
            filterAvailableQuartos(checkIn.toISOString().split('T')[0], checkOut.toISOString().split('T')[0]);
          }
        },
        onClose: function(selectedDates) {
          if (selectedDates.length === 1) {
            // Se selecionou apenas uma data, abre novamente para selecionar a segunda
            flatpickrInstance.current.open();
          }
        }
      });

      // Se tem datas no formData (modo edição), seta após criação
      if (editingId && formData.dataCheckIn && formData.dataCheckOut) {
        setTimeout(() => {
          if (flatpickrInstance.current) {
            // Converter strings para objetos Date com hora local
            const checkInDate = new Date(formData.dataCheckIn + 'T00:00:00');
            const checkOutDate = new Date(formData.dataCheckOut + 'T00:00:00');
            flatpickrInstance.current.setDate([checkInDate, checkOutDate], false);
          }
        }, 0);
      }
    }

    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
        flatpickrInstance.current = null;
      }
    };
  }, [showForm, formStep, editingId]);

  const fetchData = async () => {
    try {
      // Buscar todos os dados sem paginação para o formulário
      const [reservasRes, clientesRes, quartosRes] = await Promise.all([
        api.get('/reservas', { params: { limit: 1000 } }), // Buscar todas para exibição
        api.get('/clientes', { params: { limit: 1000 } }), // Buscar todos para seleção
        api.get('/quartos', { params: { limit: 1000 } }), // Buscar todos para seleção
      ]);
      console.log('🏨 Quartos carregados do backend:', quartosRes.data.quartos?.map(q => ({ numero: q.numero, tipo: q.tipo, capacidade: q.capacidade })));
      setReservas(reservasRes.data.reservas || reservasRes.data);
      setClientes(clientesRes.data.clientes || clientesRes.data);
      setQuartos(quartosRes.data.quartos || quartosRes.data);
    } catch (error) {
      showMessage('error', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, message) => {
    setAlertModal({ isOpen: true, type, message });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      clienteId: '',
      quartoId: '',
      numeroHospedes: 1,
      dataCheckIn: '',
      dataCheckOut: '',
    });
    setSelectedHospedes([]);
    setShowForm(false);
    setEditingId(null);
    setFormStep(1);
    setClienteSearch('');
    setQuartoSearch('');
    setQuartoNumeroFilter('');
    setTipoQuartoFilter('');
    setFaixaPrecoFilter('');
    setClientesDisplayCount(10);
    setQuartosDisplayCount(10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Preparar dados para envio (garantir tipos corretos)
      const reservaData = {
        clienteId: parseInt(formData.clienteId),
        clienteIds: selectedHospedes.map(h => h.id), // Enviar todos os IDs dos hóspedes
        quartoId: parseInt(formData.quartoId),
        numeroHospedes: parseInt(formData.numeroHospedes),
        dataCheckIn: formData.dataCheckIn,
        dataCheckOut: formData.dataCheckOut
      };
      
      console.log('📤 [FRONTEND] Enviando reserva:', reservaData);
      console.log('👥 [FRONTEND] Hóspedes selecionados:', selectedHospedes);
      console.log('🔢 [FRONTEND] clienteIds array:', reservaData.clienteIds);
      
      if (editingId) {
        console.log('✏️ [FRONTEND] Editando reserva ID:', editingId);
        await api.put(`/reservas/${editingId}`, reservaData);
        showMessage('success', 'Reserva atualizada com sucesso!');
      } else {
        console.log('➕ [FRONTEND] Criando nova reserva');
        await api.post('/reservas', reservaData);
        showMessage('success', 'Reserva criada com sucesso!');
      }
      await fetchData(); // Recarrega todos os dados incluindo quartos atualizados
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      console.error('Resposta do servidor:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao salvar reserva';
      showMessage('error', errorMessage);
    }
  };

  const handleEdit = (reserva) => {
    // Carregar dados da reserva
    setFormData({
      clienteId: reserva.clienteId.toString(),
      quartoId: reserva.quartoId.toString(),
      numeroHospedes: reserva.numeroHospedes || 1,
      dataCheckIn: reserva.dataCheckIn,
      dataCheckOut: reserva.dataCheckOut,
      status: reserva.status
    });
    
    // Recuperar todos os hóspedes do campo clienteIds (JSON array)
    if (reserva.clienteIds && Array.isArray(reserva.clienteIds) && reserva.clienteIds.length > 0) {
      // Buscar os objetos cliente completos usando os IDs
      const hospedes = clientes.filter(c => reserva.clienteIds.includes(c.id));
      setSelectedHospedes(hospedes);
    } else {
      // Fallback: se não tiver clienteIds, usar o cliente principal
      const cliente = clientes.find(c => c.id === reserva.clienteId);
      if (cliente) {
        setSelectedHospedes([cliente]);
      }
    }
    
    setEditingId(reserva.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/reservas/${id}`, { status });
      showMessage('success', 'Status atualizado com sucesso!');
      await fetchData(); // Recarrega todos os dados incluindo quartos atualizados
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao atualizar status';
      showMessage('error', errorMessage);
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({ isOpen: true, reservaId: id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/reservas/${confirmModal.reservaId}`);
      showMessage('success', 'Reserva excluída com sucesso!');
      await fetchData(); // Recarrega todos os dados incluindo quartos atualizados
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao excluir reserva';
      showMessage('error', errorMessage);
    } finally {
      setConfirmModal({ isOpen: false, reservaId: null });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const filterAvailableQuartos = (checkIn, checkOut) => {
    console.log('🔍 Filtrando quartos - Período:', checkIn, 'até', checkOut, '| Hóspedes:', formData.numeroHospedes);
    
    const disponveis = quartos.filter(quarto => {
      // Verificar se a capacidade do quarto é suficiente
      const numHospedes = Number(formData.numeroHospedes);
      if (quarto.capacidade < numHospedes) {
        return false;
      }
      
      // Se está editando, permitir o quarto atual
      if (editingId) {
        const reservaAtual = reservas.find(r => r.id === editingId);
        if (reservaAtual && reservaAtual.quartoId === quarto.id) {
          console.log(`✓ Quarto ${quarto.numero} permitido (editando reserva atual)`);
          return true;
        }
      }
      
      // Verificar se o quarto tem alguma reserva confirmada que conflita com o período
      const reservasDoQuarto = reservas.filter(r => r.quartoId === quarto.id && r.status === 'Confirmada');
      console.log(`Reservas confirmadas do quarto ${quarto.numero}:`, reservasDoQuarto.length);
      
      const temConflito = reservasDoQuarto.some(reserva => {
        // Ignorar a reserva que está sendo editada
        if (editingId && reserva.id === editingId) {
          console.log('  - Ignorando reserva atual (editando)');
          return false;
        }
        
        const reservaCheckIn = reserva.dataCheckIn.split('T')[0];
        const reservaCheckOut = reserva.dataCheckOut.split('T')[0];
        
        console.log(`  - Reserva: ${reservaCheckIn} até ${reservaCheckOut}`);
        
        // Há conflito se os períodos se sobrepõem
        // NÃO há conflito se:
        // - Nova reserva termina antes ou no dia que reserva existente começa (checkOut <= reservaCheckIn)
        // - Nova reserva começa no dia ou depois que reserva existente termina (checkIn >= reservaCheckOut)
        const naoTemConflito = (checkOut <= reservaCheckIn) || (checkIn >= reservaCheckOut);
        const conflito = !naoTemConflito;
        
        if (conflito) {
          console.log(`  ✗ CONFLITO encontrado:`, {
            novaReserva: { checkIn, checkOut },
            reservaExistente: { checkIn: reservaCheckIn, checkOut: reservaCheckOut }
          });
        } else {
          console.log(`  ✓ Sem conflito com esta reserva`);
        }
        
        return conflito;
      });
      
      if (!temConflito) {
        console.log(`✓ Quarto ${quarto.numero} DISPONÍVEL`);
      } else {
        console.log(`✗ Quarto ${quarto.numero} INDISPONÍVEL (conflito de datas)`);
      }
      
      return !temConflito;
    });
    
    console.log('\n=== RESULTADO ===');
    console.log('Quartos disponíveis:', disponveis.length, 'de', quartos.length);
    console.log('Números dos quartos disponíveis:', disponveis.map(q => q.numero));
    setAvailableQuartos(disponveis);
  };

  const getRoomImage = (tipo) => {
    const imageMap = {
      'Solteiro': quartoSolteiro,
      'SolteiroDuas': quartoSolteiroDuas,
      'Casal': quartoCasal,
      'Suíte': quartoSuite,
      'Luxo': quartoLuxuoso
    };
    return imageMap[tipo] || quartoSolteiro;
  };

  const selectedRoom = quartos.find(q => q.id === parseInt(formData.quartoId));
  const selectedClient = clientes.find(c => c.id === parseInt(formData.clienteId));

  const calculateReservationTotal = () => {
    if (!formData.dataCheckIn || !formData.dataCheckOut || !selectedRoom) {
      return null;
    }
    
    const checkIn = new Date(formData.dataCheckIn + 'T00:00:00');
    const checkOut = new Date(formData.dataCheckOut + 'T00:00:00');
    const diffTime = checkOut - checkIn;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const valorDiaria = parseFloat(selectedRoom.valorDiaria);
    const total = diffDays * valorDiaria;
    
    return { days: diffDays, total };
  };

  const reservationTotal = calculateReservationTotal();

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className={styles.crudContainer}>
      <div className="container">
        <div className={styles.header}>
          <h1>📅 Gerenciamento de Reservas</h1>
          <button
            className={showForm ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? '✕ Cancelar' : '+ Nova Reserva'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <div className={styles.formHeader}>
              <h2>{editingId ? '✏️ Editar Reserva' : '➕ Nova Reserva'}</h2>
              <div className={styles.stepIndicator}>
                <div className={`${styles.step} ${formStep >= 1 ? styles.active : ''} ${formStep > 1 ? styles.completed : ''}`}>
                  <span className={styles.stepNumber}>1</span>
                  <span className={styles.stepLabel}>Cliente</span>
                  <div className={styles.stepLine}></div>
                </div>
                <div className={`${styles.step} ${formStep >= 2 ? styles.active : ''} ${formStep > 2 ? styles.completed : ''}`}>
                  <span className={styles.stepNumber}>2</span>
                  <span className={styles.stepLabel}>Período</span>
                  <div className={styles.stepLine}></div>
                </div>
                <div className={`${styles.step} ${formStep >= 3 ? styles.active : ''} ${formStep > 3 ? styles.completed : ''}`}>
                  <span className={styles.stepNumber}>3</span>
                  <span className={styles.stepLabel}>Quarto</span>
                  <div className={styles.stepLine}></div>
                </div>
                <div className={`${styles.step} ${formStep >= 4 ? styles.active : ''}`}>
                  <span className={styles.stepNumber}>4</span>
                  <span className={styles.stepLabel}>Confirmar</span>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: Seleção de Hóspedes */}
              {formStep === 1 && (
                <div className={styles.formStepContent}>
                  <h3 className={styles.stepTitle}>👥 Selecione os Hóspedes</h3>
                  
                  {/* Hóspedes Selecionados */}
                  {selectedHospedes.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '15px',
                        padding: '10px 0',
                        borderBottom: '2px solid var(--primary-color)'
                      }}>
                        <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>
                          ✓ Hóspedes Selecionados ({selectedHospedes.length}/{maxCapacidade})
                        </h4>
                        {selectedHospedes.length < maxCapacidade && (
                          <small style={{ color: 'var(--text-secondary)' }}>
                            Você pode adicionar até {maxCapacidade - selectedHospedes.length} hóspede(s)
                          </small>
                        )}
                      </div>
                      <div className={styles.selectionGrid}>
                        {selectedHospedes.map(cliente => (
                          <div 
                            key={cliente.id}
                            className={`${styles.selectionCard} ${styles.selected}`}
                            style={{ position: 'relative', paddingTop: '45px' }}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedHospedes(selectedHospedes.filter(h => h.id !== cliente.id))}
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                lineHeight: '1',
                                fontWeight: 'bold',
                                zIndex: 10,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                              onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                              title="Remover hóspede"
                            >
                              &times;
                            </button>
                            <div className={styles.cardIcon}>👤</div>
                            <div className={styles.cardInfo}>
                              <h4>{cliente.nome}</h4>
                              <p>CPF: {cliente.cpf}</p>
                              <p>Email: {cliente.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Buscar e Adicionar Hóspedes */}
                  {selectedHospedes.length < maxCapacidade && (
                    <>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '15px',
                        padding: '10px 0',
                        borderBottom: '2px solid var(--border-light)'
                      }}>
                        <h4 style={{ margin: 0 }}>
                          {selectedHospedes.length === 0 ? '📋 Selecione o Primeiro Hóspede' : '➕ Adicionar Mais Hóspedes'}
                        </h4>
                      </div>
                      <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>🔍 Buscar Cliente</label>
                        <input
                          type="text"
                          placeholder="Digite o nome ou CPF do cliente..."
                          value={clienteSearch}
                          onChange={(e) => setClienteSearch(e.target.value)}
                          className={styles.searchInput}
                        />
                      </div>
                      <div className={styles.selectionGrid}>
                        {clienteSearch.trim() === '' ? (
                          <div style={{ 
                            gridColumn: '1 / -1', 
                            textAlign: 'center', 
                            padding: '40px 20px',
                            color: '#64748b',
                            fontSize: '14px'
                          }}>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
                            <p>Digite o nome ou CPF do cliente para começar a busca</p>
                          </div>
                        ) : (
                          clientes
                            .filter(c => !selectedHospedes.some(h => h.id === c.id)) // Excluir já selecionados
                            .filter(c => 
                              c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) ||
                              c.cpf.includes(clienteSearch)
                            )
                            .slice(0, clientesDisplayCount)
                            .map(cliente => (
                              <div 
                                key={cliente.id}
                                className={styles.selectionCard}
                                onClick={() => {
                                  const quartoSelecionado = quartos.find(q => q.id === parseInt(formData.quartoId));
                                  if (selectedHospedes.length >= maxCapacidade) {
                                    showMessage('error', `Capacidade máxima do quarto atingida! (${quartoSelecionado?.capacidade || maxCapacidade} pessoa${maxCapacidade > 1 ? 's' : ''})`);
                                    return;
                                  }
                                  if (!selectedHospedes.find(h => h.id === cliente.id)) {
                                    setSelectedHospedes([...selectedHospedes, cliente]);
                                    setClienteSearch('');
                                    setFormData({ ...formData, numeroHospedes: selectedHospedes.length + 1 });
                                  }
                                }}
                                style={{ cursor: selectedHospedes.length >= maxCapacidade ? 'not-allowed' : 'pointer', opacity: selectedHospedes.length >= maxCapacidade ? 0.5 : 1 }}
                              >
                                <div className={styles.cardIcon}>👤</div>
                                <div className={styles.cardInfo}>
                                  <h4>{cliente.nome}</h4>
                                  <p>CPF: {cliente.cpf}</p>
                                  <p>Email: {cliente.email}</p>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                      
                      {/* Botão Ver Mais para clientes */}
                      {clienteSearch.trim() !== '' && 
                       clientes.filter(c => !selectedHospedes.some(h => h.id === c.id))
                         .filter(c => c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) || c.cpf.includes(clienteSearch))
                         .length > clientesDisplayCount && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                          <button
                            type="button"
                            onClick={() => setClientesDisplayCount(prev => prev + 10)}
                            className="btn btn-secondary"
                          >
                            Ver Mais (+10)
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className={styles.formButtons}>
                    <button 
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setFormStep(2)}
                      disabled={selectedHospedes.length === 0}
                    >
                      Continuar para Período →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Seleção de Período */}
              {formStep === 2 && (
                <div className={styles.formStepContent}>
                  <h3 className={styles.stepTitle}>📅 Selecione o Período da Estadia</h3>
                  <div className="form-group">
                    <label>📅 Período da Reserva *</label>
                    <div className={styles.dateInputGroup}>
                      <input
                        ref={datePickerRef}
                        type="text"
                        placeholder="Selecione check-in e check-out"
                        className={styles.dateRangeInput}
                        readOnly
                        required
                      />
                      <span className={styles.calendarIcon}>
                        <i className="bi bi-calendar-range">📅</i>
                      </span>
                    </div>
                    <div className={styles.dateHelp}>
                      Clique para selecionar a data de entrada e saída
                    </div>
                  </div>
                  <div className={styles.formButtons}>
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setFormStep(1)}
                    >
                      ← Voltar
                    </button>
                    <button 
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setFormStep(3)}
                      disabled={!formData.dataCheckIn || !formData.dataCheckOut}
                    >
                      Continuar para Quartos →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Seleção de Quarto */}
              {formStep === 3 && (
                <div className={styles.formStepContent}>
                  <div className={styles.listHeader}>
                    <h3 className={styles.stepTitle}>🛏️ Selecione o Quarto</h3>
                    <span className={styles.resultsCount}>
                      {availableQuartos.length} {availableQuartos.length === 1 ? 'quarto disponível' : 'quartos disponíveis'} ({new Date(formData.dataCheckIn + 'T00:00:00').toLocaleDateString('pt-BR')} - {new Date(formData.dataCheckOut + 'T00:00:00').toLocaleDateString('pt-BR')})
                    </span>
                  </div>
                  
                  <div className={styles.filtersRow}>
                    <div className="form-group">
                      <label>🔢 Número do Quarto</label>
                      <input
                        type="text"
                        placeholder="Ex: 101, 223..."
                        value={quartoNumeroFilter}
                        onChange={(e) => setQuartoNumeroFilter(e.target.value)}
                        className={styles.filterInput}
                      />
                    </div>

                    <div className="form-group">
                      <label>🏨 Tipo do Quarto</label>
                      <select
                        value={tipoQuartoFilter}
                        onChange={(e) => setTipoQuartoFilter(e.target.value)}
                        className={styles.filterSelect}
                      >
                        <option value="">Todos os tipos</option>
                        <option value="Solteiro">Solteiro</option>
                        <option value="SolteiroDuas">Solteiro Duas Camas</option>
                        <option value="Casal">Casal</option>
                        <option value="Suíte">Suíte</option>
                        <option value="Luxo">Luxo</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>💵 Valor da Diária (R$)</label>
                      <select
                        value={faixaPrecoFilter}
                        onChange={(e) => setFaixaPrecoFilter(e.target.value)}
                        className={styles.filterSelect}
                      >
                        <option value="">Todos os valores</option>
                        <option value="0-250">Até R$250</option>
                        <option value="250-500">R$250 a R$500</option>
                        <option value="500-750">R$500 a R$750</option>
                        <option value="750-1000">R$750 a R$1000</option>
                        <option value="1000+">Mais de R$1000</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.selectionGrid}>
                    {!quartoNumeroFilter && !tipoQuartoFilter && !faixaPrecoFilter ? (
                      <div style={{ 
                        gridColumn: '1 / -1', 
                        textAlign: 'center', 
                        padding: '40px 20px',
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏨</div>
                        <p>Selecione um ou mais filtros para visualizar os quartos disponíveis</p>
                      </div>
                    ) : (
                      availableQuartos
                        .filter((q) => {
                          if (!quartoNumeroFilter) return true;
                          return q.numero.toString().includes(quartoNumeroFilter);
                        })
                        .filter((q) => {
                          if (!tipoQuartoFilter) return true;
                          return q.tipo === tipoQuartoFilter;
                        })
                        .filter((q) => {
                          if (!faixaPrecoFilter) return true;
                          const preco = parseFloat(q.valorDiaria);
                          if (faixaPrecoFilter === '0-250') return preco <= 250;
                          if (faixaPrecoFilter === '250-500') return preco > 250 && preco <= 500;
                          if (faixaPrecoFilter === '500-750') return preco > 500 && preco <= 750;
                          if (faixaPrecoFilter === '750-1000') return preco > 750 && preco <= 1000;
                          if (faixaPrecoFilter === '1000+') return preco > 1000;
                          return true;
                        })
                        .slice(0, quartosDisplayCount)
                        .map(quarto => (
                          <div
                            key={quarto.id}
                            className={`${styles.selectionCard} ${styles.roomCard} ${formData.quartoId === quarto.id.toString() ? styles.selected : ''}`}
                            onClick={() => setFormData({...formData, quartoId: quarto.id.toString()})}
                          >
                            <img 
                              src={getRoomImage(quarto.tipo)} 
                              alt={quarto.tipo}
                              className={styles.roomCardImage}
                            />
                            <div className={styles.cardInfo}>
                              <h4>Quarto {quarto.numero}</h4>
                              <p>{quarto.tipo}</p>
                              <p className={styles.roomPrice}>R$ {parseFloat(quarto.valorDiaria).toFixed(2)}/dia</p>
                              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                👥 Capacidade: {quarto.capacidade} pessoa{quarto.capacidade > 1 ? 's' : ''}
                              </p>
                            </div>
                            {formData.quartoId === quarto.id.toString() && (
                              <div className={styles.selectedBadge}>✓</div>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                  
                  {/* Botão Ver Mais para quartos */}
                  {(quartoNumeroFilter || tipoQuartoFilter || faixaPrecoFilter) &&
                   availableQuartos
                     .filter((q) => !quartoNumeroFilter || q.numero.toString().includes(quartoNumeroFilter))
                     .filter((q) => !tipoQuartoFilter || q.tipo === tipoQuartoFilter)
                     .filter((q) => {
                       if (!faixaPrecoFilter) return true;
                       const preco = parseFloat(q.valorDiaria);
                       if (faixaPrecoFilter === '0-250') return preco <= 250;
                       if (faixaPrecoFilter === '250-500') return preco > 250 && preco <= 500;
                       if (faixaPrecoFilter === '500-750') return preco > 500 && preco <= 750;
                       if (faixaPrecoFilter === '750-1000') return preco > 750 && preco <= 1000;
                       if (faixaPrecoFilter === '1000+') return preco > 1000;
                       return true;
                     }).length > quartosDisplayCount && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <button
                        type="button"
                        onClick={() => setQuartosDisplayCount(prev => prev + 10)}
                        className="btn btn-secondary"
                      >
                        Ver Mais (+10)
                      </button>
                    </div>
                  )}
                  
                  {(quartoNumeroFilter || tipoQuartoFilter || faixaPrecoFilter) &&
                   availableQuartos
                    .filter((q) => !quartoNumeroFilter || q.numero.toString().includes(quartoNumeroFilter))
                    .filter((q) => !tipoQuartoFilter || q.tipo === tipoQuartoFilter)
                    .filter((q) => {
                      if (!faixaPrecoFilter) return true;
                      const preco = parseFloat(q.valorDiaria);
                      if (faixaPrecoFilter === '0-250') return preco <= 250;
                      if (faixaPrecoFilter === '250-500') return preco > 250 && preco <= 500;
                      if (faixaPrecoFilter === '500-750') return preco > 500 && preco <= 750;
                      if (faixaPrecoFilter === '750-1000') return preco > 750 && preco <= 1000;
                      if (faixaPrecoFilter === '1000+') return preco > 1000;
                      return true;
                    }).length === 0 && availableQuartos.length > 0 && (
                    <div className={styles.noResults}>
                      <p>🔍 Nenhum quarto encontrado com os filtros aplicados.</p>
                      <p>Tente ajustar os filtros ou limpar a pesquisa.</p>
                    </div>
                  )}
                  {availableQuartos.length === 0 && (
                    <div className={styles.noResults}>
                      <p>😔 Nenhum quarto disponível para {formData.numeroHospedes} hóspede{formData.numeroHospedes > 1 ? 's' : ''} no período selecionado.</p>
                      <p>Tente selecionar outras datas, reduzir o número de hóspedes ou entre em contato conosco.</p>
                    </div>
                  )}
                  <div className={styles.formButtons}>
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setFormStep(2)}
                    >
                      ← Voltar
                    </button>
                    <button 
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setFormStep(4)}
                      disabled={!formData.quartoId}
                    >
                      Continuar para Resumo →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Resumo e Confirmação */}
              {formStep === 4 && reservationTotal && (
                <div className={styles.formStepContent}>
                  <h3 className={styles.stepTitle}>✅ Confirme os Dados da Reserva</h3>
                  <div className={styles.summaryCompact}>
                    <div className={styles.summaryGrid}>
                      <div className={styles.summaryCard}>
                        <div className={styles.cardTitle}>👤 Cliente</div>
                        {selectedClient && (
                          <div className={styles.cardContent}>
                            <div className={styles.cardGrid}>
                              <div className={styles.mainInfo}>
                                <h3>{selectedClient.nome}</h3>
                              </div>
                              <div className={styles.detailsInfo}>
                                <p><strong>CPF:</strong> {selectedClient.cpf}</p>
                                <p><strong>Email:</strong> {selectedClient.email}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={styles.summaryCard}>
                        <div className={styles.cardTitle}>🛏️ Quarto</div>
                        {selectedRoom && (
                          <div className={styles.cardContent}>
                            <div className={styles.cardGrid}>
                              <div className={styles.imageColumn}>
                                <img 
                                  src={getRoomImage(selectedRoom.tipo)} 
                                  alt={selectedRoom.tipo}
                                  className={styles.roomImage}
                                />
                              </div>
                              <div className={styles.detailsInfo}>
                                <p><strong>Número:</strong> {selectedRoom.numero}</p>
                                <p><strong>Tipo:</strong> {selectedRoom.tipo}</p>
                                <p><strong>Diária:</strong> <span className={styles.priceTag}>R$ {parseFloat(selectedRoom.valorDiaria).toFixed(2)}</span></p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={styles.summaryCard}>
                        <div className={styles.cardTitle}>📅 Período</div>
                        <div className={styles.cardContent}>
                          <div className={styles.cardGrid}>
                            <div className={styles.mainInfo}>
                              <div className={styles.diasBadge}>
                                <div className={styles.diasNumber}>{reservationTotal.days}</div>
                                <div className={styles.diasLabel}>{reservationTotal.days === 1 ? 'diária' : 'diárias'}</div>
                              </div>
                            </div>
                            <div className={styles.detailsInfo}>
                              <p><strong>Check-in:</strong> {new Date(formData.dataCheckIn + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                              <p><strong>Check-out:</strong> {new Date(formData.dataCheckOut + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                              <p><strong>Hóspedes:</strong> {formData.numeroHospedes} pessoa{formData.numeroHospedes > 1 ? 's' : ''}</p>
                              {selectedHospedes.length > 0 && (
                                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                  {selectedHospedes.map(h => h.nome).join(', ')}
                                </p>
                              )}
                              {selectedHospedes.length > 0 && (
                                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                  {selectedHospedes.map(h => h.nome).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.summaryCard + ' ' + styles.totalCard}>
                        <div className={styles.cardTitle}>💰 Total</div>
                        <div className={styles.totalValue}>
                          R$ {reservationTotal.total.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className={styles.formButtons}>
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setFormStep(3)}
                      >
                        ← Voltar
                      </button>
                      <button type="submit" className="btn btn-success">
                        {editingId ? '✓ Salvar Alterações' : '✓ Confirmar Reserva'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
              <label className={styles.filterLabel}>📋 Número da Reserva</label>
              <input
                type="text"
                placeholder="Digite o número..."
                value={filterReservaId}
                onChange={(e) => setFilterReservaId(e.target.value)}
                className={styles.filterInput}
              />
            </div>
            
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>👤 CPF do Hóspede</label>
              <input
                type="text"
                placeholder="Digite o CPF..."
                value={filterCpf}
                onChange={(e) => setFilterCpf(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>🛏️ Número do Quarto</label>
              <input
                type="text"
                placeholder="Digite o número..."
                value={filterQuartoNumero}
                onChange={(e) => setFilterQuartoNumero(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>📊 Status da Reserva</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterInput}
              >
                <option value="">Todos os Status</option>
                <option value="Confirmada">✓ Confirmada</option>
                <option value="Cancelada">✗ Cancelada</option>
                <option value="Finalizada">✔ Finalizada</option>
              </select>
            </div>

            <button
              className={styles.clearFiltersBtn}
              onClick={() => {
                setFilterReservaId('');
                setFilterCpf('');
                setFilterQuartoNumero('');
                setFilterStatus('');
              }}
            >
              ✕ Limpar Filtros
            </button>
          </aside>

          {/* Lista de Reservas */}
          <div className={styles.listingContent}>
            <div className="card">
              <div className={styles.listHeader}>
                <h2>Lista de Reservas</h2>
                <span className={styles.resultsCount}>
                  {(() => {
                    const count = reservas.filter(reserva => {
                      const idMatch = !filterReservaId || reserva.id.toString().includes(filterReservaId);
                      const cpfMatch = !filterCpf || reserva.cliente?.cpf.includes(filterCpf);
                      const quartoMatch = !filterQuartoNumero || reserva.quarto?.numero.toString().includes(filterQuartoNumero);
                      const statusMatch = !filterStatus || reserva.status === filterStatus;
                      return idMatch && cpfMatch && quartoMatch && statusMatch;
                    }).length;
                    return count === 1 ? '1 reserva encontrada' : `${count} reservas encontradas`;
                  })()}
                </span>
              </div>
              {reservas.length === 0 ? (
                <p>Nenhuma reserva cadastrada.</p>
              ) : (
                <>
                  <div className={styles.cardsGrid}>
                    {reservas
                      .filter(reserva => {
                        const idMatch = !filterReservaId || reserva.id.toString().includes(filterReservaId);
                        const cpfMatch = !filterCpf || reserva.cliente?.cpf.includes(filterCpf);
                        const quartoMatch = !filterQuartoNumero || reserva.quarto?.numero.toString().includes(filterQuartoNumero);
                        const statusMatch = !filterStatus || reserva.status === filterStatus;
                        return idMatch && cpfMatch && quartoMatch && statusMatch;
                      })
                      .slice(0, reservasDisplayCount)
                      .map((reserva) => (
                <div key={reserva.id} className={styles.itemCard}>
                  <img 
                    src={getRoomImage(reserva.quarto?.tipo)} 
                    alt={reserva.quarto?.tipo}
                    className={styles.cardImage}
                  />
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIcon}>📅</div>
                    <h3>Reserva #{reserva.id}</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>👤 Cliente:</span>
                      <span className={styles.value}>{reserva.cliente?.nome}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>🛏️ Quarto:</span>
                      <span className={styles.value}>
                        Nº {reserva.quarto?.numero} - {reserva.quarto?.tipo}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>📆 Check-in:</span>
                      <span className={styles.value}>{formatDate(reserva.dataCheckIn)}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>📆 Check-out:</span>
                      <span className={styles.value}>{formatDate(reserva.dataCheckOut)}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>👥 Hóspedes:</span>
                      <span className={styles.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {/* {reserva.numeroHospedes} pessoa{reserva.numeroHospedes > 1 ? 's' : ''} */}
                        {reserva.clienteIds && reserva.clienteIds.length > 0 && (
                          <button
                            className={styles.btnViewHospedes}
                            onClick={() => setHospedesModal({ isOpen: true, reserva })}
                            title="Ver detalhes dos hóspedes"
                          >
                            Ver Hóspedes
                          </button>
                        )}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>💰 Valor Total:</span>
                      <span className={styles.value} style={{ color: '#16a34a', fontWeight: '600', fontSize: '16px' }}>
                        R$ {parseFloat(reserva.valorTotal).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>🟢 Status:</span>
                      <select
                        value={reserva.status}
                        onChange={(e) => handleUpdateStatus(reserva.id, e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="Confirmada">Confirmada</option>
                        <option value="Cancelada">Cancelada</option>
                        <option value="Finalizada">Finalizada</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.btnEdit}
                      onClick={() => handleEdit(reserva)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className={styles.btnDelete}
                      onClick={() => handleDelete(reserva.id)}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
                  </div>
                  
                  {/* Botão Ver Mais para reservas */}
                  {reservas
                    .filter(reserva => {
                      const idMatch = !filterReservaId || reserva.id.toString().includes(filterReservaId);
                      const cpfMatch = !filterCpf || reserva.cliente?.cpf.includes(filterCpf);
                      const quartoMatch = !filterQuartoNumero || reserva.quarto?.numero.toString().includes(filterQuartoNumero);
                      const statusMatch = !filterStatus || reserva.status === filterStatus;
                      return idMatch && cpfMatch && quartoMatch && statusMatch;
                    }).length > reservasDisplayCount && (
                    <div style={{ textAlign: 'center', marginTop: '20px', padding: '20px' }}>
                      <button
                        onClick={() => setReservasDisplayCount(prev => prev + 10)}
                        className="btn btn-primary"
                        style={{ minWidth: '200px' }}
                      >
                        Ver Mais (+10)
                      </button>
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      </div>
      </div>

      {/* Modal de Hóspedes */}
      {hospedesModal.isOpen && hospedesModal.reserva && (
        <div className={styles.modalOverlay} onClick={() => setHospedesModal({ isOpen: false, reserva: null })}>
          <div className={styles.hospedesModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.hospedesModalHeader}>
              <h3>👥 Hóspedes da Reserva #{hospedesModal.reserva.id}</h3>
              <button 
                className={styles.hospedesModalClose}
                onClick={() => setHospedesModal({ isOpen: false, reserva: null })}
              >
                ✕
              </button>
            </div>
            <div className={styles.hospedesModalBody}>
              {hospedesModal.reserva.clienteIds && hospedesModal.reserva.clienteIds.length > 0 ? (
                hospedesModal.reserva.clienteIds.map((clienteId, index) => {
                  const cliente = clientes.find(c => c.id === clienteId);
                  if (!cliente) return (
                    <div key={index} className={styles.hospedeCard}>
                      <div className={styles.hospedeCardHeader}>
                        <span className={styles.hospedeNumber}>Hóspede {index + 1}</span>
                      </div>
                      <div className={styles.hospedeCardBody}>
                        <p className={styles.hospedeError}>Cliente não encontrado (ID: {clienteId})</p>
                      </div>
                    </div>
                  );
                  
                  return (
                    <div key={clienteId} className={styles.hospedeCard}>
                      <div className={styles.hospedeCardHeader}>
                        <span className={styles.hospedeNumber}>{cliente.nome}</span>
                      </div>
                      <div className={styles.hospedeCardBody}>
                        <div className={styles.hospedeInfo}>
                          <span className={styles.hospedeLabel}>🆔 CPF:</span>
                          <span className={styles.hospedeValue}>{cliente.cpf}</span>
                        </div>
                        <div className={styles.hospedeInfo}>
                          <span className={styles.hospedeLabel}>📧 Email:</span>
                          <span className={styles.hospedeValue}>{cliente.email}</span>
                        </div>
                        <div className={styles.hospedeInfo}>
                          <span className={styles.hospedeLabel}>📱 Telefone:</span>
                          <span className={styles.hospedeValue}>{cliente.telefone}</span>
                        </div>
                        {cliente.endereco && (
                          <div className={styles.hospedeInfo}>
                            <span className={styles.hospedeLabel}>📍 Endereço:</span>
                            <span className={styles.hospedeValue}>{cliente.endereco}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={styles.noHospedes}>Nenhum hóspede cadastrado para esta reserva.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        type={alertModal.type}
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, type: '', message: '' })}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Excluir Reserva"
        message="Tem certeza que deseja excluir esta reserva? O quarto ficará disponível novamente."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, reservaId: null })}
      />
    </div>
  );
};

export default Reservas;
