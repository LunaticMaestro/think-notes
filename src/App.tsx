import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Note } from "./types/note";
import type { NoteKeywords } from "./types/tags";
import "./App.css";
import { ReprIdeaCount } from "./emoji";
import NoteList from "./notes/NoteList";
import type { Keyword, Reward } from "./types/nlp";

function App() {
  const tagNLPWorker = useRef<Worker | null>(null);
  const requestId = useRef(0);
  const nlpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [nlpReady, setNlpReady] = useState(false);
  const predictionsRef = useRef<Keyword[]>([]);

  const [notes, setNotes] = useState<Note[]>(() => {
    const storedNotes = localStorage.getItem("notes");
    if (!storedNotes) return [];
    return JSON.parse(storedNotes);
  });

  const [noteKeywords, setNoteKeywords] = useState<NoteKeywords[]>(() => {
    const storedNotes = localStorage.getItem("noteKeywords");
    if (!storedNotes) return [];
    return JSON.parse(storedNotes);
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("notes", JSON.stringify(notes));
    }, 300);

    return () => clearTimeout(timer);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("noteKeywords", JSON.stringify(noteKeywords));
  }, [noteKeywords]);

  useEffect(() => {
    const worker = new Worker(
      new URL("@/nlp/tags/pipeline.worker.ts", import.meta.url),
      { type: "module" },
    );
    const timer = nlpTimer.current;

    tagNLPWorker.current = worker;

    worker.onmessage = (event) => {
      const message = event.data;

      if (message.type === "ready") {
        setNlpReady(true);
        return;
      }

      if (message.type === "complete") {
        if (message.requestId !== requestId.current) {
          return;
        }

        predictionsRef.current = message.keywords;

        console.log("R", predictionsRef.current);

        return;
      }

      if (message.type === "error") {
        if (message.requestId !== requestId.current) {
          return;
        }

        console.error("NLP worker error:", message.error);
      }
    };

    worker.onerror = (error) => {
      console.error("NLP worker crashed:", error);

      setNlpReady(false);
    };

    worker.postMessage({
      type: "init",
    });

    return () => {
      worker.terminate();

      tagNLPWorker.current = null;

      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, []);

  const requestNlp = useCallback(
    (text: string) => {
      const worker = tagNLPWorker.current;

      if (!worker || !nlpReady) {
        return;
      }

      const id = ++requestId.current;

      worker.postMessage({
        type: "find",
        requestId: id,
        text,
      });
    },
    [nlpReady],
  );

  const rewardKeyword = useCallback(
    ({ samplerId, dislike }: Reward) => {
      const worker = tagNLPWorker.current;

      if (!worker || !nlpReady) {
        return;
      }

      worker.postMessage({
        type: "update-reward",
        samplerId: samplerId,
        dislike: dislike,
      });
    },
    [nlpReady],
  );

  const countNotes: number = notes.length;

  function updateNote(id: string, content: string) {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, content } : note)),
    );
  }

  /**
   * Updates the tags associated with a given item.
   *
   * @param id - The ID of  notes
   * @param keywords - The tags to associate with the item.
   */
  function updateTags(id: string, keywords: Keyword[]) {
    // console.log(keywords);
    setNoteKeywords((prev) => [
      ...prev.filter((note) => note.id !== id),
      {
        id,
        keywords: keywords,
      },
    ]);
  }

  function handleCreateNote() {
    const newNote: Note = {
      id: uuidv4(),
      content: "",
    };

    setNotes((prev) => [newNote, ...prev]);
    return newNote.id;
  }

  function deleteNote(id: string) {
    const updatedNotes = notes.filter((note) => note.id != id);
    setNotes(updatedNotes);
  }

  return (
    <div>
      <h1>Notes</h1>
      <NoteList
        notes={notes}
        noteKeywords={noteKeywords}
        handleUpdate={updateNote}
        handleDelete={deleteNote}
        handleCreateNote={handleCreateNote}
        handleTags={updateTags}
        requestNlp={requestNlp}
        rewardKeyword={rewardKeyword}
        predictionsRef={predictionsRef}
      />
      {countNotes > 0 ? <h2>So far... {ReprIdeaCount(countNotes)}</h2> : <></>}
    </div>
  );
}

export default App;
