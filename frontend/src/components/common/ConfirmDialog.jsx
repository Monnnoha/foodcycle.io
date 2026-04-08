import { AlertTriangle, Loader } from 'lucide-react';
import { useEffect } from 'react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, danger = true, loading = false }) {
    useEffect(() => {
        const handler = (e) => e.key === 'Escape' && !loading && onCancel();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onCancel, loading]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => !loading && onCancel()} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 animate-scale-in">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <AlertTriangle size={22} className={danger ? 'text-red-600' : 'text-amber-600'} />
                </div>
                <div className="text-center space-y-1.5">
                    <h3 className="text-base font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className={`flex-1 btn text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                        {loading ? <Loader size={14} className="animate-spin" /> : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
