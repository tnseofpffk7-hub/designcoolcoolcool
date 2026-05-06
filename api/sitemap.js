import { readdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://designcoolcoolcool.vercel.app';

export default function handler(req, res) {
  const blogDir = join(process.cwd(), 'blog');
  let blogSlugs = [];

  try {
    blogSlugs = readdirSync(blogDir)
      .filter(f => f.endsWith('.html') && f !== 'index.html')
      .map(f => f.replace('.html', ''));
  } catch (e) {
    blogSlugs = [];
  }

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'monthly' },
    { url: '/blog', priority: '0.9', changefreq: 'weekly' },
  ];

  const blogPages = blogSlugs.map(slug => ({
    url: `/blog/${slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  const allPages = [...staticPages, ...blogPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
