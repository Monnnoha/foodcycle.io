import { STATUS_STYLES } from '../../lib/constants';

export default function StatusBadge({ status, size = 'sm' }) {
    const s = STATUS_STYLES[status] ?? { badge: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${s.badge} ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'}`}>
            <span className={`rounded-full shrink-0 ${s.dot} ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
            {status}
        </span>
    );
}
