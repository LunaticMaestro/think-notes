import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, CloseButton, Button, Separator } from "@heroui/react";
import { TrashBin, ChevronsCollapseUpRight } from "@gravity-ui/icons";
import { TagGroupWithListData } from "./Tags";
import type { Note } from "../types/note";
import type { Keyword, Reward } from "@/types/nlp";

type NoteCardProps = {
  note: Note;
  keywords: Keyword[];
  handleUpdate: (id: string, content: string) => void;
  handleDelete: (id: string) => void;
  handleTags: (id: string, keywords: Keyword[]) => void;
  isActive?: boolean;
  requestNlp: (text: string) => void;
  rewardKeyword: ({ samplerId, dislike }: Reward) => void;
  predictionsRef: React.RefObject<{
    keywords: Keyword[];
    hasNewPrediction: boolean;
  }>;
};

function NoteCard({
  note,
  keywords,
  handleUpdate,
  handleDelete,
  handleTags,
  isActive = false,
  requestNlp,
  rewardKeyword,
  predictionsRef,
}: NoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEdited = useRef(false);
  const [kw, setKw] = useState<Keyword[]>(keywords);

  const nlpDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const content = note.content;

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
   * Clean up pending NLP prediction when the
   * component unmounts.
   */
  useEffect(() => {
    return () => {
      if (nlpDebounceTimer.current) {
        clearTimeout(nlpDebounceTimer.current);
      }
    };
  }, []);

  /*
   * Lock body scrolling while the note is expanded.
   */
  useEffect(() => {
    predictionsRef.current = {
      keywords: [],
      hasNewPrediction: false,
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, predictionsRef]);

  /*
   * Read predictions produced by the worker.
   */
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (!predictionsRef.current.hasNewPrediction) {
        return;
      }

      setKw(predictionsRef.current.keywords);
      predictionsRef.current = { keywords: [], hasNewPrediction: false };
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, predictionsRef]);

  /*
   * Update the note immediately.
   *
   * NLP prediction is debounced by 200ms so that
   * rapid typing does not trigger a prediction
   * for every character.
   */
  function handleEditNoteContent(noteId: string, textValue: string) {
    /*
     * Update the note immediately so typing
     * stays responsive.
     */
    handleUpdate(noteId, textValue);

    /*
     * Cancel the previous pending NLP request.
     */
    requestNlp(textValue);
    // if (nlpDebounceTimer.current) {
    //   clearTimeout(nlpDebounceTimer.current);
    // }

    // /*
    //  * Run NLP only after the user has stopped
    //  * typing for 200ms.
    //  */
    // nlpDebounceTimer.current = setTimeout(() => {
    //   requestNlp(textValue);
    //   nlpDebounceTimer.current = null;
    // }, 200);

    isEdited.current = true;
  }

  function uiUpdateDelete() {
    if (nlpDebounceTimer.current) {
      clearTimeout(nlpDebounceTimer.current);
      nlpDebounceTimer.current = null;
    }

    setIsOpen(false);

    setTimeout(() => {
      handleDelete(note.id);
    }, 350);
  }

  function handleClose() {
    if (nlpDebounceTimer.current) {
      clearTimeout(nlpDebounceTimer.current);
      nlpDebounceTimer.current = null;
    }

    setIsOpen(false);

    handleTags(note.id, kw);

    if (content.trim().length === 0) {
      setTimeout(() => {
        handleDelete(note.id);
      }, 350);
    }

    if (isEdited.current) {
      keywords.map((eachKeyword) => {
        rewardKeyword({
          samplerId: eachKeyword.sampler,
          dislike: 0,
        });
      });
    }

    isEdited.current = false;
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
                {content.length > 50 ? `${content.slice(0, 50)}...` : content}
              </p>
            </Card.Content>

            <Card.Footer>
              <TagGroupWithListData
                tagsList={kw}
                setKw={setKw}
                rewardKeyword={rewardKeyword}
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

                  <TagGroupWithListData
                    tagsList={kw}
                    setKw={setKw}
                    rewardKeyword={rewardKeyword}
                  />
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
                      handleEditNoteContent(note.id, e.target.value)
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
