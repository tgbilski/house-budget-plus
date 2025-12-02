import React from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
              <CardTitle>7. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We use cookies and similar tracking technologies to enhance your experience on our platform. 
                Cookies are small data files stored on your device that help us remember your preferences 
                and understand how you use our service.
              </p>
              <div>
                <h4 className="font-semibold mb-2">Types of Cookies We Use</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Essential Cookies:</strong> Required for the website to function properly</li>
                  <li>• <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li>• <strong>Advertising Cookies:</strong> Used by third-party advertising partners to serve relevant ads</li>
                </ul>
              </div>
              <p className="text-gray-600">
                You can control cookie settings through your browser preferences, though some features 
                may not function properly if cookies are disabled.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Third-Party Advertising and Data Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Google AdSense</h4>
                <p className="text-gray-600 mb-3">
                  We use Google AdSense to display advertisements on our website. Google AdSense uses cookies, 
                  web beacons, and other tracking technologies to collect information about your visits to this 
                  and other websites in order to provide advertisements about goods and services of interest to you.
                </p>
                <p className="text-gray-600 mb-3">
                  <strong>Important:</strong> Third parties, including Google, may be placing and reading cookies 
                  on your browser, or using web beacons to collect information as a result of ad serving on our website. 
                  This includes the use of cookies for purposes such as:
                </p>
                <ul className="space-y-2 text-gray-600 mb-3">
                  <li>• Serving ads based on your prior visits to our website or other websites</li>
                  <li>• Measuring the effectiveness of advertising campaigns</li>
                  <li>• Understanding user behavior and preferences</li>
                  <li>• Preventing fraud and improving ad security</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Information Collected by Third-Party Ad Partners</h4>
                <p className="text-gray-600 mb-3">
                  Third-party advertising partners may collect the following types of information through their 
                  cookies and tracking technologies:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• IP addresses and approximate geographic location</li>
                  <li>• Browser type, language, and device information</li>
                  <li>• Pages visited on our website and time spent on pages</li>
                  <li>• Referring website addresses</li>
                  <li>• Date and time of visits</li>
                  <li>• Interaction with advertisements</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">How Google Uses Your Data</h4>
                <p className="text-gray-600 mb-3">
                  Google may use the data collected to contextualize and personalize the ads of its own 
                  advertising network. To learn more about how Google uses data when you use our website, 
                  please visit:{" "}
                  <a 
                    href="https://www.google.com/policies/privacy/partners/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    How Google uses data when you use our partners' sites or apps
                  </a>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Your Advertising Choices</h4>
                <p className="text-gray-600 mb-3">
                  You have choices regarding personalized advertising:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Visit{" "}
                    <a 
                      href="https://www.google.com/settings/ads" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Ads Settings
                    </a>{" "}
                    to opt out of personalized advertising
                  </li>
                  <li>• Use the{" "}
                    <a 
                      href="https://optout.aboutads.info/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Digital Advertising Alliance opt-out page
                    </a>
                  </li>
                  <li>• Adjust your browser settings to block third-party cookies</li>
                  <li>• Use browser extensions that block tracking and advertising cookies</li>
                </ul>
                <p className="text-gray-600 mt-3 text-sm italic">
                  Please note that opting out of personalized advertising does not mean you will see fewer ads; 
                  you will still see advertisements, but they will be less relevant to your interests.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Google Analytics</h4>
                <p className="text-gray-600">
                  We use Google Analytics to analyze how visitors use our website. Google Analytics uses cookies 
                  to collect information such as how often users visit our site, what pages they visit, and what 
                  other sites they used prior to coming to our site. This information is used to improve our website 
                  and user experience. The data collected by Google Analytics is anonymous and does not personally 
                  identify individual users.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Children's Privacy (COPPA Compliance)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Our service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you become aware that a child 
                has provided us with personal information, please contact us immediately.
              </p>
              <p className="text-gray-600">
                In compliance with the Children's Online Privacy Protection Act (COPPA), we do not use 
                interest-based advertising to target children under 13, and we do not knowingly allow 
                third-party advertising networks to collect information from children under 13.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your information may be transferred to and processed in countries other than your country 
                of residence. These countries may have data protection laws that are different from the laws 
                of your country. By using our service, you consent to the transfer of your information to 
                the United States and other countries where our service providers operate.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We may update this privacy policy from time to time to reflect changes in our practices, 
                technology, legal requirements, and other factors. We will notify you of any 
                significant changes by posting the new policy on this page and updating the 
                "last updated" date. We encourage you to review this policy periodically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                If you have any questions about this privacy policy, our data practices, or your rights 
                under this policy, please contact us at:{" "}
                <a href="mailto:homebudgetcalculator@gmail.com" className="text-primary hover:underline">
                  homebudgetcalculator@gmail.com
                </a>
              </p>
              <p className="text-gray-600 mt-4">
                For inquiries specifically related to advertising and cookies, you may also contact us 
                through the same email address with "Privacy - Advertising" in the subject line.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;