import { useState, useRef, useEffect } from 'react';
import { Settings2, Check } from 'lucide-react';
import { useAdmin } from '../admin/AdminContext.jsx';

export default function EditableText({
  id,
  children,
  defaultVal,
  className = '',
  onChange,
}) {
  const { isAdmin } = useAdmin();
  const fallback = defaultVal ?? children ?? '';
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(() => {
    try {
      const saved = localStorage.getItem(`editable_${id}`);
      return saved !== null ? saved : fallback;
    } catch {
      return fallback;
    }
  });
  const [draft, setDraft] = useState(val);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const save = () => {
    setIsEditing(false);
    const finalVal = draft.trim() || fallback;
    setVal(finalVal);
    try {
      localStorage.setItem(`editable_${id}`, finalVal);
    } catch {}
    if (onChange) onChange(finalVal);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') {
      setDraft(val);
      setIsEditing(false);
    }
  };

  if (!isAdmin) {
    return <span className={className}>{val}</span>;
  }

  if (isEditing) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className="bg-white text-brand-ink-900 border border-brand-green-500 rounded-lg px-2 py-1 outline-none focus:ring-2 ring-brand-green-200"
          style={{ width: `${Math.max(draft.length, 3) + 2}ch`, minWidth: '80px', maxWidth: 'min(90vw, 520px)' }}
        />
        <button onMouseDown={(e) => e.preventDefault()} onClick={save} className="text-brand-green-600 hover:text-brand-green-700">
          <Check className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <span
      className={`group cursor-pointer inline-flex items-center gap-1.5 rounded-md bg-brand-green-50/70 px-1.5 py-0.5 ring-1 ring-brand-green-200 hover:text-brand-green-700 transition-colors ${className}`}
      onClick={(e) => { e.stopPropagation(); setDraft(val); setIsEditing(true); }}
      title="עריכת טקסט"
    >
      <span>{val}</span>
      <Settings2 className="w-3.5 h-3.5 text-brand-green-600" />
    </span>
  );
}
