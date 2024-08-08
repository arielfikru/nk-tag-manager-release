import React, { useState, useRef } from 'react';
import Dropdown from './Dropdown';
import { saveImageWithTags, saveProjectToZip, saveTagsOnly, saveProjectTagsOnly } from '../utils/saveUtils';
import styles from '../styles/Home.module.css';

export default function Layout({ 
  children, 
  onFileUpload, 
  onFolderUpload, 
  currentImage, 
  images,
  imageTags,
  onSaveProject, 
  onNewProject, 
  onRenameFile, 
  tagInputComponent, 
  onUpdateApiUrl,
  onGenerateTagsForAllImages
}) {
  const [renamingFile, setRenamingFile] = useState(null);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showNewProjectConfirmation, setShowNewProjectConfirmation] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleMenuSelect = (option) => {
    switch(option) {
      case 'Upload Images':
        fileInputRef.current.click();
        break;
      case 'Upload Folder':
        folderInputRef.current.click();
        break;
      case 'Save Image':
        if (currentImage) {
          saveImageWithTags(currentImage, imageTags[currentImage.id] || []);
        } else {
          alert('No image selected');
        }
        break;
      case 'Save Project':
        saveProjectToZip(images, imageTags);
        break;
      case 'Save Tag':
        if (currentImage) {
          saveTagsOnly(currentImage.name, imageTags[currentImage.id] || []);
        } else {
          alert('No image selected');
        }
        break;
      case 'Save Project Tags':
        saveProjectTagsOnly(images, imageTags);
        break;
      case 'New Project':
        setShowNewProjectConfirmation(true);
        break;
      case 'API Settings':
        setShowApiSettings(true);
        break;
      case 'Generate Tags for All Images':
        handleGenerateTagsForAllImages();
        break;
    }
  };

  const handleGenerateTagsForAllImages = async () => {
    setShowProgressBar(true);
    setProgress({ current: 0, total: images.length });
    await onGenerateTagsForAllImages(
      (current) => setProgress(prev => ({ ...prev, current }))
    );
    setTimeout(() => setShowProgressBar(false), 3000);
  };

  const handleFileDoubleClick = () => {
    if (currentImage) {
      setRenamingFile(currentImage.name);
    }
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    const newName = e.target.newFileName.value;
    const extension = currentImage.name.split('.').pop();
    const newNameWithExtension = `${newName}.${extension}`;
    onRenameFile(renamingFile, newNameWithExtension);
    setRenamingFile(null);
  };

  const handleApiSettingsSave = () => {
    if (onUpdateApiUrl) {
      onUpdateApiUrl(apiUrl);
    }
    setShowApiSettings(false);
  };

  const handleNewProjectConfirm = () => {
    onNewProject();
    setShowNewProjectConfirmation(false);
  };

  const renameInputStyle = {
    backgroundColor: "#172a46",
    color: "white",
    border: "1px solid var(--border-color)",
    padding: "2px 5px",
    width: "100%",
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            <li className={styles.menuItem}>
              <Dropdown
                title="File"
                options={['New Project']}
                onSelect={handleMenuSelect}
              />
            </li>
            <li className={styles.menuItem}>
              <Dropdown
                title="Upload"
                options={['Upload Images', 'Upload Folder']}
                onSelect={handleMenuSelect}
              />
            </li>
            <li className={styles.menuItem}>
              <Dropdown
                title="Export"
                options={['Save Image', 'Save Project', 'Save Tag', 'Save Project Tags']}
                onSelect={handleMenuSelect}
              />
            </li>
            <li className={styles.menuItem}>
              <Dropdown
                title="Project"
                options={['API Settings', 'Generate Tags for All Images']}
                onSelect={handleMenuSelect}
              />
            </li>
            <li className={styles.menuItem}>Image</li>
            <li className={styles.menuItem}>Tools</li>
            <li className={styles.menuItem}>
              {renamingFile ? (
                <form onSubmit={handleRenameSubmit}>
                  <input
                    type="text"
                    name="newFileName"
                    defaultValue={renamingFile.split('.').slice(0, -1).join('.')}
                    autoFocus
                    onBlur={() => setRenamingFile(null)}
                    style={renameInputStyle}
                  />
                </form>
              ) : (
                <span onDoubleClick={handleFileDoubleClick}>
                  {currentImage?.name || 'No image selected'}
                </span>
              )}
            </li>
          </ul>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        {tagInputComponent}
      </footer>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onFileUpload}
        accept="image/*"
        multiple
      />
      <input
        type="file"
        ref={folderInputRef}
        style={{ display: 'none' }}
        onChange={onFolderUpload}
        webkitdirectory=""
        directory=""
        multiple
      />
      {showApiSettings && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>API Settings</h2>
            <label htmlFor="apiUrl">Tagger API URL:</label>
            <input
              type="text"
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <button onClick={handleApiSettingsSave}>Save</button>
            <button onClick={() => setShowApiSettings(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showNewProjectConfirmation && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>New Project</h2>
            <p>Are you sure you want to start a new project? All unsaved changes will be lost.</p>
            <button onClick={handleNewProjectConfirm}>Yes</button>
            <button onClick={() => setShowNewProjectConfirmation(false)}>No</button>
          </div>
        </div>
      )}
      {showProgressBar && (
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarHeader}>
            <span>Generating Tags for All Images</span>
            <button onClick={() => setShowProgressBar(false)}>X</button>
          </div>
          <div className={styles.progressBarContent}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressBarFill} 
                style={{width: `${(progress.current / progress.total) * 100}%`}}
              ></div>
            </div>
            <span>{progress.current} / {progress.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}