/**
 * File upload API hooks using React Query
 */

import { useMutation } from '@tanstack/react-query';
import { post, uploadFile, uploadFileMultipart } from '../apiClient';
import { API_ENDPOINTS } from '../../utils/constants';

/**
 * Hook to get presigned URL for file upload
 * @returns {object} Mutation object
 */
export function usePresignUpload() {
  return useMutation({
    mutationFn: ({ fileName, fileType, fileSize }) => 
      post(API_ENDPOINTS.UPLOAD_PRESIGN, { fileName, fileType, fileSize }),
  });
}

/**
 * Hook to upload file to S3 using presigned URL
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {object} Mutation object
 */
export function useUploadToS3(onProgress) {
  return useMutation({
    mutationFn: ({ presignedUrl, file, fields }) => {
      // If fields are provided, use multipart form upload
      if (fields) {
        return uploadFileMultipart(presignedUrl, fields, file, onProgress);
      }
      // Otherwise, use PUT upload
      return uploadFile(presignedUrl, file, onProgress);
    },
  });
}

/**
 * Combined hook for complete upload flow (presign + upload)
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {object} Object with presign and upload mutations
 */
export function useFileUpload(onProgress) {
  const presignMutation = usePresignUpload();
  const uploadMutation = useUploadToS3(onProgress);
  
  const uploadFile = async (file) => {
    // Step 1: Get presigned URL
    const presignData = await presignMutation.mutateAsync({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
    
    // Step 2: Upload to S3
    if (presignData.presignedUrl) {
      await uploadMutation.mutateAsync({
        presignedUrl: presignData.presignedUrl,
        file,
      });
    } else if (presignData.url && presignData.fields) {
      await uploadMutation.mutateAsync({
        presignedUrl: presignData.url,
        file,
        fields: presignData.fields,
      });
    }
    
    // Return the file key/URL
    return presignData.key || presignData.url;
  };
  
  return {
    uploadFile,
    isLoading: presignMutation.isPending || uploadMutation.isPending,
    error: presignMutation.error || uploadMutation.error,
  };
}
