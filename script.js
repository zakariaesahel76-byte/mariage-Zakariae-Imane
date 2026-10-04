(function () {
  var W = window.WEDDING;
  var TITLE = "Mariage de Zakariae & Imane";

  // ---------- Apparition des sections au défilement ----------
  var revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealed.forEach(function (el) { observer.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add("visible"); });
  }

  // ---------- Compte à rebours ----------
  var target = new Date(W.date + "T" + (W.time || "00:00") + ":00");
  var cd = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    minutes: document.getElementById("cd-minutes"),
    seconds: document.getElementById("cd-seconds")
  };

  function tick() {
    var diff = target - new Date();
    if (diff <= 0) {
      document.getElementById("countdown").hidden = true;
      document.getElementById("countdown-done").hidden = false;
      return;
    }
    var s = Math.floor(diff / 1000);
    cd.days.textContent = Math.floor(s / 86400);
    cd.hours.textContent = Math.floor((s % 86400) / 3600);
    cd.minutes.textContent = Math.floor((s % 3600) / 60);
    cd.seconds.textContent = s % 60;
    setTimeout(tick, 1000);
  }
  tick();

  // ---------- Lieu ----------
  var v = W.venue;
  function show(id, text) {
    var el = document.getElementById(id);
    if (text) { el.textContent = text; el.hidden = false; }
  }
  show("venue-name", v.name);
  show("venue-address", v.address);
  if (W.time) show("venue-time", "À partir de " + W.time.replace(":", "h"));
  document.getElementById("btn-maps").href = v.mapsUrl;
  if (v.wazeUrl) {
    var waze = document.getElementById("btn-waze");
    waze.href = v.wazeUrl;
    waze.hidden = false;
  }

  // ---------- Ajout à l'agenda ----------
  var ymd = W.date.replace(/-/g, "");
  var start, end;
  if (W.time) {
    start = ymd + "T" + W.time.replace(":", "") + "00";
    var e = new Date(target.getTime() + 6 * 3600 * 1000); // durée indicative : 6 h
    end = e.getFullYear() + pad(e.getMonth() + 1) + pad(e.getDate()) + "T" + pad(e.getHours()) + pad(e.getMinutes()) + "00";
  } else {
    start = ymd;
    var next = new Date(target.getTime() + 86400000);
    end = next.getFullYear() + pad(next.getMonth() + 1) + pad(next.getDate());
  }
  var place = [v.name, v.address].filter(Boolean).join(", ") || v.mapsUrl;

  document.getElementById("btn-gcal").href =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(TITLE) +
    "&dates=" + start + "/" + end +
    "&location=" + encodeURIComponent(place) +
    "&details=" + encodeURIComponent(window.location.href);

  var dateProp = W.time ? "" : ";VALUE=DATE";
  var ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//mariage//FR", "BEGIN:VEVENT",
    "UID:mariage-zakariae-imane-" + ymd,
    "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
    "DTSTART" + dateProp + ":" + start,
    "DTEND" + dateProp + ":" + end,
    "SUMMARY:" + TITLE,
    "LOCATION:" + place.replace(/,/g, "\\,"),
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  document.getElementById("btn-ics").href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);

  function pad(n) { return String(n).padStart(2, "0"); }

  // ---------- Musique ----------
  var musicId = W.music && W.music.youtubeId;
  var toggle = document.getElementById("music-toggle");
  var player, playerReady = false, wantPlay = false, playing = false;

  if (musicId) {
    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player("yt-player", {
        width: 1,
        height: 1,
        videoId: musicId,
        playerVars: { controls: 0, loop: 1, playlist: musicId, playsinline: 1 },
        events: {
          onReady: function () {
            playerReady = true;
            if (wantPlay) player.playVideo();
          },
          onStateChange: function (e) {
            playing = e.data === YT.PlayerState.PLAYING;
            toggle.classList.toggle("playing", playing);
            toggle.classList.toggle("paused", !playing);
            toggle.setAttribute("aria-label", playing ? "Couper la musique" : "Lancer la musique");
          }
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
    toggle.hidden = false;
    if (playerReady) player.playVideo();
  }

  toggle.addEventListener("click", function () {
    if (!playerReady) return;
    if (playing) { wantPlay = false; player.pauseVideo(); }
    else playMusic();
  });

  // ---------- Défilement automatique jusqu'au livre d'or ----------
  var autoScrolling = false;

  function autoScroll() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // offsetTop ignore le décalage de l'animation d'apparition
    var stopAt = Math.min(
      document.getElementById("livre-dor").offsetTop - 20,
      document.documentElement.scrollHeight - window.innerHeight
    );
    var pos = window.scrollY;
    var last = null;
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
      if (e.target.closest && e.target.closest("#music-toggle")) return;
      autoScrolling = false;
    }, { passive: true });
  });

  document.getElementById("btn-open").addEventListener("click", function () {
    playMusic();
    this.hidden = true;
    autoScroll();
  });

  // ---------- Livre d'or ----------
  var API = W.supabaseUrl + "/rest/v1/comments";
  var headers = { apikey: W.supabaseKey, "Content-Type": "application/json" };
  var list = document.getElementById("comments");
  var form = document.getElementById("comment-form");
  var status = document.getElementById("form-status");

  function render(comments) {
    list.innerHTML = "";
    if (!comments.length) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "Soyez le premier à laisser un message ! · كونوا أول من يكتب";
      list.appendChild(empty);
      return;
    }
    comments.forEach(function (c) {
      var li = document.createElement("li");
      var name = document.createElement("span");
      name.className = "c-name";
      name.textContent = c.name;
      var date = document.createElement("span");
      date.className = "c-date";
      date.textContent = " · " + new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      var msg = document.createElement("p");
      msg.className = "c-msg";
      msg.textContent = c.message;
      li.append(name, date, msg);
      list.appendChild(li);
    });
  }

  function load() {
    return fetch(API + "?select=name,message,created_at&order=created_at.desc", { headers: headers })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () { status.textContent = "Impossible de charger les messages pour le moment."; });
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (form.website.value) return; // robot
    var name = form.name.value.trim();
    var message = form.message.value.trim();
    if (!name || !message) return;

    var btn = form.querySelector("button");
    btn.disabled = true;
    status.textContent = "Envoi…";

    fetch(API, {
      method: "POST",
      headers: Object.assign({ Prefer: "return=minimal" }, headers),
      body: JSON.stringify({ name: name, message: message })
    })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        status.textContent = "Merci pour votre message ! · شكراً على كلمتكم";
        return load();
      })
      .catch(function () { status.textContent = "Erreur lors de l'envoi, veuillez réessayer."; })
      .finally(function () { btn.disabled = false; });
  });

  load();
  setInterval(load, 30000); // actualise les messages toutes les 30 s
})();
