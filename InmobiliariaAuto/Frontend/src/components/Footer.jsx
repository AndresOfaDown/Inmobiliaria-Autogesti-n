import { Building2, ShieldCheck, Cpu, Lock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">InmoAuto</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma autónoma e inteligente para compra, venta, anticrético y alquiler de propiedades. Sin intermediarios abusivos, con certificación en Blockchain y verificación legal por IA.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Tecnologías Clave
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>IA para Contratos y Títulos</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ledger Blockchain Inmutable</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pasarela de Pago Stripe Escrow</span>
              </li>
              <li>Visor 360° & AR Realidad Aumentada</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Módulos del Sistema
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-white">Explorador de Inmuebles</Link></li>
              <li><Link to="/blockchain" className="hover:text-white">Auditoría Blockchain</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Gestor de Contratos Digitales</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Recorridos Virtuales 360°</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Seguridad y Legalidad
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cumplimiento estricto con la normativa civil vigente. Títulos de propiedad cotejados y protegidos con hash criptográfico SHA-256 en cada bloque.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Red Blockchain Activa • Bloques sincronizados
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 InmoAuto. Sistema de Autogestión Inmobiliaria Inteligente.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Diseñado para transparencia y soberanía inmobiliaria
          </p>
        </div>
      </div>
    </footer>
  );
}
