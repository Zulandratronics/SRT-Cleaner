import { useState, useCallback } from 'react';

export const useClipboard = () => {
  const [clipboardContent, setClipboardContent] = useState<string>('');

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setClipboardContent(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setClipboardContent(text);
      return true;
    }
  }, []);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardContent(text);
      return text;
    } catch (err) {
      return clipboardContent;
    }
  }, [clipboardContent]);

  return {
    clipboardContent,
    copyToClipboard,
    pasteFromClipboard
  };
};