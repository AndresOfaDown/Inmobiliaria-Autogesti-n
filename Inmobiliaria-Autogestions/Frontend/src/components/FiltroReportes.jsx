import { useState, useEffect } from 'react';
import api from '../services/api';
import './FiltroReportes.css';

const FiltroReportes = ({ onFilterChange, showInmuebleFilter = true, showCiudadFilter = true }) => {
  const [tiposContrato, setTiposContrato] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - i);

  const [filtros, setFiltros] = useState({
    anio: currentYear.toString(),
    mes: '',
    tipo_contrato: '',
    inmueble_id: '',
    ciudad: ''
  });

  const meses = [
    { id: '1', nombre: 'Enero' }, { id: '2', nombre: 'Febrero' }, { id: '3', nombre: 'Marzo' },
    { id: '4', nombre: 'Abril' }, { id: '5', nombre: 'Mayo' }, { id: '6', nombre: 'Junio' },
    { id: '7', nombre: 'Julio' }, { id: '8', nombre: 'Agosto' }, { id: '9', nombre: 'Septiembre' },
    { id: '10', nombre: 'Octubre' }, { id: '11', nombre: 'Noviembre' }, { id: '12', nombre: 'Diciembre' }
  ];

  useEffect(() => {
    // Sincronizar filtros iniciales con el padre
    onFilterChange(filtros);

    // Cargar tipos de contrato
    api.get('/inmuebles/tipos-contrato/')
      .then(res => setTiposContrato(res.data.results || res.data))
      .catch(console.error);

    // Cargar ciudades únicas
    api.get('/inmuebles/lista/ciudades/')
      .then(res => setCiudades(res.data.results || res.data))
      .catch(console.error);

    // Cargar inmuebles
    if (showInmuebleFilter) {
      api.get('/inmuebles/panel/lista/')
        .then(res => setInmuebles(res.data.results || res.data))
        .catch(console.error);
    }
  }, [showInmuebleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFiltros = { ...filtros, [name]: value };
    setFiltros(newFiltros);
    
    // Limpiar campos vacíos antes de enviar
    const filtrosActivos = Object.fromEntries(
      Object.entries(newFiltros).filter((entry) => entry[1] !== '')
    );
    onFilterChange(filtrosActivos);
  };

  return (
    <div className="filtro-reportes-container">
      <div className="filtro-group">
        <label>Año:</label>
        <select name="anio" value={filtros.anio} onChange={handleChange} className="filter-select">
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="filtro-group">
        <label>Mes:</label>
        <select name="mes" value={filtros.mes} onChange={handleChange} className="filter-select">
          <option value="">Todos los meses</option>
          {meses.map(m => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
      </div>

      {showCiudadFilter && (
        <div className="filtro-group">
          <label>Ciudad:</label>
          <select name="ciudad" value={filtros.ciudad} onChange={handleChange} className="filter-select">
            <option value="">Todas las ciudades</option>
            {ciudades.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {showInmuebleFilter && (
        <div className="filtro-group">
          <label>Inmueble:</label>
          <select name="inmueble_id" value={filtros.inmueble_id} onChange={handleChange} className="filter-select">
            <option value="">Todos mis inmuebles</option>
            {inmuebles.map(inm => (
              <option key={inm.id} value={inm.id}>{inm.titulo}</option>
            ))}
          </select>
        </div>
      )}

      <div className="filtro-group">
        <label>Tipo Contrato:</label>
        <select name="tipo_contrato" value={filtros.tipo_contrato} onChange={handleChange} className="filter-select">
          <option value="">Todos los contratos</option>
          {tiposContrato.map(tc => (
            <option key={tc.id} value={tc.id}>{tc.nombre}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FiltroReportes;
