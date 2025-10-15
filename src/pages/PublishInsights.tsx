import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const engagementByHour = [
  { hour: '12 AM', engagement: 120 },
  { hour: '3 AM', engagement: 80 },
  { hour: '6 AM', engagement: 180 },
  { hour: '9 AM', engagement: 350 },
  { hour: '12 PM', engagement: 450 },
  { hour: '3 PM', engagement: 520 },
  { hour: '6 PM', engagement: 680 },
  { hour: '9 PM', engagement: 590 },
];

const engagementByDay = [
  { day: 'Mon', engagement: 3200, likes: 1400 },
  { day: 'Tue', engagement: 4100, likes: 1800 },
  { day: 'Wed', engagement: 3800, likes: 1600 },
  { day: 'Thu', engagement: 4500, likes: 2100 },
  { day: 'Fri', engagement: 5200, likes: 2500 },
  { day: 'Sat', engagement: 3900, likes: 1700 },
  { day: 'Sun', engagement: 3400, likes: 1500 },
];

const aiRecommendations = [
  {
    title: 'Best Posting Time',
    description: 'Tuesday & Friday at 6 PM',
    icon: Clock,
    color: 'text-primary',
  },
  {
    title: 'Optimal Frequency',
    description: 'Post 4-5 times per week',
    icon: Calendar,
    color: 'text-chart-2',
  },
  {
    title: 'Peak Engagement',
    description: 'Evening posts get 60% more views',
    icon: TrendingUp,
    color: 'text-chart-3',
  },
];

const PublishInsights = () => {
  const handleSchedulePost = () => {
    toast({
      title: 'Schedule Post',
      description: 'Post scheduler will be available soon',
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Publish Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analytics to optimize your posting schedule
          </p>
        </div>
        <Button onClick={handleSchedulePost} className="gap-2">
          <Calendar className="w-4 h-4" />
          Schedule Post
        </Button>
      </motion.div>

      {/* AI Recommendations */}
      <div className="grid md:grid-cols-3 gap-4">
        {aiRecommendations.map((rec, index) => (
          <motion.div
            key={rec.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-subtle">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-lg bg-sidebar ${rec.color}`}>
                  <rec.icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{rec.title}</CardTitle>
                  <CardDescription className="text-foreground font-medium">
                    {rec.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Recommendation Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle>AI Recommendation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-4">
              Based on your audience behavior, the best time to post is{' '}
              <span className="text-primary font-bold">Tuesday & Friday at 6 PM</span>.
            </p>
            <p className="text-sm text-muted-foreground">
              Posts during these times receive 60% more engagement and 45% more reach compared to your average posts.
              Your audience is most active in the evening hours.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Engagement by Hour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Hour</CardTitle>
              <CardDescription>Average engagement throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementByHour}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement by Day */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Day</CardTitle>
              <CardDescription>Weekly engagement patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="engagement" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="likes" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PublishInsights;
