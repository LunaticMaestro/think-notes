import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, CloseButton, Button, Separator } from "@heroui/react";
import { TrashBin, ChevronsCollapseUpRight } from "@gravity-ui/icons";
import { TagGroupWithListData } from "./Tags";
import type { Note } from "../types/note";
import type { NoteTag, Tag } from "@/types/tags"

type NoteCardProps = {
  note: Note
  noteTags: NoteTag[]
  handleUpdate: (id: string, content: string) => void
  handleDelete: (id: string) => void
  handleTags: (id:string, keywords: Tag[])=>void
  isActive?: boolean
};

function NoteCard({
  note,
  noteTags,
  handleUpdate,
  handleDelete,
  handleTags,
  isActive = false,
}: NoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [kw, setKw] = useState<Tag[]>(() => {
  return noteTags.find((noteTag) => noteTag.id === note.id)?.tags ?? [];
});

  console.log(note.id, note.content)
  console.log(kw)

  // NLP worker
  const tagNLPWorker = useRef<Worker | null>(null);

  // Debounce timer for NLP
  const nlpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Used to identify the newest NLP request
  const requestId = useRef(0);

  const content = note.content;

  /*
   * Create the worker lazily.
   *
   * The worker doesn't exist until NLP is actually requested.
   */
  function getNLPWorker() {
    if (tagNLPWorker.current) {
      return tagNLPWorker.current;
    }

    const worker = new Worker(
      new URL("@/nlp/tags/pipeline.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event) => {
      const message = event.data;

      if (message.type === "complete") {
        /*
         * Ignore results from old requests.
         *
         * If request 10 is the newest request, a result from
         * request 9 should never overwrite it.
         */
        if (message.requestId !== requestId.current) {
          return;
        }

        const updatedTags = message.keywords.map((keyword: string) => ({
            // Keyword itself is stable and doesn't need a random UUID.
            id: keyword,
            name: keyword,
          })
        )

        setKw(updatedTags);

        handleTags(note.id, updatedTags)

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
    };

    tagNLPWorker.current = worker;

    return worker;
  }

  /*
   * Clean up the worker and timers when this NoteCard unmounts.
   */
  useEffect(() => {
    return () => {
      if (nlpTimer.current) {
        clearTimeout(nlpTimer.current);
      }

      tagNLPWorker.current?.terminate();
      tagNLPWorker.current = null;
    };
  }, []);

  /*
   * Open active note after a small delay.
   */
  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [isActive]);

  /*
   * Lock body scrolling while the note is expanded.
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /*
   * Send text to NLP after the user stops typing.
   *
   * This is the important optimization:
   *
   * typing:
   * h
   * he
   * hel
   * hell
   * hello
   *
   * does NOT result in 5 NLP operations.
   *
   * Instead, NLP runs once after the user pauses.
   */
  function scheduleNLP(text: string) {
    if (nlpTimer.current) {
      clearTimeout(nlpTimer.current);
    }

    nlpTimer.current = setTimeout(() => {
      const worker = getNLPWorker();

      const id = ++requestId.current;

      worker.postMessage({
        type: "find",
        requestId: id,
        text,
      });
    }, 200);
  }

  function handleEditNoteContent(
    noteId: string,
    textValue: string
  ) {
    /*
     * Update the note immediately so typing stays responsive.
     */
    handleUpdate(noteId, textValue);

    /*
     * NLP happens separately and is debounced.
     */
    scheduleNLP(textValue);
  }

  function uiUpdateDelete() {
    setIsOpen(false);

    setTimeout(() => {
      handleDelete(note.id);
    }, 350);
  }

  function handleClose() {
    setIsOpen(false);

    if (content.trim().length === 0) {
      setTimeout(() => {
        handleDelete(note.id);
      }, 350);
    }
  }

  const layoutId = `card-${note.id}`;

  return (
    <>
      {/* Collapsed card */}
      {!isOpen && (
        <motion.div
          layoutId={layoutId}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <Card
            className="
              w-full cursor-pointer
              rounded-2xl
              border border-accent/20
              shadow-lg shadow-accent/10
            "
            onClick={() => setIsOpen(true)}
          >
            <Card.Content className="text-m">
              <p>
                {content.length > 50
                  ? `${content.slice(0, 50)}...`
                  : content}
              </p>
            </Card.Content>

            <Card.Footer>
              <TagGroupWithListData
                tagsList={kw}
                isExpanded={false}
              />
            </Card.Footer>
          </Card>
        </motion.div>
      )}

      {/* Expanded state */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="
              fixed inset-0 z-50
              flex items-center justify-center
              bg-black/20 backdrop-blur-md
              p-4
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              layoutId={layoutId}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="
                h-[90vh]
                w-[90vw]
                max-w-5xl
                min-h-0
              "
            >
              <Card
                className="
                  flex
                  h-full
                  min-h-0
                  w-full
                  flex-col
                  overflow-hidden
                  rounded-3xl
                "
              >
                <Card.Header className="shrink-0">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="danger-soft"
                      size="sm"
                      onClick={uiUpdateDelete}
                    >
                      <TrashBin />
                      Remove Note
                    </Button>

                    <CloseButton
                      aria-label="Close note"
                      className="size-8 rounded-3xl"
                      onClick={handleClose}
                    >
                      <ChevronsCollapseUpRight />
                    </CloseButton>
                  </div>

                  <Separator className="my-3" />

                  <TagGroupWithListData tagsList={kw} />
                </Card.Header>

                <Card.Content
                  className="
                    flex
                    min-h-0
                    flex-1
                    flex-col
                    overflow-hidden
                    p-0
                  "
                >
                  <Separator variant="default" />

                  <textarea
                    autoFocus
                    value={content}
                    onChange={(e) =>
                      handleEditNoteContent(
                        note.id,
                        e.target.value
                      )
                    }
                    className="
                      min-h-0
                      flex-1
                      w-full
                      resize-none
                      overflow-y-auto
                      border-none
                      bg-transparent
                      outline-none
                      px-6
                      py-6
                      text-2xl
                      leading-relaxed
                    "
                    spellCheck
                  />
                </Card.Content>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default NoteCard;