import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { Leaf, User, Mail, ArrowRight, Package, Truck, Building2 } from 'lucide-react';
import PasswordInput from '../components/common/PasswordInput';

const ROLES = [
    { value: 'DONOR', label: 'Donor', desc: 'Share surplus food', icon: Package, color: 'emerald' },
    { value: 'VOLUNTEER', label: 'Volunteer', desc: 'Pick up & deliver', icon: Truck, color: 'blue' },
    { value: 'NGO', label: 'NGO', desc: 'Receive & distribute', icon: Building2, color: 'amber' },
];

const ROLE_ACTIVE = {
    emerald: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200',
    blue: 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
    amber: 'border-amber-500 bg-amber-50 ring-2 ring-amber-200',
};
const ROLE_ICON_BG = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
};

export default function Register() {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const selectedRole = watch('role');

    const onSubmit = async (values) => {
        try {
            await authService.register(values);
            toast.success('Account created — please sign in');
            navigate('/login');
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left */}
            <div className="hidden lg:flex lg:w-[45%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 0%, transparent 50%)' }} />
                <div className="relative flex items-center gap-2.5">
                    <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
                        <Leaf size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">FoodCycle</span>
                </div>
                <div className="relative space-y-6">
                    <h1 className="text-4xl font-extrabold text-white leading-tight">Join the movement.<br />Make an impact.</h1>
                    <p className="text-slate-400 text-sm leading-relaxed">Choose your role and start making a difference in your community today.</p>
                    <div className="space-y-3">
                        {ROLES.map(r => {
                            const Icon = r.icon;
                            return (
                                <div key={r.value} className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ROLE_ICON_BG[r.color]}`}>
                                        <Icon size={15} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{r.label}</p>
                                        <p className="text-xs text-slate-400">{r.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <p className="relative text-slate-500 text-xs">© 2025 FoodCycle.</p>
            </div>

            {/* Right */}
            <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50">
                <div className="w-full max-w-sm space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
                        <p className="text-gray-500 text-sm mt-1">Start making a difference today.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {[
                            { name: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
                            { name: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@example.com' },
                        ].map(({ name, label, type, icon: Icon, placeholder }) => (
                            <div key={name}>
                                <label className="field-label">{label}</label>
                                <div className="relative">
                                    <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type={type} placeholder={placeholder}
                                        {...register(name, { required: `${label} is required` })}
                                        className="field pl-9" />
                                </div>
                                {errors[name] && <p className="field-error">{errors[name].message}</p>}
                            </div>
                        ))}

                        <div>
                            <label className="field-label">Password</label>
                            <PasswordInput
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'At least 6 characters' },
                                })}
                                placeholder="Min. 6 characters"
                                error={errors.password}
                            />
                            {errors.password && <p className="field-error">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="field-label">I want to</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ROLES.map(r => (
                                    <label key={r.value}
                                        className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${selectedRole === r.value ? ROLE_ACTIVE[r.color] : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <input type="radio" value={r.value}
                                            {...register('role', { required: 'Select a role' })}
                                            className="sr-only" />
                                        <p className="text-xs font-bold text-gray-800">{r.label}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{r.desc}</p>
                                    </label>
                                ))}
                            </div>
                            {errors.role && <p className="field-error">{errors.role.message}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center mt-1">
                            {isSubmitting
                                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating…</span>
                                : <span className="flex items-center gap-2">Create Account <ArrowRight size={15} /></span>
                            }
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
