/* ECOM KG — общий скрипт: шапка, подвал, меню, демо-взаимодействия */
(function () {
  var page = document.body.getAttribute('data-page') || '';

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

  var header =
    '<header class="site"><div class="container nav">' +
      '<a href="index.html" class="logo">' + logoSvg +
        '<span class="lg-col"><span class="lg-txt">ECOM <span>KG</span></span>' +
        '<span class="lg-sub">Трансграничная торговля и логистика КР</span></span>' +
      '</a>' +
      '<button class="burger" aria-label="Меню" id="burger">☰</button>' +
      '<nav class="nav-links" id="navLinks">' + links + '</nav>' +
      '<div class="nav-right">' +
        '<div class="lang"><span class="globe">🌐</span><a class="active" data-lang="ru">RU</a><a data-lang="kg">KG</a><a data-lang="en">EN</a></div>' +
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
          '<div class="foot-socials"><a href="#" title="Telegram">TG</a><a href="#" title="Instagram">IG</a><a href="#" title="YouTube">YT</a><a href="#" title="LinkedIn">in</a></div>' +
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
          '<span class="lang lang-foot"><a class="active" data-lang="ru">RU</a><a data-lang="kg">KG</a><a data-lang="en">EN</a></span>' +
          '<a href="offer.html">Договор оферты</a><a href="privacy.html">Политика конфиденциальности</a>' +
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

  // Демо: перехват форм и кнопок-заявок
  document.addEventListener('submit', function (e) {
    if (e.target.matches('[data-demo]')) {
      e.preventDefault();
      alert('Демо-режим: данные приняты. На рабочей версии здесь будет сохранение в базу и уведомление по e-mail/SMS.');
      e.target.reset && e.target.reset();
    }
  });
  document.addEventListener('click', function (e) {
    if (e.target.matches('[data-req]')) {
      e.preventDefault();
      alert('Демо-режим: заявка отправлена партнёру. На рабочей версии заявка попадёт в CRM и личный кабинет партнёра.');
    }
    if (e.target.matches('[data-lang]')) {
      e.preventDefault();
      var l = e.target.getAttribute('data-lang');
      if (l === 'ru') return;
      alert(l === 'kg'
        ? 'Кыргызча версия — 2-этапта кошулат (по ТЗ, этап 2).'
        : 'English version is planned for stage 2 of the roadmap.');
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
