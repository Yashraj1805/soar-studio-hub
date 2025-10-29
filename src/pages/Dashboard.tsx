import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Users, DollarSign, Eye, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ConnectPlatforms from '@/components/ConnectPlatforms';

const stats = [
  { label: 'Total Followers', value: '12.5K', change: '+12%', icon: Users, color: 'text-primary' },
  { label: 'Engagement Rate', value: '8.4%', change: '+2.3%', icon: TrendingUp, color: 'text-secondary' },
  { label: 'Monthly Earnings', value: '$2,840', change: '+18%', icon: DollarSign, color: 'text-accent' },
  { label: 'Total Views', value: '145K', change: '+24%', icon: Eye, color: 'text-primary' },
];

const chartData = [
  { name: 'Mon', followers: 400, engagement: 240 },
  { name: 'Tue', followers: 300, engagement: 139 },
  { name: 'Wed', followers: 200, engagement: 980 },
  { name: 'Thu', followers: 278, engagement: 390 },
  { name: 'Fri', followers: 189, engagement: 480 },
  { name: 'Sat', followers: 239, engagement: 380 },
  { name: 'Sun', followers: 349, engagement: 430 },
];

const earningsData = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 1900 },
  { month: 'Mar', amount: 1600 },
  { month: 'Apr', amount: 2200 },
  { month: 'May', amount: 2500 },
  { month: 'Jun', amount: 2840 },
];

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dashboard-data');
      
      if (error) throw error;
      
      setDashboardData(data);
      
      if (data.errors && data.errors.length > 0) {
        toast({
          title: 'Partial Data',
          description: 'Some metrics could not be fetched',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-data');
      
      if (error) throw error;
      
      setDashboardData(data.data);
      toast({
        title: 'Data Synced',
        description: 'Dashboard data has been refreshed',
      });
    } catch (error: any) {
      console.error('Error syncing:', error);
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const stats = [
    { 
      label: 'Total Followers', 
      value: dashboardData?.instagram?.followers || '12.5K', 
      change: '+12%', 
      icon: Users, 
      color: 'text-primary',
      platform: 'Instagram'
    },
    { 
      label: 'Engagement Rate', 
      value: `${dashboardData?.instagram?.engagement_rate || '8.4'}%`, 
      change: '+2.3%', 
      icon: TrendingUp, 
      color: 'text-secondary',
      platform: 'Instagram'
    },
    { 
      label: 'Subscribers', 
      value: dashboardData?.youtube?.subscribers?.toLocaleString() || '8.5K', 
      change: '+18%', 
      icon: DollarSign, 
      color: 'text-accent',
      platform: 'YouTube'
    },
    { 
      label: 'Total Views', 
      value: dashboardData?.youtube?.views?.toLocaleString() || '145K', 
      change: '+24%', 
      icon: Eye, 
      color: 'text-primary',
      platform: 'YouTube'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your creator journey and growth metrics
          </p>
        </div>
        <Button 
          onClick={syncData} 
          disabled={syncing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Data'}
        </Button>
      </div>

      {dashboardData?.fallback && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            Showing default data. Connect your platforms below to see real metrics.
            {dashboardData.cached && ' (Using cached data)'}
          </AlertDescription>
        </Alert>
      )}

      <ConnectPlatforms />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border bg-card/50 backdrop-blur shadow-card hover:shadow-glow transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                      <Badge variant="outline" className="text-xs">{stat.platform}</Badge>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mt-2">{stat.value}</h3>
                    <p className="text-xs md:text-sm text-green-500 mt-1">{stat.change}</p>
                  </div>
                  <stat.icon className={`w-10 h-10 md:w-12 md:h-12 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Trending Topics */}
      {dashboardData?.trending && (
        <Card className="border-border bg-card/50 backdrop-blur shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dashboardData.trending.topics.map((topic: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {topic}
                </Badge>
              ))}
            </div>
            {dashboardData.trending.notes && (
              <p className="text-xs text-muted-foreground mt-4">
                {dashboardData.trending.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Content Ideas */}
      {dashboardData?.ai?.ideas && dashboardData.ai.ideas.length > 0 && (
        <Card className="border-border bg-card/50 backdrop-blur shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI-Powered Content Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.ai.ideas.map((idea: any, index: number) => (
                <Card key={index} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base">{idea.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Script:</p>
                      <p className="text-sm">{idea.script}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Caption:</p>
                      <p className="text-sm">{idea.caption}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Thumbnail Prompt:</p>
                      <p className="text-xs text-muted-foreground italic">{idea.thumbnail_prompt}</p>
                    </div>
                    <Button size="sm" className="w-full">Use This Idea</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border bg-card/50 backdrop-blur shadow-card">
            <CardHeader>
              <CardTitle>Growth Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="followers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--secondary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border bg-card/50 backdrop-blur shadow-card">
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <BarChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--accent))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
