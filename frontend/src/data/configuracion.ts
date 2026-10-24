// Configuracion de la tienda (mock). Se persiste en localStorage.
// La API Key NUNCA se guarda en el navegador: solo se recuerda si ya hay una cargada.
export const CONFIG_STORAGE_KEY = "cremeco-config";

export interface ConfigTienda {
  nombre: string;
  email: string;
  banner: string;
  flowHabilitado: boolean;
  flowConfigurado: boolean;
}

export const CONFIG_INICIAL: ConfigTienda = {
  nombre: "Crème & Co",
  email: "contacto@cremeco.cl",
  banner: "Descubre nuestras mejores tortas hechas en casa.",
  flowHabilitado: true,
  flowConfigurado: false,
};
