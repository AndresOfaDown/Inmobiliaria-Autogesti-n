import React, { useState } from 'react';
import {
  FileText,
  PenTool,
  CheckCircle,
  ShieldCheck,
  X,
  Lock,
  Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export default function ContractSignModal({
  isOpen,
  onClose,
  contrato,
  onSigned,
}) {
  const { user } = useAuthStore();
  const [signatureText, setSignatureText] = useState(
    user ? `${user.nombre} ${user.apellido || ''}` : '',
  );
  const [loading, setLoading] = useState(false);
  const [signedResult, setSignedResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen || !contrato) return null;

  const handleSign = async (e) => {
    e.preventDefault();
    if (!signatureText.trim()) {
      setError('Por favor ingresa tu nombre completo como firma digital');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const signatureHash = `DIGITAL_SIG_${btoa(signatureText.trim())}_${Date.now()}`;
      const res = await api.post(`/contracts/${contrato.id}/sign`, {
        firmaBase64: signatureHash,
      });

      setSignedResult(res.data);
      if (onSigned) onSigned(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al firmar el contrato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl p-6 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Firma Electrónica y Certificación en Blockchain
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[340px]">
                Contrato Ref: {contrato.id.slice(0, 8)} • Inmueble: {contrato.inmueble?.titulo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {signedResult ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle className="w-14 h-14 text-emerald-400 animate-bounce" />
            <h4 className="text-base font-bold text-white">¡Contrato Firmado Exitosamente!</h4>

            {signedResult.blockchainTxId ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl max-w-md text-left text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Certificado en el Libro Mayor (Blockchain):</span>
                </div>
                <p className="text-slate-300">
                  <strong className="text-white">Bloque Minado:</strong> #{signedResult.blockchainBlockNumber}
                </p>
                <p className="text-slate-300 font-mono break-all">
                  <strong className="text-white font-sans">TxID:</strong> {signedResult.blockchainTxId}
                </p>
                <p className="text-slate-300 font-mono break-all">
                  <strong className="text-white font-sans">Hash Criptográfico:</strong> {signedResult.blockchainHash}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Tu firma ha sido asentada. El contrato entrará en vigencia y se registrará en Blockchain en cuanto la contraparte plasme su firma.
              </p>
            )}

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg"
            >
              Cerrar y Volver
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Contract Legal Text */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-serif max-h-56 overflow-y-auto whitespace-pre-wrap selection:bg-indigo-500">
              {contrato.clausulas || 'Cargando términos contractuales redactados por IA...'}
            </div>

            {/* Financial Terms Brief */}
            <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
              <div>
                <span className="text-slate-400">Canon / Monto:</span>
                <p className="font-bold text-white mt-0.5">
                  {contrato.monto} {contrato.moneda}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Garantía:</span>
                <p className="font-bold text-white mt-0.5">
                  {contrato.deposito} {contrato.moneda}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Día de Pago:</span>
                <p className="font-bold text-white mt-0.5">
                  Cada día {contrato.diaPago}
                </p>
              </div>
            </div>

            {/* Signatures status */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div
                className={`p-3 rounded-xl border ${
                  contrato.firmaPropietario
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-semibold block">Firma Arrendador:</span>
                <span>{contrato.firmaPropietario ? '✓ Firmado Digitalmente' : 'Pendiente de firma'}</span>
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  contrato.firmaInquilino
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="font-semibold block">Firma Arrendatario:</span>
                <span>{contrato.firmaInquilino ? '✓ Firmado Digitalmente' : 'Pendiente de firma'}</span>
              </div>
            </div>

            {/* Digital signature entry */}
            <form onSubmit={handleSign} className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Escribe tu Nombre Completo como Firma Digital Válida:
                </label>
                <div className="relative">
                  <PenTool className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    required
                    placeholder="Ej. Juan Pérez García"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>
                  Al firmar, se generará un hash criptográfico SHA-256 inalterable asentado en el Ledger Blockchain.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{loading ? 'Certificando Firma...' : 'Firmar Digitalmente'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
