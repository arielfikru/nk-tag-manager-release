import { useState } from 'react';

export function useImageManagement() {
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);

  const processFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const newImage = {
            id: Date.now() + Math.random(),
            name: file.name,
            src: e.target.result,
            width: img.width,
            height: img.height,
          };
          resolve(newImage);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newImages = await Promise.all(files.map(processFile));
    setImages(prevImages => [...prevImages, ...newImages]);
    if (newImages.length > 0) {
      setCurrentImage(newImages[0]);
    }
  };

  const handleFolderUpload = async (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newImages = await Promise.all(imageFiles.map(processFile));
    setImages(prevImages => [...prevImages, ...newImages]);
    if (newImages.length > 0) {
      setCurrentImage(newImages[0]);
    }
  };

  const handleImageSelect = (image) => {
    setCurrentImage(image);
  };

  const handleNewProject = () => {
    setImages([]);
    setCurrentImage(null);
  };

  const handleRenameFile = (oldName, newName) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.name === oldName ? { ...img, name: newName } : img
      )
    );
    if (currentImage && currentImage.name === oldName) {
      setCurrentImage(prevImage => ({ ...prevImage, name: newName }));
    }
  };

  const handleDeleteImage = (imageToDelete) => {
    setImages(prevImages => prevImages.filter(img => img.id !== imageToDelete.id));
    if (currentImage && currentImage.id === imageToDelete.id) {
      setCurrentImage(null);
    }
  };

  const handleResizeImage = (imageId, crop) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              crop: crop,
              width: Math.round(img.width * crop.width),
              height: Math.round(img.height * crop.height)
            } 
          : img
      )
    );
    if (currentImage && currentImage.id === imageId) {
      setCurrentImage(prevImage => ({ 
        ...prevImage, 
        crop: crop,
        width: Math.round(prevImage.width * crop.width),
        height: Math.round(prevImage.height * crop.height)
      }));
    }
  };

  return {
    images,
    setImages,
    currentImage,
    setCurrentImage,
    handleFileUpload,
    handleFolderUpload,
    handleImageSelect,
    handleNewProject,
    handleRenameFile,
    handleDeleteImage,
    handleResizeImage
  };
}