import React, { useState } from 'react';
import { FolderTree, Plus, Tag } from 'lucide-react';
import { Category, Subcategory } from '../../types/finance';
import { Modal } from '../common/Modal';

interface CategoriesModuleProps {
  categories: Category[];
  onSaveCategory: (categoryData: Partial<Category>) => void;
  onSaveSubcategory?: (categoryId: string, subName: string) => void;
}

export const CategoriesModule: React.FC<CategoriesModuleProps> = ({
  categories,
  onSaveCategory,
  onSaveSubcategory,
}) => {
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedCatForSub, setSelectedCatForSub] = useState<string>('');

  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');
  const [catPurpose, setCatPurpose] = useState<'personal' | 'family' | 'office' | 'both'>('personal');
  const [catColor, setCatColor] = useState('#0284C7');

  const [subName, setSubName] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    onSaveCategory({
      name: catName,
      type: catType,
      purpose: catPurpose,
      icon: 'Tag',
      color: catColor,
      isCustom: true,
      isArchived: false,
      subcategories: [],
    });

    setCatName('');
    setIsCatModalOpen(false);
  };

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !selectedCatForSub) return;

    if (onSaveSubcategory) {
      onSaveSubcategory(selectedCatForSub, subName.trim());
    }

    setSubName('');
    setIsSubModalOpen(false);
  };

  const openSubModal = (categoryId: string) => {
    setSelectedCatForSub(categoryId);
    setIsSubModalOpen(true);
  };

  const filteredCategories = categories.filter((cat) => {
    if (filterType === 'all') return true;
    return cat.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-sky-600" />
            <span>Category & Subcategory Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            All 17 main categories and subcategories organized by Income and Expense
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({categories.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterType === 'expense' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterType === 'income' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Income
            </button>
          </div>

          <button
            onClick={() => setIsCatModalOpen(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Category List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || '#0284C7' }}
                />
                <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    cat.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {cat.type}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 uppercase">
                  {cat.purpose}
                </span>
              </div>
            </div>

            {/* Subcategories */}
            <div className="pt-2.5 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Subcategories ({cat.subcategories?.length || 0})
                </span>
                <button
                  onClick={() => openSubModal(cat.id)}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Subcategory</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {cat.subcategories && cat.subcategories.length > 0 ? (
                  cat.subcategories.map((sub) => (
                    <span
                      key={sub.id}
                      className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200/90 text-slate-700 rounded-lg font-medium shadow-2xs"
                    >
                      {sub.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No subcategories yet</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Main Category Modal */}
      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="Create Main Category" maxWidth="md">
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Children Education, Vehicle Maintenance"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
              <select
                value={catType}
                onChange={(e) => setCatType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose *</label>
              <select
                value={catPurpose}
                onChange={(e) => setCatPurpose(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="personal">Personal</option>
                <option value="family">Family</option>
                <option value="office">Office (Official Work)</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Theme Color</label>
            <input
              type="color"
              value={catColor}
              onChange={(e) => setCatColor(e.target.value)}
              className="w-16 h-8 rounded border border-slate-300 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCatModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg cursor-pointer">
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      {/* New Subcategory Modal */}
      <Modal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} title="Add Subcategory" maxWidth="sm">
        <form onSubmit={handleSubSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Main Category
            </label>
            <input
              type="text"
              disabled
              value={categories.find((c) => c.id === selectedCatForSub)?.name || ''}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategory Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Tuition Fee, Exam Fee"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsSubModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg cursor-pointer">
              Add Subcategory
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

