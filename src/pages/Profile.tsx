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
import { useToast } from '@/hooks/use-toast';
import { Save, Link as LinkIcon, Mail } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Profile
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your creator profile and brand identity
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Header */}
        <Card className="border-border bg-card/50 backdrop-blur shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl md:text-2xl font-bold">{user?.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm md:text-base text-muted-foreground mt-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.niche}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="border-border bg-card/50 backdrop-blur shadow-card">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
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
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Portfolio Preview */}
        <Card className="border-border bg-card/50 backdrop-blur shadow-card">
          <CardHeader>
            <CardTitle>Portfolio Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square bg-gradient-primary rounded-lg opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
