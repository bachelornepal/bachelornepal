import { useCallback, useMemo } from "react";
import { createEditor, Descendant, BaseEditor, Element as SlateElement } from "slate";
import { 
  Slate, 
  Editable, 
  withReact, 
  ReactEditor, 
  RenderElementProps, 
  RenderLeafProps,
  useSlate 
} from "slate-react";
import { withHistory, HistoryEditor } from "slate-history";
import { Button } from "@/components/ui/button";
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
import { Editor, Transforms, Text, Element, Node } from "slate";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Define the Slate custom types
type CustomElement = {
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 
         'blockquote' | 'bulleted-list' | 'numbered-list' | 'list-item' |
         'link' | 'image';
  align?: 'left' | 'center' | 'right';
  url?: string;
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Create a default paragraph node
const createDefaultNode = (): CustomElement => ({
  type: 'paragraph',
  children: [{ text: '' }]
});

// Create a default editor content structure
const createDefaultEditorContent = (): Descendant[] => {
  return [createDefaultNode()];
};

const deserialize = (html: string): Descendant[] => {
  try {
    // First, try to parse it as JSON (if it was previously saved as JSON)
    const parsed = JSON.parse(html);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Basic validation to ensure the structure is valid
      const isValid = parsed.every(node => {
        if (!node || typeof node !== 'object') return false;
        if (!('type' in node) || !('children' in node)) return false;
        if (!Array.isArray(node.children)) return false;
        // Every child must have a 'text' property
        if (node.type === 'list-item' || node.type === 'bulleted-list' || node.type === 'numbered-list') {
          return node.children.every(child => 
            child && typeof child === 'object' && 'children' in child &&
            Array.isArray(child.children) && child.children.every(textNode => 'text' in textNode)
          );
        }
        return node.children.every(child => child && typeof child === 'object' && 'text' in child);
      });

      if (isValid) {
        return fixNodeStructure(parsed);
      }
    }
  } catch (e) {
    // Not valid JSON, continue with other deserialization attempts
    console.log("Error parsing JSON:", e);
  }

  // If it's empty or not valid JSON, provide an empty paragraph
  if (!html || html.trim() === "") {
    return createDefaultEditorContent();
  }

  // Handle HTML content
  try {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Simple parsing of common HTML elements
    const parsed = Array.from(div.childNodes).map(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        return {
          type: 'paragraph' as const,
          children: [{ text: node.textContent || '' }]
        };
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
          case 'h1':
            return {
              type: 'heading-one' as const,
              children: [{ text: element.textContent || '' }]
            };
          case 'h2':
            return {
              type: 'heading-two' as const,
              children: [{ text: element.textContent || '' }]
            };
          case 'h3':
            return {
              type: 'heading-three' as const,
              children: [{ text: element.textContent || '' }]
            };
          case 'blockquote':
            return {
              type: 'blockquote' as const,
              children: [{ text: element.textContent || '' }]
            };
          case 'ul':
            return {
              type: 'bulleted-list' as const,
              children: Array.from(element.children).map(li => ({
                type: 'list-item' as const,
                children: [{ text: li.textContent || '' }]
              }))
            };
          case 'ol':
            return {
              type: 'numbered-list' as const,
              children: Array.from(element.children).map(li => ({
                type: 'list-item' as const,
                children: [{ text: li.textContent || '' }]
              }))
            };
          default:
            // Default to paragraph for other elements
            return {
              type: 'paragraph' as const,
              children: [{ text: element.textContent || '' }]
            };
        }
      }
      
      // Fallback
      return {
        type: 'paragraph' as const,
        children: [{ text: node.textContent || '' }]
      };
    });
    
    // Ensure we have at least one node
    const result = parsed.length ? fixNodeStructure(parsed) : createDefaultEditorContent();
    return result;
  } catch (error) {
    console.error("Error deserializing content:", error);
    // If all else fails, just return the content as plain text
    return [{ 
      type: 'paragraph' as const, 
      children: [{ text: html || '' }] 
    }];
  }
};

// Helper function to ensure proper node structure
const fixNodeStructure = (nodes: any[]): Descendant[] => {
  // Ensure all nodes have proper children
  return nodes.map(node => {
    // Handle list types differently
    if (node.type === 'bulleted-list' || node.type === 'numbered-list') {
      // Ensure list items have proper structure
      const children = Array.isArray(node.children) ? node.children.map((item: any) => {
        // Make sure each list item has a children array with at least one text node
        const itemChildren = Array.isArray(item.children) && item.children.length > 0
          ? item.children.map((child: any) => {
              // If child is already a text node, use it
              if (typeof child.text === 'string') return child;
              // Otherwise, try to convert it
              if (child.children && Array.isArray(child.children)) {
                return { text: child.children.map((c: any) => c.text || '').join('') };
              }
              return { text: '' };
            })
          : [{ text: '' }];

        return {
          type: 'list-item',
          children: itemChildren
        };
      }) : [{ type: 'list-item', children: [{ text: '' }] }];

      return {
        type: node.type,
        children
      };
    }

    // For non-list types, ensure children are text nodes
    let children = Array.isArray(node.children) ? node.children : [];
    
    // If children is empty or doesn't contain text nodes, create a default text node
    if (children.length === 0 || !children.some(child => typeof child.text === 'string')) {
      children = [{ text: '' }];
    }

    return {
      type: node.type || 'paragraph',
      ...(node.align && { align: node.align }),
      ...(node.url && { url: node.url }),
      children
    };
  });
};

const serialize = (nodes: Descendant[]): string => {
  // Make sure we're not saving empty/invalid nodes
  const validNodes = nodes.filter(n => {
    if (!n) return false;
    // Element nodes must have children
    if (SlateElement.isElement(n)) {
      return Array.isArray(n.children) && n.children.length > 0;
    }
    return true;
  });

  // Return an empty string if there are no valid nodes
  if (validNodes.length === 0) {
    return '';
  }

  // Save as JSON to preserve structure
  return JSON.stringify(validNodes);
};

// Define a set of helpers to check if the current selection has a mark
const isMarkActive = (editor: Editor, format: keyof Omit<CustomText, 'text'>) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Define a set of helpers to toggle marks
const toggleMark = (editor: Editor, format: keyof Omit<CustomText, 'text'>) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Define a set of helpers to check if the current selection has a block type
const isBlockActive = (editor: Editor, format: CustomElement['type'], blockType = 'type') => {
  const { selection } = editor;
  if (!selection) return false;

  try {
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          (n as CustomElement)[blockType as keyof CustomElement] === format,
      })
    );

    return !!match;
  } catch (error) {
    console.error("Error checking block active state:", error);
    return false;
  }
};

// Define a set of helpers to toggle block types
const toggleBlock = (editor: Editor, format: CustomElement['type']) => {
  try {
    const isActive = isBlockActive(editor, format);
    const isList = ['numbered-list', 'bulleted-list'].includes(format);

    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ['bulleted-list', 'numbered-list'].includes((n as CustomElement).type),
      split: true,
    });

    if (isActive) {
      Transforms.setNodes(editor, {
        type: 'paragraph'
      } as Partial<CustomElement>);
    } else {
      if (isList) {
        Transforms.setNodes(editor, {
          type: 'list-item'
        } as Partial<CustomElement>);
        
        const block = { type: format, children: [] } as CustomElement;
        Transforms.wrapNodes(editor, block);
      } else {
        Transforms.setNodes(editor, {
          type: format
        } as Partial<CustomElement>);
      }
    }
  } catch (error) {
    console.error("Error toggling block:", error);
  }
};

// Define a button component for marks
const MarkButton = ({ format, icon: Icon }: { format: keyof Omit<CustomText, 'text'>, icon: React.FC<any> }) => {
  const editor = useSlate();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      className={isMarkActive(editor, format) ? "bg-muted" : ""}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};

// Define a button component for blocks
const BlockButton = ({ format, icon: Icon }: { format: CustomElement['type'], icon: React.FC<any> }) => {
  const editor = useSlate();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      className={isBlockActive(editor, format) ? "bg-muted" : ""}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};

export const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // Keep track of state for the value of the editor
  const initialValue = useMemo<Descendant[]>(() => {
    try {
      const content = deserialize(value);
      return content;
    } catch (error) {
      console.error("Error initializing editor with value:", error);
      return createDefaultEditorContent();
    }
  }, [value]);

  const renderElement = useCallback((props: RenderElementProps) => {
    const element = props.element as CustomElement;
    
    switch (element.type) {
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
        return <a {...props.attributes} href={element.url} className="text-blue-500 underline">{props.children}</a>;
      case 'image':
        return (
          <div {...props.attributes} contentEditable={false} className="my-4">
            <img src={element.url} className="max-w-full h-auto" alt="" />
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

  return (
    <div className="border rounded-md overflow-hidden">
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={value => {
          try {
            const isAstChange = editor.operations.some(
              op => op.type !== 'set_selection'
            );
            if (isAstChange) {
              // Save the value to form field
              onChange(serialize(value));
            }
          } catch (error) {
            console.error("Error in Slate onChange:", error);
          }
        }}
      >
        <div className="border-b bg-muted p-2 flex flex-wrap gap-1">
          <MarkButton format="bold" icon={Bold} />
          <MarkButton format="italic" icon={Italic} />
          <MarkButton format="underline" icon={Underline} />
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <BlockButton format="heading-one" icon={Heading1} />
          <BlockButton format="heading-two" icon={Heading2} />
          <BlockButton format="heading-three" icon={Heading3} />
          <div className="w-px h-6 bg-border mx-1 self-center" />
          <BlockButton format="bulleted-list" icon={List} />
          <BlockButton format="numbered-list" icon={ListOrdered} />
          <BlockButton format="blockquote" icon={Quote} />
          <div className="w-px h-6 bg-border mx-1 self-center" />
          {/* Disabled buttons below until we implement their functionality */}
          <Button variant="ghost" size="icon" type="button" disabled>
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button" disabled>
            <Image className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 self-center" />
          {/* Disabled alignment buttons for now */}
          <Button variant="ghost" size="icon" type="button" disabled>
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button" disabled>
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" type="button" disabled>
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
            onKeyDown={(event) => {
              // Add any key handlers if needed
            }}
          />
        </div>
      </Slate>
    </div>
  );
};
