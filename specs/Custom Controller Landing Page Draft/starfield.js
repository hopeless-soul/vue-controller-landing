// StarField — stub placeholder. Replace with the real reactive component.
// Small white flying circles on a canvas, drifting toward the viewer.
class StarField extends HTMLElement {
  connectedCallback() {
    this.style.display = 'block';
    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;height:100%;display:block';
    this.appendChild(c);
    const ctx = c.getContext('2d');
    const density = parseFloat(this.getAttribute('density') || '1');
    let stars = [], W = 0, H = 0, raf;
    const resize = () => {
      W = c.width = this.clientWidth * devicePixelRatio;
      H = c.height = this.clientHeight * devicePixelRatio;
      const n = Math.round((W * H) / 18000 * density / devicePixelRatio);
      stars = Array.from({ length: n }, () => this._spawn(W, H, true));
    };
    this._spawn = (W, H, anywhere) => ({
      x: Math.random() * W, y: anywhere ? Math.random() * H : H + 10,
      z: 0.2 + Math.random() * 0.8, vx: 0, vy: 0
    });
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      for (const s of stars) {
        s.y -= s.z * 0.6 * devicePixelRatio;
        s.x += Math.sin(s.y * 0.002) * 0.15;
        if (s.y < -10) { Object.assign(s, this._spawn(W, H, false)); }
        ctx.globalAlpha = 0.15 + s.z * 0.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.z * 1.4 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    resize();
    tick();
    this._ro = new ResizeObserver(resize);
    this._ro.observe(this);
    this._stop = () => cancelAnimationFrame(raf);
  }
  disconnectedCallback() { this._stop && this._stop(); this._ro && this._ro.disconnect(); }
}
customElements.define('star-field', StarField);
