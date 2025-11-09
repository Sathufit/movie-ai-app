'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { tmdbApi } from '@/lib/tmdb';
import { geminiService } from '@/lib/gemini';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export default function StatusPage() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    const testResults: TestResult[] = [];

    // Test 1: Check TMDB API Key
    try {
      await tmdbApi.getTrending('week');
      testResults.push({
        name: 'TMDB API Key',
        status: 'success',
        message: 'TMDB API is configured and working correctly',
      });
    } catch (error) {
      testResults.push({
        name: 'TMDB API Key',
        status: 'error',
        message: 'TMDB API key is missing or invalid. Please check your .env.local file',
      });
    }
    setResults([...testResults]);

    // Test 2: Check Gemini API Key
    try {
      await geminiService.summarizeMovie(
        'Test Movie',
        'This is a test description'
      );
      testResults.push({
        name: 'Gemini API Key',
        status: 'success',
        message: 'Gemini API is configured and working correctly',
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      testResults.push({
        name: 'Gemini API Key',
        status: 'error',
        message: `Gemini API error: ${errorMessage}. Please check your API key at https://makersuite.google.com/app/apikey`,
      });
    }
    setResults([...testResults]);

    // Test 3: Check Image Loading
    // First, get a real movie poster path from the API to test with
    try {
      const trendingResponse = await tmdbApi.getTrending('week');
      const firstMovie = trendingResponse.results[0];
      
      if (firstMovie?.poster_path) {
        // Test loading an actual TMDB image
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          let settled = false;
          const timeout = setTimeout(() => {
            if (!settled) {
              settled = true;
              reject(new Error('Image load timeout'));
            }
          }, 8000);

          img.onload = () => {
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              resolve();
            }
          };
          img.onerror = () => {
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              reject(new Error('Image failed to load'));
            }
          };

          // Use a real poster path from TMDB
          img.src = `https://image.tmdb.org/t/p/w92${firstMovie.poster_path}`;
        });

        testResults.push({
          name: 'Image CDN',
          status: 'success',
          message: 'TMDB image CDN is accessible and images load successfully',
        });
      } else {
        throw new Error('No poster path available to test');
      }
    } catch (error: any) {
      testResults.push({
        name: 'Image CDN',
        status: 'error',
        message:
          error?.message?.includes('timeout') || error?.message?.includes('failed to load')
            ? 'Unable to load images from TMDB CDN. Check your internet connection or firewall settings.'
            : 'Unable to test image CDN (API may have failed)',
      });
    }
    setResults([...testResults]);

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">System Status</h1>
          <p className="text-zinc-400 mb-8">
            Check if your API keys are configured correctly
          </p>

          <button
            onClick={runTests}
            disabled={testing}
            className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-8"
          >
            {testing ? 'Running Tests...' : 'Run Tests'}
          </button>

          <div className="space-y-4">
            {results.map((result, index) => (
              <motion.div
                key={result.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {result.name}
                    </h3>
                    <p className="text-zinc-400">{result.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {results.length === 0 && !testing && (
            <div className="text-center text-zinc-500 py-12">
              Click "Run Tests" to check your configuration
            </div>
          )}

          {results.length > 0 && !testing && (
            <div className="mt-8 p-6 bg-zinc-800/30 rounded-xl border border-zinc-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                Configuration Help
              </h3>
              <div className="text-zinc-400 space-y-2 text-sm">
                <p>
                  If any tests failed, please check your <code className="bg-zinc-800 px-2 py-1 rounded">.env.local</code> file:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>TMDB API Key: Get it from <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">themoviedb.org</a></li>
                  <li>Gemini API Key: Get it from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google AI Studio</a></li>
                </ul>
                <p className="mt-4">
                  After updating your .env.local file, restart the development server.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
