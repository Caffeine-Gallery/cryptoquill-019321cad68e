import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Set up event listeners
    setupEventListeners();
    
    // Load initial posts
    await loadPosts();
});

function setupEventListeners() {
    const newPostBtn = document.getElementById('newPostBtn');
    const modal = document.getElementById('newPostForm');
    const closeBtn = document.querySelector('.close');
    const postForm = document.getElementById('postForm');

    newPostBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        quill.setText('');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    postForm.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const loading = document.getElementById('loading');
    loading.classList.remove('hidden');

    try {
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const content = quill.root.innerHTML;

        await backend.createPost(title, content, author);
        
        // Reset form
        document.getElementById('title').value = '';
        document.getElementById('author').value = '';
        quill.setText('');
        
        // Hide modal
        document.getElementById('newPostForm').classList.add('hidden');
        
        // Reload posts
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        loading.classList.add('hidden');
    }
}

async function loadPosts() {
    const loading = document.getElementById('loading');
    const postsContainer = document.getElementById('posts');
    
    loading.classList.remove('hidden');
    
    try {
        const posts = await backend.getPosts();
        
        postsContainer.innerHTML = posts.map(post => `
            <article class="post">
                <h2 class="post-title">${post.title}</h2>
                <div class="post-meta">
                    By ${post.author} • ${new Date(Number(post.timestamp)).toLocaleDateString()}
                </div>
                <div class="post-content">
                    ${post.content}
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<p>Failed to load posts. Please try again later.</p>';
    } finally {
        loading.classList.add('hidden');
    }
}
