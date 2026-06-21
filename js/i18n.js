// ── LANGUAGES / TRANSLATION ─────────────────────────────────────────────────
// Lets the user pick a language; then walks the page and swaps English text for
// the chosen language. New text added later (pet cards, pop-ups) is caught by a
// MutationObserver. Anything not in the dictionary stays in English.
(function () {
  const LANG_KEY = 'pawfinder_lang';

  const LANGS = [
    { code: 'en', name: 'English',    flag: '🇬🇧' },
    { code: 'es', name: 'Español',    flag: '🇪🇸' },
    { code: 'fr', name: 'Français',   flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch',    flag: '🇩🇪' },
    { code: 'pt', name: 'Português',  flag: '🇵🇹' },
    { code: 'it', name: 'Italiano',   flag: '🇮🇹' },
    { code: 'zh', name: '中文',        flag: '🇨🇳' },
    { code: 'ja', name: '日本語',      flag: '🇯🇵' },
  ];

  // English source text → translation.
  const DICT = {
    es: {
      'Home':'Inicio','Lost a Pet':'Perdí una mascota','Found a Pet':'Encontré una mascota',
      'Browse':'Explorar','Tips':'Consejos','Success Stories':'Historias de éxito','Map':'Mapa',
      '📊 Stats':'📊 Estadísticas','🎮 Bored?':'🎮 ¿Aburrido?','About':'Acerca de','Contact':'Contacto',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Ayudando a las familias a reunirse con sus mascotas perdidas, un vecindario a la vez.',
      '🔴 I Lost a Pet':'🔴 Perdí una mascota','🟢 I Found a Pet':'🟢 Encontré una mascota',
      'Recently Lost Pets':'Mascotas perdidas recientemente','pets reunited so far!':'¡mascotas reunidas hasta ahora!',
      '⭐ Success Story':'⭐ Historia de éxito','See all success stories →':'Ver todas las historias de éxito →',
      '📋 Copy Phone':'📋 Copiar teléfono','📋 Copy Email':'📋 Copiar correo','🔗 Copy Link':'🔗 Copiar enlace',
      '🖨️ Print Flyer':'🖨️ Imprimir cartel','🔍 Details':'🔍 Detalles','🎉 Reunited!':'🎉 ¡Reunido!',
      '🔒 Show Phone':'🔒 Mostrar teléfono','🔒 Show Email':'🔒 Mostrar correo',
      'Contact:':'Contacto:','Animal:':'Animal:','Color:':'Color:','Age:':'Edad:','Size:':'Tamaño:',
      'Date:':'Fecha:','Special:':'Especial:','Last seen:':'Visto por última vez:','Found at:':'Encontrado en:',
      'Sign in to help reunite lost pets.':'Inicia sesión para ayudar a reunir mascotas perdidas.',
      'Log In':'Iniciar sesión','Sign Up':'Registrarse','Username':'Usuario','Password':'Contraseña',
      'Create Account →':'Crear cuenta →','Log In →':'Iniciar sesión →','Continue →':'Continuar →',
      'Browse Lost & Found Pets':'Explorar mascotas perdidas y encontradas','Loading...':'Cargando...',
      'Contact Us':'Contáctanos','🌍 Bored?':'🌍 ¿Aburrido?',
    },
    fr: {
      'Home':'Accueil','Lost a Pet':'Animal perdu','Found a Pet':'Animal trouvé',
      'Browse':'Parcourir','Tips':'Conseils','Success Stories':'Histoires de réussite','Map':'Carte',
      '📊 Stats':'📊 Statistiques','🎮 Bored?':'🎮 Ennuyé ?','About':'À propos','Contact':'Contact',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Aider les familles à retrouver leurs animaux perdus, un quartier à la fois.',
      '🔴 I Lost a Pet':'🔴 J\'ai perdu un animal','🟢 I Found a Pet':'🟢 J\'ai trouvé un animal',
      'Recently Lost Pets':'Animaux récemment perdus','pets reunited so far!':'animaux réunis jusqu\'à présent !',
      '⭐ Success Story':'⭐ Histoire de réussite','See all success stories →':'Voir toutes les histoires de réussite →',
      '📋 Copy Phone':'📋 Copier le téléphone','📋 Copy Email':'📋 Copier l\'e-mail','🔗 Copy Link':'🔗 Copier le lien',
      '🖨️ Print Flyer':'🖨️ Imprimer l\'affiche','🔍 Details':'🔍 Détails','🎉 Reunited!':'🎉 Réuni !',
      '🔒 Show Phone':'🔒 Afficher le téléphone','🔒 Show Email':'🔒 Afficher l\'e-mail',
      'Contact:':'Contact :','Animal:':'Animal :','Color:':'Couleur :','Age:':'Âge :','Size:':'Taille :',
      'Date:':'Date :','Special:':'Particularité :','Last seen:':'Vu pour la dernière fois :','Found at:':'Trouvé à :',
      'Sign in to help reunite lost pets.':'Connectez-vous pour aider à réunir les animaux perdus.',
      'Log In':'Se connecter','Sign Up':'S\'inscrire','Username':'Nom d\'utilisateur','Password':'Mot de passe',
      'Create Account →':'Créer un compte →','Log In →':'Se connecter →','Continue →':'Continuer →',
      'Browse Lost & Found Pets':'Parcourir les animaux perdus et trouvés','Loading...':'Chargement...',
      'Contact Us':'Contactez-nous',
    },
    de: {
      'Home':'Startseite','Lost a Pet':'Haustier verloren','Found a Pet':'Haustier gefunden',
      'Browse':'Durchsuchen','Tips':'Tipps','Success Stories':'Erfolgsgeschichten','Map':'Karte',
      '📊 Stats':'📊 Statistiken','🎮 Bored?':'🎮 Gelangweilt?','About':'Über uns','Contact':'Kontakt',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Wir helfen Familien, ihre verlorenen Haustiere wiederzufinden – ein Viertel nach dem anderen.',
      '🔴 I Lost a Pet':'🔴 Haustier verloren','🟢 I Found a Pet':'🟢 Haustier gefunden',
      'Recently Lost Pets':'Kürzlich verlorene Haustiere','pets reunited so far!':'Haustiere bisher wiedervereint!',
      '⭐ Success Story':'⭐ Erfolgsgeschichte','See all success stories →':'Alle Erfolgsgeschichten ansehen →',
      '📋 Copy Phone':'📋 Telefon kopieren','📋 Copy Email':'📋 E-Mail kopieren','🔗 Copy Link':'🔗 Link kopieren',
      '🖨️ Print Flyer':'🖨️ Steckbrief drucken','🔍 Details':'🔍 Details','🎉 Reunited!':'🎉 Wiedervereint!',
      '🔒 Show Phone':'🔒 Telefon anzeigen','🔒 Show Email':'🔒 E-Mail anzeigen',
      'Contact:':'Kontakt:','Animal:':'Tier:','Color:':'Farbe:','Age:':'Alter:','Size:':'Größe:',
      'Date:':'Datum:','Special:':'Besonderheit:','Last seen:':'Zuletzt gesehen:','Found at:':'Gefunden bei:',
      'Sign in to help reunite lost pets.':'Melde dich an, um verlorene Haustiere wiederzuvereinen.',
      'Log In':'Anmelden','Sign Up':'Registrieren','Username':'Benutzername','Password':'Passwort',
      'Create Account →':'Konto erstellen →','Log In →':'Anmelden →','Continue →':'Weiter →',
      'Browse Lost & Found Pets':'Verlorene & gefundene Haustiere durchsuchen','Loading...':'Wird geladen...',
      'Contact Us':'Kontaktiere uns',
    },
    pt: {
      'Home':'Início','Lost a Pet':'Perdi um animal','Found a Pet':'Encontrei um animal',
      'Browse':'Explorar','Tips':'Dicas','Success Stories':'Histórias de sucesso','Map':'Mapa',
      '📊 Stats':'📊 Estatísticas','🎮 Bored?':'🎮 Entediado?','About':'Sobre','Contact':'Contato',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Ajudando famílias a reencontrar seus animais perdidos, um bairro de cada vez.',
      '🔴 I Lost a Pet':'🔴 Perdi um animal','🟢 I Found a Pet':'🟢 Encontrei um animal',
      'Recently Lost Pets':'Animais perdidos recentemente','pets reunited so far!':'animais reunidos até agora!',
      '⭐ Success Story':'⭐ História de sucesso','See all success stories →':'Ver todas as histórias de sucesso →',
      '📋 Copy Phone':'📋 Copiar telefone','📋 Copy Email':'📋 Copiar e-mail','🔗 Copy Link':'🔗 Copiar link',
      '🖨️ Print Flyer':'🖨️ Imprimir cartaz','🔍 Details':'🔍 Detalhes','🎉 Reunited!':'🎉 Reunido!',
      '🔒 Show Phone':'🔒 Mostrar telefone','🔒 Show Email':'🔒 Mostrar e-mail',
      'Contact:':'Contato:','Animal:':'Animal:','Color:':'Cor:','Age:':'Idade:','Size:':'Tamanho:',
      'Date:':'Data:','Special:':'Especial:','Last seen:':'Visto pela última vez:','Found at:':'Encontrado em:',
      'Sign in to help reunite lost pets.':'Entre para ajudar a reunir animais perdidos.',
      'Log In':'Entrar','Sign Up':'Cadastrar','Username':'Usuário','Password':'Senha',
      'Create Account →':'Criar conta →','Log In →':'Entrar →','Continue →':'Continuar →',
      'Browse Lost & Found Pets':'Explorar animais perdidos e encontrados','Loading...':'Carregando...',
      'Contact Us':'Fale conosco',
    },
    it: {
      'Home':'Home','Lost a Pet':'Animale smarrito','Found a Pet':'Animale trovato',
      'Browse':'Sfoglia','Tips':'Consigli','Success Stories':'Storie di successo','Map':'Mappa',
      '📊 Stats':'📊 Statistiche','🎮 Bored?':'🎮 Annoiato?','About':'Chi siamo','Contact':'Contatti',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'Aiutiamo le famiglie a ritrovare i loro animali smarriti, un quartiere alla volta.',
      '🔴 I Lost a Pet':'🔴 Ho smarrito un animale','🟢 I Found a Pet':'🟢 Ho trovato un animale',
      'Recently Lost Pets':'Animali smarriti di recente','pets reunited so far!':'animali riuniti finora!',
      '⭐ Success Story':'⭐ Storia di successo','See all success stories →':'Vedi tutte le storie di successo →',
      '📋 Copy Phone':'📋 Copia telefono','📋 Copy Email':'📋 Copia email','🔗 Copy Link':'🔗 Copia link',
      '🖨️ Print Flyer':'🖨️ Stampa volantino','🔍 Details':'🔍 Dettagli','🎉 Reunited!':'🎉 Riunito!',
      '🔒 Show Phone':'🔒 Mostra telefono','🔒 Show Email':'🔒 Mostra email',
      'Contact:':'Contatto:','Animal:':'Animale:','Color:':'Colore:','Age:':'Età:','Size:':'Taglia:',
      'Date:':'Data:','Special:':'Speciale:','Last seen:':'Visto l\'ultima volta:','Found at:':'Trovato a:',
      'Sign in to help reunite lost pets.':'Accedi per aiutare a riunire gli animali smarriti.',
      'Log In':'Accedi','Sign Up':'Registrati','Username':'Nome utente','Password':'Password',
      'Create Account →':'Crea account →','Log In →':'Accedi →','Continue →':'Continua →',
      'Browse Lost & Found Pets':'Sfoglia animali smarriti e trovati','Loading...':'Caricamento...',
      'Contact Us':'Contattaci',
    },
    zh: {
      'Home':'首页','Lost a Pet':'寻找走失宠物','Found a Pet':'我捡到了宠物',
      'Browse':'浏览','Tips':'小贴士','Success Stories':'成功故事','Map':'地图',
      '📊 Stats':'📊 统计','🎮 Bored?':'🎮 无聊吗？','About':'关于','Contact':'联系',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'帮助家庭一个社区接一个社区地找回走失的宠物。',
      '🔴 I Lost a Pet':'🔴 我的宠物走失了','🟢 I Found a Pet':'🟢 我捡到了宠物',
      'Recently Lost Pets':'最近走失的宠物','pets reunited so far!':'只宠物已团聚！',
      '⭐ Success Story':'⭐ 成功故事','See all success stories →':'查看所有成功故事 →',
      '📋 Copy Phone':'📋 复制电话','📋 Copy Email':'📋 复制邮箱','🔗 Copy Link':'🔗 复制链接',
      '🖨️ Print Flyer':'🖨️ 打印传单','🔍 Details':'🔍 详情','🎉 Reunited!':'🎉 已团聚！',
      '🔒 Show Phone':'🔒 显示电话','🔒 Show Email':'🔒 显示邮箱',
      'Contact:':'联系人：','Animal:':'动物：','Color:':'颜色：','Age:':'年龄：','Size:':'体型：',
      'Date:':'日期：','Special:':'特征：','Last seen:':'最后出现：','Found at:':'发现地点：',
      'Sign in to help reunite lost pets.':'登录以帮助走失的宠物回家。',
      'Log In':'登录','Sign Up':'注册','Username':'用户名','Password':'密码',
      'Create Account →':'创建账户 →','Log In →':'登录 →','Continue →':'继续 →',
      'Browse Lost & Found Pets':'浏览走失和拾获的宠物','Loading...':'加载中...',
      'Contact Us':'联系我们',
    },
    ja: {
      'Home':'ホーム','Lost a Pet':'ペットを探す','Found a Pet':'ペットを保護した',
      'Browse':'さがす','Tips':'ヒント','Success Stories':'成功事例','Map':'地図',
      '📊 Stats':'📊 統計','🎮 Bored?':'🎮 ひまですか？','About':'概要','Contact':'お問い合わせ',
      'Helping families reunite with their lost pets — one neighbourhood at a time.':'迷子になったペットを、地域ごとに家族のもとへ。',
      '🔴 I Lost a Pet':'🔴 ペットがいなくなった','🟢 I Found a Pet':'🟢 ペットを保護した',
      'Recently Lost Pets':'最近いなくなったペット','pets reunited so far!':'匹のペットが再会しました！',
      '⭐ Success Story':'⭐ 成功事例','See all success stories →':'すべての成功事例を見る →',
      '📋 Copy Phone':'📋 電話をコピー','📋 Copy Email':'📋 メールをコピー','🔗 Copy Link':'🔗 リンクをコピー',
      '🖨️ Print Flyer':'🖨️ チラシを印刷','🔍 Details':'🔍 詳細','🎉 Reunited!':'🎉 再会！',
      '🔒 Show Phone':'🔒 電話を表示','🔒 Show Email':'🔒 メールを表示',
      'Contact:':'連絡先：','Animal:':'動物：','Color:':'色：','Age:':'年齢：','Size:':'大きさ：',
      'Date:':'日付：','Special:':'特徴：','Last seen:':'最後に見た場所：','Found at:':'発見場所：',
      'Sign in to help reunite lost pets.':'ログインして迷子のペットの再会を手伝いましょう。',
      'Log In':'ログイン','Sign Up':'新規登録','Username':'ユーザー名','Password':'パスワード',
      'Create Account →':'アカウント作成 →','Log In →':'ログイン →','Continue →':'続ける →',
      'Browse Lost & Found Pets':'迷子・保護されたペットをさがす','Loading...':'読み込み中...',
      'Contact Us':'お問い合わせ',
    },
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
      <div class="modal-box" style="max-width:440px;text-align:center;">
        ${force ? '' : '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">✕</button>'}
        <div style="font-size:2.6rem;line-height:1;">🌐🐾</div>
        <h2 style="margin:8px 0 2px;">Choose your language</h2>
        <p style="color:#888;margin:0 0 16px;font-size:0.88rem;">Elige tu idioma · Choisissez votre langue · 选择语言 · 言語を選択</p>
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
  const map = (lang && lang !== 'en') ? DICT[lang] : null;

  document.addEventListener('DOMContentLoaded', () => {
    // First time anywhere: ask for a language right away.
    if (!getLang()) showLanguagePicker(true);
    initLangButton();
    if (map) {
      translateTree(document.body, map);
      startObserver(map);
    }
  });
})();
