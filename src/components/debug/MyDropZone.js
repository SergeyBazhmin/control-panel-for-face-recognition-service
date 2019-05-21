import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import './MyDropZone.css';

export default function MyDropzone({onImageLoaded}) {
  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles);
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result.split(',')[1];
      onImageLoaded(content);
    }
    acceptedFiles.forEach(file => reader.readAsDataURL(file));
  }, [onImageLoaded]);
  const {getRootProps, getInputProps } = useDropzone({onDrop});

  return (
    <div>
      <div {...getRootProps()} className='dnd-box'>
        <input {...getInputProps()} />
        {
          <p>Drag images here</p>
        }
      </div>
    </div>
  )
}