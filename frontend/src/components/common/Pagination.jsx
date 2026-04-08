import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    const end = Math.min(totalPages, start + 5);
    for (let i = start; i < end; i++) pages.push(i);

    return (
        <div className="flex items-center justify-center gap-1 mt-4">
            <button onClick={() => onChange(page - 1)} disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors text-gray-600">
                <ChevronLeft size={14} />
            </button>
            {pages.map(p => (
                <button key={p} onClick={() => onChange(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${p === page ? 'gradient-brand text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {p + 1}
                </button>
            ))}
            <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors text-gray-600">
                <ChevronRight size={14} />
            </button>
        </div>
    );
}
