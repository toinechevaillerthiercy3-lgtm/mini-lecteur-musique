let playlist = JSON.parse(localStorage.getItem("playlist")) || [];
let currentIndex = 0;
let player;

console.log("SCRIPT OK");

function addVideo() {
    const input = document.getElementById("youtubeUrl");
    const url = input.value.trim();

    const match = url.match(/(?:youtu\.be\/|youtube\.com.*v=)([^&]+)/);
    const videoId = match ? match[1] : null;

    if (!videoId) {
        alert("Lien YouTube invalide");
        return;
    }

    if (playlist.includes(videoId)) {
        alert("Cette vidéo est déjà dans la playlist");
        return;
    }

    playlist.push(videoId);
    localStorage.setItem("playlist", JSON.stringify(playlist));

    input.value = "";
    renderPlaylist();
}

function playVideo(index) {
    currentIndex = index;

    console.log("Lecture vidéo :", playlist[currentIndex]);

    if (!player) {
        console.log("Player pas prêt");
        return;
    }

    player.loadVideoById(playlist[currentIndex]);
}

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

function renderPlaylist() {
    const list = document.getElementById("playlist");
    list.innerHTML = "";

    playlist.forEach((id, index) => {
        const li = document.createElement("li");

        fetch("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + id + "&format=json")
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
            localStorage.setItem("playlist", JSON.stringify(playlist));
            renderPlaylist();
        };

        li.appendChild(btn);
        list.appendChild(li);
    });
}

/* 🔥 AJOUT IMPORTANT : INITIALISATION YOUTUBE PLAYER */
function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        height: "300",
        width: "100%",
        videoId: playlist[0] || "",
        events: {
            onStateChange: function (event) {
                if (event.data === YT.PlayerState.ENDED) {
                    nextVideo();
                    window.addVideo = addVideo;
window.playVideo = playVideo;
window.nextVideo = nextVideo;
window.previousVideo = previousVideo;
                }
            }
        }
    });

    renderPlaylist();
}
