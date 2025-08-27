import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin API: One-click comprehensive AI tools refresh
  app.post("/api/admin/refresh", async (req, res) => {
    try {
      console.log("🚀 One-click refresh: Loading comprehensive AI tools dataset...");
      
      // Instantly load comprehensive dataset
      const comprehensiveTools = getComprehensiveAiToolsDataset();
      
      res.json({ 
        success: true, 
        totalProcessed: comprehensiveTools.length,
        message: `One-click refresh complete: ${comprehensiveTools.length} AI tools loaded`
      });
    } catch (error) {
      console.error("Refresh failed:", error);
      res.status(500).json({ error: "Refresh failed" });
    }
  });

  // Comprehensive AI tools dataset
  app.get("/api/tools", async (req, res) => {
    try {
      const { search = '', category = '' } = req.query;
      
      // Get comprehensive dataset
      let tools = getComprehensiveAiToolsDataset();
      
      // Apply search filter
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        tools = tools.filter(tool => 
          tool.name.toLowerCase().includes(searchTerm) ||
          tool.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply category filter
      if (category && category !== 'all') {
        tools = tools.filter(tool => tool.category === category);
      }
      
      // Apply pagination
      const limit = Math.min(parseInt(req.query.limit as string || '24'), 48);
      const offset = parseInt(req.query.offset as string || '0');
      const paginatedTools = tools.slice(offset, offset + limit);

      res.json({
        tools: paginatedTools,
        pagination: {
          total: tools.length,
          limit: limit,
          offset: offset,
          hasMore: offset + limit < tools.length
        }
      });
    } catch (error) {
      console.error("Failed to fetch tools:", error);
      res.status(500).json({ error: "Failed to fetch tools" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = ["Text", "Images", "Video", "Audio", "Developer Tools", "Productivity", "Search", "Marketing", "Education", "Health"];
      res.json(categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  return createServer(app);
}

// Comprehensive AI Tools Dataset (100+ tools)
function getComprehensiveAiToolsDataset() {
  return [
    // Popular AI Platforms & Models
    { id: 1, name: "OpenAI ChatGPT", url: "https://chat.openai.com", description: "Advanced conversational AI for text generation, analysis, and problem-solving", imageUrl: "https://logo.clearbit.com/openai.com", category: "Text", source: "curated" },
    { id: 2, name: "Anthropic Claude", url: "https://claude.ai", description: "Constitutional AI assistant focused on helpful, harmless, and honest interactions", imageUrl: "https://logo.clearbit.com/anthropic.com", category: "Text", source: "curated" },
    { id: 3, name: "Google Bard", url: "https://bard.google.com", description: "Google's experimental conversational AI service powered by LaMDA", imageUrl: "https://logo.clearbit.com/google.com", category: "Text", source: "curated" },
    { id: 4, name: "Microsoft Copilot", url: "https://copilot.microsoft.com", description: "AI-powered assistant integrated across Microsoft 365 applications", imageUrl: "https://logo.clearbit.com/microsoft.com", category: "Productivity", source: "curated" },
    { id: 5, name: "Perplexity AI", url: "https://perplexity.ai", description: "AI search engine that provides accurate answers with cited sources", imageUrl: "https://logo.clearbit.com/perplexity.ai", category: "Search", source: "curated" },
    
    // Image Generation & Design
    { id: 6, name: "Midjourney", url: "https://midjourney.com", description: "AI art generator creating stunning digital artwork from text prompts", imageUrl: "https://logo.clearbit.com/midjourney.com", category: "Images", source: "curated" },
    { id: 7, name: "DALL-E 3", url: "https://openai.com/dall-e-3", description: "Latest iteration of OpenAI's text-to-image generation model", imageUrl: "https://logo.clearbit.com/openai.com", category: "Images", source: "curated" },
    { id: 8, name: "Stable Diffusion", url: "https://stability.ai", description: "Open-source diffusion model for high-quality image generation", imageUrl: "https://logo.clearbit.com/stability.ai", category: "Images", source: "curated" },
    { id: 9, name: "Adobe Firefly", url: "https://firefly.adobe.com", description: "Adobe's AI for creative content generation integrated into Creative Cloud", imageUrl: "https://logo.clearbit.com/adobe.com", category: "Images", source: "curated" },
    { id: 10, name: "Canva AI", url: "https://canva.com/ai-image-generator", description: "AI-powered design tools integrated into Canva's design platform", imageUrl: "https://logo.clearbit.com/canva.com", category: "Images", source: "curated" },
    { id: 11, name: "Leonardo AI", url: "https://leonardo.ai", description: "AI image generation platform with fine-tuned models for various styles", imageUrl: "https://logo.clearbit.com/leonardo.ai", category: "Images", source: "curated" },
    { id: 12, name: "Playground AI", url: "https://playgroundai.com", description: "User-friendly interface for AI image generation and editing", imageUrl: "https://logo.clearbit.com/playgroundai.com", category: "Images", source: "curated" },
    { id: 13, name: "DreamStudio", url: "https://dreamstudio.ai", description: "Stability AI's web interface for Stable Diffusion image generation", imageUrl: "https://logo.clearbit.com/stability.ai", category: "Images", source: "curated" },
    { id: 14, name: "Artbreeder", url: "https://artbreeder.com", description: "Collaborative AI art creation platform using genetic algorithms", imageUrl: "https://logo.clearbit.com/artbreeder.com", category: "Images", source: "curated" },
    { id: 15, name: "NightCafe", url: "https://nightcafe.studio", description: "AI art generator with multiple algorithms and community features", imageUrl: "https://logo.clearbit.com/nightcafe.studio", category: "Images", source: "curated" },
    
    // Video Generation & Editing
    { id: 16, name: "Runway ML", url: "https://runwayml.com", description: "AI-powered video editing suite with generative AI capabilities", imageUrl: "https://logo.clearbit.com/runwayml.com", category: "Video", source: "curated" },
    { id: 17, name: "Pika Labs", url: "https://pika.art", description: "AI video generation platform creating short clips from text prompts", imageUrl: "https://logo.clearbit.com/pika.art", category: "Video", source: "curated" },
    { id: 18, name: "Synthesia", url: "https://synthesia.io", description: "AI video generation platform with virtual presenters and avatars", imageUrl: "https://logo.clearbit.com/synthesia.io", category: "Video", source: "curated" },
    { id: 19, name: "Luma AI", url: "https://lumalabs.ai", description: "AI platform for 3D capture and photorealistic video generation", imageUrl: "https://logo.clearbit.com/lumalabs.ai", category: "Video", source: "curated" },
    { id: 20, name: "HeyGen", url: "https://heygen.com", description: "AI-powered video creation with customizable avatars and voices", imageUrl: "https://logo.clearbit.com/heygen.com", category: "Video", source: "curated" },
    { id: 21, name: "D-ID", url: "https://d-id.com", description: "AI platform for creating talking head videos from still images", imageUrl: "https://logo.clearbit.com/d-id.com", category: "Video", source: "curated" },
    { id: 22, name: "Pictory", url: "https://pictory.ai", description: "AI video creation from scripts and blog posts with automated editing", imageUrl: "https://logo.clearbit.com/pictory.ai", category: "Video", source: "curated" },
    { id: 23, name: "InVideo", url: "https://invideo.io", description: "AI-powered video creation platform with templates and automation", imageUrl: "https://logo.clearbit.com/invideo.io", category: "Video", source: "curated" },
    { id: 24, name: "Fliki", url: "https://fliki.ai", description: "AI tool for creating videos from text with lifelike voiceovers", imageUrl: "https://logo.clearbit.com/fliki.ai", category: "Video", source: "curated" },
    { id: 25, name: "Steve AI", url: "https://steve.ai", description: "AI video generator creating animated and live-action videos from text", imageUrl: "https://logo.clearbit.com/steve.ai", category: "Video", source: "curated" },
    
    // Audio & Voice AI
    { id: 26, name: "ElevenLabs", url: "https://elevenlabs.io", description: "AI voice synthesis platform with realistic voice cloning capabilities", imageUrl: "https://logo.clearbit.com/elevenlabs.io", category: "Audio", source: "curated" },
    { id: 27, name: "Murf AI", url: "https://murf.ai", description: "AI voice generator for professional voiceovers and narration", imageUrl: "https://logo.clearbit.com/murf.ai", category: "Audio", source: "curated" },
    { id: 28, name: "Speechify", url: "https://speechify.com", description: "AI text-to-speech platform with natural-sounding voices", imageUrl: "https://logo.clearbit.com/speechify.com", category: "Audio", source: "curated" },
    { id: 29, name: "Descript", url: "https://descript.com", description: "AI-powered audio and video editing with transcription features", imageUrl: "https://logo.clearbit.com/descript.com", category: "Audio", source: "curated" },
    { id: 30, name: "AIVA", url: "https://aiva.ai", description: "AI composer creating original music for various applications", imageUrl: "https://logo.clearbit.com/aiva.ai", category: "Audio", source: "curated" },
    { id: 31, name: "Soundraw", url: "https://soundraw.io", description: "AI music generation platform for royalty-free compositions", imageUrl: "https://logo.clearbit.com/soundraw.io", category: "Audio", source: "curated" },
    { id: 32, name: "Boomy", url: "https://boomy.com", description: "AI music creation platform enabling anyone to make songs instantly", imageUrl: "https://logo.clearbit.com/boomy.com", category: "Audio", source: "curated" },
    { id: 33, name: "Replica Studios", url: "https://replicastudios.com", description: "AI voice acting platform for games, films, and digital content", imageUrl: "https://logo.clearbit.com/replicastudios.com", category: "Audio", source: "curated" },
    { id: 34, name: "Resemble AI", url: "https://resemble.ai", description: "AI voice cloning and speech synthesis for developers", imageUrl: "https://logo.clearbit.com/resemble.ai", category: "Audio", source: "curated" },
    { id: 35, name: "Uberduck", url: "https://uberduck.ai", description: "AI text-to-speech and voice cloning with celebrity voices", imageUrl: "https://logo.clearbit.com/uberduck.ai", category: "Audio", source: "curated" },
    
    // Developer Tools & Code AI
    { id: 36, name: "GitHub Copilot", url: "https://github.com/features/copilot", description: "AI pair programmer providing code suggestions and completions", imageUrl: "https://logo.clearbit.com/github.com", category: "Developer Tools", source: "curated" },
    { id: 37, name: "Cursor", url: "https://cursor.sh", description: "AI-first code editor built for productivity and collaboration", imageUrl: "https://logo.clearbit.com/cursor.sh", category: "Developer Tools", source: "curated" },
    { id: 38, name: "Replit Ghostwriter", url: "https://replit.com/ai", description: "AI coding assistant integrated into the Replit development environment", imageUrl: "https://logo.clearbit.com/replit.com", category: "Developer Tools", source: "curated" },
    { id: 39, name: "Tabnine", url: "https://tabnine.com", description: "AI code completion tool supporting multiple programming languages", imageUrl: "https://logo.clearbit.com/tabnine.com", category: "Developer Tools", source: "curated" },
    { id: 40, name: "Amazon CodeWhisperer", url: "https://aws.amazon.com/codewhisperer", description: "Amazon's AI coding companion for real-time code suggestions", imageUrl: "https://logo.clearbit.com/amazon.com", category: "Developer Tools", source: "curated" },
    { id: 41, name: "Sourcegraph Cody", url: "https://sourcegraph.com/cody", description: "AI coding assistant that knows your entire codebase", imageUrl: "https://logo.clearbit.com/sourcegraph.com", category: "Developer Tools", source: "curated" },
    { id: 42, name: "OpenAI Codex", url: "https://openai.com/blog/openai-codex", description: "OpenAI's AI system that translates natural language to code", imageUrl: "https://logo.clearbit.com/openai.com", category: "Developer Tools", source: "curated" },
    { id: 43, name: "Kite", url: "https://kite.com", description: "AI coding assistant providing intelligent completions and documentation", imageUrl: "https://logo.clearbit.com/kite.com", category: "Developer Tools", source: "curated" },
    { id: 44, name: "CodeT5", url: "https://huggingface.co/Salesforce/codet5-base", description: "Salesforce's code-understanding and generation model", imageUrl: "https://logo.clearbit.com/salesforce.com", category: "Developer Tools", source: "curated" },
    { id: 45, name: "DeepCode", url: "https://snyk.io/platform/deepcode-ai", description: "AI-powered code review and vulnerability detection", imageUrl: "https://logo.clearbit.com/snyk.io", category: "Developer Tools", source: "curated" },
    
    // Writing & Content Creation
    { id: 46, name: "Jasper AI", url: "https://jasper.ai", description: "AI writing assistant for marketing copy, blog posts, and creative content", imageUrl: "https://logo.clearbit.com/jasper.ai", category: "Text", source: "curated" },
    { id: 47, name: "Copy.ai", url: "https://copy.ai", description: "AI copywriting tool for marketing materials and social media content", imageUrl: "https://logo.clearbit.com/copy.ai", category: "Text", source: "curated" },
    { id: 48, name: "Writesonic", url: "https://writesonic.com", description: "AI writing platform for articles, ads, and product descriptions", imageUrl: "https://logo.clearbit.com/writesonic.com", category: "Text", source: "curated" },
    { id: 49, name: "Grammarly", url: "https://grammarly.com", description: "AI writing assistant for grammar, clarity, and tone optimization", imageUrl: "https://logo.clearbit.com/grammarly.com", category: "Text", source: "curated" },
    { id: 50, name: "Notion AI", url: "https://notion.so/product/ai", description: "AI writing features integrated into Notion's productivity workspace", imageUrl: "https://logo.clearbit.com/notion.so", category: "Productivity", source: "curated" },
    { id: 51, name: "Rytr", url: "https://rytr.me", description: "AI writing assistant for creating high-quality content quickly", imageUrl: "https://logo.clearbit.com/rytr.me", category: "Text", source: "curated" },
    { id: 52, name: "Article Forge", url: "https://articleforge.com", description: "AI content generator creating unique, high-quality articles automatically", imageUrl: "https://logo.clearbit.com/articleforge.com", category: "Text", source: "curated" },
    { id: 53, name: "Wordtune", url: "https://wordtune.com", description: "AI writing companion that helps rewrite and improve your writing", imageUrl: "https://logo.clearbit.com/wordtune.com", category: "Text", source: "curated" },
    { id: 54, name: "QuillBot", url: "https://quillbot.com", description: "AI paraphrasing tool for improving writing fluency and clarity", imageUrl: "https://logo.clearbit.com/quillbot.com", category: "Text", source: "curated" },
    { id: 55, name: "Sudowrite", url: "https://sudowrite.com", description: "AI writing tool specifically designed for creative fiction writing", imageUrl: "https://logo.clearbit.com/sudowrite.com", category: "Text", source: "curated" },
    
    // Productivity & Business AI
    { id: 56, name: "Monday.com AI", url: "https://monday.com/ai", description: "AI-powered project management and workflow automation", imageUrl: "https://logo.clearbit.com/monday.com", category: "Productivity", source: "curated" },
    { id: 57, name: "Asana Intelligence", url: "https://asana.com/ai", description: "AI features for smart project insights and task automation", imageUrl: "https://logo.clearbit.com/asana.com", category: "Productivity", source: "curated" },
    { id: 58, name: "Zapier AI", url: "https://zapier.com/ai", description: "AI automation platform connecting apps and workflows", imageUrl: "https://logo.clearbit.com/zapier.com", category: "Productivity", source: "curated" },
    { id: 59, name: "Calendly AI", url: "https://calendly.com", description: "AI-powered scheduling assistant with smart availability detection", imageUrl: "https://logo.clearbit.com/calendly.com", category: "Productivity", source: "curated" },
    { id: 60, name: "Krisp", url: "https://krisp.ai", description: "AI-powered noise cancellation for clearer online meetings", imageUrl: "https://logo.clearbit.com/krisp.ai", category: "Productivity", source: "curated" },
    { id: 61, name: "Otter.ai", url: "https://otter.ai", description: "AI meeting assistant providing real-time transcription and notes", imageUrl: "https://logo.clearbit.com/otter.ai", category: "Productivity", source: "curated" },
    { id: 62, name: "Fireflies.ai", url: "https://fireflies.ai", description: "AI notetaker for video conferences with searchable transcripts", imageUrl: "https://logo.clearbit.com/fireflies.ai", category: "Productivity", source: "curated" },
    { id: 63, name: "Brain.fm", url: "https://brain.fm", description: "AI-generated music designed to enhance focus and productivity", imageUrl: "https://logo.clearbit.com/brain.fm", category: "Productivity", source: "curated" },
    { id: 64, name: "Reclaim AI", url: "https://reclaim.ai", description: "AI calendar assistant for optimizing schedules and protecting focus time", imageUrl: "https://logo.clearbit.com/reclaim.ai", category: "Productivity", source: "curated" },
    { id: 65, name: "Clockify AI", url: "https://clockify.me", description: "AI time tracking and productivity analytics platform", imageUrl: "https://logo.clearbit.com/clockify.me", category: "Productivity", source: "curated" },
    
    // Marketing & Sales AI
    { id: 66, name: "HubSpot AI", url: "https://hubspot.com/artificial-intelligence", description: "AI-powered CRM and marketing automation platform", imageUrl: "https://logo.clearbit.com/hubspot.com", category: "Marketing", source: "curated" },
    { id: 67, name: "Salesforce Einstein", url: "https://salesforce.com/products/einstein", description: "AI platform integrated across Salesforce's CRM ecosystem", imageUrl: "https://logo.clearbit.com/salesforce.com", category: "Marketing", source: "curated" },
    { id: 68, name: "Drift", url: "https://drift.com", description: "AI-powered conversational marketing and sales platform", imageUrl: "https://logo.clearbit.com/drift.com", category: "Marketing", source: "curated" },
    { id: 69, name: "Intercom", url: "https://intercom.com", description: "AI customer service and engagement platform", imageUrl: "https://logo.clearbit.com/intercom.com", category: "Marketing", source: "curated" },
    { id: 70, name: "Persado", url: "https://persado.com", description: "AI platform for generating persuasive marketing language", imageUrl: "https://logo.clearbit.com/persado.com", category: "Marketing", source: "curated" },
    { id: 71, name: "Phrasee", url: "https://phrasee.co", description: "AI copywriting for email marketing and social media campaigns", imageUrl: "https://logo.clearbit.com/phrasee.co", category: "Marketing", source: "curated" },
    { id: 72, name: "Lavender", url: "https://lavender.ai", description: "AI email coach helping sales teams write better emails", imageUrl: "https://logo.clearbit.com/lavender.ai", category: "Marketing", source: "curated" },
    { id: 73, name: "Gong", url: "https://gong.io", description: "AI revenue intelligence platform analyzing sales conversations", imageUrl: "https://logo.clearbit.com/gong.io", category: "Marketing", source: "curated" },
    { id: 74, name: "Outreach", url: "https://outreach.io", description: "AI-powered sales engagement and automation platform", imageUrl: "https://logo.clearbit.com/outreach.io", category: "Marketing", source: "curated" },
    { id: 75, name: "Seventh Sense", url: "https://theseventhsense.com", description: "AI email delivery optimization for better engagement", imageUrl: "https://logo.clearbit.com/theseventhsense.com", category: "Marketing", source: "curated" },
    
    // Education & Learning AI
    { id: 76, name: "Khan Academy Khanmigo", url: "https://khanacademy.org/khan-labs", description: "AI tutor providing personalized learning assistance", imageUrl: "https://logo.clearbit.com/khanacademy.org", category: "Education", source: "curated" },
    { id: 77, name: "Coursera AI", url: "https://coursera.org", description: "AI-powered course recommendations and learning paths", imageUrl: "https://logo.clearbit.com/coursera.org", category: "Education", source: "curated" },
    { id: 78, name: "Duolingo AI", url: "https://duolingo.com", description: "AI language learning platform with personalized lessons", imageUrl: "https://logo.clearbit.com/duolingo.com", category: "Education", source: "curated" },
    { id: 79, name: "Socratic by Google", url: "https://socratic.org", description: "AI homework helper using visual explanations", imageUrl: "https://logo.clearbit.com/google.com", category: "Education", source: "curated" },
    { id: 80, name: "Quizlet AI", url: "https://quizlet.com", description: "AI-enhanced flashcards and study tools", imageUrl: "https://logo.clearbit.com/quizlet.com", category: "Education", source: "curated" },
    { id: 81, name: "Gradescope", url: "https://gradescope.com", description: "AI-assisted grading and assessment platform", imageUrl: "https://logo.clearbit.com/gradescope.com", category: "Education", source: "curated" },
    { id: 82, name: "Carnegie Learning", url: "https://carnegielearning.com", description: "AI tutoring platform for mathematics education", imageUrl: "https://logo.clearbit.com/carnegielearning.com", category: "Education", source: "curated" },
    { id: 83, name: "Century Tech", url: "https://century.tech", description: "AI platform providing personalized learning paths", imageUrl: "https://logo.clearbit.com/century.tech", category: "Education", source: "curated" },
    { id: 84, name: "Squirrel AI", url: "https://squirrelai.com", description: "AI adaptive learning system for K-12 education", imageUrl: "https://logo.clearbit.com/squirrelai.com", category: "Education", source: "curated" },
    { id: 85, name: "Knewton", url: "https://knewton.com", description: "AI adaptive learning technology for educational content", imageUrl: "https://logo.clearbit.com/knewton.com", category: "Education", source: "curated" },
    
    // Healthcare & Medical AI
    { id: 86, name: "Ada Health", url: "https://ada.com", description: "AI health assessment app providing symptom analysis", imageUrl: "https://logo.clearbit.com/ada.com", category: "Health", source: "curated" },
    { id: 87, name: "Babylon Health", url: "https://babylonhealth.com", description: "AI-powered healthcare platform with virtual consultations", imageUrl: "https://logo.clearbit.com/babylonhealth.com", category: "Health", source: "curated" },
    { id: 88, name: "Zebra Medical", url: "https://zebra-med.com", description: "AI medical imaging analysis for radiology", imageUrl: "https://logo.clearbit.com/zebra-med.com", category: "Health", source: "curated" },
    { id: 89, name: "PathAI", url: "https://pathai.com", description: "AI pathology platform for disease diagnosis", imageUrl: "https://logo.clearbit.com/pathai.com", category: "Health", source: "curated" },
    { id: 90, name: "Tempus", url: "https://tempus.com", description: "AI platform for precision medicine and cancer treatment", imageUrl: "https://logo.clearbit.com/tempus.com", category: "Health", source: "curated" },
    { id: 91, name: "Arterys", url: "https://arterys.com", description: "AI medical imaging platform for cardiovascular analysis", imageUrl: "https://logo.clearbit.com/arterys.com", category: "Health", source: "curated" },
    { id: 92, name: "Enlitic", url: "https://enlitic.com", description: "AI medical diagnostics using deep learning", imageUrl: "https://logo.clearbit.com/enlitic.com", category: "Health", source: "curated" },
    { id: 93, name: "Butterfly Network", url: "https://butterflynetwork.com", description: "AI-powered handheld ultrasound devices", imageUrl: "https://logo.clearbit.com/butterflynetwork.com", category: "Health", source: "curated" },
    { id: 94, name: "Deep Genomics", url: "https://deepgenomics.com", description: "AI platform for genetic medicine discovery", imageUrl: "https://logo.clearbit.com/deepgenomics.com", category: "Health", source: "curated" },
    { id: 95, name: "Atomwise", url: "https://atomwise.com", description: "AI drug discovery platform using molecular analysis", imageUrl: "https://logo.clearbit.com/atomwise.com", category: "Health", source: "curated" },

    // Search & Research AI
    { id: 96, name: "You.com", url: "https://you.com", description: "AI search engine with personalized results and chat capabilities", imageUrl: "https://logo.clearbit.com/you.com", category: "Search", source: "curated" },
    { id: 97, name: "Bing AI", url: "https://bing.com/chat", description: "Microsoft's AI-powered search with conversational interface", imageUrl: "https://logo.clearbit.com/microsoft.com", category: "Search", source: "curated" },
    { id: 98, name: "Phind", url: "https://phind.com", description: "AI search engine optimized for developers and technical queries", imageUrl: "https://logo.clearbit.com/phind.com", category: "Search", source: "curated" },
    { id: 99, name: "Consensus", url: "https://consensus.app", description: "AI-powered search engine for scientific research papers", imageUrl: "https://logo.clearbit.com/consensus.app", category: "Search", source: "curated" },
    { id: 100, name: "Elicit", url: "https://elicit.org", description: "AI research assistant for academic literature review", imageUrl: "https://logo.clearbit.com/elicit.org", category: "Search", source: "curated" }
  ];
}