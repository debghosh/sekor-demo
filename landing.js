// Landing Page JavaScript - For non-authenticated users

document.addEventListener('DOMContentLoaded', function() {
  checkAndRedirect();
  loadFeaturedSection();
  loadPreviewGrid();
});

function checkAndRedirect() {
  const user = sessionStorage.getItem('kcc_user');
  if (user) {
    window.location.href = 'home.html';
  }
}

function loadFeaturedSection() {
  const featuredSection = document.getElementById('featuredSection');
  if (!featuredSection) return;

  const publishedArticles = DATA_STORE.getArticlesByStatus('published');
  
  // Main featured story
  const mainStory = publishedArticles[0];
  const sideStories = publishedArticles.slice(1, 4);
  
  featuredSection.innerHTML = `
    <div class="featured-main" onclick="window.location.href='login.html'">
      <img src="${mainStory.image}" alt="${mainStory.title}">
      <div class="featured-overlay">
        <span class="category-tag" style="background: rgba(255,255,255,0.2); color: white;">
          ${mainStory.category}
        </span>
        <h2>${mainStory.title}</h2>
        <p style="font-size: 1.1em; opacity: 0.9;">${mainStory.summary}</p>
        <div style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
          By ${mainStory.author} • ${formatDate(mainStory.publishDate)}
        </div>
      </div>
    </div>
    <div class="featured-side">
      ${sideStories.map(story => `
        <div class="side-story" onclick="window.location.href='login.html'">
          <span class="category-tag">${story.category}</span>
          <h3>${story.title}</h3>
          <p>${story.summary}</p>
          <div style="font-size: 0.85em; color: var(--text-light); margin-top: 10px;">
            ${story.author} • ${formatDate(story.publishDate)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function loadPreviewGrid() {
  const previewGrid = document.getElementById('previewGrid');
  if (!previewGrid) return;

  const publishedArticles = DATA_STORE.getArticlesByStatus('published');
  
  previewGrid.innerHTML = publishedArticles.slice(4, 10).map(article => `
    <div class="preview-card" onclick="window.location.href='login.html'">
      <img src="${article.image}" alt="${article.title}">
      <span class="category-tag">${article.category}</span>
      <h3>${article.title}</h3>
      <p style="color: var(--text-medium); line-height: 1.6; margin: 12px 0;">
        ${article.summary.substring(0, 120)}...
      </p>
      <div style="font-size: 0.9em; color: var(--text-light);">
        ${article.author} • ${formatDate(article.publishDate)}
      </div>
      <span class="lock-icon">🔒 Subscribe to Read</span>
    </div>
  `).join('');
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}