// @use(kind, props, limit, deps)
// @kind(feature)
// @limit(lines: 170, reason: "refactor pendiente: extraer subcomponentes success y form a archivos separados")
// @props({ propertyId?: string, propertyLocation?: string, onSubmit: (ContactFormData) => Promise<{success, error?}>, className?: string })
// @deps(@internal: [BrandInput, BrandTextarea, BrandButton, useContactForm], @external: [motion, lucide-react])

import { m, AnimatePresence } from 'motion/react';
import { Send, User, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { BrandInput } from '../brand/BrandInput';
import { BrandTextarea } from '../brand/BrandTextarea';
import { BrandButton } from '../BrandButton';
import { cn } from '../utils';
import { useContactForm } from '../../../hooks/useContactForm';
import type { ContactFormData } from '../../../lib/types';

interface ContactFormProps {
  propertyId?: string;
  propertyLocation?: string;
  onSubmit: (data: ContactFormData) => Promise<{ success: boolean; error?: string }>;
  className?: string;
}

export function ContactForm({ propertyId, propertyLocation, onSubmit, className }: ContactFormProps) {
  const {
    errors,
    touched,
    isSubmitting,
    submitStatus,
    submitError,
    handleSubmit,
    handleReset,
    inputProps,
  } = useContactForm(onSubmit, propertyId);

  return (
    <div className={cn('relative z-10 bg-white rounded-2xl shadow-lg border border-brand-cyan/10 overflow-hidden', className)}>
      <div className="h-1.5 bg-gradient-to-r from-brand-cyan to-cyan-400 rounded-t-2xl" />

      <AnimatePresence mode="wait">
        {submitStatus === 'success' ? (
          <m.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-8 text-center"
          >
            <div className="size-14 rounded-full bg-brand-cyan/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-7 text-brand-cyan" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">¡Consulta enviada!</h4>
            <p className="text-sm text-slate-500 mb-6">
              {propertyLocation
                ? `Un asesor inmobiliario te contactará respecto a la propiedad en ${propertyLocation} muy pronto.`
                : 'Un asesor inmobiliario te contactará muy pronto.'}
            </p>
            <BrandButton
              type="button"
              variant="subtle"
              size="md"
              onClick={handleReset}
            >
              Enviar otra consulta
            </BrandButton>
          </m.div>
        ) : (
          <m.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6"
          >
            <h4 className="font-bold text-slate-900 text-lg mb-1">¿Te interesa esta propiedad?</h4>
            <p className="text-sm text-slate-500 mb-5">Déjanos tus datos y te contactaremos a la brevedad</p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <BrandInput
                  type="text"
                  required
                  placeholder="Tu nombre completo"
                  icon={<User className="size-5" />}
                  theme="light"
                  {...inputProps('name')}
                />
                <AnimatePresence>
                  {touched.has('name') && errors.name && (
                    <m.p
                      id="name-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 text-xs text-red-500 mt-1.5"
                    >
                      <AlertCircle className="size-3 shrink-0" />
                      {errors.name}
                    </m.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <BrandInput
                    type="tel"
                    required
                    placeholder="Tu teléfono"
                    icon={<Phone className="size-5" />}
                    theme="light"
                    {...inputProps('phone')}
                  />
                  <AnimatePresence>
                    {touched.has('phone') && errors.phone && (
                      <m.p
                        id="phone-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1 text-xs text-red-500 mt-1.5"
                      >
                        <AlertCircle className="size-3 shrink-0" />
                        {errors.phone}
                      </m.p>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <BrandInput
                    type="email"
                    placeholder="Email (opcional)"
                    icon={<Mail className="size-5" />}
                    theme="light"
                    {...inputProps('email')}
                  />
                  <AnimatePresence>
                    {touched.has('email') && errors.email && (
                      <m.p
                        id="email-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1 text-xs text-red-500 mt-1.5"
                      >
                        <AlertCircle className="size-3 shrink-0" />
                        {errors.email}
                      </m.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <BrandTextarea
                required
                rows={2}
                theme="light"
                {...inputProps('message')}
              />

              <AnimatePresence>
                {submitStatus === 'error' && submitError && (
                  <m.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 text-sm text-red-500 bg-red-50 rounded-lg p-3"
                  >
                    <AlertCircle className="size-4 shrink-0" />
                    {submitError}
                  </m.p>
                )}
              </AnimatePresence>

              <BrandButton
                type="submit"
                variant="dark"
                size="lg"
                fullWidth
                className="group !w-full mx-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <m.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="inline-block size-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Enviando…
                  </span>
                ) : (
                  <>
                    Confirmar Consulta
                    <Send className="size-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </BrandButton>
            </form>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}