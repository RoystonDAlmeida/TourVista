import React from 'react';
import type { Language } from '../types';
import { VOICES } from '../constants';

interface SettingsProps {
  availableLanguages: Language[];
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  disabled: boolean;
}

const Settings: React.FC<SettingsProps> = ({
  availableLanguages,
  selectedLanguage,
  onLanguageChange,
  selectedVoice,
  onVoiceChange,
  disabled,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-800/50 p-3 rounded-full border border-slate-700">
      <div>
        <label htmlFor="language-select" className="sr-only">Language</label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          disabled={disabled || availableLanguages.length <= 1}
          className="bg-slate-700 border border-slate-600 text-white text-sm rounded-full focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-3 pr-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="voice-select" className="sr-only">Voice</label>
        <select
          id="voice-select"
          value={selectedVoice}
          onChange={(e) => onVoiceChange(e.target.value)}
          disabled={disabled}
          className="bg-slate-700 border border-slate-600 text-white text-sm rounded-full focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-3 pr-8 py-2 disabled:opacity-50"
        >
          {VOICES.map((voice) => (
            <option key={voice.id} value={voice.id}>{voice.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Settings;
