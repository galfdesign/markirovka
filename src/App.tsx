import React, { useState, useRef } from 'react';
import './App.css';
import AppleCard from './components/AppleCard';
// @ts-ignore
const pdfMake = window.pdfMake;

interface CardData {
  room: string;
  collector: string;
}

function App() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [modalData, setModalData] = useState<CardData>({ room: '', collector: '' });
  const listRef = useRef<HTMLDivElement>(null);

  const openCreateModal = () => {
    setModalData({ room: '', collector: '' });
    setModalIdx(null);
    setModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    setModalData(cards[idx]);
    setModalIdx(idx);
    setModalOpen(true);
  };

  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModalData({ ...modalData, [e.target.name]: e.target.value });
  };

  const handleModalSave = () => {
    if (modalIdx === null) {
      setCards([...cards, modalData]);
    } else {
      setCards(cards.map((c, i) => (i === modalIdx ? modalData : c)));
    }
    setModalOpen(false);
  };

  const handleDeleteCard = (idx: number) => {
    setCards(cards.filter((_, i) => i !== idx));
  };

  const handleExportPDF = () => {
    const docDefinition = {
      content: [
        { text: 'Список карточек', style: 'header' },
        {
          ol: cards.map((card, idx) => (
            { text: `Помещение: ${card.room || '-'}, Коллектор: ${card.collector || '-'}` }
          ))
        },
        { text: ' ', margin: [0, 10] },
        { text: 'Карточки', style: 'header', margin: [0, 10, 0, 4] },
        ...cards.map((card, idx) => ([
          { text: `Карточка №${idx + 1}`, style: 'subheader', margin: [0, 8, 0, 2] },
          { columns: [
            { width: 'auto', text: 'Помещение:' },
            { width: '*', text: card.room || '-' }
          ]},
          { columns: [
            { width: 'auto', text: 'Коллектор:' },
            { width: '*', text: card.collector || '-' }
          ]},
        ])).flat()
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 8]
        },
        subheader: {
          fontSize: 13,
          bold: true
        }
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 12
      }
    };
    pdfMake.createPdf(docDefinition).download('cards.pdf');
  };

  return (
    <div className="App">
      {/* Скрытый блок для списка карточек */}
      <div ref={listRef} style={{ position: 'absolute', left: -9999, top: 0, background: '#fff', color: '#222', padding: 16, fontSize: 12, width: 400 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Список карточек</div>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {cards.map((card, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>
              <span>Помещение: <b>{card.room || '-'}</b>, Коллектор: <b>{card.collector || '-'}</b></span>
            </li>
          ))}
        </ol>
      </div>
      <div className="apple-card-wrapper">
        {cards.map((card, idx) => (
          <div key={idx} onClick={() => openEditModal(idx)} style={{ cursor: 'pointer' }}>
            <AppleCard
              number={idx + 1}
              onDelete={() => handleDeleteCard(idx)}
              room={card.room}
              collector={card.collector}
            />
          </div>
        ))}
        <button className="apple-create-btn--centered" onClick={openCreateModal}>
          Добавить карточку
        </button>
        <button className="apple-create-btn--centered" style={{marginTop: 12, background: '#222'}} onClick={handleExportPDF}>
          Сохранить в PDF
        </button>
      </div>
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <h3 style={{marginTop:0}}>Карточка выхода</h3>
            <div className="apple-card-field">
              <label>Название помещения</label>
              <input
                name="room"
                type="text"
                value={modalData.room}
                onChange={handleModalChange}
                placeholder="Введите название помещения"
                autoFocus
              />
            </div>
            <div className="apple-card-field">
              <label>Название коллектора</label>
              <input
                name="collector"
                type="text"
                value={modalData.collector}
                onChange={handleModalChange}
                placeholder="Введите название коллектора"
              />
            </div>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button className="apple-create-btn--centered" style={{width: '100%'}} onClick={handleModalSave}>Сохранить</button>
              <button className="apple-create-btn--centered" style={{width: '100%', background:'#eee', color:'#222'}} onClick={()=>setModalOpen(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
