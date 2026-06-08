import { useRef, useEffect } from "react";
import * as THREE from "three";

const LAND_COUNT  = 28000;
const OCEAN_COUNT = 9000;
const WHITE_COUNT = 7000;

export const WorldCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    let isActive = true;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55, window.innerWidth / window.innerHeight, 0.1, 100
    );
    camera.position.set(0, 4, 9);
    camera.lookAt(0, -1, 0);

    const clock = new THREE.Clock();

    const additiveMat = (size: number) =>
      new THREE.PointsMaterial({
        size, vertexColors: true, sizeAttenuation: true,
        transparent: true, opacity: 1,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });

    // ── Terra — disco piatto ──────────────────────────────────────────────
    const lPos = new Float32Array(LAND_COUNT * 3);
    const lCol = new Float32Array(LAND_COUNT * 3);
    for (let i = 0; i < LAND_COUNT; i++) {
      const r     = Math.sqrt(Math.random()) * 8;
      const theta = Math.random() * Math.PI * 2;
      lPos[i*3]   = r * Math.cos(theta);
      lPos[i*3+1] = -1.8 + (Math.random() - 0.5) * 0.45;
      lPos[i*3+2] = r * Math.sin(theta);

      const c = new THREE.Color();
      const t = Math.random();
      if (t < 0.55)      c.setHSL(0.32 + Math.random()*0.07, 1,   0.52 + Math.random()*0.32); // verde brillante
      else if (t < 0.78) c.setHSL(0.20 + Math.random()*0.06, 0.9, 0.58 + Math.random()*0.22); // giallo-verde
      else               c.setHSL(0.55 + Math.random()*0.08, 0.7, 0.35 + Math.random()*0.20); // azzurro-verde (coste)
      lCol[i*3] = c.r; lCol[i*3+1] = c.g; lCol[i*3+2] = c.b;
    }
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
    lGeo.setAttribute("color",    new THREE.BufferAttribute(lCol, 3));
    const landPoints = new THREE.Points(lGeo, additiveMat(0.016));
    scene.add(landPoints);

    // ── Oceano — sparso nel disco, colori blu profondi ────────────────────
    const oPos = new Float32Array(OCEAN_COUNT * 3);
    const oCol = new Float32Array(OCEAN_COUNT * 3);
    for (let i = 0; i < OCEAN_COUNT; i++) {
      const r     = Math.sqrt(Math.random()) * 8.5;
      const theta = Math.random() * Math.PI * 2;
      oPos[i*3]   = r * Math.cos(theta);
      oPos[i*3+1] = -1.8 + (Math.random() - 0.5) * 0.3;
      oPos[i*3+2] = r * Math.sin(theta);

      const c = new THREE.Color();
      c.setHSL(0.58 + Math.random()*0.08, 0.9, 0.18 + Math.random()*0.18);
      oCol[i*3] = c.r; oCol[i*3+1] = c.g; oCol[i*3+2] = c.b;
    }
    const oGeo = new THREE.BufferGeometry();
    oGeo.setAttribute("position", new THREE.BufferAttribute(oPos, 3));
    oGeo.setAttribute("color",    new THREE.BufferAttribute(oCol, 3));
    const oceanPoints = new THREE.Points(oGeo, additiveMat(0.013));
    scene.add(oceanPoints);

    // ── Particelle bianche (cielo) — scatter su hover ─────────────────────
    const wPos  = new Float32Array(WHITE_COUNT * 3);
    const wOrig = new Float32Array(WHITE_COUNT * 3);
    const wVel  = new Float32Array(WHITE_COUNT * 3);
    const wCol  = new Float32Array(WHITE_COUNT * 3);
    for (let i = 0; i < WHITE_COUNT; i++) {
      const x = (Math.random()-0.5)*14, y = 0.8+Math.random()*5.5, z = (Math.random()-0.5)*14;
      wPos[i*3]=wOrig[i*3]=x; wPos[i*3+1]=wOrig[i*3+1]=y; wPos[i*3+2]=wOrig[i*3+2]=z;
      const c = new THREE.Color();
      const tw = Math.random();
      if (tw<0.5) c.setRGB(1,1,1); else if (tw<0.75) c.setHSL(0.55,0.4,0.85); else c.setHSL(0.13,0.8,0.8);
      wCol[i*3]=c.r; wCol[i*3+1]=c.g; wCol[i*3+2]=c.b;
    }
    const wGeo = new THREE.BufferGeometry();
    wGeo.setAttribute("position", new THREE.BufferAttribute(wPos, 3));
    wGeo.setAttribute("color",    new THREE.BufferAttribute(wCol, 3));
    const whitePoints = new THREE.Points(wGeo, additiveMat(0.019));
    scene.add(whitePoints);

    // ── Mouse ─────────────────────────────────────────────────────────────
    const mouse    = new THREE.Vector2(-99,-99);
    const raycaster = new THREE.Raycaster();
    const mWorld   = new THREE.Vector3();
    const skyPlane = new THREE.Plane(new THREE.Vector3(0,1,0), -2.5);
    const onMouseMove = (e: MouseEvent) => {
      mouse.x=(e.clientX/window.innerWidth)*2-1;
      mouse.y=-(e.clientY/window.innerHeight)*2+1;
    };
    window.addEventListener("mousemove", onMouseMove);

    let scrollProg = 0;
    const onScroll = () => { scrollProg = Math.min(1, window.scrollY/(window.innerHeight*3)); };
    window.addEventListener("scroll", onScroll);

    const tmp = { cur: new THREE.Vector3(), orig: new THREE.Vector3(),
                  vel: new THREE.Vector3(), dir: new THREE.Vector3() };

    const animate = () => {
      if (!isActive) return;
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camera.position.y += (4 - scrollProg*2.5 - camera.position.y) * 0.04;
      camera.position.z += (9 - scrollProg*2   - camera.position.z) * 0.04;
      camera.lookAt(0, -1, 0);

      // mondo ruota come un globo
      const ry = t * 0.14;
      const rx = Math.sin(t*0.07) * 0.06;
      landPoints.rotation.y  = ry; landPoints.rotation.x  = rx;
      oceanPoints.rotation.y = ry; oceanPoints.rotation.x = rx;

      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(skyPlane, mWorld);

      const arr = wGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < WHITE_COUNT; i++) {
        const ix = i*3;
        tmp.cur.set(arr[ix],arr[ix+1],arr[ix+2]);
        tmp.orig.set(wOrig[ix],wOrig[ix+1],wOrig[ix+2]);
        tmp.vel.set(wVel[ix],wVel[ix+1],wVel[ix+2]);
        const d = tmp.cur.distanceTo(mWorld);
        if (d < 2.2) {
          tmp.dir.subVectors(tmp.cur, mWorld).normalize().multiplyScalar(Math.pow(1-d/2.2,2)*0.07);
          tmp.vel.add(tmp.dir);
        }
        tmp.dir.subVectors(tmp.orig, tmp.cur).multiplyScalar(0.009);
        tmp.vel.add(tmp.dir);
        tmp.vel.multiplyScalar(0.9);
        arr[ix]+=tmp.vel.x; arr[ix+1]+=tmp.vel.y; arr[ix+2]+=tmp.vel.z;
        wVel[ix]=tmp.vel.x; wVel[ix+1]=tmp.vel.y; wVel[ix+2]=tmp.vel.z;
      }
      wGeo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      isActive = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement))
        mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0" style={{ pointerEvents:"none" }} />;
};
