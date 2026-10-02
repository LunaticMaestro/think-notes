import type { Note } from "../types/note";
import type { Tag, NoteTag } from "@/types/tags"
import NoteCard from "./NoteCard";
import { AnimatePresence, motion } from "motion/react";
import CreateNoteCard from "./CreateNote";
import {useState} from "react"

interface NoteListProps {
  notes: Note[];
  noteTags: NoteTag[];
// update, delete 
  handleUpdate: (id: string, content: string)=>void,
  handleDelete: (id: string)=>void,
  handleCreateNote: ()=>string,
  handleTags: (id:string, keywords: Tag[])=>void
}

function NoteList({ 
    notes, 
    noteTags,
    handleUpdate, 
    handleDelete, 
    handleCreateNote,
    handleTags
  }: NoteListProps) {
  const [newNodeId, setNewNodeId] = useState<string>("")

  return (
    <section>
      
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 p-4">
          <AnimatePresence initial={false}>
            <CreateNoteCard 
            suggestionText={notes.length === 0 ? "Start with `Take a sip of water`" : "Keep ideas coming"}
            onClick={()=>{
              setNewNodeId(handleCreateNote())
            }} />
          {notes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <NoteCard
                key={note.id}
                noteTags={noteTags}
                note={note}
                handleUpdate={handleUpdate}
                handleDelete={handleDelete}
                handleTags={handleTags}
                isActive={note.id == newNodeId}
              />
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
    </section>
  );
}

export default NoteList;
