import { useState, useRef, useEffect } from 'react';
import { Settings2, Check } from 'lucide-react';

export default function EditableText({
  id,
  children,
  className = '',
  onChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(() => {
    try {
      const saved = localStorage.getItem(`editable_${id}`);
      return saved !== null ? saved : children;
    } catch {
      return children;
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
    const finalVal = draft.trim() || children;
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
          className="bg-white text-brand-ink-900 border border-brand-green-500 rounded px-1.5 py-0.5 outline-none focus:ring-2 ring-brand-green-200"
          style={{ width: `${Math.max(draft.length, 3) + 2}ch`, minWidth: '60px' }}
        />
        <button onMouseDown={(e) => e.preventDefault()} onClick={save} className="text-brand-green-600 hover:text-brand-green-700">
          <Check className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <span
      className={`group cursor-pointer inline-flex items-center gap-1.5 hover:text-brand-green-600 transition-colors ${className}`}
      onClick={() => { setDraft(val); setIsEditing(true); }}
      title="לחץ לעריכה"
    >
      <span>{val}</span>
      <Settings2 className="w-4 h-4 opacity-100 text-brand-ink-400 group-hover:text-brand-green-600 transition-colors" />
    </span>
  );
}
