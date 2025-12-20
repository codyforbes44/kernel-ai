import { PublicLayout } from "@/components/layout/PublicLayout";
import { SEO } from "@/components/seo/SEO";
import { SEO_CONFIG, getOrganizationSchema } from "@/lib/seo";

export default function Terms() {
  const lastUpdated = "December 20, 2025";

  return (
    <PublicLayout>
      <SEO
        title="Terms of Service - Kernel"
        description="Read the terms and conditions for using the Kernel platform."
        structuredData={[getOrganizationSchema(SEO_CONFIG.siteUrl)]}
      />

      <article className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <header className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Kernel's services, you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, 
                you are prohibited from using or accessing our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kernel provides an AI-powered development platform that enables users to build, deploy, 
                and manage web applications. Our services include AI code generation, visual building 
                tools, deployment infrastructure, and collaboration features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To use certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to use our services to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Distribute malware, viruses, or harmful code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Generate spam or unsolicited communications</li>
                <li>Create content that is illegal, harmful, or offensive</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <h3 className="text-lg font-medium mb-2">Your Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You retain ownership of all code, content, and materials you create using our platform. 
                By using our services, you grant us a limited license to store and process your content 
                as necessary to provide our services.
              </p>
              <h3 className="text-lg font-medium mb-2">Our Platform</h3>
              <p className="text-muted-foreground leading-relaxed">
                Kernel and its original content, features, and functionality are owned by Kernel and are 
                protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Subscription and Payment</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Paid subscriptions are billed in advance on a recurring basis. You agree to pay all 
                applicable fees and authorize us to charge your payment method.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Fees are non-refundable except as required by law or as stated in our refund policy</li>
                <li>We may change pricing with 30 days' notice</li>
                <li>Failure to pay may result in suspension or termination of your account</li>
                <li>You are responsible for all taxes associated with your subscription</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to maintain high availability but do not guarantee uninterrupted access. 
                Services may be temporarily unavailable for maintenance, updates, or circumstances 
                beyond our control. We are not liable for any interruption or loss of access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Kernel shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including loss of profits, 
                data, or other intangible losses, resulting from your use or inability to use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are provided "as is" and "as available" without warranties of any kind, 
                either express or implied, including but not limited to implied warranties of 
                merchantability, fitness for a particular purpose, or non-infringement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless Kernel, its affiliates, and their respective 
                officers, directors, employees, and agents from any claims, damages, losses, or expenses 
                arising from your use of our services or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for any 
                reason, including breach of these Terms. Upon termination, your right to use our services 
                will cease immediately. You may also terminate your account at any time through your 
                account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the 
                jurisdiction in which Kernel operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of 
                significant changes by posting the new Terms on this page and updating the "Last updated" 
                date. Your continued use of our services after changes constitutes acceptance of the 
                modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:legal@kernel.app" className="text-primary hover:underline">
                  legal@kernel.app
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
