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

  const trailerPlayBtn = document.getElementById('trailerPlay');
  const trailerPlayIcon = document.getElementById('trailerPlayIcon');
  const ICON_PLAY = 'M6 4L20 12L6 20V4Z';
  const ICON_PAUSE = 'M6 4H10V20H6V4ZM14 4H18V20H14V4Z';

  function toggleTrailer() {
    const video = document.querySelector('.trailer-video-frame video');
    if (!video) return;
    if (video.paused) {
      video.play();
      trailerPlayIcon.setAttribute('d', ICON_PAUSE);
    } else {
      video.pause();
      trailerPlayIcon.setAttribute('d', ICON_PLAY);
    }
  }

  trailerPlayBtn.addEventListener('click', toggleTrailer);

  document.addEventListener('click', (e) => {
    if (e.target.closest('.trailer-video-frame video')) toggleTrailer();
  });

  const trailerFullscreenBtn = document.getElementById('trailerFullscreen');
  trailerFullscreenBtn.addEventListener('click', () => {
    const frame = document.querySelector('.trailer-video-frame');
    const video = frame.querySelector('video');
    const target = video || frame;
    if (target.requestFullscreen) target.requestFullscreen();
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
  });