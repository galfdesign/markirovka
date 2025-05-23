import React from 'react';
import './AppleCard.css';

interface AppleCardProps {
  number: number;
  onDelete: () => void;
  room: string;
  collector: string;
}

const AppleCard: React.FC<AppleCardProps> = ({ number, onDelete, room, collector }) => {
  return (
    <div className="apple-card">
      <div className="apple-card-header">
        <span className="apple-card-number">{number}</span>
        <button className="apple-card-delete" onClick={onDelete} title="Удалить">×</button>
      </div>
      <h2 className="apple-card-title">Карточка выхода</h2>
      <div className="apple-card-fields">
        <div className="apple-card-field">
          <label>Название помещения</label>
          <input
            type="text"
            value={room}
            readOnly
            placeholder="Введите название помещения"
          />
        </div>
        <div className="apple-card-field">
          <label>Название коллектора</label>
          <input
            type="text"
            value={collector}
            readOnly
            placeholder="Введите название коллектора"
          />
        </div>
      </div>
    </div>
  );
};

export default AppleCard; 