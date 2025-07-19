import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { UserProfile, Mood } from './FortuneApp';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Eye, RefreshCw, Star, Heart } from 'lucide-react';

interface QuestionnaireStepProps {
  onComplete: (profile: UserProfile) => void;
  username?: string;
}

const moodQuestions = [
  {
    id: 'morning-feeling',
    question: 'How did you feel when you woke up this morning?',
    options: [
      { value: 'excited', label: 'Excited and ready for the day', mood: 'energetic' as Mood },
      { value: 'peaceful', label: 'Calm and peaceful', mood: 'calm' as Mood },
      { value: 'worried', label: 'Anxious or worried', mood: 'anxious' as Mood },
      { value: 'content', label: 'Happy and content', mood: 'happy' as Mood },
      { value: 'reflective', label: 'Thoughtful and introspective', mood: 'melancholic' as Mood },
      { value: 'optimistic', label: 'Hopeful about what\'s ahead', mood: 'hopeful' as Mood }
    ]
  },
  {
    id: 'social-energy',
    question: 'How have you been feeling socially lately?',
    options: [
      { value: 'outgoing', label: 'Eager to connect with others', mood: 'energetic' as Mood },
      { value: 'balanced', label: 'Comfortable and balanced', mood: 'calm' as Mood },
      { value: 'overwhelmed', label: 'Overwhelmed by social interaction', mood: 'anxious' as Mood },
      { value: 'joyful', label: 'Enjoying meaningful time with friends', mood: 'happy' as Mood },
      { value: 'withdrawn', label: 'Preferring solitude and reflection', mood: 'melancholic' as Mood },
      { value: 'reconnecting', label: 'Thinking about reconnecting with people', mood: 'hopeful' as Mood }
    ]
  },
  {
    id: 'environment-impact',
    question: 'How does your current environment make you feel?',
    options: [
      { value: 'motivated', label: 'It energizes and inspires me', mood: 'energetic' as Mood },
      { value: 'soothing', label: 'It feels relaxing and comforting', mood: 'calm' as Mood },
      { value: 'distracting', label: 'It makes me feel uneasy or distracted', mood: 'anxious' as Mood },
      { value: 'uplifting', label: 'It brings a smile to my face', mood: 'happy' as Mood },
      { value: 'dull', label: 'It feels dull or uninspiring', mood: 'melancholic' as Mood },
      { value: 'refreshing', label: 'It gives me hope for a fresh start', mood: 'hopeful' as Mood }
    ]
  },
  {
    id: 'thought-patterns',
    question: 'What kind of thoughts have been on your mind today?',
    options: [
      { value: 'active-ideas', label: 'New ideas and projects', mood: 'energetic' as Mood },
      { value: 'peace', label: 'Moments of peace and clarity', mood: 'calm' as Mood },
      { value: 'worry', label: 'Concerns about things going wrong', mood: 'anxious' as Mood },
      { value: 'gratitude', label: 'Appreciation for the little things', mood: 'happy' as Mood },
      { value: 'deep-thinking', label: 'Reflecting on past experiences', mood: 'melancholic' as Mood },
      { value: 'possibilities', label: 'Dreaming about the future', mood: 'hopeful' as Mood }
    ]
  },
  {
    id: 'ideal-activity',
    question: 'What sounds most appealing to you right now?',
    options: [
      { value: 'adventure', label: 'An exciting adventure or new project', mood: 'energetic' as Mood },
      { value: 'nature', label: 'A peaceful walk in nature', mood: 'calm' as Mood },
      { value: 'comfort', label: 'Staying in my comfort zone', mood: 'anxious' as Mood },
      { value: 'celebration', label: 'Celebrating life with loved ones', mood: 'happy' as Mood },
      { value: 'solitude', label: 'Quiet time for deep thinking', mood: 'melancholic' as Mood },
      { value: 'planning', label: 'Planning for future goals', mood: 'hopeful' as Mood }
    ]
  }
];

export const QuestionnaireStep = ({ onComplete, username }: QuestionnaireStepProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [profileName, setProfileName] = useState<string>('Quiz Taker');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data?.full_name) {
          setProfileName(data.full_name);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Optional: show error toast here
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const progress = ((currentQuestion + 1) / moodQuestions.length) * 100;

  const handleNext = () => {
    if (currentQuestion < moodQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate mood from answers and create profile
      const moodProfile = calculateMoodProfile();
      onComplete(moodProfile);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateMoodProfile = (): UserProfile => {
    // Count mood occurrences from selected answers
    const moodCounts: Record<Mood, number> = {
      energetic: 0,
      calm: 0,
      anxious: 0,
      happy: 0,
      melancholic: 0,
      hopeful: 0
    };

    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = moodQuestions.find(q => q.id === questionId);
      const selectedOption = question?.options.find(opt => opt.value === answerValue);
      if (selectedOption) {
        moodCounts[selectedOption.mood]++;
      }
    });

    const dominantMood = Object.entries(moodCounts).reduce((a, b) =>
      moodCounts[a[0] as Mood] > moodCounts[b[0] as Mood] ? a : b
    )[0] as Mood;

    return {
      name: profileName,
      age: '25-35',
      currentChallenge: `Feeling ${dominantMood}`,
      dreamGoal: 'Finding inner balance',
      energyLevel: dominantMood === 'energetic' ? 'high' : dominantMood === 'calm' ? 'medium' : 'low',
      recentFeeling: dominantMood,
      motivation: 'Personal growth'
    };
  };

  const isCurrentStepValid = () => {
    const currentQuestionId = moodQuestions[currentQuestion].id;
    return answers[currentQuestionId] !== undefined;
  };

  const currentQuestionData = moodQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Heart className="absolute top-20 left-20 h-8 w-8 text-pink-400 animate-float" />
        <Star className="absolute top-40 right-32 h-6 w-6 text-yellow-400 animate-sparkle" />
        <Sparkles className="absolute bottom-32 left-1/4 h-7 w-7 text-purple-400 animate-sparkle" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/4 right-1/3 w-48 h-48 rounded-full bg-gradient-to-r from-white/30 to-purple-200/30 animate-pulse-glow blur-sm dark:block hidden"></div>
      </div>

      <Card className="w-full max-w-lg shadow-journey-map border-white/50 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-gray-800 dark:text-white bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mood Assessment Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
              <Progress
  value={progress}
  className="w-full h-2 mb-4 bg-gray-200 dark:bg-gray-800 
             [&>div]:bg-gradient-to-r 
             [&>div]:from-indigo-50 [&>div]:via-purple-50 [&>div]:to-pink-100 
             dark:[&>div]:from-gray-900 dark:[&>div]:via-purple-900 dark:[&>div]:to-pink-900"
/>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Question {currentQuestion + 1} of {moodQuestions.length}
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white text-center">
                {currentQuestionData.question}
              </h2>

              <RadioGroup
                value={answers[currentQuestionData.id] || ''}
                onValueChange={(value) => updateAnswer(currentQuestionData.id, value)}
                className="space-y-3"
              >
                {currentQuestionData.options.map((option, index) => (
                  <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-600/30 dark:hover:to-pink-600/30 transition-colors">
                    <RadioGroupItem value={option.value} id={`option-${index}`} className="mt-1" />
                    <Label htmlFor={`option-${index}`} className="text-sm leading-relaxed cursor-pointer flex-1 text-gray-700 dark:text-gray-300">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className="border-white/50 dark:border-white/20"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              {currentQuestion === moodQuestions.length - 1 ? 'Get Results' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};