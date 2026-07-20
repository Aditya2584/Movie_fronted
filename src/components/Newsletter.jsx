import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF5A1F]/10 via-[#0B0B0B] to-[#FF7B39]/10"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#FF5A1F]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#FF7B39]/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative container mx-auto px-6 py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Subscribe to news
          </h2>
          <p className="text-[#A8A8A8] text-sm md:text-base max-w-md mx-auto">
            Be the first to know about new releases, special screenings, and exclusive offers. 
            Stay updated with the latest cinematic experiences.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#6B6B6B]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]/30 transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2 text-sm px-6 py-3.5 whitespace-nowrap cursor-pointer"
            >
              {submitted ? (
                <span>Subscribed ✓</span>
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
    </section>
  );
};

export default Newsletter;
