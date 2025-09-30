import React from 'react';
import { Settings, Language, Theme, Shape } from '../types';

interface ControlsPanelProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    {children}
  </div>
);

const IconButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
    <button onClick={onClick} className={`p-2 rounded-full bg-gray-500/20 hover:bg-gray-500/40 transition-colors ${className}`}>
        {children}
    </button>
)

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ settings, setSettings, isOpen, setIsOpen }) => {
  const handleSettingChange = <K extends keyof Settings,>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <div className={`absolute top-0 left-0 h-full p-6 bg-black/50 backdrop-blur-md transition-transform duration-300 ease-in-out pointer-events-auto z-10 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{width: '300px'}}>
        <h2 className="text-xl font-bold mb-6">字宙 Controls</h2>
        
        <SettingRow label={`Speed: ${settings.speed.toFixed(2)}`}>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={settings.speed}
            onChange={(e) => handleSettingChange('speed', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </SettingRow>

        <SettingRow label={`Auto-Rotation Speed: ${settings.rotation.toFixed(2)}`}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.rotation}
            onChange={(e) => handleSettingChange('rotation', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </SettingRow>

        <SettingRow label={`Particle Count: ${settings.particleCount}`}>
            <input
                type="range"
                min="200"
                max="4000"
                step="100"
                value={settings.particleCount}
                onChange={(e) => handleSettingChange('particleCount', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
        </SettingRow>

        <SettingRow label={`Particle Size: ${settings.particleSize.toFixed(2)}`}>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={settings.particleSize}
            onChange={(e) => handleSettingChange('particleSize', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </SettingRow>

        <SettingRow label={`Trail Intensity: ${settings.trailIntensity.toFixed(2)}`}>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.05"
            value={settings.trailIntensity}
            onChange={(e) => handleSettingChange('trailIntensity', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </SettingRow>

        <SettingRow label="Language">
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value as Language)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {Object.values(Language).map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </SettingRow>
        
        <SettingRow label="Transitions">
          <div className="grid grid-cols-2 gap-2">
            {Object.values(Theme).map(theme => (
              <button
                key={theme}
                onClick={() => handleSettingChange('theme', theme)}
                className={`p-2 rounded-md text-sm transition-colors ${settings.theme === theme ? 'bg-cyan-600 font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {theme}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow label="Shape">
          <select
            value={settings.shape}
            onChange={(e) => handleSettingChange('shape', e.target.value as Shape)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {Object.values(Shape).map(shape => (
              <option key={shape} value={shape}>{shape}</option>
            ))}
          </select>
        </SettingRow>

      </div>
       <div className={`absolute top-4 left-4 transition-transform duration-300 ease-in-out pointer-events-auto z-20 ${isOpen ? 'translate-x-[280px]' : 'translate-x-0'}`}>
          <IconButton onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </IconButton>
      </div>
    </>
  );
};