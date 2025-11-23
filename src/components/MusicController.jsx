import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';

/**
 * Music Controller Widget
 * Permite controlar la reproducción de música desde la página del anfitrión
 * Compatible con Spotify Web, YouTube, y otros reproductores en el navegador
 */
const MusicController = () => {
  const [mediaInfo, setMediaInfo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Intentar obtener información de la Media Session API
    if ('mediaSession' in navigator && navigator.mediaSession.metadata) {
      const metadata = navigator.mediaSession.metadata;
      setMediaInfo({
        title: metadata.title || 'Reproduciendo...',
        artist: metadata.artist || 'Artista desconocido',
        album: metadata.album || '',
        artwork: metadata.artwork?.[0]?.src || null,
      });
    }

    // Listener para detectar cambios en la reproducción
    const handleMediaSession = () => {
      if (navigator.mediaSession.metadata) {
        const metadata = navigator.mediaSession.metadata;
        setMediaInfo({
          title: metadata.title || 'Reproduciendo...',
          artist: metadata.artist || 'Artista desconocido',
          album: metadata.album || '',
          artwork: metadata.artwork?.[0]?.src || null,
        });
      }
    };

    // Verificar cada segundo si hay cambios
    const interval = setInterval(handleMediaSession, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = () => {
    try {
      if ('mediaSession' in navigator) {
        if (isPlaying) {
          navigator.mediaSession.setActionHandler('pause', null);
          // Trigger pause event
          const pauseEvent = new KeyboardEvent('keydown', {
            key: ' ',
            code: 'Space',
            keyCode: 32,
          });
          document.dispatchEvent(pauseEvent);
        } else {
          navigator.mediaSession.setActionHandler('play', null);
          // Trigger play event
          const playEvent = new KeyboardEvent('keydown', {
            key: ' ',
            code: 'Space',
            keyCode: 32,
          });
          document.dispatchEvent(playEvent);
        }
        setIsPlaying(!isPlaying);
      }
    } catch (error) {
      console.log('Control de reproducción no disponible');
    }
  };

  const handleNext = () => {
    try {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('nexttrack', null);
        // Simular presionar tecla siguiente
        const nextEvent = new KeyboardEvent('keydown', {
          key: 'MediaTrackNext',
          code: 'MediaTrackNext',
        });
        document.dispatchEvent(nextEvent);
      }
    } catch (error) {
      console.log('No se pudo avanzar a la siguiente canción');
    }
  };

  const handlePrevious = () => {
    try {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('previoustrack', null);
        // Simular presionar tecla anterior
        const prevEvent = new KeyboardEvent('keydown', {
          key: 'MediaTrackPrevious',
          code: 'MediaTrackPrevious',
        });
        document.dispatchEvent(prevEvent);
      }
    } catch (error) {
      console.log('No se pudo retroceder a la canción anterior');
    }
  };

  const openSpotify = () => {
    window.open('https://open.spotify.com/', '_blank', 'width=800,height=600');
  };

  const openYouTubeMusic = () => {
    window.open('https://music.youtube.com/', '_blank', 'width=800,height=600');
  };

  return (
    <Card title="Control de música">
      <div className="space-y-4">
        {/* Media info display */}
        {mediaInfo ? (
          <div className="flex items-center space-x-4 p-4 bg-slate-700/50 rounded-lg">
            {mediaInfo.artwork && (
              <img
                src={mediaInfo.artwork}
                alt="Album art"
                className="w-16 h-16 rounded-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-50 truncate">
                {mediaInfo.title}
              </p>
              <p className="text-sm text-slate-400 truncate">{mediaInfo.artist}</p>
              {mediaInfo.album && (
                <p className="text-xs text-slate-500 truncate">{mediaInfo.album}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-700/50 rounded-lg text-center">
            <p className="text-slate-400 text-sm">
              No hay música reproduciéndose
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Abre Spotify o YouTube Music para controlar la música
            </p>
          </div>
        )}

        {/* Playback controls */}
        <div className="flex justify-center items-center space-x-3">
          <Button
            variant="ghost"
            size="md"
            onClick={handlePrevious}
            title="Canción anterior"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={handleNext}
            title="Siguiente canción"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M16 18h2V6h-2zm-11 0l8.5-6L5 6z" />
            </svg>
          </Button>
        </div>

        {/* Quick access buttons */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={openSpotify}
            className="text-xs"
          >
            🎵 Abrir Spotify
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openYouTubeMusic}
            className="text-xs"
          >
            ▶️ Abrir YouTube Music
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-500 text-center mt-4">
          <p>💡 Consejo: Abre tu reproductor de música en una pestaña</p>
          <p>del navegador para mejor compatibilidad</p>
        </div>
      </div>
    </Card>
  );
};

export default MusicController;
