import { Zap } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="text-primary-foreground text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Tool Hub</h1>
              <p className="text-sm text-muted-foreground">Discover the best AI tools</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Browse
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Categories
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Submit Tool
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
