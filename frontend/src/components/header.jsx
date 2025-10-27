// components/Header.jsx

import React from 'react';
import '../styles/header.css'; // We will create this file next

const Header = ({ isMobileMenuOpen, onToggleMenu }) => {
  return (
    <header className="mobile-header">
      <div className="logo-mobile">
      </div>
      <button
        className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={onToggleMenu}
        aria-label="Toggle menu"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
    </header>
  );
};

export default Header;