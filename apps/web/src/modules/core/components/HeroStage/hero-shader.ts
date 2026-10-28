/** Raw WebGL2, bounded resolution and one frame loop, released on unmount. */
export function startHeroShader(canvas: HTMLCanvasElement): () => void {
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    alpha: true,
    powerPreference: 'low-power',
  });
  if (!gl) return () => {};
  const shaders: WebGLShader[] = [];
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type)!;
    shaders.push(shader);
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    return shader;
  }
  const program = gl.createProgram()!;
  gl.attachShader(
    program,
    compile(gl.VERTEX_SHADER, '#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'),
  );
  gl.attachShader(
    program,
    compile(
      gl.FRAGMENT_SHADER,
      `#version 300 es
precision mediump float;
uniform vec2 r; uniform float t; uniform vec3 ink; out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float v=0.,a=.5;for(int k=0;k<4;k++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*2.2;vec2 q=vec2(fb(p+t*.05),fb(p+vec2(5.2,1.3)-t*.04));float f=fb(p+2.4*q);float band=smoothstep(.38,.8,f)*smoothstep(.05,.75,uv.x);o=vec4(ink,band*.65);}`,
    ),
  );
  gl.linkProgram(program);
  const release = () => {
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteProgram(program);
  };
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    release();
    return () => {};
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'r');
  const time = gl.getUniformLocation(program, 't');
  const color = gl.getUniformLocation(program, 'ink');
  let frame = 0;
  let visible = false;
  let lost = false;
  function draw(now: number) {
    gl!.uniform1f(time, now / 1000 + 12);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    frame = requestAnimationFrame(draw);
  }
  function resume() {
    cancelAnimationFrame(frame);
    if (visible && !document.hidden && !lost) frame = requestAnimationFrame(draw);
  }
  const resize = new ResizeObserver(() => {
    const scale = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolution, canvas.width, canvas.height);
  });
  function colors() {
    const dark = document.documentElement.classList.contains('dark');
    gl!.uniform3f(
      color,
      ...((dark ? [1, 0.42, 0.29] : [0.9, 0.28, 0.18]) as [number, number, number]),
    );
  }
  const theme = new MutationObserver(colors);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    resume();
  });
  const onLost = () => {
    lost = true;
    cancelAnimationFrame(frame);
  };
  colors();
  resize.observe(canvas);
  intersection.observe(canvas);
  document.addEventListener('visibilitychange', resume);
  canvas.addEventListener('webglcontextlost', onLost);
  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    intersection.disconnect();
    theme.disconnect();
    document.removeEventListener('visibilitychange', resume);
    canvas.removeEventListener('webglcontextlost', onLost);
    gl.deleteBuffer(buffer);
    release();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
