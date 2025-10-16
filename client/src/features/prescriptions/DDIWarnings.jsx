/**
 * DDIWarnings Component
 * Displays drug-drug interaction warnings with severity levels
 */

import { AlertTriangle, XCircle, AlertCircle, Info } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { getSeverityColor, formatSeverity } from '../../utils/formatters';
import { DDI_SEVERITY } from '../../utils/constants';

/**
 * DDIWarnings component for displaying drug interaction warnings
 * @param {object} props - Component props
 * @param {Array} props.warnings - Array of DDI warnings
 * @param {Function} props.onOverride - Override handler for contraindicated interactions
 * @returns {JSX.Element} DDIWarnings component
 */
export function DDIWarnings({ warnings = [], onOverride }) {
  if (!warnings || warnings.length === 0) {
    return (
      <Alert variant="success" className="mb-4">
        <strong>No drug interactions detected.</strong>
        <p className="text-sm mt-1">The selected medications appear to be safe to prescribe together.</p>
      </Alert>
    );
  }
  
  // Group warnings by severity
  const contraindicated = warnings.filter(w => w.severity === DDI_SEVERITY.CONTRAINDICATED);
  const major = warnings.filter(w => w.severity === DDI_SEVERITY.MAJOR);
  const moderate = warnings.filter(w => w.severity === DDI_SEVERITY.MODERATE);
  const minor = warnings.filter(w => w.severity === DDI_SEVERITY.MINOR);
  
  const hasContraindicated = contraindicated.length > 0;
  
  return (
    <div className="space-y-4">
      {hasContraindicated && (
        <Alert variant="error">
          <strong>Contraindicated Drug Interactions Detected!</strong>
          <p className="text-sm mt-1">
            These medications should NOT be prescribed together. You must override this warning to continue.
          </p>
        </Alert>
      )}
      
      <div className="space-y-3">
        {contraindicated.map((warning, index) => (
          <DDIWarningItem key={index} warning={warning} onOverride={onOverride} />
        ))}
        {major.map((warning, index) => (
          <DDIWarningItem key={`major-${index}`} warning={warning} />
        ))}
        {moderate.map((warning, index) => (
          <DDIWarningItem key={`moderate-${index}`} warning={warning} />
        ))}
        {minor.map((warning, index) => (
          <DDIWarningItem key={`minor-${index}`} warning={warning} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual DDI warning item
 */
function DDIWarningItem({ warning, onOverride }) {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case DDI_SEVERITY.CONTRAINDICATED:
        return <XCircle className="w-5 h-5" />;
      case DDI_SEVERITY.MAJOR:
        return <AlertTriangle className="w-5 h-5" />;
      case DDI_SEVERITY.MODERATE:
        return <AlertCircle className="w-5 h-5" />;
      case DDI_SEVERITY.MINOR:
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };
  
  const getVariant = (severity) => {
    switch (severity) {
      case DDI_SEVERITY.CONTRAINDICATED:
      case DDI_SEVERITY.MAJOR:
        return 'error';
      case DDI_SEVERITY.MODERATE:
        return 'warning';
      case DDI_SEVERITY.MINOR:
        return 'info';
      default:
        return 'info';
    }
  };
  
  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(warning.severity)}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getSeverityIcon(warning.severity)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={getVariant(warning.severity)} size="sm">
              {formatSeverity(warning.severity)}
            </Badge>
            <span className="font-semibold text-sm">
              {typeof warning.compA === 'object' ? warning.compA?.name : warning.compA || 'Medication A'} + {typeof warning.compB === 'object' ? warning.compB?.name : warning.compB || 'Medication B'}
            </span>
          </div>
          
          <p className="text-sm mb-2">{warning.description || 'No description available'}</p>
          
          {warning.recommendation && (
            <div className="text-sm bg-white bg-opacity-50 rounded p-2 mt-2">
              <strong>Recommendation:</strong> {warning.recommendation}
            </div>
          )}
          
          {warning.severity === DDI_SEVERITY.CONTRAINDICATED && onOverride && (
            <button
              onClick={() => onOverride(warning)}
              className="mt-3 text-sm font-medium underline hover:no-underline"
            >
              Override Warning (Requires Justification)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
