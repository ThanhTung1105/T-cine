import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHeart, 
  FiMessageSquare, 
  FiShare2, 
  FiImage, 
  FiFilm, 
  FiSmile, 
  FiX, 
  FiSearch, 
  FiSend, 
  FiTrendingUp, 
  FiAward, 
  FiPlus, 
  FiCheck,
  FiCalendar
} from 'react-icons/fi';
import useAuthStore from '../../../store/useAuthStore';
import movieApi from '../../../api/movieApi';
import notify from '../../../utils/notify';
import styles from './CommunityPage.module.scss';

const CommunityPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  // State for posts
  const [posts, setPosts] = useState([]);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'hottest'
  const [selectedTag, setSelectedTag] = useState(null);

  // Form states for creating a new post
  const [postContent, setPostContent] = useState('');
  const [selectedMovieTag, setSelectedMovieTag] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [showMovieSelect, setShowMovieSelect] = useState(false);
  const [movieSearch, setMovieSearch] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  // Comments inputs & toggles per post
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  // Real movies list from API
  const [moviesList, setMoviesList] = useState([]);

  // Mock initial posts if local storage is empty
  const defaultPosts = [
    {
      id: 1,
      author: { 
        name: 'Thanh Tùng', 
        avatar: 'https://ui-avatars.com/api/?name=Thanh+Tung&background=0D8ABC&color=fff' 
      },
      time: '2 giờ trước',
      movieTag: 'Mai',
      content: 'Vừa đi xem Mai về, khóc ướt cả khăn giấy 😭. Nhịp phim rất hay nhưng kết thúc làm mình cứ bị buồn lãng đãng. Ai chung cảm nhận không?',
      image: 'https://cdn.galaxycine.vn/media/2024/2/9/mai-500_1707447477943.jpg',
      likes: 124,
      commentsCount: 3,
      isLiked: false,
      commentsList: [
        {
          id: 101,
          author: { 
            name: 'Ngọc Mai', 
            avatar: 'https://ui-avatars.com/api/?name=Ngoc+Mai&background=f472b6&color=fff' 
          },
          time: '1 giờ trước',
          content: 'Đúng luôn ấy, kết phim buồn quá, nghe bài hát cuối phim lại càng xúc động hơn.'
        },
        {
          id: 102,
          author: { 
            name: 'Hoàng Long', 
            avatar: 'https://ui-avatars.com/api/?name=Hoang+Long&background=10b981&color=fff' 
          },
          time: '30 phút trước',
          content: 'Phim Trấn Thành làm phần này sâu sắc hơn nhiều. Thích diễn xuất của Phương Anh Đào.'
        },
        {
          id: 103,
          author: { 
            name: 'Văn Đức', 
            avatar: 'https://ui-avatars.com/api/?name=Van+Duc&background=6366f1&color=fff' 
          },
          time: '5 phút trước',
          content: 'Kịch bản đỉnh cao thực sự! Rất xứng đáng công sức ra rạp.'
        }
      ]
    },
    {
      id: 2,
      author: { 
        name: 'Ngọc Mai', 
        avatar: 'https://ui-avatars.com/api/?name=Ngoc+Mai&background=f472b6&color=fff' 
      },
      time: '5 giờ trước',
      movieTag: 'Đào, Phở và Piano',
      content: 'Cho mình hỏi rạp T-CINE Giga Mall có suất chiếu nào cuối tuần này không ạ? Thấy bạn bè khen quá trời mà chưa có thời gian đi xem.',
      image: null,
      likes: 45,
      commentsCount: 2,
      isLiked: true,
      commentsList: [
        {
          id: 201,
          author: { 
            name: 'Thanh Tùng', 
            avatar: 'https://ui-avatars.com/api/?name=Thanh+Tung&background=0D8ABC&color=fff' 
          },
          time: '4 giờ trước',
          content: 'Cuối tuần này suất chiếu nhiều lắm bạn ơi! Bạn vào mục Đặt Vé trên web/app chọn rạp Giga Mall xem giờ nhé, thanh toán online nhanh cực!'
        },
        {
          id: 202,
          author: { 
            name: 'Quỳnh Hương', 
            avatar: 'https://ui-avatars.com/api/?name=Quynh+Huong&background=ec4899&color=fff' 
          },
          time: '3 giờ trước',
          content: 'Đã xem ở Giga Mall hôm qua, rạp siêu rộng và âm thanh cực đã nha bạn.'
        }
      ]
    },
    {
      id: 3,
      author: { 
        name: 'Hoàng Long', 
        avatar: 'https://ui-avatars.com/api/?name=Hoang+Long&background=10b981&color=fff' 
      },
      time: '1 ngày trước',
      movieTag: 'Kung Fu Panda 4',
      content: 'Review nhẹ Kung Fu Panda 4: Phim giải trí tốt, hình ảnh đẹp, tuy nhiên cốt truyện hơi dễ đoán. Chấm 7/10 nhé mọi người. Khá hợp đi xem cùng gia đình.',
      image: null,
      likes: 89,
      commentsCount: 1,
      isLiked: false,
      commentsList: [
        {
          id: 301,
          author: { 
            name: 'Anh Tuấn', 
            avatar: 'https://ui-avatars.com/api/?name=Anh+Tuan&background=f59e0b&color=fff' 
          },
          time: '18 giờ trước',
          content: 'Đồng quan điểm, phần này phản diện hơi nhạt nhòa, nhưng tạo hình và võ thuật vẫn rất cuốn mắt.'
        }
      ]
    }
  ];

  // List of active emojis for quick reactions
  const emojis = ['😊', '😭', '🤩', '🍿', '🔥', '❤️', '👍', '😮', '😴'];

  // Load and initialize posts from localStorage or defaults
  useEffect(() => {
    const storedPosts = localStorage.getItem('tcine_community_posts');
    if (storedPosts) {
      try {
        setPosts(JSON.parse(storedPosts));
      } catch (err) {
        setPosts(defaultPosts);
      }
    } else {
      setPosts(defaultPosts);
      localStorage.setItem('tcine_community_posts', JSON.stringify(defaultPosts));
    }
  }, []);

  // Fetch real movies list from backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await movieApi.getAll();
        const list = res.data?.data || res.data || [];
        setMoviesList(list);
      } catch (err) {
        console.error('Failed to fetch movies list for tagging:', err);
        // Fallback standard movies if backend offline
        setMoviesList([
          { id: 1, title: 'Mai' },
          { id: 2, title: 'Đào, Phở và Piano' },
          { id: 3, title: 'Kung Fu Panda 4' },
          { id: 4, title: 'Lật Mặt 7: Một Điều Ước' },
          { id: 5, title: 'Dune 2: Cát Đại Hành Tinh' },
          { id: 6, title: 'Gặp Lại Chị Bầu' }
        ]);
      }
    };
    fetchMovies();
  }, []);

  // Sync posts to localStorage
  const savePosts = (newPosts) => {
    setPosts(newPosts);
    localStorage.setItem('tcine_community_posts', JSON.stringify(newPosts));
  };

  // Image Upload handler
  const handleImageUploadClick = () => {
    if (!isAuthenticated) {
      notify.warning('Vui lòng đăng nhập để thực hiện!');
      return;
    }
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      notify.error('Dung lượng ảnh phải nhỏ hơn 10MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result);
      notify.success('Đính kèm ảnh thành công!');
    };
    reader.readAsDataURL(file);
  };

  // Tag Movie selection helper
  const handleSelectMovie = (movieTitle) => {
    setSelectedMovieTag(movieTitle);
    setShowMovieSelect(false);
    setMovieSearch('');
  };

  // Add Emoji to textarea
  const handleAddEmoji = (emoji) => {
    setPostContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Post Submission handler
  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      notify.error('Vui lòng đăng nhập trước khi đăng bài!');
      return;
    }
    if (!postContent.trim()) {
      notify.warning('Nội dung bài viết không được để trống!');
      return;
    }

    const newPost = {
      id: Date.now(),
      author: {
        name: user?.name || 'Thành viên T-Cine',
        avatar: user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`
      },
      time: 'Vừa xong',
      movieTag: selectedMovieTag,
      content: postContent,
      image: attachedImage,
      likes: 0,
      commentsCount: 0,
      isLiked: false,
      commentsList: []
    };

    const updatedPosts = [newPost, ...posts];
    savePosts(updatedPosts);

    // Reset fields
    setPostContent('');
    setSelectedMovieTag(null);
    setAttachedImage(null);
    notify.success('Đăng bài viết mới thành công!');
  };

  // Like Toggle handler
  const handleLikeToggle = (postId) => {
    const updated = posts.map(post => {
      if (post.id === postId) {
        const nextLiked = !post.isLiked;
        return {
          ...post,
          isLiked: nextLiked,
          likes: nextLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    });
    savePosts(updated);
  };

  // Expand / Toggle Comments panel
  const toggleCommentsPanel = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Add Comment handler
  const handleCommentSubmit = (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    const updated = posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: Date.now(),
          author: {
            name: isAuthenticated ? (user?.name || 'Bạn') : 'Khách',
            avatar: isAuthenticated && user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent((isAuthenticated && user?.name) ? user.name : 'Guest')}&background=10b981&color=fff`
          },
          time: 'Vừa xong',
          content: commentText
        };
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          commentsList: [...(post.commentsList || []), newComment]
        };
      }
      return post;
    });

    savePosts(updated);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    notify.success('Gửi bình luận thành công!');
  };

  // Comment input change handler
  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  // Share handler simulation
  const handleShareClick = (post) => {
    const shareUrl = `${window.location.origin}/cong-dong/post/${post.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        notify.info('Đã sao chép liên kết bài viết vào bộ nhớ tạm!');
      })
      .catch(() => {
        notify.error('Không thể sao chép liên kết!');
      });
  };

  // Delete post (only for your own posts, simulated check)
  const handleDeletePost = (postId) => {
    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete) return;

    // Simulate delete access (if user matches or if post was created in current session)
    // We allow deleting posts that match current user's name
    if (!isAuthenticated || (postToDelete.author.name !== user?.name && postToDelete.id < 1000000000000)) {
      notify.error('Bạn không có quyền xóa bài viết này!');
      return;
    }

    const updated = posts.filter(p => p.id !== postId);
    savePosts(updated);
    notify.success('Đã xóa bài đăng thảo luận!');
  };

  // Filtering & Sorting processes
  const filteredPosts = posts
    .filter(post => {
      // Filter by click tag
      if (selectedTag) {
        if (!post.movieTag || post.movieTag.toLowerCase() !== selectedTag.toLowerCase()) {
          return false;
        }
      }
      // Filter by search bar query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const contentMatch = post.content.toLowerCase().includes(query);
        const authorMatch = post.author.name.toLowerCase().includes(query);
        const tagMatch = post.movieTag && post.movieTag.toLowerCase().includes(query);
        return contentMatch || authorMatch || tagMatch;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'hottest') {
        return b.likes - a.likes;
      }
      // default: newest
      return b.id - a.id;
    });

  // Unique trending tags gathered dynamically from posts
  const getTrendingTopics = () => {
    const tagsMap = {};
    posts.forEach(p => {
      if (p.movieTag) {
        tagsMap[p.movieTag] = (tagsMap[p.movieTag] || 0) + 1;
      }
    });
    // Sort tags by frequency and return top 5
    return Object.keys(tagsMap)
      .sort((a, b) => tagsMap[b] - tagsMap[a])
      .slice(0, 5);
  };

  const trendingTopics = getTrendingTopics().length > 0 
    ? getTrendingTopics() 
    : ['Mai', 'Đào, Phở và Piano', 'Kung Fu Panda 4', 'Dune 2', 'Lật Mặt 7'];

  return (
    <div className={styles.communityPage}>
      <div className={styles.container}>
        {/* Header Hero Area */}
        <div className={styles.heroHeader}>
          <h1>Cộng Đồng T-Cine</h1>
          <p>Chia sẻ đánh giá, bàn luận về những tác phẩm điện ảnh xuất sắc nhất tại hệ thống rạp T-CINE</p>
        </div>

        <div className={styles.layout}>
          {/* Main Feed Column */}
          <div className={styles.mainFeed}>
            
            {/* Create Post Box */}
            <div className={styles.createPostBox}>
              {!isAuthenticated && (
                <div className={styles.loginOverlay}>
                  <p>Bạn cần đăng nhập để tham gia thảo luận cùng cộng đồng T-Cine</p>
                  <Link to="/dang-nhap" className={styles.loginBtn}>Đăng nhập ngay</Link>
                </div>
              )}
              
              <div className={styles.postHeader}>
                <img 
                  src={isAuthenticated && user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`) : 'https://ui-avatars.com/api/?name=Guest&background=e2e8f0&color=64748b'} 
                  alt="Avatar" 
                  className={styles.avatar} 
                />
                <div className={styles.inputArea}>
                  <textarea 
                    placeholder={isAuthenticated ? `Chào ${user?.name?.split(' ')[0] || 'bạn'}, hôm nay bạn muốn chia sẻ đánh giá phim nào?` : "Đăng nhập để chia sẻ cảm xúc..."}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    disabled={!isAuthenticated}
                    rows="3"
                  ></textarea>

                  {/* Render Selected Movie Tag if exists */}
                  {selectedMovieTag && (
                    <div className={styles.selectedMovieBadge}>
                      <FiFilm className={styles.filmIcon} />
                      <span>{selectedMovieTag}</span>
                      <button type="button" onClick={() => setSelectedMovieTag(null)} title="Hủy tag">
                        <FiX />
                      </button>
                    </div>
                  )}

                  {/* Render Attached Image preview if exists */}
                  {attachedImage && (
                    <div className={styles.attachedImagePreview}>
                      <img src={attachedImage} alt="Upload preview" />
                      <button type="button" className={styles.removeImageBtn} onClick={() => setAttachedImage(null)} title="Xóa ảnh">
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Post Attachments Bar */}
              <div className={styles.postActions}>
                <div className={styles.actionIcons}>
                  {/* File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                  
                  <button 
                    type="button"
                    disabled={!isAuthenticated}
                    onClick={handleImageUploadClick}
                    className={styles.actionBtn}
                  >
                    <FiImage className={styles.imageIcon} /> <span>Đính kèm ảnh</span>
                  </button>
                  
                  {/* Movie Tag button */}
                  <div className={styles.popoverWrapper}>
                    <button 
                      type="button"
                      disabled={!isAuthenticated}
                      onClick={() => {
                        setShowMovieSelect(!showMovieSelect);
                        setShowEmojiPicker(false);
                      }}
                      className={`${styles.actionBtn} ${selectedMovieTag ? styles.activeTagBtn : ''}`}
                    >
                      <FiFilm className={styles.filmIcon} /> <span>Gắn thẻ phim</span>
                    </button>

                    {/* Movie search / select popover */}
                    {showMovieSelect && (
                      <div className={styles.popoverDropdown}>
                        <div className={styles.popoverHeader}>
                          <FiSearch />
                          <input 
                            type="text" 
                            placeholder="Tìm kiếm phim..." 
                            value={movieSearch}
                            onChange={(e) => setMovieSearch(e.target.value)}
                            autoFocus
                          />
                          <button type="button" onClick={() => setShowMovieSelect(false)}>
                            <FiX />
                          </button>
                        </div>
                        <ul className={styles.popoverList}>
                          {moviesList
                            .filter(m => m.title.toLowerCase().includes(movieSearch.toLowerCase()))
                            .map(m => (
                              <li key={m.id} onClick={() => handleSelectMovie(m.title)}>
                                <FiFilm className={styles.itemIcon} />
                                <span>{m.title}</span>
                              </li>
                            ))
                          }
                          {moviesList.filter(m => m.title.toLowerCase().includes(movieSearch.toLowerCase())).length === 0 && (
                            <li className={styles.noOption}>Không tìm thấy phim</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Emoji selector button */}
                  <div className={styles.popoverWrapper}>
                    <button 
                      type="button"
                      disabled={!isAuthenticated}
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowMovieSelect(false);
                      }}
                      className={styles.actionBtn}
                    >
                      <FiSmile className={styles.emojiIcon} /> <span>Cảm xúc</span>
                    </button>

                    {/* Emoji list popover */}
                    {showEmojiPicker && (
                      <div className={styles.emojiPopover}>
                        <div className={styles.emojiGrid}>
                          {emojis.map((emoji, index) => (
                            <span 
                              key={index} 
                              className={styles.emojiItem} 
                              onClick={() => handleAddEmoji(emoji)}
                            >
                              {emoji}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  onClick={handlePostSubmit}
                  className={`${styles.submitBtn} ${postContent.trim() ? styles.active : ''}`}
                  disabled={!isAuthenticated || !postContent.trim()}
                >
                  <FiSend /> <span>Đăng Bài</span>
                </button>
              </div>
            </div>

            {/* Filter and Sort Panel */}
            <div className={styles.filterSortPanel}>
              <div className={styles.searchBar}>
                <FiSearch className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm nội dung bài viết, người đăng, phim..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <FiX className={styles.clearSearch} onClick={() => setSearchQuery('')} title="Hủy tìm kiếm" />
                )}
              </div>
              
              <div className={styles.panelRight}>
                <div className={styles.sortTabs}>
                  <button 
                    className={sortBy === 'newest' ? styles.activeTab : ''} 
                    onClick={() => setSortBy('newest')}
                  >
                    Mới nhất
                  </button>
                  <button 
                    className={sortBy === 'hottest' ? styles.activeTab : ''} 
                    onClick={() => setSortBy('hottest')}
                  >
                    Nổi bật
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Active Badge */}
            {selectedTag && (
              <div className={styles.activeFilterBadge}>
                <span>Đang hiển thị các bài đăng về phim: <strong>#{selectedTag}</strong></span>
                <button onClick={() => setSelectedTag(null)} className={styles.clearFilterBtn}>
                  Tất cả bài viết <FiX />
                </button>
              </div>
            )}

            {/* Posts List */}
            <div className={styles.postsList}>
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <div key={post.id} className={styles.postCard}>
                    <div className={styles.postCardHeader}>
                      <img src={post.author.avatar} alt={post.author.name} className={styles.avatar} />
                      <div className={styles.authorInfo}>
                        <span className={styles.name}>{post.author.name}</span>
                        <span className={styles.time}>{post.time}</span>
                      </div>
                      
                      {/* Delete button (simulated for own posts) */}
                      {isAuthenticated && (post.author.name === user?.name || post.id >= 1000000000000) && (
                        <button 
                          className={styles.deletePostBtn} 
                          onClick={() => handleDeletePost(post.id)}
                          title="Xóa bài đăng này"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                    
                    <div className={styles.postCardBody}>
                      {post.movieTag && (
                        <span 
                          className={styles.movieTag}
                          onClick={() => setSelectedTag(post.movieTag)}
                          title={`Xem tất cả bài đăng về phim ${post.movieTag}`}
                        >
                          #{post.movieTag.replace(/\s+/g, '')}
                        </span>
                      )}
                      
                      <p className={styles.content}>{post.content}</p>
                      
                      {post.image && (
                        <div className={styles.postImageWrapper}>
                          <img src={post.image} alt="Nội dung đính kèm" className={styles.postImage} />
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.postStats}>
                      <span className={styles.statLike}>
                        <FiHeart className={post.isLiked ? styles.heartFilled : ''} /> {post.likes} lượt thích
                      </span>
                      <span className={styles.statComment} onClick={() => toggleCommentsPanel(post.id)}>
                        {post.commentsCount} bình luận
                      </span>
                    </div>
                    
                    <div className={styles.postCardFooter}>
                      <button 
                        onClick={() => handleLikeToggle(post.id)} 
                        className={`${styles.actionBtn} ${post.isLiked ? styles.liked : ''}`}
                      >
                        <FiHeart /> {post.isLiked ? 'Đã thích' : 'Thích'}
                      </button>
                      <button 
                        onClick={() => toggleCommentsPanel(post.id)} 
                        className={`${styles.actionBtn} ${expandedComments[post.id] ? styles.activeCommentBtn : ''}`}
                      >
                        <FiMessageSquare /> Bình luận
                      </button>
                      <button 
                        onClick={() => handleShareClick(post)} 
                        className={styles.actionBtn}
                      >
                        <FiShare2 /> Chia sẻ
                      </button>
                    </div>

                    {/* Interactive Comment Section */}
                    {expandedComments[post.id] && (
                      <div className={styles.commentSection}>
                        <div className={styles.commentList}>
                          {post.commentsList && post.commentsList.length > 0 ? (
                            post.commentsList.map(comment => (
                              <div key={comment.id} className={styles.commentItem}>
                                <img src={comment.author.avatar} alt="Avatar" className={styles.commentAvatar} />
                                <div className={styles.commentContentWrapper}>
                                  <div className={styles.commentBubble}>
                                    <span className={styles.commentAuthorName}>{comment.author.name}</span>
                                    <p className={styles.commentText}>{comment.content}</p>
                                  </div>
                                  <span className={styles.commentTime}>{comment.time}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className={styles.noComments}>Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!</div>
                          )}
                        </div>

                        {/* Comment box form */}
                        <div className={styles.commentForm}>
                          <img 
                            src={isAuthenticated && user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`) : 'https://ui-avatars.com/api/?name=Guest&background=e2e8f0&color=64748b'} 
                            alt="Avatar" 
                            className={styles.commentAvatar} 
                          />
                          <div className={styles.commentInputWrapper}>
                            <input 
                              type="text" 
                              placeholder={isAuthenticated ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận"}
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                              disabled={!isAuthenticated}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommentSubmit(post.id);
                              }}
                            />
                            <button 
                              onClick={() => handleCommentSubmit(post.id)}
                              disabled={!isAuthenticated || !(commentInputs[post.id] || '').trim()}
                              className={styles.commentSubmitBtn}
                            >
                              <FiSend />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.noPostsCard}>
                  <p>Không tìm thấy bài viết nào phù hợp.</p>
                  {selectedTag && (
                    <button onClick={() => setSelectedTag(null)} className={styles.clearBtn}>
                      Quay lại xem tất cả bài viết
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Column */}
          <div className={styles.sidebar}>
            {/* Trending topics widget */}
            <div className={styles.widget}>
              <div className={styles.widgetTitle}>
                <FiTrendingUp className={styles.widgetIcon} />
                <h3>Chủ đề Nổi bật</h3>
              </div>
              <ul className={styles.trendingList}>
                {trendingTopics.map((topic, index) => (
                  <li 
                    key={index} 
                    onClick={() => setSelectedTag(topic)}
                    className={selectedTag === topic ? styles.activeTopic : ''}
                  >
                    <span className={styles.rank}>#{index + 1}</span>
                    <span className={styles.topicName}>#{topic.replace(/\s+/g, '')}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top members widget */}
            <div className={styles.widget}>
              <div className={styles.widgetTitle}>
                <FiAward className={styles.widgetIcon} />
                <h3>Thành viên Tích cực</h3>
              </div>
              <div className={styles.topMembers}>
                <div className={styles.member}>
                  <img src="https://ui-avatars.com/api/?name=Thanh+Tung&background=0D8ABC&color=fff" alt="User" />
                  <div className={styles.info}>
                    <span className={styles.name}>Thanh Tùng</span>
                    <span className={styles.badge}>Hạng 1 - Độc giả vàng</span>
                    <span className={styles.points}>1,204 điểm tích lũy</span>
                  </div>
                </div>

                <div className={styles.member}>
                  <img src="https://ui-avatars.com/api/?name=Ngoc+Mai&background=f472b6&color=fff" alt="User" />
                  <div className={styles.info}>
                    <span className={styles.name}>Ngọc Mai</span>
                    <span className={styles.badge}>Hạng 2 - Yêu điện ảnh</span>
                    <span className={styles.points}>985 điểm tích lũy</span>
                  </div>
                </div>

                <div className={styles.member}>
                  <img src="https://ui-avatars.com/api/?name=Hoang+Long&background=10b981&color=fff" alt="User" />
                  <div className={styles.info}>
                    <span className={styles.name}>Hoàng Long</span>
                    <span className={styles.badge}>Hạng 3 - Chuyên gia review</span>
                    <span className={styles.points}>894 điểm tích lũy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cinema Events Card inside Sidebar */}
            <div className={`${styles.widget} ${styles.adWidget}`}>
              <div className={styles.adContent}>
                <FiCalendar className={styles.adIcon} />
                <h4>Xem Lịch Chiếu & Đặt Vé</h4>
                <p>Xem phim mới cực chất tại rạp T-CINE Landmark 81 và Giga Mall ngay hôm nay!</p>
                <Link to="/lich-chieu" className={styles.adBtn}>Xem ngay</Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
