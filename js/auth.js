/* ECOM KG — авторизация и роли через Supabase.
   Пока в supabase-config.js пусто — сайт работает в ДЕМО-режиме (как раньше).
   Как впишете URL и anon-ключ — включается настоящая авторизация. */
(function () {
  var URL = window.SUPABASE_URL || '';
  var KEY = window.SUPABASE_ANON_KEY || '';
  var configured = URL.indexOf('http') === 0 && KEY.length > 20;

  var loginByRole = { client: 'login.html', partner: 'partner-login.html', admin: 'admin-login.html' };
  var homeByRole = { client: 'cabinet.html', partner: 'partner.html', admin: 'admin.html' };

  var _client = null;
  function withClient(cb) {
    if (_client) { cb(_client); return; }
    if (window.supabase) { _client = window.supabase.createClient(URL, KEY); cb(_client); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = function () { _client = window.supabase.createClient(URL, KEY); cb(_client); };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }

  function roleOf(sb, userId) {
    return sb.from('profiles').select('role').eq('id', userId).single()
      .then(function (r) { return r.data ? r.data.role : null; });
  }

  window.ecomAuth = {
    configured: configured,

    /* Вход с проверкой роли. onErr(msg) — показать ошибку. */
    signIn: function (email, password, expectedRole, onErr) {
      if (!configured) { location.href = homeByRole[expectedRole] || 'cabinet.html'; return; }
      withClient(function (sb) {
        if (!sb) { onErr && onErr('Нет связи с сервером. Попробуйте позже.'); return; }
        sb.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
          if (res.error) { onErr && onErr('Неверный e-mail или пароль.'); return; }
          roleOf(sb, res.data.user.id).then(function (role) {
            if (expectedRole && role !== expectedRole) {
              sb.auth.signOut();
              onErr && onErr('Этот вход не для вашей роли. Откройте нужную страницу входа.');
              return;
            }
            location.href = homeByRole[role] || 'cabinet.html';
          });
        });
      });
    },

    /* Регистрация клиента. */
    signUp: function (email, password, fullName, onOk, onErr) {
      if (!configured) { onOk && onOk(false); return; }
      withClient(function (sb) {
        if (!sb) { onErr && onErr('Нет связи с сервером.'); return; }
        sb.auth.signUp({ email: email, password: password, options: { data: { full_name: fullName } } })
          .then(function (res) {
            if (res.error) { onErr && onErr(res.error.message); return; }
            // Если включено подтверждение e-mail — сессии сразу нет.
            onOk && onOk(!res.data.session);
          });
      });
    },

    /* Защита страницы: пускает только нужную роль, иначе — на вход. */
    guard: function (requiredRole) {
      if (!configured) return; // демо: не блокируем
      withClient(function (sb) {
        if (!sb) return;
        sb.auth.getSession().then(function (res) {
          var session = res.data.session;
          if (!session) { location.replace(loginByRole[requiredRole] || 'login.html'); return; }
          roleOf(sb, session.user.id).then(function (role) {
            if (role !== requiredRole) location.replace(loginByRole[requiredRole] || 'login.html');
          });
        });
      });
    },

    signOut: function () {
      if (!configured) { location.href = 'index.html'; return; }
      withClient(function (sb) {
        if (!sb) { location.href = 'index.html'; return; }
        sb.auth.signOut().then(function () { location.href = 'index.html'; });
      });
    }
  };
})();
