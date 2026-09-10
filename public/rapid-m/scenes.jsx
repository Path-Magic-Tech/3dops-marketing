// scenes.jsx
// Three.js scenes for RAPID-M animations. Each scene is a React component that
// mounts a canvas and reads the animation playhead (useTime) to drive a Three.js
// scene built with rapid-model.js.

const { useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp } = window;

// Shared canvas hook: sets up scene/camera/renderer/lights once, lets the caller
// build the scene contents and a per-frame update function.
function useThreeScene({ width, height, build, update, background = '#0B0D10' }) {
  const mountRef = React.useRef(null);
  const stateRef = React.useRef(null);

  // Mount once. THREE handles the rest via the update fn read from a ref.
  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !window.THREE) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 100);
    camera.position.set(0, 0.2, 3.0);
    camera.lookAt(0, 0, 0);

    // Three-point lighting calibrated for matte black anodized hardware
    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(2, 3, 2.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 10;
    key.shadow.camera.left = -2; key.shadow.camera.right = 2;
    key.shadow.camera.top = 2; key.shadow.camera.bottom = -2;
    key.shadow.bias = -0.0002;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xb8c4d6, 1.0);
    fill.position.set(-2.5, 1, 1.5);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffd9a8, 0.8);
    rim.position.set(0, -1.5, -2);
    scene.add(rim);

    // Bottom fill so chassis silhouette doesn't disappear into bg
    const bottomFill = new THREE.DirectionalLight(0x6b7d94, 0.5);
    bottomFill.position.set(0.5, -2, 1);
    scene.add(bottomFill);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    // Soft ground shadow plane (catcher)
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.42 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.55;
    ground.receiveShadow = true;
    scene.add(ground);

    // Build scene contents
    const ctx = { scene, camera, renderer };
    const userData = build(ctx);

    // Enable shadow casting on every mesh in the built tree
    if (userData?.group) {
      userData.group.traverse(o => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
    }

    stateRef.current = { scene, camera, renderer, userData, ctx };

    return () => {
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [width, height, background]);

  // Per-frame update — re-runs whenever `time` changes via parent re-render.
  return [mountRef, stateRef];
}

// ── Stage frame: dark canvas with brand chrome ────────────────────────────
function FrameChrome({ title, sub, idx, total, accent }) {
  return (
    <>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700,
          color: '#F6F7F9',
          letterSpacing: '0.12em',
          fontSize: 18,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: '#E88828', display: 'inline-block' }}>▬</span>
          <span style={{ display: 'inline-block', paddingRight: 4 }}>RAPID-M</span>
          <span style={{ display: 'inline-block', width: 1, height: 14, background: 'rgba(255,255,255,0.18)' }} />
          <span style={{
            color: '#5C6975', fontSize: 12, fontWeight: 500,
            fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em',
            whiteSpace: 'nowrap', display: 'inline-block', paddingLeft: 4,
          }}>
            MOTORIZED RADIOGRAPHIC ARRAY
          </span>
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          color: '#8893A0',
          letterSpacing: '0.12em',
        }}>
          {String(idx).padStart(2,'0')} / {String(total).padStart(2,'0')}
        </div>
      </div>

      {/* Lower-left scene title */}
      <div style={{
        position: 'absolute', left: 32, bottom: 28, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 6,
        maxWidth: 620,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.18em',
          color: accent || '#E88828',
        }}>
          SCENE / {String(idx).padStart(2,'0')}
        </div>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800,
          fontSize: 36,
          color: '#F6F7F9',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}>
          {title}
        </div>
        {sub && <div style={{
          fontFamily: 'Barlow, sans-serif',
          fontWeight: 400,
          fontSize: 13,
          color: '#B4BCC6',
          maxWidth: 560,
          marginTop: 8,
          lineHeight: 1.45,
        }}>{sub}</div>}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SCENE 1 — HERO TURNTABLE
// 360° rotation of the full RAPID-M cross, slow camera dolly-in, with key
// dimension callouts fading in/out as the camera reveals each axis.
// ─────────────────────────────────────────────────────────────────────────
function SceneTurntable({ width, height }) {
  const { time, duration } = useTimeline();

  const [mountRef, stateRef] = useThreeScene({
    width, height,
    background: '#0B0D10',
    build: (ctx) => {
      const model = window.RAPIDModel.buildRapidM();
      // Rotate so motor/mount arm is horizontal, bracket plates face outward
      model.group.rotation.z = Math.PI / 2;
      // Tilt slightly forward so we see the depth of the beams
      model.group.rotation.x = -0.12;
      ctx.scene.add(model.group);
      return { group: model.group, model };
    },
  });

  // Per-frame update
  React.useEffect(() => {
    const s = stateRef.current; if (!s) return;
    const { camera, renderer, scene, userData } = s;
    const t = time / duration;

    // Camera: constrained 3/4 wedge orbit — sweeps 30° to 150° then back,
    // never edge-on so the cross silhouette stays readable.
    const sweep = Math.sin(t * Math.PI * 2) * 0.5 + 0.5; // 0…1…0
    const angle = (Math.PI / 6) + sweep * (Math.PI * 2 / 3); // 30° … 150°
    const radius = interpolate([0, 0.5, 1], [2.0, 1.65, 2.0], Easing.easeInOutCubic)(t);
    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = 0.7 + Math.sin(t * Math.PI * 2) * 0.1;
    camera.lookAt(0, 0, 0);
    camera.lookAt(0, 0, 0);

    // Subtle model wobble — feels alive
    if (userData?.group) {
      userData.group.rotation.x = -0.12 + Math.sin(t * Math.PI * 2) * 0.03;
    }

    renderer.render(scene, camera);
  });

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, #14181D 0%, #0B0D10 100%)',
    }}>
      {/* Engineer grid backdrop */}
      <GridBackdrop />

      <div ref={mountRef} style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width, height,
      }} />

      {/* Right-side spec readout */}
      <SpecReadout time={time} duration={duration} />

      <FrameChrome
        idx={1} total={6}
        title="Hero Turntable"
        sub="1000 mm × 1000 mm dual-axis motorized cross. 6061 aluminum + stainless steel chassis. Universal DR-panel mount."
      />
    </div>
  );
}

// Engineer grid backdrop — faint 50mm grid at low opacity
function GridBackdrop() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(rgba(79,182,217,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(79,182,217,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
      pointerEvents: 'none',
    }} />
  );
}

// Floating spec readout — values "tween" via tabular-nums counting
function SpecReadout({ time, duration }) {
  const t = time / duration;
  const angle = (t * 360) % 360;
  const dist = interpolate([0, 0.5, 1], [3000, 2400, 3000], Easing.easeInOutCubic)(t);

  return (
    <div style={{
      position: 'absolute', right: 32, top: 96,
      fontFamily: 'JetBrains Mono, monospace',
      color: '#B4BCC6',
      fontSize: 12,
      letterSpacing: '0.06em',
      lineHeight: 1.6,
      textAlign: 'right',
      zIndex: 5,
    }}>
      <div style={{ color: '#5C6975', fontSize: 10, letterSpacing: '0.18em', marginBottom: 8 }}>
        ▬ CAMERA TELEMETRY
      </div>
      <SpecRow k="ORBIT" v={`${angle.toFixed(1).padStart(5,'0')}°`} />
      <SpecRow k="RANGE" v={`${dist.toFixed(0)} mm`} />
      <SpecRow k="FOV"   v="35.0°" />
      <div style={{ height: 14 }} />
      <div style={{ color: '#5C6975', fontSize: 10, letterSpacing: '0.18em', marginBottom: 8 }}>
        ▬ SUBJECT
      </div>
      <SpecRow k="X-TRAVEL" v="1000 mm" />
      <SpecRow k="Y-TRAVEL" v="1000 mm" />
      <SpecRow k="COVERAGE" v="4.5 × 3.5 ft" />
      <SpecRow k="LOAD"     v="20 lb" />
      <SpecRow k="FRAME"    v="6061 AL / SS" />
    </div>
  );
}

function SpecRow({ k, v }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'flex-end', gap: 12,
      fontVariantNumeric: 'tabular-nums',
    }}>
      <span style={{ color: '#5C6975' }}>{k}</span>
      <span style={{ color: '#F6F7F9', minWidth: 88, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SCENE 2 — MOSAIC SCAN IN ACTION
// The carriage steps through a 3×3 mosaic grid pattern. As it lands at each
// cell, a "captured" overlay appears, building the X-ray mosaic.
// ─────────────────────────────────────────────────────────────────────────
function SceneMosaic({ width, height }) {
  const { time, duration } = useTimeline();

  const [mountRef, stateRef] = useThreeScene({
    width, height,
    background: '#0B0D10',
    build: (ctx) => {
      const model = window.RAPIDModel.buildRapidM();
      // Rotate so motor/mount arm is horizontal, bracket plates face outward
      model.group.rotation.z = Math.PI / 2;
      // Front-on view for mosaic scan — show the X/Y plane clearly
      model.group.rotation.x = -0.05;
      ctx.scene.add(model.group);
      return { group: model.group, model };
    },
  });

  // 3×3 mosaic: panel visits 9 cells in a snake pattern.
  // Stops are derived from the model's actual kinematic LIMITS (FBX-aware
  // in realistic mode), so the panel sweeps the full rail rather than a
  // hardcoded 1000mm spec range. Computed inside the per-frame effect once
  // the model has been built.
  const CELLS = React.useMemo(() => {
    const m = stateRef.current?.userData?.model;
    const L = m?.LIMITS || { xMin: -333, xMax: 333, yMin: -333, yMax: 333 };
    // Use 0.75 of safe limits so carriages stay visibly centered on the
    // rails at the extremes (not crowding the end-caps).
    const xs = [L.xMin * 0.75, 0, L.xMax * 0.75];
    const ys = [L.yMin * 0.75, 0, L.yMax * 0.75];
    const out = [];
    for (let row = 0; row < 3; row++) {
      const order = row === 1 ? [...xs].reverse() : xs; // snake
      for (const x of order) {
        out.push({ x, y: ys[2 - row] });
      }
    }
    return out;
  }, [stateRef.current?.userData?.model]);

  // Compute current carriage target based on time
  const cellIdx = Math.min(CELLS.length - 1, Math.floor((time / duration) * CELLS.length));
  const cellProgress = ((time / duration) * CELLS.length) % 1;

  React.useEffect(() => {
    const s = stateRef.current; if (!s) return;
    const { camera, renderer, scene, userData } = s;

    // Camera: 3/4 elevated angle so panel + cross both readable
    const tt = time / duration;
    camera.position.x = -1.45 + Math.sin(tt * 0.6) * 0.26;
    camera.position.y = 1.1;
    camera.position.z = 2.1;
    camera.lookAt(0, 0, 0);

    // Carriage interpolation — quick snap, then long dwell at the cell.
    // The overlay marks a tile as "currently scanning" the moment its
    // cellIdx becomes active, so the panel needs to arrive quickly to
    // stay in sync with the indicator. Move occupies ~15% of the cell
    // window; the remaining 85% is dwell (capture).
    const from = CELLS[Math.max(0, cellIdx - 1)] || CELLS[0];
    const to = CELLS[cellIdx];
    const moveT = clamp(cellProgress / 0.15, 0, 1);
    const eased = Easing.easeInOutCubic(moveT);
    const x = from.x + (to.x - from.x) * eased;
    const y = from.y + (to.y - from.y) * eased;

    // The cross is rotated +π/2 around Z for this view, so local-frame
    // axes don't line up with the screen-frame (column,row) we used in
    // CELLS. After the rotation: local +X → world +Y (vertical), local
    // +Y → world -X (horizontal, flipped). So to put the panel where the
    // overlay shows (cell.x = horizontal column, cell.y = vertical row)
    // we pass (cell.y, -cell.x) to setCarriage.
    if (userData?.model) {
      userData.model.setCarriage(y, -x);
    }

    renderer.render(scene, camera);
  });

  // Mosaic capture grid overlay — flip the "captured" + "holding" flags
  // shortly after the panel finishes its move (moveT reaches 1 at
  // cellProgress=0.15). The capture mark at 0.20 gives the panel a beat
  // to settle before the green fill appears.
  const captured = CELLS.slice(0, cellIdx + (cellProgress > 0.20 ? 1 : 0));
  const isHolding = cellProgress > 0.20;
  const currentCell = CELLS[cellIdx];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, #14181D 0%, #0B0D10 100%)',
    }}>
      <GridBackdrop />

      <div ref={mountRef} style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width, height,
      }} />

      {/* Mosaic plan overlay (top right) */}
      <MosaicPlanOverlay cells={CELLS} captured={captured} currentIdx={cellIdx} holding={isHolding} />

      {/* Telemetry readout (bottom right) */}
      <ScanTelemetry
        cellIdx={cellIdx}
        total={CELLS.length}
        x={currentCell.x}
        y={currentCell.y}
        holding={isHolding}
        time={time}
      />

      <FrameChrome
        idx={2} total={6}
        title="Mosaic Scan"
        sub="3 × 3 capture pattern · 333 mm step · ~100 ms position settle. Operator drives the panel from cover; system steps it through a programmed grid."
      />
    </div>
  );
}

function MosaicPlanOverlay({ cells, captured, currentIdx, holding }) {
  const SIZE = 168;
  const CELL = SIZE / 3;
  return (
    <div style={{
      position: 'absolute', right: 32, top: 88, zIndex: 5,
      width: 200,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: '0.18em', color: '#5C6975', marginBottom: 10,
      }}>
        ▬ MOSAIC PLAN
      </div>
      <div style={{
        position: 'relative',
        width: SIZE, height: SIZE,
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        {/* Grid lines */}
        {[1, 2].map(i => (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: i * CELL, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', top: i * CELL, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </React.Fragment>
        ))}
        {/* Cell highlights */}
        {cells.map((cell, i) => {
          const col = (cell.x + 333) / 333;
          const row = 2 - (cell.y + 333) / 333;
          const isCaptured = i < captured.length;
          const isCurrent = i === currentIdx;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: col * CELL + 2,
              top: row * CELL + 2,
              width: CELL - 4,
              height: CELL - 4,
              background: isCurrent && holding
                ? 'rgba(232,136,40,0.35)'
                : isCaptured
                  ? 'rgba(63,185,133,0.22)'
                  : 'transparent',
              border: isCurrent
                ? '1.5px solid #E88828'
                : isCaptured
                  ? '1px solid rgba(63,185,133,0.5)'
                  : '1px dashed rgba(255,255,255,0.10)',
              transition: 'background 0.15s, border-color 0.15s',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9,
              color: isCurrent ? '#E88828' : isCaptured ? '#3FB985' : '#3D4854',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              letterSpacing: '0.05em',
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: 10,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11, color: '#B4BCC6',
        display: 'flex', justifyContent: 'space-between',
        fontVariantNumeric: 'tabular-nums',
      }}>
        <span style={{ color: '#5C6975' }}>CAPTURED</span>
        <span style={{ color: '#3FB985' }}>{captured.length} / {cells.length}</span>
      </div>
    </div>
  );
}

function ScanTelemetry({ cellIdx, total, x, y, holding, time }) {
  return (
    <div style={{
      position: 'absolute', right: 32, bottom: 32, zIndex: 5,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12, color: '#B4BCC6',
      lineHeight: 1.7, textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
    }}>
      <div style={{ color: '#5C6975', fontSize: 10, letterSpacing: '0.18em', marginBottom: 6 }}>
        ▬ AXIS TELEMETRY
      </div>
      <SpecRow k="STEP" v={`${String(cellIdx + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`} />
      <SpecRow k="X" v={`${(x).toFixed(1).padStart(7,' ')} mm`} />
      <SpecRow k="Y" v={`${(y).toFixed(1).padStart(7,' ')} mm`} />
      <SpecRow k="STATE" v={
        <span style={{ color: holding ? '#3FB985' : '#F2B441' }}>
          {holding ? 'TARGET REACHED' : 'IN MOTION'}
        </span>
      } />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SCENE 3 — EXPLODED ASSEMBLY
// Parts fly apart along their natural separation axes, hold to reveal
// labels, then reassemble. Camera holds steady on a 3/4 view.
// ─────────────────────────────────────────────────────────────────────────
function SceneExploded({ width, height }) {
  const { time, duration } = useTimeline();
  const labelsRef = React.useRef(null);

  const [mountRef, stateRef] = useThreeScene({
    width, height,
    background: '#0B0D10',
    build: (ctx) => {
      // Realistic CAD chassis (matches other slides). The exploded animation
      // pulls the FBX top-level assemblies apart along their natural axes,
      // and pulls the parametric DR panel forward off the carrier.
      const model = window.RAPIDModel.buildRapidM({ realistic: true });
      model.group.rotation.x = -0.18;
      model.group.rotation.z = Math.PI / 2;
      model.group.rotation.y = 0.3;
      // Lift the whole rig so the rotated bbox center sits near the
      // camera's lookAt (y ≈ 0.2). Without this the model's center is
      // at y ≈ -0.6 and the exploded parts drop off the bottom of the
      // canvas at peak separation.
      model.group.position.y = 0.7;
      ctx.scene.add(model.group);
      // DEBUG: capture this scene's explode parts for inspection
      window.__scene3Explode = model.parts.fbxExplodeParts;
      return { group: model.group, model };
    },
  });

  React.useEffect(() => {
    const s = stateRef.current; if (!s) return;
    const { camera, renderer, scene, userData } = s;
    const t = time / duration;

    let explode;
    if (t < 0.25) explode = Easing.easeInOutCubic(t / 0.25);
    else if (t < 0.7) explode = 1;
    else explode = 1 - Easing.easeInOutCubic((t - 0.7) / 0.3);

    const m = userData.model;

    if (m) {
      // ── Full parts blow-out ─────────────────────────────────────────
      // Each part has its rest LOCAL position + an explode direction
      // ALSO in parent-local space (precomputed at build time from a
      // world-space radial direction). All CAD parts share Fusion's
      // origin so adding a world offset onto a worldPosition would
      // collapse everything to a single point — we offset from each
      // part's rest LOCAL position instead.
      // Recompute parent-local dir per frame using the CURRENT (post-render)
      // matrixWorld — at build time some parents had stale matrices so the
      // baked dirLocal had wrong magnitude for some parts (uChannel, panel,
      // xMount). By rendertime parent.matrixWorld is fully resolved.
      const parts = m.parts.fbxExplodeParts || [];
      // Spread parts farther so the dense carriage/plate cluster in the
      // middle reads as discrete pieces instead of a stack.
      const MAX_DIST_M = 0.95;
      const _pInv = new THREE.Matrix4();
      const _p0 = new THREE.Vector3();
      const _p1 = new THREE.Vector3();
      parts.forEach((p) => {
        const k = explode * MAX_DIST_M * p.distScale;
        if (!p.obj.parent) return;
        p.obj.parent.updateWorldMatrix(true, false);
        _pInv.copy(p.obj.parent.matrixWorld).invert();
        _p0.set(0, 0, 0).applyMatrix4(_pInv);
        _p1.copy(p.dirWorld).applyMatrix4(_pInv);
        const dx = _p1.x - _p0.x, dy = _p1.y - _p0.y, dz = _p1.z - _p0.z;
        p.obj.position.set(
          p.restLocal.x + dx * k,
          p.restLocal.y + dy * k,
          p.restLocal.z + dz * k,
        );
      });

      // ── Parametric DR panel: in the CAD rig the panel is already part of
      // the parts list, and the explode loop above pushes it outward. So
      // we don't apply an extra offset here — the per-part explode handles
      // it. (Legacy comment retained for context.)

      // Center the carriers at rest so the explode reads cleanly.
      m.parts.yCarrier.position.y = 0;
      m.parts.yCarrier.position.z = 0;
      m.parts.xCarrier.position.x = 0;
    }

    // Camera: orbit during 0…0.25 entry, freeze during 0.25…0.7 hold,
    // orbit again during 0.7…1 exit. Angle is well off-axis so the DR panel
    // shows on edge rather than face-on, letting other parts read.
    // Slow orbit through the entire scene — keeps depth cues alive during
    // the hold so the busy mid-plates separate visually. Entry sweeps in
    // from a steeper angle; hold continues a gentle drift; exit sweeps out.
    let camAngle, camY;
    if (t < 0.25) {
      camAngle = 1.05 - (t / 0.25) * 0.30;       // 1.05 → 0.75
      camY = 1.05 - (t / 0.25) * 0.15;
    } else if (t < 0.7) {
      const h = (t - 0.25) / 0.45;                // 0…1 across hold
      camAngle = 0.75 - h * 0.25;                 // 0.75 → 0.50 drift
      camY = 0.90 + Math.sin(h * Math.PI) * 0.15; // dip up to 1.05 mid-hold
    } else {
      const e = (t - 0.7) / 0.3;
      camAngle = 0.50 + e * 0.40;                 // 0.50 → 0.90
      camY = 0.90 + e * 0.10;
    }
    // Pulled back from 3.3 → 4.4 so the fully-exploded rig stays in frame
    // (parts were getting clipped at peak separation).
    camera.position.x = Math.sin(camAngle) * 4.4;
    camera.position.z = Math.cos(camAngle) * 4.4;
    camera.position.y = camY + 0.15;
    camera.lookAt(0.05, 0.2, 0);

    renderer.render(scene, camera);

    // Project mesh world positions → screen pixels and update label DOM directly
    // (no setState — avoids the render-loop trap).
    if (m && labelsRef.current) {
      // Fixed perimeter anchor positions for labels (in px). Tick marks
      // follow the projected mesh; leader lines connect tick → label.
      // Cross is rotated π/2 around Z, so the CAD's xRail (whose long
      // axis runs along local X) ends up running along world Y — i.e.,
      // VISUALLY VERTICAL. And the CAD's yRail (along local Y) ends up
      // along world X — VISUALLY HORIZONTAL. The label-to-mesh mapping
      // is based on what the viewer SEES, not the CAD's naming.
      const targets = [
        // DR panel — top right
        { mesh: m.parts.panel,     lx: width - 320, ly: height * 0.20 },
        // Carriage block — bottom right
        { mesh: m.parts.xCarriage, lx: width - 320, ly: height * 0.78 },
        // "Horizontal extrusion" = visually horizontal = CAD's yRail
        { mesh: m.parts.yRail,     lx: 60,          ly: height * 0.20 },
        // U-channel bracket — bottom left
        { mesh: m.parts.uChannel,  lx: 60,          ly: height * 0.78 },
        // NEMA-23 stepper sits at the TOP of the visually-vertical rail
        // (CAD's xRail after the rotation). Use top of its world bbox.
        { mesh: m.parts.xRail,     lx: width - 320, ly: height * 0.50, anchor: 'top' },
      ];
      const v = new THREE.Vector3();
      const _bb = new THREE.Box3();
      const labelEls = labelsRef.current.querySelectorAll('[data-lbl]');
      const tickEls  = labelsRef.current.querySelectorAll('[data-tick]');
      const lineEls  = labelsRef.current.querySelectorAll('[data-line]');
      targets.forEach((target, i) => {
        // Use bounding-box center in world space — mesh origins may sit at
        // a corner (from STL export), which mis-anchors the tick.
        _bb.setFromObject(target.mesh);
        if (target.anchor === 'top') {
          // Use top-center of bbox instead of center.
          v.set((_bb.min.x + _bb.max.x) / 2, _bb.max.y, (_bb.min.z + _bb.max.z) / 2);
        } else {
          _bb.getCenter(v);
        }
        v.project(camera);
        const xPx = clamp((v.x * 0.5 + 0.5) * width,  20, width - 20);
        const yPx = clamp((-v.y * 0.5 + 0.5) * height, 20, height - 20);
        if (labelEls[i]) {
          labelEls[i].style.transform = `translate(${target.lx}px, ${target.ly}px)`;
        }
        if (tickEls[i]) {
          tickEls[i].style.transform = `translate(${xPx}px, ${yPx}px)`;
        }
        if (lineEls[i]) {
          // Line goes from tick → near edge of label
          const labelAnchorX = target.lx < width / 2 ? target.lx + 200 : target.lx;
          const labelAnchorY = target.ly + 14;
          lineEls[i].setAttribute('x1', xPx);
          lineEls[i].setAttribute('y1', yPx);
          lineEls[i].setAttribute('x2', labelAnchorX);
          lineEls[i].setAttribute('y2', labelAnchorY);
        }
      });
      const op = t < 0.25
        ? Easing.easeInOutCubic(t / 0.25)
        : t < 0.7
          ? 1
          : 1 - Easing.easeInOutCubic((t - 0.7) / 0.3);
      labelsRef.current.style.opacity = op;
    }
  });

  const items = [
    { k: 'DR-01', v: 'INTERCHANGEABLE DR PLATE' },
    { k: 'CR-02', v: 'STAINLESS CARRIAGE' },
    { k: 'BM-03', v: 'HORIZONTAL EXTRUSION' },
    { k: 'UC-04', v: 'U-CHANNEL GUIDE' },
    { k: 'MT-05', v: 'NEMA-23 STEPPER' },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, #14181D 0%, #0B0D10 100%)',
    }}>
      <GridBackdrop />

      <div ref={mountRef} style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width, height,
      }} />

      <div ref={labelsRef} style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, opacity: 0,
      }}>
        <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
          {items.map((_, i) => (
            <line key={i} data-line=""
              stroke="#E88828" strokeWidth="1" strokeDasharray="4 3" />
          ))}
        </svg>
        {items.map((it, i) => (
          <div key={'t' + i} data-tick=""
            style={{ position: 'absolute', top: 0, left: 0, width: 6, height: 6, marginLeft: -3, marginTop: -3, background: '#E88828', borderRadius: '50%' }} />
        ))}
        {items.map((it, i) => (
          <div key={'l' + i} data-lbl=""
            style={{ position: 'absolute', top: 0, left: 0, whiteSpace: 'nowrap' }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, letterSpacing: '0.18em', color: '#E88828',
              marginBottom: 2,
            }}>{it.k}</div>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, textTransform: 'uppercase',
              fontSize: 14, letterSpacing: '0.05em',
              color: '#F6F7F9',
            }}>{it.v}</div>
          </div>
        ))}
      </div>

      <FrameChrome
        idx={3} total={6}
        title="Exploded View"
        sub="Modular subassemblies. Interchangeable DR plates. 6061 aluminum rails + stainless steel mounts. Self-lubricating, field-serviceable."
      />
    </div>
  );
}

function ProjectedLabels() { return null; }

// ─────────────────────────────────────────────────────────────────
// SCENE 4: Field Deployment — T4 carrier with RAPID-M payload
// Arm sweeps the cross across a target in a serpentine mosaic pattern,
// leaving a trail of "scanned" tiles to communicate area inspection.
// ─────────────────────────────────────────────────────────────────

// Mosaic pattern: 3 cols × 2 rows = 6 tiles, scanned in serpentine order.
// Tile size matches RAPID-M scan area (1.37m × 1.07m, but visually 0.9 × 0.7
// to read clearly at this camera distance). Target wall sits to the bot's
// right side at standoff distance.
// Wall sized for the real T7 (arm reach ~1.47m). Each tile is roughly
// the RAPID-M working window; 3×2 grid covers a ~2.5×1.3m area at the
// robot's chest height.
const TILE_W = 0.8;
const TILE_H = 0.6;
const COLS = 3;
const ROWS = 2;
const TARGET_X = 1.0;
const TARGET_Z = 0.0;
const GRID_CENTER_Y = -0.19;  // matches where the baked-pose gripper naturally lands
const GRID_CENTER_Z = 0.0;
const TILE_GAP = 0.04;

// Compute tile center in world coords (col 0..COLS-1, row 0..ROWS-1).
function tileCenter(col, row) {
  const totalW = COLS * TILE_W + (COLS - 1) * TILE_GAP;
  const totalH = ROWS * TILE_H + (ROWS - 1) * TILE_GAP;
  const z = GRID_CENTER_Z - totalW / 2 + TILE_W / 2 + col * (TILE_W + TILE_GAP);
  const y = GRID_CENTER_Y + totalH / 2 - TILE_H / 2 - row * (TILE_H + TILE_GAP);
  return { x: TARGET_X, y, z };
}

// Serpentine order: row 0 left→right, row 1 right→left
function serpentineIndex(i) {
  const row = Math.floor(i / COLS);
  const colInRow = i % COLS;
  const col = row % 2 === 0 ? colInRow : (COLS - 1 - colInRow);
  return { col, row };
}

function SceneFieldDeployment({ width, height }) {
  const { time, duration } = useTimeline();

  const [mountRef, stateRef] = useThreeScene({
    width, height,
    background: '#0B0D10',
    build: (ctx) => {
      const root = new THREE.Group();

      // ── Target wall: vertical surface to scan ──────────────────
      const wallGroup = new THREE.Group();
      const totalW = COLS * TILE_W + (COLS - 1) * TILE_GAP;
      const totalH = ROWS * TILE_H + (ROWS - 1) * TILE_GAP;
      const padding = 0.25;
      const wallW = totalW + padding * 2;
      const wallH = totalH + padding * 2;

      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x1A1F26, roughness: 0.85, metalness: 0.1,
      });
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, wallH, wallW), wallMat,
      );
      wall.position.set(TARGET_X + 0.02, GRID_CENTER_Y, GRID_CENTER_Z);
      wallGroup.add(wall);

      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.04, wallH, wallW)),
        new THREE.LineBasicMaterial({ color: 0x2A3038 }),
      );
      edge.position.copy(wall.position);
      wallGroup.add(edge);

      // Tile meshes
      const tiles = [];
      const tileGeom = new THREE.PlaneGeometry(TILE_W, TILE_H);
      for (let i = 0; i < COLS * ROWS; i++) {
        const { col, row } = serpentineIndex(i);
        const c = tileCenter(col, row);

        const pendingMat = new THREE.MeshBasicMaterial({
          color: 0x2A3038, transparent: true, opacity: 0.35,
          side: THREE.DoubleSide,
        });
        const pending = new THREE.Mesh(tileGeom, pendingMat);
        pending.rotation.y = -Math.PI / 2;
        pending.position.set(c.x - 0.005, c.y, c.z);
        wallGroup.add(pending);

        const pendBorder = new THREE.LineSegments(
          new THREE.EdgesGeometry(tileGeom),
          new THREE.LineDashedMaterial({
            color: 0x3A4250, dashSize: 0.06, gapSize: 0.04,
          }),
        );
        pendBorder.computeLineDistances();
        pendBorder.rotation.y = -Math.PI / 2;
        pendBorder.position.set(c.x - 0.004, c.y, c.z);
        wallGroup.add(pendBorder);

        const scannedMat = new THREE.MeshBasicMaterial({
          color: 0xE88828, transparent: true, opacity: 0,
          side: THREE.DoubleSide,
        });
        const scanFill = new THREE.Mesh(tileGeom, scannedMat);
        scanFill.rotation.y = -Math.PI / 2;
        scanFill.position.set(c.x - 0.003, c.y, c.z);
        wallGroup.add(scanFill);

        const scanBorder = new THREE.LineSegments(
          new THREE.EdgesGeometry(tileGeom),
          new THREE.LineBasicMaterial({
            color: 0xE88828, transparent: true, opacity: 0,
          }),
        );
        scanBorder.rotation.y = -Math.PI / 2;
        scanBorder.position.set(c.x - 0.002, c.y, c.z);
        wallGroup.add(scanBorder);

        tiles.push({
          col, row, center: c, scannedMat, scanFill, scanBorder, order: i,
        });
      }
      // Wall starts hidden during reveal, fades in during transition
      wallGroup.visible = false;
      root.add(wallGroup);

      // ── T7 robot (realistic textured model) ────────────────────
      // Arm pose is baked into the GLB (set in Blender during export).
      // JS never touches the joint rotations — the rig is a static prop
      // that holds the RAPID. All scan motion comes from the RAPID's
      // internal X/Y carriage (window.RAPIDModel.setCarriage).
      let t7 = null;
      if (window.RobotModel) {
        t7 = window.RobotModel.build();
      }
      if (t7) {
        t7.group.rotation.y = -Math.PI / 2;  // chassis faces +X (wall)
        // Tentative position; we auto-adjust below so the gripper lands
        // where the bar should be.
        t7.group.position.set(0, -0.55, 0);
        root.add(t7.group);
      }

      // ── RAPID-M cross + adapter bar — placed at the gripper ─────
      // Cross is in its natural orientation:
      //   panel face   = +Z (X-ray plate faces drone)
      //   X-axis (xRail) = horizontal (+X) — mounting plates at its ends
      //   Y-axis (yRail) = vertical   (+Y) — adapter bar mounts to its back
      // The adapter bar sits at -Z from cross center (BACK of Y-axis,
      // opposite the panel face), runs vertical along Y (parallel to
      // yRail), and the gripper holds it there.
      const cross = window.RAPIDModel.buildRapidM();
      // (0, 0, π/2): same "+" silhouette, X-ray plate visibly on the
      // drone-facing side of the cross.
      cross.group.rotation.set(0, 0, Math.PI / 2);
      root.add(cross.group);

      // Vertical adapter bar mounted on the back of the cross's Y axis.
      // Bar sits at the gripper position; cross is slid forward (in +Z)
      // so the cross's body is past the gripper claws — the claws only
      // touch the bar.
      const BAR_LENGTH = 0.6;
      const adapterBar = buildAdapterBar({ width: BAR_LENGTH });
      adapterBar.group.rotation.set(0, 0, Math.PI / 2);  // vertical (along world Y)
      root.add(adapterBar.group);

      let gripperWorld = null;
      if (t7 && t7.parts?.arm?.gripperMount) {
        t7.group.updateMatrixWorld(true);
        gripperWorld = new THREE.Vector3();
        t7.parts.arm.gripperMount.getWorldPosition(gripperWorld);

        // Cross slid forward in +Z (kept here — DO NOT move).
        cross.group.position.set(
          gripperWorld.x,
          gripperWorld.y,
          gripperWorld.z + 0.25,
        );

        // Vertical bar at the BACK FACE of the cross's Y-axis rail:
        //   cross.z - 0.075 (back face) − half bar depth (0.025)
        //   = cross.z - 0.1
        // Bar Y matches cross Y; bar runs vertical along world Y.
        adapterBar.group.position.set(
          gripperWorld.x,
          gripperWorld.y,
          gripperWorld.z + 0.25 - 0.1,
        );

        // (Robot stays at default position. Claws extend forward to
        // touch the bar without entering the Y-axis rail behind it.)
      }

      if (t7?.setGripper) t7.setGripper(0.15);

      // Claws close around the bar
      if (t7?.setGripper) t7.setGripper(0.15);

      // ── Suspect target (loaded GLB) — trashcan on the ground ──────
      // Stand-in for the Boston-Marathon scenario: a suspect device
      // placed inside a public trash receptacle. The T7 brings RAPID-M
      // to it for a standoff scan. Asset loaded lazily so the scene
      // still renders if the GLB is missing.
      const target = { group: new THREE.Group() };
      root.add(target.group);
      // Compute the T7's actual ground level (the bottom of its tracks
      // in world Y). The shadow plane is at y=-0.55 but the T7 GLB's
      // tracks extend below that, so a trashcan sitting on the shadow
      // plane would visually FLOAT above the T7's contact patch.
      let groundY = -0.55;
      if (t7) {
        t7.group.updateMatrixWorld(true);
        groundY = new THREE.Box3().setFromObject(t7.group).min.y;
      }
      const targetAnchor = {
        x: cross.group.position.x,
        y: groundY,                      // resting on T7's contact plane
        z: cross.group.position.z + 0.9, // a bit in front of the panel
      };
      if (window.TrashcanModel?.ready) {
        window.TrashcanModel.ready.then(() => {
          const d = window.TrashcanModel.build();
          if (!d) return;
          // The GLB ships ~1.9 m tall × 1.6 m wide (closer to a dumpster
          // than a public bin). Scale down to ~0.95 m tall, matching a
          // typical streetside trash receptacle. The mesh origin is at
          // its geometric center, so lift by half its scaled height so
          // the base sits at the same ground level as the T7.
          const TRASH_SCALE = 0.5;
          const TRASH_HALF_H = 0.95 * TRASH_SCALE; // 0.475 m
          d.group.scale.setScalar(TRASH_SCALE);
          d.group.rotation.set(0, 0.4, 0);
          d.group.position.set(targetAnchor.x, targetAnchor.y + TRASH_HALF_H, targetAnchor.z);
          target.group.add(d.group);
        }).catch(() => { /* GLB missing — scene still renders the rest */ });
      }

      // Hide the wall — the trashcan target is the scan subject.
      wallGroup.visible = false;

      // Debug handle
      window.__scene4 = { t7, cross, adapterBar, tiles, target, root };

      ctx.scene.add(root);
      return { group: root, t7, cross, tiles, wallGroup, adapterBar };
    },
  });

  React.useEffect(() => {
    const s = stateRef.current; if (!s) return;
    const { camera, renderer, scene, userData } = s;
    const t = time / duration;

    // ── Phase timing ──────────────────────────────────────────────
    // 0.00–0.30  dramatic reveal (arm unfolds, camera pulls back)
    // 0.30–0.38  transition to scan position
    // 0.38–0.92  serpentine scan across 6 tiles
    // 0.92–1.00  hold + retract
    const REVEAL_END = 0.30;
    const TRANSITION_END = 0.38;
    const SCAN_END = 0.92;
    const N = userData?.tiles?.length || 6;

    // ── Arm pose animation ────────────────────────────────────────
    // Single-boom arm: shoulder pitch only (no elbow).
    // Negative rotation.x = arm up, positive = arm down.
    const STOWED   = { shoulder: 0.0, wrist: 0.0 };      // boom horizontal
    const EXTENDED = { shoulder: -0.4, wrist: 0.4 };      // boom angled up

    const STANDOFF = 0.06;
    const railLift = userData?.cross?.railLiftY || 0;
    let target = null;
    let currentTileIdx = -1;
    let tileLocalProgress = 0;
    let useIK = false;

    // Slow camera arc shared by Phase 3 (scan) and Phase 4 (hold).
    // Parameterizes the camera position on a circle around the scene
    // center (lookAt = 0.3, _, 1.4). Progress goes 0 → 1 across Phase 3
    // and stays at 1 during Phase 4 so the camera doesn't snap when
    // phases swap.
    const ORBIT_LOOK_X = 0.3;
    const ORBIT_LOOK_Z = 1.4;
    const ORBIT_START_X = -5.0;
    const ORBIT_START_Z = 0.8;
    const ORBIT_DX = ORBIT_START_X - ORBIT_LOOK_X; // -5.3
    const ORBIT_DZ = ORBIT_START_Z - ORBIT_LOOK_Z; // -0.6
    const ORBIT_R = Math.sqrt(ORBIT_DX * ORBIT_DX + ORBIT_DZ * ORBIT_DZ);
    const ORBIT_START_ANGLE = Math.atan2(ORBIT_DZ, ORBIT_DX);
    const ORBIT_SWEEP = -Math.PI / 4; // ~-45°, CW from above = viewer-right
    function orbitCamera(progress) {
      const angle = ORBIT_START_ANGLE + ORBIT_SWEEP * progress;
      return {
        x: ORBIT_LOOK_X + ORBIT_R * Math.cos(angle),
        z: ORBIT_LOOK_Z + ORBIT_R * Math.sin(angle),
      };
    }

    if (t < REVEAL_END) {
      // ── Phase 1: Dramatic Reveal ────────────────────────────────
      // Arm holds the RAPID at the first tile from the start; camera
      // pulls back to reveal the full robot/wall. Wall fades in.
      useIK = true;
      const firstTile = userData?.tiles?.[0]?.center || { x: TARGET_X, y: GRID_CENTER_Y, z: 0 };
      target = { x: TARGET_X - STANDOFF, y: firstTile.y + railLift, z: firstTile.z };

      if (userData?.wallGroup) userData.wallGroup.visible = false;

      // Scene center: middle of the chain along Z (robot z=0 → drone z≈2.9)
      const SCENE_LOOK = { x: 0.3, y: 0.0, z: 1.4 };

      // Phase 1: close-up on the RAPID panel, pull back to a 3/4 wide
      // shot from the +X side so the chain reads left→right:
      // robot (z≈0) → arm → bar → RAPID → drone (z≈2.9).
      const camReveal = Easing.easeInOutCubic(t / REVEAL_END);
      const camStart = { x: -1.5, y: 0.3, z: 1.4 };
      const camEnd   = { x: -4.5, y: 2.4, z: 0.4 };
      camera.position.x = camStart.x + (camEnd.x - camStart.x) * camReveal;
      camera.position.y = camStart.y + (camEnd.y - camStart.y) * camReveal;
      camera.position.z = camStart.z + (camEnd.z - camStart.z) * camReveal;
      camera.lookAt(SCENE_LOOK.x, SCENE_LOOK.y, SCENE_LOOK.z);

    } else if (t < TRANSITION_END) {
      // ── Phase 2: Transition to scan position ────────────────────
      const transT = Easing.easeInOutCubic((t - REVEAL_END) / (TRANSITION_END - REVEAL_END));
      if (userData?.wallGroup) userData.wallGroup.visible = false;
      useIK = true;
      const firstTile = userData?.tiles?.[0]?.center || { x: TARGET_X, y: GRID_CENTER_Y, z: 0 };
      target = {
        x: TARGET_X - STANDOFF,
        y: firstTile.y + railLift,
        z: firstTile.z,
      };

      const camStart = { x: -4.5, y: 2.4, z: 0.4 };
      const camEnd   = { x: -5.0, y: 2.8, z: 0.8 };
      camera.position.x = camStart.x + (camEnd.x - camStart.x) * transT;
      camera.position.y = camStart.y + (camEnd.y - camStart.y) * transT;
      camera.position.z = camStart.z + (camEnd.z - camStart.z) * transT;
      camera.lookAt(0.3, 0.0, 1.4);

    } else if (t < SCAN_END) {
      // ── Phase 3: Serpentine scan ────────────────────────────────
      if (userData?.wallGroup) userData.wallGroup.visible = false;
      useIK = true;
      const scanT = (t - TRANSITION_END) / (SCAN_END - TRANSITION_END);
      const slot = scanT * N;
      const slotIdx = Math.min(N - 1, Math.floor(slot));
      const slotFrac = slot - slotIdx;
      currentTileIdx = slotIdx;
      tileLocalProgress = slotFrac;

      // ── Carriage motion (drives the visible panel) ────────────────
      // The panel motion AND the ScanHUD progress are both derived from
      // slotIdx here, so they stay perfectly synced. We map each tile
      // (col,row) to a position INSIDE the cross's actual rail travel —
      // earlier this came from world-space tile centers (±0.84m on Z)
      // which exceeded the carriage limits (~±480mm) and silently
      // saturated, leaving the panel motion out of sync with the HUD.
      const L = userData.cross?.LIMITS || { xMin: -460, xMax: 460, yMin: -460, yMax: 460 };
      const X_EXT = 0.75 * Math.min(-L.xMin, L.xMax);
      const Y_EXT = 0.50 * Math.min(-L.yMin, L.yMax);
      // Map serpentine index → (col, row), then to a carriage offset.
      // ROWS=2 → top + bottom; row 0 is the TOP row (panel high on Y).
      const xs = [-X_EXT, 0, X_EXT];
      const ys = [Y_EXT, -Y_EXT];
      function carriageFor(idx) {
        const { col, row } = serpentineIndex(idx);
        return { x: xs[col], y: ys[row] };
      }
      const prevC = carriageFor(Math.max(0, slotIdx - 1));
      const currC = carriageFor(slotIdx);
      // Quick move (first 30% of slot), then dwell at the cell.
      const travel = slotIdx === 0 ? 1 : Math.min(1, slotFrac / 0.30);
      const eased = Easing.easeInOutCubic(travel);
      const screenX = prevC.x + (currC.x - prevC.x) * eased; // overlay column
      const screenY = prevC.y + (currC.y - prevC.y) * eased; // overlay row
      // The cross is rotated +π/2 around Z (panel facing the camera/drone),
      // so its local carriage axes are 90° off from the screen-frame we
      // used to lay out the serpentine. Map (screenX, screenY) →
      // setCarriage(screenY, -screenX) so the panel ends up where the
      // ScanHUD shows it. (Same transform Scene 2 needs for its overlay.)
      if (userData.cross?.setCarriage) {
        userData.cross.setCarriage(screenY, -screenX);
      }

      // We keep `target` defined for any downstream uses, but the arm is
      // a static baked pose — the carriage IS the visible scan motion.
      target = null;

      // Camera: slow arc around the scene center, sweeping rightward.
      // The camera looks +X at the chain (robot → drone runs +Z), so its
      // world-right is +Z. To rotate "to the right" from the viewer's
      // perspective the camera arcs CW (decreasing angle around the +Y
      // axis), ending behind+right of the chain.
      const orbitProgress = (t - TRANSITION_END) / (SCAN_END - TRANSITION_END);
      const oc = orbitCamera(Easing.easeInOutCubic(orbitProgress));
      camera.position.x = oc.x;
      camera.position.z = oc.z;
      camera.position.y = 2.8 + Math.sin(orbitProgress * Math.PI) * 0.25;
      camera.lookAt(0.3, 0.0, 1.4);

    } else {
      // ── Phase 4: Hold + retract ─────────────────────────────────
      useIK = true;
      const a = Easing.easeInOutCubic((t - SCAN_END) / (1 - SCAN_END));
      const lastTile = userData.tiles[N - 1].center;
      target = {
        x: TARGET_X - STANDOFF - a * 0.15,
        y: lastTile.y + railLift,
        z: lastTile.z,
      };
      currentTileIdx = N - 1;
      tileLocalProgress = 1;

      // Hold at the end of the arc (orbit progress = 1)
      const oc = orbitCamera(1);
      camera.position.x = oc.x;
      camera.position.z = oc.z;
      camera.position.y = 2.8;
      camera.lookAt(0.3, 0.0, 1.4);
    }

    // Reset carriage when not in active scan dwell
    if (t < TRANSITION_END || t >= SCAN_END) {
      if (userData?.cross?.setCarriage) {
        userData.cross.setCarriage(0, 0);
      }
    }

    // ── Tile state update ─────────────────────────────────────────
    if (userData?.tiles) {
      for (let i = 0; i < userData.tiles.length; i++) {
        const tile = userData.tiles[i];
        let fillOpacity = 0;
        let borderOpacity = 0;
        if (i < currentTileIdx) {
          fillOpacity = 0.55; borderOpacity = 1;
        } else if (i === currentTileIdx && t >= TRANSITION_END && t < SCAN_END) {
          const slotFrac = tileLocalProgress;
          if (slotFrac > 0.70) {
            const dwellT = (slotFrac - 0.70) / 0.30;
            fillOpacity = 0.55 * dwellT;
            borderOpacity = dwellT;
          }
        } else if (i === currentTileIdx && t >= SCAN_END) {
          fillOpacity = 0.55; borderOpacity = 1;
        }
        if (tile.scanFill?.material) tile.scanFill.material.opacity = fillOpacity;
        if (tile.scanBorder?.material) tile.scanBorder.material.opacity = borderOpacity;
      }
    }

    // (The RAPID carriage is driven directly inside Phase 3 above. No
    // separate IK-target → carriage step here — that earlier path mapped
    // world-space tile centers to carriage mm, which exceeded the rails
    // and silently clamped, breaking sync with the ScanHUD overlay.)

    renderer.render(scene, camera);
  });

  // Live HUD: scan progress
  const t = time / duration;
  const REVEAL_END = 0.30;
  const TRANSITION_END = 0.38;
  const SCAN_END_HUD = 0.92;
  const N = COLS * ROWS;
  let scanned = 0;
  let active = -1;
  if (t >= TRANSITION_END && t < SCAN_END_HUD) {
    const scanT = (t - TRANSITION_END) / (SCAN_END_HUD - TRANSITION_END);
    const slot = scanT * N;
    const slotIdx = Math.min(N - 1, Math.floor(slot));
    const slotFrac = slot - slotIdx;
    // Mark a tile "scanned" shortly after the panel arrives there. The
    // carriage finishes its move at slotFrac=0.30 (see Phase 3 above);
    // 0.40 gives a brief settle before the HUD counter increments.
    scanned = slotFrac > 0.40 ? slotIdx + 1 : slotIdx;
    active = slotIdx;
  } else if (t >= SCAN_END_HUD) {
    scanned = N;
    active = N - 1;
  }

  // HUD opacity: fade in after reveal
  const hudOpacity = t < REVEAL_END ? 0 : t < TRANSITION_END
    ? Easing.easeOutCubic((t - REVEAL_END) / (TRANSITION_END - REVEAL_END))
    : 1;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, #14181D 0%, #0B0D10 100%)',
    }}>
      <GridBackdrop />

      <div ref={mountRef} style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width, height,
      }} />

      {/* Carrier callout — T7 platform */}
      <div style={{ opacity: hudOpacity, transition: 'opacity 0.3s' }}>
        <CarrierCallout
          side="right"
          name="T7"
          spec={[
            { k: 'WEIGHT',     v: '710 LB / 322 KG' },
            { k: 'REACH',      v: '2.20 M HORZ' },
            { k: 'LIFT',       v: '250+ LB / 113 KG' },
            { k: 'RUNTIME',    v: '8+ HRS' },
            { k: 'IP',         v: 'IP56 SEALED' },
          ]}
        />
      </div>

      {/* Mosaic scan HUD — top-left, fades in after reveal */}
      <div style={{ opacity: hudOpacity, transition: 'opacity 0.3s' }}>
        <ScanHUD scanned={scanned} total={N} active={active} cols={COLS} rows={ROWS} />
      </div>

      <FrameChrome
        idx={4} total={6}
        title="Field Deployment"
        sub="T7 carries RAPID-M to suspect targets at standoff — here, a suspect device inside a public trash receptacle. The cross's internal X/Y carriage walks the panel across the object, capturing a full image mosaic from a single robot position."
      />
    </div>
  );
}

// Mosaic scan HUD — shows tile grid, count, and active tile.
function ScanHUD({ scanned, total, active, cols, rows }) {
  const tileSize = 36;
  const gap = 4;

  // Compute serpentine order for grid layout — match the same pattern
  // as the scan, so visual tile position matches scan progress.
  const cells = [];
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / cols);
    const colInRow = i % cols;
    const col = row % 2 === 0 ? colInRow : (cols - 1 - colInRow);
    cells.push({ i, col, row });
  }

  return (
    <div style={{
      position: 'absolute', top: 90, left: 28,
      width: 280,
      pointerEvents: 'none', zIndex: 4,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: '0.22em',
        color: '#5C6975', marginBottom: 6,
      }}>
        ▬ MOSAIC CAPTURE
      </div>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 56, fontWeight: 700, lineHeight: 0.95,
        color: '#F6F7F9', marginBottom: 4,
        letterSpacing: '0.02em',
      }}>
        {String(scanned).padStart(2, '0')}<span style={{color: '#5C6975'}}>/{String(total).padStart(2, '0')}</span>
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: '0.18em',
        color: '#E88828', marginBottom: 14,
      }}>
        TILES STITCHED
      </div>

      {/* Tile grid preview */}
      <div style={{
        borderTop: '1px solid #2A3038',
        paddingTop: 12,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${tileSize * 0.78}px)`,
          gap: `${gap}px`,
          marginBottom: 10,
        }}>
          {Array.from({ length: rows }).flatMap((_, row) =>
            Array.from({ length: cols }).map((_, col) => {
              // Find scan order index for this (col,row)
              const cell = cells.find(c => c.col === col && c.row === row);
              const orderIdx = cell.i;
              const isScanned = orderIdx < scanned;
              const isActive = orderIdx === active && !isScanned;
              return (
                <div key={`${col}-${row}`} style={{
                  background: isScanned ? '#E88828' : 'transparent',
                  border: isActive
                    ? '1px solid #F6F7F9'
                    : isScanned
                      ? '1px solid #E88828'
                      : '1px dashed #3A4250',
                  opacity: isScanned ? 0.85 : isActive ? 1 : 0.4,
                  transition: 'background 0.2s, opacity 0.2s',
                  position: 'relative',
                }}>
                  {isActive && (
                    <div style={{
                      position: 'absolute', inset: -3,
                      border: '1px solid #F6F7F9',
                      animation: 'hudPulse 1s ease-in-out infinite',
                    }}/>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          padding: '4px 0',
          borderBottom: '1px solid #1A1F26',
        }}>
          <span style={{ color: '#5C6975', letterSpacing: '0.12em' }}>PATTERN</span>
          <span style={{ color: '#F6F7F9', letterSpacing: '0.05em' }}>{cols}×{rows} SERPENTINE</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          padding: '4px 0',
          borderBottom: '1px solid #1A1F26',
        }}>
          <span style={{ color: '#5C6975', letterSpacing: '0.12em' }}>TILE</span>
          <span style={{ color: '#F6F7F9', letterSpacing: '0.05em' }}>14 × 17 IN</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          padding: '4px 0',
          borderBottom: '1px solid #1A1F26',
        }}>
          <span style={{ color: '#5C6975', letterSpacing: '0.12em' }}>COVERAGE</span>
          <span style={{ color: '#F6F7F9', letterSpacing: '0.05em' }}>4.5 × 3.5 FT</span>
        </div>
      </div>
      <style>{`
        @keyframes hudPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// Carrier spec callout — fixed left/right column with platform name + specs.
function CarrierCallout({ side, name, spec }) {
  return (
    <div style={{
      position: 'absolute', top: 90, [side]: 28,
      width: 280,
      pointerEvents: 'none', zIndex: 4,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: '0.22em',
        color: '#5C6975', marginBottom: 6,
        textAlign: side === 'left' ? 'left' : 'right',
      }}>
        ▬ CARRIER
      </div>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 56, fontWeight: 700, lineHeight: 0.95,
        color: '#F6F7F9', marginBottom: 4,
        textAlign: side === 'left' ? 'left' : 'right',
        letterSpacing: '0.02em',
      }}>
        {name}
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: '0.18em',
        color: '#E88828', marginBottom: 14,
        textAlign: side === 'left' ? 'left' : 'right',
      }}>
        L3HARRIS ROBOTIC SYSTEM
      </div>
      <div style={{
        borderTop: '1px solid #2A3038',
        paddingTop: 10,
      }}>
        {spec.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            padding: '4px 0',
            borderBottom: '1px solid #1A1F26',
          }}>
            <span style={{ color: '#5C6975', letterSpacing: '0.12em' }}>{s.k}</span>
            <span style={{ color: '#F6F7F9', letterSpacing: '0.05em' }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Scene 05 — Mounting Versatility
// Shows the RAPID-M cross mounted on 4 different platforms: dual tripods,
// A-frame ladder, T7 robot, T4 robot. Camera dollies along a shallow arc.
// ═══════════════════════════════════════════════════════════════════════════

// ── Parametric tripod builder ──────────────────────────────────────────────
function buildTripod() {
  const root = new THREE.Group();
  const SCALE = 0.001;

  const mats = {
    leg:    new THREE.MeshStandardMaterial({ color: 0x1a1c1e, roughness: 0.7, metalness: 0.3 }),
    joint:  new THREE.MeshStandardMaterial({ color: 0x8a8e94, roughness: 0.4, metalness: 0.8 }),
    column: new THREE.MeshStandardMaterial({ color: 0x4a4d52, roughness: 0.5, metalness: 0.7 }),
    plate:  new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.35, metalness: 0.85 }),
    foot:   new THREE.MeshStandardMaterial({ color: 0x0e1012, roughness: 0.9, metalness: 0.1 }),
  };

  const SPLAY = Math.PI / 5.2;          // ~35° from vertical
  const UPPER_H = 620;
  const LOWER_H = 420;
  const HUB_Y = (UPPER_H + LOWER_H) * Math.cos(SPLAY);

  // Head plate + center column
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(48, 48, 14, 32), mats.plate);
  plate.position.y = HUB_Y;
  root.add(plate);

  const col = new THREE.Mesh(new THREE.CylinderGeometry(16, 18, 200, 16), mats.column);
  col.position.y = HUB_Y - 115;
  root.add(col);

  // Hub ring where legs meet
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(32, 34, 30, 24), mats.joint);
  hub.position.y = HUB_Y - 30;
  root.add(hub);

  // 3 legs at 120°
  for (let i = 0; i < 3; i++) {
    const azimuth = (i * 2 * Math.PI) / 3;
    const pivot = new THREE.Group();
    pivot.position.y = HUB_Y - 30;
    pivot.rotation.y = azimuth;

    // Tilt group: tilts the leg outward from hub
    const tilt = new THREE.Group();

    // Upper leg
    const upper = new THREE.Mesh(
      new THREE.CylinderGeometry(10, 14, UPPER_H, 12),
      mats.leg,
    );
    upper.position.y = -UPPER_H / 2;
    tilt.add(upper);

    // Knuckle joint
    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(16, 12, 8), mats.joint);
    knuckle.position.y = -UPPER_H;
    tilt.add(knuckle);

    // Lower leg
    const lower = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 11, LOWER_H, 12),
      mats.leg,
    );
    lower.position.y = -UPPER_H - LOWER_H / 2;
    tilt.add(lower);

    // Rubber foot
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(20, 22, 10, 16), mats.foot);
    foot.position.y = -UPPER_H - LOWER_H - 5;
    tilt.add(foot);

    tilt.rotation.x = SPLAY;
    pivot.add(tilt);
    root.add(pivot);
  }

  root.scale.setScalar(SCALE);
  return { group: root, mountY: HUB_Y * SCALE };
}

// ── Parametric A-frame ladder builder ──────────────────────────────────────
// Pivot at the TOP hinge so legs splay outward at the bottom (proper A-frame).
function buildLadder() {
  const root = new THREE.Group();
  const SCALE = 0.001;

  const mats = {
    rail:     new THREE.MeshStandardMaterial({ color: 0xc8a832, roughness: 0.45, metalness: 0.7 }),
    rung:     new THREE.MeshStandardMaterial({ color: 0xb0b4b8, roughness: 0.4, metalness: 0.8 }),
    platform: new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 0.6, metalness: 0.4 }),
    hinge:    new THREE.MeshStandardMaterial({ color: 0x6e7178, roughness: 0.4, metalness: 0.85 }),
    clamp:    new THREE.MeshStandardMaterial({ color: 0x4a4d52, roughness: 0.5, metalness: 0.7 }),
    foot:     new THREE.MeshStandardMaterial({ color: 0x0e1012, roughness: 0.9, metalness: 0.1 }),
  };

  const RAIL_H = 1500;
  const RAIL_W = 480;
  const A_ANGLE = Math.PI / 12;   // ~15° splay
  const RUNG_COUNT = 5;
  const RUNG_SPACING = 260;
  const RUNG_START = 100;         // from bottom of rail

  // Hinge point height in world coords (both faces meet here)
  const hingeY = RAIL_H * Math.cos(A_ANGLE);

  // Front face: 2 rails + rungs — origin at hinge, rails extend downward
  const front = new THREE.Group();
  front.position.y = hingeY;
  [-1, 1].forEach(s => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(38, RAIL_H, 24), mats.rail);
    r.position.set(s * RAIL_W / 2, -RAIL_H / 2, 0);
    front.add(r);
  });
  for (let i = 0; i < RUNG_COUNT; i++) {
    const rung = new THREE.Mesh(
      new THREE.BoxGeometry(RAIL_W - 38, 18, 24),
      mats.rung,
    );
    rung.position.y = -(RAIL_H - RUNG_START - i * RUNG_SPACING);
    front.add(rung);
  }
  front.rotation.x = A_ANGLE;   // bottom tips forward (+Z)
  root.add(front);

  // Rear face: 2 rails (no rungs) — origin at hinge, rails extend downward
  const rear = new THREE.Group();
  rear.position.y = hingeY;
  [-1, 1].forEach(s => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(38, RAIL_H, 24), mats.rail);
    r.position.set(s * RAIL_W / 2, -RAIL_H / 2, 0);
    rear.add(r);
  });
  rear.rotation.x = -A_ANGLE;   // bottom tips backward (-Z)
  root.add(rear);

  // Hinges at top connecting front + rear
  [-1, 1].forEach(s => {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 30, 16), mats.hinge);
    h.rotation.z = Math.PI / 2;
    h.position.set(s * RAIL_W / 2, hingeY, 0);
    root.add(h);
  });

  // Top cap (small block bridging the two hinges — sits just above the
  // hinge centers, sized to NOT protrude past the rails in the depth
  // axis. Earlier this was a 480×10×260 step-platform; when scene 5
  // rotates the ladder 90° around Y, the 260 depth ends up extending
  // ±130mm into/out of the scene and reads as a weird flat slab on
  // top of the A. A 60-deep cap stays inside the rails from any angle.)
  const cap = new THREE.Mesh(new THREE.BoxGeometry(RAIL_W, 14, 60), mats.platform);
  cap.position.y = hingeY + 7;
  root.add(cap);

  // Rubber feet at ground level
  const footZ = RAIL_H * Math.sin(A_ANGLE);
  [-1, 1].forEach(s => {
    const fFront = new THREE.Mesh(new THREE.BoxGeometry(48, 10, 32), mats.foot);
    fFront.position.set(s * RAIL_W / 2, 0, -footZ);
    root.add(fFront);
    const fRear = fFront.clone();
    fRear.position.z = footZ;
    root.add(fRear);
  });

  // Spreader bar (safety brace between rear legs at ~40% up from ground)
  const spreader = new THREE.Mesh(
    new THREE.BoxGeometry(RAIL_W - 40, 6, 6),
    mats.hinge,
  );
  spreader.position.set(
    0,
    0.4 * hingeY,
    0.6 * RAIL_H * Math.sin(A_ANGLE),
  );
  root.add(spreader);

  root.scale.setScalar(SCALE);
  return { group: root, mountY: (hingeY + 10) * SCALE };
}

// ── Parametric adapter bar builder ─────────────────────────────────────────
// Horizontal mounting bracket that bolts to the back of the Y-rail.
// The bar's origin (y=0) is the cross-mount level (where it bolts to the
// Y-rail back face). When legDrop > 0, vertical standoff posts extend
// downward from each end to flanges that rest on the support surface
// (tripod heads, ladder clamps). Works in world-space (meters).
function buildAdapterBar({ width = 1.0, barH = 0.015, barD = 0.05, legDrop = 0 } = {}) {
  const root = new THREE.Group();

  const mats = {
    bar:    new THREE.MeshStandardMaterial({ color: 0x8a8e94, roughness: 0.4, metalness: 0.82 }),
    flange: new THREE.MeshStandardMaterial({ color: 0x72767c, roughness: 0.45, metalness: 0.8 }),
    bolt:   new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.35, metalness: 0.9 }),
    leg:    new THREE.MeshStandardMaterial({ color: 0x7e8288, roughness: 0.42, metalness: 0.8 }),
  };

  // Central horizontal bar (at y=0, the cross-mount level)
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(width, barH, barD),
    mats.bar,
  );
  root.add(bar);

  // Center mounting bolts (where bar attaches to Y-rail back face)
  [-0.06, 0, 0.06].forEach(xOff => {
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.008, 8),
      mats.bolt,
    );
    bolt.position.set(xOff, barH / 2 + 0.004, 0);
    root.add(bolt);
  });

  // End assemblies: standoff legs + flanges at each end
  [-1, 1].forEach(s => {
    const endX = s * width / 2;

    if (legDrop > 0) {
      // Vertical standoff post from bar level down to flange level
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, legDrop, 0.03),
        mats.leg,
      );
      leg.position.set(endX, -legDrop / 2, 0);
      root.add(leg);

      // Bottom flange plate (rests on tripod head / clamp)
      const flange = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.012, barD + 0.03),
        mats.flange,
      );
      flange.position.set(endX, -legDrop - 0.006, 0);
      root.add(flange);

      // Bolt through flange into tripod head
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.018, 10),
        mats.bolt,
      );
      bolt.position.set(endX, -legDrop - 0.006, 0);
      root.add(bolt);
    } else {
      // Flat flange (no legs — bar sits directly on surface)
      const flange = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, barH + 0.008, barD + 0.03),
        mats.flange,
      );
      flange.position.x = endX;
      root.add(flange);

      // Bolt heads on top
      [-1, 1].forEach(bz => {
        const bolt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.006, 0.006, 0.008, 8),
          mats.bolt,
        );
        bolt.position.set(endX, barH / 2 + 0.004, bz * 0.015);
        root.add(bolt);
      });
    }
  });

  return { group: root };
}

// ── Suction-cup mounting adapter ──────────────────────────────────────────
// Flat backing plate that bolts to the back of the cross's Y-rail, with a
// 2×N array of dished suction cups on its rear face. The cups press flat
// against a side panel (box truck door, container side, etc.); no clamps
// or feet needed.
//
//   plateW × plateH  — backing plate footprint (m)
//   cupCount         — cups per row (horizontal)
//   cupRows          — cup rows (vertical)
//   cupR             — cup radius
//   cupD             — cup depth (front-to-back)
function buildSuctionAdapter({
  plateW = 0.30, plateH = 0.30,
  cupCount = 2, cupRows = 2,
  cupR = 0.05, cupD = 0.03,
} = {}) {
  const root = new THREE.Group();

  const mats = {
    plate: new THREE.MeshStandardMaterial({ color: 0x8a8e94, roughness: 0.4, metalness: 0.82 }),
    cupBody: new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.6, metalness: 0.2 }),
    cupRim:  new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.75, metalness: 0.1 }),
  };

  // Backing plate — sits behind the cross's Y-rail back face.
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(plateW, plateH, 0.012),
    mats.plate,
  );
  plate.position.z = -0.006;  // its rear face is ~at z=0 (cup-side)
  root.add(plate);

  // Suction cups — 2×N grid centered on the plate's rear face.
  const cellW = plateW / (cupCount + 0.6);
  const cellH = plateH / (cupRows + 0.6);
  for (let row = 0; row < cupRows; row++) {
    for (let col = 0; col < cupCount; col++) {
      const cx = (col - (cupCount - 1) / 2) * cellW;
      const cy = (row - (cupRows  - 1) / 2) * cellH;
      // Cup body (cone-ish): wide rim → narrower throat.
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(cupR, cupR * 0.55, cupD, 20, 1, true),
        mats.cupBody,
      );
      body.rotation.x = Math.PI / 2;       // axis along Z (front-back)
      body.position.set(cx, cy, -cupD / 2 - 0.012);
      root.add(body);
      // Rim ring sitting against the panel surface
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(cupR, cupR * 0.08, 8, 24),
        mats.cupRim,
      );
      rim.position.set(cx, cy, -cupD - 0.012);
      root.add(rim);
    }
  }

  return { group: root };
}

// ── Crashed Shahed-136 style loitering drone ──────────────────────────────
// Delta-wing, single pusher prop at the rear, vertical wingtip fins.
// Lying tilted on the ground like it pancaked in. Stylized low-poly.
function buildCrashedDrone() {
  const root = new THREE.Group();

  const mats = {
    fuse:   new THREE.MeshStandardMaterial({ color: 0x6e6a5e, roughness: 0.7,  metalness: 0.2 }),
    wing:   new THREE.MeshStandardMaterial({ color: 0x5d594f, roughness: 0.72, metalness: 0.18 }),
    nose:   new THREE.MeshStandardMaterial({ color: 0x3a382f, roughness: 0.6,  metalness: 0.3 }),
    fin:    new THREE.MeshStandardMaterial({ color: 0x4a4740, roughness: 0.7,  metalness: 0.2 }),
    motor:  new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.5,  metalness: 0.6 }),
    prop:   new THREE.MeshStandardMaterial({ color: 0x14141a, roughness: 0.55, metalness: 0.4 }),
    scorch: new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 0.9,  metalness: 0.1 }),
  };

  // Body subgroup so we can crash-tilt the whole airframe at the end.
  const body = new THREE.Group();
  root.add(body);

  // ── Fuselage: tapered prism along +Z ─────────────────────────────
  const FUSE_LEN = 0.7;
  const fuseShape = new THREE.Shape();
  // Cross-section: rounded diamond (looks vaguely like a Shahed body)
  fuseShape.moveTo(0,  0.04);
  fuseShape.lineTo( 0.05,  0);
  fuseShape.lineTo(0, -0.05);
  fuseShape.lineTo(-0.05, 0);
  fuseShape.lineTo(0,  0.04);
  const fuseGeom = new THREE.ExtrudeGeometry(fuseShape, {
    depth: FUSE_LEN, bevelEnabled: false, steps: 1,
  });
  // Taper the extrude by hand: scale verts toward nose
  fuseGeom.translate(0, 0, -FUSE_LEN / 2);
  const fp = fuseGeom.attributes.position;
  for (let i = 0; i < fp.count; i++) {
    const z = fp.getZ(i);
    // Nose narrows; tail keeps fuller width
    const t = (z + FUSE_LEN / 2) / FUSE_LEN;
    const s = 0.55 + t * 0.45;
    fp.setX(i, fp.getX(i) * s);
    fp.setY(i, fp.getY(i) * s);
  }
  fuseGeom.computeVertexNormals();
  const fuse = new THREE.Mesh(fuseGeom, mats.fuse);
  body.add(fuse);

  // ── Nose cone (small dark cone at the front, -Z) ───────────────
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.028, 0.08, 14),
    mats.nose,
  );
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -FUSE_LEN / 2 - 0.04;
  body.add(nose);

  // ── Delta wings ─────────────────────────────────────────────────
  // Each wing: triangle mesh on the XZ plane, attached at fuselage.
  // Right wing.
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);                  // root-leading
  wingShape.lineTo(0, FUSE_LEN * 0.45);     // root-trailing
  wingShape.lineTo(0.55, FUSE_LEN * 0.32);  // wingtip-trailing
  wingShape.lineTo(0.55, FUSE_LEN * 0.18);  // wingtip-leading
  wingShape.lineTo(0, 0);
  const wingGeom = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.014, bevelEnabled: false, steps: 1,
  });
  wingGeom.translate(0, 0, -0.007);
  const wingR = new THREE.Mesh(wingGeom, mats.wing);
  wingR.position.set(0.025, 0, -FUSE_LEN * 0.22);
  body.add(wingR);

  // Left wing — mirror.
  const wingL = wingR.clone();
  wingL.scale.x = -1;
  wingL.position.x = -0.025;
  body.add(wingL);

  // ── Vertical wingtip fins ────────────────────────────────────────
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0, 0.18);
  finShape.lineTo(0.10, 0.12);
  finShape.lineTo(0.12, 0);
  finShape.lineTo(0, 0);
  const finGeom = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.012, bevelEnabled: false, steps: 1,
  });
  finGeom.translate(-0.06, 0, -0.006);
  const finR = new THREE.Mesh(finGeom, mats.fin);
  // Right fin sits at right wingtip pointing up
  finR.position.set(0.575, 0, -FUSE_LEN * 0.05);
  finR.rotation.y = Math.PI / 2;
  body.add(finR);
  const finL = finR.clone();
  finL.position.x = -0.575;
  finL.rotation.y = -Math.PI / 2;
  // Left fin snapped off and bent
  finL.rotation.z = 0.6;
  finL.position.y = -0.03;
  body.add(finL);

  // ── Pusher prop assembly at the rear (+Z) ─────────────────────
  const motorHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.032, 0.06, 14),
    mats.motor,
  );
  motorHousing.rotation.x = Math.PI / 2;
  motorHousing.position.z = FUSE_LEN / 2 + 0.03;
  body.add(motorHousing);

  // Three-blade prop — bent/damaged
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.004, 0.022),
      mats.prop,
    );
    const angle = (i / 3) * Math.PI * 2;
    blade.rotation.z = angle + (i === 1 ? -0.4 : 0);  // one blade bent
    blade.position.set(
      Math.cos(angle) * 0.04,
      Math.sin(angle) * 0.04,
      FUSE_LEN / 2 + 0.065,
    );
    if (i === 2) blade.scale.x = 0.55;  // one blade broken short
    body.add(blade);
  }

  // ── Scorch mark / impact patch on top of fuselage ──────────────
  const scorch = new THREE.Mesh(
    new THREE.CircleGeometry(0.08, 18),
    mats.scorch,
  );
  scorch.rotation.x = -Math.PI / 2;
  scorch.position.set(0.02, 0.041, 0.05);
  body.add(scorch);

  // Crash attitude: nose tilted down into the dirt, rolled onto one side
  body.rotation.set(-0.25, 0.35, 0.5);

  return { group: root };
}

// ── HUD: Platform label (fades per platform) ──────────────────────────────
function PlatformLabel({ name, subtitle, specs, visible, side }) {
  return (
    <div style={{
      position: 'absolute', top: 90, [side || 'right']: 28,
      width: 260,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease',
      pointerEvents: 'none', zIndex: 4,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: '0.22em',
        color: '#5C6975', marginBottom: 6,
      }}>
        ▬ PLATFORM
      </div>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 48, fontWeight: 700, lineHeight: 0.95,
        color: '#F6F7F9', marginBottom: 4,
        letterSpacing: '0.02em', textTransform: 'uppercase',
      }}>
        {name}
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: '0.18em',
        color: '#E88828', marginBottom: 14,
      }}>
        {subtitle}
      </div>
      <div style={{ borderTop: '1px solid #2A3038', paddingTop: 10 }}>
        {specs.map((s, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, padding: '4px 0',
            borderBottom: '1px solid #1A1F26',
          }}>
            <span style={{ color: '#5C6975', letterSpacing: '0.12em' }}>{s.k}</span>
            <span style={{ color: '#F6F7F9', letterSpacing: '0.05em' }}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HUD: Platform progress dots ───────────────────────────────────────────
function PlatformProgress({ active, names }) {
  return (
    <div style={{
      position: 'absolute', bottom: 32, right: 32,
      display: 'flex', gap: 8, alignItems: 'center',
      zIndex: 5, pointerEvents: 'none',
    }}>
      {names.map((n, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <div style={{
            width: i === active ? 28 : 8, height: 8, borderRadius: 4,
            background: i === active ? '#E88828' : '#2A3038',
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
          {i === active && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9, letterSpacing: '0.14em',
              color: '#E88828',
            }}>{n}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Platform metadata ─────────────────────────────────────────────────────
const MOUNT_PLATFORMS = [
  {
    name: 'DUAL TRIPOD',
    subtitle: 'DUAL SURVEYOR TRIPOD MOUNT',
    specs: [
      { k: 'TYPE',   v: 'DUAL ADJUSTABLE TRIPOD' },
      { k: 'HEIGHT', v: '1.0 — 1.7 M' },
      { k: 'WEIGHT', v: '9.0 KG (PAIR)' },
      { k: 'MOUNT',  v: '3/8"-16 THREAD' },
    ],
  },
  {
    name: 'LADDER',
    subtitle: 'A-FRAME STEPLADDER',
    specs: [
      { k: 'TYPE',     v: '6 FT A-FRAME' },
      { k: 'HEIGHT',   v: '1.8 M' },
      { k: 'CAPACITY', v: '136 KG / 300 LB' },
      { k: 'MOUNT',    v: 'C-CLAMP BRACKET' },
    ],
  },
  {
    name: 'T7',
    subtitle: 'L3HARRIS ROBOTIC SYSTEM',
    specs: [
      { k: 'WEIGHT', v: '710 LB / 322 KG' },
      { k: 'REACH',  v: '2.20 M' },
      { k: 'LIFT',   v: '250+ LB / 113 KG' },
      { k: 'IP',     v: 'IP56 SEALED' },
    ],
  },
  {
    name: 'BOX TRUCK',
    subtitle: 'SUCTION-CUP SIDE MOUNT',
    specs: [
      { k: 'MOUNT',    v: '4× SUCTION CUPS' },
      { k: 'HOLD',     v: '60+ KG / CUP' },
      { k: 'DEPLOY',   v: '< 60 SEC' },
      { k: 'SURFACES', v: 'STEEL / ALUM / FRP' },
    ],
  },
];

// ── Arc layout constants ──────────────────────────────────────────────────
// Four platforms along an 80° arc. The truck on platform 3 is ~4 m long
// so adjacent platforms need ≥2.8 m spacing to keep their footprints
// from overlapping in the wide establishing shot.
const ARC_R = 3.5;
const ARC_START = -Math.PI * 0.40;    // ≈ -72°
const ARC_END   =  Math.PI * 0.40;
const PLAT_ANGLES = [0, 1, 2, 3].map(i =>
  ARC_START + (ARC_END - ARC_START) * (i / 3)
);

// Place the RAPID cross on the high-res rigged T7's gripper. The arm
// pose is baked into the GLB, so there's no kinematic solve — we read
// the gripper-mount world position, then place the cross at the same
// spot (slid +0.25m forward in z so the gripper claws meet only the
// adapter bar's back face, not the X/Y rails).
//
// Call this BEFORE adding the bot to its platform group so `gw` is
// expressed in the same frame the cross will sit in. The platform
// group is rotated later; both bot and cross go along together.
function mountCrossOnNewBot(bot, cross) {
  const arm = bot?.parts?.arm;
  if (!arm?.gripperMount) return;

  bot.group.updateMatrixWorld(true);
  const gw = new THREE.Vector3();
  arm.gripperMount.getWorldPosition(gw);

  // (0, 0, π/2) keeps the panel facing +Z (same orientation Scene 4 uses).
  cross.group.rotation.set(0, 0, Math.PI / 2);
  cross.group.position.set(gw.x, gw.y, gw.z + 0.25);
}

// ── SceneMountingVersatility ──────────────────────────────────────────────
function SceneMountingVersatility({ width, height }) {
  const { time, duration } = useTimeline();

  const [mountRef, stateRef] = useThreeScene({
    width, height,
    background: '#0B0D10',
    build: (ctx) => {
      // Wider FOV for the arc
      ctx.camera.fov = 42;
      ctx.camera.updateProjectionMatrix();
      // Wider shadow frustum
      ctx.scene.traverse(o => {
        if (o.isDirectionalLight && o.shadow) {
          o.shadow.camera.left = -5;
          o.shadow.camera.right = 5;
          o.shadow.camera.top = 4;
          o.shadow.camera.bottom = -4;
          o.shadow.camera.updateProjectionMatrix();
        }
      });
      // Bigger ground plane
      ctx.scene.traverse(o => {
        if (o.isMesh && o.material && o.material.type === 'ShadowMaterial') {
          o.geometry.dispose();
          o.geometry = new THREE.PlaneGeometry(14, 14);
        }
      });

      const root = new THREE.Group();
      const crosses = [];
      const platformGroups = [];

      // ── Platform 0: Dual Tripods (one at each end of adapter bar) ──
      // Tripods sit BEHIND the cross (negative Z). Only the adapter bar
      // bridges from the tripod heads to the Y-rail back face. The cross
      // has full clearance — nothing contacts it except the adapter bar.
      // We lazy-load the GLB and place two instances; if the GLB isn't
      // available we fall back to the parametric buildTripod().
      const tripodGrp = new THREE.Group();
      const TRIPOD_SPREAD = 0.50; // ±0.50m — each end of adapter bar
      const MOUNT_Z = -0.09;      // tripods/adapter behind cross back face
      const CROSS_LIFT = 0.07;    // cross center above tripod head
      const tripodFallbackL = buildTripod();
      const tripodFallbackR = buildTripod();
      const tripodMountY = tripodFallbackL.mountY;
      const tripodSlotL = new THREE.Group();
      const tripodSlotR = new THREE.Group();
      tripodSlotL.position.set(-TRIPOD_SPREAD, 0, MOUNT_Z);
      tripodSlotR.position.set(TRIPOD_SPREAD, 0, MOUNT_Z);
      tripodGrp.add(tripodSlotL);
      tripodGrp.add(tripodSlotR);
      // Default to parametric tripods so the platform renders during the
      // GLB's load window. Swap them out below when the GLB resolves.
      tripodSlotL.add(tripodFallbackL.group);
      tripodSlotR.add(tripodFallbackR.group);
      if (window.TripodModel?.ready) {
        window.TripodModel.ready.then(() => {
          // Build two GLB instances + scale them to the same mount height
          // the parametric tripods exposed. The natural GLB ships at some
          // arbitrary scale — measure it and normalize.
          const probe = window.TripodModel.build();
          if (!probe) return;
          const bb = new THREE.Box3().setFromObject(probe.group);
          const naturalHeight = bb.max.y - bb.min.y;
          const targetHeight = tripodMountY; // match parametric's mountY
          const sc = targetHeight / naturalHeight;
          const lift = -bb.min.y * sc;        // sit base on ground
          [tripodSlotL, tripodSlotR].forEach(slot => {
            slot.remove(...slot.children);   // remove parametric fallback
            const tk = window.TripodModel.build();
            if (!tk) return;
            tk.group.scale.setScalar(sc);
            tk.group.position.y = lift;
            slot.add(tk.group);
          });
        }).catch(() => { /* keep parametric fallback */ });
      }
      const cross0 = window.RAPIDModel.buildRapidM();
      cross0.group.rotation.z = Math.PI / 2;
      cross0.group.position.y = tripodMountY + CROSS_LIFT;
      tripodGrp.add(cross0.group);
      // Adapter bar: legs rest on tripod heads, bar bolts to Y-rail back
      const adapter0 = buildAdapterBar({
        width: TRIPOD_SPREAD * 2,
        legDrop: CROSS_LIFT,
      });
      adapter0.group.position.y = tripodMountY + CROSS_LIFT;
      adapter0.group.position.z = MOUNT_Z;
      tripodGrp.add(adapter0.group);
      const a0 = PLAT_ANGLES[0];
      tripodGrp.position.set(Math.sin(a0) * ARC_R, -0.55, Math.cos(a0) * ARC_R);
      tripodGrp.rotation.y = a0;
      root.add(tripodGrp);
      crosses.push(cross0);
      platformGroups.push(tripodGrp);

      // ── Platform 1: Ladder (rear-clamp mount, profile view) ──
      // Ladder is rotated 90° so the camera sees the A-frame in profile.
      // The cross sits OUTSIDE the ladder (in front, toward the camera),
      // centered on the ladder's vertical axis. The rear adapter bar
      // bolts to the back of the cross's Y-rail and clamps onto the
      // ladder's near rail — same mount pattern as the tripod, just with
      // a single ladder behind instead of two tripod heads.
      const ladderGrp = new THREE.Group();
      const LADDER_MOUNT_Y = 0.85;   // mid-ladder height (~rung 3-4 area)
      const LADDER_LIFT = 0.055;     // cross center above clamp point
      const LADDER_Z = -0.32;        // pushed back so cross sits in front
      const ladderFallback = buildLadder();
      const ladderSlot = new THREE.Group();
      ladderSlot.position.set(0, 0, LADDER_Z);
      ladderSlot.rotation.y = Math.PI / 2;
      ladderGrp.add(ladderSlot);
      // Default to parametric ladder during the GLB's load window
      ladderSlot.add(ladderFallback.group);
      if (window.LadderModel?.ready) {
        window.LadderModel.ready.then(() => {
          const lk = window.LadderModel.build();
          if (!lk) return;
          // Normalize to a real ~6 ft (1.8 m) A-frame stepladder. Measure
          // the natural mesh height and scale to match.
          const bb = new THREE.Box3().setFromObject(lk.group);
          const naturalHeight = bb.max.y - bb.min.y;
          const targetHeight = 1.8;  // ~6 ft
          const sc = targetHeight / naturalHeight;
          const lift = -bb.min.y * sc;
          lk.group.scale.setScalar(sc);
          lk.group.position.y = lift;
          ladderSlot.remove(...ladderSlot.children);
          ladderSlot.add(lk.group);
        }).catch(() => { /* keep parametric fallback */ });
      }

      // Slide the cross forward in +Z so its Y-rail back face clears the
      // ladder's near rail. Without this offset the Y-rail and the ladder
      // front face occupy the same plane and visibly intersect.
      const CROSS_Z = 0.10;
      const cross1 = window.RAPIDModel.buildRapidM();
      cross1.group.rotation.z = Math.PI / 2;
      cross1.group.position.set(0, LADDER_MOUNT_Y + LADDER_LIFT, CROSS_Z);
      ladderGrp.add(cross1.group);

      // Rear adapter bar oriented along Z (depth) instead of X (lateral):
      // one end clamps to the BACK of the cross's Y-rail, the other end
      // clamps onto the FRONT face of the ladder A-frame. Rotating by
      // π/2 around Y reorients the bar; legDrop is set so the bar's
      // end-flanges sit at the cross-mount height (no vertical standoff
      // is needed for this connection).
      // Span: from cross Y-rail back face (z ≈ CROSS_Z - 0.075 = 0.025)
      // to ladder front rail (z ≈ LADDER_Z + 0.24 = -0.08). Use width
      // slightly larger than the 0.10m gap so it overlaps both ends.
      const adapter1 = buildAdapterBar({
        width: 0.18,
        legDrop: 0,
      });
      adapter1.group.rotation.y = Math.PI / 2;
      adapter1.group.position.set(0, LADDER_MOUNT_Y + LADDER_LIFT, -0.025);
      ladderGrp.add(adapter1.group);

      const a1 = PLAT_ANGLES[1];
      ladderGrp.position.set(Math.sin(a1) * ARC_R, -0.55, Math.cos(a1) * ARC_R);
      ladderGrp.rotation.y = a1;
      root.add(ladderGrp);
      crosses.push(cross1);
      platformGroups.push(ladderGrp);

      // ── Platform 2: T7 (high-res rigged GLB) ──
      const t7 = window.RobotModel ? window.RobotModel.build() : null;
      const t7Grp = new THREE.Group();
      if (t7) {
        // Rotate so the chassis-forward direction (natural -Z) becomes
        // t7Grp-local +Z. After t7Grp.rotation.y = a2 below, chassis-forward
        // ends up in world (sin(a2), 0, cos(a2)) = pointing radially out
        // toward the camera. The cross panel (also +Z in t7Grp-local) ends
        // up facing the same direction.
        t7.group.rotation.y = Math.PI;
        t7.group.position.y = 0;
        // Hide the antenna — it pokes up out of the robot body at an
        // angle that reads as a stray black stick in this view. Keep
        // the Camera_stand (it holds the camera assembly together;
        // hiding it leaves the camera head floating above the bot).
        t7.group.traverse(o => {
          if (o.isMesh && o.name === 'Antenna') {
            o.visible = false;
          }
        });
        t7Grp.add(t7.group);
        if (t7.setGripper) t7.setGripper(0.15);
      }
      const cross2 = window.RAPIDModel.buildRapidM();
      if (t7) {
        mountCrossOnNewBot(t7, cross2);
      } else {
        cross2.group.rotation.set(0, 0, Math.PI / 2);
      }
      t7Grp.add(cross2.group);
      const a2 = PLAT_ANGLES[2];
      t7Grp.position.set(Math.sin(a2) * ARC_R, -0.55, Math.cos(a2) * ARC_R);
      // Match the tripod/ladder pattern (rotation = angle, not negated)
      // so the platform faces radially outward toward the camera.
      t7Grp.rotation.y = a2;
      root.add(t7Grp);
      crosses.push(cross2);
      platformGroups.push(t7Grp);

      // ── Platform 3: Box truck (suction-cup side mount) ──
      // Cross suction-cups onto the side panel of a box truck. The truck
      // GLB sits behind the cross (in -Z, platform-local) with one side
      // panel facing the camera; the cross is mounted flat against that
      // panel via 4 suction cups on its back face. Loaded lazily so the
      // platform shows just the cross + cups if the GLB is missing.
      const truckGrp = new THREE.Group();
      const TRUCK_MOUNT_Y = 0.95;        // mount roughly mid-panel height
      const TRUCK_PANEL_Z = -0.30;       // back panel surface (platform-local)
      const truckSlot = new THREE.Group();
      truckGrp.add(truckSlot);
      if (window.TruckModel?.ready) {
        window.TruckModel.ready.then(() => {
          const t = window.TruckModel.build();
          if (!t) return;
          // The shipped GLB is centered at origin with: X = truck length
          // (1.9m natural), Y = height (0.98m), Z = side panel depth
          // (0.84m). Local +Z face is already a side panel — leave the
          // rotation at 0. Scale to a believable real-world size
          // (~2.45m tall, ~4.75m long), then lift so the wheels sit on
          // the ground (platform-local y=0) and recess so the near side
          // panel lands at TRUCK_PANEL_Z.
          const SCALE = 2.0;
          const HALF_H = 0.49 * SCALE;   // half height after scale
          const HALF_Z = 0.42 * SCALE;   // half depth after scale
          t.group.scale.setScalar(SCALE);
          t.group.rotation.y = 0;
          // Shift the truck +0.8 along its local +X (its long axis). Local
          // +X on this platform maps to world direction AWAY from the
          // neighboring T7 platform, so this slide pushes the cab clear
          // of the T7's chassis in the wide establishing shot. The cross
          // + suction adapter stay at platform origin (mounted over the
          // cargo box now, ~mid-truck along its length).
          t.group.position.set(0.8, HALF_H, TRUCK_PANEL_Z - HALF_Z);
          truckSlot.add(t.group);
        }).catch(() => { /* GLB missing — render the rest of the platform */ });
      }

      // Mount the cross + adapter further along the cargo-box side panel
      // (toward the rear of the truck, clear of the cab door). The truck
      // mesh is shifted +0.8 in platform-local +X (cab direction toward
      // -X end), so an X value of +1.5 puts the cross ~0.7 m inboard
      // from the truck center — solidly on the cargo box, not blocking
      // the door.
      const TRUCK_MOUNT_X = 1.5;
      const cross3 = window.RAPIDModel.buildRapidM();
      cross3.group.rotation.z = Math.PI / 2;
      cross3.group.position.set(TRUCK_MOUNT_X, TRUCK_MOUNT_Y, TRUCK_PANEL_Z + 0.10);
      truckGrp.add(cross3.group);

      // Suction-cup adapter — 4 cups in a 2×2 pattern, dished cylinders
      // pressed flat against the truck panel.
      const suction = buildSuctionAdapter({
        cupCount: 2,         // 2 cups wide
        cupRows: 2,          // 2 cups tall
        plateW: 0.36,
        plateH: 0.36,
      });
      suction.group.position.set(TRUCK_MOUNT_X, TRUCK_MOUNT_Y, TRUCK_PANEL_Z + 0.03);
      truckGrp.add(suction.group);

      const a3 = PLAT_ANGLES[3];
      truckGrp.position.set(Math.sin(a3) * ARC_R, -0.55, Math.cos(a3) * ARC_R);
      truckGrp.rotation.y = a3;
      root.add(truckGrp);
      crosses.push(cross3);
      platformGroups.push(truckGrp);

      ctx.scene.add(root);
      return { group: root, crosses, platformGroups };
    },
  });

  // ── Per-frame: camera + carriage animation ──
  React.useEffect(() => {
    const s = stateRef.current; if (!s) return;
    const { camera, renderer, scene, userData } = s;
    const t = time / duration;

    // Compute which platform (0–3) is in focus, with eased transitions.
    // Phase: establish → tripod → transit → ladder → transit → T7
    // → transit → box truck → pull-back. focus is a 0..3 scalar that
    // drives the camera arc angle.
    let focus;
    if      (t < 0.06) focus = interpolate([0, 0.06], [1.5, 0], Easing.easeOutCubic)(t);
    else if (t < 0.20) focus = 0;
    else if (t < 0.24) focus = Easing.easeInOutCubic((t - 0.20) / 0.04);
    else if (t < 0.40) focus = 1;
    else if (t < 0.44) focus = 1 + Easing.easeInOutCubic((t - 0.40) / 0.04);
    else if (t < 0.64) focus = 2;
    else if (t < 0.68) focus = 2 + Easing.easeInOutCubic((t - 0.64) / 0.04);
    else if (t < 0.90) focus = 3;
    else               focus = 3 - Easing.easeInOutCubic((t - 0.90) / 0.10) * 1.5;

    // Camera position: travels along an inner arc. During each dwell phase
    // we pull the camera in closer (CAM_R_FAR → per-platform CAM_R_NEAR)
    // for a punch-in shot, then ease back out during transits.
    // T7 needs more breathing room because the cross sits ~0.9 m outboard
    // of the platform anchor; a too-tight pull-in clips through the chassis.
    const camAngle = ARC_START + (ARC_END - ARC_START) * (focus / 3);
    const CAM_R_FAR = 9.5;
    // [start, end, camR_near, lookY]
    const dwellSpec = [
      [0.06, 0.20, 5.2, 0.45], // tripod
      [0.24, 0.40, 5.4, 0.70], // ladder
      [0.44, 0.64, 7.2, 0.30], // T7
      [0.68, 0.90, 8.0, 0.95], // box truck (mid-panel mount height; camR back to give the truck room)
    ];
    let zoom = 0;
    let camRNear = 5.5;
    let lookY = 0.5;
    const inDwell = dwellSpec.find(([ds, de]) => t >= ds && t <= de);
    if (inDwell) {
      const [ds, de, rN, lY] = inDwell;
      camRNear = rN;
      lookY = lY;
      const localT = (t - ds) / (de - ds);
      if      (localT < 0.20) zoom = Easing.easeInOutCubic(localT / 0.20);
      else if (localT > 0.80) zoom = 1 - Easing.easeInOutCubic((localT - 0.80) / 0.20);
      else                    zoom = 1;
    }
    const camR = CAM_R_FAR - (CAM_R_FAR - camRNear) * zoom;
    const viewOff = 0.0;
    camera.position.x = Math.sin(camAngle + viewOff) * camR;
    camera.position.z = Math.cos(camAngle + viewOff) * camR;
    camera.position.y = (2.0 - 0.8 * zoom) + Math.sin(t * Math.PI * 2) * 0.06;

    // Look at the focused platform's cross-height
    const targetY = 0.5 + (lookY - 0.5) * zoom;
    camera.lookAt(
      Math.sin(camAngle) * ARC_R,
      targetY,
      Math.cos(camAngle) * ARC_R,
    );
    if (userData?.crosses) {
      userData.crosses.forEach((cross, i) => {
        const [ds, de] = dwellSpec[i];
        if (t >= ds && t <= de && cross.setCarriage) {
          const dt = (t - ds) / (de - ds);
          cross.setCarriage(
            Math.sin(dt * Math.PI * 2) * 150,
            Math.sin(dt * Math.PI * 4) * 100,
          );
        } else if (cross.setCarriage) {
          cross.setCarriage(0, 0);
        }
      });
    }

    renderer.render(scene, camera);
  });

  // Active platform for HUD
  const t = time / duration;
  let activePlatform = -1;
  if      (t >= 0.06 && t < 0.20) activePlatform = 0;
  else if (t >= 0.24 && t < 0.40) activePlatform = 1;
  else if (t >= 0.44 && t < 0.64) activePlatform = 2;
  else if (t >= 0.68 && t < 0.90) activePlatform = 3;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, #14181D 0%, #0B0D10 100%)',
    }}>
      <GridBackdrop />

      <div ref={mountRef} style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width, height,
      }} />

      {MOUNT_PLATFORMS.map((p, i) => (
        <PlatformLabel
          key={i}
          name={p.name}
          subtitle={p.subtitle}
          specs={p.specs}
          visible={activePlatform === i}
          side="right"
        />
      ))}

      <PlatformProgress
        active={activePlatform}
        names={MOUNT_PLATFORMS.map(p => p.name)}
      />

      <FrameChrome
        idx={5} total={6}
        title="Mounting Versatility"
        sub="One positioner, any platform. The RAPID-M cross mounts on tripods, ladders, or robotic manipulators for universal field deployment."
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Scene 06 — Universal Compatibility
// Shows RAPID-M working with many DR-panel brands/sizes and driven through
// XTK (Sandia "Unified Scan Control"). Left half: a 3D RAPID-M with the
// currently-selected panel size visualized; the carriage walks through a
// 3×3 mosaic. Right half: a mock XTK control panel that mirrors the scan
// state in real time. The imager dropdown is genuinely interactive so a
// sales presenter can pause auto-cycle and dwell on a specific plate.
// ═══════════════════════════════════════════════════════════════════════════

// ── DR-panel catalog ───────────────────────────────────────────────────────
// Dimensions in mm. Cuattro / Scanna / NexRay get their full lineups; other
// XTK-supported brands get their most common imager size. Values here are
// reasonable defaults — replace with verified spec-sheet numbers if needed.
const PLATES = [
  // Cuattro — partner brand, full lineup
  { brand: 'Cuattro', model: 'Slate 6',              w: 200, h: 250 },
  { brand: 'Cuattro', model: 'Slate Wireless 10×12', w: 254, h: 305 },
  { brand: 'Cuattro', model: 'Slate Wireless 14×17', w: 356, h: 432 },
  { brand: 'Cuattro', model: 'Slate Wireless 17×17', w: 432, h: 432 },
  // Scanna (CR35 platform, multiple IP sizes)
  { brand: 'Scanna',  model: 'CR35 · 18×24',         w: 180, h: 240 },
  { brand: 'Scanna',  model: 'CR35 · 24×30',         w: 240, h: 300 },
  { brand: 'Scanna',  model: 'CR35 · 30×40',         w: 300, h: 400 },
  { brand: 'Scanna',  model: 'CR35 · 35×43',         w: 350, h: 430 },
  // NexRay — each model is its own size class
  { brand: 'NexRay',  model: 'HDX',                  w: 356, h: 432 },
  { brand: 'NexRay',  model: 'MMX',                  w: 280, h: 355 },
  { brand: 'NexRay',  model: 'Mini',                 w: 200, h: 250 },
  { brand: 'NexRay',  model: 'Nano',                 w: 150, h: 200 },
  { brand: 'NexRay',  model: 'Pico',                 w: 100, h: 125 },
  // Other XTK-supported brands, most popular size each
  { brand: 'Kodak',   model: 'ACR',                  w: 356, h: 432 },
  { brand: 'Leidos',  model: 'RTR-5',                w: 254, h: 305 },
  { brand: 'Logos',   model: 'DCR810',               w: 356, h: 432 },
  { brand: 'Logos',   model: 'T-Series',             w: 356, h: 432 },
  { brand: 'VMI',     model: 'iScan',                w: 305, h: 254 },
  { brand: 'ScanX',   model: '12',                   w: 305, h: 254 },
  { brand: 'ScanX',   model: '14',                   w: 356, h: 432 },
  { brand: 'ScanX',   model: 'Scout',                w: 200, h: 250 },
];

// Group plates by brand for the dropdown's section headers.
const PLATES_BY_BRAND = PLATES.reduce((acc, p, i) => {
  (acc[p.brand] = acc[p.brand] || []).push({ ...p, idx: i });
  return acc;
}, {});

// Seconds spent on each plate before auto-cycling to the next.
const PLATE_DWELL_SEC = 6.5;

// ── Scene 6 component ─────────────────────────────────────────────────────
function SceneCompatibility({ width, height }) {
  const { time, duration } = useTimeline();

  // Auto-cycle plate index. The user can override via the dropdown; we
  // store the override + the time it was set, then ignore auto-cycle for
  // a short hold-time so the manual selection sticks.
  const [override, setOverride] = React.useState(null);  // { idx, t0 }
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const HOLD_AFTER_PICK_SEC = 25;

  const autoIdx = Math.floor(time / PLATE_DWELL_SEC) % PLATES.length;
  const useOverride = override !== null &&
                      (performance.now() / 1000 - override.t0) < HOLD_AFTER_PICK_SEC;
  const plateIdx = useOverride ? override.idx : autoIdx;
  const plate = PLATES[plateIdx];

  // Scan progress through 9 tiles within the current plate's dwell window.
  // 0 → 1 over PLATE_DWELL_SEC; tile index = floor(progress * 9). The last
  // ~15% holds the completed mosaic before the next plate cycles in.
  const inPlateT = (time % PLATE_DWELL_SEC) / PLATE_DWELL_SEC;
  const SCAN_END = 0.85;
  const scanProgress = Math.min(1, inPlateT / SCAN_END);
  const N_TILES = 9;
  const tileSlot = scanProgress * N_TILES;
  const activeTile = Math.min(N_TILES - 1, Math.floor(tileSlot));
  const tileFrac = tileSlot - activeTile;
  // A tile is marked "scanned" shortly after the panel arrives at it.
  const scannedCount = scanProgress >= 1
    ? N_TILES
    : (tileFrac > 0.35 ? activeTile + 1 : activeTile);

  // ── 3D scene ─────────────────────────────────────────────────────────────
  const [mountRef, stateRef] = useThreeScene({
    width, height,
    background: '#0B0D10',
    build: (ctx) => {
      ctx.camera.fov = 32;
      ctx.camera.updateProjectionMatrix();
      const root = new THREE.Group();
      const cross = window.RAPIDModel.buildRapidM();
      // Face the camera, panel pointed +Z. Same orientation Scenes 1 and 2 use.
      cross.group.rotation.z = Math.PI / 2;
      cross.group.rotation.x = -0.05;
      // CAD-mode RAPID has its panel offset ~0.8m in +X from the cross
      // root. Shift the whole cross left so the panel lands near origin
      // (where the camera will be looking).
      cross.group.position.x = -0.80;
      root.add(cross.group);

      // Hide the CAD's built-in DR panel — it's mounted on a bracket
      // OFF to one side of the carriage assembly, not on the carriage's
      // front face. We render our own plate mesh and lock it to the
      // front Y-carriage block per frame.
      //
      // (Naming note: the cross is rotated 90° around Z for this view,
      // so what visually looks like the X-axis carriage is actually the
      // CAD's Y-carriage. The yCarriageFront mesh IS the bolt-hole
      // mounting plate we want the DR panel to sit on top of.)
      if (cross.parts.drPanel) cross.parts.drPanel.visible = false;

      const plateMat = new THREE.MeshStandardMaterial({
        color: 0x080a0d,            // near-black sensor face, slightly
        roughness: 0.6, metalness: 0.15,
        emissive: 0x12161c,          // faint glow so the plate reads
        emissiveIntensity: 0.4,      // distinct from the dark rails
      });
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.4, 0.012),
        plateMat,
      );
      ctx.scene.add(plate);

      // Locate the front Y-carriage mesh (the bolt-hole mounting block
      // we see facing the camera). The DR plate sits on its front face.
      // cross.parts doesn't expose this directly, so we walk the tree.
      let carriageFront = null;
      cross.group.traverse(o => {
        if (!carriageFront && o.isMesh && o.name === 'yCarriageFront') {
          carriageFront = o;
        }
      });


      ctx.scene.add(root);
      return { group: root, cross, plate, carriageFront };
    },
  });

  // Rebuild the plate mesh's geometry whenever the selected plate
  // changes. Plate dims are in mm; the plate mesh is parented to the
  // scene root (world frame, meters), so multiply by 0.001 to convert.
  React.useEffect(() => {
    const s = stateRef.current; if (!s) return;
    const plateMesh = s.userData?.plate;
    if (!plateMesh) return;
    const w = plate.w * 0.001;   // `plate` here is the SELECTED plate
    const h = plate.h * 0.001;   // object from PLATES[plateIdx]
    const d = 0.012;             // 12 mm panel thickness
    plateMesh.geometry.dispose();
    plateMesh.geometry = new THREE.BoxGeometry(w, h, d);
  }, [plateIdx]);

  // ── Per-frame: carriage + camera ─────────────────────────────────────────
  React.useEffect(() => {
    const s = stateRef.current; if (!s) return;
    const { camera, renderer, scene, userData } = s;

    // Camera: slight rotation around the cross so it's not a dead-on view.
    // With cross.group.position.x = -0.80, the panel ends up at world
    // X ≈ -0.55 (CAD-baked offset). Aim the lookAt at -0.20 so the panel
    // sits in the LEFT half of the frame while the rest of the cross
    // structure (Y-rail, motors) extends further left and the XTK panel
    // overlay stays clear on the right.
    const camAngle = 0.18 + Math.sin(time * 0.18) * 0.10;
    const camR = 1.6;
    const lookX = -0.20;
    const lookY = 0.0;
    camera.position.set(
      lookX + Math.sin(camAngle) * camR,
      lookY + 0.35,
      Math.cos(camAngle) * camR,
    );
    camera.lookAt(lookX, lookY, 0);

    // Carriage motion — 3×3 serpentine across the current plate. Tile
    // coords use the plate's actual half-size in mm so the panel sweeps
    // EXACTLY the area of the selected plate (smaller plates → tighter
    // mosaic). Same screenY/-screenX swap Scenes 2 + 4 use.
    if (userData?.cross?.setCarriage) {
      const half = Math.min(plate.w, plate.h) * 0.35;  // sweep < plate edge
      const row = Math.floor(activeTile / 3);
      const colInRow = activeTile % 3;
      const col = row % 2 === 0 ? colInRow : (2 - colInRow); // snake
      // Previous tile (so we can ease between them)
      const prevTileIdx = Math.max(0, activeTile - 1);
      const prevRow = Math.floor(prevTileIdx / 3);
      const prevColInRow = prevTileIdx % 3;
      const prevCol = prevRow % 2 === 0 ? prevColInRow : (2 - prevColInRow);
      // 3-position arrays for column/row positions
      const colPos = (c) => (c - 1) * half;
      const rowPos = (r) => (1 - r) * half;  // row 0 = top
      const moveT = Math.min(1, tileFrac / 0.30);
      const eased = Easing.easeInOutCubic(moveT);
      const screenX = colPos(prevCol) + (colPos(col) - colPos(prevCol)) * eased;
      const screenY = rowPos(prevRow) + (rowPos(row) - rowPos(prevRow)) * eased;
      // Swap + negate to match the cross's rotated carriage axes.
      userData.cross.setCarriage(screenY, -screenX);
    }

    // ── Lock the plate mesh onto the FRONT Y-carriage block ────────
    // The cross is rotated 90° around Z for this view, so what looks
    // like the "X-axis carriage" visually is actually the CAD's
    // yCarriageFront mesh. That's the bolt-hole mounting block facing
    // the camera. Each frame we read its world bbox center and put the
    // plate there + 5 cm forward in world +Z so it visually sits on
    // the front face of the carriage regardless of plate size.
    //
    // CRITICAL: refresh the cross root's world matrices BEFORE reading
    // the bbox. setCarriage just sets pivot.position; world matrices
    // aren't recomputed until the next render. Without this explicit
    // update the bbox reflects the PREVIOUS frame's carriage position,
    // producing visible one-frame lag.
    const plateMesh = userData?.plate;
    const cFront = userData?.carriageFront;
    const crossGroup = userData?.cross?.group;
    if (plateMesh && cFront && crossGroup) {
      crossGroup.updateMatrixWorld(true);
      const center = new THREE.Box3().setFromObject(cFront).getCenter(new THREE.Vector3());
      center.z += 0.05;
      plateMesh.position.copy(center);
    }

    renderer.render(scene, camera);
  });

  // ── Dropdown handlers ───────────────────────────────────────────────────
  const pickPlate = (idx) => {
    setOverride({ idx, t0: performance.now() / 1000 });
    setDropdownOpen(false);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, #14181D 0%, #0B0D10 100%)',
    }}>
      <GridBackdrop />

      <div ref={mountRef} style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width, height,
      }} />

      <XTKControlPanel
        plate={plate}
        plateIdx={plateIdx}
        scannedCount={scannedCount}
        activeTile={activeTile}
        nTiles={N_TILES}
        scanProgress={scanProgress}
        dropdownOpen={dropdownOpen}
        onToggleDropdown={() => setDropdownOpen(o => !o)}
        onPickPlate={pickPlate}
      />

      <FrameChrome
        idx={6} total={6}
        title="Universal Compatibility"
        sub="RAPID-M accepts any 14×17″-class DR plate from the major imager brands and is driven through Sandia's XTK Unified Scan Control. One mosaic UI, every panel — pick your imager, deploy."
      />
    </div>
  );
}

// ── XTK Unified Scan Control — mock UI panel ──────────────────────────────
// Styled to match the screenshot the user provided: dark navy panel, bright
// blue tiles labeled by row+column (1A, 1B... 3C), connection banner,
// progress counter, imager dropdown. Pinned to the right ~45% of the frame.
function XTKControlPanel({
  plate, plateIdx, scannedCount, activeTile, nTiles, scanProgress,
  dropdownOpen, onToggleDropdown, onPickPlate,
}) {
  const TILE = 78;          // tile size in px
  const GAP  = 4;

  // Map serpentine scan index (0..8) → grid position (col, row) where
  // row 0 = TOP and col 0 = LEFT to match the XTK screenshot layout
  // (1A bottom-left, 3C top-right). We render rows top-to-bottom so the
  // first scan tile (which is "top-left = 3A" by XTK convention) is the
  // visually-first cell.
  function serpentinePos(i) {
    const r = Math.floor(i / 3);
    const cInRow = i % 3;
    const col = r % 2 === 0 ? cInRow : (2 - cInRow);
    return { row: r, col };
  }

  // Status banner — mirrors the yellow-bordered bottom bar in real XTK.
  const status = scanProgress >= 1
    ? { label: 'COMPLETE', dot: '#3FB985' }
    : scanProgress > 0
      ? { label: 'SCANNING', dot: '#E88828' }
      : { label: 'READY',    dot: '#3FB985' };

  return (
    <div style={{
      position: 'absolute', right: 32, top: 90, bottom: 96,
      width: 460,
      pointerEvents: 'auto', zIndex: 4,
      fontFamily: 'JetBrains Mono, monospace',
      color: '#F6F7F9',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* XTK version stamp */}
      <div style={{
        fontSize: 10, letterSpacing: '0.22em',
        color: '#5C6975', marginBottom: 6,
      }}>
        ▬ XTK 3.4.3 · UNIFIED SCAN CONTROL
      </div>
      <div style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 36, fontWeight: 700, lineHeight: 0.95,
        color: '#F6F7F9', marginBottom: 12,
        letterSpacing: '0.02em',
      }}>
        MOSAIC CAPTURE · {String(scannedCount).padStart(2, '0')}/{String(nTiles).padStart(2, '0')}
      </div>

      {/* 3×3 Mosaic grid panel (XTK-blue background, tiled cells) */}
      <div style={{
        background: '#0F2638',
        border: '1px solid #1f4a6a',
        padding: 18,
        borderRadius: 2,
        marginBottom: 12,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(3, ${TILE}px)`,
          gridTemplateRows: `repeat(3, ${TILE}px)`,
          gap: `${GAP}px`,
          justifyContent: 'center',
        }}>
          {Array.from({ length: 9 }).map((_, gridIdx) => {
            const col = gridIdx % 3;
            const row = Math.floor(gridIdx / 3);
            // Find which scan index lands at this (col, row)
            let scanIdx = -1;
            for (let i = 0; i < 9; i++) {
              const p = serpentinePos(i);
              if (p.col === col && p.row === row) { scanIdx = i; break; }
            }
            const scanned = scanIdx < scannedCount;
            const active  = scanIdx === activeTile && !scanned;
            // XTK labels rows 3,2,1 top-to-bottom and cols A,B,C left-to-right
            const xtkLabel = `${3 - row}${String.fromCharCode(65 + col)}`;

            return (
              <div key={gridIdx} style={{
                background: scanned ? '#2a4a6e' : '#1b3852',
                border: active
                  ? '2px dashed #E88828'
                  : scanned
                    ? '1px solid #4d80b0'
                    : '1px solid #20415e',
                position: 'relative',
                display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700, fontSize: 28,
                color: scanned ? '#7ec0ff' : '#4a6f95',
                overflow: 'hidden',
              }}>
                {/* mock x-ray thumbnail for completed tiles */}
                {scanned && (
                  <MockXrayThumb seed={scanIdx} />
                )}
                <span style={{ position: 'relative', zIndex: 2,
                  textShadow: scanned ? '0 0 6px rgba(0,0,0,0.7)' : 'none' }}>
                  {xtkLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection status banner — yellow-bordered like real XTK */}
      <div style={{
        background: '#1A1F26',
        border: '1px solid #c9a82d',
        padding: '8px 12px',
        marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 11, letterSpacing: '0.12em',
      }}>
        <div style={{
          width: 9, height: 9, borderRadius: 9,
          background: status.dot,
          boxShadow: `0 0 8px ${status.dot}`,
        }} />
        <span style={{ color: '#F6F7F9' }}>RAPID-M</span>
        <span style={{ color: '#9aa3ad' }}>·</span>
        <span style={{ color: status.dot }}>{status.label}</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: '#5C6975', fontSize: 10 }}>
          {plate.w}×{plate.h} mm
        </span>
      </div>

      {/* Imager dropdown */}
      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: 10, letterSpacing: '0.22em',
          color: '#5C6975', marginBottom: 4,
        }}>
          IMAGER
        </div>
        <button
          onClick={onToggleDropdown}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%',
            background: '#1A1F26',
            border: '1px solid #2A3038',
            color: '#F6F7F9',
            padding: '10px 14px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12, letterSpacing: '0.06em',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span>
            <strong style={{ color: '#E88828' }}>{plate.brand}</strong>
            {'  '}{plate.model}
          </span>
          <span style={{ color: '#5C6975', fontSize: 10 }}>▼</span>
        </button>

        {dropdownOpen && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            background: '#1A1F26',
            border: '1px solid #2A3038',
            marginBottom: 4,
            maxHeight: 360, overflowY: 'auto',
            fontSize: 11,
            zIndex: 10,
          }}>
            {Object.entries(PLATES_BY_BRAND).map(([brand, models]) => (
              <div key={brand}>
                <div style={{
                  padding: '6px 14px',
                  background: '#14181D',
                  color: '#5C6975',
                  letterSpacing: '0.22em',
                  fontSize: 9,
                  borderBottom: '1px solid #2A3038',
                }}>
                  {brand.toUpperCase()}
                </div>
                {models.map(m => (
                  <button
                    key={m.idx}
                    onClick={() => onPickPlate(m.idx)}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      width: '100%', textAlign: 'left',
                      background: m.idx === plateIdx ? '#252e38' : 'transparent',
                      border: 'none',
                      color: '#F6F7F9',
                      padding: '7px 14px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#252e38'}
                    onMouseLeave={(e) => e.currentTarget.style.background =
                      m.idx === plateIdx ? '#252e38' : 'transparent'}
                  >
                    <span>{m.model}</span>
                    <span style={{ color: '#5C6975' }}>{m.w}×{m.h} mm</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Tiny procedural "x-ray" pattern to suggest a captured tile thumbnail.
// Pure CSS — deterministic per seed so each tile has a consistent look.
function MockXrayThumb({ seed }) {
  const h = (seed * 137) % 360;
  return (
    <div style={{
      position: 'absolute', inset: 4,
      background: `
        radial-gradient(ellipse at ${30 + (seed*17)%40}% ${40 + (seed*29)%30}%,
          rgba(255,200,120,0.18) 0%,
          rgba(180,200,255,0.08) 40%,
          rgba(0,0,0,0.0) 70%),
        radial-gradient(ellipse at ${60 + (seed*23)%30}% ${30 + (seed*13)%40}%,
          rgba(255,170,90,0.16) 0%,
          transparent 60%),
        linear-gradient(${h}deg,
          rgba(255,255,255,0.06) 0%,
          rgba(0,0,0,0.5) 100%)
      `,
      mixBlendMode: 'screen',
      opacity: 0.7,
    }}/>
  );
}

// Export to global scope
Object.assign(window, {
  SceneTurntable,
  SceneMosaic,
  SceneExploded,
  SceneFieldDeployment,
  SceneMountingVersatility,
  SceneCompatibility,
  FrameChrome,
  GridBackdrop,
});
