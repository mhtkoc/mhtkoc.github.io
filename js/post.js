/**
 * Blog Markdown Renderer & Syntax Highlighter
 * Muhammet Koç Blog Engine
 */

let posts = [];
let rawPosts = {};       // Ham markdown metinleri
let postsContent = {};   // İşlenmiş HTML içerikleri
let postsReadingTime = {}; // Tahmini okuma süreleri

// HTML Kaçış Yardımcısı
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Tema Yönetimi (Açık / Koyu Tema)
function getPreferredTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        return storedTheme;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggleUI(theme);
}

function updateThemeToggleUI(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    if (theme === 'dark') {
        btn.innerHTML = '<i class="fa-solid fa-sun text-warning"></i>';
        btn.setAttribute('title', 'Açık Temaya Geç');
        btn.setAttribute('aria-label', 'Açık Temaya Geç');
    } else {
        btn.innerHTML = '<i class="fa-solid fa-moon text-warning"></i>';
        btn.setAttribute('title', 'Koyu Temaya Geç');
        btn.setAttribute('aria-label', 'Koyu Temaya Geç');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}
window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;

// Okuma Süresi Hesaplama
function calculateReadingTime(text) {
    if (!text) return '1 dk okuma';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} dk okuma`;
}

// Markdown Alert/Callout Desteği (> [!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION])
function enhanceAlerts(html) {
    const alertMap = {
        'NOTE': { title: 'Not', icon: 'fa-solid fa-circle-info', cls: 'markdown-alert-note' },
        'TIP': { title: 'İpucu', icon: 'fa-solid fa-lightbulb', cls: 'markdown-alert-tip' },
        'IMPORTANT': { title: 'Önemli', icon: 'fa-solid fa-circle-exclamation', cls: 'markdown-alert-important' },
        'WARNING': { title: 'Uyarı', icon: 'fa-solid fa-triangle-exclamation', cls: 'markdown-alert-warning' },
        'CAUTION': { title: 'Dikkat', icon: 'fa-solid fa-hand', cls: 'markdown-alert-caution' }
    };

    return html.replace(/<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*<br>|\s*\n)?([\s\S]*?)<\/p>\s*([\s\S]*?)<\/blockquote>/gi, (match, type, firstP, rest) => {
        const key = type.toUpperCase();
        const alertConfig = alertMap[key] || alertMap['NOTE'];
        return `
            <div class="markdown-alert ${alertConfig.cls}">
                <div class="markdown-alert-title">
                    <i class="${alertConfig.icon}"></i> ${alertConfig.title}
                </div>
                <p>${firstP}</p>
                ${rest || ''}
            </div>
        `;
    });
}

// Tabloları responsive sarmalayıcıya ve Bootstrap stiline dönüştürme
function enhanceTables(html) {
    return html.replace(/<table>([\s\S]*?)<\/table>/gi, '<div class="table-responsive"><table class="table table-bordered table-hover">$1</table></div>');
}

// Marked Ayarları ve Highlight.js Entegrasyonu
function configureMarked() {
    if (typeof marked === 'undefined') return;

    const renderer = {
        code(token) {
            // Marked v16+ veya eski sürümler ile uyumlu argüman alımı
            let text = '';
            let lang = '';

            if (typeof token === 'object' && token !== null) {
                text = token.text || '';
                lang = token.lang || '';
            } else {
                text = token || '';
                lang = arguments[1] || '';
            }

            const cleanLang = (lang || '').trim().toLowerCase();
            let highlightedCode = '';
            let validLang = cleanLang;

            if (typeof hljs !== 'undefined') {
                if (cleanLang && hljs.getLanguage(cleanLang)) {
                    try {
                        highlightedCode = hljs.highlight(text, { language: cleanLang }).value;
                    } catch (err) {
                        highlightedCode = escapeHtml(text);
                    }
                } else {
                    try {
                        const auto = hljs.highlightAuto(text);
                        highlightedCode = auto.value;
                        validLang = auto.language || '';
                    } catch (err) {
                        highlightedCode = escapeHtml(text);
                    }
                }
            } else {
                highlightedCode = escapeHtml(text);
            }

            const badgeText = (cleanLang || validLang || 'CODE').toUpperCase();

            return `
                <div class="code-block-container">
                    <div class="code-block-header">
                        <span class="code-lang-badge">
                            <i class="fa-solid fa-code"></i> ${badgeText}
                        </span>
                        <button class="copy-code-btn" type="button" onclick="copyCode(this)" title="Kodu Kopyala">
                            <i class="fa-regular fa-copy"></i>
                            <span>Kopyala</span>
                        </button>
                    </div>
                    <pre><code class="hljs ${validLang ? 'language-' + validLang : ''}">${highlightedCode}</code></pre>
                </div>
            `;
        }
    };

    marked.use({ renderer, gfm: true, breaks: true });
}

// Kod Panoya Kopyalama Fonksiyonu
function copyCode(btn) {
    const container = btn.closest('.code-block-container');
    if (!container) return;
    const codeEl = container.querySelector('pre code');
    if (!codeEl) return;

    const codeText = codeEl.innerText || codeEl.textContent;
    navigator.clipboard.writeText(codeText)
        .then(() => {
            btn.classList.add('copied');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Kopyalandı!</span>';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = '<i class="fa-regular fa-copy"></i> <span>Kopyala</span>';
            }, 2000);
        })
        .catch(err => {
            console.error('Panoya kopyalama başarısız:', err);
        });
}
window.copyCode = copyCode;

// Blog Yazıları Listesini Oluştur
function listPosts() {
    // Hash'i temizle veya güncelle
    if (window.location.hash) {
        history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    document.title = "Blog | Muhammet Koç";

    const listDiv = document.getElementById('posts-list');
    const contentDiv = document.getElementById('post-content');
    const backBtn = document.getElementById('back-btn');

    if (!listDiv) return;

    listDiv.innerHTML = '';
    
    // Blog listesi grid yapısı
    const row = document.createElement('div');
    row.className = 'row g-4';

    posts.forEach((post, idx) => {
        const col = document.createElement('div');
        col.className = 'col-12';

        const readTime = postsReadingTime[post.file] || '3 dk okuma';

        col.innerHTML = `
            <div class="card blog-card h-100">
                <div class="card-body p-4">
                    <div class="d-flex flex-wrap align-items-center gap-3 text-muted mb-2 small">
                        <span><i class="fa-regular fa-calendar text-warning me-1"></i> ${post.date}</span>
                        <span><i class="fa-regular fa-clock text-warning me-1"></i> ${readTime}</span>
                    </div>
                    <h3 class="card-title h4 mb-2" style="cursor:pointer;" onclick="showPost(${idx})">
                        ${post.title}
                    </h3>
                    <p class="card-text text-secondary mb-3">${post.description}</p>
                    <button class="btn btn-warning btn-sm fw-bold px-3 py-2 text-dark" onclick="showPost(${idx})">
                        Yazıyı Oku <i class="fa-solid fa-arrow-right ms-1"></i>
                    </button>
                </div>
            </div>
        `;
        row.appendChild(col);
    });

    listDiv.appendChild(row);

    if (contentDiv) contentDiv.style.display = 'none';
    if (backBtn) backBtn.style.display = 'none';
    listDiv.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.listPosts = listPosts;

// Tek Bir Blog Yazısını Göster
function showPost(idx) {
    const post = posts[idx];
    if (!post) {
        listPosts();
        return;
    }

    // URL Hash güncelle
    window.location.hash = `post-${idx}`;
    document.title = `${post.title} | Muhammet Koç`;

    const content = postsContent[post.file];
    const readTime = postsReadingTime[post.file] || '3 dk okuma';
    const listDiv = document.getElementById('posts-list');
    const contentDiv = document.getElementById('post-content');
    const backBtn = document.getElementById('back-btn');

    if (!contentDiv) return;

    if (content) {
        contentDiv.innerHTML = `
            <div class="blog-post-wrapper">
                <button class="btn btn-outline-secondary btn-sm mb-4 back-btn-custom" onclick="listPosts()">
                    <i class="fa-solid fa-arrow-left"></i> Tüm Blog Yazılarına Dön
                </button>

                <header class="post-header-card">
                    <h1 class="post-title">${post.title}</h1>
                    <div class="post-meta-items">
                        <span><i class="fa-regular fa-calendar text-warning"></i> ${post.date}</span>
                        <span><i class="fa-regular fa-clock text-warning"></i> ${readTime}</span>
                        <span><i class="fa-regular fa-user text-warning"></i> Muhammet Koç</span>
                    </div>
                    ${post.description ? `<p class="post-description">${post.description}</p>` : ''}
                </header>

                <article class="post-body">
                    ${content}
                </article>

                <hr class="my-5" />

                <div class="d-flex justify-content-between align-items-center mb-4">
                    <button class="btn btn-outline-secondary back-btn-custom" onclick="listPosts()">
                        <i class="fa-solid fa-arrow-left"></i> Tüm Blog Yazılarına Dön
                    </button>
                    <button class="btn btn-outline-warning text-dark back-btn-custom" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
                        <i class="fa-solid fa-arrow-up"></i> Başa Dön
                    </button>
                </div>
            </div>
        `;
    } else {
        contentDiv.innerHTML = `
            <div class="blog-post-wrapper">
                <button class="btn btn-outline-secondary btn-sm mb-4" onclick="listPosts()">
                    <i class="fa-solid fa-arrow-left"></i> Geri Dön
                </button>
                <div class="alert alert-danger">
                    <i class="fa-solid fa-triangle-exclamation me-2"></i> Blog yazısı yüklenemedi. Lütfen daha sonra tekrar deneyiniz.
                </div>
            </div>
        `;
    }

    if (listDiv) listDiv.style.display = 'none';
    contentDiv.style.display = 'block';
    if (backBtn) backBtn.style.display = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.showPost = showPost;

// URL Hash Kontrolü ve Yönlendirme
function handleHashRouting() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#post-')) {
        const idx = parseInt(hash.replace('#post-', ''), 10);
        if (!isNaN(idx) && posts[idx]) {
            showPost(idx);
            return;
        }
    }
    listPosts();
}

// Tüm Markdown Dosyalarını Önceden Yükle ve İşle
async function preloadAllPosts() {
    configureMarked();

    const fetchPromises = posts.map((post, idx) =>
        fetch(post.file)
            .then(res => {
                if (!res.ok) {
                    console.error(`Dosya bulunamadı: ${post.file}`);
                    return null;
                }
                return res.text();
            })
            .then(md => {
                if (md) {
                    rawPosts[post.file] = md;
                    
                    // Front matter ayıkla (varsa)
                    let content = md;
                    const fmMatch = md.match(/^---([\s\S]*?)---/);
                    if (fmMatch) {
                        content = md.slice(fmMatch[0].length);
                    }

                    // Okuma süresini hesapla
                    postsReadingTime[post.file] = calculateReadingTime(content);

                    // Markdown'ı parse et ve zenginleştir
                    let parsedHtml = marked.parse(content);
                    parsedHtml = enhanceAlerts(parsedHtml);
                    parsedHtml = enhanceTables(parsedHtml);

                    postsContent[post.file] = parsedHtml;
                }
            })
            .catch(err => {
                console.error(`Hata (${post.file}):`, err);
            })
    );

    await Promise.all(fetchPromises);
}

// Başlangıç Yüklemesi
document.addEventListener('DOMContentLoaded', () => {
    // Tema ikonunu güncelle
    const activeTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    updateThemeToggleUI(activeTheme);

    fetch('posts/posts.json')
        .then(res => {
            if (!res.ok) {
                throw new Error('posts.json bulunamadı!');
            }
            return res.json();
        })
        .then(data => {
            posts = data;
            return preloadAllPosts();
        })
        .then(() => {
            handleHashRouting();
            window.addEventListener('hashchange', handleHashRouting);
        })
        .catch(err => {
            console.error('Blog yükleme hatası:', err);
            const listDiv = document.getElementById('posts-list');
            if (listDiv) {
                listDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fa-solid fa-triangle-exclamation me-2"></i>
                        Blog yazıları yüklenirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.
                    </div>
                `;
            }
        });
});