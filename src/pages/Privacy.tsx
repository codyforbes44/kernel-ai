import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEO } from "@/components/seo/SEO";
import { SEO_CONFIG, PAGE_SEO, getOrganizationSchema, getBreadcrumbSchema, BREADCRUMBS } from "@/lib/seo";

export default function Privacy() {
  const lastUpdated = "December 20, 2025";

  return (
    <PublicLayout>
      <SEO
        title={PAGE_SEO.privacy.title}
        description={PAGE_SEO.privacy.description}
        ogImage={PAGE_SEO.privacy.ogImage}
        keywords={PAGE_SEO.privacy.keywords as unknown as string[]}
        canonical="/privacy"
        structuredData={[
          getOrganizationSchema(SEO_CONFIG.siteUrl),
          BREADCRUMBS.privacy(SEO_CONFIG.siteUrl),
        ]}
      />

      <article className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kernel ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                AI-powered development platform and related services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <h3 className="text-lg font-medium mb-2">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Name and email address when you create an account</li>
                <li>Payment information when you subscribe to paid plans</li>
                <li>Profile information you choose to add</li>
                <li>Communications you send to us</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-6">Usage Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We automatically collect certain information when you use our services:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information (device type, operating system)</li>
                <li>Usage patterns and feature interactions</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions</li>
                <li>Personalize and improve your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Your Code and Projects</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your code and project data are private by default. We do not share your code with third 
                parties or use it to train AI models. Your projects are encrypted at rest and in transit. 
                You retain full ownership of all code and content you create using our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>With service providers who assist in operating our platform</li>
                <li>To comply with legal obligations or respond to lawful requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
                <li>With your consent or at your direction</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data, including encryption, 
                secure servers, and regular security audits. However, no method of transmission over the 
                Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze usage, and 
                assist in our marketing efforts. You can control cookies through your browser settings, 
                though disabling them may affect some features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under 13. We do not knowingly collect personal 
                information from children under 13. If you believe we have collected such information, 
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the "Last updated" date. Your continued 
                use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:privacy@kernel.app" className="text-primary hover:underline">
                  privacy@kernel.app
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}
