const POSTS_PER_PAGE = 6;
let currentPage = 1;
let totalPosts = 0;
let currentUser = null;
let authMode = 'login';
let posts = [];

function togglePostForm() {
    const form = document.getElementById('postForm');
    form.classList.toggle('active');
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:8080/api/posts');
        if (!response.ok) throw new Error('Ошибка при загрузке постов');
        const data = await response.json();
        posts = data;
        totalPosts = data.length;
        renderPosts();
        renderPagination();
    } catch (error) {
        showError('Не удалось загрузить посты: ' + error.message);
    }
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function renderPosts() {
    const postsContainer = document.getElementById('posts');
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="error-message">
                Нет доступных постов.
            </div>
        `;
        return;
    }

    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const currentPosts = posts.slice(startIndex, endIndex);

    const postsHTML = currentPosts.map(post => {
        try {
            const authorName = post.author && post.author.name ? post.author.name : 'Неизвестный автор';
            const title = post.title || 'Без заголовка';
            const content = post.content || 'Нет содержания';
            const date = post.createdAt ? formatDate(post.createdAt) : 'Дата не указана';
            
            const isAuthor = currentUser && post.author && (post.author._id === currentUser._id || post.author._id === currentUser.id || post.author === currentUser._id || post.author === currentUser.id);
            const actionButtons = isAuthor ? `
                <button onclick="editPost('${post._id}')">Редактировать</button>
                <button onclick="deletePost('${post._id}')">Удалить</button>
            ` : '';

            const commentsHTML = Array.isArray(post.comments) ? post.comments.map(comment => `
                <div class="comment">
                    <div class="comment-content">
                        <p>${comment.content}</p>
                        <small>${comment.author ? comment.author.name : 'Неизвестный'} • ${comment.createdAt ? formatDate(comment.createdAt) : ''}</small>
                    </div>
                </div>
            `).join('') : '';

            const commentForm = currentUser ? `
                <div class="add-comment">
                    <textarea placeholder="Добавить комментарий..." onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); addComment('${post._id}', this.value); this.value = ''; }"></textarea>
                </div>
            ` : '';

            return `
                <article class="post" data-post-id="${post._id}">
                    <div class="post-header">
                        <h2 class="post-title">${title}</h2>
                        <div class="post-meta">
                            <span>${authorName}</span>
                            <span>${date}</span>
                        </div>
                    </div>
                    <div class="post-content">${content}</div>
                    <div class="post-actions">
                        ${actionButtons}
                    </div>
                    <div class="comments">
                        <h3>Комментарии</h3>
                        ${commentsHTML}
                        ${commentForm}
                    </div>
                </article>
            `;
        } catch (error) {
            console.error('Error rendering post:', error);
            return `
                <div class="error-message">
                    Ошибка при отображении поста
                </div>
            `;
        }
    }).join('');

    postsContainer.innerHTML = postsHTML;
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    
    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button 
                onclick="changePage(${i})" 
                class="${i === currentPage ? 'active' : ''}"
            >${i}</button>
        `;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    fetchPosts();
}

async function createPost(title, content) {
    try {
        const response = await fetch('http://localhost:8080/api/posts', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, content })
        });
        
        if (!response.ok) throw new Error('Ошибка при создании поста');
        await fetchPosts();
        togglePostForm(false);
    } catch (error) {
        showError('Не удалось создать пост: ' + error.message);
    }
}

async function deletePost(postId) {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await fetchPosts();
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Не удалось удалить пост. Пожалуйста, попробуйте снова.');
    }
}

async function editPost(postId) {
    const newTitle = prompt('Введите новый заголовок:');
    const newContent = prompt('Введите новое содержание:');

    if (!newTitle || !newContent) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: newTitle,
                content: newContent
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await fetchPosts();
    } catch (error) {
        console.error('Error editing post:', error);
        alert('Не удалось отредактировать пост. Пожалуйста, попробуйте снова.');
    }
}

async function addComment(postId, content) {
    if (!content.trim()) return;

    try {
        const response = await fetch(`http://localhost:8080/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await fetchPosts();
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Не удалось добавить комментарий. Пожалуйста, попробуйте снова.');
    }
}

function showAuthModal(mode) {
    authMode = mode;
    const modal = document.getElementById('authModal');
    const form = document.getElementById('authForm');
    const title = document.getElementById('authTitle');
    const nameGroup = document.getElementById('nameGroup');
    const nameInput = document.getElementById('name');
    const submitBtn = document.getElementById('authSubmit');

    if (mode === 'register') {
        title.textContent = 'Sign Up';
        nameGroup.style.display = 'block';
        nameInput.required = true;
        submitBtn.textContent = 'Sign Up';
    } else {
        title.textContent = 'Sign In';
        nameGroup.style.display = 'none';
        nameInput.required = false;
        submitBtn.textContent = 'Sign In';
    }

    modal.classList.add('active');
    form.reset();
}

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('active');
}

async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const name = document.getElementById('name').value.trim();

    try {
        if (!email) {
            throw new Error('Please enter your email');
        }
        if (!password) {
            throw new Error('Please enter your password');
        }
        if (authMode === 'register' && !name) {
            throw new Error('Please enter your name');
        }

        const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
        const body = authMode === 'register' ? { name, email, password } : { email, password };

        const response = await fetch(`http://localhost:8080${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка авторизации');
        }

        if (!data.user || !data.token) {
            throw new Error('Некорректный ответ от сервера');
        }

        currentUser = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        updateAuthUI();
        hideAuthModal();
        await fetchPosts();
        
        // Очищаем форму
        document.getElementById('authForm').reset();
        
    } catch (error) {
        console.error('Auth error:', error);
        showError(error.message || 'Authentication error. Please try again later.');
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const newPostBtn = document.querySelector('.new-post-btn');
    const userName = document.getElementById('userName');

    if (currentUser) {
        authButtons.style.display = 'none';
        userProfile.classList.add('active');
        newPostBtn.style.display = 'block';
        userName.textContent = currentUser.name;
    } else {
        authButtons.style.display = 'flex';
        userProfile.classList.remove('active');
        newPostBtn.style.display = 'none';
    }
}

async function logout() {
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateAuthUI();
    await fetchPosts();
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
        try {
            const response = await fetch('http://localhost:8080/api/auth/me', {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Токен недействителен');
            }
            
            const user = await response.json();
            currentUser = user;
            updateAuthUI();
        } catch (error) {
            console.error('Auth check error:', error);
            logout();
        }
    }
    
    await fetchPosts();
}

function showError(message) {
    const errorElement = document.querySelector('.error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('postForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        await createPost(title, content);
    });
}); 