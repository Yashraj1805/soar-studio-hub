import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Scissors, Sparkles, Download, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [trimRange, setTrimRange] = useState([0, 100]);
  const [isGenerating, setIsGenerating] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      toast({
        title: 'Video uploaded',
        description: `${file.name} is ready for editing`,
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv'] },
    maxFiles: 1,
  });

  const handleAutoCaptions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: 'Captions generated',
        description: 'Auto-captions have been added to your video',
      });
    }, 2000);
  };

  const handleAIThumbnail = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: 'Thumbnail generated',
        description: 'AI thumbnail has been created successfully',
      });
    }, 2000);
  };

  const handleExport = () => {
    toast({
      title: 'Exporting video',
      description: 'Your edited video will be ready shortly',
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
            Video Editor
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload, edit, and enhance your content with AI
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload & Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {!videoFile ? (
            <Card>
              <CardHeader>
                <CardTitle>Upload Video</CardTitle>
                <CardDescription>Drag and drop or click to select a video file</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-accent/30'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  {isDragActive ? (
                    <p className="text-lg font-medium">Drop your video here...</p>
                  ) : (
                    <>
                      <p className="text-lg font-medium mb-2">Drag & drop your video here</p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files (MP4, MOV, AVI, MKV)
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileVideo className="w-5 h-5" />
                    Video Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoUrl('');
                    }}
                  >
                    Upload Different Video
                  </Button>
                </CardContent>
              </Card>

              {/* Timeline Trim UI */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="w-5 h-5" />
                    Trim Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium min-w-[60px]">
                      {trimRange[0]}s
                    </span>
                    <Slider
                      value={trimRange}
                      onValueChange={setTrimRange}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium min-w-[60px] text-right">
                      {trimRange[1]}s
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adjust the sliders to trim your video to the desired length
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>

        {/* AI Tools Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>AI Enhancements</CardTitle>
              <CardDescription>Enhance your video with AI-powered tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start gap-2"
                onClick={handleAutoCaptions}
                disabled={!videoFile || isGenerating}
              >
                <Sparkles className="w-4 h-4" />
                Auto Caption
              </Button>
              <Button
                className="w-full justify-start gap-2"
                onClick={handleAIThumbnail}
                disabled={!videoFile || isGenerating}
              >
                <Sparkles className="w-4 h-4" />
                AI Thumbnail Generator
              </Button>
              <div className="pt-3 border-t">
                <Button
                  className="w-full gap-2"
                  variant="secondary"
                  onClick={handleExport}
                  disabled={!videoFile}
                >
                  <Download className="w-4 h-4" />
                  Export Video
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Keep videos under 60 seconds for better engagement</p>
              <p>• Add captions to increase watch time by 40%</p>
              <p>• Test multiple thumbnails for best results</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoEditor;
