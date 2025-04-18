
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
import { Editor, Transforms, Text } from "slate";

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

const deserialize = (html: string): Descendant[] => {
  // Start with plain text deserialization
  if (!html || html.trim() === "") {
    return [{ 
      type: 'paragraph' as const, 
      children: [{ text: '' }] 
    }];
  }

  // Try to parse HTML if it's HTML
  try {
    // Simple deserialization for now, just extract text with paragraphs
    // In a real app, you'd want a more sophisticated HTML parser
    const div = document.createElement('div');
    div.innerHTML = html;
    const paragraphs = Array.from(div.childNodes).map(node => {
      return {
        type: 'paragraph' as const,
        children: [{ text: node.textContent || '' }]
      };
    });
    
    return paragraphs.length ? paragraphs : [{ 
      type: 'paragraph' as const, 
      children: [{ text: html }] 
    }];
  } catch (error) {
    // If parsing fails, treat as plain text
    return [{ 
      type: 'paragraph' as const, 
      children: [{ text: html }] 
    }];
  }
};

const serialize = (nodes: Descendant[]): string => {
  // Convert the Slate nodes to HTML
  return nodes.map(node => {
    if (!SlateElement.isElement(node)) {
      const text = node.text || '';
      let result = text;
      if (node.bold) result = `<strong>${result}</strong>`;
      if (node.italic) result = `<em>${result}</em>`;
      if (node.underline) result = `<u>${result}</u>`;
      return result;
    }

    const element = node as CustomElement;
    const children = element.children.map(child => {
      let text = child.text || '';
      if (child.bold) text = `<strong>${text}</strong>`;
      if (child.italic) text = `<em>${text}</em>`;
      if (child.underline) text = `<u>${text}</u>`;
      return text;
    }).join('');

    switch (element.type) {
      case 'paragraph':
        return `<p>${children}</p>`;
      case 'heading-one':
        return `<h1>${children}</h1>`;
      case 'heading-two':
        return `<h2>${children}</h2>`;
      case 'heading-three':
        return `<h3>${children}</h3>`;
      case 'blockquote':
        return `<blockquote>${children}</blockquote>`;
      case 'bulleted-list':
        return `<ul>${children}</ul>`;
      case 'numbered-list':
        return `<ol>${children}</ol>`;
      case 'list-item':
        return `<li>${children}</li>`;
      case 'link':
        return `<a href="${element.url}">${children}</a>`;
      case 'image':
        return `<img src="${element.url}" alt="" />`;
      default:
        return children;
    }
  }).join('');
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
};

// Define a set of helpers to toggle block types
const toggleBlock = (editor: Editor, format: CustomElement['type']) => {
  const isActive = isBlockActive(editor, format);
  const isList = ['numbered-list', 'bulleted-list'].includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ['bulleted-list', 'numbered-list'].includes((n as CustomElement).type),
    split: true,
  });

  const newType = isActive ? 'paragraph' : format === 'list-item' ? 'paragraph' : format;

  Transforms.setNodes(editor, {
    type: newType,
  } as Partial<CustomElement>);

  if (!isActive && isList) {
    const block = { type: format, children: [] } as CustomElement;
    Transforms.wrapNodes(editor, block);
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
  const initialValue = useMemo<Descendant[]>(() => deserialize(value), [value]);

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
          />
        </div>
      </Slate>
    </div>
  );
};
