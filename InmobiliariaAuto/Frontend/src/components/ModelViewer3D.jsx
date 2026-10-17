import React, { useState } from 'react';
import { Box, Smartphone, Rotate3D, Sparkles } from 'lucide-react';

export default function ModelViewer3D({ src, alt = 'Modelo 3D Arquitectónico', height = '450px' }) {
  const [autoRotate, setAutoRotate] = useState(true);

  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
        <Box className="w-10 h-10 text-slate-600 mb-2" />
        <p className="text-sm">No se ha cargado un modelo 3D (.glb) para este inmueble.</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-violet-500/30 shadow-2xl bg-slate-950">
      {/* Top Banner */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-violet-500/40 text-xs font-semibold text-violet-300">
        <Box className="w-4 h-4 text-violet-400" />
        <span>Modelo 3D Interactivo + Realidad Aumentada (AR)</span>
      </div>

      {/* AR Mobile Instructions Pill */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/40 text-xs font-medium text-emerald-300">
        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        <span>Compatible con Móvil AR</span>
      </div>

      {/* Web Component <model-viewer> */}
      <model-viewer
        src={src}
        alt={alt}
        auto-rotate={autoRotate ? '' : undefined}
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        exposure="1"
        style={{ width: '100%', height }}
      >
        <button
          slot="ar-button"
          className="absolute bottom-4 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          Ver en mi Espacio (AR)
        </button>
      </model-viewer>

      {/* Controls bar */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1 text-xs rounded-lg flex items-center gap-1.5 font-medium transition-colors ${
            autoRotate
              ? 'bg-violet-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Rotate3D className="w-3.5 h-3.5" />
          <span>{autoRotate ? 'Pausar Giro' : 'Rotar 360°'}</span>
        </button>
      </div>
    </div>
  );
}
