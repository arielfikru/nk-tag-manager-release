import React, { useState } from 'react';
import Layout from '../components/Layout';
import FileManager from '../components/FileManager';
import ImageDisplay from '../components/ImageDisplay';
import TaggingSystem from '../components/TaggingSystem';
import ImageInfo from '../components/ImageInfo';
import TagInput from '../components/TagInput';
import { saveImagesToZip, saveProjectToZip } from '../utils/saveImagesUtil';
import { useImageManagement } from '../hooks/useImageManagement';
import { useTagManagement } from '../hooks/useTagManagement';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  
  const { 
    images, 
    setImages,
    currentImage, 
    setCurrentImage,
    handleFileUpload, 
    handleFolderUpload,
    handleImageSelect, 
    handleNewProject,
    handleRenameFile,
    handleDeleteImage
  } = useImageManagement();
  
  const {
    projectTags,
    setProjectTags,
    imageTags,
    setImageTags,
    generatedTags,
    setGeneratedTags,
    handleSaveTags,
    handleDeleteTag,
    handleEditTag,
    handleReorderTags,
    handleInsertTag,
    handleMoveTag,
    handleClearTags,
    resetTags
  } = useTagManagement();

  const generateTags = async (image) => {
    try {
      const response = await fetch(`${apiUrl}/tag_image/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: image.src.split(',')[1],
          gen_threshold: 0.35,
          char_threshold: 0.75
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tags');
      }

      const data = await response.json();
      const allTags = [...data.character_tags, ...data.general_tags];
      return allTags;
    } catch (error) {
      console.error('Error generating tags:', error);
      return [];
    }
  };

  const generateTagsForImage = async (image) => {
    if (!image) {
      console.error('No image selected');
      return;
    }

    setIsGeneratingTags(true);
    const tags = await generateTags(image);
    handleSaveTags(image, tags);
    setIsGeneratingTags(false);
  };

  const onGenerateTagsForAllImages = async (updateProgress) => {
    setIsGeneratingTags(true);
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const tags = await generateTags(image);
      handleSaveTags(image, tags);
      updateProgress(i + 1);
    }
    setIsGeneratingTags(false);
  };

  const handleSaveImages = () => {
    saveImagesToZip(images, imageTags);
  };

  const handleSaveProject = () => {
    saveProjectToZip(images, imageTags);
  };

  const handleNewProjectClick = () => {
    handleNewProject();
    resetTags();
  };

  const handleUpdateApiUrl = (newApiUrl) => {
    setApiUrl(newApiUrl);
  };

  const handleDeleteImageAndTags = (imageToDelete) => {
    handleDeleteImage(imageToDelete);
    
    setImageTags(prevImageTags => {
      const updatedImageTags = { ...prevImageTags };
      delete updatedImageTags[imageToDelete.id];
      return updatedImageTags;
    });

    setProjectTags(prevProjectTags => {
      const updatedProjectTags = { ...prevProjectTags };
      Object.keys(updatedProjectTags).forEach(tag => {
        updatedProjectTags[tag] = updatedProjectTags[tag] - 1;
        if (updatedProjectTags[tag] === 0) {
          delete updatedProjectTags[tag];
        }
      });
      return updatedProjectTags;
    });
  };

  const handleEditProjectTag = (oldTag, newTag) => {
    setProjectTags(prevTags => {
      const newTags = { ...prevTags };
      newTags[newTag] = newTags[oldTag];
      delete newTags[oldTag];
      return newTags;
    });

    setImageTags(prevImageTags => {
      const newImageTags = { ...prevImageTags };
      Object.keys(newImageTags).forEach(imageId => {
        newImageTags[imageId] = newImageTags[imageId].map(tag => 
          tag === oldTag ? newTag : tag
        );
      });
      return newImageTags;
    });
  };

  const handleDeleteProjectTag = (tagToDelete) => {
    setProjectTags(prevTags => {
      const newTags = { ...prevTags };
      delete newTags[tagToDelete];
      return newTags;
    });

    setImageTags(prevImageTags => {
      const newImageTags = { ...prevImageTags };
      Object.keys(newImageTags).forEach(imageId => {
        newImageTags[imageId] = newImageTags[imageId].filter(tag => tag !== tagToDelete);
      });
      return newImageTags;
    });
  };

  return (
    <Layout 
      onFileUpload={handleFileUpload}
      onFolderUpload={handleFolderUpload}
      currentImage={currentImage}
      images={images}
      imageTags={imageTags}
      onNewProject={handleNewProjectClick}
      onRenameFile={handleRenameFile}
      onUpdateApiUrl={handleUpdateApiUrl}
      onGenerateTagsForAllImages={onGenerateTagsForAllImages}
      tagInputComponent={
        <TagInput 
          onSave={(newTags) => handleSaveTags(currentImage, newTags)} 
          onGenerateTags={() => generateTagsForImage(currentImage)} 
          generatedTags={generatedTags}
          isGenerating={isGeneratingTags}
        />
      }
    >
      <div className={styles.container}>
        <FileManager 
          images={images} 
          onImageSelect={handleImageSelect} 
          projectTags={projectTags}
          onDeleteImage={handleDeleteImageAndTags}
          onEditProjectTag={handleEditProjectTag}
          onDeleteProjectTag={handleDeleteProjectTag}
          onRenameFile={handleRenameFile}
        />
        <div className={styles.mainContent}>
          <ImageDisplay currentImage={currentImage} />
          <div className={styles.rightPanel}>
            <div className={styles.imageInfoContainer}>
              <ImageInfo currentImage={currentImage} />
            </div>
            <div className={styles.taggingSystemContainer}>
              <TaggingSystem 
                imageTags={currentImage ? imageTags[currentImage.id] || [] : []}
                onDeleteTag={(tag) => handleDeleteTag(currentImage, tag)}
                onEditTag={(oldTag, newTag) => handleEditTag(currentImage, oldTag, newTag)}
                onReorderTags={(index, direction) => handleReorderTags(currentImage, index, direction)}
                onInsertTag={(index, position, newTag) => handleInsertTag(currentImage, index, position, newTag)}
                onMoveTag={(tag, position) => handleMoveTag(currentImage, tag, position)}
                onClearTags={() => handleClearTags(currentImage)}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}