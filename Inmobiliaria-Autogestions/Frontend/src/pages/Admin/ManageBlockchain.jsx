import { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, Server, Layers, Cpu, Copy, Check, RefreshCw, 
  ChevronDown, ChevronUp, FileText, Home, Banknote, Calendar 
} from 'lucide-react';
import api from '../../services/api';

const ManageBlockchain = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showTopology, setShowTopology] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const res = await api.get('/inmuebles/blockchain/stats/');
      setStats(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching blockchain stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getTxIcon = (txName) => {
    switch (txName) {
      case 'registrarInmueble':
      case 'transferirPropiedad':
        return <Home size={16} color="#0ea5e9" />;
      case 'crearContrato':
      case 'firmarContrato':
      case 'finalizarContrato':
        return <FileText size={16} color="#16a34a" />;
      case 'registrarPago':
        return <Banknote size={16} color="#f59e0b" />;
      default:
        return <Layers size={16} color="#64748b" />;
    }
  };

  const getTxBadge = (txName) => {
    const s = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '8px',
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.3px'
    };

    switch (txName) {
      case 'registrarInmueble':
        return <span style={{ ...s, background: '#e0f2fe', color: '#0369a1' }}>Título Creado</span>;
      case 'transferirPropiedad':
        return <span style={{ ...s, background: '#f0fdfa', color: '#0d9488' }}>Transferencia</span>;
      case 'crearContrato':
        return <span style={{ ...s, background: '#dcfce7', color: '#15803d' }}>Contrato Creado</span>;
      case 'firmarContrato':
        return <span style={{ ...s, background: '#f5f3ff', color: '#6d28d9' }}>Firma Sellada</span>;
      case 'finalizarContrato':
        return <span style={{ ...s, background: '#fee2e2', color: '#b91c1c' }}>Rescisión</span>;
      case 'registrarPago':
        return <span style={{ ...s, background: '#fef3c7', color: '#b45309' }}>Pago Sellado</span>;
      default:
        return <span style={{ ...s, background: '#f1f5f9', color: '#475569' }}>{txName}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#94a3b8' }}>
        <RefreshCw className="spin" size={32} style={{ marginBottom: '12px' }} />
        <p>Cargando auditoría y conexión de la red Blockchain...</p>
      </div>
    );
  }

  const isConnected = stats && stats.status === 'UP';
  const blocksPerPage = 10;
  const totalPages = stats?.blocks ? Math.ceil(stats.blocks.length / blocksPerPage) : 0;
  const paginatedBlocks = stats?.blocks ? stats.blocks.slice((currentPage - 1) * blocksPerPage, currentPage * blocksPerPage) : [];


  return (
    <div style={{ padding: '4px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* ─── Cabecera ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <ShieldCheck size={28} color="#10b981" /> Auditoría Blockchain
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Monitoreo y exploración inmutable de contratos, pagos y títulos en Hyperledger Fabric.
          </p>
        </div>
        <button 
          onClick={() => fetchStats(true)} 
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px',
            cursor: refreshing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem',
            color: 'var(--color-text)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-card)'}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} /> {refreshing ? 'Actualizando...' : 'Actualizar Red'}
        </button>
      </div>

      {/* ─── Grid de Estadísticas y Estado de Conexión ──────────── */}
      <div className="blockchain-top-grid">
        
        {/* Card Conexión */}
        <div style={{ background: 'var(--color-bg-card)', borderRadius: '20px', border: '1px solid var(--color-border)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Server size={18} color="var(--color-text-muted)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado de Red</span>
            </div>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isConnected ? 'rgba(22, 163, 74, 0.15)' : 'rgba(239, 68, 68, 0.15)', padding: '6px 14px', borderRadius: '20px', marginBottom: '16px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? '#10b981' : '#ef4444', boxShadow: isConnected ? '0 0 10px #10b981' : 'none' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isConnected ? '#10b981' : '#ef4444' }}>
                {isConnected ? 'Conectado / En Línea' : 'Desconectado'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>Canal de Red:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>canal de autogestión</span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>Modo de Ledger:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0ea5e9' }}>
                  {stats?.mode === 'SIMULADO (Ledger JSON)' ? 'SIMULADO (JSON del libro mayor)' : (stats?.mode || 'No detectado')}
                </span>
              </div>
            </div>

            {/* Botón para Mostrar/Ocultar Detalles de Topología */}
            <button
              onClick={() => setShowTopology(!showTopology)}
              style={{
                width: '100%',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: showTopology ? '16px' : '0',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
            >
              <span>{showTopology ? 'Ocultar Componentes de Red' : 'Mostrar Componentes de Red'}</span>
              {showTopology ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Detalles de la Topología Hyperledger Fabric */}
            {showTopology && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: '6px' }}>
                    NODOS VALIDADORES (PEERS)
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', background: 'var(--color-bg-secondary)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)', fontWeight: 600 }}>peer0.org1.autogestion.com</span>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 700 }}>Activo</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', background: 'var(--color-bg-secondary)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)', fontWeight: 600 }}>peer0.org2.autogestion.com</span>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 700 }}>Activo</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: '4px' }}>
                    SERVICIO DE CONSENSO (ORDENADOR)
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', background: 'var(--color-bg-secondary)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)', fontWeight: 600 }}>orderer.autogestion.com</span>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.65rem' }}>(Balsa)</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', display: 'block', marginBottom: '4px' }}>
                    CONTRATO INTELIGENTE (CHAINCODE)
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', background: 'rgba(124, 58, 237, 0.15)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.25)', fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#818cf8', fontWeight: 600 }}>Nombre:</span>
                      <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>código de cadena de autogestión</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#818cf8', fontWeight: 600 }}>Versión:</span>
                      <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>v1.0.0</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#818cf8', fontWeight: 600 }}>Idioma:</span>
                      <span style={{ color: 'var(--color-text)', fontWeight: 700 }}>Node.js (JavaScript)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={16} color="var(--color-text-muted)" />
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Puerta de enlace SDK de Fabric v1.0.0</span>
          </div>
        </div>

        {/* Card Totales */}
        <div style={{ background: 'var(--color-bg-card)', borderRadius: '20px', border: '1px solid var(--color-border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Layers size={18} color="var(--color-text-muted)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Métricas Generales del Ledger</span>
          </div>
          
          <div className="blockchain-metrics-grid">
            <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Altura Ledger</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)' }}>{stats?.totalBlocks || 0}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>Bloques Registrados</span>
            </div>
            <div style={{ background: 'rgba(14, 165, 233, 0.12)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(14, 165, 233, 0.25)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Inmuebles</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>{stats?.totalInmuebles || 0}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-primary-light)', display: 'block', marginTop: '2px' }}>Títulos Sellados</span>
            </div>
            <div style={{ background: 'rgba(34, 197, 94, 0.12)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(34, 197, 94, 0.25)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Contratos</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>{stats?.totalContratos || 0}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', display: 'block', marginTop: '2px' }}>Firmas Selladas</span>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.25)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-warning)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pagos</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-warning)' }}>{stats?.totalPagos || 0}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-warning)', display: 'block', marginTop: '2px' }}>Recibos Auditados</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Explorador de Bloques ──────────────────────────────── */}
      <div style={{ background: 'var(--color-bg-card)', borderRadius: '20px', border: '1px solid var(--color-border)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="#0ea5e9" /> Explorador del Ledger de Bloques
        </h2>

        {(!stats || !stats.blocks || stats.blocks.length === 0) ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Layers size={48} style={{ color: 'var(--color-border)', marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>El Ledger está vacío</p>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              Aún no se han sellado transacciones de contratos, títulos o pagos en la Blockchain.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginatedBlocks.map(block => {
              const isExpanded = expandedBlock === block.blockNumber;
              const tx = block.transactions[0]; // Simplificación: 1 tx por bloque en el simulador
              
              return (
                <div 
                  key={block.blockNumber}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: isExpanded ? 'var(--color-bg-secondary)' : 'var(--color-bg-card)',
                    transition: 'all 0.2s'
                  }}
                >
                  
                  {/* Fila Principal de Bloque */}
                  <div 
                    onClick={() => setExpandedBlock(isExpanded ? null : block.blockNumber)}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    
                    {/* Bloque Número e Icono */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        color: '#ffffff', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                        fontSize: '0.9rem', boxShadow: '0 3px 8px rgba(14,165,233,0.2)'
                      }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.8, textTransform: 'uppercase', lineHeight: 1 }}>Block</span>
                        <span>#{block.blockNumber}</span>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9rem' }}>
                            Bloque Sellado
                          </span>
                          {tx && getTxBadge(tx.txName)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12} /> {new Date(block.timestamp).toLocaleString('es-BO')}
                        </div>
                      </div>
                    </div>

                    {/* Hash Abreviado y Expandible */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Block Hash:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <code style={{ background: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '6px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {block.blockHash.slice(0, 12)}...{block.blockHash.slice(-8)}
                          </code>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCopy(block.blockHash, block.blockNumber); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0 }}
                            title="Copiar Hash"
                          >
                            {copiedId === block.blockNumber ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedBlock(isExpanded ? null : block.blockNumber); }}
                          style={{
                            background: isExpanded ? 'var(--color-bg-secondary)' : '#0ea5e9',
                            color: isExpanded ? 'var(--color-text-secondary)' : '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: isExpanded ? 'none' : '0 2px 6px rgba(14,165,233,0.2)'
                          }}
                        >
                          {isExpanded ? 'Cerrar' : 'Ver Detalle'}
                        </button>
                        <div style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Panel Desplegable (Detalles del Bloque) */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid var(--color-border)',
                      padding: '20px',
                      background: 'var(--color-bg-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      
                      <div className="blockchain-hashes-grid">
                        <div>
                          <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Hash Anterior (PrevHash)</span>
                          <code style={{ background: 'var(--color-bg-secondary)', padding: '4px 8px', borderRadius: '6px', display: 'block', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                            {block.prevHash}
                          </code>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Hash de Bloque Completo</span>
                          <code style={{ background: 'var(--color-bg-secondary)', padding: '4px 8px', borderRadius: '6px', display: 'block', color: 'var(--color-primary-light)', border: '1px solid var(--color-border)', overflowX: 'auto', whiteSpace: 'nowrap', fontWeight: 600 }}>
                            {block.blockHash}
                          </code>
                        </div>
                      </div>

                      {/* Transacción */}
                      {tx && (
                        <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-border)' }}>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getTxIcon(tx.txName)} Datos del Registro de Transacción
                          </h4>
                          
                          <div className="blockchain-tx-grid">
                            <div>
                              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>ID Transacción (TxID):</span>
                              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{tx.txId}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>ID del Activo Sellado:</span>
                              <span style={{ fontWeight: 700, color: '#0ea5e9' }}>{tx.assetId}</span>
                            </div>
                          </div>

                          {/* Argumentos/Payload JSON */}
                          <div>
                            <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Payload de Firma y Atributos:</span>
                            <pre style={{
                              margin: 0,
                              background: '#0f172a',
                              color: '#38bdf8',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              overflowX: 'auto',
                              lineHeight: 1.5,
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                              {JSON.stringify(tx.args, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border)'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'var(--color-bg-secondary)',
                    color: currentPage === 1 ? 'var(--color-text-muted)' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    transition: 'all 0.15s'
                  }}
                >
                  Anterior
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'var(--color-bg-secondary)',
                    color: currentPage === totalPages ? 'var(--color-text-muted)' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    transition: 'all 0.15s'
                  }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .blockchain-top-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
          margin-bottom: 24px;
          align-items: stretch;
        }
        .blockchain-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .blockchain-hashes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          font-size: 0.8rem;
        }
        .blockchain-tx-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 14px;
          font-size: 0.8rem;
        }

        @media (max-width: 840px) {
          .blockchain-top-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 680px) {
          .blockchain-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .blockchain-metrics-grid {
            grid-template-columns: 1fr;
          }
          .blockchain-hashes-grid,
          .blockchain-tx-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageBlockchain;

