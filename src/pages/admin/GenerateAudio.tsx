import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Check, Music, Mic } from "lucide-react";
import { toast } from "sonner";

interface AudioItem {
  id: string;
  filename: string;
  type: "music" | "narration";
  prompt?: string;
  text?: string;
  duration?: number;
  status: "pending" | "generating" | "ready" | "error";
  blob?: Blob;
}

const audioItems: Omit<AudioItem, "status" | "blob">[] = [
  {
    id: "background-music",
    filename: "background-music.mp3",
    type: "music",
    prompt: "Ambient electronic tech music, 24 seconds, building progression from soft intro to confident peak then resolving, modern futuristic cinematic sound, suitable for product demo video",
    duration: 24,
  },
  {
    id: "narration-intro",
    filename: "narration-intro.mp3",
    type: "narration",
    text: "Welcome to Kernel. Your AI Development OS.",
  },
  {
    id: "narration-describe",
    filename: "narration-describe.mp3",
    type: "narration",
    text: "Simply describe what you want to build in plain English.",
  },
  {
    id: "narration-generate",
    filename: "narration-generate.mp3",
    type: "narration",
    text: "Watch as AI writes production-ready code in real time.",
  },
  {
    id: "narration-deploy",
    filename: "narration-deploy.mp3",
    type: "narration",
    text: "Deploy instantly with a single click. No configuration needed.",
  },
  {
    id: "narration-complete",
    filename: "narration-complete.mp3",
    type: "narration",
    text: "From idea to live app in minutes. That's Kernel.",
  },
];

export default function GenerateAudio() {
  const [items, setItems] = useState<AudioItem[]>(
    audioItems.map((item) => ({ ...item, status: "pending" }))
  );
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const updateItem = (id: string, updates: Partial<AudioItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const generateMusic = async (item: AudioItem) => {
    updateItem(item.id, { status: "generating" });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-music`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: item.prompt,
            duration: item.duration,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Music generation failed: ${response.status}`);
      }

      const blob = await response.blob();
      updateItem(item.id, { status: "ready", blob });
      toast.success(`Generated ${item.filename}`);
    } catch (error) {
      console.error(`Failed to generate ${item.filename}:`, error);
      updateItem(item.id, { status: "error" });
      toast.error(`Failed to generate ${item.filename}`);
    }
  };

  const generateNarration = async (item: AudioItem) => {
    updateItem(item.id, { status: "generating" });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: item.text,
            voiceId: "JBFqnCBsd6RMkjVDRZzb", // George voice
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const blob = await response.blob();
      updateItem(item.id, { status: "ready", blob });
      toast.success(`Generated ${item.filename}`);
    } catch (error) {
      console.error(`Failed to generate ${item.filename}:`, error);
      updateItem(item.id, { status: "error" });
      toast.error(`Failed to generate ${item.filename}`);
    }
  };

  const generateItem = async (item: AudioItem) => {
    if (item.type === "music") {
      await generateMusic(item);
    } else {
      await generateNarration(item);
    }
  };

  const generateAll = async () => {
    setIsGeneratingAll(true);
    for (const item of items) {
      if (item.status !== "ready") {
        await generateItem(item);
      }
    }
    setIsGeneratingAll(false);
    toast.success("All audio files generated!");
  };

  const downloadItem = (item: AudioItem) => {
    if (!item.blob) return;

    const url = URL.createObjectURL(item.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    items.filter((item) => item.blob).forEach(downloadItem);
  };

  const allReady = items.every((item) => item.status === "ready");
  const anyReady = items.some((item) => item.status === "ready");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Audio Asset Generator</h1>
          <p className="text-muted-foreground">
            Generate and download audio files for the HowItWorks video component.
          </p>
          <p className="text-sm text-muted-foreground">
            After downloading, place files in <code className="bg-muted px-2 py-1 rounded">public/audio/</code>
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={generateAll} disabled={isGeneratingAll || allReady} size="lg">
            {isGeneratingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : allReady ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                All Generated
              </>
            ) : (
              "Generate All Audio"
            )}
          </Button>

          {anyReady && (
            <Button onClick={downloadAll} variant="outline" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className={item.status === "ready" ? "border-green-500/50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.type === "music" ? (
                      <Music className="h-5 w-5 text-primary" />
                    ) : (
                      <Mic className="h-5 w-5 text-primary" />
                    )}
                    <CardTitle className="text-lg">{item.filename}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "generating" && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {item.status === "ready" && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {item.status === "ready" && item.blob && (
                      <Button size="sm" variant="outline" onClick={() => downloadItem(item)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {item.status !== "ready" && item.status !== "generating" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => generateItem(item)}
                        disabled={isGeneratingAll}
                      >
                        Generate
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {item.type === "music" ? item.prompt : `"${item.text}"`}
                </CardDescription>
                {item.blob && (
                  <audio
                    controls
                    className="w-full mt-3"
                    src={URL.createObjectURL(item.blob)}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
