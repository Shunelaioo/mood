import { useState, useEffect } from 'react';
import { User, Save, MapPin, Globe, Phone, Calendar, FileText, AtSign, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import AvatarUpload from '@/components/AvatarUpload';

interface ProfileData {
  username: string;
  full_name: string;
  email: string;
  bio: string;
  phone: string;
  date_of_birth: string;
  location: string;
  website: string;
  avatar_url: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    full_name: '',
    email: '',
    bio: '',
    phone: '',
    date_of_birth: '',
    location: '',
    website: '',
    avatar_url: ''
  });

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (profileData.full_name) {
      const names = profileData.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return names[0].charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfileData({
          username: data.username || '',
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          bio: data.bio || '',
          phone: data.phone || '',
          date_of_birth: data.date_of_birth || '',
          location: data.location || '',
          website: data.website || '',
          avatar_url: data.avatar_url || ''
        });
      } else {
        // Create initial profile if it doesn't exist
        setProfileData(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profileData.username || null,
          full_name: profileData.full_name || null,
          email: profileData.email,
          bio: profileData.bio || null,
          
          date_of_birth: profileData.date_of_birth || null,
          location: profileData.location || null,
          website: profileData.website || null,
          avatar_url: profileData.avatar_url || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setProfileData(prev => ({
      ...prev,
      avatar_url: avatarUrl
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 dark:border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-12 px-4 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-purple-300/40 to-pink-300/40 dark:from-purple-500/20 dark:to-pink-500/20 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-gradient-to-r from-blue-300/40 to-cyan-300/40 dark:from-blue-500/20 dark:to-cyan-500/20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-indigo-300/40 to-purple-300/40 dark:from-indigo-500/20 dark:to-purple-500/20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            <div className="relative inline-flex p-6 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 rounded-full shadow-xl">
              <User className="h-12 w-12 text-white dark:text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              Profile Settings
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl transition-colors duration-300">
            Customize your profile and personal information ✨
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/50 dark:border-gray-700/50 animate-fade-in transition-colors duration-300">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10">
            <AvatarUpload 
              currentAvatar={profileData.avatar_url}
              userInitials={getUserInitials()}
              onAvatarChange={handleAvatarChange}
            />
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 transition-colors duration-300">Click to change avatar</p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <AtSign className="inline h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-lg text-gray-800 dark:text-gray-200 hover:border-purple-300 dark:hover:border-purple-400"
                placeholder="Enter your username"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <User className="inline h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                Full Name
              </label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-lg text-gray-800 dark:text-gray-200 hover:border-purple-300 dark:hover:border-purple-400"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <Mail className="inline h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-lg text-gray-800 dark:text-gray-200 hover:border-purple-300 dark:hover:border-purple-400 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                placeholder="Enter your email"
                disabled
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <Phone className="inline h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-lg text-gray-800 dark:text-gray-200 hover:border-purple-300 dark:hover:border-purple-400"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <Calendar className="inline h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                Date of Birth
              </label>
              <input
                type="date"
                value={profileData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-lg text-gray-800 dark:text-gray-200 hover:border-purple-300 dark:hover:border-purple-400"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <MapPin className="inline h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                Location
              </label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-lg text-gray-800 dark:text-gray-200 hover:border-purple-300 dark:hover:border-purple-400"
                placeholder="Enter your location"
              />
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <Globe className="inline h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                Website
              </label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-lg text-gray-800 dark:text-gray-200 hover:border-purple-300 dark:hover:border-purple-400"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-300">
                <FileText className="inline h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-500/50 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-lg text-gray-800 dark:text-gray-200 hover:border-purple-300 dark:hover:border-purple-400 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-10">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-500 dark:hover:to-pink-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-3" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;