let playlist = JSON.parse(localStorage.getItem("playlist")) || [];

function addVideo() {
    const input = document.getElementById("youtubeUrl");
    const url = input.value.trim();

    if (url === "") {
        alert("Veuillez entrer un lien YouTube.");
        return;
    }

    const videoId = extractVideoId(url);

    if (!videoId) {
        alert("Lien YouTube invalide.");
        return;
    }

    playlist.push(videoId);
    localStorage.setItem("playlist", JSON.stringify(playlist));

    input.value = "";
    renderPlaylist();
}

function extractVideoId(url) {
    const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regExp);

    return match ? match[1] : null;
}

function playVideo(id) {
    document.getElementById("player").src =
        `https://www.youtube.com/embed/${id}`;
}

function renderPlaylist() {
    const list = document.getElementById("playlist");

    if (!list) return;

    list.innerHTML = "";

    playlist.forEach((id, index) => {
        const li = document.createElement("li");
        li.textContent = `🎵 Musique ${index + 1}`;
        li.style.cursor = "pointer";

        li.addEventListener("click", () => {
            playVideo(id);
        });

        list.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderPlaylist();
});
