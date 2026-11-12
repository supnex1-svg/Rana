// src/constants.tsx
import React from 'react';
import type { NavItem, ServiceItem, ClientItem } from './types';
export const COLORS = {
  primary: '#C8202F', // O4U Brand Red
  secondary: '#171717', // Dark Charcoal
  background: '#FFFFFF',
};

export const NAV_LINKS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'The Firm', path: '/about' },
  { label: 'Strategic Services', path: '/services' },
  { label: 'Partnerships', path: '/clients' },
  { label: 'Consultation', path: '/contact' },
];

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/share/19yXAkUPZU/?mibextid=wwXIfr',
  linkedin: 'https://www.linkedin.com/company/onboarding-agency/',
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'hr',
    title: 'Human Capital & HR Systems',
    description: 'We optimize the pharmacists and retail specialists who drive your reputation and revenue. From recruitment to executive leadership development.',
    icon: 'Users',
    image: '/images/Services/001.webp',
    points: [
      'Strategic Pharmacist Acquisition',
      'Clinical Excellence Training',
      'KPI & Incentive Architecture',
      'Succession & Career Path Design'
    ]
  },
  {
    id: 'operations',
    title: 'Operational Rigor & SOPs',
    description: 'Eliminate waste and drive standardized excellence across every square meter of your retail footprint through engineering-grade operations.',
    icon: 'ClipboardCheck',
    image: '/images/Services/002.webp',
    points: [
      'Inventory Yield Optimization',
      'Chain-Wide SOP Standardization',
      'Regulatory Compliance Audits',
      'Store Format & Flow Engineering'
    ]
  },
  {
    id: 'marketing',
    title: 'Pharma Marketing & Category',
    description: 'Data-driven category management and brand positioning that captures higher patient share in saturated Middle Eastern markets.',
    icon: 'TrendingUp',
    image: '/images/Services/003.webp',
    points: [
      'Category Management & Pricing',
      'Patient Loyalty & CRM Strategy',
      'E-Pharma Digital Transformation',
      'New Market Entry Strategy (KSA/Egypt)'
    ]
  }
];

// Helper to generate logo URLs based on pattern: /images/Partnerships/[Region]/[Name].webp
const generateLogoUrl = (name: string, region: string) => {
  const folder = region === 'Saudi Arabia' ? 'KSA' : 'Egypt';
  const encodedName = encodeURIComponent(name);
  return `/images/Partnerships/${folder}/${encodedName}.webp`;
};

export const CLIENTS: ClientItem[] = [
  // Egypt Partners
  { name: 'Care Pharmacy', region: 'Egypt', logo: generateLogoUrl('Care Pharmacy', 'Egypt') },
  { name: 'Gold Pharmacy', region: 'Egypt', logo: generateLogoUrl('Gold Pharmacy', 'Egypt') },
  { name: 'Abdin Pharmacy', region: 'Egypt', logo: generateLogoUrl('Abdin Pharmacy', 'Egypt') },
  { name: 'Fouda Pharmacy', region: 'Egypt', logo: generateLogoUrl('Fouda Pharmacy', 'Egypt') },
  { name: 'Gabr Pharmacy', region: 'Egypt', logo: generateLogoUrl('Gabr Pharmacy', 'Egypt') },
  { name: 'Garhy Pharmacy', region: 'Egypt', logo: generateLogoUrl('Garhy Pharmacy', 'Egypt') },
  { name: 'Asker Pharmacy', region: 'Egypt', logo: generateLogoUrl('Asker Pharmacy', 'Egypt') },
  { name: 'Reaya Pharmacy', region: 'Egypt', logo: generateLogoUrl('Reaya Pharmacy', 'Egypt') },
  { name: 'CPS', region: 'Egypt', logo: generateLogoUrl('CPS', 'Egypt') },
  { name: 'Auxilio', region: 'Egypt', logo: generateLogoUrl('Auxilio', 'Egypt') },
  
  // KSA Partners
  { name: 'Ghaya Pharmacy', region: 'Saudi Arabia', logo: generateLogoUrl('Ghaya Pharmacy', 'Saudi Arabia') },
  { name: 'Al Amal Pharmacy', region: 'Saudi Arabia', logo: generateLogoUrl('Al Amal Pharmacy', 'Saudi Arabia') },
  { name: 'Rawaa Pharmacy', region: 'Saudi Arabia', logo: generateLogoUrl('Rawaa Pharmacy', 'Saudi Arabia') },
];

export const CONTACT_INFO = {
  email: 'info@onboarding4u.com',
  phone: '+20 100 393 9499',
  address: 'New Cairo District, Cairo, Egypt',
  officeHours: 'Sunday - Thursday: 9:00 AM - 6:00 PM (GMT+2)'
};