import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import ContactModal from '../components/contacts/ContactModal';
import CsvImportModal from '../components/contacts/CsvImportModal';
import GroupModal from '../components/contacts/GroupModal';

import {
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  FolderPlus,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Tag,
  Plus
} from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [contactsRes, groupsRes] = await Promise.all([
        api.getContacts({ search: searchQuery, group_id: selectedGroup }),
        api.getGroups()
      ]);
      setContacts(contactsRes.contacts || []);
      setGroups(groupsRes.groups || []);
    } catch (err) {
      error(err.message || 'Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedGroup, searchQuery]);

  const handleSaveContact = async (contactData) => {
    try {
      if (editingContact) {
        await api.updateContact(editingContact.id, contactData);
        success('Contact updated successfully.');
      } else {
        await api.createContact(contactData);
        success('Contact added successfully.');
      }
      setContactModalOpen(false);
      setEditingContact(null);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to save contact.');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.deleteContact(id);
      success('Contact deleted.');
      loadData();
    } catch (err) {
      error(err.message || 'Failed to delete contact.');
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await api.createGroup(groupData);
      success('New group created successfully.');
      setGroupModalOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to create group.');
    }
  };

  const handleImportCsvSuccess = async (rows) => {
    try {
      const res = await api.importCsv(rows);
      success(res.message, 'CSV Import Completed');
      setCsvModalOpen(false);
      loadData();
    } catch (err) {
      error(err.message || 'CSV Import failed.');
    }
  };

  const handleExportCsv = () => {
    window.open('/api/contacts/export', '_blank');
    success('Contacts CSV exported.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Recipient Directory & Cohorts</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage contacts, student cohorts, custom personalization variables, and CSV data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setGroupModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-sm transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Group</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingContact(null);
              setContactModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Cohort Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Group Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedGroup('all')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              selectedGroup === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            All Contacts ({contacts.length})
          </button>
          {groups.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGroup(String(g.id))}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedGroup === String(g.id)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: g.color || '#6366F1' }}
              />
              <span>{g.name}</span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Contacts Data Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Contact Details</th>
                <th className="px-6 py-3.5">Cohort Group</th>
                <th className="px-6 py-3.5">Custom Variables</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {contacts.map(c => {
                const cf = c.custom_fields || {};
                const cfEntries = Object.entries(cf);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[10px] text-slate-400">ID #{c.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 space-y-1">
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {c.group_name ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                          style={{
                            borderColor: c.group_color || '#6366F1',
                            color: c.group_color || '#6366F1',
                            backgroundColor: `${c.group_color || '#6366F1'}15`
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: c.group_color || '#6366F1' }}
                          />
                          <span>{c.group_name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cfEntries.slice(0, 3).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono"
                          >
                            {k}: {String(v)}
                          </span>
                        ))}
                        {cfEntries.length > 3 && (
                          <span className="text-[10px] text-indigo-500 font-semibold">
                            +{cfEntries.length - 3} more
                          </span>
                        )}
                        {cfEntries.length === 0 && (
                          <span className="text-slate-400 italic text-[11px]">None</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingContact(c);
                            setContactModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {contacts.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No contacts found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        contact={editingContact}
        groups={groups}
      />

      <CsvImportModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onImportSuccess={handleImportCsvSuccess}
      />

      <GroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onSave={handleCreateGroup}
      />
    </div>
  );
}

