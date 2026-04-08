import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Leaf, Mail, ArrowRight, Package, Truck, Building2 } from 'lucide-react';
import PasswordInput from '../components/common/PasswordInput';

const STATS = [
    { value: '2,400+', label: 'Donations made' },
    { value: '180+', label: 'Active volunteers' },
    { value: '95%', label: 'Delivery rate' },
    { value: '12 NGOs', label: 'Partner organizations' },
];

const FEATURES = [
    { icon: Package, label: 'Donors', desc: 'Share surplus food instantly' },
    { icon: Truck, label: 'Volunteers', desc: 'Pick up and deliver donations' },
    { icon: Building2, label: 'NGOs', desc: 'Receive and distribute food' },
];

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async ({ email, password }) => {
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left — brand */}
            <div className="hidden lg:flex lg:w-[48%] gradient-brand flex-col justify-between p-12 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] rounded-full" />
                </div>

                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Leaf size={20} className="text-white" />
                    </div>
                    <div>
                        <span className="text-xl font-bold text-white">FoodCycle</span>
                        <span className="block text-green-200 text-[10px] font-semibold tracking-widest uppercase -mt-0.5">Platform</span>
                    </div>
                </div>

                <div className="relative space-y-8">
                    <div className="space-y-3">
                        <h1 className="text-4xl font-extrabold text-white leading-tight text-balance">
                            Reduce waste.<br />Feed communities.
                        </h1>
                        <p className="text-green-100 text-base leading-relaxed max-w-sm">
                            A real-time platform connecting food donors, volunteers, and NGOs to eliminate food waste and fight hunger.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        {STATS.map(({ value, label }) => (
                            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
                                <p className="text-2xl font-bold text-white">{value}</p>
                                <p className="text-green-200 text-xs font-medium mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Role pills */}
                    <div className="flex gap-2 flex-wrap">
                        {FEATURES.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                                <Icon size={12} /> {label}
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-green-200/60 text-xs">© 2025 FoodCycle. All rights reserved.</p>
            </div>

            {/* Right — form */}
            <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50">
                <div className="w-full max-w-[360px] animate-slide-up">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                            <Leaf size={16} className="text-white" />
                        </div>
                        <span className="text-lg font-bold text-green-700">FoodCycle</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
                        <p className="text-gray-500 text-sm mt-1.5">Welcome back — enter your credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="field-label">Email address</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="email" {...register('email', { required: 'Email is required' })}
                                    placeholder="you@example.com" className="field pl-9" autoComplete="email" />
                            </div>
                            {errors.email && <p className="field-error">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="field-label">Password</label>
                            <PasswordInput
                                {...register('password', { required: 'Password is required' })}
                                error={errors.password}
                            />
                            {errors.password && <p className="field-error">{errors.password.message}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In <ArrowRight size={15} />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors">
                                Create one free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
