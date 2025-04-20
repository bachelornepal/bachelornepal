
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

export function ImageUpload({ onImageUploaded, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {currentImage && (
        <div className="relative w-full max-w-md aspect-[1200/628] border rounded-lg overflow-hidden bg-muted">
          <img 
            src={currentImage} 
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
