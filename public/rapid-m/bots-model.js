// ─── L3Harris T7 / T4 stylized robot models ──────────────────────────────
// Lo-fi blocky tracked EOD robots for context-of-use scenes.
// Both built from same primitives. Sized to spec (mm). Uses SCALE = 0.001.
//
// Returns { group, parts, gripperAnchor } where gripperAnchor is an Object3D
// at the gripper's mount point — attach the RAPID-M cross to it via .add().

(function (global) {
  const SCALE = 0.001;

  function makeBotMaterials() {
    return {
      // Body — dark olive drab tactical green-gray
      body: new THREE.MeshStandardMaterial({
        color: 0x3a4138, roughness: 0.7, metalness: 0.25,
      }),
      // Body accent — slightly lighter
      bodyAccent: new THREE.MeshStandardMaterial({
        color: 0x4a5249, roughness: 0.65, metalness: 0.3,
      }),
      // Tracks — rubberized black
      track: new THREE.MeshStandardMaterial({
        color: 0x1a1c1e, roughness: 0.95, metalness: 0.1,
      }),
      // Track wheels — gunmetal
      wheel: new THREE.MeshStandardMaterial({
        color: 0x2c3036, roughness: 0.5, metalness: 0.8,
      }),
      // Manipulator arm segments — matte aluminum/khaki
      arm: new THREE.MeshStandardMaterial({
        color: 0x6b7064, roughness: 0.55, metalness: 0.6,
      }),
      // Gripper — darker stainless
      gripper: new THREE.MeshStandardMaterial({
        color: 0x4a4d52, roughness: 0.4, metalness: 0.85,
      }),
      // Camera lens / glass
      lens: new THREE.MeshStandardMaterial({
        color: 0x0a0c0e, roughness: 0.2, metalness: 0.5,
      }),
      // Mast accent (orange visibility marker)
      accent: new THREE.MeshStandardMaterial({
        color: 0xE88828, roughness: 0.55, metalness: 0.2,
      }),
    };
  }

  // ── Track assembly: two parallel tracks with sprocket + idler wheels ──
  function makeTrack({ length, height, width, mats }) {
    const g = new THREE.Group();
    // Main track belt — rounded rectangle approximation: 2 boxes + 2 cylinders
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(length, height, width),
      mats.track
    );
    g.add(belt);
    // Front sprocket
    const front = new THREE.Mesh(
      new THREE.CylinderGeometry(height/2 + 4, height/2 + 4, width + 6, 24),
      mats.wheel
    );
    front.rotation.x = Math.PI / 2;
    front.position.x = length / 2;
    g.add(front);
    // Rear sprocket
    const rear = front.clone();
    rear.position.x = -length / 2;
    g.add(rear);
    // Mid road wheels
    const wheelR = height / 2 - 2;
    const wheelCount = Math.max(3, Math.floor(length / 120));
    for (let i = 0; i < wheelCount; i++) {
      const t = (i + 0.5) / wheelCount;
      const w = new THREE.Mesh(
        new THREE.CylinderGeometry(wheelR, wheelR, width + 2, 16),
        mats.wheel
      );
      w.rotation.x = Math.PI / 2;
      w.position.x = -length/2 + t * length;
      w.position.y = -2;
      g.add(w);
    }
    return g;
  }

  // ── Chassis: low slab with track wells, sloped top ──
  function makeChassis({ length, width, height, mats }) {
    const g = new THREE.Group();
    // Main body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(length, height, width),
      mats.body
    );
    g.add(body);
    // Sloped top deck — extrude shape
    const topShape = new THREE.Shape();
    topShape.moveTo(-length/2, 0);
    topShape.lineTo(length/2, 0);
    topShape.lineTo(length/2 - 60, height * 0.6);
    topShape.lineTo(-length/2 + 80, height * 0.6);
    topShape.lineTo(-length/2, 0);
    const topGeom = new THREE.ExtrudeGeometry(topShape, {
      depth: width - 20,
      bevelEnabled: false,
    });
    const top = new THREE.Mesh(topGeom, mats.bodyAccent);
    top.position.z = -(width - 20) / 2;
    top.position.y = height / 2;
    g.add(top);
    // Front headlight panel (recessed)
    const fp = new THREE.Mesh(
      new THREE.BoxGeometry(8, height * 0.4, width * 0.5),
      mats.lens
    );
    fp.position.set(length / 2 - 2, 0, 0);
    g.add(fp);
    // Side accents (orange visibility stripe)
    [-1, 1].forEach(side => {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(length * 0.7, 4, 2),
        mats.accent
      );
      stripe.position.set(0, height * 0.15, side * (width / 2 + 1));
      g.add(stripe);
    });
    return g;
  }

  // ── PTZ camera mast ──
  function makePtzMast({ height, mats }) {
    const g = new THREE.Group();
    // Telescoping pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 10, height, 12),
      mats.arm
    );
    pole.position.y = height / 2;
    g.add(pole);
    // Camera head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(60, 40, 50),
      mats.body
    );
    head.position.y = height + 20;
    g.add(head);
    // Lens
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(12, 12, 20, 16),
      mats.lens
    );
    lens.rotation.z = Math.PI / 2;
    lens.position.set(35, height + 20, 0);
    g.add(lens);
    return g;
  }

  // ── Manipulator arm: 3-segment articulated arm ──
  function makeManipulatorArm({ segLengths, mats }) {
    // Returns { group, gripperAnchor }
    const g = new THREE.Group();
    const [s1, s2, s3] = segLengths;

    // Shoulder joint
    const shoulder = new THREE.Mesh(
      new THREE.CylinderGeometry(35, 35, 60, 20),
      mats.arm
    );
    shoulder.rotation.z = Math.PI / 2;
    g.add(shoulder);

    // Upper arm segment (s1)
    const upperGroup = new THREE.Group();
    const upper = new THREE.Mesh(
      new THREE.BoxGeometry(s1, 50, 50),
      mats.arm
    );
    upper.position.x = s1 / 2;
    upperGroup.add(upper);
    g.add(upperGroup);

    // Elbow + forearm (s2)
    const elbowGroup = new THREE.Group();
    elbowGroup.position.x = s1;
    const elbow = new THREE.Mesh(
      new THREE.CylinderGeometry(28, 28, 50, 20),
      mats.arm
    );
    elbow.rotation.z = Math.PI / 2;
    elbowGroup.add(elbow);
    const forearm = new THREE.Mesh(
      new THREE.BoxGeometry(s2, 40, 40),
      mats.arm
    );
    forearm.position.x = s2 / 2;
    elbowGroup.add(forearm);
    upperGroup.add(elbowGroup);

    // Wrist + tool segment (s3)
    const wristGroup = new THREE.Group();
    wristGroup.position.x = s2;
    const wrist = new THREE.Mesh(
      new THREE.CylinderGeometry(22, 22, 40, 16),
      mats.arm
    );
    wrist.rotation.z = Math.PI / 2;
    wristGroup.add(wrist);
    const tool = new THREE.Mesh(
      new THREE.BoxGeometry(s3, 32, 32),
      mats.arm
    );
    tool.position.x = s3 / 2;
    wristGroup.add(tool);
    elbowGroup.add(wristGroup);

    // Gripper — two opposing jaws
    const gripperGroup = new THREE.Group();
    gripperGroup.position.x = s3;
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(20, 80, 80),
      mats.gripper
    );
    gripperGroup.add(palm);
    [-1, 1].forEach(s => {
      const jaw = new THREE.Mesh(
        new THREE.BoxGeometry(60, 12, 50),
        mats.gripper
      );
      jaw.position.set(40, s * 30, 0);
      gripperGroup.add(jaw);
    });
    wristGroup.add(gripperGroup);

    // Gripper anchor — empty Object3D at the very end of the gripper
    // where payloads attach.
    const gripperAnchor = new THREE.Object3D();
    gripperAnchor.position.set(80, 0, 0); // Past the jaw tips
    gripperGroup.add(gripperAnchor);

    return { group: g, upperGroup, elbowGroup, wristGroup, gripperGroup, gripperAnchor };
  }

  // ── Build T7 (large, 710 lbs) ──
  function buildT7() {
    const mats = makeBotMaterials();
    const root = new THREE.Group();

    // Spec: 1201 × 701 × 1161 mm (L × W × H including arm/mast)
    // Chassis (without mast/arm) ~470mm tall
    const CHASSIS_L = 1100;
    const CHASSIS_W = 700;
    const CHASSIS_H = 280;
    const TRACK_L = 1100;
    const TRACK_H = 180;
    const TRACK_W = 140;

    // Tracks (left + right)
    [-1, 1].forEach(side => {
      const t = makeTrack({ length: TRACK_L, height: TRACK_H, width: TRACK_W, mats });
      t.position.set(0, -CHASSIS_H/2 - TRACK_H/2 + 30, side * (CHASSIS_W / 2 - TRACK_W / 2 + 10));
      root.add(t);
    });

    // Chassis
    const chassis = makeChassis({ length: CHASSIS_L, width: CHASSIS_W, height: CHASSIS_H, mats });
    root.add(chassis);

    // PTZ mast (rear)
    const mast = makePtzMast({ height: 600, mats });
    mast.position.set(-CHASSIS_L/2 + 80, CHASSIS_H/2, 0);
    root.add(mast);

    // Manipulator arm — pose: shoulder up, forearm forward + down, gripper out
    // Arm reach 2200mm. Segments: 800, 800, 400
    const arm = makeManipulatorArm({ segLengths: [800, 800, 400], mats });
    // Mount on top-front of chassis
    arm.group.position.set(CHASSIS_L/2 - 200, CHASSIS_H/2 + 60, 0);
    // Pose: upper arm up + forward, elbow bends down, wrist points forward
    arm.group.rotation.z = 0.3;              // shoulder lifted
    arm.upperGroup.rotation.z = 0.9;         // upper arm reaches up
    arm.elbowGroup.rotation.z = -1.7;        // elbow bent sharply down
    arm.wristGroup.rotation.z = -0.6;        // wrist droops down toward target
    root.add(arm.group);

    // Tag the "gripper world position" on root for callout anchors
    root.userData.gripperAnchor = arm.gripperAnchor;

    root.scale.setScalar(SCALE);

    return {
      group: root,
      gripperAnchor: arm.gripperAnchor,
      parts: { chassis, mast, arm },
      spec: {
        name: 'T7',
        weightKg: 322,
        weightLb: 710,
        reachMm: 2200,
        liftKg: 113,
        dimL: 1201, dimW: 701, dimH: 1161,
      },
    };
  }

  // ── Build T4 (compact, 154 lbs) ──
  function buildT4() {
    const mats = makeBotMaterials();
    const root = new THREE.Group();

    // Spec: 919 × 445 × 343 mm chassis (1189mm overall H with PTZ mast raised)
    const CHASSIS_L = 919;
    const CHASSIS_W = 445;
    const CHASSIS_H = 343;
    const TRACK_L = 919;
    const TRACK_H = 200;
    const TRACK_W = 90;

    // Tracks
    [-1, 1].forEach(side => {
      const t = makeTrack({ length: TRACK_L, height: TRACK_H, width: TRACK_W, mats });
      t.position.set(0, -CHASSIS_H/2 - TRACK_H/2 + 20, side * (CHASSIS_W / 2 - TRACK_W / 2 + 6));
      root.add(t);
    });

    // Chassis
    const chassis = makeChassis({ length: CHASSIS_L, width: CHASSIS_W, height: CHASSIS_H, mats });
    root.add(chassis);

    // PTZ mast (raised) — overall robot height 1189mm with PTZ up
    const mast = makePtzMast({ height: 850, mats });
    mast.position.set(-CHASSIS_L/2 + 60, CHASSIS_H/2, 0);
    root.add(mast);

    // Manipulator arm — reach 2000mm horizontal. Segments: 800 + 750 + 450
    const arm = makeManipulatorArm({ segLengths: [800, 750, 450], mats });
    arm.group.position.set(CHASSIS_L/2 - 150, CHASSIS_H/2 + 50, 0);
    arm.group.rotation.z = 0.3;
    arm.upperGroup.rotation.z = 0.9;
    arm.elbowGroup.rotation.z = -1.7;
    arm.wristGroup.rotation.z = -0.6;
    root.add(arm.group);

    root.userData.gripperAnchor = arm.gripperAnchor;
    root.scale.setScalar(SCALE);

    return {
      group: root,
      gripperAnchor: arm.gripperAnchor,
      parts: { chassis, mast, arm },
      spec: {
        name: 'T4',
        weightKg: 70,
        weightLb: 154,
        reachMm: 2000,
        liftKg: 55,
        dimL: 919, dimW: 445, dimH: 1189,
      },
    };
  }

  global.BotsModel = { buildT7, buildT4 };
})(window);
