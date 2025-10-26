import React, { useState, useEffect } from 'react';

interface StreamingMessageProps {
  text: string;
}

const StreamingMessage: React.FC<StreamingMessageProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset when text changes

    if (!text) return;

    const words = text.split(/(\s+)/); // Split by space but keep the spaces
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText((prev) => prev + words[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 50); // Adjust speed as needed

    return () => clearInterval(intervalId);
  }, [text]);

  return <p className="whitespace-pre-wrap">{displayedText}</p>;
};

export default StreamingMessage;
