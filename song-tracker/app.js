const clientId = 'YOUR_CLIENT_ID';
const redirectUri = 'http://localhost:8080'; // Update this to your redirect URI

let accessToken;

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const loginContainer = document.getElementById('login-container');
    const loggedInContainer = document.getElementById('logged-in-container');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const songList = document.getElementById('song-list');

    // Load songs from localStorage
    let songs = JSON.parse(localStorage.getItem('songs')) || [];

    function renderSongs() {
        songList.innerHTML = '';
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${song.title} - ${song.artist}</span>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            songList.appendChild(li);
        });
    }

    function saveSongs() {
        localStorage.setItem('songs', JSON.stringify(songs));
    }

    loginButton.addEventListener('click', () => {
        const scope = 'user-read-private user-read-email';
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
        window.location.href = authUrl;
    });

    // Check if the URL contains an access token
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    accessToken = params.get('access_token');

    if (accessToken) {
        loginContainer.style.display = 'none';
        loggedInContainer.style.display = 'block';
    }

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        
        if (query && accessToken) {
            try {
                const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                const data = await response.json();
                displaySearchResults(data.tracks.items);
            } catch (error) {
                console.error('Error searching Spotify:', error);
            }
        }
    });

    function displaySearchResults(tracks) {
        searchResults.innerHTML = '';
        tracks.forEach(track => {
            const div = document.createElement('div');
            div.className = 'search-result';
            div.innerHTML = `
                <img src="${track.album.images[2].url}" alt="${track.name} album cover">
                <div class="search-result-info">
                    <div class="search-result-title">${track.name}</div>
                    <div class="search-result-artist">${track.artists[0].name}</div>
                </div>
                <button class="add-btn" data-title="${track.name}" data-artist="${track.artists[0].name}">Add</button>
            `;
            searchResults.appendChild(div);
        });
    }

    searchResults.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-btn')) {
            const title = e.target.getAttribute('data-title');
            const artist = e.target.getAttribute('data-artist');
            addSong(title, artist);
        }
    });

    function addSong(title, artist) {
        songs.push({ title, artist });
        saveSongs();
        renderSongs();
    }

    songList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            songs.splice(index, 1);
            saveSongs();
            renderSongs();
        }
    });

    renderSongs();
});