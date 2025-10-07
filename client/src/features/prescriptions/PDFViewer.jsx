/**
 * PDFViewer Component
 * Display PDF prescriptions in an iframe
 */

import { useState } from 'react';
import { Download, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

/**
 * PDFViewer component for displaying prescription PDFs
 * @param {object} props - Component props
 * @param {string} props.pdfUrl - URL of the PDF file
 * @param {string} props.title - PDF title
 * @param {Function} props.onShare - Share callback
 * @returns {JSX.Element} PDFViewer component
 */
export function PDFViewer({ pdfUrl, title = 'Prescription', onShare }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load PDF. The file may be corrupted or unavailable.');
  };
  
  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-clinical-50 border-b border-clinical-200">
        <h3 className="font-semibold text-clinical-900">{title}</h3>
        <div className="flex gap-2">
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share via ABDM
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>
      
      {/* PDF Container */}
      <div className="flex-1 relative bg-clinical-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-clinical-600">Loading PDF...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <Alert variant="error" className="max-w-md">
              {error}
            </Alert>
          </div>
        )}
        
        {pdfUrl && !error && (
          <iframe
            src={`${pdfUrl}#view=FitH`}
            className="w-full h-full border-0"
            title={title}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
    </div>
  );
}
