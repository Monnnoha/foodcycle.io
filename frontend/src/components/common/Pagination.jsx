export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
                Previous
            </button>
            <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
            </span>
            <button
                onClick={() => onChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
                Next
            </button>
        </div>
    );
}
