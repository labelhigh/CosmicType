
import React from 'react';

interface InputBarProps {
  text: string;
  setText: (text: string) => void;
  onGenerate: () => void;
}

export const InputBar: React.FC<InputBarProps> = ({ text, setText, onGenerate }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onGenerate();
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto w-full max-w-lg px-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter text..."
        className="w-full px-4 py-3 bg-gray-900/70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm transition-all duration-300"
      />
      <button
        onClick={onGenerate}
        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition-colors duration-300 whitespace-nowrap"
      >
        生成
      </button>
    </div>
  );
};
