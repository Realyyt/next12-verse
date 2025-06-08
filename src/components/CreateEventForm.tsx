import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/hooks/useAuthUser";
import { isAdmin } from "@/lib/supabaseClient";

const formSchema = z.object({
  title: z.string().min(2, "Event title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(2, "Location is required"),
  maxAttendees: z.string().optional(),
});

interface CreateEventFormProps {
  onSuccess?: () => void;
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const { user } = useAuthUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      maxAttendees: "",
    },
  });

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Error", 
        description: "File size must be less than 5MB", 
        variant: "destructive" 
      });
      return null;
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      toast({ 
        title: "Error", 
        description: "File must be an image", 
        variant: "destructive" 
      });
      return null;
    }

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${user?.email ?? "user"}-${Date.now()}.${fileExt}`;
    const filePath = `${user?.email ?? "user"}/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from("events")
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        toast({ 
          title: "Photo upload failed", 
          description: error.message, 
          variant: "destructive" 
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("events")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Photo upload failed", 
        description: "An unexpected error occurred", 
        variant: "destructive" 
      });
      return null;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create events",
        variant: "destructive",
      });
      return;
    }
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      toast({
        title: "Admin access required",
        description: "Only administrators can create events",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }
      const { error } = await supabase.from("events").insert({
        title: values.title,
        description: values.description,
        date: values.date,
        time: values.time,
        location: values.location,
        max_attendees: values.maxAttendees ? parseInt(values.maxAttendees) : null,
        image_url: imageUrl,
        created_by: user.id,
        status: "published",
      });
      if (error) throw error;
      toast({
        title: "Event created",
        description: "The event has been created successfully",
      });
      form.reset();
      setImageFile(null);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Failed to create event",
        description: "There was an error creating the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter event description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxAttendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Attendees (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter maximum number of attendees" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel>Event Image (Optional)</FormLabel>
            <div className="flex items-center gap-2 mt-1">
              <Button type="button" variant="outline" size="sm" onClick={handleImageSelect}>
                {imageFile ? "Change Photo" : "Upload Photo"}
              </Button>
              {imageFile && <span className="text-xs truncate">{imageFile.name}</span>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {imageFile && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="rounded-lg w-auto max-h-40"
                />
              </div>
            )}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Event..." : "Create Event"}
        </Button>
      </form>
    </Form>
  );
} 