import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Eye, PackagePlus, X } from 'lucide-react';

const steps = [
  { label: 'Product details', description: 'Name, SKU and category' },
  { label: 'Price & stock', description: 'Prices, inventory and attributes' },
  { label: 'Media & delivery', description: 'Photos and fulfillment options' },
];

interface ProductEditorProps {
  step: number;
  editing: boolean;
  saving: boolean;
  error: string;
  workspace?: string;
  preview: ReactNode;
  children: ReactNode;
  onStep: (step: number) => void;
  onClose: () => void;
  onSave: () => void;
}

export function ProductEditor({ step, editing, saving, error, workspace, preview, children, onStep, onClose, onSave }: ProductEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [previewStep, setPreviewStep] = useState<number | null>(null);
  const previewOpen = previewStep === step;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  return <dialog ref={dialogRef} className="product-editor" aria-labelledby="product-editor-title" onCancel={event => {
    event.preventDefault();
    if (!saving) onClose();
  }}>
    <header className="product-editor-header">
      <span className="product-editor-mark" aria-hidden="true"><PackagePlus size={22} /></span>
      <div className="min-w-0 flex-1">
        <p className="pos-eyebrow">Catalog {workspace && `· ${workspace}`}</p>
        <h2 id="product-editor-title" className="pos-page-title">{editing ? 'Edit product' : 'Add product'}</h2>
      </div>
      <button className="pos-icon-button shrink-0" type="button" onClick={onClose} disabled={saving} aria-label="Close product form"><X size={20} aria-hidden="true" /></button>
    </header>
    <nav className="product-editor-steps" aria-label="Product form steps">
      {steps.map(({ label, description }, index) => <button key={label} type="button" disabled={saving}
        aria-current={step === index + 1 ? 'step' : undefined} onClick={() => onStep(index + 1)}>
        <span className="product-step-number">{index + 1}</span>
        <span><strong>{label}</strong><small>{description}</small></span>
      </button>)}
    </nav>

    <div className="product-editor-scroll" ref={scrollRef}>
      <div className="product-editor-grid">
        <aside className="product-editor-preview min-w-0" aria-label="Customer preview">
          <button type="button" className="pos-action w-full lg:hidden" aria-expanded={previewOpen}
            aria-controls="product-customer-preview" onClick={() => setPreviewStep(previewOpen ? null : step)}>
            <Eye size={17} aria-hidden="true" />{previewOpen ? 'Hide customer preview' : 'Show customer preview'}
          </button>
          <div id="product-customer-preview" className={`${previewOpen ? 'block' : 'hidden'} mt-3 lg:mt-0 lg:block`}>{preview}</div>
        </aside>
        <form className="min-w-0" onSubmit={event => event.preventDefault()}>
          {children}
        </form>
      </div>
    </div>

    <footer className="product-editor-footer">
      {error && <p className="product-editor-error" role="alert">{error}</p>}
      <div className="flex items-center justify-between gap-2">
        {step > 1 ? <button type="button" className="pos-action" disabled={saving} onClick={() => onStep(step - 1)}>
          <ArrowLeft size={16} aria-hidden="true" />Back
        </button> : <button type="button" className="pos-action" onClick={onClose}>Cancel</button>}
        <span className="hidden text-sm text-muted-foreground sm:block">Step {step} of {steps.length}</span>
        {step < steps.length ? <button type="button" className="pos-action pos-action-primary" onClick={() => onStep(step + 1)}>
          Continue<ArrowRight size={16} aria-hidden="true" />
        </button> : <button type="button" className="pos-action pos-action-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Submit for approval'}
        </button>}
      </div>
    </footer>
  </dialog>;
}
