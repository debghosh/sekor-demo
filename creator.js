// Creator Portal JavaScript

let currentUser = null;
let editingArticleId = null;

document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  loadUserInfo();
  loadDashboard();
  setupNavigation();
  setupArticleForm();
});

function checkAuth() {
  const user = sessionStorage.getItem('kcc_user');
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = JSON.parse(user);
}

function loadUserInfo() {
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  const userAvatarEl = document.getElementById('userAvatar');
  
  if (currentUser) {
    userNameEl.textContent = currentUser.name;
    userRoleEl.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    userAvatarEl.textContent = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}

function loadDashboard() {
  loadStats();
  loadRecentArticles();
}

function loadStats() {
  const statsGrid = document.getElementById('statsGrid');
  const myArticles = DATA_STORE.getArticlesByAuthor(currentUser.id);
  
  const stats = {
    total: myArticles.length,
    published: myArticles.filter(a => a.status === 'published').length,
    views: myArticles.reduce((sum, a) => sum + a.views, 0),
    engagement: myArticles.length > 0 
      ? Math.round(myArticles.reduce((sum, a) => sum + a.engagement, 0) / myArticles.length)
      : 0
  };
  
  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Articles</div>
      <div class="stat-value">${stats.total}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Published</div>
      <div class="stat-value" style="color: var(--success)">${stats.published}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Views</div>
      <div class="stat-value" style="color: #3498db">${stats.views.toLocaleString()}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg Engagement</div>
      <div class="stat-value" style="color: #9b59b6">${stats.engagement}</div>
    </div>
  `;
}

function loadRecentArticles() {
  const container = document.getElementById('recentArticles');
  const myArticles = DATA_STORE.getArticlesByAuthor(currentUser.id).slice(0, 3);
  
  if (myArticles.length === 0) {
    container.innerHTML = '<p style="color: var(--text-medium); text-align: center; padding: 40px;">No articles yet. Create your first article!</p>';
    return;
  }
  
  container.innerHTML = myArticles.map(article => `
    <div class="article-list-item">
      <img src="${article.image}" alt="" class="article-thumbnail">
      <div class="article-content">
        <div class="article-badges">
          <span class="badge badge-${article.status}">${article.status}</span>
          <span class="category-tag">${article.category}</span>
        </div>
        <h3 class="article-list-title">${article.title}</h3>
        <div class="article-meta-info">
          <span>👁️ ${article.views} views</span>
          <span>💬 ${article.engagement} comments</span>
          ${article.publishDate ? `<span>📅 ${article.publishDate}</span>` : ''}
        </div>
      </div>
      <div class="article-actions">
        <button class="btn-icon" onclick="editArticle(${article.id})" title="Edit">
          ✏️
        </button>
        <button class="btn-icon" onclick="viewArticle(${article.id})" title="View">
          👁️
        </button>
      </div>
    </div>
  `).join('');
}

function loadArticlesList() {
  const container = document.getElementById('articlesList');
  const myArticles = DATA_STORE.getArticlesByAuthor(currentUser.id);
  
  if (myArticles.length === 0) {
    container.innerHTML = '<p style="color: var(--text-medium); text-align: center; padding: 40px;">No articles yet. Create your first article!</p>';
    return;
  }
  
  container.innerHTML = myArticles.map(article => `
    <div class="article-list-item">
      <img src="${article.image}" alt="" class="article-thumbnail">
      <div class="article-content">
        <div class="article-badges">
          <span class="badge badge-${article.status}">${article.status.toUpperCase()}</span>
          <span class="category-tag">${article.category}</span>
        </div>
        <h3 class="article-list-title">${article.title}</h3>
        <p class="article-list-summary">${article.summary}</p>
        <div class="article-meta-info">
          <span>👁️ ${article.views} views</span>
          <span>💬 ${article.engagement} comments</span>
          ${article.publishDate ? `<span>📅 ${article.publishDate}</span>` : '<span>📝 Draft</span>'}
        </div>
      </div>
      <div class="article-actions">
        <button class="btn-icon" onclick="editArticle(${article.id})" title="Edit">
          ✏️
        </button>
        <button class="btn-icon" onclick="viewArticle(${article.id})" title="View">
          👁️
        </button>
        <button class="btn-icon btn-danger" onclick="deleteArticle(${article.id})" title="Delete">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

function setupNavigation() {
  const links = document.querySelectorAll('.portal-sidebar-link');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const view = this.dataset.view;
      showView(view);
      
      // Update active state
      links.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function showView(viewName) {
  // Hide all views
  document.querySelectorAll('.portal-view').forEach(view => {
    view.style.display = 'none';
  });
  
  // Show selected view
  const targetView = document.getElementById(viewName + 'View');
  if (targetView) {
    targetView.style.display = 'block';
    
    // Load data for specific views
    if (viewName === 'articles') {
      loadArticlesList();
    } else if (viewName === 'dashboard') {
      loadDashboard();
    }
  }
  
  // Update sidebar active state
  document.querySelectorAll('.portal-sidebar-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.view === viewName) {
      link.classList.add('active');
    }
  });
}

function setupArticleForm() {
  const form = document.getElementById('articleForm');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    submitArticle('review');
  });
}

function submitArticle(status) {
  const form = document.getElementById('articleForm');
  const formData = new FormData(form);
  
  const articleData = {
    title: formData.get('title'),
    category: formData.get('category'),
    image: formData.get('image'),
    summary: formData.get('summary'),
    content: formData.get('content'),
    author: currentUser.name,
    authorId: currentUser.id,
    status: status
  };
  
  if (editingArticleId) {
    DATA_STORE.updateArticle(editingArticleId, articleData);
    alert('Article updated successfully!');
    editingArticleId = null;
  } else {
    DATA_STORE.addArticle(articleData);
    alert(status === 'draft' ? 'Article saved as draft!' : 'Article submitted for review!');
  }
  
  form.reset();
  showView('articles');
}

function saveAsDraft() {
  submitArticle('draft');
}

function editArticle(articleId) {
  const article = DATA_STORE.getArticleById(articleId);
  if (!article) return;
  
  editingArticleId = articleId;
  
  // Fill form with article data
  document.getElementById('articleTitle').value = article.title;
  document.getElementById('articleCategory').value = article.category;
  document.getElementById('articleImage').value = article.image;
  document.getElementById('articleSummary').value = article.summary;
  document.getElementById('articleContent').value = article.content;
  
  // Update form title
  document.querySelector('#newView .card-title').textContent = 'Edit Article';
  
  showView('new');
}

function viewArticle(articleId) {
  window.open(`article.html?id=${articleId}`, '_blank');
}

function deleteArticle(articleId) {
  if (confirm('Are you sure you want to delete this article?')) {
    DATA_STORE.deleteArticle(articleId);
    loadArticlesList();
    loadDashboard();
  }
}

function logout() {
  sessionStorage.removeItem('kcc_user');
  sessionStorage.removeItem('kcc_role');
  window.location.href = 'login.html';
}