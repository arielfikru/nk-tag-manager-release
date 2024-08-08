import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/Home.module.css';

export default function TaggingSystem({ imageTags, onDeleteTag, onEditTag, onReorderTags, onInsertTag, onMoveTag, onClearTags }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [insertValue, setInsertValue] = useState('');
  const [insertPosition, setInsertPosition] = useState(null);
  const editInputRef = useRef(null);
  const insertInputRef = useRef(null);
  const contextMenuRef = useRef(null);
  const tagListRef = useRef(null);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        closeContextMenu();
      }
      if (insertInputRef.current && !insertInputRef.current.contains(event.target)) {
        setInsertPosition(null);
        setInsertValue('');
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setEditingTag(null);
        setEditValue('');
        setInsertPosition(null);
        setInsertValue('');
        closeContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeContextMenu]);

  useEffect(() => {
    if (editingTag !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTag]);

  useEffect(() => {
    if (insertPosition !== null && insertInputRef.current) {
      insertInputRef.current.focus();
    }
  }, [insertPosition]);

  const handleContextMenu = (e, tag, index) => {
    e.preventDefault();
    const rect = tagListRef.current.getBoundingClientRect();
    setContextMenu({ tag, index, x: rect.right, y: rect.top });
  };

  const handleDelete = () => {
    if (contextMenu) {
      onDeleteTag(contextMenu.tag);
      closeContextMenu();
    }
  };

  const handleEdit = () => {
    if (contextMenu) {
      setEditingTag(contextMenu.tag);
      setEditValue(contextMenu.tag);
      closeContextMenu();
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editingTag !== null && editValue.trim() !== '') {
      const newTag = editValue.trim();
      if (!imageTags.includes(newTag) || newTag === editingTag) {
        onEditTag(editingTag, newTag);
        setEditingTag(null);
        setEditValue('');
      } else {
        alert('This tag already exists!');
        setEditValue(editingTag);
      }
    } else {
      setEditingTag(null);
      setEditValue('');
    }
  };

  const handleInsert = () => {
    setInsertPosition({ index: 0, position: 'top' });
    closeContextMenu();
  };

  const handleInsertSubmit = (e) => {
    e.preventDefault();
    if (insertPosition !== null && insertValue.trim() !== '') {
      const newTag = insertValue.trim();
      if (!imageTags.includes(newTag)) {
        onInsertTag(insertPosition.index, insertPosition.position, newTag);
        setInsertPosition(null);
        setInsertValue('');
      } else {
        alert('This tag already exists!');
        setInsertValue('');
      }
    }
  };

  const handleMoveTag = (position) => {
    if (contextMenu && onMoveTag) {
      onMoveTag(contextMenu.tag, position);
      closeContextMenu();
    }
  };

  const handleMoveTagButton = (index, direction) => {
    onReorderTags(index, direction);
    closeContextMenu();
  };

  const handleClearTags = () => {
    onClearTags();
    closeContextMenu();
  };

  return (
    <div className={styles.taggingSystem}>
      <h3>Image Tag List</h3>
      <div className={styles.scrollable} ref={tagListRef}>
        <ul className={styles.listNoStyle}>
          {insertPosition && insertPosition.position === 'top' && (
            <li>
              <form onSubmit={handleInsertSubmit}>
                <input
                  ref={insertInputRef}
                  type="text"
                  value={insertValue}
                  onChange={(e) => setInsertValue(e.target.value)}
                  placeholder="Insert tag"
                  className={`${styles.tagInput} ${styles.insertInput}`}
                />
              </form>
            </li>
          )}
          {imageTags.map((tag, index) => (
            <li
              key={index}
              className={styles.listItem}
              onContextMenu={(e) => handleContextMenu(e, tag, index)}
            >
              {editingTag === tag ? (
                <form onSubmit={handleEditSubmit}>
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleEditSubmit}
                    className={`${styles.tagInput} ${styles.editInput}`}
                  />
                </form>
              ) : (
                <>
                  <span className={styles.tagText}>{tag}</span>
                  <div className={styles.moveButtonContainer}>
                    {index !== 0 && (
                      <button
                        className={styles.moveButton}
                        onClick={() => handleMoveTagButton(index, 'up')}
                      >
                        ▲
                      </button>
                    )}
                    {index !== imageTags.length - 1 && (
                      <button
                        className={styles.moveButton}
                        onClick={() => handleMoveTagButton(index, 'down')}
                      >
                        ▼
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{ 
            position: 'fixed',
            top: `${contextMenu.y}px`, 
            right: `192px` 
          }}
        >
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
          <button onClick={handleInsert}>Insert</button>
          <button onClick={() => handleMoveTag('top')}>Move to Top</button>
          <button onClick={() => handleMoveTag('bottom')}>Move to Bottom</button>
          <button onClick={() => handleMoveTag('center')}>Move to Center Random</button>
          <button onClick={handleClearTags}>Clear Tags</button>
        </div>
      )}
    </div>
  );
}