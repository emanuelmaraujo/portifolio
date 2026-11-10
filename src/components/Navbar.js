"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import LanguageToggle from './LanguageToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { lang, t } = useLanguage();

  const basePath = '/portifolio';
  const homePath = lang === 'pt' ? basePath + '/pt' : basePath + '/';

  const navItems = [
    { id: 'about', href: '#about', label: t('nav.about'), type: 'anchor' },
    { id: 'expertise', href: '#expertise', label: t('nav.expertise'), type: 'anchor' },
    { id: 'security', href: '#security', label: t('nav.security'), type: 'anchor' },
    { id: 'infrastructure', href: '#infrastructure', label: t('nav.infrastructure'), type: 'anchor' },
    { id: 'techlab', href: '#techlab', label: t('nav.lab'), type: 'anchor' },
    { id: 'experience', href: '#experience', label: t('nav.experience'), type: 'anchor' },
    { id: 'certifications', href: '#certifications', label: t('nav.certifications'), type: 'anchor' },
    { id: 'blog', href: '/blog', label: t('nav.blog'), type: 'page' },
    { id: 'projects', href: '/projetos', label: t('nav.projects'), type: 'page' },
  ];


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const isHomePage = window.location.pathname === basePath || window.location.pathname === `${basePath}/`;
      if (!isHomePage) {
        setActiveSection('');
        return;
      }

      let currentSection = '';
      const offset = 150;
      const anchorItems = navItems.filter(item => item.type === 'anchor');

      for (const item of anchorItems) {
        const section = document.getElementById(item.id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= offset && rect.bottom > offset) {
            currentSection = item.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnchorClick = (e, item) => {
    const isHomePage = window.location.pathname === basePath || window.location.pathname === `${basePath}/`;
    if (isHomePage) {
      e.preventDefault();
      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/70 backdrop-blur-xl border-b border-border/30 shadow-lg shadow-black/10'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href={homePath} className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-lg gradient-text hidden sm:inline">
                Emanuel Araújo
              </span>
            </a>

            {/* Desktop Navigation */}
            <ul className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  {item.type === 'anchor' ? (
                    <a
                      href={`${homePath}${item.href}`}
                      onClick={(e) => handleAnchorClick(e, item)}
                      className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${
                        activeSection === item.id
                          ? 'text-primary'
                          : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                      }`}
                    >
                      {item.label}
                      {activeSection === item.id && (
                        <motion.div
                          layoutId="activeSection"
                          className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg"
                          style={{ zIndex: -1 }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all duration-300 whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
              <li className="ml-2">
                <LanguageToggle />
              </li>
            </ul>

            {/* Mobile: Language Toggle + Hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <LanguageToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-background/95 backdrop-blur-xl border-l border-border/30 z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <span className="font-bold gradient-text">{t('nav.menu')}</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.type === 'anchor' ? (
                      <a
                        href={`${homePath}${item.href}`}
                        onClick={(e) => handleAnchorClick(e, item)}
                        className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                          activeSection === item.id
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                        }`}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-all duration-300"
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
