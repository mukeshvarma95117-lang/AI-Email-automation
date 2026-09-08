import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, UserPlus, UserCheck } from 'lucide-react';

export default function ContactModal({
  isOpen,
  onClose,
  onSave,
  contact = null,
  groups = []
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [groupId, setGroupId] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name || '');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setGroupId(contact.group_id ? String(contact.group_id) : '');

      const fields = [];
      const cf = contact.custom_fields || {};
      for (const [key, val] of Object.entries(cf)) {
        fields.push({ key, value: String(val) });
      }
      setCustomFields(fields);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setGroupId(groups[0]?.id ? String(groups[0].id) : '');
      setCustomFields([
        { key: 'event', value: 'AI Workshop' },
        { key: 'date', value: 'tomorrow' },
        { key: 'time', value: '10:00 AM' },
        { key: 'location', value: 'Lab 3B' }
      ]);
    }
  }, [contact, groups, isOpen]);

  if (!isOpen) return null;

  const handleAddField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveField = (index) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, prop, val) => {
    setCustomFields(prev => prev.map((f, i) => i === index ? { ...f, [prop]: val } : f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const customFieldsObj = {};
    for (const f of customFields) {
      if (f.key.trim()) {
        customFieldsObj[f.key.trim()] = f.value;
      }
    }

    try {
      await onSave({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        group_id: groupId ? Number(groupId) : null,
        custom_fields: customFieldsObj
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            {contact ? <UserCheck className="w-5 h-5 text-indigo-600" /> : <UserPlus className="w-5 h-5 text-indigo-600" />}
            <span>{contact ? 'Edit Contact' : 'Add New Contact'}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                placeholder="e.g. rahul@example.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +1 555-0192"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Cohort / Group</label>
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">No Group</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Custom Fields (For variables: {{event}}, {{date}}, etc.) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Custom Personalization Fields</h4>
                <p className="text-[11px] text-slate-400">Available as `{"{{field_name}}"}` template variables</p>
              </div>
              <button
                type="button"
                onClick={handleAddField}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add Field
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {customFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Field name (e.g. event)"
                    value={field.key}
                    onChange={e => handleFieldChange(idx, 'key', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-[11px]"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. AI Workshop)"
                    value={field.value}
                    onChange={e => handleFieldChange(idx, 'value', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {customFields.length === 0 && (
                <p className="text-[11px] text-slate-400 italic">No custom fields added yet.</p>
              )}
            </div>
          </div>

          <div className="px-6 py-4 -mx-6 -mb-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving ? 'Saving...' : (contact ? 'Update Contact' : 'Create Contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

