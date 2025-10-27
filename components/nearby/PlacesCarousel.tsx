
import React, { useRef, useState, useEffect } from 'react';
import { PlaceCard } from './PlaceCard';
import type { NearbyPlace } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';

interface PlacesCarouselProps {
  places: NearbyPlace[];
  onShowOnMap: (name: string, latitude: number, longitude: number) => void;
}

export const PlacesCarousel: React.FC<PlacesCarouselProps> = ({ places, onShowOnMap }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const isScrollable = el.scrollWidth > el.clientWidth;
      setCanScrollLeft(isScrollable && el.scrollLeft > 5);
      setCanScrollRight(isScrollable && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const observer = new ResizeObserver(checkScrollButtons);
      observer.observe(el);
      checkScrollButtons();
      el.addEventListener('scroll', checkScrollButtons);
      return () => {
        observer.disconnect();
        el.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, [places]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.8;
      el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{scrollSnapType: 'x mandatory'}}>
        {places.map(place => (
          <div key={place.title} className="snap-start">
            <PlaceCard 
              place={place} 
              onShowOnMap={onShowOnMap} 
            />
          </div>
        ))}
      </div>
      <button onClick={() => scroll('left')} className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-slate-800/80 hover:bg-slate-700 rounded-full p-2 z-10 text-white transition-opacity backdrop-blur-sm ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-label="Scroll left">
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      <button onClick={() => scroll('right')} className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-slate-800/80 hover:bg-slate-700 rounded-full p-2 z-10 text-white transition-opacity backdrop-blur-sm ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-label="Scroll right">
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PlacesCarousel;