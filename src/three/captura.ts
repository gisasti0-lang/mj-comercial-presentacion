/**
 * Puente entre el visor 3D y la interfaz para exportar la vista actual.
 * Es una referencia de módulo y no estado global: el botón vive fuera del
 * lienzo y sólo necesita invocar la función, sin re-renderizarse cuando ésta
 * se registra.
 */
export const captura: { exportar: (() => void) | null } = { exportar: null }
