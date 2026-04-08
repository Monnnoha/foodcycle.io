import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { ROLE_STYLES } from '../lib/constants';
import { Users as UsersIcon, Search } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

export default function Users() {
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['users', page],
        queryFn: () => userService.getAll(page, 20),
    });

    const users = (data?.content ?? data ?? []).filter(u =>
        !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = data?.totalPages ?? 0;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-sm text-gray-500 mt-0.5">All registered platform users</p>
                </div>
            </div>

            <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm" />
            </div>

            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="divide-y divide-gray-50">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
                                    <div className="h-3 bg-gray-100 rounded w-48 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <EmptyState icon={UsersIcon} title="No users found" />
                ) : (
                    <div className="divide-y divide-gray-50">
                        {users.map(u => (
                            <div key={u.userId} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {u.email?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{u.name || u.email?.split('@')[0]}</p>
                                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {u.phone && <p className="text-xs text-gray-400 hidden sm:block">{u.phone}</p>}
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ROLE_STYLES[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {u.role}
                                    </span>
                                    <p className="text-xs text-gray-400 hidden md:block">ID: {u.userId}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}
