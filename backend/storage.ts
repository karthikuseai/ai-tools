import { type AiTool, type InsertAiTool, aiTools } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, ilike, and, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  getTools(search?: string, category?: string): Promise<AiTool[]>;
  getCategories(): Promise<string[]>;
  createTool(tool: InsertAiTool): Promise<AiTool>;
}

export class MemStorage implements IStorage {
  private tools: Map<number, AiTool>;
  private nextId: number = 1;

  constructor() {
    this.tools = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Use a smaller subset for memory storage to avoid overwhelming the UI during development
    const sampleTools: InsertAiTool[] = [
      // Text & Writing (Top 10)
      { name: "ChatGPT", url: "https://chat.openai.com", description: "GPT-4 AI assistant for text generation, coding, and analysis", category: "Text", imageUrl: "https://logo.clearbit.com/openai.com" },
      { name: "Claude AI", url: "https://anthropic.com", description: "Helpful AI assistant by Anthropic with context-aware responses", category: "Text", imageUrl: "https://logo.clearbit.com/anthropic.com" },
      { name: "Gemini", url: "https://gemini.google.com", description: "Google's AI assistant with workspace integration", category: "Text", imageUrl: "https://logo.clearbit.com/google.com" },
      { name: "Copy.ai", url: "https://copy.ai", description: "AI content generator for marketing copy and blogs", category: "Text", imageUrl: "https://logo.clearbit.com/copy.ai" },
      { name: "Jasper", url: "https://jasper.ai", description: "AI writing assistant for content marketing and brand voice", category: "Text", imageUrl: "https://logo.clearbit.com/jasper.ai" },
      { name: "Grammarly", url: "https://grammarly.com", description: "AI writing assistant for grammar, tone, and clarity", category: "Text", imageUrl: "https://logo.clearbit.com/grammarly.com" },
      { name: "QuillBot", url: "https://quillbot.com", description: "AI paraphrasing tool for text refinement and grammar checking", category: "Text", imageUrl: "https://logo.clearbit.com/quillbot.com" },
      { name: "Rytr", url: "https://rytr.me", description: "AI writing assistant with 30+ languages and plagiarism checker", category: "Text", imageUrl: "https://logo.clearbit.com/rytr.me" },
      { name: "Writesonic", url: "https://writesonic.com", description: "AI content creation platform for marketing and SEO", category: "Text", imageUrl: "https://logo.clearbit.com/writesonic.com" },
      { name: "ContentAtScale", url: "https://contentatscale.ai", description: "AI-powered long-form content generation", category: "Text", imageUrl: "https://logo.clearbit.com/contentatscale.ai" },

      // Images (Top 10)
      { name: "Midjourney", url: "https://midjourney.com", description: "High-quality artistic image generation from text prompts", category: "Images", imageUrl: "https://logo.clearbit.com/midjourney.com" },
      { name: "DALL-E", url: "https://openai.com/dall-e", description: "OpenAI's image generation with editing capabilities", category: "Images", imageUrl: "https://logo.clearbit.com/openai.com" },
      { name: "Stable Diffusion", url: "https://stability.ai", description: "Open-source image generation with local deployment", category: "Images", imageUrl: "https://logo.clearbit.com/stability.ai" },
      { name: "Adobe Firefly", url: "https://firefly.adobe.com", description: "Creative AI with Adobe integration for commercial use", category: "Images", imageUrl: "https://logo.clearbit.com/adobe.com" },
      { name: "Canva AI", url: "https://canva.com", description: "AI-powered design platform with templates and brand tools", category: "Images", imageUrl: "https://logo.clearbit.com/canva.com" },
      { name: "Leonardo AI", url: "https://leonardo.ai", description: "AI art generator with fine-tuned models", category: "Images", imageUrl: "https://logo.clearbit.com/leonardo.ai" },
      { name: "Ideogram", url: "https://ideogram.ai", description: "AI image generator with text rendering capabilities", category: "Images", imageUrl: "https://logo.clearbit.com/ideogram.ai" },
      { name: "Playground AI", url: "https://playground.ai", description: "Creative AI image generation with editing tools", category: "Images", imageUrl: "https://logo.clearbit.com/playground.ai" },
      { name: "RunwayML", url: "https://runwayml.com", description: "Creative AI suite for image and video generation", category: "Images", imageUrl: "https://logo.clearbit.com/runwayml.com" },
      { name: "Flux.1", url: "https://flux.ai", description: "Professional image generation with high-quality outputs", category: "Images", imageUrl: "https://logo.clearbit.com/flux.ai" },

      // Video (Top 10)
      { name: "Synthesia", url: "https://synthesia.io", description: "AI avatar video generator with 150+ avatars and 70+ languages", category: "Video", imageUrl: "https://logo.clearbit.com/synthesia.io" },
      { name: "Runway", url: "https://runwayml.com", description: "Text-to-video and image-to-video generation", category: "Video", imageUrl: "https://logo.clearbit.com/runwayml.com" },
      { name: "HeyGen", url: "https://heygen.com", description: "Custom AI avatar videos with multilingual support", category: "Video", imageUrl: "https://logo.clearbit.com/heygen.com" },
      { name: "Descript", url: "https://descript.com", description: "Text-based video and audio editing with transcription", category: "Video", imageUrl: "https://logo.clearbit.com/descript.com" },
      { name: "Pictory", url: "https://pictory.ai", description: "AI tool to turn long content into short videos", category: "Video", imageUrl: "https://logo.clearbit.com/pictory.ai" },
      { name: "Lumen5", url: "https://lumen5.com", description: "Template-based video creation for social media", category: "Video", imageUrl: "https://logo.clearbit.com/lumen5.com" },
      { name: "InVideo", url: "https://invideo.io", description: "AI video creation platform with templates", category: "Video", imageUrl: "https://logo.clearbit.com/invideo.io" },
      { name: "Colossyan", url: "https://colossyan.com", description: "Corporate training videos with SCORM export", category: "Video", imageUrl: "https://logo.clearbit.com/colossyan.com" },
      { name: "FlexClip", url: "https://flexclip.com", description: "Online video maker with AI features", category: "Video", imageUrl: "https://logo.clearbit.com/flexclip.com" },
      { name: "Kapwing", url: "https://kapwing.com", description: "Collaborative video editing with AI tools", category: "Video", imageUrl: "https://logo.clearbit.com/kapwing.com" },

      // Developer Tools (Top 10)
      { name: "GitHub Copilot", url: "https://github.com/features/copilot", description: "AI code completion in 70+ languages across IDEs", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/github.com" },
      { name: "Cursor", url: "https://cursor.sh", description: "AI-first code editor with built-in codebase understanding", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/cursor.sh" },
      { name: "Codeium", url: "https://codeium.com", description: "Free AI code assistant with 40+ editor integrations", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/codeium.com" },
      { name: "Tabnine", url: "https://tabnine.com", description: "AI code completion with privacy-first approach", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/tabnine.com" },
      { name: "Replit", url: "https://replit.com", description: "AI-assisted development with hosting and collaboration", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/replit.com" },
      { name: "CodeWhisperer", url: "https://aws.amazon.com/codewhisperer", description: "Amazon's AI coding companion", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/amazon.com" },
      { name: "Sourcegraph Cody", url: "https://sourcegraph.com/cody", description: "AI coding assistant with codebase context", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/sourcegraph.com" },
      { name: "CodeT5", url: "https://huggingface.co/Salesforce/codet5", description: "Open-source code generation model", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/huggingface.co" },
      { name: "Codiga", url: "https://codiga.io", description: "AI-powered code analysis and review", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/codiga.io" },
      { name: "DeepCode", url: "https://deepcode.ai", description: "AI code review and bug detection", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/deepcode.ai" },

      // Productivity (Top 10)
      { name: "Notion AI", url: "https://notion.so", description: "AI writing and organization within Notion workspace", category: "Productivity", imageUrl: "https://logo.clearbit.com/notion.so" },
      { name: "Zapier", url: "https://zapier.com", description: "Workflow automation connecting 6000+ apps", category: "Productivity", imageUrl: "https://logo.clearbit.com/zapier.com" },
      { name: "ClickUp", url: "https://clickup.com", description: "All-in-one workspace with AI writing assistant", category: "Productivity", imageUrl: "https://logo.clearbit.com/clickup.com" },
      { name: "Asana", url: "https://asana.com", description: "Task automation and workflow optimization", category: "Productivity", imageUrl: "https://logo.clearbit.com/asana.com" },
      { name: "Monday.com", url: "https://monday.com", description: "Project management with AI-powered insights", category: "Productivity", imageUrl: "https://logo.clearbit.com/monday.com" },
      { name: "Todoist", url: "https://todoist.com", description: "Task management with AI-powered scheduling", category: "Productivity", imageUrl: "https://logo.clearbit.com/todoist.com" },
      { name: "Otter.ai", url: "https://otter.ai", description: "AI transcription and meeting notes", category: "Productivity", imageUrl: "https://logo.clearbit.com/otter.ai" },
      { name: "Fathom", url: "https://fathom.video", description: "AI meeting assistant for notes and action items", category: "Productivity", imageUrl: "https://logo.clearbit.com/fathom.video" },
      { name: "Mem", url: "https://mem.ai", description: "AI-powered note-taking with smart organization", category: "Productivity", imageUrl: "https://logo.clearbit.com/mem.ai" },
      { name: "Calendly", url: "https://calendly.com", description: "Smart scheduling with AI optimization", category: "Productivity", imageUrl: "https://logo.clearbit.com/calendly.com" },

      // Search (Top 10)
      { name: "Perplexity AI", url: "https://perplexity.ai", description: "Answer engine with real-time search and citations", category: "Search", imageUrl: "https://logo.clearbit.com/perplexity.ai" },
      { name: "Bing AI", url: "https://bing.com/chat", description: "Microsoft's AI-powered search with web integration", category: "Search", imageUrl: "https://logo.clearbit.com/microsoft.com" },
      { name: "Phind", url: "https://phind.com", description: "Developer-focused search engine with code examples", category: "Search", imageUrl: "https://logo.clearbit.com/phind.com" },
      { name: "You.com", url: "https://you.com", description: "AI search engine with personalized results", category: "Search", imageUrl: "https://logo.clearbit.com/you.com" },
      { name: "Brave Search", url: "https://search.brave.com", description: "Privacy-focused search with AI summaries", category: "Search", imageUrl: "https://logo.clearbit.com/brave.com" },
      { name: "Kagi", url: "https://kagi.com", description: "Premium search engine with AI features", category: "Search", imageUrl: "https://logo.clearbit.com/kagi.com" },
      { name: "DuckDuckGo", url: "https://duckduckgo.com", description: "Privacy-focused search with instant answers", category: "Search", imageUrl: "https://logo.clearbit.com/duckduckgo.com" },
      { name: "Startpage", url: "https://startpage.com", description: "Private search with Google results", category: "Search", imageUrl: "https://logo.clearbit.com/startpage.com" },
      { name: "Neeva", url: "https://neeva.com", description: "Ad-free search with AI-powered answers", category: "Search", imageUrl: "https://logo.clearbit.com/neeva.com" },
      { name: "Yandex", url: "https://yandex.com", description: "Russian search engine with AI capabilities", category: "Search", imageUrl: "https://logo.clearbit.com/yandex.com" },

      // Audio (Top 10)
      { name: "ElevenLabs", url: "https://elevenlabs.io", description: "Realistic AI voice synthesis and cloning", category: "Audio", imageUrl: "https://logo.clearbit.com/elevenlabs.io" },
      { name: "Suno", url: "https://suno.com", description: "Text-to-music AI for creating original songs", category: "Audio", imageUrl: "https://logo.clearbit.com/suno.com" },
      { name: "Lalal.ai", url: "https://lalal.ai", description: "AI vocal and instrumental separation", category: "Audio", imageUrl: "https://logo.clearbit.com/lalal.ai" },
      { name: "Mubert", url: "https://mubert.com", description: "AI music generation for content creators", category: "Audio", imageUrl: "https://logo.clearbit.com/mubert.com" },
      { name: "AIVA", url: "https://aiva.ai", description: "AI composer for classical and modern music", category: "Audio", imageUrl: "https://logo.clearbit.com/aiva.ai" },
      { name: "Soundraw", url: "https://soundraw.io", description: "AI music creation platform for creators", category: "Audio", imageUrl: "https://logo.clearbit.com/soundraw.io" },
      { name: "Beatoven.ai", url: "https://beatoven.ai", description: "AI music composition for videos and podcasts", category: "Audio", imageUrl: "https://logo.clearbit.com/beatoven.ai" },
      { name: "Jukebox", url: "https://openai.com/blog/jukebox", description: "OpenAI's music generation in various styles", category: "Audio", imageUrl: "https://logo.clearbit.com/openai.com" },
      { name: "Splash", url: "https://splashmusic.com", description: "AI music creation and collaboration platform", category: "Audio", imageUrl: "https://logo.clearbit.com/splashmusic.com" },
      { name: "Amper Music", url: "https://ampermusic.com", description: "AI music composition for media", category: "Audio", imageUrl: "https://logo.clearbit.com/ampermusic.com" },
    ];

    sampleTools.forEach((tool) => {
      this.createTool(tool);
    });
  }

  async getTools(search?: string, category?: string): Promise<AiTool[]> {
    let tools = Array.from(this.tools.values());

    if (search) {
      const searchLower = search.toLowerCase();
      tools = tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchLower) ||
          tool.description?.toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== "all") {
      tools = tools.filter((tool) => tool.category === category);
    }

    return tools.sort((a, b) => {
      if (!a.lastSeen || !b.lastSeen) return 0;
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });
  }

  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    Array.from(this.tools.values()).forEach((tool) => {
      if (tool.category) {
        categories.add(tool.category);
      }
    });
    return Array.from(categories).sort();
  }

  async createTool(insertTool: InsertAiTool): Promise<AiTool> {
    const id = this.nextId++;
    const tool: AiTool = {
      ...insertTool,
      id,
      description: insertTool.description ?? null,
      category: insertTool.category ?? null,
      imageUrl: insertTool.imageUrl ?? null,
      lastSeen: new Date(),
    };
    this.tools.set(id, tool);
    return tool;
  }
}

// DrizzleStorage class for database operations
export class DrizzleStorage implements IStorage {
  private db: any;

  constructor() {
    try {
      const databaseUrl = process.env.DATABASE_URL;
      if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
        const sql = neon(databaseUrl);
        this.db = drizzle(sql);
      } else {
        throw new Error('Invalid DATABASE_URL');
      }
    } catch (error) {
      console.error('Failed to connect to database:', error);
      this.db = null;
    }
  }

  async getTools(search?: string, category?: string): Promise<AiTool[]> {
    if (!this.db) {
      console.warn('Database not available, using memory storage');
      return memStorage.getTools(search, category);
    }

    try {
      let query = this.db.select().from(aiTools);
      
      const conditions = [];
      
      if (search) {
        conditions.push(
          or(
            ilike(aiTools.name, `%${search}%`),
            ilike(aiTools.description, `%${search}%`)
          )
        );
      }
      
      if (category && category !== "all") {
        conditions.push(eq(aiTools.category, category));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const tools = await query.orderBy(desc(aiTools.lastSeen));
      return tools;
    } catch (error) {
      console.error('Database query failed:', error);
      return memStorage.getTools(search, category);
    }
  }

  async getCategories(): Promise<string[]> {
    if (!this.db) {
      console.warn('Database not available, using memory storage');
      return memStorage.getCategories();
    }

    try {
      const result = await this.db
        .selectDistinct({ category: aiTools.category })
        .from(aiTools)
        .where(sql`${aiTools.category} IS NOT NULL`);
      
      return result
        .map((row: any) => row.category)
        .filter((cat: string) => cat)
        .sort();
    } catch (error) {
      console.error('Database query failed:', error);
      return memStorage.getCategories();
    }
  }

  async createTool(tool: InsertAiTool): Promise<AiTool> {
    if (!this.db) {
      console.warn('Database not available, using memory storage');
      return memStorage.createTool(tool);
    }

    try {
      const [newTool] = await this.db
        .insert(aiTools)
        .values(tool)
        .returning();
      return newTool;
    } catch (error) {
      console.error('Database insert failed:', error);
      return memStorage.createTool(tool);
    }
  }

  async initializeData() {
    if (!this.db) {
      console.warn('Database not available, skipping initialization');
      return;
    }

    try {
      // Check if data already exists
      const existingTools = await this.db.select().from(aiTools).limit(1);
      if (existingTools.length > 0) {
        console.log('Database already has data, skipping initialization');
        return;
      }

      // Insert comprehensive AI tools dataset
      const sampleTools: InsertAiTool[] = [
        // Text & Writing AI Tools
        { name: "ChatGPT", url: "https://chat.openai.com", description: "GPT-4 AI assistant for text generation, coding, and analysis", category: "Text", imageUrl: "https://logo.clearbit.com/openai.com" },
        { name: "Claude AI", url: "https://anthropic.com", description: "Helpful AI assistant by Anthropic with context-aware responses", category: "Text", imageUrl: "https://logo.clearbit.com/anthropic.com" },
        { name: "Gemini", url: "https://gemini.google.com", description: "Google's AI assistant with workspace integration", category: "Text", imageUrl: "https://logo.clearbit.com/google.com" },
        { name: "Copy.ai", url: "https://copy.ai", description: "AI content generator for marketing copy and blogs", category: "Text", imageUrl: "https://logo.clearbit.com/copy.ai" },
        { name: "Jasper", url: "https://jasper.ai", description: "AI writing assistant for content marketing and brand voice", category: "Text", imageUrl: "https://logo.clearbit.com/jasper.ai" },
        { name: "Rytr", url: "https://rytr.me", description: "AI writing assistant with 30+ languages and plagiarism checker", category: "Text", imageUrl: "https://logo.clearbit.com/rytr.me" },
        { name: "QuillBot", url: "https://quillbot.com", description: "AI paraphrasing tool for text refinement and grammar checking", category: "Text", imageUrl: "https://logo.clearbit.com/quillbot.com" },
        { name: "Grammarly", url: "https://grammarly.com", description: "AI writing assistant for grammar, tone, and clarity", category: "Text", imageUrl: "https://logo.clearbit.com/grammarly.com" },
        { name: "Writesonic", url: "https://writesonic.com", description: "AI content creation platform for marketing and SEO", category: "Text", imageUrl: "https://logo.clearbit.com/writesonic.com" },
        { name: "ContentAtScale", url: "https://contentatscale.ai", description: "AI-powered long-form content generation", category: "Text", imageUrl: "https://logo.clearbit.com/contentatscale.ai" },

        // Image Generation & Design
        { name: "Midjourney", url: "https://midjourney.com", description: "High-quality artistic image generation from text prompts", category: "Images", imageUrl: "https://logo.clearbit.com/midjourney.com" },
        { name: "DALL-E", url: "https://openai.com/dall-e", description: "OpenAI's image generation with editing capabilities", category: "Images", imageUrl: "https://logo.clearbit.com/openai.com" },
        { name: "Adobe Firefly", url: "https://firefly.adobe.com", description: "Creative AI with Adobe integration for commercial use", category: "Images", imageUrl: "https://logo.clearbit.com/adobe.com" },
        { name: "Stable Diffusion", url: "https://stability.ai", description: "Open-source image generation with local deployment", category: "Images", imageUrl: "https://logo.clearbit.com/stability.ai" },
        { name: "Canva AI", url: "https://canva.com", description: "AI-powered design platform with templates and brand tools", category: "Images", imageUrl: "https://logo.clearbit.com/canva.com" },
        { name: "Leonardo AI", url: "https://leonardo.ai", description: "AI art generator with fine-tuned models", category: "Images", imageUrl: "https://logo.clearbit.com/leonardo.ai" },
        { name: "Flux.1", url: "https://flux.ai", description: "Professional image generation with high-quality outputs", category: "Images", imageUrl: "https://logo.clearbit.com/flux.ai" },
        { name: "Ideogram", url: "https://ideogram.ai", description: "AI image generator with text rendering capabilities", category: "Images", imageUrl: "https://logo.clearbit.com/ideogram.ai" },
        { name: "Playground AI", url: "https://playground.ai", description: "Creative AI image generation with editing tools", category: "Images", imageUrl: "https://logo.clearbit.com/playground.ai" },
        { name: "RunwayML", url: "https://runwayml.com", description: "Creative AI suite for image and video generation", category: "Images", imageUrl: "https://logo.clearbit.com/runwayml.com" },

        // Video Creation & Editing
        { name: "Synthesia", url: "https://synthesia.io", description: "AI avatar video generator with 150+ avatars and 70+ languages", category: "Video", imageUrl: "https://logo.clearbit.com/synthesia.io" },
        { name: "Runway", url: "https://runwayml.com", description: "Text-to-video and image-to-video generation", category: "Video", imageUrl: "https://logo.clearbit.com/runwayml.com" },
        { name: "HeyGen", url: "https://heygen.com", description: "Custom AI avatar videos with multilingual support", category: "Video", imageUrl: "https://logo.clearbit.com/heygen.com" },
        { name: "Lumen5", url: "https://lumen5.com", description: "Template-based video creation for social media", category: "Video", imageUrl: "https://logo.clearbit.com/lumen5.com" },
        { name: "Colossyan", url: "https://colossyan.com", description: "Corporate training videos with SCORM export", category: "Video", imageUrl: "https://logo.clearbit.com/colossyan.com" },
        { name: "Descript", url: "https://descript.com", description: "Text-based video and audio editing with transcription", category: "Video", imageUrl: "https://logo.clearbit.com/descript.com" },
        { name: "Pictory", url: "https://pictory.ai", description: "AI tool to turn long content into short videos", category: "Video", imageUrl: "https://logo.clearbit.com/pictory.ai" },
        { name: "InVideo", url: "https://invideo.io", description: "AI video creation platform with templates", category: "Video", imageUrl: "https://logo.clearbit.com/invideo.io" },
        { name: "FlexClip", url: "https://flexclip.com", description: "Online video maker with AI features", category: "Video", imageUrl: "https://logo.clearbit.com/flexclip.com" },
        { name: "Kapwing", url: "https://kapwing.com", description: "Collaborative video editing with AI tools", category: "Video", imageUrl: "https://logo.clearbit.com/kapwing.com" },

        // Developer & Coding Tools
        { name: "GitHub Copilot", url: "https://github.com/features/copilot", description: "AI code completion in 70+ languages across IDEs", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/github.com" },
        { name: "Cursor", url: "https://cursor.sh", description: "AI-first code editor with built-in codebase understanding", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/cursor.sh" },
        { name: "Codeium", url: "https://codeium.com", description: "Free AI code assistant with 40+ editor integrations", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/codeium.com" },
        { name: "Tabnine", url: "https://tabnine.com", description: "AI code completion with privacy-first approach", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/tabnine.com" },
        { name: "Replit", url: "https://replit.com", description: "AI-assisted development with hosting and collaboration", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/replit.com" },
        { name: "CodeWhisperer", url: "https://aws.amazon.com/codewhisperer", description: "Amazon's AI coding companion", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/amazon.com" },
        { name: "Sourcegraph Cody", url: "https://sourcegraph.com/cody", description: "AI coding assistant with codebase context", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/sourcegraph.com" },
        { name: "CodeT5", url: "https://huggingface.co/Salesforce/codet5", description: "Open-source code generation model", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/huggingface.co" },
        { name: "Codiga", url: "https://codiga.io", description: "AI-powered code analysis and review", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/codiga.io" },
        { name: "DeepCode", url: "https://deepcode.ai", description: "AI code review and bug detection", category: "Developer Tools", imageUrl: "https://logo.clearbit.com/deepcode.ai" },

        // Productivity & Automation
        { name: "Notion AI", url: "https://notion.so", description: "AI writing and organization within Notion workspace", category: "Productivity", imageUrl: "https://logo.clearbit.com/notion.so" },
        { name: "Zapier", url: "https://zapier.com", description: "Workflow automation connecting 6000+ apps", category: "Productivity", imageUrl: "https://logo.clearbit.com/zapier.com" },
        { name: "Monday.com", url: "https://monday.com", description: "Project management with AI-powered insights", category: "Productivity", imageUrl: "https://logo.clearbit.com/monday.com" },
        { name: "ClickUp", url: "https://clickup.com", description: "All-in-one workspace with AI writing assistant", category: "Productivity", imageUrl: "https://logo.clearbit.com/clickup.com" },
        { name: "Asana", url: "https://asana.com", description: "Task automation and workflow optimization", category: "Productivity", imageUrl: "https://logo.clearbit.com/asana.com" },
        { name: "Todoist", url: "https://todoist.com", description: "Task management with AI-powered scheduling", category: "Productivity", imageUrl: "https://logo.clearbit.com/todoist.com" },
        { name: "Mem", url: "https://mem.ai", description: "AI-powered note-taking with smart organization", category: "Productivity", imageUrl: "https://logo.clearbit.com/mem.ai" },
        { name: "Fathom", url: "https://fathom.video", description: "AI meeting assistant for notes and action items", category: "Productivity", imageUrl: "https://logo.clearbit.com/fathom.video" },
        { name: "Otter.ai", url: "https://otter.ai", description: "AI transcription and meeting notes", category: "Productivity", imageUrl: "https://logo.clearbit.com/otter.ai" },
        { name: "Calendly", url: "https://calendly.com", description: "Smart scheduling with AI optimization", category: "Productivity", imageUrl: "https://logo.clearbit.com/calendly.com" },

        // Search & Knowledge
        { name: "Perplexity AI", url: "https://perplexity.ai", description: "Answer engine with real-time search and citations", category: "Search", imageUrl: "https://logo.clearbit.com/perplexity.ai" },
        { name: "Bing AI", url: "https://bing.com/chat", description: "Microsoft's AI-powered search with web integration", category: "Search", imageUrl: "https://logo.clearbit.com/microsoft.com" },
        { name: "Phind", url: "https://phind.com", description: "Developer-focused search engine with code examples", category: "Search", imageUrl: "https://logo.clearbit.com/phind.com" },
        { name: "You.com", url: "https://you.com", description: "AI search engine with personalized results", category: "Search", imageUrl: "https://logo.clearbit.com/you.com" },
        { name: "Brave Search", url: "https://search.brave.com", description: "Privacy-focused search with AI summaries", category: "Search", imageUrl: "https://logo.clearbit.com/brave.com" },
        { name: "Kagi", url: "https://kagi.com", description: "Premium search engine with AI features", category: "Search", imageUrl: "https://logo.clearbit.com/kagi.com" },
        { name: "Neeva", url: "https://neeva.com", description: "Ad-free search with AI-powered answers", category: "Search", imageUrl: "https://logo.clearbit.com/neeva.com" },
        { name: "Yandex", url: "https://yandex.com", description: "Russian search engine with AI capabilities", category: "Search", imageUrl: "https://logo.clearbit.com/yandex.com" },
        { name: "DuckDuckGo", url: "https://duckduckgo.com", description: "Privacy-focused search with instant answers", category: "Search", imageUrl: "https://logo.clearbit.com/duckduckgo.com" },
        { name: "Startpage", url: "https://startpage.com", description: "Private search with Google results", category: "Search", imageUrl: "https://logo.clearbit.com/startpage.com" },

        // Music & Audio
        { name: "ElevenLabs", url: "https://elevenlabs.io", description: "Realistic AI voice synthesis and cloning", category: "Audio", imageUrl: "https://logo.clearbit.com/elevenlabs.io" },
        { name: "Suno", url: "https://suno.com", description: "Text-to-music AI for creating original songs", category: "Audio", imageUrl: "https://logo.clearbit.com/suno.com" },
        { name: "Lalal.ai", url: "https://lalal.ai", description: "AI vocal and instrumental separation", category: "Audio", imageUrl: "https://logo.clearbit.com/lalal.ai" },
        { name: "Mubert", url: "https://mubert.com", description: "AI music generation for content creators", category: "Audio", imageUrl: "https://logo.clearbit.com/mubert.com" },
        { name: "AIVA", url: "https://aiva.ai", description: "AI composer for classical and modern music", category: "Audio", imageUrl: "https://logo.clearbit.com/aiva.ai" },
        { name: "Soundraw", url: "https://soundraw.io", description: "AI music creation platform for creators", category: "Audio", imageUrl: "https://logo.clearbit.com/soundraw.io" },
        { name: "Beatoven.ai", url: "https://beatoven.ai", description: "AI music composition for videos and podcasts", category: "Audio", imageUrl: "https://logo.clearbit.com/beatoven.ai" },
        { name: "Jukebox", url: "https://openai.com/blog/jukebox", description: "OpenAI's music generation in various styles", category: "Audio", imageUrl: "https://logo.clearbit.com/openai.com" },
        { name: "Splash", url: "https://splashmusic.com", description: "AI music creation and collaboration platform", category: "Audio", imageUrl: "https://logo.clearbit.com/splashmusic.com" },
        { name: "Amper Music", url: "https://ampermusic.com", description: "AI music composition for media", category: "Audio", imageUrl: "https://logo.clearbit.com/ampermusic.com" },

        // Business & Marketing
        { name: "HubSpot AI", url: "https://hubspot.com", description: "CRM and marketing automation with AI features", category: "Business", imageUrl: "https://logo.clearbit.com/hubspot.com" },
        { name: "Salesforce Einstein", url: "https://salesforce.com/products/einstein", description: "AI-powered CRM insights and automation", category: "Business", imageUrl: "https://logo.clearbit.com/salesforce.com" },
        { name: "Surfer SEO", url: "https://surferseo.com", description: "AI content optimization for search engines", category: "Business", imageUrl: "https://logo.clearbit.com/surferseo.com" },
        { name: "SEMrush", url: "https://semrush.com", description: "Digital marketing toolkit with AI insights", category: "Business", imageUrl: "https://logo.clearbit.com/semrush.com" },
        { name: "Hootsuite", url: "https://hootsuite.com", description: "Social media management with AI content suggestions", category: "Business", imageUrl: "https://logo.clearbit.com/hootsuite.com" },
        { name: "Buffer", url: "https://buffer.com", description: "Social media scheduling with AI optimization", category: "Business", imageUrl: "https://logo.clearbit.com/buffer.com" },
        { name: "Mailchimp", url: "https://mailchimp.com", description: "Email marketing with AI-powered insights", category: "Business", imageUrl: "https://logo.clearbit.com/mailchimp.com" },
        { name: "Constant Contact", url: "https://constantcontact.com", description: "Email marketing with AI content creation", category: "Business", imageUrl: "https://logo.clearbit.com/constantcontact.com" },
        { name: "ActiveCampaign", url: "https://activecampaign.com", description: "Customer experience automation platform", category: "Business", imageUrl: "https://logo.clearbit.com/activecampaign.com" },
        { name: "ConvertKit", url: "https://convertkit.com", description: "Creator-focused email marketing with automation", category: "Business", imageUrl: "https://logo.clearbit.com/convertkit.com" },

        // Data & Analytics
        { name: "Tableau", url: "https://tableau.com", description: "Data visualization with AI-powered insights", category: "Analytics", imageUrl: "https://logo.clearbit.com/tableau.com" },
        { name: "Power BI", url: "https://powerbi.microsoft.com", description: "Microsoft's business intelligence with AI", category: "Analytics", imageUrl: "https://logo.clearbit.com/microsoft.com" },
        { name: "Google Analytics", url: "https://analytics.google.com", description: "Web analytics with AI-driven insights", category: "Analytics", imageUrl: "https://logo.clearbit.com/google.com" },
        { name: "Mixpanel", url: "https://mixpanel.com", description: "Product analytics with AI-powered predictions", category: "Analytics", imageUrl: "https://logo.clearbit.com/mixpanel.com" },
        { name: "Amplitude", url: "https://amplitude.com", description: "Digital optimization with behavioral analytics", category: "Analytics", imageUrl: "https://logo.clearbit.com/amplitude.com" },
        { name: "Looker", url: "https://looker.com", description: "Business intelligence platform with AI features", category: "Analytics", imageUrl: "https://logo.clearbit.com/looker.com" },
        { name: "Sisense", url: "https://sisense.com", description: "AI-driven analytics and business intelligence", category: "Analytics", imageUrl: "https://logo.clearbit.com/sisense.com" },
        { name: "Qlik Sense", url: "https://qlik.com", description: "Self-service data analytics with AI", category: "Analytics", imageUrl: "https://logo.clearbit.com/qlik.com" },
        { name: "Domo", url: "https://domo.com", description: "Cloud-based business intelligence platform", category: "Analytics", imageUrl: "https://logo.clearbit.com/domo.com" },
        { name: "DataRobot", url: "https://datarobot.com", description: "Automated machine learning platform", category: "Analytics", imageUrl: "https://logo.clearbit.com/datarobot.com" },

        // Education & Learning
        { name: "Khan Academy", url: "https://khanacademy.org", description: "Personalized learning with AI tutoring", category: "Education", imageUrl: "https://logo.clearbit.com/khanacademy.org" },
        { name: "Coursera", url: "https://coursera.org", description: "Online courses with AI-powered recommendations", category: "Education", imageUrl: "https://logo.clearbit.com/coursera.org" },
        { name: "Udemy", url: "https://udemy.com", description: "Learning platform with AI course suggestions", category: "Education", imageUrl: "https://logo.clearbit.com/udemy.com" },
        { name: "Duolingo", url: "https://duolingo.com", description: "Language learning with AI-powered lessons", category: "Education", imageUrl: "https://logo.clearbit.com/duolingo.com" },
        { name: "Grammarly for Education", url: "https://grammarly.com/edu", description: "Writing improvement for students and educators", category: "Education", imageUrl: "https://logo.clearbit.com/grammarly.com" },
        { name: "Socratic", url: "https://socratic.org", description: "Google's AI homework helper", category: "Education", imageUrl: "https://logo.clearbit.com/google.com" },
        { name: "Quizlet", url: "https://quizlet.com", description: "Study tools with AI-powered learning modes", category: "Education", imageUrl: "https://logo.clearbit.com/quizlet.com" },
        { name: "Cognii", url: "https://cognii.com", description: "AI tutoring and assessment platform", category: "Education", imageUrl: "https://logo.clearbit.com/cognii.com" },
        { name: "Century", url: "https://century.tech", description: "AI-powered learning platform for schools", category: "Education", imageUrl: "https://logo.clearbit.com/century.tech" },
        { name: "Squirrel AI", url: "https://squirrelai.com", description: "Adaptive learning system with AI tutoring", category: "Education", imageUrl: "https://logo.clearbit.com/squirrelai.com" },
      ];

      await this.db.insert(aiTools).values(sampleTools);
      console.log('Database initialized with sample data');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

const memStorage = new MemStorage();
const drizzleStorage = new DrizzleStorage();

// Initialize database data on startup
drizzleStorage.initializeData().catch(console.error);

export const storage = drizzleStorage;
