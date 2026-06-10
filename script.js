let playlist = JSON.parse(localStorage.getItem("playlist")) || [];

function addVideo() {
    const input = document.getElementById("youtubeUrl");
    const url = input.value.trim();

    const videoId = extractVideoId(url);

    if (!videoId) {
        alert("Lien YouTube invalide");
        return;
    }

    // fallback stable (plus fiable que oEmbed)z
    const title = "🎵 Vidéo YouTube";

    playlist.push({
        id: videoId,
        title: title
    });

    localStorage.setItem("playlist", JSON.stringify(playlist));

    input.value = "";
    renderPlaylist();
}

function extractVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com.*v=)([^&]+)/);
    return match ? match[1] : null;
}

function playVideo(id) {
    document.getElementById("player").src =
        "https://www.youtube.com/embed/" + id + "?autoplay=1";
}

function renderPlaylist() {
    const list = document.getElementById("playlist");
    list.innerHTML = "";

    playlist.forEach((video, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="song">
                <div class="cover">🎵</div>
                <div>
                    <div class="title">${video.title}</div>
                    <div class="sub">YouTube track ${index + 1}</div>
                </div>
            </div>
        `;

        li.onclick = () => playVideo(video.id);

        list.appendChild(li);
    });
}

renderPlaylist();
