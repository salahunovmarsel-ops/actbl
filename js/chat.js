/* ECOM KG — партнёры, заявки и чат (Supabase). Требует js/main.js (window.ecomDB). */
(function () {
  function sb(cb) { if (window.ecomDB && window.ecomDB.client) window.ecomDB.client(cb); else cb(null); }
  function esc(s) { return (s == null ? '' : s).toString().replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; }); }
  function withUser(cb) { sb(function (c) { if (!c) { cb(null, null); return; } c.auth.getUser().then(function (u) { cb(c, (u && u.data && u.data.user) || null); }); }); }

  var ecomChat = {};

  ecomChat.open = function (requestId, title) {
    sb(function (c) {
      if (!c) { alert('Чат недоступен: база не подключена.'); return; }
      c.auth.getUser().then(function (u) {
        var me = (u && u.data && u.data.user) ? u.data.user.id : null;
        var ov = document.createElement('div'); ov.className = 'modal-ov';
        ov.innerHTML = '<div class="modal chat-modal"><button class="modal-x" aria-label="Закрыть">×</button>' +
          '<h3>' + esc(title || 'Чат') + '</h3>' +
          '<div class="chat-msgs" id="chatMsgs"><p class="muted" style="text-align:center">Загрузка…</p></div>' +
          '<form id="chatForm" class="chat-input"><input id="chatBody" placeholder="Сообщение…" autocomplete="off" required><button class="btn btn-primary" type="submit">▶</button></form>' +
          '</div>';
        document.body.appendChild(ov);
        var box = ov.querySelector('#chatMsgs'); var channel = null; var seen = {};
        function close() { if (channel) c.removeChannel(channel); ov.remove(); }
        ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.modal-x')) close(); });
        function bubble(m) {
          var mine = m.sender_id === me;
          return '<div class="bubble ' + (mine ? 'me' : 'them') + '">' + esc(m.body) +
            '<span class="t">' + new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + '</span></div>';
        }
        function append(m) { if (seen[m.id]) return; seen[m.id] = 1; var e = box.querySelector('.muted'); if (e) e.remove(); box.insertAdjacentHTML('beforeend', bubble(m)); box.scrollTop = box.scrollHeight; }
        c.from('messages').select('id,sender_id,body,created_at').eq('request_id', requestId).order('created_at', { ascending: true }).then(function (r) {
          box.innerHTML = '';
          if (r.error) { box.innerHTML = '<p class="muted" style="text-align:center">Не удалось загрузить сообщения.</p>'; return; }
          if (!r.data.length) box.innerHTML = '<p class="muted" style="text-align:center">Сообщений пока нет. Напишите первым 👋</p>';
          r.data.forEach(append);
        });
        channel = c.channel('req-' + requestId)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'request_id=eq.' + requestId }, function (p) { append(p.new); })
          .subscribe();
        ov.querySelector('#chatForm').addEventListener('submit', function (e) {
          e.preventDefault();
          var inp = ov.querySelector('#chatBody'); var body = inp.value.trim(); if (!body) return; inp.value = '';
          c.from('messages').insert({ request_id: requestId, sender_id: me, body: body }).select('id,sender_id,body,created_at').single().then(function (r) {
            if (r.error) { alert('Не удалось отправить сообщение.'); inp.value = body; }
            else append(r.data); // подстраховка, если realtime выключен
          });
        });
      });
    });
  };

  ecomChat.startAndOpen = function (partnerId, partnerName) {
    withUser(function (c, user) {
      if (!c) { alert('База не подключена.'); return; }
      if (!user) { alert('Войдите как клиент, чтобы написать компании.'); location.href = 'login.html'; return; }
      c.from('requests').select('id').eq('client_id', user.id).eq('partner_id', partnerId).limit(1).then(function (r) {
        if (r.data && r.data.length) { ecomChat.open(r.data[0].id, partnerName); return; }
        c.from('requests').insert({ client_id: user.id, partner_id: partnerId, subject: partnerName }).select('id').single().then(function (r2) {
          if (r2.error) { alert('Не удалось создать заявку.'); return; }
          ecomChat.open(r2.data.id, partnerName);
        });
      });
    });
  };

  ecomChat.loadCatalog = function (container, emptyCb) {
    sb(function (c) {
      if (!c) { if (emptyCb) emptyCb(); return; }
      c.from('partners').select('id,name,category,description,discount').eq('approved', true).order('created_at', { ascending: false }).then(function (r) {
        if (r.error || !r.data || !r.data.length) { if (emptyCb) emptyCb(); return; }
        container.innerHTML = r.data.map(function (p) {
          return '<div class="card"><div class="ico">🏢</div><h3>' + esc(p.name) + '</h3>' +
            '<p class="muted">' + esc(p.category || '') + (p.description ? ' · ' + esc(p.description) : '') + '</p>' +
            (p.discount ? '<div><span class="tag">' + esc(p.discount) + '</span></div>' : '') +
            '<button class="btn btn-primary btn-sm" data-partner="' + p.id + '" data-name="' + esc(p.name) + '">Написать компании</button></div>';
        }).join('');
      });
    });
  };

  ecomChat.myRequests = function (container) {
    withUser(function (c, user) {
      if (!c || !user) { container.innerHTML = '<p class="muted">Войдите, чтобы видеть заявки.</p>'; return; }
      c.from('requests').select('id,subject,created_at,partners(name)').eq('client_id', user.id).order('created_at', { ascending: false }).then(function (r) {
        if (r.error || !r.data.length) { container.innerHTML = '<p class="muted">Заявок пока нет. Найдите компанию в <a href="catalog.html">каталоге</a> и напишите ей.</p>'; return; }
        container.innerHTML = r.data.map(function (q) {
          var nm = q.partners ? q.partners.name : (q.subject || 'Компания');
          return '<div class="req-row"><div><b>' + esc(nm) + '</b><br><span class="muted" style="font-size:.8rem">' + new Date(q.created_at).toLocaleDateString('ru-RU') + '</span></div><button class="btn btn-outline btn-sm" data-open="' + q.id + '" data-name="' + esc(nm) + '">Открыть чат</button></div>';
        }).join('');
      });
    });
  };

  ecomChat.partnerRequests = function (container) {
    withUser(function (c, user) {
      if (!c || !user) { container.innerHTML = '<p class="muted">Войдите как партнёр.</p>'; return; }
      c.from('requests').select('id,created_at,partners!inner(name,owner_id)').eq('partners.owner_id', user.id).order('created_at', { ascending: false }).then(function (r) {
        if (r.error || !r.data.length) { container.innerHTML = '<p class="muted">Заявок от клиентов пока нет.</p>'; return; }
        container.innerHTML = r.data.map(function (q) {
          return '<div class="req-row"><div><b>Заявка · ' + esc(q.partners ? q.partners.name : '') + '</b><br><span class="muted" style="font-size:.8rem">' + new Date(q.created_at).toLocaleDateString('ru-RU') + '</span></div><button class="btn btn-primary btn-sm" data-open="' + q.id + '" data-name="Диалог с клиентом">Ответить</button></div>';
        }).join('');
      });
    });
  };

  ecomChat.myPartners = function (container) {
    withUser(function (c, user) {
      if (!c || !user) return;
      function load() {
        c.from('partners').select('id,name,category,approved').eq('owner_id', user.id).then(function (r) {
          var list = (r.data || []).map(function (p) { return '<div class="req-row"><div><b>' + esc(p.name) + '</b> <span class="muted">' + esc(p.category || '') + '</span></div><span class="status ' + (p.approved ? 'st-ok' : 'st-wait') + '">' + (p.approved ? 'В каталоге' : 'На модерации') + '</span></div>'; }).join('');
          container.innerHTML = list +
            '<form id="pForm" style="margin-top:14px">' +
            '<div class="field"><label>Название компании</label><input id="pName" required></div>' +
            '<div class="field"><label>Категория</label><input id="pCat" placeholder="Логистика / Карго / Финансы…"></div>' +
            '<div class="field"><label>Описание</label><input id="pDesc"></div>' +
            '<div class="field"><label>Скидка членам (необязательно)</label><input id="pDisc"></div>' +
            '<button class="btn btn-primary btn-sm" type="submit">Добавить компанию</button></form>';
          container.querySelector('#pForm').addEventListener('submit', function (e) {
            e.preventDefault();
            c.from('partners').insert({ owner_id: user.id, name: container.querySelector('#pName').value, category: container.querySelector('#pCat').value, description: container.querySelector('#pDesc').value, discount: container.querySelector('#pDisc').value }).then(function (r) {
              if (r.error) { alert('Не удалось добавить компанию.'); return; }
              alert('Компания добавлена. Появится в каталоге после одобрения администратором.');
              load();
            });
          });
        });
      }
      load();
    });
  };

  ecomChat.adminPartners = function (container) {
    sb(function (c) {
      if (!c) return;
      function load() {
        c.from('partners').select('id,name,category,approved,created_at').order('created_at', { ascending: false }).then(function (r) {
          if (r.error) { container.innerHTML = '<p class="muted">Нет доступа или таблица не создана (выполните supabase-chat.sql).</p>'; return; }
          if (!r.data.length) { container.innerHTML = '<p class="muted">Компаний пока нет.</p>'; return; }
          container.innerHTML = '<table><thead><tr><th>Компания</th><th>Категория</th><th>Статус</th><th></th></tr></thead><tbody>' +
            r.data.map(function (p) { return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.category || '') + '</td><td><span class="status ' + (p.approved ? 'st-ok' : 'st-wait') + '">' + (p.approved ? 'В каталоге' : 'Модерация') + '</span></td><td>' + (p.approved ? '<button class="btn btn-outline btn-sm" data-unapprove="' + p.id + '">Скрыть</button>' : '<button class="btn btn-primary btn-sm" data-approve="' + p.id + '">Одобрить</button>') + '</td></tr>'; }).join('') +
            '</tbody></table>';
        });
      }
      container.addEventListener('click', function (e) {
        var a = e.target.closest('[data-approve]'); var u = e.target.closest('[data-unapprove]');
        if (a) c.from('partners').update({ approved: true }).eq('id', a.getAttribute('data-approve')).then(load);
        if (u) c.from('partners').update({ approved: false }).eq('id', u.getAttribute('data-unapprove')).then(load);
      });
      load();
    });
  };

  document.addEventListener('click', function (e) {
    var w = e.target.closest('[data-partner]');
    if (w) { e.preventDefault(); ecomChat.startAndOpen(w.getAttribute('data-partner'), w.getAttribute('data-name')); return; }
    var o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); ecomChat.open(o.getAttribute('data-open'), o.getAttribute('data-name')); return; }
  });

  window.ecomChat = ecomChat;
})();
