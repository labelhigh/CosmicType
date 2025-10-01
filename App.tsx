
import React, { useState, useCallback, useEffect } from 'react';
import { ControlsPanel } from './components/ControlsPanel';
import { InputBar } from './components/InputBar';
import { ParticleCanvas } from './components/ParticleCanvas';
import { Settings, Shape } from './types';
import { DEFAULT_SETTINGS, RANDOM_QUOTES, TEXT_HOLD_DURATION } from './constants';

function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [inputText, setInputText] = useState<string>('你好世界');
  const [targetText, setTargetText] = useState<string>('你好世界');
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

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

  // This useEffect hook manages the lifecycle of the text displayed on screen.
  // It handles two main scenarios:
  // 1. When text is displayed (targetText is not empty), it sets a timer to clear the text after a duration.
  // 2. When the screen is idle (targetText is empty), it sets a timer to show a random quote.
  // The hook cleans up after itself by clearing any pending timer whenever its dependencies change,
  // preventing memory leaks and incorrect behavior.
  useEffect(() => {
    // If a shape is being displayed, we don't want any text timers.
    if (settings.shape !== Shape.None) {
      return;
    }

    let timerId: number;

    if (targetText) {
      // Scenario 1: Text is being shown. Set a timer to clear it.
      timerId = window.setTimeout(() => {
        setTargetText('');
      }, TEXT_HOLD_DURATION);
    } else {
      // Scenario 2: Screen is idle. Set a timer to show a random quote.
      timerId = window.setTimeout(() => {
        const randomQuote = RANDOM_QUOTES[Math.floor(Math.random() * RANDOM_QUOTES.length)];
        setTargetText(randomQuote);
      }, settings.quoteIdleTime * 1000);
    }

    // This is the cleanup function. React runs this function when the component
    // unmounts, or before it runs the effect again due to a dependency change.
    // This is crucial for clearing the timeout and preventing multiple timers
    // from running simultaneously.
    return () => {
      clearTimeout(timerId);
    };
  }, [targetText, settings.shape, settings.quoteIdleTime]);


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
