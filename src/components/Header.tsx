import React from 'react';
import './Header.css';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: 'floor', title: 'Напольное отопление' },
    { id: 'radiator', title: 'Радиаторы' },
    { id: 'water', title: 'Водоснабжение' },
    { id: 'nor', title: 'НОР' }
  ];
  
  const currentIndex = sections.findIndex(section => section.id === activeSection);

  const handlePrev = () => {
    const prevIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
    onSectionChange(sections[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex = currentIndex === sections.length - 1 ? 0 : currentIndex + 1;
    onSectionChange(sections[nextIndex].id);
  };

  return (
    <header className="header">
      <div style={{display:'flex', alignItems:'center', justifyContent:'center', paddingTop:8, paddingBottom:8}}>
        <img src="/logo.png" alt="Логотип" style={{height:22}} />
      </div>
      <nav className="header-nav">
        <button 
          className="header-nav-arrow"
          onClick={handlePrev}
        >
          ←
        </button>
        <div className="header-nav-content">
          <div className="header-nav-current">
            {sections[currentIndex].title}
          </div>
        </div>
        <button 
          className="header-nav-arrow"
          onClick={handleNext}
        >
          →
        </button>
      </nav>
    </header>
  );
};

export default Header; 