  const bgFill = document.getElementById('bgFill');
  for (let i = 0; i < 26; i++) {
    const e = document.createElement('div');
    e.className = 'ember';
    e.style.left = `${Math.random() * 100}%`;
    e.style.bottom = `${-10 - Math.random() * 20}%`;
    e.style.animationDuration = `${8 + Math.random() * 10}s`;
    e.style.animationDelay = `${Math.random() * 10}s`;
    bgFill.appendChild(e);
  }

  const stageWrap = document.getElementById('stageWrap');
  const nav = document.getElementById('nav');
  const flipPerspective = document.getElementById('flipPerspective');
  const flipInner = document.getElementById('flipInner');
  const logoStage = document.getElementById('logoStage');
  const logoTagline = document.getElementById('logoTagline');
  const scrollCue = document.getElementById('scrollCue');
  const trailerStage = document.getElementById('trailerStage');

  const FLIP_START = 0.12, FLIP_END = 0.32;
  const TITLE_HOLD_END = 0.48;
  const LOGO_FADE_END = 0.60;
  const TRAILER_IN_END = 0.76;

  function clamp01(n){ return Math.min(Math.max(n, 0), 1); }

  function update() {
    const rect = stageWrap.getBoundingClientRect();
    const total = stageWrap.offsetHeight - window.innerHeight;
    const progress = clamp01(total > 0 ? -rect.top / total : 0);

    nav.classList.toggle('visible', progress > 0.02);

    const zoomT = clamp01(progress / FLIP_END);
    flipPerspective.style.transform = `scale(${0.74 + zoomT * 0.26})`;

    const flipT = clamp01((progress - FLIP_START) / (FLIP_END - FLIP_START));
    flipInner.style.transform = `rotateY(${flipT * 180}deg)`;

    const taglineT = clamp01((progress - FLIP_END) / (TITLE_HOLD_END - FLIP_END));
    logoTagline.style.opacity = String(taglineT);

    scrollCue.style.opacity = String(clamp01(1 - progress / 0.045));

    const logoOutT = clamp01((progress - TITLE_HOLD_END) / (LOGO_FADE_END - TITLE_HOLD_END));
    logoStage.style.opacity = String(1 - logoOutT);
    logoStage.style.pointerEvents = logoOutT > 0.6 ? 'none' : 'auto';

    let trailerOpacity = 0;
    if (progress < LOGO_FADE_END) trailerOpacity = 0;
    else if (progress < TRAILER_IN_END) trailerOpacity = (progress - LOGO_FADE_END) / (TRAILER_IN_END - LOGO_FADE_END);
    else trailerOpacity = 1;
    trailerStage.style.opacity = String(trailerOpacity);
    trailerStage.style.pointerEvents = trailerOpacity > 0.5 ? 'auto' : 'none';
  }

  function onScroll() {
    update();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  const trailerFrame = document.getElementById('trailerFrame');
  const trailerVideo = document.getElementById('trailerVideo');

  if (trailerFrame && trailerVideo) {
    const ICON_PLAY = 'M6 4L20 12L6 20V4Z';
    const ICON_PAUSE = 'M6 4H10V20H6V4ZM14 4H18V20H14V4Z';

    const centerPlayIcon = document.getElementById('trailerPlayIcon');
    const barPlayIcon = document.getElementById('tcPlayIcon');
    const centerPlayBtn = document.getElementById('trailerPlay');
    const barPlayBtn = document.getElementById('tcPlay');
    const timeLabel = document.getElementById('tcTime');
    const progressBar = document.getElementById('tcProgress');
    const progressFill = document.getElementById('tcProgressFill');
    const muteBtn = document.getElementById('tcMute');
    const muteWave2 = document.getElementById('tcMuteWave2');
    const muteX = document.getElementById('tcMuteX');
    const fullscreenBtn = document.getElementById('tcFullscreen');

    function formatTime(sec) {
      if (!isFinite(sec)) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    function setPlayIcons(isPlaying) {
      const d = isPlaying ? ICON_PAUSE : ICON_PLAY;
      if (centerPlayIcon) centerPlayIcon.setAttribute('d', d);
      if (barPlayIcon) barPlayIcon.setAttribute('d', d);
      trailerFrame.classList.toggle('is-paused', !isPlaying);
    }

    function toggleTrailer() {
      if (trailerVideo.paused) trailerVideo.play();
      else trailerVideo.pause();
    }

    trailerVideo.addEventListener('play', () => setPlayIcons(true));
    trailerVideo.addEventListener('pause', () => setPlayIcons(false));
    setPlayIcons(false);

    if (centerPlayBtn) centerPlayBtn.addEventListener('click', toggleTrailer);
    if (barPlayBtn) barPlayBtn.addEventListener('click', toggleTrailer);
    trailerVideo.addEventListener('click', toggleTrailer);

    trailerVideo.addEventListener('loadedmetadata', () => {
      timeLabel.textContent = `${formatTime(0)} / ${formatTime(trailerVideo.duration)}`;
    });

    trailerVideo.addEventListener('timeupdate', () => {
      if (!trailerVideo.duration) return;
      const pct = (trailerVideo.currentTime / trailerVideo.duration) * 100;
      progressFill.style.width = `${pct}%`;
      timeLabel.textContent = `${formatTime(trailerVideo.currentTime)} / ${formatTime(trailerVideo.duration)}`;
    });

    function seekFromEvent(e) {
      const rect = progressBar.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      if (trailerVideo.duration) trailerVideo.currentTime = pct * trailerVideo.duration;
    }
    progressBar.addEventListener('click', seekFromEvent);

    function setMuteIcon(isMuted) {
      muteWave2.style.display = isMuted ? 'none' : 'block';
      muteX.style.display = isMuted ? 'block' : 'none';
    }
    muteBtn.addEventListener('click', () => {
      trailerVideo.muted = !trailerVideo.muted;
      setMuteIcon(trailerVideo.muted);
    });
    setMuteIcon(trailerVideo.muted);

    fullscreenBtn.addEventListener('click', () => {
      const target = trailerVideo || trailerFrame;
      if (target.requestFullscreen) target.requestFullscreen();
      else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
    });
  }