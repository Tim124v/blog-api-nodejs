import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

type SortType = 'date' | 'likes';
type SortOrder = 'asc' | 'desc';

const POSTS_PER_PAGE = 5;

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Состояния для редактирования
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editText, setEditText] = useState('');
  const [editMedia, setEditMedia] = useState<File | null>(null);
  const [editMediaPreview, setEditMediaPreview] = useState<string | null>(null);
  const [editMediaType, setEditMediaType] = useState<'image' | 'video' | null>(null);

  // Состояния для сортировки и поиска
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isInitialLoad) {
      const savedProfile = localStorage.getItem('myblog-profile');
      const savedPosts = localStorage.getItem('myblog-posts');
      
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
        setShowStart(false);
      } else {
        setShowStart(true);
      }

      if (savedPosts) {
        try {
          const parsedPosts = JSON.parse(savedPosts);
          setPosts(parsedPosts);
        } catch (error) {
        }
      }
      setIsInitialLoad(false);
    } else {
      try {
        localStorage.setItem('myblog-posts', JSON.stringify(posts));
      } catch (error) {
       
      }
    }
  }, [posts, isInitialLoad]);

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
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMediaPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
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
    setPosts(prevPosts => {
      const updatedPosts = [newPost, ...prevPosts];
      return updatedPosts;
    });
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

  // редактирования поста
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditText(post.text);
    setEditMediaPreview(post.mediaUrl || null);
    setEditMediaType(post.mediaType || null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === editingPost.id
          ? {
              ...post,
              text: editText,
              mediaUrl: editMediaPreview || undefined,
              mediaType: editMediaType || undefined,
              date: new Date().toLocaleString(), // Обновляем дату при редактировании
            }
          : post
      )
    );

    setEditingPost(null);
    setEditText('');
    setEditMedia(null);
    setEditMediaPreview(null);
    setEditMediaType(null);
  };

  const handleEditMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only images or videos are allowed');
      return;
    }
    setEditMedia(file);
    setEditMediaType(file.type.startsWith('image/') ? 'image' : 'video');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditMediaPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  //сортировки и фильтрации постов
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        post =>
          post.text.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query)
      );
    }

    // Сортировка
    result.sort((a, b) => {
      if (sortType === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc'
          ? a.likes - b.likes
          : b.likes - a.likes;
      }
    });

    return result;
  }, [posts, searchQuery, sortType, sortOrder]);

  // Пагинация
  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredAndSortedPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredAndSortedPosts, currentPage]);

  // Сброс страницы
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortType, sortOrder]);

  return (
    <div className="min-h-screen flex flex-col items-center py-4 sm:py-8 relative px-2 sm:px-0">
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
      <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-lg mb-4 sm:mb-8 tracking-tight animate-pulse-slow text-center">
        My Blog
      </h1>
      {/* Кнопка Start */}
      {showStart && !profile && (
        <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[300px]">
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
            {...{ className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40" }}
          >
            <div className="absolute inset-0" onClick={() => setShowProfileModal(false)} />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              {...{ className: "relative w-full max-w-xs p-3 sm:max-w-sm sm:p-6 border border-white/30 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl" }}
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
      {!showStart && profile && (
        <>
          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl p-2 sm:p-3 md:p-8 bg-white/20 rounded-2xl shadow-2xl mb-4 sm:mb-8 backdrop-blur-md border border-white/20 relative">
            <form onSubmit={handlePost} className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 shadow"
                />
                <span className="text-gray-700 font-semibold text-base sm:text-lg">{profile.name}</span>
              </div>
              <textarea
                className="input-field min-h-[60px] sm:min-h-[80px]"
                placeholder="What's new? (up to 280 characters)"
                maxLength={280}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              {mediaPreview && mediaType === 'image' && (
                <img
                  src={mediaPreview}
                  alt="preview"
                  className="max-h-32 sm:max-h-48 rounded-xl object-contain border border-gray-200 shadow"
                />
              )}
              {mediaPreview && mediaType === 'video' && (
                <video
                  src={mediaPreview}
                  controls
                  className="max-h-32 sm:max-h-48 rounded-xl object-contain border border-gray-200 shadow"
                />
              )}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <label className="btn-primary cursor-pointer w-full sm:w-auto text-center">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                  Choose file
                </label>
                <span className="text-gray-500 text-xs sm:text-sm select-none flex-1">
                  {media ? media.name : 'No file chosen'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMedia(null);
                    setMediaPreview(null);
                    setMediaType(null);
                  }}
                  className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${media ? 'text-blue-500 hover:underline cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                  disabled={!media}
                >
                  Clear media
                </button>
              </div>
              {error && <div className="text-red-500 text-xs sm:text-sm font-medium">{error}</div>}
              <button type="submit" className="btn-primary mt-2 w-full sm:w-auto">
                Publish
              </button>
            </form>
          </div>

          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mb-2 sm:mb-4 flex flex-col gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <input
                type="text"
                placeholder="Поиск постов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 input-field text-sm sm:text-base py-2"
              />
              <select
                value={`${sortType}-${sortOrder}`}
                onChange={(e) => {
                  const [type, order] = e.target.value.split('-') as [SortType, SortOrder];
                  setSortType(type);
                  setSortOrder(order);
                }}
                className="input-field text-sm sm:text-base py-2"
              >
                <option value="date-desc">Сначала новые</option>
                <option value="date-asc">Сначала старые</option>
                <option value="likes-desc">По лайкам (↓)</option>
                <option value="likes-asc">По лайкам (↑)</option>
              </select>
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 text-xs sm:text-base">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-primary py-1 px-3 text-xs sm:text-sm disabled:opacity-50"
                >
                  ←
                </button>
                <span className="flex items-center gap-1">
                  Страница {currentPage} из {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-primary py-1 px-3 text-xs sm:text-sm disabled:opacity-50"
                >
                  →
                </button>
              </div>
            )}
          </div>

          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl flex flex-col gap-2 sm:gap-4">
            <AnimatePresence>
              {paginatedPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.4 }}
                  {...{ className: "card group" }}
                >
                  {/* Кнопки управления постом */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="text-gray-400 hover:text-blue-500 transition-colors text-xl font-bold"
                      title="Edit post"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-xl font-bold"
                      title="Delete post"
                    >
                      ×
                    </button>
                  </div>
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
                          {...{ className: "flex items-center gap-2 mt-2 bg-gray-100 rounded-lg px-3 py-2" }}
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

          {/* Модальное окно редактирования */}
          <AnimatePresence>
            {editingPost && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                {...{ className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40" }}
              >
                <div className="absolute inset-0" onClick={() => setEditingPost(null)} />
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                  {...{ className: "relative w-full max-w-md p-6 border border-white/30 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl" }}
                >
                  <h2 className="text-xl font-bold mb-4">Редактировать пост</h2>
                  <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
                    <textarea
                      className="input-field"
                      placeholder="Редактировать текст..."
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={280}
                    />
                    {editMediaPreview && editMediaType === 'image' && (
                      <img
                        src={editMediaPreview}
                        alt="preview"
                        className="max-h-48 rounded-xl object-contain border border-gray-200 shadow"
                      />
                    )}
                    {editMediaPreview && editMediaType === 'video' && (
                      <video
                        src={editMediaPreview}
                        controls
                        className="max-h-48 rounded-xl object-contain border border-gray-200 shadow"
                      />
                    )}
                    <div className="flex items-center gap-3">
                      <label className="btn-primary cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleEditMediaChange}
                          className="hidden"
                        />
                        Изменить медиа
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMedia(null);
                          setEditMediaPreview(null);
                          setEditMediaType(null);
                        }}
                        className={`text-xs ml-auto font-semibold px-2 py-1 rounded transition-colors ${
                          editMediaPreview
                            ? 'text-blue-500 hover:underline cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        disabled={!editMediaPreview}
                      >
                        Удалить медиа
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="btn-primary flex-1"
                        disabled={!editText.trim() && !editMediaPreview}
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPost(null)}
                        className="btn-primary flex-1 bg-gray-500 hover:bg-gray-600"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default App;
