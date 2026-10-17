import { useState, useEffect } from 'react';
import { Database, ShieldCheck, Copy, Check, ChevronDown, ChevronUp, Clock, FileText, CheckCircle2, User, Home, HelpCircle } from 'lucide-react';
import blockchainService from '../services/blockchainService';
import './BlockchainAuditTrail.css';

const TX_MAP = {
  registrarInmueble: {
    label: 'Registro de Propiedad',
    color: '#0284c7',
    bg: '#f0f9ff',
    icon: Home,
    desc: 'Título de propiedad verificado criptográficamente en la Blockchain.'
  },
  transferirPropiedad: {
    label: 'Transferencia de Dominio',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    icon: User,
    desc: 'Transferencia de derechos reales de dominio del inmueble a un nuevo propietario.'
  },
  crearContrato: {
    label: 'Creación de Contrato',
    color: '#6366f1',
    bg: '#e0e7ff',
    icon: FileText,
    desc: 'Registro inicial de los términos y condiciones de arrendamiento en la cadena.'
  },
  firmarContrato: {
    label: 'Firma Digital de Contrato',
    color: '#059669',
    bg: '#ecfdf5',
    icon: CheckCircle2,
    desc: 'Registro de firma criptográfica inmutable por una de las partes contratantes.'
  },
  registrarPago: {
    label: 'Auditoría de Pago',
    color: '#d97706',
    bg: '#fffbeb',
    icon: Clock,
    desc: 'Recibo y comprobante de pago de alquiler/garantía registrado para auditoría histórica.'
  }
};

const BlockchainAuditTrail = ({ assetId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const loadBlockchainHistory = async () => {
      if (!assetId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await blockchainService.getHistorial(assetId);
        // Sort descending by block number so newest is on top
        const sorted = (data || []).sort((a, b) => b.blockNumber - a.blockNumber);
        setHistory(sorted);
        // Expand the latest block by default if history exists
        if (sorted.length > 0) {
          setExpandedBlock(sorted[0].blockNumber);
        }
      } catch (err) {
        console.error('Error fetching blockchain history:', err);
        setError('No se pudo establecer conexión con el API Gateway de Blockchain.');
      } finally {
        setLoading(false);
      }
    };

    loadBlockchainHistory();
  }, [assetId]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (blockNumber) => {
    if (expandedBlock === blockNumber) {
      setExpandedBlock(null);
    } else {
      setExpandedBlock(blockNumber);
    }
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const formatKeyName = (key) => {
    // Convert camelCase to human readable title Case
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  if (loading) {
    return (
      <div className="blockchain-loading">
        <div className="blockchain-loading__spinner"></div>
        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Verificando libro mayor descentralizado...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blockchain-empty" style={{ borderColor: '#fca5a5', background: '#fff5f5' }}>
        <HelpCircle size={40} style={{ color: '#f87171', marginBottom: '12px' }} />
        <h4 className="blockchain-empty__title" style={{ color: '#991b1b' }}>Blockchain Inaccesible</h4>
        <p className="blockchain-empty__desc" style={{ color: '#b91c1c' }}>{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="blockchain-empty">
        <Database size={40} className="blockchain-empty__icon" />
        <h4 className="blockchain-empty__title">Sin registro en Blockchain</h4>
        <p className="blockchain-empty__desc">
          Este activo aún no se ha consolidado en el libro mayor inmutable. Las transacciones se añaden automáticamente una vez que son firmadas o validadas.
        </p>
      </div>
    );
  }

  return (
    <div className="blockchain-trail">
      {/* Premium Header */}
      <div className="blockchain-trail__header">
        <div>
          <h3 className="blockchain-trail__header-title">
            <ShieldCheck size={22} color="#10b981" />
            Trazabilidad Inmutable Blockchain
          </h3>
          <p className="blockchain-trail__header-subtitle">
            Auditoría criptográfica permisionada soportada por Hyperledger Fabric
          </p>
        </div>
        <div className="blockchain-badge">
          <div className="blockchain-badge__pulse"></div>
          Ledger Verificado
        </div>
      </div>

      {/* Timeline descentralizada */}
      <div className="blockchain-timeline">
        {history.map((node) => {
          const txConfig = TX_MAP[node.txName] || {
            label: formatKeyName(node.txName),
            color: '#475569',
            bg: '#f1f5f9',
            icon: Database,
            desc: 'Operación del sistema consolidada en el ledger de bloques.'
          };
          const IconComp = txConfig.icon;
          const isExpanded = expandedBlock === node.blockNumber;

          return (
            <div key={node.blockNumber} className="blockchain-node">
              {/* Dot marcador */}
              <div 
                className="blockchain-node__dot" 
                style={{ borderColor: txConfig.color }}
              ></div>

              {/* Contenedor de la tarjeta del bloque */}
              <div 
                className={`blockchain-node__card ${isExpanded ? 'blockchain-node__card--active' : ''}`}
                onClick={() => toggleExpand(node.blockNumber)}
              >
                <div className="blockchain-node__meta">
                  <div className="blockchain-node__title-group">
                    <span className="blockchain-node__number">Bloque #{node.blockNumber}</span>
                    <span 
                      className="blockchain-node__action" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        color: txConfig.color 
                      }}
                    >
                      <IconComp size={16} />
                      {txConfig.label}
                    </span>
                  </div>
                  <span className="blockchain-node__time">{formatDate(node.timestamp)}</span>
                </div>

                <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                  {txConfig.desc}
                </p>

                {/* Hashes del Bloque */}
                <div className="blockchain-hashes" onClick={(e) => e.stopPropagation()}>
                  <div className="blockchain-hash-row">
                    <span className="blockchain-hash-label">TxID:</span>
                    <span className="blockchain-hash-value" title={node.txId}>{node.txId}</span>
                    <button 
                      className="blockchain-copy-btn" 
                      onClick={() => handleCopy(node.txId, `tx-${node.blockNumber}`)}
                      title="Copiar ID de Transacción"
                    >
                      {copiedId === `tx-${node.blockNumber}` ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <div className="blockchain-hash-row">
                    <span className="blockchain-hash-label">Hash:</span>
                    <span className="blockchain-hash-value" title={node.blockHash}>{node.blockHash}</span>
                    <button 
                      className="blockchain-copy-btn" 
                      onClick={() => handleCopy(node.blockHash, `hash-${node.blockNumber}`)}
                      title="Copiar Hash de Bloque"
                    >
                      {copiedId === `hash-${node.blockNumber}` ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Desglose de Datos del Bloque al expandir */}
                {isExpanded && (
                  <div className="blockchain-data-panel" onClick={(e) => e.stopPropagation()}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '8px' }}>
                      Datos Consolidados del Ledger
                    </div>
                    <div className="blockchain-data-grid">
                      {Object.entries(node.data || {}).map(([key, value]) => {
                        // Skip render if object like "firmas" (we will format it separately or show it cleanly)
                        if (typeof value === 'object' && value !== null) {
                          return (
                            <div key={key} className="blockchain-data-item" style={{ gridColumn: 'span 2' }}>
                              <div className="blockchain-data-label">{formatKeyName(key)}</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                {Object.entries(value).map(([subKey, subVal]) => (
                                  <div key={subKey} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: '#f8fafc', padding: '6px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontWeight: 600, color: '#64748b', textTransform: 'capitalize' }}>{subKey}:</span>
                                    <span style={{ fontFamily: 'monospace', color: subVal ? '#059669' : '#94a3b8', fontSize: '0.74rem', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '75%' }} title={subVal || 'Sin firmar'}>
                                      {subVal ? `${subVal.substring(0, 16)}...` : 'Pendiente de firma'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        // Shorten long strings that look like hashes
                        const isLongHash = typeof value === 'string' && value.length > 40;
                        const displayVal = isLongHash ? `${value.substring(0, 20)}...` : String(value);

                        return (
                          <div key={key} className="blockchain-data-item">
                            <div className="blockchain-data-label">{formatKeyName(key)}</div>
                            <div className="blockchain-data-value" title={String(value)}>
                              {displayVal}
                              {isLongHash && (
                                <button 
                                  className="blockchain-copy-btn" 
                                  style={{ display: 'inline-flex', marginLeft: '4px', verticalAlign: 'middle' }}
                                  onClick={() => handleCopy(value, `val-${key}-${node.blockNumber}`)}
                                  title="Copiar valor completo"
                                >
                                  {copiedId === `val-${key}-${node.blockNumber}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Flecha indicadora de expansión */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px', color: '#94a3b8' }}>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlockchainAuditTrail;
