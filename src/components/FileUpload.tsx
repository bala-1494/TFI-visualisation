import { useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
}

export function FileUpload({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      className="upload-zone"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
    >
      <UploadCloud size={48} />
      <p>Drop a <strong>.csv</strong>, <strong>.xls</strong>, or <strong>.xlsx</strong> file here</p>
      <p className="upload-hint">or click to browse</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        hidden
        onChange={handleChange}
      />
    </div>
  );
}
