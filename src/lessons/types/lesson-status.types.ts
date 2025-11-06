export type LessonStatusItem = {
  id: number;
  name: string;
  duration: number;
  order: number;
  isCompleted: boolean;
  isUnlocked: boolean;
};

export type TopicWithLessonsStatus = {
  id: number;
  name: string;
  duration: number; // مجموع مدة دروس التوبيك
  lessons: LessonStatusItem[];
};
