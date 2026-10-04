// Informations du mariage — modifier ici, le reste du site s'adapte.
window.WEDDING = {
  // Date au format AAAA-MM-JJ
  date: "2026-10-26",
  // Heure au format HH:MM (laisser "" si non définie)
  time: "21:30",

  venue: {
    name: "",      // ex. "Salle Al Andalous"
    address: "",   // ex. "12 rue ..., Casablanca"
    mapsUrl: "https://maps.app.goo.gl/vK9fbtkw9pfB59mi9",
    wazeUrl: ""    // ex. "https://waze.com/ul?q=..." (bouton masqué si vide)
  },

  // Musique : identifiant de la vidéo YouTube (laisser "" pour désactiver)
  music: { youtubeId: "LZRnvEEgAW0" },

  // Vitesse du défilement automatique jusqu'au livre d'or (pixels par seconde)
  autoScrollSpeed: 50,

  // Base des commentaires (clé publique, peut être visible)
  supabaseUrl: "https://siiyfsfkaoyxcdbfotof.supabase.co",
  supabaseKey: "sb_publishable_D5vpJ3KR0FfkExdlUG8kNA_YuVz4IOR"
};
