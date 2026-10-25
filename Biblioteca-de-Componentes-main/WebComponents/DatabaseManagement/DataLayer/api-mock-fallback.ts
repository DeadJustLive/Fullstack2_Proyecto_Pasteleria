// @use(kind, contract, limit, scope, deps, learn-error)
// @kind(service)
// @limit(lines: 150, reason: "refactor pendiente: extraer cada sub-servicio (properties, testimonials, contact) a archivos separados")
// @contract(in: Supabase/mock -> out: Property[], Testimonial[], contact.submit result @error: PostgrestError | unknown)
// @scope(module:api, module:properties, module:testimonials, module:contact)
// @deps(@internal: [supabase, isSupabaseConfigured, mockProperties], @external: [@supabase/supabase-js])
// @learn-error id=API-001 input='mapper functions con parametro any' expected=2 actual=0 fix='Crear interfaz SupabasePropertyRow y tipar mock como intersection type'
// @learn-error id=API-002 input='catch block con err any' expected=1 actual=0 fix='Cambiar err any a err unknown'
// @learn-error id=API-003 input='api.contact.submit() ignora propiedad_id del ContactFormData' expected='property_interest se guarda en la tabla leads' actual='propiedad_id se pierde porque no se incluye en el INSERT' fix='Agregar property_interest: formData.propiedad_id || null al insert de leads' category=project-structure

/**
 * Capa de datos — Supabase con fallback a mockData.
 *
 * Si las variables de entorno de Supabase no están configuradas,
 * el servicio devuelve datos mock para desarrollo local.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Property, Testimonial, ContactFormData } from '../lib/types';
import { mockProperties as rawMockProperties } from '../lib/mockData';
import { UF_VALUE } from '../lib/constants';

export { UF_VALUE };

// ── Helpers ───────────────────────────────────────────────────────────

/** Simula latencia de red para el fallback mock */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mapea un row crudo de Supabase al tipo Property normalizado
 * con campos de compatibilidad (image, sqm, type, pricePerSqm).
 */
interface SupabasePropertyRow {
  id: string;
  title: string | null;
  short_description: string | null;
  description: string | null;
  price: number | null;
  price_label: string | null;
  location: string | null;
  images: string[] | null;
  category: string | null;
  operation_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  area_total: number | null;
  area_usable: number | null;
  amenities: string[] | null;
  status: string | null;
  featured: boolean | null;
  created_at: string | null;
  video_url?: string | null;
  [key: string]: unknown;
}

function mapDbPropertyToProperty(row: SupabasePropertyRow): Property {
  const images: string[] = row.images ?? [];
  const areaTotal = row.area_total ?? row.area_usable ?? 0;
  const price = row.price ?? 0;

  // Mapear category → label display
  const categoryMap: Record<string, string> = {
    casa: 'Casa',
    departamento: 'Depto',
    terreno: 'Terreno',
    local: 'Local',
    parcela: 'Parcela',
  };

  // Mapear operation_type → status display para compat con filtros
  const operationMap: Record<string, 'Venta' | 'Alquiler'> = {
    venta: 'Venta',
    arriendo: 'Alquiler',
    venta_arriendo: 'Venta',
  };

  const statusMap: Record<string, 'Venta' | 'Alquiler' | 'Vendida' | 'Arrendada'> = {
    published: operationMap[row.operation_type] ?? 'Venta',
    sold: 'Vendida',
    rented: 'Arrendada',
    draft: 'Venta', // shouldn't reach frontend, but safe fallback
  };

  return {
    id: row.id,
    title: row.title ?? '',
    short_description: row.short_description ?? null,
    description: row.description ?? null,
    price,
    price_label: row.price_label ?? null,
    location: row.location ?? '',
    images,
    category: row.category ?? '',
    operation_type: row.operation_type ?? 'venta',
    bedrooms: row.bedrooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    parking_spaces: row.parking_spaces ?? 0,
    area_total: row.area_total ?? null,
    area_usable: row.area_usable ?? null,
    amenities: row.amenities ?? [],
    status: statusMap[row.status] ?? 'Venta',
    featured: row.featured ?? false,
    created_at: row.created_at,
    video_url: row.video_url ?? null,

    // Legacy compat fields
    image: images[0] ?? '',
    sqm: areaTotal,
    pricePerSqm: areaTotal > 0 ? Math.round(price / areaTotal) : 0,
    type: categoryMap[row.category] ?? row.category ?? '',
  };
}

/**
 * Convierte la mock data legacy al formato normalizado Property.
 * Esto garantiza que los componentes siempre reciben el mismo shape.
 */
function mapMockToProperty(mock: Property & { image: string; sqm: number; type: string }): Property {
  return {
    ...mock,
    short_description: null,
    description: null,
    price_label: null,
    images: [mock.image],
    category: mock.type?.toLowerCase() === 'depto' ? 'departamento' : mock.type?.toLowerCase() ?? '',
    operation_type: mock.status === 'Alquiler' ? 'arriendo' : 'venta',
    parking_spaces: 0,
    area_total: mock.sqm ?? 0,
    area_usable: null,
    amenities: [],
    created_at: undefined,
  };
}

// ── API Service ───────────────────────────────────────────────────────

export const api = {
  properties: {
    /**
     * Obtiene todas las propiedades publicadas.
     * Supabase: query directa con RLS (status = 'published').
     */
    getAll: async (): Promise<Property[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('properties')
          .select(
            'id, title, short_description, description, price, price_label, location, images, category, operation_type, bedrooms, bathrooms, parking_spaces, area_total, area_usable, amenities, status, featured, created_at, video_url'
          )
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[api.properties.getAll]', error);
          throw error;
        }

        return (data ?? []).map(mapDbPropertyToProperty);
      }

      // ── Fallback: mock data ──
      await delay(800);
      return rawMockProperties.map(mapMockToProperty);
    },

    /**
     * Obtiene propiedades destacadas.
     */
    getFeatured: async (): Promise<Property[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('properties')
          .select(
            'id, title, short_description, price, price_label, location, images, category, operation_type, bedrooms, bathrooms, parking_spaces, area_total, area_usable, amenities, status, featured, created_at, video_url'
          )
          .eq('status', 'published')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('[api.properties.getFeatured]', error);
          throw error;
        }

        return (data ?? []).map(mapDbPropertyToProperty);
      }

      // Fallback
      await delay(600);
      return rawMockProperties.filter(p => p.featured).map(mapMockToProperty);
    },

    /**
     * Obtiene una propiedad por ID.
     */
    getById: async (id: string): Promise<Property | undefined> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('[api.properties.getById]', error);
          return undefined;
        }

        return data ? mapDbPropertyToProperty(data) : undefined;
      }

      // Fallback
      await delay(500);
      const mock = rawMockProperties.find(p => p.id === id);
      return mock ? mapMockToProperty(mock) : undefined;
    },

    /**
     * Registra una vista (analítica) para una propiedad.
     * Usa la RPC `increment_property_views` con SECURITY DEFINER.
     */
    trackView: async (propertyId: string): Promise<void> => {
      if (!isSupabaseConfigured || !supabase) return;

      const { error } = await supabase.rpc('increment_property_views', {
        p_id: propertyId,
      });

      if (error) {
        console.error('[api.properties.trackView]', error);
      }
    },
  },

  testimonials: {
    /**
     * Obtiene testimonios publicados y destacados.
     */
    getFeatured: async (): Promise<Testimonial[]> => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('testimonials')
          .select('author_name, role_label, comment, rating')
          .eq('is_published', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('[api.testimonials.getFeatured]', error);
          throw error;
        }

        return data ?? [];
      }

      // Fallback: mock testimonials
      await delay(400);
      return [
        { author_name: 'María González', role_label: 'Cliente Satisfecho', comment: 'Matías fue profesional y atento durante todo el proceso. Vendimos nuestra casa en menos de un mes. ¡Excelente servicio!', rating: 5 },
        { author_name: 'Carlos Ramírez', role_label: 'Comprador', comment: 'La mejor experiencia comprando un departamento. El equipo nos guió en cada paso y consiguieron una excelente negociación.', rating: 5 },
        { author_name: 'Patricia Silva', role_label: 'Vendedora', comment: 'Profesionales de verdad. La valoración fue precisa y el acompañamiento legal impecable. Los recomiendo al 100%.', rating: 5 },
      ];
    },
  },

  contact: {
    /**
     * Envía un lead + mensaje al CRM (Inbox de la PWA).
     * Doble inserción: leads → messages.
     */
    submit: async (formData: ContactFormData): Promise<{ success: boolean; error?: string }> => {
      if (!isSupabaseConfigured || !supabase) {
        // Fallback en desarrollo: simular éxito
        await delay(800);
        console.log('[api.contact.submit] Mock — datos recibidos:', formData);
        return { success: true };
      }

      try {
        const leadId = crypto.randomUUID();

        // Paso 1: Crear Lead (sin .select() para no violar RLS)
        const { error: leadError } = await supabase
          .from('leads')
          .insert({
            id: leadId,
            first_name: formData.nombre,
            last_name: formData.apellido || null,
            phone: formData.telefono || null,
            email: formData.correo || null,
            status: 'new',
            property_interest: formData.propiedad_id || null,
          });

        if (leadError) {
          console.error('[api.contact.submit] Lead error:', leadError);
          return { success: false, error: 'No se pudo registrar el contacto.' };
        }

        // Paso 2: Guardar mensaje inicial
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: leadId,
            content: formData.mensaje,
            direction: 'inbound',
          });

        if (msgError) {
          console.error('[api.contact.submit] Message error:', msgError);
          // Lead se creó pero el mensaje falló — aún se considera parcialmente exitoso
          return { success: true, error: 'Contacto registrado pero hubo un error al guardar el mensaje.' };
        }

        return { success: true };
      } catch (err: unknown) {
        console.error('[api.contact.submit] Error inesperado:', err);
        return { success: false, error: 'Error inesperado al enviar el formulario.' };
      }
    },
  },
};
