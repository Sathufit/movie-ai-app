import { Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-red-600 rounded-full mb-6">
          <Film className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
