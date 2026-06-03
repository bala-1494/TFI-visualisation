import { useRef, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileText, AlertCircle, Loader2 } from "lucide-react";
import { parseAndProcessCSV } from "../logic/parseCSV";
import type { ProcessedAlumni, QualityReport } from "../types/Alumni";

interface Props {
  onComplete: (data: ProcessedAlumni[], quality: QualityReport) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ onComplete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function acceptFile(f: File) {
    if (!f.name.endsWith(".csv")) {
      setError("Only .csv files are supported.");
      return;
    }
    setFile(f);
    setError(null);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  }

  function handleProcess() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    parseAndProcessCSV(
      file,
      (data, quality) => {
        setProcessing(false);
        console.log("First 5 processed alumni:", data.slice(0, 5).map((a) => ({
          name: a["Full Name"],
          socialTier: a.socialTier,
          changeMakerTier: a.changeMakerTier,
          subgroups: a.subgroups,
        })));
        onComplete(data, quality);
      },
      (err) => {
        setProcessing(false);
        setError(err);
      }
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Drop zone */}
      <div
        className={`w-full border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors
          ${dragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40"
          }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud
          size={48}
          className={dragging ? "text-indigo-500" : "text-gray-400"}
        />
        <div className="text-center">
          <p className="font-medium text-gray-700">
            Drop your alumni CSV here
          </p>
          <p className="text-sm text-gray-400 mt-1">or click to browse</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          .csv files only
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          hidden
          onChange={handleChange}
        />
      </div>

      {/* Selected file info */}
      {file && (
        <div className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
          <FileText size={20} className="text-indigo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
          </div>
          <button
            className="text-xs text-gray-400 hover:text-gray-600"
            onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }}
          >
            Remove
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="w-full flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Process button */}
      <button
        disabled={!file || processing}
        onClick={handleProcess}
        className={`w-full py-3 rounded-lg font-semibold text-white transition-colors
          ${!file || processing
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
          }`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Processing…
          </span>
        ) : (
          "Process File"
        )}
      </button>
    </div>
  );
}
