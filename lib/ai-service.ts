import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Analysis Service
 * 
 * Provides AI-powered features for the work management system.
 * In production, this would integrate with OpenAI, Claude, or other AI APIs.
 */

export interface DirectiveParsed {
  content: string;
  assignedTo?: string;
  originalRequest: string;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
}

export interface AnalysisResult {
  summary: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  suggestedActions: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ProductivityInsight {
  totalTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  bottlenecks: string[];
  recommendations: string[];
}

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  /**
   * Parse a natural language directive into structured data
   */
  async parseDirective(text: string): Promise<DirectiveParsed> {
    console.log('[AI Service] Parsing directive:', text);

    if (!text) {
      throw new Error('Text is required');
    }

    // Fallback to simple regex if no API key or if API fails
    if (!this.model) {
      console.warn('[AI Service] Gemini API key not found, using basic regex parsing');
      return this.parseDirectiveFallback(text);
    }

    try {
      const prompt = `
        Accurately parse the following work directive from a manager in Vietnamese.
        Extract the "content" (what needs to be done) and "assignedTo" (who is responsible).
        
        Input: "${text}"
        
        Rules:
        1. "assignedTo" is the person's name (e.g., Nam, Tuan, Em Huong). If not specified, return null.
        2. "content" is the core task description. Remove phrases like "giao cho", "nhờ", "bảo".
        3. Return strictly JSON format: { "content": "...", "assignedTo": "..." }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      // Clean up markdown code blocks if present
      const jsonStr = textResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      return {
        content: parsed.content || text,
        assignedTo: parsed.assignedTo || undefined,
        originalRequest: text
      };

    } catch (error) {
      console.error('[AI Service] Gemini API error:', error);
      return this.parseDirectiveFallback(text);
    }
  }

  private parseDirectiveFallback(text: string): DirectiveParsed {
    // Simple regex heuristic for "Giao cho [Name] [Task]"
    const assignPatterns = [
      /giao cho\s+([A-Z][a-z\s]+?)\s+(?:làm|thực hiện|kiểm tra|xử lý)?\s*(.*)/i,
      /nhờ\s+([A-Z][a-z\s]+?)\s+(?:làm|thực hiện|kiểm tra|xử lý)?\s*(.*)/i,
      /bảo\s+([A-Z][a-z\s]+?)\s+(?:làm|thực hiện|kiểm tra|xử lý)?\s*(.*)/i
    ];

    for (const pattern of assignPatterns) {
      const match = text.match(pattern);
      if (match) {
        // match[1] is name, match[2] is remainder
        // Or sometimes the order is reversed in Vietnamese speech?
        // Let's assume standard "Giao cho Nam làm XYZ"
        
        // If the captured name is very long (likely missed the boundary), fallback
        if (match[1].length < 20) {
           return {
            assignedTo: match[1].trim(),
            content: match[2].trim() || text, // If remainder is empty, use full text? No, that's weird.
            originalRequest: text
          };
        }
       
      }
    }

    return {
      content: text,
      originalRequest: text
    };
  }

  /**
   * Transcribe audio to text using speech-to-text AI
   */
  async transcribeAudio(audioBase64: string): Promise<TranscriptionResult> {
    console.log('[AI Service] Transcribing audio with Gemini...');

    if (!this.model) {
      console.warn('[AI Service] Gemini API key not found, returning mock');
       return {
        text: 'Chức năng đang chạy ở chế độ demo do thiếu API Key. Vui lòng cấu hình GEMINI_API_KEY.',
        confidence: 0,
        language: 'vi'
      };
    }

    try {
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: "audio/webm",
            data: audioBase64
          }
        },
        { text: "Please transcribe this audio accurately in Vietnamese. Return only the text." }
      ]);

      const response = await result.response;
      const text = response.text();

      return {
        text: text.trim(),
        confidence: 0.95, // Gemini doesn't return confidence scores in this mode easily
        language: 'vi'
      };
    } catch (error) {
      console.error('[AI Service] Gemini Transcription Error:', error);
      throw error;
    }
  }

  /**
   * Analyze text content and extract insights
   */
  async analyzeContent(text: string): Promise<AnalysisResult> {
    console.log('[v0] Analyzing content:', text);

    // In production: Use GPT-4, Claude, or similar for analysis
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4',
    //     messages: [{
    //       role: 'system',
    //       content: 'Analyze this work directive and provide structured insights.'
    //     }, {
    //       role: 'user',
    //       content: text
    //     }]
    //   })
    // });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock analysis
    const hasUrgentKeywords = /gấp|khẩn|ngay|hạn|deadline/i.test(text);
    const hasReportKeywords = /báo cáo|report|tổng hợp/i.test(text);

    return {
      summary: 'Nhiệm vụ tạo và gửi báo cáo với deadline cụ thể',
      priority: hasUrgentKeywords ? 'high' : 'medium',
      category: hasReportKeywords ? 'reporting' : 'general',
      suggestedActions: [
        'Tạo outline báo cáo',
        'Thu thập dữ liệu cần thiết',
        'Soát xét và hoàn thiện',
        'Gửi cho người liên quan'
      ],
      sentiment: 'neutral'
    };
  }

  /**
   * Generate productivity insights from historical data
   */
  async generateInsights(data: {
    directives: any[];
    tasks: any[];
    projects: any[];
  }): Promise<ProductivityInsight> {
    console.log('[v0] Generating productivity insights...');

    await new Promise(resolve => setTimeout(resolve, 1500));

    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate average completion time (mock)
    const avgCompletionTime = 3.5; // days

    // Identify bottlenecks
    const bottlenecks: string[] = [];
    const inProgressTasks = data.tasks.filter(t => t.status === 'in_progress');
    if (inProgressTasks.length > totalTasks * 0.5) {
      bottlenecks.push('Quá nhiều công việc đang thực hiện cùng lúc');
    }

    const overdueTasks = data.tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    );
    if (overdueTasks.length > 0) {
      bottlenecks.push(`${overdueTasks.length} công việc đã quá hạn`);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (completionRate < 70) {
      recommendations.push('Tập trung hoàn thành các công việc đang dở dang');
      recommendations.push('Xem xét phân bổ lại nguồn lực');
    }
    if (bottlenecks.length > 0) {
      recommendations.push('Ưu tiên giải quyết các công việc quá hạn');
    }
    recommendations.push('Tăng cường họp sync-up để theo dõi tiến độ');

    return {
      totalTasks,
      completionRate: Math.round(completionRate),
      averageCompletionTime: avgCompletionTime,
      bottlenecks,
      recommendations
    };
  }

  /**
   * Auto-categorize and tag work items
   */
  async categorizeWork(title: string, description: string): Promise<{
    category: string;
    tags: string[];
    estimatedEffort: 'low' | 'medium' | 'high';
  }> {
    console.log('[v0] Categorizing work item...');

    await new Promise(resolve => setTimeout(resolve, 800));

    const text = `${title} ${description}`.toLowerCase();
    
    // Simple keyword-based categorization (in production, use ML model)
    let category = 'general';
    const tags: string[] = [];

    if (text.includes('báo cáo') || text.includes('report')) {
      category = 'reporting';
      tags.push('báo cáo');
    }
    if (text.includes('phát triển') || text.includes('dev') || text.includes('code')) {
      category = 'development';
      tags.push('phát triển');
    }
    if (text.includes('thiết kế') || text.includes('design')) {
      category = 'design';
      tags.push('thiết kế');
    }
    if (text.includes('họp') || text.includes('meeting')) {
      category = 'meeting';
      tags.push('họp');
    }

    const estimatedEffort = text.length > 100 ? 'high' : text.length > 50 ? 'medium' : 'low';

    return {
      category,
      tags: tags.length > 0 ? tags : ['chung'],
      estimatedEffort
    };
  }

  /**
   * Generate weekly/monthly summary report
   */
  async generateReport(period: 'week' | 'month', data: any): Promise<string> {
    console.log('[v0] Generating report for:', period);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const periodText = period === 'week' ? 'tuần' : 'tháng';

    return `# Báo cáo tổng hợp ${periodText}

## Tổng quan
- Tổng số công việc: ${data.tasks?.length || 0}
- Hoàn thành: ${data.tasks?.filter((t: any) => t.status === 'completed').length || 0}
- Đang thực hiện: ${data.tasks?.filter((t: any) => t.status === 'in_progress').length || 0}

## Điểm nổi bật
- Hoàn thành tốt các nhiệm vụ ưu tiên cao
- Dự án chính đang đúng tiến độ
- Cần tăng cường nguồn lực cho Q2

## Kế hoạch tiếp theo
- Tập trung hoàn thành các công việc còn tồn đọng
- Chuẩn bị kế hoạch cho giai đoạn mới
- Đánh giá và điều chỉnh quy trình làm việc

_Báo cáo tự động được tạo bởi AI vào ${new Date().toLocaleString('vi-VN')}_
`;
  }
}

// Singleton instance
export const aiService = new AIService();

/**
 * Setup instructions for AI features:
 * 
 * 1. Choose AI provider (OpenAI, Anthropic, Google AI, etc.)
 * 2. Get API key from provider
 * 3. Add to environment variables:
 *    - OPENAI_API_KEY (for OpenAI)
 *    - ANTHROPIC_API_KEY (for Claude)
 * 4. Install SDK: npm install openai or @anthropic-ai/sdk
 * 5. Update the service methods to use actual API calls
 */
