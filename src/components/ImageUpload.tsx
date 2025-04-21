
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Images } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MediaPicker } from "./MediaPicker";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  withPicker?: boolean;
}

export function ImageUpload({ onImageUploaded, currentImage, withPicker = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | undefined>(currentImage);
  const [mode, setMode] = useState<"upload" | "select">(withPicker ? "select" : "upload");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      // Upload to blog-images bucket
      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) {
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      // Update the preview image
      setPreviewImage(publicUrl);

      toast({ title: "Image uploaded successfully" });
      onImageUploaded(publicUrl);
    } catch (error) {
      console.error("ImageUpload handleFileUpload error:", error);
      toast({
        title: "Error uploading image",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Used when selecting existing images
  const handlePick = (url: string) => {
    setPreviewImage(url);
    onImageUploaded(url);
  };

  return (
    <div className="space-y-4">
      {previewImage && (
        <div className="relative w-full max-w-md aspect-[1200/628] border rounded-lg overflow-hidden bg-muted mb-2">
          <img
            src={previewImage}
            alt="Featured"
            className="absolute w-full h-full object-cover"
          />
        </div>
      )}
      {withPicker && (
        <div className="flex gap-2 mb-3">
          <Button
            type="button"
            variant={mode === "select" ? "default" : "outline"}
            onClick={() => setMode("select")}
            size="sm"
          >
            <Images className="w-4 h-4 mr-1" /> Select from Library
          </Button>
          <Button
            type="button"
            variant={mode === "upload" ? "default" : "outline"}
            onClick={() => setMode("upload")}
            size="sm"
          >
            <Upload className="w-4 h-4 mr-1" /> Upload New Image
          </Button>
        </div>
      )}
      {(mode === "upload" || !withPicker) && (
        <div>
          <input
            type="file"
            id="featured-image"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="featured-image">
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={uploading}
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Featured Image"}
              </span>
            </Button>
          </label>
        </div>
      )}
      {withPicker && mode === "select" && (
        <MediaPicker onSelect={handlePick} selectedImage={previewImage} />
      )}
    </div>
  );
}
