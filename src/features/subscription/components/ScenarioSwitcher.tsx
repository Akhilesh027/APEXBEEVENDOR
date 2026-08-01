import React from 'react';
import type { SubscriptionScenario } from '../types/subscription.types';

interface ScenarioSwitcherProps {
  currentScenario: SubscriptionScenario;
  onSelectScenario: (scenario: SubscriptionScenario) => void;
}

export const ScenarioSwitcher: React.FC<ScenarioSwitcherProps> = ({
  currentScenario,
  onSelectScenario
}) => {
  const scenarios: { id: SubscriptionScenario; label: string }[] = [
    { id: 'active', label: '1. Active POS Premium (Yearly, ₹2k Discount)' },
    { id: 'active_basic', label: '2. Active Basic (7 Days Left, 20% Off)' },
    { id: 'trial', label: '3. Free Trial Mode (5 Days Left)' },
    { id: 'expired', label: '4. Expired Plan (Features Locked)' },
    { id: 'pending', label: '5. Pending Payment Verification' },
    { id: 'paused', label: '6. Admin Paused Plan' },
    { id: 'multi_addons', label: '7. Active + 3 Add-on Services' },
    { id: 'failed', label: '8. Payment Failed (Past Due)' },
    { id: 'no_subscription', label: '9. No Subscription Assigned' },
    { id: 'cancelled', label: '10. Cancelled Subscription' }
  ];

  return (
    <div className="mb-6 p-4 rounded-2xl border border-amber-200 bg-amber-50/80 dark:bg-amber-950/40 dark:border-amber-800 text-left font-sans shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100 text-[10px] font-mono font-bold uppercase tracking-wider">
            🛠 QA Mock Scenario Switcher
          </span>
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            Test all 10 subscription states instantly in frontend verification mode.
          </p>
        </div>
        <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
          Current: <strong>?subscriptionScenario={currentScenario}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {scenarios.map((s) => {
          const isActive = currentScenario === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectScenario(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isActive
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
