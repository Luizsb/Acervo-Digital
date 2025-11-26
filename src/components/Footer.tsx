import React from 'react';
import svgPaths from "../imports/svg-pdwo1joi0c";

export function Footer() {
  const companyLinks = [
    { name: "About Us", href: "#" },
    { name: "How it works", href: "#" },
    { name: "Community", href: "#" }
  ];

  const supportLinks = [
    { name: "Help Center", href: "#" },
    { name: "Contact Us", href: "#" },
    { name: "Submit Feedback", href: "#" }
  ];

  const learnLinks = [
    { name: "Newsroom", href: "#" },
    { name: "Events", href: "#" },
    { name: "Donate", href: "#" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Settings", href: "#" },
    { name: "Accessibility", href: "#" }
  ];

  return (
    <footer className="bg-sidebar border-t border-sidebar-border/10">
      <div className="px-4 sm:px-6 lg:px-10 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Main footer content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 mb-20">
            {/* Logo and tagline */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative size-12">
                  <svg
                    className="block size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 48 57"
                  >
                    <g id="Union">
                      <path
                        clipRule="evenodd"
                        d={svgPaths.p1e7e9700}
                        fill="var(--color-foreground)"
                        fillRule="evenodd"
                      />
                      <path d={svgPaths.p2489a40} fill="var(--color-foreground)" />
                    </g>
                  </svg>
                </div>
                <div>
                  <h4 className="text-foreground">Co</h4>
                  <h4 className="text-foreground -mt-2">Lab</h4>
                </div>
              </div>
              <p className="text-sidebar-foreground max-w-[210px]">
                Where citizen scientists come together.
              </p>
            </div>

            {/* Links sections */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Company */}
              <div className="space-y-4">
                <h4 className="text-sidebar-foreground">Company</h4>
                <ul className="space-y-4">
                  {companyLinks.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        className="text-sidebar-foreground hover:text-[#5B4E96] transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div className="space-y-4">
                <h4 className="text-sidebar-foreground">Support</h4>
                <ul className="space-y-4">
                  {supportLinks.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        className="text-sidebar-foreground hover:text-[#5B4E96] transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learn */}
              <div className="space-y-4">
                <h4 className="text-sidebar-foreground">Learn</h4>
                <ul className="space-y-4">
                  {learnLinks.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        className="text-sidebar-foreground hover:text-[#5B4E96] transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="border-t border-sidebar-border/10 pt-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-sidebar-foreground font-mono text-[12px] leading-6">
                2025 Co Lab. All rights reserved.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {legalLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sidebar-foreground/60 hover:text-[#5B4E96] transition-colors font-mono text-[12px] leading-6"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}