```js
let playlist = JSON.parse(localStorage.getItem("playlist")) || [];
let currentIndex = 0;
let player;

function addVideo() {
    const input = document.getElementById("youtubeUrl");
    const url = input.value.trim();

    const videoId = extractVideoId(url);

    if (!videoId) {
        alert("Lien YouTube invalide");
        return;
    }

    playlist.push(videoId);
    localStorage.setItem("playlist", JSON.stringify(playlist));

    input.value = "";
    renderPlaylist();
}

function extractVideoId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com.*v=)([^&]+)/);
    return match ? match[1] : null;
}

function playVideo(index) {
    currentIndex = index;

    if (player) {
        player.loadVideoById(playlist[currentIndex]);
    }
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

        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`)
            .then(response => response.json())
            .then(data => {
                li.textContent = "🎵 " + data.title;
            })
            .catch(() => {
                li.textContent = "🎵 Vidéo " + (index + 1);
            });

        li.onclick = () => playVideo(index);

        list.appendChild(li);
    });
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        height: "300",
        width: "100%",
        events: {
            onStateChange: function (event) {
                if (event.data === YT.PlayerState.ENDED) {
                    nextVideo();
                }
            }
        }
    });

    renderPlaylist();
}
```
