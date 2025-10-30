import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Link as LinkIcon, Mail, Edit3, Eye, Users, Heart, MessageCircle } from 'lucide-react';

export default function Profile() {
  const { profile, updateProfile } = useAppStore();
  const user = useAuthStore((state) => state.user);
  const [formData, setFormData] = useState(profile);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast({
      title: 'Profile updated!',
      description: 'Your changes have been saved.',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Section with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 md:p-12 shadow-glow"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Avatar className="w-28 h-28 md:w-32 md:h-32 ring-4 ring-white/30 shadow-2xl">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-3xl bg-white/20 backdrop-blur">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          <div className="flex-1 text-center md:text-left text-white">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-2"
            >
              {user?.name}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center justify-center md:justify-start gap-2 text-white/90 mb-3"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm md:text-base">{user?.email}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Badge variant="secondary" className="bg-white/20 backdrop-blur text-white border-white/30">
                {profile.niche}
              </Badge>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              variant="secondary"
              className="bg-white/90 hover:bg-white text-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Public
            </Button>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { icon: Users, label: 'Followers', value: '12.5K', color: 'text-blue-500' },
          { icon: Heart, label: 'Total Likes', value: '48.2K', color: 'text-pink-500' },
          { icon: MessageCircle, label: 'Engagement', value: '8.4%', color: 'text-purple-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="border-border bg-white/90 dark:bg-gray-900/80 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6 text-center">
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Edit Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="border-border bg-white/90 dark:bg-gray-900/80 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="niche">Niche</Label>
                <Input
                  id="niche"
                  value={formData.niche}
                  onChange={(e) =>
                    setFormData({ ...formData, niche: e.target.value })
                  }
                  placeholder="e.g., Tech & Productivity"
                />
              </div>

              <div className="space-y-2">
                <Label>Social Links</Label>
                {formData.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    <Input
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...formData.links];
                        newLinks[index] = e.target.value;
                        setFormData({ ...formData, links: newLinks });
                      }}
                      placeholder="https://..."
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      links: [...formData.links, ''],
                    })
                  }
                >
                  Add Link
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
        </motion.div>

        {/* Portfolio Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="border-border bg-white/90 dark:bg-gray-900/80 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Portfolio Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="aspect-square bg-gradient-primary rounded-lg opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
