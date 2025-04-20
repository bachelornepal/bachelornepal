
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy - BachelorNepal"
        description="Read our privacy policy to understand how we handle your information"
      />
      <Layout>
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose max-w-none">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
            <p>BachelorNepal ("we" or "us") values your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and contact information</li>
              <li>Academic interests</li>
              <li>Browser information</li>
              <li>Usage data</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our services</li>
              <li>Communicate with you</li>
              <li>Analyze website usage</li>
              <li>Protect our legal rights</li>
            </ul>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PrivacyPolicy;
