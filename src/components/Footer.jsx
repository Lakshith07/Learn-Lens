import React from 'react';
import { BookOpen, Twitter, Linkedin, Github, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ll-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="col-span-1 md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-6 pointer-events-none">
              <div className="bg-white/10 p-1.5 rounded-lg border border-white/20">
                <BookOpen className="text-ll-pale-blue w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">LearnLens</span>
            </a>
            <p className="text-gray-400 leading-relaxed max-w-sm mb-6">
              Empowering students worldwide by turning academic data into strategic advantages. Understand your marks, improve faster.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-white/5 p-2 rounded-full hover:bg-ll-blue transition-colors border border-white/10"><Twitter className="w-5 h-5 text-gray-300" /></a>
              <a href="#" className="bg-white/5 p-2 rounded-full hover:bg-ll-blue transition-colors border border-white/10"><Linkedin className="w-5 h-5 text-gray-300" /></a>
              <a href="#" className="bg-white/5 p-2 rounded-full hover:bg-ll-blue transition-colors border border-white/10"><Github className="w-5 h-5 text-gray-300" /></a>
              <a href="#" className="bg-white/5 p-2 rounded-full hover:bg-ll-blue transition-colors border border-white/10"><Mail className="w-5 h-5 text-gray-300" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white border-b border-white/10 pb-2 inline-block">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-400 hover:text-ll-pale-blue transition-colors">Home</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-ll-pale-blue transition-colors">How It Works</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-ll-pale-blue transition-colors">About</a></li>
              <li><a href="#faqs" className="text-gray-400 hover:text-ll-pale-blue transition-colors">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white border-b border-white/10 pb-2 inline-block">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-ll-pale-blue transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-ll-pale-blue transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-ll-pale-blue transition-colors">Data Security</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} LearnLens Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <span className="text-gray-500">Made with ❤️ for students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
