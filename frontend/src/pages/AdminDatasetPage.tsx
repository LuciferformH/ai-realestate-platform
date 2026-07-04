import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Link2,
  Trash2,
  RefreshCw,
  BarChart3,
  HardDrive,
  Columns,
  Activity,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, formatNumber, cn } from '@/lib/utils';
import { UploadZone } from '@/components/admin/UploadZone';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Dataset {
  id: number;
  name: string;
  file_name: string;
  records: number;
  file_size: number;
  columns: string[];
  status: 'processing' | 'completed' | 'failed';
  uploaded_at: string;
  quality_score?: number;
}

interface DataPreview {
  headers: string[];
  rows: any[][];
}

const SYNTHETIC_OPTIONS = [
  { value: 1000, label: '1,000 records' },
  { value: 10000, label: '10,000 records' },
  { value: 50000, label: '50,000 records' },
  { value: 100000, label: '100,000 records' },
];

export default function AdminDatasetPage() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const [importUrl, setImportUrl] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [syntheticCount, setSyntheticCount] = useState(10000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);

  const { data: datasets = [], isLoading } = useQuery<Dataset[]>({
    queryKey: ['admin', 'datasets'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/admin/datasets');
        return data.items ?? data;
      } catch {
        return [];
      }
    },
  });

  const { data: preview } = useQuery<DataPreview>({
    queryKey: ['admin', 'dataset-preview', previewDataset?.id],
    queryFn: async () => {
      if (!previewDataset) return { headers: [], rows: [] };
      try {
        const { data } = await api.get(`/admin/datasets/${previewDataset.id}/preview?limit=100`);
        return data;
      } catch {
        return { headers: [], rows: [] };
      }
    },
    enabled: !!previewDataset,
  });

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setUploadResult(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadResult({ success: true, message: 'Dataset uploaded and processed successfully!' });
            queryClient.invalidateQueries({ queryKey: ['admin', 'datasets'] });
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('POST', `${api.defaults.baseURL}/admin/datasets/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${getAuthToken()}`);
        xhr.send(formData);
      });
    } catch {
      setUploadResult({ success: false, message: 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  }, [selectedFile, queryClient]);

  const handleImportUrl = useCallback(async () => {
    if (!importUrl.trim()) return;
    try {
      await api.post('/admin/datasets/import-url', { url: importUrl });
      toast.success('Dataset import started');
      setShowImportModal(false);
      setImportUrl('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'datasets'] });
    } catch {
      toast.error('Failed to import dataset');
    }
  }, [importUrl, queryClient]);

  const handleGenerateSynthetic = useCallback(async () => {
    setIsGenerating(true);
    try {
      await api.post('/admin/datasets/generate-synthetic', { count: syntheticCount });
      toast.success('Synthetic data generation started');
      queryClient.invalidateQueries({ queryKey: ['admin', 'datasets'] });
    } catch {
      toast.error('Failed to generate synthetic data');
    } finally {
      setIsGenerating(false);
    }
  }, [syntheticCount, queryClient]);

  const deleteDatasetMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/datasets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'datasets'] });
      toast.success('Dataset deleted');
    },
    onError: () => toast.error('Failed to delete dataset'),
  });

  const totalRecords = datasets.reduce((s, d) => s + d.records, 0);
  const totalSize = datasets.reduce((s, d) => s + (d.file_size || 0), 0);
  const completedDatasets = datasets.filter((d) => d.status === 'completed');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dataset Management</h1>
              <p className="mt-1 text-surface-400">Upload, process, and manage training datasets</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Link2 className="w-4 h-4" />} onClick={() => setShowImportModal(true)}>
                Import URL
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <AdminStatsCard
              icon={<Database className="h-5 w-5 text-blue-400" />}
              value={datasets.length}
              label="Total Datasets"
              gradient="from-blue-500/20 to-blue-600/5"
            />
            <AdminStatsCard
              icon={<FileText className="h-5 w-5 text-purple-400" />}
              value={totalRecords}
              label="Total Records"
              change={15}
              gradient="from-purple-500/20 to-purple-600/5"
            />
            <AdminStatsCard
              icon={<HardDrive className="h-5 w-5 text-emerald-400" />}
              value={Math.round(totalSize / 1024)}
              label="Total Size (KB)"
              gradient="from-emerald-500/20 to-emerald-600/5"
            />
            <AdminStatsCard
              icon={<CheckCircle className="h-5 w-5 text-amber-400" />}
              value={completedDatasets.length}
              label="Completed"
              gradient="from-amber-500/20 to-orange-500/5"
            />
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            {/* Upload Zone */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Upload Dataset
              </h2>
              <UploadZone
                onFileSelect={handleFileSelect}
                acceptedTypes={['.csv', '.xlsx', '.json']}
                maxSizeMB={100}
              />

              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4"
                >
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">Uploading...</span>
                        <span className="text-white/70">{uploadProgress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {uploadResult && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          'flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-xs',
                          uploadResult.success
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        )}
                      >
                        {uploadResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {uploadResult.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isUploading && !uploadResult && (
                    <Button
                      variant="primary"
                      className="mt-3 w-full"
                      onClick={handleUpload}
                      icon={<Upload className="w-4 h-4" />}
                    >
                      Upload & Process
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Generate Synthetic Data */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-400" />
                Generate Synthetic Data
              </h2>
              <p className="text-sm text-white/40 mb-4">
                Generate realistic synthetic property data for testing and model training.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Number of Records</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SYNTHETIC_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSyntheticCount(opt.value)}
                        className={cn(
                          'px-3 py-2.5 rounded-xl text-sm font-medium transition-all border',
                          syntheticCount === opt.value
                            ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  loading={isGenerating}
                  onClick={handleGenerateSynthetic}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  {isGenerating ? 'Generating...' : 'Generate Data'}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Data Quality Report */}
          {completedDatasets.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Data Quality Report
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {completedDatasets.slice(0, 3).map((ds) => (
                  <div key={ds.id} className="p-4 rounded-xl bg-white/[0.03]">
                    <p className="text-sm font-medium text-white mb-1">{ds.name}</p>
                    <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                      <FileText className="w-3 h-3" />
                      {ds.records.toLocaleString()} records
                      <span className="text-white/20">|</span>
                      <Columns className="w-3 h-3" />
                      {ds.columns?.length ?? 0} columns
                    </div>
                    {ds.quality_score !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-white/40">Quality Score</span>
                          <span className="text-emerald-400">{ds.quality_score}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              ds.quality_score >= 80 ? 'bg-emerald-500' : ds.quality_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                            style={{ width: `${ds.quality_score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Datasets List */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Datasets</h2>
            </div>

            {isLoading ? (
              <div className="p-8 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
                ))}
              </div>
            ) : datasets.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <div className="text-center">
                  <Database className="mx-auto h-10 w-10 text-white/20" />
                  <p className="mt-2 text-white/40">No datasets uploaded yet</p>
                  <p className="text-sm text-white/20">Upload your first dataset to get started</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-3 text-xs font-medium text-white/50 uppercase">Dataset</th>
                      <th className="px-6 py-3 text-xs font-medium text-white/50 uppercase">Records</th>
                      <th className="px-6 py-3 text-xs font-medium text-white/50 uppercase">Size</th>
                      <th className="px-6 py-3 text-xs font-medium text-white/50 uppercase">Columns</th>
                      <th className="px-6 py-3 text-xs font-medium text-white/50 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-white/50 uppercase">Uploaded</th>
                      <th className="px-6 py-3 text-xs font-medium text-white/50 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.map((dataset) => (
                      <tr
                        key={dataset.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                              <FileText className="h-5 w-5 text-white/30" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{dataset.name}</p>
                              <p className="text-xs text-white/30">{dataset.file_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/60">{dataset.records.toLocaleString()}</td>
                        <td className="px-6 py-4 text-white/60">{formatBytes(dataset.file_size)}</td>
                        <td className="px-6 py-4 text-white/60">{dataset.columns?.length ?? '—'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                              dataset.status === 'completed' && 'bg-emerald-500/20 text-emerald-400',
                              dataset.status === 'processing' && 'bg-amber-500/20 text-amber-400',
                              dataset.status === 'failed' && 'bg-red-500/20 text-red-400'
                            )}
                          >
                            {dataset.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                            {dataset.status === 'processing' && <Clock className="h-3 w-3" />}
                            {dataset.status === 'failed' && <AlertCircle className="h-3 w-3" />}
                            {dataset.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/40 text-sm">{formatDate(dataset.uploaded_at)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPreviewDataset(dataset)}
                              className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Preview"
                            >
                              <Activity className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this dataset?')) {
                                  deleteDatasetMutation.mutate(dataset.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Import from URL Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import from URL"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-white/50">
            Enter a URL to a CSV, JSON, or Excel file to import as a dataset.
          </p>
          <input
            type="url"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://example.com/dataset.csv"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImportUrl}
              disabled={!importUrl.trim()}
              icon={<Download className="w-4 h-4" />}
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewDataset}
        onClose={() => setPreviewDataset(null)}
        title={`Preview: ${previewDataset?.name ?? ''}`}
        size="xl"
      >
        {preview ? (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  {preview.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-white/50 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-white/5">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-white/60 whitespace-nowrap">
                        {cell ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-white/10 border-t-blue-500 rounded-full" />
          </div>
        )}
      </Modal>
    </div>
  );
}

function getAuthToken(): string {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token ?? '';
    }
  } catch {}
  return '';
}
