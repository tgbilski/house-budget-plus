import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { useAdminStatus } from '@/hooks/useAdminStatus';

interface FooterProps {
  hideTools?: boolean;
}

const Footer: React.FC<FooterProps> = ({ hideTools = false }) => {
  const currentYear = new Date().getFullYear();
  const { isAdmin } = useAdminStatus();

  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8 ml-0 pl-8">
        <div className={hideTools ? "grid md:grid-cols-3 gap-8" : "grid md:grid-cols-4 gap-8"}>
          {/* Company Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">House Budget Calculator</h3>
            <p className="text-sm text-gray-600 mb-4">
              Empowering families to take control of their finances through smart budgeting tools and insights.
            </p>
          </div>

          {/* Quick Links - hidden on tool pages */}
          {!hideTools && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Tools</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/budget" className="text-gray-600 hover:text-primary transition-colors">Monthly Budget</Link></li>
                <li><Link to="/expenses" className="text-gray-600 hover:text-primary transition-colors">Expense Tracking</Link></li>
                <li><Link to="/savings" className="text-gray-600 hover:text-primary transition-colors">Savings Goals</Link></li>
              </ul>
            </div>
          )}

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-gray-600 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/disclaimer" className="text-gray-600 hover:text-primary transition-colors">Disclaimer</Link></li>
              {isAdmin && (
                <li><Link to="/admin" className="text-gray-600 hover:text-primary transition-colors">Admin Dashboard</Link></li>
              )}
            </ul>
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="text-sm text-gray-600">
          <p>&copy; {currentYear} House Budget Calculator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
