import type { BusinessWorkspace } from './workspaceService';

export const dailyNeedsViews = {
  produce: {
    title: 'Fruits & Vegetables', catalog: 'Produce Catalog', add: 'Add Produce',
    stock: 'Produce Stock & Spoilage', quality: 'Freshness & Grading', reports: 'Produce Reports',
    description: 'Track fresh produce, grades, storage checks, and stock lost to spoilage.',
  },
  grocery: {
    title: 'Grocery', catalog: 'Grocery Catalog', add: 'Add Grocery Item',
    stock: 'Grocery Batches & Expiry', quality: 'Batch & Expiry Checks', reports: 'Grocery Reports',
    description: 'Manage packaged stock, batch expiry, replenishment, and order fulfilment.',
  },
  organic: {
    title: 'Organic & Healthy Foods', catalog: 'Organic Food Catalog', add: 'Add Organic Food',
    stock: 'Organic Stock & Expiry', quality: 'Certification Records', reports: 'Organic Food Reports',
    description: 'Track food batches, expiry, supplier information, and certification records.',
  },
} as const;

export type DailyNeedsProfile = keyof typeof dailyNeedsViews;
export const flowerView = {
  title: 'Flowers and Garlands', catalog: 'Flower & Garland Catalog', add: 'Add Flower or Garland',
  stock: 'Flower Stock & Wastage', quality: 'Freshness & Grading', reports: 'Flower Sales & Wastage',
  description: 'Prepare garland orders, receive fresh flowers, grade batches, and track wastage.',
};
export const dailyNeedsSettings = (workspace: BusinessWorkspace | null) =>
  workspace?.kind === 'flowers' ? flowerView : workspace?.dailyNeedsProfile ? dailyNeedsViews[workspace.dailyNeedsProfile] : undefined;
