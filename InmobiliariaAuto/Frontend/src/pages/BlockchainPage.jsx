import React from 'react';
import BlockchainAuditTrail from '../components/BlockchainAuditTrail';
import { ShieldCheck, Lock, Cpu, Sparkles } from 'lucide-react';

export default function BlockchainPage() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Auditoría Descentralizada & Certificación Jurídica Inmutable</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explorador del Libro Mayor (Blockchain Ledger)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Cada evento crítico de la plataforma queda permanentemente certificado mediante un bloque criptográfico con hash SHA-256 encadenado y raíz Merkle a prueba de alteraciones.
        </p>
      </div>

      {/* Explanatory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Registro de Inmuebles
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Asienta el <code>hashTituloPropiedad</code> para certificar la titularidad registral y cotejar con el Folio Real.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Firmas de Contrato
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Asienta las firmas digitales de propietario e inquilino con timestamp inmutable y prueba de no repudio.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Auditoría de Pagos Stripe
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consolida cada transacción y liquidación de comisión en un bloque inviolable con respaldo bancario.
          </p>
        </div>
      </div>

      {/* The Blockchain Audit Trail Component */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-2xl">
        <BlockchainAuditTrail />
      </div>
    </div>
  );
}
