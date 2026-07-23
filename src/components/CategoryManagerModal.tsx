import React, { useState, useEffect } from 'react';
import { CustomCategories, DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../types/finance';
import { X, Tag, Plus, Trash2, Edit3, Check, RotateCcw, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CustomCategories;
  onSaveCategories: (newCategories: CustomCategories) => Promise<void>;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [expenseCats, setExpenseCats] = useState<string[]>([]);
  const [incomeCats, setIncomeCats] = useState<string[]>([]);
  
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setExpenseCats(categories.expense && categories.expense.length > 0 ? [...categories.expense] : [...DEFAULT_EXPENSE_CATEGORIES]);
    setIncomeCats(categories.income && categories.income.length > 0 ? [...categories.income] : [...DEFAULT_INCOME_CATEGORIES]);
  }, [categories, isOpen]);

  if (!isOpen) return null;

  const currentList = activeTab === 'expense' ? expenseCats : incomeCats;

  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;

    if (currentList.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setMessage({ text: `"${trimmed}" category already exists!`, type: 'error' });
      return;
    }

    if (activeTab === 'expense') {
      setExpenseCats([...expenseCats, trimmed]);
    } else {
      setIncomeCats([...incomeCats, trimmed]);
    }

    setNewCatInput('');
    setMessage({ text: `Added category "${trimmed}"`, type: 'success' });
  };

  const handleStartEdit = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const handleSaveEdit = (index: number) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;

    if (activeTab === 'expense') {
      const updated = [...expenseCats];
      updated[index] = trimmed;
      setExpenseCats(updated);
    } else {
      const updated = [...incomeCats];
      updated[index] = trimmed;
      setIncomeCats(updated);
    }

    setEditingIndex(null);
    setEditingText('');
  };

  const handleDeleteCategory = (index: number) => {
    if (currentList.length <= 1) {
      setMessage({ text: 'Must keep at least one category.', type: 'error' });
      return;
    }

    if (activeTab === 'expense') {
      setExpenseCats(expenseCats.filter((_, i) => i !== index));
    } else {
      setIncomeCats(incomeCats.filter((_, i) => i !== index));
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset categories back to original default presets?')) {
      if (activeTab === 'expense') {
        setExpenseCats([...DEFAULT_EXPENSE_CATEGORIES]);
      } else {
        setIncomeCats([...DEFAULT_INCOME_CATEGORIES]);
      }
      setMessage({ text: 'Reset to default categories.', type: 'success' });
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      await onSaveCategories({
        expense: expenseCats,
        income: incomeCats,
      });
      setIsSaving(false);
      setMessage({ text: 'Custom categories saved successfully for all transactions!', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error(err);
      setIsSaving(false);
      setMessage({ text: err?.message || 'Failed to save custom categories.', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="theme-modal border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <span>Custom Category Manager</span>
              </h2>
              <p className="text-xs theme-text-muted">
                Add, edit, or customize transaction categories across the entire app
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 theme-subtle-btn rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`px-6 pt-4 text-xs font-semibold ${
            message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
            }`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
            </div>
          </div>
        )}

        {/* Expense vs Income Tab Switcher */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('expense');
                setEditingIndex(null);
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'theme-text-muted hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Expense Categories ({expenseCats.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('income');
                setEditingIndex(null);
              }}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'income'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'theme-text-muted hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Income Categories ({incomeCats.length})</span>
            </button>
          </div>
        </div>

        {/* Add New Category Field */}
        <div className="px-6 py-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Add new ${activeTab} category...`}
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              className="flex-1 theme-input border focus:border-indigo-500 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
            />
            <button
              onClick={handleAddCategory}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-1 shrink-0 ${
                activeTab === 'expense' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Category List */}
        <div className="p-6 pt-2 space-y-2 max-h-[40vh] overflow-y-auto">
          {currentList.map((cat, idx) => (
            <div
              key={`${cat}_${idx}`}
              className="theme-card border rounded-xl p-2.5 flex items-center justify-between gap-2 group hover:border-indigo-500/40 transition"
            >
              {editingIndex === idx ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 theme-input border border-indigo-500 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(idx)}
                    className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-xs font-bold theme-text pl-1 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 theme-text-muted" />
                    <span>{cat}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(idx, cat)}
                      className="p-1.5 text-slate-400 hover:text-indigo-500 transition rounded-lg"
                      title="Edit Category Name"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t flex items-center justify-between gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold transition"
            title="Reset to default presets"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 theme-subtle-btn rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-900/20 transition"
            >
              {isSaving ? 'Saving...' : 'Apply Category Changes'}
            </button>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};
