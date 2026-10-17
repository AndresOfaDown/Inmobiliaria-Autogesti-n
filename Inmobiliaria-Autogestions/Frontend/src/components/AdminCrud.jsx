import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RotateCcw, Plus, Search, ChevronLeft, ChevronRight,
  Pencil, Trash2, AlertCircle, Download, ChevronDown
} from 'lucide-react';
import api from '../services/api';
import useAlertConfirm from '../hooks/useAlertConfirm';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

const AdminCrud = ({ title, subtitle, endpoint, columns, formFields, idKey = 'id', transformPayload, transformEditItem }) => {
  const { showAlert, showConfirm, ModalComponent } = useAlertConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 10;

  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportRef = useRef(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const aiDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportDropdownOpen(false);
      }
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(e.target)) {
        setAiDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const triggerAiExport = async (format) => {
    if (!aiPrompt.trim()) return;
    setAiDropdownOpen(false);
    setAiLoading(true);
    try {
      const cleanColumns = columns.map(c => ({ label: c.label, key: c.key }));
      const payload = {
        prompt: aiPrompt,
        data: items,
        columns: cleanColumns,
        title: title
      };

      const res = await api.post('/inmuebles/reporte-ia/', payload);
      if (res.data && res.data.datos) {
        const filteredData = res.data.datos;
        const summary = res.data.resumen || 'Reporte procesado por IA.';

        // Determinar qué columnas están activas en el resultado
        const activeKeys = new Set();
        filteredData.forEach(item => {
          Object.keys(item).forEach(k => activeKeys.add(k));
        });
        const exportColumns = columns.filter(col => activeKeys.has(col.key));
        const finalColumns = exportColumns.length > 0 ? exportColumns : columns;

        if (format === 'txt') {
          let content = `${title.toUpperCase()} - REPORTE DE IA\n`;
          content += `Fecha de generación: ${new Date().toLocaleString()}\n`;
          content += `Instrucción: "${aiPrompt}"\n`;
          content += `Resumen IA: ${summary}\n`;
          content += `Total registros: ${filteredData.length}\n\n`;

          const headerLine = finalColumns.map(col => col.label).join('\t');
          content += headerLine + '\n' + '='.repeat(headerLine.length * 2) + '\n';

          filteredData.forEach(item => {
            const row = finalColumns.map(col => {
              const val = item[col.key];
              return val != null ? String(val).replace(/\n/g, ' ') : '';
            }).join('\t');
            content += row + '\n';
          });

          downloadFile(content, `${title.toLowerCase()}_reporte_ia.txt`, 'text/plain;charset=utf-8');
        } 
        else if (format === 'xlsx') {
          const dataRows = filteredData.map(item => {
            const row = {};
            finalColumns.forEach(col => {
              let val = item[col.key];
              if (typeof val === 'boolean') {
                val = val ? 'Sí' : 'No';
              }
              row[col.label] = val ?? '—';
            });
            return row;
          });

          const worksheet = XLSX.utils.json_to_sheet(dataRows);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, title);
          XLSX.writeFile(workbook, `${title.toLowerCase()}_reporte_ia.xlsx`);
        } 
        else if (format === 'pdf') {
          const element = document.createElement('div');
          element.style.padding = '24px';
          element.style.fontFamily = 'Arial, sans-serif';
          element.style.color = '#0f172a';

          element.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 12px; margin-bottom: 20px;">
              <div>
                <h1 style="margin: 0; font-size: 20px; color: #0f172a;">Autogestión Inmobiliaria</h1>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Reporte de ${title} (Filtrado por IA)</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 11px; color: #64748b;">Fecha: ${new Date().toLocaleString()}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Registros: ${filteredData.length}</p>
              </div>
            </div>
            
            <div style="background-color: #f3e8ff; border-left: 4px solid #a855f7; padding: 12px; margin-bottom: 20px; font-size: 11px; border-radius: 6px; color: #581c87;">
              <strong>Resumen de Análisis (IA):</strong>
              <p style="margin: 4px 0 0 0; line-height: 1.4; color: #0f172a;">${summary}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  ${finalColumns.map(col => `<th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; color: #334155; font-weight: bold;">${col.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${filteredData.map(item => `
                  <tr>
                    ${finalColumns.map(col => {
                      let val = item[col.key];
                      if (typeof val === 'boolean') val = val ? 'Sí' : 'No';
                      return `<td style="padding: 8px; border: 1px solid #cbd5e1; color: #0f172a;">${val ?? '—'}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;

          const opt = {
            margin: 10,
            filename: `${title.toLowerCase()}_reporte_ia.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
          };

          html2pdf().from(element).set(opt).save();
        }

        showAlert({
          title: 'Reporte Generado',
          message: 'El reporte de IA se ha descargado exitosamente.',
          status: 'success'
        });
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'No se pudo generar el reporte.';
      showAlert({
        title: 'Error de IA',
        message: msg,
        status: 'error'
      });
    } finally {
      setAiLoading(false);
    }
  };

  const downloadFile = (content, fileName, contentType) => {
    const file = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const exportToTxt = () => {
    let content = `${title.toUpperCase()} - REPORTE GENERAL\n`;
    content += `Fecha de generación: ${new Date().toLocaleString()}\n`;
    content += `Total registros: ${filtered.length}\n\n`;

    // Headers
    const headerLine = columns.map(col => col.label).join('\t');
    content += headerLine + '\n' + '='.repeat(headerLine.length * 2) + '\n';

    // Rows
    filtered.forEach(item => {
      const row = columns.map(col => {
        const val = item[col.key];
        return val != null ? String(val).replace(/\n/g, ' ') : '';
      }).join('\t');
      content += row + '\n';
    });

    downloadFile(content, `${title.toLowerCase()}_reporte.txt`, 'text/plain;charset=utf-8');
  };

  const exportToExcel = () => {
    const data = filtered.map(item => {
      const row = {};
      columns.forEach(col => {
        let val = item[col.key];
        if (typeof val === 'boolean') {
          val = val ? 'Sí' : 'No';
        }
        row[col.label] = val ?? '—';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title.toLowerCase()}_reporte.xlsx`);
  };

  const exportToPdf = () => {
    const element = document.createElement('div');
    element.style.padding = '24px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.color = '#0f172a';

    element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 12px; margin-bottom: 24px;">
        <div>
          <h1 style="margin: 0; font-size: 20px; color: #0f172a;">Autogestión Inmobiliaria</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Reporte de ${title}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 11px; color: #64748b;">Fecha: ${new Date().toLocaleString()}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Registros: ${filtered.length}</p>
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            ${columns.map(col => `<th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; color: #334155; font-weight: bold;">${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${filtered.map(item => `
            <tr>
              ${columns.map(col => {
                let val = item[col.key];
                if (typeof val === 'boolean') val = val ? 'Sí' : 'No';
                return `<td style="padding: 8px; border: 1px solid #cbd5e1; color: #0f172a;">${val ?? '—'}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const opt = {
      margin: 10,
      filename: `${title.toLowerCase()}_reporte.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      const data = res.data.results || res.data;
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => (b[idKey] || 0) - (a[idKey] || 0))
        : data;
      setItems(sorted);
    } catch (err) {
      console.error('Error fetching:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, idKey]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filtered = items.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return columns.some(col => {
      const val = item[col.key];
      return val != null && String(val).toLowerCase().includes(term);
    });
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openCreate = () => {
    setEditItem(null);
    const initial = {};
    formFields.forEach(f => { initial[f.key] = f.defaultValue ?? ''; });
    setFormData(initial);
    setError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const initial = {};
    const processedItem = transformEditItem ? transformEditItem(item) : item;
    formFields.forEach(f => { initial[f.key] = processedItem[f.key] ?? ''; });
    setFormData(initial);
    setError('');
    setShowModal(true);
  };

  const handleDelete = (item) => {
    showConfirm({
      title: `¿Eliminar Registro?`,
      message: `¿Estás seguro de que deseas eliminar este registro de ${title} permanentemente?`,
      status: 'error',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await api.delete(`${endpoint}${item[idKey]}/`);
          fetchItems();
          showAlert({ title: 'Registro Eliminado', message: 'El registro ha sido eliminado del sistema con éxito.', status: 'success' });
        } catch (err) {
          const msg = err.response?.data?.error || err.response?.data?.detail || 'Error desconocido';
          showAlert({ title: 'Error al Eliminar', message: `No se pudo eliminar el registro: ${msg}`, status: 'error' });
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = transformPayload ? transformPayload(formData) : formData;
      if (editItem) {
        await api.patch(`${endpoint}${editItem[idKey]}/`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      setShowModal(false);
      fetchItems();
      showAlert({
        title: editItem ? 'Registro Actualizado' : 'Registro Creado',
        message: editItem ? 'Los cambios han sido guardados correctamente.' : 'El nuevo registro ha sido guardado exitosamente.',
        status: 'success'
      });
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
        setError(msgs.join(' | '));
      } else {
        setError('Error de conexión');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value, type) => {
    if (type === 'number' && value) {
      value = String(value).replace(/^-/, '');
      if (Number(value) < 0) return;
    }
    setFormData(prev => {
      const newData = { ...prev, [key]: value };
      if (key === 'largo' || key === 'ancho') {
        const l = parseFloat(newData.largo);
        const a = parseFloat(newData.ancho);
        if (!isNaN(l) && !isNaN(a)) {
          newData.superficie = (l * a).toFixed(2);
        } else {
          newData.superficie = '';
        }
      }
      return newData;
    });
  };

  /* ─── Action Buttons ─────────────────────────────── */
  const ActionButtons = ({ item }) => (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
      <button
        onClick={() => openEdit(item)}
        title="Editar"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '6px 12px', borderRadius: '8px',
          background: 'rgba(14, 165, 233, 0.12)', color: 'var(--color-primary-light)',
          border: '1px solid rgba(14, 165, 233, 0.25)', cursor: 'pointer',
          fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.12)'}
      >
        <Pencil size={13} /> Editar
      </button>
      <button
        type="button"
        onClick={() => handleDelete(item)}
        title="Eliminar"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '6px 12px', borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-danger)',
          border: '1px solid rgba(239, 68, 68, 0.25)', cursor: 'pointer',
          fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
      >
        <Trash2 size={13} /> Eliminar
      </button>
    </div>
  );

  return (
    <>
      {/* ─── Embedded responsive CSS ─────────────────── */}
      <style>{`
        .admin-crud-container {
          background: var(--color-bg-card);
          padding: clamp(14px, 3vw, 24px);
          border-radius: 16px;
          border: 1px solid var(--color-border);
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .admin-crud-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .admin-crud-header-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .admin-crud-title {
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          font-weight: 700;
          color: var(--color-text);
          margin: 0 0 4px 0;
        }
        .admin-crud-subtitle {
          color: var(--color-text-secondary);
          font-size: 0.85rem;
          margin: 0;
        }
        /* ─── Search bar ── */
        .admin-crud-searchbar {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .admin-crud-search-wrap {
          position: relative;
          flex: 1;
          min-width: 180px;
        }
        .admin-crud-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
          pointer-events: none;
        }
        .admin-crud-search-input {
          width: 100%;
          padding: 10px 14px 10px 40px;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          font-size: 0.875rem;
          background: var(--color-bg-secondary);
          color: var(--color-text);
          outline: none;
          transition: border 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .admin-crud-search-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(14,165,233,0.12);
        }
        /* ─── Desktop Table ── */
        .admin-crud-table-wrap {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          -webkit-overflow-scrolling: touch;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .admin-crud-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 520px;
        }
        .admin-crud-table th {
          padding: 11px 14px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .admin-crud-table td {
          padding: 11px 14px;
          font-size: 0.85rem;
          color: var(--color-text);
          border-bottom: 1px solid var(--color-border);
          vertical-align: middle;
        }
        .admin-crud-table tr:last-child td {
          border-bottom: none;
        }
        /* ─── Pagination ── */
        .admin-crud-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }
        /* ─── Shared buttons ── */
        .admin-btn-primary {
          padding: 8px 16px;
          background: var(--color-primary);
          color: #fff;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          white-space: nowrap;
          font-family: inherit;
        }
        .admin-btn-primary:hover { background: var(--color-primary-dark); }
        .admin-btn-secondary {
          padding: 8px 16px;
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          white-space: nowrap;
          font-family: inherit;
        }
        .admin-btn-secondary:hover { 
          background: var(--color-bg-hover); 
          color: var(--color-text);
        }
        .admin-page-btn {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-bg-card);
          color: var(--color-text-secondary);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.15s;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
        }
        .admin-page-btn.active {
          background: var(--color-primary);
          color: #fff;
          border-color: var(--color-primary);
          font-weight: 700;
        }
        .admin-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        /* ─── Modal ── */
        .admin-crud-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: clamp(12px, 4vw, 24px);
          overflow-y: auto;
        }
        .admin-crud-modal {
          background: var(--color-bg-card);
          border-radius: 20px;
          padding: clamp(16px, 4vw, 28px);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          animation: adminModalIn 0.22s ease;
        }
        @keyframes adminModalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .admin-crud-modal-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0 0 20px 0;
          color: var(--color-text);
        }
        .admin-crud-field-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .admin-crud-field-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          font-size: 0.9rem;
          margin-bottom: 14px;
          box-sizing: border-box;
          outline: none;
          transition: border 0.2s;
          font-family: inherit;
          background: var(--color-bg-card);
          color: var(--color-text);
        }
        .admin-crud-field-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(14,165,233,0.12);
        }
        .admin-crud-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          color: #dc2626;
          margin-bottom: 16px;
          font-size: 0.8rem;
        }
        .admin-crud-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .admin-crud-export-wrap {
          position: relative;
        }
        .admin-crud-export-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 6px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          box-shadow: var(--shadow-lg);
          z-index: 100;
          min-width: 140px;
          display: flex;
          flex-direction: column;
          padding: 6px 0;
          overflow: hidden;
        }
        .admin-crud-export-menu button {
          background: none;
          border: none;
          padding: 8px 16px;
          text-align: left;
          font-size: 0.85rem;
          color: var(--color-text);
          cursor: pointer;
          width: 100%;
          transition: background 0.15s;
        }
        .admin-crud-export-menu button:hover {
          background: var(--color-bg-hover);
          color: var(--color-primary);
        }
      `}</style>

      <div className="admin-crud-container">
        {/* ─── Header ──────────────────────────────── */}
        <div className="admin-crud-header">
          <div>
            <h1 className="admin-crud-title">{title}</h1>
            <p className="admin-crud-subtitle">{subtitle}</p>
          </div>
          <div className="admin-crud-header-actions">
            <div className="admin-crud-export-wrap" ref={exportRef}>
              <button
                className="admin-btn-secondary"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={15} /> Exportar <ChevronDown size={14} />
              </button>
              {exportDropdownOpen && (
                <div className="admin-crud-export-menu">
                  <button type="button" onClick={() => { exportToTxt(); setExportDropdownOpen(false); }}>Texto (.txt)</button>
                  <button type="button" onClick={() => { exportToExcel(); setExportDropdownOpen(false); }}>Excel (.xlsx)</button>
                  <button type="button" onClick={() => { exportToPdf(); setExportDropdownOpen(false); }}>PDF (.pdf)</button>
                </div>
              )}
            </div>
            <button className="admin-btn-secondary" onClick={fetchItems}>
              <RotateCcw size={15} /> Actualizar
            </button>
            <button className="admin-btn-primary" onClick={openCreate}>
              <Plus size={15} /> Crear
            </button>
          </div>
        </div>

        {/* ─── Search & AI Prompt ──────────────────── */}
        <div className="admin-crud-searchbar">
          <div className="admin-crud-search-wrap">
            <Search size={17} className="admin-crud-search-icon" />
            <input
              className="admin-crud-search-input"
              type="text"
              placeholder="Buscar en todos los campos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flex: 1.5, minWidth: '320px', flexWrap: 'nowrap' }}>
            <input
              className="admin-crud-search-input"
              style={{ paddingLeft: '14px', borderColor: 'var(--color-primary-light)' }}
              type="text"
              placeholder="Ej: Ordenar por nombre, o filtrar registrados en enero..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              disabled={aiLoading}
            />
            <div className="admin-crud-export-wrap" ref={aiDropdownRef}>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
                disabled={aiLoading || !aiPrompt.trim()}
                style={{ background: 'linear-gradient(135deg, var(--color-primary), #a855f7)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', height: '100%' }}
              >
                {aiLoading ? 'Procesando...' : 'IA Reporte'} <ChevronDown size={14} />
              </button>
              {aiDropdownOpen && (
                <div className="admin-crud-export-menu" style={{ left: 0, right: 'auto' }}>
                  <button type="button" onClick={() => triggerAiExport('txt')}>Exportar TXT</button>
                  <button type="button" onClick={() => triggerAiExport('xlsx')}>Exportar Excel</button>
                  <button type="button" onClick={() => triggerAiExport('pdf')}>Exportar PDF</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Cargando...</p>
        ) : (
          <>
            {/* ─── Desktop Table ─────────────────────── */}
            <div className="admin-crud-table-wrap">
              <table className="admin-crud-table">
                <thead>
                  <tr>
                    {columns.map(col => <th key={col.key}>{col.label}</th>)}
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(item => (
                    <tr
                      key={item[idKey]}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      {columns.map(col => (
                        <td key={col.key}>
                          {col.render ? col.render(item) : (item[col.key] ?? '—')}
                        </td>
                      ))}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <ActionButtons item={item} />
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                        No hay registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>



            {/* ─── Pagination ────────────────────────── */}
            <div className="admin-crud-pagination">
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
              </span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button
                  className="admin-page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`admin-page-btn${p === currentPage ? ' active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="admin-page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── Modal ───────────────────────────────────── */}
      {showModal && (
        <div className="admin-crud-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-crud-modal" onClick={e => e.stopPropagation()}>
            <h2 className="admin-crud-modal-title">
              {editItem ? `Editar ${title}` : `Crear ${title}`}
            </h2>
            {error && (
              <div className="admin-crud-error">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {formFields.map(field => (
                <div key={field.key}>
                  <label className="admin-crud-field-label">
                    {field.label}{field.required !== false && ' *'}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      className="admin-crud-field-input"
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value, field.type)}
                      required={field.required !== false}
                    >
                      <option value="">— Seleccionar —</option>
                      {(field.options || []).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="admin-crud-field-input"
                      style={{ minHeight: '80px', resize: 'vertical' }}
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value, field.type)}
                      placeholder={field.placeholder || ''}
                      required={field.required !== false}
                    />
                  ) : field.key === 'superficie' ? (
                    <input
                      className="admin-crud-field-input"
                      style={{ background: '#f8fafc', color: '#64748b', fontWeight: 600 }}
                      type="text"
                      value={formData[field.key] || ''}
                      disabled
                      placeholder={field.placeholder || ''}
                    />
                  ) : field.type === 'boolean' ? (
                    <select
                      className="admin-crud-field-input"
                      value={formData[field.key] === true || formData[field.key] === 'true' ? 'true' : 'false'}
                      onChange={e => handleChange(field.key, e.target.value === 'true', field.type)}
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      className="admin-crud-field-input"
                      type={field.type || 'text'}
                      min={field.type === 'number' ? '0' : undefined}
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value, field.type)}
                      placeholder={field.placeholder || ''}
                      required={field.required !== false}
                      step={field.type === 'number' ? 'any' : undefined}
                    />
                  )}
                </div>
              ))}
              <div className="admin-crud-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editItem ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {ModalComponent}
    </>
  );
};

export default AdminCrud;
