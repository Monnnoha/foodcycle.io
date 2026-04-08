import { useState, forwardRef } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const PasswordInput = forwardRef(function PasswordInput(
    { placeholder = '••••••••', error, ...props },
    ref
) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
            <input
                ref={ref}
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                autoComplete="current-password"
                className={`field pl-9 pr-10 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                {...props}
            />
            <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded"
                aria-label={show ? 'Hide password' : 'Show password'}
            >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    );
});

export default PasswordInput;
