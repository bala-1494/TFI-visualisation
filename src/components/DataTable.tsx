import type { ParsedFile } from "../types/data";

interface Props {
  data: ParsedFile;
}

export function DataTable({ data }: Props) {
  const preview = data.rows.slice(0, 10);

  return (
    <div className="table-wrapper">
      <h2>Preview — {data.fileName}</h2>
      <p className="row-count">{data.rows.length} rows · {data.headers.length} columns</p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {data.headers.map((h) => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i}>
                {data.headers.map((h) => <td key={h}>{String(row[h] ?? "")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.rows.length > 10 && (
        <p className="row-count">…and {data.rows.length - 10} more rows</p>
      )}
    </div>
  );
}
