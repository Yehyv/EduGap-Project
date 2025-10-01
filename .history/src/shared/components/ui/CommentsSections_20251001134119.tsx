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

  return (
    <>
      {/* Add Comment */}
      <div className="mb-4 border rounded-lg border-[#D6D6D6] p-3 text-end">
        <div className="w-full flex gap-2">
          <div className="w-12 h-12 p-1 rounded-full bg-[#EDEDED]">
            <img src={UserImage} className="w-full object-contain" />
          </div>

          <textarea
            className="flex-1 w-full bg-[#EDEDED] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            placeholder="اكتب تعليق..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3} // يبدأ من فوق
          />
        </div>

        <button
          onClick={addComment}
          className="bg-secondary mt-3 text-white px-4 py-1 rounded hover:bg-secondary/90 cursor-pointer"
        >
          <SendIcon className="inline-block me-2 w-4" />
          <span>ارسال</span>
        </button>
      </div>
      <div className="mb-4 border rounded-lg border-[#D6D6D6] p-3 text-end">
        <div className="w-full flex gap-2">
          <div className="w-12 h-12 p-1 rounded-full bg-[#EDEDED]">
            <img src={UserImage} className="w-full object-contain" />
          </div>
          <div className="text-start">
            <h5>يحيي عبد الرؤوف</h5>
            <h6 className="text-[#939393] text-sm">منذ يومان</h6>
            <div className="text-start">
              "دورة ممتازة! الأمثلة العملية ساعدتني جدًا على فهم كيفية تطبيق
              الذكاء الاصطناعي في حملاتنا التسويقية. أنصح بها بشدة!"
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentsSection;
