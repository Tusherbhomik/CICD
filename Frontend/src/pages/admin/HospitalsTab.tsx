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

interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
}

interface HospitalFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
}

interface HospitalsTabProps {
  adminData: AdminData;
  hospitals: Hospital[];
  formatDate: (dateString: string | Date | null) => string;
  showConfirmation: (title: string, message: string, onConfirm: () => void, type: 'approve' | 'suspend' | 'activate') => void;
  canPerformAdminActions: boolean;
}

const HospitalsTab = ({ adminData, hospitals: initialHospitals, formatDate, showConfirmation, canPerformAdminActions }: HospitalsTabProps) => {
  const [hospitals, setHospitals] = useState<Hospital[]>(initialHospitals);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setHospitals(initialHospitals); }, [initialHospitals]);

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

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
      const char = line[i], next = line[i + 1];
      if (char === '"' && !inQuotes) { inQuotes = true; }
      else if (char === '"' && inQuotes) { if (next === '"') { current += '"'; i++; } else inQuotes = false; }
      else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += char; }
    }
    result.push(current.trim());
    return result;
  };

  const parseCSV = (text: string): HospitalFormData[] => {
    const lines = text.split('\n').filter(l => l.trim());
    if (!lines.length) return [];
    return lines.slice(1).map(line => {
      const v = parseCSVLine(line).map(val => val.replace(/^"(.*)"$/, '$1').replace(/""/g, '"').trim());
      return { name: v[0] || '', address: v[1] || '', city: v[2] || '', state: v[3] || '', zipCode: v[4] || '', phone: v[5] || '', email: v[6] || '', website: v[7] || '' };
    }).filter(h => h.name);
  };

  const addSingleHospital = async (data: HospitalFormData): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('adminJwtToken');
      if (!token) return { success: false, message: 'No token' };
      const response = await fetch(`${API_BASE_URL}/api/hospitals`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, credentials: 'include', body: JSON.stringify(data),
      });
      if (!response.ok) { const e = await response.json(); return { success: false, message: e.message || `HTTP ${response.status}` }; }
      return { success: true, message: 'OK' };
    } catch (err) { return { success: false, message: err instanceof Error ? err.message : 'Unknown error' }; }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || (!file.type.includes('csv') && !file.name.endsWith('.csv'))) { showToast('Please select a valid CSV file', 'error'); return; }
    setIsUploading(true);
    setUploadProgress('Reading file...');
    try {
      const text = await file.text();
      const data = parseCSV(text);
      if (!data.length) { showToast('No valid hospital data found', 'error'); setIsUploading(false); return; }
      setUploadProgress(`Processing ${data.length} hospitals...`);
      let ok = 0, fail = 0;
      for (let i = 0; i < data.length; i++) {
        setUploadProgress(`Processing ${i + 1}/${data.length}: ${data[i].name}`);
        const r = await addSingleHospital(data[i]);
        r.success ? ok++ : fail++;
        await new Promise(res => setTimeout(res, 100));
      }
      setUploadProgress('');
      if (ok > 0) { showToast(`Added ${ok} hospitals`); window.location.reload(); }
      if (fail > 0) showToast(`${fail} hospitals failed`, 'error');
    } catch { showToast('Error processing CSV', 'error'); }
    finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadSampleCSV = () => {
    const rows = [
      ['name','address','city','state','zipCode','phone','email','website'],
      ['Square Hospital Ltd','18/F West Panthapath','Dhaka','Dhaka Division','1205','+88028159457','info@squarehospital.com','http://www.squarehospital.com'],
    ];
    const csv = rows.map(r => r.map(f => `"${f.replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'sample_hospitals.csv' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  if (!canPerformAdminActions) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
        <p className="text-slate-400">You don't have permission to manage hospitals.</p>
      </div>
    );
  }

  const hospitalColors = ['from-red-600 to-rose-500', 'from-blue-600 to-indigo-500', 'from-emerald-600 to-teal-500', 'from-purple-600 to-violet-500', 'from-amber-600 to-orange-500'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Hospital Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">{hospitals.length} hospitals registered in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadSampleCSV} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-white rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Sample CSV
          </button>
          <div className="relative">
            <input type="file" accept=".csv" onChange={handleCSVUpload} ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 border border-slate-700 hover:border-slate-600 hover:text-white rounded-xl transition-colors disabled:opacity-50" disabled={isUploading}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" /></svg>
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
          <Link to="/admin/hospitals/add">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Hospital
            </button>
          </Link>
        </div>
      </div>

      {isUploading && uploadProgress && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 flex-shrink-0" />
          <span className="text-sm text-blue-300">{uploadProgress}</span>
        </div>
      )}

      {/* Search + table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search hospitals..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-sm rounded-lg focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <p className="text-slate-400 font-medium">{search ? 'No hospitals match your search' : 'No hospitals yet'}</p>
            <p className="text-slate-600 text-sm mt-1">{search ? 'Try a different search term' : 'Add hospitals individually or upload a CSV file'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((hospital, idx) => (
              <div key={hospital.id} className="px-6 py-5 flex items-center gap-4 hover:bg-slate-800/40 transition-colors">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${hospitalColors[idx % hospitalColors.length]} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/hospitals/${hospital.id}`} className="text-sm font-bold text-white hover:text-red-300 transition-colors">
                      {hospital.name}
                    </Link>
                    <span className="text-xs text-slate-600">#{hospital.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {hospital.city}, {hospital.state}
                    </span>
                    {hospital.phone && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {hospital.phone}
                      </span>
                    )}
                    {hospital.email && <span>{hospital.email}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/admin/hospitals/${hospital.id}`} className="text-xs px-3 py-1.5 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white rounded-lg transition-colors">
                    View
                  </Link>
                  <Link to={`/admin/hospitals/edit/${hospital.id}`} className="text-xs px-3 py-1.5 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white rounded-lg transition-colors">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalsTab;
