import React, { useState, useRef, useEffect } from 'react';
import { Clock, Minus, X, Sparkles, Clipboard } from 'lucide-react';

interface PluginWindowProps {
  isVisible: boolean;
  onClose: () => void;
  onCleanContent: (options: CleaningOptions) => void;
  onShowNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export interface CleaningOptions {
  removeTimestamps: boolean;
  removeLineNumbers: boolean;
  preserveEmptyLines: boolean;
  trimLines: boolean;
  outputFormat: string;
}

const PluginWindow: React.FC<PluginWindowProps> = ({
  isVisible,
  onClose,
  onCleanContent,
  onShowNotification
}) => {
  const [options, setOptions] = useState<CleaningOptions>({
    removeTimestamps: true,
    removeLineNumbers: true,
    preserveEmptyLines: false,
    trimLines: true,
    outputFormat: 'plain-text'
  });

  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: window.innerHeight - 300 });
  const [size, setSize] = useState({ width: 384, height: 320 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault();
    
    if (action === 'drag') {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    } else if (action === 'resize') {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y))
        });
      } else if (isResizing) {
        const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(250, resizeStart.height + (e.clientY - resizeStart.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, size]);

  const handleOptionChange = (key: keyof CleaningOptions, value: boolean | string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleCleanCurrent = () => {
    onCleanContent(options);
    onShowNotification('SRT file cleaned successfully!', 'success');
  };

  const handleCleanClipboard = () => {
    onShowNotification('Clipboard content cleaned! (simulated)', 'info');
  };

  if (!isVisible) return null;

  return (
    <div
      ref={windowRef}
      className="fixed bg-gray-800 rounded-md border border-gray-700 flex flex-col z-50 shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      {/* Header */}
      <div
        className="bg-gray-700 px-3 py-2 rounded-t-md flex justify-between items-center cursor-move select-none"
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        <div className="font-semibold flex items-center">
          <Clock className="mr-2 text-yellow-400 w-4 h-4" />
          SRT Cleaner
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-300 hover:text-white transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Processing Options</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-blue-500"
                checked={options.removeTimestamps}
                onChange={(e) => handleOptionChange('removeTimestamps', e.target.checked)}
              />
              <span className="text-sm">Remove timestamps</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-blue-500"
                checked={options.removeLineNumbers}
                onChange={(e) => handleOptionChange('removeLineNumbers', e.target.checked)}
              />
              <span className="text-sm">Remove line numbers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-blue-500"
                checked={options.preserveEmptyLines}
                onChange={(e) => handleOptionChange('preserveEmptyLines', e.target.checked)}
              />
              <span className="text-sm">Preserve empty lines</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-blue-500"
                checked={options.trimLines}
                onChange={(e) => handleOptionChange('trimLines', e.target.checked)}
              />
              <span className="text-sm">Trim whitespace</span>
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Output Format</label>
          <select
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
            value={options.outputFormat}
            onChange={(e) => handleOptionChange('outputFormat', e.target.value)}
          >
            <option value="plain-text">Plain text</option>
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
          </select>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleCleanCurrent}
            className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 px-3 rounded text-sm font-medium flex items-center justify-center transition-colors"
          >
            <Sparkles className="mr-2 w-4 h-4" />
            Clean Current File
          </button>
          <button
            onClick={handleCleanClipboard}
            className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded text-sm font-medium flex items-center justify-center transition-colors"
          >
            <Clipboard className="mr-2 w-4 h-4" />
            Clean Clipboard
          </button>
        </div>
      </div>
      
      {/* Resize Handle */}
      <div
        className="w-4 h-4 bg-gray-700 ml-auto cursor-nwse-resize"
        onMouseDown={(e) => handleMouseDown(e, 'resize')}
      />
    </div>
  );
};

export default PluginWindow;