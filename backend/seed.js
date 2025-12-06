require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { sequelize } = require('./models');
const Cliente = require('./models/Cliente');
const Quarto = require('./models/Quarto');
const Reserva = require('./models/Reserva');

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes
    await sequelize.sync({ force: true });
    console.log('✅ Banco de dados limpo e recriado');

    // Criar clientes de exemplo
    const clientes = await Cliente.bulkCreate([
      { nome: 'João Silva', cpf: '12345678901', email: 'joao@email.com', telefone: '11987654321', cep: '01310100', logradouro: 'Avenida Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Maria Santos', cpf: '98765432109', email: 'maria@email.com', telefone: '11876543210', cep: '01310100', logradouro: 'Avenida Paulista', numero: '2000', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Pedro Oliveira', cpf: '45678912345', email: 'pedro@email.com', telefone: '11765432109', cep: '01310100', logradouro: 'Avenida Paulista', numero: '3000', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Ana Costa', cpf: '78912345678', email: 'ana@email.com', telefone: '11654321098', cep: '01310100', logradouro: 'Avenida Paulista', numero: '4000', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Carlos Ferreira', cpf: '32165498701', email: 'carlos@email.com', telefone: '11543210987', cep: '01310100', logradouro: 'Avenida Paulista', numero: '5000', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Julia Mendes', cpf: '65432198765', email: 'julia@email.com', telefone: '11432109876', cep: '01310200', logradouro: 'Rua Augusta', numero: '100', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Roberto Lima', cpf: '78945612378', email: 'roberto@email.com', telefone: '11321098765', cep: '01310200', logradouro: 'Rua Augusta', numero: '200', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Fernanda Souza', cpf: '14725836914', email: 'fernanda@email.com', telefone: '11210987654', cep: '01310300', logradouro: 'Rua da Consolação', numero: '300', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Ricardo Alves', cpf: '36925814736', email: 'ricardo@email.com', telefone: '11109876543', cep: '01310300', logradouro: 'Rua da Consolação', numero: '400', bairro: 'Consolação', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Patricia Rocha', cpf: '85296374185', email: 'patricia@email.com', telefone: '11098765432', cep: '01310400', logradouro: 'Alameda Santos', numero: '500', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Marcos Martins', cpf: '95175386295', email: 'marcos@email.com', telefone: '11987651234', cep: '01310400', logradouro: 'Alameda Santos', numero: '600', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Beatriz Castro', cpf: '75395145685', email: 'beatriz@email.com', telefone: '11876542345', cep: '01310500', logradouro: 'Rua Haddock Lobo', numero: '700', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Gustavo Pereira', cpf: '35795185375', email: 'gustavo@email.com', telefone: '11765433456', cep: '01310500', logradouro: 'Rua Haddock Lobo', numero: '800', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Camila Dias', cpf: '15935785415', email: 'camila@email.com', telefone: '11654324567', cep: '01310600', logradouro: 'Rua Oscar Freire', numero: '900', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Lucas Barbosa', cpf: '75315985375', email: 'lucas@email.com', telefone: '11543215678', cep: '01310600', logradouro: 'Rua Oscar Freire', numero: '1000', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Amanda Ribeiro', cpf: '95135785395', email: 'amanda@email.com', telefone: '11432106789', cep: '01310700', logradouro: 'Avenida Rebouças', numero: '1100', bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Rafael Cardoso', cpf: '15735985175', email: 'rafael@email.com', telefone: '11321097890', cep: '01310700', logradouro: 'Avenida Rebouças', numero: '1200', bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Tatiana Gomes', cpf: '35715985315', email: 'tatiana@email.com', telefone: '11210988901', cep: '01310800', logradouro: 'Rua Teodoro Sampaio', numero: '1300', bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Bruno Nascimento', cpf: '55795185395', email: 'bruno@email.com', telefone: '11109879012', cep: '01310800', logradouro: 'Rua Teodoro Sampaio', numero: '1400', bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP' },
      { nome: 'Larissa Araújo', cpf: '75395185715', email: 'larissa@email.com', telefone: '11098760123', cep: '01310900', logradouro: 'Avenida Faria Lima', numero: '1500', bairro: 'Itaim Bibi', cidade: 'São Paulo', estado: 'SP' },
    ]);
    console.log(`✅ ${clientes.length} clientes criados`);

    // Criar quartos de exemplo (30 quartos)
    const quartos = await Quarto.bulkCreate([
      // Quartos Solteiro (6 quartos)
      { numero: '101', tipo: 'Solteiro', capacidade: 1, valorDiaria: 150.00, descricao: 'Quarto simples com cama de solteiro' },
      { numero: '102', tipo: 'Solteiro', capacidade: 1, valorDiaria: 150.00, descricao: 'Quarto simples com cama de solteiro' },
      { numero: '103', tipo: 'Solteiro', capacidade: 1, valorDiaria: 150.00, descricao: 'Quarto simples com cama de solteiro' },
      { numero: '104', tipo: 'Solteiro', capacidade: 1, valorDiaria: 150.00, descricao: 'Quarto simples com cama de solteiro' },
      { numero: '105', tipo: 'Solteiro', capacidade: 1, valorDiaria: 150.00, descricao: 'Quarto simples com cama de solteiro' },
      { numero: '106', tipo: 'Solteiro', capacidade: 1, valorDiaria: 150.00, descricao: 'Quarto simples com cama de solteiro' },
      
      // Quartos SolteiroDuas (6 quartos)
      { numero: '201', tipo: 'SolteiroDuas', capacidade: 2, valorDiaria: 200.00, descricao: 'Quarto com duas camas de solteiro' },
      { numero: '202', tipo: 'SolteiroDuas', capacidade: 2, valorDiaria: 200.00, descricao: 'Quarto com duas camas de solteiro' },
      { numero: '203', tipo: 'SolteiroDuas', capacidade: 2, valorDiaria: 200.00, descricao: 'Quarto com duas camas de solteiro' },
      { numero: '204', tipo: 'SolteiroDuas', capacidade: 2, valorDiaria: 200.00, descricao: 'Quarto com duas camas de solteiro' },
      { numero: '205', tipo: 'SolteiroDuas', capacidade: 2, valorDiaria: 200.00, descricao: 'Quarto com duas camas de solteiro' },
      { numero: '206', tipo: 'SolteiroDuas', capacidade: 2, valorDiaria: 200.00, descricao: 'Quarto com duas camas de solteiro' },
      
      // Quartos Casal (6 quartos)
      { numero: '301', tipo: 'Casal', capacidade: 2, valorDiaria: 300.00, descricao: 'Quarto com cama de casal' },
      { numero: '302', tipo: 'Casal', capacidade: 2, valorDiaria: 300.00, descricao: 'Quarto com cama de casal' },
      { numero: '303', tipo: 'Casal', capacidade: 2, valorDiaria: 300.00, descricao: 'Quarto com cama de casal' },
      { numero: '304', tipo: 'Casal', capacidade: 2, valorDiaria: 300.00, descricao: 'Quarto com cama de casal' },
      { numero: '305', tipo: 'Casal', capacidade: 2, valorDiaria: 300.00, descricao: 'Quarto com cama de casal' },
      { numero: '306', tipo: 'Casal', capacidade: 2, valorDiaria: 300.00, descricao: 'Quarto com cama de casal' },
      
      // Quartos Suíte (6 quartos)
      { numero: '401', tipo: 'Suíte', capacidade: 2, valorDiaria: 500.00, descricao: 'Suíte com hidromassagem' },
      { numero: '402', tipo: 'Suíte', capacidade: 2, valorDiaria: 500.00, descricao: 'Suíte com varanda' },
      { numero: '403', tipo: 'Suíte', capacidade: 2, valorDiaria: 500.00, descricao: 'Suíte com vista para o mar' },
      { numero: '404', tipo: 'Suíte', capacidade: 2, valorDiaria: 500.00, descricao: 'Suíte com sala de estar' },
      { numero: '405', tipo: 'Suíte', capacidade: 2, valorDiaria: 500.00, descricao: 'Suíte master' },
      { numero: '406', tipo: 'Suíte', capacidade: 2, valorDiaria: 500.00, descricao: 'Suíte presidencial' },
      
      // Quartos Luxo (6 quartos)
      { numero: '501', tipo: 'Luxo', capacidade: 2, valorDiaria: 1000.00, descricao: 'Suíte de luxo com vista panorâmica' },
      { numero: '502', tipo: 'Luxo', capacidade: 2, valorDiaria: 1000.00, descricao: 'Suíte de luxo com jacuzzi privativa' },
      { numero: '503', tipo: 'Luxo', capacidade: 2, valorDiaria: 1000.00, descricao: 'Suíte de luxo com terraço' },
      { numero: '504', tipo: 'Luxo', capacidade: 2, valorDiaria: 1000.00, descricao: 'Suíte de luxo penthouse' },
      { numero: '505', tipo: 'Luxo', capacidade: 2, valorDiaria: 1000.00, descricao: 'Suíte de luxo imperial' },
      { numero: '506', tipo: 'Luxo', capacidade: 2, valorDiaria: 1000.00, descricao: 'Suíte de luxo royal' },
    ]);
    console.log(`✅ ${quartos.length} quartos criados`);

    // Criar reservas de exemplo com múltiplos hóspedes no campo clienteIds (JSON) - 20 reservas
    
    // Reservas Confirmadas (10) - Datas atuais e futuras (dez/2025 até jun/2026)
    await Reserva.create({ clienteId: clientes[0].id, clienteIds: [clientes[0].id], quartoId: quartos[0].id, dataCheckIn: '2025-12-10', dataCheckOut: '2025-12-15', valorTotal: 750.00, numeroHospedes: 1, status: 'Confirmada' });
    await Reserva.create({ clienteId: clientes[1].id, clienteIds: [clientes[1].id, clientes[2].id], quartoId: quartos[6].id, dataCheckIn: '2025-12-20', dataCheckOut: '2025-12-25', valorTotal: 800.00, numeroHospedes: 2, status: 'Confirmada' });
    await Reserva.create({ clienteId: clientes[3].id, clienteIds: [clientes[3].id, clientes[4].id], quartoId: quartos[12].id, dataCheckIn: '2026-01-05', dataCheckOut: '2026-01-10', valorTotal: 1200.00, numeroHospedes: 2, status: 'Confirmada' });
    await Reserva.create({ clienteId: clientes[5].id, clienteIds: [clientes[5].id, clientes[6].id], quartoId: quartos[18].id, dataCheckIn: '2026-01-15', dataCheckOut: '2026-01-20', valorTotal: 2500.00, numeroHospedes: 2, status: 'Confirmada' });
    await Reserva.create({ clienteId: clientes[7].id, clienteIds: [clientes[7].id], quartoId: quartos[24].id, dataCheckIn: '2026-02-01', dataCheckOut: '2026-02-06', valorTotal: 5000.00, numeroHospedes: 1, status: 'Confirmada' });
    await Reserva.create({ clienteId: clientes[8].id, clienteIds: [clientes[8].id], quartoId: quartos[1].id, dataCheckIn: '2026-02-10', dataCheckOut: '2026-02-15', valorTotal: 600.00, numeroHospedes: 1, status: 'Confirmada' });
    await Reserva.create({ clienteId: clientes[9].id, clienteIds: [clientes[9].id, clientes[10].id], quartoId: quartos[7].id, dataCheckIn: '2026-03-01', dataCheckOut: '2026-03-06', valorTotal: 1000.00, numeroHospedes: 2, status: 'Confirmada' });
    await Reserva.create({ clienteId: clientes[11].id, clienteIds: [clientes[11].id, clientes[12].id], quartoId: quartos[13].id, dataCheckIn: '2026-03-15', dataCheckOut: '2026-03-20', valorTotal: 1500.00, numeroHospedes: 2, status: 'Confirmada' });
    await Reserva.create({ clienteId: clientes[13].id, clienteIds: [clientes[13].id], quartoId: quartos[19].id, dataCheckIn: '2026-04-10', dataCheckOut: '2026-04-15', valorTotal: 2000.00, numeroHospedes: 1, status: 'Confirmada' });
    await Reserva.create({ clienteId: clientes[14].id, clienteIds: [clientes[14].id, clientes[15].id], quartoId: quartos[25].id, dataCheckIn: '2026-05-01', dataCheckOut: '2026-05-06', valorTotal: 5000.00, numeroHospedes: 2, status: 'Confirmada' });
    
    // Reservas Canceladas (5) - Algumas futuras canceladas
    await Reserva.create({ clienteId: clientes[2].id, clienteIds: [clientes[2].id], quartoId: quartos[2].id, dataCheckIn: '2026-01-08', dataCheckOut: '2026-01-10', valorTotal: 300.00, numeroHospedes: 1, status: 'Cancelada' });
    await Reserva.create({ clienteId: clientes[4].id, clienteIds: [clientes[4].id, clientes[5].id], quartoId: quartos[8].id, dataCheckIn: '2026-02-12', dataCheckOut: '2026-02-15', valorTotal: 600.00, numeroHospedes: 2, status: 'Cancelada' });
    await Reserva.create({ clienteId: clientes[10].id, clienteIds: [clientes[10].id], quartoId: quartos[14].id, dataCheckIn: '2026-03-08', dataCheckOut: '2026-03-11', valorTotal: 900.00, numeroHospedes: 1, status: 'Cancelada' });
    await Reserva.create({ clienteId: clientes[15].id, clienteIds: [clientes[15].id, clientes[16].id], quartoId: quartos[20].id, dataCheckIn: '2026-04-20', dataCheckOut: '2026-04-23', valorTotal: 1500.00, numeroHospedes: 2, status: 'Cancelada' });
    await Reserva.create({ clienteId: clientes[17].id, clienteIds: [clientes[17].id], quartoId: quartos[26].id, dataCheckIn: '2026-05-15', dataCheckOut: '2026-05-20', valorTotal: 4000.00, numeroHospedes: 1, status: 'Cancelada' });
    
    // Reservas Finalizadas (5) - Reservas já concluídas (set-nov/2025)
    await Reserva.create({ clienteId: clientes[6].id, clienteIds: [clientes[6].id, clientes[7].id], quartoId: quartos[3].id, dataCheckIn: '2025-09-01', dataCheckOut: '2025-09-05', valorTotal: 800.00, numeroHospedes: 2, status: 'Finalizada' });
    await Reserva.create({ clienteId: clientes[12].id, clienteIds: [clientes[12].id], quartoId: quartos[9].id, dataCheckIn: '2025-09-15', dataCheckOut: '2025-09-20', valorTotal: 1000.00, numeroHospedes: 1, status: 'Finalizada' });
    await Reserva.create({ clienteId: clientes[16].id, clienteIds: [clientes[16].id, clientes[17].id], quartoId: quartos[15].id, dataCheckIn: '2025-10-10', dataCheckOut: '2025-10-15', valorTotal: 1500.00, numeroHospedes: 2, status: 'Finalizada' });
    await Reserva.create({ clienteId: clientes[18].id, clienteIds: [clientes[18].id, clientes[19].id], quartoId: quartos[21].id, dataCheckIn: '2025-10-20', dataCheckOut: '2025-10-25', valorTotal: 2000.00, numeroHospedes: 2, status: 'Finalizada' });
    await Reserva.create({ clienteId: clientes[19].id, clienteIds: [clientes[19].id], quartoId: quartos[27].id, dataCheckIn: '2025-11-01', dataCheckOut: '2025-11-06', valorTotal: 5000.00, numeroHospedes: 1, status: 'Finalizada' });

    console.log(`✅ 20 reservas criadas com múltiplos hóspedes`);

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - ${clientes.length} clientes`);
    console.log(`   - ${quartos.length} quartos`);
    console.log(`   - 20 reservas (com diferentes status e combinações de hóspedes)`);
    console.log('\n💡 Distribuição das reservas:');
    console.log('   - 10 Confirmadas');
    console.log('   - 5 Canceladas');
    console.log('   - 5 Finalizadas');
    
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();
