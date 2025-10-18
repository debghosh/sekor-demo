// Authentication State
let currentUser = null;
let followedAuthors = new Set();
let savedStories = new Map(); // Changed to Map to store story ID -> { article, tags }
let currentStoryToSave = null;
let currentStoryTags = [];

// Sample Authors Data
const authors = {
  'author1': {
    id: 'author1',
    name: 'Arijit Mukherjee',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Heritage photographer documenting vanishing traditions of Kolkata. 15 years capturing the soul of the city.',
    topics: ['Heritage', 'Photography', 'Culture'],
    followers: 2847,
    stories: 156
  },
  'author2': {
    id: 'author2',
    name: 'Priya Sen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    bio: 'Cultural anthropologist exploring Bengali traditions, আড্ডা culture, and the art of conversation.',
    topics: ['আড্ডা', 'Culture', 'Tradition'],
    followers: 3214,
    stories: 203
  },
  'author3': {
    id: 'author3',
    name: 'Rahul Bose',
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Metro commuter turned storyteller. Collecting tales from Kolkata\'s underground transit system.',
    topics: ['Metro', 'People', 'Urban Life'],
    followers: 1652,
    stories: 89
  },
  'author4': {
    id: 'author4',
    name: 'Somnath Das',
    avatar: 'https://i.pravatar.cc/150?img=4',
    bio: 'Literary historian preserving Bengal\'s forgotten libraries and rare manuscripts.',
    topics: ['Heritage', 'Books', 'History'],
    followers: 1923,
    stories: 124
  }
};

// Sample Articles with better images
const sampleArticles = [
  {
    id: 1,
    title: 'The Last of the Hand-Pulled Rickshaws',
    summary: 'A photo essay documenting the vanishing tradition of Kolkata\'s hand-pulled rickshaws and the men who still pull them.',
    author: 'Arijit Mukherjee',
    authorId: 'author1',
    image: 'rickshaw.png',
    category: 'Heritage',
    publishDate: '2024-10-15',
    content: 'Lorem ipsum dolor sit amet...',
    engagement: '234'
  },
  {
    id: 2,
    title: 'আড্ডা: The Art of Kolkata Conversations',
    summary: 'Why the Bengali tradition of intellectual discourse over tea continues to thrive in coffee shops and street corners.',
    author: 'Priya Sen',
    authorId: 'author2',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    category: 'আড্ডা',
    publishDate: '2024-10-14',
    content: 'Lorem ipsum dolor sit amet...',
    engagement: '189'
  },
  {
    id: 3,
    title: 'Metro Diaries: Stories from the Underground',
    summary: 'The fascinating lives and tales of daily commuters on Kolkata\'s expanding metro network.',
    author: 'Rahul Bose',
    authorId: 'author3',
    image: 'https://images.unsplash.com/photo-1531889947280-b31a4e144b4e?w=800',
    category: 'Metro',
    publishDate: '2024-10-13',
    content: 'Lorem ipsum dolor sit amet...',
    engagement: '156'
  },
  {
    id: 4,
    title: 'মাছ-ভাত: The Soul Food Renaissance',
    summary: 'How young chefs are reinventing traditional Bengali fish and rice dishes for a new generation.',
    author: 'Arijit Mukherjee',
    authorId: 'author1',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800',
    category: 'মাছ-ভাত',
    publishDate: '2024-10-12',
    content: 'Lorem ipsum dolor sit amet...',
    engagement: '298'
  }
];

// Check authentication
function checkAuthentication() {
  const authStatus = localStorage.getItem('isAuthenticated');
  const userData = localStorage.getItem('currentUser');
  
  if (authStatus === 'true' && userData) {
    currentUser = JSON.parse(userData);
    const followedData = localStorage.getItem('followedAuthors');
    if (followedData) {
      followedAuthors = new Set(JSON.parse(followedData));
    }
    const savedData = localStorage.getItem('savedStories');
    if (savedData) {
      const savedArray = JSON.parse(savedData);
      savedStories = new Map(savedArray);
    }
    showAuthenticatedView();
  } else {
    showPublicView();
  }
}

// Show public landing
function showPublicView() {
  document.getElementById('publicLanding').style.display = 'block';
  document.getElementById('authenticatedHome').style.display = 'none';
  document.getElementById('headerAuthSection').innerHTML = `
    <a href="login.html" class="btn-subscribe">Login / Subscribe</a>
  `;
  loadPublicStories();
}

// Show authenticated home
function showAuthenticatedView() {
  document.getElementById('publicLanding').style.display = 'none';
  document.getElementById('authenticatedHome').style.display = 'block';
  document.getElementById('headerAuthSection').innerHTML = `
    <button onclick="logout()" class="btn-secondary">Logout</button>
  `;
  loadHomeStories();
  setupTabs();
}

// Logout
function logout() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
  window.location.reload();
}

// Load public stories
function loadPublicStories() {
  const grid = document.getElementById('publicStoriesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  sampleArticles.forEach(article => {
    grid.appendChild(createPublicStoryCard(article));
  });
}

// Load home stories (with Follow and Save buttons)
function loadHomeStories() {
  const grid = document.getElementById('homeStoriesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  sampleArticles.forEach(article => {
    grid.appendChild(createStoryCard(article, true, true)); // Show both Follow and Save
  });
}

// Load For You stories (with Follow and Save buttons)
function loadForYouStories() {
  const grid = document.getElementById('forYouStoriesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  sampleArticles.forEach(article => {
    grid.appendChild(createStoryCard(article, true, true)); // Show both Follow and Save
  });
}

// Load Following (Author Cards)
function loadFollowingAuthors() {
  const grid = document.getElementById('followingAuthorsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  if (followedAuthors.size === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h3 style="font-size: 1.8rem; margin-bottom: 12px; color: #1a1a1a;">You're not following anyone yet</h3>
        <p style="font-size: 1.1rem; color: #666;">Follow authors from the "For You" tab to see them here.</p>
      </div>
    `;
    return;
  }
  
  followedAuthors.forEach(authorId => {
    const author = authors[authorId];
    if (author) {
      grid.appendChild(createAuthorCard(author));
    }
  });
}

// Load Saved stories with filtering
let currentFilter = 'all';

function loadSavedStories() {
  const grid = document.getElementById('savedStoriesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  if (savedStories.size === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h3 style="font-size: 1.8rem; margin-bottom: 12px; color: #1a1a1a;">No saved stories yet</h3>
        <p style="font-size: 1.1rem; color: #666;">Save stories to read them later.</p>
      </div>
    `;
    updateTagFilters();
    return;
  }
  
  // Filter stories based on current filter
  let filteredStories = [...savedStories.values()];
  if (currentFilter !== 'all') {
    filteredStories = filteredStories.filter(saved => 
      saved.tags.includes(currentFilter)
    );
  }
  
  if (filteredStories.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h3 style="font-size: 1.8rem; margin-bottom: 12px; color: #1a1a1a;">No stories with "${currentFilter}" tag</h3>
        <p style="font-size: 1.1rem; color: #666;">Try selecting a different tag.</p>
      </div>
    `;
  } else {
    filteredStories.forEach(saved => {
      const card = createSavedStoryCard(saved.article, saved.tags);
      grid.appendChild(card);
    });
  }
  
  updateTagFilters();
}

function createSavedStoryCard(article, tags) {
  const card = document.createElement('article');
  card.className = 'story-card';
  
  card.innerHTML = `
    <img src="${article.image}" alt="${article.title}" class="story-image">
    <div class="story-meta">
      <img src="${authors[article.authorId].avatar}" alt="${article.author}" class="author-avatar">
      <span class="author-name">${article.author}</span>
      <span>•</span>
      <span>${formatDate(article.publishDate)}</span>
    </div>
    <span class="category-tag">${article.category}</span>
    <h2 class="story-title">${article.title}</h2>
    <p class="story-summary">${article.summary}</p>
    ${tags.length > 0 ? `
      <div class="story-tags">
        ${tags.map(tag => `<span class="story-tag">${tag}</span>`).join('')}
      </div>
    ` : ''}
    <div class="story-actions">
      <span class="story-action">⏱️ 6 min read</span>
      <button class="audio-badge" onclick="playArticleAudio('${article.title}', '${article.summary}')">🎧 Listen</button>
      <span class="story-action">💬 ${article.engagement}</span>
      <button class="story-action bookmark-btn saved" data-story-id="${article.id}" onclick="handleUnsave(${article.id})">
        ✓ Saved
      </button>
    </div>
  `;
  
  return card;
}

function handleUnsave(storyId) {
  savedStories.delete(storyId);
  localStorage.setItem('savedStories', JSON.stringify([...savedStories]));
  
  // Update all save buttons for this story
  document.querySelectorAll(`[data-story-id="${storyId}"]`).forEach(btn => {
    btn.textContent = '📖 Save';
    btn.classList.remove('saved');
  });
  
  loadSavedStories();
}

function updateTagFilters() {
  const tagFiltersContainer = document.getElementById('tagFilters');
  const allCountSpan = document.getElementById('allCount');
  
  // Update all count
  allCountSpan.textContent = savedStories.size;
  
  // Collect all unique tags
  const tagCounts = {};
  savedStories.forEach(saved => {
    saved.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  // Render tag filters
  tagFiltersContainer.innerHTML = Object.entries(tagCounts)
    .map(([tag, count]) => `
      <button class="filter-btn ${currentFilter === tag ? 'active' : ''}" 
        data-filter="${tag}" 
        onclick="setFilter('${tag}')">
        ${tag} (${count})
      </button>
    `).join('');
}

function setFilter(filter) {
  currentFilter = filter;
  
  // Update active state
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
  
  loadSavedStories();
}

// Create public story card
function createPublicStoryCard(article) {
  const card = document.createElement('article');
  card.className = 'story-card';
  card.style.cursor = 'pointer';
  
  card.innerHTML = `
    <img src="${article.image}" alt="${article.title}" class="story-image">
    <div class="story-meta">
      <img src="${authors[article.authorId].avatar}" alt="${article.author}" class="author-avatar">
      <span class="author-name">${article.author}</span>
      <span>•</span>
      <span>${formatDate(article.publishDate)}</span>
    </div>
    <span class="category-tag">${article.category}</span>
    <h2 class="story-title">${article.title}</h2>
    <p class="story-summary">${article.summary}</p>
    <div class="story-actions">
      <span class="story-action">⏱️ 6 min read</span>
      <span class="story-action">💬 ${article.engagement}</span>
      <span class="story-action" style="color: var(--primary); font-weight: 600;">🔒 Login to Read</span>
    </div>
  `;
  
  card.addEventListener('click', () => window.location.href = 'login.html');
  return card;
}

// Create authenticated story card
function createStoryCard(article, showFollowButton = false, showSaveButton = true) {
  const card = document.createElement('article');
  card.className = 'story-card';
  const isFollowing = followedAuthors.has(article.authorId);
  const isSaved = savedStories.has(article.id);
  
  card.innerHTML = `
    <img src="${article.image}" alt="${article.title}" class="story-image">
    <div class="story-meta">
      <img src="${authors[article.authorId].avatar}" alt="${article.author}" class="author-avatar">
      <span class="author-name">${article.author}</span>
      <span>•</span>
      <span>${formatDate(article.publishDate)}</span>
      ${showFollowButton ? `
        <button class="btn-follow ${isFollowing ? 'following' : ''}" 
          data-author-id="${article.authorId}">
          ${isFollowing ? 'Following' : '+ Follow'}
        </button>
      ` : ''}
    </div>
    <span class="category-tag">${article.category}</span>
    <h2 class="story-title">${article.title}</h2>
    <p class="story-summary">${article.summary}</p>
    <div class="story-actions">
      <span class="story-action">⏱️ 6 min read</span>
      <button class="audio-badge" onclick="playArticleAudio('${article.title}', '${article.summary}')">🎧 Listen</button>
      <span class="story-action">💬 ${article.engagement}</span>
      ${showSaveButton ? `
        <button class="story-action bookmark-btn ${isSaved ? 'saved' : ''}" 
          data-story-id="${article.id}">
          ${isSaved ? '✓ Saved' : '📖 Save'}
        </button>
      ` : ''}
    </div>
  `;
  
  // Follow button handler
  if (showFollowButton) {
    const followBtn = card.querySelector('.btn-follow');
    if (followBtn) {
      followBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFollow(article.authorId, followBtn);
      });
    }
  }
  
  // Save button handler
  if (showSaveButton) {
    const saveBtn = card.querySelector('.bookmark-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSaveClick(article, saveBtn);
      });
    }
  }
  
  return card;
}

// Handle save button click
function handleSaveClick(article, button) {
  if (savedStories.has(article.id)) {
    // Unsave
    savedStories.delete(article.id);
    button.textContent = '📖 Save';
    button.classList.remove('saved');
    localStorage.setItem('savedStories', JSON.stringify([...savedStories]));
    
    // Refresh Saved tab if active
    const savedTab = document.querySelector('.nav-tab[data-tab="saved"]');
    if (savedTab && savedTab.classList.contains('active')) {
      loadSavedStories();
    }
  } else {
    // Open modal to add tags
    currentStoryToSave = article;
    currentStoryTags = [];
    openSaveModal(article);
  }
}

// Create author card
function createAuthorCard(author) {
  const card = document.createElement('div');
  card.className = 'author-card';
  
  card.innerHTML = `
    <img src="${author.avatar}" alt="${author.name}" class="author-card-avatar">
    <h3 class="author-card-name">${author.name}</h3>
    <p class="author-card-bio">${author.bio}</p>
    <div class="author-card-stats">
      <div><strong>${author.stories}</strong> Stories</div>
      <div><strong>${author.followers.toLocaleString()}</strong> Followers</div>
    </div>
    <div class="author-card-topics">
      ${author.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
    </div>
    <button class="btn-unfollow" data-author-id="${author.id}">Unfollow</button>
  `;
  
  const unfollowBtn = card.querySelector('.btn-unfollow');
  unfollowBtn.addEventListener('click', () => {
    toggleFollow(author.id);
    loadFollowingAuthors();
  });
  
  return card;
}

// Toggle follow
function toggleFollow(authorId, button = null) {
  if (followedAuthors.has(authorId)) {
    followedAuthors.delete(authorId);
    if (button) {
      button.textContent = '+ Follow';
      button.classList.remove('following');
    }
  } else {
    followedAuthors.add(authorId);
    if (button) {
      button.textContent = 'Following';
      button.classList.add('following');
    }
  }
  localStorage.setItem('followedAuthors', JSON.stringify([...followedAuthors]));
}

// Toggle save (removed - replaced by handleSaveClick)

// Save Modal Functions
function openSaveModal(article) {
  document.getElementById('modalStoryTitle').textContent = article.title;
  document.getElementById('tagsDisplay').innerHTML = '';
  document.getElementById('tagInput').value = '';
  document.getElementById('saveModal').style.display = 'flex';
}

function closeSaveModal() {
  document.getElementById('saveModal').style.display = 'none';
  currentStoryToSave = null;
  currentStoryTags = [];
}

function handleTagInput(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const input = document.getElementById('tagInput');
    const tag = input.value.trim();
    if (tag && !currentStoryTags.includes(tag)) {
      currentStoryTags.push(tag);
      renderTags();
      input.value = '';
    }
  }
}

function addSuggestedTag(tag) {
  if (!currentStoryTags.includes(tag)) {
    currentStoryTags.push(tag);
    renderTags();
  }
}

function removeTag(tag) {
  currentStoryTags = currentStoryTags.filter(t => t !== tag);
  renderTags();
}

function renderTags() {
  const display = document.getElementById('tagsDisplay');
  display.innerHTML = currentStoryTags.map(tag => `
    <span class="tag-pill">
      ${tag}
      <button class="tag-remove" onclick="removeTag('${tag}')">&times;</button>
    </span>
  `).join('');
}

function confirmSaveStory() {
  if (currentStoryToSave) {
    savedStories.set(currentStoryToSave.id, {
      article: currentStoryToSave,
      tags: [...currentStoryTags]
    });
    
    localStorage.setItem('savedStories', JSON.stringify([...savedStories]));
    
    // Update all save buttons for this story
    document.querySelectorAll(`[data-story-id="${currentStoryToSave.id}"]`).forEach(btn => {
      btn.textContent = '✓ Saved';
      btn.classList.add('saved');
    });
    
    closeSaveModal();
    
    // Refresh Saved tab if active
    const savedTab = document.querySelector('.nav-tab[data-tab="saved"]');
    if (savedTab && savedTab.classList.contains('active')) {
      loadSavedStories();
    }
  }
}

// Setup tabs
function setupTabs() {
  const tabs = document.querySelectorAll('.nav-tab[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = tab.dataset.tab;
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      const content = document.getElementById(`${tabName}-content`);
      if (content) {
        content.classList.add('active');
        if (tabName === 'for-you') loadForYouStories();
        else if (tabName === 'following') loadFollowingAuthors();
        else if (tabName === 'saved') loadSavedStories();
      }
    });
  });
}

// Audio functions with Indian voice
function playBriefAudio() {
  const text = document.getElementById('brief-tts').textContent;
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set Indian English voice
  const voices = window.speechSynthesis.getVoices();
  const indianVoice = voices.find(voice => 
    voice.lang === 'en-IN' || 
    voice.name.includes('Indian') || 
    voice.name.includes('Rishi')
  );
  if (indianVoice) {
    utterance.voice = indianVoice;
  }
  utterance.lang = 'en-IN';
  utterance.rate = 0.9;
  
  window.speechSynthesis.speak(utterance);
}

function playArticleAudio(title, summary) {
  const text = `${title}. ${summary}`;
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set Indian English voice
  const voices = window.speechSynthesis.getVoices();
  const indianVoice = voices.find(voice => 
    voice.lang === 'en-IN' || 
    voice.name.includes('Indian') || 
    voice.name.includes('Rishi')
  );
  if (indianVoice) {
    utterance.voice = indianVoice;
  }
  utterance.lang = 'en-IN';
  utterance.rate = 0.9;
  
  window.speechSynthesis.speak(utterance);
}

// Utility
function formatDate(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Load voices for speech synthesis
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      window.speechSynthesis.getVoices();
    });
  }
  
  // Close modal when clicking outside
  const modal = document.getElementById('saveModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeSaveModal();
      }
    });
  }
  
  checkAuthentication();
});