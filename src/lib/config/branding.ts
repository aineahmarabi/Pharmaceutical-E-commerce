export const branding = {
  name: 'PharmaCare',
  tagline: 'Your health, delivered',
  logo: null as string | null,
  // Monogram only, for tiny spots like the admin sidebar badge.
  logoMark: '/images/brand/mutende-logo-mark.png' as string,
  phone: '+254 700 000 000',
  email: '',

  whatsapp: '+254700000000',
  address: 'Nairobi, Kenya',
  mapLink: '' as string,
  socialLinks: {
    twitter: '',
    instagram: '',
    facebook: '',
  },
  currency: 'KES',
  // Pharmacy and Poisons Board licence number. Editable in Admin > Settings > Pharmacy details.
  ppbLicenceNumber: 'PPB/U005/039/25' as string,
} as const;
