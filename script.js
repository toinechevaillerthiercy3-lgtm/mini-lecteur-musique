let playlist = JSON.parse(localStorage.getItem("playlist")) || [];
let currentIndex = 0;
let player = null;

console.log("SCRIPT OK");

// 🔥 expose les fonctions dès le début (important pour HTML onclick)
window.addVideo = addVideo;
window.playVideo = playVideo;
window.nextVideo = nextVideo;
window.previousVideo = previousVideo;

function savePlaylist() {
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

function extractVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com.*v=)([^&]+)/);
    return match ? match[1] : null;
}

/* =========================
   AJOUT VIDEO
========================= */
function addVideo() {
    const input = document.getElementById("youtubeUrl");
    const url = input.value.trim();

    const videoId = extractVideoId(url);

    if (!videoId) {
        alert("Lien YouTube invalide");
        return;
    }

    if (playlist.includes(videoId)) {
        alert("Cette vidéo est déjà dans la playlist");
        return;
    }

    playlist.push(videoId);
    savePlaylist();

    input.value = "";

    renderPlaylist();

    if (player) {
        playVideo(playlist.length - 1);
    }
}

/* =========================
   PLAY VIDEO
========================= */
function playVideo(index) {
    if (playlist.length === 0) return;

    currentIndex = index;

    if (!player) {
        console.warn("Player pas encore prêt");
        return;
    }

    player.loadVideoById(playlist[currentIndex]);
}

/* =========================
   NAVIGATION
========================= */
function nextVideo() {
    if (playlist.length === 0) return;

    currentIndex = (currentIndex + 1) % playlist.length;
    playVideo(currentIndex);
}

function previousVideo() {
    if (playlist.length === 0) return;

    currentIndex--;
    if (currentIndex < 0) currentIndex = playlist.length - 1;

    playVideo(currentIndex);
}

/* =========================
   RENDER PLAYLIST
========================= */
function renderPlaylist() {
    const list = document.getElementById("playlist");
    if (!list) return;

    list.innerHTML = "";

    playlist.forEach((id, index) => {
        const li = document.createElement("li");

        li.textContent = "Chargement...";

        // 🔥 récup titre YouTube
        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
            .then(r => r.json())
            .then(data => {
                li.textContent = "🎵 " + data.title;
            })
            .catch(() => {
                li.textContent = "🎵 Vidéo " + (index + 1);
            });

        li.onclick = () => playVideo(index);

        const btn = document.createElement("button");
        btn.textContent = "❌";
        btn.style.marginLeft = "10px";

        btn.onclick = (e) => {
            e.stopPropagation();

            playlist.splice(index, 1);
            savePlaylist();
            renderPlaylist();

            // reset lecture si besoin
            if (playlist.length === 0) {
                if (player) player.stopVideo();
            }
        };

        li.appendChild(btn);
        list.appendChild(li);
    });
}

/* =========================
   YOUTUBE API
========================= */
function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        height: "300",
        width: "100%",
        videoId: playlist[0] || "",
        events: {
            onStateChange: (event) => {
                if (event.data === YT.PlayerState.ENDED) {
                    nextVideo();
                }
            }
        }
    });

    renderPlaylist();

    if (playlist.length > 0) {
        playVideo(0);
    }
}

/* =========================
   INIT SAFE (IMPORTANT)
========================= */
window.addEventListener("load", () => {
    renderPlaylist();
});
