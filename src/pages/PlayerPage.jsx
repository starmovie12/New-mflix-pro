import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiArrowLeft, HiCog6Tooth, HiArrowsPointingOut, HiArrowsPointingIn,
  HiPlay, HiPause, HiForward, HiBackward, HiSpeakerWave, HiSpeakerXMark,
  HiStar, HiClock, HiFilm, HiShieldCheck, HiCalendar,
  HiPlus, HiCheck, HiHandThumbUp, HiHandThumbDown, HiShare,
  HiFlag, HiArrowDownTray, HiChevronDown, HiChevronUp,
  HiPlayCircle, HiXMark, HiListBullet, HiBookmark
} from 'react-icons/hi2';
import useStore from '../store/useStore';
import { FALLBACK_POSTER } from '../utils/constants';
import { formatDuration, getContentType, timeAgo } from '../utils/helpers';
import MovieCard from '../components/MovieCard';
import { DetailSkeleton, MovieGridSkeleton } from '../components/Skeleton';

export default function PlayerPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'movie';

  const {
    fetchMovieById, allMovies, fetchAllMovies,
    addToWatchlist, removeFromWatchlist, isInWatchlist,
    addToWatchHistory, updateContinueWatching,
    toggleLike, isLiked,
  } = useStore();

  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [objectFit, setObjectFit] = useState('contain');
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [expandSynopsis, setExpandSynopsis] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(null);

  const videoRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const progressTimerRef = useRef(null);

  // Normalize data
  const normalizeData = useCallback((data) => {
    const isSeries = data.content_type === 'series' || data.type === 'series' || (data.seasons && data.seasons.length > 0);
    const title = data.title || data.original_title || 'Untitled';
    const qualityName = data.quality_name || 'HD';
    const year = String(data.release_year || data.year || '2024');
    const genre = Array.isArray(data.genre) ? data.genre.join(', ') : (data.genre || 'Drama');
    const runtime = data.runtime ? formatDuration(parseInt(data.runtime)) : 'N/A';

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
              info: item.size || ''
            });
          }
        });
      }
    }

    return {
      ...data,
      isSeries,
      title,
      qualityName,
      year,
      genre,
      runtime,
      cert: data.certification || 'UA',
      rating: data.rating || '0.0',
      plot: data.description || data.overview || 'No synopsis available.',
      poster: data.poster || FALLBACK_POSTER,
      backdrop: data.backdrop || data.poster || FALLBACK_POSTER,
      links,
      seasons: data.seasons || [],
      cast: data.cast || '',
      director: data.director || '',
      writer: data.writer || '',
      industry: data.industry || '',
      platform: data.platform || '',
      spoken_languages: data.spoken_languages || data.original_language || '',
    };
  }, []);

  useEffect(() => {
    const loadMovie = async () => {
      setLoading(true);
      const data = await fetchMovieById(id);
      if (data) {
        const normalized = normalizeData(data);
        setMovieData(normalized);
        addToWatchHistory(data);

        if (normalized.isSeries) {
          if (normalized.seasons?.[0]?.episodes?.[0]) {
            const firstEp = normalized.seasons[0].episodes[0];
            setVideoUrl(firstEp.url || firstEp.link || '');
            setCurrentEpisode({ season: 0, episode: 0 });
          }
        } else if (normalized.links.length > 0) {
          setVideoUrl(normalized.links[0].url);
        }
      }
      setLoading(false);
    };
    loadMovie();
    if (allMovies.length === 0) fetchAllMovies();
    window.scrollTo(0, 0);
  }, [id]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoadedMetadata = () => setDuration(video.duration);
    const onTimeUpdate = () => setCurTime(video.currentTime);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [videoUrl]);

  // Save progress periodically
  useEffect(() => {
    if (!movieData || !videoRef.current) return;
    progressTimerRef.current = setInterval(() => {
      const v = videoRef.current;
      if (v && v.duration > 0) {
        updateContinueWatching(movieData, v.currentTime / v.duration, v.duration);
      }
    }, 10000);
    return () => clearInterval(progressTimerRef.current);
  }, [movieData]);

  // Auto-hide controls
  const resetControlsTimer = () => {
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const playNewUrl = (url) => {
    if (!url || !videoRef.current) return;
    setVideoUrl(url);
    videoRef.current.src = url;
    videoRef.current.load();
    videoRef.current.play().catch(() => {});
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration;
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  };

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    setShowSpeedMenu(false);
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Watch ${movieData?.title} on MFLIX`;
    if (navigator.share) {
      try { await navigator.share({ title: text, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const inWatchlist = movieData ? isInWatchlist(movieData.movie_id) : false;
  const liked = movieData ? isLiked(movieData.movie_id) : false;

  // Related movies
  const relatedMovies = allMovies
    .filter(m => m.movie_id !== id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 12);

  return (
    <>
      <Helmet>
        <title>{movieData ? `${movieData.title} - MFLIX` : 'Loading... - MFLIX'}</title>
        {movieData && <meta name="description" content={`Watch ${movieData.title} (${movieData.year}) in ${movieData.qualityName} quality on MFLIX.`} />}
      </Helmet>

      <div className="min-h-screen bg-bg-base">
        {/* Video Player */}
        <div
          className="relative w-full aspect-video bg-black sticky top-0 z-30"
          onClick={resetControlsTimer}
          onMouseMove={resetControlsTimer}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            style={{ objectFit }}
            autoPlay
            playsInline
            poster={movieData?.backdrop}
          />

          {/* Video Controls Overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col justify-between"
              >
                {/* Top Bar */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent">
                  <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <HiArrowLeft className="text-lg" />
                  </button>
                  <div className="flex items-center gap-2">
                    {/* Speed */}
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                        className="h-8 px-2.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 hover:bg-white/20"
                      >
                        {playbackSpeed}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute top-full right-0 mt-1 bg-bg-elevated border border-border rounded-lg overflow-hidden z-50 min-w-[100px]">
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(s => (
                            <button
                              key={s}
                              onClick={(e) => { e.stopPropagation(); changeSpeed(s); }}
                              className={`block w-full px-3 py-2 text-xs text-left hover:bg-bg-hover transition-colors ${
                                playbackSpeed === s ? 'text-primary font-bold' : 'text-white'
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Quality */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowQualityMenu(!showQualityMenu); }}
                      className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20"
                    >
                      <HiCog6Tooth className="text-lg" />
                    </button>
                    {/* Fit Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setObjectFit(objectFit === 'contain' ? 'cover' : 'contain');
                      }}
                      className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20"
                    >
                      {objectFit === 'contain' ? <HiArrowsPointingOut className="text-lg" /> : <HiArrowsPointingIn className="text-lg" />}
                    </button>
                  </div>
                </div>

                {/* Center Controls */}
                <div className="flex items-center justify-center gap-8">
                  <button onClick={(e) => { e.stopPropagation(); skip(-10); }} className="text-white/80 hover:text-white active:scale-90 transition-all">
                    <HiBackward className="text-3xl" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 active:scale-90 transition-all"
                  >
                    {isPlaying ? <HiPause className="text-3xl" /> : <HiPlay className="text-3xl ml-1" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); skip(10); }} className="text-white/80 hover:text-white active:scale-90 transition-all">
                    <HiForward className="text-3xl" />
                  </button>
                </div>

                {/* Bottom Progress */}
                <div className="p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <div
                    className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group mb-2"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-primary rounded-full relative group-hover:h-2 transition-all"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/70 font-mono">{formatTime(currentTime)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); if(videoRef.current) videoRef.current.muted = !isMuted; }}
                        className="text-white/70 hover:text-white"
                      >
                        {isMuted ? <HiSpeakerXMark className="text-lg" /> : <HiSpeakerWave className="text-lg" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-white/70 font-mono">{formatTime(duration)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto pb-20">
          {loading ? (
            <DetailSkeleton />
          ) : movieData ? (
            <div className="p-4">
              {/* Title */}
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight flex-1">
                  {movieData.title}
                </h1>
                <span className="flex-shrink-0 px-2 py-0.5 bg-primary text-white text-[11px] font-bold rounded mt-1">
                  {movieData.qualityName}
                </span>
              </div>

              {/* Meta Pills */}
              <div className="flex flex-wrap gap-2 mb-4 mt-3">
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-text-secondary border border-border">
                  <HiShieldCheck className="text-sm" /> {movieData.cert}
                </span>
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-text-secondary border border-border">
                  <HiStar className="text-accent-gold text-sm" /> {movieData.rating}
                </span>
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-text-secondary border border-border">
                  <HiCalendar className="text-sm" /> {movieData.year}
                </span>
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-text-secondary border border-border">
                  <HiFilm className="text-sm" /> {movieData.genre}
                </span>
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-text-secondary border border-border">
                  <HiClock className="text-sm" /> {movieData.runtime}
                </span>
              </div>

              <div className="h-px bg-border my-4" />

              {/* Action Buttons */}
              <div className="space-y-3 mb-4">
                {movieData.isSeries ? (
                  <button
                    onClick={() => setShowEpisodes(true)}
                    className="w-full flex items-center justify-center gap-2 h-12 bg-accent-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-colors active:scale-[0.98] shadow-lg shadow-blue-500/20"
                  >
                    <HiListBullet className="text-xl" /> View Episodes
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <button
                        onClick={() => setShowPlayMenu(!showPlayMenu)}
                        className="w-full flex items-center justify-center gap-2 h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors active:scale-[0.98] shadow-lg shadow-primary/30"
                      >
                        <HiPlay className="text-xl" /> Play Movie
                      </button>
                      <AnimatePresence>
                        {showPlayMenu && movieData.links.length > 1 && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-border rounded-xl overflow-hidden z-20 shadow-xl"
                          >
                            {movieData.links.map((link, i) => (
                              <button
                                key={i}
                                onClick={() => { playNewUrl(link.url); setShowPlayMenu(false); }}
                                className="w-full px-4 py-3 text-sm text-left text-white hover:bg-bg-hover transition-colors border-b border-border/50 last:border-0 flex items-center justify-between"
                              >
                                <span>Play {link.label}</span>
                                {link.info && <span className="text-xs text-text-muted">{link.info}</span>}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                        className="w-12 h-12 flex items-center justify-center bg-bg-elevated hover:bg-bg-hover text-white rounded-xl border border-border transition-colors"
                      >
                        <HiArrowDownTray className="text-xl" />
                      </button>
                      <AnimatePresence>
                        {showDownloadMenu && movieData.links.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute top-full right-0 mt-1 bg-bg-elevated border border-border rounded-xl overflow-hidden z-20 shadow-xl min-w-[160px]"
                          >
                            {movieData.links.map((link, i) => (
                              <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-3 text-sm text-white hover:bg-bg-hover transition-colors border-b border-border/50 last:border-0"
                              >
                                {link.label} {link.info && `(${link.info})`}
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Actions */}
              <div className="flex items-center justify-around py-3 border-y border-border">
                <button
                  onClick={() => {
                    if (inWatchlist) removeFromWatchlist(movieData.movie_id);
                    else addToWatchlist(movieData);
                  }}
                  className="flex flex-col items-center gap-1 text-text-secondary hover:text-white transition-colors"
                >
                  {inWatchlist ? <HiCheck className="text-xl text-green-400" /> : <HiPlus className="text-xl" />}
                  <span className="text-[10px] font-medium">{inWatchlist ? 'Added' : 'My List'}</span>
                </button>
                <button
                  onClick={() => movieData && toggleLike(movieData.movie_id)}
                  className="flex flex-col items-center gap-1 text-text-secondary hover:text-white transition-colors"
                >
                  <HiHandThumbUp className={`text-xl ${liked ? 'text-primary' : ''}`} />
                  <span className="text-[10px] font-medium">Like</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 text-text-secondary hover:text-white transition-colors"
                >
                  <HiShare className="text-xl" />
                  <span className="text-[10px] font-medium">Share</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-text-secondary hover:text-white transition-colors">
                  <HiFlag className="text-xl" />
                  <span className="text-[10px] font-medium">Report</span>
                </button>
              </div>

              {/* Synopsis */}
              <div className="my-4">
                <h2 className="text-sm font-bold text-white mb-2">Synopsis</h2>
                <p className={`text-sm leading-relaxed text-text-secondary ${!expandSynopsis ? 'line-clamp-3' : ''}`}>
                  {movieData.plot}
                </p>
                {movieData.plot.length > 150 && (
                  <button
                    onClick={() => setExpandSynopsis(!expandSynopsis)}
                    className="flex items-center gap-1 text-xs text-primary font-semibold mt-1"
                  >
                    {expandSynopsis ? 'Show Less' : 'Read More'}
                    {expandSynopsis ? <HiChevronUp /> : <HiChevronDown />}
                  </button>
                )}
              </div>

              {/* Movie Details */}
              <div className="space-y-2 mb-6 p-4 rounded-xl bg-white/[0.02] border border-border">
                {movieData.cast && (
                  <div className="flex">
                    <span className="text-xs font-bold text-text-muted w-24 flex-shrink-0">Cast</span>
                    <span className="text-xs text-text-secondary flex-1">{movieData.cast}</span>
                  </div>
                )}
                {movieData.director && (
                  <div className="flex">
                    <span className="text-xs font-bold text-text-muted w-24 flex-shrink-0">Director</span>
                    <span className="text-xs text-text-secondary flex-1">{movieData.director}</span>
                  </div>
                )}
                {movieData.writer && (
                  <div className="flex">
                    <span className="text-xs font-bold text-text-muted w-24 flex-shrink-0">Writer</span>
                    <span className="text-xs text-text-secondary flex-1">{movieData.writer}</span>
                  </div>
                )}
                {movieData.industry && (
                  <div className="flex">
                    <span className="text-xs font-bold text-text-muted w-24 flex-shrink-0">Industry</span>
                    <span className="text-xs text-text-secondary flex-1">{movieData.industry}</span>
                  </div>
                )}
                {movieData.platform && (
                  <div className="flex">
                    <span className="text-xs font-bold text-text-muted w-24 flex-shrink-0">Platform</span>
                    <span className="text-xs text-text-secondary flex-1">{movieData.platform}</span>
                  </div>
                )}
                {movieData.spoken_languages && (
                  <div className="flex">
                    <span className="text-xs font-bold text-text-muted w-24 flex-shrink-0">Language</span>
                    <span className="text-xs text-text-secondary flex-1">{movieData.spoken_languages}</span>
                  </div>
                )}
              </div>

              {/* Related Content */}
              <div className="mt-6">
                <h2 className="text-base font-bold text-white mb-4">More Like This</h2>
                {relatedMovies.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {relatedMovies.map((movie, idx) => (
                      <MovieCard key={movie.movie_id || idx} item={movie} index={idx} />
                    ))}
                  </div>
                ) : (
                  <MovieGridSkeleton count={6} />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <HiFilm className="text-5xl text-text-muted mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">Content Not Found</h2>
              <p className="text-sm text-text-muted mb-4">The content you're looking for doesn't exist.</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg"
              >
                Go Home
              </button>
            </div>
          )}
        </div>

        {/* Episodes Overlay */}
        <AnimatePresence>
          {showEpisodes && movieData?.isSeries && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-bg-elevated">
                <h3 className="text-lg font-bold text-white">Episodes</h3>
                <button
                  onClick={() => setShowEpisodes(false)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                >
                  <HiXMark className="text-xl" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {movieData.seasons.length === 0 ? (
                  <p className="text-center text-text-muted py-10">No episodes found.</p>
                ) : (
                  movieData.seasons.map((season, sIdx) => (
                    <div key={sIdx} className="mb-6">
                      <h4 className="text-accent-gold font-bold text-base mb-3">
                        {season.name || `Season ${sIdx + 1}`}
                      </h4>
                      <div className="space-y-2">
                        {season.episodes?.map((ep, eIdx) => {
                          const isActive = currentEpisode?.season === sIdx && currentEpisode?.episode === eIdx;
                          return (
                            <button
                              key={eIdx}
                              onClick={() => {
                                playNewUrl(ep.url || ep.link);
                                setCurrentEpisode({ season: sIdx, episode: eIdx });
                                setShowEpisodes(false);
                              }}
                              className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-colors text-left ${
                                isActive
                                  ? 'bg-primary/10 border-primary/50'
                                  : 'bg-bg-elevated border-border hover:bg-bg-hover'
                              }`}
                            >
                              <span className="text-sm font-bold text-text-muted w-7 text-center">{eIdx + 1}</span>
                              <span className="flex-1 text-sm font-medium text-white truncate">
                                {ep.title || `Episode ${eIdx + 1}`}
                              </span>
                              <HiPlayCircle className={`text-xl flex-shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
