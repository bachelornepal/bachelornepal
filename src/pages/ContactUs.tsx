
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";

const ContactUs = () => {
  return (
    <>
      <SEO 
        title="Contact Us - BachelorNepal"
        description="Get in touch with BachelorNepal for any queries about bachelor's programs in Nepal"
      />
      <Layout>
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
          <div className="prose max-w-none">
            <p>Have questions about bachelor's programs in Nepal? We're here to help! You can reach us through any of the following channels:</p>
            
            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Email</h2>
                <p>info@bachelornepal.com</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">Address</h2>
                <p>Kathmandu, Nepal</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">Office Hours</h2>
                <p>Sunday - Friday: 9:00 AM - 5:00 PM</p>
                <p>Saturday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ContactUs;
