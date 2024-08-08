import { useState } from 'react';

export function useTagManagement() {
  const [projectTags, setProjectTags] = useState({});
  const [imageTags, setImageTags] = useState({});
  const [generatedTags, setGeneratedTags] = useState('');

  const handleSaveTags = (currentImage, newTags) => {
    if (currentImage) {
      setImageTags(prevTags => {
        const currentImageTags = prevTags[currentImage.id] || [];
        let updatedTags = [...new Set([...currentImageTags, ...newTags])];
        return {
          ...prevTags,
          [currentImage.id]: updatedTags
        };
      });

      setProjectTags(prevProjectTags => {
        const newProjectTags = { ...prevProjectTags };
        newTags.forEach(tag => {
          newProjectTags[tag] = (newProjectTags[tag] || 0) + 1;
        });
        return newProjectTags;
      });
    }
    setGeneratedTags('');
  };

  const handleDeleteTag = (currentImage, tagToDelete) => {
    if (currentImage) {
      setImageTags(prevTags => ({
        ...prevTags,
        [currentImage.id]: prevTags[currentImage.id].filter(tag => tag !== tagToDelete)
      }));

      setProjectTags(prevTags => {
        const newTags = { ...prevTags };
        newTags[tagToDelete] = newTags[tagToDelete] - 1;
        if (newTags[tagToDelete] === 0) {
          delete newTags[tagToDelete];
        }
        return newTags;
      });
    }
  };

  const handleEditTag = (currentImage, oldTag, newTag) => {
    if (currentImage) {
      setImageTags(prevTags => ({
        ...prevTags,
        [currentImage.id]: prevTags[currentImage.id].map(tag => tag === oldTag ? newTag : tag)
      }));

      setProjectTags(prevTags => {
        const newTags = { ...prevTags };
        newTags[newTag] = (newTags[newTag] || 0) + 1;
        newTags[oldTag] = newTags[oldTag] - 1;
        if (newTags[oldTag] === 0) {
          delete newTags[oldTag];
        }
        return newTags;
      });
    }
  };

  const handleReorderTags = (currentImage, index, direction) => {
    if (currentImage) {
      setImageTags(prevTags => {
        const currentTags = [...(prevTags[currentImage.id] || [])];
        if (direction === 'up' && index > 0) {
          [currentTags[index - 1], currentTags[index]] = [currentTags[index], currentTags[index - 1]];
        } else if (direction === 'down' && index < currentTags.length - 1) {
          [currentTags[index], currentTags[index + 1]] = [currentTags[index + 1], currentTags[index]];
        }
        return {
          ...prevTags,
          [currentImage.id]: currentTags
        };
      });
    }
  };

  const handleInsertTag = (currentImage, index, position, newTag) => {
    if (currentImage) {
      setImageTags(prevTags => {
        const currentTags = [...(prevTags[currentImage.id] || [])];
        const insertIndex = position === 'top' ? index : index + 1;
        currentTags.splice(insertIndex, 0, newTag);
        return {
          ...prevTags,
          [currentImage.id]: currentTags
        };
      });

      setProjectTags(prevTags => {
        const newTags = { ...prevTags };
        newTags[newTag] = (newTags[newTag] || 0) + 1;
        return newTags;
      });
    }
  };

  const handleMoveTag = (currentImage, tag, position) => {
    if (currentImage) {
      setImageTags(prevTags => {
        const currentTags = [...(prevTags[currentImage.id] || [])];
        const index = currentTags.indexOf(tag);
        if (index > -1) {
          currentTags.splice(index, 1);
          switch (position) {
            case 'top':
              currentTags.unshift(tag);
              break;
            case 'bottom':
              currentTags.push(tag);
              break;
            case 'center':
              const centerIndex = Math.floor(currentTags.length / 2);
              currentTags.splice(centerIndex, 0, tag);
              break;
          }
        }
        return {
          ...prevTags,
          [currentImage.id]: currentTags
        };
      });
    }
  };

  const handleClearTags = (currentImage) => {
    if (currentImage) {
      setImageTags(prevTags => {
        const newTags = { ...prevTags };
        delete newTags[currentImage.id];
        return newTags;
      });

      setProjectTags(prevTags => {
        const newTags = { ...prevTags };
        Object.keys(newTags).forEach(tag => {
          if (imageTags[currentImage.id]?.includes(tag)) {
            newTags[tag] = newTags[tag] - 1;
            if (newTags[tag] === 0) {
              delete newTags[tag];
            }
          }
        });
        return newTags;
      });
    }
  };

  const resetTags = () => {
    setProjectTags({});
    setImageTags({});
    setGeneratedTags('');
  };

  return {
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
  };
}