
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";

const AboutUs = () => {
  return (
    <>
      <SEO 
        title="About Us - BachelorNepal"
        description="Learn more about BachelorNepal and our mission to help students pursue their bachelor's degree in Nepal"
      />
      <Layout>
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-8">About Us</h1>
          <div className="prose max-w-none">
            <p>Welcome to BachelorNepal, your comprehensive guide to bachelor's degree programs in Nepal. We are dedicated to providing detailed information about various courses including BCA, BIM, and CSIT to help students make informed decisions about their academic future.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p>Our mission is to make higher education information accessible to all prospective students in Nepal. We strive to provide accurate, up-to-date information about course curricula, admission requirements, and career prospects.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comprehensive course information</li>
              <li>Regular updates on admission dates</li>
              <li>Detailed syllabus breakdowns</li>
              <li>Career guidance</li>
            </ul>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AboutUs;
