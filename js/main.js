/* ECOM KG — общий скрипт: шапка, подвал, меню, демо-взаимодействия */
(function () {
  var page = document.body.getAttribute('data-page') || '';

  // favicon (единый для всех страниц)
  if (!document.querySelector('link[rel="icon"]')) {
    var fav = document.createElement('link');
    fav.rel = 'icon'; fav.type = 'image/svg+xml'; fav.href = 'favicon.svg';
    document.head.appendChild(fav);
  }

  var primary = [
    ['index.html', 'Главная'],
    ['about.html', 'Об Ассоциации'],
    ['membership.html', 'Членство'],
    ['catalog.html', 'Каталог'],
    ['education.html', 'Обучение'],
    ['events.html', 'Мероприятия']
  ];
  var more = [
    ['committees.html', 'Комитеты'],
    ['news.html', 'Новости'],
    ['knowledge.html', 'База знаний'],
    ['suppliers.html', 'Поставщики']
  ];

  function link(n) {
    var act = n[0] === page ? ' class="active"' : '';
    return '<a href="' + n[0] + '"' + act + '>' + n[1] + '</a>';
  }
  var moreActive = more.some(function (n) { return n[0] === page; });
  var links =
    primary.map(link).join('') +
    '<div class="has-drop">' +
      '<a class="drop-toggle' + (moreActive ? ' active' : '') + '">Ещё ▾</a>' +
      '<div class="drop">' + more.map(link).join('') + '</div>' +
    '</div>';

  var logoSvg =
    '<svg viewBox="0 0 46 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M1 31 L14 7 L23 22 L27 16 L35 31 Z" fill="#ffffff"/>' +
      '<path d="M23 31 L33 12 L45 31 Z" fill="#2f6fed"/>' +
    '</svg>';

  function langSelector(up) {
    return '<div class="langsel' + (up ? ' up' : '') + '">' +
      '<button class="langsel-btn" type="button" aria-label="Язык">' +
        '<span class="globe">🌐</span><span class="curflag">🇷🇺</span><span class="chev">▾</span>' +
      '</button>' +
      '<div class="langsel-menu">' +
        '<a data-lang="ru" class="active">🇷🇺 Русский<span class="chk">✓</span></a>' +
        '<a data-lang="kg">🇰🇬 Кыргызча</a>' +
        '<a data-lang="kz">🇰🇿 Қазақша</a>' +
        '<a data-lang="uz">🇺🇿 Oʻzbekcha</a>' +
        '<a data-lang="tj">🇹🇯 Тоҷикӣ</a>' +
        '<a data-lang="tm">🇹🇲 Türkmençe</a>' +
        '<a data-lang="en">🇬🇧 English</a>' +
      '</div>' +
    '</div>';
  }

  var header =
    '<header class="site"><div class="container nav">' +
      '<a href="index.html" class="logo">' + logoSvg +
        '<span class="lg-col"><span class="lg-txt">ECOM <span>KG</span></span>' +
        '<span class="lg-sub">Трансграничная торговля и логистика КР</span></span>' +
      '</a>' +
      '<button class="burger" aria-label="Меню" id="burger">☰</button>' +
      '<nav class="nav-links" id="navLinks">' + links + '</nav>' +
      '<div class="nav-right">' +
        langSelector(false) +
        '<a href="login.html" class="btn btn-ghost btn-sm">Войти</a>' +
        '<a href="register.html" class="btn btn-light btn-sm">Регистрация</a>' +
      '</div>' +
    '</div></header>';

  var footer =
    '<footer class="site"><div class="container">' +
      '<div class="foot-grid">' +
        '<div>' +
          '<a href="index.html" class="logo">' + logoSvg +
            '<span class="lg-col"><span class="lg-txt">ECOM <span>KG</span></span></span></a>' +
          '<p style="color:#7c8ba0;max-width:360px;margin-top:14px">Цифровая платформа электронной коммерции Кыргызстана. Создана ACTBL — Ассоциацией трансграничной электронной торговли и логистики Кыргызской Республики.</p>' +
          '<div class="foot-socials"><a href="#" title="Telegram" data-soon>TG</a><a href="#" title="Instagram" data-soon>IG</a><a href="#" title="YouTube" data-soon>YT</a><a href="#" title="LinkedIn" data-soon>in</a></div>' +
        '</div>' +
        '<div><h4>Платформа</h4>' +
          '<a href="about.html">Об Ассоциации</a><a href="membership.html">Членство</a><a href="catalog.html">Каталог сервисов</a><a href="education.html">Обучение</a></div>' +
        '<div><h4>Разделы</h4>' +
          '<a href="events.html">Мероприятия</a><a href="committees.html">Комитеты</a><a href="news.html">Новости</a><a href="knowledge.html">База знаний</a><a href="suppliers.html">Поставщики</a></div>' +
        '<div><h4>Контакты</h4>' +
          '<a href="mailto:info@ecomkg.kg">info@ecomkg.kg</a><a href="tel:+996700000000">+996 (700) 00-00-00</a><a href="https://maps.google.com/?q=Бишкек" target="_blank" rel="noopener">г. Бишкек, Кыргызская Республика</a></div>' +
      '</div>' +
      '<div class="foot-bottom">' +
        '<span>© 2026 ECOM KG. Все права защищены. Платформа ACTBL.</span>' +
        '<span style="display:flex;gap:16px;align-items:center">' +
          langSelector(true) +
          '<a href="partner-login.html">Вход для партнёров</a><a href="admin-login.html">Вход для администрации</a><a href="offer.html">Оферта</a><a href="privacy.html">Конфиденциальность</a>' +
        '</span>' +
      '</div>' +
    '</div></footer>';

  var h = document.getElementById('header');
  var f = document.getElementById('footer');
  if (h) h.outerHTML = header;
  if (f) f.outerHTML = footer;

  var burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', function () {
    document.getElementById('navLinks').classList.toggle('open');
  });

  // ---- Реальное сохранение заявок/форм в Supabase ----
  var _sb = null;
  function getSB(cb) {
    if (_sb) { cb(_sb); return; }
    function make() {
      if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase) {
        try { _sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY); } catch (e) { _sb = null; }
      }
      cb(_sb);
    }
    function afterCfg() {
      if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) { cb(null); return; }
      if (window.supabase) { make(); return; }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = make; s.onerror = function () { cb(null); };
      document.head.appendChild(s);
    }
    if (typeof window.SUPABASE_URL !== 'undefined') { afterCfg(); return; }
    var c = document.createElement('script'); c.src = 'js/supabase-config.js';
    c.onload = afterCfg; c.onerror = afterCfg; document.head.appendChild(c);
  }
  window.ecomDB = {
    client: function (cb) { getSB(cb); },
    save: function (type, data) {
      return new Promise(function (resolve) {
        getSB(function (sb) {
          if (!sb) { resolve({ ok: false }); return; }
          sb.auth.getUser().then(function (u) {
            var uid = (u && u.data && u.data.user) ? u.data.user.id : null;
            sb.from('submissions').insert({ type: type, data: data, user_id: uid }).then(function (r) {
              resolve({ ok: !r.error });
            });
          });
        });
      });
    },
    list: function () {
      return new Promise(function (resolve) {
        getSB(function (sb) {
          if (!sb) { resolve(null); return; }
          sb.from('submissions').select('type,data,status,created_at').order('created_at', { ascending: false }).limit(50).then(function (r) {
            resolve(r.error ? null : r.data);
          });
        });
      });
    }
  };

  function reqModal(subject) {
    var ov = document.createElement('div'); ov.className = 'modal-ov';
    ov.innerHTML =
      '<div class="modal"><button class="modal-x" aria-label="Закрыть">×</button>' +
        '<h3>Оставить заявку</h3>' +
        (subject ? '<p class="muted" style="margin-top:-4px">По: ' + subject + '</p>' : '') +
        '<div class="auth-ok" id="mOk" style="display:none"></div>' +
        '<form id="mForm">' +
          '<div class="field"><label>Ваше имя</label><input required id="mName"></div>' +
          '<div class="field"><label>Телефон или e-mail</label><input required id="mContact"></div>' +
          '<div class="field"><label>Комментарий</label><textarea rows="3" id="mMsg"></textarea></div>' +
          '<button class="btn btn-primary" type="submit" style="width:100%">Отправить заявку</button>' +
        '</form></div>';
    document.body.appendChild(ov);
    function close() { ov.remove(); }
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.modal-x')) close(); });
    ov.querySelector('#mForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = ov.querySelector('button.btn'); btn.disabled = true; btn.textContent = 'Отправляем…';
      ecomDB.save('request', {
        subject: subject || '',
        name: ov.querySelector('#mName').value,
        contact: ov.querySelector('#mContact').value,
        message: ov.querySelector('#mMsg').value,
        page: location.pathname
      }).then(function (r) {
        var ok = ov.querySelector('#mOk');
        ok.textContent = r.ok ? '✅ Заявка отправлена! Мы свяжемся с вами.' : '✅ Заявка принята.';
        ok.style.display = 'block';
        ov.querySelector('#mForm').style.display = 'none';
        setTimeout(close, 1800);
      });
    });
  }

  // Формы: реальное сохранение в базу
  document.addEventListener('submit', function (e) {
    if (!e.target.matches('[data-demo]')) return;
    e.preventDefault();
    var form = e.target;
    var type = form.getAttribute('data-demo') || 'form';
    var data = { page: location.pathname };
    form.querySelectorAll('.field').forEach(function (f) {
      var l = f.querySelector('label'); var c = f.querySelector('input,select,textarea');
      if (l && c) data[l.textContent.trim()] = c.value;
    });
    form.querySelectorAll('input,select,textarea').forEach(function (c, i) {
      if (!c.closest('.field')) data['Поле ' + (i + 1)] = c.value;
    });
    var btn = form.querySelector('[type="submit"],button'); if (btn) btn.disabled = true;
    ecomDB.save(type, data).then(function (r) {
      alert(r.ok
        ? '✅ Готово! Ваши данные сохранены — мы свяжемся с вами.'
        : '✅ Принято. Отправка уведомлений (e-mail/SMS) подключится на этапе интеграций.');
      form.reset && form.reset();
      if (btn) btn.disabled = false;
    });
  });
  document.addEventListener('click', function (e) {
    if (e.target.matches('[data-req]')) {
      e.preventDefault();
      var card = e.target.closest('.card');
      var subj = (card && card.querySelector('h3')) ? card.querySelector('h3').textContent : '';
      reqModal(subj);
      return;
    }
    // соцсети (пока не заведены)
    if (e.target.closest('[data-soon]')) {
      e.preventDefault();
      alert('Соцсети Ассоциации появятся позже. Скоро здесь будут Telegram, Instagram, YouTube и LinkedIn.');
      return;
    }
    // меню кабинета: подсветка активного пункта (демо-навигация)
    var dm = e.target.closest('.dash-menu a');
    if (dm && !dm.getAttribute('href')) {
      dm.parentElement.querySelectorAll('a').forEach(function (x) { x.classList.remove('active'); });
      dm.classList.add('active');
      return;
    }
    // выбор языка
    var langLink = e.target.closest('[data-lang]');
    if (langLink) {
      e.preventDefault();
      var l = langLink.getAttribute('data-lang');
      var sel = langLink.closest('.langsel');
      if (sel) sel.classList.remove('open');
      if (l === 'ru') return;
      var names = { kg: 'кыргызском', kz: 'казахском', uz: 'узбекском', tj: 'таджикском', tm: 'туркменском', en: 'английском' };
      alert('Версия на ' + (names[l] || 'этом') + ' языке появится на следующем этапе (по ТЗ, этап 2). Сейчас доступен русский.');
      return;
    }
    // кнопка переключателя языка
    var langBtn = e.target.closest('.langsel-btn');
    if (langBtn) {
      e.preventDefault();
      var box = langBtn.closest('.langsel');
      var wasOpen = box.classList.contains('open');
      document.querySelectorAll('.langsel.open').forEach(function (x) { x.classList.remove('open'); });
      if (!wasOpen) box.classList.add('open');
      return;
    }
    // клик вне — закрыть открытый переключатель
    if (!e.target.closest('.langsel')) {
      document.querySelectorAll('.langsel.open').forEach(function (x) { x.classList.remove('open'); });
    }

    // меню «Ещё»: открытие/закрытие по клику
    var toggle = e.target.closest('.drop-toggle');
    var drop = document.querySelector('.has-drop');
    if (toggle && drop) {
      e.preventDefault();
      drop.classList.toggle('open');
      return;
    }
    // клик вне меню — закрыть
    if (drop && drop.classList.contains('open') && !e.target.closest('.has-drop')) {
      drop.classList.remove('open');
    }
  });
})();
