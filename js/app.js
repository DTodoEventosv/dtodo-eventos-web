/* D'Todo Eventos — interacción del sitio */
(function () {
  'use strict';
  var WA = '50378747425';
  var CATS = window.CATEGORIAS || [];
  var SECS = window.SECCIONES || [];

  // Foto de portada para cada categoría en la página de inicio
  var PORTADAS = {
    sillas: 'img/site/galeria-12.jpg',
    mesas: 'img/site/galeria-08.jpg',
    infantil: 'img/site/infantil.jpg',
    manteleria: 'img/site/galeria-02.jpg',
    cristaleria: 'img/site/galeria-06.jpg',
    letras: 'img/site/letras.jpg',
    complementario: 'img/site/galeria-01.jpg',
    especiales: 'img/site/toldos.jpg'
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
  // La lista empieza vacía cada vez que se abre la página; se borra lo que haya quedado guardado antes
  try { localStorage.removeItem(CLAVE); localStorage.removeItem('dtodo-cotizacion-datos'); } catch (e) { /* nada */ }
  lista = lista.filter(function (x) { return x && x.k; }).map(function (x) { x.q = Math.max(1, parseInt(x.q, 10) || 1); return x; });
  function guardar() { /* la lista no se guarda entre visitas */ }
  function buscarItem(k) { for (var i = 0; i < lista.length; i++) if (lista[i].k === k) return lista[i]; return null; }
  function cantidad(k) { var x = buscarItem(k); return x ? x.q : 0; }
  var DATOS = {}; // datos de cada artículo por clave

  function stepper(k, n) {
    return '<div class="step" data-k="' + esc(k) + '"><button type="button" data-d="-1" aria-label="Quitar uno">−</button>' +
      '<input type="number" inputmode="numeric" min="0" value="' + n + '" aria-label="Cantidad"><button type="button" data-d="1" aria-label="Agregar uno">+</button></div>';
  }
  function control(k) {
    var n = cantidad(k);
    return n ? stepper(k, n) : '<button type="button" class="agregar" data-add="' + esc(k) + '">Agregar</button>';
  }

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
        if (DATOS[k]) k += ' (' + (ii + 1) + ')';
        DATOS[k] = { n: it.n, sec: s.titulo, i: it.i, cat: c.nombre };
        html += '<article class="prod' + (color ? ' color' : '') + '" data-k="' + esc(k) + '" data-busca="' + esc(norm(it.n + ' ' + s.titulo + ' ' + c.nombre)) + '">' +
          '<button class="foto" data-s="' + SECS.indexOf(s) + '" data-i="' + ii + '" aria-label="Ampliar foto de ' + esc(it.n) + '"><img src="' + src(it.i) + '" alt="' + esc(it.n) + '" loading="lazy"><span class="badge" hidden></span></button>' +
          '<div class="cuerpo"><h3>' + esc(it.n) + '</h3><div class="ctl">' + control(k) + '</div></div></article>';
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

  // Cambiar cantidades
  function fijar(k, n) {
    n = Math.max(0, Math.floor(n || 0));
    var x = buscarItem(k);
    if (!n) lista = lista.filter(function (y) { return y.k !== k; });
    else if (x) x.q = n;
    else { var d = DATOS[k]; lista.push({ k: k, n: d.n, sec: d.sec, i: d.i, q: n }); }
    guardar();
  }
  function pintarTarjeta(k, rehacer) {
    var card = cont.querySelector('.prod[data-k="' + CSS.escape(k) + '"]');
    if (!card) return;
    var n = cantidad(k), bd = $('.badge', card);
    card.classList.toggle('has', n > 0);
    bd.hidden = !n; bd.textContent = n ? n.toLocaleString('es') : '';
    if (rehacer) $('.ctl', card).innerHTML = control(k);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.step button');
    if (b) {
      var st = b.closest('.step'), k = st.dataset.k;
      fijar(k, cantidad(k) + (+b.dataset.d));
      var n = cantidad(k), inp = $('input', st);
      if (n) inp.value = n;
      pintarTarjeta(k, !n); resumen(); if (!n || st.closest('#lista')) pintarLista();
      $$('.step[data-k="' + CSS.escape(k) + '"] input').forEach(function (i) { if (n) i.value = n; });
      return;
    }
    var ad = e.target.closest('[data-add]');
    if (ad) {
      var key = ad.dataset.add; fijar(key, 1); pintarTarjeta(key, true); resumen();
      var i2 = cont.querySelector('.prod[data-k="' + CSS.escape(key) + '"] .step input'); if (i2) { i2.focus(); i2.select(); }
      return;
    }
    var f = e.target.closest('.foto, .ambiente button');
    if (f && cont.contains(f)) {
      var s = SECS[+f.dataset.s];
      if (f.dataset.f !== undefined) abrirVisor(s.fotos.map(function (x) { return { i: x, n: s.titulo }; }), +f.dataset.f);
      else abrirVisor(s.items, +f.dataset.i);
    }
  });
  document.addEventListener('input', function (e) {
    var st = e.target.closest('.step'); if (!st) return;
    var k = st.dataset.k, v = parseInt(e.target.value, 10);
    if (!(v > 0)) return; // vacío o 0 mientras escribe: se resuelve al salir
    fijar(k, v); pintarTarjeta(k, false); resumen();
    $$('.step[data-k="' + CSS.escape(k) + '"] input').forEach(function (i) { if (i !== e.target) i.value = v; });
  });
  document.addEventListener('change', function (e) {
    var st = e.target.closest('.step'); if (!st) return;
    var k = st.dataset.k, v = parseInt(e.target.value, 10) || 0;
    fijar(k, v); pintarTarjeta(k, !v); resumen(); pintarLista();
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
        $$('.ambiente, .ambiente-titulo', sec).forEach(function (x) { x.hidden = !!q; });
        if (n) visibleGrupo = true;
        hay += n;
      });
      g.hidden = !visibleGrupo;
    });
    $('#sin-resultados').style.display = hay ? 'none' : 'block';
  }

  // Barra y panel de cotización
  var barra = $('#cotiza-barra'), panel = $('#panel'), fondo = $('#panel-fondo'), ul = $('#lista');
  function totales() { var p = 0; lista.forEach(function (x) { p += x.q; }); return { piezas: p, articulos: lista.length }; }
  function resumen() {
    var t = totales();
    $('#cotiza-piezas').textContent = t.piezas.toLocaleString('es') + (t.piezas === 1 ? ' pieza' : ' piezas');
    $('#cotiza-cuenta').textContent = t.articulos + (t.articulos === 1 ? ' artículo en tu lista' : ' artículos en tu lista');
    $('#panel-resumen').textContent = t.articulos ? t.piezas.toLocaleString('es') + ' piezas en ' + t.articulos + (t.articulos === 1 ? ' artículo' : ' artículos') + '. Ajusta cantidades y completa los datos de tu evento.' : '';
    barra.classList.toggle('visible', t.articulos > 0);
    document.body.classList.toggle('con-cotizacion', t.articulos > 0);
    if (!t.articulos) cerrarPanel();
  }
  function pintarLista() {
    if (document.activeElement && ul.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return;
    ul.innerHTML = lista.map(function (x) {
      return '<li><img src="' + src(x.i) + '" alt=""><div class="n">' + esc(x.n) + '<small>' + esc(x.sec) + '</small></div>' +
        stepper(x.k, x.q) + '<button class="quitar" data-k="' + esc(x.k) + '" aria-label="Quitar ' + esc(x.n) + '">×</button></li>';
    }).join('');
  }
  ul.addEventListener('click', function (e) {
    var b = e.target.closest('.quitar'); if (!b) return;
    var k = b.dataset.k; fijar(k, 0); pintarTarjeta(k, true); resumen(); pintarLista();
  });
  function abrirPanel() { pintarLista(); panel.classList.add('visible'); fondo.classList.add('visible'); document.body.style.overflow = 'hidden'; }
  function cerrarPanel() { panel.classList.remove('visible'); fondo.classList.remove('visible'); document.body.style.overflow = ''; }
  $('#ver-lista').addEventListener('click', abrirPanel);
  $('#cerrar-x').addEventListener('click', cerrarPanel);
  fondo.addEventListener('click', cerrarPanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarPanel(); });
  $('#vaciar').addEventListener('click', function () {
    var ks = lista.map(function (x) { return x.k; }); lista = []; guardar();
    ks.forEach(function (k) { pintarTarjeta(k, true); }); resumen(); pintarLista();
  });

  // Datos del evento (se recuerdan en este navegador)
  var CAMPOS = ['nombre', 'fecha', 'lugar', 'tipo', 'entrega'], CLAVE_F = 'dtodo-cotizacion-datos';
  // Los datos del evento tampoco se guardan entre visitas
  function datos() {
    var f = $('#fecha').value, out = [];
    if ($('#nombre').value.trim()) out.push(['Nombre', $('#nombre').value.trim()]);
    if (f) { var p = f.split('-'); out.push(['Fecha del evento', p[2] + '/' + p[1] + '/' + p[0]]); }
    if ($('#lugar').value.trim()) out.push(['Lugar', $('#lugar').value.trim()]);
    if ($('#tipo').value) out.push(['Tipo de evento', $('#tipo').value]);
    if ($('#entrega').value) out.push(['Transporte o retiro', $('#entrega').value]);
    return out;
  }
  function mensaje() {
    var t = 'Hola D\'Todo Eventos, quiero cotizar lo siguiente:\n';
    var ultima = '';
    lista.forEach(function (x) {
      if (x.sec !== ultima) { t += '\n*' + x.sec + '*\n'; ultima = x.sec; }
      t += '• ' + x.q + ' × ' + x.n + '\n';
    });
    var tt = totales(); t += '\nTotal: ' + tt.piezas + ' piezas (' + tt.articulos + ' artículos)\n';
    datos().forEach(function (d) { t += '\n*' + d[0] + ':* ' + d[1]; });
    return t;
  }
  $('#enviar').addEventListener('click', function () {
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(mensaje()), '_blank', 'noopener');
  });

  // ---------- PDF con fotos ----------
  var JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  function cargarJsPDF() {
    return new Promise(function (ok, mal) {
      if (window.jspdf) return ok();
      var s = document.createElement('script'); s.src = JSPDF; s.onload = function () { ok(); }; s.onerror = mal; document.head.appendChild(s);
    });
  }
  function imagen(url, max) {
    return new Promise(function (res) {
      var im = new Image();
      im.onload = function () {
        var r = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * r); c.height = Math.round(im.naturalHeight * r);
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        res({ d: c.toDataURL('image/jpeg', 0.85), w: c.width, h: c.height });
      };
      im.onerror = function () { res(null); };
      im.src = url;
    });
  }
  async function crearPDF() {
    await cargarJsPDF();
    var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'letter' });
    var W = 215.9, H = 279.4, M = 14, azul = [19, 40, 74], amarillo = [242, 196, 71], gris = [107, 117, 133];
    var y = M, logo = await imagen(src('img/site/logo.png'), 600);
    if (logo) doc.addImage(logo.d, 'JPEG', M, y, 52, 52 * logo.h / logo.w);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor.apply(doc, azul);
    doc.text('Solicitud de cotización', W - M, y + 8, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, gris);
    doc.text(new Date().toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' }), W - M, y + 14, { align: 'right' });
    y += 26; doc.setDrawColor.apply(doc, amarillo); doc.setLineWidth(1); doc.line(M, y, W - M, y); y += 7;
    doc.setFontSize(10);
    datos().forEach(function (d) {
      doc.setFont('helvetica', 'bold'); doc.setTextColor.apply(doc, azul); doc.text(d[0] + ':', M, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
      var t = doc.splitTextToSize(d[1], W - 2 * M - 46); doc.text(t, M + 44, y); y += 5.5 * t.length + 0.5;
    });
    if (datos().length) y += 3;
    var fila = 24, ultima = '';
    for (var i = 0; i < lista.length; i++) {
      var x = lista[i];
      if (x.sec !== ultima) {
        if (y + 11 + fila > H - 16) { doc.addPage(); y = M; }
        doc.setFillColor.apply(doc, azul); doc.roundedRect(M, y, W - 2 * M, 8, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(255, 255, 255); doc.text(x.sec, M + 4, y + 5.5);
        y += 11; ultima = x.sec;
      }
      if (y + fila > H - 16) { doc.addPage(); y = M; }
      var im = await imagen(src(x.i), 300);
      doc.setDrawColor(225, 229, 238); doc.setLineWidth(0.3); doc.roundedRect(M, y, 20, 20, 1.5, 1.5, 'S');
      if (im) { var e = 19 / Math.max(im.w, im.h); doc.addImage(im.d, 'JPEG', M + 0.5 + (19 - im.w * e) / 2, y + 0.5 + (19 - im.h * e) / 2, im.w * e, im.h * e); }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor.apply(doc, azul);
      doc.text(doc.splitTextToSize(x.n, 120), M + 25, y + 9);
      doc.setFillColor.apply(doc, amarillo); doc.roundedRect(W - M - 32, y + 5, 32, 10, 2, 2, 'F');
      doc.setFontSize(12); doc.text(x.q.toLocaleString('es') + (x.q === 1 ? ' pieza' : ' piezas'), W - M - 16, y + 11.6, { align: 'center' });
      y += fila; doc.setDrawColor(235, 238, 244); doc.line(M, y - 2, W - M, y - 2);
    }
    var t = totales();
    if (y + 12 > H - 16) { doc.addPage(); y = M; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor.apply(doc, azul);
    doc.text('Total: ' + t.piezas.toLocaleString('es') + ' piezas en ' + t.articulos + ' artículos', W - M, y + 6, { align: 'right' });
    var pags = doc.getNumberOfPages();
    for (var p = 1; p <= pags; p++) {
      doc.setPage(p); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, gris);
      doc.text("D'Todo Eventos · WhatsApp 7874-7425 · 2289-3031 · dtodoeventos@gmail.com · www.dtodoeventos.info", W / 2, H - 7, { align: 'center' });
    }
    return doc;
  }
  function nombrePDF() {
    var n = norm($('#nombre').value || 'cliente').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return 'Cotizacion-DTodoEventos-' + (n || 'cliente') + '.pdf';
  }
  function aviso(t) { var d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 3200); }
  async function conPDF(btn, accion) {
    if (!lista.length) return;
    var antes = btn.innerHTML; btn.disabled = true; btn.textContent = 'Preparando PDF…';
    try {
      var doc = await crearPDF();
      await accion(doc);
    } catch (e) { aviso('No se pudo crear el PDF. Intenta “Enviar como texto”.'); }
    btn.disabled = false; btn.innerHTML = antes;
  }
  $('#enviar-pdf').addEventListener('click', function () {
    conPDF(this, async function (doc) {
      var file = new File([doc.output('blob')], nombrePDF(), { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "Cotización D'Todo Eventos", text: "Hola D'Todo Eventos, les comparto mi lista para cotizar." }); return; }
        catch (e) { if (e && e.name === 'AbortError') return; }
      }
      doc.save(nombrePDF());
      aviso('PDF descargado. Adjúntalo en el chat de WhatsApp que se abrió.');
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(mensaje() + '\n\n(Les envío también el PDF con las fotos.)'), '_blank', 'noopener');
    });
  });
  $('#ver-pdf').addEventListener('click', function () {
    var w = window.open('', '_blank');
    conPDF(this, async function (doc) {
      var url = URL.createObjectURL(doc.output('blob'));
      if (w) w.location.href = url; else doc.save(nombrePDF());
    });
  });

  window.addEventListener('hashchange', function () {
    var h = location.hash.replace('#', '');
    if (CATS.some(function (c) { return c.id === h; })) elegir(h, true);
  });
  lista.forEach(function (x) { pintarTarjeta(x.k, false); });
  resumen();
  var inicial = location.hash.replace('#', '');
  if (CATS.some(function (c) { return c.id === inicial; })) elegir(inicial, false); else filtrar();
})();
