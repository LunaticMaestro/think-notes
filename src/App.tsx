import {v4 as uuidv4} from "uuid"
import React, { useState, useRef, useEffect } from 'react'
import type { Note } from './types/note'
import './App.css'
import { ReprIdeaCount } from "./emoji"

function App() {
  const newNoteRef = useRef<HTMLTextAreaElement>(null)

  const [notes, setNotes] = useState<Note[]>(()=>{
    const storedNotes = localStorage.getItem("notes")
    if (!storedNotes) return [];
    return JSON.parse(storedNotes)
  })

  useEffect(()=>{
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes])

  const countNotes: number = notes.length

  function addNote(e: React.SubmitEvent<HTMLFormElement>){
    e.preventDefault();
    const content = newNoteRef.current?.value.trim()
    if (!content) return 

    const newNote = {
      id: uuidv4(), 
      content: content
    }

    setNotes((currentNotes) => [
      ...currentNotes,
      newNote,
    ])

    // reset the form
    if (newNoteRef.current) {
      newNoteRef.current.value = ''
    }

  }

  function removeNote(id: string){
    const updatedNotes = notes.filter((note)=>note.id != id)
    setNotes(updatedNotes)
  }
  
  function NewNote(){
    return (
      <form onSubmit={(e) => addNote(e)}>
        <textarea 
          ref={newNoteRef}
          placeholder="What you cooking ?"
        ></textarea>
        <button type="submit">+</button>
      </form>
    )
  }

  return (
    <div>
      <h1>Notes</h1>
      <NewNote />
      {countNotes > 0 ? <h2>So far... {ReprIdeaCount(countNotes)}</h2> : <p>Keep Adding</p>}
      {notes.map((note)=>{
        return (
          <div key={note.id}>
            <span>{note.content}
            <button onClick={()=>removeNote(note.id)}>-</button></span>
          </div>
        )
      })}
    </div>
  )
}

export default App

