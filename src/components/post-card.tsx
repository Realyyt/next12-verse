import { useState } from "react";
import { Heart, Share, Copy as CopyIcon, Facebook, Twitter, Linkedin, UserIcon, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CommentSection } from "./comment-section";

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
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [shareOpen, setShareOpen] = useState(false);
  const postUrl = `${window.location.origin}/?post=${id}`;

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(postUrl);
    alert("Copied post link!"); // (Optional: replace with toast)
    setShareOpen(false);
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
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 gap-2 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "flex items-center gap-1", 
              liked ? "text-next12-orange" : "text-next12-gray"
            )}
            onClick={handleLike}
            aria-label={liked ? "Unlike post" : "Like post"}
          >
            <Heart fill={liked ? "#fe5b3e" : "none"} className="h-5 w-5 transition-colors" />
            <span>{likes}</span>
          </Button>
          
          <Popover open={shareOpen} onOpenChange={setShareOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-next12-gray">
                <Share className="h-5 w-5" />
                <span>Share</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="flex w-full gap-2 items-center" onClick={handleCopyLink}>
                  <CopyIcon className="w-4 h-4" />
                  <span>Copy link</span>
                </Button>
                <Button variant="outline" size="sm" className="flex w-full gap-2 items-center" onClick={() => openSocialShare(fbShare)}>
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span>Share to Facebook</span>
                </Button>
                <Button variant="outline" size="sm" className="flex w-full gap-2 items-center" onClick={() => openSocialShare(twitterShare)}>
                  <Twitter className="w-4 h-4 text-[#1da1f2]" />
                  <span>Share to Twitter</span>
                </Button>
                <Button variant="outline" size="sm" className="flex w-full gap-2 items-center" onClick={() => openSocialShare(linkedinShare)}>
                  <Linkedin className="w-4 h-4 text-[#0a66c2]" />
                  <span>Share to LinkedIn</span>
                </Button>
                <Button variant="outline" size="sm" className="flex w-full gap-2 items-center" onClick={() => openSocialShare(whatsappShare)}>
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  <span>Share to WhatsApp</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {canComment && (
          <CommentSection postId={id} currentUserName={currentUserName ?? null} />
        )}
      </div>
    </div>
  );
}
