import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './NoteEditor.css';
import { Note } from '../../services/noteService';

interface NoteEditorProps {
  selectedNote: Note | null;
  onSave: (title: string, content: string) => void;
  isNew?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-menu">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        type="button"
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        type="button"
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        type="button"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        type="button"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        type="button"
      >
        H3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        type="button"
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        type="button"
      >
        Ordered List
      </button>
    </div>
  );
};

const NoteEditor: React.FC<NoteEditorProps> = ({ selectedNote, onSave, isNew = false }) => {
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(isNew);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '',
  });

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      if (editor) {
        editor.commands.setContent(selectedNote.content);
      }
      setIsEditing(isNew);
    } else {
      setTitle('');
      if (editor) {
        editor.commands.setContent('');
      }
      setIsEditing(isNew);
    }
  }, [selectedNote, isNew, editor]);

  const handleSave = useCallback(() => {
    if (title.trim() && editor) {
      const content = editor.getHTML();
      if (content) {
        onSave(title, content);
        setIsEditing(false);
      }
    }
  }, [title, editor, onSave]);

  if (!selectedNote && !isNew) {
    return (
      <div className="note-editor empty-state">
        <h2>Create your first note</h2>
        <p>Select "New Note" to get started</p>
      </div>
    );
  }

  return (
    <div className="note-editor">
      {isEditing ? (
        <>
          <input
            type="text"
            className="note-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
          />
          <div className="editor-container">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="editor-content" />
          </div>
          <div className="editor-actions">
            <button 
              onClick={handleSave}
              disabled={!title.trim() || !editor?.getHTML()}
              className="save-button"
            >
              Save
            </button>
            <button 
              onClick={() => {
                if (selectedNote && !isNew) {
                  setTitle(selectedNote.title);
                  if (editor) {
                    editor.commands.setContent(selectedNote.content);
                  }
                  setIsEditing(false);
                }
              }}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="note-header">
            <h2>{title}</h2>
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Edit
            </button>
          </div>
          <div 
            className="note-content" 
            dangerouslySetInnerHTML={{ __html: selectedNote?.content || '' }} 
          />
        </>
      )}
    </div>
  );
};

export default NoteEditor; 