import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Post, Comment } from './types';

const avatarList = [
  'https://ui-avatars.com/api/?name=User&background=random&size=64',
  'https://api.dicebear.com/7.x/bottts/svg?seed=cat',
  'https://api.dicebear.com/7.x/bottts/svg?seed=fox',
  'https://api.dicebear.com/7.x/bottts/svg?seed=dog',
  'https://api.dicebear.com/7.x/bottts/svg?seed=owl',
  'https://api.dicebear.com/7.x/bottts/svg?seed=lion',
  'https://api.dicebear.com/7.x/bottts/svg?seed=unicorn',
];

const defaultAvatar = avatarList[0];

const App: React.FC = () => {
  const [profile, setProfile] = useState<{ name: string; avatar: string } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState(defaultAvatar);
  const [profileAvatarFile, setProfileAvatarFile] = useState<string | null>(null);
  const [showStart, setShowStart] = useState(true);

  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [error, setError] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [postId: number]: string }>({});

  useEffect(() => {
    const saved = localStorage.getItem('myblog-profile');
    if (saved) {
      setProfile(JSON.parse(saved));
      setShowStart(false);
    } else {
      setShowStart(true);
    }
  }, []);

  const saveProfile = () => {
    if (!profileName.trim()) return;
    const newProfile = { name: profileName.trim(), avatar: profileAvatar };
    setProfile(newProfile);
    localStorage.setItem('myblog-profile', JSON.stringify(newProfile));
    setShowProfileModal(false);
    setShowStart(false);
  };

  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only images or videos are allowed');
      return;
    }
    setMedia(file);
    setMediaType(file.type.startsWith('image/') ? 'image' : 'video');
    setMediaPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleProfileAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileAvatarFile(ev.target?.result as string);
      setProfileAvatar(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !media) {
      setError('Enter some text or add media');
      return;
    }
    if (text.length > 280) {
      setError('Max 280 characters');
      return;
    }
    if (!profile) {
      setShowProfileModal(true);
      return;
    }
    const newPost: Post = {
      id: Date.now(),
      avatar: profile.avatar,
      author: profile.name,
      text,
      mediaUrl: mediaPreview || undefined,
      mediaType: mediaType || undefined,
      date: new Date().toLocaleString(),
      likes: 0,
      comments: [],
    };
    setPosts([newPost, ...posts]);
    setText('');
    setMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    setError('');
  };

  const handleLike = (id: number) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleDelete = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  // --- Комментарии ---
  const handleCommentInput = (postId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleAddComment = (postId: number) => {
    if (!profile) {
      setShowProfileModal(true);
      return;
    }
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const newComment: Comment = {
      id: Date.now(),
      text,
      author: profile.name,
      avatar: profile.avatar,
      date: new Date().toLocaleString(),
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleDeleteComment = (postId: number, commentId: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 relative">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: 'transparent' } },
          fpsLimit: 60,
          particles: {
            color: { value: '#ffffff' },
            links: {
              color: '#ffffff',
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              enable: true,
              outModes: { default: 'bounce' },
              random: false,
              speed: 2,
              straight: false,
            },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.5 },
            shape: { type: 'circle' },
            size: { value: { min: 1, max: 5 } },
          },
          detectRetina: true,
        }}
      />
      <h1 className="text-4xl font-extrabold text-white drop-shadow-lg mb-8 tracking-tight animate-pulse-slow">
        My Blog
      </h1>
      {/* Кнопка Start */}
      {showStart && !profile && (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <button
            className="btn-primary text-xl px-8 py-3 shadow-lg"
            onClick={() => setShowProfileModal(true)}
          >
            Start
          </button>
        </div>
      )}
      {/* Модальное окно профиля */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <div className="absolute inset-0" onClick={() => setShowProfileModal(false)} />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="relative w-full max-w-xs p-3 sm:max-w-sm sm:p-6 border border-white/30 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4 text-center">Your Profile</h2>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 mb-4 text-lg focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter your name"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                maxLength={24}
              />
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {avatarList.map((url, i) => (
                  <button
                    key={url}
                    className={`rounded-full border-2 ${profileAvatar === url ? 'border-blue-500' : 'border-transparent'} p-1 transition`}
                    onClick={() => { setProfileAvatar(url); setProfileAvatarFile(null); }}
                    type="button"
                  >
                    <img src={url} alt="avatar" className="w-12 h-12 rounded-full" />
                  </button>
                ))}
                {/* Кастомный аватар */}
                {profileAvatarFile && (
                  <button
                    className={`rounded-full border-2 ${profileAvatar === profileAvatarFile ? 'border-blue-500' : 'border-transparent'} p-1 transition`}
                    onClick={() => setProfileAvatar(profileAvatarFile)}
                    type="button"
                  >
                    <img src={profileAvatarFile} alt="avatar" className="w-12 h-12 rounded-full" />
                  </button>
                )}
                <label className="rounded-full border-2 border-dashed border-gray-300 p-1 cursor-pointer hover:border-blue-400 transition" title="Upload avatar">
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfileAvatarUpload} />
                  <span className="block w-12 h-12 flex items-center justify-center text-2xl text-gray-400">+</span>
                </label>
              </div>
              <button
                className="btn-primary w-full py-2 text-base sm:text-lg"
                onClick={saveProfile}
                disabled={!profileName.trim()}
              >
                Save
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Форма публикации и посты только если профиль есть */}
      {!showStart && profile && (
        <>
          <div className="w-full max-w-xs p-3 sm:max-w-md sm:p-8 bg-white/20 rounded-2xl shadow-2xl mb-8 backdrop-blur-md border border-white/20 relative">
            <form onSubmit={handlePost} className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border border-gray-200 shadow"
                />
                <span className="text-gray-700 font-semibold text-lg">{profile.name}</span>
              </div>
              <textarea
                className="input-field"
                placeholder="What's new? (up to 280 characters)"
                maxLength={280}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {mediaPreview && mediaType === 'image' && (
                <img
                  src={mediaPreview}
                  alt="preview"
                  className="max-h-48 rounded-xl object-contain border border-gray-200 shadow"
                />
              )}
              {mediaPreview && mediaType === 'video' && (
                <video
                  src={mediaPreview}
                  controls
                  className="max-h-48 rounded-xl object-contain border border-gray-200 shadow"
                />
              )}
              <div className="flex items-center gap-3">
                <label className="btn-primary cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                  Choose file
                </label>
                <span className="text-gray-500 text-sm select-none">
                  {media ? media.name : 'No file chosen'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMedia(null);
                    setMediaPreview(null);
                    setMediaType(null);
                  }}
                  className={`text-xs ml-auto font-semibold px-2 py-1 rounded transition-colors ${media ? 'text-blue-500 hover:underline cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                  disabled={!media}
                >
                  Clear media
                </button>
              </div>
              {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
              <button type="submit" className="btn-primary mt-2">
                Publish
              </button>
            </form>
          </div>
          <div className="w-full max-w-md flex flex-col gap-4">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.4 }}
                  className="card group"
                >
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors text-xl font-bold opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                    title="Delete post"
                  >
                    ×
                  </button>
                  <div className="flex items-center gap-3">
                    <img
                      src={post.avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border border-gray-200"
                    />
                    <span className="text-xs text-gray-500">{post.author || 'User'}</span>
                    <span className="text-xs text-gray-400">{post.date}</span>
                  </div>
                  <div className="text-gray-800 break-words text-base whitespace-pre-line">
                    {post.text}
                  </div>
                  {post.mediaUrl && post.mediaType === 'image' && (
                    <img
                      src={post.mediaUrl}
                      alt="media"
                      className="max-h-60 rounded-xl object-contain border border-gray-200 shadow"
                    />
                  )}
                  {post.mediaUrl && post.mediaType === 'video' && (
                    <video
                      src={post.mediaUrl}
                      controls
                      className="max-h-60 rounded-xl object-contain border border-gray-200 shadow"
                    />
                  )}
                  <div className="flex gap-4 mt-2 items-center">
                    <button
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition"
                      onClick={() => handleLike(post.id)}
                    >
                      ❤️ <span>{post.likes}</span>
                    </button>
                    <button
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition"
                      title="Show comments"
                    >
                      💬 <span>{post.comments.length}</span>
                    </button>
                  </div>
                  {/* Комментарии */}
                  <div className="mt-3">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="flex-1 border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        placeholder="Add a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={e => handleCommentInput(post.id, e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                      />
                      <button
                        className="text-blue-500 font-semibold px-2 py-1 rounded hover:bg-blue-100 transition"
                        onClick={() => handleAddComment(post.id)}
                        type="button"
                        disabled={!(commentInputs[post.id] && commentInputs[post.id].trim())}
                      >
                        Send
                      </button>
                    </div>
                    <AnimatePresence>
                      {post.comments.map((c) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex items-center gap-2 mt-2 bg-gray-100 rounded-lg px-3 py-2"
                        >
                          <img src={c.avatar || defaultAvatar} alt="avatar" className="w-7 h-7 rounded-full border border-gray-200" />
                          <span className="font-semibold text-gray-700 text-xs">{c.author}:</span>
                          <span className="text-gray-800 text-sm flex-1">{c.text}</span>
                          <span className="text-gray-400 text-xs">{c.date}</span>
                          <button
                            className="text-red-400 hover:text-red-600 text-lg px-1"
                            onClick={() => handleDeleteComment(post.id, c.id)}
                            title="Delete comment"
                          >
                            ×
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
