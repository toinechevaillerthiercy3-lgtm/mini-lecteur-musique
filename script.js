let playlist = JSON.parse(localStorage.getItem("playlist")) || [];

async function addVideo() {
    const input = document.getElementById("youtubeUrl");
    const url = input.value.trim();

    const videoId = extractVideoId(url);

    if (!videoId) {
        alert("Lien YouTube invalide");
        return;
    }

    try {
        // 🔥 récupère le titre YouTube
        const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );

        const data = await response.json();
        const title = data.title;

        // on stocke id + titre
        playlist.push({ id: videoId, title: title });

        localStorage.setItem("playlist", JSON.stringify(playlist));

        input.value = "";
        renderPlaylist();

    } catch (error) {
        alert("Erreur lors de la récupération du titre YouTube");
        console.error(error);

        // fallback si oEmbed bloque
        playlist.push({ id: videoId, title: "Vidéo YouTube" });

        localStorage.setItem("playlist", JSON.stringify(playlist));
        input.value = "";
        renderPlaylist();
    }
}

function extractVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com.*v=)([^&]+)/);
    return match ? match[1] : null;
}

function playVideo(id) {
    document.getElementById("player").src =
        "https://www.youtube.com/embed/" + id;
}

function renderPlaylist() {
    const list = document.getElementById("playlist");
    list.innerHTML = "";

    playlist.forEach((video) => {
        const li = document.createElement("li");
        li.textContent = "🎵 " + video.title;
        li.onclick = () => playVideo(video.id);
        list.appendChild(li);
    });
}

renderPlaylist();
