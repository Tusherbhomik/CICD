import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../url';

interface AdminData {
  id: number;
  name: string;
  email: string;
  adminLevel: 'ROOT_ADMIN' | 'ADMIN' | 'SUPPORT_ADMIN';
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'INACTIVE';
  canManageAdmins: boolean;
  lastLogin: string | null;
  loginTime: string;
  token?: string;
}

interface Medicine {
  id: number;
  name: string;
  genericName: string;
  strength: string;
  form: string;
  price: string;
  manufacturer: string;
  category: string;
  description: string;
}

interface MedicineFormData {
  name: string;
  genericName: string;
  strength: string;
  form: string;
  price: number;
  manufacturer: string;
  category: string;
  description: string;
}

interface MedicinesTabProps {
  adminData: AdminData;
  medicines: Medicine[];
  formatDate: (dateString: string | Date | null) => string;
  showConfirmation: (title: string, message: string, onConfirm: () => void, type: 'approve' | 'suspend' | 'activate') => void;
  canPerformAdminActions: boolean;
}

const PAGE_SIZE = 25;

const formBadgeColors: Record<string, string> = {
  TABLET: 'bg-blue-500/20 text-blue-300',
  CAPSULE: 'bg-purple-500/20 text-purple-300',
  SYRUP: 'bg-amber-500/20 text-amber-300',
  INJECTION: 'bg-red-500/20 text-red-300',
  CREAM: 'bg-pink-500/20 text-pink-300',
  DROPS: 'bg-cyan-500/20 text-cyan-300',
  INHALER: 'bg-teal-500/20 text-teal-300',
  PATCH: 'bg-orange-500/20 text-orange-300',
  OTHER: 'bg-slate-600/40 text-slate-400',
};

const MedicinesTab = ({ adminData, showConfirmation, canPerformAdminActions }: MedicinesTabProps) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch on mount — lazy, only when this tab is actually visited
  useEffect(() => {
    const token = localStorage.getItem('adminJwtToken');
    if (!token) { setLoading(false); return; }
    fetch(`${API_BASE_URL}/api/medicines/search`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: Medicine[]) => setMedicines(data))
      .catch(() => setMedicines([]))
      .finally(() => setLoading(false));
  }, []);

  // Reset to page 1 whenever the search changes
  useEffect(() => { setPage(1); }, [search]);

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.genericName.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const el = document.createElement('div');
    el.className = `fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => { if (document.body.contains(el)) document.body.removeChild(el); }, 3000);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += char; }
    }
    result.push(current.trim());
    return result;
  };

  const normalizeFormValue = (form: string): string => {
    const map: Record<string, string> = { tablet: 'TABLET', capsule: 'CAPSULE', syrup: 'SYRUP', injection: 'INJECTION', cream: 'CREAM', drops: 'DROPS', inhaler: 'INHALER', patch: 'PATCH', other: 'OTHER' };
    return map[form.toLowerCase().trim()] || form.toUpperCase();
  };

  const parseCSV = (csv: string): MedicineFormData[] => {
    const lines = csv.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error('CSV needs at least a header and one data row');
    return lines.slice(1).reduce<MedicineFormData[]>((acc, line) => {
      const v = parseCSVLine(line);
      if (v.length < 8) return acc;
      const m: MedicineFormData = { name: v[0]?.trim() || '', genericName: v[1]?.trim() || '', strength: v[2]?.trim() || '', form: normalizeFormValue(v[3] || 'TABLET'), price: parseFloat(v[4]) || 0, manufacturer: v[5]?.trim() || '', category: v[6]?.trim() || '', description: v[7]?.trim() || '' };
      if (m.name && m.genericName && m.strength && m.category) acc.push(m);
      return acc;
    }, []);
  };

  const addSingleMedicine = async (data: MedicineFormData): Promise<boolean> => {
    const token = localStorage.getItem('adminJwtToken');
    if (!token) throw new Error('No authentication token');
    const response = await fetch(`${API_BASE_URL}/api/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({ ...data, price: data.price || 0 }),
    });
    if (!response.ok) { const t = await response.text(); throw new Error(`${response.statusText}: ${t}`); }
    return true;
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.csv')) { showToast('Please select a CSV file', 'error'); return; }
    setIsUploading(true);
    setUploadProgress('Reading file...');
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) throw new Error('No valid records found');
      setUploadProgress(`Found ${parsed.length} medicines. Uploading...`);
      let uploaded = 0, failed = 0;
      for (let i = 0; i < parsed.length; i++) {
        setUploadProgress(`Uploading ${i + 1}/${parsed.length}: ${parsed[i].name}`);
        try { await addSingleMedicine(parsed[i]); uploaded++; } catch { failed++; }
        if (i < parsed.length - 1) await new Promise(r => setTimeout(r, 50));
      }
      setUploadProgress('');
      if (uploaded > 0) {
        showToast(`Added ${uploaded} medicine${uploaded !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`);
        window.location.reload();
      } else {
        showToast(`Upload failed — ${failed} medicines could not be added`, 'error');
      }
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setIsUploading(false); setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadSampleCSV = () => {
    const csv = `Name,Generic Name,Strength,Form,Price,Manufacturer,Category,Description\nParacetamol 500mg,Acetaminophen,500mg,TABLET,10.50,Generic Pharma,Analgesic,Pain relief and fever reducer\nAmoxicillin 250mg,Amoxicillin,250mg,CAPSULE,25.00,Antibiotic Labs,Antibiotic,Broad-spectrum antibiotic`;
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'sample_medicines.csv' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleDelete = async (id: number, name: string) => {
    const token = adminData.token || localStorage.getItem('adminJwtToken');
    if (!token) { showToast('No authentication token', 'error'); return; }
    showConfirmation('Delete Medicine', `Delete "${name}"? This cannot be undone.`, async () => {
      const response = await fetch(`${API_BASE_URL}/api/medicines/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (response.ok) { setMedicines(prev => prev.filter(m => m.id !== id)); showToast(`"${name}" deleted`); }
      else showToast('Failed to delete medicine', 'error');
    }, 'suspend');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Medicine Database</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? 'Loading…' : `${medicines.length} medicines registered`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadSampleCSV} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-white rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Sample CSV
          </button>
          <div className="relative">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCSVUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-white rounded-xl transition-colors disabled:opacity-50" disabled={isUploading}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" /></svg>
              {isUploading ? 'Uploading…' : 'Upload CSV'}
            </button>
          </div>
          <Link to="/admin/medicines/add">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Medicine
            </button>
          </Link>
        </div>
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 flex-shrink-0" />
          <span className="text-sm text-blue-300">{uploadProgress}</span>
        </div>
      )}

      {/* Search + table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search medicines…"
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-sm rounded-lg focus:outline-none focus:border-slate-500"
            />
          </div>
          {search && (
            <span className="text-xs text-slate-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          )}
          {!search && !loading && (
            <span className="text-xs text-slate-600">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading medicines…</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Medicine</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Generic Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Strength</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Form</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                    {canPerformAdminActions && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginated.map(medicine => (
                    <tr key={medicine.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">{medicine.name}</p>
                        <p className="text-xs text-slate-500">{medicine.manufacturer || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{medicine.genericName}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{medicine.strength}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${formBadgeColors[medicine.form] || 'bg-slate-700 text-slate-400'}`}>
                          {medicine.form}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{medicine.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{medicine.price ? `৳${medicine.price}` : '—'}</td>
                      {canPerformAdminActions && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link to={`/admin/medicines/edit/${medicine.id}`} className="text-xs px-3 py-1.5 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white rounded-lg transition-colors">Edit</Link>
                            <button className="text-xs px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" onClick={() => handleDelete(medicine.id, medicine.name)}>Delete</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={canPerformAdminActions ? 7 : 6} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-slate-400 font-medium">{search ? 'No medicines match your search' : 'No medicines in database'}</p>
                        <p className="text-slate-600 text-sm mt-1">{search ? 'Try a different search term' : 'Add medicines individually or upload a CSV file'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages} &nbsp;·&nbsp; {filtered.length} total
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-2 py-1.5 text-xs text-slate-400 border border-slate-700 rounded-lg hover:border-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >«</button>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs text-slate-400 border border-slate-700 rounded-lg hover:border-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >Prev</button>

                  {/* Page number buttons — show up to 5 around current */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    return start + i;
                  }).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        p === page
                          ? 'bg-red-600 border-red-600 text-white font-semibold'
                          : 'text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white'
                      }`}
                    >{p}</button>
                  ))}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs text-slate-400 border border-slate-700 rounded-lg hover:border-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >Next</button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-2 py-1.5 text-xs text-slate-400 border border-slate-700 rounded-lg hover:border-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >»</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CSV format hint */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">CSV Format</p>
        <p className="text-xs text-slate-500 font-mono">Name, Generic Name, Strength, Form, Price, Manufacturer, Category, Description</p>
        <p className="text-xs text-slate-600 mt-1">Form values: TABLET, CAPSULE, SYRUP, INJECTION, CREAM, DROPS, INHALER, PATCH, OTHER</p>
      </div>
    </div>
  );
};

export default MedicinesTab;
