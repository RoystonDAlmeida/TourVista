import React from 'react';
import { FoodIcon, CameraIcon } from './icons';

interface InteractiveItineraryProps {
  markdownText: string;
}

export const InteractiveItinerary: React.FC<InteractiveItineraryProps> = ({ markdownText }) => {
    const renderNode = (line: string, index: number): React.ReactNode => {
        // Main Heading
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-bold text-cyan-300 mt-6 mb-3">{line.substring(4)}</h3>;
        }
        // Sub-heading
        if (line.startsWith('#### ')) {
             return <h4 key={index} className="text-lg font-semibold text-slate-200 mt-4 mb-2">{line.substring(5)}</h4>;
        }
        // List Item
        if (line.startsWith('* ')) {
            const content = line.substring(2);
            let icon: React.ReactNode = null;
            if (/(breakfast|lunch|dinner|food|cuisine|eat|restaurant|café)/i.test(content)) {
                icon = <FoodIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />;
            } else if (/(photograph|capture|photo|view|scenery)/i.test(content)) {
                icon = <CameraIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />;
            }

            // Make bolded places clickable links to Google Maps
            const linkedContent = content.replace(/\*\*(.*?)\*\*/g, (_match, p1) => {
                const url = `https://maps.google.com/maps?q=${encodeURIComponent(p1)}`;
                return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="font-semibold text-cyan-400 hover:underline">${p1}</a>`;
            });
            
            return (
                 <li key={index} className="flex gap-3 items-start">
                    {icon && <div className="mt-1">{icon}</div>}
                    <span dangerouslySetInnerHTML={{ __html: linkedContent }} />
                </li>
            );
        }
        // Horizontal Rule
        if (line.startsWith('---')) {
            return <hr key={index} className="my-6 border-slate-700" />;
        }
        // Paragraph
        if (line.trim() !== '') {
            return <p key={index} className="mb-4">{line}</p>;
        }
        return null;
    };

    const lines = markdownText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    
    const flushList = (key: number) => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`ul-${key}`} className="space-y-3 mb-4 pl-2">
                    {currentList.map((item, i) => renderNode(item, i))}
                </ul>
            );
            currentList = [];
        }
    };

    lines.forEach((line, index) => {
        if (line.startsWith('* ')) {
            currentList.push(line);
        } else {
            flushList(index);
            elements.push(renderNode(line, index));
        }
    });
    flushList(lines.length); // Add any remaining list items

    return <>{elements}</>;
};