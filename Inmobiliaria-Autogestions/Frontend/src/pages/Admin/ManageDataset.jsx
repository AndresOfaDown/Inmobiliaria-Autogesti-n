import { useState, useEffect, useRef } from 'react';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Home,
  ShieldCheck,
  Compass,
  Key,
  Trash2,
  FileText,
  Building2,
  Sparkles,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';

const ManageDataset = () => {
  const [stats, setStats] = useState({
    total: 0,
    ventas: 0,
    alquileres:
      0,
    anticreticos: 0,
    verificados: 0,
    con360: 0,
    iotTotal: 0,
    contratosTotal: 0,
    ciudades: [],
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Estados de carga de archivo
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [datosPrevisualizacion, setDatosPrevisualizacion] = useState([]);
  const [errorArchivo, setErrorArchivo] = useState('');
  const [importando, setImportando] = useState(false);
  const [resultadoImportacion, setResultadoImportacion] = useState(null);
  const [reseteando, setReseteando] = useState(false);
  const fileInputRef = useRef(null);

  // Cargar estadísticas
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/inmuebles/dataset/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error al cargar estadísticas del dataset:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ─── DESCARGAR PLANTILLA EXCEL / CSV ────────────────────────
  const handleDescargarPlantilla = () => {
    const columnasEjemplo = [
      {
        titulo: 'Casa Minimalista en Las Palmas',
        tipo: 'Casa',
        tipo_oferta: 'venta',
        precio: 250000,
        ciudad: 'Santa Cruz',
        zona: 'Las Palmas',
        calle: 'Av. Las Palmeras #140',
        superficie: 350,
        habitaciones: 4,
        banos: 3,
        garaje: 'si',
        verificado: 'si',
        descripcion: 'Hermosa casa familiar con amplio patio y acabados de primera calidad.',
        imagen_principal: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        tour_360: '/pano_prueba.png',
      },
      {
        titulo: 'Departamento Amoblado en Sopocachi',
        tipo: 'Departamento',
        tipo_oferta: 'alquiler',
        precio: 3500,
        ciudad: 'La Paz',
        zona: 'Sopocachi',
        calle: 'Av. 20 de Octubre #850',
        superficie: 85,
        habitaciones: 2,
        banos: 2,
        garaje: 'si',
        verificado: 'si',
        descripcion: 'Departamento muy soleado, piso medio con linda vista.',
        imagen_principal: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        tour_360: '',
      },
      {
        titulo: 'Oficina Comercial en Prado',
        tipo: 'Oficina',
        tipo_oferta: 'alquiler',
        precio: 4200,
        ciudad: 'Cochabamba',
        zona: 'El Prado',
        calle: 'Av. Ballivián #210',
        superficie: 90,
        habitaciones: 3,
        banos: 1,
        garaje: 'no',
        verificado: 'no',
        descripcion: 'Espacio ideal para consultorio o bufete de abogados.',
        imagen_principal: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        tour_360: '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(columnasEjemplo);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inmuebles');
    XLSX.writeFile(workbook, 'plantilla_dataset_inmuebles.xlsx');
  };

  // ─── PROCESAR ARCHIVO SUBIDO (XLSX, CSV, JSON) ──────────────
  const handleProcesarArchivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorArchivo('');
    setResultadoImportacion(null);
    setArchivoSeleccionado(file);

    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const list = Array.isArray(parsed) ? parsed : parsed.inmuebles || [];
          setDatosPrevisualizacion(list);
        } catch {
          setErrorArchivo('El archivo JSON no tiene un formato válido.');
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
          if (rows.length === 0) {
            setErrorArchivo('El archivo no contiene filas de datos.');
            setDatosPrevisualizacion([]);
            return;
          }
          setDatosPrevisualizacion(rows);
        } catch (err) {
          console.error(err);
          setErrorArchivo('No se pudo leer el archivo Excel/CSV. Verifica su formato.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // ─── ENVIAR IMPORTACIÓN AL BACKEND ─────────────────────────
  const handleImportar = async () => {
    if (datosPrevisualizacion.length === 0) return;
    setImportando(true);
    setResultadoImportacion(null);
    setErrorArchivo('');

    try {
      const res = await api.post('/inmuebles/dataset/cargar-masivo', {
        inmuebles: datosPrevisualizacion,
      });
      setResultadoImportacion(res.data);
      setArchivoSeleccionado(null);
      setDatosPrevisualizacion([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchStats();
    } catch (err) {
      console.error(err);
      setErrorArchivo(err.response?.data?.message || 'Error al importar el dataset.');
    } finally {
      setImportando(false);
    }
  };

  // ─── CARGAR DATASET DEMO DE BOLIVIA (1 CLIC) ───────────────
  const handleCargarPresetBolivia = async () => {
    const demoItems = [
      {
        titulo: 'Mansión Exclusiva en Urubó Golf',
        tipo: 'Casa',
        tipo_oferta: 'venta',
        precio: 420000,
        ciudad: 'Santa Cruz',
        zona: 'Urubó',
        calle: 'Av. Las Palmas, Condominio Los Tajibos #45',
        superficie: 650,
        habitaciones: 5,
        banos: 6,
        garaje: 'si',
        verificado: 'si',
        descripcion: 'Residencia de lujo con piscina infinita y recorrido virtual 360° completo.',
        imagen_principal: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        tour_360: '/pano_prueba.png',
      },
      {
        titulo: 'Smart Loft Equipetrol con Domótica',
        tipo: 'Departamento',
        tipo_oferta: 'alquiler',
        precio: 4200,
        ciudad: 'Santa Cruz',
        zona: 'Equipetrol',
        calle: 'Calle Las Begonias #102, Edif. Smart Tower',
        superficie: 88,
        habitaciones: 2,
        banos: 2,
        garaje: 'si',
        verificado: 'si',
        descripcion: 'Loft con cerradura inteligente IoT Yale y vista panorámica.',
        imagen_principal: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        tour_360: '/pano_prueba.png',
      },
      {
        titulo: 'Penthouse Calacoto con Vista al Illimani',
        tipo: 'Departamento',
        tipo_oferta: 'venta',
        precio: 285000,
        ciudad: 'La Paz',
        zona: 'Calacoto',
        calle: 'Calle 15 de Calacoto, Torre Las Cumbres',
        superficie: 320,
        habitaciones: 4,
        banos: 5,
        garaje: 'si',
        verificado: 'si',
        descripcion: 'Terraza privada, chimenea ecológica y asoleamiento térmico.',
        imagen_principal: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      },
      {
        titulo: 'Residencia Campestre en Tiquipaya',
        tipo: 'Casa',
        tipo_oferta: 'venta',
        precio: 198000,
        ciudad: 'Cochabamba',
        zona: 'Tiquipaya',
        calle: 'Av. Ecológica Km 4.5 #120',
        superficie: 480,
        habitaciones: 4,
        banos: 4,
        garaje: 'si',
        verificado: 'si',
        descripcion: 'Microclima ideal, amplios jardines y pozo propio.',
        imagen_principal: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      },
      {
        titulo: 'Oficina Torre Platinum Equipetrol',
        tipo: 'Oficina',
        tipo_oferta: 'alquiler',
        precio: 5500,
        ciudad: 'Santa Cruz',
        zona: 'Equipetrol',
        calle: 'Av. San Martín esq. Calle 7',
        superficie: 115,
        habitaciones: 3,
        banos: 2,
        garaje: 'si',
        verificado: 'si',
        descripcion: 'Espacio corporativo listo con divisiones acústicas de vidrio.',
        imagen_principal: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      },
      {
        titulo: 'Depto Europeo en Queru Queru',
        tipo: 'Departamento',
        tipo_oferta: 'anticretico',
        precio: 48000,
        ciudad: 'Cochabamba',
        zona: 'Queru Queru',
        calle: 'Av. Pando esq. Portales',
        superficie: 145,
        habitaciones: 3,
        banos: 3,
        garaje: 'si',
        verificado: 'si',
        descripcion: 'Pisos entablonados, 3 dormitorios en suite y doble parqueo.',
        imagen_principal: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      },
      {
        titulo: 'Terreno Comercial Av. Cristo Redentor',
        tipo: 'Terreno',
        tipo_oferta: 'venta',
        precio: 350000,
        ciudad: 'Santa Cruz',
        zona: 'Norte',
        calle: 'Av. Cristo Redentor e/ 5to y 6to Anillo',
        superficie: 950,
        habitaciones: 0,
        banos: 0,
        garaje: 'no',
        verificado: 'si',
        descripcion: 'Excelente frente sobre avenida principal de alto tráfico.',
        imagen_principal: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      },
    ];

    setImportando(true);
    setErrorArchivo('');
    try {
      const res = await api.post('/inmuebles/dataset/cargar-masivo', {
        inmuebles: demoItems,
      });
      setResultadoImportacion(res.data);
      fetchStats();
    } catch (err) {
      console.error(err);
      setErrorArchivo('Error al cargar el dataset demo.');
    } finally {
      setImportando(false);
    }
  };

  // ─── RESETEAR CATÁLOGO ─────────────────────────────────────
  const handleResetear = async () => {
    if (!window.confirm('¿Seguro que deseas vaciar los inmuebles de prueba del catálogo? Los usuarios se conservarán.')) {
      return;
    }
    setReseteando(true);
    try {
      await api.delete('/inmuebles/dataset/reset');
      setResultadoImportacion({
        mensaje: 'Catálogo de prueba reseteado con éxito. Ahora puedes cargar un nuevo dataset.',
      });
      fetchStats();
    } catch (err) {
      console.error(err);
      setErrorArchivo('Error al resetear el catálogo.');
    } finally {
      setReseteando(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* ─── Encabezado ─── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#fff',
              padding: '12px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25)',
            }}
          >
            <Database size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Gestión y Carga de Datasets
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
              Caso de Uso HU-31: Importación masiva de datos estructurados para simulaciones y catálogo inmobiliario.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Tarjetas de Estadísticas del Dataset ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={cardStatStyle('#6366f1')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Total Inmuebles</span>
            <Home size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {loadingStats ? '...' : stats.total}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {stats.ventas} Venta • {stats.alquileres} Alquiler • {stats.anticreticos} Anticrético
          </span>
        </div>

        <div style={cardStatStyle('#16a34a')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Verificados Legal</span>
            <ShieldCheck size={20} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', marginTop: '6px' }}>
            {loadingStats ? '...' : stats.verificados}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Con Escudo Verde Legal</span>
        </div>

        <div style={cardStatStyle('#0284c7')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tours 360° Activos</span>
            <Compass size={20} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>
            {loadingStats ? '...' : stats.con360}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>Recorridos Inmersivos VR</span>
        </div>

        <div style={cardStatStyle('#8b5cf6')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Dispositivos IoT</span>
            <Key size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6', marginTop: '6px' }}>
            {loadingStats ? '...' : stats.iotTotal}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>Cerraduras y Sensores</span>
        </div>
      </div>

      {/* ─── Mensaje de Éxito o Error ─── */}
      {resultadoImportacion && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '16px 20px',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <CheckCircle size={22} color="#10b981" />
          <div>
            <strong>¡Operación Exitosa!</strong>
            <div>{resultadoImportacion.mensaje}</div>
          </div>
        </div>
      )}

      {errorArchivo && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '16px 20px',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertTriangle size={22} color="#ef4444" />
          <div>
            <strong>Error:</strong> {errorArchivo}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* ─── Columna Izquierda: Importador de Archivo ─── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Importar Archivo (Excel / CSV / JSON)
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                Carga lotes masivos de inmuebles desde una hoja de cálculo.
              </p>
            </div>
            <button
              onClick={handleDescargarPlantilla}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Descargar plantilla de ejemplo con las columnas necesarias"
            >
              <Download size={16} />
              Descargar Plantilla
            </button>
          </div>

          {/* Zona de Drop / Carga */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '36px 20px',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv, .json"
              onChange={handleProcesarArchivo}
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#e0e7ff',
                color: '#4f46e5',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <UploadCloud size={28} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
              {archivoSeleccionado ? archivoSeleccionado.name : 'Haz clic o arrastra tu archivo aquí'}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
              Formatos soportados: Excel (.xlsx, .xls), CSV (.csv) o JSON (.json)
            </p>
          </div>

          {/* Previsualización de Datos */}
          {datosPrevisualizacion.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                  Previsualización ({datosPrevisualizacion.length} inmuebles detectados)
                </div>
                <button
                  onClick={handleImportar}
                  disabled={importando}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: importando ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  {importando ? (
                    <>
                      <RefreshCw size={16} className="spin-animate" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Confirmar e Importar al Catálogo
                    </>
                  )}
                </button>
              </div>

              <div
                style={{
                  maxHeight: '320px',
                  overflowX: 'auto',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#334155', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>Título</th>
                      <th style={{ padding: '10px 12px' }}>Tipo</th>
                      <th style={{ padding: '10px 12px' }}>Oferta</th>
                      <th style={{ padding: '10px 12px' }}>Precio</th>
                      <th style={{ padding: '10px 12px' }}>Ciudad</th>
                      <th style={{ padding: '10px 12px' }}>Hab.</th>
                      <th style={{ padding: '10px 12px' }}>Baños</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPrevisualizacion.slice(0, 10).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{row.titulo || 'Sin título'}</td>
                        <td style={{ padding: '10px 12px' }}>{row.tipo || row.categoria || 'Depto'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: row.tipo_oferta === 'venta' ? '#fef3c7' : '#e0f2fe',
                              color: row.tipo_oferta === 'venta' ? '#92400e' : '#0369a1',
                            }}
                          >
                            {row.tipo_oferta || 'alquiler'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                          {row.precio ? Number(row.precio).toLocaleString() : '0'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>{row.ciudad || 'Santa Cruz'}</td>
                        <td style={{ padding: '10px 12px' }}>{row.habitaciones || '-'}</td>
                        <td style={{ padding: '10px 12px' }}>{row.banos || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {datosPrevisualizacion.length > 10 && (
                <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '8px', textAlign: 'center' }}>
                  ... y {datosPrevisualizacion.length - 10} filas más listas para procesar.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Columna Derecha: Acciones Rápidas y Presets ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card: Carga Preset 1 Clic */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              color: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(49, 46, 129, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={20} color="#a5b4fc" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Dataset Demo Bolivia</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#c7d2fe', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Genera al instante un lote completo con propiedades en Santa Cruz, La Paz y Cochabamba, tours 360°, cerraduras IoT y escudos legales.
            </p>
            <button
              onClick={handleCargarPresetBolivia}
              disabled={importando}
              style={{
                width: '100%',
                padding: '12px',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: importando ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              }}
            >
              <RefreshCw size={16} className={importando ? 'spin-animate' : ''} />
              Cargar Preset Bolivia (1 Clic)
            </button>
          </div>

          {/* Card: Reset y Mantenimiento */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              border: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Trash2 size={18} color="#ef4444" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Mantenimiento de Catálogo
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 16px 0' }}>
              Vacía los inmuebles y transacciones de prueba para volver a empezar desde cero. No elimina los usuarios.
            </p>
            <button
              onClick={handleResetear}
              disabled={reseteando}
              style={{
                width: '100%',
                padding: '10px',
                background: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #fecdd3',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: reseteando ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Trash2 size={15} />
              {reseteando ? 'Vaciando...' : 'Vaciar Catálogo de Prueba'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilo de tarjeta de estadística
const cardStatStyle = (accentColor) => ({
  background: '#ffffff',
  borderRadius: '16px',
  padding: '18px 20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
  border: '1px solid #f1f5f9',
  borderTop: `4px solid ${accentColor}`,
});

export default ManageDataset;
