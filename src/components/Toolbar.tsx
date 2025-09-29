import React from 'react';
import { Save, Scissors, Copy, Clipboard, Undo, Redo } from 'lucide-react';

interface ToolbarProps {
  onSave: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onSave,
  onCut,
  onCopy,
  onPaste,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasSelection
}) => {
  const buttons = [
    { icon: Save, color: 'text-blue-400', action: onSave, title: 'Save (Ctrl+S)' },
    { icon: Scissors, color: hasSelection ? 'text-blue-400' : 'text-gray-600', action: onCut, title: 'Cut (Ctrl+X)', disabled: !hasSelection },
    { icon: Copy, color: hasSelection ? 'text-blue-400' : 'text-gray-600', action: onCopy, title: 'Copy (Ctrl+C)', disabled: !hasSelection },
    { icon: Clipboard, color: 'text-blue-400', action: onPaste, title: 'Paste (Ctrl+V)' },
    { divider: true },
    { icon: Undo, color: canUndo ? 'text-blue-400' : 'text-gray-600', action: onUndo, title: 'Undo (Ctrl+Z)', disabled: !canUndo },
    { icon: Redo, color: canRedo ? 'text-blue-400' : 'text-gray-600', action: onRedo, title: 'Redo (Ctrl+Y)', disabled: !canRedo },
  ];

  return (
    <div className="h-10 flex items-center px-2 space-x-2 border-b border-gray-700">
      {buttons.map((button, index) => {
        if (button.divider) {
          return <div key={index} className="border-r border-gray-600 h-6 mx-1"></div>;
        }
        
        const Icon = button.icon!;
        return (
          <button
            key={index}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <Icon className={`w-4 h-4 ${button.color}`} />
          </button>
        );
      })}
    </div>
  );
};

export default Toolbar;