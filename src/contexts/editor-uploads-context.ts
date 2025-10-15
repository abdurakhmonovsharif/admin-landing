import { createContext, useCallback, useContext, useMemo, useRef } from "react";

export type EditorUploadHandle = {
  discardUploads: () => Promise<void>;
  commitUploads: () => void;
};

export type EditorUploadsRegistryValue = {
  register: (handle: EditorUploadHandle) => () => void;
};

export const EditorUploadsContext = createContext<EditorUploadsRegistryValue | null>(null);

export const useEditorUploadsContext = () => useContext(EditorUploadsContext);

export const useEditorUploadRegistry = () => {
  const handlesRef = useRef(new Set<EditorUploadHandle>());

  const register = useCallback((handle: EditorUploadHandle) => {
    handlesRef.current.add(handle);
    return () => {
      handlesRef.current.delete(handle);
    };
  }, []);

  const discardAll = useCallback(async () => {
    const handles = Array.from(handlesRef.current);
    if (handles.length === 0) {
      return;
    }
    await Promise.allSettled(handles.map((handle) => handle.discardUploads()));
  }, []);

  const commitAll = useCallback(() => {
    handlesRef.current.forEach((handle) => handle.commitUploads());
  }, []);

  const clearAll = useCallback(() => {
    handlesRef.current.clear();
  }, []);

  const value = useMemo<EditorUploadsRegistryValue>(() => ({ register }), [register]);

  return { value, discardAll, commitAll, clearAll };
};
