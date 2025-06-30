import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Generate blog CSS
const blogStyles = `
/* Blog-specific styles */
.article-hero-image {
  width: 100%;
  height: 400px;
  overflow: hidden;
  margin-bottom: 0;
}

.article-hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.blog-header {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  padding: 4rem 0;
  margin-bottom: 3rem;
}

.blog-article {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.article-meta {
  display: flex;
  gap: 2rem;
  color: #666;
  font-size: 0.9rem;
  margin: 1rem 0 2rem;
}

.article-content {
  line-height: 1.8;
  font-size: 1.1rem;
}

.article-content h2 {
  margin: 2rem 0 1rem;
  color: #333;
}

.article-content pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.author-bio {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 3rem;
}

.related-articles {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.tag {
  background: #e0e0e0;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  text-decoration: none;
  color: #666;
}

.tag:hover {
  background: #d0d0d0;
  color: #333;
}

/* Link styles */
.od-internal-link {
  color: #714B67;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
}

.od-internal-link:hover {
  border-bottom-color: #714B67;
}

.od-external-link {
  color: #2e7d32;
  text-decoration: none;
  position: relative;
  padding-right: 20px;
}

.od-external-link::after {
  content: "↗";
  position: absolute;
  right: 0;
  top: 0;
  font-size: 0.8em;
}

.od-external-link:hover {
  text-decoration: underline;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .article-hero-image {
    height: 250px;
  }
  
  .blog-header {
    padding: 2rem 0;
  }
  
  .blog-article {
    padding: 1rem;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
`;

const cssPath = path.join(rootDir, 'dist', 'css', 'blog.css');
fs.writeFileSync(cssPath, blogStyles);
console.log('✅ Blog CSS created at:', cssPath);