let playlists = JSON.parse(localStorage.getItem("playlists")) || {
    "Playlist 1": [],
    "Playlist 2": []
};

let currentPlaylist = "Playlist 1";

// 🎵 AJOUT MUSIQUE
async function addVideo() {
    const input = document.getElementById("youtubeUrl");
    const url = input.value.trim();

    const videoId = extractVideoId(url);

    if (!videoId) {
        alert("Lien YouTube invalide");
        return;
    }

    let choice = prompt("Playlist ? (Playlist 1 / Playlist 2)");

    if (!choice || !playlists[choice]) {
        alert("Playlist invalide");
        return;
    }

    // 🎵 récupérer titre
    let title = "Vidéo YouTube";
    try {
        const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        const data = await res.json();
        title = data.title;
    } catch (e) {}

    playlists[choice].push({
        id: videoId,
        title: title,
        fav: false
    });

    save();
    input.value = "";
    renderPlaylist(choice);
}

// 🔍 EXTRACTION ID
function extractVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com.*v=)([^&]+)/);
    return match ? match[1] : null;
}

// ▶ PLAY
function playVideo(id) {
    document.getElementById("player").src =
        "https://www.youtube.com/embed/" + id + "?autoplay=1";
}

// 🗑 SUPPRIMER
function deleteVideo(index) {
    playlists[currentPlaylist].splice(index, 1);
    save();
    renderPlaylist(currentPlaylist);
}

// ❤️ FAVORIS
function toggleFav(index) {
    playlists[currentPlaylist][index].fav =
        !playlists[currentPlaylist][index].fav;

    save();
    renderPlaylist(currentPlaylist);
}

// 💾 SAVE
function save() {
    localStorage.setItem("playlists", JSON.stringify(playlists));
}

// 📂 AFFICHAGE
function renderPlaylist(name = "Playlist 1") {
    const list = document.getElementById("playlist");
    list.innerHTML = "";

    currentPlaylist = name;

    playlists[name].forEach((music, index) => {

        const li = document.createElement("li");

        li.innerHTML = `
            <div class="music">
                <img src="https://img.youtube.com/vi/${music.id}/mqdefault.jpg" />
                <div class="info">
                    <div class="title">${music.title}</div>
                    <div class="actions">
                        <button onclick="event.stopPropagation(); playVideo('${music.id}')">▶</button>
                        <button onclick="event.stopPropagation(); toggleFav(${index})">
                            ${music.fav ? "❤️" : "🤍"}
                        </button>
                        <button onclick="event.stopPropagation(); deleteVideo(${index})">🗑</button>
                    </div>
                </div>
            </div>
        `;

        li.onclick = () => playVideo(music.id);

        list.appendChild(li);
    });
}

// init
renderPlaylist();
