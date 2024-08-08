import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/Home.module.css';

export default function FileManager({ images, onImageSelect, projectTags, onDeleteImage, onEditProjectTag, onDeleteProjectTag, onRenameFile }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [sortOrder, setSortOrder] = useState('frequencyDesc');
  const contextMenuRef = useRef(null);
  const [editingTag, setEditingTag] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingImage, setEditingImage] = useState(null);
  const [editImageValue, setEditImageValue] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const truncateFilename = (filename, maxLength = 15) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const nameWithoutExtension = filename.slice(0, -(extension.length + 1));
    if (nameWithoutExtension.length <= maxLength - 3) {
      return `${nameWithoutExtension}...`;
    }
    return `${nameWithoutExtension.slice(0, maxLength - 3)}...`;
  };

  const truncateTag = (tag, maxLength = 15) => {
    return tag.length > maxLength ? tag.slice(0, maxLength - 3) + '...' : tag;
  };

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      item,
      type,
      x: rect.right,
      y: rect.top,
    });
  };

  const handleDeleteItem = () => {
    if (contextMenu) {
      if (contextMenu.type === 'tag') {
        onDeleteProjectTag(contextMenu.item);
      } else if (contextMenu.type === 'image') {
        onDeleteImage(contextMenu.item);
      }
      setContextMenu(null);
    }
  };

  const handleEditItem = () => {
    if (contextMenu) {
      if (contextMenu.type === 'tag') {
        setEditingTag(contextMenu.item);
        setEditValue(contextMenu.item);
      } else if (contextMenu.type === 'image') {
        setEditingImage(contextMenu.item);
        setEditImageValue(contextMenu.item.name);
      }
      setContextMenu(null);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editingTag !== null && editValue.trim() !== '') {
      onEditProjectTag(editingTag, editValue.trim());
      setEditingTag(null);
      setEditValue('');
    } else if (editingImage !== null && editImageValue.trim() !== '') {
      onRenameFile(editingImage.name, editImageValue.trim());
      setEditingImage(null);
      setEditImageValue('');
    }
  };

  const sortTags = (tags) => {
    const tagEntries = Object.entries(tags);
    switch (sortOrder) {
      case 'frequencyDesc':
        return tagEntries.sort((a, b) => b[1] - a[1]);
      case 'frequencyAsc':
        return tagEntries.sort((a, b) => a[1] - b[1]);
      case 'alphabeticalAsc':
        return tagEntries.sort((a, b) => a[0].localeCompare(b[0]));
      case 'alphabeticalDesc':
        return tagEntries.sort((a, b) => b[0].localeCompare(a[0]));
      default:
        return tagEntries;
    }
  };

  const SortIcon = () => (
    <svg className={styles.sortIcon} viewBox="0 0 24 24">
      <path fill="white" d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
    </svg>
  );

  const ImageIcon = () => (
    <svg className={styles.listItemIcon} viewBox="0 0 24 24">
      <path fill="white" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  );

  const TagIcon = () => (
    <svg className={styles.listItemIcon} viewBox="0 0 24 24">
      <path fill="white" d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
    </svg>
  );

  return (
    <div className={styles.fileManager}>
      <div className={styles.fileManagerSection}>
        <h3>File Manager</h3>
        <div className={styles.sectionContent}>
          <ul className={styles.listNoStyle}>
            {images.map((image) => (
              <li
                key={image.id}
                className={styles.listItem}
                onClick={() => onImageSelect(image)}
                onContextMenu={(e) => handleContextMenu(e, image, 'image')}
                title={image.name}
              >
                {editingImage === image ? (
                  <form onSubmit={handleEditSubmit}>
                    <input
                      type="text"
                      value={editImageValue}
                      onChange={(e) => setEditImageValue(e.target.value)}
                      onBlur={handleEditSubmit}
                      className={styles.editInput}
                    />
                  </form>
                ) : (
                  <div className={styles.listItemContent}>
                    <ImageIcon />
                    <span className={styles.truncateText}>{truncateFilename(image.name)}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.fileManagerSection}>
        <h3>Project Tag List</h3>
        <div className={styles.sortControls}>
          <SortIcon />
          <select 
            className={styles.sortSelect}
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="frequencyDesc">Frequency (High to Low)</option>
            <option value="frequencyAsc">Frequency (Low to High)</option>
            <option value="alphabeticalAsc">Alphabetical (A to Z)</option>
            <option value="alphabeticalDesc">Alphabetical (Z to A)</option>
          </select>
        </div>
        <div className={styles.sectionContent}>
          <ul className={styles.listNoStyle}>
            {sortTags(projectTags).map(([tag, count]) => (
              <li
                key={tag}
                className={styles.listItem}
                onContextMenu={(e) => handleContextMenu(e, tag, 'tag')}
                title={`${tag} (${count})`}
              >
                {editingTag === tag ? (
                  <form onSubmit={handleEditSubmit}>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleEditSubmit}
                      className={styles.editInput}
                    />
                  </form>
                ) : (
                  <div className={styles.listItemContent}>
                    <TagIcon />
                    <span className={styles.truncateText}>{truncateTag(tag)}</span>
                    <span className={styles.tagCount}>({count})</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{
            position: 'fixed',
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
        >
          <button onClick={handleEditItem}>
            <svg className={styles.contextMenuIcon} viewBox="0 0 24 24">
              <path fill="white" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            Rename
          </button>
          <button onClick={handleDeleteItem}>
            <svg className={styles.contextMenuIcon} viewBox="0 0 24 24">
              <path fill="white" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}