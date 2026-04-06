import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const ROLES = ['DONOR', 'VOLUNTEER', 'NGO'];

export default function Register() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-green-600">FoodCycle</h1>
                    <p className="text-sm text-gray-500 mt-1">Create your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {[
                        { name: 'name', label: 'Full Name', type: 'text' },
                        { name: 'email', label: 'Email', type: 'email' },
                        { name: 'password', label: 'Password', type: 'password' },
                    ].map(({ name, label, type }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <input
                                type={type}
                                {...register(name, { required: `${label} is required` })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
                        </div>
                    ))}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            {...register('role', { required: 'Role is required' })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Select a role</option>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating account…' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-600 hover:underline font-medium">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
