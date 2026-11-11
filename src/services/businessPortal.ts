import type {BusinessWorkspace} from './workspaceService';
const key = (value = '') => value.toLowerCase().trim().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function isWaterBusiness(workspace: BusinessWorkspace | null) {
  return !!workspace && ['daily-needs','daily-needs-and-grocery','daily-needs-grocery'].includes(key(workspace.categoryName)) &&
    [workspace.name,workspace.slug].some(value=>['water-cans','water-and-hydration','water-hydration','drinking-water'].includes(key(value)));
}
export const businessId=(value:any):string=>String(value?._id || value?.id || value || '');
export function orderInBusiness(order:any, productIds:string[]|null) {
  return !productIds || (order.items || []).some((item:any)=>productIds.includes(businessId(item.productId)));
}
