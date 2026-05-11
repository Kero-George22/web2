export default function Footer() {
  return (
    <footer className="border-t border-cinema-border mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-cinema-accent flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-cinema-bg">
                  <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2 2v12h12V6H6zm1 1l5 3.5L17 7v10l-5-3.5L7 17V7z"/>
                </svg>
              </div>
              <span className="font-display font-black text-lg">
                <span className="text-cinema-accent">Cine</span>
                <span className="text-cinema-text">Log</span>
              </span>
            </div>
            <p className="text-cinema-muted text-sm leading-relaxed">
              Track films you've watched, save those you want to see, and share reviews with cinephiles worldwide.
            </p>
          </div>

          {/* Links */}
          {[
            { title: 'Discover', links: ['Popular Films', 'Top Rated', 'New Releases', 'By Genre'] },
            { title: 'Community', links: ['Members', 'Lists', 'Reviews', 'Film Club'] },
            { title: 'Account', links: ['Sign In', 'Create Account', 'Settings', 'Help'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-cinema-text text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-cinema-muted text-sm hover:text-cinema-accent transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-cinema-border">
          <p className="text-cinema-muted text-xs">© 2025 CineLog. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Cookies'].map(l => (
              <a key={l} href="#" className="text-cinema-muted text-xs hover:text-cinema-text transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
