import { useState, useEffect } from 'react';
import styles from './CalendarModal.module.css';

const CalendarModal = ({ isOpen, quarto, onClose }) => {
  const [reservas, setReservas] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tooltip, setTooltip] = useState({ show: false, reserva: null, x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && quarto) {
      fetchReservas();
    }
  }, [isOpen, quarto]);

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/reservas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const reservasDoQuarto = data.filter(r => r.quartoId === quarto.id);
      console.log('Todas as reservas:', data);
      console.log('Reservas do quarto', quarto.numero, ':', reservasDoQuarto);
      setReservas(reservasDoQuarto);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    }
  };

  if (!isOpen) return null;

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Dias do mês anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }

    // Dias do mês atual
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        isCurrentMonth: true,
        isPrevMonth: false
      });
    }

    // Dias do próximo mês para completar 6 linhas (42 células)
    const totalCells = 42; // 6 linhas x 7 dias
    const remainingCells = totalCells - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays = [];
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push({
        day: i,
        isCurrentMonth: false,
        isPrevMonth: false
      });
    }

    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    return { allDays, year, month };
  };

  const getReservaForDate = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return null;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];

    return reservas.find(reserva => {
      if (reserva.status !== 'Confirmada') return false;
      
      const checkIn = reserva.dataCheckIn.split('T')[0];
      const checkOut = reserva.dataCheckOut.split('T')[0];
      
      return dateStr >= checkIn && dateStr < checkOut;
    });
  };

  const isDateReserved = (day, isCurrentMonth) => {
    return getReservaForDate(day, isCurrentMonth) !== null && getReservaForDate(day, isCurrentMonth) !== undefined;
  };

  const { allDays, year, month } = getDaysInMonth(currentMonth);
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>📅 Disponibilidade - Quarto {quarto?.numero}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.calendarHeader}>
            <button onClick={previousMonth} className={styles.navBtn}>←</button>
            <h4>{monthNames[month]} {year}</h4>
            <button onClick={nextMonth} className={styles.navBtn}>→</button>
          </div>

          <div className={styles.calendar}>
            <div className={styles.weekDays}>
              {dayNames.map(day => (
                <div key={day} className={styles.weekDay}>{day}</div>
              ))}
            </div>

            <div className={styles.days}>
              {allDays.map((dayObj, index) => {
                const { day, isCurrentMonth } = dayObj;
                const reserved = isDateReserved(day, isCurrentMonth);
                const reserva = getReservaForDate(day, isCurrentMonth);
                const today = new Date();
                const isToday = isCurrentMonth &&
                               today.getDate() === day && 
                               today.getMonth() === month && 
                               today.getFullYear() === year;

                return (
                  <div 
                    key={index} 
                    className={`${styles.day} ${
                      !isCurrentMonth ? styles.otherMonth : 
                      reserved ? styles.reserved : styles.available
                    } ${isToday ? styles.today : ''}`}
                    onMouseEnter={(e) => {
                      if (reserved && reserva) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          show: true,
                          reserva,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip({ show: false, reserva: null, x: 0, y: 0 })}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendColor} ${styles.availableColor}`}></span>
              <span>Disponível</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendColor} ${styles.reservedColor}`}></span>
              <span>Ocupado</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendColor} ${styles.todayColor}`}></span>
              <span>Hoje</span>
            </div>
          </div>
        </div>

        {tooltip.show && tooltip.reserva && (
          <div 
            className={styles.tooltip}
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`
            }}
          >
            <div className={styles.tooltipHeader}>
              <strong>📋 Reserva #{tooltip.reserva.id}</strong>
            </div>
            <div className={styles.tooltipBody}>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLabel}>👤 Cliente:</span>
                <span className={styles.tooltipValue}>{tooltip.reserva.cliente?.nome || 'N/A'}</span>
              </div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLabel}>🆔 CPF:</span>
                <span className={styles.tooltipValue}>{tooltip.reserva.cliente?.cpf || 'N/A'}</span>
              </div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLabel}>📅 Check-in:</span>
                <span className={styles.tooltipValue}>{new Date(tooltip.reserva.dataCheckIn).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLabel}>📅 Check-out:</span>
                <span className={styles.tooltipValue}>{new Date(tooltip.reserva.dataCheckOut).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLabel}>💰 Valor:</span>
                <span className={styles.tooltipValue}>R$ {parseFloat(tooltip.reserva.valorTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <button className="btn btn-primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
