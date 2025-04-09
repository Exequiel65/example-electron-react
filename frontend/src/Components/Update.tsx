import React, { useEffect, useState } from 'react'

// Extend the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI: {
      on: (channel: string, listener: (...args: any[]) => void) => void;
      send: (channel: string, ...args: any[]) => void;
    };
  }
}


export default function Update() {
    const [updateState, setUpdateState] = useState('');

  useEffect(() => {
    window.electronAPI.on('update_available', () => {
      setUpdateState('available');
    });
    
    window.electronAPI.on('update_downloaded', () => {
      setUpdateState('downloaded');
    });
  }, []);

  const handleDownload = () => {
    window.electronAPI.send('download_update');
  };

  const handleRestart = () => {
    window.electronAPI.send('restart_app');
  };

  return (
    <div className="update-notification">
      {updateState === 'available' && (
        <div>
          <p>Nueva actualización disponible</p>
          <button onClick={handleDownload}>Descargar</button>
        </div>
      )}
      {updateState === 'downloaded' && (
        <div>
          <p>Actualización lista para instalar</p>
          <button onClick={handleRestart}>Reiniciar e instalar</button>
        </div>
      )}
    </div>
  );
}
