// app.js
// Ganti playlistUrl di bawah dengan link playlist Spotify Anda
const playlistUrl = 'https://open.spotify.com/playlist/6vG5G8XCWEuFqVKmrSxPXV?si=TMuK-q-NQzi6T3OW9lH6tA';

// helper: ambil playlist id dari URL
function getPlaylistIdFromUrl(url){
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const idx = parts.indexOf('playlist');
    if (idx !== -1) return parts[idx+1].split('?')[0];
    return parts[parts.length-1].split('?')[0];
  } catch(e){
    return null;
  }
}

// fetch oEmbed (no auth)
async function fetchOEmbed(url){
  const api = 'https://open.spotify.com/oembed?url=' + encodeURIComponent(url);
  const res = await fetch(api);
  if(!res.ok) throw new Error('Gagal ambil data playlist');
  return res.json();
}

document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('playlistTitle');
  const ownerEl = document.getElementById('playlistOwner');
  const coverImg = document.getElementById('coverImg');
  const smallCover = document.getElementById('smallCover');
  const previewArea = document.getElementById('previewArea');
  const embedHolder = document.getElementById('embedHolder');
  const extraInfo = document.getElementById('extraInfo');

  const openBtn = document.getElementById('openSpotify');
  const webBtn = document.getElementById('openWeb');
  const overlay = document.getElementById('overlay');
  const metaTitle = document.getElementById('metaTitle');
  const metaSub = document.getElementById('metaSub');

  // init
  (async function init(){
    titleEl.textContent = 'Memuat playlist…';
    ownerEl.textContent = '';

    try {
      const data = await fetchOEmbed(playlistUrl);
      titleEl.textContent = data.title || 'Playlist Spotify';
      ownerEl.textContent = 'oleh ' + (data.author_name || 'Spotify');
      coverImg.src = data.thumbnail_url;
      coverImg.alt = data.title || 'Cover playlist';
      smallCover.src = data.thumbnail_url;
      smallCover.alt = data.title || 'Cover kecil';

      // show embed HTML (iframe) safely
      const wrapper = document.createElement('div');
      wrapper.innerHTML = data.html;
      const iframe = wrapper.querySelector('iframe');
      if (iframe) {
        iframe.style.border = '0';
        iframe.style.width = '100%';
        iframe.style.height = '232px';
        iframe.setAttribute('loading','lazy');
        embedHolder.appendChild(iframe);
      } else {
        embedHolder.textContent = 'Embed tidak tersedia.';
      }

      previewArea.innerHTML = `
        <div>
          <div style="font-weight:700; font-size:15px">${data.title}</div>
          <div style="color:var(--muted); margin-top:8px">${data.author_name || ''}</div>
          <div style="margin-top:12px"><a href="${playlistUrl}" target="_blank" rel="noopener" style="color:var(--accent); text-decoration:none; font-weight:700">Buka preview di Spotify</a></div>
        </div>
      `;
    } catch (err) {
      console.error(err);
      titleEl.textContent = 'Gagal memuat playlist';
      ownerEl.textContent = '';
      coverImg.src = '';
      previewArea.textContent = 'Tidak dapat mengambil data playlist. Pastikan playlist URL valid dan public.';
      extraInfo.textContent = 'Pastikan playlist Anda bersifat Public agar dapat ditampilkan.';
    }
  })();

  // overlay controls
  function showOverlay(title, subtitle){
    metaTitle.textContent = title || 'Mengalihkan ke Spotify…';
    metaSub.textContent = subtitle || 'Tunggu sebentar, aplikasi Spotify akan terbuka.';
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
  }

  function hideOverlay(){
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
  }

  function openInNewTab(url){
    const newWin = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWin) newWin.focus();
  }

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const pid = getPlaylistIdFromUrl(playlistUrl);
    const appUri = pid ? `spotify:playlist:${pid}` : null;

    showOverlay('Membuka Spotify', 'Jika aplikasi terpasang, akan terbuka otomatis. Jika tidak, Web Player akan dibuka.');

    if (appUri) {
      setTimeout(() => {
        location.href = appUri;
      }, 350);
    }

    setTimeout(() => {
      openInNewTab(playlistUrl);
    }, 900);

    setTimeout(hideOverlay, 2600);
  });

  webBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showOverlay('Membuka Web Player', 'Web Player akan terbuka di tab baru — silakan login jika diminta.');
    setTimeout(() => openInNewTab(playlistUrl), 700);
    setTimeout(hideOverlay, 2000);
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') hideOverlay();
  });
});