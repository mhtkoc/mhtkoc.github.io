
let posts = [];

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
    fetch(post.file)
        .then(res => res.text())
        .then(md => {
            // Front matter'ı ayıkla
            const fmMatch = md.match(/^---([\s\S]*?)---/);
            let content = md;
            if (fmMatch) {
                content = md.slice(fmMatch[0].length);
            }
            document.getElementById('post-content').innerHTML = marked.parse(content);
            document.getElementById('posts-list').style.display = 'none';
            document.getElementById('post-content').style.display = 'block';
            document.getElementById('back-btn').style.display = 'inline-block';
        });
}

document.getElementById('back-btn').onclick = listPosts;

// posts.json'dan blog yazılarını yükle
fetch('posts/posts.json')
    .then(res => res.json())
    .then(data => {
        posts = data;
        listPosts();
    });