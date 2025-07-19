import { useState } from 'react';
import { Calendar, Cloud, Bed, Star, Heart, Sparkles, Sun, Moon, Users } from 'lucide-react';

const Journey = () => {
  const [journeyData, setJourneyData] = useState({
    mood: '',
    partner: '',
    weather: '',
    sleep: '',
    dayQuality: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const moodOptions = [
    { value: 'excellent', label: 'Excellent', emoji: '😄' },
    { value: 'good', label: 'Good', emoji: '😊' },
    { value: 'okay', label: 'Okay', emoji: '😐' },
    { value: 'poor', label: 'Poor', emoji: '😔' },
    { value: 'terrible', label: 'Terrible', emoji: '😢' }
  ];

  const partnerOptions = [
    { value: 'alone', label: 'Alone', emoji: '🧘' },
    { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { value: 'friends', label: 'Friends', emoji: '🧑‍🤝‍🧑' },
    { value: 'partner', label: 'Romantic Partner', emoji: '💑' },
    { value: 'colleagues', label: 'Colleagues', emoji: '💼' },
    { value: 'others', label: 'Others', emoji: '✨' }
  ];

  const weatherOptions = [
    { value: 'sunny', label: 'Sunny', emoji: '☀️' },
    { value: 'cloudy', label: 'Cloudy', emoji: '☁️' },
    { value: 'rainy', label: 'Rainy', emoji: '🌧️' },
    { value: 'snowy', label: 'Snowy', emoji: '❄️' },
    { value: 'stormy', label: 'Stormy', emoji: '⛈️' }
  ];

  const sleepOptions = [
    { value: 'excellent', label: 'Excellent (8+ hours)', emoji: '😴' },
    { value: 'good', label: 'Good (6-8 hours)', emoji: '😊' },
    { value: 'fair', label: 'Fair (4-6 hours)', emoji: '😐' },
    { value: 'poor', label: 'Poor (<4 hours)', emoji: '😵' }
  ];

  const getSupportMessage = () => {
    const messages = {
      excellent: "What a wonderful day! Your positive energy is inspiring. Keep up the great work! ✨",
      good: "You're doing great! It's lovely to see you taking care of yourself and staying positive. 🌟",
      okay: "Every day doesn't have to be perfect. You're doing your best, and that's enough. 💙",
      poor: "It's okay to have difficult days. Remember, you're stronger than you think and tomorrow is a new opportunity. 🌈",
      terrible: "I'm sorry you're having such a tough time. Please be gentle with yourself and consider reaching out for support. 💜"
    };
    return messages[journeyData.mood as keyof typeof messages] || "Thank you for sharing your day with us. 🤗";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    console.log('Journey data:', journeyData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Heart className="absolute top-20 left-20 h-8 w-8 text-pink-400 animate-float" />
          <Star className="absolute top-40 right-32 h-6 w-6 text-yellow-400 animate-sparkle" />
          <Sparkles className="absolute bottom-32 left-1/4 h-7 w-7 text-purple-400 animate-sparkle" style={{animationDelay: '1s'}} />
          {/* Glowing orb for dark theme */}
          <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm dark:block hidden"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <div className="bg-white/80 dark:bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/50 dark:border-white/20 transition-colors">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-lg opacity-50 animate-glow"></div>
                <Heart className="relative h-20 w-20 text-pink-500 mx-auto animate-float" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6 transition-colors">Thank You! 🎉</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg transition-colors">Your mood journey has been recorded successfully.</p>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl p-6 mb-8 border border-purple-200/50 dark:border-white/20 transition-colors">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-center transition-colors">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Today's Support Message
                </h3>
                <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed transition-colors">"{getSupportMessage()}"</p>
              </div>
              
              <button
                onClick={() => {
                  setSubmitted(false);
                  setJourneyData({ mood: '', partner: '', weather: '', sleep: '', dayQuality: '', notes: '' });
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-glow"
              >
                Record Another Day ✨
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-12 relative overflow-hidden transition-colors">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-gradient-to-r from-blue-300/30 to-purple-300/30 dark:from-blue-500/20 dark:to-purple-500/20 animate-float"></div>
        <div className="absolute top-60 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-pink-300/30 to-red-300/30 dark:from-pink-500/20 dark:to-red-500/20 animate-float" style={{animationDelay: '2s'}}></div>
        
        {/* Glowing orb for dark theme */}
        <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm dark:block hidden"></div>
        
        <Calendar className="absolute top-32 right-1/4 h-8 w-8 text-blue-400 animate-sparkle" />
        <Sun className="absolute bottom-40 left-20 h-6 w-6 text-yellow-400 animate-sparkle" style={{animationDelay: '1.5s'}} />
        <Moon className="absolute top-80 left-1/3 h-7 w-7 text-indigo-400 animate-sparkle" style={{animationDelay: '3s'}} />
        <Star className="absolute top-1/3 left-10 h-4 w-4 text-yellow-400 animate-sparkle" style={{animationDelay: '2s'}} />
        <Sparkles className="absolute bottom-20 right-10 h-5 w-5 text-purple-400 animate-sparkle" style={{animationDelay: '4s'}} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="relative mb-8">
              <Calendar className="relative h-20 w-20 text-blue-600 dark:text-blue-400 mx-auto transition-colors" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6 transition-colors">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-gradient-shift">
                Mood Journey
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto transition-colors">
              Track your daily emotions and receive personalized support on your wellness journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/50 dark:border-white/20 animate-fade-in transition-colors">
            {/* Overall Mood */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center transition-colors">
                <Star className="h-6 w-6 mr-3 text-yellow-500" />
                How was your overall mood today?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setJourneyData({...journeyData, mood: option.value})}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${
                      journeyData.mood === option.value
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/30 dark:to-pink-500/30 shadow-lg'
                        : 'border-gray-200 dark:border-white/30 bg-white/60 dark:bg-white/10 hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 hover:border-purple-500 dark:hover:border-purple-400'
                    }`}
                  >
                    <span
                      className={`text-2xl ${journeyData.mood === option.value ? 'text-purple-600 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
                      role="img"
                      aria-label={option.label}
                    >
                      {option.emoji}
                    </span>
                    <span className={`text-sm font-medium ${journeyData.mood === option.value ? 'text-purple-800 dark:text-purple-200' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Partner Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center transition-colors">
                <Users className="h-6 w-6 mr-3 text-emerald-500" />
                Who did you spend most of your day with?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {partnerOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setJourneyData({...journeyData, partner: option.value})}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${
                      journeyData.partner === option.value
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/30 dark:to-pink-500/30 shadow-lg'
                        : 'border-gray-200 dark:border-white/30 bg-white/60 dark:bg-white/10 hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 hover:border-purple-500 dark:hover:border-purple-400'
                    }`}
                  >
                    <span
                      className={`text-2xl ${journeyData.partner === option.value ? 'text-purple-600 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
                      role="img"
                      aria-label={option.label}
                    >
                      {option.emoji}
                    </span>
                    <span className={`text-sm font-medium ${journeyData.partner === option.value ? 'text-purple-800 dark:text-purple-200' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center transition-colors">
                <Cloud className="h-6 w-6 mr-3 text-blue-500" />
                What was the weather like?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {weatherOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setJourneyData({...journeyData, weather: option.value})}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${
                      journeyData.weather === option.value
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/30 dark:to-pink-500/30 shadow-lg'
                        : 'border-gray-200 dark:border-white/30 bg-white/60 dark:bg-white/10 hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 hover:border-purple-500 dark:hover:border-purple-400'
                    }`}
                  >
                    <span
                      className={`text-2xl ${journeyData.weather === option.value ? 'text-purple-600 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
                      role="img"
                      aria-label={option.label}
                    >
                      {option.emoji}
                    </span>
                    <span className={`text-sm font-medium ${journeyData.weather === option.value ? 'text-purple-800 dark:text-purple-200' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center transition-colors">
                <Bed className="h-6 w-6 mr-3 text-purple-500" />
                How was your sleep?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sleepOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setJourneyData({...journeyData, sleep: option.value})}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${
                      journeyData.sleep === option.value
                        ? 'border-purple-500 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/30 dark:to-pink-500/30 shadow-lg'
                        : 'border-gray-200 dark:border-white/30 bg-white/60 dark:bg-white/10 hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 hover:border-purple-500 dark:hover:border-purple-400'
                    }`}
                  >
                    <span
                      className={`text-2xl ${journeyData.sleep === option.value ? 'text-purple-600 dark:text-purple-300' : 'text-gray-600 dark:text-gray-300'}`}
                      role="img"
                      aria-label={option.label}
                    >
                      {option.emoji}
                    </span>
                    <span className={`text-sm font-medium ${journeyData.sleep === option.value ? 'text-purple-800 dark:text-purple-200' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Day Quality */}
            <div className="mb-12">
              <label className="block text-2xl font-bold text-gray-800 dark:text-white mb-6 transition-colors">
                Rate your day overall (1-10):
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={journeyData.dayQuality}
                  onChange={(e) => setJourneyData({...journeyData, dayQuality: e.target.value})}
                  className="w-full h-3 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors">
                  <span>😢 Poor</span>
                  <span className="font-bold text-2xl text-gray-700 dark:text-white bg-white/80 dark:bg-white/20 px-4 py-2 rounded-full border-2 border-purple-300 dark:border-purple-400 transition-colors">
                    {journeyData.dayQuality || '5'}
                  </span>
                  <span>😄 Great</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-10">
              <label className="block text-2xl font-bold text-gray-800 dark:text-white mb-6 transition-colors">
                <Sparkles className="inline h-6 w-6 mr-2 text-purple-500" />
                Additional thoughts (optional):
              </label>
              <textarea
                value={journeyData.notes}
                onChange={(e) => setJourneyData({...journeyData, notes: e.target.value})}
                placeholder="How are you feeling? What happened today? Any thoughts you'd like to record... ✨"
                className="w-full p-6 border-2 border-gray-300 dark:border-white/30 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/30 focus:border-purple-400 resize-none bg-white/60 dark:bg-white/10 backdrop-blur-sm text-lg text-gray-700 dark:text-white placeholder-gray-400 transition-colors"
                rows={4}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!journeyData.mood || !journeyData.weather || !journeyData.sleep}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 animate-glow"
            >
              Save My Journey ✨
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Journey;