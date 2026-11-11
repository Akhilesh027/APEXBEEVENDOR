import { useBusinessWorkspace } from '../context/BusinessWorkspaceContext';
import { RefreshCw } from 'lucide-react';

export function BusinessWorkspaceSelector() {
  const { workspaces, activeId, select, loading, error, refresh } = useBusinessWorkspace();
  return <div className="pos-workspace">
    <div className="flex min-w-0 items-end gap-2">
      {workspaces.length ? <div className="min-w-0 flex-1">
        <label htmlFor="active-business" className="pos-eyebrow mb-1.5 block">Business workspace</label>
        <select id="active-business" value={activeId} onChange={event => select(event.target.value)} className="pos-field h-11 w-full px-3 text-sm font-semibold">
          <option value="all">All approved businesses</option>
          {workspaces.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.categoryName} — {workspace.name}</option>)}
        </select>
      </div> : <div className="min-w-0 flex-1 self-center text-sm text-slate-300">
        {loading ? <p role="status">Loading approved businesses…</p> : !error && <p>No approved business workspaces.</p>}
      </div>}
      <button type="button" onClick={refresh} disabled={loading} className="pos-icon-button h-11 w-11 shrink-0" aria-label="Refresh workspaces" title="Refresh workspaces">
        <RefreshCw size={17} aria-hidden="true" className={loading ? 'animate-spin' : undefined} />
      </button>
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-amber-200">{error}</p>}
  </div>;
}
