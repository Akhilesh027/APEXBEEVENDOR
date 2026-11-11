import {useEffect,useState} from 'react';
import {Droplets,RefreshCw} from 'lucide-react';
import {useBusinessWorkspace} from '../context/BusinessWorkspaceContext';
import {useVendor} from '../context/VendorContext';
import {businessDate,workspaceRequest} from '../services/workspaceService';
import {isWaterBusiness} from '../services/businessPortal';

type View='overview'|'catalog'|'accounts'|'reports';
const field='block w-full min-w-0 mt-1 rounded-xl border border-slate-600 bg-slate-950 p-2.5 text-white';
const button='rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50';
const money=(paise:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(paise/100);
const labels:Record<string,string>={dispatch:'Containers issued',return:'Empty containers returned',deposit_received:'Deposit received',deposit_refunded:'Deposit refunded'};

function ProductSettings({product,busy,onSave}:{product:any;busy:boolean;onSave:(id:string,body:any)=>Promise<boolean>}) {
  const [details,setDetails]=useState({volumeLitres:String(product.waterDetails?.volumeLitres || 20),returnable:product.waterDetails?.returnable ?? true,depositAmount:String(product.waterDetails?.depositAmount ?? 0)});
  return <form className="rounded-2xl border border-slate-700 p-4 grid sm:grid-cols-3 gap-4" onSubmit={e=>{e.preventDefault();onSave(product.id,details);}}>
    <div className="sm:col-span-3"><h2 className="font-bold">{product.name}</h2><p className="text-sm text-slate-400">{product.stock} filled units in stock · Refill/product price: {product.price!=null?money(product.price*100):'Set in catalog'}</p>{!product.waterDetails && <p className="text-amber-200 text-sm">Configure this product before confirming water deliveries.</p>}</div>
    <label>Volume per unit (litres)<input required type="number" min="0.1" max="1000" step="0.1" className={field} value={details.volumeLitres} onChange={e=>setDetails({...details,volumeLitres:e.target.value})}/></label>
    <label>Container<select className={field} value={String(details.returnable)} onChange={e=>setDetails({...details,returnable:e.target.value==='true',depositAmount:e.target.value==='true'?details.depositAmount:'0'})}><option value="true">Returnable can / jar</option><option value="false">Non-returnable bottle</option></select></label>
    <label>Suggested deposit per container (₹)<input required disabled={!details.returnable} type="number" min="0" max="100000" step="0.01" className={field} value={details.depositAmount} onChange={e=>setDetails({...details,depositAmount:e.target.value})}/></label>
    <p className="text-xs text-slate-400 sm:col-span-3">Deposit is separate from the refill price. Saving a deposit rate does not charge a customer.</p><button disabled={busy} className={button}>Save water settings</button>
  </form>;
}

export function WaterWorkspace({initialView='overview', embedded=false}:{initialView?:View; embedded?:boolean}) {
  const {selected}=useBusinessWorkspace(),{setCurrentPage}=useVendor();
  const [view,setView]=useState<View>(initialView),[data,setData]=useState<any>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[revision,setRevision]=useState(0);
  const [from,setFrom]=useState(businessDate().slice(0,7)+'-01'),[through,setThrough]=useState(businessDate());
  const [range,setRange]=useState({from,through});
  const [accountSearch,setAccountSearch]=useState(''),[appliedSearch,setAppliedSearch]=useState('');
  const [movement,setMovement]=useState({productId:'',accountId:'',account:'',kind:'return',quantity:'1',amount:'',date:businessDate(),paymentMethod:'cash',paymentReference:'',notes:'',requestId:crypto.randomUUID()});
  useEffect(()=>setView(initialView),[initialView]);
  useEffect(()=>{
    const controller=new AbortController();setData(null);setError('');
    if(!selected || !isWaterBusiness(selected))return ()=>controller.abort();
    workspaceRequest(`/water?workspaceId=${encodeURIComponent(selected.id)}&from=${range.from}&through=${range.through}&accountSearch=${encodeURIComponent(appliedSearch)}`,{signal:controller.signal}).then(result=>{if(!controller.signal.aborted)setData(result);}).catch(e=>{if(!controller.signal.aborted)setError(e.message);});
    return ()=>controller.abort();
  },[selected?.id,range,revision,appliedSearch]);
  async function save(path:string,body:any,method='POST'){
    if(!selected || busy)return false;setBusy(true);setError('');setNotice('');
    try{const result=await workspaceRequest<{message:string}>(path,{method,body:JSON.stringify({workspaceId:selected.id,...body})});setNotice(result.message);setRevision(n=>n+1);return true;}
    catch(e:any){setError(e.message);return false;}finally{setBusy(false);}
  }
  if(!isWaterBusiness(selected))return <p className="p-6">Choose an approved Water Cans business.</p>;
  const monetary=movement.kind.startsWith('deposit_');
  const returnable=data?.products.filter((p:any)=>p.waterDetails?.returnable) || [];
  const product=returnable.find((p:any)=>p.id===movement.productId);
  const Heading = embedded ? 'h2' : 'h1';
  return <section className={embedded ? 'space-y-6' : 'p-4 sm:p-6 space-y-6 max-w-7xl mx-auto'}>
    <header className="flex flex-wrap justify-between gap-3"><div><Heading className="text-2xl font-bold flex items-center gap-2"><Droplets className="text-sky-400"/>{embedded ? 'Water operations' : selected!.name}</Heading><p className="text-slate-400 mt-2">Filled-water stock, recurring deliveries, returnable cans and customer deposits.</p></div><button className={button} aria-label="Refresh water business" onClick={()=>setRevision(n=>n+1)}><RefreshCw size={18}/></button></header>
    <nav aria-label="Water Cans sections" className="flex flex-wrap gap-2">{[['overview','Overview'],['catalog','Can sizes & deposits'],['accounts','Containers & deposits'],['reports','Container & deposit reports']].map(([id,label])=><button key={id} aria-current={view===id?'page':undefined} className={`${button} ${view===id?'border-sky-400 text-sky-300':''}`} onClick={()=>setCurrentPage(({overview:'dashboard',catalog:'water-catalog',accounts:'water-accounts',reports:'water-reports'} as Record<string,string>)[id])}>{label}</button>)}</nav>
    {error && <p role="alert" className="text-rose-300">{error}</p>}{notice && <p role="status" className="text-emerald-300">{notice}</p>}{!data && !error && <p role="status">Loading Water Cans…</p>}
    {data && <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[['Water products',data.products.length],['Customer accounts',data.totals.customers],['Outstanding containers',data.totals.outstanding],['Deposits held',money(data.totals.depositPaise)]].map(([label,value])=><article key={label} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4"><p className="text-sm text-slate-400">{label}</p><p className="text-2xl font-bold mt-2">{value}</p></article>)}</div>
      {view==='overview' && <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[['water-subscriptions','Customer subscriptions'],['water-deliveries','Daily delivery plan'],['water-demand','Next day water requirements'],['orders-all','One-time water orders'],['water-stock','Filled stock & wastage'],['water-billing','Subscriber billing']].map(([page,label])=><button key={page} className={`${button} p-5 text-left`} onClick={()=>setCurrentPage(page)}>{label} →</button>)}</div>
        <p className="text-sm text-slate-400">Confirmed subscriptions and new one-time orders containing configured returnable water products issue containers automatically on delivery. Receive empty returns below. Older deliveries are not backfilled automatically; record their outstanding containers once. Container counts cover all can sizes on each customer account; individual movements identify the product.</p>
        {data.products.some((p:any)=>!p.waterDetails) && <p className="rounded-xl border border-amber-400/40 p-4 text-amber-200">Some water products need volume and container settings. Open Can sizes & deposits to complete them.</p>}
      </>}
      {view==='catalog' && <><div className="flex flex-wrap gap-3"><button className={button} onClick={()=>setCurrentPage('add-product')}>Add water product</button><button className={button} onClick={()=>setCurrentPage('products-all')}>Edit catalog & refill prices</button></div>{data.products.length?data.products.map((p:any)=><ProductSettings key={`${p.id}-${revision}`} product={p} busy={busy} onSave={(id,body)=>save(`/water/products/${id}`,body,'PATCH')}/>):<p>No water products yet. Add a product in this business first.</p>}</>}
      {view==='accounts' && <>
        <h2 className="text-xl font-bold">Containers and deposit ledger</h2><form className="flex flex-wrap items-end gap-3" onSubmit={e=>{e.preventDefault();setAppliedSearch(accountSearch);}}><label className="grow">Find customer account<input type="search" maxLength={120} className={field} value={accountSearch} onChange={e=>setAccountSearch(e.target.value)} placeholder="Search customer name"/></label><button className={button}>Find accounts</button></form><p className="text-sm text-slate-400">Record payments already received/refunded by cash, UPI or bank. This form does not transfer money. Empty returns do not add filled-water stock. Use manual issue only for older/opening balances or deliveries not already recorded automatically.</p>
        <form className="rounded-2xl border border-slate-700 p-4 grid sm:grid-cols-2 gap-4" onSubmit={async e=>{e.preventDefault();if(await save('/water/movements',movement))setMovement(m=>({...m,notes:'',paymentReference:'',requestId:crypto.randomUUID()}));}}>
          <label>Water product<select required className={field} value={movement.productId} onChange={e=>setMovement({...movement,productId:e.target.value})}><option value="">Choose returnable can / jar</option>{returnable.map((p:any)=><option key={p.id} value={p.id}>{p.name} · {p.waterDetails.volumeLitres} L</option>)}</select></label>
          <label>Customer account<select className={field} value={movement.accountId} onChange={e=>setMovement({...movement,accountId:e.target.value})}><option value="">New / existing named account</option>{data.accounts.map((a:any)=><option key={a._id} value={a._id}>{a.account} · {a.outstanding} cans · {money(a.depositPaise || 0)}</option>)}</select></label>
          {!movement.accountId && <label>Customer name / account reference<input required minLength={2} maxLength={120} className={field} value={movement.account} onChange={e=>setMovement({...movement,account:e.target.value})}/></label>}
          <label>Movement<select className={field} value={movement.kind} onChange={e=>setMovement({...movement,kind:e.target.value})}>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
          {monetary?<><label>Amount (₹)<input required type="number" min="0.01" max="1000000" step="0.01" className={field} value={movement.amount} onChange={e=>setMovement({...movement,amount:e.target.value})}/>{product && <span className="text-xs text-slate-400">Suggested deposit: {money(product.waterDetails.depositAmount*100)} per container.</span>}</label><label>Payment method<select className={field} value={movement.paymentMethod} onChange={e=>setMovement({...movement,paymentMethod:e.target.value})}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank">Bank transfer</option></select></label><label>Receipt / payment reference<input required minLength={3} maxLength={120} className={field} value={movement.paymentReference} onChange={e=>setMovement({...movement,paymentReference:e.target.value})}/></label></>:<label>Container count<input required type="number" min="1" max="10000" step="1" className={field} value={movement.quantity} onChange={e=>setMovement({...movement,quantity:e.target.value})}/></label>}
          <label>Movement date<input required type="date" max={businessDate()} className={field} value={movement.date} onChange={e=>setMovement({...movement,date:e.target.value})}/></label><label>Notes<textarea required minLength={5} maxLength={500} className={field} value={movement.notes} onChange={e=>setMovement({...movement,notes:e.target.value})}/></label><button disabled={busy || !returnable.length} className={button}>Record movement</button>
        </form>
        <h3 className="font-bold">Customer balances</h3><p className="text-xs text-slate-400">Showing up to 200 matching accounts. Search by customer name to find other accounts. Overview balances include all customer accounts.</p><div className="grid sm:grid-cols-2 gap-3">{data.accounts.map((a:any)=><article key={a._id} className="rounded-xl border border-slate-700 p-4"><h4 className="font-semibold">{a.account}</h4><p>{a.outstanding} containers outstanding · {money(a.depositPaise || 0)} deposit held</p></article>)}</div>
      </>}
      {(view==='reports' || view==='accounts') && <>
        <form className="flex flex-wrap gap-3 items-end" onSubmit={e=>{e.preventDefault();setRange({from,through});}}><label>From<input required type="date" max={through} className={field} value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Through<input required type="date" min={from} max={businessDate()} className={field} value={through} onChange={e=>setThrough(e.target.value)}/></label><button className={button}>Load activity</button></form>
        <h2 className="font-bold">Activity: {data.from} to {data.through}</h2><div className="grid sm:grid-cols-2 gap-3">{data.activity.map((a:any)=><article key={a._id} className="rounded-xl border border-slate-700 p-4"><p>{labels[a._id]}</p><p className="text-xl font-bold">{a._id.startsWith('deposit_')?money(a.amountPaise):`${a.quantity} containers`}</p></article>)}</div>
        <p className="text-xs text-slate-400">Period totals include all matching movements. The list below shows the latest 100. Older container movements remain in Stock & specialist records.</p>
        <div className="space-y-2">{data.movements.map((m:any)=><article key={m._id} className="rounded-xl border border-slate-700 p-4"><h3 className="font-semibold">{labels[m.kind]} · {m.date}</h3><p>{m.accountName || data.accounts.find((a:any)=>a._id===m.accountId)?.account || 'Customer account'} · {m.productName || data.products.find((p:any)=>p.id===m.productId)?.name || 'Water product'} · {m.kind.startsWith('deposit_')?money(m.amountPaise):`${m.quantity} containers`}</p><p className="text-sm text-slate-400">{m.notes}{m.paymentReference?` · ${m.paymentMethod}: ${m.paymentReference}`:''}</p></article>)}</div>
        {view==='reports' && <button className={button} onClick={()=>setCurrentPage('water-consumption')}>Open delivery & consumption reports</button>}
      </>}
    </>}
  </section>;
}
