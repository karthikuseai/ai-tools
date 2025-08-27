import { useState } from "react";
import { Search, PenTool, Image, Video, Rocket, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onSearchChange?: (search: string) => void;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
}

export default function HeroSection({ 
  onSearchChange, 
  onCategoryChange, 
  selectedCategory = "all" 
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleCategoryClick = (category: string) => {
    onCategoryChange?.(category);
  };

  const categories = [
    { id: "all", label: "All Tools", icon: null },
    { id: "Text", label: "Text", icon: PenTool },
    { id: "Images", label: "Images", icon: Image },
    { id: "Video", label: "Video", icon: Video },
    { id: "Productivity", label: "Productivity", icon: Rocket },
    { id: "Search", label: "Search", icon: SearchIcon },
  ];

  return (
    <section className="bg-gradient-to-b from-muted/50 to-background py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Discover Amazing AI Tools
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Find the perfect AI tools for your needs. From text generation to image creation, 
          we've curated the best tools to boost your productivity.
        </p>
        <div className="bg-card rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search AI tools by name or description..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              data-testid="input-search"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "secondary"}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-secondary"
                  }`}
                  onClick={() => handleCategoryClick(category.id)}
                  data-testid={`button-category-${category.id}`}
                >
                  {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
