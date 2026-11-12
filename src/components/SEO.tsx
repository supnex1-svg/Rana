import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  article?: boolean;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, article }) => {
  const { pathname } = useLocation();
  const siteName = "Onboarding 4U";
  
  // تجنب تكرار أجزاء من العنوان إذا كان يحتوي بالفعل على اسم الموقع
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const defaultImage = `${siteUrl}/images/Home/hero.webp`;
  const seoImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;
  const currentUrl = `${siteUrl}${pathname}`;

  useEffect(() => {
    // ضبط عنوان الصفحة ولغة المستند إلى الإنجليزية
    document.title = fullTitle;
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';

    // Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', currentUrl);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = currentUrl;
      document.head.appendChild(link);
    }

    // Open Graph Tags
    const ogTags: Record<string, string> = {
      'og:title': fullTitle,
      'og:description': description,
      'og:image': seoImage,
      'og:url': currentUrl,
      'og:type': article ? 'article' : 'website',
      'og:site_name': siteName,
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

    // Twitter Card Tags
    const twitterTags: Record<string, string> = {
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': description,
      'twitter:image': seoImage,
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

  }, [fullTitle, description, seoImage, currentUrl, article]);

  return null;
};

export default SEO;