
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
          phone: profileData.phone || null,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-purple-300/40 to-pink-300/40 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full bg-gradient-to-r from-blue-300/40 to-cyan-300/40 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-indigo-300/40 to-purple-300/40 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-75 animate-glow"></div>
            <div className="relative inline-flex p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-xl">
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Profile Settings
            </span>
          </h1>
          <p className="text-gray-600 text-xl">
            Customize your profile and personal information ✨
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/50 animate-fade-in">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10">
            <AvatarUpload 
              currentAvatar={profileData.avatar_url}
              userInitials={getUserInitials()}
              onAvatarChange={handleAvatarChange}
            />
            <p className="text-gray-500 text-sm mt-3">Click to change avatar</p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <AtSign className="inline h-4 w-4 mr-2" />
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-white/70 backdrop-blur-sm text-lg hover:border-purple-300"
                placeholder="Enter your username"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-white/70 backdrop-blur-sm text-lg hover:border-purple-300"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Mail className="inline h-4 w-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-white/70 backdrop-blur-sm text-lg hover:border-purple-300"
                placeholder="Enter your email"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Phone className="inline h-4 w-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-white/70 backdrop-blur-sm text-lg hover:border-purple-300"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="inline h-4 w-4 mr-2" />
                Date of Birth
              </label>
              <input
                type="date"
                value={profileData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-white/70 backdrop-blur-sm text-lg hover:border-purple-300"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="inline h-4 w-4 mr-2" />
                Location
              </label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-white/70 backdrop-blur-sm text-lg hover:border-purple-300"
                placeholder="Enter your location"
              />
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Globe className="inline h-4 w-4 mr-2" />
                Website
              </label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-white/70 backdrop-blur-sm text-lg hover:border-purple-300"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <FileText className="inline h-4 w-4 mr-2" />
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-white/70 backdrop-blur-sm text-lg hover:border-purple-300 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-10">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
