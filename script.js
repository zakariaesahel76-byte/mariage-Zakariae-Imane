(function () {
  "use strict";
  var W = window.WEDDING;
  var TITLE = "Mariage de Zakariae & Imane";
  var $ = function (id) { return document.getElementById(id); };
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var target = new Date(W.date + "T" + (W.time || "00:00") + ":00");

  /* ---------- Toast ---------- */
  var toastEl = $("toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- Fleurs (dessinées en SVG) ---------- */
  function ring(cx, cy, r, n, rx, ry, fill, offset) {
    var s = "";
    for (var i = 0; i < n; i++) {
      var a = (360 / n) * i + offset;
      s += '<ellipse cx="' + cx + '" cy="' + (cy - r) + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill +
        '" stroke="#2a0610" stroke-opacity=".18" stroke-width=".6" transform="rotate(' + a + " " + cx + " " + cy + ')"/>';
    }
    return s;
  }
  function dahlia(cx, cy, R, grad) {
    return ring(cx, cy, R * 0.6, 16, R * 0.2, R * 0.42, "url(#" + grad + ")", 0) +
      ring(cx, cy, R * 0.4, 14, R * 0.17, R * 0.32, "url(#" + grad + ")", 11) +
      ring(cx, cy, R * 0.22, 10, R * 0.13, R * 0.22, "url(#" + grad + ")", 5) +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R * 0.12 + '" fill="#3a0a14"/>';
  }
  function rose(cx, cy, R, grad) {
    return ring(cx, cy, R * 0.45, 6, R * 0.42, R * 0.5, "url(#" + grad + ")", 0) +
      ring(cx, cy, R * 0.25, 5, R * 0.32, R * 0.38, "url(#" + grad + ")", 30) +
      ring(cx, cy, R * 0.1, 4, R * 0.2, R * 0.25, "url(#" + grad + ")", 15) +
      '<path d="M' + (cx - R * 0.12) + " " + cy + " a" + R * 0.12 + " " + R * 0.12 + " 0 1 1 " + R * 0.18 + ' 0" fill="none" stroke="#5a1220" stroke-opacity=".5" stroke-width="1.2"/>';
  }
  function leaf(x, y, len, angle) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + angle + ')">' +
      '<path d="M0 0 Q' + len * 0.5 + " " + -len * 0.22 + " " + len + " 0 Q" + len * 0.5 + " " + len * 0.22 + ' 0 0 Z" fill="url(#g-leaf)"/>' +
      '<path d="M0 0 L' + len * 0.92 + ' 0" stroke="#2f381f" stroke-opacity=".5" stroke-width="1"/></g>';
  }
  var bouquet = '<g class="sway">' +
    leaf(40, 40, 160, 18) + leaf(40, 40, 150, 68) + leaf(60, 30, 130, -6) + leaf(30, 70, 120, 95) + leaf(120, 110, 90, 40) +
    dahlia(70, 70, 78, "g-wine") + rose(172, 46, 44, "g-rose") + rose(55, 178, 40, "g-blush") +
    dahlia(150, 132, 42, "g-rose") + dahlia(228, 28, 22, "g-wine") + rose(28, 244, 22, "g-rose") + "</g>";
  Array.prototype.forEach.call(document.querySelectorAll(".fl, .fl-mid"), function (el) { el.innerHTML = bouquet; });

  /* ---------- Musique (YouTube) ---------- */
  var musicId = W.music && W.music.youtubeId;
  var musicBtn = $("music"), musicLbl = $("musicLbl");
  var player, playerReady = false, wantPlay = false, playing = false;

  function syncMusicUI() {
    musicBtn.classList.toggle("on", playing);
    musicBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    musicLbl.textContent = playing ? "Musique" : "Musique coupée";
  }
  if (musicId) {
    musicBtn.classList.add("ready");
    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player("yt-player", {
        width: 1, height: 1, videoId: musicId,
        playerVars: { controls: 0, loop: 1, playlist: musicId, playsinline: 1 },
        events: {
          onReady: function () { playerReady = true; if (wantPlay) player.playVideo(); },
          onStateChange: function (e) { playing = e.data === YT.PlayerState.PLAYING; syncMusicUI(); }
        }
      });
    };
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
  function playMusic() {
    if (!musicId) return;
    wantPlay = true;
    if (playerReady) player.playVideo();
  }
  musicBtn.addEventListener("click", function () {
    if (!playerReady) return;
    if (playing) { wantPlay = false; player.pauseVideo(); } else playMusic();
  });

  /* ---------- Pétales ---------- */
  var cv = $("petals"), cx = cv.getContext("2d"), petals = [], sparks = [], pw = 0, ph = 0, praf = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var cols = ["#7d1a2e", "#9b2a40", "#b5485a", "#c58a92", "#d9a3aa", "#5a1220"];
  function psize() { pw = window.innerWidth; ph = window.innerHeight; cv.width = pw * dpr; cv.height = ph * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function mk(initial) {
    return { x: Math.random() * pw, y: initial ? Math.random() * ph : -20, r: 5 + Math.random() * 7, vy: 0.35 + Math.random() * 0.7,
      sw: 0.4 + Math.random() * 0.9, ph: Math.random() * 6.28, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.03,
      c: cols[(Math.random() * cols.length) | 0], a: 0.5 + Math.random() * 0.35 };
  }
  function pframe() {
    cx.clearRect(0, 0, pw, ph);
    petals.forEach(function (p, i) {
      p.ph += 0.02; p.y += p.vy; p.x += Math.sin(p.ph) * p.sw; p.rot += p.vr;
      if (p.y > ph + 20) petals[i] = p = mk(false);
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.scale(1, 0.55 + 0.45 * Math.cos(p.ph * 1.3));
      cx.globalAlpha = p.a; cx.fillStyle = p.c; cx.beginPath(); cx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, 6.283); cx.fill(); cx.restore();
    });
    cx.save(); cx.shadowColor = "rgba(240, 212, 143, 0.95)"; cx.shadowBlur = 8; cx.fillStyle = "#f0d48f";
    sparks.forEach(function (s) {
      s.ph += 0.035; s.y -= s.vy; s.x += Math.sin(s.ph * 0.6) * 0.25;
      if (s.y < -10) { s.y = ph + 10; s.x = Math.random() * pw; }
      cx.globalAlpha = 0.15 + 0.85 * Math.abs(Math.sin(s.ph));
      cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.283); cx.fill();
    });
    cx.restore();
    praf = requestAnimationFrame(pframe);
  }
  function startPetals() {
    if (praf || still) return;
    psize(); petals = []; sparks = [];
    for (var i = 0; i < (pw < 600 ? 14 : 26); i++) petals.push(mk(true));
    for (var j = 0; j < (pw < 600 ? 22 : 40); j++) sparks.push({ x: Math.random() * pw, y: Math.random() * ph, r: 1 + Math.random() * 1.8, vy: 0.15 + Math.random() * 0.4, ph: Math.random() * 6.28 });
    praf = requestAnimationFrame(pframe);
  }
  window.addEventListener("resize", function () { if (praf) psize(); });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { cancelAnimationFrame(praf); praf = 0; }
    else if (document.body.classList.contains("revealed") && petals.length && !praf) praf = requestAnimationFrame(pframe);
  });

  /* ---------- Apparitions au défilement, mots du verset, parallaxe ---------- */
  var bq = document.querySelector(".verse blockquote");
  var words = bq.textContent.trim().split(/\s+/);
  bq.textContent = "";
  words.forEach(function (w, i) {
    var sp = document.createElement("span");
    sp.className = "w"; sp.style.setProperty("--i", i); sp.textContent = w;
    bq.appendChild(sp);
    if (i < words.length - 1) bq.appendChild(document.createTextNode(" "));
  });

  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("anim");
    var items = document.querySelectorAll(".date .wrap > *, .venue .wrap > *, .verse .wrap > *, .card-sec .wrap > *, .foot .wrap > *");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(items, function (el, i) {
      el.classList.add("rv"); el.style.setProperty("--d", (i % 4) * 0.12 + "s"); io.observe(el);
    });
  }

  var movers = Array.prototype.slice.call(document.querySelectorAll(".fl, .fl-mid")), ticking = false;
  function parallax() {
    ticking = false;
    var vh = window.innerHeight;
    movers.forEach(function (el) {
      var r = el.getBoundingClientRect(), base = r.top - (el._py || 0);
      var py = Math.max(-60, Math.min(60, (base + r.height / 2 - vh / 2) * -0.1));
      el._py = py; el.style.setProperty("--py", py.toFixed(1) + "px");
    });
  }
  if (!still) window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });

  /* ---------- Défilement automatique jusqu'au livre d'or ---------- */
  var autoScrolling = false;
  function autoScroll() {
    if (still) return;
    var el = $("livre-dor");
    var stopAt = Math.min(el.getBoundingClientRect().top + window.scrollY - 20,
      document.documentElement.scrollHeight - window.innerHeight);
    var pos = window.scrollY, last = null;
    autoScrolling = true;
    requestAnimationFrame(function step(t) {
      if (!autoScrolling) return;
      if (last !== null) {
        pos = Math.min(stopAt, pos + W.autoScrollSpeed * (t - last) / 1000);
        window.scrollTo({ top: pos, behavior: "instant" });
        if (pos >= stopAt) { autoScrolling = false; return; }
      }
      last = t;
      requestAnimationFrame(step);
    });
  }
  // Le défilement s'arrête dès que l'invité fait défiler lui-même
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (type) {
    window.addEventListener(type, function (e) {
      if (e.target.closest && e.target.closest("#music")) return;
      autoScrolling = false;
    }, { passive: true });
  });

  /* ---------- Porte et clé ---------- */
  var gate = $("gate"), stage = $("stage"), flood = $("flood"), keyBtn = $("keyBtn"), key = $("key"), door = $("door");
  var hole = [0, 0];
  function layoutGate() {
    var d = door.getBoundingClientRect(), k = $("keyhole").getBoundingClientRect();
    hole = [k.left + k.width / 2, k.top + k.height * 0.4];
    keyBtn.style.setProperty("--bx", d.left + d.width * 0.28 + "px");
    keyBtn.style.setProperty("--by", d.top + d.height * 0.86 + "px");
    gate.style.setProperty("--kx", hole[0] + "px");
    gate.style.setProperty("--ky", hole[1] + "px");
    stage.style.transformOrigin = hole[0] + "px " + hole[1] + "px";
  }
  layoutGate();
  window.addEventListener("resize", layoutGate);

  var opened = false;
  function reveal() {
    document.body.classList.remove("locked");
    document.body.classList.add("revealed");
    window.scrollTo(0, 0);
    gate.classList.add("gone");
    startPetals();
    setTimeout(function () { gate.style.display = "none"; }, 1000);
    setTimeout(autoScroll, 2500);
  }
  function openGate() {
    if (opened) return;
    opened = true;
    playMusic();
    gate.classList.add("opening");
    if (still || !stage.animate) { reveal(); return; }

    // 1. La clé glisse vers la serrure puis tourne
    var b = keyBtn.getBoundingClientRect();
    var dx = hole[0] - (b.left + b.width / 2), dy = hole[1] - (b.top + b.height / 2);
    key.animate([
      { transform: "translate(-50%, -50%) rotate(-25deg)" },
      { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) rotate(0deg) scale(0.55)", offset: 0.6 },
      { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) rotate(90deg) scale(0.55)" }
    ], { duration: 1300, easing: "ease-in-out", fill: "forwards" });

    // 2. Zoom dans la serrure et lumière
    setTimeout(function () {
      key.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" });
      stage.animate([{ transform: "scale(1)" }, { transform: "scale(1.5)", offset: 0.35 }, { transform: "scale(12)" }],
        { duration: 2200, easing: "cubic-bezier(.55,.05,.3,1)", fill: "forwards" });
      flood.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1100, delay: 1000, easing: "ease-in", fill: "forwards" });
      setTimeout(reveal, 2300);
    }, 1300);
  }
  keyBtn.addEventListener("click", function (e) { e.stopPropagation(); openGate(); });
  gate.addEventListener("click", openGate);

  /* ---------- Date, compte à rebours ---------- */
  if (W.time) $("hour").textContent = "à " + W.time.replace(":", "h") + " · الساعة " + W.time;
  var cd = { d: $("cd-d"), h: $("cd-h"), m: $("cd-m"), s: $("cd-s") }, note = $("cd-note");
  function two(n) { return n < 10 ? "0" + n : String(n); }
  function tickCd() {
    var diff = target - new Date();
    if (diff <= 0) {
      cd.d.textContent = cd.h.textContent = cd.m.textContent = cd.s.textContent = "00";
      note.textContent = diff > -86400000 ? "C'est aujourd'hui ! · اليوم هو اليوم" : "Merci d'avoir partagé ce jour avec nous.";
      return;
    }
    var s = Math.floor(diff / 1000);
    cd.d.textContent = String(Math.floor(s / 86400));
    cd.h.textContent = two(Math.floor(s % 86400 / 3600));
    cd.m.textContent = two(Math.floor(s % 3600 / 60));
    cd.s.textContent = two(s % 60);
    cd.s.classList.remove("tick"); void cd.s.offsetWidth; cd.s.classList.add("tick");
    note.textContent = "avant le grand jour";
  }
  tickCd();
  setInterval(tickCd, 1000);

  /* ---------- Lieu ---------- */
  $("venue-name").textContent = W.venue.name;
  $("btn-maps").href = W.venue.mapsUrl;

  /* ---------- Ajout à l'agenda ---------- */
  function pad(n) { return String(n).padStart(2, "0"); }
  function stamp(d, withTime) {
    var s = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    return withTime ? s + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00" : s;
  }
  var start = stamp(target, !!W.time);
  var end = W.time ? stamp(new Date(target.getTime() + 6 * 3600000), true) // durée indicative : 6 h
    : stamp(new Date(target.getTime() + 86400000), false);
  var place = W.venue.name || W.venue.mapsUrl;
  $("btn-gcal").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(TITLE) + "&dates=" + start + "/" + end +
    "&location=" + encodeURIComponent(place) +
    "&details=" + encodeURIComponent("Itinéraire : " + W.venue.mapsUrl + "\n" + window.location.href);
  var dateProp = W.time ? "" : ";VALUE=DATE";
  var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//mariage//FR", "BEGIN:VEVENT",
    "UID:mariage-zakariae-imane-" + start,
    "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
    "DTSTART" + dateProp + ":" + start, "DTEND" + dateProp + ":" + end,
    "SUMMARY:" + TITLE, "LOCATION:" + place.replace(/,/g, "\\,"),
    "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  $("btn-ics").href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);

  /* ---------- Confirmation de présence (WhatsApp) ---------- */
  function waLink(msg) {
    return W.whatsapp
      ? "https://wa.me/" + W.whatsapp + "?text=" + encodeURIComponent(msg)
      : "https://api.whatsapp.com/send?text=" + encodeURIComponent(msg);
  }
  var rname = $("rname"), rcount = $("rcount"), rYes = $("rYes"), rNo = $("rNo"), rerr = $("rerr");
  function rsvpMsg(yes) {
    var n = rname.value.trim() || "…", k = rcount.value;
    return yes
      ? "Bonjour Zakariae et Imane, c'est " + n + ". Je confirme ma présence à votre mariage le lundi 26 octobre 2026" +
        (W.time ? " à " + W.time.replace(":", "h") : "") + " (" + k + " personne" + (k === "1" ? "" : "s") + "). Félicitations !"
      : "Bonjour Zakariae et Imane, c'est " + n + ". Je ne pourrai malheureusement pas être présent(e) à votre mariage, mais je pense fort à vous. Tous mes vœux de bonheur !";
  }
  function syncRsvp() { rYes.href = waLink(rsvpMsg(true)); rNo.href = waLink(rsvpMsg(false)); }
  [rname, rcount].forEach(function (el) { el.addEventListener("input", syncRsvp); el.addEventListener("change", syncRsvp); });
  [rYes, rNo].forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (!rname.value.trim()) { e.preventDefault(); rerr.textContent = "Indiquez votre nom pour continuer."; rname.focus(); }
      else rerr.textContent = "";
    });
  });
  syncRsvp();

  /* ---------- Livre d'or (partagé, enregistré dans Supabase) ---------- */
  var API = W.supabaseUrl + "/rest/v1/comments";
  var headers = { apikey: W.supabaseKey, "Content-Type": "application/json" };
  var form = $("wishForm"), wname = $("wname"), wtext = $("wtext"), werr = $("werr"), list = $("wishes");

  var ideas = [
    ["Bénédictions", "Barakallahu lakuma wa baraka 'alaykuma wa jama'a baynakuma fi khayr. Que Dieu vous accorde une vie remplie d'amour et de sérénité."],
    ["Bonheur", "Tous mes vœux de bonheur pour ce grand jour. Que votre amour grandisse chaque jour un peu plus."],
    ["Félicitations", "Félicitations Zakariae et Imane ! Que cette belle histoire dure toute la vie."],
    ["بالعربية", "بارك الله لكما وبارك عليكما وجمع بينكما في خير. ألف مبروك!"]
  ];
  ideas.forEach(function (idea) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = idea[0];
    b.addEventListener("click", function () { wtext.value = idea[1]; $("wcount").textContent = String(idea[1].length); wtext.focus(); });
    $("chips").appendChild(b);
  });
  wtext.addEventListener("input", function () { $("wcount").textContent = String(wtext.value.length); });

  function render(comments) {
    list.textContent = "";
    var h = document.createElement("h3");
    h.textContent = "Vos vœux";
    list.appendChild(h);
    if (!comments.length) {
      var e = document.createElement("p");
      e.className = "empty";
      e.textContent = "Soyez le premier à laisser un mot aux mariés.";
      list.appendChild(e);
      return;
    }
    comments.forEach(function (c) {
      var card = document.createElement("div"); card.className = "wish";
      var q = document.createElement("q"); q.textContent = c.message;
      var by = document.createElement("span"); by.className = "by"; by.textContent = c.name + " ";
      var d = document.createElement("small");
      d.textContent = "· " + new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      by.appendChild(d);
      card.appendChild(q); card.appendChild(by);
      list.appendChild(card);
    });
  }
  function load() {
    return fetch(API + "?select=name,message,created_at&order=created_at.desc", { headers: headers })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () { werr.textContent = "Impossible de charger les messages pour le moment."; });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.website.value) return; // robot
    var n = wname.value.trim(), t = wtext.value.trim();
    if (!n) { werr.textContent = "Indiquez votre nom."; wname.focus(); return; }
    if (t.length < 2) { werr.textContent = "Écrivez quelques mots pour les mariés."; wtext.focus(); return; }
    werr.textContent = "";
    var btn = $("wsubmit");
    btn.disabled = true;
    fetch(API, { method: "POST", headers: Object.assign({ Prefer: "return=minimal" }, headers), body: JSON.stringify({ name: n, message: t }) })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        wtext.value = ""; $("wcount").textContent = "0";
        toast("Merci ! Vos vœux sont publiés · شكراً");
        return load();
      })
      .catch(function () { werr.textContent = "Erreur lors de l'envoi, veuillez réessayer."; })
      .finally(function () { btn.disabled = false; });
  });
  load();
  setInterval(load, 30000); // actualise les messages toutes les 30 s
})();
