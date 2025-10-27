import React, { useState } from 'react';
import { generatePostcard } from '../services/geminiService';
import { savePostcardForUser, auth } from '../services/firebaseService';
import { uploadImageToBackend } from '../hooks/useLandmarkProcessing';
import Loader from './Loader';
import { SparklesIcon, DownloadIcon, ShareIcon } from './icons';
import { useCache } from '../contexts/CacheContext';

interface PostcardCreatorProps {
  editedImageDataUrl: string | null;
  discoveryId?: string; // Accept discoveryId prop
}

const dataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

const PostcardCreator: React.FC<PostcardCreatorProps> = ({ editedImageDataUrl, discoveryId }) => {
  const [stylePrompt, setStylePrompt] = useState('a vibrant watercolor painting');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { clearPostcardCache } = useCache();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stylePrompt.trim() || !editedImageDataUrl) return;
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
        const blob = dataUrlToBlob(editedImageDataUrl);
        const editedImageFile = new File([blob], "edited_landmark.jpg", { type: "image/jpeg" });

        const base64Image = await generatePostcard(editedImageFile, stylePrompt);
        const generatedImageBlob = dataUrlToBlob(`data:image/png;base64,${base64Image}`);
        const generatedImageFile = new File([generatedImageBlob], "generated_postcard.png", { type: "image/png" });
        
        // Upload the generated image to imgbb
        const uploadedGeneratedImageUrl = await uploadImageToBackend(generatedImageFile);
        setGeneratedImage(uploadedGeneratedImageUrl); // Set the generated image URL from imgbb

        // Save postcard to Firebase
        if (auth.currentUser) {
            await savePostcardForUser(auth.currentUser.uid, {
                imageUrl: uploadedGeneratedImageUrl,
                stylePrompt: stylePrompt,
                originalImageUrl: editedImageDataUrl || undefined, // Pass the edited image URL if available
                discoveryId: discoveryId || undefined, // Pass the discoveryId if available
            });
            clearPostcardCache(); // Clear the postcard cache after saving a new postcard
        }

    } catch (err: any) {
      setError(err.message || "An error occurred while generating the postcard.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShare = async () => {
    if (generatedImage && navigator.share) {
        try {
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            const file = new File([blob], 'postcard.png', { type: blob.type });
            await navigator.share({
                title: 'My TourVista Postcard',
                text: `Check out this postcard I made with TourVista!`,
                files: [file],
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    } else {
        alert("Web Share API is not supported in your browser, or there's no image to share.");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 text-xl font-bold text-cyan-300">
            <SparklesIcon className="w-6 h-6"/>
            <h3>2. Create Digital Postcard</h3>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
            type="text"
            value={stylePrompt}
            onChange={(e) => setStylePrompt(e.target.value)}
            placeholder="Enter a style (e.g., watercolor, sci-fi)"
            className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
            disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !stylePrompt.trim() || !editedImageDataUrl} className="px-4 py-2.5 bg-cyan-500 text-white rounded-lg disabled:bg-slate-600 hover:bg-cyan-600 transition font-semibold">
            {isLoading ? 'Generating...' : 'Generate'}
            </button>
        </form>

        <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
            {isLoading && <Loader message="Creating your art..." />} 
            {generatedImage && !isLoading && (
            <img src={generatedImage} alt="Generated Postcard" className="rounded-lg max-w-full max-h-full object-contain" />
            )}
            {!generatedImage && !isLoading && (
            <p className="text-slate-500">Your postcard will appear here</p>
            )}
        </div>
         {error && <div className="text-red-300 text-center text-sm">{error}</div>}
         {generatedImage && !isLoading && (
            <div className="flex gap-2">
                <a href={generatedImage} download="tourvista-postcard.png" className="flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md bg-slate-700 hover:bg-slate-600 transition-colors font-semibold">
                   <DownloadIcon className="w-5 h-5" /> Download
                </a>
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md bg-slate-700 hover:bg-slate-600 transition-colors font-semibold" disabled={!generatedImage}>
                    <ShareIcon className="w-5 h-5" /> Share
                </button>
            </div>
        )}
    </div>
  );
};

export default PostcardCreator;
