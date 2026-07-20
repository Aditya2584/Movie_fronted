import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Globe, MessageCircle, Share2, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const footerLinks = {
    Company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Blog', href: '#' },
    ],
    Movies: [
      { label: 'Now Playing', to: '/' },
      { label: 'Coming Soon', to: '/' },
      { label: 'Top Rated', to: '/' },
      { label: 'Genres', to: '/' },
    ],
    Support: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  };

  const socialIcons = [
    { icon: Globe, href: '#', label: 'Website' },
    { icon: MessageCircle, href: '#', label: 'Chat' },
    { icon: Share2, href: '#', label: 'Share' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <footer className="bg-bg-base border-t border-border">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Newsletter */}
        <div className="py-16 lg:py-20 border-b border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-3 max-w-md">
              <p className="type-overline">Newsletter</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-text-primary tracking-tight">
                Stay in the loop
              </h2>
              <p className="type-body">
                New releases, exclusive screenings, and offers — delivered to your inbox.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted transition-colors duration-200 group-focus-within:text-text-primary">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full pl-10 bg-bg-secondary/60 border-border/80 backdrop-blur-sm
                    transition-all duration-300 focus:bg-bg-secondary"
                />
              </div>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 whitespace-nowrap cursor-pointer"
              >
                {submitted ? (
                  <span>Subscribed</span>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Main content */}
        <div className="py-14 lg:py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-elevated transition-colors duration-200 group-hover:border-border-hover">
                <Film className="w-4 h-4 text-text-primary" />
              </div>
              <span className="text-sm font-semibold text-text-primary tracking-tight">
                CinePass
              </span>
            </Link>
            <p className="type-body max-w-sm leading-relaxed">
              Your premium destination for cinematic experiences. Book tickets, explore movies,
              and enjoy the show.
            </p>

            {/* Social */}
            <div className="flex items-center gap-2 pt-1">
              {socialIcons.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="btn-icon-sm"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="text-xs font-medium text-text-primary tracking-wide">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-text-muted hover:text-text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-text-muted hover:text-text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {currentYear} CinePass. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-text-muted">
            <a href="#" className="hover:text-text-primary transition-colors duration-200">
              Privacy
            </a>
            <a href="#" className="hover:text-text-primary transition-colors duration-200">
              Terms
            </a>
            <a href="#" className="hover:text-text-primary transition-colors duration-200">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
