import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function TagInput({ onSave, onGenerateTags, generatedTags, isGenerating }) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (generatedTags) {
      setInputValue(generatedTags);
    }
  }, [generatedTags]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = inputValue.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    if (tags.length > 0) {
      onSave(tags);
      setInputValue('');
    }
  };

  const handleGenerateTags = async () => {
    await onGenerateTags();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.tagInputForm}>
      <button 
        type="button" 
        onClick={handleGenerateTags} 
        className={`${styles.tagInputButton} ${isGenerating ? styles.loading : ''}`}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Tags'}
      </button>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter tags separated by commas"
        className={styles.tagInput}
      />
      <button type="submit" className={styles.tagInputButton}>Save</button>
    </form>
  );
}