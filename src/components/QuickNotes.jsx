import { useState, useEffect } from 'react';
import { IoTrashOutline, IoCreateOutline, IoCloseOutline } from 'react-icons/io5';
import { noteService } from '../services';

const QuickNotes = ({ bookId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  // Load notes from backend
  useEffect(() => {
    if (userId && bookId) {
      loadNotes();
    }
  }, [userId, bookId]);

  const loadNotes = async () => {
    if (!userId || !bookId) return;
    
    try {
      setLoading(true);
      const result = await noteService.getBookNotes(userId, bookId);
      setNotes(result.notes || []);
    } catch (err) {
      console.error('Error loading notes:', err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !userId || !bookId) {
      if (!userId) {
        alert('Please login to add notes');
      }
      return;
    }

    try {
      const result = await noteService.createNote(userId, bookId, newNote.trim());
      setNotes([result.note, ...notes]);
      setNewNote('');
    } catch (err) {
      console.error('Error creating note:', err);
      alert('Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!userId) return;

    try {
      await noteService.deleteNote(userId, noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      if (editingNote === noteId) {
        setEditingNote(null);
        setEditText('');
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note');
    }
  };

  const handleStartEdit = (note) => {
    setEditingNote(note.id);
    setEditText(note.note_text || note.text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || !userId || !editingNote) return;

    try {
      const result = await noteService.updateNote(userId, editingNote, editText.trim());
      setNotes(notes.map(note => 
        note.id === editingNote 
          ? { ...note, note_text: editText.trim(), text: editText.trim(), updated_at: new Date().toISOString() }
          : note
      ));
      setEditingNote(null);
      setEditText('');
    } catch (err) {
      console.error('Error updating note:', err);
      alert('Failed to update note');
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditText('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayedNotes = showAllNotes ? notes : notes.slice(0, 3);

  if (!userId || !bookId) {
    return (
      <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-theme-primary mb-4">Quick Notes</h3>
        <p className="text-theme-secondary text-sm">Please login to use quick notes</p>
      </div>
    );
  }

  return (
    <div className="bg-theme-card border border-theme rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-theme-primary">Quick Notes</h3>
        {notes.length > 3 && !showAllNotes && (
          <button
            onClick={() => setShowAllNotes(true)}
            className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
          >
            View All ({notes.length})
          </button>
        )}
        {showAllNotes && (
          <button
            onClick={() => setShowAllNotes(false)}
            className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
          >
            Show Less
          </button>
        )}
      </div>

      {/* Add New Note */}
      <div className="mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note..."
          rows="3"
          className="w-full px-4 py-3 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-blue-500 transition-colors resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleAddNote();
            }
          }}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-theme-tertiary">
            {newNote.length} characters • Press Ctrl+Enter to add
          </span>
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-theme-secondary">Loading notes...</p>
          </div>
        ) : displayedNotes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-theme-secondary">No notes yet. Add your first note above!</p>
          </div>
        ) : (
          displayedNotes.map((note) => (
            <div
              key={note.id}
              className="bg-theme-secondary border border-theme rounded-lg p-4 hover:border-primary-500 transition-colors"
            >
              {editingNote === note.id ? (
                // Edit Mode
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-theme rounded-lg bg-theme-primary text-theme-primary focus:outline-none focus:border-blue-500 transition-colors resize-none mb-2"
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-theme-secondary hover:text-theme-primary transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={!editText.trim()}
                      className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <p className="text-theme-primary whitespace-pre-wrap mb-2">
                    {note.note_text || note.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-theme-tertiary">
                      {formatDate(note.updated_at || note.updatedAt || note.created_at || note.createdAt)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1.5 text-theme-tertiary hover:text-primary-600 transition-colors"
                        aria-label="Edit note"
                      >
                        <IoCreateOutline className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 text-theme-tertiary hover:text-red-600 transition-colors"
                        aria-label="Delete note"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuickNotes;

