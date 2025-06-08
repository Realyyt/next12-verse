import { useState } from "react";
import { Heart, Share, Copy as CopyIcon, Facebook, Twitter, Linkedin, UserIcon, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CommentSection } from "./comment-section";
import { toggleLike, sharePost } from "@/lib/posts";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    isVerified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  image?: string;
  className?: string;
  canComment?: boolean;
  currentUserName?: string | null;
  liked?: boolean;
  onLikeToggle?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function PostCard({
  id,
  author,
  content,
  timestamp,
  likes: initialLikes,
  comments,
  image,
  className,
  canComment,
  currentUserName,
  liked: initialLiked = false,
  onLikeToggle,
  onComment,
  onShare,
}: PostCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [shareOpen, setShareOpen] = useState(false);
  const { user } = useAuthUser();
  const { toast } = useToast();
  const postUrl = `${window.location.origin}/?post=${id}`;

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Please sign in to like posts", variant: "destructive" });
      return;
    }

    try {
      const { liked: newLiked } = await toggleLike(id, user.id);
      setLiked(newLiked);
      setLikes(prev => newLiked ? prev + 1 : prev - 1);
      onLikeToggle?.();
    } catch (error) {
      toast({ title: "Failed to update like", description: "Please try again", variant: "destructive" });
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(postUrl);
    toast({ title: "Copied post link!" });
    setShareOpen(false);
  };

  const handleShare = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to share posts',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sharePost(id, user.id);
      onShare?.();
      toast({
        title: 'Success',
        description: 'Post shared successfully',
      });
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: 'Error',
        description: 'Failed to share post',
        variant: 'destructive',
      });
    }
  };

  const handleComment = () => {
    onComment?.();
  };

  const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
  const twitterShare = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(content)}`;
  const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(content + " " + postUrl)}`;

  const openSocialShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  };

  return (
    <div className={cn("rounded-xl bg-white shadow", className)}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-3">
              {author.avatar ? (
                <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-5 w-5 text-next12-gray" />
              )}
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-medium text-next12-dark">{author.name}</span>
                {author.isVerified && (
                  <svg className="h-4 w-4 ml-1 text-next12-orange" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex text-sm">
                <span className="text-next12-gray">@{author.username}</span>
                <span className="mx-1 text-next12-gray">•</span>
                <span className="text-next12-gray">{timestamp}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-next12-gray">
            <span className="sr-only">More Options</span>
            ...
          </Button>
        </div>
        
        <div className="mb-3">
          <p className="text-next12-dark whitespace-pre-line">{content}</p>
        </div>
        
        {image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img src={image} alt="Post image" className="w-full h-auto" />
          </div>
        )}
        
        <div className="flex items-center gap-4 text-next12-gray">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1 hover:text-next12-orange",
              liked && "text-next12-orange"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            <span>{likes}</span>
          </Button>

          {canComment && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 hover:text-next12-orange"
              onClick={handleComment}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments}</span>
            </Button>
          )}

          <Popover open={shareOpen} onOpenChange={setShareOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 hover:text-next12-orange"
                onClick={handleShare}
              >
                <Share className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={handleCopyLink}
                >
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => openSocialShare(fbShare)}
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => openSocialShare(twitterShare)}
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => openSocialShare(linkedinShare)}
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {canComment && (
          <div className="mt-4">
            <CommentSection
              postId={id}
              currentUserName={currentUserName}
            />
          </div>
        )}
      </div>
    </div>
  );
}
