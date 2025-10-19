
let posts = [];
let postsContent = {}; // Tüm markdown içeriklerini saklamak için

function listPosts() {
    const listDiv = document.getElementById('posts-list');
    listDiv.innerHTML = '';
    posts.forEach((post, idx) => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `<div class="card-body">
                    <h3 class="card-title">${post.title}</h3>
                    <h6 class="card-subtitle mb-2 text-muted">${post.date}</h6>
                    <p class="card-text">${post.description}</p>
                    <button class="btn btn-primary" onclick="showPost(${idx})">Yazıyı Oku</button>
                </div>`;
        listDiv.appendChild(card);
    });
    document.getElementById('post-content').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';
    listDiv.style.display = 'block';
}

function showPost(idx) {
    const post = posts[idx];
    const content = postsContent[post.file];

    if (content) {
        // İçerik önceden yüklenmişse direkt göster
        document.getElementById('post-content').innerHTML = content;
        document.getElementById('posts-list').style.display = 'none';
        document.getElementById('post-content').style.display = 'block';
        document.getElementById('back-btn').style.display = 'inline-block';
    } else {
        // İçerik yüklenememişse hata göster
        document.getElementById('post-content').innerHTML = '<div class="alert alert-danger">Blog yazısı yüklenemedi.</div>';
        document.getElementById('posts-list').style.display = 'none';
        document.getElementById('post-content').style.display = 'block';
        document.getElementById('back-btn').style.display = 'inline-block';
    }
}

document.getElementById('back-btn').onclick = listPosts;

// Tüm markdown dosyalarını önceden yükle
async function preloadAllPosts() {
    const fetchPromises = posts.map(post =>
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
                    // Front matter'ı ayıkla
                    const fmMatch = md.match(/^---([\s\S]*?)---/);
                    let content = md;
                    if (fmMatch) {
                        content = md.slice(fmMatch[0].length);
                    }
                    postsContent[post.file] = marked.parse(content);
                    console.log(`✓ Yüklendi: ${post.file}`);
                }
            })
            .catch(err => {
                console.error(`Hata (${post.file}):`, err);
            })
    );

    await Promise.all(fetchPromises);
    console.log('Tüm blog yazıları yüklendi:', Object.keys(postsContent));
}

// posts.json'dan blog yazılarını yükle ve ardından tüm markdown dosyalarını fetch et
fetch('posts/posts.json')
    .then(res => {
        if (!res.ok) {
            throw new Error('posts.json bulunamadı!');
        }
        return res.json();
    })
    .then(data => {
        posts = data;
        console.log('posts.json yüklendi:', posts);
        return preloadAllPosts(); // Tüm markdown dosyalarını yükle
    })
    .then(() => {
        listPosts(); // Listeyi göster
    })
    .catch(err => {
        console.error('Blog yükleme hatası:', err);
        document.getElementById('posts-list').innerHTML =
            '<div class="alert alert-danger">Blog yazıları yüklenirken hata oluştu. Lütfen konsolu kontrol edin.</div>';
    });