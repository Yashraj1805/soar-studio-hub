import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Instagram, Youtube, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConnectedAccount {
  id: string;
  platform: string;
  account_username: string | null;
  is_active: boolean;
  created_at: string;
}

export default function ConnectPlatforms() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConnectedAccounts();
    
    // Listen for OAuth callback messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'instagram_success') {
        handleInstagramConnect(event.data.data);
      } else if (event.data.type === 'youtube_success') {
        handleYouTubeConnect(event.data.data);
      } else if (event.data.type?.includes('_error')) {
        toast({
          title: 'Connection Failed',
          description: event.data.error || 'Failed to connect account',
          variant: 'destructive',
        });
        setConnecting(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchConnectedAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('id, platform, account_username, is_active, created_at')
        .eq('is_active', true);

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectInstagram = async () => {
    setConnecting('instagram');
    try {
      const { data, error } = await supabase.functions.invoke('instagram-auth');
      
      if (error) throw error;
      
      if (data.authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        window.open(
          data.authUrl,
          'Instagram Login',
          `width=${width},height=${height},left=${left},top=${top}`
        );
      } else {
        throw new Error(data.notes || 'Failed to get auth URL');
      }
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
      setConnecting(null);
    }
  };

  const connectYouTube = async () => {
    setConnecting('youtube');
    try {
      const { data, error } = await supabase.functions.invoke('youtube-auth');
      
      if (error) throw error;
      
      if (data.authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        window.open(
          data.authUrl,
          'YouTube Login',
          `width=${width},height=${height},left=${left},top=${top}`
        );
      } else {
        throw new Error('Failed to get auth URL');
      }
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
      setConnecting(null);
    }
  };

  const handleInstagramConnect = async (connectionData: any) => {
    try {
      const { error } = await supabase
        .from('connected_accounts')
        .upsert({
          ...connectionData,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Instagram Connected',
        description: `Successfully connected @${connectionData.account_username}`,
      });

      fetchConnectedAccounts();
    } catch (error: any) {
      toast({
        title: 'Error Saving Connection',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setConnecting(null);
    }
  };

  const handleYouTubeConnect = async (connectionData: any) => {
    try {
      const { error } = await supabase
        .from('connected_accounts')
        .upsert({
          ...connectionData,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      toast({
        title: 'YouTube Connected',
        description: `Successfully connected ${connectionData.account_username}`,
      });

      fetchConnectedAccounts();
    } catch (error: any) {
      toast({
        title: 'Error Saving Connection',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setConnecting(null);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('connected_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: 'Account Disconnected',
        description: 'Account has been disconnected successfully',
      });

      fetchConnectedAccounts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const isConnected = (platform: string) => 
    accounts.some(acc => acc.platform === platform && acc.is_active);

  const getAccountInfo = (platform: string) => 
    accounts.find(acc => acc.platform === platform && acc.is_active);

  return (
    <Card className="border-border bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle>Connect Your Platforms</CardTitle>
        <CardDescription>
          Link your Instagram and YouTube accounts to see real-time metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instagram */}
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <Instagram className="w-8 h-8 text-pink-500" />
            <div>
              <h3 className="font-semibold">Instagram</h3>
              {isConnected('instagram') && (
                <p className="text-sm text-muted-foreground">
                  @{getAccountInfo('instagram')?.account_username}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected('instagram') ? (
              <>
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Connected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectAccount(getAccountInfo('instagram')!.id)}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={connectInstagram}
                disabled={connecting === 'instagram'}
                size="sm"
              >
                {connecting === 'instagram' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* YouTube */}
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <Youtube className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="font-semibold">YouTube</h3>
              {isConnected('youtube') && (
                <p className="text-sm text-muted-foreground">
                  {getAccountInfo('youtube')?.account_username}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected('youtube') ? (
              <>
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Connected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectAccount(getAccountInfo('youtube')!.id)}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={connectYouTube}
                disabled={connecting === 'youtube'}
                size="sm"
              >
                {connecting === 'youtube' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
          </div>
        </div>

        {accounts.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No accounts connected yet. Connect your platforms to get started!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
