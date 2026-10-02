export type Tag = {
    id: string, 
    name: string
}

export type NoteTag = {
    id: string,
    tags: Tag[]
}