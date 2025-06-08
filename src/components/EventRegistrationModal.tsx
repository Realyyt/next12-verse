import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventRegistrationForm } from "./EventRegistrationForm";

interface EventRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
}

export function EventRegistrationModal({
  open,
  onOpenChange,
  eventId,
  eventTitle,
}: EventRegistrationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register for {eventTitle}</DialogTitle>
        </DialogHeader>
        <EventRegistrationForm
          eventId={eventId}
          eventTitle={eventTitle}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 