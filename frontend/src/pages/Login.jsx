import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react';

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
            {/* Left — brand panel */}
            <div className="hidden lg:flex lg:w-[45%] gradient-brand flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 0%, transparent 50%)' }} />
                <div className="relative">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <Leaf size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">FoodCycle</span>
                    </div>
                </div>
                <div className="relative space-y-5">
                    <h1 className="text-4xl font-extrabold text-white leading-tight text-balance">
                        Reduce waste.<br />Feed communities.
                    </h1>
                    <p className="text-green-100 text-base leading-relaxed max-w-sm">
                        Connect surplus food with people who need it most — through a network of donors, volunteers, and NGOs.
                    </p>
                    <div className="flex gap-8 pt-2">
                        {[['2,400+', 'Donations'], ['180+', 'Volunteers'], ['95%', 'Delivered']].map(([n, l]) => (
                            <div key={l}>
                                <p className="text-2xl font-bold text-white">{n}</p>
                                <p className="text-green-200 text-xs font-medium mt-0.5">{l}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="relative text-green-200 text-xs">© 2025 FoodCycle. All rights reserved.</p>
            </div>

            {/* Right — form */}
            <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50">
                <div className="w-full max-w-sm space-y-7">
                    <div className="lg:hidden flex items-center gap-2 mb-2">
                        <Leaf size={20} className="text-green-600" />
                        <span className="text-lg font-bold text-green-600">FoodCycle</span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
                        <p className="text-gray-500 text-sm mt-1">Welcome back — enter your credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="field-label">Email address</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" {...register('email', { required: 'Email is required' })}
                                    placeholder="you@example.com"
                                    className="field pl-9" />
                            </div>
                            {errors.email && <p className="field-error">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="field-label">Password</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="password" {...register('password', { required: 'Password is required' })}
                                    placeholder="••••••••"
                                    className="field pl-9" />
                            </div>
                            {errors.password && <p className="field-error">{errors.password.message}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting}
                            className="btn-primary w-full justify-center mt-2">
                            {isSubmitting
                                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</span>
                                : <span className="flex items-center gap-2">Sign In <ArrowRight size={15} /></span>
                            }
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-green-600 font-semibold hover:underline">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
