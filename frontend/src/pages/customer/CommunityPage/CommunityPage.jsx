import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdThumbUp, MdChatBubbleOutline, MdShare, MdImage, MdTagFaces, MdLocalMovies } from 'react-icons/md';
import useAuthStore from '../../../store/useAuthStore';
import styles from './CommunityPage.module.scss';

const CommunityPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [postContent, setPostContent] = useState('');

  // Mock data cho bài viết
  const [posts] = useState([
    {
      id: 1,
      author: { name: 'Thanh Tùng', avatar: 'https://ui-avatars.com/api/?name=Thanh+Tung&background=0D8ABC&color=fff' },
      time: '2 giờ trước',
      movieTag: 'Mai',
      content: 'Vừa đi xem Mai về, khóc ướt cả khăn giấy 😭. Nhịp phim rất hay nhưng kết thúc làm mình cứ bị buồn lãng đãng. Ai chung cảm nhận không?',
      image: 'https://cdn.galaxycine.vn/media/2024/2/9/mai-500_1707447477943.jpg',
      likes: 124,
      comments: 32,
      isLiked: false
    },
    {
      id: 2,
      author: { name: 'Ngọc Mai', avatar: 'https://ui-avatars.com/api/?name=Ngoc+Mai&background=f472b6&color=fff' },
      time: '5 giờ trước',
      movieTag: 'Đào, Phở và Piano',
      content: 'Cho mình hỏi rạp T-CINE Giga Mall có suất chiếu nào cuối tuần này không ạ? Thấy bạn bè khen quá trời mà chưa có thời gian đi xem.',
      image: null,
      likes: 45,
      comments: 12,
      isLiked: true
    },
    {
      id: 3,
      author: { name: 'Hoàng Long', avatar: 'https://ui-avatars.com/api/?name=Hoang+Long&background=10b981&color=fff' },
      time: '1 ngày trước',
      movieTag: 'Kung Fu Panda 4',
      content: 'Review nhẹ Kung Fu Panda 4: Phim giải trí tốt, hình ảnh đẹp, tuy nhiên cốt truyện hơi dễ đoán. Chấm 7/10 nhé mọi người. Khá hợp đi xem cùng gia đình.',
      image: null,
      likes: 89,
      comments: 5,
      isLiked: false
    }
  ]);

  const trendingTopics = ['Mai', 'Đào, Phở và Piano', 'Kung Fu Panda 4', 'Dune 2', 'Review Rạp T-CINE Landmark 81'];

  return (
    <div className={styles.communityPage}>
      <div className={styles.container}>
        <div className={styles.layout}>
          
          {/* Main Feed Column */}
          <div className={styles.mainFeed}>
            
            {/* Create Post Box */}
            <div className={styles.createPostBox}>
              {!isAuthenticated && (
                <div className={styles.loginOverlay}>
                  <p>Bạn cần đăng nhập để tham gia thảo luận</p>
                  <Link to="/dang-nhap" className={styles.loginBtn}>Đăng nhập ngay</Link>
                </div>
              )}
              
              <div className={styles.postHeader}>
                <img 
                  src={isAuthenticated ? (user.avatar || `https://ui-avatars.com/api/?name=${user.name}`) : 'https://ui-avatars.com/api/?name=Guest'} 
                  alt="Avatar" 
                  className={styles.avatar} 
                />
                <textarea 
                  placeholder={isAuthenticated ? `${user.name.split(' ')[0]} ơi, bạn đang nghĩ gì về bộ phim vừa xem?` : "Đăng nhập để chia sẻ suy nghĩ..."}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  disabled={!isAuthenticated}
                ></textarea>
              </div>
              <div className={styles.postActions}>
                <div className={styles.actionIcons}>
                  <button disabled={!isAuthenticated}><MdImage /> <span>Ảnh/Video</span></button>
                  <button disabled={!isAuthenticated}><MdLocalMovies /> <span>Gắn thẻ Phim</span></button>
                  <button disabled={!isAuthenticated}><MdTagFaces /> <span>Cảm xúc</span></button>
                </div>
                <button 
                  className={`${styles.submitBtn} ${postContent.trim() ? styles.active : ''}`}
                  disabled={!isAuthenticated || !postContent.trim()}
                >
                  Đăng Bài
                </button>
              </div>
            </div>

            {/* Posts List */}
            <div className={styles.postsList}>
              {posts.map(post => (
                <div key={post.id} className={styles.postCard}>
                  <div className={styles.postCardHeader}>
                    <img src={post.author.avatar} alt={post.author.name} className={styles.avatar} />
                    <div className={styles.authorInfo}>
                      <span className={styles.name}>{post.author.name}</span>
                      <span className={styles.time}>{post.time}</span>
                    </div>
                  </div>
                  
                  <div className={styles.postCardBody}>
                    {post.movieTag && (
                      <span className={styles.movieTag}>#{post.movieTag.replace(/\s+/g, '')}</span>
                    )}
                    <p className={styles.content}>{post.content}</p>
                    {post.image && (
                      <img src={post.image} alt="Post Attachment" className={styles.postImage} />
                    )}
                  </div>
                  
                  <div className={styles.postStats}>
                    <span className={styles.statLike}>👍 {post.likes}</span>
                    <span className={styles.statComment}>{post.comments} bình luận</span>
                  </div>
                  
                  <div className={styles.postCardFooter}>
                    <button className={`${styles.actionBtn} ${post.isLiked ? styles.liked : ''}`}>
                      <MdThumbUp /> Thích
                    </button>
                    <button className={styles.actionBtn}>
                      <MdChatBubbleOutline /> Bình luận
                    </button>
                    <button className={styles.actionBtn}>
                      <MdShare /> Chia sẻ
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Sidebar Column */}
          <div className={styles.sidebar}>
            <div className={styles.widget}>
              <h3>Chủ đề Nổi bật</h3>
              <ul className={styles.trendingList}>
                {trendingTopics.map((topic, index) => (
                  <li key={index}>
                    <span className={styles.rank}>#{index + 1}</span>
                    <span className={styles.topicName}>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.widget}>
              <h3>Thành viên Tích cực</h3>
              <div className={styles.topMembers}>
                <div className={styles.member}>
                  <img src="https://ui-avatars.com/api/?name=Thanh+Tung&background=0D8ABC&color=fff" alt="User" />
                  <div className={styles.info}>
                    <span className={styles.name}>Thanh Tùng</span>
                    <span className={styles.points}>1,204 điểm</span>
                  </div>
                </div>
                <div className={styles.member}>
                  <img src="https://ui-avatars.com/api/?name=Ngoc+Mai&background=f472b6&color=fff" alt="User" />
                  <div className={styles.info}>
                    <span className={styles.name}>Ngọc Mai</span>
                    <span className={styles.points}>985 điểm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
