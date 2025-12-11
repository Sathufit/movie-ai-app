// Google Gemini AI integration

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async summarizeMovie(title: string, overview: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API key is not configured');
    }

    try {
      const prompt = `Provide a concise and engaging summary of the movie "${title}" in 2-3 sentences. Here's the overview: ${overview}. Focus on the main plot points and what makes it interesting, without spoilers.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error: any) {
      console.error('Gemini API error:', error);
      // Throw the original error message for better debugging
      throw error;
    }
  }

  async getMovieRecommendations(
    movieTitle: string,
    genres: string[],
    userPreferences?: string
  ): Promise<string[]> {
    if (!this.model) {
      throw new Error('Gemini API key is not configured');
    }

    try {
      const genresText = genres.join(', ');
      const preferencesText = userPreferences
        ? `User preferences: ${userPreferences}.`
        : '';
      
      const prompt = `Based on the movie "${movieTitle}" which is in the genres: ${genresText}. ${preferencesText} Suggest 5 similar movies that the user might enjoy. Provide only the movie titles, one per line, without numbering or additional text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Split by newlines and filter out empty lines
      const recommendations = text
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      
      return recommendations.slice(0, 5);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate movie recommendations');
    }
  }

  async analyzeMovieThemes(title: string, overview: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API key is not configured');
    }

    try {
      const prompt = `Analyze the main themes and deeper meanings in the movie "${title}". Overview: ${overview}. Provide a thoughtful analysis in 3-4 sentences covering the central themes, symbolism, or social commentary.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to analyze movie themes');
    }
  }

  async generateMovieQuiz(title: string, overview: string): Promise<any[]> {
    if (!this.model) {
      throw new Error('Gemini API key is not configured');
    }

    try {
      const prompt = `Create 3 multiple-choice trivia questions about the movie "${title}". Overview: ${overview}. Format each question as JSON with: question, options (array of 4), and correctAnswer (index 0-3). Return as a JSON array.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
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
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate movie quiz');
    }
  }

  async chatAboutMovie(
    movieTitle: string,
    movieOverview: string,
    userQuestion: string,
    chatHistory?: Array<{ role: string; text: string }>
  ): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API key is not configured');
    }

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

      const result = await this.model.generateContent(context);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async searchMoviesByDescription(description: string): Promise<string[]> {
    if (!this.model) {
      throw new Error('Gemini API key is not configured');
    }

    try {
      const prompt = `Based on this description: "${description}", suggest 8 specific movie titles that match. Consider the mood, genre, themes, time period, or any other details mentioned. Return ONLY the movie titles, one per line, without numbering, explanations, or additional text. Focus on well-known movies that are likely in TMDB database.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Split by newlines and clean up
      const movies = text
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && !line.match(/^\d+\./)) // Remove numbered lines
        .slice(0, 8);
      
      return movies;
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
