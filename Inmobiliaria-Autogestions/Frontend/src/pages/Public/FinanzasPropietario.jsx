import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend as RechartsLegend
} from 'recharts';
import reportesService from '../../services/reportesService';
import FiltroReportes from '../../components/FiltroReportes';

import { Clock, TrendingUp, Wallet, ArrowDownRight, Activity, Download, FileSpreadsheet, FileText, PieChart as PieChartIcon } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import '../Admin/Finanzas.css';

const FinanzasPropietario = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const currentYear = new Date().getFullYear();
  const [filtros, setFiltros] = useState({ anio: currentYear.toString() });

  useEffect(() => {
    fetchData();
  }, [filtros]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await reportesService.obtenerReportes({ ...filtros, personal: 'true' });
      setReportData(data);
    } catch (error) {
      console.error("Error fetching propietario finances:", error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener el nombre del inmueble seleccionado para el encabezado del PDF
  const obtenerNombreInmuebleFiltrado = () => {
    if (!filtros.inmueble_id) return 'Todos mis inmuebles';
    const selectEl = document.querySelector('select[name="inmueble_id"]');
    if (selectEl) {
      const selectedOption = selectEl.options[selectEl.selectedIndex];
      return selectedOption?.text || 'Inmueble seleccionado';
    }
    return 'Inmueble seleccionado';
  };

  const handleDownloadPDF = () => {
    const element = document.querySelector('.print-container');
    const opt = {
      margin:       [8, 8],
      filename:     `reporte_financiero_${filtros.anio || 'anual'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };

    setExporting(true);
    element.classList.add('is-exporting');

    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove('is-exporting');
      setExporting(false);
    });
  };

  const handleDownloadExcel = () => {
    setExportingExcel(true);
    try {
      // 1. Preparar datos para la tabla principal
      const rows = chartData.map(item => ({
        "Mes": item.mesLabel,
        "Ingreso Bruto (Bs)": item.ingreso_bruto,
        "Comisión Plataforma (Bs)": item.comision_descontada,
        "Ingreso Neto (Bs)": item.ingreso_neto,
      }));

      // 2. Agregar fila de totales
      rows.push({
        "Mes": "TOTAL ANUAL",
        "Ingreso Bruto (Bs)": reportData?.kpis?.ingreso_bruto || 0,
        "Comisión Plataforma (Bs)": reportData?.kpis?.total_comisiones || 0,
        "Ingreso Neto (Bs)": reportData?.kpis?.ingreso_neto || 0,
      });

      // 3. Crear libro y hoja
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Financiero");

      // 4. Ajustar anchos de columna básicos
      const wscols = [
        {wch: 15}, {wch: 20}, {wch: 25}, {wch: 20}
      ];
      worksheet['!cols'] = wscols;

      // 5. Descargar
      XLSX.writeFile(workbook, `reporte_financiero_${filtros.anio || 'anual'}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setExportingExcel(false);
    }
  };

  const formatterMonto = (value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value);

  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const chartData = reportData?.grafico_evolucion?.map(item => {
    if (item.label) {
      // Si el backend envía 'label' (nombre de inmueble), lo usamos directamente
      return { ...item, mesLabel: item.label };
    }
    const partes = item.fecha.split('-');
    const mesLabel = partes.length === 3
      ? `${parseInt(partes[2])}`
      : mesesNombres[parseInt(partes[1]) - 1];
    return {
      ...item,
      mesLabel
    };
  }) || [];

  const COLORS = ['#059669', '#10b981', '#34d399', '#065f46', '#10b981', '#047857'];
  const BAR_COLORS = ['#6366f1', '#f59e0b']; // Índigo y Ámbar (Alto contraste)

  return (
    <div style={{ paddingTop: '20px' }}>

      <div className="print-container" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <header className="no-print" style={{ marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>
              Mis Finanzas
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>
              Proyección y análisis de tus ingresos reales (Netos)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              className="no-print"
              onClick={handleDownloadPDF}
              disabled={exporting}
              style={{
                padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0',
                background: '#fff', color: '#1e1b4b', fontWeight: 600, cursor: exporting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s'
              }}
              onMouseOver={e => !exporting && (e.currentTarget.style.background = '#f8fafc', e.currentTarget.style.borderColor = '#cbd5e1')}
              onMouseOut={e => !exporting && (e.currentTarget.style.background = '#fff', e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              {exporting ? <Clock className="spin" size={18} /> : <FileText size={18} />}
              {exporting ? 'Generando PDF...' : 'Exportar Informe PDF'}
            </button>

            <button
              className="no-print"
              onClick={handleDownloadExcel}
              disabled={exportingExcel}
              style={{
                padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0',
                background: '#fff', color: '#1e1b4b', fontWeight: 600, cursor: exportingExcel ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s'
              }}
              onMouseOver={e => !exportingExcel && (e.currentTarget.style.background = '#f8fafc', e.currentTarget.style.borderColor = '#cbd5e1')}
              onMouseOut={e => !exportingExcel && (e.currentTarget.style.background = '#fff', e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              {exportingExcel ? <Clock className="spin" size={18} /> : <FileSpreadsheet size={18} />}
              {exportingExcel ? 'Generando...' : 'Data Excel'}
            </button>
          </div>
        </header>

        <div className="no-print">
          <FiltroReportes onFilterChange={setFiltros} showInmuebleFilter={true} showCiudadFilter={false} />
        </div>

        {/* --- ENCABEZADO EXCLUSIVO PARA PDF --- */}
        <div className="print-only pdf-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '3px solid #1e293b', paddingBottom: '12px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>
                Reporte Financiero de Ingresos
              </h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                Plataforma de Gestión Inmobiliaria
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: '#1e293b', fontWeight: 700, margin: 0 }}>
                Año Fiscal: {filtros.anio || new Date().getFullYear()}
              </p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                {obtenerNombreInmuebleFiltrado()}
              </p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Generado: {new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
        {/* --- FIN ENCABEZADO PDF --- */}


        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Clock className="spin" size={48} color="#cbd5e1" />
            <p style={{ color: '#94a3b8', marginTop: '16px' }}>Calculando balances...</p>
          </div>
        ) : (
          <>
            <div className="kpi-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px', marginBottom: '32px'
            }}>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '12px' }}>
                    <Wallet size={24} color="#16a34a" />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Ingreso Neto (A tu cuenta)</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>
                  {formatterMonto(reportData?.kpis?.ingreso_neto || 0)}
                </div>
                <div className="kpi-desc" style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px' }}>
                  Libre de comisiones
                </div>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#fffbeb', padding: '10px', borderRadius: '12px' }}>
                    <ArrowDownRight size={24} color="#d97706" />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Comisión Descontada</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>
                  {formatterMonto(reportData?.kpis?.total_comisiones || 0)}
                </div>
                <div className="kpi-desc" style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px' }}>
                  Retenido por la plataforma
                </div>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px' }}>
                    <Activity size={24} color="#8b5cf6" />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Promedio Mensual</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>
                  {formatterMonto(reportData?.kpis?.promedio_mensual || 0)}
                </div>
                <div className="kpi-desc" style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px' }}>
                  Calculado sobre los 12 meses del año
                </div>
              </div>

            </div>

            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>

              {/* Curva de Ingreso Neto */}
              <div className="chart-box" style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <TrendingUp size={24} color="#6366f1" />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    {filtros.mes ? 'Ingreso Neto por Inmueble' : 'Curva de Ingreso Neto'}
                  </h2>
                </div>

                <div className="chart-wrapper" style={{ height: 400, width: '100%' }}>
                  {chartData.some(d => d.ingreso_neto > 0) ? (
                    <ResponsiveContainer>
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="mesLabel"
                          stroke="#94a3b8"
                          tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                          tickMargin={10}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          tickFormatter={(value) => `Bs ${value}`}
                          tick={{ fill: '#64748b', fontSize: 13 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: '#f8fafc' }}
                          formatter={(value) => [formatterMonto(value), 'Ingreso Neto']}
                          labelStyle={{ color: '#1e293b', fontWeight: 800, marginBottom: '8px' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        />
                        <Bar
                          dataKey="ingreso_neto"
                          radius={[4, 4, 0, 0]}
                          barSize={45}
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={BAR_COLORS[index % BAR_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
                      No hay datos suficientes para mostrar en este periodo.
                    </div>
                  )}
                </div>
              </div>

              {/* Distribución (Pie Chart) */}
              <div className="chart-box" style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <PieChartIcon size={24} color="#10b981" />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    Distribución
                  </h2>
                </div>

                <div className="chart-wrapper" style={{ height: 350, width: '100%' }}>
                  {reportData?.distribucion_inmuebles?.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                        <Pie
                          data={reportData.distribucion_inmuebles}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {reportData.distribucion_inmuebles.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatterMonto(value)} />
                        <RechartsLegend verticalAlign="top" align="center" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
                      No hay datos suficientes para mostrar en este periodo.
                    </div>
                  )}
                </div>
              </div>

            </div>


            {/* --- EXTRACTO BANCARIO --- */}
            <div className="chart-box" style={{ marginTop: '24px', padding: '24px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', pageBreakBefore: 'always' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '3px solid #1e293b', paddingBottom: '12px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={20} className="no-print" style={{ color: '#6366f1' }} />
                    Extracto de Movimientos
                  </h2>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Registro detallado de ingresos — {obtenerNombreInmuebleFiltrado()}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div className="no-print" style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                    {(reportData?.extracto_pagos || []).length} registro(s)
                  </div>
                  <p className="print-only" style={{ fontSize: '12px', color: '#1e293b', fontWeight: 700, margin: 0 }}>
                    Año Fiscal: {filtros.anio || new Date().getFullYear()}
                  </p>
                </div>
              </div>

              {(reportData?.extracto_pagos || []).length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="print-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Fecha</th>
                        <th style={{ textAlign: 'left' }}>Inmueble</th>
                        <th style={{ textAlign: 'left' }}>Inquilino</th>
                        <th style={{ textAlign: 'right' }}>Ingreso Bruto</th>
                        <th style={{ textAlign: 'right' }}>Comisión</th>
                        <th style={{ textAlign: 'right' }}>Ingreso Neto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData?.extracto_pagos || []).map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.fecha}</td>
                          <td>{row.inmueble}</td>
                          <td>{row.inquilino}</td>
                          <td style={{ textAlign: 'right' }}>{formatterMonto(row.ingreso_bruto)}</td>
                          <td style={{ textAlign: 'right', color: '#d97706' }}>{formatterMonto(row.comision)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>{formatterMonto(row.ingreso_neto)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={3} style={{ textAlign: 'left' }}>TOTAL PERIODO</th>
                        <th style={{ textAlign: 'right' }}>{formatterMonto(reportData?.kpis?.ingreso_bruto || 0)}</th>
                        <th style={{ textAlign: 'right', color: '#d97706' }}>{formatterMonto(reportData?.kpis?.total_comisiones || 0)}</th>
                        <th style={{ textAlign: 'right', color: '#16a34a' }}>{formatterMonto(reportData?.kpis?.ingreso_neto || 0)}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  No se registraron movimientos en el periodo seleccionado.
                </div>
              )}
            </div>

          </>
        )}
      </div>

      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .print-only { display: none; }

        /* ========== ESTILOS DE TABLA PDF ========== */
        .print-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .print-table th, .print-table td { border: 1px solid #cbd5e1; padding: 10px 14px; }
        .print-table thead th { background: #1e293b; color: white; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em; }
        .print-table tfoot th { background: #f1f5f9; font-weight: 800; font-size: 13px; }
        .print-table tbody tr:nth-child(even) { background: #f8fafc; }

        /* ========== IMPRESIÓN NATIVA ========== */
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-container { padding: 0 !important; margin: 0 !important; }
          @page { size: A4 landscape; margin: 10mm; }
        }

        /* ========== EXPORTACIÓN html2pdf (LANDSCAPE A4) ========== */
        .is-exporting .print-only { display: block !important; }
        .is-exporting .no-print { display: none !important; }
        .is-exporting {
          background: white !important;
          width: 1050px !important;
          margin: 0 auto !important;
          padding: 0 16px 16px 16px !important;
          font-family: 'Inter', 'Segoe UI', sans-serif !important;
          box-sizing: border-box !important;
          overflow: visible !important;
        }

        /* Ocultar comparativa interanual en PDF */
        .is-exporting #comparativa-interanual {
          display: none !important;
          height: 0 !important; max-height: 0 !important;
          overflow: hidden !important;
          padding: 0 !important; margin: 0 !important; border: none !important;
        }

        /* KPIs: fila compacta */
        .is-exporting .kpi-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 10px !important;
          margin-bottom: 12px !important;
        }
        .is-exporting .kpi-grid > div {
          padding: 8px 12px !important;
          border-radius: 8px !important;
        }
        .is-exporting .kpi-grid > div > div:first-child { margin-bottom: 4px !important; }
        .is-exporting .kpi-grid > div > div:nth-child(2) { font-size: 1.3rem !important; }
        .is-exporting .kpi-desc { display: none !important; }

        .is-exporting .pdf-header > div {
          padding-bottom: 6px !important;
          margin-bottom: 10px !important;
        }

        /* Gráficos: columna única en PDF */
        .is-exporting .charts-grid {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        /* Altura de contenedores de gráfico */
        .is-exporting .chart-wrapper {
          height: 220px !important;
          max-height: 220px !important;
          overflow: visible !important;
        }

        /* Compactar chart-box */
        .is-exporting .chart-box {
          padding: 10px 14px !important;
          border-radius: 10px !important;
          overflow: visible !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        .is-exporting .chart-box h2 { font-size: 0.9rem !important; margin-bottom: 4px !important; }
        .is-exporting .chart-box > div:first-child { margin-bottom: 6px !important; gap: 8px !important; }

        /* Recharts */
        .is-exporting .recharts-responsive-container {
          width: 100% !important;
          height: 210px !important;
          min-height: 210px !important;
        }
      `}</style>
    </div>
  );
};

export default FinanzasPropietario;
