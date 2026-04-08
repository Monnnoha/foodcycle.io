export default function EmptyState({ icon: Icon, title, sub, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <Icon size={26} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-600">{title}</p>
            {sub && <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">{sub}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
