/* D'Todo Eventos — interacción del sitio */
(function () {
  'use strict';
  var WA = '50378747425';
  var CATS = window.CATEGORIAS || [];
  var SECS = window.SECCIONES || [];

  // Foto de portada para cada categoría en la página de inicio
  var PORTADAS = {
    sillas: 'img/site/galeria-15.jpg',
    mesas: 'img/site/galeria-09.jpg',
    infantil: null,
    manteleria: 'img/site/galeria-04.jpg',
    cristaleria: 'img/site/intro.jpg',
    letras: null,
    complementario: 'img/site/galeria-02.jpg',
    especiales: null
  };

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function src(p) { return p.replace(/^\//, ''); }

  // ---------- Menú y año ----------
  var menuBtn = $('.menu-btn'), nav = $('#nav');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('abierto');
      menuBtn.setAttribute('aria-expanded', open);
    });
    $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('abierto'); }); });
  }
  var anio = $('#anio'); if (anio) anio.textContent = new Date().getFullYear();

  // ---------- Visor de fotos ----------
  var visor = $('#visor'), vImg = visor && $('img', visor), vTit = visor && $('.titulo-visor', visor);
  var vLista = [], vPos = 0;
  function abrirVisor(lista, pos) {
    vLista = lista; vPos = pos; mostrar();
    visor.classList.add('visible'); document.body.style.overflow = 'hidden';
    $('.cerrar', visor).focus();
  }
  function mostrar() {
    var it = vLista[vPos]; vImg.src = src(it.i); vImg.alt = it.n || 'Foto'; vTit.textContent = it.n || '';
    var multi = vLista.length > 1;
    $('.prev', visor).style.display = multi ? '' : 'none';
    $('.next', visor).style.display = multi ? '' : 'none';
  }
  function cerrarVisor() { visor.classList.remove('visible'); document.body.style.overflow = ''; }
  if (visor) {
    $('.cerrar', visor).addEventListener('click', cerrarVisor);
    $('.prev', visor).addEventListener('click', function () { vPos = (vPos - 1 + vLista.length) % vLista.length; mostrar(); });
    $('.next', visor).addEventListener('click', function () { vPos = (vPos + 1) % vLista.length; mostrar(); });
    visor.addEventListener('click', function (e) { if (e.target === visor) cerrarVisor(); });
    document.addEventListener('keydown', function (e) {
      if (!visor.classList.contains('visible')) return;
      if (e.key === 'Escape') cerrarVisor();
      if (e.key === 'ArrowLeft') $('.prev', visor).click();
      if (e.key === 'ArrowRight') $('.next', visor).click();
    });
  }

  // ---------- Inicio ----------
  var catGrid = $('#categorias');
  if (catGrid) {
    catGrid.innerHTML = CATS.map(function (c) {
      var secs = SECS.filter(function (s) { return s.cat === c.id; });
      var total = secs.reduce(function (a, s) { return a + s.items.length; }, 0);
      var img = PORTADAS[c.id] || (secs[0] && (secs[0].fotos[0] || secs[0].items[0].i));
      if (c.id === 'infantil') img = secs[0].items[0].i;
      if (c.id === 'letras') img = secs[0].items[1].i;
      if (c.id === 'especiales') img = secs[0].items[secs[0].items.length - 1].i;
      return '<a class="cat-card" href="catalogo.html#' + c.id + '">' +
        '<img src="' + src(img) + '" alt="" loading="lazy">' +
        '<span class="cuenta">' + total + ' artículos</span>' +
        '<div class="info"><h3>' + esc(c.nombre) + '</h3><p>' + esc(c.desc) + '</p></div></a>';
    }).join('');
  }
  var gal = $('#galeria');
  if (gal) {
    var fotos = (window.GALERIA || []).map(function (i) { return { i: i, n: '' }; });
    gal.innerHTML = fotos.map(function (f, k) {
      return '<button data-k="' + k + '" aria-label="Ampliar foto ' + (k + 1) + '"><img src="' + src(f.i) + '" alt="Montaje de evento de D\'Todo Eventos" loading="lazy"></button>';
    }).join('');
    gal.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (b) abrirVisor(fotos, +b.dataset.k);
    });
  }

  // ---------- Catálogo ----------
  var cont = $('#catalogo');
  if (!cont) return;

  // Lista de cotización (se guarda en este navegador)
  var CLAVE = 'dtodo-cotizacion';
  var lista = [];
  try { lista = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { lista = []; }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch (e) { /* sin almacenamiento */ } }
  function enLista(k) { return lista.some(function (x) { return x.k === k; }); }

  // Pintar secciones
  var html = '';
  CATS.forEach(function (c) {
    var secs = SECS.filter(function (s) { return s.cat === c.id; });
    if (!secs.length) return;
    html += '<div class="grupo" data-cat="' + c.id + '"><div class="categoria-titulo bloque" id="' + c.id + '"><h2 class="pincel">' + esc(c.nombre) + '</h2></div>';
    secs.forEach(function (s, si) {
      var color = s.tipo === 'color';
      html += '<section class="bloque" data-cat="' + c.id + '" style="padding-top:' + (si ? 36 : 12) + 'px">' +
        '<div class="bloque-cab"><h2>' + (s.titulo === c.nombre ? '' : esc(s.titulo)) + '</h2><span class="meta">' + s.items.length + (color ? ' colores y diseños' : ' artículos') + '</span></div>' +
        '<div class="' + (color ? 'grid-color' : 'grid-prod') + '">';
      s.items.forEach(function (it, ii) {
        var k = s.titulo + ' · ' + it.n;
        html += '<article class="prod' + (color ? ' color' : '') + '" data-busca="' + esc(norm(it.n + ' ' + s.titulo + ' ' + c.nombre)) + '">' +
          '<button class="foto" data-s="' + SECS.indexOf(s) + '" data-i="' + ii + '" aria-label="Ampliar foto de ' + esc(it.n) + '"><img src="' + src(it.i) + '" alt="' + esc(it.n) + '" loading="lazy"></button>' +
          '<div class="cuerpo"><h3>' + esc(it.n) + '</h3>' +
          '<div class="pedir" data-k="' + esc(k) + '" data-n="' + esc(it.n) + '" data-sec="' + esc(s.titulo) + '" data-img="' + esc(it.i) + '">' +
          '<input class="cant" type="number" min="1" inputmode="numeric" placeholder="Cant." aria-label="Cantidad de ' + esc(it.n) + '">' +
          '<button class="agregar" aria-pressed="false">Agregar</button></div></div></article>';
      });
      html += '</div>';
      if (s.fotos.length) {
        html += '<div class="ambiente-titulo">Así se ve en un evento</div><div class="ambiente">' +
          s.fotos.map(function (f, fi) { return '<button data-s="' + SECS.indexOf(s) + '" data-f="' + fi + '" aria-label="Ampliar foto de montaje"><img src="' + src(f) + '" alt="Montaje con ' + esc(s.titulo.toLowerCase()) + '" loading="lazy"></button>'; }).join('') + '</div>';
      }
      if (s.nota) html += '<p class="nota">' + esc(s.nota) + '</p>';
      html += '</section>';
    });
    html += '</div>';
  });
  cont.innerHTML = html;

  // Fotos ampliadas
  cont.addEventListener('click', function (e) {
    var b = e.target.closest('.foto, .ambiente button');
    if (b) {
      var s = SECS[+b.dataset.s];
      if (b.dataset.f !== undefined) abrirVisor(s.fotos.map(function (f) { return { i: f, n: s.titulo }; }), +b.dataset.f);
      else abrirVisor(s.items, +b.dataset.i);
      return;
    }
    var a = e.target.closest('.agregar');
    if (a) alternar(a.closest('.pedir'));
  });
  function buscarItem(k) { for (var i = 0; i < lista.length; i++) if (lista[i].k === k) return lista[i]; return null; }
  function alternar(p) {
    var k = p.dataset.k, inp = $('.cant', p);
    if (enLista(k)) lista = lista.filter(function (x) { return x.k !== k; });
    else {
      var q = parseInt(inp.value, 10);
      lista.push({ k: k, n: p.dataset.n, sec: p.dataset.sec, i: p.dataset.img, q: q > 0 ? String(q) : '1' });
    }
    guardar(); actualizar();
  }
  // Escribir la cantidad: si ya está en la lista, se actualiza; Enter la agrega
  cont.addEventListener('input', function (e) {
    if (!e.target.classList.contains('cant')) return;
    var x = buscarItem(e.target.closest('.pedir').dataset.k);
    if (x) { x.q = e.target.value; guardar(); pintarLista(); }
  });
  cont.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.classList.contains('cant')) {
      var p = e.target.closest('.pedir'); if (!enLista(p.dataset.k)) alternar(p);
    }
  });

  // Filtros por categoría
  var chips = $('#chips');
  chips.innerHTML = '<button class="chip" data-cat="" aria-pressed="true">Todo</button>' +
    CATS.map(function (c) { return '<button class="chip" data-cat="' + c.id + '" aria-pressed="false">' + esc(c.nombre) + '</button>'; }).join('');
  var catActiva = '';
  function elegir(cat, desplazar) {
    catActiva = cat;
    $$('.chip', chips).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.cat === cat); });
    filtrar();
    var activo = $('.chip[aria-pressed="true"]', chips);
    if (activo) activo.scrollIntoView({ inline: 'center', block: 'nearest' });
    if (desplazar) window.scrollTo({ top: 0 });
    if (history.replaceState) history.replaceState(null, '', cat ? '#' + cat : location.pathname);
  }
  chips.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b) elegir(b.dataset.cat, true); });

  // Búsqueda
  var buscar = $('#buscar');
  buscar.addEventListener('input', filtrar);
  function filtrar() {
    var q = norm(buscar.value.trim());
    var hay = 0;
    $$('.grupo').forEach(function (g) {
      var visibleGrupo = false;
      if (catActiva && g.dataset.cat !== catActiva) { g.hidden = true; return; }
      $$('section.bloque', g).forEach(function (sec) {
        var n = 0;
        $$('.prod', sec).forEach(function (p) {
          var ok = !q || q.split(/\s+/).every(function (w) { return p.dataset.busca.indexOf(w) > -1; });
          p.hidden = !ok; if (ok) n++;
        });
        sec.hidden = n === 0;
        var amb = $$('.ambiente, .ambiente-titulo', sec);
        amb.forEach(function (x) { x.hidden = !!q; });
        if (n) visibleGrupo = true;
        hay += n;
      });
      g.hidden = !visibleGrupo;
    });
    $('#sin-resultados').style.display = hay ? 'none' : 'block';
  }

  // Barra y panel de cotización
  var barra = $('#cotiza-barra'), panel = $('#panel'), fondo = $('#panel-fondo'), ul = $('#lista');
  function actualizar() {
    $$('.pedir', cont).forEach(function (p) {
      var x = buscarItem(p.dataset.k), a = $('.agregar', p), inp = $('.cant', p);
      a.setAttribute('aria-pressed', !!x);
      a.textContent = x ? '✓ Listo' : 'Agregar';
      a.setAttribute('aria-label', x ? 'Quitar ' + p.dataset.n + ' de la lista' : 'Agregar ' + p.dataset.n + ' a la lista');
      if (document.activeElement !== inp) inp.value = x ? x.q : '';
    });
    pintarLista();
  }
  function pintarLista() {
    var n = lista.length;
    $('#cotiza-cuenta').textContent = n + (n === 1 ? ' artículo' : ' artículos');
    barra.classList.toggle('visible', n > 0);
    document.body.classList.toggle('con-cotizacion', n > 0);
    ul.innerHTML = lista.map(function (x, k) {
      return '<li><img src="' + src(x.i) + '" alt=""><div class="n">' + esc(x.n) + '<small>' + esc(x.sec) + '</small></div>' +
        '<input type="number" min="1" inputmode="numeric" placeholder="Cant" value="' + esc(x.q) + '" data-k="' + k + '" aria-label="Cantidad de ' + esc(x.n) + '">' +
        '<button class="quitar" data-k="' + k + '" aria-label="Quitar ' + esc(x.n) + '">×</button></li>';
    }).join('');
    if (!n) cerrarPanel();
  }
  ul.addEventListener('input', function (e) {
    if (!e.target.dataset.k) return;
    var x = lista[+e.target.dataset.k]; x.q = e.target.value; guardar();
    $$('.pedir', cont).forEach(function (p) { if (p.dataset.k === x.k) $('.cant', p).value = x.q; });
  });
  ul.addEventListener('click', function (e) {
    var b = e.target.closest('.quitar'); if (!b) return;
    lista.splice(+b.dataset.k, 1); guardar(); actualizar();
  });
  function abrirPanel() { panel.classList.add('visible'); fondo.classList.add('visible'); document.body.style.overflow = 'hidden'; }
  function cerrarPanel() { panel.classList.remove('visible'); fondo.classList.remove('visible'); document.body.style.overflow = ''; }
  $('#ver-lista').addEventListener('click', abrirPanel);
  $('#cerrar-panel').addEventListener('click', cerrarPanel);
  fondo.addEventListener('click', cerrarPanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarPanel(); });
  $('#vaciar').addEventListener('click', function () { lista = []; guardar(); actualizar(); });

  function enviar() {
    var t = 'Hola D\'Todo Eventos, quiero cotizar lo siguiente:\n\n';
    lista.forEach(function (x) { t += '• ' + (x.q ? x.q + ' x ' : '') + x.n + ' (' + x.sec + ')\n'; });
    var f = $('#fecha').value, l = $('#lugar').value.trim(), c = $('#comentario').value.trim();
    if (f) { var p = f.split('-'); t += '\nFecha del evento: ' + p[2] + '/' + p[1] + '/' + p[0]; }
    if (l) t += '\nLugar / evento: ' + l;
    if (c) t += '\nComentarios: ' + c;
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
  }
  $('#enviar').addEventListener('click', enviar);
  $('#enviar-rapido').addEventListener('click', abrirPanel);

  window.addEventListener('hashchange', function () {
    var h = location.hash.replace('#', '');
    if (CATS.some(function (c) { return c.id === h; })) elegir(h, true);
  });
  actualizar();
  var inicial = location.hash.replace('#', '');
  if (CATS.some(function (c) { return c.id === inicial; })) elegir(inicial, false); else filtrar();
})();
