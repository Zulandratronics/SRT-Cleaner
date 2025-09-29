import React, { useState, useCallback, useEffect } from 'react';
import MenuBar from './components/MenuBar';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import StatusBar from './components/StatusBar';
import PluginWindow, { CleaningOptions } from './components/PluginWindow';
import Notification from './components/Notification';
import { useFileOperations } from './hooks/useFileOperations';
import { useClipboard } from './hooks/useClipboard';
import { useUndoRedo } from './hooks/useUndoRedo';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

function App() {
  const {
    files,
    currentFile,
    openFile,
    createNewFile,
    saveFile,
    updateFileContent,
    openFileDialog,
    downloadFile
  } = useFileOperations();

  const { copyToClipboard, pasteFromClipboard } = useClipboard();
  const { addToHistory, undo, redo, canUndo, canRedo } = useUndoRedo(currentFile?.content || '');

  const [isPluginVisible, setIsPluginVisible] = useState(true);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [hasSelection, setHasSelection] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

  // Update undo/redo history when content changes
  useEffect(() => {
    if (currentFile?.content) {
      addToHistory(currentFile.content);
    }
  }, [currentFile?.content, addToHistory]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification: NotificationState = {
      message,
      type,
      id: Date.now()
    };
    setNotifications(prev => [...prev, notification]);
  };

  const closeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSave = useCallback(() => {
    saveFile();
    showNotification('File saved successfully!', 'success');
  }, [saveFile]);

  const handleCut = useCallback(async () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      await copyToClipboard(selection.toString());
      document.execCommand('delete');
      showNotification('Text cut to clipboard', 'info');
    }
  }, [copyToClipboard]);

  const handleCopy = useCallback(async () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      await copyToClipboard(selection.toString());
      showNotification('Text copied to clipboard', 'info');
    }
  }, [copyToClipboard]);

  const handlePaste = useCallback(async () => {
    const text = await pasteFromClipboard();
    if (text) {
      document.execCommand('insertText', false, text);
      showNotification('Text pasted from clipboard', 'info');
    }
  }, [pasteFromClipboard]);

  const handleUndo = useCallback(() => {
    const previousContent = undo();
    if (previousContent !== null && currentFile) {
      updateFileContent(previousContent);
      showNotification('Undo successful', 'info');
    }
  }, [undo, currentFile, updateFileContent]);

  const handleRedo = useCallback(() => {
    const nextContent = redo();
    if (nextContent !== null && currentFile) {
      updateFileContent(nextContent);
      showNotification('Redo successful', 'info');
    }
  }, [redo, currentFile, updateFileContent]);

  const cleanSRTContent = (options: CleaningOptions) => {
    if (!currentFile) return;
    
    let lines = currentFile.content.split('\n');
    let result: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Skip empty lines if not preserving them
      if (line.trim() === '') {
        if (options.preserveEmptyLines) {
          result.push('');
        }
        continue;
      }
      
      // Skip line numbers if option is checked
      if (options.removeLineNumbers && /^\d+$/.test(line.trim())) {
        continue;
      }
      
      // Skip timestamps if option is checked
      if (options.removeTimestamps && line.includes('-->')) {
        continue;
      }
      
      // Trim whitespace if option is checked
      if (options.trimLines) {
        line = line.trim();
      }
      
      // Add non-empty lines
      if (line) {
        result.push(line);
      }
    }
    
    updateFileContent(result.join('\n'));
  };

  const totalLines = currentFile?.content.split('\n').length || 0;

  return (
    <div className="bg-[#0e2439] text-white h-screen flex flex-col overflow-hidden">
      <MenuBar
        onNewFile={createNewFile}
        onOpenFile={openFileDialog}
        onSaveFile={handleSave}
        onDownloadFile={downloadFile}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          files={files}
          currentFile={currentFile}
          onFileSelect={openFile}
          onNewFile={createNewFile}
        />
        
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
          <Toolbar
            onSave={handleSave}
            onCut={handleCut}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            hasSelection={hasSelection}
          />
          <Editor
            content={currentFile?.content || ''}
            onContentChange={updateFileContent}
            onSelectionChange={setHasSelection}
          />
          <StatusBar
            currentFile={currentFile}
            cursorPosition={cursorPosition}
            totalLines={totalLines}
          />
        </div>
      </div>

      <PluginWindow
        isVisible={isPluginVisible}
        onClose={() => setIsPluginVisible(false)}
        onCleanContent={cleanSRTContent}
        onShowNotification={showNotification}
      />

      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => closeNotification(notification.id)}
        />
      ))}
      
      {!isPluginVisible && (
        <button
          onClick={() => setIsPluginVisible(true)}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Open SRT Cleaner Plugin"
        >
          SRT
        </button>
      )}
    </div>
  );
}

export default App;