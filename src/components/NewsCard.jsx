// src/components/NewsCard.jsx
import { motion } from 'framer-motion';
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import GlassCard from './GlassCard';
const NewsCard = ({ article, index }) => {
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-500/30 bg-green-900/10';
      case 'negative':
        return 'border-red-500/30 bg-red-900/10';
      default:
        return 'border-gray-500/30 bg-gray-900/10';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now - published;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return published.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <GlassCard className="p-6 h-full cursor-pointer group hover:border-blue-500/40 transition-all duration-300">
        <div className="flex flex-col h-full">
          {/* Image from NewsAPI */}
          {article.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(article.sentiment)}`}>
              <div className="flex items-center gap-1">
                {getSentimentIcon(article.sentiment)}
                <span className="capitalize">{article.sentiment}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className="font-bold text-lg text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-300 leading-tight">
              {article.title}
            </h4>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {article.summary}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800/40">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">{article.source}</span>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs text-gray-500">{article.category}</span>
            </div>
            {article.url !== '#' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(article.url, '_blank');
                }}
                className="p-2 rounded-full hover:bg-blue-500/20 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </motion.button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default NewsCard;
