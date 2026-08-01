import React from 'react';

interface DeliverySectionProps {
  policy: {
    homeDelivery: boolean;
    storePickup: boolean;
    sameDay: boolean;
    scheduled: boolean;
    fragile: boolean;
  };
  onChange: (policy: any) => void;
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({ policy, onChange }) => {
  const togglePolicy = (key: string) => {
    onChange({
      ...policy,
      [key]: !policy[key as keyof typeof policy],
    });
  };

  return (
    <div className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-3">
      <h4 className="font-semibold text-gray-800 dark:text-gray-200">Fulfillment & Delivery Rules</h4>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={policy.homeDelivery}
            onChange={() => togglePolicy('homeDelivery')}
            className="rounded text-amber-600 focus:ring-amber-500"
          />
          <span className="text-gray-700 dark:text-gray-300">Home Delivery Available</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={policy.storePickup}
            onChange={() => togglePolicy('storePickup')}
            className="rounded text-amber-600 focus:ring-amber-500"
          />
          <span className="text-gray-700 dark:text-gray-300">Store Pickup Available</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={policy.sameDay}
            onChange={() => togglePolicy('sameDay')}
            className="rounded text-amber-600 focus:ring-amber-500"
          />
          <span className="text-gray-700 dark:text-gray-300">Same Day Delivery</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={policy.scheduled}
            onChange={() => togglePolicy('scheduled')}
            className="rounded text-amber-600 focus:ring-amber-500"
          />
          <span className="text-gray-700 dark:text-gray-300">Scheduled Delivery</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={policy.fragile}
            onChange={() => togglePolicy('fragile')}
            className="rounded text-amber-600 focus:ring-amber-500"
          />
          <span className="text-gray-700 dark:text-gray-300 font-semibold text-red-600">
            Fragile / Care Required
          </span>
        </label>
      </div>
    </div>
  );
};
