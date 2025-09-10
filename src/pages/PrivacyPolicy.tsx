import React from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdSense } from '@/components/AdSense';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy - House Budget Calculator"
        description="Read our privacy policy to understand how we collect, use, and protect your personal and financial information."
        keywords="privacy policy, data protection, financial data security, user privacy"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <p className="text-gray-600">
                  We collect information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support. This may include your name, email address, 
                  and any financial data you choose to input into our calculators.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Information</h4>
                <p className="text-gray-600">
                  We automatically collect certain information about your use of our service, including 
                  your IP address, browser type, pages visited, and the time and date of your visits.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li>• To provide and maintain our budgeting services</li>
                <li>• To process your financial calculations and provide insights</li>
                <li>• To communicate with you about our services</li>
                <li>• To improve our platform and develop new features</li>
                <li>• To ensure the security and integrity of our service</li>
                <li>• To comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except in the following circumstances:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• With your explicit consent</li>
                <li>• To comply with legal processes or government requests</li>
                <li>• To protect our rights, property, or safety</li>
                <li>• In connection with a business transfer or merger</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction. 
                However, no method of transmission over the internet is 100% secure, and we cannot 
                guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We retain your personal information for as long as necessary to provide our services 
                and fulfill the purposes outlined in this policy, unless a longer retention period 
                is required by law.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• The right to access your personal information</li>
                <li>• The right to correct inaccurate information</li>
                <li>• The right to delete your personal information</li>
                <li>• The right to restrict processing of your information</li>
                <li>• The right to data portability</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We use cookies and similar tracking technologies to enhance your experience on our platform. 
                You can control cookie settings through your browser preferences, though some features 
                may not function properly if cookies are disabled.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you become aware that a child 
                has provided us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We may update this privacy policy from time to time. We will notify you of any 
                significant changes by posting the new policy on this page and updating the 
                "last updated" date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                If you have any questions about this privacy policy or our data practices, 
                please contact us at <a href="mailto:homebudgetcalculator@gmail.com" className="text-primary hover:underline">homebudgetcalculator@gmail.com</a>.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8">
            <AdSense adSlot="1234567890" />
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;