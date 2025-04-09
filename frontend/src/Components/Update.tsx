import { useEffect, useState } from 'react';

// Extend the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI?: {
      checkForUpdates: () => void;
      onUpdateAvailable: (callback: (version: string) => void) => void;
      onUpdateDownloaded: (callback: (version: string) => void) => void;
      onDownloadProgress: (callback: (percent: number) => void) => void;
      downloadUpdate: () => void;
      restartApp: () => void;
      removeAllListeners: () => void;
    };
  }
}

export default function Update() {
  const [updateState, setUpdateState] = useState<'available' | 'downloaded' | ''>('');
  const [status, setStatus] = useState('Verificando actualizaciones...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!window.electronAPI) {
      setStatus('No se detectó el entorno Electron');
      return;
    }

    // Verificar actualizaciones al montar
    window.electronAPI.checkForUpdates();

    const handleUpdateAvailable = (version: string) => {
      console.log('Update available:', version);
      setUpdateState('available');
      setStatus(`Actualización disponible: v${version}`);
    };

    const handleUpdateDownloaded = (version: string) => {
      console.log('Update downloaded:', version);
      setUpdateState('downloaded');
      setStatus(`Actualización lista: v${version}`);
    };

    const handleProgress = (percent: number) => {
      setProgress(percent);
    };

    // Configurar listeners
    window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
    window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);
    window.electronAPI.onDownloadProgress(handleProgress);

    return () => {
      window.electronAPI?.removeAllListeners();
    };
  }, []);

  const handleDownload = () => {
    setStatus('Descargando actualización...');
    window.electronAPI?.downloadUpdate();
  };

  const handleRestart = () => {
    window.electronAPI?.restartApp();
  };

  return (
    <div className="update-notification">
      <div className="update-status">{status}</div>
      
      {progress > 0 && progress < 100 && (
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {updateState === 'available' && (
        <button onClick={handleDownload}>
          Descargar Actualización ({progress}%)
        </button>
      )}

      {updateState === 'downloaded' && (
        <button onClick={handleRestart}>
          Reiniciar e Instalar
        </button>
      )}
    </div>
  );
}