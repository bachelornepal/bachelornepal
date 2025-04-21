
import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export function TinyMCEEditor({ value, onChange }: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);

  // This function will be called when an image is uploaded through TinyMCE
  const handleImageUpload = async (blobInfo: any, progress: (percent: number) => void) => {
    try {
      const file = blobInfo.blob();
      const fileExt = file.name ? file.name.split('.').pop() : 'png';
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      // Show upload progress
      progress(10);
      
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

      progress(90);

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      progress(100);
      
      return publicUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Error uploading image",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return '';
    }
  };

  return (
    <Editor
      apiKey="dqu84przz81dvx5ud4fih9fyrii3d8cx2ine3n6sre7awaov"
      onInit={(evt, editor) => editorRef.current = editor}
      initialValue={value}
      value={value}
      init={{
        height: 500,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | image link media | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        images_upload_handler: handleImageUpload,
        image_advtab: true,
        image_dimensions: false,
        // Enables automatic URLs
        relative_urls: false,
        remove_script_host: false,
        convert_urls: false,
        // Increase timeout for image uploads
        images_upload_timeout: 30000,
        // Setting this to false allows use of TinyMCE on any domain
        referrer_policy: 'origin',
        // Add this line to properly update content
        setup: (editor) => {
          editor.on('change', () => {
            onChange(editor.getContent());
          });
        }
      }}
      onEditorChange={(content) => {
        onChange(content);
      }}
    />
  );
}
