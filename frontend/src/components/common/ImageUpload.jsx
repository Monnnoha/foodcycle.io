import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

const MAX_SIZE_MB = 5;

export default function ImageUpload({ value, onChange, label = 'Photo (optional)' }) {
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const validate = (file) => {
        if (!file.type.startsWith('image/')) { setError('Only image files are allowed.'); return false; }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) { setError(`File must be under ${MAX_SIZE_MB}MB.`); return false; }
        setError('');
        return true;
    };

    const handle = useCallback((file) => {
        if (!file || !validate(file)) return;
        onChange({ file, preview: URL.createObjectURL(file) });
    }, [onChange]);

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files[0]);
    };

    const clear = (e) => {
        e.stopPropagation();
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div>
            <label className="field-label">{label}</label>

            <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !value && inputRef.current?.click()}
                className={`relative w-full rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden
                    ${value ? 'border-transparent cursor-default' : 'cursor-pointer'}
                    ${dragging ? 'border-green-400 bg-green-50 scale-[1.01]' : value ? '' : 'border-gray-200 hover:border-green-300 hover:bg-green-50/40'}
                `}
                style={{ minHeight: '120px' }}
            >
                {value?.preview ? (
                    <div className="relative group">
                        <img src={value.preview} alt="preview"
                            className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <button onClick={clear}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-800 rounded-full p-1.5 shadow-lg hover:bg-red-50 hover:text-red-600">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                            {value.file?.name?.slice(0, 24)}{value.file?.name?.length > 24 ? '…' : ''}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2.5 py-8 px-4 text-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${dragging ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {dragging ? <Upload size={20} className="text-green-600" /> : <ImageIcon size={20} className="text-gray-400" />}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">
                                {dragging ? 'Drop image here' : 'Upload food image'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Drag & drop or click · JPG, PNG, WEBP · Max {MAX_SIZE_MB}MB</p>
                        </div>
                    </div>
                )}

                <input ref={inputRef} type="file" accept="image/*" className="sr-only"
                    onChange={e => handle(e.target.files[0])} />
            </div>

            {error && <p className="field-error mt-1">{error}</p>}
        </div>
    );
}
