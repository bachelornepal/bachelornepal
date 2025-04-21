
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

export function ImageUpload({ onImageUploaded, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | undefined>(currentImage);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      console.log(`Preparing to upload file to path: ${filePath}`);

      // Upload to blog-images bucket
      const { error: uploadError, data } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        throw uploadError;
      }

      console.log('Upload successful, data:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);
      
      // Update the preview image
      setPreviewImage(publicUrl);
      
      toast.success("Image uploaded successfully");
      onImageUploaded(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Error uploading image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {previewImage && (
        <div className="relative w-full max-w-md aspect-[1200/628] border rounded-lg overflow-hidden bg-muted">
          <img 
            src={previewImage} 
            alt="Featured" 
            className="absolute w-full h-full object-cover"
          />
        </div>
      )}
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
              {uploading ? 'Uploading...' : 'Upload Featured Image'}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}
