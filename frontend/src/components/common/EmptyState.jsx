export default function EmptyState({ icon: Icon, title, sub, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Icon size={28} className="text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700">{title}</p>
            {sub && <p className="text-sm text-gray-400 mt-1 max-w-xs">{sub}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
