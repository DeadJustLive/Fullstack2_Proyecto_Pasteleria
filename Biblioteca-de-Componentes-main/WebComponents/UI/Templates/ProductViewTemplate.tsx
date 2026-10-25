// @use(kind, contract, limit, deps, compose)
// @kind(feature)
// @limit(lines: 250)
// @contract(in: useParams(id) -> out: Property detail page with image gallery, info, contact form, related)
// @compose({ ImageLightbox, RelatedProperties, PropertyImageGallery, PropertyContactForm, PriceDisplay, BrandButton })
// @deps(@internal: [PageTransition, PropertyImageGallery, PropertyContactForm, BrandButton, ImageLightbox, RelatedProperties, BADGE_VARIANT_MAP, COMPANY_PHONE_URL], @external: [react-router, motion, sonner])

import { useReducer, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { m } from 'motion/react';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Bed, Bath, Maximize, CheckCircle2, Share2 } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { api, UF_VALUE } from '../services/api';
import { Property } from '../lib/types';
import { BrandButton } from '../components/ui/BrandButton';
import { PropertyDetailSkeleton } from '../components/ui/skeletons/PropertyDetailSkeleton';
import { PropertyContactForm } from '../components/ui/contact/PropertyContactForm';
import { PropertyImageGallery } from '../components/ui/PropertyImageGallery';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriceDisplay } from '../components/ui/PriceDisplay';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { RelatedProperties } from '../components/catalog/RelatedProperties';
import { BADGE_VARIANT_MAP, COMPANY_PHONE_URL, COMPANY_NAME } from '../lib/constants';
import { SEO } from '../components/ui/SEO';
import { ShareModal } from '../components/ui/ShareModal';
import { useState } from 'react';

const getEmbedUrl = (url?: string | null) => {
  if (!url) return '';
  const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
};

interface ViewState {
  property: Property | null;
  isLoading: boolean;
  selectedImageIndex: number;
  showImageModal: boolean;
  relatedProperties: Property[];
}

type ViewAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; property: Property; related: Property[] }
  | { type: 'FETCH_ERROR' }
  | { type: 'SET_IMAGE_INDEX'; index: number }
  | { type: 'SET_MODAL'; show: boolean };

const initialState: ViewState = {
  property: null,
  isLoading: true,
  selectedImageIndex: 0,
  showImageModal: false,
  relatedProperties: [],
};

function viewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, property: action.property, relatedProperties: action.related, selectedImageIndex: 0, showImageModal: false };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false };
    case 'SET_IMAGE_INDEX':
      return { ...state, selectedImageIndex: action.index };
    case 'SET_MODAL':
      return { ...state, showImageModal: action.show };
    default:
      return state;
  }
}

export default function PropertyView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(viewReducer, initialState);
  const { property, isLoading, selectedImageIndex, showImageModal, relatedProperties } = state;
  const [showShareModal, setShowShareModal] = useState(false);
  const viewTracked = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPropertyData = async () => {
      if (!id) return;
      try {
        dispatch({ type: 'FETCH_START' });
        const [data, allData] = await Promise.all([
          api.properties.getById(id),
          api.properties.getAll()
        ]);
        if (data) {
          if (!viewTracked.current) {
            viewTracked.current = true;
            api.properties.trackView(id);
          }
          const sameCategory = allData.filter(
            p => p.id !== data.id && p.category === data.category && p.status === data.status
          ).slice(0, 3);
          dispatch({ type: 'FETCH_SUCCESS', property: data, related: sameCategory });
        }
      } catch {
        toast.error('Error', { description: 'No se pudo cargar la propiedad.' });
        dispatch({ type: 'FETCH_ERROR' });
      }
    };
    fetchPropertyData();
  }, [id]);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const getShareMessage = () => {
    if (!property) return '';
    const priceStr = property.price_label || (() => {
      const uf = property.status === 'Venta'
        ? (property.price / UF_VALUE).toLocaleString('es-CL', { maximumFractionDigits: 0 })
        : ((property.price || 0) / UF_VALUE).toLocaleString('es-CL', { maximumFractionDigits: 2 });
      return `UF ${uf}`;
    })();
    return `¡Mira esta increíble propiedad que encontré en ${COMPANY_NAME}!\n${property.title} - ${priceStr}`;
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <div className="h-32" />
          <PropertyDetailSkeleton />
        </div>
      </PageTransition>
    );
  }

  if (!property) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Propiedad no encontrada</h1>
          <BrandButton variant="primary" size="lg" onClick={() => navigate('/catalog')}>
            Volver al Catálogo
          </BrandButton>
        </div>
      </PageTransition>
    );
  }

  const allImages = property.images.length > 0 ? property.images : [property.image];

  const propertyTitle = property.title;
  const propertyDescription = property.short_description || `${property.bedrooms} dorm, ${property.bathrooms} baños, ${property.location}`;
  const propertyImage = property.images?.[0] || property.image;

  return (
    <PageTransition>
      <SEO
        title={propertyTitle}
        description={`${propertyTitle} — ${propertyDescription}. ${COMPANY_NAME}`}
        image={propertyImage}
        url={`https://schmidtcorredores.cl/catalog/${property.id}`}
      />
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="h-20 lg:h-24" />
        <div className="container mx-auto px-4 max-w-7xl pt-4">
          <button
            onClick={() => navigate('/catalog')}
            className="flex items-center gap-2 font-semibold mb-6 text-slate-500 transition-colors hover:text-brand-cyan"
          >
            <ArrowLeft className="size-5" /> Volver al catálogo
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start">
            <div className="w-full lg:w-[55%] relative">
              <div className="hidden lg:block absolute inset-0 z-0 bg-gradient-to-b from-slate-100/80 via-white to-slate-50 rounded-r-[3rem] border-r border-slate-100" />
              <PropertyImageGallery
                images={allImages}
                title={property.title}
                status={property.status}
                featured={property.featured}
                selectedImageIndex={selectedImageIndex}
                onSelectImage={(index) => dispatch({ type: 'SET_IMAGE_INDEX', index })}
                onOpenModal={() => dispatch({ type: 'SET_MODAL', show: true })}
              />
              <PropertyContactForm propertyId={id} propertyLocation={property.location} className="hidden lg:block" />
            </div>

            <div className="flex-1 min-w-0 lg:pl-10 lg:pt-4">
              <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-2 leading-tight">{property.title}</h1>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="size-4 text-brand-cyan shrink-0" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <button onClick={handleShare} className="bg-white p-3 rounded-full transition-colors cursor-pointer hover:bg-brand-cyan/10 shadow-sm border border-slate-100 shrink-0" aria-label="Compartir">
                    <Share2 className="size-5 text-brand-cyan" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
                  <PriceDisplay price={property.price} status={property.status} priceLabel={property.price_label} variant="sm" className="border-none pb-0" />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: Bed, value: property.bedrooms || 'N/A', label: 'Dormitorios' },
                    { icon: Bath, value: property.bathrooms || 'N/A', label: 'Baños' },
                    { icon: Maximize, value: property.sqm, label: 'm² útiles' },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="bg-white py-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <Icon className="size-6 mb-1.5 text-brand-cyan" />
                      <span className="text-xl font-black text-slate-900">{value}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
                  <div className="mb-8 last:mb-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Descripción</h3>
                    <div className="text-sm text-slate-600 leading-relaxed">
                      {property.description ? (
                        property.description.split('\n').filter(Boolean).map((paragraph) => (
                          <p key={paragraph.slice(0, 40)} className="mb-3 last:mb-0">{paragraph}</p>
                        ))
                      ) : (
                        <>
                          <p className="mb-3">Bienvenido a esta espectacular {property.type.toLowerCase()} ubicada en una de las zonas más privilegiadas de {property.location}.</p>
                          <p>Esta es una oportunidad única en el mercado actual para adquirir una propiedad que combina plusvalía, conectividad y seguridad.</p>
                        </>
                      )}
                    </div>
                  </div>
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="pt-6 border-t border-slate-50">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Características</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity) => (
                          <span key={amenity} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-700 text-sm px-4 py-2 rounded-xl transition-colors hover:bg-white hover:border-brand-cyan/20">
                            <CheckCircle2 className="size-3.5 text-brand-cyan shrink-0" />
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {property.video_url && (
                    <div className="pt-6 border-t border-slate-50">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Video de la Propiedad</h3>
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100">
                        <iframe
                          width="100%"
                          height="100%"
                          src={getEmbedUrl(property.video_url)}
                          title="Video de la propiedad"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>

                <PropertyContactForm propertyId={id} propertyLocation={property.location} className="lg:hidden" />
              </m.div>
            </div>
          </div>
        </div>

        <RelatedProperties properties={relatedProperties} />
      </div>

      <ImageLightbox
        images={allImages}
        title={property.title}
        isOpen={showImageModal}
        onClose={() => dispatch({ type: 'SET_MODAL', show: false })}
        selectedIndex={selectedImageIndex}
        onSelectIndex={(index) => dispatch({ type: 'SET_IMAGE_INDEX', index })}
      />

      {property && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          url={`https://schmidtcorredores.cl/catalog/${property.id}`}
          title={property.title}
          message={getShareMessage()}
        />
      )}
    </PageTransition>
  );
}