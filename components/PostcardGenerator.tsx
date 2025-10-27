import React, { useState } from 'react';
import ImageEnhancer from './ImageEnhancer';
import PostcardCreator from './PostcardCreator';
import GeneratedPostcardsDisplay from './GeneratedPostcardsDisplay';

interface PostcardGeneratorProps {
  imageUrl: string;
}

const PostcardGenerator: React.FC<PostcardGeneratorProps> = ({ imageUrl }) => {
  const [editedImageDataUrl, setEditedImageDataUrl] = useState<string | null>(null);

  const handleImageEdited = (dataUrl: string) => {
    setEditedImageDataUrl(dataUrl);
  };

  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-b-lg">
      {/* Generated Postcards Display Section */}
      <GeneratedPostcardsDisplay />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Image Enhancer Section */}
        <ImageEnhancer imageUrl={imageUrl} onImageEdited={handleImageEdited} />

        {/* Postcard Creator Section */}
        <PostcardCreator editedImageDataUrl={editedImageDataUrl} />
      </div>
    </div>
  );
};

export default PostcardGenerator;