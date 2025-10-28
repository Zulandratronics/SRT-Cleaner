import React from 'react';

interface MenuBarProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onDownloadFile: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ onNewFile, onOpenFile, onSaveFile, onDownloadFile }) => {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  const menuItems = [
    {
      name: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', action: onNewFile },
        { label: 'Open...', shortcut: 'Ctrl+O', action: onOpenFile },
        { label: 'Save', shortcut: 'Ctrl+S', action: onSaveFile },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: onDownloadFile },
        { divider: true },
        { label: 'Exit', shortcut: 'Alt+F4', action: () => {} }
      ]
    },
    {
      name: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => {} },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => {} },
        { divider: true },
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => {} },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => {} },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => {} }
      ]
    },
    { name: 'Search', items: [] },
    { name: 'View', items: [] },
    { name: 'Plugins', items: [] },
    { name: 'SRT Cleaner', items: [] }
  ];

  return (
    <div className="h-8 flex items-center px-2 border-b border-gray-700 bg-[#1a3a5a] relative">
      <div className="flex space-x-4">
        {menuItems.map((menu) => (
          <div key={menu.name} className="relative">
            <span
              className="text-sm hover:bg-gray-700 px-2 py-1 rounded cursor-pointer transition-colors"
              onClick={() => setActiveMenu(activeMenu === menu.name ? null : menu.name)}
            >
              {menu.name}
            </span>
            {activeMenu === menu.name && menu.items.length > 0 && (
              <div className="absolute top-full left-0 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50 min-w-48">
                {menu.items.map((item, index) => (
                  item.divider ? (
                    <div key={index} className="border-t border-gray-600 my-1" />
                  ) : (
                    <div
                      key={index}
                      className="px-3 py-1 hover:bg-gray-700 cursor-pointer flex justify-between items-center text-sm"
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        }
                        setActiveMenu(null);
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-gray-400 text-xs ml-4">{item.shortcut}</span>
                      )}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {activeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
};

export default MenuBar;