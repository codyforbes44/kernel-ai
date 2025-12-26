import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  TrendingUp, 
  Image as ImageIcon, 
  Copy, 
  Send,
  Loader2,
  Hash,
  Clock,
  BarChart3,
  Lightbulb,
  Trash2,
  FileText,
  Settings,
  Calendar
} from 'lucide-react';
import { useXAutomation } from '@/hooks/useXAutomation';
import { cn } from '@/lib/utils';
import { DraftsList, ScheduledList, ScheduleTweetDialog } from './x-automation';
import { XTweetDraft, XScheduledTweet } from '@/services/xDatabaseService';

export function XAutomationPanel() {
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  
  // Generation options
  const [tone, setTone] = useState<'professional' | 'casual' | 'witty' | 'informative'>('professional');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [threadCount, setThreadCount] = useState(1);
  const [model, setModel] = useState<'grok-3' | 'grok-3-fast'>('grok-3');

  // Schedule dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [contentToSchedule, setContentToSchedule] = useState('');
  const [draftToSchedule, setDraftToSchedule] = useState<XTweetDraft | null>(null);

  // State for posting
  const [postingDraftId, setPostingDraftId] = useState<string | null>(null);

  const {
    generateTweet,
    isGeneratingTweet,
    generatedTweet,
    analyzeTrends,
    isAnalyzingTrends,
    trendAnalysis,
    generateImage,
    isGeneratingImage,
    generatedImage,
    drafts,
    isLoadingDrafts,
    scheduledTweets,
    isLoadingScheduled,
    selectedDraft,
    setSelectedDraft,
    saveDraft,
    deleteDraft,
    toggleFavorite,
    scheduleTweet,
    isSchedulingTweet,
    cancelScheduledTweet,
    deleteScheduledTweet,
    copyToClipboard,
    // X Posting
    postTweet,
    postThread,
    isPosting,
    isXApiConfigured,
    xApiAccount,
  } = useXAutomation();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await generateTweet({
      prompt,
      options: { model, tone, includeHashtags, threadCount },
    });
  };

  const handleAnalyze = async () => {
    if (!analysisQuery.trim()) return;
    await analyzeTrends({ topic: analysisQuery, options: { model } });
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    await generateImage({ prompt: imagePrompt });
  };

  const handleOpenScheduleDialog = (content: string, draft?: XTweetDraft) => {
    setContentToSchedule(content);
    setDraftToSchedule(draft || null);
    setScheduleDialogOpen(true);
  };

  const handleSchedule = async (scheduledFor: string, timezone: string) => {
    await scheduleTweet({
      content: contentToSchedule,
      scheduled_for: scheduledFor,
      timezone,
      type: draftToSchedule?.type || 'tweet',
      hashtags: draftToSchedule?.hashtags || [],
      draft_id: draftToSchedule?.id,
    });
    setScheduleDialogOpen(false);
    setContentToSchedule('');
    setDraftToSchedule(null);
  };

  const handleNewDraft = () => {
    setActiveTab('generate');
  };

  const handleEditDraft = (draft: XTweetDraft) => {
    setPrompt(draft.content);
    setActiveTab('generate');
  };

  const handleEditScheduled = (tweet: XScheduledTweet) => {
    setPrompt(tweet.content);
    setActiveTab('generate');
  };

  const handlePostDraft = async (draft: XTweetDraft) => {
    setPostingDraftId(draft.id);
    try {
      if (draft.type === 'thread') {
        // Split content into individual tweets for thread
        const tweets = draft.content.split('\n\n').filter(t => t.trim());
        await postThread(tweets);
      } else {
        await postTweet(draft.content);
      }
    } finally {
      setPostingDraftId(null);
    }
  };

  const getCharacterCount = (text: string) => text.length;

  const getCharacterColor = (count: number) => {
    if (count > 280) return 'text-destructive';
    if (count > 250) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">X Automation</h2>
              <p className="text-xs text-muted-foreground">Powered by Grok</p>
            </div>
          </div>
          {isXApiConfigured && xApiAccount && (
            <Badge variant="outline" className="text-xs gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              @{xApiAccount.username}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid grid-cols-4">
          <TabsTrigger value="generate" className="gap-1.5 text-xs">
            <Send className="h-3 w-3" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="analyze" className="gap-1.5 text-xs">
            <TrendingUp className="h-3 w-3" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-1.5 text-xs">
            <ImageIcon className="h-3 w-3" />
            Image
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-1.5 text-xs">
            <Settings className="h-3 w-3" />
            Manage
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          {/* Generate Tab */}
          <TabsContent value="generate" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Tweet Composer</CardTitle>
                <CardDescription className="text-xs">
                  Describe what you want to post and let Grok create engaging content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">What do you want to tweet about?</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., Announce our new AI feature launch with excitement..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select value={model} onValueChange={(v) => setModel(v as typeof model)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grok-3">Grok-3 (Best quality)</SelectItem>
                        <SelectItem value="grok-3-fast">Grok-3 Fast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="witty">Witty</SelectItem>
                        <SelectItem value="informative">Informative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Thread Size</Label>
                    <Select 
                      value={threadCount.toString()} 
                      onValueChange={(v) => setThreadCount(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Single Tweet</SelectItem>
                        <SelectItem value="3">3-Tweet Thread</SelectItem>
                        <SelectItem value="5">5-Tweet Thread</SelectItem>
                        <SelectItem value="10">10-Tweet Thread</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between pt-6">
                    <Label htmlFor="hashtags" className="text-sm">Include Hashtags</Label>
                    <Switch
                      id="hashtags"
                      checked={includeHashtags}
                      onCheckedChange={setIncludeHashtags}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleGenerate}
                  disabled={isGeneratingTweet || !prompt.trim()}
                >
                  {isGeneratingTweet ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Tweet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Result */}
            {generatedTweet && generatedTweet.tweets && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Generated Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {generatedTweet.tweets.map((tweet, index) => (
                    <div key={index} className="space-y-2">
                      <div className="relative p-3 rounded-lg bg-muted/50 border">
                        <p className="text-sm whitespace-pre-wrap pr-8">{tweet}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => copyToClipboard(tweet)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn(getCharacterColor(getCharacterCount(tweet)))}>
                          {getCharacterCount(tweet)}/280 characters
                        </span>
                        {generatedTweet.tweets.length > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {index + 1}/{generatedTweet.tweets.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {generatedTweet.hashtags && generatedTweet.hashtags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-2">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      {generatedTweet.hashtags.map((tag, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="text-xs cursor-pointer"
                          onClick={() => copyToClipboard(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {generatedTweet.suggestedPostTime && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <Clock className="h-3 w-3" />
                      Best time: {generatedTweet.suggestedPostTime}
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => copyToClipboard(generatedTweet.tweets.join('\n\n'))}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy All
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleOpenScheduleDialog(generatedTweet.tweets.join('\n\n'))}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Drafts Preview */}
            {drafts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Recent Drafts</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('manage')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {drafts.slice(0, 3).map((draft) => (
                    <div 
                      key={draft.id} 
                      className={cn(
                        "p-2 rounded-lg border cursor-pointer transition-colors",
                        selectedDraft?.id === draft.id 
                          ? "bg-primary/10 border-primary" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedDraft(draft)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs line-clamp-2">{draft.content}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDraft(draft.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {draft.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(draft.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Trend Analysis</CardTitle>
                <CardDescription className="text-xs">
                  Get real-time insights on topics, hashtags, or competitors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="analysis">Topic or Query</Label>
                  <Input
                    id="analysis"
                    placeholder="e.g., AI productivity tools, #TechTwitter, @competitor"
                    value={analysisQuery}
                    onChange={(e) => setAnalysisQuery(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleAnalyze}
                  disabled={isAnalyzingTrends || !analysisQuery.trim()}
                >
                  {isAnalyzingTrends ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analyze Trends
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {trendAnalysis && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Analysis: {trendAnalysis.topic}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trendAnalysis.trendScore !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trend Score</span>
                      <Badge 
                        variant={trendAnalysis.trendScore > 70 ? 'default' : 'secondary'}
                      >
                        {trendAnalysis.trendScore}/100
                      </Badge>
                    </div>
                  )}

                  {trendAnalysis.sentiment && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sentiment</span>
                      <Badge variant="outline" className="capitalize">
                        {trendAnalysis.sentiment}
                      </Badge>
                    </div>
                  )}

                  {trendAnalysis.keyInsights && trendAnalysis.keyInsights.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Lightbulb className="h-4 w-4" />
                          Key Insights
                        </div>
                        <ul className="space-y-1">
                          {trendAnalysis.keyInsights.map((insight, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {trendAnalysis.recommendedHashtags && trendAnalysis.recommendedHashtags.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Hash className="h-4 w-4" />
                          Recommended Hashtags
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {trendAnalysis.recommendedHashtags.map((tag, i) => (
                            <Badge 
                              key={i} 
                              variant="secondary" 
                              className="cursor-pointer"
                              onClick={() => copyToClipboard(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {trendAnalysis.bestPostingTimes && trendAnalysis.bestPostingTimes.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="h-4 w-4" />
                          Best Posting Times
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {trendAnalysis.bestPostingTimes.map((time, i) => (
                            <Badge key={i} variant="outline">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {trendAnalysis.contentAngles && trendAnalysis.contentAngles.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Content Angles</div>
                        <ul className="space-y-1">
                          {trendAnalysis.contentAngles.map((angle, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">{i + 1}.</span>
                              {angle}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {trendAnalysis.analysis && (
                    <>
                      <Separator />
                      <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {trendAnalysis.analysis}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Image Tab */}
          <TabsContent value="image" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Image Generator</CardTitle>
                <CardDescription className="text-xs">
                  Create eye-catching visuals for your X posts using Grok-2-image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imagePrompt">Describe your image</Label>
                  <Textarea
                    id="imagePrompt"
                    placeholder="e.g., A futuristic cityscape with flying cars and neon lights, cinematic style..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Image */}
            {generatedImage && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Generated Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedImage.imageUrl ? (
                    <div className="space-y-3">
                      <div className="relative aspect-square rounded-lg overflow-hidden border">
                        <img 
                          src={generatedImage.imageUrl} 
                          alt="Generated" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {generatedImage.revisedPrompt && (
                        <p className="text-xs text-muted-foreground">
                          {generatedImage.revisedPrompt}
                        </p>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(generatedImage.imageUrl!, '_blank')}
                      >
                        Open Full Size
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{generatedImage.error || 'No image generated'}</p>
                      {generatedImage.suggestion && (
                        <p className="text-xs mt-2">{generatedImage.suggestion}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="mt-0 space-y-6">
            <DraftsList
              drafts={drafts}
              isLoading={isLoadingDrafts}
              onEdit={handleEditDraft}
              onDelete={(id) => deleteDraft(id)}
              onSchedule={(draft) => handleOpenScheduleDialog(draft.content, draft)}
              onCopy={copyToClipboard}
              onToggleFavorite={(id) => toggleFavorite(id)}
              onNewDraft={handleNewDraft}
              onPostNow={handlePostDraft}
              isPosting={isPosting}
              postingDraftId={postingDraftId}
              isXApiConfigured={isXApiConfigured}
            />

            <Separator />

            <ScheduledList
              scheduledTweets={scheduledTweets}
              isLoading={isLoadingScheduled}
              onEdit={handleEditScheduled}
              onDelete={(id) => deleteScheduledTweet(id)}
              onCancel={(id) => cancelScheduledTweet(id)}
              onCopy={copyToClipboard}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <ScheduleTweetDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        content={contentToSchedule}
        onSchedule={handleSchedule}
        isLoading={isSchedulingTweet}
      />
    </div>
  );
}
