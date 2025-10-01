import { useState } from "react";
import UserImage from "@/assets/svgs/UserIcon.svg";
import SendIcon from "@/assets/svgs/SendIcon.svg?react";
interface Comment {
  id: number;
  text: string;
  replies: string[];
}

const CommentsSection = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      { id: Date.now(), text: newComment, replies: [] },
    ]);
    setNewComment("");
  };

  const addReply = (id: number, replyText: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === id
          ? { ...comment, replies: [...comment.replies, replyText] }
          : comment
      )
    );
  };

  return (
    <>
      {/* Add Comment */}
      <div className="mb-4 border rounded-lg border-[#D6D6D6] p-3 text-end">
        <div className="w-full flex gap-2">
          <div className="w-12 h-12 p-1 rounded-full bg-[#EDEDED]">
            <img src={UserImage} className="w-full object-contain"></img>
          </div>
          <input
            type="text"
            className="flex-1 w-full bg-[#EDEDED] min-h-20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="اكتب تعليق..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <button
          onClick={addComment}
          className="bg-secondary mt-3 text-white px-4 py-1 rounded hover:bg-secondary/90 cursor-pointer"
        >
          <span>ارسال</span>
          <SendIcon className="inline-block" />
        </button>
      </div>
      <div className="w-full mx-auto p-4 border rounded-lg shadow">
        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 border rounded-lg bg-gray-50">
              <p className="font-medium">{comment.text}</p>

              {/* Replies */}
              <div className="ml-6 mt-2 space-y-2">
                {comment.replies.map((reply, i) => (
                  <div key={i} className="text-sm text-gray-700 pl-2 border-l">
                    ↳ {reply}
                  </div>
                ))}
              </div>

              {/* Add Reply */}
              <ReplyBox
                onReply={(replyText) => addReply(comment.id, replyText)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const ReplyBox = ({ onReply }: { onReply: (text: string) => void }) => {
  const [reply, setReply] = useState("");
  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="رد..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />
      <button
        onClick={() => {
          if (reply.trim()) {
            onReply(reply);
            setReply("");
          }
        }}
        className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
      >
        رد
      </button>
    </div>
  );
};

export default CommentsSection;
