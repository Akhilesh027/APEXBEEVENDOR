import React from 'react';
import { VendorProvider, useVendor } from './context/VendorContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import  {ProductManagement}  from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Orders } from './pages/Orders';
import { Delivery } from './pages/Delivery';
import { WalletPage } from './pages/Wallet';
import { Withdrawals } from './pages/Withdrawals';
import { Referrals } from './pages/Referrals';
import { BusinessProfile } from './pages/BusinessProfile';
import { Reports } from './pages/Reports';
import { Support } from './pages/Support';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EarningsCommissions } from './pages/EarningsCommissions';
import { ReviewsRatings } from './pages/ReviewsRatings';
import { StoreDesign } from './pages/StoreDesign';
import { ReturnsRefunds } from './pages/ReturnsRefunds';
import { MarketDemand } from './pages/MarketDemand';
import { ProcurementHub } from './pages/ProcurementHub';
import { SubscriptionManagement } from './pages/SubscriptionManagement';

// Partner Portal Pages
import { QRManagement } from './pages/QRManagement';
import { ScheduledDelivery } from './pages/ScheduledDelivery';
import { CustomerManagement } from './pages/CustomerManagement';
import { SupplyChainHub } from './pages/SupplyChainHub';
import { QuotationManagement } from './pages/QuotationManagement';
import { SupplierNetwork } from './pages/SupplierNetwork';
import { ManufacturerConnect } from './pages/ManufacturerConnect';
import { TerritoryCoverage } from './pages/TerroryCoverage';
import { DemandForecasting } from './pages/DemandForecasting';
import { CreditManagement } from './pages/CreditManagement';
import { MyNetwork } from './pages/MyNetwork';
import { KYCCompliance } from './pages/KYCCompliance';
import { FranchiseRelationship } from './pages/FranchiseRelationship';
import { CommissionCenter } from './pages/CommissionCenter';
import { StaffManagement } from './pages/StaffManagement';
import { CouponsOffers } from './pages/CouponsOffers';
import { Advertisement } from './pages/Advertisement';
import { SecuritySettings } from './pages/SecuritySettings';
import { Training } from './pages/Training';
import { NotificationsList } from './pages/NotificationsList';

// New BOS Modules
import { B2BMarketplace } from './pages/B2BMarketplace';
import { QRMerchantCenter } from './pages/QRMerchantCenter';
import { CRMLeadCenter } from './pages/CRMLeadCenter';
import { AIBusinessInsights } from './pages/AIBusinessInsights';
import { HyperlocalGrowth } from './pages/HyperlocalGrowth';
import { EntrepreneurNetwork } from './pages/EntrepreneurNetwork';
import { FranchiseConnect } from './pages/FranchiseConnect';
import { BusinessAcademy } from './pages/BusinessAcademy';

const MainLayout: React.FC = () => {
  const { currentPage, isAuthenticated, authPage } = useVendor();

  if (!isAuthenticated) {
    if (authPage === 'register') {
      return <Register />;
    }
    return <Login />;
  }

  const renderActivePage = () => {
    if (currentPage === 'dashboard') {
      return <Dashboard />;
    }

    if (['profile', 'bank', 'documents'].includes(currentPage)) {
      return <BusinessProfile />;
    }

    if (['kyc', 'kyc-compliance'].includes(currentPage)) {
      return <KYCCompliance />;
    }

    if (currentPage === 'store-design') {
      return <StoreDesign />;
    }

    if (['add-product', 'products-all', 'products-draft', 'products-pending', 'products-awaiting-vendor', 'products-approved', 'products-rejected', 'products-change-requests'].includes(currentPage)) {
      return <ProductManagement />;
    }

    if (['inventory-stock', 'inventory-low', 'inventory-out'].includes(currentPage)) {
      return <Inventory />;
    }

    if (['orders-new', 'orders-all', 'orders-localshop', 'orders-subscriptions', 'orders-returns'].includes(currentPage)) {
      return <Orders />;
    }

    if (['delivery-agents', 'delivery-assign'].includes(currentPage)) {
      return <Delivery />;
    }

    if (currentPage === 'wallet-dashboard') {
      return <WalletPage />;
    }

    if (currentPage === 'withdrawals-request') {
      return <Withdrawals />;
    }

    if (currentPage === 'referrals') {
      return <Referrals />;
    }

    if (['reports-sales', 'reports-products', 'reports-earnings', 'reports-inventory'].includes(currentPage)) {
      return <Reports />;
    }

    if (['earnings-breakdown', 'earnings-products', 'earnings-settlements', 'earnings-upcoming', 'earnings-reports'].includes(currentPage)) {
      return <EarningsCommissions />;
    }

    if (['reviews-products', 'reviews-store', 'reviews-analytics'].includes(currentPage)) {
      return <ReviewsRatings />;
    }

    if (currentPage === 'returns-refunds') {
      return <ReturnsRefunds />;
    }

    if (currentPage === 'market-demand') {
      return <MarketDemand />;
    }

    if (currentPage === 'procurement-hub') {
      return <ProcurementHub />;
    }

    if (currentPage === 'support') {
      return <Support />;
    }

    // Unified Business Partner Portal bindings
    if (currentPage === 'qr-management') {
      return <QRManagement />;
    }

    if (currentPage === 'scheduled-delivery') {
      return <ScheduledDelivery />;
    }

    if (currentPage === 'subscriptions') {
      return <SubscriptionManagement />;
    }

    if (currentPage === 'customer-management') {
      return <CustomerManagement />;
    }

    if (currentPage === 'supply-chain') {
      return <SupplyChainHub />;
    }

    if (currentPage === 'quotation-management') {
      return <QuotationManagement />;
    }

    if (currentPage === 'supplier-network') {
      return <SupplierNetwork />;
    }

    if (currentPage === 'manufacturer-connect') {
      return <ManufacturerConnect />;
    }

    if (currentPage === 'territory-coverage') {
      return <TerritoryCoverage />;
    }

    if (currentPage === 'demand-forecasting') {
      return <DemandForecasting />;
    }

    if (currentPage === 'credit-management') {
      return <CreditManagement />;
    }

    if (currentPage === 'my-network') {
      return <MyNetwork />;
    }

    if (currentPage === 'franchise') {
      return <FranchiseRelationship />;
    }

    if (currentPage === 'settlements') {
      return <CommissionCenter />;
    }

    if (currentPage === 'staff-management') {
      return <StaffManagement />;
    }

    if (currentPage === 'coupons') {
      return <CouponsOffers />;
    }

    if (currentPage === 'advertisement') {
      return <Advertisement />;
    }

    if (currentPage === 'security') {
      return <SecuritySettings />;
    }

    if (currentPage === 'training') {
      return <Training />;
    }

    if (currentPage === 'notifications-list') {
      return <NotificationsList />;
    }

    // New BOS Route Switchers
    if (['b2b', 'b2b-buy', 'b2b-sell', 'b2b-rfq', 'b2b-deals', 'b2b-wholesalers', 'b2b-manufacturers', 'b2b-procurements', 'b2b-quotations', 'b2b-pos', 'b2b-trading'].includes(currentPage)) {
      return <B2BMarketplace />;
    }

    if (['qr', 'qr-my', 'qr-txns', 'qr-analytics', 'qr-settlements', 'qr-customers', 'qr-cashback', 'qr-referrals', 'qr-growth'].includes(currentPage)) {
      return <QRMerchantCenter />;
    }

    if (['crm', 'crm-vendor', 'crm-wholesaler', 'crm-manufacturer', 'crm-service', 'crm-franchise', 'crm-followups', 'crm-tasks', 'crm-conversions', 'crm-sources'].includes(currentPage)) {
      return <CRMLeadCenter />;
    }

    if (['ai', 'ai-bestsellers', 'ai-deadinventory', 'ai-reorders', 'ai-forecast', 'ai-customertrends', 'ai-seasonal', 'ai-predictions'].includes(currentPage)) {
      return <AIBusinessInsights />;
    }

    if (['hl', 'hl-coverage', 'hl-district', 'hl-mandal', 'hl-penetration', 'hl-competitors', 'hl-expansion'].includes(currentPage)) {
      return <HyperlocalGrowth />;
    }

    if (['ent', 'ent-associated', 'ent-acquisition', 'ent-sales', 'ent-incentives', 'ent-performance', 'ent-leaderboard'].includes(currentPage)) {
      return <EntrepreneurNetwork />;
    }

    if (['fc', 'fc-state', 'fc-district', 'fc-mandal', 'fc-support', 'fc-marketing', 'fc-expansion', 'fc-contacts'].includes(currentPage)) {
      return <FranchiseConnect />;
    }

    if (['business-academy', 'acad-photography', 'acad-inventory', 'acad-sales', 'acad-marketing', 'acad-customer', 'acad-gst', 'acad-franchise', 'acad-entrepreneurship', 'acad-certs'].includes(currentPage)) {
      return <BusinessAcademy />;
    }

    return <Dashboard />;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Navbar */}
        <Navbar />

        {/* Dynamic page container */}
        <main className="flex-1 overflow-y-auto min-w-0 no-scrollbar bg-background">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <VendorProvider>
      <MainLayout />
    </VendorProvider>
  );
}

export default App;
