import { useCallback, useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from "slate-react";
import { withHistory } from "slate-history";
import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/ui/toolbar";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link,
  Image
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Define the Slate custom types
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: {
      type: 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 
             'blockquote' | 'bulleted-list' | 'numbered-list' | 'list-item' |
             'link' | 'image';
      align?: 'left' | 'center' | 'right';
      url?: string;
      children: Descendant[];
    };
    Text: {
      text: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
    };
  }
}

// Import required types after declaration
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

const deserialize = (html: string): Descendant[] => {
  // Start with plain text deserialization
  if (!html || html.trim() === "") {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  // Try to parse HTML if it's HTML
  try {
    // Simple deserialization for now, just extract text with paragraphs
    // In a real app, you'd want a more sophisticated HTML parser
    const div = document.createElement('div');
    div.innerHTML = html;
    const paragraphs = Array.from(div.childNodes).map(node => {
      return {
        type: 'paragraph',
        children: [{ text: node.textContent || '' }]
      };
    });
    
    return paragraphs.length ? paragraphs : [{ type: 'paragraph', children: [{ text: html }] }];
  } catch (error) {
    // If parsing fails, treat as plain text
    return [{ type: 'paragraph', children: [{ text: html }] }];
  }
};

const serialize = (nodes: Descendant[]): string => {
  // Convert the Slate nodes to HTML
  return nodes.map(node => {
    if (!('type' in node)) {
      return node.text || '';
    }

    switch (node.type) {
      case 'paragraph':
        return `<p>${node.children.map(n => 'text' in n ? n.text : '').join('')}</p>`;
      case 'heading-one':
        return `<h1>${node.children.map(n => 'text' in n ? n.text : '').join('')}</h1>`;
      case 'heading-two':
        return `<h2>${node.children.map(n => 'text' in n ? n.text : '').join('')}</h2>`;
      case 'heading-three':
        return `<h3>${node.children.map(n => 'text' in n ? n.text : '').join('')}</h3>`;
      case 'blockquote':
        return `<blockquote>${node.children.map(n => 'text' in n ? n.text : '').join('')}</blockquote>`;
      case 'bulleted-list':
        return `<ul>${node.children.map(n => 'text' in n ? n.text : '').join('')}</ul>`;
      case 'numbered-list':
        return `<ol>${node.children.map(n => 'text' in n ? n.text : '').join('')}</ol>`;
      case 'list-item':
        return `<li>${node.children.map(n => 'text' in n ? n.text : '').join('')}</li>`;
      case 'link':
        return `<a href="${node.url}">${node.children.map(n => 'text' in n ? n.text : '').join('')}</a>`;
      case 'image':
        return `<img src="${node.url}" alt="" />`;
      default:
        return node.children.map(n => 'text' in n ? n.text : '').join('');
    }
  }).join('');
};

export const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // Keep track of state for the value of the editor
  const initialValue = useMemo(() => deserialize(value), [value]);

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'heading-one':
        return <h1 {...props.attributes} className="text-3xl font-bold mt-4 mb-2">{props.children}</h1>;
      case 'heading-two':
        return <h2 {...props.attributes} className="text-2xl font-bold mt-3 mb-2">{props.children}</h2>;
      case 'heading-three':
        return <h3 {...props.attributes} className="text-xl font-bold mt-2 mb-1">{props.children}</h3>;
      case 'blockquote':
        return <blockquote {...props.attributes} className="border-l-4 border-gray-200 pl-4 italic my-4">{props.children}</blockquote>;
      case 'bulleted-list':
        return <ul {...props.attributes} className="list-disc ml-5 my-2">{props.children}</ul>;
      case 'numbered-list':
        return <ol {...props.attributes} className="list-decimal ml-5 my-2">{props.children}</ol>;
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>;
      case 'link':
        return <a {...props.attributes} href={props.element.url} className="text-blue-500 underline">{props.children}</a>;
      case 'image':
        return (
          <div {...props.attributes} contentEditable={false} className="my-4">
            <img src={props.element.url} className="max-w-full h-auto" alt="" />
            {props.children}
          </div>
        );
      default:
        return <p {...props.attributes} className="my-2">{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { children } = props;
    
    if (props.leaf.bold) {
      children = <strong>{children}</strong>;
    }
    
    if (props.leaf.italic) {
      children = <em>{children}</em>;
    }
    
    if (props.leaf.underline) {
      children = <u>{children}</u>;
    }
    
    return <span {...props.attributes}>{children}</span>;
  }, []);

  // Define toolbar button actions
  const toggleFormat = (format: 'bold' | 'italic' | 'underline') => {
    // This is a simplified version - in a real editor you would implement
    // proper toggling of formats using Slate's transformations
    console.log(`Toggle format: ${format}`);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={value => {
          const isAstChange = editor.operations.some(
            op => op.type !== 'set_selection'
          );
          if (isAstChange) {
            // Save the value to form field
            onChange(serialize(value));
          }
        }}
      >
        <div className="border-b bg-muted p-2 flex flex-wrap gap-1">
          <Button variant="ghost" size="icon" type="button" onClick={() => toggleFormat('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button" onClick={() => toggleFormat('italic')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button" onClick={() => toggleFormat('underline')}>
            <Underline className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <Button variant="ghost" size="icon" type="button">
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button">
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button">
            <Heading3 className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <Button variant="ghost" size="icon" type="button">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button">
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button">
            <Quote className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <Button variant="ghost" size="icon" type="button">
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button">
            <Image className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <Button variant="ghost" size="icon" type="button">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button">
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 min-h-[200px] prose max-w-none">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Start writing..."
            spellCheck
            autoFocus
            className="outline-none min-h-[200px]"
          />
        </div>
      </Slate>
    </div>
  );
};
