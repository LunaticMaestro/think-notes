import {v4 as uuidv4} from "uuid"
import React, { useState, useRef } from 'react'
import type { Note } from './types/note'
import './App.css'
import { ReprIdeaCount } from "./emoji"

function App() {
  const newNoteRef = useRef<HTMLTextAreaElement>(null)

  const [notes, setNotes] = useState<Note[]>([])

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
        return (<p key={note.id}>{note.content}</p>)
      })}
    </div>
  )
}

export default App

