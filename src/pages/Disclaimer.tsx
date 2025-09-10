import React from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info, Shield, TrendingUp } from 'lucide-react';

const Disclaimer: React.FC = () => {
  return (
    <>
      <SEO 
        title="Disclaimer - House Budget Calculator"
        description="Important disclaimers about using our budgeting tools and financial calculators. Understand the limitations and proper use of our services."
        keywords="disclaimer, financial calculator disclaimer, budgeting tool limitations, financial advice disclaimer"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Disclaimer</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Important information about the use and limitations of our budgeting tools and services.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <AlertTriangle className="h-6 w-6" />
                <span>General Disclaimer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                The information and tools provided by House Budget Calculator are for general informational 
                and educational purposes only. They should not be considered as professional financial, 
                investment, tax, or legal advice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <span>Financial Calculations and Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Accuracy of Calculations</h4>
                <p className="text-gray-600">
                  While we strive to ensure the accuracy of our calculators and tools, we cannot guarantee 
                  that all calculations are error-free or suitable for your specific financial situation. 
                  Results should be verified independently.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Personal Financial Decisions</h4>
                <p className="text-gray-600">
                  Any financial decisions you make based on our tools and information are your sole 
                  responsibility. We strongly recommend consulting with qualified financial professionals 
                  before making significant financial decisions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-6 w-6" />
                <span>No Professional Relationship</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Use of our website and tools does not create a financial advisor-client relationship, 
                accountant-client relationship, or any other professional relationship. We are not 
                licensed financial advisors, accountants, or investment professionals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market and Economic Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Financial markets, interest rates, inflation, and economic conditions can change rapidly 
                and unpredictably. Our calculations and projections are based on the information you 
                provide and general assumptions that may not reflect future market conditions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our platform may include information, links, or data from third-party sources. We do not 
                endorse, verify, or guarantee the accuracy of third-party information and are not 
                responsible for any content or services provided by external sources.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6" />
                <span>Limitation of Liability</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">No Warranties</h4>
                <p className="text-gray-600">
                  Our service is provided "as is" without any warranties, express or implied. We disclaim 
                  all warranties including but not limited to merchantability, fitness for a particular 
                  purpose, and non-infringement.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Damages Limitation</h4>
                <p className="text-gray-600">
                  We shall not be liable for any direct, indirect, incidental, special, or consequential 
                  damages resulting from the use or inability to use our service, including but not limited 
                  to financial losses or investment decisions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Considerations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Tax laws are complex and subject to change. Our tools do not provide tax advice, and 
                calculations may not account for all applicable taxes, deductions, or credits. Consult 
                with a qualified tax professional for advice specific to your situation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates and Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                This disclaimer may be updated from time to time without notice. Continued use of our 
                service after changes constitutes acceptance of the updated disclaimer. It is your 
                responsibility to review this disclaimer periodically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Advice Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Before making any financial decisions, we strongly encourage you to:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Consult with a certified financial planner or advisor</li>
                <li>• Speak with a qualified accountant about tax implications</li>
                <li>• Review your insurance needs with a licensed agent</li>
                <li>• Seek legal advice for estate planning and complex transactions</li>
                <li>• Verify all calculations with independent sources</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact for Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                If you have any questions about this disclaimer or need clarification about the 
                limitations of our service, please contact us at <a href="mailto:homebudgetcalculator@gmail.com" className="text-primary hover:underline">homebudgetcalculator@gmail.com</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Disclaimer;