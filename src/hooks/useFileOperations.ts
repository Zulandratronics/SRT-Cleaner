import { useState, useCallback } from 'react';

export interface FileData {
  name: string;
  content: string;
  path: string;
  modified: boolean;
}

export const useFileOperations = () => {
  const [files, setFiles] = useState<FileData[]>([
    {
      name: 'Document1.srt',
      path: '/workspace/Document1.srt',
      content: `1
00:00:01,000 --> 00:00:03,000
This is the first subtitle line.

2
00:00:04,000 --> 00:00:06,000
Here's another subtitle with
multiple lines.

3
00:00:07,000 --> 00:00:09,000
And a third one to demonstrate
the cleaning process.

4
00:00:10,000 --> 00:00:12,000
You can test the SRT cleaning functionality
with these sample subtitles.`,
      modified: false
    },
    {
      name: 'Movie_captions.srt',
      path: '/workspace/Movie_captions.srt',
      content: `1
00:00:00,500 --> 00:00:02,000
Welcome to our movie!

2
00:00:03,000 --> 00:00:05,500
This is an exciting adventure story.

3
00:00:06,000 --> 00:00:08,000
Follow our heroes as they journey
through unknown lands.`,
      modified: false
    },
    {
      name: 'Tutorial_subtitles.srt',
      path: '/workspace/Tutorial_subtitles.srt',
      content: `1
00:00:01,000 --> 00:00:03,000
Step 1: Open the application

2
00:00:04,000 --> 00:00:06,000
Step 2: Load your SRT file

3
00:00:07,000 --> 00:00:09,000
Step 3: Configure cleaning options

4
00:00:10,000 --> 00:00:12,000
Step 4: Click "Clean Current File"`,
      modified: false
    }
  ]);

  const [currentFile, setCurrentFile] = useState<FileData | null>(files[0]);

  const openFile = useCallback((file: FileData) => {
    setCurrentFile(file);
  }, []);

  const createNewFile = useCallback(() => {
    const newFile: FileData = {
      name: 'Untitled.srt',
      path: '/workspace/Untitled.srt',
      content: '',
      modified: false
    };
    setFiles(prev => [...prev, newFile]);
    setCurrentFile(newFile);
  }, []);

  const saveFile = useCallback(() => {
    if (!currentFile) return;
    
    setFiles(prev => prev.map(file => 
      file.path === currentFile.path 
        ? { ...file, content: currentFile.content, modified: false }
        : file
    ));
    setCurrentFile(prev => prev ? { ...prev, modified: false } : null);
  }, [currentFile]);

  const updateFileContent = useCallback((content: string) => {
    if (!currentFile) return;
    
    const updatedFile = { ...currentFile, content, modified: true };
    setCurrentFile(updatedFile);
    setFiles(prev => prev.map(file => 
      file.path === currentFile.path ? updatedFile : file
    ));
  }, [currentFile]);

  const openFileDialog = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.srt,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const newFile: FileData = {
            name: file.name,
            path: `/workspace/${file.name}`,
            content,
            modified: false
          };
          setFiles(prev => [...prev, newFile]);
          setCurrentFile(newFile);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const downloadFile = useCallback(() => {
    if (!currentFile) return;
    
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentFile]);

  return {
    files,
    currentFile,
    openFile,
    createNewFile,
    saveFile,
    updateFileContent,
    openFileDialog,
    downloadFile
  };
};