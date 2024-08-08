import React from 'react';
import SparkMD5 from 'spark-md5';
import styles from '../styles/ImageInfo.module.css';

const ImageInfo = ({ currentImage }) => {
  const truncateFilename = (filename, maxLength = 20) => {
    const extension = filename.split('.').pop();
    const nameWithoutExtension = filename.slice(0, -(extension.length + 1));
    if (nameWithoutExtension.length <= maxLength) return nameWithoutExtension;
    return `${nameWithoutExtension.slice(0, maxLength - 3)}...`;
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toUpperCase();
  };

  const getFileSizeInMB = (src) => {
    const base64Length = src.length - (src.indexOf(',') + 1);
    const fileSizeInBytes = base64Length * (3 / 4);
    return (fileSizeInBytes / (1024 * 1024)).toFixed(2);
  };

  const getFileMD5 = (src) => {
    const base64Data = src.substring(src.indexOf(',') + 1);
    const binaryStr = atob(base64Data);
    const byteArray = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      byteArray[i] = binaryStr.charCodeAt(i);
    }
    return SparkMD5.ArrayBuffer.hash(byteArray.buffer);
  };

  const truncateMD5 = (md5, maxLength = 15) => {
    if (md5.length <= maxLength) return md5;
    return `${md5.slice(0, maxLength)}...`;
  };

  return (
    <div className={styles.imageInfo}>
      <h3 className={styles.imageInfoTitle}>Image Info</h3>
      <div className={styles.imageInfoContent}>
        {currentImage ? (
          <>
            <p><strong>Filename:</strong> {truncateFilename(currentImage.name)}</p>
            <p><strong>Extension:</strong> {getFileExtension(currentImage.name)}</p>
            <p><strong>File Size:</strong> {getFileSizeInMB(currentImage.src)} MB</p>
            <p><strong>Width:</strong> {currentImage.width} px</p>
            <p><strong>Height:</strong> {currentImage.height} px</p>
            <p className={styles.md5Hash}><strong>MD5:</strong> {truncateMD5(getFileMD5(currentImage.src))}</p>
          </>
        ) : (
          <p>No image selected</p>
        )}
      </div>
    </div>
  );
};

export default ImageInfo;