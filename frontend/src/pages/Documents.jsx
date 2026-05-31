import { useEffect, useState, useRef } from "react";
import { Navbar } from "../components";
import { getDocuments, uploadDocument } from "../api";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const fetchDocs = async () => {
    const { data } = await getDocuments();
    setDocs(data);
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      await uploadDocument(fd);
      setMsg("Document uploaded and indexing in background.");
      setMsgType("success");
      setTitle(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      fetchDocs();
    } catch (err) {
      setMsg(err.response?.data?.detail || "Upload failed.");
      setMsgType("error");
    } finally {
      setUploading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .doc-page {
          min-height: 100vh;
          background: #080d14;
          color: #c9d4e8;
          font-family: 'DM Sans', sans-serif;
        }

        .doc-body {
          max-width: 1140px;
          margin: 0 auto;
          padding: 40px 28px;
        }

        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #3b82f6;
          margin-bottom: 6px;
        }

        .section-title {
          font-size: 22px;
          font-weight: 600;
          color: #e8edf5;
          margin-bottom: 24px;
        }

        /* Upload Card */
        .upload-card {
          background: #0d1520;
          border: 1px solid #1a2640;
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 48px;
          position: relative;
          overflow: hidden;
        }

        .upload-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #0ea5e9, transparent);
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 14px;
          align-items: end;
        }

        @media (max-width: 700px) {
          .upload-grid { grid-template-columns: 1fr; }
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 11px;
          font-weight: 500;
          color: #4b6a99;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .field-input {
          background: #060b12;
          border: 1px solid #1a2640;
          border-radius: 10px;
          padding: 11px 16px;
          color: #c9d4e8;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }

        .field-input:focus {
          border-color: #3b82f6;
        }

        .field-input::placeholder {
          color: #2a3a54;
        }

        /* Drop zone */
        .drop-zone {
          background: #060b12;
          border: 1.5px dashed #1a2640;
          border-radius: 10px;
          padding: 11px 16px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 44px;
        }

        .drop-zone.active {
          border-color: #3b82f6;
          background: #0a1829;
        }

        .drop-zone input[type="file"] {
          display: none;
        }

        .drop-text {
          font-size: 13px;
          color: #4b6a99;
        }

        .drop-text.chosen {
          color: #7dd3fc;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
        }

        .upload-btn {
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 11px 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s, transform 0.1s;
          height: 44px;
        }

        .upload-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .upload-btn:active:not(:disabled) {
          transform: scale(0.97);
        }

        .upload-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .msg-bar {
          margin-top: 14px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .msg-bar.success {
          background: #0d2318;
          color: #4ade80;
          border: 1px solid #14532d;
        }

        .msg-bar.error {
          background: #1f0d0d;
          color: #f87171;
          border: 1px solid #450a0a;
        }

        /* Docs grid */
        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .doc-card {
          background: #0d1520;
          border: 1px solid #1a2640;
          border-radius: 14px;
          padding: 20px;
          transition: border-color 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }

        .doc-card:hover {
          border-color: #2a4070;
          transform: translateY(-2px);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .file-badge {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          background: #0f1e30;
          border: 1px solid #1e3450;
          color: #7dd3fc;
          padding: 3px 9px;
          border-radius: 5px;
          letter-spacing: 0.05em;
        }

        .status-badge {
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .status-badge.indexed { color: #4ade80; }
        .status-badge.indexing { color: #f59e0b; }

        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.indexed { background: #4ade80; }

        .status-dot.indexing {
          background: #f59e0b;
          animation: pulse 1.2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-filename {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #2a4070;
          margin-bottom: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-preview {
          font-size: 12px;
          color: #4b6a99;
          line-height: 1.6;
          margin-bottom: 14px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #111e30;
        }

        .card-date {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #2a4070;
        }

        .empty-state {
          grid-column: 1/-1;
          text-align: center;
          padding: 60px 20px;
          color: #1e3450;
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
          opacity: 0.4;
        }

        .empty-text {
          font-size: 14px;
          color: #2a4070;
        }
      `}</style>

      <div className="doc-page">
        <Navbar />
        <div className="doc-body">

          {/* Upload Section */}
          <div className="upload-card">
            <p className="section-label">Knowledge Base</p>
            <h2 className="section-title">Upload Document</h2>

            <form onSubmit={handleUpload}>
              <div className="upload-grid">
                <div className="field-group">
                  <label className="field-label">Document Title</label>
                  <input
                    className="field-input"
                    placeholder="e.g. Q2 Financial Report"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">File</label>
                  <div
                    className={`drop-zone ${dragOver ? "active" : ""}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".txt,.pdf"
                      onChange={e => setFile(e.target.files[0])}
                    />
                    <span style={{ fontSize: 16, opacity: 0.5 }}>📎</span>
                    <span className={`drop-text ${file ? "chosen" : ""}`}>
                      {file ? file.name : "Click or drag to attach (.txt, .pdf)"}
                    </span>
                  </div>
                </div>

                <button className="upload-btn" type="submit" disabled={uploading}>
                  {uploading ? "Uploading…" : "Upload & Index"}
                </button>
              </div>

              {msg && (
                <div className={`msg-bar ${msgType}`}>{msg}</div>
              )}
            </form>
          </div>

          {/* Documents Grid */}
          <p className="section-label">All Documents</p>
          <h2 className="section-title" style={{ marginBottom: 20 }}>Knowledge Base</h2>

          <div className="docs-grid">
            {docs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗂️</div>
                <p className="empty-text">No documents uploaded yet.</p>
              </div>
            ) : docs.map(d => (
              <div key={d.id} className="doc-card">
                <div className="card-top">
                  <span className="file-badge">.{d.file_type}</span>
                  <span className={`status-badge ${d.is_indexed ? "indexed" : "indexing"}`}>
                    <span className={`status-dot ${d.is_indexed ? "indexed" : "indexing"}`} />
                    {d.is_indexed ? "Indexed" : "Indexing"}
                  </span>
                </div>
                <div className="card-title">{d.title}</div>
                <div className="card-filename">{d.filename}</div>
                {d.content_preview && (
                  <div className="card-preview">{d.content_preview}</div>
                )}
                <div className="card-footer">
                  <span className="card-date">
                    {new Date(d.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
