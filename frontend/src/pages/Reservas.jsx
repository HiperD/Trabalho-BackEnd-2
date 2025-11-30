import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import styles from './Crud.module.css';
import quartoSolteiro from '../assets/images/quartoSolteiro.png';
import quartoCasal from '../assets/images/quartoCasal.png';
import quartoSuite from '../assets/images/quartoSuite.png';
import quartoLuxuoso from '../assets/images/quartoLuxuoso.png';
import ConfirmModal from '../components/ConfirmModal';

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, reservaId: null });
  const [clienteSearch, setClienteSearch] = useState('');
  const [quartoSearch, setQuartoSearch] = useState('');
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
    if (datePickerRef.current && window.flatpickr && showForm) {
      flatpickrInstance.current = window.flatpickr(datePickerRef.current, {
        mode: 'range',
        dateFormat: 'd/m/Y',
        locale: 'pt',
        minDate: 'today',
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
    }

    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
      }
    };
  }, [showForm]);

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

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservas', formData);
      showMessage('success', 'Reserva criada com sucesso!');
      await fetchData(); // Recarrega todos os dados incluindo quartos atualizados
      resetForm();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Erro ao criar reserva');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/reservas/${id}`, { status });
      showMessage('success', 'Status atualizado com sucesso!');
      await fetchData(); // Recarrega todos os dados incluindo quartos atualizados
    } catch (error) {
      showMessage('error', 'Erro ao atualizar status');
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
      showMessage('error', 'Erro ao excluir reserva');
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
    
    const checkIn = new Date(formData.dataCheckIn);
    const checkOut = new Date(formData.dataCheckOut);
    const diffTime = Math.abs(checkOut - checkIn);
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
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancelar' : '+ Nova Reserva'}
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {showForm && (
          <div className="card">
            <div className={styles.formHeader}>
              <h2>➕ Nova Reserva</h2>
              <p className={styles.formSubtitle}>
                Selecione o cliente, quarto disponível e as datas da reserva
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.reservationFormGrid}>
                {/* Coluna Esquerda - Seleções */}
                <div className={styles.selectionColumn}>
                  <div className="form-group">
                    <label>👤 Cliente *</label>
                    <select
                      name="clienteId"
                      value={formData.clienteId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione um cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome} - {cliente.cpf}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>🛏️ Quarto *</label>
                    <select
                      name="quartoId"
                      value={formData.quartoId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione um quarto disponível</option>
                      {quartos
                        .filter((q) => q.disponivel)
                        .map((quarto) => (
                          <option key={quarto.id} value={quarto.id}>
                            Quarto {quarto.numero} - {quarto.tipo} - R${' '}
                            {parseFloat(quarto.valorDiaria).toFixed(2)}/dia
                          </option>
                        ))}
                    </select>
                    {selectedRoom && (
                      <div className={styles.roomPreview}>
                        <img 
                          src={getRoomImage(selectedRoom.tipo)} 
                          alt={selectedRoom.tipo}
                          className={styles.previewImage}
                        />
                        <div className={styles.previewInfo}>
                          <span className={styles.previewType}>{selectedRoom.tipo}</span>
                          <span className={styles.previewNumber}>Quarto {selectedRoom.numero}</span>
                          <span className={styles.previewPrice}>
                            R$ {parseFloat(selectedRoom.valorDiaria).toFixed(2)}/dia
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
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
                </div>

                {/* Coluna Direita - Resumo */}
                <div className={styles.summaryColumn}>
                  {reservationTotal ? (
                    <div className={styles.reservationSummary}>
                      <div className={styles.summaryHeader}>
                        <h3>💰 Resumo da Reserva</h3>
                      </div>
                      <div className={styles.summaryContent}>
                        {selectedClient && (
                          <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>👤 Cliente:</span>
                            <span className={styles.summaryValue}>
                              {selectedClient.nome}
                            </span>
                          </div>
                        )}
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>🛏️ Quarto:</span>
                          <span className={styles.summaryValue}>
                            {selectedRoom.tipo} - Nº {selectedRoom.numero}
                          </span>
                        </div>
                        <div className={styles.summaryDivider}></div>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>📅 Total de Diárias:</span>
                          <span className={styles.summaryValue}>
                            {reservationTotal.days} {reservationTotal.days === 1 ? 'dia' : 'dias'}
                          </span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span className={styles.summaryLabel}>💵 Valor por Diária:</span>
                          <span className={styles.summaryValue}>
                            R$ {parseFloat(selectedRoom.valorDiaria).toFixed(2)}
                          </span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                          <span className={styles.summaryLabel}>🎯 Valor Total:</span>
                          <span className={styles.summaryValueTotal}>
                            R$ {reservationTotal.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.formButtons}>
                        <button type="submit" className="btn btn-success">
                          ✓ Criar Reserva
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.summaryPlaceholder}>
                      <div className={styles.placeholderIcon}>💰</div>
                      <p>Selecione um quarto e período para ver o resumo da reserva</p>
                    </div>
                  )}
                </div>
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
                      className={styles.btnDelete}
                      onClick={() => handleDelete(reserva.id)}
                      style={{ width: '100%' }}
                    >
                      🗑️ Excluir Reserva
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
