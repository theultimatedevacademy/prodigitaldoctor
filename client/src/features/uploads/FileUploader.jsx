/**
 * FileUploader Component
 * Upload files to S3 with progress tracking
 */

import { useState, useRef } from 'react';
import { Upload, X, FileIcon, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useFileUpload } from '../../api/hooks/useUploads';
import { validateFile } from '../../utils/validators';
import { formatFileSize } from '../../utils/formatters';
import { FILE_UPLOAD } from '../../utils/constants';

/**
 * FileUploader component with drag-and-drop
 * @param {object} props - Component props
 * @param {Function} props.onUploadComplete - Callback with uploaded file URL/key
 * @param {Array} props.allowedTypes - Allowed file types
 * @param {number} props.maxSizeMB - Maximum file size in MB
 * @param {boolean} props.multiple - Allow multiple files
 * @returns {JSX.Element} FileUploader component
 */
export function FileUploader({
  onUploadComplete,
  allowedTypes = FILE_UPLOAD.ALLOWED_TYPES.DOCUMENT,
  maxSizeMB = FILE_UPLOAD.MAX_SIZE_MB,
  multiple = false,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef(null);
  
  const { uploadFile, isLoading } = useFileUpload((percent) => setProgress(percent));
  
  const handleFileSelect = (file) => {
    setError('');
    setUploadComplete(false);
    
    // Validate file
    const validation = validateFile(file, maxSizeMB, allowedTypes);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }
    
    setSelectedFile(file);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      const fileKey = await uploadFile(selectedFile);
      setUploadComplete(true);
      onUploadComplete?.(fileKey);
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
  };
  
  const handleRemove = () => {
    setSelectedFile(null);
    setProgress(0);
    setError('');
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${selectedFile ? 'bg-gray-50' : 'bg-white'}
        `}
      >
        {!selectedFile ? (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-700 mb-2">
              Drag and drop a file here, or click to select
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Max size: {maxSizeMB}MB | Allowed: {allowedTypes.map(t => t.split('/')[1]).join(', ')}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept={allowedTypes.join(',')}
              multiple={multiple}
              className="hidden"
            />
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <FileIcon className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              {uploadComplete ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <button
                  onClick={handleRemove}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
            
            {/* Progress bar */}
            {isLoading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">Uploading... {progress}%</p>
              </div>
            )}
            
            {/* Upload button */}
            {!uploadComplete && !isLoading && (
              <Button onClick={handleUpload} className="w-full">
                Upload File
              </Button>
            )}
            
            {uploadComplete && (
              <Alert variant="success">
                File uploaded successfully!
              </Alert>
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <Alert variant="error" className="mt-3">
          {error}
        </Alert>
      )}
    </div>
  );
}
