import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">House Budget Calculator</h3>
            <p className="text-sm text-gray-600 mb-4">
              Empowering families to take control of their finances through smart budgeting tools and insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/budget" className="text-gray-600 hover:text-primary transition-colors">Monthly Budget</Link></li>
              <li><Link to="/savings" className="text-gray-600 hover:text-primary transition-colors">Savings Goals</Link></li>
              <li><Link to="/compare-prices" className="text-gray-600 hover:text-primary transition-colors">Compare Vendors</Link></li>
              <li><Link to="/vacation" className="text-gray-600 hover:text-primary transition-colors">Vacation Planner</Link></li>
              <li><Link to="/ai-insights" className="text-gray-600 hover:text-primary transition-colors">AI Insights</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/gifts" className="text-gray-600 hover:text-primary transition-colors">Gift Ideas</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-gray-600 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/disclaimer" className="text-gray-600 hover:text-primary transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>&copy; {currentYear} House Budget Calculator. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ for better financial planning</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;