import * as THREE from './assets/three.module.min.js';

export function createGallery(container, projects, onSelect, onFailure) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x1b1d20, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, .1, 80);
  const target = new THREE.Vector3(0, .35, 0);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const cards = [];
  const lights = new THREE.HemisphereLight(0xffffff, 0x343946, 2.5); scene.add(lights);
  const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(4, 8, 6); scene.add(key);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 20), new THREE.MeshStandardMaterial({ color: 0x202226, roughness: 1, transparent: true, opacity: .55 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.62; scene.add(floor);
  const grid = new THREE.GridHelper(28, 28, 0x484038, 0x35373b); grid.position.y = -.6;
  grid.material.transparent = true; grid.material.opacity = .7; scene.add(grid);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(10.5, .018, .024), new THREE.MeshBasicMaterial({ color: 0xff885b }));
  rail.position.set(0, -.58, 4.05); scene.add(rail);
  let active = true, reduced = false, selected = projects[0].id, frame = 0;
  let yaw = .27, pitch = .56, aimYaw = .27, aimPitch = .56, down = null;
  let hovered = null, dirty = true, time = 0;
  const background = '#171a1e';

  function cardTexture(project) {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 620;
    const ctx = canvas.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    const paint = (image) => {
      ctx.fillStyle = background; ctx.fillRect(0, 0, 1024, 620);
      if (image) {
        const scale = Math.max(1024 / image.width, 620 / image.height);
        ctx.drawImage(image, (1024 - image.width * scale) / 2, (620 - image.height * scale) / 2, image.width * scale, image.height * scale);
      } else {
        ctx.fillStyle = project.color; ctx.globalAlpha = .08; ctx.fillRect(0, 0, 1024, 620); ctx.globalAlpha = 1;
        ctx.fillStyle = project.color; ctx.font = '700 200px Arial, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(project.mark, 512, 352);
        ctx.strokeStyle = project.color; ctx.globalAlpha = .23; ctx.lineWidth = 2;
        ctx.strokeRect(36, 36, 952, 548); ctx.globalAlpha = 1;
        ctx.textAlign = 'left'; ctx.font = '24px Consolas, monospace'; ctx.fillText(project.type, 64, 550);
        ctx.textAlign = 'right'; ctx.fillText(project.number, 956, 78);
      }
      texture.needsUpdate = true; dirty = true; requestRender();
    };
    paint();
    if (project.image) {
      const image = new Image(); image.onload = () => paint(image); image.onerror = () => paint(); image.src = project.image;
    }
    return texture;
  }
  projects.forEach((project, index) => {
    const group = new THREE.Group();
    group.position.set((index % 3 - 1) * 3.7, .78, index < 3 ? -2.1 : 1.8);
    group.rotation.y = .18;
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x55585d, roughness: .6, metalness: .3 });
    const backing = new THREE.Mesh(new THREE.BoxGeometry(3.1, 2, .13), frameMaterial);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.99, 1.89), new THREE.MeshBasicMaterial({ map: cardTexture(project) }));
    panel.position.z = .071; panel.userData.id = project.id;
    group.add(backing, panel); scene.add(group);
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.35, .075, 2), new THREE.MeshStandardMaterial({ color: 0x303237, roughness: .8 }));
    base.position.set(group.position.x, -.55, group.position.z); scene.add(base);
    const label = document.createElement('button'); label.type = 'button'; label.className = 'scene-label';
    label.textContent = project.title; label.setAttribute('aria-label', `${project.title} 선택`);
    label.addEventListener('click', () => onSelect(project.id)); container.append(label);
    cards.push({ id: project.id, group, panel, frameMaterial, base, label, baseY: group.position.y });
  });

  function resize() {
    const width = container.clientWidth, height = container.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    const span = Math.max(12.8, aspect * 7.4);
    camera.left = -span / 2; camera.right = span / 2;
    camera.top = span / aspect / 2; camera.bottom = -span / aspect / 2;
    camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
    dirty = true; requestRender();
  }
  function draw(now) {
    frame = 0; if (!active) return;
    time = now * .001;
    const moving = Math.abs(yaw - aimYaw) > .0001 || Math.abs(pitch - aimPitch) > .0001;
    yaw += (aimYaw - yaw) * (reduced ? 1 : .09); pitch += (aimPitch - pitch) * (reduced ? 1 : .09);
    camera.position.set(Math.sin(yaw) * 15 * Math.cos(pitch), Math.sin(pitch) * 15, Math.cos(yaw) * 15 * Math.cos(pitch));
    camera.lookAt(target);
    camera.updateMatrixWorld();
    for (const card of cards) {
      const chosen = card.id === selected;
      card.group.position.y = card.baseY + (chosen ? .14 : 0) + (reduced ? 0 : Math.sin(time * .7 + cards.indexOf(card)) * .025);
      card.frameMaterial.color.set(chosen ? 0xff885b : card.id === hovered ? 0xc4c6ca : 0x55585d);
      card.frameMaterial.emissive.set(chosen ? 0x462114 : 0x000000);
      const position = card.group.localToWorld(new THREE.Vector3(0, -1.22, 0)).project(camera);
      card.label.style.left = `${(position.x * .5 + .5) * container.clientWidth}px`;
      card.label.style.top = `${(-position.y * .5 + .5) * container.clientHeight}px`;
      card.label.classList.toggle('selected', chosen);
      card.label.setAttribute('aria-pressed', String(chosen));
    }
    if (dirty || moving || !reduced) renderer.render(scene, camera);
    dirty = false;
    if (moving || !reduced) requestRender();
  }
  function requestRender() { if (active && !frame) frame = requestAnimationFrame(draw); }
  function intersect(event) {
    const bounds = container.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(cards.filter((c) => c.group.visible).map((c) => c.panel))[0]?.object.userData.id;
  }
  const surface = container.parentElement;
  surface.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button') || event.button !== 0) return;
    down = { x: event.clientX, y: event.clientY, yaw: aimYaw, pitch: aimPitch, distance: 0 };
    surface.setPointerCapture(event.pointerId); surface.classList.add('dragging');
  });
  surface.addEventListener('pointermove', (event) => {
    if (down) {
      const dx = event.clientX - down.x, dy = event.clientY - down.y;
      down.distance = Math.max(down.distance, Math.hypot(dx, dy));
      aimYaw = THREE.MathUtils.clamp(down.yaw - dx * .004, -.6, .85);
      aimPitch = THREE.MathUtils.clamp(down.pitch + dy * .002, .38, .85);
    } else { hovered = intersect(event); surface.style.cursor = hovered ? 'pointer' : 'grab'; }
    dirty = true; requestRender();
  });
  surface.addEventListener('pointerup', (event) => {
    if (down?.distance < 7) { const id = intersect(event); if (id) onSelect(id); }
    down = null; surface.classList.remove('dragging');
    if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
  });
  surface.addEventListener('pointercancel', () => { down = null; surface.classList.remove('dragging'); });
  surface.addEventListener('pointerleave', () => { hovered = null; dirty = true; requestRender(); });
  renderer.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); active = false; cancelAnimationFrame(frame); onFailure(); });
  const observer = new ResizeObserver(resize); observer.observe(container);
  resize(); requestRender();
  return {
    select(id) { selected = id; dirty = true; requestRender(); },
    filter(ids) { for (const card of cards) { const visible = ids.includes(card.id); card.group.visible = visible; card.base.visible = visible; card.label.hidden = !visible; } dirty = true; requestRender(); },
    reset() { aimYaw = .27; aimPitch = .56; dirty = true; requestRender(); },
    setReducedMotion(value) { reduced = value; dirty = true; requestRender(); },
    setActive(value) { active = value; if (value) { resize(); requestRender(); } else { cancelAnimationFrame(frame); frame = 0; } },
  };
}
