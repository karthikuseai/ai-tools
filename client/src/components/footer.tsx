import { Zap } from "lucide-react";
import { SiX, SiLinkedin, SiGithub } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-muted mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AI Tool Hub</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Discover, explore, and find the perfect AI tools for your projects. 
              We curate the best AI tools across all categories and keep them updated daily.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiX className="text-xl" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiLinkedin className="text-xl" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <SiGithub className="text-xl" />
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-4">Categories</h5>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Text & Writing</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Image Generation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Video Creation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Productivity</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Search & Research</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-foreground mb-4">Resources</h5>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Submit Tool</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">API</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 AI Tool Hub. All rights reserved. Built with ❤️ for the AI community.
          </p>
        </div>
      </div>
    </footer>
  );
}
