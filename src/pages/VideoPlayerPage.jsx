import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, limitToLast } from 'firebase/database';
import { database } from '../lib/firebase';
import { useMovies } from '../context/MovieContext';
import {
  ArrowLeft,
  Play,
  Download,
  Share2,
  Heart,
  Flag,
  Plus,
  ThumbsUp,
  Settings,
  Maximize2,
  Layers,
  Star,
  Calendar,
  Film,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

function normalizeData(data) {
  const isSeries = data.content_type === 'series' || data.type === 'series' || (data.seasons && data.seasons.length > 0);
  const title = data.title || data.original_title || 'Untitled';
  const qualityName = data.quality_name || 'HD';
  const year = (data.release_year || data.year || '2024').toString();
  const genre = Array.isArray(data.genre) ? data.genre.join(', ') : (data.genre || 'Drama');
  const runtime = data.runtime ? data.runtime + 'm' : 'N/A';

  let links = [];
  if (!isSeries) {
    let rawLinks = data.download_links || data.qualities;
    if (typeof rawLinks === 'string') {
      try { rawLinks = JSON.parse(rawLinks); } catch { rawLinks = []; }
    }
    if (rawLinks) {
      const arr = Array.isArray(rawLinks) ? rawLinks : Object.values(rawLinks);
      arr.forEach(item => {
        if (item.url || item.link || item.movie_link) {
          links.push({
            url: item.url || item.link || item.movie_link,
            label: item.quality || 'HD',
            info: item.size || '',
          });
        }
      });
    }
  }

  return {
    isSeries,
    title,
    qualityName,
    year,
    genre,
    runtime,
    cert: data.certification || 'UA',
    rating: data.rating || '0.0',
    plot: data.description || data.overview || 'No synopsis available.',
    links,
    seasons: data.seasons || [],
    poster: data.poster,
    cast: data.cast,
    director: data.director,
  };
}

function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [related, setRelated] = useState([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const { addToHistory, addToContinue, toggleFavorite, isFavorite, getMovieById } = useMovies();

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    get(ref(database, `movies_by_id/${id}`)).then(snap => {
      if (snap.exists()) {
        const raw = { ...snap.val(), movie_id: id };
        setData(normalizeData(raw));
        addToHistory(raw);
      } else {
        setData(null);
      }
      setLoading(false);
    });
  }, [id, navigate, addToHistory]);

  useEffect(() => {
    get(limitToLast(ref(database, 'movies_by_id'), 12)).then(snap => {
      const items = [];
      snap.forEach(child => items.push({ ...child.val(), movie_id: child.key }));
      setRelated(items.reverse());
    });
  }, []);

  const playVideo = (url) => {
    if (!url) return;
    setCurrentVideoUrl(url);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = url;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !data || !videoRef.current.duration) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    addToContinue({ ...data, movie_id: id, title: data.title, poster: data.poster, category: data.isSeries ? 'series' : 'movie' }, progress);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mflix-dark flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-mflix-red border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-mflix-dark flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Content not found</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-mflix-red rounded-lg">
          Go Home
        </button>
      </div>
    );
  }

  useEffect(() => {
    if (!data) return;
    const firstUrl = data.isSeries && data.seasons?.[0]?.episodes?.[0]
      ? data.seasons[0].episodes[0].url || data.seasons[0].episodes[0].link
      : data.links[0]?.url;
    if (firstUrl) {
      setCurrentVideoUrl(firstUrl);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.src = firstUrl;
          videoRef.current.load();
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    }
  }, [data]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: data.title,
        text: `Watch ${data.title} on MFLIX`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-mflix-dark flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <div className="relative">
              <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                <Settings className="w-5 h-5" />
              </button>
              {showQualityMenu && (
                <div className="absolute top-12 right-0 bg-black/95 rounded-lg border border-white/10 min-w-[140px] py-2">
                  {data.links?.map((link, i) => (
                    <button key={i} onClick={() => { playVideo(link.url); setShowQualityMenu(false); }} className="w-full px-4 py-2 text-left hover:bg-white/10">
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => videoRef.current?.requestFullscreen?.()} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black flex-shrink-0">
        <video
          ref={videoRef}
          controls
          autoPlay
          playsInline
          poster={data.poster}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          src={currentVideoUrl}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{data.title}</h1>
            <span className="px-2 py-0.5 bg-mflix-red text-white text-xs font-bold rounded">{data.qualityName}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm flex items-center gap-2">
              <span>{data.cert}</span>
            </span>
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {data.rating}
            </span>
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {data.year}
            </span>
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm flex items-center gap-2">
              <Film className="w-4 h-4" /> {data.genre}
            </span>
            <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> {data.runtime}
            </span>
          </div>

          <div className={`grid gap-3 mb-6 ${data.isSeries ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-[1fr_auto]'}`}>
            {!data.isSeries && (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowPlayMenu(!showPlayMenu)}
                    className="w-full py-3 px-4 bg-mflix-red rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-white" /> Play Movie
                  </button>
                  {showPlayMenu && data.links?.length > 1 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 rounded-lg border border-white/10 overflow-hidden">
                      {data.links.map((link, i) => (
                        <button key={i} onClick={() => { playVideo(link.url); setShowPlayMenu(false); }} className="w-full px-4 py-3 text-left hover:bg-white/10">
                          Play {link.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button onClick={() => setShowDownloadMenu(!showDownloadMenu)} className="p-3 bg-gray-700 rounded-lg">
                    <Download className="w-6 h-6" />
                  </button>
                  {showDownloadMenu && (
                    <div className="absolute top-full right-0 mt-1 bg-black/95 rounded-lg border border-white/10 min-w-[160px] overflow-hidden">
                      {data.links.map((link, i) => (
                        <button key={i} onClick={() => window.open(link.url, '_blank')} className="w-full px-4 py-3 text-left hover:bg-white/10">
                          {link.label} {link.info}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            {data.isSeries && (
              <button
                onClick={() => setShowEpisodes(true)}
                className="w-full py-3 px-4 bg-blue-600 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Layers className="w-5 h-5" /> View Episodes
              </button>
            )}
          </div>

          <div className="flex justify-around py-4 border-y border-white/10 mb-6">
            <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-white">
              <Plus className="w-6 h-6" /> <span className="text-xs">My List</span>
            </button>
            <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-white">
              <ThumbsUp className="w-6 h-6" /> <span className="text-xs">Like</span>
            </button>
            <button onClick={handleShare} className="flex flex-col items-center gap-2 text-gray-400 hover:text-white">
              <Share2 className="w-6 h-6" /> <span className="text-xs">Share</span>
            </button>
            <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-white">
              <Flag className="w-6 h-6" /> <span className="text-xs">Report</span>
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
            <p className="text-gray-300 leading-relaxed">{data.plot}</p>
          </div>

          <h3 className="text-lg font-semibold text-white mb-4">More Like This</h3>
          <div className="grid grid-cols-3 gap-4">
            {related.filter(m => m.movie_id !== id).slice(0, 6).map(m => {
              const type = (m.category && m.category.toLowerCase().includes('series')) ? 'tv' : 'movie';
              return (
                <div
                  key={m.movie_id}
                  onClick={() => navigate(`/watch/${m.movie_id}?type=${type}`)}
                  className="cursor-pointer group"
                >
                  <div className="aspect-video rounded-lg overflow-hidden bg-mflix-card">
                    <img src={m.poster || ''} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-sm text-gray-300 mt-1 truncate">{m.title}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {showEpisodes && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <h3 className="text-xl font-bold">Episodes</h3>
            <button onClick={() => setShowEpisodes(false)} className="p-2 text-2xl">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {data.seasons?.map((season, sIdx) => (
              <div key={sIdx} className="mb-6">
                <h4 className="text-yellow-500 font-bold mb-3">{season.name || `Season ${sIdx + 1}`}</h4>
                {season.episodes?.map((ep, eIdx) => (
                  <div
                    key={eIdx}
                    onClick={() => { playVideo(ep.url || ep.link); setShowEpisodes(false); }}
                    className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg mb-2 cursor-pointer hover:bg-gray-700"
                  >
                    <span className="text-gray-400 font-bold w-6">{eIdx + 1}</span>
                    <span className="flex-1 font-medium">{ep.title || `Episode ${eIdx + 1}`}</span>
                    <Play className="w-5 h-5 text-mflix-red fill-mflix-red" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayerPage;
