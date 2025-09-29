import React, { useEffect, useRef, useState } from 'react';

interface EditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSelectionChange: (hasSelection: boolean) => void;
}

const Editor: React.FC<EditorProps> = ({ content, onContentChange, onSelectionChange }) => {
  const editorRef = useRef<HTMLPreElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

  useEffect(() => {
    if (editorRef.current) {
      highlightSRTSyntax();
    }
  }, [content]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            // Save functionality handled by parent
            break;
          case 'z':
            e.preventDefault();
            // Undo functionality handled by parent
            break;
          case 'y':
            e.preventDefault();
            // Redo functionality handled by parent
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const highlightSRTSyntax = () => {
    if (!editorRef.current) return;
    
    let html = content;
    
    // Highlight line numbers
    html = html.replace(/^\d+$/gm, '<span class="text-gray-400">$&</span>');
    
    // Highlight timestamps
    html = html.replace(
      /\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/g, 
      '<span class="text-yellow-400">$&</span>'
    );
    
    // Highlight subtitle text (lines that aren't numbers or timestamps)
    html = html.replace(
      /^(?!\d+$)(?!.*-->).+$/gm, 
      '<span class="text-gray-200">$&</span>'
    );
    
    editorRef.current.innerHTML = html;
  };

  const handleInput = (e: React.FormEvent<HTMLPreElement>) => {
    const newContent = e.currentTarget.textContent || '';
    onContentChange(newContent);
    updateCursorPosition();
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    const hasSelection = selection && selection.toString().length > 0;
    onSelectionChange(!!hasSelection);
    updateCursorPosition();
  };

  const updateCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const textBeforeCaret = preCaretRange.toString();
      
      const lines = textBeforeCaret.split('\n');
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;
      
      setCursorPosition({ line, col });
    }
  };

  return (
    <div className="flex-1 overflow-auto p-2 relative">
      <pre
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        className="whitespace-pre-wrap font-mono text-sm outline-none"
        style={{ fontFamily: 'Consolas, Courier New, monospace', tabSize: 4 }}
        suppressContentEditableWarning={true}
      >
        {content}
      </pre>
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
        Line {cursorPosition.line}, Col {cursorPosition.col}
      </div>
    </div>
  );
};

export default Editor;