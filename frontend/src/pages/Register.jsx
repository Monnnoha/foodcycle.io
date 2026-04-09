import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import {
    Leaf, User, Mail, ArrowRight, ArrowLeft,
    Package, Truck, Building2, Phone, MapPin,
    Hash, CheckCircle
} from 'lucide-react';
import PasswordInput from '../components/common/PasswordInput';

/* ── Role definitions ── */
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

/* ── Password strength ── */
function PasswordStrength({ password = '' }) {
    const checks = [
        { label: '6+ characters', ok: password.length >= 6 },
        { label: 'Uppercase', ok: /[A-Z]/.test(password) },
        { label: 'Number', ok: /\d/.test(password) },
        { label: 'Symbol', ok: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    if (!password) return null;
    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : 'bg-gray-100'}`} />
                ))}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    {checks.map(c => (
                        <span key={c.label} className={`text-[10px] font-medium flex items-center gap-0.5 ${c.ok ? 'text-emerald-600' : 'text-gray-400'}`}>
                            <CheckCircle size={9} className={c.ok ? 'text-emerald-500' : 'text-gray-300'} />
                            {c.label}
                        </span>
                    ))}
                </div>
                {score > 0 && <span className={`text-[10px] font-bold ${score >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>{labels[score]}</span>}
            </div>
        </div>
    );
}

/* ── Step 1: Base fields (all roles) ── */
function StepBase({ register, errors, watch, selectedRole, setSelectedRole }) {
    const password = watch('password', '');
    return (
        <div className="space-y-4">
            <div>
                <label className="field-label">Full Name *</label>
                <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('name', { required: 'Name is required' })}
                        placeholder="John Doe" className="field pl-9" />
                </div>
                {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>

            <div>
                <label className="field-label">Email *</label>
                <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" {...register('email', { required: 'Email is required' })}
                        placeholder="you@example.com" className="field pl-9" />
                </div>
                {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
                <label className="field-label">Phone</label>
                <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" {...register('phone')}
                        placeholder="+91 98765 43210" className="field pl-9" />
                </div>
            </div>

            <div>
                <label className="field-label">Password *</label>
                <PasswordInput {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                })} placeholder="Min. 6 characters" error={errors.password} />
                {errors.password && <p className="field-error">{errors.password.message}</p>}
                <PasswordStrength password={password} />
            </div>

            <div>
                <label className="field-label">I am a *</label>
                <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(r => (
                        <label key={r.value}
                            className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${selectedRole === r.value ? ROLE_ACTIVE[r.color] : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <input type="radio" value={r.value}
                                {...register('role', { required: 'Select a role' })}
                                className="sr-only"
                                onChange={() => setSelectedRole(r.value)} />
                            <r.icon size={16} className="mx-auto mb-1 text-gray-500" />
                            <p className="text-xs font-bold text-gray-800">{r.label}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{r.desc}</p>
                        </label>
                    ))}
                </div>
                {errors.role && <p className="field-error">{errors.role.message}</p>}
            </div>
        </div>
    );
}

/* ── Step 2: NGO details ── */
function StepNGO({ register, errors }) {
    return (
        <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
                NGO accounts require verification. You can start using the platform immediately — full access is granted after admin review.
            </div>

            <div>
                <label className="field-label">Organization Name *</label>
                <div className="relative">
                    <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('orgName', { required: 'Organization name is required' })}
                        placeholder="e.g. Helping Hands Foundation" className="field pl-9" />
                </div>
                {errors.orgName && <p className="field-error">{errors.orgName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="field-label">Registration Number</label>
                    <div className="relative">
                        <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input {...register('regNumber')} placeholder="NGO/2024/001" className="field pl-9" />
                    </div>
                </div>
                <div>
                    <label className="field-label">City *</label>
                    <div className="relative">
                        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input {...register('city', { required: 'City is required' })}
                            placeholder="Mumbai" className="field pl-9" />
                    </div>
                    {errors.city && <p className="field-error">{errors.city.message}</p>}
                </div>
            </div>

            <div>
                <label className="field-label">Organization Address</label>
                <textarea rows={2} {...register('address')}
                    placeholder="Full address of your organization"
                    className="field resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="field-label">Years Operating</label>
                    <input type="number" min="0" {...register('yearsOp')}
                        placeholder="e.g. 5" className="field" />
                </div>
                <div>
                    <label className="field-label">Volunteer Count</label>
                    <input type="number" min="0" {...register('volunteerCount')}
                        placeholder="e.g. 20" className="field" />
                </div>
            </div>
        </div>
    );
}

/* ── Step 2: Volunteer details ── */
function StepVolunteer({ register, errors }) {
    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-medium">
                Volunteers are connected to NGOs. Provide your NGO's unique ID to link your account.
            </div>

            <div>
                <label className="field-label">NGO User ID *</label>
                <div className="relative">
                    <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" {...register('ngoUserId', { required: 'NGO User ID is required', min: 1 })}
                        placeholder="Ask your NGO coordinator" className="field pl-9" />
                </div>
                {errors.ngoUserId && <p className="field-error">{errors.ngoUserId.message}</p>}
                <p className="text-xs text-gray-400 mt-1">Find this on the NGO's Profile page under User ID.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="field-label">Vehicle Type</label>
                    <select {...register('vehicleType')} className="field">
                        <option value="">Select</option>
                        {['Bicycle', 'Motorcycle', 'Car', 'Van', 'Truck', 'On Foot'].map(v => (
                            <option key={v}>{v}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="field-label">Vehicle Number</label>
                    <input {...register('vehicleNumber')} placeholder="MH 01 AB 1234" className="field" />
                </div>
            </div>

            <div>
                <label className="field-label">City *</label>
                <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('city', { required: 'City is required' })}
                        placeholder="Mumbai" className="field pl-9" />
                </div>
                {errors.city && <p className="field-error">{errors.city.message}</p>}
            </div>
        </div>
    );
}

/* ── Step 2: Donor details ── */
function StepDonor({ register, errors, watch }) {
    const donorType = watch('donorType');
    return (
        <div className="space-y-4">
            <div>
                <label className="field-label">Donor Type *</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: 'individual', label: 'Individual', desc: 'Personal donations' },
                        { value: 'restaurant', label: 'Restaurant', desc: 'Food business' },
                        { value: 'hotel', label: 'Hotel', desc: 'Hospitality' },
                        { value: 'catering', label: 'Catering', desc: 'Event catering' },
                    ].map(t => (
                        <label key={t.value}
                            className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${donorType === t.value ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <input type="radio" value={t.value}
                                {...register('donorType', { required: 'Select donor type' })}
                                className="sr-only" />
                            <p className="text-xs font-bold text-gray-800">{t.label}</p>
                            <p className="text-[10px] text-gray-400">{t.desc}</p>
                        </label>
                    ))}
                </div>
                {errors.donorType && <p className="field-error">{errors.donorType.message}</p>}
            </div>

            {donorType && donorType !== 'individual' && (
                <div>
                    <label className="field-label">Business Name *</label>
                    <div className="relative">
                        <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input {...register('orgName', { required: donorType !== 'individual' ? 'Business name is required' : false })}
                            placeholder="e.g. Taj Hotel" className="field pl-9" />
                    </div>
                    {errors.orgName && <p className="field-error">{errors.orgName.message}</p>}
                </div>
            )}

            <div>
                <label className="field-label">City *</label>
                <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('city', { required: 'City is required' })}
                        placeholder="Mumbai" className="field pl-9" />
                </div>
                {errors.city && <p className="field-error">{errors.city.message}</p>}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" {...register('safetyDecl', { required: 'Please confirm food safety compliance' })}
                    className="mt-0.5 accent-emerald-600" />
                <span className="text-xs text-gray-600 leading-relaxed">
                    I confirm that all food I donate is safe for consumption, properly stored, and within expiry date. I comply with applicable food safety regulations.
                </span>
            </label>
            {errors.safetyDecl && <p className="field-error">{errors.safetyDecl.message}</p>}
        </div>
    );
}

/* ── Main Register page ── */
export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState('');

    const { register, handleSubmit, watch, trigger, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (values) => {
        try {
            const payload = {
                name: values.name,
                email: values.email,
                password: values.password,
                role: values.role,
                phone: values.phone || undefined,
                orgName: values.orgName || undefined,
            };
            await authService.register(payload);
            toast.success('Account created — please sign in');
            navigate('/login');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const nextStep = async () => {
        const valid = await trigger(['name', 'email', 'password', 'role']);
        if (valid && selectedRole) setStep(2);
    };

    const hasStep2 = ['NGO', 'VOLUNTEER', 'DONOR'].includes(selectedRole);

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-[42%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 0%, transparent 50%)' }} />
                <div className="relative flex items-center gap-2.5">
                    <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
                        <Leaf size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">FoodCycle</span>
                </div>
                <div className="relative space-y-6">
                    <h1 className="text-4xl font-extrabold text-white leading-tight">
                        Join the movement.<br />Make an impact.
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Choose your role and start making a difference in your community today.
                    </p>
                    <div className="space-y-3">
                        {ROLES.map(r => (
                            <div key={r.value} className={`flex items-center gap-3 rounded-xl p-3.5 transition-all ${selectedRole === r.value ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/5'}`}>
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                    <r.icon size={15} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{r.label}</p>
                                    <p className="text-xs text-slate-400">{r.desc}</p>
                                </div>
                                {selectedRole === r.value && <CheckCircle size={14} className="text-emerald-400 ml-auto shrink-0" />}
                            </div>
                        ))}
                    </div>
                </div>
                <p className="relative text-slate-500 text-xs">© 2025 FoodCycle.</p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50 overflow-y-auto">
                <div className="w-full max-w-sm space-y-6">
                    {/* Step indicator */}
                    {hasStep2 && (
                        <div className="flex items-center gap-2">
                            {[1, 2].map(s => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'gradient-brand text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        {step > s ? '✓' : s}
                                    </div>
                                    {s < 2 && <div className={`h-0.5 w-8 rounded transition-all ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
                                </div>
                            ))}
                            <span className="text-xs text-gray-400 ml-1">
                                {step === 1 ? 'Basic info' : `${selectedRole} details`}
                            </span>
                        </div>
                    )}

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {step === 1 ? 'Create account' : `${selectedRole === 'NGO' ? 'Organization' : selectedRole === 'VOLUNTEER' ? 'Volunteer' : 'Donor'} details`}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {step === 1 ? 'Start making a difference today.' : 'A few more details to complete your profile.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {step === 1 && (
                            <StepBase register={register} errors={errors} watch={watch}
                                selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
                        )}
                        {step === 2 && selectedRole === 'NGO' && <StepNGO register={register} errors={errors} />}
                        {step === 2 && selectedRole === 'VOLUNTEER' && <StepVolunteer register={register} errors={errors} />}
                        {step === 2 && selectedRole === 'DONOR' && <StepDonor register={register} errors={errors} watch={watch} />}

                        <div className="flex gap-3">
                            {step === 2 && (
                                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
                                    <ArrowLeft size={14} /> Back
                                </button>
                            )}
                            {step === 1 && hasStep2 ? (
                                <button type="button" onClick={nextStep} className="btn-primary flex-1 justify-center flex items-center gap-2">
                                    Next <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center flex items-center gap-2">
                                    {isSubmitting
                                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
                                        : <>Create Account <ArrowRight size={14} /></>
                                    }
                                </button>
                            )}
                        </div>
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
