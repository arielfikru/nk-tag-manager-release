import React, { useRef } from 'react';
import styles from '../styles/Home.module.css';

export default function ImageDisplay({ currentImage }) {
  const imageRef = useRef(null);

  return (
    <div className={styles.imageDisplay}>
      <div className={styles.imageCard} ref={imageRef}>
        {currentImage ? (
          <img src={currentImage.src} alt={currentImage.name} />
        ) : (
          <p>No image selected</p>
        )}
      </div>
    </div>
  );
}