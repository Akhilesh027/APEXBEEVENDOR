import {createContext,useContext} from 'react';
export const PreviewContext=createContext<any>(null);
export const water={id:'preview-water',categoryId:'preview-daily',categoryName:'Daily Needs',name:'Water Cans',slug:'water-cans',kind:'catalog',canOfferSubscriptions:true};
export function useVendor(){const state=useContext(PreviewContext);return {...state,products:[],orders:[],profile:{businessType:'Vendor',kycStatus:'Verified',primaryCategory:'Daily Needs'}};}
export function useBusinessWorkspace(){return {selected:water,productIds:['preview-product'],workspaces:[water]};}
