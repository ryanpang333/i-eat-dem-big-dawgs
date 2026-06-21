// ── LANGUAGES / TRANSLATION ─────────────────────────────────────────────────
// Lets the user pick a language; then walks the page and swaps English text for
// the chosen language. New text added later (pet cards, pop-ups) is caught by a
// MutationObserver. Anything not in the dictionary stays in English.
// Pet names, owner names, breeds and places are NEVER translated.
(function () {
  const LANG_KEY = 'pawfinder_lang';

  const LANGS = [
    { code: 'en',    name: 'English',     flag: '🇬🇧' },
    { code: 'es',    name: 'Español',     flag: '🇪🇸' },
    { code: 'fr',    name: 'Français',    flag: '🇫🇷' },
    { code: 'de',    name: 'Deutsch',     flag: '🇩🇪' },
    { code: 'pt',    name: 'Português',   flag: '🇵🇹' },
    { code: 'it',    name: 'Italiano',    flag: '🇮🇹' },
    { code: 'nl',    name: 'Nederlands',  flag: '🇳🇱' },
    { code: 'pl',    name: 'Polski',      flag: '🇵🇱' },
    { code: 'tr',    name: 'Türkçe',      flag: '🇹🇷' },
    { code: 'ru',    name: 'Русский',     flag: '🇷🇺' },
    { code: 'ar',    name: 'العربية',     flag: '🇸🇦' },
    { code: 'hi',    name: 'हिन्दी',       flag: '🇮🇳' },
    { code: 'id',    name: 'Indonesia',   flag: '🇮🇩' },
    { code: 'ko',    name: '한국어',       flag: '🇰🇷' },
    { code: 'zh',    name: '简体中文',     flag: '🇨🇳' },
    { code: 'zh-TW', name: '繁體中文',     flag: '🇹🇼' },
    { code: 'ja',    name: '日本語',       flag: '🇯🇵' },
  ];

  // English source text → translation.
  const DICT = {
    es: {
      'Home':'Inicio','Lost a Pet':'Perdí una mascota','Found a Pet':'Encontré una mascota','Browse':'Explorar','Tips':'Consejos','Success Stories':'Historias de éxito','Map':'Mapa','📊 Stats':'📊 Estadísticas','🎮 Bored?':'🎮 ¿Aburrido?','About':'Acerca de','Contact':'Contacto',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Ayudando a las familias a reunirse con sus mascotas perdidas, un vecindario a la vez.','🔴 I Lost a Pet':'🔴 Perdí una mascota','🟢 I Found a Pet':'🟢 Encontré una mascota','Recently Lost Pets':'Mascotas perdidas recientemente','pets reunited so far!':'¡mascotas reunidas hasta ahora!','⭐ Success Story':'⭐ Historia de éxito','See all success stories →':'Ver todas las historias de éxito →',
      '📋 Copy Phone':'📋 Copiar teléfono','📋 Copy Email':'📋 Copiar correo','🔗 Copy Link':'🔗 Copiar enlace','🖨️ Print Flyer':'🖨️ Imprimir cartel','🔍 Details':'🔍 Detalles','🎉 Reunited!':'🎉 ¡Reunido!','🔒 Show Phone':'🔒 Mostrar teléfono','🔒 Show Email':'🔒 Mostrar correo','👁 Spotted':'👁 Avistado',
      'Contact:':'Contacto:','Animal:':'Animal:','Color:':'Color:','Age:':'Edad:','Size:':'Tamaño:','Date:':'Fecha:','Special:':'Especial:','Last seen:':'Visto por última vez:','Found at:':'Encontrado en:',
      'LOST':'PERDIDO','FOUND':'ENCONTRADO','🎉 REUNITED!':'🎉 ¡REUNIDO!','💰 REWARD OFFERED':'💰 RECOMPENSA OFRECIDA','Reward offered!':'¡Recompensa ofrecida!','Phone hidden by poster':'Teléfono oculto por el autor','No contact info provided':'No se proporcionó información de contacto','📍 See on map':'📍 Ver en el mapa','No Photo':'Sin foto','🚨 URGENT — Missing over a week!':'🚨 URGENTE — ¡Desaparecido hace más de una semana!',
      'Dog':'Perro','Cat':'Gato','Rabbit':'Conejo','Bird':'Pájaro','Hamster':'Hámster','Other':'Otro','Small':'Pequeño','Medium':'Mediano','Large':'Grande',
      'Black':'Negro','White':'Blanco','Golden':'Dorado','Brown':'Marrón','Grey':'Gris','Orange':'Naranja','Cream':'Crema','Calico':'Tricolor','Silver':'Plateado','Fawn':'Beige',
      '6 months':'6 meses','1 year':'1 año','2 years':'2 años','3 years':'3 años','4 years':'4 años','5 years':'5 años','6 years':'6 años','7 years':'7 años','8 years':'8 años','10 years':'10 años','Senior (10+)':'Adulto mayor (10+)','Young puppy':'Cachorro','Kitten':'Gatito','Adult':'Adulto',
      'Sign in to help reunite lost pets.':'Inicia sesión para ayudar a reunir mascotas perdidas.','Log In':'Iniciar sesión','Sign Up':'Registrarse','Username':'Usuario','Password':'Contraseña','Create Account →':'Crear cuenta →','Log In →':'Iniciar sesión →','Continue →':'Continuar →','Browse Lost & Found Pets':'Explorar mascotas perdidas y encontradas','Loading...':'Cargando...','Contact Us':'Contáctanos',
    },
    fr: {
      'Home':'Accueil','Lost a Pet':'Animal perdu','Found a Pet':'Animal trouvé','Browse':'Parcourir','Tips':'Conseils','Success Stories':'Histoires de réussite','Map':'Carte','📊 Stats':'📊 Statistiques','🎮 Bored?':'🎮 Ennuyé ?','About':'À propos','Contact':'Contact',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Aider les familles à retrouver leurs animaux perdus, un quartier à la fois.','🔴 I Lost a Pet':'🔴 J\'ai perdu un animal','🟢 I Found a Pet':'🟢 J\'ai trouvé un animal','Recently Lost Pets':'Animaux récemment perdus','pets reunited so far!':'animaux réunis jusqu\'à présent !','⭐ Success Story':'⭐ Histoire de réussite','See all success stories →':'Voir toutes les histoires de réussite →',
      '📋 Copy Phone':'📋 Copier le téléphone','📋 Copy Email':'📋 Copier l\'e-mail','🔗 Copy Link':'🔗 Copier le lien','🖨️ Print Flyer':'🖨️ Imprimer l\'affiche','🔍 Details':'🔍 Détails','🎉 Reunited!':'🎉 Réuni !','🔒 Show Phone':'🔒 Afficher le téléphone','🔒 Show Email':'🔒 Afficher l\'e-mail','👁 Spotted':'👁 Aperçu',
      'Contact:':'Contact :','Animal:':'Animal :','Color:':'Couleur :','Age:':'Âge :','Size:':'Taille :','Date:':'Date :','Special:':'Particularité :','Last seen:':'Vu pour la dernière fois :','Found at:':'Trouvé à :',
      'LOST':'PERDU','FOUND':'TROUVÉ','🎉 REUNITED!':'🎉 RÉUNI !','💰 REWARD OFFERED':'💰 RÉCOMPENSE OFFERTE','Reward offered!':'Récompense offerte !','Phone hidden by poster':'Téléphone masqué par l\'auteur','No contact info provided':'Aucune coordonnée fournie','📍 See on map':'📍 Voir sur la carte','No Photo':'Pas de photo','🚨 URGENT — Missing over a week!':'🚨 URGENT — Disparu depuis plus d\'une semaine !',
      'Dog':'Chien','Cat':'Chat','Rabbit':'Lapin','Bird':'Oiseau','Hamster':'Hamster','Other':'Autre','Small':'Petit','Medium':'Moyen','Large':'Grand',
      'Black':'Noir','White':'Blanc','Golden':'Doré','Brown':'Marron','Grey':'Gris','Orange':'Orange','Cream':'Crème','Calico':'Tricolore','Silver':'Argenté','Fawn':'Fauve',
      '6 months':'6 mois','1 year':'1 an','2 years':'2 ans','3 years':'3 ans','4 years':'4 ans','5 years':'5 ans','6 years':'6 ans','7 years':'7 ans','8 years':'8 ans','10 years':'10 ans','Senior (10+)':'Senior (10+)','Young puppy':'Jeune chiot','Kitten':'Chaton','Adult':'Adulte',
      'Sign in to help reunite lost pets.':'Connectez-vous pour aider à réunir les animaux perdus.','Log In':'Se connecter','Sign Up':'S\'inscrire','Username':'Nom d\'utilisateur','Password':'Mot de passe','Create Account →':'Créer un compte →','Log In →':'Se connecter →','Continue →':'Continuer →','Browse Lost & Found Pets':'Parcourir les animaux perdus et trouvés','Loading...':'Chargement...','Contact Us':'Contactez-nous',
    },
    de: {
      'Home':'Startseite','Lost a Pet':'Haustier verloren','Found a Pet':'Haustier gefunden','Browse':'Durchsuchen','Tips':'Tipps','Success Stories':'Erfolgsgeschichten','Map':'Karte','📊 Stats':'📊 Statistiken','🎮 Bored?':'🎮 Gelangweilt?','About':'Über uns','Contact':'Kontakt',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Wir helfen Familien, ihre verlorenen Haustiere wiederzufinden – ein Viertel nach dem anderen.','🔴 I Lost a Pet':'🔴 Haustier verloren','🟢 I Found a Pet':'🟢 Haustier gefunden','Recently Lost Pets':'Kürzlich verlorene Haustiere','pets reunited so far!':'Haustiere bisher wiedervereint!','⭐ Success Story':'⭐ Erfolgsgeschichte','See all success stories →':'Alle Erfolgsgeschichten ansehen →',
      '📋 Copy Phone':'📋 Telefon kopieren','📋 Copy Email':'📋 E-Mail kopieren','🔗 Copy Link':'🔗 Link kopieren','🖨️ Print Flyer':'🖨️ Steckbrief drucken','🔍 Details':'🔍 Details','🎉 Reunited!':'🎉 Wiedervereint!','🔒 Show Phone':'🔒 Telefon anzeigen','🔒 Show Email':'🔒 E-Mail anzeigen','👁 Spotted':'👁 Gesichtet',
      'Contact:':'Kontakt:','Animal:':'Tier:','Color:':'Farbe:','Age:':'Alter:','Size:':'Größe:','Date:':'Datum:','Special:':'Besonderheit:','Last seen:':'Zuletzt gesehen:','Found at:':'Gefunden bei:',
      'LOST':'VERMISST','FOUND':'GEFUNDEN','🎉 REUNITED!':'🎉 WIEDERVEREINT!','💰 REWARD OFFERED':'💰 BELOHNUNG ANGEBOTEN','Reward offered!':'Belohnung angeboten!','Phone hidden by poster':'Telefon vom Ersteller verborgen','No contact info provided':'Keine Kontaktdaten angegeben','📍 See on map':'📍 Auf Karte ansehen','No Photo':'Kein Foto','🚨 URGENT — Missing over a week!':'🚨 DRINGEND — Seit über einer Woche vermisst!',
      'Dog':'Hund','Cat':'Katze','Rabbit':'Kaninchen','Bird':'Vogel','Hamster':'Hamster','Other':'Andere','Small':'Klein','Medium':'Mittel','Large':'Groß',
      'Black':'Schwarz','White':'Weiß','Golden':'Goldfarben','Brown':'Braun','Grey':'Grau','Orange':'Orange','Cream':'Cremefarben','Calico':'Dreifarbig','Silver':'Silber','Fawn':'Rehbraun',
      '6 months':'6 Monate','1 year':'1 Jahr','2 years':'2 Jahre','3 years':'3 Jahre','4 years':'4 Jahre','5 years':'5 Jahre','6 years':'6 Jahre','7 years':'7 Jahre','8 years':'8 Jahre','10 years':'10 Jahre','Senior (10+)':'Senior (10+)','Young puppy':'Junger Welpe','Kitten':'Kätzchen','Adult':'Erwachsen',
      'Sign in to help reunite lost pets.':'Melde dich an, um verlorene Haustiere wiederzuvereinen.','Log In':'Anmelden','Sign Up':'Registrieren','Username':'Benutzername','Password':'Passwort','Create Account →':'Konto erstellen →','Log In →':'Anmelden →','Continue →':'Weiter →','Browse Lost & Found Pets':'Verlorene & gefundene Haustiere durchsuchen','Loading...':'Wird geladen...','Contact Us':'Kontaktiere uns',
    },
    pt: {
      'Home':'Início','Lost a Pet':'Perdi um animal','Found a Pet':'Encontrei um animal','Browse':'Explorar','Tips':'Dicas','Success Stories':'Histórias de sucesso','Map':'Mapa','📊 Stats':'📊 Estatísticas','🎮 Bored?':'🎮 Entediado?','About':'Sobre','Contact':'Contato',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Ajudando famílias a reencontrar seus animais perdidos, um bairro de cada vez.','🔴 I Lost a Pet':'🔴 Perdi um animal','🟢 I Found a Pet':'🟢 Encontrei um animal','Recently Lost Pets':'Animais perdidos recentemente','pets reunited so far!':'animais reunidos até agora!','⭐ Success Story':'⭐ História de sucesso','See all success stories →':'Ver todas as histórias de sucesso →',
      '📋 Copy Phone':'📋 Copiar telefone','📋 Copy Email':'📋 Copiar e-mail','🔗 Copy Link':'🔗 Copiar link','🖨️ Print Flyer':'🖨️ Imprimir cartaz','🔍 Details':'🔍 Detalhes','🎉 Reunited!':'🎉 Reunido!','🔒 Show Phone':'🔒 Mostrar telefone','🔒 Show Email':'🔒 Mostrar e-mail','👁 Spotted':'👁 Avistado',
      'Contact:':'Contato:','Animal:':'Animal:','Color:':'Cor:','Age:':'Idade:','Size:':'Tamanho:','Date:':'Data:','Special:':'Especial:','Last seen:':'Visto pela última vez:','Found at:':'Encontrado em:',
      'LOST':'PERDIDO','FOUND':'ENCONTRADO','🎉 REUNITED!':'🎉 REUNIDO!','💰 REWARD OFFERED':'💰 RECOMPENSA OFERECIDA','Reward offered!':'Recompensa oferecida!','Phone hidden by poster':'Telefone ocultado pelo autor','No contact info provided':'Nenhuma informação de contato fornecida','📍 See on map':'📍 Ver no mapa','No Photo':'Sem foto','🚨 URGENT — Missing over a week!':'🚨 URGENTE — Desaparecido há mais de uma semana!',
      'Dog':'Cachorro','Cat':'Gato','Rabbit':'Coelho','Bird':'Pássaro','Hamster':'Hamster','Other':'Outro','Small':'Pequeno','Medium':'Médio','Large':'Grande',
      'Black':'Preto','White':'Branco','Golden':'Dourado','Brown':'Marrom','Grey':'Cinza','Orange':'Laranja','Cream':'Creme','Calico':'Tricolor','Silver':'Prateado','Fawn':'Bege',
      '6 months':'6 meses','1 year':'1 ano','2 years':'2 anos','3 years':'3 anos','4 years':'4 anos','5 years':'5 anos','6 years':'6 anos','7 years':'7 anos','8 years':'8 anos','10 years':'10 anos','Senior (10+)':'Idoso (10+)','Young puppy':'Filhote','Kitten':'Gatinho','Adult':'Adulto',
      'Sign in to help reunite lost pets.':'Entre para ajudar a reunir animais perdidos.','Log In':'Entrar','Sign Up':'Cadastrar','Username':'Usuário','Password':'Senha','Create Account →':'Criar conta →','Log In →':'Entrar →','Continue →':'Continuar →','Browse Lost & Found Pets':'Explorar animais perdidos e encontrados','Loading...':'Carregando...','Contact Us':'Fale conosco',
    },
    it: {
      'Home':'Home','Lost a Pet':'Animale smarrito','Found a Pet':'Animale trovato','Browse':'Sfoglia','Tips':'Consigli','Success Stories':'Storie di successo','Map':'Mappa','📊 Stats':'📊 Statistiche','🎮 Bored?':'🎮 Annoiato?','About':'Chi siamo','Contact':'Contatti',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Aiutiamo le famiglie a ritrovare i loro animali smarriti, un quartiere alla volta.','🔴 I Lost a Pet':'🔴 Ho smarrito un animale','🟢 I Found a Pet':'🟢 Ho trovato un animale','Recently Lost Pets':'Animali smarriti di recente','pets reunited so far!':'animali riuniti finora!','⭐ Success Story':'⭐ Storia di successo','See all success stories →':'Vedi tutte le storie di successo →',
      '📋 Copy Phone':'📋 Copia telefono','📋 Copy Email':'📋 Copia email','🔗 Copy Link':'🔗 Copia link','🖨️ Print Flyer':'🖨️ Stampa volantino','🔍 Details':'🔍 Dettagli','🎉 Reunited!':'🎉 Riunito!','🔒 Show Phone':'🔒 Mostra telefono','🔒 Show Email':'🔒 Mostra email','👁 Spotted':'👁 Avvistato',
      'Contact:':'Contatto:','Animal:':'Animale:','Color:':'Colore:','Age:':'Età:','Size:':'Taglia:','Date:':'Data:','Special:':'Speciale:','Last seen:':'Visto l\'ultima volta:','Found at:':'Trovato a:',
      'LOST':'SMARRITO','FOUND':'TROVATO','🎉 REUNITED!':'🎉 RIUNITO!','💰 REWARD OFFERED':'💰 RICOMPENSA OFFERTA','Reward offered!':'Ricompensa offerta!','Phone hidden by poster':'Telefono nascosto dall\'autore','No contact info provided':'Nessun contatto fornito','📍 See on map':'📍 Vedi sulla mappa','No Photo':'Nessuna foto','🚨 URGENT — Missing over a week!':'🚨 URGENTE — Scomparso da oltre una settimana!',
      'Dog':'Cane','Cat':'Gatto','Rabbit':'Coniglio','Bird':'Uccello','Hamster':'Criceto','Other':'Altro','Small':'Piccolo','Medium':'Medio','Large':'Grande',
      'Black':'Nero','White':'Bianco','Golden':'Dorato','Brown':'Marrone','Grey':'Grigio','Orange':'Arancione','Cream':'Crema','Calico':'Tricolore','Silver':'Argento','Fawn':'Fulvo',
      '6 months':'6 mesi','1 year':'1 anno','2 years':'2 anni','3 years':'3 anni','4 years':'4 anni','5 years':'5 anni','6 years':'6 anni','7 years':'7 anni','8 years':'8 anni','10 years':'10 anni','Senior (10+)':'Anziano (10+)','Young puppy':'Cucciolo','Kitten':'Gattino','Adult':'Adulto',
      'Sign in to help reunite lost pets.':'Accedi per aiutare a riunire gli animali smarriti.','Log In':'Accedi','Sign Up':'Registrati','Username':'Nome utente','Password':'Password','Create Account →':'Crea account →','Log In →':'Accedi →','Continue →':'Continua →','Browse Lost & Found Pets':'Sfoglia animali smarriti e trovati','Loading...':'Caricamento...','Contact Us':'Contattaci',
    },
    nl: {
      'Home':'Home','Lost a Pet':'Huisdier verloren','Found a Pet':'Huisdier gevonden','Browse':'Bladeren','Tips':'Tips','Success Stories':'Succesverhalen','Map':'Kaart','📊 Stats':'📊 Statistieken','🎮 Bored?':'🎮 Verveeld?','About':'Over','Contact':'Contact',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Gezinnen helpen herenigd te worden met hun verloren huisdieren — één buurt tegelijk.','🔴 I Lost a Pet':'🔴 Ik ben een huisdier kwijt','🟢 I Found a Pet':'🟢 Ik heb een huisdier gevonden','Recently Lost Pets':'Onlangs verloren huisdieren','pets reunited so far!':'huisdieren tot nu toe herenigd!','⭐ Success Story':'⭐ Succesverhaal','See all success stories →':'Bekijk alle succesverhalen →',
      '📋 Copy Phone':'📋 Telefoon kopiëren','📋 Copy Email':'📋 E-mail kopiëren','🔗 Copy Link':'🔗 Link kopiëren','🖨️ Print Flyer':'🖨️ Flyer afdrukken','🔍 Details':'🔍 Details','🎉 Reunited!':'🎉 Herenigd!','🔒 Show Phone':'🔒 Telefoon tonen','🔒 Show Email':'🔒 E-mail tonen','👁 Spotted':'👁 Gezien',
      'Contact:':'Contact:','Animal:':'Dier:','Color:':'Kleur:','Age:':'Leeftijd:','Size:':'Grootte:','Date:':'Datum:','Special:':'Bijzonder:','Last seen:':'Laatst gezien:','Found at:':'Gevonden bij:',
      'LOST':'VERMIST','FOUND':'GEVONDEN','🎉 REUNITED!':'🎉 HERENIGD!','💰 REWARD OFFERED':'💰 BELONING AANGEBODEN','Reward offered!':'Beloning aangeboden!','Phone hidden by poster':'Telefoon verborgen door plaatser','No contact info provided':'Geen contactgegevens opgegeven','📍 See on map':'📍 Bekijk op kaart','No Photo':'Geen foto','🚨 URGENT — Missing over a week!':'🚨 DRINGEND — Meer dan een week vermist!',
      'Dog':'Hond','Cat':'Kat','Rabbit':'Konijn','Bird':'Vogel','Hamster':'Hamster','Other':'Anders','Small':'Klein','Medium':'Middel','Large':'Groot',
      'Black':'Zwart','White':'Wit','Golden':'Goudkleurig','Brown':'Bruin','Grey':'Grijs','Orange':'Oranje','Cream':'Crème','Calico':'Lapjeskat','Silver':'Zilver','Fawn':'Reekleurig',
      '6 months':'6 maanden','1 year':'1 jaar','2 years':'2 jaar','3 years':'3 jaar','4 years':'4 jaar','5 years':'5 jaar','6 years':'6 jaar','7 years':'7 jaar','8 years':'8 jaar','10 years':'10 jaar','Senior (10+)':'Senior (10+)','Young puppy':'Jonge pup','Kitten':'Kitten','Adult':'Volwassen',
      'Sign in to help reunite lost pets.':'Log in om verloren huisdieren te helpen herenigen.','Log In':'Inloggen','Sign Up':'Registreren','Username':'Gebruikersnaam','Password':'Wachtwoord','Create Account →':'Account aanmaken →','Log In →':'Inloggen →','Continue →':'Doorgaan →','Browse Lost & Found Pets':'Verloren & gevonden huisdieren bekijken','Loading...':'Laden...','Contact Us':'Neem contact op',
    },
    pl: {
      'Home':'Strona główna','Lost a Pet':'Zgubiony zwierzak','Found a Pet':'Znaleziony zwierzak','Browse':'Przeglądaj','Tips':'Porady','Success Stories':'Historie sukcesu','Map':'Mapa','📊 Stats':'📊 Statystyki','🎮 Bored?':'🎮 Nudzi ci się?','About':'O nas','Contact':'Kontakt',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Pomagamy rodzinom odnaleźć zaginione zwierzęta — dzielnica po dzielnicy.','🔴 I Lost a Pet':'🔴 Zgubiłem zwierzaka','🟢 I Found a Pet':'🟢 Znalazłem zwierzaka','Recently Lost Pets':'Ostatnio zgubione zwierzęta','pets reunited so far!':'zwierząt do tej pory połączonych!','⭐ Success Story':'⭐ Historia sukcesu','See all success stories →':'Zobacz wszystkie historie sukcesu →',
      '📋 Copy Phone':'📋 Kopiuj telefon','📋 Copy Email':'📋 Kopiuj e-mail','🔗 Copy Link':'🔗 Kopiuj link','🖨️ Print Flyer':'🖨️ Drukuj ulotkę','🔍 Details':'🔍 Szczegóły','🎉 Reunited!':'🎉 Połączony!','🔒 Show Phone':'🔒 Pokaż telefon','🔒 Show Email':'🔒 Pokaż e-mail','👁 Spotted':'👁 Zauważony',
      'Contact:':'Kontakt:','Animal:':'Zwierzę:','Color:':'Kolor:','Age:':'Wiek:','Size:':'Rozmiar:','Date:':'Data:','Special:':'Cechy szczególne:','Last seen:':'Ostatnio widziany:','Found at:':'Znaleziony w:',
      'LOST':'ZGUBIONY','FOUND':'ZNALEZIONY','🎉 REUNITED!':'🎉 POŁĄCZONY!','💰 REWARD OFFERED':'💰 NAGRODA','Reward offered!':'Oferowana nagroda!','Phone hidden by poster':'Telefon ukryty przez autora','No contact info provided':'Nie podano danych kontaktowych','📍 See on map':'📍 Zobacz na mapie','No Photo':'Brak zdjęcia','🚨 URGENT — Missing over a week!':'🚨 PILNE — Zaginiony od ponad tygodnia!',
      'Dog':'Pies','Cat':'Kot','Rabbit':'Królik','Bird':'Ptak','Hamster':'Chomik','Other':'Inne','Small':'Mały','Medium':'Średni','Large':'Duży',
      'Black':'Czarny','White':'Biały','Golden':'Złoty','Brown':'Brązowy','Grey':'Szary','Orange':'Pomarańczowy','Cream':'Kremowy','Calico':'Trójkolorowy','Silver':'Srebrny','Fawn':'Płowy',
      '6 months':'6 miesięcy','1 year':'1 rok','2 years':'2 lata','3 years':'3 lata','4 years':'4 lata','5 years':'5 lat','6 years':'6 lat','7 years':'7 lat','8 years':'8 lat','10 years':'10 lat','Senior (10+)':'Senior (10+)','Young puppy':'Szczeniak','Kitten':'Kociak','Adult':'Dorosły',
      'Sign in to help reunite lost pets.':'Zaloguj się, aby pomóc łączyć zaginione zwierzęta.','Log In':'Zaloguj się','Sign Up':'Zarejestruj się','Username':'Nazwa użytkownika','Password':'Hasło','Create Account →':'Utwórz konto →','Log In →':'Zaloguj się →','Continue →':'Kontynuuj →','Browse Lost & Found Pets':'Przeglądaj zgubione i znalezione zwierzęta','Loading...':'Ładowanie...','Contact Us':'Skontaktuj się z nami',
    },
    tr: {
      'Home':'Ana sayfa','Lost a Pet':'Kayıp evcil hayvan','Found a Pet':'Bulunan evcil hayvan','Browse':'Gözat','Tips':'İpuçları','Success Stories':'Başarı hikayeleri','Map':'Harita','📊 Stats':'📊 İstatistikler','🎮 Bored?':'🎮 Sıkıldın mı?','About':'Hakkında','Contact':'İletişim',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Ailelerin kayıp evcil hayvanlarına kavuşmasına yardımcı oluyoruz — mahalle mahalle.','🔴 I Lost a Pet':'🔴 Evcil hayvanımı kaybettim','🟢 I Found a Pet':'🟢 Bir evcil hayvan buldum','Recently Lost Pets':'Son kaybolan evcil hayvanlar','pets reunited so far!':'evcil hayvan şu ana kadar kavuştu!','⭐ Success Story':'⭐ Başarı hikayesi','See all success stories →':'Tüm başarı hikayelerini gör →',
      '📋 Copy Phone':'📋 Telefonu kopyala','📋 Copy Email':'📋 E-postayı kopyala','🔗 Copy Link':'🔗 Bağlantıyı kopyala','🖨️ Print Flyer':'🖨️ Afiş yazdır','🔍 Details':'🔍 Ayrıntılar','🎉 Reunited!':'🎉 Kavuştu!','🔒 Show Phone':'🔒 Telefonu göster','🔒 Show Email':'🔒 E-postayı göster','👁 Spotted':'👁 Görüldü',
      'Contact:':'İletişim:','Animal:':'Hayvan:','Color:':'Renk:','Age:':'Yaş:','Size:':'Boyut:','Date:':'Tarih:','Special:':'Özellik:','Last seen:':'Son görülme:','Found at:':'Bulunduğu yer:',
      'LOST':'KAYIP','FOUND':'BULUNDU','🎉 REUNITED!':'🎉 KAVUŞTU!','💰 REWARD OFFERED':'💰 ÖDÜL VAR','Reward offered!':'Ödül veriliyor!','Phone hidden by poster':'Telefon paylaşan tarafından gizlendi','No contact info provided':'İletişim bilgisi verilmedi','📍 See on map':'📍 Haritada gör','No Photo':'Fotoğraf yok','🚨 URGENT — Missing over a week!':'🚨 ACİL — Bir haftadan fazla süredir kayıp!',
      'Dog':'Köpek','Cat':'Kedi','Rabbit':'Tavşan','Bird':'Kuş','Hamster':'Hamster','Other':'Diğer','Small':'Küçük','Medium':'Orta','Large':'Büyük',
      'Black':'Siyah','White':'Beyaz','Golden':'Altın sarısı','Brown':'Kahverengi','Grey':'Gri','Orange':'Turuncu','Cream':'Krem','Calico':'Üç renkli','Silver':'Gümüş','Fawn':'Açık kahve',
      '6 months':'6 aylık','1 year':'1 yaşında','2 years':'2 yaşında','3 years':'3 yaşında','4 years':'4 yaşında','5 years':'5 yaşında','6 years':'6 yaşında','7 years':'7 yaşında','8 years':'8 yaşında','10 years':'10 yaşında','Senior (10+)':'Yaşlı (10+)','Young puppy':'Yavru köpek','Kitten':'Yavru kedi','Adult':'Yetişkin',
      'Sign in to help reunite lost pets.':'Kayıp evcil hayvanları kavuşturmaya yardım etmek için giriş yap.','Log In':'Giriş yap','Sign Up':'Kayıt ol','Username':'Kullanıcı adı','Password':'Şifre','Create Account →':'Hesap oluştur →','Log In →':'Giriş yap →','Continue →':'Devam →','Browse Lost & Found Pets':'Kayıp ve bulunan evcil hayvanlara gözat','Loading...':'Yükleniyor...','Contact Us':'Bize ulaşın',
    },
    ru: {
      'Home':'Главная','Lost a Pet':'Потерял питомца','Found a Pet':'Нашёл питомца','Browse':'Обзор','Tips':'Советы','Success Stories':'Истории успеха','Map':'Карта','📊 Stats':'📊 Статистика','🎮 Bored?':'🎮 Скучно?','About':'О нас','Contact':'Контакты',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Помогаем семьям воссоединиться с потерянными питомцами — район за районом.','🔴 I Lost a Pet':'🔴 Я потерял питомца','🟢 I Found a Pet':'🟢 Я нашёл питомца','Recently Lost Pets':'Недавно потерянные питомцы','pets reunited so far!':'питомцев воссоединено!','⭐ Success Story':'⭐ История успеха','See all success stories →':'Смотреть все истории успеха →',
      '📋 Copy Phone':'📋 Копировать телефон','📋 Copy Email':'📋 Копировать e-mail','🔗 Copy Link':'🔗 Копировать ссылку','🖨️ Print Flyer':'🖨️ Печать листовки','🔍 Details':'🔍 Подробнее','🎉 Reunited!':'🎉 Воссоединён!','🔒 Show Phone':'🔒 Показать телефон','🔒 Show Email':'🔒 Показать e-mail','👁 Spotted':'👁 Замечен',
      'Contact:':'Контакт:','Animal:':'Животное:','Color:':'Цвет:','Age:':'Возраст:','Size:':'Размер:','Date:':'Дата:','Special:':'Особые приметы:','Last seen:':'Последний раз видели:','Found at:':'Найден в:',
      'LOST':'ПОТЕРЯН','FOUND':'НАЙДЕН','🎉 REUNITED!':'🎉 ВОССОЕДИНЁН!','💰 REWARD OFFERED':'💰 ОБЕЩАНА НАГРАДА','Reward offered!':'Обещана награда!','Phone hidden by poster':'Телефон скрыт автором','No contact info provided':'Контакты не указаны','📍 See on map':'📍 Показать на карте','No Photo':'Нет фото','🚨 URGENT — Missing over a week!':'🚨 СРОЧНО — Пропал более недели назад!',
      'Dog':'Собака','Cat':'Кошка','Rabbit':'Кролик','Bird':'Птица','Hamster':'Хомяк','Other':'Другое','Small':'Маленький','Medium':'Средний','Large':'Большой',
      'Black':'Чёрный','White':'Белый','Golden':'Золотистый','Brown':'Коричневый','Grey':'Серый','Orange':'Рыжий','Cream':'Кремовый','Calico':'Трёхцветный','Silver':'Серебристый','Fawn':'Палевый',
      '6 months':'6 месяцев','1 year':'1 год','2 years':'2 года','3 years':'3 года','4 years':'4 года','5 years':'5 лет','6 years':'6 лет','7 years':'7 лет','8 years':'8 лет','10 years':'10 лет','Senior (10+)':'Пожилой (10+)','Young puppy':'Щенок','Kitten':'Котёнок','Adult':'Взрослый',
      'Sign in to help reunite lost pets.':'Войдите, чтобы помочь воссоединять потерянных питомцев.','Log In':'Войти','Sign Up':'Регистрация','Username':'Имя пользователя','Password':'Пароль','Create Account →':'Создать аккаунт →','Log In →':'Войти →','Continue →':'Продолжить →','Browse Lost & Found Pets':'Обзор потерянных и найденных питомцев','Loading...':'Загрузка...','Contact Us':'Свяжитесь с нами',
    },
    ar: {
      'Home':'الرئيسية','Lost a Pet':'حيوان مفقود','Found a Pet':'حيوان تم العثور عليه','Browse':'تصفح','Tips':'نصائح','Success Stories':'قصص نجاح','Map':'الخريطة','📊 Stats':'📊 إحصائيات','🎮 Bored?':'🎮 هل أنت ملول؟','About':'حول','Contact':'اتصل',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'نساعد العائلات على لمّ شملها مع حيواناتها المفقودة — حيًّا تلو الآخر.','🔴 I Lost a Pet':'🔴 فقدت حيوانًا أليفًا','🟢 I Found a Pet':'🟢 وجدت حيوانًا أليفًا','Recently Lost Pets':'حيوانات مفقودة مؤخرًا','pets reunited so far!':'حيوانًا تم لمّ شمله حتى الآن!','⭐ Success Story':'⭐ قصة نجاح','See all success stories →':'شاهد جميع قصص النجاح →',
      '📋 Copy Phone':'📋 نسخ الهاتف','📋 Copy Email':'📋 نسخ البريد','🔗 Copy Link':'🔗 نسخ الرابط','🖨️ Print Flyer':'🖨️ طباعة ملصق','🔍 Details':'🔍 التفاصيل','🎉 Reunited!':'🎉 تم لمّ الشمل!','🔒 Show Phone':'🔒 إظهار الهاتف','🔒 Show Email':'🔒 إظهار البريد','👁 Spotted':'👁 شوهد',
      'Contact:':'جهة الاتصال:','Animal:':'الحيوان:','Color:':'اللون:','Age:':'العمر:','Size:':'الحجم:','Date:':'التاريخ:','Special:':'مميزات:','Last seen:':'آخر مشاهدة:','Found at:':'تم العثور عليه في:',
      'LOST':'مفقود','FOUND':'تم العثور عليه','🎉 REUNITED!':'🎉 تم لمّ الشمل!','💰 REWARD OFFERED':'💰 توجد مكافأة','Reward offered!':'توجد مكافأة!','Phone hidden by poster':'الهاتف مخفي من قبل الناشر','No contact info provided':'لا توجد معلومات اتصال','📍 See on map':'📍 عرض على الخريطة','No Photo':'لا توجد صورة','🚨 URGENT — Missing over a week!':'🚨 عاجل — مفقود منذ أكثر من أسبوع!',
      'Dog':'كلب','Cat':'قطة','Rabbit':'أرنب','Bird':'طائر','Hamster':'هامستر','Other':'أخرى','Small':'صغير','Medium':'متوسط','Large':'كبير',
      'Black':'أسود','White':'أبيض','Golden':'ذهبي','Brown':'بني','Grey':'رمادي','Orange':'برتقالي','Cream':'كريمي','Calico':'ثلاثي الألوان','Silver':'فضي','Fawn':'بيج',
      '6 months':'6 أشهر','1 year':'سنة واحدة','2 years':'سنتان','3 years':'3 سنوات','4 years':'4 سنوات','5 years':'5 سنوات','6 years':'6 سنوات','7 years':'7 سنوات','8 years':'8 سنوات','10 years':'10 سنوات','Senior (10+)':'مسن (10+)','Young puppy':'جرو صغير','Kitten':'قطة صغيرة','Adult':'بالغ',
      'Sign in to help reunite lost pets.':'سجّل الدخول للمساعدة في لمّ شمل الحيوانات المفقودة.','Log In':'تسجيل الدخول','Sign Up':'إنشاء حساب','Username':'اسم المستخدم','Password':'كلمة المرور','Create Account →':'إنشاء حساب →','Log In →':'تسجيل الدخول →','Continue →':'متابعة →','Browse Lost & Found Pets':'تصفح الحيوانات المفقودة والموجودة','Loading...':'جارٍ التحميل...','Contact Us':'اتصل بنا',
    },
    hi: {
      'Home':'होम','Lost a Pet':'पालतू खो गया','Found a Pet':'पालतू मिला','Browse':'ब्राउज़ करें','Tips':'सुझाव','Success Stories':'सफलता की कहानियाँ','Map':'मानचित्र','📊 Stats':'📊 आँकड़े','🎮 Bored?':'🎮 बोर हो रहे हैं?','About':'हमारे बारे में','Contact':'संपर्क',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'परिवारों को उनके खोए हुए पालतू जानवरों से मिलाने में मदद — एक मोहल्ले से दूसरे तक।','🔴 I Lost a Pet':'🔴 मेरा पालतू खो गया','🟢 I Found a Pet':'🟢 मुझे एक पालतू मिला','Recently Lost Pets':'हाल ही में खोए पालतू','pets reunited so far!':'पालतू अब तक मिल चुके हैं!','⭐ Success Story':'⭐ सफलता की कहानी','See all success stories →':'सभी सफलता की कहानियाँ देखें →',
      '📋 Copy Phone':'📋 फ़ोन कॉपी करें','📋 Copy Email':'📋 ईमेल कॉपी करें','🔗 Copy Link':'🔗 लिंक कॉपी करें','🖨️ Print Flyer':'🖨️ पोस्टर प्रिंट करें','🔍 Details':'🔍 विवरण','🎉 Reunited!':'🎉 मिल गया!','🔒 Show Phone':'🔒 फ़ोन दिखाएँ','🔒 Show Email':'🔒 ईमेल दिखाएँ','👁 Spotted':'👁 देखा गया',
      'Contact:':'संपर्क:','Animal:':'जानवर:','Color:':'रंग:','Age:':'उम्र:','Size:':'आकार:','Date:':'तारीख:','Special:':'विशेष:','Last seen:':'आख़िरी बार देखा:','Found at:':'यहाँ मिला:',
      'LOST':'खोया हुआ','FOUND':'मिला','🎉 REUNITED!':'🎉 मिल गया!','💰 REWARD OFFERED':'💰 इनाम है','Reward offered!':'इनाम की पेशकश!','Phone hidden by poster':'पोस्ट करने वाले ने फ़ोन छिपाया','No contact info provided':'कोई संपर्क जानकारी नहीं दी गई','📍 See on map':'📍 मानचित्र पर देखें','No Photo':'कोई फ़ोटो नहीं','🚨 URGENT — Missing over a week!':'🚨 अत्यावश्यक — एक हफ़्ते से ज़्यादा से लापता!',
      'Dog':'कुत्ता','Cat':'बिल्ली','Rabbit':'खरगोश','Bird':'पक्षी','Hamster':'हैम्स्टर','Other':'अन्य','Small':'छोटा','Medium':'मध्यम','Large':'बड़ा',
      'Black':'काला','White':'सफ़ेद','Golden':'सुनहरा','Brown':'भूरा','Grey':'धूसर','Orange':'नारंगी','Cream':'क्रीम','Calico':'तिरंगा','Silver':'चाँदी','Fawn':'हल्का भूरा',
      '6 months':'6 महीने','1 year':'1 साल','2 years':'2 साल','3 years':'3 साल','4 years':'4 साल','5 years':'5 साल','6 years':'6 साल','7 years':'7 साल','8 years':'8 साल','10 years':'10 साल','Senior (10+)':'वरिष्ठ (10+)','Young puppy':'छोटा पिल्ला','Kitten':'बिल्ली का बच्चा','Adult':'वयस्क',
      'Sign in to help reunite lost pets.':'खोए पालतुओं को मिलाने में मदद के लिए साइन इन करें।','Log In':'लॉग इन','Sign Up':'साइन अप','Username':'उपयोगकर्ता नाम','Password':'पासवर्ड','Create Account →':'खाता बनाएँ →','Log In →':'लॉग इन →','Continue →':'जारी रखें →','Browse Lost & Found Pets':'खोए और मिले पालतू ब्राउज़ करें','Loading...':'लोड हो रहा है...','Contact Us':'संपर्क करें',
    },
    id: {
      'Home':'Beranda','Lost a Pet':'Hewan hilang','Found a Pet':'Hewan ditemukan','Browse':'Jelajahi','Tips':'Tips','Success Stories':'Kisah sukses','Map':'Peta','📊 Stats':'📊 Statistik','🎮 Bored?':'🎮 Bosan?','About':'Tentang','Contact':'Kontak',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Membantu keluarga bertemu kembali dengan hewan peliharaan yang hilang — satu lingkungan demi satu.','🔴 I Lost a Pet':'🔴 Saya kehilangan hewan','🟢 I Found a Pet':'🟢 Saya menemukan hewan','Recently Lost Pets':'Hewan yang baru hilang','pets reunited so far!':'hewan telah dipertemukan kembali!','⭐ Success Story':'⭐ Kisah sukses','See all success stories →':'Lihat semua kisah sukses →',
      '📋 Copy Phone':'📋 Salin telepon','📋 Copy Email':'📋 Salin email','🔗 Copy Link':'🔗 Salin tautan','🖨️ Print Flyer':'🖨️ Cetak selebaran','🔍 Details':'🔍 Detail','🎉 Reunited!':'🎉 Dipertemukan!','🔒 Show Phone':'🔒 Tampilkan telepon','🔒 Show Email':'🔒 Tampilkan email','👁 Spotted':'👁 Terlihat',
      'Contact:':'Kontak:','Animal:':'Hewan:','Color:':'Warna:','Age:':'Usia:','Size:':'Ukuran:','Date:':'Tanggal:','Special:':'Khusus:','Last seen:':'Terakhir terlihat:','Found at:':'Ditemukan di:',
      'LOST':'HILANG','FOUND':'DITEMUKAN','🎉 REUNITED!':'🎉 DIPERTEMUKAN!','💰 REWARD OFFERED':'💰 ADA HADIAH','Reward offered!':'Ada hadiah!','Phone hidden by poster':'Telepon disembunyikan oleh pengirim','No contact info provided':'Tidak ada info kontak','📍 See on map':'📍 Lihat di peta','No Photo':'Tidak ada foto','🚨 URGENT — Missing over a week!':'🚨 MENDESAK — Hilang lebih dari seminggu!',
      'Dog':'Anjing','Cat':'Kucing','Rabbit':'Kelinci','Bird':'Burung','Hamster':'Hamster','Other':'Lainnya','Small':'Kecil','Medium':'Sedang','Large':'Besar',
      'Black':'Hitam','White':'Putih','Golden':'Keemasan','Brown':'Cokelat','Grey':'Abu-abu','Orange':'Oranye','Cream':'Krem','Calico':'Belang tiga','Silver':'Perak','Fawn':'Cokelat muda',
      '6 months':'6 bulan','1 year':'1 tahun','2 years':'2 tahun','3 years':'3 tahun','4 years':'4 tahun','5 years':'5 tahun','6 years':'6 tahun','7 years':'7 tahun','8 years':'8 tahun','10 years':'10 tahun','Senior (10+)':'Senior (10+)','Young puppy':'Anak anjing','Kitten':'Anak kucing','Adult':'Dewasa',
      'Sign in to help reunite lost pets.':'Masuk untuk membantu mempertemukan hewan yang hilang.','Log In':'Masuk','Sign Up':'Daftar','Username':'Nama pengguna','Password':'Kata sandi','Create Account →':'Buat akun →','Log In →':'Masuk →','Continue →':'Lanjutkan →','Browse Lost & Found Pets':'Jelajahi hewan hilang & ditemukan','Loading...':'Memuat...','Contact Us':'Hubungi kami',
    },
    ko: {
      'Home':'홈','Lost a Pet':'잃어버린 반려동물','Found a Pet':'발견한 반려동물','Browse':'둘러보기','Tips':'팁','Success Stories':'성공 사례','Map':'지도','📊 Stats':'📊 통계','🎮 Bored?':'🎮 심심해요?','About':'소개','Contact':'연락처',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'잃어버린 반려동물을 가족에게 — 동네 하나씩 다시 만나도록 돕습니다.','🔴 I Lost a Pet':'🔴 반려동물을 잃어버렸어요','🟢 I Found a Pet':'🟢 반려동물을 찾았어요','Recently Lost Pets':'최근 잃어버린 반려동물','pets reunited so far!':'마리의 반려동물이 다시 만났어요!','⭐ Success Story':'⭐ 성공 사례','See all success stories →':'모든 성공 사례 보기 →',
      '📋 Copy Phone':'📋 전화 복사','📋 Copy Email':'📋 이메일 복사','🔗 Copy Link':'🔗 링크 복사','🖨️ Print Flyer':'🖨️ 전단지 인쇄','🔍 Details':'🔍 상세','🎉 Reunited!':'🎉 재회!','🔒 Show Phone':'🔒 전화 보기','🔒 Show Email':'🔒 이메일 보기','👁 Spotted':'👁 목격',
      'Contact:':'연락처:','Animal:':'동물:','Color:':'색상:','Age:':'나이:','Size:':'크기:','Date:':'날짜:','Special:':'특징:','Last seen:':'마지막 목격:','Found at:':'발견 장소:',
      'LOST':'실종','FOUND':'발견','🎉 REUNITED!':'🎉 재회!','💰 REWARD OFFERED':'💰 사례금 있음','Reward offered!':'사례금 제공!','Phone hidden by poster':'작성자가 전화번호 숨김','No contact info provided':'연락처 정보 없음','📍 See on map':'📍 지도에서 보기','No Photo':'사진 없음','🚨 URGENT — Missing over a week!':'🚨 긴급 — 일주일 넘게 실종!',
      'Dog':'개','Cat':'고양이','Rabbit':'토끼','Bird':'새','Hamster':'햄스터','Other':'기타','Small':'소형','Medium':'중형','Large':'대형',
      'Black':'검정','White':'흰색','Golden':'황금색','Brown':'갈색','Grey':'회색','Orange':'주황색','Cream':'크림색','Calico':'삼색','Silver':'은색','Fawn':'연갈색',
      '6 months':'6개월','1 year':'1살','2 years':'2살','3 years':'3살','4 years':'4살','5 years':'5살','6 years':'6살','7 years':'7살','8 years':'8살','10 years':'10살','Senior (10+)':'노령(10살 이상)','Young puppy':'어린 강아지','Kitten':'새끼 고양이','Adult':'성체',
      'Sign in to help reunite lost pets.':'잃어버린 반려동물의 재회를 돕기 위해 로그인하세요.','Log In':'로그인','Sign Up':'회원가입','Username':'사용자 이름','Password':'비밀번호','Create Account →':'계정 만들기 →','Log In →':'로그인 →','Continue →':'계속 →','Browse Lost & Found Pets':'잃어버린 & 발견된 반려동물 둘러보기','Loading...':'로딩 중...','Contact Us':'문의하기',
    },
    zh: {
      'Home':'首页','Lost a Pet':'寻找走失宠物','Found a Pet':'我捡到了宠物','Browse':'浏览','Tips':'小贴士','Success Stories':'成功故事','Map':'地图','📊 Stats':'📊 统计','🎮 Bored?':'🎮 无聊吗？','About':'关于','Contact':'联系',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'帮助家庭一个社区接一个社区地找回走失的宠物。','🔴 I Lost a Pet':'🔴 我的宠物走失了','🟢 I Found a Pet':'🟢 我捡到了宠物','Recently Lost Pets':'最近走失的宠物','pets reunited so far!':'只宠物已团聚！','⭐ Success Story':'⭐ 成功故事','See all success stories →':'查看所有成功故事 →',
      '📋 Copy Phone':'📋 复制电话','📋 Copy Email':'📋 复制邮箱','🔗 Copy Link':'🔗 复制链接','🖨️ Print Flyer':'🖨️ 打印传单','🔍 Details':'🔍 详情','🎉 Reunited!':'🎉 已团聚！','🔒 Show Phone':'🔒 显示电话','🔒 Show Email':'🔒 显示邮箱','👁 Spotted':'👁 目击',
      'Contact:':'联系人：','Animal:':'动物：','Color:':'颜色：','Age:':'年龄：','Size:':'体型：','Date:':'日期：','Special:':'特征：','Last seen:':'最后出现：','Found at:':'发现地点：',
      'LOST':'走失','FOUND':'拾获','🎉 REUNITED!':'🎉 已团聚！','💰 REWARD OFFERED':'💰 提供赏金','Reward offered!':'提供赏金！','Phone hidden by poster':'发布者已隐藏电话','No contact info provided':'未提供联系方式','📍 See on map':'📍 在地图上查看','No Photo':'暂无照片','🚨 URGENT — Missing over a week!':'🚨 紧急 — 失踪超过一周！',
      'Dog':'狗','Cat':'猫','Rabbit':'兔子','Bird':'鸟','Hamster':'仓鼠','Other':'其他','Small':'小型','Medium':'中型','Large':'大型',
      'Black':'黑色','White':'白色','Golden':'金色','Brown':'棕色','Grey':'灰色','Orange':'橙色','Cream':'奶油色','Calico':'三花','Silver':'银色','Fawn':'浅黄褐色',
      '6 months':'6个月','1 year':'1岁','2 years':'2岁','3 years':'3岁','4 years':'4岁','5 years':'5岁','6 years':'6岁','7 years':'7岁','8 years':'8岁','10 years':'10岁','Senior (10+)':'老年（10岁以上）','Young puppy':'幼犬','Kitten':'幼猫','Adult':'成年',
      'Sign in to help reunite lost pets.':'登录以帮助走失的宠物回家。','Log In':'登录','Sign Up':'注册','Username':'用户名','Password':'密码','Create Account →':'创建账户 →','Log In →':'登录 →','Continue →':'继续 →','Browse Lost & Found Pets':'浏览走失和拾获的宠物','Loading...':'加载中...','Contact Us':'联系我们',
    },
    'zh-TW': {
      'Home':'首頁','Lost a Pet':'尋找走失寵物','Found a Pet':'我撿到了寵物','Browse':'瀏覽','Tips':'小提示','Success Stories':'成功故事','Map':'地圖','📊 Stats':'📊 統計','🎮 Bored?':'🎮 無聊嗎？','About':'關於','Contact':'聯絡',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'幫助家庭一個社區接一個社區地找回走失的寵物。','🔴 I Lost a Pet':'🔴 我的寵物走失了','🟢 I Found a Pet':'🟢 我撿到了寵物','Recently Lost Pets':'最近走失的寵物','pets reunited so far!':'隻寵物已團聚！','⭐ Success Story':'⭐ 成功故事','See all success stories →':'查看所有成功故事 →',
      '📋 Copy Phone':'📋 複製電話','📋 Copy Email':'📋 複製郵箱','🔗 Copy Link':'🔗 複製連結','🖨️ Print Flyer':'🖨️ 列印傳單','🔍 Details':'🔍 詳情','🎉 Reunited!':'🎉 已團聚！','🔒 Show Phone':'🔒 顯示電話','🔒 Show Email':'🔒 顯示郵箱','👁 Spotted':'👁 目擊',
      'Contact:':'聯絡人：','Animal:':'動物：','Color:':'顏色：','Age:':'年齡：','Size:':'體型：','Date:':'日期：','Special:':'特徵：','Last seen:':'最後出現：','Found at:':'發現地點：',
      'LOST':'走失','FOUND':'拾獲','🎉 REUNITED!':'🎉 已團聚！','💰 REWARD OFFERED':'💰 提供賞金','Reward offered!':'提供賞金！','Phone hidden by poster':'發布者已隱藏電話','No contact info provided':'未提供聯絡方式','📍 See on map':'📍 在地圖上查看','No Photo':'暫無照片','🚨 URGENT — Missing over a week!':'🚨 緊急 — 失蹤超過一週！',
      'Dog':'狗','Cat':'貓','Rabbit':'兔子','Bird':'鳥','Hamster':'倉鼠','Other':'其他','Small':'小型','Medium':'中型','Large':'大型',
      'Black':'黑色','White':'白色','Golden':'金色','Brown':'棕色','Grey':'灰色','Orange':'橙色','Cream':'奶油色','Calico':'三花','Silver':'銀色','Fawn':'淺黃褐色',
      '6 months':'6個月','1 year':'1歲','2 years':'2歲','3 years':'3歲','4 years':'4歲','5 years':'5歲','6 years':'6歲','7 years':'7歲','8 years':'8歲','10 years':'10歲','Senior (10+)':'老年（10歲以上）','Young puppy':'幼犬','Kitten':'幼貓','Adult':'成年',
      'Sign in to help reunite lost pets.':'登入以協助走失寵物回家。','Log In':'登入','Sign Up':'註冊','Username':'使用者名稱','Password':'密碼','Create Account →':'建立帳戶 →','Log In →':'登入 →','Continue →':'繼續 →','Browse Lost & Found Pets':'瀏覽走失和拾獲的寵物','Loading...':'載入中...','Contact Us':'聯絡我們',
    },
    ja: {
      'Home':'ホーム','Lost a Pet':'ペットを探す','Found a Pet':'ペットを保護した','Browse':'さがす','Tips':'ヒント','Success Stories':'成功事例','Map':'地図','📊 Stats':'📊 統計','🎮 Bored?':'🎮 ひまですか？','About':'概要','Contact':'お問い合わせ',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'迷子になったペットを、地域ごとに家族のもとへ。','🔴 I Lost a Pet':'🔴 ペットがいなくなった','🟢 I Found a Pet':'🟢 ペットを保護した','Recently Lost Pets':'最近いなくなったペット','pets reunited so far!':'匹のペットが再会しました！','⭐ Success Story':'⭐ 成功事例','See all success stories →':'すべての成功事例を見る →',
      '📋 Copy Phone':'📋 電話をコピー','📋 Copy Email':'📋 メールをコピー','🔗 Copy Link':'🔗 リンクをコピー','🖨️ Print Flyer':'🖨️ チラシを印刷','🔍 Details':'🔍 詳細','🎉 Reunited!':'🎉 再会！','🔒 Show Phone':'🔒 電話を表示','🔒 Show Email':'🔒 メールを表示','👁 Spotted':'👁 目撃',
      'Contact:':'連絡先：','Animal:':'動物：','Color:':'色：','Age:':'年齢：','Size:':'大きさ：','Date:':'日付：','Special:':'特徴：','Last seen:':'最後に見た場所：','Found at:':'発見場所：',
      'LOST':'迷子','FOUND':'保護','🎉 REUNITED!':'🎉 再会！','💰 REWARD OFFERED':'💰 謝礼あり','Reward offered!':'謝礼あり！','Phone hidden by poster':'投稿者が電話を非表示','No contact info provided':'連絡先の記載なし','📍 See on map':'📍 地図で見る','No Photo':'写真なし','🚨 URGENT — Missing over a week!':'🚨 緊急 — 1週間以上行方不明！',
      'Dog':'犬','Cat':'猫','Rabbit':'ウサギ','Bird':'鳥','Hamster':'ハムスター','Other':'その他','Small':'小型','Medium':'中型','Large':'大型',
      'Black':'黒','White':'白','Golden':'ゴールド','Brown':'茶色','Grey':'グレー','Orange':'オレンジ','Cream':'クリーム','Calico':'三毛','Silver':'シルバー','Fawn':'淡褐色',
      '6 months':'生後6か月','1 year':'1歳','2 years':'2歳','3 years':'3歳','4 years':'4歳','5 years':'5歳','6 years':'6歳','7 years':'7歳','8 years':'8歳','10 years':'10歳','Senior (10+)':'シニア（10歳以上）','Young puppy':'子犬','Kitten':'子猫','Adult':'成体',
      'Sign in to help reunite lost pets.':'ログインして迷子のペットの再会を手伝いましょう。','Log In':'ログイン','Sign Up':'新規登録','Username':'ユーザー名','Password':'パスワード','Create Account →':'アカウント作成 →','Log In →':'ログイン →','Continue →':'続ける →','Browse Lost & Found Pets':'迷子・保護されたペットをさがす','Loading...':'読み込み中...','Contact Us':'お問い合わせ',
    },
  };

  // Ticker phrases: "Name the Dog reunited in Place" (name is never translated).
  const DICT_EXTRA = {
    es: { 'the Dog':'el perro','the Cat':'el gato','the Rabbit':'el conejo','the Bird':'el pájaro','the Hamster':'el hámster','the Other':'la mascota','reunited in':'reunido en','🎉 Recently Reunited:':'🎉 Reunidos recientemente:' },
    fr: { 'the Dog':'le chien','the Cat':'le chat','the Rabbit':'le lapin','the Bird':'l\'oiseau','the Hamster':'le hamster','the Other':'l\'animal','reunited in':'réuni à','🎉 Recently Reunited:':'🎉 Récemment réunis :' },
    de: { 'the Dog':'der Hund','the Cat':'die Katze','the Rabbit':'das Kaninchen','the Bird':'der Vogel','the Hamster':'der Hamster','the Other':'das Tier','reunited in':'wieder vereint in','🎉 Recently Reunited:':'🎉 Kürzlich wiedervereint:' },
    pt: { 'the Dog':'o cachorro','the Cat':'o gato','the Rabbit':'o coelho','the Bird':'o pássaro','the Hamster':'o hamster','the Other':'o animal','reunited in':'reunido em','🎉 Recently Reunited:':'🎉 Reunidos recentemente:' },
    it: { 'the Dog':'il cane','the Cat':'il gatto','the Rabbit':'il coniglio','the Bird':'l\'uccello','the Hamster':'il criceto','the Other':'l\'animale','reunited in':'riunito a','🎉 Recently Reunited:':'🎉 Riuniti di recente:' },
    nl: { 'the Dog':'de hond','the Cat':'de kat','the Rabbit':'het konijn','the Bird':'de vogel','the Hamster':'de hamster','the Other':'het dier','reunited in':'herenigd in','🎉 Recently Reunited:':'🎉 Onlangs herenigd:' },
    pl: { 'the Dog':'pies','the Cat':'kot','the Rabbit':'królik','the Bird':'ptak','the Hamster':'chomik','the Other':'zwierzak','reunited in':'połączony w','🎉 Recently Reunited:':'🎉 Niedawno połączeni:' },
    tr: { 'the Dog':'köpek','the Cat':'kedi','the Rabbit':'tavşan','the Bird':'kuş','the Hamster':'hamster','the Other':'hayvan','reunited in':'kavuştu —','🎉 Recently Reunited:':'🎉 Yakında kavuşanlar:' },
    ru: { 'the Dog':'собака','the Cat':'кошка','the Rabbit':'кролик','the Bird':'птица','the Hamster':'хомяк','the Other':'питомец','reunited in':'воссоединён в','🎉 Recently Reunited:':'🎉 Недавно воссоединённые:' },
    ar: { 'the Dog':'الكلب','the Cat':'القطة','the Rabbit':'الأرنب','the Bird':'الطائر','the Hamster':'الهامستر','the Other':'الحيوان','reunited in':'تم لمّ شمله في','🎉 Recently Reunited:':'🎉 تم لمّ شملهم مؤخرًا:' },
    hi: { 'the Dog':'कुत्ता','the Cat':'बिल्ली','the Rabbit':'खरगोश','the Bird':'पक्षी','the Hamster':'हैम्स्टर','the Other':'पालतू','reunited in':'फिर मिला —','🎉 Recently Reunited:':'🎉 हाल ही में मिले:' },
    id: { 'the Dog':'si anjing','the Cat':'si kucing','the Rabbit':'si kelinci','the Bird':'si burung','the Hamster':'si hamster','the Other':'hewan','reunited in':'dipertemukan di','🎉 Recently Reunited:':'🎉 Baru dipertemukan:' },
    ko: { 'the Dog':'강아지','the Cat':'고양이','the Rabbit':'토끼','the Bird':'새','the Hamster':'햄스터','the Other':'반려동물','reunited in':'재회 —','🎉 Recently Reunited:':'🎉 최근 재회:' },
    zh: { 'the Dog':'狗狗','the Cat':'猫咪','the Rabbit':'兔子','the Bird':'鸟儿','the Hamster':'仓鼠','the Other':'宠物','reunited in':'团聚于','🎉 Recently Reunited:':'🎉 最近团聚：' },
    'zh-TW': { 'the Dog':'狗狗','the Cat':'貓咪','the Rabbit':'兔子','the Bird':'鳥兒','the Hamster':'倉鼠','the Other':'寵物','reunited in':'團聚於','🎉 Recently Reunited:':'🎉 最近團聚：' },
    ja: { 'the Dog':'犬','the Cat':'猫','the Rabbit':'ウサギ','the Bird':'鳥','the Hamster':'ハムスター','the Other':'ペット','reunited in':'が再会 —','🎉 Recently Reunited:':'🎉 最近再会：' },
  };

  function getLang() { return localStorage.getItem(LANG_KEY) || ''; }
  function langName(code) { const l = LANGS.find(x => x.code === code); return l ? l.name : 'Language'; }
  function langFlag(code) { const l = LANGS.find(x => x.code === code); return l ? l.flag : '🌐'; }

  // Replace any English text inside `root` using the map.
  function translateTree(root, map) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const tag = n.parentNode && n.parentNode.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const t = n.nodeValue.trim();
      if (map[t] !== undefined) n.nodeValue = n.nodeValue.replace(t, map[t]);
    });
    if (root.querySelectorAll) {
      root.querySelectorAll('[placeholder]').forEach(el => {
        const v = (el.getAttribute('placeholder') || '').trim();
        if (map[v] !== undefined) el.setAttribute('placeholder', map[v]);
      });
      root.querySelectorAll('option').forEach(el => {
        const v = el.textContent.trim();
        if (map[v] !== undefined) el.textContent = map[v];
      });
    }
  }

  function startObserver(map) {
    new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(node => {
        if (node.nodeType === 1) translateTree(node, map);
        else if (node.nodeType === 3) {
          const t = node.nodeValue.trim();
          if (map[t] !== undefined) node.nodeValue = node.nodeValue.replace(t, map[t]);
        }
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ── Picker ──
  function showLanguagePicker(force) {
    const cur = getLang();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width:480px;text-align:center;">
        ${force ? '' : '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">✕</button>'}
        <div style="font-size:2.6rem;line-height:1;">🌐🐾</div>
        <h2 style="margin:8px 0 2px;">Choose your language</h2>
        <p style="color:#888;margin:0 0 16px;font-size:0.85rem;">Elige tu idioma · Choisissez votre langue · 选择语言 · 言語を選択 · اختر لغتك</p>
        <div class="lang-grid">
          ${LANGS.map(l => `<button class="lang-opt${l.code === cur ? ' active' : ''}" onclick="pickLanguage('${l.code}')">${l.flag} ${l.name}</button>`).join('')}
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay && !force) overlay.remove(); });
  }

  function pickLanguage(code) {
    localStorage.setItem(LANG_KEY, code);
    location.reload();
  }

  function initLangButton() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const btn = document.createElement('button');
    btn.className = 'dark-toggle lang-btn';
    const cur = getLang();
    btn.textContent = cur ? `${langFlag(cur)} ${langName(cur)}` : '🌐 Language';
    btn.title = 'Change language';
    btn.onclick = () => showLanguagePicker(false);
    nav.appendChild(btn);
  }

  window.pickLanguage = pickLanguage;
  window.showLanguagePicker = showLanguagePicker;

  const lang = getLang();
  const map = (lang && lang !== 'en')
    ? Object.assign({}, DICT[lang], DICT_EXTRA[lang] || {})
    : null;

  document.addEventListener('DOMContentLoaded', () => {
    if (!getLang()) showLanguagePicker(true);   // first visit: ask immediately
    initLangButton();
    if (lang === 'ar') document.documentElement.setAttribute('dir', 'rtl');
    if (map) {
      translateTree(document.body, map);
      startObserver(map);
    }
  });
})();
