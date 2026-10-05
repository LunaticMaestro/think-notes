import type { Note } from "../types/note";
import type { NoteKeywords } from "@/types/tags";
import NoteCard from "./NoteCard";
import { AnimatePresence, motion } from "motion/react";
import CreateNoteCard from "./CreateNote";
import React, { useState } from "react";
import type { Keyword, Reward } from "@/types/nlp";
interface NoteListProps {
  notes: Note[];
  noteKeywords: NoteKeywords[];
  // update, delete
  handleUpdate: (id: string, content: string) => void;
  handleDelete: (id: string) => void;
  handleCreateNote: () => string;
  handleTags: (id: string, keywords: Keyword[]) => void;
  requestNlp: (text: string) => void;
  rewardKeyword: ({ samplerId, dislike }: Reward) => void;
  predictionsRef: React.RefObject<Keyword[]>;
}

function NoteList({
  notes,
  noteKeywords,
  handleUpdate,
  handleDelete,
  handleCreateNote,
  handleTags,
  requestNlp,
  rewardKeyword,
  predictionsRef,
}: NoteListProps) {
  const [newNodeId, setNewNodeId] = useState<string>("");

  return (
    <section>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 p-4">
        <AnimatePresence initial={false}>
          <CreateNoteCard
            suggestionText={
              notes.length === 0
                ? "Start with `Take a sip of water`"
                : "Keep ideas coming"
            }
            onClick={() => {
              setNewNodeId(handleCreateNote());
            }}
          />
          {notes.map((note) => (
            <motion.div
              key={note.id}
              // layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <NoteCard
                key={note.id}
                keywords={
                  noteKeywords.find((kw) => kw.id === note.id)?.keywords || []
                }
                note={note}
                handleUpdate={handleUpdate}
                handleDelete={handleDelete}
                handleTags={handleTags}
                isActive={note.id == newNodeId}
                requestNlp={requestNlp}
                rewardKeyword={rewardKeyword}
                predictionsRef={predictionsRef}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default NoteList;
