import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import styles from './Crud.module.css';
import quartoSolteiro from '../assets/images/quartoSolteiro.png';
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
  const [tipoQuartoFilter, setTipoQuartoFilter] = useState('');
  const [faixaPrecoFilter, setFaixaPrecoFilter] = useState('');
  const [filterCpf, setFilterCpf] = useState('');
  const [filterQuartoNumero, setFilterQuartoNumero] = useState('');
  const datePickerRef = useRef(null);
  const flatpickrInstance = useRef(null);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    quartoId: '',
    dataCheckIn: '',
    dataCheckOut: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (datePickerRef.current && window.flatpickr && showForm && formStep === 3) {
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
      const [reservasRes, clientesRes, quartosRes] = await Promise.all([
        api.get('/reservas'),
        api.get('/clientes'),
        api.get('/quartos'),
      ]);
      setReservas(reservasRes.data);
      setClientes(clientesRes.data);
      setQuartos(quartosRes.data);
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
      dataCheckIn: '',
      dataCheckOut: '',
    });
    setShowForm(false);
    setEditingId(null);
    setFormStep(1);
    setClienteSearch('');
    setQuartoSearch('');
    setTipoQuartoFilter('');
    setFaixaPrecoFilter('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/reservas/${editingId}`, formData);
        showMessage('success', 'Reserva atualizada com sucesso!');
      } else {
        await api.post('/reservas', formData);
        showMessage('success', 'Reserva criada com sucesso!');
      }
      await fetchData(); // Recarrega todos os dados incluindo quartos atualizados
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao salvar reserva';
      showMessage('error', errorMessage);
    }
  };

  const handleEdit = (reserva) => {
    setFormData({
      clienteId: reserva.clienteId.toString(),
      quartoId: reserva.quartoId.toString(),
      dataCheckIn: reserva.dataCheckIn,
      dataCheckOut: reserva.dataCheckOut,
      status: reserva.status
    });
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

  const getRoomImage = (tipo) => {
    const imageMap = {
      'Solteiro': quartoSolteiro,
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
                  <span className={styles.stepLabel}>Quarto</span>
                  <div className={styles.stepLine}></div>
                </div>
                <div className={`${styles.step} ${formStep >= 3 ? styles.active : ''} ${formStep > 3 ? styles.completed : ''}`}>
                  <span className={styles.stepNumber}>3</span>
                  <span className={styles.stepLabel}>Período</span>
                  <div className={styles.stepLine}></div>
                </div>
                <div className={`${styles.step} ${formStep >= 4 ? styles.active : ''}`}>
                  <span className={styles.stepNumber}>4</span>
                  <span className={styles.stepLabel}>Confirmar</span>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: Seleção de Cliente */}
              {formStep === 1 && (
                <div className={styles.formStepContent}>
                  <h3 className={styles.stepTitle}>👤 Selecione o Hóspede</h3>
                  <div className="form-group">
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
                    {clientes
                      .filter(c => 
                        !clienteSearch || 
                        c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) ||
                        c.cpf.includes(clienteSearch)
                      )
                      .map(cliente => (
                        <div 
                          key={cliente.id}
                          className={`${styles.selectionCard} ${formData.clienteId === cliente.id.toString() ? styles.selected : ''}`}
                          onClick={() => setFormData({...formData, clienteId: cliente.id.toString()})}
                        >
                          <div className={styles.cardIcon}>👤</div>
                          <div className={styles.cardInfo}>
                            <h4>{cliente.nome}</h4>
                            <p>CPF: {cliente.cpf}</p>
                            <p>Email: {cliente.email}</p>
                          </div>
                          {formData.clienteId === cliente.id.toString() && (
                            <div className={styles.selectedBadge}>✓</div>
                          )}
                        </div>
                      ))}
                  </div>
                  <div className={styles.formButtons}>
                    <button 
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setFormStep(2)}
                      disabled={!formData.clienteId}
                    >
                      Continuar para Quarto →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Seleção de Quarto */}
              {formStep === 2 && (
                <div className={styles.formStepContent}>
                  <h3 className={styles.stepTitle}>🛏️ Selecione o Quarto</h3>
                  
                  <div className={styles.filtersRow}>
                    <div className="form-group">
                      <label>🏨 Tipo do Quarto</label>
                      <select
                        value={tipoQuartoFilter}
                        onChange={(e) => setTipoQuartoFilter(e.target.value)}
                        className={styles.filterSelect}
                      >
                        <option value="">Todos os tipos</option>
                        <option value="Solteiro">Solteiro</option>
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
                        <option value="">R$ 0 - R$ 1500</option>
                        <option value="0-250">Até R$250</option>
                        <option value="250-500">R$250 a R$500</option>
                        <option value="500-750">R$500 a R$750</option>
                        <option value="750-1000">R$750 a R$1000</option>
                        <option value="1000+">Mais de R$1000</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.selectionGrid}>
                    {quartos
                      .filter((q) => q.disponivel || (editingId && q.id.toString() === formData.quartoId))
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
                          </div>
                          {formData.quartoId === quarto.id.toString() && (
                            <div className={styles.selectedBadge}>✓</div>
                          )}
                        </div>
                      ))}
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
                      disabled={!formData.quartoId}
                    >
                      Continuar para Período →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Seleção de Período */}
              {formStep === 3 && (
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
                      onClick={() => setFormStep(2)}
                    >
                      ← Voltar
                    </button>
                    <button 
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setFormStep(4)}
                      disabled={!formData.dataCheckIn || !formData.dataCheckOut}
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

            <button
              className={styles.clearFiltersBtn}
              onClick={() => {
                setFilterCpf('');
                setFilterQuartoNumero('');
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
                      const cpfMatch = !filterCpf || reserva.cliente?.cpf.includes(filterCpf);
                      const quartoMatch = !filterQuartoNumero || reserva.quarto?.numero.toString().includes(filterQuartoNumero);
                      return cpfMatch && quartoMatch;
                    }).length;
                    return count === 1 ? '1 reserva encontrada' : `${count} reservas encontradas`;
                  })()}
                </span>
              </div>
              {reservas.length === 0 ? (
                <p>Nenhuma reserva cadastrada.</p>
              ) : (
                <div className={styles.cardsGrid}>
                  {reservas
                    .filter(reserva => {
                      const cpfMatch = !filterCpf || reserva.cliente?.cpf.includes(filterCpf);
                      const quartoMatch = !filterQuartoNumero || reserva.quarto?.numero.toString().includes(filterQuartoNumero);
                      return cpfMatch && quartoMatch;
                    })
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
        title="Excluir Reserva"
        message="Tem certeza que deseja excluir esta reserva? O quarto ficará disponível novamente."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, reservaId: null })}
      />
    </div>
  );
};

export default Reservas;
