'use client';

import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { marked } from 'marked';
import mammoth from 'mammoth';

export default function FileUploadModal({ isOpen, onClose, onImport, isEditorOpen }) {
  const [file, setFile] = useState(null);
  const [importMode, setImportMode] = useState(isEditorOpen ? 'append' : 'new');
  const [error, setError] = useState(null);
  const [parsing, setParsing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();

      if (ext !== 'txt' && ext !== 'md' && ext !== 'docx') {
        setError('Only .txt, .md, and .docx files are supported.');
        setFile(null);
        return;
      }

      setError(null);
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setParsing(true);
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const docTitle = file.name.replace(/\.[^/.]+$/, '');

    try {
      if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        onImport(docTitle, result.value || '<p></p>', importMode);
        onClose();
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const rawText = e.target?.result || '';
          let htmlContent = '';

          if (ext === 'md') {
            htmlContent = marked.parse(rawText);
          } else {
            htmlContent = rawText
              .split('\n\n')
              .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
              .join('');
          }

          onImport(docTitle, htmlContent, importMode);
          onClose();
        };
        reader.readAsText(file);
      }
    } catch (err) {
      setError(`Failed to parse ${file.name}: ${err.message}`);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Import Document (.txt / .md / .docx)</div>
          <button className="toolbar-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px 16px', textAlign: 'center', backgroundColor: 'var(--bg-main)', cursor: 'pointer' }}>
          <input
            type="file"
            accept=".txt,.md,.docx"
            id="file-upload-input"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <Upload size={32} className="text-muted" />
            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
              {file ? file.name : 'Click to select a .txt, .md, or .docx file'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Supported formats: Plain Text (.txt), Markdown (.md), Word Document (.docx)
            </span>
          </label>
        </div>

        {isEditorOpen && (
          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Import Action:
            </label>
            <select
              className="select-input"
              style={{ width: '100%' }}
              value={importMode}
              onChange={(e) => setImportMode(e.target.value)}
            >
              <option value="new">Create as new document</option>
              <option value="append">Append into current document</option>
            </select>
          </div>
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleUpload} disabled={!file || parsing}>
            <FileText size={16} /> {parsing ? 'Importing...' : 'Import File'}
          </button>
        </div>
      </div>
    </div>
  );
}
