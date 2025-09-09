import React from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsAndConditions: React.FC = () => {
  return (
    <>
      <SEO 
        title="Terms and Conditions - House Budget Calculator"
        description="Read our terms and conditions to understand the rules and guidelines for using our budgeting platform and financial tools."
        keywords="terms and conditions, terms of service, user agreement, budget calculator terms"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                By accessing and using House Budget Calculator, you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                House Budget Calculator provides online financial planning tools, budget calculators, 
                and related services to help users manage their household finances. Our service includes 
                budgeting tools, savings goal tracking, expense analysis, and financial insights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Account and Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Creation</h4>
                <p className="text-gray-600">
                  You must create an account to access certain features. You are responsible for 
                  maintaining the confidentiality of your account credentials and for all activities 
                  that occur under your account.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Accurate Information</h4>
                <p className="text-gray-600">
                  You agree to provide accurate, current, and complete information during registration 
                  and to update such information to keep it accurate, current, and complete.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">You agree not to use the service to:</p>
              <ul className="space-y-2 text-gray-600">
                <li>• Violate any applicable laws or regulations</li>
                <li>• Transmit any harmful or malicious code</li>
                <li>• Attempt to gain unauthorized access to our systems</li>
                <li>• Use the service for any commercial purpose without permission</li>
                <li>• Share your account credentials with others</li>
                <li>• Upload false or misleading information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Financial Information Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our tools and calculators are provided for informational purposes only. They do not 
                constitute financial advice, and we recommend consulting with qualified financial 
                professionals for personalized guidance. We are not responsible for any financial 
                decisions made based on our calculations or recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                The service and its original content, features, and functionality are owned by 
                House Budget Calculator and are protected by international copyright, trademark, 
                patent, trade secret, and other intellectual property laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your privacy is important to us. Please review our Privacy Policy, which also governs 
                your use of the service, to understand our practices regarding the collection and use 
                of your information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Service Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We strive to maintain high service availability, but we do not guarantee uninterrupted 
                or error-free operation. We reserve the right to modify, suspend, or discontinue any 
                part of the service at any time without notice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                In no event shall House Budget Calculator be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including without limitation, loss of 
                profits, data, use, goodwill, or other intangible losses, resulting from your use 
                of the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We may terminate or suspend your account and access to the service immediately, 
                without prior notice or liability, for any reason whatsoever, including without 
                limitation if you breach the Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We reserve the right to modify or replace these Terms at any time. If a revision 
                is material, we will try to provide at least 30 days notice prior to any new terms 
                taking effect.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                If you have any questions about these Terms and Conditions, please contact us at 
                legal@housebudgetcalculator.com.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;