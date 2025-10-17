import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Lightbulb, MessageSquare, Image, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AITool {
  id: string;
  title: string;
  description: string;
  icon: any;
  placeholder: string;
  endpoint: string;
}

const aiTools: AITool[] = [
  {
    id: 'idea',
    title: 'Idea Generator',
    description: 'Generate creative content ideas based on your niche',
    icon: Lightbulb,
    placeholder: 'Enter your content niche or topic...',
    endpoint: '/api/ai/idea',
  },
  {
    id: 'caption',
    title: 'Caption & Script Generator',
    description: 'Create engaging captions and video scripts',
    icon: MessageSquare,
    placeholder: 'Describe your content or video concept...',
    endpoint: '/api/ai/caption',
  },
  {
    id: 'thumbnail',
    title: 'Thumbnail Prompt Generator',
    description: 'Generate prompts for eye-catching thumbnails',
    icon: Image,
    placeholder: 'Describe your video or content theme...',
    endpoint: '/api/ai/thumbnail',
  },
];

export default function AITools() {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleGenerate = async (tool: AITool) => {
    const input = inputs[tool.id];
    if (!input?.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter some text to generate.',
        variant: 'destructive',
      });
      return;
    }

    setLoading({ ...loading, [tool.id]: true });

    // Simulate API call with mock data
    setTimeout(() => {
      const mockOutputs: Record<string, string> = {
        idea: `📱 Top 5 ${input} trends for 2025\n🎯 How to master ${input} in 30 days\n💡 Common ${input} mistakes to avoid\n🚀 ${input} success stories from real creators\n⚡ Quick ${input} tips for beginners`,
        caption: `🔥 Ready to transform your ${input}? Here's what you need to know! 👇\n\nIn today's video, I'm breaking down the EXACT strategy that helped me [achieve result]. Whether you're just starting out or looking to level up, these tips will change the game for you.\n\n✨ What you'll learn:\n• Key strategy #1\n• Key strategy #2\n• Key strategy #3\n\nDrop a 💯 if you found this helpful! Let me know in the comments which tip you'll try first.\n\n#${input.replace(/\s+/g, '')} #ContentCreator #GrowthTips`,
        thumbnail: `Create a bold, high-contrast thumbnail featuring:\n\n🎨 Visual Elements:\n- Vibrant gradient background (purple to pink)\n- Large, bold text: "${input.toUpperCase()}"\n- Eye-catching emoji or icon related to ${input}\n- Your face with an expressive, excited reaction\n\n📐 Layout:\n- Text positioned in the top-right corner\n- Face on the left side, slightly off-center\n- Add a subtle glow effect around the main elements\n- Include a small "NEW" badge or arrow pointing to key element\n\nStyle: Modern, energetic, click-worthy`,
      };

      setOutputs({ ...outputs, [tool.id]: mockOutputs[tool.id] });
      setLoading({ ...loading, [tool.id]: false });
      toast({
        title: 'Generated successfully!',
        description: 'Your AI-powered content is ready.',
      });
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          AI Tools
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Supercharge your content creation with AI-powered tools
        </p>
      </div>

      <div className="space-y-6">
        {aiTools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border bg-card/50 backdrop-blur shadow-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Input</label>
                    <Textarea
                      placeholder={tool.placeholder}
                      value={inputs[tool.id] || ''}
                      onChange={(e) =>
                        setInputs({ ...inputs, [tool.id]: e.target.value })
                      }
                      className="min-h-[200px] bg-muted/50"
                    />
                    <Button
                      onClick={() => handleGenerate(tool)}
                      disabled={loading[tool.id]}
                      className="w-full bg-gradient-primary hover:opacity-90"
                    >
                      {loading[tool.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output</label>
                    <Textarea
                      placeholder="Generated content will appear here..."
                      value={outputs[tool.id] || ''}
                      readOnly
                      className="min-h-[200px] bg-muted/50 font-mono text-sm"
                    />
                    {outputs[tool.id] && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(outputs[tool.id]);
                          toast({
                            title: 'Copied!',
                            description: 'Content copied to clipboard.',
                          });
                        }}
                        className="w-full"
                      >
                        Copy to Clipboard
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
