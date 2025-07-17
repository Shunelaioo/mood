import React, { useState, useMemo, useId } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar as CalendarIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  Heart,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface MoodEntry {
  id: string;
  mood: string;
  emoji: string;
  feelings_text: string;
  weather?: string;
  theme?: string;
  message?: string;
  suggested_activities?: any;
  created_at: string; // ISO timestamp
}

interface ChartData {
  date: string;
  mood: number;
  weather: string;
  formattedDate: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const FALLBACK_EMOJI_BY_SCORE: Record<number, string> = {
  1: '😭',
  2: '😢',
  3: '😔',
  4: '🙁',
  5: '😐',
  6: '🙂',
  7: '😊',
  8: '😄',
  9: '🤩',
  10: '🌟',
};

function daysAgo(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return d;
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

const History: React.FC = () => {
  const { user } = useAuth();

  const [viewType, setViewType] = useState<'line' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  /* ----- Data Fetch ----- */
  const {
    data: moodEntries = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mood-entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mood entries:', error);
        throw error;
      }
      return data as MoodEntry[];
    },
    enabled: !!user,
  });

  /* ----- Mood Score ----- */
  const getMoodScore = (mood: string): number => {
    const moodMap: { [key: string]: number } = {
      terrible: 1,
      bad: 2,
      poor: 3,
      okay: 4,
      neutral: 5,
      good: 6,
      great: 7,
      excellent: 8,
      amazing: 9,
      perfect: 10,
    };
    return moodMap[mood?.toLowerCase?.()] ?? 5;
  };

  /* ----- Filter by Selected Time Range ----- */
  const filteredEntries = useMemo(() => {
    if (!moodEntries.length) return [];
    const now = new Date();
    let cutoff: Date;

    switch (timeRange) {
      case 'week':
        cutoff = daysAgo(now, 7);
        break;
      case 'month':
        cutoff = daysAgo(now, 30);
        break;
      case 'year':
        cutoff = daysAgo(now, 365);
        break;
      default:
        cutoff = daysAgo(now, 30);
    }

    return moodEntries.filter((e) => new Date(e.created_at) >= cutoff);
  }, [moodEntries, timeRange]);

  /* ----- Chart Data from Filtered Entries ----- */
  const chartData: ChartData[] = useMemo(
    () =>
      filteredEntries
        .map((entry) => ({
          date: entry.created_at,
          mood: getMoodScore(entry.mood),
          weather: entry.weather || 'unknown',
          formattedDate: new Date(entry.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        }))
        .reverse(),
    [filteredEntries]
  );

  /* ----- Stats ----- */
  const avgMoodNum = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((acc, day) => acc + day.mood, 0) / chartData.length;
  }, [chartData]);

  const getAverageMood = () => avgMoodNum.toFixed(1);

  const getTrend = () => {
    if (chartData.length < 7) return 'stable';
    const recent = chartData.slice(-7);
    const older = chartData.slice(-14, -7);
    if (!older.length) return 'stable';
    const recentAvg = recent.reduce((acc, d) => acc + d.mood, 0) / recent.length;
    const olderAvg = older.reduce((acc, d) => acc + d.mood, 0) / older.length;
    return recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';
  };

  /* ----- Calendar Helpers ----- */
  const getMoodData = (date: Date) => {
    const entry = moodEntries.find((e) => {
      const d = new Date(e.created_at);
      return isSameDay(d, date);
    });
    if (!entry) return null;
    const score = getMoodScore(entry.mood);
    const emoji = entry.emoji || FALLBACK_EMOJI_BY_SCORE[Math.round(score)] || '●';
    return {
      mood: score,
      emoji,
      moodText: entry.mood,
    };
  };

  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, monthIndex, day));
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      direction === 'prev' ? newMonth.setMonth(prev.getMonth() - 1) : newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  /* ----- Calendar Dot Color ----- */
  const getMoodDotClass = (score: number) => {
    if (score <= 2) return 'text-red-400 dark:text-rose-200';
    if (score <= 4) return 'text-orange-400 dark:text-amber-200';
    if (score <= 6) return 'text-yellow-500 dark:text-purple-200';
    if (score <= 8) return 'text-emerald-500 dark:text-emerald-200';
    return 'text-teal-500 dark:text-fuchsia-200';
  };

  /* ----- Chart Gradient IDs ----- */
  const gradientLineId = useId();
  const gradientBarId = useId();

  /* ------------------------------------------------------------------ */
  /* Early Return States                                                */
  /* ------------------------------------------------------------------ */

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white/80 backdrop-blur-lg border-white/50 transition-colors bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 text-gray-800 dark:text-white"
      >
        <span className="text-gray-800 dark:text-white">Please log in to view your mood history.</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white/80 backdrop-blur-lg border-white/50 transition-colors bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-pink-900"
      >
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white/80 backdrop-blur-lg border-white/50 transition-colors bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-pink-900"
      >
        <span className="text-red-500">Error loading mood history.</span>
      </div>
    );
  }

  if (moodEntries.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-12 bg-white/80 backdrop-blur-lg border-white/50 transition-colors bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 text-gray-800 dark:text-white"
      >
        <div className="text-gray-800 dark:text-white">
          <h2 className="text-2xl font-bold mb-4">No mood entries yet</h2>
          <p className="mb-6">Start tracking your mood to see your beautiful journey here!</p>
          <a
            href="/analyze"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform duration-300 inline-block"
          >
            Analyze Your Mood
          </a>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Main Render                                                        */
  /* ------------------------------------------------------------------ */

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
    
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-gradient-to-r from-blue-300/30 to-purple-300/30 dark:from-white/30 dark:to-purple-200/30 animate-float" />
        <div className="absolute top-60 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300/30 to-red-300/30 dark:from-white/30 dark:to-purple-200/30 animate-float" style={{ animationDelay: '2s' }} />
        <CalendarIcon className="absolute top-32 right-1/4 h-8 w-8 text-blue-400 animate-sparkle" />
        <Star className="absolute top-1/3 left-10 h-4 w-4 text-yellow-400 animate-sparkle" style={{ animationDelay: '2s' }} />
        <Sparkles className="absolute bottom-20 right-10 h-5 w-5 text-purple-400 animate-sparkle" style={{ animationDelay: '4s' }} />
        {/* New floating elements for dark mode */}
        <Heart className="absolute top-20 left-20 h-8 w-8 text-pink-400 dark:text-pink-200 animate-float dark:block hidden" />
        <Star className="absolute top-40 right-32 h-6 w-6 text-yellow-400 dark:text-yellow-300 animate-sparkle dark:block hidden" />
        <Sparkles className="absolute bottom-32 left-1/4 h-7 w-7 text-purple-400 dark:text-purple-300 animate-sparkle dark:block hidden" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm dark:block hidden"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in relative">
            <div className="flex justify-center items-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50 animate-glow" />
                <div className="bg-white/80 backdrop-blur-lg border-white/50 relative p-6 rounded-full shadow-2xl group-hover:scale-110 transition-transform duration-500 dark:bg-white/10 dark:border-white/20">
                  <BarChart3 className="h-16 w-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-gray-800 dark:text-white">
              Your Mood
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                Journey History
              </span>
            </h1>
            <p className="text-lg font-medium max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
              Track your emotional patterns and celebrate your beautiful progress over time ✨
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Avg Mood */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 hover:shadow-3xl hover:scale-105 transition-all duration-500 group dark:bg-white/10 dark:border-white/20 dark:hover:shadow-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium mb-2 text-gray-600 dark:text-gray-300">Average Mood</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">{getAverageMood()}/10</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-white/30 dark:to-purple-200/30 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <BarChart3 className="h-8 w-8 text-purple-400 group-hover:animate-pulse" />
                </div>
              </div>
            </div>

            {/* Trend */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 hover:shadow-3xl hover:scale-105 transition-all duration-500 group dark:bg-white/10 dark:border-white/20 dark:hover:shadow-purple-500/20" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium mb-2 text-gray-600 dark:text-gray-300">Trend</p>
                  {(() => {
                    const tr = getTrend();
                    const cls =
                      tr === 'improving'
                        ? 'text-green-600 dark:text-emerald-300'
                        : tr === 'declining'
                        ? 'text-red-600 dark:text-rose-300'
                        : 'text-yellow-600 dark:text-amber-300';
                    return (
                      <p className={`text-xl font-black capitalize ${cls}`}>
                        {tr}
                      </p>
                    );
                  })()}
                </div>
                <div className="p-6 bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-white/30 dark:to-purple-200/30 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="h-8 w-8 text-purple-400 group-hover:animate-bounce" />
                </div>
              </div>
            </div>

            {/* Days Tracked */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 hover:shadow-3xl hover:scale-105 transition-all duration-500 group dark:bg-white/10 dark:border-white/20 dark:hover:shadow-purple-500/20" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium mb-2 text-gray-600 dark:text-gray-300">Days Tracked</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:text-pink-300">{filteredEntries.length}</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-white/30 dark:to-purple-200/30 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <CalendarIcon className="h-8 w-8 text-pink-400 group-hover:animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 transition-all duration-500 mb-12 animate-fade-in dark:bg-white/10 dark:border-white/20" style={{ animationDelay: '0.6s' }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-100/60 to-pink-100/60 dark:from-white/30 dark:to-purple-200/30 rounded-xl">
                  <Filter className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <span className="font-bold text-lg text-gray-800 dark:text-white">
                  View Options:
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                {/* Line / Bar toggle */}
                <div className="flex rounded-xl border-2 overflow-hidden shadow-lg border-purple-200 dark:border-white/20">
                  <button
                    onClick={() => setViewType('line')}
                    className={`px-5 py-3 text-base font-bold transition-all duration-300 ${
                      viewType === 'line'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-xl animate-glow'
                        : 'bg-white/70 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl dark:bg-white/10 dark:border-white/30 dark:hover:border-white/50'
                    }`}
                  >
                    Line Chart
                  </button>
                  <button
                    onClick={() => setViewType('bar')}
                    className={`px-5 py-3 text-base font-bold transition-all duration-300 ${
                      viewType === 'bar'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-xl animate-glow'
                        : 'bg-white/70 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl dark:bg-white/10 dark:border-white/30 dark:hover:border-white/50'
                    }`}
                  >
                    Bar Chart
                  </button>
                </div>

                {/* Calendar toggle */}
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`flex items-center px-5 py-3 text-base font-bold rounded-xl border-2 transition-all duration-500 shadow-lg hover:scale-105 ${
                    showCalendar
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 animate-glow'
                      : 'bg-white text-gray-700 border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:bg-white/10 dark:text-purple-100 dark:border-white/20 dark:hover:bg-white/20'
                  }`}
                >
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Mood Calendar
                  <Sparkles className="h-4 w-4 ml-2 animate-sparkle" />
                </button>

                {/* Time range */}
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
                  className="px-5 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 text-base font-medium bg-white/80 backdrop-blur-lg border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-800 dark:bg-white/10 dark:border-white/20 dark:text-white"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calendar */}
          {showCalendar && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 mb-12 animate-fade-in dark:bg-white/10 dark:border-white/20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-800 dark:text-white">
                  Mood Calendar ✨
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-3 hover:bg-gradient-to-r hover:from-purple-100/40 hover:to-pink-100/40 dark:hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-white" />
                  </button>
                  <span className="font-bold text-xl text-gray-800 dark:text-white">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-3 hover:bg-gradient-to-r hover:from-purple-100/40 hover:to-pink-100/40 dark:hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-800 dark:text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-base font-black p-3 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700 dark:from-white/30 dark:to-purple-200/30 dark:text-purple-100">
                    {day}
                  </div>
                ))}

                {/* Days */}
                {generateCalendarDays(currentMonth).map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-3" />;
                  }
                  const moodData = getMoodData(day);
                  const dayKey = day.toISOString();
                  const dotClass = moodData ? getMoodDotClass(moodData.mood) : '';

                  return (
                    <div
                      key={dayKey}
                      className={`p-3 text-center rounded-xl transition-all duration-300 cursor-pointer border-2 ${
                        moodData
                          ? 'hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:border-purple-300 border-transparent shadow-lg hover:shadow-xl hover:scale-105 dark:hover:bg-white/10 dark:hover:border-white/20'
                          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border-transparent dark:hover:bg-white/10'
                      }`}
                      onMouseEnter={() => moodData && setHoveredDay(dayKey)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      <div className="text-base font-bold mb-1 text-gray-800 dark:text-white">
                        {day.getDate()}
                      </div>
                      {moodData && (
                        <div className={`text-2xl animate-fade-in ${dotClass}`}>
                          {hoveredDay === dayKey ? moodData.emoji : '●'}
                        </div>
                      )}
                      {moodData && hoveredDay === dayKey && (
                        <div className="text-xs mt-1 font-medium text-gray-600 dark:text-purple-100">
                          {moodData.moodText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center justify-center flex-wrap gap-3 text-base font-medium text-gray-600 dark:text-purple-100">
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                  <span>😢</span><span>Poor (1-2)</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                  <span>😔</span><span>Low (3-4)</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                  <span>😐</span><span>Okay (5-6)</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                  <span>😊</span><span>Good (7-8)</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
                  <span>😄</span><span>Great (9-10)</span>
                </div>
              </div>

              <div className="mt-4 text-center text-base font-medium text-gray-600 dark:text-purple-100">
                Hover over a day to see your mood details! ✨
              </div>
            </div>
          )}

          {/* Chart */}
<div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-white/50 mb-12 animate-fade-in dark:bg-white/10 dark:border-white/20" style={{ animationDelay: '0.8s' }}>
  <h3 className="text-2xl font-black mb-8 text-center text-gray-800 dark:text-white">
    Your Mood Journey 📊
  </h3>
  <div className="h-96">
    <ResponsiveContainer width="100%" height="100%">
      {viewType === 'line' ? (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#000000" strokeOpacity={1}  className="dark:stroke-[#e0e7ff]" />
           <XAxis
        dataKey="formattedDate"
        stroke="currentColor"
        tick={{ fill: "currentColor", fontSize: 14, fontWeight: "bold" }}
        tickFormatter={(value) =>
          new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        }
      />
      <YAxis
        stroke="currentColor"
        tick={{ fill: "currentColor", fontSize: 14, fontWeight: "bold" }}
        domain={[0, 10]}
      />

          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '2px solid #4b5563',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#111827',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="mood"
            stroke={`url(#${gradientLineId})`}
            strokeWidth={4}
            dot={{ fill: '#3B82F6', strokeWidth: 3, r: 6 }}
            name="Mood (1-10)"
          />
          <defs>
            <linearGradient id={gradientLineId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </LineChart>
      ) : (
        <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3"stroke="#000000"strokeOpacity={1} className="dark:stroke-[#e0e7ff]"/>

            <XAxis
              dataKey="formattedDate"
              stroke="currentColor"
              tick={{
                fill: "currentColor",
                fontSize: 14,
                fontWeight: "bold",
              }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <YAxis
              stroke="currentColor"
              tick={{
                fill: "currentColor",
                fontSize: 14,
                fontWeight: "bold",
              }}
              domain={[0, 10]}
            />


          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '2px solid #4b5563',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#111827',
            }}
            wrapperClassName="dark:[&>div]:bg-gray-800 dark:[&>div]:text-white dark:[&>div]:border-gray-600"
          />
          <Legend />
          <Bar
            dataKey="mood"
            fill={`url(#${gradientBarId})`}
            name="Mood (1-10)"
            radius={[4, 4, 0, 0]}
          />
          <defs>
            <linearGradient id={gradientBarId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" className="dark:stop-color-blue-400" />
              <stop offset="100%" stopColor="#8B5CF6" className="dark:stop-color-purple-400" />
            </linearGradient>
          </defs>
        </BarChart>
      )}
    </ResponsiveContainer>
  </div>
</div>

          {/* Insights */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-12 border-2 border-white/50 animate-fade-in dark:bg-white/10 dark:border-white/20" style={{ animationDelay: '1s' }}>
            <h3 className="text-3xl font-black mb-10 text-center text-gray-800 dark:text-white">
              Your Beautiful Insights ✨
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mood Patterns */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border-2 border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 group dark:bg-white/10 dark:border-white/20 dark:hover:shadow-purple-500/20">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-white/30 dark:to-purple-200/30 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <h4 className="font-black text-xl text-gray-800 dark:text-white">
                    Mood Patterns
                  </h4>
                </div>
                <p className="text-base leading-relaxed font-medium text-gray-600 dark:text-gray-300">
                  Your mood journey shows beautiful patterns and growth over time. Keep tracking to discover more insights about your emotional well-being! 💫
                </p>
              </div>

              {/* Weather Correlation */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border-2 border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 group dark:bg-white/10 dark:border-white/20 dark:hover:shadow-purple-500/20">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-white/30 dark:to-purple-200/30 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">☀️</span>
                  </div>
                  <h4 className="font-black text-xl text-gray-800 dark:text-white">
                    Weather Correlation
                  </h4>
                </div>
                <p className="text-base leading-relaxed font-medium text-gray-600 dark:text-gray-300">
                  Weather can influence your mood! Track how different conditions affect your feelings and use this awareness to brighten even the cloudiest days. 🌈
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;