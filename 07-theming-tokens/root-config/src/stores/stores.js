import { atom, computed } from 'nanostores';

// --- Solicitudes Store (productos que el usuario quiere contratar) ---
export const $solicitudes = atom([]);

export const $solicitudesCount = computed($solicitudes, (items) => items.length);

export function addSolicitud(producto) {
  const items = $solicitudes.get();
  const exists = items.find((i) => i.nombre === producto.nombre);
  if (!exists) {
    $solicitudes.set([...items, { ...producto, fecha: new Date().toLocaleDateString('es-ES') }]);
  }
}

export function clearSolicitudes() {
  $solicitudes.set([]);
}

// --- User Store ---
export const $theme = atom('light');
export const $locale = atom('es');

export function setTheme(theme) {
  $theme.set(theme);
}

export function setLocale(locale) {
  $locale.set(locale);
}
