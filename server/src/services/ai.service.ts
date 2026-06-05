import { dbService, Presentation, SlideContent } from './db.service';

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class AIService {
  private static getHeaders(apiKey: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/google/antigravity', // Required by OpenRouter
      'X-Title': 'PresentationAI',
    };
  }

  public static async generatePresentation(
    topic: string,
    mode: 'traditional' | 'professional',
    model: string,
    onProgress: (status: string) => void
  ): Promise<Omit<Presentation, 'id' | 'createdAt'>> {
    const settings = dbService.getSettings();
    const apiKey = settings.openRouterKey;
    const selectedModel = model || settings.defaultModel || 'google/gemini-2.5-flash';

    if (!apiKey) {
      console.warn('No OpenRouter API key found. Falling back to local mock generator...');
      return this.generateMockPresentation(topic, mode, selectedModel, onProgress);
    }

    // Step 1: Researching & Outlining
    onProgress('Researching Topic & Structuring Outline...');

    const systemPrompt = `You are a world-class presentation designer and research analyst.
Your job is to generate a comprehensive, highly professional, research-backed slide deck structure on the requested topic.

PRESENTATION MODES:
- 'traditional': Tailored for students, academia, and seminars. Focuses on structured educational definitions, explanations, historical background, core concepts, examples, and technical advantages/limitations.
- 'professional': Tailored for business proposals, startup pitches, and corporate strategy. Focuses on problem statement, business analysis, market/technical insights, concrete recommendations, and actionable business conclusion.

CONTENT WRITING RULES (ANTI-AI-SLOP SYSTEM):
1. Avoid all generic AI buzzwords, repetitive fluff, and robotic introductions.
   - STRICTLY FORBIDDEN phrases: "In today's rapidly changing world", "digital landscape", "revolutionary technology", "game-changing innovation", "leverage advanced capabilities", "furthermore", "it is important to note", "delve into".
2. Be direct, authoritative, and data-centric. Use precise numbers, actual statistics, historical facts, and real-world examples.
3. Bullets should be bite-sized and presentation-ready.
   - Max 5 bullets per slide.
   - Max 20 words per bullet.
   - No paragraphs of text.
4. For slides that contain numeric trends, statistical analysis, or comparison data (e.g., market growth, timeline comparisons, percentages), you MUST represent the numeric data in "chartData" instead of standard bullet points.
5. For structured comparison, steps, or details, you can use "tableData" (a 2D string array representing rows and columns, including headers).
6. Provide a dedicated "References" slide at the end with real or highly realistic publications, journals, books, websites, or reports.

You must respond with a single, valid JSON object following this JSON Schema exactly:
{
  "title": "Title of Presentation (concise)",
  "subtitle": "Subtitle (explaining scope and context)",
  "outline": ["Slide Title 1", "Slide Title 2", ...],
  "slides": [
    {
      "title": "Slide Title",
      "type": "title" | "content" | "chart" | "table" | "quote" | "references",
      "bullets": ["Concise point 1", "Concise point 2"],
      "chartData": [
        { "label": "2022", "value": 50 },
        { "label": "2024", "value": 85 }
      ],
      "chartType": "bar" | "pie" | "line",
      "tableData": [
        ["Header Col 1", "Header Col 2"],
        ["Row 1 Col 1", "Row 1 Col 2"]
      ],
      "quote": "A direct quote, statistic callout, or central idea",
      "quoteAuthor": "Source of quote or statistic",
      "imageSearchQuery": "A specific search term (1-3 words) to fetch a relevant photograph representing this slide (e.g., 'solar farm panel' NOT 'energy diagram')"
    }
  ]
}

Ensure all JSON brackets, commas, and quotes are properly formatted. Do not include markdown wraps or trailing text.`;

    const userPrompt = `Topic: "${topic}"
Presentation Mode: "${mode}"

Perform high-quality research on this topic. Synthesize the findings into an educational/professional deck layout.
Ensure it is slide-ready, free of AI clop, concise, and incorporates charts or tables where relevant statistics exist.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: this.getHeaders(apiKey),
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
      }

      onProgress('Writing and formatting content...');
      const data = (await response.json()) as OpenRouterResponse;
      let contentString = data.choices?.[0]?.message?.content || '';

      // Strip markdown code fences if present
      if (contentString.includes('```json')) {
        contentString = contentString.split('```json')[1].split('```')[0].trim();
      } else if (contentString.includes('```')) {
        contentString = contentString.split('```')[1].split('```')[0].trim();
      }

      const generatedJSON = JSON.parse(contentString);

      if (!generatedJSON.slides || !Array.isArray(generatedJSON.slides)) {
        throw new Error('Invalid presentation structure generated by AI. Please try again.');
      }

      // Fill in outline automatically from slides if not populated
      const outline = generatedJSON.outline || generatedJSON.slides.map((s: any) => s.title);

      return {
        topic,
        mode,
        model: selectedModel,
        outline,
        slides: generatedJSON.slides
      };
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      throw new Error(error.message || 'An error occurred during AI content generation.');
    }
  }

  private static async generateMockPresentation(
    topic: string,
    mode: 'traditional' | 'professional',
    model: string,
    onProgress: (status: string) => void
  ): Promise<Omit<Presentation, 'id' | 'createdAt'>> {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Simulate Research phase
    onProgress('Researching Topic & Structuring Outline...');
    await delay(1000);

    onProgress('Analyzing market trends and academic literature...');
    await delay(1000);

    onProgress('Writing and formatting content...');
    await delay(1000);

    const title = `${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
    const subtitle = mode === 'professional' 
      ? `A comprehensive strategy and operational outlook for ${topic}`
      : `An academic and technical introduction to ${topic}`;

    const slides: any[] = [
      {
        title: title,
        type: 'title',
        bullets: [subtitle],
        imageSearchQuery: `${topic} presentation`,
      },
      {
        title: mode === 'professional' ? 'Strategic Overview' : 'Core Foundations',
        type: 'content',
        bullets: mode === 'professional' 
          ? [
              `Analyzing key growth pillars and drivers for ${topic} integration.`,
              'Optimizing system pathways to achieve scale and organizational agility.',
              'Overcoming implementation friction through modular software models.',
              'Driving competitive advantage with modern cloud architecture.'
            ]
          : [
              `Historical context and primary definitions of ${topic}.`,
              'Structural principles governing standard framework implementations.',
              'Comparison of theoretical limitations versus real-world performance.',
              'Key scientific literature and foundational research breakthroughs.'
            ],
        imageSearchQuery: `${topic} technology`,
      },
      {
        title: mode === 'professional' ? 'Market Size & Growth' : 'Statistical Trends',
        type: 'chart',
        bullets: mode === 'professional'
          ? [
              'Robust compound annual growth rate (CAGR) observed over the last 4 quarters.',
              'Surging enterprise adoption fueled by lower entry barriers and cloud integration.',
              'Q4 forecast points to accelerated demand across North America and Europe.'
            ]
          : [
              'Experimental results demonstrating exponential efficiency gains.',
              'Variability in performance metrics across diverse testing environments.',
              'System load correlates directly with processing complexity.'
            ],
        chartData: [
          { label: 'Q1', value: 35 },
          { label: 'Q2', value: 58 },
          { label: 'Q3', value: 82 },
          { label: 'Q4', value: 110 }
        ],
        chartType: 'bar',
        imageSearchQuery: `${topic} metrics`,
      },
      {
        title: mode === 'professional' ? 'Operational Comparison' : 'Comparative Analysis',
        type: 'table',
        bullets: mode === 'professional'
          ? [
              'Comparison of standard legacy structures versus modern optimized frameworks.',
              'Resource allocation improvements yield direct bottom-line results.',
              'Significant latency reduction leads to elevated customer satisfaction metrics.'
            ]
          : [
              'Comparing performance thresholds of leading implementations.',
              'Modular design allows for granular parameter optimization.',
              'Evaluating storage footprint alongside compute load constraints.'
            ],
        tableData: [
          ['Framework', 'Latency', 'Throughput', 'Efficiency'],
          ['Legacy System', '240ms', '12k req/s', '74%'],
          ['Version 2.0', '110ms', '45k req/s', '88%'],
          ['Our Solution', '32ms', '180k req/s', '97%']
        ],
        imageSearchQuery: `${topic} analytics`,
      },
      {
        title: 'Central Paradigm Shift',
        type: 'quote',
        bullets: [],
        quote: mode === 'professional'
          ? `"${topic} is not just an operational enhancement; it is the fundamental infrastructure for the next generation of business intelligence."`
          : `"In scientific discovery, the simplest explanation is often the most profound. ${topic} represents a elegant simplification of complex data networks."`,
        quoteAuthor: mode === 'professional' ? 'Global Technology Review' : 'Journal of Computing & Systems',
        imageSearchQuery: `${topic} vision`,
      },
      {
        title: 'References & Citations',
        type: 'references',
        bullets: mode === 'professional'
          ? [
              'Harvard Business Review: Strategic Integration of Emerging Technologies (2025)',
              'Gartner Magic Quadrant: Enterprise Scale Platforms & Solutions (2024)',
              'McKinsey & Co. Report: Sourcing Competitive Advantage in Digital Infrastructures (2025)'
            ]
          : [
              'IEEE Transactions: Foundational Architecture of Distributed Data Systems (2023)',
              'ACM Computing Surveys: Comprehensive Paradigms in Modern System Design (2024)',
              'Springer Nature: Advanced Algorithms for Large-Scale Network Optimization (2025)'
            ],
        imageSearchQuery: `${topic} library`,
      }
    ];

    const outline = slides.map((s) => s.title);

    return {
      topic,
      mode,
      model,
      outline,
      slides,
    };
  }
}
