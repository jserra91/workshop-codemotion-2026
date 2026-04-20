import {
  $solicitudes, $solicitudesCount, addSolicitud, clearSolicitudes,
  $theme, $locale, setTheme, setLocale,
} from './stores';

// Expose stores on window for cross-MF access
window.__MF_STORES__ = {
  solicitudes: {
    $items: $solicitudes,
    $count: $solicitudesCount,
    addSolicitud,
    clearSolicitudes,
  },
  user: {
    $theme,
    $locale,
    setTheme,
    setLocale,
  },
};
