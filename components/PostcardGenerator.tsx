import React, { useState } from 'react';
import ImageEnhancer from './ImageEnhancer';
import PostcardCreator from './PostcardCreator';
import GeneratedPostcardsDisplay from './GeneratedPostcardsDisplay';

interface PostcardGeneratorProps {
  imageUrl?: string;
  discoveryId?: string; // Add discoveryId prop
}

const PostcardGenerator: React.FC<PostcardGeneratorProps> = ({ imageUrl, discoveryId }) => {
  const [editedImageDataUrl, setEditedImageDataUrl] = useState<string | null>(null);

  const handleImageEdited = (dataUrl: string) => {
    setEditedImageDataUrl(dataUrl);
  };

  return (
    <div className="p-4 md:p-6 bg-slate-800 rounded-b-lg">
      {/* Generated Postcards Display Section */}
      <GeneratedPostcardsDisplay discoveryId={discoveryId} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Image Enhancer Section */}
        {imageUrl ? (
          <ImageEnhancer imageUrl={imageUrl} onImageEdited={handleImageEdited} />
        ) : (
          <div className="flex flex-col gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700 items-center justify-center text-slate-400 h-64">
            <p>No image available for enhancement.</p>
            <p>Please select a discovery with an image.</p>
          </div>
        )}

        {/* Postcard Creator Section */}
        <PostcardCreator editedImageDataUrl={editedImageDataUrl} discoveryId={discoveryId} />
      </div>
    </div>
  );
};

export default PostcardGenerator;