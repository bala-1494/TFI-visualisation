import { FileUpload } from "./components/FileUpload";
import { DataTable } from "./components/DataTable";
import { ChartPlaceholder } from "./components/ChartPlaceholder";
import { useFileData } from "./hooks/useFileData";
import { RefreshCw } from "lucide-react";
import "./index.css";

export default function App() {
  const { data, loading, error, load, reset } = useFileData();

  return (
    <div className="app">
      <header className="app-header">
        <h1>TFI Visualisation</h1>
        {data && (
          <button className="reset-btn" onClick={reset}>
            <RefreshCw size={16} /> New file
          </button>
        )}
      </header>

      <main className="app-main">
        {!data && !loading && (
          <FileUpload onFile={load} />
        )}

        {loading && <p className="status">Parsing file…</p>}

        {error && (
          <div className="error-box">
            <p>{error}</p>
            <button onClick={reset}>Try again</button>
          </div>
        )}

        {data && (
          <>
            <DataTable data={data} />
            <ChartPlaceholder />
          </>
        )}
      </main>
    </div>
  );
}
