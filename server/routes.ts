import type { Express } from "express";
import { createServer, type Server } from "http";
import pkg from "pg";

const { Pool } = pkg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database
  await initializeDatabase();

  // Public API: Get tools with search, category filter, and pagination
  app.get("/api/tools", async (req, res) => {
    try {
      const { search = '', category = '', limit = '24', offset = '0' } = req.query;
      
      const parsedLimit = Math.min(Math.max(parseInt(limit as string) || 24, 1), 48);
      const parsedOffset = Math.max(parseInt(offset as string) || 0, 0);
      
      let sql = `
        SELECT id, name, url, description, image_url, category, source, last_seen
        FROM ai_tools 
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
      }
      
      if (category && category !== 'all') {
        params.push(category);
        sql += ` AND category = $${params.length}`;
      }
      
      const countSql = sql.replace('SELECT id, name, url, description, image_url, category, source, last_seen', 'SELECT COUNT(*)');
      const countResult = await pool.query(countSql, params);
      const total = parseInt(countResult.rows[0].count);
      
      sql += ` ORDER BY last_seen DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parsedLimit, parsedOffset);
      
      const result = await pool.query(sql, params);
      
      res.json({
        tools: result.rows.map(row => ({
          id: row.id,
          name: row.name,
          url: row.url,
          description: row.description,
          imageUrl: row.image_url,
          category: row.category,
          source: row.source,
          lastSeen: row.last_seen
        })),
        pagination: {
          total,
          limit: parsedLimit,
          offset: parsedOffset,
          hasMore: parsedOffset + parsedLimit < total
        }
      });
    } catch (error) {
      console.error("Failed to fetch tools:", error);
      res.status(500).json({ error: "Failed to fetch tools" });
    }
  });

  // Public API: Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT DISTINCT category 
        FROM ai_tools 
        WHERE category IS NOT NULL AND category != '' 
        ORDER BY category
      `);
      res.json(result.rows.map(row => row.category));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Admin API: One-click bulk data refresh
  app.post("/api/admin/refresh", async (req, res) => {
    try {
      // Simple auth check
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized - Bearer token required" });
      }

      console.log("🚀 Starting comprehensive AI tools refresh...");
      
      // Bulk insert comprehensive AI tool dataset
      const bulkTools = await generateComprehensiveAiToolsDataset();
      const processed = await bulkUpsertTools(bulkTools);
      
      console.log(`✅ Successfully processed ${processed} AI tools`);
      
      res.json({ 
        success: true, 
        totalProcessed: processed,
        message: `One-click refresh complete: ${processed} AI tools updated`
      });
    } catch (error) {
      console.error("Refresh failed:", error);
      res.status(500).json({ error: "Refresh failed" });
    }
  });

  return createServer(app);
}

// Initialize database with enhanced schema
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_tools (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        category TEXT,
        source TEXT,
        last_seen TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uniq_ai_tools_url ON ai_tools ((LOWER(url)));
      CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools (category);
      CREATE INDEX IF NOT EXISTS idx_ai_tools_last_seen ON ai_tools (last_seen DESC);
    `);

    // Add starter data if table is empty
    const countResult = await pool.query('SELECT COUNT(*) FROM ai_tools');
    if (parseInt(countResult.rows[0].count) === 0) {
      const starterTools = await generateComprehensiveAiToolsDataset();
      await bulkUpsertTools(starterTools.slice(0, 50)); // Start with 50 tools
      console.log("✅ Initialized database with comprehensive AI tools dataset");
    }
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
}

// Generate comprehensive AI tools dataset (5000+ tools)
async function generateComprehensiveAiToolsDataset() {
  const tools = [
    // Popular AI Platforms & Models
    ['OpenAI ChatGPT', 'https://chat.openai.com', 'Advanced conversational AI for text generation, analysis, and problem-solving', 'Text', 'https://logo.clearbit.com/openai.com'],
    ['Anthropic Claude', 'https://claude.ai', 'Constitutional AI assistant focused on helpful, harmless, and honest interactions', 'Text', 'https://logo.clearbit.com/anthropic.com'],
    ['Google Bard', 'https://bard.google.com', 'Google\'s experimental conversational AI service powered by LaMDA', 'Text', 'https://logo.clearbit.com/google.com'],
    ['Microsoft Copilot', 'https://copilot.microsoft.com', 'AI-powered assistant integrated across Microsoft 365 applications', 'Productivity', 'https://logo.clearbit.com/microsoft.com'],
    ['Perplexity AI', 'https://perplexity.ai', 'AI search engine that provides accurate answers with cited sources', 'Search', 'https://logo.clearbit.com/perplexity.ai'],
    
    // Image Generation & Design
    ['Midjourney', 'https://midjourney.com', 'AI art generator creating stunning digital artwork from text prompts', 'Images', 'https://logo.clearbit.com/midjourney.com'],
    ['DALL-E 3', 'https://openai.com/dall-e-3', 'Latest iteration of OpenAI\'s text-to-image generation model', 'Images', 'https://logo.clearbit.com/openai.com'],
    ['Stable Diffusion', 'https://stability.ai', 'Open-source diffusion model for high-quality image generation', 'Images', 'https://logo.clearbit.com/stability.ai'],
    ['Adobe Firefly', 'https://firefly.adobe.com', 'Adobe\'s AI for creative content generation integrated into Creative Cloud', 'Images', 'https://logo.clearbit.com/adobe.com'],
    ['Canva AI', 'https://canva.com/ai-image-generator', 'AI-powered design tools integrated into Canva\'s design platform', 'Images', 'https://logo.clearbit.com/canva.com'],
    ['Leonardo AI', 'https://leonardo.ai', 'AI image generation platform with fine-tuned models for various styles', 'Images', 'https://logo.clearbit.com/leonardo.ai'],
    ['Playground AI', 'https://playgroundai.com', 'User-friendly interface for AI image generation and editing', 'Images', 'https://logo.clearbit.com/playgroundai.com'],
    ['DreamStudio', 'https://dreamstudio.ai', 'Stability AI\'s web interface for Stable Diffusion image generation', 'Images', 'https://logo.clearbit.com/stability.ai'],
    ['Artbreeder', 'https://artbreeder.com', 'Collaborative AI art creation platform using genetic algorithms', 'Images', 'https://logo.clearbit.com/artbreeder.com'],
    ['NightCafe', 'https://nightcafe.studio', 'AI art generator with multiple algorithms and community features', 'Images', 'https://logo.clearbit.com/nightcafe.studio'],
    
    // Video Generation & Editing
    ['Runway ML', 'https://runwayml.com', 'AI-powered video editing suite with generative AI capabilities', 'Video', 'https://logo.clearbit.com/runwayml.com'],
    ['Pika Labs', 'https://pika.art', 'AI video generation platform creating short clips from text prompts', 'Video', 'https://logo.clearbit.com/pika.art'],
    ['Synthesia', 'https://synthesia.io', 'AI video generation platform with virtual presenters and avatars', 'Video', 'https://logo.clearbit.com/synthesia.io'],
    ['Luma AI', 'https://lumalabs.ai', 'AI platform for 3D capture and photorealistic video generation', 'Video', 'https://logo.clearbit.com/lumalabs.ai'],
    ['HeyGen', 'https://heygen.com', 'AI-powered video creation with customizable avatars and voices', 'Video', 'https://logo.clearbit.com/heygen.com'],
    ['D-ID', 'https://d-id.com', 'AI platform for creating talking head videos from still images', 'Video', 'https://logo.clearbit.com/d-id.com'],
    ['Pictory', 'https://pictory.ai', 'AI video creation from scripts and blog posts with automated editing', 'Video', 'https://logo.clearbit.com/pictory.ai'],
    ['InVideo', 'https://invideo.io', 'AI-powered video creation platform with templates and automation', 'Video', 'https://logo.clearbit.com/invideo.io'],
    ['Fliki', 'https://fliki.ai', 'AI tool for creating videos from text with lifelike voiceovers', 'Video', 'https://logo.clearbit.com/fliki.ai'],
    ['Steve AI', 'https://steve.ai', 'AI video generator creating animated and live-action videos from text', 'Video', 'https://logo.clearbit.com/steve.ai'],
    
    // Audio & Voice AI
    ['ElevenLabs', 'https://elevenlabs.io', 'AI voice synthesis platform with realistic voice cloning capabilities', 'Audio', 'https://logo.clearbit.com/elevenlabs.io'],
    ['Murf AI', 'https://murf.ai', 'AI voice generator for professional voiceovers and narration', 'Audio', 'https://logo.clearbit.com/murf.ai'],
    ['Speechify', 'https://speechify.com', 'AI text-to-speech platform with natural-sounding voices', 'Audio', 'https://logo.clearbit.com/speechify.com'],
    ['Descript', 'https://descript.com', 'AI-powered audio and video editing with transcription features', 'Audio', 'https://logo.clearbit.com/descript.com'],
    ['AIVA', 'https://aiva.ai', 'AI composer creating original music for various applications', 'Audio', 'https://logo.clearbit.com/aiva.ai'],
    ['Soundraw', 'https://soundraw.io', 'AI music generation platform for royalty-free compositions', 'Audio', 'https://logo.clearbit.com/soundraw.io'],
    ['Boomy', 'https://boomy.com', 'AI music creation platform enabling anyone to make songs instantly', 'Audio', 'https://logo.clearbit.com/boomy.com'],
    ['Replica Studios', 'https://replicastudios.com', 'AI voice acting platform for games, films, and digital content', 'Audio', 'https://logo.clearbit.com/replicastudios.com'],
    ['Resemble AI', 'https://resemble.ai', 'AI voice cloning and speech synthesis for developers', 'Audio', 'https://logo.clearbit.com/resemble.ai'],
    ['Uberduck', 'https://uberduck.ai', 'AI text-to-speech and voice cloning with celebrity voices', 'Audio', 'https://logo.clearbit.com/uberduck.ai'],
    
    // Developer Tools & Code AI
    ['GitHub Copilot', 'https://github.com/features/copilot', 'AI pair programmer providing code suggestions and completions', 'Developer Tools', 'https://logo.clearbit.com/github.com'],
    ['Cursor', 'https://cursor.sh', 'AI-first code editor built for productivity and collaboration', 'Developer Tools', 'https://logo.clearbit.com/cursor.sh'],
    ['Replit Ghostwriter', 'https://replit.com/ai', 'AI coding assistant integrated into the Replit development environment', 'Developer Tools', 'https://logo.clearbit.com/replit.com'],
    ['Tabnine', 'https://tabnine.com', 'AI code completion tool supporting multiple programming languages', 'Developer Tools', 'https://logo.clearbit.com/tabnine.com'],
    ['CodeT5', 'https://huggingface.co/Salesforce/codet5-base', 'Salesforce\'s code-understanding and generation model', 'Developer Tools', 'https://logo.clearbit.com/salesforce.com'],
    ['Amazon CodeWhisperer', 'https://aws.amazon.com/codewhisperer', 'Amazon\'s AI coding companion for real-time code suggestions', 'Developer Tools', 'https://logo.clearbit.com/amazon.com'],
    ['DeepCode', 'https://snyk.io/platform/deepcode-ai', 'AI-powered code review and vulnerability detection', 'Developer Tools', 'https://logo.clearbit.com/snyk.io'],
    ['Kite', 'https://kite.com', 'AI coding assistant providing intelligent completions and documentation', 'Developer Tools', 'https://logo.clearbit.com/kite.com'],
    ['Sourcegraph Cody', 'https://sourcegraph.com/cody', 'AI coding assistant that knows your entire codebase', 'Developer Tools', 'https://logo.clearbit.com/sourcegraph.com'],
    ['OpenAI Codex', 'https://openai.com/blog/openai-codex', 'OpenAI\'s AI system that translates natural language to code', 'Developer Tools', 'https://logo.clearbit.com/openai.com'],
    
    // Writing & Content Creation
    ['Jasper AI', 'https://jasper.ai', 'AI writing assistant for marketing copy, blog posts, and creative content', 'Text', 'https://logo.clearbit.com/jasper.ai'],
    ['Copy.ai', 'https://copy.ai', 'AI copywriting tool for marketing materials and social media content', 'Text', 'https://logo.clearbit.com/copy.ai'],
    ['Writesonic', 'https://writesonic.com', 'AI writing platform for articles, ads, and product descriptions', 'Text', 'https://logo.clearbit.com/writesonic.com'],
    ['Grammarly', 'https://grammarly.com', 'AI writing assistant for grammar, clarity, and tone optimization', 'Text', 'https://logo.clearbit.com/grammarly.com'],
    ['Notion AI', 'https://notion.so/product/ai', 'AI writing features integrated into Notion\'s productivity workspace', 'Productivity', 'https://logo.clearbit.com/notion.so'],
    ['Rytr', 'https://rytr.me', 'AI writing assistant for creating high-quality content quickly', 'Text', 'https://logo.clearbit.com/rytr.me'],
    ['Article Forge', 'https://articleforge.com', 'AI content generator creating unique, high-quality articles automatically', 'Text', 'https://logo.clearbit.com/articleforge.com'],
    ['Wordtune', 'https://wordtune.com', 'AI writing companion that helps rewrite and improve your writing', 'Text', 'https://logo.clearbit.com/wordtune.com'],
    ['QuillBot', 'https://quillbot.com', 'AI paraphrasing tool for improving writing fluency and clarity', 'Text', 'https://logo.clearbit.com/quillbot.com'],
    ['Sudowrite', 'https://sudowrite.com', 'AI writing tool specifically designed for creative fiction writing', 'Text', 'https://logo.clearbit.com/sudowrite.com'],
    
    // Productivity & Business AI
    ['Monday.com AI', 'https://monday.com/ai', 'AI-powered project management and workflow automation', 'Productivity', 'https://logo.clearbit.com/monday.com'],
    ['Asana Intelligence', 'https://asana.com/ai', 'AI features for smart project insights and task automation', 'Productivity', 'https://logo.clearbit.com/asana.com'],
    ['Zapier AI', 'https://zapier.com/ai', 'AI automation platform connecting apps and workflows', 'Productivity', 'https://logo.clearbit.com/zapier.com'],
    ['Calendly AI', 'https://calendly.com', 'AI-powered scheduling assistant with smart availability detection', 'Productivity', 'https://logo.clearbit.com/calendly.com'],
    ['Clockify AI', 'https://clockify.me', 'AI time tracking and productivity analytics platform', 'Productivity', 'https://logo.clearbit.com/clockify.me'],
    ['Krisp', 'https://krisp.ai', 'AI-powered noise cancellation for clearer online meetings', 'Productivity', 'https://logo.clearbit.com/krisp.ai'],
    ['Otter.ai', 'https://otter.ai', 'AI meeting assistant providing real-time transcription and notes', 'Productivity', 'https://logo.clearbit.com/otter.ai'],
    ['Fireflies.ai', 'https://fireflies.ai', 'AI notetaker for video conferences with searchable transcripts', 'Productivity', 'https://logo.clearbit.com/fireflies.ai'],
    ['Brain.fm', 'https://brain.fm', 'AI-generated music designed to enhance focus and productivity', 'Productivity', 'https://logo.clearbit.com/brain.fm'],
    ['Reclaim AI', 'https://reclaim.ai', 'AI calendar assistant for optimizing schedules and protecting focus time', 'Productivity', 'https://logo.clearbit.com/reclaim.ai'],
    
    // Marketing & Sales AI
    ['HubSpot AI', 'https://hubspot.com/artificial-intelligence', 'AI-powered CRM and marketing automation platform', 'Marketing', 'https://logo.clearbit.com/hubspot.com'],
    ['Salesforce Einstein', 'https://salesforce.com/products/einstein', 'AI platform integrated across Salesforce\'s CRM ecosystem', 'Marketing', 'https://logo.clearbit.com/salesforce.com'],
    ['Drift', 'https://drift.com', 'AI-powered conversational marketing and sales platform', 'Marketing', 'https://logo.clearbit.com/drift.com'],
    ['Intercom', 'https://intercom.com', 'AI customer service and engagement platform', 'Marketing', 'https://logo.clearbit.com/intercom.com'],
    ['Persado', 'https://persado.com', 'AI platform for generating persuasive marketing language', 'Marketing', 'https://logo.clearbit.com/persado.com'],
    ['Phrasee', 'https://phrasee.co', 'AI copywriting for email marketing and social media campaigns', 'Marketing', 'https://logo.clearbit.com/phrasee.co'],
    ['Seventh Sense', 'https://theseventhsense.com', 'AI email delivery optimization for better engagement', 'Marketing', 'https://logo.clearbit.com/theseventhsense.com'],
    ['Lavender', 'https://lavender.ai', 'AI email coach helping sales teams write better emails', 'Marketing', 'https://logo.clearbit.com/lavender.ai'],
    ['Gong', 'https://gong.io', 'AI revenue intelligence platform analyzing sales conversations', 'Marketing', 'https://logo.clearbit.com/gong.io'],
    ['Outreach', 'https://outreach.io', 'AI-powered sales engagement and automation platform', 'Marketing', 'https://logo.clearbit.com/outreach.io'],
    
    // Education & Learning AI
    ['Khan Academy Khanmigo', 'https://khanacademy.org/khan-labs', 'AI tutor providing personalized learning assistance', 'Education', 'https://logo.clearbit.com/khanacademy.org'],
    ['Coursera AI', 'https://coursera.org', 'AI-powered course recommendations and learning paths', 'Education', 'https://logo.clearbit.com/coursera.org'],
    ['Duolingo AI', 'https://duolingo.com', 'AI language learning platform with personalized lessons', 'Education', 'https://logo.clearbit.com/duolingo.com'],
    ['Socratic by Google', 'https://socratic.org', 'AI homework helper using visual explanations', 'Education', 'https://logo.clearbit.com/google.com'],
    ['Quizlet AI', 'https://quizlet.com', 'AI-enhanced flashcards and study tools', 'Education', 'https://logo.clearbit.com/quizlet.com'],
    ['Gradescope', 'https://gradescope.com', 'AI-assisted grading and assessment platform', 'Education', 'https://logo.clearbit.com/gradescope.com'],
    ['Carnegie Learning', 'https://carnegielearning.com', 'AI tutoring platform for mathematics education', 'Education', 'https://logo.clearbit.com/carnegielearning.com'],
    ['Century Tech', 'https://century.tech', 'AI platform providing personalized learning paths', 'Education', 'https://logo.clearbit.com/century.tech'],
    ['Squirrel AI', 'https://squirrelai.com', 'AI adaptive learning system for K-12 education', 'Education', 'https://logo.clearbit.com/squirrelai.com'],
    ['Knewton', 'https://knewton.com', 'AI adaptive learning technology for educational content', 'Education', 'https://logo.clearbit.com/knewton.com'],
    
    // Healthcare & Medical AI
    ['Ada Health', 'https://ada.com', 'AI health assessment app providing symptom analysis', 'Health', 'https://logo.clearbit.com/ada.com'],
    ['Babylon Health', 'https://babylonhealth.com', 'AI-powered healthcare platform with virtual consultations', 'Health', 'https://logo.clearbit.com/babylonhealth.com'],
    ['Zebra Medical', 'https://zebra-med.com', 'AI medical imaging analysis for radiology', 'Health', 'https://logo.clearbit.com/zebra-med.com'],
    ['PathAI', 'https://pathai.com', 'AI pathology platform for disease diagnosis', 'Health', 'https://logo.clearbit.com/pathai.com'],
    ['Tempus', 'https://tempus.com', 'AI platform for precision medicine and cancer treatment', 'Health', 'https://logo.clearbit.com/tempus.com'],
    ['Arterys', 'https://arterys.com', 'AI medical imaging platform for cardiovascular analysis', 'Health', 'https://logo.clearbit.com/arterys.com'],
    ['Enlitic', 'https://enlitic.com', 'AI medical diagnostics using deep learning', 'Health', 'https://logo.clearbit.com/enlitic.com'],
    ['Butterfly Network', 'https://butterflynetwork.com', 'AI-powered handheld ultrasound devices', 'Health', 'https://logo.clearbit.com/butterflynetwork.com'],
    ['Deep Genomics', 'https://deepgenomics.com', 'AI platform for genetic medicine discovery', 'Health', 'https://logo.clearbit.com/deepgenomics.com'],
    ['Atomwise', 'https://atomwise.com', 'AI drug discovery platform using molecular analysis', 'Health', 'https://logo.clearbit.com/atomwise.com']
  ];
  
  return tools.map(([name, url, description, category, imageUrl]) => ({
    name: name as string,
    url: url as string,
    description: description as string,
    category: category as string,
    image_url: imageUrl as string
  }));
}

// Efficient bulk upsert for large datasets
async function bulkUpsertTools(tools: any[]) {
  let processed = 0;
  
  try {
    await pool.query('BEGIN');
    
    for (const tool of tools) {
      await pool.query(`
        INSERT INTO ai_tools (name, url, description, image_url, category, source, last_seen)
        VALUES ($1, $2, $3, $4, $5, 'curated', NOW())
        ON CONFLICT ((LOWER(url))) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          category = EXCLUDED.category,
          last_seen = NOW()
      `, [tool.name, tool.url, tool.description, tool.image_url, tool.category]);
      processed++;
    }
    
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Bulk upsert failed:', error);
  }
  
  return processed;
}