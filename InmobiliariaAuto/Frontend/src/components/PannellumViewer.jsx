import React, { useEffect, useRef, useState } from 'react';
import { Compass, Maximize2, RotateCw, Eye } from 'lucide-react';

export default function PannellumViewer({ scenes = [], initialSceneId = null, height = '450px' }) {
  const viewerRef = useRef(null);
  const containerId = useRef(`pannellum-${Math.random().toString(36).substring(2, 9)}`);
  const [currentScene, setCurrentScene] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!scenes || scenes.length === 0) return;

    const startScene = initialSceneId
      ? scenes.find((s) => s.id === initialSceneId) || scenes[0]
      : scenes[0];

    setCurrentScene(startScene);

    const initPannellum = () => {
      if (!window.pannellum) {
        setTimeout(initPannellum, 300);
        return;
      }

      // Build scenes configuration object for pannellum
      const scenesConfig = {};
      scenes.forEach((scene) => {
        const hotspots = (scene.hotspotsSalientes || []).map((h) => ({
          pitch: Number(h.pitch) || 0,
          yaw: Number(h.yaw) || 0,
          type: 'scene',
          text: h.textoAyuda || 'Cambiar de habitación',
          sceneId: h.escenaDestinoId,
        }));

        scenesConfig[scene.id] = {
          title: scene.descripcion || 'Recorrido 360°',
          type: 'equirectangular',
          panorama: scene.archivoUrl,
          autoLoad: true,
          hotSpots: hotspots,
        };
      });

      try {
        if (viewerRef.current) {
          viewerRef.current.destroy();
        }

        viewerRef.current = window.pannellum.viewer(containerId.current, {
          default: {
            firstScene: startScene.id,
            sceneFadeDuration: 1000,
            autoLoad: true,
            autoRotate: -1.5,
            compass: true,
            showZoomCtrl: true,
            showFullscreenCtrl: true,
          },
          scenes: scenesConfig,
        });

        viewerRef.current.on('scenechange', (sceneId) => {
          const found = scenes.find((s) => s.id === sceneId);
          if (found) setCurrentScene(found);
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('Error initializing Pannellum:', err);
      }
    };

    initPannellum();

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [scenes, initialSceneId]);

  const switchScene = (scene) => {
    setCurrentScene(scene);
    if (viewerRef.current) {
      viewerRef.current.loadScene(scene.id);
    }
  };

  if (!scenes || scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
        <Compass className="w-10 h-10 text-slate-600 mb-2 animate-spin" />
        <p className="text-sm">No hay imágenes panorámicas 360° registradas para este inmueble.</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 shadow-2xl bg-slate-950">
      {/* 360 Badge Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-500/40 text-xs font-semibold text-indigo-300">
        <Eye className="w-4 h-4 text-indigo-400 animate-pulse" />
        <span>Visor Inmersivo 360° — {currentScene?.descripcion || 'Habitación'}</span>
      </div>

      {/* Pannellum Container */}
      <div id={containerId.current} style={{ width: '100%', height }} />

      {/* Scene Switcher Selector Pills */}
      {scenes.length > 1 && (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-2 justify-center bg-slate-950/70 backdrop-blur-md p-2 rounded-xl border border-slate-800">
          {scenes.map((s) => (
            <button
              key={s.id}
              onClick={() => switchScene(s)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                currentScene?.id === s.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s.descripcion || `Escena ${s.orden + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
