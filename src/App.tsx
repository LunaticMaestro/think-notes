import {v4 as uuidv4} from "uuid"
import { useState, useEffect } from 'react'
import type { Note } from './types/note'
import './App.css'
import { ReprIdeaCount } from "./emoji"
import NoteList from "./notes/NoteList"

function App() {

  const [notes, setNotes] = useState<Note[]>(()=>{
    const storedNotes = localStorage.getItem("notes")
    if (!storedNotes) return [];
    return JSON.parse(storedNotes)
  })

  useEffect(()=>{
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes])

  const countNotes: number = notes.length

  function updateNote(id: string, content: string){
    setNotes((prevNotes) => (
      prevNotes.map((note)=>(
        note.id === id
        ? {... note, content}
        : note
        )
      )
    ))
  }

  function handleCreateNote (){
    const newNote: Note = {
      id: uuidv4(),
      content: "",
    };

    setNotes((prev) => [newNote, ...prev]);
    return newNote.id
  };

  function deleteNote(id: string){
    const updatedNotes = notes.filter((note)=>note.id != id)
    setNotes(updatedNotes)
  }
  

  return (
    <div>
      <h1>Notes</h1>
      <NoteList notes={notes} handleUpdate={updateNote} handleDelete={deleteNote} handleCreateNote={handleCreateNote} />
      {countNotes > 0 ? <h2>So far... {ReprIdeaCount(countNotes)}</h2> : <></>}
      
    </div>
  )
}

export default App

