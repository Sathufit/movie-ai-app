// Groq AI integration

import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

class GroqService {
  private groq: Groq | null = null;
  private model: string = 'llama-3.3-70b-versatile'; // Fast and capable model

  constructor() {
    if (GROQ_API_KEY) {
      this.groq = new Groq({
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });
    }
  }

  private async generateCompletion(prompt: string): Promise<string> {
    if (!this.groq) {
      throw new Error('Groq API key is not configured');
    }

    const completion = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.model,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async summarizeMovie(title: string, overview: string): Promise<string> {
    try {
      const prompt = `Provide a concise and engaging summary of the movie "${title}" in 2-3 sentences. Here's the overview: ${overview}. Focus on the main plot points and what makes it interesting, without spoilers.`;
      return await this.generateCompletion(prompt);
    } catch (error: any) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  async getMovieRecommendations(
    movieTitle: string,
    genres: string[],
    userPreferences?: string
  ): Promise<string[]> {
    try {
      const genresText = genres.join(', ');
      const preferencesText = userPreferences
        ? `User preferences: ${userPreferences}.`
        : '';
      
      const prompt = `Based on the movie "${movieTitle}" which is in the genres: ${genresText}. ${preferencesText} Suggest 5 similar movies that the user might enjoy. Provide only the movie titles, one per line, without numbering or additional text.`;

      const text = await this.generateCompletion(prompt);
      
      // Split by newlines and filter out empty lines
      const recommendations = text
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      
      return recommendations.slice(0, 5);
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to generate movie recommendations');
    }
  }

  async analyzeMovieThemes(title: string, overview: string): Promise<string> {
    try {
      const prompt = `Analyze the main themes and deeper meanings in the movie "${title}". Overview: ${overview}. Provide a thoughtful analysis in 3-4 sentences covering the central themes, symbolism, or social commentary.`;
      return await this.generateCompletion(prompt);
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to analyze movie themes');
    }
  }

  async generateMovieQuiz(title: string, overview: string): Promise<any[]> {
    try {
      const prompt = `Create 3 multiple-choice trivia questions about the movie "${title}". Overview: ${overview}. Format each question as JSON with: question, options (array of 4), and correctAnswer (index 0-3). Return as a JSON array.`;

      const text = await this.generateCompletion(prompt);
      
      // Try to parse JSON, with fallback
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse quiz JSON:', parseError);
      }
      
      return [];
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to generate movie quiz');
    }
  }

  async chatAboutMovie(
    movieTitle: string,
    movieOverview: string,
    userQuestion: string,
    chatHistory?: Array<{ role: string; text: string }>
  ): Promise<string> {
    try {
      // Build context with movie info and chat history
      let context = `You are a knowledgeable movie expert assistant. You're discussing the movie "${movieTitle}". Here's the overview: ${movieOverview}.\n\n`;
      
      if (chatHistory && chatHistory.length > 0) {
        context += 'Previous conversation:\n';
        chatHistory.forEach((msg) => {
          context += `${msg.role}: ${msg.text}\n`;
        });
        context += '\n';
      }
      
      context += `User question: ${userQuestion}\n\nProvide a helpful, informative response about the movie. Keep it concise (2-4 sentences) and accurate.`;

      return await this.generateCompletion(context);
    } catch (error: any) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  async searchMoviesByDescription(description: string): Promise<string[]> {
    try {
      const prompt = `Based on this description: "${description}", suggest 8 specific movie titles that match. Consider the mood, genre, themes, time period, or any other details mentioned. Return ONLY the movie titles, one per line, without numbering, explanations, or additional text. Focus on well-known movies that are likely in TMDB database.`;

      const text = await this.generateCompletion(prompt);
      
      // Split by newlines and clean up
      const movies = text
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && !line.match(/^\d+\./)) // Remove numbered lines
        .slice(0, 8);
      
      return movies;
    } catch (error: any) {
      console.error('Groq API error:', error);
      throw error;
    }
  }
}

export const geminiService = new GroqService();
