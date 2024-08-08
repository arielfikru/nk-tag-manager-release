import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function saveImagesToZip(images, imageTags) {
  const zip = new JSZip();

  for (const image of images) {
    const response = await fetch(image.src);
    const blob = await response.blob();
    zip.file(image.name, blob);

    const tags = imageTags[image.id] || [];
    const tagString = tags.join(', ');
    zip.file(`${image.name}.txt`, tagString);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'images_and_tags.zip');
}

export async function saveProjectToZip(images, imageTags) {
  const zip = new JSZip();
  const imagesFolder = zip.folder("images");
  const tagsFolder = zip.folder("tags");

  for (const image of images) {
    const response = await fetch(image.src);
    const blob = await response.blob();
    
    imagesFolder.file(image.name, blob);

    const tags = imageTags[image.id] || [];
    const tagString = tags.join(', ');
    tagsFolder.file(`${image.name}.txt`, tagString);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'project.zip');
}