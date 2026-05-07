'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

interface PostEditorProps {
  value: string
  onChange: (html: string) => void
}

export default function PostEditor({ value, onChange }: PostEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Bắt đầu viết bài...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap gap-1 border-b bg-gray-50 p-2">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <em>I</em>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
          <s>S</s>
        </Btn>
        <span className="mx-1 w-px bg-gray-200" />
        {([1, 2, 3] as const).map(level => (
          <Btn
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            active={editor.isActive('heading', { level })}
            title={`Heading ${level}`}
          >
            H{level}
          </Btn>
        ))}
        <span className="mx-1 w-px bg-gray-200" />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách">
          •
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách số">
          1.
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Trích dẫn">
          ❝
        </Btn>
        <span className="mx-1 w-px bg-gray-200" />
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          `
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          {'</>'}
        </Btn>
        <span className="mx-1 w-px bg-gray-200" />
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Kẻ ngang">
          —
        </Btn>
        <Btn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
          ↩
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
          ↪
        </Btn>
      </div>
      <EditorContent editor={editor} className="blog-content min-h-[300px] cursor-text p-4" />
    </div>
  )
}

function Btn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded px-2 py-1 text-sm font-mono ${active ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
    >
      {children}
    </button>
  )
}
