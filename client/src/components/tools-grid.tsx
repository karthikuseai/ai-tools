import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ToolCard from "./tool-card";
import HeroSection from "./hero-section";
import type { AiTool } from "@shared/schema";

export default function ToolsGrid() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: toolsResponse, isLoading } = useQuery<{tools: AiTool[], pagination: any}>({
    queryKey: ["/api/tools", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      
      const response = await fetch(`/api/tools?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tools");
      }
      return response.json();
    },
  });

  const tools = toolsResponse?.tools || [];
  const pagination = toolsResponse?.pagination;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Text":
        return "bg-blue-50 text-blue-700";
      case "Productivity":
        return "bg-green-50 text-green-700";
      case "Images":
        return "bg-purple-50 text-purple-700";
      case "Video":
        return "bg-red-50 text-red-700";
      case "Search":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <>
      <HeroSection
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-semibold text-foreground">Featured AI Tools</h3>
            <p className="text-muted-foreground mt-1" data-testid="text-results-count">
              {isLoading ? "Loading..." : `Showing ${tools.length} of ${pagination?.total || tools.length} tools`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/refresh', {
                    method: 'POST',
                    headers: {
                      'Authorization': 'Bearer admin-token',
                      'Content-Type': 'application/json'
                    }
                  });
                  const result = await response.json();
                  console.log('Refresh result:', result);
                  // Refetch the tools data
                  window.location.reload();
                } catch (error) {
                  console.error('Refresh failed:', error);
                }
              }}
              variant="outline"
              size="sm"
              data-testid="button-refresh-tools"
            >
              🚀 One-Click Refresh
            </Button>
            <select className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Recently Added</option>
              <option>Most Popular</option>
              <option>Alphabetical</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="w-20 h-6 bg-muted rounded-full"></div>
                </div>
                <div className="w-3/4 h-6 bg-muted rounded mb-2"></div>
                <div className="w-full h-4 bg-muted rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="w-24 h-4 bg-muted rounded"></div>
                  <div className="w-16 h-4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No tools found matching your criteria.</p>
            <p className="text-muted-foreground mt-2">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="grid-tools">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                categoryColor={getCategoryColor(tool.category || "")}
              />
            ))}
          </div>
        )}

        {tools.length > 0 && (
          <div className="text-center mt-12">
            <Button
              variant="secondary"
              className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              data-testid="button-load-more"
            >
              Load More Tools
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Showing {tools.length} of {pagination?.total || "70+"} AI tools
            </p>
          </div>
        )}
      </main>
    </>
  );
}
