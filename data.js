// Data Store for Kolkata Chronicle
const DATA_STORE = {
  articles: [
    {
      id: 1,
      title: "Deshapriya Park's Revolutionary Eco-Friendly Pandal",
      author: "Anindita Chatterjee",
      authorId: 1,
      status: "published",
      category: "দুর্গাপূজা",
      views: 2847,
      engagement: 34,
      publishDate: "2025-10-16",
      image: "https://images.unsplash.com/photo-1558862107-d49ef2a04d72?w=800",
      summary: "South Kolkata's iconic puja committee breaks tradition with 100% sustainable materials—bamboo, terracotta, and natural dyes.",
      content: "Full article content here..."
    },
    {
      id: 2,
      title: "50,000 Commuters Stranded as Metro Breaks Down",
      author: "Rajesh Kumar",
      authorId: 2,
      status: "published",
      category: "মেট্রো ম্যাটার্স",
      views: 5621,
      engagement: 89,
      publishDate: "2025-10-16",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
      summary: "Technical glitch halts North-South line for 3 hours during rush hour. Office-goers forced to walk through monsoon rain.",
      content: "Full article content here..."
    },
    {
      id: 3,
      title: "7 Century-Old Sweet Shops Kolkata Has Forgotten",
      author: "Priya Banerjee",
      authorId: 3,
      status: "published",
      category: "মাছ-ভাত",
      views: 3245,
      engagement: 56,
      publishDate: "2025-10-15",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      summary: "From Shyambazar to Bowbazar, family-run mishti doi and rosogolla shops serving for 100+ years.",
      content: "Full article content here..."
    },
    {
      id: 4,
      title: "Coaching Center Mafia: The Rs 2,000 Crore Industry",
      author: "Debashish Ghosh",
      authorId: 4,
      status: "published",
      category: "শিক্ষা",
      views: 4892,
      engagement: 127,
      publishDate: "2025-10-15",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
      summary: "Six-month investigation reveals illegal practices across Salt Lake and College Street.",
      content: "Full article content here..."
    },
    {
      id: 5,
      title: "The Last Tram Drivers: Oral Histories Before They Retire",
      author: "Soumya Sengupta",
      authorId: 5,
      status: "draft",
      category: "Heritage",
      views: 0,
      engagement: 0,
      publishDate: null,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      summary: "Kolkata's iconic yellow trams are dying. But before they disappear, we sat with the men who've driven them for 40+ years.",
      content: "Draft content here..."
    },
    {
      id: 6,
      title: "Biryani Economics: Why Kolkata Style Costs Less But Tastes Better",
      author: "Rituparna Das",
      authorId: 6,
      status: "review",
      category: "মাছ-ভাত",
      views: 0,
      engagement: 0,
      publishDate: null,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
      summary: "We analyzed 47 biryani joints across Kolkata. Interviewed historians, chefs, and elderly Nawabs.",
      content: "Article pending review..."
    }
  ],
  
  users: [
    {
      id: 1,
      name: "Anindita Chatterjee",
      email: "anindita@kcc.in",
      role: "author",
      avatar: "https://i.pravatar.cc/150?img=1",
      bio: "Cultural journalist covering Durga Puja, festivals & Bengal traditions",
      articles: 28,
      followers: 342
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      email: "rajesh@kcc.in",
      role: "author",
      avatar: "https://i.pravatar.cc/150?img=2",
      bio: "Transportation & infrastructure reporter for Metro Rail coverage",
      articles: 45,
      followers: 567
    },
    {
      id: 3,
      name: "Priya Banerjee",
      email: "priya@kcc.in",
      role: "editor",
      avatar: "https://i.pravatar.cc/150?img=3",
      bio: "Food historian exploring Kolkata's culinary heritage",
      articles: 52,
      followers: 423
    },
    {
      id: 4,
      name: "Debashish Ghosh",
      email: "debashish@kcc.in",
      role: "author",
      avatar: "https://i.pravatar.cc/150?img=4",
      bio: "Investigative journalist covering education & social issues",
      articles: 67,
      followers: 891
    },
    {
      id: 5,
      name: "Soumya Sengupta",
      email: "soumya@kcc.in",
      role: "author",
      avatar: "https://i.pravatar.cc/150?img=5",
      bio: "Heritage preservation advocate & oral history documentarian",
      articles: 38,
      followers: 276
    },
    {
      id: 6,
      name: "Rituparna Das",
      email: "rituparna@kcc.in",
      role: "author",
      avatar: "https://i.pravatar.cc/150?img=6",
      bio: "Culinary economist analyzing food culture & business",
      articles: 41,
      followers: 512
    },
    {
      id: 7,
      name: "Admin User",
      email: "admin@kcc.in",
      role: "admin",
      avatar: "https://i.pravatar.cc/150?img=7",
      bio: "Administrator",
      articles: 0,
      followers: 0
    }
  ],

  // Get functions
  getArticles: function() {
    return this.articles;
  },

  getArticleById: function(id) {
    return this.articles.find(a => a.id === id);
  },

  getArticlesByAuthor: function(authorId) {
    return this.articles.filter(a => a.authorId === authorId);
  },

  getArticlesByStatus: function(status) {
    return this.articles.filter(a => a.status === status);
  },

  getUsers: function() {
    return this.users;
  },

  getUserById: function(id) {
    return this.users.find(u => u.id === id);
  },

  getUserByEmail: function(email) {
    return this.users.find(u => u.email === email);
  },

  // Update functions
  updateArticleStatus: function(articleId, newStatus) {
    const article = this.getArticleById(articleId);
    if (article) {
      article.status = newStatus;
      if (newStatus === 'published' && !article.publishDate) {
        article.publishDate = new Date().toISOString().split('T')[0];
      }
      this.saveToLocalStorage();
      return true;
    }
    return false;
  },

  addArticle: function(article) {
    const newId = Math.max(...this.articles.map(a => a.id)) + 1;
    const newArticle = {
      id: newId,
      views: 0,
      engagement: 0,
      publishDate: null,
      ...article
    };
    this.articles.push(newArticle);
    this.saveToLocalStorage();
    return newArticle;
  },

  updateArticle: function(articleId, updates) {
    const article = this.getArticleById(articleId);
    if (article) {
      Object.assign(article, updates);
      this.saveToLocalStorage();
      return true;
    }
    return false;
  },

  deleteArticle: function(articleId) {
    const index = this.articles.findIndex(a => a.id === articleId);
    if (index > -1) {
      this.articles.splice(index, 1);
      this.saveToLocalStorage();
      return true;
    }
    return false;
  },

  // Stats functions
  getStats: function() {
    return {
      totalArticles: this.articles.length,
      published: this.articles.filter(a => a.status === 'published').length,
      review: this.articles.filter(a => a.status === 'review').length,
      draft: this.articles.filter(a => a.status === 'draft').length,
      totalViews: this.articles.reduce((sum, a) => sum + a.views, 0),
      totalEngagement: this.articles.reduce((sum, a) => sum + a.engagement, 0),
      totalAuthors: this.users.filter(u => u.role === 'author').length
    };
  },

  getAuthorStats: function(authorId) {
    const articles = this.getArticlesByAuthor(authorId);
    return {
      totalArticles: articles.length,
      published: articles.filter(a => a.status === 'published').length,
      totalViews: articles.reduce((sum, a) => sum + a.views, 0),
      avgEngagement: articles.length > 0 
        ? Math.round(articles.reduce((sum, a) => sum + a.engagement, 0) / articles.length) 
        : 0
    };
  },

  // LocalStorage persistence
  saveToLocalStorage: function() {
    localStorage.setItem('kcc_articles', JSON.stringify(this.articles));
    localStorage.setItem('kcc_users', JSON.stringify(this.users));
  },

  loadFromLocalStorage: function() {
    const articles = localStorage.getItem('kcc_articles');
    const users = localStorage.getItem('kcc_users');
    
    if (articles) {
      this.articles = JSON.parse(articles);
    }
    if (users) {
      this.users = JSON.parse(users);
    }
  },

  // Initialize
  init: function() {
    this.loadFromLocalStorage();
  }
};

// Initialize data store
DATA_STORE.init();