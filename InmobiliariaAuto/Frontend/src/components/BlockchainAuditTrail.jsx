import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Link as LinkIcon,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  FileText,
  DollarSign,
  Key,
  Clock,
  Hash,
} from 'lucide-react';
import api from '../api/axios';

export default function BlockchainAuditTrail({ compact = false }) {
  const [chain, setChain] = useState([]);
  const [stats, setStats] = useState(null);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const [ledgerRes, verifyRes] = await Promise.all([
        api.get('/blockchain/ledger'),
        api.get('/blockchain/verify'),
      ]);
      setChain(ledgerRes.data.chain || []);
      setStats(ledgerRes.data.stats || null);
      setIntegrity(verifyRes.data || null);
    } catch (err) {
      console.error('Error fetching ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filteredChain = chain.filter((block) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    const hasInBlock =
      block.index.toString().includes(q) ||
      block.hash.toLowerCase().includes(q) ||
      block.previousHash.toLowerCase().includes(q);
    const hasInTx = block.transactions.some(
      (t) =>
        t.txId.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        JSON.stringify(t.payload).toLowerCase().includes(q),
    );
    return hasInBlock || hasInTx;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Integrity Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Libro Mayor Criptográfico (Blockchain Ledger)
              </h2>
              {integrity?.isValid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" /> Cadena Íntegra y Válida
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" /> Discrepancia en Cadena
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Certificación inmutable de títulos de propiedad, firmas digitales y auditoría de pagos con hash SHA-256
            </p>
          </div>
        </div>

        <button
          onClick={fetchLedger}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar Ledger
        </button>
      </div>

      {/* KPI Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Bloques
            </p>
            <p className="text-xl font-extrabold text-white mt-1">
              #{stats.totalBlocks}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Títulos Certificados
            </p>
            <p className="text-xl font-extrabold text-indigo-400 mt-1">
              {stats.propRegistrations}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Contratos Firmados
            </p>
            <p className="text-xl font-extrabold text-purple-400 mt-1">
              {stats.contractSignatures}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Auditorías de Pago
            </p>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">
              {stats.paymentAudits}
            </p>
          </div>
        </div>
      )}

      {/* Search filter input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filtrar por TxID, número de bloque (#), hash SHA-256 o datos de contrato..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Blocks Timeline */}
      <div className="space-y-4">
        {filteredChain.map((block) => (
          <div
            key={block.index}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all shadow-lg"
          >
            {/* Block Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold text-xs flex items-center justify-center">
                  #{block.index}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {block.index === 0 ? 'Bloque Génesis' : `Bloque Inmutable #${block.index}`}
                    <span className="text-xs font-normal text-slate-400">
                      (Nonce: {block.nonce})
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(block.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                  {block.transactions.length} Transacción(es)
                </span>
              </div>
            </div>

            {/* Hashes Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 font-mono">
              <div className="overflow-hidden text-ellipsis">
                <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">
                  Hash Actual (SHA-256):
                </span>
                <span className="text-emerald-400 font-semibold">{block.hash}</span>
              </div>
              <div className="overflow-hidden text-ellipsis">
                <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">
                  Hash Bloque Previo:
                </span>
                <span className="text-slate-400">{block.previousHash}</span>
              </div>
              <div className="md:col-span-2 overflow-hidden text-ellipsis pt-1 border-t border-slate-800/40">
                <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">
                  Merkle Root:
                </span>
                <span className="text-indigo-400">{block.merkleRoot}</span>
              </div>
            </div>

            {/* Block Transactions List */}
            <div className="space-y-2 mt-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Libro de Asientos Criptográficos:
              </p>
              {block.transactions.map((tx) => (
                <div
                  key={tx.txId}
                  onClick={() => setSelectedTx({ tx, block })}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:bg-slate-800/40 hover:border-indigo-500/40 cursor-pointer transition-all gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    {tx.type === 'REGISTRO_INMUEBLE' && (
                      <span className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {tx.type === 'FIRMA_CONTRATO' && (
                      <span className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {tx.type === 'AUDITORIA_PAGO' && (
                      <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <DollarSign className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">
                          {tx.txId}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                            tx.type === 'REGISTRO_INMUEBLE'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : tx.type === 'FIRMA_CONTRATO'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tx.payload?.metadata?.titulo ||
                          (tx.payload?.monto
                            ? `Monto auditado: ${tx.payload.monto} ${tx.payload.moneda || 'USD'}`
                            : 'Registro oficial de datos')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-indigo-400 self-end sm:self-auto font-medium">
                    <span>Ver Detalles</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail for Transaction */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Auditoría Forense de Transacción
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedTx.tx.txId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Bloque Asignado:</span>
                  <p className="text-sm font-bold text-white">#{selectedTx.block.index}</p>
                </div>
                <div>
                  <span className="text-slate-400">Timestamp Inmutable:</span>
                  <p className="text-sm font-semibold text-slate-300">
                    {new Date(selectedTx.tx.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2 overflow-hidden text-ellipsis font-mono">
                  <span className="text-slate-400 font-sans">Hash Criptográfico de Transacción:</span>
                  <p className="text-emerald-400 font-bold break-all mt-0.5">
                    {selectedTx.tx.txHash}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Carga Útil del Libro Mayor (Payload Descentralizado):
                </h4>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-indigo-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedTx.tx.payload, null, 2)}
                </pre>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-[11px]">
                ✓ Esta transacción se encuentra irrevocablemente consolidada en la cadena con prueba criptográfica de no repudio.
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
