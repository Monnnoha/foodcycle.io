export const FOOD_TYPES = ['Grains', 'Vegetables', 'Fruits', 'Cooked Food', 'Dairy', 'Bakery', 'Beverages', 'Other'];
export const STATUSES = ['AVAILABLE', 'REQUESTED', 'PICKED', 'DELIVERED', 'EXPIRED'];

export const STATUS_STYLES = {
    AVAILABLE: { badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
    REQUESTED: { badge: 'bg-amber-100  text-amber-700  ring-1 ring-amber-200', dot: 'bg-amber-500' },
    PICKED: { badge: 'bg-blue-100   text-blue-700   ring-1 ring-blue-200', dot: 'bg-blue-500' },
    DELIVERED: { badge: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200', dot: 'bg-purple-500' },
    EXPIRED: { badge: 'bg-red-100    text-red-700    ring-1 ring-red-200', dot: 'bg-red-500' },
};

export const ROLE_STYLES = {
    ADMIN: 'bg-purple-100 text-purple-700',
    DONOR: 'bg-emerald-100 text-emerald-700',
    VOLUNTEER: 'bg-blue-100 text-blue-700',
    NGO: 'bg-amber-100 text-amber-700',
};
