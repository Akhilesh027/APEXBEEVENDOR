import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import './preview.css';
import {WaterWorkspace} from '../../src/pages/WaterWorkspace';
import {DairyWorkspace} from '../../src/pages/DairyWorkspace';
import {Sidebar} from '../../src/components/Sidebar';
import {PreviewContext,water} from './state';

const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const product={id:'preview-product',name:'Purified drinking water · 20 L can',stock:84,price:40,waterDetails:{volumeLitres:20,returnable:true,depositAmount:150,workspaceId:water.id}};
const data={workspace:water,products:[product],accounts:[{_id:'preview-account',account:'Sample customer · Apartment A',outstanding:3,depositPaise:45000}],movements:[{_id:'preview-movement',accountId:'preview-account',productId:product.id,kind:'deposit_received',date:today,amountPaise:45000,quantity:0,paymentMethod:'cash',paymentReference:'SAMPLE-RECEIPT',notes:'Illustrative customer deposit; preview data only.'}],totals:{customers:1,outstanding:3,depositPaise:45000},activity:[{_id:'dispatch',quantity:6,entries:2},{_id:'return',quantity:3,entries:1},{_id:'deposit_received',amountPaise:45000,entries:1}],from:today.slice(0,7)+'-01',through:today};
const next=new Date(today+'T00:00:00Z');next.setUTCDate(next.getUTCDate()+1);
const recurring={workspace:water,date:today,tomorrow:next.toISOString().slice(0,10),holiday:false,settings:null,summary:{active:1,paused:0,scheduled:1,delivered:0,failed:0,tomorrowDeliveries:1},products:[{...product,packSize:'20 L',status:'Live'}],subscriptions:[{id:'preview-sub',productId:product.id,productName:product.name,quantity:2,componentPacks:2,packSize:'20 L',unitPrice:40,frequency:'daily',billingCycle:'weekly',scheduleVersion:2,litres:40,status:'active',startDate:today,deliverySlot:'Morning',skippedDates:[],customerName:'Sample customer',customerPhone:'Preview contact',address:'Illustrative delivery address',deliveryAgentName:'',due:true,dueTomorrow:true,deliveryPeriod:'morning',deliveryStatus:null}],demand:[{productName:product.name,packSize:'20 L',quantity:2,deliveries:1,litres:40}]};
window.fetch=async(input:any,options:any={})=>{
  const url=String(input);
  let body:any=data;
  if(options.method && options.method!=='GET')body={message:'Preview only: no live records were changed.'};
  else if(url.includes('/riders'))body={riders:[],territoryConfigured:false};
  else if(url.includes('/operations'))body={movements:[],routes:[],summaries:[],statements:[],batches:[],expiryAlerts:[]};
  else if(url.includes('/water/recurring'))body=recurring;
  return new Response(JSON.stringify(body),{status:200,headers:{'Content-Type':'application/json'}});
};
function Preview(){
  const [currentPage,setCurrentPage]=useState('dashboard');
  const views:any={'water-subscriptions':'subscriptions','water-deliveries':'deliveries','water-demand':'demand','water-routes':'routes','water-billing':'billing','water-consumption':'reports'};
  const view=currentPage==='water-catalog'?'catalog':currentPage==='water-accounts'?'accounts':currentPage==='water-reports'?'reports':'overview';
  return <PreviewContext.Provider value={{currentPage,setCurrentPage}}><div className="bg-slate-950 text-white min-h-screen"><p className="bg-sky-950 text-sky-200 p-2 text-center text-sm">Isolated UI preview · Sample data · No login, payments or live database changes</p><div className="flex"><Sidebar/><main className="min-w-0 flex-1">{views[currentPage]?<DairyWorkspace key={currentPage} initialView={views[currentPage]}/>:<WaterWorkspace initialView={view}/>}</main></div></div></PreviewContext.Provider>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
