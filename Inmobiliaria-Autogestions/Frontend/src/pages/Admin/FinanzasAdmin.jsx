import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { TrendingUp, Settings, DollarSign, FileText, FileSpreadsheet, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import reportesService from '../../services/reportesService';
import configuracionService from '../../services/configuracionService';
import FiltroReportes from '../../components/FiltroReportes';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import './Finanzas.css';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

/** Renderiza etiqueta EXTERNA para cada segmento del Pie (porcentaje fuera del pastel) */
const renderEtiquetaPie = ({ cx, cy, midAngle, outerRadius, percent, index }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const labelText = `${(percent * 100).toFixed(0)}%`;
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fill={COLORS[index % COLORS.length]}
      fontSize={13}
      fontWeight={800}
    >
      {labelText}
    </text>
  );
};

const FinanzasAdmin = () => {
  const [reportData, setReportData] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [filtros, setFiltros] = useState({ rango: 'ultimos_12_meses' });
  const [nuevaComision, setNuevaComision] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    fetchData();
  }, [filtros]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resReportes, resConfig] = await Promise.all([
        reportesService.obtenerReportes(filtros),
        configuracionService.obtenerConfiguracion()
      ]);
      setReportData(resReportes);
      setConfig(resConfig);
      setNuevaComision(resConfig?.porcentaje_comision_plataforma || '');
    } catch (err) {
      console.error("Error fetching admin finances:", err);
      setError("No se pudo cargar la información financiera. Verifica la conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    if (!config?.id) {
      setMensaje({ texto: 'Error: No se detectó el identificador de configuración. Por favor, recarga la página.', tipo: 'error' });
      return;
    }
    setSavingConfig(true);
    setMensaje({ texto: '', tipo: '' });
    try {
      const updated = await configuracionService.actualizarConfiguracion(config.id, {
        porcentaje_comision_plataforma: parseFloat(nuevaComision)
      });
      setConfig(updated);
      setMensaje({ texto: 'Comisión actualizada correctamente', tipo: 'success' });
      
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
    } catch (error) {
      console.error("Error updating config:", error);
      setMensaje({ texto: 'Error al actualizar la configuración', tipo: 'error' });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDownloadExcel = () => {
    setExportingExcel(true);
    try {
      const anio = filtros.anio || new Date().getFullYear();
      const mesNum = filtros.mes;
      const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mesNombre = mesNum ? mesesNombres[parseInt(mesNum) - 1] : 'Todos los meses';
      
      const ciudad = filtros.ciudad || 'Todas las ciudades';
      const tipoContrato = filtros.tipo_contrato ? 'Filtrado' : 'Todos los contratos';

      const encabezado = [
        [`Reporte de Comisiones — Gestión ${anio}${mesNum ? ` (${mesNombre})` : ''}`],
        [`Ciudad: ${ciudad}  |  Contrato: ${tipoContrato}  |  Generado: ${new Date().toLocaleDateString('es-BO')}`],
        [],
      ];

      const detalles = (reportData?.tabla_detalles || []);
      const filasDatos = detalles.map(fila => ([
        fila.fecha,
        fila.inmueble,
        fila.ciudad,
        fila.tipo_contrato,
        fila.inquilino,
        fila.monto,
      ]));

      const totalMonto = detalles.reduce((acc, fila) => acc + (fila.monto || 0), 0);

      const ws = XLSX.utils.aoa_to_sheet([
        ...encabezado,
        ['Fecha', 'Inmueble', 'Ciudad', 'Tipo Contrato', 'Inquilino', 'Ingreso (Bs)'],
        ...filasDatos,
        [],
        ['', '', '', '', 'TOTAL:', totalMonto],
      ]);

      ws['!cols'] = [
        { wch: 14 },
        { wch: 30 },
        { wch: 18 },
        { wch: 18 },
        { wch: 22 },
        { wch: 16 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Detalle Comisiones');

      XLSX.writeFile(wb, `reporte_comisiones_${anio}_${mesNombre.replace(/ /g, '_')}_${ciudad.replace(/ /g, '_')}.xlsx`);
    } catch (error) {
      console.error("Error exporting admin Excel:", error);
    } finally {
      setExportingExcel(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.querySelector('.print-container');
    if (!element) return;
    
    const opt = {
      margin:       [8, 8],
      filename:     `reporte_admin_financiero_${filtros.anio || new Date().getFullYear()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak:    { mode: ['css', 'legacy'], before: '.pdf-page-break' }
    };

    setExporting(true);
    element.classList.add('is-exporting');

    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove('is-exporting');
      setExporting(false);
    });
  };

  const formatterMonto = (value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value);

  const Skeleton = ({ width, height, borderRadius = '12px', style = {} }) => (
    <div style={{
      width, height, borderRadius, ...style,
      background: 'var(--color-border)',
      opacity: 0.5
    }} />
  );

  return (
    <div className="finanzas-container print-container">
      {/* Header */}
      <div className="finanzas-header">
        <div>
          <h1 className="finanzas-title">Análisis Financiero Global</h1>
          <p className="finanzas-subtitle">
            Monitoreo de ingresos por comisiones y configuración de parámetros transaccionales.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button
            className="btn-export no-print"
            onClick={handleDownloadPDF}
            disabled={exporting}
          >
            {exporting ? <Clock className="spin" size={16} /> : <FileText size={16} />}
            {exporting ? 'Generando...' : 'Exportar Informe PDF'}
          </button>

          <button
            className="btn-export no-print"
            onClick={handleDownloadExcel}
            disabled={exportingExcel}
          >
            {exportingExcel ? <Clock className="spin" size={16} /> : <FileSpreadsheet size={16} />}
            {exportingExcel ? 'Generando...' : 'Data Excel'}
          </button>
        </div>
      </div>
      
      <FiltroReportes onFilterChange={setFiltros} showInmuebleFilter={false} />

      {/* ===== ENCABEZADO EXCLUSIVO PARA PDF ===== */}
      <div className="pdf-header-admin print-only" style={{ display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--color-border)', paddingBottom: '10px', marginBottom: '14px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.5px' }}>
              REPORTE FINANCIERO GLOBAL
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
              Análisis de Ingresos por Comisiones de Plataforma
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Año Fiscal: {filtros.anio || new Date().getFullYear()} {filtros.mes ? `(${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][parseInt(filtros.mes)-1]})` : ''}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
              Generado: {new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
      {/* ===== FIN ENCABEZADO PDF ===== */}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={24} />
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600 }}>Error de Carga</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="pdf-kpi-grid kpi-grid">
        <div className="kpi-card" style={{ '--kpi-border': 'var(--color-success)', '--kpi-val-color': 'var(--color-success)' }}>
          <div className="kpi-card-icon" style={{ '--kpi-icon-bg': 'rgba(34, 197, 94, 0.1)', '--kpi-icon-color': 'var(--color-success)' }}>
            <DollarSign size={24} />
          </div>
          <p className="kpi-title">Ingresos por Comisiones</p>
          <div className="kpi-value">
            {loading ? <Skeleton width="120px" height="32px" /> : formatterMonto(reportData?.kpis?.total_ingreso_comisiones || 0)}
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-border': 'var(--color-primary)', '--kpi-val-color': 'var(--color-primary)' }}>
          <div className="kpi-card-icon" style={{ '--kpi-icon-bg': 'rgba(14, 165, 233, 0.1)', '--kpi-icon-color': 'var(--color-primary)' }}>
            <TrendingUp size={24} />
          </div>
          <p className="kpi-title">Pagos Procesados</p>
          <div className="kpi-value">
            {loading ? <Skeleton width="80px" height="32px" /> : (reportData?.kpis?.total_pagos_exitosos || 0)}
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-border': 'var(--color-warning)', '--kpi-val-color': 'var(--color-warning)' }}>
          <div className="kpi-card-icon" style={{ '--kpi-icon-bg': 'rgba(245, 158, 11, 0.1)', '--kpi-icon-color': 'var(--color-warning)' }}>
            <FileText size={24} />
          </div>
          <p className="kpi-title">Contratos Activos</p>
          <div className="kpi-value">
            {loading ? <Skeleton width="80px" height="32px" /> : (reportData?.kpis?.contratos_activos || 0)}
          </div>
        </div>
      </div>

      {/* Config Section */}
      <div className="config-section no-print">
        <div style={{ flex: '1', minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Settings size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Gestión de Comisiones</h3>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
            Ajusta el porcentaje global que la plataforma retiene por cada transacción.
          </p>
        </div>

        <div className="config-input-wrapper">
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
              Valor Actual
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="number" 
                step="0.1"
                className="config-input-actual" 
                value={nuevaComision}
                onChange={(e) => setNuevaComision(e.target.value)}
              />
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>%</span>
            </div>
          </div>

          <button 
            onClick={handleUpdateConfig}
            disabled={savingConfig || nuevaComision === ''}
            style={{ 
              background: 'var(--color-primary)', 
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {savingConfig ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <span>Guardando...</span>
              </>
            ) : 'Actualizar'}
          </button>
        </div>

        {mensaje.texto && (
          <div style={{ 
            width: '100%', 
            marginTop: '16px', 
            padding: '12px 16px', 
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: mensaje.tipo === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: mensaje.tipo === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            border: `1px solid ${mensaje.tipo === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`
          }}>
            {mensaje.tipo === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {mensaje.texto}
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="pdf-charts-section charts-grid">
        
        {/* Main Chart */}
        <div className="pdf-chart-bar chart-card span-2">
          <div className="chart-header">
            <TrendingUp size={20} color="var(--color-primary)" />
            <h2>Evolución de Ingresos (Comisiones)</h2>
          </div>

          <div style={{ height: 300, width: '100%', minWidth: 0 }}>
            {loading ? (
              <Skeleton width="100%" height="100%" borderRadius="8px" />
            ) : reportData?.grafico_evolucion?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={reportData?.grafico_evolucion}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="fecha"
                    stroke="var(--color-text-muted)"
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                    tickFormatter={(val) => {
                      if (!val || typeof val !== 'string') return val;
                      const parts = val.split('-');
                      
                      if (parts.length === 3) {
                        return parts[2];
                      }
                      
                      if (parts.length === 2) {
                        const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                        const m = parseInt(parts[1], 10);
                        return meses[m - 1] || val;
                      }
                      
                      return val;
                    }}
                  />
                  <YAxis stroke="var(--color-text-muted)" tickFormatter={(value) => `${value}`} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--color-bg-secondary)' }}
                    formatter={(value) => [formatterMonto(value), 'Comisión']}
                    contentStyle={{ 
                      background: 'var(--color-bg-card)', 
                      borderRadius: '12px', 
                      border: '1px solid var(--color-border)', 
                      color: 'var(--color-text)',
                      boxShadow: 'var(--shadow-md)' 
                    }}
                  />
                  <Bar dataKey="ingreso" radius={[4, 4, 0, 0]} barSize={40} fill="var(--color-primary)">
                    {(reportData?.grafico_evolucion || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-primary-dark)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                No hay datos suficientes para mostrar en este periodo.
              </div>
            )}
          </div>
        </div>
 
        {/* Pie Chart */}
        <div className="pdf-chart-pie chart-card">
          <div className="chart-header">
            <FileText size={20} color="#8b5cf6" />
            <h2>Ingresos por Tipo de Contrato</h2>
          </div>
 
          <div style={{ height: 300, width: '100%', minWidth: 0 }}>
            {loading ? (
              <Skeleton width="100%" height="100%" borderRadius="8px" />
            ) : reportData?.grafico_contratos?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
                  <Pie
                    data={reportData?.grafico_contratos}
                    dataKey="ingreso"
                    nameKey="contrato"
                    cx="50%"
                    cy="45%"
                    outerRadius={85}
                    labelLine={{ stroke: 'var(--color-text-muted)', strokeWidth: 1 }}
                    label={renderEtiquetaPie}
                  >
                    {(reportData?.grafico_contratos || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--color-bg-card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatterMonto(value), 'Ingresos']}
                    contentStyle={{ 
                      background: 'var(--color-bg-card)', 
                      borderRadius: '10px', 
                      border: '1px solid var(--color-border)', 
                      color: 'var(--color-text)',
                      boxShadow: 'var(--shadow-md)', 
                      fontSize: '0.85rem' 
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="square"
                    iconSize={12}
                    formatter={(value) => (
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center' }}>
                No hay datos suficientes para segmentar por tipo de contrato.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="pdf-table-section table-section no-print">
        <div className="table-header">
          <FileSpreadsheet size={20} color="var(--color-success)" />
          <h2>Detalle de Comisiones (Últimos Registros)</h2>
        </div>

        <div className="finanzas-table-container">
          {loading ? (
             <Skeleton width="100%" height="200px" borderRadius="8px" />
          ) : reportData?.tabla_detalles?.length > 0 ? (
            <table className="finanzas-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Inmueble</th>
                  <th>Ciudad</th>
                  <th>Tipo Contrato</th>
                  <th>Inquilino</th>
                  <th style={{ textAlign: 'right' }}>Ingreso (Bs)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.tabla_detalles.map((fila) => (
                  <tr key={fila.id}>
                    <td>{fila.fecha}</td>
                    <td style={{ fontWeight: 500, color: 'var(--color-text)' }}>{fila.inmueble}</td>
                    <td>{fila.ciudad}</td>
                    <td>
                      <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary-light)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {fila.tipo_contrato}
                      </span>
                    </td>
                    <td>{fila.inquilino}</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 700, textAlign: 'right' }}>
                      {formatterMonto(fila.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ display: 'flex', height: '100px', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
              No se encontraron registros detallados para los filtros seleccionados.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }

        /* ============ IMPRESIÓN NATIVA (Ctrl+P) ============ */
        .print-only { display: none !important; }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .print-container { padding: 0 !important; margin: 0 !important; }
          @page { size: A4 landscape; margin: 10mm; }
        }

        /* ============ EXPORTACIÓN html2pdf (A4 LANDSCAPE) ============ */
        .is-exporting .print-only { display: block !important; }
        .is-exporting .no-print { display: none !important; }
        .is-exporting .filtro-reportes-container { display: none !important; }
        .is-exporting .config-section { display: none !important; }

        .is-exporting {
          background: white !important;
          width: 1050px !important;
          margin: 0 auto !important;
          padding: 0 16px 16px 16px !important;
          font-family: 'Inter', 'Segoe UI', sans-serif !important;
          box-sizing: border-box !important;
          overflow: visible !important;
        }

        .is-exporting .pdf-header-admin {
          display: block !important;
          margin-bottom: 10px !important;
        }

        .is-exporting .pdf-kpi-grid {
          display: flex !important;
          flex-direction: row !important;
          gap: 10px !important;
          margin-bottom: 12px !important;
          break-inside: avoid !important;
        }
        .is-exporting .pdf-kpi-grid > div {
          flex: 1 !important;
          padding: 8px 12px !important;
          border-radius: 10px !important;
        }
        .is-exporting .pdf-kpi-grid > div > div:first-child {
          width: 26px !important;
          height: 26px !important;
          margin-bottom: 4px !important;
        }
        .is-exporting .pdf-kpi-grid p { font-size: 0.68rem !important; margin-bottom: 2px !important; }
        .is-exporting .pdf-kpi-grid div[style*="1.8rem"] { font-size: 1.15rem !important; }

        .is-exporting .pdf-charts-section {
          display: flex !important;
          flex-direction: row !important;
          gap: 12px !important;
          margin-bottom: 12px !important;
          align-items: stretch !important;
        }

        .is-exporting .pdf-chart-bar {
          flex: 3 !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          padding: 12px 16px !important;
          border-radius: 10px !important;
          box-sizing: border-box !important;
        }
        .is-exporting .pdf-chart-bar > div[style*="height"] {
          height: 180px !important;
          max-height: 180px !important;
          min-height: 180px !important;
        }
        .is-exporting .pdf-chart-bar h2 { font-size: 0.85rem !important; margin-bottom: 4px !important; }

        .is-exporting .pdf-chart-pie {
          flex: 2 !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          padding: 12px 16px !important;
          border-radius: 10px !important;
          box-sizing: border-box !important;
        }
        .is-exporting .pdf-chart-pie > div[style*="height"] {
          height: 180px !important;
          max-height: 180px !important;
          min-height: 180px !important;
        }
        .is-exporting .pdf-chart-pie h2 { font-size: 0.85rem !important; margin-bottom: 4px !important; }

        .is-exporting .recharts-responsive-container {
          width: 100% !important;
        }

        .is-exporting .pdf-table-section {
          display: block !important;
          break-before: always !important;
          page-break-before: always !important;
          padding: 14px !important;
          border-radius: 10px !important;
          margin-top: 0 !important;
        }
        .is-exporting .pdf-table-section h2 { font-size: 0.9rem !important; margin-bottom: 10px !important; }
        .is-exporting .pdf-table-section table { font-size: 0.75rem !important; }
        .is-exporting .pdf-table-section th,
        .is-exporting .pdf-table-section td { padding: 5px 8px !important; }
        .is-exporting .pdf-table-section span { padding: 2px 5px !important; font-size: 0.7rem !important; }
      `}</style>
    </div>
  );
};

export default FinanzasAdmin;
