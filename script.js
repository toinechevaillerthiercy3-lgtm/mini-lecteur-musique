let playlist = JSON.parse(localStorage.getItem("playlist")) || [];
let currentIndex = 0;
let player;

console.log("SCRIPT OK");

function addVideo() {
    if (playlist.includes(videoId[1])) {
    alert("Cette vidéo est déjà dans la playlist");
    return;
}
    const input = document.getElementById("youtubeUrl");
    const url = input.value.trim();

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com.*v=)([^&]+)/);

    if (!videoId) {
        alert("Lien YouTube invalide");
        return;
    }

    playlist.push(videoId[1]);
    localStorage.setItem("playlist", JSON.stringify(playlist));

    input.value = "";
    renderPlaylist();
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

        // nom de la musique
        fetch("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + id + "&format=json")
            .then(r => r.json())
            .then(data => {
                li.textContent = "🎵 " + data.title;
            })
            .catch(() => {
                li.textContent = "🎵 Vidéo " + (index + 1);
            });

        // jouer au clic
        li.onclick = () => playVideo(index);

        // bouton supprimer
        const btn = document.createElement("button");
        btn.textContent = "❌";
        btn.style.marginLeft = "10px";

        btn.onclick = (e) => {
            e.stopPropagation(); // évite de lancer la vidéo
            playlist.splice(index, 1);
            localStorage.setItem("playlist", JSON.stringify(playlist));
            renderPlaylist();
        };

        li.appendChild(btn);
        list.appendChild(li);
    });
}
