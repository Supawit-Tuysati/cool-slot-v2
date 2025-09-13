import React from 'react';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm text-gray-600">
         
        </div>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
            {/* Privacy Policy */}
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
            {/* Terms of Service */}
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
             © 2025 COOL SLOT
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

