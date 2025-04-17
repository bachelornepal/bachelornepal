
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  url?: string;
  children?: React.ReactNode;
}

export const SEO = ({
  title,
  description,
  keywords,
  image,
  type = "website",
  url,
  children,
}: SEOProps) => {
  const siteTitle = "BachelorNepal";
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
  const defaultDescription = "BachelorNepal - Educational Resources";
  
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="BachelorNepal" />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={image || "https://lovable.dev/opengraph-image-p98pqg.png"} />
      
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@BachelorNepal" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || "https://lovable.dev/opengraph-image-p98pqg.png"} />
      
      {children}
    </Helmet>
  );
};
