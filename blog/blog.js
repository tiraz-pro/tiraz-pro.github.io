/* مدونة طراز — سكربت خفيف مشترك: شريط التقدّم، التشيك ليست، المشاركة، والبحث */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* شريط التقدّم */
  var art = $('.abody'), bar = document.getElementById('pbar');
  if (art && bar) {
    var upd = function () {
      var top = art.offsetTop, h = art.offsetHeight - innerHeight * .5;
      bar.style.width = Math.min(100, Math.max(0, (scrollY - top + innerHeight * .35) / h * 100)) + '%';
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  /* تشيك ليست */
  $$('.checklist').forEach(function (cl) {
    var boxes = $$('input', cl), out = $('.chprog', cl);
    cl.addEventListener('change', function () {
      out.textContent = boxes.filter(function (b) { return b.checked; }).length + ' / ' + boxes.length;
    });
  });

  /* رسوم قديمة: تبدأ من نص الرسم */
  $$('.abody figure .fw:not(.nm)').forEach(function (fw) {
    requestAnimationFrame(function () {
      if (fw.scrollWidth > fw.clientWidth) fw.scrollLeft = (fw.scrollWidth - fw.clientWidth) / 2;
    });
  });

  /* مشاركة */
  var wa = $('[data-wa]'), cp = $('[data-cp]');
  if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(document.title + '\n' + location.href);
  if (cp) cp.addEventListener('click', function () {
    var done = function () { cp.textContent = 'اتنسخ ✓'; setTimeout(function () { cp.textContent = 'انسخ الرابط'; }, 1900); };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () {}); else done();
  });

  /* بحث الفهرس */
  var q = document.getElementById('q');
  if (q) {
    var data = null, loading = false;
    var norm = function (s) {
      return (s || '').toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
    };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var run = function () {
      var nq = norm(q.value).trim(), res = document.getElementById('sres'), br = document.getElementById('browse');
      if (nq.length < 2) { res.hidden = true; br.hidden = false; return; }
      var words = nq.split(/\s+/);
      var score = function (a) {
        var t = norm(a.t), s = 0;
        words.forEach(function (w) { if (t.indexOf(w) > -1) s += 3; if (norm(a.g.join(' ') + ' ' + a.k.join(' ')).indexOf(w) > -1) s += 1; });
        return s;
      };
      var hits = data.filter(function (a) {
        var hay = norm(a.t + ' ' + a.e + ' ' + a.g.join(' ') + ' ' + a.k.join(' '));
        return words.every(function (w) { return hay.indexOf(w) > -1; });
      }).sort(function (a, b) { return score(b) - score(a); });
      document.getElementById('sresT').textContent = hits.length ? 'نتايج البحث (' + hits.length + ')' : 'مفيش نتايج';
      document.getElementById('sresG').innerHTML = hits.length ? hits.slice(0, 60).map(function (a) {
        return '<a class="card" href="' + a.u + '"><div class="kick">' + esc(a.c) + '</div><h3>' + esc(a.t) + '</h3><p>' + esc(a.e) + '</p>' +
          '<div class="rd"><span class="mono">' + a.m + ' دقيقة</span><span class="go">اقرأ ←</span></div></a>';
      }).join('') : '<div class="empty">جرّب كلمة تانية، أو اتصفح الأقسام.</div>';
      res.hidden = false; br.hidden = true;
    };
    var load = function () {
      if (data || loading) return; loading = true;
      fetch('/blog/search-index.json').then(function (r) { return r.json(); }).then(function (j) { data = j; run(); });
    };
    q.addEventListener('focus', load);
    q.addEventListener('input', function () { if (data) run(); else load(); });
  }
})();
