let playlists = JSON.parse(localStorage.getItem("playlists")) || {
    "Playlist 1": [],
    "Playlist 2": []
};

let currentPlaylist = "Playlist 1";

function addVideo() {
    const input = document.getElementById("youtubeUrl");
    const url = input.value.trim();

    const videoId = extractVideoId(url);

    if (!videoId) {
        alert("Lien YouTube invalide");
        return;
    }

    // 🔥 choix playlist
    let choice = prompt("Dans quelle playlist ? (Playlist 1 / Playlist 2)");

    if (!choice) return;

    if (!playlists[choice]) {
        alert("Playlist inexistante !");
        return;
    }

    playlists[choice].push(videoId);

    localStorage.setItem("playlists", JSON.stringify(playlists));

    input.value = "";
    renderPlaylist(choice);
}

function extractVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com.*v=)([^&]+)/);
    return match ? match[1] : null;
}

function playVideo(id) {
    document.getElementById("player").src =
        "https://www.youtube.com/embed/" + id + "?autoplay=1";
}

function renderPlaylist(name = "Playlist 1") {
    const list = document.getElementById("playlist");
    list.innerHTML = "";

    currentPlaylist = name;

    playlists[name].forEach((id, index) => {
        const li = document.createElement("li");
        li.textContent = name + " - Musique " + (index + 1);
        li.onclick = () => playVideo(id);
        list.appendChild(li);
    });
}

// affichage initial
renderPlaylist();
