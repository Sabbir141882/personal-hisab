import React, { useState } from 'react';
import { FolderTree, Plus, Trash2 } from 'lucide-react';
import { Category } from '../../types/finance';
import { Modal } from '../common/Modal';

interface CategoriesModuleProps {
  categories: Category[];
  onSaveCategory: (categoryData: Partial<Category>) => void;
}

export const CategoriesModule: React.FC<CategoriesModuleProps> = ({
  categories,
  onSaveCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [purpose, setPurpose] = useState<'personal' | 'family' | 'office' | 'both'>('personal');
  const [color, setColor] = useState('#0284C7');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveCategory({
      name,
      type,
      purpose,
      icon: 'Tag',
      color,
      isCustom: true,
      isArchived: false,
      subcategories: [],
    });

    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-sky-600" />
            <span>Categories & Subcategories Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize personal, family, and official office expense hierarchy
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Category List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                  {cat.type}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 uppercase">
                  {cat.purpose}
                </span>
              </div>
            </div>

            {/* Subcategories */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Subcategories ({cat.subcategories?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cat.subcategories && cat.subcategories.length > 0 ? (
                  cat.subcategories.map((sub) => (
                    <span
                      key={sub.id}
                      className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-md font-medium"
                    >
                      {sub.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No subcategories created yet</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Custom Category" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Children Education, Vehicle Maintenance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose *</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as any)}
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
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-8 rounded border border-slate-300 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg">
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
