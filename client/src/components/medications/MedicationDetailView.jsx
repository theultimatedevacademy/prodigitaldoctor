/**
 * MedicationDetailView Component
 * Shows detailed information about a medication including compositions and substitutes
 */

import { useState } from "react";
import {
  Pill,
  Info,
  FlaskConical,
  Waves,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";

/**
 * Capitalize only the first letter, keep rest as-is
 */
const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * MedicationDetailView component
 * @param {object} props - Component props
 * @param {object} props.medication - Medication data with populated fields
 * @returns {JSX.Element} MedicationDetailView component
 */
export function MedicationDetailView({ medication }) {
  const [showSubstitutes, setShowSubstitutes] = useState(false);

  if (!medication) {
    return (
      <div className="text-center py-12">
        <Info className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No medication selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Pill className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <div className="flex-1 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">
                {capitalizeFirst(medication.brandName)}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 break-words">
                {capitalizeFirst(medication.genericName)}
              </p>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                {medication.form && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Form:
                    </span>
                    <p className="text-gray-900 break-words">{capitalizeFirst(medication.form)}</p>
                  </div>
                )}
                {medication.manufacturer && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Manufacturer:
                    </span>
                    <p className="text-gray-900 break-words">{capitalizeFirst(medication.manufacturer)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Substitutes Card */}
      {medication.substitutes && medication.substitutes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-purple-600" />
                Available Substitutes ({medication.substitutes.length})
              </CardTitle>
              <button
                onClick={() => setShowSubstitutes(!showSubstitutes)}
                className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm font-medium"
              >
                {showSubstitutes ? (
                  <>
                    <ChevronUp className="w-4 h-4" /> Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" /> Show
                  </>
                )}
              </button>
            </div>
          </CardHeader>
          {showSubstitutes && (
            <CardContent>
              <div className="grid gap-3">
                {medication.substitutes.map((substitute, index) => (
                  <div
                    key={substitute._id || index}
                    className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                      <div className="flex-1 w-full">
                        <h4 className="font-semibold text-gray-900 mb-1 break-words">
                          {substitute.brandName || "Unknown"}
                        </h4>
                        {substitute.genericName && (
                          <p className="text-sm text-gray-600 mb-1 break-words">
                            {substitute.genericName}
                          </p>
                        )}
                        {substitute.exact_composition && (
                          <p className="text-xs text-gray-500 font-mono break-words">
                            {substitute.exact_composition}
                          </p>
                        )}
                      </div>
                      {substitute.manufacturer && (
                        <span className="text-xs text-gray-500 sm:ml-4 break-words">
                          {substitute.manufacturer}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Composition Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-600" />
            Composition
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medication.exact_composition && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Formula:</p>
              <div className="space-y-2">
                {medication.exact_composition
                  .split(";")
                  .filter((comp) => comp.trim())
                  .map((component, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-gray-900 font-mono text-sm break-words">
                        {component.trim()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {medication.unique_composition &&
            medication.unique_composition.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Active Ingredients:
                </p>
                <div className="space-y-3">
                  {medication.unique_composition.map((comp, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1 break-words">
                        {comp.name}
                      </h4>
                      {comp.description && (
                        <p className="text-sm text-gray-600 break-words">
                          {comp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Clinical Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Clinical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {medication.usage && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Usage / Indications:
              </h4>
              <div className="space-y-2">
                {medication.usage
                  .split(";")
                  .filter((item) => item.trim())
                  .map((item, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <p className="text-gray-700 text-sm break-words">{item.trim()}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {medication.sideEffects && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Side Effects:
              </h4>
              <div className="flex flex-wrap gap-2">
                {medication.sideEffects
                  .split(";")
                  .filter((effect) => effect.trim())
                  .map((effect, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"
                    >
                      {effect.trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 pt-4 border-t">
            {medication.chemicalClass && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Chemical Class:
                </span>
                <p className="text-gray-900">{medication.chemicalClass}</p>
              </div>
            )}
            {medication.therapeuticClass && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Therapeutic Class:
                </span>
                <p className="text-gray-900">{medication.therapeuticClass}</p>
              </div>
            )}
            {medication.actionClass && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Action Class:
                </span>
                <p className="text-gray-900">{medication.actionClass}</p>
              </div>
            )}
            {medication.habitForming !== undefined && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Habit Forming:
                </span>
                <p className="text-gray-900">
                  <Badge
                    variant={medication.habitForming ? "warning" : "success"}
                  >
                    {medication.habitForming ? "Yes" : "No"}
                  </Badge>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
