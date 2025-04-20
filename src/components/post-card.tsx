
import { useState } from "react";
import { Share, MessageSquare, Link as LinkIcon, Copy as CopyIcon, MoreHorizontal, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Add this import for comments and share actions
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
  const [showShare, setShowShare] = useState(false);
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
    alert("Copied post link!"); // Keeping it simple; you may hook in with toast
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${author.name} on Next12`,
          text: content,
          url: postUrl,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className={cn("rounded-xl bg-white shadow", className)}>
      <div className="p-4">
        {/* Author header */}
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
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Post content */}
        <div className="mb-3">
          <p className="text-next12-dark whitespace-pre-line">{content}</p>
        </div>
        
        {/* Post image */}
        {image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img src={image} alt="Post image" className="w-full h-auto" />
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 gap-2 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "flex items-center gap-1", 
              liked ? "text-next12-orange" : "text-next12-gray"
            )}
            onClick={handleLike}
          >
            <Share className="h-5 w-5" />
            <span>{likes}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-next12-gray" onClick={() => setShowShare((v) => !v)}>
            <MessageSquare className="h-5 w-5" />
            <span>Share</span>
          </Button>

          {showShare && (
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="icon" onClick={handleCopyLink} title="Copy link">
                <CopyIcon className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNativeShare} title="Share">
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        {/* Comments section */}
        {canComment && (
          <CommentSection postId={id} currentUserName={currentUserName ?? null} />
        )}
      </div>
    </div>
  );
}
