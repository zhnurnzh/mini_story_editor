import React, { useCallback, useState, useRef, } from "react";
import { useToast } from "./ui/toast";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CustomImage } from "./extensions/ImageResize"
import Placeholder from "@tiptap/extension-placeholder";
import { validateImageFile } from './lib/ImageValidation';
import { formatBytes, MAX_IMAGE_BYTES } from "./lib/ImageValidation";



const STORAGE_KEY = "mini-story-editor:last";
export default function StoryEditor() {
  const [title, setTitle] = useState("");
  const [isInserting, setIsInserting] = useState(false);
  const toast = useToast();
  const pressable =
    "relative overflow-hidden " +
    "before:absolute before:inset-0 before:bg-black/10 before:opacity-0 before:transition " +
    "active:before:opacity-100 focus-visible:ring-2 focus-visible:ring-indigo-500";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: true,
        orderedList: true,
        listItem: true,
      }),
      BulletList,
      ListItem,
      CustomImage.configure({ allowBase64: true }),
      Placeholder.configure({
        placeholder: "Please start writing your story here…",
      }),
    ],


    autofocus: "end",
    editorProps: {
      attributes: {
        class: "tiptap prose max-w-none focus:outline-none min-h-[240px] p-4 text-left "
      },
      // copy paste to editor handling 
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (!files.length) return false;         // let normal text paste happen
        const file = files[0];

        // validate first; if invalid we still "handle" so default paste doesn't dump garbage
        const ok = validateFileForEditor(file);
        if (!ok) return true;

        event.preventDefault();
        insertImageFromFile(file);
        return true;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (!files.length) return false;

        const file = files[0];
        const ok = validateFileForEditor(file);
        if (!ok) return true;

        event.preventDefault();                  // stop browser from navigating to file
        insertImageFromFile(file);
        return true;
      },
    },

  });

  // end of useEditor 
  const [, setTick] = useState(0);

  React.useEffect(() => {
    if (!editor) return;
    const rerender = () => setTick((x) => x + 1);
    editor.on('selectionUpdate', rerender);
    editor.on('update', rerender);
    editor.on('transaction', rerender);
    return () => {
      editor.off('selectionUpdate', rerender);
      editor.off('update', rerender);
      editor.off('transaction', rerender);
    };
  }, [editor]);

  const fileInputRef = useRef(null);
  // Converts a File to a Base64 data URL
  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);   // e.g., "data:image/png;base64,AAA..."
      reader.onerror = () => reject(new Error('READ_FAIL'));
      reader.readAsDataURL(file);
    });

  // Validates, reads, and inserts the image into TipTap
  const insertImageFromFile = async (file) => {
    // use your existing validator (shows errors if any)
    const ok = validateFileForEditor(file);
    if (!ok) return;

    try {
      setIsInserting(true);
      const dataUrl = await readFileAsDataURL(file);
      editor?.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
      toast.success("Image inserted");
    } catch {

      toast.error("Couldn't read the image file. Please try again.");
    }
    finally {
      setIsInserting(false);
    }
  };

  const addImage = useCallback(() => {
    const url = window.prompt("Image URL");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);
  /* Validate an image file before we proceed to read/insert. */
  const validateFileForEditor = (file) => {
    const result = validateImageFile(file);
    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    return true;
  };
  //event handler grabs the file pass the file to validation logic above
  const handleFileChange = (e) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    insertImageFromFile(file);      // ← inserts on when succesful
    e.currentTarget.value = '';     // allow re-selecting same file
  };

  //saving the story logiv
  const save = useCallback(() => {
    if (!editor) return;
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Please add a story title.");
      return;
    }
    const payload = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      contentJSON: editor.getJSON(),
      savedAt: new Date().toISOString(),
    };
    const serialized = JSON.stringify(payload);
    const MAX_DOC_JSON_BYTES = 4_500_000; // ~4.5 MB
    if (serialized.length > MAX_DOC_JSON_BYTES) {
      toast.error(
        `Story is too large to save locally (${formatBytes(serialized.length)}). ` +
        `Reduce image sizes (max per image ${formatBytes(MAX_IMAGE_BYTES)}).`
      );
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    toast.success("Story saved locally ✅");
  }, [editor, title, toast]);

  const canBold = editor?.can().chain().focus().toggleBold().run();
  const canItalic = editor?.can().chain().focus().toggleItalic().run();

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      {/* title for the story */}
      <input
        type="text"
        placeholder="Story title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-lg font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Story title"
      />

      {/* components of the task ( paragraph , bold , italic and etc) toolbar in other words */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm ${pressable} hover:bg-white`}
          onClick={() => editor?.chain().focus().setParagraph().run()}
        >
          Paragraph
        </button>

        <button
          type="button"
          disabled={!canBold}
          className={`rounded-md px-3 py-1.5 text-sm disabled:opacity-40  ${pressable} ${editor?.isActive("bold") ? "bg-white shadow" : "hover:bg-white"}`}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Bold
        </button>

        <button
          type="button"
          disabled={!canItalic}
          className={`rounded-md px-3 py-1.5 text-sm disabled:opacity-40 ${pressable} ${editor?.isActive("italic") ? "bg-white shadow" : "hover:bg-white"}`}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>

        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm ${pressable} ${editor?.isActive("bulletList") ? "bg-white shadow" : "hover:bg-white"}`}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          Bullet List
        </button>

        <button
          type="button"
          className="rounded-md px-3 py-1.5  text-sm hover:bg-white"
          onClick={addImage}
        >
          Add Image (URL)
        </button>
        <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm hover:bg-white ${pressable}`}
          onClick={() => fileInputRef.current?.click()}
          disabled={isInserting}

        >
          {isInserting ? "Uploading…" : "Upload Image"}
        </button>
      </div>

      {/* editor where text rests */}
      <div className="rounded-xl border border-gray-200">
        <EditorContent editor={editor} />
      </div>

      {/* Save / Load */}
      <div className="flex items-center justify-between">
        <button
          onClick={save}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Save Story
        </button>

        <button
          onClick={() => {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return toast.info("No saved story yet.");
            const parsed = JSON.parse(raw);
            setTitle(parsed.title || "");
            editor?.commands.setContent(parsed.contentJSON);
            toast.success("Story loaded");
          }}
          className="rounded-xl border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          Load Last
        </button>
      </div>

    </div>
  );
}
