import { Typography, Card } from "@heroui/react";
import { Plus } from "@gravity-ui/icons";


type CreateNoteCardProps = {
  onClick: () => void;
  suggestionText: string
};

function CreateNoteCard({ onClick, suggestionText }: CreateNoteCardProps) {
  return (
    <Card
      className="
        cursor-pointer
        rounded-2xl
        border
        border-dashed
        border-accent/30
        bg-transparent
        shadow-lg
        shadow-accent/10
        transition-all
        hover:border-accent/50
        hover:bg-accent/5
        hover:shadow-accent/20
      "
      onClick={onClick}
    >
      <Card.Content className="flex h-full  items-center justify-center">
        <Plus className="size-12 text-accent" />
        <Typography color="muted" type="body">
       {suggestionText}
      </Typography>
      </Card.Content>
    </Card>
  );
}

export default CreateNoteCard;