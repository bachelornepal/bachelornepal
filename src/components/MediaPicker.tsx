
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MediaPickerProps {
  onSelect: (url: string) => void;
  selectedImage?: string;
}

interface MediaFile {
  name: string;
  url: string;
}

export function MediaPicker({ onSelect, selectedImage }: MediaPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const { data: files, error } = await supabase.storage
          .from("blog-images")
          .list("post-images");

        if (error) throw error;

        const filesWithUrls = await Promise.all(
          (files ?? []).map(async (file) => {
            const { data: { publicUrl } } = supabase.storage
              .from("blog-images")
              .getPublicUrl(`post-images/${file.name}`);

            return {
              name: file.name,
              url: publicUrl,
            };
          })
        );
        setFiles(filesWithUrls);
      } catch (error) {
        toast({
          title: "Failed to list images",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="space-y-2">
      <div className="font-medium flex items-center gap-2 mb-2">
        <ImageIcon className="w-4 h-4" />
        <span>Select Existing Image</span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="col-span-3 flex items-center">Loading...</div>
        ) : (
          files.length === 0 ? (
            <div className="col-span-3 text-sm text-muted-foreground">
              No images found.
            </div>
          ) : (
            files.map((file) => (
              <button
                key={file.name}
                type="button"
                className={`relative border rounded overflow-hidden aspect-[1200/628] group focus:outline-none ${selectedImage === file.url ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary/80"}`}
                onClick={() => onSelect(file.url)}
                tabIndex={0}
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                {selectedImage === file.url && (
                  <span className="absolute top-2 right-2 bg-primary text-white rounded px-1 text-xs">
                    Selected
                  </span>
                )}
              </button>
            ))
          )
        )}
      </div>
    </div>
  );
}
