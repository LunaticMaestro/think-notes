import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, CloseButton, Button, Separator } from "@heroui/react";
import { TrashBin } from "@gravity-ui/icons";
import type { Note } from "../types/note";
import { ChevronsCollapseUpRight } from "@gravity-ui/icons";

type NoteCardProps = {
  note: Note;
  handleUpdate: (id: string, content: string) => void;
  handleDelete: (id: string) => void;
  isActive?: boolean;
};

function NoteCard({
  note,
  handleUpdate,
  handleDelete,
  isActive = false,
}: NoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const content = note.content;

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [isActive]);

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

  function uiUpdateDelete(){
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
            className="w-full cursor-pointer
            border border-accent/20 shadow-lg shadow-accent/10
            rounded-2xl
            "
            onClick={() => setIsOpen(true)}
          >
            <Card.Content className="text-m">
              <p>
                {content.length > 50 ? `${content.slice(0, 50)}...` : content}
              </p>
            </Card.Content>
          </Card>
        </motion.div>
      )}

      {/* Expanded state */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md"
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
              className="w-[90vw] h-[90vh]"
            >
              <Card className="relative h-full w-full rounded-3xl">
                {/* Original content */}
                <Card.Header>
                  <Button
                    variant="danger-soft"
                    size="sm"
                    onClick={uiUpdateDelete}
                  >
                    <TrashBin />
                    Remove Note
                  </Button>
                  <CloseButton
                    aria-label="Close banner"
                    className="size-8 rounded-3xl absolute end-3 top-3"
                    onClick={handleClose}
                  >
                    <ChevronsCollapseUpRight />
                  </CloseButton>
                </Card.Header>

                <Card.Content>
                  <Separator variant="default" />
                  <textarea
                    value={content}
                    onChange={(e) => handleUpdate(note.id, e.target.value)}
                    className="w-full h-[70vh] resize-none overflow-y-auto border-none bg-transparent outline-none pt-6 text-2xl"
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
