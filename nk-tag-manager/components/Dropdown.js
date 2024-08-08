import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function Dropdown({ title, options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.dropdownToggle}>
        {title}
      </button>
      {isOpen && (
        <ul className={styles.dropdownMenu}>
          {options.map((option, index) => (
            <li key={index} onClick={() => {
              onSelect(option);
              setIsOpen(false);
            }}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}