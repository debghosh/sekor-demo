// home.js - Authenticated Homepage JavaScript

let currentUser = null;
const followedAuthors = new Set();

document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  loadFollowedAuthors();
  updateHeader();
  loadStories();
  setupEventListeners();
  setupTabNavigation();
});

function checkAuth() {
  const userStr = sessionStorage.getItem('kcc_user');
  if (!userStr) {
    // Not logged in, redirect to landing page
    window.location.href = 'index.html';
    return;
  }
  currentUser = JSON.parse(userStr);
}

function updateHeader() {
  const headerAuthSection = document.getElementById('headerAuthSection');
  if (currentUser && headerAuthSection) {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    headerAuthSection.innerHTML = `
      <div class="user-info-display">
        <div class="user-avatar-small">${initials}</div>
        <span style="font-weight: 600; font-size: 0.95em;">${currentUser.name}</span>
        <a href="#" onclick="logoutUser(); return false;" class="btn-logout-header">Logout</a>
      </div>
    `;
  }
}

function logoutUser() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('kcc_user');
    sessionStorage.removeItem('kcc_role');
    window.location.href = 'index.html';
  }
}

function setupTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const tabName = this.dataset.tab;
      showTab(tabName);
      
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const targetContent = document.getElementById(tabName + '-content');
  if (targetContent) {
    targetContent.classList.add('active');
    
    if (tabName === 'for-you') {
      loadForYouContent();
    } else if (tabName === 'following') {
      loadFollowingContent();
    }
  }
}

function loadStories() {
  const storyGrid = document.getElementById('storyGrid');
  if (!storyGrid) return;

  const publishedArticles = DATA_STORE.getArticlesByStatus('published');
  
  storyGrid.innerHTML = '';
  
  publishedArticles.forEach(article => {
    const storyCard = createStoryCard(article);
    storyGrid.appendChild(storyCard);
  });
}

function createStoryCard(article) {
  const card = document.createElement('article');
  card.className = 'story-card';
  card.dataset.articleId = article.id;
  
  const isFollowing = followedAuthors.has(article.authorId);
  
  card.innerHTML = `
    <img src="${article.image}" alt="${article.title}" class="story-image">
    <div class="story-meta">
      <img src="${getUserAvatar(article.authorId)}" alt="${article.author}" class="author-avatar">
      <span class="author-name">${article.author}</span>
      <span>•</span>
      <span>${formatDate(article.publishDate)}</span>
      <button class="btn-follow ${isFollowing ? 'following' : ''}" data-author-id="${article.authorId}">
        ${isFollowing ? 'Following' : '+ Follow'}
      </button>
    </div>
    <span class="category-tag">${article.category}</span>
    <h2 class="story-title">${article.title}</h2>
    <p class="story-summary">${article.summary}</p>
    <div class="story-actions">
      <span class="story-action">⏱️ ${getReadingTime(article.content)} min read</span>
      <span class="story-action">💬 ${article.engagement}</span>
      <span class="story-action save-btn">📖 Save</span>
    </div>
  `;
  
  return card;
}

function loadForYouContent() {
  const container = document.getElementById('forYouArticles');
  if (!container) return;
  
  container.innerHTML = '';
  
  const publishedArticles = DATA_STORE.getArticlesByStatus('published');
  
  publishedArticles.slice(0, 5).forEach((article, index) => {
    const isFollowing = followedAuthors.has(article.authorId);
    
    const storyDiv = document.createElement('div');
    storyDiv.className = 'recommended-story';
    storyDiv.dataset.articleId = article.id;
    
    const followBtnId = `foryou-follow-${index}`;
    const saveBtnId = `foryou-save-${index}`;
    
    storyDiv.innerHTML = `
      <div class="story-meta" style="margin-bottom: 12px;">
        <img src="${getUserAvatar(article.authorId)}" alt="${article.author}" class="author-avatar">
        <span class="author-name">${article.author}</span>
        <span>•</span>
        <button id="${followBtnId}" class="btn-follow ${isFollowing ? 'following' : ''}" data-author-id="${article.authorId}">
          ${isFollowing ? 'Following' : '+ Follow'}
        </button>
      </div>
      <div style="font-size: 0.85em; color: var(--text-medium); font-style: italic; margin-bottom: 12px;">
        💭 Recommended for you
      </div>
      <h3 style="font-family: 'Playfair Display', serif; font-size: 1.8em; font-weight: 700; line-height: 1.3; margin-bottom: 12px; color: var(--text-dark);">
        ${article.title}
      </h3>
      <p style="font-size: 1em; line-height: 1.6; color: var(--text-medium); margin-bottom: 16px;">
        ${article.summary}
      </p>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 0.85em; color: var(--text-light);">
          ⏱️ ${getReadingTime(article.content)} min read • 💬 ${article.engagement}
        </div>
        <div style="display: flex; gap: 16px;">
          <span id="${saveBtnId}" class="story-action save-btn">📖 Save</span>
        </div>
      </div>
    `;
    
    container.appendChild(storyDiv);
    
    // Story click
    storyDiv.addEventListener('click', function(e) {
      if (e.target.id !== followBtnId && e.target.id !== saveBtnId) {
        window.location.href = `article.html?id=${article.id}`;
      }
    });
    
    // Follow button
    const followBtn = document.getElementById(followBtnId);
    if (followBtn) {
      followBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const authorId = parseInt(this.dataset.authorId);
        
        if (this.classList.contains('following')) {
          this.textContent = '+ Follow';
          this.classList.remove('following');
          followedAuthors.delete(authorId);
        } else {
          this.textContent = 'Following';
          this.classList.add('following');
          followedAuthors.add(authorId);
        }
        
        saveFollowedAuthors();
        
        // Update all buttons
        document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(btn => {
          if (btn.classList.contains('btn-follow')) {
            if (followedAuthors.has(authorId)) {
              btn.textContent = 'Following';
              btn.classList.add('following');
            } else {
              btn.textContent = '+ Follow';
              btn.classList.remove('following');
            }
          }
        });
        
        if (document.getElementById('following-content').classList.contains('active')) {
          loadFollowingContent();
        }
      });
    }
    
    // Save button
    const saveBtn = document.getElementById(saveBtnId);
    if (saveBtn) {
      saveBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSave(this);
      });
    }
  });
}

function loadFollowingContent() {
  const emptyState = document.getElementById('followingEmptyState');
  const articlesList = document.getElementById('followingArticlesList');
  
  if (followedAuthors.size === 0) {
    emptyState.style.display = 'block';
    articlesList.style.display = 'none';
    return;
  }
  
  emptyState.style.display = 'none';
  articlesList.style.display = 'block';
  
  const allUsers = DATA_STORE.getUsers();
  const followedAuthorsList = allUsers.filter(user => followedAuthors.has(user.id));
  
  articlesList.innerHTML = `
    <div class="followed-list">
      ${followedAuthorsList.map(author => {
        const authorArticles = DATA_STORE.getArticlesByAuthor(author.id);
        const publishedCount = authorArticles.filter(a => a.status === 'published').length;
        
        return `
          <div class="followed-author">
            <img src="${author.avatar}" alt="${author.name}" class="author-avatar-large">
            <h4>${author.name}</h4>
            <p class="author-bio">${author.bio}</p>
            <div class="author-stats">
              <div class="author-stat">
                <span class="stat-number-small">${publishedCount}</span>
                <span class="stat-label-small">Stories</span>
              </div>
              <div class="author-stat">
                <span class="stat-number-small">${author.followers}</span>
                <span class="stat-label-small">Followers</span>
              </div>
            </div>
            <div class="author-topics">
              ${getAuthorTopics(author.id).map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
            </div>
            <button class="btn-unfollow" data-author-id="${author.id}">Unfollow</button>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  articlesList.querySelectorAll('.btn-unfollow').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const authorId = parseInt(this.dataset.authorId);
      if (confirm('Unfollow this author?')) {
        followedAuthors.delete(authorId);
        saveFollowedAuthors();
        
        document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(button => {
          if (button.classList.contains('btn-follow')) {
            button.textContent = '+ Follow';
            button.classList.remove('following');
          }
        });
        
        loadFollowingContent();
      }
    });
  });
}

function getAuthorTopics(authorId) {
  const articles = DATA_STORE.getArticlesByAuthor(authorId);
  const categories = [...new Set(articles.map(a => a.category))];
  return categories.slice(0, 3);
}

function loadFollowedAuthors() {
  const savedFollows = localStorage.getItem('kcc_followed_authors');
  if (savedFollows) {
    const follows = JSON.parse(savedFollows);
    follows.forEach(id => followedAuthors.add(id));
  }
}

function saveFollowedAuthors() {
  localStorage.setItem('kcc_followed_authors', JSON.stringify([...followedAuthors]));
}

function getUserAvatar(authorId) {
  const user = DATA_STORE.getUserById(authorId);
  return user ? user.avatar : 'https://i.pravatar.cc/150?img=1';
}

function formatDate(dateString) {
  if (!dateString) return 'Draft';
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

function getReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute) || 6;
}

function setupEventListeners() {
  // Story card clicks
  document.addEventListener('click', function(e) {
    const storyCard = e.target.closest('.story-card');
    if (storyCard && !e.target.closest('.btn-follow') && !e.target.closest('.save-btn')) {
      const articleId = storyCard.dataset.articleId;
      window.location.href = `article.html?id=${articleId}`;
    }
  });

  // Follow buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-follow')) {
      e.stopPropagation();
      toggleFollow(e.target);
    }
  });

  // Save buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('save-btn')) {
      e.stopPropagation();
      toggleSave(e.target);
    }
  });

  // Listen button
  const listenBtn = document.querySelector('.btn-listen');
  if (listenBtn) {
    listenBtn.addEventListener('click', function() {
      alert('Audio feature coming soon!');
    });
  }
}

function toggleFollow(btn) {
  const authorId = parseInt(btn.dataset.authorId);
  
  if (btn.classList.contains('following')) {
    btn.textContent = '+ Follow';
    btn.classList.remove('following');
    followedAuthors.delete(authorId);
  } else {
    btn.textContent = 'Following';
    btn.classList.add('following');
    followedAuthors.add(authorId);
  }
  
  saveFollowedAuthors();
  
  // Update all follow buttons
  document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(button => {
    if (button.classList.contains('btn-follow')) {
      if (followedAuthors.has(authorId)) {
        button.textContent = 'Following';
        button.classList.add('following');
      } else {
        button.textContent = '+ Follow';
        button.classList.remove('following');
      }
    }
  });
  
  if (document.getElementById('following-content').classList.contains('active')) {
    loadFollowingContent();
  }
}

function toggleSave(btn) {
  if (btn.textContent.includes('Save')) {
    btn.textContent = '✓ Saved';
    btn.style.color = 'var(--primary)';
  } else {
    btn.textContent = '📖 Save';
    btn.style.color = '';
  }
}// Main JavaScript for Homepage

// Check if user is logged in
let currentUser = null;
let isAuthenticated = false;
const followedAuthors = new Set();

// Load articles on page load
document.addEventListener('DOMContentLoaded', function() {
  loadFollowedAuthors();
  checkUserSession();
  loadStories();
  setupEventListeners();
  setupTabNavigation();
  updateUIForAuthState();
});

function checkUserSession() {
  const userStr = sessionStorage.getItem('kcc_user');
  if (userStr) {
    currentUser = JSON.parse(userStr);
    isAuthenticated = true;
    updateHeaderForLoggedInUser();
  } else {
    isAuthenticated = false;
  }
}

function updateUIForAuthState() {
  const forYouTab = document.getElementById('forYouTab');
  const followingTab = document.getElementById('followingTab');
  const loginPrompt = document.getElementById('loginPrompt');
  
  if (isAuthenticated) {
    // Enable tabs
    forYouTab.style.opacity = '1';
    forYouTab.style.cursor = 'pointer';
    forYouTab.title = '';
    followingTab.style.opacity = '1';
    followingTab.style.cursor = 'pointer';
    followingTab.title = '';
    if (loginPrompt) loginPrompt.style.display = 'none';
  } else {
    // Disable tabs
    forYouTab.style.opacity = '0.5';
    forYouTab.style.cursor = 'not-allowed';
    forYouTab.title = 'Login to access personalized recommendations';
    followingTab.style.opacity = '0.5';
    followingTab.style.cursor = 'not-allowed';
    followingTab.title = 'Login to follow authors';
    if (loginPrompt) loginPrompt.style.display = 'block';
  }
}

function updateHeaderForLoggedInUser() {
  const headerAuthSection = document.getElementById('headerAuthSection');
  if (currentUser && headerAuthSection) {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    headerAuthSection.innerHTML = `
      <div class="user-info-display">
        <div class="user-avatar-small">${initials}</div>
        <span style="font-weight: 600; font-size: 0.95em;">${currentUser.name}</span>
        <a href="#" onclick="logoutUser(); return false;" class="btn-logout-header">Logout</a>
      </div>
    `;
  }
}

function logoutUser() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('kcc_user');
    sessionStorage.removeItem('kcc_role');
    localStorage.removeItem('kcc_followed_authors');
    window.location.reload();
  }
}

function setupTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Check if user needs to be authenticated for this tab
      const tabName = this.dataset.tab;
      if ((tabName === 'for-you' || tabName === 'following') && !isAuthenticated) {
        alert('Please login to access this feature');
        window.location.href = 'login.html';
        return;
      }
      
      showTab(tabName);
      
      // Update active state
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function showTab(tabName) {
  // Check authentication for protected tabs
  if ((tabName === 'for-you' || tabName === 'following') && !isAuthenticated) {
    alert('Please login to access this feature');
    window.location.href = 'login.html';
    return;
  }
  
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Show selected tab
  const targetContent = document.getElementById(tabName + '-content');
  if (targetContent) {
    targetContent.classList.add('active');
    
    // Load content for specific tabs
    if (tabName === 'for-you') {
      loadForYouContent();
    } else if (tabName === 'following') {
      loadFollowingContent();
    }
  }
  
  // Update active tab
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    }
  });
}

function loadStories() {
  const storyGrid = document.getElementById('storyGrid');
  if (!storyGrid) return;

  const publishedArticles = DATA_STORE.getArticlesByStatus('published');
  
  storyGrid.innerHTML = '';
  
  publishedArticles.forEach(article => {
    const storyCard = createStoryCard(article);
    storyGrid.appendChild(storyCard);
  });
}

function createStoryCard(article) {
  const card = document.createElement('article');
  card.className = 'story-card';
  card.dataset.articleId = article.id;
  
  const isFollowing = followedAuthors.has(article.authorId);
  const followButton = isAuthenticated 
    ? `<button class="btn-follow ${isFollowing ? 'following' : ''}" data-author-id="${article.authorId}">
        ${isFollowing ? 'Following' : '+ Follow'}
      </button>`
    : `<button class="btn-follow" onclick="alert('Please login to follow authors'); window.location.href='login.html'; return false;">
        + Follow
      </button>`;
  
  card.innerHTML = `
    <img src="${article.image}" alt="${article.title}" class="story-image">
    <div class="story-meta">
      <img src="${getUserAvatar(article.authorId)}" alt="${article.author}" class="author-avatar">
      <span class="author-name">${article.author}</span>
      <span>•</span>
      <span>${formatDate(article.publishDate)}</span>
      ${followButton}
    </div>
    <span class="category-tag">${article.category}</span>
    <h2 class="story-title">${article.title}</h2>
    <p class="story-summary">${article.summary}</p>
    <div class="story-actions">
      <span class="story-action">⏱️ ${getReadingTime(article.content)} min read</span>
      <span class="story-action">💬 ${article.engagement}</span>
      <span class="story-action save-btn">📖 Save</span>
    </div>
  `;
  
  return card;
}

function loadForYouContent() {
  if (!isAuthenticated) {
    alert('Please login to access personalized recommendations');
    window.location.href = 'login.html';
    return;
  }
  
  const container = document.getElementById('forYouArticles');
  if (!container) return;
  
  container.innerHTML = ''; // Clear first
  
  const publishedArticles = DATA_STORE.getArticlesByStatus('published');
  
  publishedArticles.slice(0, 5).forEach((article, index) => {
    const isFollowing = followedAuthors.has(article.authorId);
    
    const storyDiv = document.createElement('div');
    storyDiv.className = 'recommended-story';
    storyDiv.dataset.articleId = article.id;
    storyDiv.dataset.index = index;
    
    const followBtnId = `foryou-follow-${index}`;
    const saveBtnId = `foryou-save-${index}`;
    
    storyDiv.innerHTML = `
      <div class="story-meta" style="margin-bottom: 12px;">
        <img src="${getUserAvatar(article.authorId)}" alt="${article.author}" class="author-avatar">
        <span class="author-name">${article.author}</span>
        <span>•</span>
        <button id="${followBtnId}" class="btn-follow ${isFollowing ? 'following' : ''}" data-author-id="${article.authorId}">
          ${isFollowing ? 'Following' : '+ Follow'}
        </button>
      </div>
      <div style="font-size: 0.85em; color: var(--text-medium); font-style: italic; margin-bottom: 12px;">
        💭 Recommended for you
      </div>
      <h3 style="font-family: 'Playfair Display', serif; font-size: 1.8em; font-weight: 700; line-height: 1.3; margin-bottom: 12px; color: var(--text-dark);">
        ${article.title}
      </h3>
      <p style="font-size: 1em; line-height: 1.6; color: var(--text-medium); margin-bottom: 16px;">
        ${article.summary}
      </p>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 0.85em; color: var(--text-light);">
          ⏱️ ${getReadingTime(article.content)} min read • 💬 ${article.engagement}
        </div>
        <div style="display: flex; gap: 16px;">
          <span id="${saveBtnId}" class="story-action save-btn">📖 Save</span>
        </div>
      </div>
    `;
    
    container.appendChild(storyDiv);
    
    // Add click handler to the story div
    storyDiv.addEventListener('click', function(e) {
      // Don't navigate if clicking on buttons
      if (e.target.id === followBtnId || e.target.id === saveBtnId) {
        return;
      }
      window.location.href = `article.html?id=${article.id}`;
    });
    
    // Add direct event listener to follow button
    const followBtn = document.getElementById(followBtnId);
    if (followBtn) {
      followBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        const authorId = parseInt(this.dataset.authorId);
        
        if (this.classList.contains('following')) {
          this.textContent = '+ Follow';
          this.classList.remove('following');
          followedAuthors.delete(authorId);
        } else {
          this.textContent = 'Following';
          this.classList.add('following');
          followedAuthors.add(authorId);
        }
        
        saveFollowedAuthors();
        
        // Update all other follow buttons
        document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(btn => {
          if (btn.classList.contains('btn-follow')) {
            if (followedAuthors.has(authorId)) {
              btn.textContent = 'Following';
              btn.classList.add('following');
            } else {
              btn.textContent = '+ Follow';
              btn.classList.remove('following');
            }
          }
        });
        
        if (document.getElementById('following-content').classList.contains('active')) {
          loadFollowingContent();
        }
      });
    }
    
    // Add direct event listener to save button
    const saveBtn = document.getElementById(saveBtnId);
    if (saveBtn) {
      saveBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (this.textContent.includes('Save')) {
          this.textContent = '✓ Saved';
          this.style.color = 'var(--primary)';
        } else {
          this.textContent = '📖 Save';
          this.style.color = '';
        }
      });
    }
  });
}

function loadFollowingContent() {
  const emptyState = document.getElementById('followingEmptyState');
  const articlesList = document.getElementById('followingArticlesList');
  
  if (followedAuthors.size === 0) {
    emptyState.style.display = 'block';
    articlesList.style.display = 'none';
    return;
  }
  
  emptyState.style.display = 'none';
  articlesList.style.display = 'block';
  
  const allUsers = DATA_STORE.getUsers();
  const followedAuthorsList = allUsers.filter(user => followedAuthors.has(user.id));
  
  articlesList.innerHTML = `
    <div class="followed-list">
      ${followedAuthorsList.map(author => {
        const authorArticles = DATA_STORE.getArticlesByAuthor(author.id);
        const publishedCount = authorArticles.filter(a => a.status === 'published').length;
        
        return `
          <div class="followed-author">
            <img src="${author.avatar}" alt="${author.name}" class="author-avatar-large">
            <h4>${author.name}</h4>
            <p class="author-bio">${author.bio}</p>
            <div class="author-stats">
              <div class="author-stat">
                <span class="stat-number-small">${publishedCount}</span>
                <span class="stat-label-small">Stories</span>
              </div>
              <div class="author-stat">
                <span class="stat-number-small">${author.followers}</span>
                <span class="stat-label-small">Followers</span>
              </div>
            </div>
            <div class="author-topics">
              ${getAuthorTopics(author.id).map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
            </div>
            <button class="btn-unfollow" data-author-id="${author.id}">Unfollow</button>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  articlesList.querySelectorAll('.btn-unfollow').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const authorId = parseInt(this.dataset.authorId);
      if (confirm('Unfollow this author?')) {
        followedAuthors.delete(authorId);
        saveFollowedAuthors();
        
        document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(button => {
          if (button.classList.contains('btn-follow')) {
            button.textContent = '+ Follow';
            button.classList.remove('following');
          }
        });
        
        loadFollowingContent();
      }
    });
  });
}

function getAuthorTopics(authorId) {
  const articles = DATA_STORE.getArticlesByAuthor(authorId);
  const categories = [...new Set(articles.map(a => a.category))];
  return categories.slice(0, 3);
}

function loadFollowedAuthors() {
  const savedFollows = localStorage.getItem('kcc_followed_authors');
  if (savedFollows) {
    const follows = JSON.parse(savedFollows);
    follows.forEach(id => followedAuthors.add(id));
  }
}

function saveFollowedAuthors() {
  localStorage.setItem('kcc_followed_authors', JSON.stringify([...followedAuthors]));
}

function getUserAvatar(authorId) {
  const user = DATA_STORE.getUserById(authorId);
  return user ? user.avatar : 'https://i.pravatar.cc/150?img=1';
}

function formatDate(dateString) {
  if (!dateString) return 'Draft';
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

function getReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute) || 6;
}

function setupEventListeners() {
  // Story card clicks
  document.addEventListener('click', function(e) {
    const storyCard = e.target.closest('.story-card');
    if (storyCard && !e.target.closest('.btn-follow') && !e.target.closest('.save-btn')) {
      const articleId = storyCard.dataset.articleId;
      window.location.href = `article.html?id=${articleId}`;
    }
  });

  // Follow buttons - only work when authenticated
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-follow') && isAuthenticated) {
      e.stopPropagation();
      toggleFollow(e.target);
    }
  });

  // Save buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('save-btn')) {
      e.stopPropagation();
      if (!isAuthenticated) {
        alert('Please login to save articles');
        window.location.href = 'login.html';
        return;
      }
      toggleSave(e.target);
    }
  });

  // Listen button
  const listenBtn = document.querySelector('.btn-listen');
  if (listenBtn) {
    listenBtn.addEventListener('click', function() {
      alert('Audio feature coming soon!');
    });
  }
}

function toggleFollow(btn) {
  if (!isAuthenticated) {
    alert('Please login to follow authors');
    window.location.href = 'login.html';
    return;
  }
  
  const authorId = parseInt(btn.dataset.authorId);
  
  if (btn.classList.contains('following')) {
    btn.textContent = '+ Follow';
    btn.classList.remove('following');
    followedAuthors.delete(authorId);
  } else {
    btn.textContent = 'Following';
    btn.classList.add('following');
    followedAuthors.add(authorId);
  }
  
  saveFollowedAuthors();
  
  // Update all follow buttons for this author
  document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(button => {
    if (button.classList.contains('btn-follow')) {
      if (followedAuthors.has(authorId)) {
        button.textContent = 'Following';
        button.classList.add('following');
      } else {
        button.textContent = '+ Follow';
        button.classList.remove('following');
      }
    }
  });
  
  // Reload following tab if active
  if (document.getElementById('following-content').classList.contains('active')) {
    loadFollowingContent();
  }
}

function toggleSave(btn) {
  if (btn.textContent.includes('Save')) {
    btn.textContent = '✓ Saved';
    btn.style.color = 'var(--primary)';
  } else {
    btn.textContent = '📖 Save';
    btn.style.color = '';
  }
}

function checkUserSession() {
  const userStr = sessionStorage.getItem('kcc_user');
  if (userStr) {
    currentUser = JSON.parse(userStr);
    updateHeaderForLoggedInUser();
  }
}

function updateHeaderForLoggedInUser() {
  const headerAuthSection = document.getElementById('headerAuthSection');
  if (currentUser && headerAuthSection) {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    headerAuthSection.innerHTML = `
      <div class="user-info-display">
        <div class="user-avatar-small">${initials}</div>
        <span style="font-weight: 600; font-size: 0.95em;">${currentUser.name}</span>
        <a href="#" onclick="logoutUser(); return false;" class="btn-logout-header">Logout</a>
      </div>
    `;
  }
}

function logoutUser() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('kcc_user');
    sessionStorage.removeItem('kcc_role');
    localStorage.removeItem('kcc_followed_authors');
    window.location.reload();
  }
}

function setupTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const tabName = this.dataset.tab;
      showTab(tabName);
      
      // Update active state
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function showTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Show selected tab
  const targetContent = document.getElementById(tabName + '-content');
  if (targetContent) {
    targetContent.classList.add('active');
    
    // Load content for specific tabs
    if (tabName === 'for-you') {
      loadForYouContent();
    } else if (tabName === 'following') {
      loadFollowingContent();
    }
  }
  
  // Update active tab
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    }
  });
}

function loadStories() {
  const storyGrid = document.getElementById('storyGrid');
  if (!storyGrid) return;

  const publishedArticles = DATA_STORE.getArticlesByStatus('published');
  
  storyGrid.innerHTML = '';
  
  publishedArticles.forEach(article => {
    const storyCard = createStoryCard(article);
    storyGrid.appendChild(storyCard);
  });
}

function createStoryCard(article) {
  const card = document.createElement('article');
  card.className = 'story-card';
  card.dataset.articleId = article.id;
  
  const isFollowing = followedAuthors.has(article.authorId);
  
  card.innerHTML = `
    <img src="${article.image}" alt="${article.title}" class="story-image">
    <div class="story-meta">
      <img src="${getUserAvatar(article.authorId)}" alt="${article.author}" class="author-avatar">
      <span class="author-name">${article.author}</span>
      <span>•</span>
      <span>${formatDate(article.publishDate)}</span>
      <button class="btn-follow ${isFollowing ? 'following' : ''}" data-author-id="${article.authorId}">
        ${isFollowing ? 'Following' : '+ Follow'}
      </button>
    </div>
    <span class="category-tag">${article.category}</span>
    <h2 class="story-title">${article.title}</h2>
    <p class="story-summary">${article.summary}</p>
    <div class="story-actions">
      <span class="story-action">⏱️ ${getReadingTime(article.content)} min read</span>
      <span class="story-action">💬 ${article.engagement}</span>
      <span class="story-action save-btn">📖 Save</span>
    </div>
  `;
  
  return card;
}

function loadForYouContent() {
  const container = document.getElementById('forYouArticles');
  if (!container) return;
  
  // Remove any existing event listeners
  const oldContainer = container.cloneNode(false);
  container.parentNode.replaceChild(oldContainer, container);
  
  // Get all published articles and show as recommendations
  const publishedArticles = DATA_STORE.getArticlesByStatus('published');
  
  oldContainer.innerHTML = publishedArticles.slice(0, 5).map(article => {
    const isFollowing = followedAuthors.has(article.authorId);
    return `
      <div class="recommended-story" data-article-id="${article.id}">
        <div class="story-meta" style="margin-bottom: 12px;">
          <img src="${getUserAvatar(article.authorId)}" alt="${article.author}" class="author-avatar">
          <span class="author-name">${article.author}</span>
          <span>•</span>
          <button class="btn-follow btn-follow-foryou ${isFollowing ? 'following' : ''}" data-author-id="${article.authorId}">
            ${isFollowing ? 'Following' : '+ Follow'}
          </button>
        </div>
        <div style="font-size: 0.85em; color: var(--text-medium); font-style: italic; margin-bottom: 12px;">
          💭 Recommended for you
        </div>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.8em; font-weight: 700; line-height: 1.3; margin-bottom: 12px; color: var(--text-dark);">
          ${article.title}
        </h3>
        <p style="font-size: 1em; line-height: 1.6; color: var(--text-medium); margin-bottom: 16px;">
          ${article.summary}
        </p>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 0.85em; color: var(--text-light);">
            ⏱️ ${getReadingTime(article.content)} min read • 💬 ${article.engagement}
          </div>
          <div style="display: flex; gap: 16px;">
            <span class="story-action save-btn">📖 Save</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Add click handlers using setTimeout to ensure DOM is ready
  setTimeout(() => {
    // Handle follow buttons
    oldContainer.querySelectorAll('.btn-follow-foryou').forEach(btn => {
      btn.onclick = function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const authorId = parseInt(this.getAttribute('data-author-id'));
        console.log('Follow clicked for author:', authorId);
        
        if (this.classList.contains('following')) {
          this.textContent = '+ Follow';
          this.classList.remove('following');
          followedAuthors.delete(authorId);
        } else {
          this.textContent = 'Following';
          this.classList.add('following');
          followedAuthors.add(authorId);
        }
        
        saveFollowedAuthors();
        
        // Update all other follow buttons
        document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(button => {
          if (button.classList.contains('btn-follow')) {
            if (followedAuthors.has(authorId)) {
              button.textContent = 'Following';
              button.classList.add('following');
            } else {
              button.textContent = '+ Follow';
              button.classList.remove('following');
            }
          }
        });
        
        return false;
      };
    });
    
    // Handle story clicks
    oldContainer.querySelectorAll('.recommended-story').forEach(story => {
      story.onclick = function(e) {
        if (e.target.classList.contains('btn-follow-foryou') || 
            e.target.classList.contains('save-btn') ||
            e.target.closest('.btn-follow-foryou')) {
          return;
        }
        const articleId = this.getAttribute('data-article-id');
        window.location.href = `article.html?id=${articleId}`;
      };
    });
    
    // Handle save buttons
    oldContainer.querySelectorAll('.save-btn').forEach(btn => {
      btn.onclick = function(e) {
        e.stopPropagation();
        if (this.textContent.includes('Save')) {
          this.textContent = '✓ Saved';
          this.style.color = 'var(--primary)';
        } else {
          this.textContent = '📖 Save';
          this.style.color = '';
        }
        return false;
      };
    });
  }, 100);
}

function loadFollowingContent() {
  const emptyState = document.getElementById('followingEmptyState');
  const articlesList = document.getElementById('followingArticlesList');
  
  if (followedAuthors.size === 0) {
    emptyState.style.display = 'block';
    articlesList.style.display = 'none';
    return;
  }
  
  emptyState.style.display = 'none';
  articlesList.style.display = 'block';
  
  // Get followed authors and display them as cards
  const allUsers = DATA_STORE.getUsers();
  const followedAuthorsList = allUsers.filter(user => followedAuthors.has(user.id));
  
  articlesList.innerHTML = `
    <div class="followed-list">
      ${followedAuthorsList.map(author => {
        const authorArticles = DATA_STORE.getArticlesByAuthor(author.id);
        const publishedCount = authorArticles.filter(a => a.status === 'published').length;
        
        return `
          <div class="followed-author">
            <img src="${author.avatar}" alt="${author.name}" class="author-avatar-large">
            <h4>${author.name}</h4>
            <p class="author-bio">${author.bio}</p>
            <div class="author-stats">
              <div class="author-stat">
                <span class="stat-number-small">${publishedCount}</span>
                <span class="stat-label-small">Stories</span>
              </div>
              <div class="author-stat">
                <span class="stat-number-small">${author.followers}</span>
                <span class="stat-label-small">Followers</span>
              </div>
            </div>
            <div class="author-topics">
              ${getAuthorTopics(author.id).map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
            </div>
            <button class="btn-unfollow" data-author-id="${author.id}">Unfollow</button>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // Setup unfollow buttons
  articlesList.querySelectorAll('.btn-unfollow').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const authorId = parseInt(this.dataset.authorId);
      if (confirm('Unfollow this author?')) {
        followedAuthors.delete(authorId);
        saveFollowedAuthors();
        
        // Update all follow buttons
        document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(button => {
          if (button.classList.contains('btn-follow')) {
            button.textContent = '+ Follow';
            button.classList.remove('following');
          }
        });
        
        loadFollowingContent();
      }
    });
  });
}

function getAuthorTopics(authorId) {
  const articles = DATA_STORE.getArticlesByAuthor(authorId);
  const categories = [...new Set(articles.map(a => a.category))];
  return categories.slice(0, 3); // Return top 3 categories
}

function loadFollowedAuthors() {
  const savedFollows = localStorage.getItem('kcc_followed_authors');
  if (savedFollows) {
    const follows = JSON.parse(savedFollows);
    follows.forEach(id => followedAuthors.add(id));
  }
}

function saveFollowedAuthors() {
  localStorage.setItem('kcc_followed_authors', JSON.stringify([...followedAuthors]));
}

function getUserAvatar(authorId) {
  const user = DATA_STORE.getUserById(authorId);
  return user ? user.avatar : 'https://i.pravatar.cc/150?img=1';
}

function formatDate(dateString) {
  if (!dateString) return 'Draft';
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

function getReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute) || 6;
}

function setupEventListeners() {
  // Story card clicks
  document.addEventListener('click', function(e) {
    const storyCard = e.target.closest('.story-card');
    if (storyCard && !e.target.closest('.btn-follow') && !e.target.closest('.save-btn')) {
      const articleId = storyCard.dataset.articleId;
      window.location.href = `article.html?id=${articleId}`;
    }
  });

  // Follow buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-follow')) {
      e.stopPropagation();
      toggleFollow(e.target);
    }
  });

  // Save buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('save-btn')) {
      e.stopPropagation();
      toggleSave(e.target);
    }
  });

  // Listen button
  const listenBtn = document.querySelector('.btn-listen');
  if (listenBtn) {
    listenBtn.addEventListener('click', function() {
      alert('Audio feature coming soon!');
    });
  }
}

function toggleFollow(btn) {
  const authorId = parseInt(btn.dataset.authorId);
  
  if (btn.classList.contains('following')) {
    btn.textContent = '+ Follow';
    btn.classList.remove('following');
    followedAuthors.delete(authorId);
  } else {
    btn.textContent = 'Following';
    btn.classList.add('following');
    followedAuthors.add(authorId);
  }
  
  saveFollowedAuthors();
  
  // Update all follow buttons for this author across the page
  document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(button => {
    if (button.classList.contains('btn-follow')) {
      if (followedAuthors.has(authorId)) {
        button.textContent = 'Following';
        button.classList.add('following');
      } else {
        button.textContent = '+ Follow';
        button.classList.remove('following');
      }
    }
  });
  
  // If we're on the following tab, reload it
  if (document.getElementById('following-content').classList.contains('active')) {
    loadFollowingContent();
  }
}

function toggleSave(btn) {
  if (btn.textContent.includes('Save')) {
    btn.textContent = '✓ Saved';
    btn.style.color = 'var(--primary)';
  } else {
    btn.textContent = '📖 Save';
    btn.style.color = '';
  }
}

function checkUserSession() {
  const userStr = sessionStorage.getItem('kcc_user');
  if (userStr) {
    currentUser = JSON.parse(userStr);
    updateHeaderForLoggedInUser();
  }
}

function updateHeaderForLoggedInUser() {
  const headerAuthSection = document.getElementById('headerAuthSection');
  if (currentUser && headerAuthSection) {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    headerAuthSection.innerHTML = `
      <div class="user-info-display">
        <div class="user-avatar-small">${initials}</div>
        <span style="font-weight: 600; font-size: 0.95em;">${currentUser.name}</span>
        <a href="#" onclick="logoutUser(); return false;" class="btn-logout-header">Logout</a>
      </div>
    `;
  }
}

function logoutUser() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('kcc_user');
    sessionStorage.removeItem('kcc_role');
    localStorage.removeItem('kcc_followed_authors');
    window.location.reload();
  }
}

function setupTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const tabName = this.dataset.tab;
      showTab(tabName);
      
      // Update active state
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function showTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Show selected tab
  const targetContent = document.getElementById(tabName + '-content');
  if (targetContent) {
    targetContent.classList.add('active');
    
    // Load content for specific tabs
    if (tabName === 'for-you') {
      loadForYouContent();
    } else if (tabName === 'following') {
      loadFollowingContent();
    }
  }
  
  // Update active tab
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    }
  });
}

function loadStories() {
  const storyGrid = document.getElementById('storyGrid');
  if (!storyGrid) return;

  const publishedArticles = DATA_STORE.getArticlesByStatus('published');
  
  storyGrid.innerHTML = '';
  
  publishedArticles.forEach(article => {
    const storyCard = createStoryCard(article);
    storyGrid.appendChild(storyCard);
  });
}

function createStoryCard(article) {
  const card = document.createElement('article');
  card.className = 'story-card';
  card.dataset.articleId = article.id;
  
  const isFollowing = followedAuthors.has(article.authorId);
  
  card.innerHTML = `
    <img src="${article.image}" alt="${article.title}" class="story-image">
    <div class="story-meta">
      <img src="${getUserAvatar(article.authorId)}" alt="${article.author}" class="author-avatar">
      <span class="author-name">${article.author}</span>
      <span>•</span>
      <span>${formatDate(article.publishDate)}</span>
      <button class="btn-follow ${isFollowing ? 'following' : ''}" data-author-id="${article.authorId}">
        ${isFollowing ? 'Following' : '+ Follow'}
      </button>
    </div>
    <span class="category-tag">${article.category}</span>
    <h2 class="story-title">${article.title}</h2>
    <p class="story-summary">${article.summary}</p>
    <div class="story-actions">
      <span class="story-action">⏱️ ${getReadingTime(article.content)} min read</span>
      <span class="story-action">💬 ${article.engagement}</span>
      <span class="story-action save-btn">📖 Save</span>
    </div>
  `;
  
  return card;
}

function loadForYouContent() {
  const container = document.getElementById('forYouArticles');
  if (!container) return;
  
  // Get all published articles and show as recommendations
  const publishedArticles = DATA_STORE.getArticlesByStatus('published');
  
  container.innerHTML = publishedArticles.slice(0, 5).map(article => {
    const isFollowing = followedAuthors.has(article.authorId);
    return `
      <div class="recommended-story" data-article-id="${article.id}">
        <div class="story-meta" style="margin-bottom: 12px;">
          <img src="${getUserAvatar(article.authorId)}" alt="${article.author}" class="author-avatar">
          <span class="author-name">${article.author}</span>
          <span>•</span>
          <button class="btn-follow ${isFollowing ? 'following' : ''}" data-author-id="${article.authorId}" onclick="event.stopPropagation();">
            ${isFollowing ? 'Following' : '+ Follow'}
          </button>
        </div>
        <div style="font-size: 0.85em; color: var(--text-medium); font-style: italic; margin-bottom: 12px;">
          💭 Recommended for you
        </div>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.8em; font-weight: 700; line-height: 1.3; margin-bottom: 12px; color: var(--text-dark);">
          ${article.title}
        </h3>
        <p style="font-size: 1em; line-height: 1.6; color: var(--text-medium); margin-bottom: 16px;">
          ${article.summary}
        </p>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 0.85em; color: var(--text-light);">
            ⏱️ ${getReadingTime(article.content)} min read • 💬 ${article.engagement}
          </div>
          <div style="display: flex; gap: 16px;">
            <span class="story-action save-btn" onclick="event.stopPropagation();">📖 Save</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Add click handlers for recommended stories
  container.querySelectorAll('.recommended-story').forEach(story => {
    story.addEventListener('click', function() {
      const articleId = this.dataset.articleId;
      window.location.href = `article.html?id=${articleId}`;
    });
  });
}

function loadFollowingContent() {
  const emptyState = document.getElementById('followingEmptyState');
  const articlesList = document.getElementById('followingArticlesList');
  
  if (followedAuthors.size === 0) {
    emptyState.style.display = 'block';
    articlesList.style.display = 'none';
    return;
  }
  
  emptyState.style.display = 'none';
  articlesList.style.display = 'block';
  
  // Get followed authors and display them as cards
  const allUsers = DATA_STORE.getUsers();
  const followedAuthorsList = allUsers.filter(user => followedAuthors.has(user.id));
  
  articlesList.innerHTML = `
    <div class="followed-list">
      ${followedAuthorsList.map(author => {
        const authorArticles = DATA_STORE.getArticlesByAuthor(author.id);
        const publishedCount = authorArticles.filter(a => a.status === 'published').length;
        
        return `
          <div class="followed-author">
            <img src="${author.avatar}" alt="${author.name}" class="author-avatar-large">
            <h4>${author.name}</h4>
            <p class="author-bio">${author.bio}</p>
            <div class="author-stats">
              <div class="author-stat">
                <span class="stat-number-small">${publishedCount}</span>
                <span class="stat-label-small">Stories</span>
              </div>
              <div class="author-stat">
                <span class="stat-number-small">${author.followers}</span>
                <span class="stat-label-small">Followers</span>
              </div>
            </div>
            <div class="author-topics">
              ${getAuthorTopics(author.id).map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
            </div>
            <button class="btn-unfollow" data-author-id="${author.id}">Unfollow</button>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // Setup unfollow buttons
  articlesList.querySelectorAll('.btn-unfollow').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const authorId = parseInt(this.dataset.authorId);
      if (confirm('Unfollow this author?')) {
        followedAuthors.delete(authorId);
        saveFollowedAuthors();
        
        // Update all follow buttons
        document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(button => {
          if (button.classList.contains('btn-follow')) {
            button.textContent = '+ Follow';
            button.classList.remove('following');
          }
        });
        
        loadFollowingContent();
      }
    });
  });
}

function getAuthorTopics(authorId) {
  const articles = DATA_STORE.getArticlesByAuthor(authorId);
  const categories = [...new Set(articles.map(a => a.category))];
  return categories.slice(0, 3); // Return top 3 categories
}

function loadFollowedAuthors() {
  const savedFollows = localStorage.getItem('kcc_followed_authors');
  if (savedFollows) {
    const follows = JSON.parse(savedFollows);
    follows.forEach(id => followedAuthors.add(id));
  }
}

function saveFollowedAuthors() {
  localStorage.setItem('kcc_followed_authors', JSON.stringify([...followedAuthors]));
}

function getUserAvatar(authorId) {
  const user = DATA_STORE.getUserById(authorId);
  return user ? user.avatar : 'https://i.pravatar.cc/150?img=1';
}

function formatDate(dateString) {
  if (!dateString) return 'Draft';
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

function getReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute) || 6;
}

function setupEventListeners() {
  // Story card clicks
  document.addEventListener('click', function(e) {
    const storyCard = e.target.closest('.story-card');
    if (storyCard && !e.target.closest('.btn-follow') && !e.target.closest('.save-btn')) {
      const articleId = storyCard.dataset.articleId;
      window.location.href = `article.html?id=${articleId}`;
    }
  });

  // Follow buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-follow')) {
      e.stopPropagation();
      toggleFollow(e.target);
    }
  });

  // Save buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('save-btn')) {
      e.stopPropagation();
      toggleSave(e.target);
    }
  });

  // Listen button
  const listenBtn = document.querySelector('.btn-listen');
  if (listenBtn) {
    listenBtn.addEventListener('click', function() {
      alert('Audio feature coming soon!');
    });
  }
}

function toggleFollow(btn) {
  const authorId = parseInt(btn.dataset.authorId);
  
  if (btn.classList.contains('following')) {
    btn.textContent = '+ Follow';
    btn.classList.remove('following');
    followedAuthors.delete(authorId);
  } else {
    btn.textContent = 'Following';
    btn.classList.add('following');
    followedAuthors.add(authorId);
  }
  
  saveFollowedAuthors();
  
  // Update all follow buttons for this author across the page
  document.querySelectorAll(`[data-author-id="${authorId}"]`).forEach(button => {
    if (followedAuthors.has(authorId)) {
      button.textContent = 'Following';
      button.classList.add('following');
    } else {
      button.textContent = '+ Follow';
      button.classList.remove('following');
    }
  });
  
  // If we're on the following tab, reload it
  if (document.getElementById('following-content').classList.contains('active')) {
    loadFollowingContent();
  }
}

function toggleSave(btn) {
  if (btn.textContent.includes('Save')) {
    btn.textContent = '✓ Saved';
    btn.style.color = 'var(--primary)';
  } else {
    btn.textContent = '📖 Save';
    btn.style.color = '';
  }
}