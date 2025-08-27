import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AiTool } from "@shared/schema";

interface ToolCardProps {
  tool: AiTool;
  categoryColor: string;
}

export default function ToolCard({ tool, categoryColor }: ToolCardProps) {
  const handleToolClick = () => {
    window.open(tool.url, "_blank");
  };

  const getDisplayUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <Card className="tool-card bg-card rounded-xl border border-border hover:shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-1" data-testid={`card-tool-${tool.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={tool.imageUrl || "https://via.placeholder.com/48x48/e5e5e5/999999?text=AI"}
              alt={`${tool.name} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/48x48/e5e5e5/999999?text=AI";
              }}
              data-testid={`img-tool-logo-${tool.id}`}
            />
          </div>
          <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
            {tool.category}
          </Badge>
        </div>
        
        <h4 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-tool-name-${tool.id}`}>
          {tool.name}
        </h4>
        
        <p className="text-muted-foreground text-sm mb-4" data-testid={`text-tool-description-${tool.id}`}>
          {tool.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            <span data-testid={`text-tool-url-${tool.id}`}>{getDisplayUrl(tool.url)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 text-sm font-medium p-0 h-auto"
            onClick={handleToolClick}
            data-testid={`button-try-tool-${tool.id}`}
          >
            Try Now <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
