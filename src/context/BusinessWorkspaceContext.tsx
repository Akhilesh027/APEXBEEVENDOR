import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useVendor } from './VendorContext';
import { workspaceRequest } from '../services/workspaceService';
import type { BusinessWorkspace } from '../services/workspaceService';

interface WorkspaceContext {
  workspaces: BusinessWorkspace[]; selected: BusinessWorkspace | null; activeId: string;
  loading: boolean; error: string; select: (id: string) => void; refresh: () => void;
  productIds: string[] | null;
}
const Context = createContext<WorkspaceContext | null>(null);

export function BusinessWorkspaceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, profile, setCurrentPage, currentPage, products } = useVendor();
  const [workspaces, setWorkspaces] = useState<BusinessWorkspace[]>([]);
  const [activeId, setActiveId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [catalog, setCatalog] = useState<{id:string;ids:string[]}>({id:'',ids:[]});
  const [catalogError,setCatalogError] = useState('');
  const loadedAccess = useRef(false);
  const preferenceKey = `vendor_workspace_${profile.id}`;
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    loadedAccess.current = false;
    setWorkspaces([]);
    setActiveId('all');
    setCatalog({ id: '', ids: [] });
  }, [isAuthenticated, profile.id]);

  useEffect(() => {
    if (!isAuthenticated || !profile.id) return;
    const refreshWhenVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [isAuthenticated, profile.id, refresh]);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    if (!isAuthenticated || !profile.id) { setLoading(false); return () => controller.abort(); }
    setLoading(true);
    workspaceRequest<{ workspaces: BusinessWorkspace[] }>('', { signal: controller.signal, cache: 'no-store' })
      .then(data => {
        if (controller.signal.aborted) return;
        setWorkspaces(data.workspaces);
        if (!loadedAccess.current) {
          const preferredId = localStorage.getItem(preferenceKey);
          const preferred = data.workspaces.find(workspace => workspace.id === preferredId);
          setActiveId(data.workspaces.length === 1 ? data.workspaces[0].id : preferred?.id || 'all');
        }
        loadedAccess.current = true;
      })
      .catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Unable to load business access.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [isAuthenticated, profile.id, preferenceKey, revision]);
  useEffect(() => {
    if (loading || error) return;
    if (activeId !== 'all' && !workspaces.some(workspace => workspace.id === activeId)) {
      setActiveId(workspaces.length === 1 ? workspaces[0].id : 'all');
      setCurrentPage('dashboard');
    }
  }, [activeId, workspaces, loading, error, setCurrentPage]);
  useEffect(()=>{
    const controller=new AbortController();setCatalogError('');
    if(!isAuthenticated || activeId==='all')return ()=>controller.abort();
    workspaceRequest<{products:{id:string}[]}>(`/catalog?workspaceId=${encodeURIComponent(activeId)}`,{signal:controller.signal})
      .then(result=>{if(!controller.signal.aborted)setCatalog({id:activeId,ids:result.products.map(p=>p.id)});})
      .catch(error=>{if(!controller.signal.aborted){setCatalog({id:activeId,ids:[]});setCatalogError(error.message);}});
    return ()=>controller.abort();
  },[activeId,isAuthenticated,currentPage,products.length,revision]);
  const select = (id: string) => {
    if (id !== 'all' && !workspaces.some(workspace => workspace.id === id)) return;
    if (profile.id) localStorage.setItem(preferenceKey, id);
    setActiveId(id); setCurrentPage('dashboard');
  };
  return <Context.Provider value={{ workspaces, selected: workspaces.find(workspace => workspace.id === activeId) || null,
    activeId, loading, error:error || catalogError, select, refresh, productIds:activeId==='all'?null:catalog.id===activeId?catalog.ids:[] }}>{children}</Context.Provider>;
}

export function useBusinessWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error('Business workspace provider is required.');
  return context;
}
