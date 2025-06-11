import React, { useState, useCallback } from 'react';
import { Search, Pill, AlertTriangle, Info, Zap, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';


const MedicineCard = ({ medicine, isSelected, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const description = JSON.parse(medicine.description);

  const InfoSection = ({ icon: Icon, title, content, colorClass = "text-gray-600" }) => (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={colorClass} />
        <span className="font-medium text-sm text-gray-700">{title}</span>
      </div>
      <p className="text-sm text-gray-600 ml-5 leading-relaxed">{content}</p>
    </div>
  );

  return (
    <div 
      className={`border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
      onClick={onClick}
    >
      {/* Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="text-blue-600" size={18} />
              <h3 className="font-semibold text-gray-900 text-base">{medicine.name}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Manufacturer:</span>
                <span className="ml-2 text-gray-700">{medicine.manufacturer}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Form:</span>
                <span className="ml-2 text-gray-700">{medicine.form} • {medicine.strength}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="ml-4 p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Quick Preview - Always Visible */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Info size={14} className="text-blue-600" />
            <span className="font-medium text-sm text-gray-700">Primary Indication</span>
          </div>
          <p className="text-sm text-gray-600 ml-5">{description.indication}</p>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-white">
          <div className="pt-4 space-y-1">
            
            <InfoSection
              icon={User}
              title="Adult Dosage"
              content={description.adultDose}
              colorClass="text-green-600"
            />

            <InfoSection
              icon={AlertTriangle}
              title="Contraindications"
              content={description.contraindications}
              colorClass="text-red-500"
            />

            <InfoSection
              icon={Zap}
              title="Side Effects"
              content={description.sideEffects}
              colorClass="text-orange-500"
            />

          </div>
          
          {/* Action Button */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle medicine selection
                console.log('Selected medicine:', medicine.name);
              }}
            >
              Select this medicine
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ImprovedMedicineSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dosage, setDosage] = useState('');

  const filteredMedicines = mockMedicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
  };

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setSearchTerm(medicine.name);
    setShowDropdown(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Medicine Prescription</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medicine Search */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm && setShowDropdown(true)}
                placeholder="Search for medicine..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((medicine) => (
                      <MedicineCard
                        key={medicine.id}
                        medicine={medicine}
                        isSelected={selectedMedicine?.id === medicine.id}
                        onClick={() => handleMedicineSelect(medicine)}
                      />
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Pill className="mx-auto mb-2 text-gray-400" size={24} />
                      <p>No medicines found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dosage Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
          <select
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select dosage</option>
            <option value="1-0-1">1-0-1 (Morning-Afternoon-Evening)</option>
            <option value="1-1-1">1-1-1 (Three times daily)</option>
            <option value="0-0-1">0-0-1 (Evening only)</option>
            <option value="1-0-0">1-0-0 (Morning only)</option>
            <option value="sos">As needed (SOS)</option>
          </select>
        </div>
      </div>

      {/* Selected Medicine Summary */}
      {selectedMedicine && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Selected Medicine</h3>
          <p className="text-blue-800">
            <strong>{selectedMedicine.name}</strong> - {dosage || 'Dosage not selected'}
          </p>
        </div>
      )}

      {/* Demo Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Try the search:</h4>
        <p className="text-sm text-gray-600">
          Type "para" or "amox" to see the improved medicine cards with expandable details, 
          clear categorization, and doctor-friendly information layout.
        </p>
      </div>
    </div>
  );
};

export default ImprovedMedicineSearch;