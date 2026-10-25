'use client';

import React, { useState, useRef } from 'react';
import { Upload, Film, AlertCircle, CheckCircle2, Loader2, FileVideo } from 'lucide-react';
import { Project } from '@/types';

interface UploadZoneProps {
  projectId: string;
  onUploadSuccess?: (project: Project) => void;
}

export function UploadZone({ projectId, onUploadSuccess }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);

    // Validate type
    const validExtensions = ['.mp4', '.mov', '.webm', '.mkv'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidExt && !file.type.startsWith('video/')) {
      setErrorMessage('Please select a valid video file (MP4, MOV, WebM, or MKV).');
      return;
    }

    // Validate size (150MB max)
    const maxBytes = 150 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage(`File exceeds 150MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    setUploadedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
    });

    // Start upload
    setIsUploading(true);
    setUploadProgress(15);
    setStatusMessage('Transferring video to secure media storage...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(45);
      const res = await fetch(`/api/projects/${projectId}/uploads`, {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);
      setStatusMessage('Inspecting media streams with FFprobe...');

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      setUploadProgress(100);
      setStatusMessage('Media verified and cataloged successfully.');
      setIsUploading(false);

      if (onUploadSuccess && data.project) {
        onUploadSuccess(data.project);
      }
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to upload video');
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? 'border-duskyPink bg-duskyPink/10 scale-[1.01]'
            : 'border-heather-700/80 bg-heather-900/60 hover:border-heather-500 hover:bg-heather-850'
        } ${isUploading ? 'pointer-events-none opacity-90' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-heather-800 border border-heather-700/70 text-duskyPink mb-4 shadow-inner">
          {isUploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-duskyPink" />
          ) : (
            <Upload className="h-7 w-7" />
          )}
        </div>

        <h3 className="text-base font-semibold text-feather mb-1">
          {isUploading ? 'Processing Video File' : 'Drop your source video here, or browse'}
        </h3>
        <p className="text-xs text-quartz/70 mb-4 text-center max-w-sm">
          Supports high-definition MP4, MOV, and WebM files up to 150MB. Video tracks are stream-copied to prevent quality loss.
        </p>

        {uploadedFile && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-heather-800 border border-heather-700 text-xs text-feather mb-3">
            <FileVideo className="h-4 w-4 text-eucalyptus" />
            <span className="font-medium truncate max-w-xs">{uploadedFile.name}</span>
            <span className="text-quartz/60">({uploadedFile.size})</span>
          </div>
        )}

        {isUploading && (
          <div className="w-full max-w-md mt-2 space-y-1.5">
            <div className="flex justify-between text-xs text-quartz font-mono">
              <span>{statusMessage}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full bg-heather-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-fern to-duskyPink transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
