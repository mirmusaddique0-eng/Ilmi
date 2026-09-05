import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import "./RichTextEditor.css";

const looksLikeHtml = (value) =>
  /<([a-z][a-z0-9]*)\b[^>]*>/i.test(String(value || ""));

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const plainTextToHtml = (value) => {
  const text = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  if (!text.trim()) return "<p></p>";

  return text
    .split("\n")
    .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
    .join("");
};

function RichTextEditor({
  value = "",
  onChange,
  disabled = false,
  placeholder = "Write lesson content here...",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: looksLikeHtml(value)
      ? value
      : plainTextToHtml(value),
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "rte-prose",
        "data-placeholder": placeholder,
      },
      handlePaste(view, event) {
        // TipTap's normal paste pipeline is intentionally used here.
        // It reads HTML from Word/Google Docs/web pages when available
        // and converts supported formatting into editor content.
        return false;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;

    const nextContent = looksLikeHtml(value)
      ? value
      : plainTextToHtml(value);

    const currentContent = editor.getHTML();

    if (nextContent !== currentContent) {
      editor.commands.setContent(nextContent, false);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="rte-loading">
        Loading editor...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  return (
    <div className="rte-wrapper">
      <div className="rte-toolbar">
        <div className="rte-toolbar-group">
          <button
            type="button"
            className={editor.isActive("bold") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
            title="Bold"
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            className={editor.isActive("italic") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
            title="Italic"
          >
            <em>I</em>
          </button>

          <button
            type="button"
            className={editor.isActive("underline") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={disabled}
            title="Underline"
          >
            <u>U</u>
          </button>
        </div>

        <div className="rte-toolbar-group">
          <button
            type="button"
            className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            disabled={disabled}
            title="Heading 1"
          >
            H1
          </button>

          <button
            type="button"
            className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            disabled={disabled}
            title="Heading 2"
          >
            H2
          </button>

          <button
            type="button"
            className={editor.isActive("heading", { level: 3 }) ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            disabled={disabled}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="rte-toolbar-group">
          <button
            type="button"
            className={editor.isActive({ textAlign: "left" }) ? "active" : ""}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            disabled={disabled}
            title="Align left"
          >
            ≡
          </button>

          <button
            type="button"
            className={editor.isActive({ textAlign: "center" }) ? "active" : ""}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            disabled={disabled}
            title="Align center"
          >
            ≡
          </button>

          <button
            type="button"
            className={editor.isActive({ textAlign: "right" }) ? "active" : ""}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            disabled={disabled}
            title="Align right"
          >
            ≡
          </button>
        </div>

        <div className="rte-toolbar-group">
          <button
            type="button"
            className={editor.isActive("bulletList") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            title="Bullet list"
          >
            • List
          </button>

          <button
            type="button"
            className={editor.isActive("orderedList") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            title="Numbered list"
          >
            1. List
          </button>

          <button
            type="button"
            className={editor.isActive("blockquote") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
            title="Quote"
          >
            Quote
          </button>

          <button
            type="button"
            className={editor.isActive("codeBlock") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            disabled={disabled}
            title="Code block"
          >
            Code
          </button>
        </div>

        <div className="rte-toolbar-group">
          <button
            type="button"
            className={editor.isActive("link") ? "active" : ""}
            onClick={setLink}
            disabled={disabled}
            title="Add link"
          >
            Link
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={disabled || !editor.isActive("link")}
            title="Remove link"
          >
            Unlink
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            disabled={disabled}
            title="Clear formatting"
          >
            Clear
          </button>
        </div>

        <div className="rte-toolbar-group rte-toolbar-history">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().undo()}
            title="Undo"
          >
            ↶
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().redo()}
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      <div className="rte-editor-area">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default RichTextEditor;
