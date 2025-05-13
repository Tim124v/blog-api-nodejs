export interface Post {
  id: number;
  avatar: string;
  author: string;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  date: string;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: number;
  text: string;
  author: string;
  avatar: string;
  date: string;
}

export interface User {
  id: number;
  username: string;
  avatar: string;
} 