// rapid-model.js
// Parametric Three.js model of the RAPID-M cross-rail X/Y motorized DR positioner.
// Built from primitives (BoxGeometry, ExtrudeGeometry) matching the CAD renders:
//   - 1000mm × 1000mm cross of black-anodized aluminum extrusion
//   - 4 hex end-caps with mounting holes
//   - Central rotary hub
//   - X-axis carriage (the moving DR-mount sled)
//   - DR panel + 4 plastic corner clamps
//
// Returns { group, parts } where parts are named handles for animation:
//   parts.xCarriage  — slides along the horizontal beam (carriage X position in mm)
//   parts.yCarriage  — slides along the vertical beam   (carriage Y position in mm)
//   parts.drPanel    — the DR panel mesh (parented under the carriages)
//   parts.estop      — the orange e-stop button (used as accent)
//
// Coordinates: world Y is up, beam-cross sits in the X/Y plane facing -Z (camera looks at +Z by default).
// Units: 1 unit = 1 mm in the spec, but we scale to ~0.001 to keep the scene small.

(function (global) {
  const SCALE = 0.001; // 1mm => 0.001 world units. So a 1000mm beam = 1 unit.

  // ── Materials (cached, brand-correct) ─────────────────────────────────────
  function makeMaterials() {
    return {
      // Black anodized aluminum extrusion — slightly warm dark, semi-rough.
      anodized: new THREE.MeshStandardMaterial({
        color: 0x14181d,
        roughness: 0.55,
        metalness: 0.55,
      }),
      // T-slot face: same color but with a subtle sheen.
      anodizedSlot: new THREE.MeshStandardMaterial({
        color: 0x0e1115,
        roughness: 0.7,
        metalness: 0.4,
      }),
      // 6061 raw aluminum — brushed satin gray (the corner caps, hub plate)
      aluminum: new THREE.MeshStandardMaterial({
        color: 0xc8ccd1,
        roughness: 0.45,
        metalness: 0.85,
      }),
      // Stainless plate (DR-mount sled, mounting plates)
      stainless: new THREE.MeshStandardMaterial({
        color: 0xb8bcc2,
        roughness: 0.35,
        metalness: 0.9,
      }),
      // White plastic corner clamps (DR panel)
      plastic: new THREE.MeshStandardMaterial({
        color: 0xeae8e4,
        roughness: 0.6,
        metalness: 0.05,
      }),
      // DR panel face — flat black sensor surface
      drPanel: new THREE.MeshStandardMaterial({
        color: 0x0a0c0e,
        roughness: 0.85,
        metalness: 0.1,
      }),
      // Orange e-stop / functional accent
      estop: new THREE.MeshStandardMaterial({
        color: 0xE88828,
        roughness: 0.4,
        metalness: 0.2,
        emissive: 0x331a05,
        emissiveIntensity: 0.4,
      }),
      // Stepper motor (matte black with metal end)
      motorBody: new THREE.MeshStandardMaterial({
        color: 0x18191b,
        roughness: 0.7,
        metalness: 0.3,
      }),
    };
  }

  // ── Geometry helpers ──────────────────────────────────────────────────────

  // T-slot extrusion beam: two end-caps (hex) + a long extruded body in between.
  // Length, width, height all in mm. Orientation: long axis along +X.
  function makeBeam({ length = 1000, w = 40, h = 40, mats }) {
    const g = new THREE.Group();

    // Main extrusion body — slightly inset so we can layer T-slot grooves
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(length, h, w),
      mats.anodized
    );
    g.add(body);

    // Two recessed slot strips on the long faces (front and back) — visual
    // detail that makes it read as 40×40 t-slot extrusion.
    const slotDepth = 1.5;
    const slotWidth = 8;
    const slotGeo = new THREE.BoxGeometry(length - 4, slotWidth, slotDepth);
    [-1, 1].forEach(side => {
      const slot = new THREE.Mesh(slotGeo, mats.anodizedSlot);
      slot.position.set(0, 0, (w / 2) * side - 0.001 * side);
      g.add(slot);
    });
    [-1, 1].forEach(side => {
      const slot = new THREE.Mesh(
        new THREE.BoxGeometry(length - 4, slotDepth, slotWidth),
        mats.anodizedSlot
      );
      slot.position.set(0, (h / 2) * side - 0.001 * side, 0);
      g.add(slot);
    });

    return g;
  }

  // Hex end-cap (the silver elongated hex with mounting holes you see at each
  // corner of the cross). Made by extruding a hexagon shape.
  function makeHexCap({ size = 60, thickness = 8, mats }) {
    const shape = new THREE.Shape();
    const r = size / 2;
    // Elongated hex: wider on the long axis
    const w = r * 1.4, h = r * 0.9;
    shape.moveTo(-w, 0);
    shape.lineTo(-w * 0.6, h);
    shape.lineTo(w * 0.6, h);
    shape.lineTo(w, 0);
    shape.lineTo(w * 0.6, -h);
    shape.lineTo(-w * 0.6, -h);
    shape.closePath();

    // Mounting hole
    const hole = new THREE.Path();
    hole.absarc(0, 0, r * 0.25, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.8,
      bevelSize: 0.8,
      bevelSegments: 2,
    });
    geo.translate(0, 0, -thickness / 2);
    const mesh = new THREE.Mesh(geo, mats.aluminum);
    return mesh;
  }

  // Central rotary hub (the round silver disc + square mounting block where
  // the cross beams meet). This is what the X/Y motion is referenced from.
  function makeCentralHub({ mats }) {
    const g = new THREE.Group();

    // Round flange disc
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(80, 80, 18, 48),
      mats.aluminum
    );
    disc.rotation.x = Math.PI / 2;
    g.add(disc);

    // Inner mounting block (square stainless block at center)
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(70, 70, 22),
      mats.stainless
    );
    block.position.z = 6;
    g.add(block);

    // Tripod-mount tab on the back
    const tab = new THREE.Mesh(
      new THREE.BoxGeometry(50, 50, 8),
      mats.aluminum
    );
    tab.position.z = -16;
    g.add(tab);

    return g;
  }

  // X-axis carriage: the sled that rides along the horizontal beam and carries
  // the Y-axis sub-rail + DR panel. A stainless plate bolted across the beam.
  function makeCarriagePlate({ width = 120, height = 90, depth = 6, mats }) {
    const g = new THREE.Group();
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      mats.stainless
    );
    g.add(plate);
    // 4 small bolts on corners
    const bolt = new THREE.CylinderGeometry(2.5, 2.5, depth + 1.5, 12);
    const bm = new THREE.MeshStandardMaterial({ color: 0x6e7178, roughness: 0.4, metalness: 0.85 });
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
      const b = new THREE.Mesh(bolt, bm);
      b.rotation.x = Math.PI / 2;
      b.position.set(sx * (width/2 - 8), sy * (height/2 - 8), depth/2);
      g.add(b);
    });
    return g;
  }

  // DR panel — flat black sensor with 4 white plastic corner clamps.
  // Standard 14"×17" panel (~356mm × 432mm).
  function makeDrPanel({ mats }) {
    const g = new THREE.Group();
    const W = 356, H = 432, T = 16;

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(W, H, T),
      mats.drPanel
    );
    g.add(body);

    // 4 plastic clamps on corners (the white nubs in the dr-mount-front render)
    const clampGeo = new THREE.BoxGeometry(36, 22, 10);
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx, sy]) => {
      const c = new THREE.Mesh(clampGeo, mats.plastic);
      c.position.set(sx * (W/2 - 6), sy * (H/2 - 4), -T/2 + 2);
      g.add(c);
    });

    return g;
  }

  // Stepper motor (the gray boxy thing at the end of the X-rail in the x-rail render)
  function makeStepperMotor({ mats }) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(56, 56, 70),
      mats.motorBody
    );
    g.add(body);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(20, 20, 10, 24),
      mats.aluminum
    );
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 40;
    g.add(cap);
    return g;
  }

  // ── Top-level assembly ────────────────────────────────────────────────────
  // Builds the full RAPID-M cross with REAL kinematics:
  //   - Vertical beam (Y-rail) is fixed to the chassis.
  //   - Horizontal beam (X-rail) is parented to a Y-carrier that slides up/down
  //     the Y-rail. So the whole horizontal beam translates in Y.
  //   - DR panel is parented to an X-carrier that slides left/right along
  //     the horizontal beam. So the panel translates in X relative to the
  //     horizontal beam (i.e. its world position is X relative + Y carrier).
  // setCarriage(xMm, yMm) sets the panel's local X and the X-rail's Y.
  function buildRapidM(opts) {
    opts = opts || {};
    // realistic=true: replace the parametric chassis (beams, hex caps, hub,
    // motor, e-stop, plates, bracket) with a clone of the FBX CAD geometry
    // loaded by rapid-fbx.mjs. The kinematic carriers (yCarrier, xCarrier)
    // and the DR panel stay parametric so the panel still slides on rails.
    // realistic=false: original parametric model (used by exploded scene).
    const realistic = opts.realistic !== false; // default true
    const mats = makeMaterials();
    const root = new THREE.Group();

    const BEAM_LEN = 1000;
    const BEAM_W = 40;

    // ── Fixed chassis: vertical beam + central hub + corner caps + motor ──

    // Vertical beam (Y-rail) — fixed
    const vBeam = makeBeam({ length: BEAM_LEN, w: BEAM_W, h: BEAM_W, mats });
    vBeam.rotation.z = Math.PI / 2;
    root.add(vBeam);

    // Top + bottom hex caps (on the Y-rail tips, fixed to chassis)
    [BEAM_LEN/2, -BEAM_LEN/2].forEach((y) => {
      const cap = makeHexCap({ size: 70, thickness: 14, mats });
      cap.position.set(0, y + Math.sign(y) * 8, 0);
      root.add(cap);
    });

    // Central rotary hub (mounting point for tripod / Spot / MTRS)
    const hub = makeCentralHub({ mats });
    hub.position.z = -10;
    root.add(hub);

    // ── Y-carrier: slides up/down the vertical beam, carries the X-rail ──
    const yCarrier = new THREE.Group();
    root.add(yCarrier);

    // Y-axis carriage plate (the saddle that rides the Y-rail)
    const yPlate = makeCarriagePlate({ width: 80, height: 120, depth: 6, mats });
    yPlate.position.z = BEAM_W / 2 + 3;
    yCarrier.add(yPlate);

    // Horizontal beam (X-rail) — parented to yCarrier so it moves with Y
    const hBeam = makeBeam({ length: BEAM_LEN, w: BEAM_W, h: BEAM_W, mats });
    // Mount the horizontal beam slightly forward of the vertical beam so
    // they don't z-fight where they cross.
    hBeam.position.z = BEAM_W; // 40mm forward
    yCarrier.add(hBeam);

    // Left + right hex caps (on the X-rail tips) — also move with Y
    [BEAM_LEN/2, -BEAM_LEN/2].forEach((x) => {
      const cap = makeHexCap({ size: 70, thickness: 14, mats });
      cap.position.set(x + Math.sign(x) * 8, 0, BEAM_W);
      cap.rotation.z = Math.PI / 2;
      yCarrier.add(cap);
    });

    // Stepper motor on the +X end of the horizontal beam — moves with Y
    const motor = makeStepperMotor({ mats });
    motor.position.set(BEAM_LEN/2 + 30, 0, BEAM_W + BEAM_W/2 + 12);
    motor.rotation.x = Math.PI / 2;
    yCarrier.add(motor);

    // E-stop on +X tip — moves with Y
    const estopBody = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 14, 18, 32),
      mats.estop
    );
    estopBody.rotation.x = Math.PI / 2;
    const estopBase = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 18, 6, 32),
      mats.aluminum
    );
    estopBase.rotation.x = Math.PI / 2;
    const estopGroup = new THREE.Group();
    estopGroup.add(estopBase);
    estopBody.position.z = 8;
    estopGroup.add(estopBody);
    estopGroup.position.set(BEAM_LEN/2 + 5, 0, BEAM_W + BEAM_W/2 + 10);
    yCarrier.add(estopGroup);

    // ── X-carrier: slides left/right along the horizontal beam ──
    // Parented to yCarrier so it inherits the Y motion of the X-rail.
    const xCarrier = new THREE.Group();
    yCarrier.add(xCarrier);

    // X-axis carriage plate — wide saddle that wraps the horizontal beam
    // and visibly bolts the DR panel to it.
    const xPlate = makeCarriagePlate({ width: 180, height: 100, depth: 8, mats });
    xPlate.position.z = BEAM_W + BEAM_W / 2 + 4;
    xCarrier.add(xPlate);

    // Backing bracket behind the panel — sized like a real DR back plate
    // (panel-shaped, dark) so it visually anchors the panel to the rails.
    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(400, 460, 4),
      new THREE.MeshStandardMaterial({ color: 0x141618, roughness: 0.7, metalness: 0.3 })
    );
    bracket.position.z = BEAM_W + BEAM_W / 2 + 9;
    xCarrier.add(bracket);

    // DR panel mount — parented to X-carrier; sits flush on the bracket
    const drPanel = makeDrPanel({ mats });
    drPanel.position.z = BEAM_W + BEAM_W / 2 + 13;
    xCarrier.add(drPanel);

    // ── Realistic mode: replace the entire parametric rig with the CAD ───
    // hierarchy built by rapid-cad-module.js. That module loaded 6 per-axis
    // OBJ/STL files (xRail, xCarriage, yRail, yCarriage, uChannel, panel)
    // and assembled them with proper kinematic parenting:
    //   xCarrier → translates X (parents the whole Y-stage)
    //     yStage → static frame hanging off x-carriage
    //       yCarrier → translates Y (parents the panel + y-sliders)
    //         panel, xMount, yCarriage
    // The CAD rig already has its own setCarriage so we just delegate.
    if (realistic && window.RAPID_CAD && window.RAPID_CAD.build) {
      // Hide ALL parametric chassis primitives — the CAD rig replaces them.
      [vBeam, hBeam, hub, motor, estopGroup, yPlate, xPlate, bracket, drPanel]
        .forEach((o) => { if (o) o.visible = false; });
      root.children.forEach((c) => {
        if (c.geometry && c.geometry.type === 'ExtrudeGeometry') c.visible = false;
      });
      yCarrier.children.forEach((c) => {
        if (c.geometry && c.geometry.type === 'ExtrudeGeometry') c.visible = false;
      });

      const cad = window.RAPID_CAD.build();
      // The CAD rig has its own mm→m scale baked in (template.scale=0.001).
      // Our `root` will later apply SCALE=0.001 too; wrap the CAD rig in an
      // inverse-scale group so the double-scale cancels and CAD renders at
      // its native world-meter size.
      const wrap = new THREE.Group();
      wrap.scale.setScalar(1 / SCALE); // ×1000 to cancel root.scale=0.001
      wrap.add(cad.rig);
      root.add(wrap);

      // Pre-cache explode metadata for every kinematic body. Direction =
      // each body's center → chassis center (outward). Distance scaled by
      // body size + distance-from-center so big outer parts travel further.
      cad.rig.updateMatrixWorld(true);
      const chassisCenter = new THREE.Box3().setFromObject(cad.rig)
        .getCenter(new THREE.Vector3());
      const explodeBodies = [
        cad.parts.xRail,
        cad.parts.xCarriage,
        cad.parts.yRail,
        cad.parts.uChannel,
        cad.parts.yCarriage,
        cad.parts.xMount,
        cad.parts.panel,
      ].filter(Boolean);

      const explodeParts = explodeBodies.map((obj) => {
        const bb = new THREE.Box3().setFromObject(obj);
        const wc = bb.getCenter(new THREE.Vector3());
        const dirWorld = wc.clone().sub(chassisCenter);
        if (dirWorld.length() < 1e-4) dirWorld.set(0, 0.5, 0);
        else dirWorld.normalize();
        const size = bb.getSize(new THREE.Vector3());

        // Convert the world-space explode direction into PARENT-local space
        // by subtracting two transformed points (pure vector transform — no
        // translation). All CAD parts share Fusion's origin so `obj.position`
        // is (0,0,0); explode must offset from that local rest, not from
        // worldPosition. Encoding dir in local space lets us just add it.
        const parentInv = obj.parent
          ? new THREE.Matrix4().copy(obj.parent.matrixWorld).invert()
          : new THREE.Matrix4();
        const p0 = new THREE.Vector3(0, 0, 0).applyMatrix4(parentInv);
        const p1 = dirWorld.clone().applyMatrix4(parentInv);
        const dirLocal = p1.sub(p0); // computed once; recomputed per-frame in scene

        return {
          obj,
          restWorld: obj.getWorldPosition(new THREE.Vector3()),
          restLocal: obj.position.clone(),
          dirWorld,
          dirLocal,
          distScale: Math.min(1.6, 0.4 + size.length() * 0.6 + wc.distanceTo(chassisCenter) * 0.5),
        };
      });

      // Apply global scale + return the CAD-driven API
      root.scale.setScalar(SCALE);
      // DEBUG: expose for inspection
      window.__debugExplodeParts = explodeParts;
      return {
        group: root,
        parts: {
          // Kinematic pivots (animate these via setCarriage)
          xCarrier: cad.pivots.xCarrier,
          yCarrier: cad.pivots.yCarrier,
          yStage:   cad.pivots.yStage,
          // CAD bodies
          xRail:     cad.parts.xRail,
          xCarriage: cad.parts.xCarriage,
          yRail:     cad.parts.yRail,
          yCarriage: cad.parts.yCarriage,
          uChannel:  cad.parts.uChannel,
          panel:     cad.parts.panel,
          xMount:    cad.parts.xMount,
          // Legacy aliases (so older scene code keeps working)
          drPanel:  cad.parts.panel,
          drGroup:  cad.parts.panel,
          bracket:  cad.parts.xMount,
          xPlate:   cad.parts.xCarriage,
          yPlate:   cad.parts.yCarriage,
          vBeam:    cad.parts.yRail,
          hBeam:    cad.parts.xRail,
          motor: null, estop: null, hub: null,
          // Per-part explode handles (renamed from the old fbxExplodeParts
          // key but kept under both names so existing scene code finds them).
          fbxExplodeParts: explodeParts,
          explodeParts,
        },
        setCarriage(xMm, yMm) {
          cad.setCarriage(xMm, yMm);
        },
        LIMITS: cad.LIMITS,
      };
    }

    // ── Realistic mode (FBX fallback — kept for older saves) ──────────────
    let realisticLimits = null;
    if (realistic && false && window.RAPID_FBX && window.RAPID_FBX.chassis) {
      // Hide parametric chassis primitives — keep their positions/refs so
      // exploded view still has handles, but make them invisible. We KEEP
      // xPlate and bracket visible — they're the carriage hardware that
      // visibly attaches the DR panel to the rails (and moves with it
      // under setCarriage).
      [vBeam, hBeam, hub, motor, estopGroup, yPlate]
        .forEach(o => { if (o) o.visible = false; });
      // Also hide the loose hex caps (children of root and yCarrier added
      // earlier in this function — find them by traversal).
      root.children.forEach(c => {
        if (c.geometry && c.geometry.type === 'ExtrudeGeometry') c.visible = false;
      });
      yCarrier.children.forEach(c => {
        if (c.geometry && c.geometry.type === 'ExtrudeGeometry') c.visible = false;
      });

      // Wrap FBX clone with inverse scale so root.scale=0.001 doesn't
      // double-shrink it.
      const fbxClone = window.RAPID_FBX.chassis.clone(true);
      const wrap = new THREE.Group();
      wrap.scale.setScalar(1 / SCALE); // 1000× to cancel root SCALE below
      wrap.add(fbxClone);
      root.add(wrap);

      // Grab references to every LEAF-LEVEL named FBX sub-part for the
      // exploded view. A "leaf group" is one that contains no other groups
      // (only meshes) — those are the actual atomic CAD parts. We pre-cache
      // each part's WORLD-space rest position and a unit world-direction
      // from the chassis center, so the animation can target a world
      // position and convert it to the part's parent local space (FBX
      // hierarchy has nested rotated parents — local-axis offsets won't
      // match world-axis intent).
      const fbxRoot = fbxClone;
      const explodeParts = [];
      fbxRoot.updateMatrixWorld(true);
      const rootCenter = new THREE.Vector3();
      new THREE.Box3().setFromObject(fbxRoot).getCenter(rootCenter);
      // Find leaf groups: groups with at least one mesh descendant and no
      // group descendant. Also include direct meshes that aren't inside
      // any leaf group (rare in this FBX but defensive).
      const isLeafGroup = (o) => {
        if (!o.isGroup) return false;
        let hasGroupChild = false, hasMeshChild = false;
        o.traverse((c) => {
          if (c === o) return;
          if (c.isGroup) hasGroupChild = true;
          if (c.isMesh) hasMeshChild = true;
        });
        return !hasGroupChild && hasMeshChild;
      };
      fbxRoot.traverse((o) => {
        if (!isLeafGroup(o)) return;
        const bb = new THREE.Box3().setFromObject(o);
        if (bb.isEmpty()) return;
        const wc = bb.getCenter(new THREE.Vector3());
        const dir = wc.clone().sub(rootCenter);
        if (dir.length() < 0.05) dir.set(0, 0.5, 0);
        else dir.normalize();
        // Cache rest world position so we can target world coords each frame.
        const restWorld = o.getWorldPosition(new THREE.Vector3());
        const size = bb.getSize(new THREE.Vector3());
        explodeParts.push({
          obj: o,
          restWorld,
          restLocal: o.position.clone(),
          dirWorld: dir,
          distScale: Math.min(1.6, 0.4 + size.length() * 0.4 + wc.distanceTo(rootCenter) * 0.6),
        });
      });

      // ── Hide the static FBX back-plate (the wide thin plate at the
      // front face). It's a non-kinematic CAD detail that visually
      // duplicates the parametric DR panel mount but doesn't move with
      // the carriage. Replaced below by an enlarged parametric bracket
      // that's properly parented under xCarrier.
      for (const p of explodeParts) {
        const bb = new THREE.Box3().setFromObject(p.obj);
        const sz = bb.getSize(new THREE.Vector3());
        const dims = [sz.x, sz.y, sz.z].sort((a, b) => b - a);
        const wide = dims[0] > 0.25 && dims[1] > 0.25;
        const thin = dims[2] < 0.04;
        if (wide && thin) {
          p.obj.visible = false;
          p.skipExplode = true;
        }
      }

      // ── Re-position the parametric DR panel + kinematic carriers to
      // match the FBX chassis dimensions. The FBX is wider/taller than
      // the parametric 1000mm spec model (~1366×1564mm in the prototype).
      const fbxSize = window.RAPID_FBX.sceneSizeMm;          // mm in scene axes
      const fbxMaxZ = (window.RAPID_FBX.sceneMaxMm || { z: 50 }).z; // front face Z
      // Re-park the X-carrier's panel/bracket so they sit just in front of
      // the FBX front face instead of the parametric beam's front face.
      // Parametric panel was at Z = BEAM_W*1.5 + 13 = 73mm. Move it to
      // FBX-front + 25mm gap so it visibly clears the chassis.
      const panelZ = fbxMaxZ + 25;
      drPanel.position.z = panelZ;
      // (bracket + xPlate are hidden in realistic mode but reposition them
      // anyway so debug toggles look right.)
      bracket.position.z = panelZ - 4;
      xPlate.position.z = panelZ - 9;

      // Kinematic limits: panel travel = (chassis_span - panel_size) / 2 - margin.
      // Panel is 356×432mm; clamp clearance ~30mm each side.
      const PANEL_W = 356, PANEL_H = 432, MARGIN = 30;
      realisticLimits = {
        xMin: -(fbxSize.x / 2 - PANEL_W / 2 - MARGIN),
        xMax:  (fbxSize.x / 2 - PANEL_W / 2 - MARGIN),
        yMin: -(fbxSize.y / 2 - PANEL_H / 2 - MARGIN),
        yMax:  (fbxSize.y / 2 - PANEL_H / 2 - MARGIN),
      };
    }

    // Apply global SCALE so 1000mm-cross becomes 1-unit in world space
    root.scale.setScalar(SCALE);

    return {
      group: root,
      parts: {
        // Kinematic carriers (animate these)
        yCarrier,    // moves up/down -> entire X-rail + panel
        xCarrier,    // moves left/right -> panel only (relative to X-rail)
        // Fixed chassis parts
        vBeam, hub,
        // Moving parts (children of yCarrier)
        hBeam, motor, estop: estopGroup,
        // Plates + panel
        xPlate, yPlate, drPanel, bracket,
        // FBX explode parts (only populated in realistic mode) — every
        // named sub-part with its rest position + explode direction.
        fbxExplodeParts: (typeof explodeParts !== 'undefined') ? explodeParts : [],
        // Aliases for older scene code
        drGroup: drPanel,
        xCarriage: xPlate,
        yCarriage: yPlate,
      },
      // Kinematic setter — xMm ∈ [-480, 480], yMm ∈ [-480, 480]
      setCarriage(xMm, yMm) {
        // Clamp to the active limits (FBX-derived in realistic mode, else
        // parametric defaults) so callers using legacy ranges don't push
        // the panel off the actual rails.
        const L = this.LIMITS;
        const cx = Math.max(L.xMin, Math.min(L.xMax, xMm));
        const cy = Math.max(L.yMin, Math.min(L.yMax, yMm));
        yCarrier.position.y = cy;     // X-rail rides up/down on Y-rail
        xCarrier.position.x = cx;     // panel rides left/right along X-rail
      },
      LIMITS: realisticLimits || { xMin: -480, xMax: 480, yMin: -480, yMax: 480 },
    };
  }

  global.RAPIDModel = { buildRapidM, SCALE };
})(window);
