import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ControlsPanel } from './components/ControlsPanel';
import { InputBar } from './components/InputBar';
import { ParticleCanvas } from './components/ParticleCanvas';
import { Settings, Shape } from './types';
import { DEFAULT_SETTINGS, RANDOM_QUOTES } from './constants';

function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [inputText, setInputText] = useState<string>('你好世界');
  const [targetText, setTargetText] = useState<string>('');
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);
  
  const idleTimerRef = useRef<number | null>(null);
  const quoteClearTimerRef = useRef<number | null>(null);

  const handleGenerate = useCallback(() => {
    setTargetText(inputText);
    if (settings.shape !== Shape.None) {
      setSettings(s => ({ ...s, shape: Shape.None }));
    }
  }, [inputText, settings.shape]);

  const handleSettingsChange = useCallback((value: React.SetStateAction<Settings>) => {
    setSettings(prevSettings => {
      const newSettings = typeof value === 'function' ? value(prevSettings) : value;
      // If a new shape is selected, clear the target text.
      if (newSettings.shape !== prevSettings.shape && newSettings.shape !== Shape.None) {
        setTargetText('');
      }
      return newSettings;
    });
  }, []);

  // Effect to display random quotes when idle
  useEffect(() => {
    // Always clear existing timers when dependencies change to avoid stale timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (quoteClearTimerRef.current) clearTimeout(quoteClearTimerRef.current);

    const isIdle = !targetText && settings.shape === Shape.None;

    if (isIdle) {
      // Set a timer to show a new quote after a delay
      idleTimerRef.current = window.setTimeout(() => {
        const randomQuote = RANDOM_QUOTES[Math.floor(Math.random() * RANDOM_QUOTES.length)];
        
        setTargetText(randomQuote);

        // Set a timer to clear the quote after it has been displayed
        quoteClearTimerRef.current = window.setTimeout(() => {
          setTargetText('');
        }, 3000); // Quote visible for 3 seconds before dissipating

      }, 7000); // 7 seconds of idle time before showing a quote
    }

    // Cleanup function to clear timers when the component unmounts or dependencies change
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (quoteClearTimerRef.current) clearTimeout(quoteClearTimerRef.current);
    };
  }, [targetText, settings.shape]);


  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white">
      <ParticleCanvas settings={settings} targetText={targetText} />

      <div className="absolute top-0 left-0 bottom-0 right-0 pointer-events-none">
        <ControlsPanel
          settings={settings}
          setSettings={handleSettingsChange}
          isOpen={isPanelOpen}
          setIsOpen={setIsPanelOpen}
        />
        <InputBar
          text={inputText}
          setText={setInputText}
          onGenerate={handleGenerate}
        />
      </div>
    </main>
  );
}

export default App;