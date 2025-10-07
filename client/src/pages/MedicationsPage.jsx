/**
 * MedicationsPage Component
 * Search and browse medications
 */

import { useState } from 'react';
import { Pill, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { SearchInput } from '../components/ui/SearchInput';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useSearchMedications } from '../api/hooks/useMedications';

export default function MedicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading } = useSearchMedications(searchQuery);
  const medications = data?.medications || [];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-clinical-900">Medications Database</h1>
        <p className="text-clinical-600 mt-1">
          Search and view medication information
        </p>
      </div>
      
      {/* Search */}
      <div className="max-w-2xl">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search medications by brand name, generic name, or composition..."
        />
      </div>
      
      {/* Results */}
      <div>
        {!searchQuery ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-clinical-400 mb-4" />
            <h3 className="text-xl font-semibold text-clinical-700 mb-2">
              Start searching for medications
            </h3>
            <p className="text-clinical-600">
              Enter at least 2 characters to search
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-clinical-600">Searching medications...</p>
          </div>
        ) : medications.length > 0 ? (
          <div className="grid gap-4">
            {medications.map((med) => (
              <Card key={med._id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-clinical-900 mb-1">
                        {med.brandName}
                      </h3>
                      <p className="text-clinical-600 mb-3">{med.genericName}</p>
                      
                      {med.compositions && med.compositions.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium text-clinical-700 mb-2">Compositions:</div>
                          <div className="flex flex-wrap gap-2">
                            {med.compositions.map((comp, index) => (
                              <Badge key={index} variant="default" size="sm">
                                {comp.name || comp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {med.manufacturer && (
                        <div className="text-sm text-clinical-600">
                          <strong>Manufacturer:</strong> {med.manufacturer}
                        </div>
                      )}
                      
                      {med.category && (
                        <div className="text-sm text-clinical-600 mt-1">
                          <strong>Category:</strong> {med.category}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-clinical-400 mb-4" />
            <h3 className="text-xl font-semibold text-clinical-700 mb-2">
              No medications found
            </h3>
            <p className="text-clinical-600">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
