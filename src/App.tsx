import React, { useState, useRef } from 'react';
import './App.css';
import AppleCard from './components/AppleCard';
import Header from './components/Header';
import CollectorCard from './components/CollectorCard';
import NorSection from './components/NorSection';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// @ts-ignore
const pdfMake = window.pdfMake;

interface CardData {
  room: string;
  collector: string;
  index: number;
  deltaT?: number;
  totalLength?: number;
  supplyLength?: number;
  innerDiameter?: number;
  pipeStep?: number;
  power?: number;
  flowRate?: number;
  resistance?: number;
  regime?: string;
  usefulLength?: number;
}

const ROOM_OPTIONS = [
  'Прихожая',
  'Холл',
  'Гостиная',
  'Кухня',
  'Столовая',
  'Спальня',
  'Детская'
];

function App() {
  const [activeSection, setActiveSection] = useState('floor');
  const [cards, setCards] = useState<CardData[]>([]);
  const [collectorName, setCollectorName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<CardData>({
    room: '',
    collector: '',
    index: 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const norSectionRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (modalData.index === cards.length) {
      setCards([...cards, modalData]);
    } else {
      const newCards = [...cards];
      newCards[modalData.index] = modalData;
      setCards(newCards);
    }
    setShowModal(false);
  };

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      setCards(cards.filter((_, i) => i !== deleteIndex));
    }
    setShowDeleteConfirm(false);
    setDeleteIndex(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteIndex(null);
  };

  const handleEdit = (index: number) => {
    setModalData({ ...cards[index], index });
    setShowModal(true);
  };

  const handleUpdate = (index: number, data: CardData) => {
    const newCards = [...cards];
    newCards[index] = {
      ...newCards[index],
      ...data
    };
    setCards(newCards);
  };

  const handleExportPDF = () => {
    const docDefinition = {
      content: [
        { text: 'Список карточек', style: 'header' },
        {
          ol: cards.map((card, idx) => (
            { text: `Помещение: ${card.room || '-'}, Расход: ${card.collector || '-'}` }
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
            { width: 'auto', text: 'Расход:' },
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportNorToPdf = async () => {
    console.log('Starting PDF export...');
    try {
      setActiveSection('nor');
      await new Promise(r => setTimeout(r, 500));
      if (!norSectionRef.current) {
        console.error('norSectionRef is not available');
        return;
      }
      const canvas = await html2canvas(norSectionRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 900,
        windowWidth: 900
      });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      // --- Web Share API ---
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], 'nor-section.pdf', { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: 'НОР PDF',
            text: 'Отправляю файл PDF'
          });
        } catch (err) {
          // Если пользователь отменил отправку — ничего не делаем
          console.warn('Share cancelled or failed', err);
        }
      } else {
        pdf.save('nor-section.pdf');
      }
      setActiveSection('floor');
    } catch (error) {
      console.error('Error during PDF export:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'floor':
        return (
          <div className="apple-card-wrapper">
            <div style={{marginBottom: 16}}>
              <button className="apple-create-btn--centered" style={{background:'#eee', color:'#222', width: '100%'}} onClick={() => document.getElementById('photo-input')?.click()}>
                Добавить фото
              </button>
              <input id="photo-input" type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoChange} />
              {photo && (
                <div style={{marginTop: 12, display: 'flex', justifyContent: 'center'}}>
                  <div style={{position:'relative', display:'inline-block'}}>
                    <img src={photo} alt="Загруженное фото" style={{maxWidth: '100%', maxHeight: 220, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}} />
                    <button onClick={() => setPhoto(null)} style={{position:'absolute',top:6,right:6,background:'rgba(255,255,255,0.85)',border:'none',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.10)',cursor:'pointer'}} title="Удалить фото">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#ff3b30" strokeWidth="2"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <CollectorCard collectorName={collectorName} setCollectorName={setCollectorName} loops={cards} />
            {cards.map((card, index) => (
              <div key={index}>
                <AppleCard
                  number={index + 1}
                  onDelete={() => handleDelete(index)}
                  onEdit={() => handleEdit(index)}
                  onUpdate={(data) => handleUpdate(index, data)}
                  room={card.room}
                  collector={card.collector}
                  deltaT={card.deltaT}
                  totalLength={card.totalLength}
                  supplyLength={card.supplyLength}
                  innerDiameter={card.innerDiameter}
                  pipeStep={card.pipeStep}
                  power={card.power}
                  flowRate={card.flowRate}
                  resistance={card.resistance}
                  regime={card.regime}
                  usefulLength={card.usefulLength}
                />
              </div>
            ))}
            <button className="apple-create-btn--centered" onClick={() => {
              setModalData({ room: '', collector: '', index: cards.length });
              setShowModal(true);
            }}>
              Добавить петлю
            </button>
            <button className="apple-create-btn--centered" style={{marginTop: 12, background: '#0071e3', color:'#fff'}} onClick={() => {
              console.log('Export button clicked');
              handleExportNorToPdf();
            }}>
              Скачать PDF
            </button>
          </div>
        );
      case 'nor':
        return (
          <div ref={norSectionRef} style={{
            background: '#ffffff',
            width: '900px', // Устанавливаем фиксированную ширину
            margin: '0 auto',
            padding: '16px'
          }}>
            <NorSection collectorName={collectorName} loops={cards} photo={photo} />
          </div>
        );
      case 'water':
        return <div className="section-placeholder">Раздел маркировки водоснабжения в разработке</div>;
      case 'radiator':
        return <div className="section-placeholder">Раздел маркировки радиаторного отопления в разработке</div>;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Header activeSection={activeSection} onSectionChange={setActiveSection} />
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
      {renderContent()}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div className="apple-card-field">
              <label>Карточка №{modalData.index + 1}</label>
              <div className="details-grid">
                <div className="details-item">
                  <label>Название помещения</label>
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) {
                        setModalData({...modalData, room: e.target.value});
                      }
                    }}
                    style={{ width: '100%', marginBottom: '8px' }}
                  >
                    <option value="">Выберите помещение</option>
                    {ROOM_OPTIONS.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={modalData.room}
                    onChange={e => setModalData({...modalData, room: e.target.value})}
                    placeholder="Или введите своё название"
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="details-item">
                  <label>Расход</label>
                  <input
                    type="text"
                    value={modalData.collector}
                    onChange={e => setModalData({...modalData, collector: e.target.value})}
                    placeholder="Расход литр/минуту"
                  />
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button className="apple-create-btn--centered" style={{width: '100%', background:'#0071e3'}} onClick={handleSave}>
                Сохранить
              </button>
              <button className="apple-create-btn--centered" style={{width: '100%', background:'#eee', color:'#222'}} onClick={() => setShowModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="modal-backdrop" style={{zIndex: 3000}}>
          <div className="modal-window" style={{maxWidth: 320, margin: '80px auto', textAlign: 'center'}}>
            <div style={{fontSize: 18, fontWeight: 600, marginBottom: 18}}>Удалить петлю?</div>
            <div style={{fontSize: 15, color: '#666', marginBottom: 24}}>Вы действительно хотите удалить выбранную петлю? Это действие нельзя отменить.</div>
            <div style={{display:'flex', gap: 8}}>
              <button className="apple-create-btn--centered" style={{width:'100%', background:'#ff3b30'}} onClick={confirmDelete}>Удалить</button>
              <button className="apple-create-btn--centered" style={{width:'100%', background:'#eee', color:'#222'}} onClick={cancelDelete}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
