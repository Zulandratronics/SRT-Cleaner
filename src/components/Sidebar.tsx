import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { FileData } from '../hooks/useFileOperations';

interface SidebarProps {
  files: FileData[];
  currentFile: FileData | null;
  onFileSelect: (file: FileData) => void;
  onNewFile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ files, currentFile, onFileSelect, onNewFile }) => {
  return (
    <div className="w-48 bg-gray-800 border-r border-gray-700 p-2 hidden md:block">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Workspace</div>
        <button
          onClick={onNewFile}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="New File"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-1">
        {files.map((file) => (
          <div
            key={file.path}
            className={`flex items-center space-x-2 p-1 hover:bg-gray-700 rounded cursor-pointer transition-colors ${
              currentFile?.path === file.path ? 'bg-gray-700' : ''
            }`}
            onClick={() => onFileSelect(file)}
          >
            <FileText className="text-gray-400 w-4 h-4" />
            <span className="text-sm flex-1 truncate">
              {file.name}
              {file.modified && <span className="text-yellow-400 ml-1">*</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;