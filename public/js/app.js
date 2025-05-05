// DOM элементы
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const postsContainer = document.getElementById('posts');
const createPostBtn = document.getElementById('createPostBtn');
const createPostModal = document.getElementById('createPostModal');
const createPostForm = document.getElementById('createPostForm');
const postTitleInput = document.getElementById('postTitle');
const postContentInput = document.getElementById('postContent');

let currentUserId = null;

// Модальное окно для редактирования поста
let editPostId = null;
const editPostModal = document.createElement('div');
editPostModal.className = 'modal';
editPostModal.innerHTML = `
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Редактировать пост</h2>
        <form id="editPostForm">
            <div class="form-group">
                <label for="editPostTitle">Заголовок</label>
                <input type="text" id="editPostTitle" required>
            </div>
            <div class="form-group">
                <label for="editPostContent">Содержимое</label>
                <textarea id="editPostContent" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Сохранить</button>
        </form>
    </div>
`;
document.body.appendChild(editPostModal);

// Закрытие модальных окон
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
        createPostModal.style.display = 'none';
        editPostModal.style.display = 'none';
    });
});

// Открытие модальных окон
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
    registerModal.style.display = 'none';
    createPostModal.style.display = 'none';
    editPostModal.style.display = 'none';
});

registerBtn.addEventListener('click', () => {
    registerModal.style.display = 'block';
    loginModal.style.display = 'none';
    createPostModal.style.display = 'none';
    editPostModal.style.display = 'none';
});

// Закрытие модальных окон при клике вне их области
window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === registerModal) registerModal.style.display = 'none';
    if (e.target === createPostModal) createPostModal.style.display = 'none';
    if (e.target === editPostModal) editPostModal.style.display = 'none';
});

// Обработка регистрации
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('registerName').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка при регистрации');
        }

        // Сохраняем токен
        localStorage.setItem('token', data.token);
        
        // Закрываем модальное окно
        registerModal.style.display = 'none';
        
        // Очищаем форму
        registerForm.reset();
        
        // Обновляем UI
        updateUIForLoggedInUser(data.user);
        
        // Показываем сообщение об успехе
        showMessage('Регистрация успешно завершена', 'success');
        
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Обработка входа
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка при входе');
        }

        // Сохраняем токен
        localStorage.setItem('token', data.token);
        
        // Закрываем модальное окно
        loginModal.style.display = 'none';
        
        // Очищаем форму
        loginForm.reset();
        
        // Обновляем UI
        updateUIForLoggedInUser(data.user);
        
        // Показываем сообщение об успехе
        showMessage('Вход выполнен успешно', 'success');
        
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Функция для обновления UI после входа
function updateUIForLoggedInUser(user) {
    const navLinks = document.querySelector('.nav-links');
    navLinks.innerHTML = `
        <span class="user-name">${user.name}</span>
        <button onclick="logout()" class="btn btn-outline">Выйти</button>
        <button id="createPostBtn" class="btn btn-primary">Создать пост</button>
    `;
    // Назначаем обработчик для новой кнопки
    document.getElementById('createPostBtn').addEventListener('click', () => {
        createPostModal.style.display = 'block';
    });
}

// Функция для выхода
function logout() {
    localStorage.removeItem('token');
    location.reload();
}

// Функция для отображения сообщений
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Добавляем анимацию появления
    setTimeout(() => {
        messageDiv.style.opacity = '1';
    }, 10);
    
    // Удаляем сообщение через 3 секунды
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 3000);
}

// Проверка авторизации при загрузке страницы
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                updateUIForLoggedInUser(user);
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Ошибка при проверке авторизации:', error);
            localStorage.removeItem('token');
        }
    }
}

// Модифицированная функция загрузки постов с кнопками
async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
            throw new Error('Ошибка при загрузке постов');
        }
        const posts = await response.json();
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="no-posts">Пока нет постов</p>';
            return;
        }
        const userStr = localStorage.getItem('user');
        let userId = null;
        if (userStr) {
            try { userId = JSON.parse(userStr)._id; } catch {}
        }
        currentUserId = userId;
        // Отладочный вывод
        console.log('userId:', userId);
        posts.forEach(post => {
            console.log('post.author:', post.author);
        });
        postsContainer.innerHTML = posts.map(post => {
            let authorId = post.author && (typeof post.author === 'object' ? post.author._id : post.author);
            let isAuthor = userId && authorId && (authorId === userId);
            return `
            <div class="post">
                <div class="post-header">
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">
                        <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                        ${isAuthor ? `
                        <div class="post-actions">
                            <button class="btn btn-outline edit-post-btn" data-id="${post._id}">Редактировать</button>
                            <button class="btn btn-outline delete-post-btn" data-id="${post._id}">Удалить</button>
                        </div>` : ''}
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
            </div>
            `;
        }).join('');
        // Назначаем обработчики на кнопки
        document.querySelectorAll('.edit-post-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = btn.getAttribute('data-id');
                const post = posts.find(p => p._id === postId);
                if (post) {
                    document.getElementById('editPostTitle').value = post.title;
                    document.getElementById('editPostContent').value = post.content;
                    editPostId = postId;
                    editPostModal.style.display = 'block';
                }
            });
        });
        document.querySelectorAll('.delete-post-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!confirm('Удалить этот пост?')) return;
                const postId = btn.getAttribute('data-id');
                const token = localStorage.getItem('token');
                try {
                    const response = await fetch(`/api/posts/${postId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || 'Ошибка при удалении поста');
                    showMessage('Пост удалён', 'success');
                    loadPosts();
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            });
        });
    } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
        showMessage('Ошибка при загрузке постов', 'error');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadPosts();
});

async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const name = document.getElementById('name').value.trim();

    try {
        if (!email) {
            throw new Error('Пожалуйста, введите email');
        }
        if (!password) {
            throw new Error('Пожалуйста, введите пароль');
        }
        if (authMode === 'register' && !name) {
            throw new Error('Пожалуйста, введите имя');
        }

        const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
        const body = authMode === 'register' ? { name, email, password } : { email, password };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
        
        // Показываем сообщение об успехе
        showMessage(data.message || (authMode === 'register' ? 'Регистрация успешна' : 'Вход выполнен успешно'), 'success');
        
        // Очищаем форму
        document.getElementById('authForm').reset();
        
    } catch (error) {
        console.error('Auth error:', error);
        showMessage(error.message || 'Ошибка авторизации. Пожалуйста, попробуйте позже.', 'error');
    }
}

function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Показываем сообщение с анимацией
    setTimeout(() => {
        messageDiv.style.opacity = '1';
    }, 100);
    
    // Удаляем сообщение через 3 секунды
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 3000);
}

// Отправка формы создания поста
createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Вы не авторизованы', 'error');
        return;
    }
    const postData = {
        title: postTitleInput.value.trim(),
        content: postContentInput.value.trim()
    };
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(postData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Ошибка при создании поста');
        }
        showMessage('Пост успешно опубликован', 'success');
        createPostModal.style.display = 'none';
        createPostForm.reset();
        loadPosts();
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Обработка отправки формы редактирования
editPostModal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !editPostId) return;
    const title = document.getElementById('editPostTitle').value.trim();
    const content = document.getElementById('editPostContent').value.trim();
    try {
        const response = await fetch(`/api/posts/${editPostId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Ошибка при редактировании поста');
        showMessage('Пост обновлён', 'success');
        editPostModal.style.display = 'none';
        loadPosts();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}); 