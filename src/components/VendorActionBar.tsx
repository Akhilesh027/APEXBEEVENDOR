import { Boxes, CalendarDays, LayoutDashboard, PackagePlus, ShoppingBag, Truck } from 'lucide-react';
import { useBusinessWorkspace } from '../context/BusinessWorkspaceContext';
import { useVendor } from '../context/VendorContext';
import { isWaterBusiness } from '../services/businessPortal';
import { dailyNeedsSettings } from '../services/dailyNeedsWorkspace';

export function VendorActionBar() {
  const { selected } = useBusinessWorkspace();
  const { currentPage, setCurrentPage } = useVendor();
  const dailyNeeds = dailyNeedsSettings(selected);
  const water = isWaterBusiness(selected);
  const dairy = selected?.kind === 'dairy';
  const actions = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(selected?.kind === 'food' ? [] : [
      { id: 'orders-all', label: selected?.kind === 'flowers' ? 'Flower orders' : 'Orders', icon: ShoppingBag },
      { id: water ? 'water-stock' : dailyNeeds ? 'daily-needs-stock' : 'inventory-stock', label: selected?.kind === 'flowers' ? 'Flower stock' : 'Stock', icon: Boxes },
      ...(water || dairy ? [{ id: water ? 'water-deliveries' : 'dairy-deliveries', label: 'Delivery plan', icon: Truck }] : []),
      ...(dailyNeeds ? [{ id: 'daily-needs-quality', label: dailyNeeds.quality, icon: CalendarDays }] : []),
      { id: 'add-product', label: selected?.kind === 'flowers' ? 'Add flower item' : 'Add product', icon: PackagePlus, primary: true },
    ]),
  ];

  return <nav aria-label="Quick actions" className="pos-actions">
    {actions.map(({ id, label, icon: Icon, primary }) => <button key={id} type="button"
      aria-current={currentPage === id ? 'page' : undefined}
      className={`pos-action${primary ? ' pos-action-primary' : ''}`}
      onClick={() => setCurrentPage(id)}>
      <Icon size={17} aria-hidden="true" /><span>{label}</span>
    </button>)}
  </nav>;
}
