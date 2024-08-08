import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function saveImageWithTags(image, tags) {
  const zip = new JSZip();

  // Add image to zip
  const response = await fetch(image.src);
  const blob = await response.blob();
  zip.file(image.name, blob);

  // Add tags to zip
  const tagString = tags.join(', ');
  zip.file(`${image.name}.txt`, tagString);

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${image.name}_with_tags.zip`);
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

export function saveTagsOnly(imageName, tags) {
  const tagString = tags.join(', ');
  const blob = new Blob([tagString], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${imageName}_tags.txt`);
}

export async function saveProjectTagsOnly(images, imageTags) {
  const zip = new JSZip();

  for (const image of images) {
    const tags = imageTags[image.id] || [];
    const tagString = tags.join(', ');
    zip.file(`${image.name}_tags.txt`, tagString);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'project_tags.zip');
}