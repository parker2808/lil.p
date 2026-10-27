// Motion layer for the static mockups: the techniques R6/R7 port to the
// app (see docs/plans/ui-redesign.md §8). Not product code.
// Every effect is progressive: skipped for reduced motion, coarse
// pointers, Save-Data or ?capture=1, and the page is complete without it.
(function () {
  var root = document.documentElement;
  var capture = root.classList.contains('capture');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var motionOK = !reduce && !capture;

  /* 1. Hero shader (WebGL2, ~1.5 KB). In the app: dynamic import after
        LCP, only when Settings.ambientEffects is true. */
  var canvas = document.querySelector('[data-hero-shader]');
  if (canvas && !saveData && !reduce) startShader(canvas);

  function startShader(cv) {
    var gl = cv.getContext('webgl2', { antialias: false, alpha: true, powerPreference: 'low-power' });
    if (!gl) return;
    var vs = '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = [
      '#version 300 es',
      'precision mediump float;',
      'uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c1;uniform vec3 c2;uniform vec3 bg;',
      'out vec4 o;',
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
      ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p*=2.02;a*=.5;}return v;}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*2.2;',
      ' vec2 q=vec2(fbm(p+t*.05),fbm(p+vec2(5.2,1.3)-t*.04));',
      ' float f=fbm(p+2.4*q+(m-.5)*.6);',
      ' float band=smoothstep(.42,.78,f)*smoothstep(.05,.75,uv.x);',
      ' vec3 col=mix(bg,mix(c2,c1,smoothstep(.5,.9,f)),band*.55);',
      ' float lines=smoothstep(.015,0.,abs(fract(f*9.)-.5)-.47)*band*.35;',
      ' col=mix(col,c1,lines);',
      ' o=vec4(col,1.);',
      '}'
    ].join('\n');
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['r', 't', 'm', 'c1', 'c2', 'bg'].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });

    function rgb(v) {
      var x = document.createElement('i'); x.style.color = v; document.body.appendChild(x);
      var c = getComputedStyle(x).color.match(/[\d.]+/g).map(Number); x.remove();
      return [c[0] / 255, c[1] / 255, c[2] / 255];
    }
    function colors() {
      gl.uniform3fv(U.c1, rgb('var(--signal)'));
      gl.uniform3fv(U.c2, rgb('var(--hue-amber)'));
      gl.uniform3fv(U.bg, rgb('var(--paper)'));
    }
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function size() {
      var w = cv.clientWidth, hh = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U.r, cv.width, cv.height);
    }
    var mouse = [0.5, 0.5], target = [0.5, 0.5];
    if (fine) window.addEventListener('pointermove', function (e) { target = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; }, { passive: true });
    var visible = true, raf = 0, t0 = performance.now();
    function frame(now) {
      mouse[0] += (target[0] - mouse[0]) * 0.04; mouse[1] += (target[1] - mouse[1]) * 0.04;
      gl.uniform1f(U.t, (now - t0) / 1000 + 12);
      gl.uniform2f(U.m, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (motionOK && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function resume() { cancelAnimationFrame(raf); if (motionOK && visible && !document.hidden) raf = requestAnimationFrame(frame); }
    size(); colors(); frame(performance.now());
    new ResizeObserver(function () { size(); frame(performance.now()); }).observe(cv);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; resume(); }).observe(cv);
    document.addEventListener('visibilitychange', resume);
    new MutationObserver(function () { colors(); frame(performance.now()); }).observe(root, { attributes: true, attributeFilter: ['class'] });
    cv.closest('.hero-stage').classList.add('is-live');
  }

  if (!motionOK) return;

  /* 2. Ticker speed follows scroll velocity (Web Animations playbackRate). */
  var track = document.querySelector('.ticker-track');
  if (track && track.getAnimations) {
    var lastY = scrollY, lastT = performance.now(), rate = 1;
    var anim = track.getAnimations()[0];
    var tick = function (now) {
      var v = Math.abs(scrollY - lastY) / Math.max(1, now - lastT);
      lastY = scrollY; lastT = now;
      rate += (Math.min(1 + v * 6, 6) - rate) * 0.08;
      if (anim) anim.playbackRate = rate;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  if (!fine) return;

  /* 3. Cursor follower: never hides the system cursor; grows on [data-cursor]. */
  var cur = document.createElement('div');
  cur.className = 'cursor'; cur.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cur);
  var cx = -100, cy = -100, tx = -100, ty = -100;
  window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); }, { passive: true });
  document.addEventListener('pointerleave', function () { cur.classList.remove('on'); });
  (function loop() {
    cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
    cur.style.translate = cx + 'px ' + cy + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('[data-cursor]').forEach(function (el) {
    el.addEventListener('pointerenter', function () { cur.textContent = el.getAttribute('data-cursor'); cur.classList.add('is-view'); });
    el.addEventListener('pointerleave', function () { cur.textContent = ''; cur.classList.remove('is-view'); });
  });

  /* 4. Magnetic primary buttons (hero + CTA): pull ≤ 6px toward the pointer. */
  document.querySelectorAll('.hero .btn, .cta .btn, .cta .copy-mail').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5) * 12 + 'px');
      b.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5) * 12 + 'px');
    });
    b.addEventListener('pointerleave', function () { b.style.removeProperty('--mx'); b.style.removeProperty('--my'); });
  });

  /* 5. Card tilt: ≤ 4deg, eased back on leave. */
  document.querySelectorAll('[data-tilt]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--rx', ((e.clientX - r.left) / r.width - 0.5) * 6 + 'deg');
      el.style.setProperty('--ry', (0.5 - (e.clientY - r.top) / r.height) * 6 + 'deg');
    });
    el.addEventListener('pointerleave', function () { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); });
  });

  /* 6. Index rows: a generative cover preview follows the pointer. */
  var rows = document.querySelectorAll('.index-row[data-preview]');
  if (rows.length) {
    var pv = document.createElement('div');
    pv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pv);
    var px = 0, py = 0, qx = 0, qy = 0;
    rows.forEach(function (row) {
      row.addEventListener('pointerenter', function () {
        pv.className = 'row-preview cover ' + row.getAttribute('data-preview') + ' on';
        pv.innerHTML = '<span class="glyph" style="font-size:150px">' + (row.getAttribute('data-glyph') || '') + '</span>';
      });
      row.addEventListener('pointerleave', function () { pv.classList.remove('on'); });
    });
    window.addEventListener('pointermove', function (e) { qx = e.clientX + 24; qy = e.clientY - 90; }, { passive: true });
    (function loop() { px += (qx - px) * 0.14; py += (qy - py) * 0.14; pv.style.translate = px + 'px ' + py + 'px'; requestAnimationFrame(loop); })();
  }
})();
