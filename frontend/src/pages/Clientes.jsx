import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Crud.module.css';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, clienteId: null });
  const [filterNome, setFilterNome] = useState('');
  const [filterCpf, setFilterCpf] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [formStep, setFormStep] = useState(1); // 1: Dados Pessoais, 2: Endereço
  const [displayCount, setDisplayCount] = useState(10); // Paginação
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  // Resetar paginação quando filtros mudarem
  useEffect(() => {
    setDisplayCount(10);
  }, [filterNome, filterCpf]);

  const fetchClientes = async () => {
    try {
      const response = await api.get('/clientes', { params: { limit: 1000 } });
      setClientes(response.data.clientes || response.data);
    } catch (error) {
      showMessage('error', 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, message) => {
    setAlertModal({ isOpen: true, type, message });
  };

  const formatCPF = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara: 000.000.000-00
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    if (limited.length <= 9) return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
  };

  const formatTelefone = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (celular com 9 dígitos)
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara: (00) 00000-0000 ou (00) 0000-0000
    if (limited.length <= 2) return limited;
    if (limited.length <= 6) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    if (limited.length <= 10) return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  };

  const capitalizeName = (name) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Não capitaliza preposições comuns
        const prepositions = ['de', 'da', 'do', 'das', 'dos', 'e'];
        if (prepositions.includes(word) && word.length <= 3) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 8);
    
    if (limited.length <= 5) return limited;
    return `${limited.slice(0, 5)}-${limited.slice(5)}`;
  };

  const buscarCEP = async (cep) => {
    const cepNumeros = cep.replace(/\D/g, '');
    
    if (cepNumeros.length !== 8) return;
    
    setCepLoading(true);
    setCepError('');
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setCepError('CEP não encontrado');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }));
    } catch (error) {
      setCepError('Erro ao buscar CEP');
    } finally {
      setCepLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'telefone') {
      formattedValue = formatTelefone(value);
    } else if (name === 'nome') {
      formattedValue = capitalizeName(value);
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
      
      // Busca automática quando CEP estiver completo
      if (formattedValue.replace(/\D/g, '').length === 8) {
        buscarCEP(formattedValue);
      }
    }
    
    setFormData({ ...formData, [name]: formattedValue });
  };

  const resetForm = () => {
    setFormData({ 
      nome: '', 
      cpf: '', 
      email: '', 
      telefone: '', 
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    });
    setEditingId(null);
    setShowForm(false);
    setCepError('');
    setFormStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📋 Dados do formulário:', formData);
    
    // Remove formatação antes de enviar
    const dataToSend = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ''), // Remove pontos e hífen
      telefone: formData.telefone.replace(/\D/g, ''), // Remove parênteses, espaço e hífen
      cep: formData.cep.replace(/\D/g, ''), // Remove hífen
    };
    
    console.log('📤 Dados a enviar (sem formatação):', dataToSend);
    
    try {
      if (editingId) {
        console.log('✏️ Atualizando cliente ID:', editingId);
        const response = await api.put(`/clientes/${editingId}`, dataToSend);
        console.log('✅ Resposta da atualização:', response.data);
        showMessage('success', 'Cliente atualizado com sucesso!');
      } else {
        console.log('➕ Criando novo cliente...');
        const response = await api.post('/clientes', dataToSend);
        console.log('✅ Resposta da criação:', response.data);
        showMessage('success', 'Cliente cadastrado com sucesso!');
      }
      fetchClientes();
      resetForm();
    } catch (error) {
      console.error('❌ Erro ao salvar cliente:');
      console.error('Status:', error.response?.status);
      console.error('Dados do erro:', error.response?.data);
      console.error('Mensagem:', error.message);
      console.error('Erro completo:', error);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Erro ao salvar cliente';
      showMessage('error', errorMessage);
    }
  };

  const handleEdit = (cliente) => {
    setFormData({
      nome: cliente.nome,
      cpf: cliente.cpf,
      email: cliente.email,
      telefone: cliente.telefone,
      cep: cliente.cep || '',
      logradouro: cliente.logradouro || '',
      numero: cliente.numero || '',
      complemento: cliente.complemento || '',
      bairro: cliente.bairro || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
    });
    setEditingId(cliente.id);
    setShowForm(true);
    setFormStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setConfirmModal({ isOpen: true, clienteId: id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/clientes/${confirmModal.clienteId}`);
      showMessage('success', 'Cliente excluído com sucesso!');
      fetchClientes();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao excluir cliente';
      showMessage('error', errorMessage);
    } finally {
      setConfirmModal({ isOpen: false, clienteId: null });
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className={styles.crudContainer}>
      <div className="container">
        <div className={styles.header}>
          <h1>👥 Gerenciamento de Clientes</h1>
          <button
            className={showForm ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancelar' : '+ Novo Cliente'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <div className={styles.formHeader}>
              <h2>{editingId ? '✏️ Editar Cliente' : '➕ Novo Cliente'}</h2>
              <p className={styles.formSubtitle}>
                {editingId 
                  ? 'Atualize as informações do cliente' 
                  : 'Preencha os dados para cadastrar um novo cliente'}
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Passo 1: Dados Pessoais */}
              {formStep === 1 && (
                <div>
                  <div className={styles.formHeader}>
                    <h3>📋 Passo 1 de 2: Dados Pessoais</h3>
                  </div>
                  
                  <div className="form-group">
                    <label>👤 Nome Completo *</label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>🆔 CPF *</label>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>📞 Telefone *</label>
                      <input
                        type="text"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>✉️ Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="exemplo@email.com"
                      required
                    />
                  </div>
                  
                  <div className={styles.formButtons}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setFormStep(2)}
                    >
                      Continuar para endereço →
                    </button>
                  </div>
                </div>
              )}
              
              {/* Passo 2: Endereço */}
              {formStep === 2 && (
                <div>
                  <div className={styles.formHeader}>
                    <h3>🏠 Passo 2 de 2: Endereço</h3>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>📮 CEP *</label>
                      <input
                        type="text"
                        name="cep"
                        value={formData.cep}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        required
                      />
                      {cepLoading && <small style={{color: 'var(--accent)'}}>Buscando CEP...</small>}
                      {cepError && <small style={{color: 'var(--error)'}}>{cepError}</small>}
                    </div>
                    <div className="form-group">
                      <label>🏘️ Bairro *</label>
                      <input
                        type="text"
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleInputChange}
                        placeholder="Nome do bairro"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>🛣️ Logradouro/Rua *</label>
                    <input
                      type="text"
                      name="logradouro"
                      value={formData.logradouro}
                      onChange={handleInputChange}
                      placeholder="Nome da rua, avenida..."
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>🔢 Número *</label>
                      <input
                        type="text"
                        name="numero"
                        value={formData.numero}
                        onChange={handleInputChange}
                        placeholder="Nº da residência"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>🏢 Complemento</label>
                      <input
                        type="text"
                        name="complemento"
                        value={formData.complemento}
                        onChange={handleInputChange}
                        placeholder="Apto, bloco, etc..."
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>🏙️ Cidade *</label>
                      <input
                        type="text"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleInputChange}
                        placeholder="Nome da cidade"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>🗺️ Estado *</label>
                      <input
                        type="text"
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        placeholder="UF"
                        maxLength="2"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formButtons}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setFormStep(1)}
                    >
                      ← Voltar para dados pessoais
                    </button>
                    <button type="submit" className="btn btn-success">
                      {editingId ? '✓ Atualizar' : '✓ Cadastrar'}
                    </button>
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
              <label className={styles.filterLabel}>👤 Nome do Cliente</label>
              <input
                type="text"
                placeholder="Digite o nome..."
                value={filterNome}
                onChange={(e) => setFilterNome(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>🆔 CPF</label>
              <input
                type="text"
                placeholder="Digite o CPF..."
                value={filterCpf}
                onChange={(e) => setFilterCpf(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <button
              className={styles.clearFiltersBtn}
              onClick={() => {
                setFilterNome('');
                setFilterCpf('');
              }}
            >
              ✕ Limpar Filtros
            </button>
          </aside>

          {/* Lista de Clientes */}
          <div className={styles.listingContent}>
            <div className="card">
              <div className={styles.listHeader}>
                <h2>Lista de Clientes</h2>
                <span className={styles.resultsCount}>
                  {(() => {
                    const count = clientes.filter(cliente => {
                      const nomeMatch = !filterNome || cliente.nome.toLowerCase().includes(filterNome.toLowerCase());
                      const cpfMatch = !filterCpf || cliente.cpf.includes(filterCpf);
                      return nomeMatch && cpfMatch;
                    }).length;
                    return count === 1 ? '1 cliente encontrado' : `${count} clientes encontrados`;
                  })()}
                </span>
              </div>
              {clientes.length === 0 ? (
                <p>Nenhum cliente cadastrado.</p>
              ) : (
                <>
                  <div className={styles.cardsGrid}>
                    {clientes
                      .filter(cliente => {
                        const nomeMatch = !filterNome || cliente.nome.toLowerCase().includes(filterNome.toLowerCase());
                        const cpfMatch = !filterCpf || cliente.cpf.includes(filterCpf);
                        return nomeMatch && cpfMatch;
                      })
                      .slice(0, displayCount)
                      .map((cliente) => (
                <div key={cliente.id} className={styles.itemCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIcon}>👤</div>
                    <h3>{cliente.nome}</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>🆔 CPF:</span>
                      <span className={styles.value}>{cliente.cpf}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>✉️ Email:</span>
                      <span className={styles.value}>{cliente.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>📞 Telefone:</span>
                      <span className={styles.value}>{cliente.telefone}</span>
                    </div>
                    {(cliente.logradouro || cliente.cidade || cliente.estado) && (
                      <div className={styles.infoRow}>
                        <span className={styles.label}>🏠 Endereço:</span>
                        <span className={styles.value}>
                          {[
                            cliente.logradouro && `${cliente.logradouro}${cliente.numero ? ', ' + cliente.numero : ''}`,
                            cliente.complemento,
                            cliente.bairro,
                            cliente.cidade && cliente.estado ? `${cliente.cidade}/${cliente.estado}` : cliente.cidade || cliente.estado,
                            cliente.cep
                          ].filter(Boolean).join(' - ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.btnEdit}
                      onClick={() => handleEdit(cliente)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className={styles.btnDelete}
                      onClick={() => handleDelete(cliente.id)}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
                  </div>
                  
                  {/* Botão Ver Mais */}
                  {clientes
                    .filter(cliente => {
                      const nomeMatch = !filterNome || cliente.nome.toLowerCase().includes(filterNome.toLowerCase());
                      const cpfMatch = !filterCpf || cliente.cpf.includes(filterCpf);
                      return nomeMatch && cpfMatch;
                    }).length > displayCount && (
                    <div style={{ textAlign: 'center', marginTop: '20px', padding: '20px' }}>
                      <button
                        onClick={() => setDisplayCount(prev => prev + 10)}
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

      <AlertModal
        isOpen={alertModal.isOpen}
        type={alertModal.type}
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, type: '', message: '' })}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, clienteId: null })}
      />
    </div>
  );
};

export default Clientes;
