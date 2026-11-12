import * as THREE from "three";

/**
 * Credential badges as objects in the scene. They ride an orbit, always facing the viewer, and the selected one is
 * brought to the front. Textures load the first time the chapter comes into view.
 */
export function createBadges(urls: string[], camera: THREE.Camera) {
  const group = new THREE.Group();
  group.visible = false;
  const plane = new THREE.PlaneGeometry(1, 1);
  const loader = new THREE.TextureLoader();
  const items = urls.map(() => {
    const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const mesh = new THREE.Mesh(plane, material);
    mesh.renderOrder = 3;
    group.add(mesh);
    return { mesh, material, front: 0 };
  });
  let loaded = false, turn = 0, drift = 0;
  const radius = 1.3, step = (Math.PI * 2) / Math.max(1, urls.length);

  return {
    group,
    update(presence: number, time: number, selected: number, still: boolean, dt: number) {
      group.visible = presence > 0.01;
      if (!group.visible) return;
      if (!loaded) {
        loaded = true;
        urls.forEach((url, i) => loader.load(url, texture => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 4;
          items[i].material.map = texture;
          items[i].material.needsUpdate = true;
        }));
      }
      // With nothing selected the ring drifts. A selection turns the ring the short way until that badge faces front.
      if (selected < 0 && !still) drift += dt * 0.22;
      const goal = selected < 0 ? drift : Math.PI / 2 - selected * step;
      const delta = Math.atan2(Math.sin(goal - turn), Math.cos(goal - turn));
      turn += delta * (still ? 1 : 1 - Math.exp(-dt * 5));
      if (selected >= 0) drift = turn;
      const ease = presence * presence * (3 - 2 * presence);
      items.forEach((item, i) => {
        const angle = turn + i * step, depth = Math.sin(angle); // 1 = nearest the viewer
        const chosen = i === selected ? 1 : 0;
        item.front += (chosen - item.front) * (still ? 1 : 1 - Math.exp(-dt * 6));
        item.mesh.position.set(Math.cos(angle) * radius * (1 - item.front * 0.9), item.front * 0.12 + (still ? 0 : Math.sin(time * 0.8 + i) * 0.02), depth * radius * (1 - item.front * 0.25) + item.front * 0.5);
        item.mesh.quaternion.copy(camera.quaternion);
        group.updateWorldMatrix(true, false);
        item.mesh.quaternion.premultiply(group.getWorldQuaternion(new THREE.Quaternion()).invert());
        item.mesh.scale.setScalar(ease * (0.3 + (depth + 1) * 0.09 + item.front * 0.62));
        item.material.opacity = item.material.map ? ease * (0.35 + (depth + 1) * 0.325) * (selected >= 0 && !chosen ? 0.5 : 1) + item.front * 0.3 : 0;
        item.mesh.renderOrder = 3 + Math.round((depth + 1) * 10) + chosen * 30;
      });
    },
    dispose() {
      plane.dispose();
      for (const item of items) { item.material.map?.dispose(); item.material.dispose(); }
    },
  };
}
