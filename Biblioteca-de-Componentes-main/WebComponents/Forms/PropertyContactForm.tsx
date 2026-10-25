// @use(kind, props, limit, deps)
// @kind(component)
// @limit(lines: 100)
// @props({ propertyId?: string, propertyLocation?: string, className?: string })
// @deps(@internal: [api, ContactForm, ContactFormData])
import { api } from '../../../services/api';
import type { ContactFormData } from '../../../lib/types';
import { ContactForm } from './ContactForm';

interface PropertyContactFormProps {
  propertyId?: string;
  propertyLocation?: string;
  className?: string;
}

export function PropertyContactForm({ propertyId, propertyLocation, className }: PropertyContactFormProps) {
  const handleSubmit = (formData: ContactFormData) =>
    api.contact.submit({ ...formData, propiedad_id: propertyId });

  return (
    <ContactForm
      propertyId={propertyId}
      propertyLocation={propertyLocation}
      onSubmit={handleSubmit}
      className={className}
    />
  );
}
