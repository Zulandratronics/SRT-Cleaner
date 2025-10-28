## Overview

This is a small React + Vite + TypeScript single-page app for cleaning SRT subtitle files into plain text. Key design points an AI agent should know up front:

- Built with Vite + React + TypeScript. Entry: `src/main.tsx` -> `src/App.tsx`.
- UI is componentized under `src/components/` (notable: `Editor.tsx`, `MenuBar.tsx`, `PluginWindow.tsx`, `Sidebar.tsx`, `Toolbar.tsx`).
- Local "virtual" file store is implemented in `src/hooks/useFileOperations.ts` (in-memory file list, currentFile, FileReader-based open, Blob download for Save As).
- Text transformation / cleaning occurs in `App.tsx` inside `cleanSRTContent` (uses line-by-line processing and options supplied by the plugin window).
- Undo/Redo is implemented in `src/hooks/useUndoRedo.ts` (keeps up to 50 history states, exposed via addToHistory/undo/redo).
- Editor is a contentEditable <pre> in `Editor.tsx` with simple syntax highlighting implemented by replacing content with HTML (see `highlightSRTSyntax`). Because the editor uses innerHTML and regex replacement, be mindful of HTML/encoding when modifying the editor logic.

## Developer workflows & commands

Use the scripts in `package.json`:

- `npm run dev` — start Vite dev server (recommended during edits)
- `npm run build` — produce production build
- `npm run preview` — preview built output
- `npm run lint` — run ESLint across the repo
- `npm run typecheck` — run `tsc --noEmit -p tsconfig.app.json`

If you change packages that affect runtime bundling (icons, large libs), note that `vite.config.ts` excludes `lucide-react` from `optimizeDeps` — update that file if you add/remove large ESM packages.

## Project-specific patterns & conventions

- Virtual files: `useFileOperations` holds the canonical in-memory file list; components read `currentFile` and call `updateFileContent` to mutate text. Don't mutate file objects directly — use provided callbacks.
- File open flow: `MenuBar` triggers `openFileDialog` -> `FileReader` -> `setCurrentFile`. The file `path` values are virtual (e.g. `/workspace/Document1.srt`). Tests or agents operating on disk will need to map these virtual paths to real files.
- Save vs Save As: `saveFile` updates the in-memory files array and clears `modified`; `downloadFile` creates a Blob and triggers a browser download. There is no server persistence in this app.
- Editor model: `Editor.tsx` is contentEditable and calls `onContentChange` with the plain text. Syntax highlighting is applied by assigning `innerHTML`. When changing text-processing logic, keep a round-trip between text (string) and HTML rendering in mind.
- Undo/Redo: `useUndoRedo` expects the parent to call `addToHistory(currentContent)` when a content snapshot should be recorded (this is done in `App.tsx` via a useEffect). Follow that pattern when adding new content sources.

## Integration points & external deps

- `@supabase/supabase-js` is listed in `package.json` but not referenced in the main UI code; review usage before removing or configuring it.
- `lucide-react` is used for icons but explicitly excluded from Vite optimizeDeps — imports or build issues around icons may require touching `vite.config.ts`.
- Tailwind is used for styling (`tailwind.config.js`, `index.css`). Modify classnames in JSX; no CSS-in-JS patterns are used.

## Concrete examples for agents

- To implement a new cleaning option that removes speaker labels, update `cleanSRTContent` in `src/App.tsx` and the `PluginWindow` options interface (`components/PluginWindow.tsx`) so the option is exposed to users.
- To add a new menu command that manipulates the active file, add an item in `MenuBar.tsx` that calls a prop callback, and add the callback handler (e.g. `onExportPlainText`) in `App.tsx` that uses `currentFile?.content` and `downloadFile()`.
- To add persistent storage (localStorage or server), replace `useFileOperations` internals: keep the same return shape ({ files, currentFile, openFile, createNewFile, saveFile, updateFileContent, openFileDialog, downloadFile }) so UI components remain compatible.

## Quick pointers for common agent tasks

- Where to update UI text / layout: `src/components/*` (small, self-contained components)
- Where to modify SRT parsing rules: `App.tsx` → `cleanSRTContent` and `Editor.tsx` → `highlightSRTSyntax` for rendering
- Where to extend file behavior (persistence, formats): `src/hooks/useFileOperations.ts`
- Where to modify undo behavior/limits: `src/hooks/useUndoRedo.ts` (history length, snapshot strategy)

## Final notes

Keep changes minimal and preserve the simple in-memory file model unless you intentionally migrate to persistent storage. When editing editor rendering, be careful with `innerHTML` usage and ensure text<->HTML conversions stay consistent.

If anything above is unclear or you want more examples (tests, CI, or specific component wiring), tell me which area to expand and I’ll iterate.

## Example: add a new cleaning option (remove speaker labels)

This is a small concrete example showing the exact places to touch if you want to add a new cleaning option `removeSpeakerLabels` that strips leading speaker labels like `JOHN: Hello`.

- Add the option to the plugin options interface in `src/components/PluginWindow.tsx` (the file already exports `CleaningOptions`). Example:

	```ts
	export interface CleaningOptions {
		preserveEmptyLines?: boolean;
		removeLineNumbers?: boolean;
		removeTimestamps?: boolean;
		trimLines?: boolean;
		removeSpeakerLabels?: boolean; // NEW
	}
	```

- Update the cleaning logic in `src/App.tsx` inside `cleanSRTContent` to apply the new option. Insert something like:

	```ts
	if (options.removeSpeakerLabels) {
		// Remove a leading speaker label (e.g. "JOHN: text" or "Anna: text")
		// This keeps the rest of the line but drops the label and the colon+space.
		line = line.replace(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]{1,40}:\s*/u, '');
		if (line.trim() === '') continue; // skip if line became empty
	}
	```

This follows the existing pattern in `cleanSRTContent`: check options early and transform `line` before pushing it into `result`. Because the editor rendering uses `innerHTML` in `Editor.tsx`, prefer keeping the transformation on the plain-text side (in `App.tsx`) and avoid injecting HTML here.
