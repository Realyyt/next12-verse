import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateEventForm } from "./CreateEventForm";

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEventModal({
  open,
  onOpenChange,
}: CreateEventModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <CreateEventForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
} 