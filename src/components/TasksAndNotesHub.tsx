import React, { useState } from 'react';
import { Plus, CheckSquare, AlignLeft, Trash2, Check, Pen, X, GripHorizontal, CreditCard, Pin } from 'lucide-react';
import { useSyncedState } from '../hooks/useSyncedState';
import Markdown from 'react-markdown';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Masonry from 'react-masonry-css';

const breakpointColumnsObj = {
  default: 3,
  1024: 2,
  768: 1
};

export type NoteType = 'text' | 'checklist' | 'flashcard';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  body?: string;
  items?: ChecklistItem[];
  front?: string;
  back?: string;
  tags?: string[];
  color?: any; // Kept for backwards compatibility
  pinned?: boolean;
  createdAt: number;
}

interface TasksAndNotesHubProps {
  userId: string | null | undefined;
}

function SortableNoteCard({ note, deleteNote, toggleCheckItem, togglePinNote, editNote }: { note: Note, deleteNote: (id: string) => void, toggleCheckItem: (noteId: string, itemId: string) => void, togglePinNote: (id: string) => void, editNote: (note: Note) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col hover:bg-white/20 ${isDragging ? 'ring-2 ring-white/50' : ''} break-inside-avoid mb-6`}
    >
      <div 
        {...attributes}
        {...listeners}
        className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 p-2 cursor-grab active:cursor-grabbing text-white/40 hover:text-white/80 transition-all z-10 touch-none"
      >
        <GripHorizontal className="w-5 h-5" />
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
        <button 
          onClick={() => editNote(note)}
          className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-lg"
          title="Edit note"
        >
          <Pen className="w-4 h-4" />
        </button>
        <button 
          onClick={() => togglePinNote(note.id)}
          className={`p-2 text-white rounded-xl backdrop-blur-md transition-all shadow-lg ${note.pinned ? 'bg-white/30 hover:bg-white/20' : 'bg-black/50 hover:bg-black/70 border border-white/10'}`}
          title={note.pinned ? "Unpin note" : "Pin note"}
        >
          <Pin className={`w-4 h-4 ${note.pinned ? 'fill-current' : ''}`} />
        </button>
        <button 
          onClick={() => deleteNote(note.id)}
          className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all shadow-lg"
          title="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tags Display */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 mt-4">
          {note.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-white/10 border border-white/10 rounded-md font-mono text-[10px] text-white/60 tracking-wider">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {note.title && (
        <h3 className={`font-bold text-lg uppercase mb-4 text-white pr-8 break-words border-b border-white/10 pb-3 ${(!note.tags || note.tags.length === 0) ? 'mt-4' : ''}`}>
          {note.title}
        </h3>
      )}
      
      {note.type === 'text' && note.body && (
        <div className="font-mono font-normal normal-case text-white/80 text-sm whitespace-pre-wrap flex-1 leading-relaxed break-words [&>h1]:text-white [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-white/90 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:text-white/90 [&>h3]:text-base [&>h3]:font-bold [&>h3]:mb-2 [&>p]:mb-3 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>a]:text-blue-400 [&>a]:underline [&>blockquote]:border-l-2 [&>blockquote]:border-white/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-white/60 [&>code]:bg-white/10 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>pre]:bg-white/5 [&>pre]:p-3 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>pre>code]:bg-transparent [&>pre>code]:p-0">
          <Markdown>{note.body}</Markdown>
        </div>
      )}

      {note.type === 'checklist' && note.items && (
        <div className="flex flex-col gap-3 font-mono text-sm mt-1 flex-1">
          {note.items.map(item => (
            <label key={item.id} className="flex items-start gap-3 cursor-pointer group/item">
              <div className="relative mt-0.5 shrink-0">
                <input 
                  type="checkbox" 
                  className="peer sr-only"
                  checked={item.done}
                  onChange={() => toggleCheckItem(note.id, item.id)}
                />
                <div className="w-5 h-5 border border-white/30 rounded flex items-center justify-center bg-white/5 peer-checked:bg-white peer-checked:border-white transition-all">
                  {item.done && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                </div>
              </div>
              <span className={`text-white/90 font-normal normal-case transition-all ${item.done ? 'line-through opacity-40' : ''} break-words leading-relaxed`}>
                {item.text}
              </span>
            </label>
          ))}
        </div>
      )}

      {note.type === 'flashcard' && (
        <div className="flex flex-col flex-1 gap-2 mt-2">
          <div className="bg-white/10 rounded-xl p-4 min-h-[100px] flex items-center justify-center text-center">
            <p className="font-normal normal-case text-white/90 text-lg tracking-wide break-words">{note.front}</p>
          </div>
          <div className="opacity-0 hover:opacity-100 transition-opacity bg-white/10 rounded-xl p-4 min-h-[100px] flex items-center justify-center text-center backdrop-blur-sm border border-dashed border-white/20">
            <p className="font-mono font-normal normal-case text-white/80 text-sm break-words">{note.back || "No answer provided"}</p>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none hover:hidden opacity-50 group-hover:opacity-0 transition-opacity">
              <span className="font-mono text-xs tracking-widest bg-black/50 px-3 py-1 rounded-full">Hover to reveal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TasksAndNotesHub({ userId }: TasksAndNotesHubProps) {
  const [notes, setNotes] = useSyncedState<Note[]>('ufocus_notes', [], userId || null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<NoteType>('text');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // For Checklist Mode building
  const [checkItems, setCheckItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');

  // For Flashcard Mode building
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  // Filtering
  const [selectedFilterTag, setSelectedFilterTag] = useState<string | null>(null);

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setIsExpanded(true);
    setCurrentType(note.type);
    setTitle(note.title);
    setBody(note.body || '');
    setTagsInput((note.tags || []).join(', '));
    setCheckItems(note.items || []);
    setFront(note.front || '');
    setBack(note.back || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveNote = () => {
    const finalCheckItems = [...checkItems];
    if (currentType === 'checklist' && newItemText.trim()) {
      finalCheckItems.push({ id: Date.now().toString(), text: newItemText.trim(), done: false });
    }

    if (!title.trim() && !body.trim() && finalCheckItems.length === 0 && !front.trim()) {
      setIsExpanded(false);
      setEditingNoteId(null);
      return;
    }

    const parsedTags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '');

    if (editingNoteId) {
      setNotes(prev => prev.map(note => {
        if (note.id !== editingNoteId) return note;
        return {
          ...note,
          type: currentType,
          title: title.trim(),
          ...(parsedTags.length > 0 ? { tags: parsedTags } : { tags: [] }),
          ...(currentType === 'text' ? { body: body.trim() } : { body: undefined }),
          ...(currentType === 'checklist' ? { items: finalCheckItems } : { items: undefined }),
          ...(currentType === 'flashcard' ? { front: front.trim(), back: back.trim() } : { front: undefined, back: undefined })
        };
      }));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        type: currentType,
        title: title.trim(),
        createdAt: Date.now(),
        ...(parsedTags.length > 0 && { tags: parsedTags }),
        ...(currentType === 'text' && { body: body.trim() }),
        ...(currentType === 'checklist' && { items: finalCheckItems }),
        ...(currentType === 'flashcard' && { front: front.trim(), back: back.trim() })
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    
    // Reset form
    setTitle('');
    setBody('');
    setTagsInput('');
    setCheckItems([]);
    setNewItemText('');
    setFront('');
    setBack('');
    setIsExpanded(false);
    setEditingNoteId(null);
    setCurrentType('text');
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const togglePinNote = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, pinned: !note.pinned } : note
    ));
  };

  const toggleCheckItem = (noteId: string, itemId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id !== noteId) return note;
      if (!note.items) return note;
      return {
        ...note,
        items: note.items.map(item => item.id === itemId ? { ...item, done: !item.done } : item)
      };
    }));
  };

  const handleAddChecklistItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newItemText.trim()) {
      setCheckItems([...checkItems, { id: Date.now().toString(), text: newItemText.trim(), done: false }]);
      setNewItemText('');
    }
  };

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).sort();

  const baseFilteredNotes = selectedFilterTag 
    ? notes.filter(n => n.tags?.includes(selectedFilterTag))
    : [...notes];

  const filteredNotes = baseFilteredNotes.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
      {/* Page Header */}
      <div className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Notes</h1>
        <p className="font-mono text-white/60 mt-2 text-sm">Dump your brain. Stay focused.</p>
      </div>

      {/* Note Builder */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl transition-all duration-300`}>
          {!isExpanded ? (
            <div 
              className="cursor-pointer font-mono text-white/60 text-lg flex items-center justify-between hover:text-white/80 transition-colors"
              onClick={() => setIsExpanded(true)}
            >
              <span>Take a note...</span>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); setIsExpanded(true); setCurrentType('checklist'); }} className="p-2 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 transition-all" title="New Checklist">
                  <CheckSquare className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="TITLE..."
                className="w-full bg-transparent font-bold text-xl uppercase placeholder:text-white/40 border-none outline-none text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              
              {currentType === 'text' && (
                <textarea
                  placeholder="Body text... (Markdown supported)"
                  className="w-full bg-transparent font-mono font-normal normal-case text-base placeholder:text-white/40 border-none outline-none min-h-[100px] resize-y text-white/90"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              )}

              {currentType === 'checklist' && (
                <div className="flex flex-col gap-3 font-mono">
                  {checkItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 border border-white/30 rounded flex items-center justify-center bg-white/5">
                         {/* Empty square for builder */}
                      </div>
                      <span className="text-white/90 font-normal normal-case">{item.text}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 mt-2">
                    <Plus className="w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      placeholder="List item... (Press Enter)"
                      className="flex-1 bg-transparent font-normal normal-case border-b border-white/20 focus:border-white/50 outline-none text-white placeholder:text-white/40 pb-1 transition-colors"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={handleAddChecklistItem}
                    />
                  </div>
                </div>
              )}

              {currentType === 'flashcard' && (
                <div className="flex flex-col gap-4">
                  <textarea
                    placeholder="Front side (Question or Prompt)..."
                    className="w-full bg-transparent font-mono font-normal normal-case text-base placeholder:text-white/40 border-b border-white/10 outline-none resize-none text-white/90 pb-2"
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                  />
                  <textarea
                    placeholder="Back side (Answer or Detail)..."
                    className="w-full bg-transparent font-mono font-normal normal-case text-base placeholder:text-white/40 border-none outline-none resize-none text-white/90"
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                  />
                </div>
              )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex flex-col w-full gap-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentType('text')}
                        className={`p-2 rounded-xl border ${currentType === 'text' ? 'border-white/30 bg-white/20 text-white' : 'border-transparent text-white/60 hover:bg-white/10 hover:text-white'} transition-all`}
                        title="Plain Text Note"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentType('checklist')}
                        className={`p-2 rounded-xl border ${currentType === 'checklist' ? 'border-white/30 bg-white/20 text-white' : 'border-transparent text-white/60 hover:bg-white/10 hover:text-white'} transition-all`}
                        title="Checklist Note"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentType('flashcard')}
                        className={`p-2 rounded-xl border ${currentType === 'flashcard' ? 'border-white/30 bg-white/20 text-white' : 'border-transparent text-white/60 hover:bg-white/10 hover:text-white'} transition-all`}
                        title="Flashcard"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center flex-1 mx-4">
                      <input
                        type="text"
                        placeholder="Tags (comma separated)..."
                        className="w-full bg-transparent font-mono text-xs placeholder:text-white/30 border-b border-transparent focus:border-white/20 outline-none text-white/80 transition-colors"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                      />
                    </div>

                <div className="flex gap-3 ml-4">
                  <button 
                    onClick={() => {
                      setIsExpanded(false);
                      setEditingNoteId(null);
                      setTitle('');
                      setBody('');
                      setTagsInput('');
                      setCheckItems([]);
                      setNewItemText('');
                      setFront('');
                      setBack('');
                      setCurrentType('text');
                    }}
                    className="px-4 py-2 font-mono font-bold text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveNote}
                    className="px-6 py-2 bg-white text-black font-mono font-bold rounded-xl hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                  >
                    {editingNoteId ? 'Save' : 'Add'}
                  </button>
                </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="font-mono text-xs text-white/50 mr-2">TAGS:</span>
          <button
            onClick={() => setSelectedFilterTag(null)}
            className={`px-3 py-1 font-mono text-xs rounded-full border transition-all ${
              selectedFilterTag === null 
                ? 'bg-white text-black border-white' 
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            ALL
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedFilterTag(tag === selectedFilterTag ? null : tag)}
              className={`px-3 py-1 font-mono text-xs rounded-full border transition-all ${
                selectedFilterTag === tag
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Notes */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={filteredNotes.map(n => n.id)}
          strategy={rectSortingStrategy}
        >
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-6"
            columnClassName="pl-6 bg-clip-padding"
          >
            {filteredNotes.map(note => (
              <SortableNoteCard
                key={note.id}
                note={note}
                deleteNote={deleteNote}
                toggleCheckItem={toggleCheckItem}
                togglePinNote={togglePinNote}
                editNote={handleEditNote}
              />
            ))}
          </Masonry>
        </SortableContext>
      </DndContext>
      
      {filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-2xl backdrop-blur-sm bg-white/5 relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div className="relative mb-6 text-white/30 group-hover:text-white/60 transition-colors duration-500">
            <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Isometric Base Grid */}
              <g transform="translate(80, 110) scale(1, 0.5) rotate(45)">
                <rect x="-40" y="-40" width="80" height="80" stroke="currentColor" strokeWidth="1" fill="transparent"/>
                <path d="M-20,-40 L-20,40 M0,-40 L0,40 M20,-40 L20,40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4"/>
                <path d="M-40,-20 L40,-20 M-40,0 L40,0 M-40,20 L40,20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4"/>
              </g>
              
              {/* Z-axis Connecting Lines */}
              <path d="M80,60 L80,110" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M23.5,88 L23.5,110" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
              <path d="M136.5,88 L136.5,110" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
              
              {/* Floating Wireframe Card */}
              <g transform="translate(80, 60) scale(1, 0.5) rotate(45)">
                <rect x="-30" y="-40" width="60" height="80" stroke="currentColor" strokeWidth="1.5" fill="#0a0d0b" />
                <line x1="-15" y1="-20" x2="15" y2="-20" stroke="currentColor" strokeWidth="1" />
                <line x1="-15" y1="-5" x2="15" y2="-5" stroke="currentColor" strokeWidth="1" />
                <line x1="-15" y1="10" x2="5" y2="10" stroke="currentColor" strokeWidth="1" />
                
                {/* Secondary floating accent card */}
                <rect x="-45" y="-10" width="30" height="40" stroke="currentColor" strokeWidth="1" fill="#0a0d0b" />
                <line x1="-35" y1="0" x2="-25" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="-35" y1="10" x2="-20" y2="10" stroke="currentColor" strokeWidth="1" />
              </g>

              {/* Orbital rings */}
              <ellipse cx="80" cy="110" rx="60" ry="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 8" fill="transparent" />
            </svg>
          </div>

          <h3 className="font-bold text-xl uppercase tracking-widest text-white/80 mb-2 relative z-10">
            {notes.length === 0 ? "Terminal Empty" : "No Matches"}
          </h3>
          <p className="font-mono text-white/40 text-sm max-w-sm mx-auto relative z-10 text-center">
            {notes.length === 0 
              ? "Your data matrix is clear. Initiate a new record to populate the grid." 
              : "Query returned zero results. Adjust your tag filters."}
          </p>
        </div>
      )}
    </div>
  );
}
