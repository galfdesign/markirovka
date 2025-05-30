import React, { useRef } from 'react';
import FlowChart from './FlowChart';

interface NorSectionProps {
  collectorName: string;
  loops: { room?: string; flowRate?: number; resistance?: number; power?: number; regime?: string; usefulLength?: number; }[];
  photo?: string | null;
}

const NorSection: React.FC<NorSectionProps> = ({ collectorName, loops, photo }) => {
  const totalFlow = loops.reduce((sum, l) => sum + (l.flowRate || 0), 0);
  const maxResistance = Math.max(...loops.map(l => l.resistance ?? 0));
  const maxLoops = loops
    .map((l, idx) => ({ ...l, idx }))
    .filter(l => l.resistance === maxResistance && maxResistance > 0);

  return (
    <div style={{width: '900px', margin: '40px 0', marginLeft: '-15px', background: '#fff', borderRadius: '12px'}}>
      <div style={{
        background:'#c4c4c4',
        borderRadius:2,
        height:32,
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        padding:'0 24px',
        marginBottom:18,
        width: '100%'
      }}>
        <span style={{fontWeight:700, color:'#fff', fontSize:16}}>GalfDesign</span>
        <span style={{color:'#fff', fontSize:14}}>инженерные системы</span>
      </div>
      <div style={{padding: '0 30px'}}>
        <h2 style={{fontSize: 22, fontWeight: 700, marginBottom: 12, marginTop: 0}}>Напольное отопление</h2>
        {photo && (
          <div style={{marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24}}>
            <div style={{flex: 1, minWidth: 0}}>
              <FlowChart loops={loops} />
            </div>
            <div>
              <img src={photo} alt="Фото" style={{height: 220, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}} />
            </div>
          </div>
        )}
        <div style={{marginBottom: 12}}>
          <b>Коллектор:</b> {collectorName || '-'}
        </div>
        <div style={{display:'flex', gap:24, marginBottom: 12}}>
          <div><b>Суммарный расход:</b> {totalFlow.toFixed(2)} л/мин</div>
          <div><b>Макс. сопротивление:</b> {maxResistance > 0 ? maxResistance.toFixed(2) + ' кПа' : '-'}</div>
        </div>
        {maxLoops.length > 0 && (
          <div style={{marginBottom: 16, color:'#666'}}>
            <b>Петли с макс. сопротивлением:</b> {maxLoops.map(l => l.room || `Петля №${l.idx + 1}`).join(', ')}
          </div>
        )}
        <div style={{overflowX:'auto', marginBottom: 18}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:15, background:'#fff'}}>
            <thead>
              <tr style={{background:'#f5f6fa'}}>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>№</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Помещение</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Длина</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Расход</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Сопротивление</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Мощность</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Режим</th>
              </tr>
            </thead>
            <tbody>
              {loops.map((l, idx) => (
                <tr key={idx} style={idx % 2 === 1 ? {background:'#f5f6fa'} : {}}>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{idx+1}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee'}}>{l.room || '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.usefulLength !== undefined ? l.usefulLength : '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.flowRate !== undefined ? l.flowRate.toFixed(2) : '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.resistance !== undefined ? l.resistance.toFixed(2) : '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.power !== undefined ? l.power : '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.regime || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Разрыв перед блоком карточек: только pageBreakBefore */}
        <div style={{ width: '100%', pageBreakBefore: 'always', breakBefore: 'page' }} />
        {/* Карточки помещений с переносом по строкам (ни одна строка не разрезается) */}
        {(() => {
          const cardHeightPx = 113;
          const cardGapPx = 16;
          const pageHeightPx = 800;
          const cardsPerRow = 3;
          let rows = [];
          for (let i = 0; i < loops.length; i += cardsPerRow) {
            rows.push(loops.slice(i, i + cardsPerRow));
          }
          const rowHeightPx = cardHeightPx + cardGapPx;
          let blocks: React.ReactElement[] = [];
          let currentHeight = 0;
          rows.forEach((row, rowIdx) => {
            if (currentHeight + rowHeightPx > pageHeightPx && currentHeight > 0) {
              blocks.push(
                <div key={'break-row-' + rowIdx} style={{ width: '100%', height: (pageHeightPx - currentHeight) + 'px' }} />
              );
              currentHeight = 0;
            }
            blocks.push(
              <div key={'row-' + rowIdx} style={{ display: 'flex', flexWrap: 'nowrap', gap: cardGapPx, justifyContent: 'center', marginBottom: rowIdx === rows.length-1 ? 0 : cardGapPx }}>
                {row.map((l, idx) => (
                  <div key={idx} className='card' style={{background:'#f5f6fa', borderRadius:14, padding:'6px 8px 4px 8px', width:'60mm', height:'30mm', border:'2px solid #111', marginBottom:0, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', alignItems:'flex-start', fontSize:15, justifyContent:'flex-start'}}>
                    <div style={{fontWeight:700, fontSize:18, width:'100%', textAlign:'center', margin:'0 auto 4px auto', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                      {(l.room ? l.room : `Петля ${rowIdx * cardsPerRow + idx + 1}`).toUpperCase()}
                    </div>
                    <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'flex-start', height:'100%'}}>
                      <div style={{marginBottom:2, fontSize:13}}>Мощность: <b>{l.power !== undefined ? l.power : '-'}</b> Вт</div>
                      <div style={{marginBottom:2, fontSize:13}}>Расход: <b>{l.flowRate !== undefined ? Number(l.flowRate).toFixed(2) : '-'}</b> л/мин</div>
                      <div style={{marginBottom:2, fontSize:13}}>Сопротивление: <b>{l.resistance !== undefined ? Number(l.resistance).toFixed(2) : '-'}</b> кПа</div>
                      <div style={{color:'#888', fontSize:12, marginTop:2}}>Режим: {l.regime || '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
            currentHeight += rowHeightPx;
          });
          return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 28 }}>
              {blocks}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default NorSection; 