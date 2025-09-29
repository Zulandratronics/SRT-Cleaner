import React from 'react';
import { FileData } from '../hooks/useFileOperations';

interface StatusBarProps {
  currentFile: FileData | null;
  cursorPosition: { line: number; col: number };
  totalLines: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentFile, cursorPosition, totalLines }) => {
  return (
    <div className="bg-[#007acc] h-6 flex items-center px-2 text-xs">
      <span>Line {cursorPosition.line}, Col {cursorPosition.col}</span>
      <span className="ml-4">{totalLines} lines</span>
      <span className="ml-4">UTF-8</span>
      <span className="ml-4">Windows (CR LF)</span>
      <span className="ml-auto">{currentFile?.name.split('.').pop()?.toUpperCase() || 'TXT'}</span>
      {currentFile?.modified && <span className="ml-2 text-yellow-200">●</span>}
    </div>
  );
};

export default StatusBar;