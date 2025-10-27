import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ImageEditIcon } from './icons';

interface ImageEnhancerProps {
  imageUrl: string;
  onImageEdited: (dataUrl: string) => void;
}

const ImageEnhancer: React.FC<ImageEnhancerProps> = ({ imageUrl, onImageEdited }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());

  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;
    if (ctx && canvas) {
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const hRatio = canvas.width / image.width;
      const vRatio = canvas.height / image.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShift_x = (canvas.width - image.width * ratio) / 2;
      const centerShift_y = (canvas.height - image.height * ratio) / 2;
      
      ctx.drawImage(image, 0, 0, image.width, image.height, centerShift_x, centerShift_y, image.width * ratio, image.height * ratio);

      // Call onImageEdited whenever filters are applied
      onImageEdited(canvas.toDataURL('image/jpeg', 0.9));
    }
  }, [brightness, contrast, saturation, grayscale, sepia, onImageEdited]);
  
  useEffect(() => {
    const image = imageRef.current;
    image.crossOrigin = 'Anonymous';
    image.src = imageUrl;
    image.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const containerWidth = canvas.parentElement?.clientWidth || 500;
            const scale = containerWidth / image.naturalWidth;
            canvas.width = containerWidth;
            canvas.height = image.naturalHeight * scale;
            applyFilters();
        }
    };
  }, [imageUrl, applyFilters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const resetFilters = () => {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setGrayscale(0);
      setSepia(0);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 text-xl font-bold text-cyan-300">
            <ImageEditIcon className="w-6 h-6"/>
            <h3>1. Enhance Your Photo</h3>
        </div>
        <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} className="max-w-full max-h-full"/>
        </div>
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <label>Brightness: <span className="font-mono text-cyan-400">{brightness}%</span></label>
                <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} />
                <label>Contrast: <span className="font-mono text-cyan-400">{contrast}%</span></label>
                <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} />
                <label>Saturation: <span className="font-mono text-cyan-400">{saturation}%</span></label>
                <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(Number(e.target.value))} />
            </div>
            <div className="flex gap-2">
                <button onClick={() => setGrayscale(g => g === 100 ? 0 : 100)} className={`flex-1 py-2 text-sm rounded-md transition-colors ${grayscale > 0 ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Grayscale</button>
                <button onClick={() => setSepia(s => s === 100 ? 0 : 100)} className={`flex-1 py-2 text-sm rounded-md transition-colors ${sepia > 0 ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Sepia</button>
                <button onClick={resetFilters} className="flex-1 py-2 text-sm rounded-md bg-slate-700 hover:bg-slate-600">Reset</button>
            </div>
        </div>
    </div>
  );
};

export default ImageEnhancer;
