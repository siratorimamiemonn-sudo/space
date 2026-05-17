window.inGame = true;
window.is_in_game = function() { return true; };
window.player_spawned = true;
// ==UserScript==
// @name         Simple Hack Client v2
// @namespace    Idk
// @version      2.5
// @description  Simple Client 2 with V1 Features Integrated
// @author       ToMo & Fuxny
// @match        https://bloxd.io/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  let Fuxny = {};
  let injectedBool = false;
  let myId = 1;
  const killSoftlyModule = {
    duration: 200
  };
  let derpIntervalId = null;
  const derpModule = {
    speed: 5,
    backwards: false
  };
  const derpState = {
    realHeading: 0,
    fakeHeading: 0,
    realPitch: 0,
    fakePitch: 0,
    spinIndex: 0,
    isHooked: false
  };
  let fakeLagIntervalId = null;
  const fakeLagModule = {
    duration: 200,
    interval: 500
  };
  const fastPlaceModule = {
    delay: 20
  };
  let magicBulletInterval = null;
  let _FireBullet = null;
  const magicBulletModule = {
    includeMobs: false
  };
  let autoToolInterval = null;
  let trapSelfInterval = null;
  let trapEnemyInterval = null;
  const trapSettings = {
    enemyThickness: 2,
    selfThickness: 2
  };
  let autoPotionInterval = null;
  let lastPotionTime = 0;
  const autoPotionModule = {
    healthThreshold: 25,
    pitch: 1.0,
    targetSlot: 8,
    autoThrow: true,
    cooldown: 800
  };
  var r = {
    keys(e) {
      var t = [],
        o = 0;
      for (var s in e) e != null && (t[o] = s, o++);
      return t
    },
    values(e) {
      for (var t = this.keys(e), o = [], s = 0, i = 0; s < t.length;) {
        var l = t[s],
          d = e[l];
        o[i] = d, i++, s++
      }
      return o
    },
    assign(e, ...t) {
      let o = Object(e);
      for (let s = 0; s < t.length; s++) {
        let i = t[s];
        if (i != null)
          for (let l in i) o[l] = i[l]
      }
      return o
    }
  };
  var S = {
    normalizeVector(t) {
      let e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2];
      if (e > 0) {
        let i = 1 / Math.sqrt(e);
        return [t[0] * i, t[1] * i, t[2] * i]
      }
      return t
    },
    distanceBetween(t, e) {
      let i = e[0] - t[0],
        o = e[1] - t[1],
        s = e[2] - t[2];
      return i * i + o * o + s * s
    },
    distanceBetweenSqrt(t, e) {
      return Math.sqrt(this.distanceBetween(t, e))
    },
  };
  var C = {
      wpRequire: null,
      _cachedNoa: null,
      get noa() {
        return this?._cachedNoa || (this._cachedNoa = r.values(this.bloxdProps).find(t => t?.entities)), this._cachedNoa
      },
      init() {
        let t = Object.getOwnPropertyDescriptors(window),
          e = Object.keys(t).find(s => t[s]?.set?.toString().includes("++")),
          i = window[e] = window[e],
          o = Math.floor(Math.random() * 9999999 + 1);
        i.push([
          [o], {},
          s => this.wpRequire = s
        ]), this.bloxdProps = r.values(this.findModule("nonBlocksClient:")).find(s => typeof s == "object")
      },
      findModule(t) {
        let e = this.wpRequire.m;
        for (let i in e) {
          let o = e[i];
          if (o && o.toString().includes(t)) return this.wpRequire(i)
        }
        return null
      }
    },
    l = C;
  var I = {
    getPosition(t) {
      return l.noa.entities.getState(t, "position").position
    },
    getMoveState(t) {
      return l.noa.entities.getState(t, "moveState")
    },
    getPhysicsBody(t) {
      return l.noa.entities.getState(t, "physics").body
    },
    get registry() {
      return r.values(l.noa)[17]
    },
    get getBlockSolidity() {
      return r.values(this.registry)[5]
    },
    get getBlockID() {
      return l.noa.bloxd[Object.getOwnPropertyNames(l.noa.bloxd.constructor.prototype)[3]].bind(l.noa.bloxd)
    },
    get getHeldItem() {
      return Object.values(l.noa.entities).find(candidate => {
        if (typeof candidate !== 'function') return false;
        if (candidate.length !== 1) return false;
        const fnString = candidate.toString();
        return fnString.includes(').') && fnString.toString().length < 30 && !fnString.includes(').op');
      });
    },
    safeGetHeldItem(t) {
      let e;
      try {
        e = this.getHeldItem(t)
      } catch {}
      return e
    },
    get playerList() {
      return r.values(l.noa.bloxd.getPlayerIds()).filter(t => t !== 1 && this.safeGetHeldItem(t)).map(t => parseInt(t))
    },
    get entityList() {
      return r.values(l.noa.bloxd.getEntityIds()).filter(t => t !== 1 && this.safeGetHeldItem(t)).map(t => parseInt(t))
    },
    get doAttack() {
      let t = this.safeGetHeldItem(1);
      return (t?.doAttack || t.breakingItem.doAttack).bind(t)
    },
    touchingWall() {
      let t = this.getPosition(1),
        e = .35,
        i = [
          [0, 0, 0],
          [e, 0, 0],
          [-e, 0, 0],
          [0, 0, e],
          [0, 0, -e],
          [e, 0, e],
          [e, 0, -e],
          [-e, 0, e],
          [-e, 0, -e]
        ],
        o = [0, 1, 2];
      for (let [s, c, d] of i)
        for (let u of o) {
          let m = Math.floor(t[0] + s),
            h = Math.floor(t[1] + c + u),
            E = Math.floor(t[2] + d),
            M = this.getBlockID(m, h, E);
          if (this.getBlockSolidity(M)) return !0
        }
      return !1
    }
  };
  var n = {
    noa: I
  };
  let playerKey = null,
    moveState = null,
    physState = null,
    playerEntity = null,
    skyboxMesh = null;
  let playerInventoryParent = null,
    lastClosestId = null,
    targetEntityDistance = null;
  let bhopIntervalId = null;
  let aimbotInterval = null;
  let killauraInterval = null;
  let targetFinderId = null;
  let autoSWIntervalId = null;
  let fightBotIntervalId = null;
  let killauraComboState = 1;
  let inventoryCleanerInterval = null;
  let originalEnchantingBounds = null;
  let playerCoordsIntervalId = null;
  let nametagsIntervalId = null;
  let minimapIntervalId = null;
  let minimapCanvas = null;
  let arrayListIntervalId = null;
  let healthTagsCanvas = null;
  let healthTagsCtx = null;
  let healthTagsObserver = null;
  let hitboxesCanvas = null;
  let hitboxesCtx = null;
  let hitboxesObserver = null;
  const hitboxesModule = {
    mode3d: false
  };
  const interpolatedPositions = new Map();
  const interpolatedCache = new Map();
  let lastIntpFrameTime = performance.now();
  let currentIntpDeltaTime = 0;
  function updateInterpolationTimer() {
    const now = performance.now();
    const dt = (now - lastIntpFrameTime) / 1000;
    if (dt > 0.0001) {
      currentIntpDeltaTime = Math.min(dt, 0.1);
      lastIntpFrameTime = now;
      interpolatedCache.clear();
    }
  }
  function lerpPos(current, target, factor) {
    return [
      current[0] + (target[0] - current[0]) * factor,
      current[1] + (target[1] - current[1]) * factor,
      current[2] + (target[2] - current[2]) * factor
    ];
  }
  function getInterpolatedPosition(id, rawPos) {
    if (interpolatedCache.has(id)) return interpolatedCache.get(id);
    const rx = Math.round(rawPos[0] * 1000) / 1000;
    const ry = Math.round(rawPos[1] * 1000) / 1000;
    const rz = Math.round(rawPos[2] * 1000) / 1000;
    if (!interpolatedPositions.has(id)) {
      const initial = [rx, ry, rz];
      interpolatedPositions.set(id, initial);
      return initial;
    }
    const currentPos = interpolatedPositions.get(id);
    const dx = rx - currentPos[0],
      dy = ry - currentPos[1],
      dz = rz - currentPos[2];
    if (dx * dx + dy * dy + dz * dz < 0.000001) {
      interpolatedCache.set(id, currentPos);
      return currentPos;
    }
    const k = 35;
    const f = 1 - Math.exp(-k * currentIntpDeltaTime);
    const nextPos = [currentPos[0] + dx * f, currentPos[1] + dy * f, currentPos[2] + dz * f];
    interpolatedPositions.set(id, nextPos);
    interpolatedCache.set(id, nextPos);
    return nextPos;
  }
  let fastPlaceIntervalId = null;
  let oreMinerIntervalId = null;
  let oreMinerTarget = {
    position: null,
    path: [],
    mode: 'IDLE',
    minedElement: null,
    lastStuckCheckPosition: null,
    stuckStartTime: 0
  };
  let chestESPEnabled = false;
  let oreESPEnabled = false;
  let chestOreInterval = null;
  let chunkDataField = null;
  let chestBoxes = {};
  const ORE_IDS = [44, 45, 465, 50];
  const scannedChunks = new Set();
  const fightBotModule = {
    radius: 7,
    desiredDistance: 4.7,
    isWPressed: false,
    isSPressed: false,
    isShiftPressed: false,
    didJumpLastTick: false,
    isStrafing: false,
    strafeDirection: '',
    strafeEndTime: 0,
    nextStrafeTime: 0
  };
  const autoKnockbackModule = {
    enabled: false,
    threshold: 4.5
  };
  const spikeSlot = 8,
    webSlot = 9;
  document.isRightMouseDown = false;
  document.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse") {
      if (e.button === 0) document.isPointerDown = true;
      if (e.button === 2) document.isRightMouseDown = true;
    } else {
      document.isPointerDown = true;
    }
  });
  document.addEventListener("pointerup", e => {
    if (e.pointerType === "mouse") {
      if (e.button === 0) document.isPointerDown = false;
      if (e.button === 2) document.isRightMouseDown = false;
    } else {
      document.isPointerDown = false;
    }
  });
  document.addEventListener("contextmenu", e => {
    if (fastPlaceIntervalId) {
      e.preventDefault();
    }
  });
  let pickupReachEnabled = false;
  let originalGetEntitiesInAABB = null;
  let ghMethodKey = null;
  let protoForPickupReach = null;
  const RANGE_MULTIPLIER = 5;
  let colyRoom = null;
  let sendBytesName = null;
  let blinkState = {
    enabled: false,
    originalSendBytes: null,
    queued: []
  };
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  function logDebug(message, color = '#888') {}
  function simulateKeyDown(key, code) {
    if (!document.body) return;
    document.body.dispatchEvent(new KeyboardEvent('keydown', {
      key: key,
      code: code,
      bubbles: true,
      cancelable: true
    }));
  }
  function simulateKeyUp(key, code) {
    if (!document.body) return;
    document.body.dispatchEvent(new KeyboardEvent('keyup', {
      key: key,
      code: code,
      bubbles: true,
      cancelable: true
    }));
  }
  function simulateKeyPress(keyChar, keyCode) {
    const props = {
      key: keyChar,
      code: `Digit${keyChar}`,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true
    };
    document.dispatchEvent(new KeyboardEvent('keydown', props));
    document.dispatchEvent(new KeyboardEvent('keyup', props));
  }
  function isValidTarget(entityId) {
    if (!entityId || entityId === 1 || entityId === "1") return false;
    try {
      const lifeState = Fuxny.entities?.getState(entityId, "genericLifeformState");
      if (!lifeState || !lifeState.isAlive) return false;
      return true;
    } catch (e) {
      return false;
    }
  }
  function getPlayerHealth() {
    return typeof Fuxny.noa?.playerdata?._health === "number" ?
      Fuxny.noa.playerdata._health :
      100;
  }
  function getFastTargetBlockID() {
    const entity = Fuxny.entities?.[Fuxny.impKey];
    if (!entity) return 0;
    for (const v of Object.values(entity)) {
      const blockItem = v?.list?.[0]?._blockItem;
      if (!blockItem) continue;
      try {
        const xr = Object.values(blockItem)[0];
        const ym = xr && Object.values(xr)[25];
        const id = ym && Object.values(ym)[0];
        if (id) return id;
      } catch (e) {}
    }
    return Fuxny.noa?.targetedBlock?.blockID || 0;
  }
  function fastPlaceTick() {
    if (document.isRightMouseDown) {
      try {
        let playerEntity = r.values(Fuxny.entities[Fuxny.impKey]).find(value => value?.list?.[0]?._blockItem).list[0];
        if (playerEntity && playerEntity._blockItem && typeof playerEntity._blockItem.placeBlock === 'function') {
          playerEntity._blockItem.placeBlock();
        }
      } catch (e) {
        stopFastPlace();
      }
    }
  }
  function startFastPlace() {
    if (fastPlaceIntervalId) return;
    fastPlaceIntervalId = setInterval(fastPlaceTick, fastPlaceModule.delay);
  }
  function stopFastPlace() {
    clearInterval(fastPlaceIntervalId);
    fastPlaceIntervalId = null;
  }
  function findClosestOreInChunks() {
    if (!injectedBool || !Fuxny?.world?.[Fuxny.impKey]?.hash || !n.noa) return null;
    const myPos = n.noa.getPosition(1);
    if (!myPos) return null;
    const chunkHash = Fuxny.world[Fuxny.impKey].hash;
    let closestOrePosition = null;
    let minDistanceSq = Infinity;
    for (const chunkKey in chunkHash) {
      const chunk = chunkHash[chunkKey];
      if (!chunkDataField) chunkDataField = autoDetectChunkDataField(chunk);
      if (!chunkDataField || !chunk[chunkDataField]?.data || !chunk.pos) continue;
      const blockData = chunk[chunkDataField];
      const {
        data,
        stride
      } = blockData;
      const chunkOriginPos = chunk.pos;
      for (let i = 0; i < data.length; i++) {
        const blockID = data[i];
        if (ORE_IDS.includes(blockID)) {
          const [localX, localY, localZ] = reverseIndex(i, stride);
          const worldPos = [chunkOriginPos[0] + localX, chunkOriginPos[1] + localY, chunkOriginPos[2] + localZ];
          const deltaY = worldPos[1] - myPos[1];
          const deltaX = worldPos[0] - myPos[0];
          const deltaZ = worldPos[2] - myPos[2];
          const horizontalDistance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
          if (horizontalDistance < 1) {
            if (deltaY > 5) continue;
          } else {
            const gradient = deltaY / horizontalDistance;
            if (gradient >= 0.7) continue;
          }
          const distanceSq = S.distanceBetween(myPos, worldPos);
          if (distanceSq < minDistanceSq) {
            minDistanceSq = distanceSq;
            closestOrePosition = [worldPos[0] + 0.5, worldPos[1] + 0.5, worldPos[2] + 0.5];
          }
        }
      }
    }
    return closestOrePosition;
  }
  function calculateLinearTunnelPath(startPos, endPos) {
    const path = new Map();
    let [x, y, z] = startPos.map(Math.floor);
    const [x2, y2, z2] = endPos.map(Math.floor);
    const addPoint = (px, py, pz) => {
      path.set(`${px},${py},${pz}`, [px, py, pz]);
    };
    addPoint(x, y, z);
    while (x !== x2 || y !== y2 || z !== z2) {
      const dx = Math.abs(x2 - x),
        dy = Math.abs(y2 - y),
        dz = Math.abs(z2 - z);
      if (dx >= dy && dx >= dz) x += Math.sign(x2 - x);
      else if (dy >= dx && dy >= dz) y += Math.sign(y2 - y);
      else z += Math.sign(z2 - z);
      addPoint(x, y, z);
    }
    return Array.from(path.values());
  }
  function oreMinerTick() {
    const myPos = n.noa.getPosition(1);
    if (!myPos) return;
    if (oreMinerTarget.mode === 'MOVING') {
      const currentIntegerPos = myPos.map(Math.floor);
      if (!oreMinerTarget.lastStuckCheckPosition || currentIntegerPos[0] !== oreMinerTarget.lastStuckCheckPosition[0] || currentIntegerPos[1] !== oreMinerTarget.lastStuckCheckPosition[1] || currentIntegerPos[2] !== oreMinerTarget.lastStuckCheckPosition[2]) {
        oreMinerTarget.lastStuckCheckPosition = currentIntegerPos;
        oreMinerTarget.stuckStartTime = Date.now();
      } else {
        const stuckDuration = Date.now() - oreMinerTarget.stuckStartTime;
        if (stuckDuration > 1500) {
          const headBlockPos = [currentIntegerPos[0], currentIntegerPos[1] + 2, currentIntegerPos[2]];
          const headBlockId = I.getBlockID(headBlockPos[0], headBlockPos[1], headBlockPos[2]);
          if (headBlockId !== 0) {
            oreMinerTarget.path.unshift(headBlockPos);
            oreMinerTarget.mode = 'IDLE';
            oreMinerTarget.stuckStartTime = 0;
            oreMinerTarget.lastStuckCheckPosition = null;
            simulateKeyUp('w', 'KeyW');
            if (oreMinerTarget.minedElement) {
              pressMouseUp();
              stopMouseHold();
            }
            return;
          }
        }
      }
    } else {
      oreMinerTarget.stuckStartTime = 0;
      oreMinerTarget.lastStuckCheckPosition = null;
    }
    if (oreMinerTarget.path.length === 0 || oreMinerTarget.mode === 'IDLE') {
      if (oreMinerTarget.mode === 'MINING') {
        pressMouseUp();
        stopMouseHold();
      }
      simulateKeyUp('w', 'KeyW');
      oreMinerTarget.mode = 'IDLE';
      while (oreMinerTarget.path.length > 0 && I.getBlockID(oreMinerTarget.path[0][0], oreMinerTarget.path[0][1], oreMinerTarget.path[0][2]) === 0) {
        oreMinerTarget.path.shift();
      }
      if (oreMinerTarget.path.length === 0) {
        const closestOre = findClosestOreInChunks();
        if (closestOre) {
          oreMinerTarget.position = closestOre;
          const deltaX = oreMinerTarget.position[0] - myPos[0],
            deltaZ = oreMinerTarget.position[2] - myPos[2];
          let forwardVector = [0, 0, 0];
          if (Math.abs(deltaX) > Math.abs(deltaZ)) forwardVector[0] = Math.sign(deltaX);
          else forwardVector[2] = Math.sign(deltaZ);
          const startPos = [myPos[0] + forwardVector[0], myPos[1], myPos[2] + forwardVector[2]];
          const linearPath = calculateLinearTunnelPath(startPos, oreMinerTarget.position);
          const tunnelPath = new Map();
          for (const pos of linearPath) {
            const key1 = pos.join(','),
              key2 = `${pos[0]},${pos[1] + 1},${pos[2]}`;
            if (!tunnelPath.has(key1)) tunnelPath.set(key1, pos);
            if (!tunnelPath.has(key2)) tunnelPath.set(key2, [pos[0], pos[1] + 1, pos[2]]);
          }
          oreMinerTarget.path = Array.from(tunnelPath.values()).filter(pos => {
            const blockId = I.getBlockID(pos[0], pos[1], pos[2]);
            const isPlayerPos = pos[0] === Math.floor(myPos[0]) && pos[1] === Math.floor(myPos[1]) && pos[2] === Math.floor(myPos[2]);
            const isPlayerHeadPos = pos[0] === Math.floor(myPos[0]) && pos[1] === Math.floor(myPos[1] + 1) && pos[2] === Math.floor(myPos[2]);
            return blockId !== 0 && !isPlayerPos && !isPlayerHeadPos;
          });
        } else {
          stopOreMiner();
          showTemporaryNotification("No ores found. Ore Miner disabled.", "#FF9800");
          const oreMinerToggle = document.getElementById('hack-ore-miner');
          if (oreMinerToggle) oreMinerToggle.checked = false;
          return;
        }
      }
    }
    let currentTargetPos = oreMinerTarget.path[0];
    if (!currentTargetPos) {
      oreMinerTarget.mode = 'IDLE';
      return;
    }
    if (I.getBlockID(currentTargetPos[0], currentTargetPos[1], currentTargetPos[2]) === 0) {
      oreMinerTarget.mode = 'IDLE';
      return;
    }
    const cam = Fuxny.camera;
    if (!cam) return;
    const targetCenter = [currentTargetPos[0] + 0.5, currentTargetPos[1] + 0.5, currentTargetPos[2] + 0.5];
    const myEyePos = [myPos[0], myPos[1] + 1.6, myPos[2]];
    const dist = S.distanceBetweenSqrt(myEyePos, targetCenter);
    const dx = targetCenter[0] - myEyePos[0],
      dy = targetCenter[1] - myEyePos[1],
      dz = targetCenter[2] - myEyePos[2];
    const targetHeading = Math.atan2(dx, dz);
    const targetPitch = -Math.asin(dy / dist);
    const angleDiff = (a, b) => {
      let d = a - b;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      return d;
    };
    const headingDiff = angleDiff(targetHeading, cam.heading),
      pitchDiff = angleDiff(targetPitch, cam.pitch);
    cam.heading += headingDiff * 0.4;
    cam.pitch += pitchDiff * 0.4;
    if (dist <= 2.2) {
      if (oreMinerTarget.mode !== 'MINING') {
        simulateKeyUp('w', 'KeyW');
        oreMinerTarget.minedElement = oreMiner_pressMouseDown();
        oreMinerTarget.mode = 'MINING';
      }
    } else {
      if (oreMinerTarget.mode !== 'MOVING') {
        if (oreMinerTarget.mode === 'MINING') {
          oreMiner_pressMouseUp(oreMinerTarget.minedElement);
        }
        simulateKeyDown('w', 'KeyW');
        oreMinerTarget.mode = 'MOVING';
      }
    }
  }
  function stopOreMiner() {
    if (!oreMinerIntervalId) return;
    clearInterval(oreMinerIntervalId);
    oreMinerIntervalId = null;
    if (oreMinerTarget.mode === 'MINING') {
      oreMiner_pressMouseUp(oreMinerTarget.minedElement);
    }
    simulateKeyUp('w', 'KeyW');
    oreMinerTarget.position = null;
    oreMinerTarget.path = [];
    oreMinerTarget.mode = 'IDLE';
    oreMinerTarget.minedElement = null;
  }
  function startOreMiner() {
    if (oreMinerIntervalId) return;
    oreMinerIntervalId = setInterval(oreMinerTick, 50);
  }
  function oreMiner_getTargetElement() {
    try {
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      return document.elementFromPoint(x, y);
    } catch (e) {
      return null;
    }
  }
  function oreMiner_pressMouseDown() {
    const targetElement = oreMiner_getTargetElement();
    if (!targetElement) return null;
    const x = window.innerWidth / 2,
      y = window.innerHeight / 2;
    const opts = {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: y,
      pointerType: 'mouse',
      isPrimary: true
    };
    try {
      targetElement.dispatchEvent(new PointerEvent('pointerdown', opts));
    } catch (e) {}
    try {
      targetElement.dispatchEvent(new MouseEvent('mousedown', opts));
    } catch (e) {}
    return targetElement;
  }
  function oreMiner_pressMouseUp(targetElement) {
    const elementToRelease = targetElement || oreMiner_getTargetElement();
    if (!elementToRelease) return;
    const x = window.innerWidth / 2,
      y = window.innerHeight / 2;
    const opts = {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: 0,
      clientX: x,
      clientY: y,
      pointerType: 'mouse',
      isPrimary: true
    };
    try {
      elementToRelease.dispatchEvent(new PointerEvent('pointerup', opts));
    } catch (e) {}
    try {
      elementToRelease.dispatchEvent(new MouseEvent('mouseup', opts));
    } catch (e) {}
    try {
      elementToRelease.dispatchEvent(new MouseEvent('click', opts));
    } catch (e) {}
  }
  const MINIMAP_SIZE = 180,
    MINIMAP_RANGE = 32,
    MINIMAP_UPDATE_INTERVAL = 100;
  const blockNameCache = new Map();
  let minimapWorker = null,
    lastSurfaceData = [],
    isWorkerBusy = false;
  const averageColor = {
    Unloaded: [244, 0, 255],
    Dirt: [142, 100, 78],
    "Messy Dirt": [133, 91, 70],
    "Grass Block": [111, 174, 83],
    Sand: [217, 201, 158],
    Clay: [161, 171, 181],
    Gravel: [106, 107, 109],
    Snow: [230, 235, 235],
    "Maple Log": [124, 90, 55],
    "Pine Log": [62, 40, 22],
    "Plum Log": [87, 79, 71],
    "Cedar Log": [53, 40, 22],
    "Aspen Log": [233, 230, 200],
    "Jungle Log": [93, 73, 23],
    "Maple Wood Planks": [175, 143, 85],
    "Aspen Wood Planks": [199, 180, 128],
    "Plum Wood Planks": [174, 97, 49],
    "Jungle Wood Planks": [165, 124, 86],
    "Pine Wood Planks": [122, 91, 52],
    "Cedar Wood Planks": [81, 52, 25],
    "Barkless Maple Log": [156, 120, 74],
    "Barkless Aspen Log": [174, 150, 107],
    "Barkless Plum Log": [146, 74, 37],
    "Barkless Jungle Log": [146, 97, 68],
    "Barkless Pine Log": [103, 72, 42],
    "Barkless Cedar Log": [61, 37, 18],
    free_placeholder2: [146, 142, 142],
    Stone: [146, 142, 142],
    "Messy Stone": [146, 142, 142],
    free_placeholder: [146, 142, 142],
    "Smooth Stone": [163, 161, 161],
    Diorite: [202, 197, 192],
    "Smooth Diorite": [246, 245, 240],
    Andesite: [128, 132, 137],
    "Smooth Andesite": [162, 164, 166],
    Granite: [159, 107, 88],
    "Smooth Granite": [189, 135, 108],
    Sandstone: [230, 222, 177],
    Yellowstone: [221, 215, 149],
    "Coal Ore": [146, 142, 142],
    "Iron Ore": [146, 142, 142],
    "Gold Ore": [146, 142, 142],
    "Lapis Lazuli Ore": [146, 142, 142],
    "Emerald Ore": [146, 142, 142],
    "Diamond Ore": [146, 142, 142],
    "Block of Coal": [19, 19, 19],
    "Block of Iron": [214, 209, 202],
    "Block of Gold": [243, 170, 36],
    "Block of Lapis Lazuli": [34, 91, 174],
    "Block of Emerald": [11, 197, 85],
    "White Wool": [250, 250, 250],
    "Orange Wool": [252, 133, 33],
    "Magenta Wool": [203, 74, 189],
    "Light Blue Wool": [59, 194, 230],
    "Yellow Wool": [255, 211, 64],
    "Lime Wool": [134, 202, 29],
    "Pink Wool": [254, 155, 188],
    "Gray Wool": [73, 79, 83],
    "Light Gray Wool": [154, 154, 149],
    "Cyan Wool": [25, 153, 154],
    "Purple Wool": [136, 45, 183],
    "Blue Wool": [58, 68, 166],
    "Brown Wool": [125, 81, 44],
    "Green Wool": [95, 119, 32],
    "Red Wool": [176, 44, 37],
    "Black Wool": [29, 31, 36],
    "Baked Clay": [150, 93, 67],
    "White Baked Clay": [210, 177, 161],
    "Orange Baked Clay": [162, 83, 38],
    "Magenta Baked Clay": [149, 87, 108],
    "Light Blue Baked Clay": [112, 108, 138],
    "Yellow Baked Clay": [186, 133, 36],
    "Lime Baked Clay": [103, 117, 53],
    "Pink Baked Clay": [162, 78, 79],
    "Gray Baked Clay": [58, 42, 36],
    "Light Gray Baked Clay": [135, 107, 98],
    "Cyan Baked Clay": [85, 90, 90],
    "Purple Baked Clay": [118, 70, 86],
    "Blue Baked Clay": [73, 59, 91],
    "Brown Baked Clay": [77, 50, 35],
    "Green Baked Clay": [75, 82, 40],
    "Red Baked Clay": [142, 61, 47],
    "Black Baked Clay": [36, 21, 15],
    "Gray Concrete": [55, 58, 62],
    "Light Gray Concrete": [125, 125, 115],
    "Black Concrete": [9, 11, 16],
    "Blue Concrete": [45, 47, 144],
    "Brown Concrete": [97, 60, 32],
    "Cyan Concrete": [21, 119, 135],
    "Light Blue Concrete": [37, 138, 200],
    "Lime Concrete": [95, 170, 25],
    "Magenta Concrete": [169, 48, 159],
    "Orange Concrete": [225, 97, 0],
    "Pink Concrete": [214, 101, 143],
    "Purple Concrete": [101, 32, 157],
    "Red Concrete": [143, 33, 33],
    "White Concrete": [208, 214, 215],
    "Green Concrete": [73, 91, 36],
    "Yellow Concrete": [242, 176, 21],
    "Pine Leaves": [22, 41, 12],
    "Aspen Leaves": [50, 128, 22],
    "Maple Leaves": [56, 105, 31],
    "Jungle Leaves": [45, 151, 13],
    Pumpkin_placeholder: [196, 104, 19],
    Watermelon: [93, 141, 32],
    Glass: [198, 230, 229],
    "Black Glass": [23, 26, 32],
    "Blue Glass": [101, 134, 207],
    "Brown Glass": [154, 118, 91],
    "Cyan Glass": [31, 145, 164],
    "Gray Glass": [86, 90, 93],
    "Light Gray Glass": [179, 183, 187],
    "Green Glass": [105, 125, 62],
    "Light Blue Glass": [135, 187, 242],
    "Lime Glass": [188, 226, 152],
    "Magenta Glass": [193, 73, 183],
    "Orange Glass": [242, 151, 82],
    "Pink Glass": [242, 157, 188],
    "Purple Glass": [126, 63, 177],
    "Red Glass": [182, 56, 56],
    "White Glass": [245, 246, 246],
    "Yellow Glass": [248, 214, 135],
    "UNUSED BLOCK TYPE": [153, 153, 153],
    "Dim Lamp On": [56, 28, 7],
    "Dim Lamp Off": [56, 28, 7],
    Bricks: [143, 80, 63],
    "Stone Bricks": [146, 142, 142],
    "Dark Red Brick": [78, 40, 47],
    "Dark Red Stone": [117, 56, 51],
    "Block of Quartz": [251, 248, 239],
    "Chiseled Block of Quartz": [237, 229, 217],
    "Engraved Stone": [113, 109, 109],
    "Mossy Stone Bricks": [146, 142, 142],
    "Cracked Stone Bricks": [146, 142, 142],
    "Smooth Sandstone": [230, 222, 177],
    "Engraved Sandstone": [230, 222, 177],
    Ice: [134, 207, 254],
    Obsidian: [19, 12, 32],
    "Hay Bale": [169, 132, 25],
    Sponge: [166, 150, 46],
    Beacon: [255, 255, 255],
    "Golden Decoration": [150, 101, 53],
    "Moonstone Explosive": [152, 173, 217],
    Bedrock: [21, 21, 22],
    "Smooth Double Stone Slab": [163, 161, 161],
    Cactus: [81, 146, 43],
    Grass: [126, 177, 75],
    Dandelion: [255, 236, 79],
    Poppy: [237, 48, 44],
    "Red Tulip": [237, 48, 44],
    "Pink Tulip": [235, 197, 253],
    "White Tulip": [247, 247, 247],
    "Orange Tulip": [241, 157, 37],
    Daisy: [247, 247, 247],
    Bluebell: [42, 191, 253],
    "Forget-me-not": [72, 115, 238],
    Allium: [160, 107, 215],
    "Azure Bluet": [252, 252, 252],
    "Lily of the Valley": [215, 22, 22],
    "Shadow Rose": [42, 33, 29],
    Furnace: [79, 75, 75],
    Workbench: [100, 63, 45],
    "Block of Diamond": [37, 171, 193],
    "Maple Door": [175, 143, 85],
    "_Maple Door Top": [175, 143, 85],
    "Maple Trapdoor": [132, 97, 61],
    "Aspen Sapling": [124, 165, 61],
    "Maple Sapling": [113, 80, 47],
    "Jungle Sapling": [57, 58, 14],
    "Plum Sapling": [126, 152, 33],
    "Pine Sapling": [61, 94, 61],
    "Cedar Sapling": [55, 143, 47],
    "Maple Log|TreeBase|Maple": [124, 90, 55],
    Chest: [183, 125, 45],
    "Pine Leaves|TreeCanopy": [22, 41, 12],
    "Aspen Leaves|TreeCanopy": [50, 128, 22],
    "Maple Leaves|TreeCanopy": [56, 105, 31],
    "Jungle Leaves|TreeCanopy": [45, 151, 13],
    Protector: [146, 142, 142],
    "Fat Cactus": [81, 146, 43],
    "Dry Fat Cactus": [124, 78, 31],
    "Maple Ladder": [156, 120, 74],
    Vines: [78, 114, 46],
    "Dirt|GrassRoots": [142, 100, 78],
    "Iron Ladder": [173, 180, 182],
    "White Planks": [250, 242, 227],
    "Orange Planks": [209, 125, 65],
    "Magenta Planks": [156, 78, 126],
    "Light Blue Planks": [85, 156, 173],
    "Yellow Planks": [219, 182, 81],
    "Lime Planks": [154, 173, 85],
    "Pink Planks": [196, 122, 149],
    "Gray Planks": [82, 78, 72],
    "Light Gray Planks": [153, 147, 138],
    "Cyan Planks": [103, 171, 171],
    "Purple Planks": [149, 113, 171],
    "Blue Planks": [85, 94, 173],
    "Brown Planks": [130, 94, 65],
    "Green Planks": [103, 117, 59],
    "Red Planks": [171, 72, 68],
    "Black Planks": [41, 38, 33],
    "Artisan Bench": [100, 63, 45],
    "White Ceramic": [254, 220, 86],
    "Wheat Seeds": [9, 164, 18],
    Wheat_stage1: [2, 134, 20],
    Wheat_stage2: [2, 134, 20],
    Wheat_stage3: [2, 134, 20],
    Wheat_stage4: [2, 134, 20],
    Wheat_stage5: [2, 134, 20],
    Wheat: [220, 187, 101],
    "Wheat|FreshlyGrown": [220, 187, 101],
    "Dandelion|Roots": [255, 236, 79],
    "Poppy|Roots": [237, 48, 44],
    "Red Tulip|Roots": [237, 48, 44],
    "Pink Tulip|Roots": [235, 197, 253],
    "White Tulip|Roots": [247, 247, 247],
    "Orange Tulip|Roots": [241, 157, 37],
    "Daisy|Roots": [247, 247, 247],
    "Bluebell|Roots": [42, 191, 253],
    "Forget-me-not|Roots": [72, 115, 238],
    "Allium|Roots": [160, 107, 215],
    "Azure Bluet|Roots": [252, 252, 252],
    "Lily of the Valley|Roots": [215, 22, 22],
    "Shadow Rose|Roots": [42, 33, 29],
    "White Bed": [205, 199, 199],
    "_White Bed Head": [205, 199, 199],
    "Orange Bed": [205, 199, 199],
    "_Orange Bed Head": [205, 199, 199],
    "Magenta Bed": [205, 199, 199],
    "_Magenta Bed Head": [205, 199, 199],
    "Light Blue Bed": [205, 199, 199],
    "_Light Blue Bed Head": [205, 199, 199],
    "Yellow Bed": [205, 199, 199],
    "_Yellow Bed Head": [205, 199, 199],
    "Lime Bed": [205, 199, 199],
    "_Lime Bed Head": [205, 199, 199],
    "Pink Bed": [205, 199, 199],
    "_Pink Bed Head": [205, 199, 199],
    "Gray Bed": [205, 199, 199],
    "_Gray Bed Head": [205, 199, 199],
    "Light Gray Bed": [205, 199, 199],
    "_Light Gray Bed Head": [205, 199, 199],
    "Cyan Bed": [205, 199, 199],
    "_Cyan Bed Head": [205, 199, 199],
    "Purple Bed": [205, 199, 199],
    "_Purple Bed Head": [205, 199, 199],
    "Blue Bed": [205, 199, 199],
    "_Blue Bed Head": [205, 199, 199],
    "Brown Bed": [205, 199, 199],
    "_Brown Bed Head": [205, 199, 199],
    "Green Bed": [205, 199, 199],
    "_Green Bed Head": [205, 199, 199],
    "Red Bed": [205, 199, 199],
    "_Red Bed Head": [205, 199, 199],
    "Black Bed": [205, 199, 199],
    "_Black Bed Head": [205, 199, 199],
    "Pine Log|TreeBase|Pine": [62, 40, 22],
    "Plum Log|TreeBase|Plum": [87, 79, 71],
    "Cedar Log|TreeBase|Cedar": [53, 40, 22],
    "Aspen Log|TreeBase|Aspen": [233, 230, 200],
    "Jungle Log|TreeBase|Jungle": [93, 73, 23],
    "Palm Sapling": [38, 128, 11],
    "Pine Door": [122, 91, 52],
    "_Pine Door Top": [122, 91, 52],
    "Plum Door": [174, 97, 49],
    "_Plum Door Top": [174, 97, 49],
    "Cedar Door": [81, 52, 25],
    "_Cedar Door Top": [81, 52, 25],
    "Aspen Door": [199, 180, 128],
    "_Aspen Door Top": [199, 180, 128],
    "Jungle Door": [165, 124, 86],
    "_Jungle Door Top": [165, 124, 86],
    "Palm Door": [214, 153, 73],
    "_Palm Door Top": [214, 153, 73],
    "Pine Trapdoor": [97, 67, 39],
    "Plum Trapdoor": [174, 97, 49],
    "Cedar Trapdoor": [61, 37, 18],
    "Aspen Trapdoor": [199, 180, 128],
    "Jungle Trapdoor": [124, 78, 58],
    "Palm Trapdoor": [182, 129, 62],
    "Smooth Sandstone Slab": [230, 222, 177],
    "Cactus|Growing": [81, 146, 43],
    "Fat Cactus|Growing": [81, 146, 43],
    "Pear Door": [141, 110, 99],
    "_Pear Door Top": [141, 110, 99],
    "Pear Trapdoor": [141, 110, 99],
    "Pear Sapling": [242, 248, 234],
    Board: [175, 143, 85],
    Net: [149, 83, 50],
    Cobweb: [219, 214, 194],
    "Watermelon Seeds": [72, 99, 4],
    "Watermelon Seeds|Growing": [72, 99, 4],
    "Attached Watermelon Stem": [72, 99, 4],
    "Pumpkin Seeds": [72, 99, 4],
    "Pumpkin Seeds|Growing": [72, 99, 4],
    "Attached Pumpkin Stem": [72, 99, 4],
    "Jack o'Lantern": [196, 104, 19],
    "Melon Seeds": [72, 99, 4],
    "Melon Seeds|Growing": [72, 99, 4],
    "Attached Melon Stem": [72, 99, 4],
    "Potion Table": [1, 1, 1],
    "Pine Ladder": [97, 67, 39],
    "Plum Ladder": [149, 75, 38],
    "Cedar Ladder": [81, 52, 25],
    "Aspen Ladder": [174, 150, 107],
    "Jungle Ladder": [165, 124, 86],
    "Palm Ladder": [196, 139, 66],
    "Pear Ladder": [141, 110, 99],
    "Black Carpet": [29, 31, 36],
    "Blue Carpet": [58, 68, 166],
    "Brown Carpet": [125, 81, 44],
    "Cyan Carpet": [25, 153, 154],
    "Gray Carpet": [73, 79, 83],
    "Light Gray Carpet": [154, 154, 149],
    "Green Carpet": [95, 119, 32],
    "Light Blue Carpet": [59, 194, 230],
    "Lime Carpet": [134, 202, 29],
    "Magenta Carpet": [203, 74, 189],
    "Orange Carpet": [252, 133, 33],
    "Pink Carpet": [254, 155, 188],
    "Purple Carpet": [136, 45, 183],
    "Red Carpet": [176, 44, 37],
    "White Carpet": [250, 250, 250],
    "Yellow Carpet": [255, 211, 64],
    Rice: [94, 176, 99],
    Rice_stage1: [82, 153, 87],
    Rice_stage2: [82, 153, 87],
    Rice_stage3: [82, 153, 87],
    Rice_stage4: [209, 207, 118],
    Rice_stage5: [209, 207, 118],
    "Rice|FreshlyGrown": [209, 207, 118],
    Cranberries: [30, 77, 51],
    Cranberries_stage1: [40, 98, 64],
    Cranberries_stage2: [40, 98, 64],
    "Red Mushroom": [226, 61, 48],
    "Brown Mushroom": [193, 151, 119],
    "Cotton Seeds": [40, 133, 34],
    Cotton_stage1: [40, 133, 34],
    Cotton_stage2: [42, 110, 30],
    Cotton_stage3: [236, 237, 240],
    "Tall Grass": [126, 177, 75],
    "Tall Grass|Top": [109, 160, 58],
    "Barkless Maple Log|TreeBase|Maple": [156, 120, 74],
    "Barkless Plum Log|TreeBase|Plum": [146, 74, 37],
    "Barkless Cedar Log|TreeBase|Cedar": [61, 37, 18],
    "Barkless Aspen Log|TreeBase|Aspen": [174, 150, 107],
    "Barkless Jungle Log|TreeBase|Jungle": [146, 97, 68],
    "Barkless Pine Log|TreeBase|Pine": [103, 72, 42],
    "Yellow Concrete Slab": [242, 176, 21],
    "White Concrete Slab": [208, 214, 215],
    "Red Concrete Slab": [143, 33, 33],
    "Purple Concrete Slab": [101, 32, 157],
    "Pink Concrete Slab": [214, 101, 143],
    "Orange Concrete Slab": [225, 97, 0],
    "Magenta Concrete Slab": [169, 48, 159],
    "Lime Concrete Slab": [95, 170, 25],
    "Light Gray Concrete Slab": [125, 125, 115],
    "Light Blue Concrete Slab": [37, 138, 200],
    "Green Concrete Slab": [73, 91, 36],
    "Gray Concrete Slab": [55, 58, 62],
    "Cyan Concrete Slab": [21, 119, 135],
    "Brown Concrete Slab": [97, 60, 32],
    "Blue Concrete Slab": [45, 47, 144],
    "Black Concrete Slab": [9, 11, 16],
    "Cherry Door": [233, 192, 187],
    "_Cherry Door Top": [233, 192, 187],
    "Cherry Trapdoor": [218, 170, 170],
    "Cherry Sapling": [249, 194, 225],
    "Cherry Ladder": [211, 159, 159],
    "Wood Spikes": [0, 0, 0],
    "Stone Spikes": [0, 0, 0],
    "Iron Spikes": [0, 0, 0],
    "Gold Spikes": [0, 0, 0],
    "Diamond Spikes": [0, 0, 0],
    "Kill Spikes": [0, 0, 0],
    "Corn Seeds": [59, 101, 0],
    "Corn Seeds_stage1": [36, 84, 0],
    "Corn Seeds|FreshlyGrown": [36, 84, 0],
    "Corn Seeds|Growing": [36, 84, 0],
    "Corn Plant_stage1": [59, 101, 0],
    "Corn Plant_stage2": [36, 84, 0],
    "Corn Plant_stage3": [36, 84, 0],
    "Corn Plant_stage4": [36, 84, 0],
    "Corn Plant_stage5": [36, 84, 0],
    "Corn Plant": [36, 84, 0],
    "Corn Plant|FreshlyGrown": [36, 84, 0],
    "Loot Chest": [183, 125, 45],
    "Melting Ice": [134, 207, 254],
    "White Strongbed": [173, 180, 182],
    "_White Strongbed Head": [173, 180, 182],
    "Orange Strongbed": [173, 180, 182],
    "_Orange Strongbed Head": [173, 180, 182],
    "Magenta Strongbed": [173, 180, 182],
    "_Magenta Strongbed Head": [173, 180, 182],
    "Light Blue Strongbed": [173, 180, 182],
    "_Light Blue Strongbed Head": [173, 180, 182],
    "Yellow Strongbed": [173, 180, 182],
    "_Yellow Strongbed Head": [173, 180, 182],
    "Lime Strongbed": [173, 180, 182],
    "_Lime Strongbed Head": [173, 180, 182],
    "Pink Strongbed": [173, 180, 182],
    "_Pink Strongbed Head": [173, 180, 182],
    "Gray Strongbed": [173, 180, 182],
    "_Gray Strongbed Head": [173, 180, 182],
    "Light Gray Strongbed": [173, 180, 182],
    "_Light Gray Strongbed Head": [173, 180, 182],
    "Cyan Strongbed": [173, 180, 182],
    "_Cyan Strongbed Head": [173, 180, 182],
    "Purple Strongbed": [173, 180, 182],
    "_Purple Strongbed Head": [173, 180, 182],
    "Blue Strongbed": [173, 180, 182],
    "_Blue Strongbed Head": [173, 180, 182],
    "Brown Strongbed": [173, 180, 182],
    "_Brown Strongbed Head": [173, 180, 182],
    "Green Strongbed": [173, 180, 182],
    "_Green Strongbed Head": [173, 180, 182],
    "Red Strongbed": [173, 180, 182],
    "_Red Strongbed Head": [173, 180, 182],
    "Black Strongbed": [173, 180, 182],
    "_Black Strongbed Head": [173, 180, 182],
    "Timed Spike Bomb Block": [0, 0, 0],
    "Timed Spike Bomb Block|Flashing": [0, 0, 0],
    "Fat Brown Mushroom": [167, 124, 97],
    "Fat Red Mushroom": [237, 232, 202],
    "Chili Pepper Seeds": [0, 0, 0],
    "Chili Pepper Seeds|Lava": [0, 0, 0],
    "Spectral Grass": [30, 175, 136],
    "Spectral Door": [54, 157, 145],
    "_Spectral Door Top": [54, 157, 145],
    "Spectral Trapdoor": [31, 105, 107],
    "Spectral Sapling": [22, 136, 139],
    "Spectral Ladder": [31, 105, 107],
    "Wood Enchanting Table": [1, 1, 1],
    "Stone Enchanting Table": [1, 1, 1],
    "Iron Enchanting Table": [1, 1, 1],
    "Gold Enchanting Table": [1, 1, 1],
    "Diamond Enchanting Table": [1, 1, 1],
    "Pine Grass": [93, 161, 125],
    "Pine Fern": [71, 147, 107],
    "Fallen Pine Cone": [176, 127, 73],
    "Bone Antlers": [247, 239, 225],
    "Gold Antlers": [236, 224, 87],
    "Salvaging Table": [0, 0, 0],
    "Leaf Bed": [56, 105, 31],
    "_Leaf Bed Head": [56, 105, 31],
    "Jungle Tall Grass": [45, 151, 13],
    "Jungle Tall Grass|Top": [45, 151, 13],
    Catnip: [45, 151, 13],
    "Mango Door": [197, 183, 95],
    "_Mango Door Top": [197, 183, 95],
    "Mango Trapdoor": [163, 147, 53],
    "Mango Sapling": [69, 134, 78],
    "Mango Ladder": [197, 183, 95],
    "Banana Seeds": [137, 175, 37],
    "Banana Seeds|Growing": [137, 175, 37],
    "Attached Banana Stem": [160, 201, 53],
    "Dangling Rope": [197, 162, 115],
    "Dangling Vine": [82, 106, 28],
    "Tomato Plant": [88, 113, 44],
    "Tomato Plant_stage1": [88, 112, 44],
    "Tomato Plant|FreshlyGrown": [88, 113, 44],
    "Tomato Plant|Top|FreshlyGrown": [107, 132, 45],
    "Carrot Plant": [107, 132, 45],
    "Carrot Plant_stage1": [107, 132, 45],
    "Carrot Plant|FreshlyGrown": [107, 132, 45],
    "Potato Plant": [88, 113, 44],
    "Potato Plant_stage1": [88, 112, 44],
    "Potato Plant|FreshlyGrown": [88, 113, 44],
    "Strawberry Bush": [120, 158, 36],
    "Strawberry Bush_stage1": [120, 158, 36],
    "Strawberry Bush_stage2": [120, 158, 36],
    "Sugar Cane Plant": [180, 170, 51],
    "Sugar Cane Plant_stage1": [180, 170, 51],
    "Sugar Cane Plant|FreshlyGrown": [150, 154, 38],
    "Sugar Cane Plant|Top|FreshlyGrown": [180, 170, 51],
    "Lettuce Plant": [120, 158, 36],
    "Lettuce Plant_stage1": [120, 158, 36],
    "Lettuce Plant|FreshlyGrown": [120, 158, 36],
    "Coffee Plant": [124, 131, 30],
    "Coffee Plant_stage1": [124, 131, 30],
    "Coffee Plant|FreshlyGrown": [97, 115, 8],
    "Cauliflower Plant": [154, 180, 81],
    "Cauliflower Plant_stage1": [188, 201, 125],
    "Cauliflower Plant|FreshlyGrown": [255, 243, 214],
    "Parsnip Plant": [88, 113, 44],
    "Parsnip Plant_stage1": [88, 113, 44],
    "Parsnip Plant|FreshlyGrown": [88, 113, 44],
    "Blueberry Bush": [107, 132, 45],
    "Blueberry Bush_stage1": [107, 132, 45],
    "Blueberry Bush_stage2": [107, 132, 45],
    "Red Cabbage Plant": [133, 144, 74],
    "Red Cabbage Plant_stage1": [145, 129, 111],
    "Red Cabbage Plant|FreshlyGrown": [169, 100, 186],
    "Beetroot Plant": [107, 132, 45],
    "Beetroot Plant_stage1": [107, 132, 45],
    "Beetroot Plant|FreshlyGrown": [107, 132, 45],
    "Autumn Fern": [227, 205, 82],
    "Carrot Seeds": [107, 132, 45],
    "Potato Seeds": [88, 113, 44],
    "Beetroot Seeds": [107, 132, 45],
    "White Banner": [124, 75, 71],
    "_White Banner Flag": [124, 75, 71],
    "Orange Banner": [124, 75, 71],
    "_Orange Banner Flag": [124, 75, 71],
    "Magenta Banner": [124, 75, 71],
    "_Magenta Banner Flag": [124, 75, 71],
    "Light Blue Banner": [124, 75, 71],
    "_Light Blue Banner Flag": [124, 75, 71],
    "Yellow Banner": [124, 75, 71],
    "_Yellow Banner Flag": [124, 75, 71],
    "Lime Banner": [124, 75, 71],
    "_Lime Banner Flag": [124, 75, 71],
    "Pink Banner": [124, 75, 71],
    "_Pink Banner Flag": [124, 75, 71],
    "Gray Banner": [124, 75, 71],
    "_Gray Banner Flag": [124, 75, 71],
    "Light Gray Banner": [124, 75, 71],
    "_Light Gray Banner Flag": [124, 75, 71],
    "Cyan Banner": [124, 75, 71],
    "_Cyan Banner Flag": [124, 75, 71],
    "Purple Banner": [124, 75, 71],
    "_Purple Banner Flag": [124, 75, 71],
    "Blue Banner": [124, 75, 71],
    "_Blue Banner Flag": [124, 75, 71],
    "Brown Banner": [124, 75, 71],
    "_Brown Banner Flag": [124, 75, 71],
    "Green Banner": [124, 75, 71],
    "_Green Banner Flag": [124, 75, 71],
    "Red Banner": [124, 75, 71],
    "_Red Banner Flag": [124, 75, 71],
    "Black Banner": [124, 75, 71],
    "_Black Banner Flag": [124, 75, 71],
    "Draugr Banner": [124, 75, 71],
    "_Draugr Banner Flag": [124, 75, 71],
    "Orange Ceramic": [22, 163, 163],
    "Magenta Ceramic": [199, 78, 189],
    "Light Blue Ceramic": [41, 44, 133],
    "Yellow Ceramic": [255, 236, 157],
    "Lime Ceramic": [94, 169, 24],
    "Pink Ceramic": [184, 183, 173],
    "Gray Ceramic": [54, 57, 61],
    "Light Gray Ceramic": [96, 114, 119],
    "Cyan Ceramic": [21, 119, 136],
    "Purple Ceramic": [162, 84, 224],
    "Blue Ceramic": [35, 30, 67],
    "Brown Ceramic": [131, 84, 50],
    "Green Ceramic": [208, 214, 215],
    "Red Ceramic": [142, 32, 32],
    "Black Ceramic": [153, 34, 34],
    "Tilled Soil": [148, 96, 63],
    "Bread Block": [198, 144, 41],
    "ReservedBread BlockRotation1": [198, 144, 41],
    "ReservedBread BlockRotation2": [198, 144, 41],
    "ReservedBread BlockRotation3": [198, 144, 41],
    "Mossy Messy Stone": [146, 142, 142],
    "Apple Block": [167, 21, 28],
    "Moonstone Ore": [146, 142, 142],
    "Moonstone Chest": [201, 210, 241],
    "Block of Moonstone": [152, 173, 217],
    Magma: [247, 136, 24],
    "Useless Soil": [101, 65, 25],
    "Marked Sandstone": [230, 222, 177],
    "Red Sandstone": [203, 110, 36],
    "Smooth Red Sandstone": [203, 110, 36],
    "Engraved Red Sandstone": [203, 110, 36],
    "Marked Red Sandstone": [203, 110, 36],
    "Green Stone": [121, 183, 165],
    "Green Bricks": [74, 145, 127],
    "Dark Green Bricks": [59, 130, 104],
    "Sandstone Bricks": [230, 222, 177],
    "Engraved Diorite": [246, 245, 240],
    "Diorite Bricks": [246, 245, 240],
    "Engraved Andesite": [105, 109, 115],
    "Andesite Bricks": [128, 132, 137],
    "Engraved Granite": [159, 107, 88],
    "Granite Bricks": [159, 107, 88],
    "Ice Bricks": [134, 207, 254],
    "Placeholder Packed Ice": [134, 207, 254],
    "Placeholder Blue Ice": [134, 207, 254],
    "Plum Leaves": [58, 112, 50],
    "Cedar Leaves": [37, 67, 20],
    "Palm Leaves": [88, 174, 62],
    "Plum Leaves|TreeCanopy": [58, 112, 50],
    "Cedar Leaves|TreeCanopy": [37, 67, 20],
    "Palm Leaves|TreeCanopy": [88, 174, 62],
    "Palm Log": [91, 85, 44],
    "Palm Log|TreeBase|Palm": [91, 85, 44],
    "Palm Wood Planks": [214, 153, 73],
    "Red Sand": [203, 110, 36],
    "Red Sandstone Bricks": [203, 110, 36],
    "Rocky Dirt": [142, 100, 78],
    "Autumn Maple Leaves": [204, 120, 31],
    "Autumn Maple Leaves|TreeCanopy": [204, 120, 31],
    "Fallen Maple Leaves": [204, 120, 31],
    "Maple Slab": [156, 120, 74],
    "Pine Slab": [97, 67, 39],
    "Plum Slab": [149, 75, 38],
    "Cedar Slab": [61, 37, 18],
    "Aspen Slab": [174, 150, 107],
    "Jungle Slab": [143, 99, 71],
    "Palm Slab": [196, 139, 66],
    "Dirt Slab": [129, 88, 70],
    "Grass Slab": [103, 161, 77],
    "Messy Stone Slab": [128, 124, 124],
    "Stone Slab": [146, 142, 142],
    "Smooth Stone Slab": [146, 142, 142],
    "Engraved Stone Slab": [146, 142, 142],
    "Stone Bricks Slab": [113, 109, 109],
    "Mossy Stone Slab": [128, 124, 124],
    "Mossy Stone Bricks Slab": [113, 109, 109],
    "Andesite Slab": [128, 132, 137],
    "Smooth Andesite Slab": [128, 132, 137],
    "Engraved Andesite Slab": [128, 132, 137],
    "Andesite Bricks Slab": [105, 109, 115],
    "Diorite Slab": [246, 245, 240],
    "Smooth Diorite Slab": [202, 197, 192],
    "Engraved Diorite Slab": [202, 197, 192],
    "Diorite Bricks Slab": [202, 197, 192],
    "Granite Slab": [159, 107, 88],
    "Smooth Granite Slab": [159, 107, 88],
    "Engraved Granite Slab": [159, 107, 88],
    "Granite Bricks Slab": [128, 80, 65],
    "Sandstone Slab": [217, 201, 158],
    "Engraved Sandstone Slab": [230, 222, 177],
    "Marked Sandstone Slab": [230, 222, 177],
    "Sandstone Bricks Slab": [211, 190, 147],
    "Red Sandstone Slab": [192, 92, 30],
    "Smooth Red Sandstone Slab": [203, 110, 36],
    "Engraved Red Sandstone Slab": [203, 110, 36],
    "Marked Red Sandstone Slab": [203, 110, 36],
    "Red Sandstone Bricks Slab": [186, 89, 29],
    "Bricks Slab": [162, 134, 125],
    "Ice Bricks Slab": [230, 235, 235],
    "Plum Block": [143, 16, 143],
    "Coconut Block": [117, 88, 39],
    "Pear Log": [97, 97, 97],
    "Pear Wood Planks": [141, 110, 99],
    "Pear Leaves": [242, 248, 234],
    "Pear Log|TreeBase|Pear": [97, 97, 97],
    "Pear Leaves|TreeCanopy": [242, 248, 234],
    "Pear Slab": [109, 76, 65],
    "Pear Block": [248, 215, 72],
    "Compressed Messy Stone": [117, 117, 117],
    "Extra Compressed Messy Stone": [107, 107, 107],
    "Super Compressed Messy Stone": [87, 87, 87],
    "Hyper Compressed Messy Stone": [77, 77, 77],
    "Ultra Compressed Messy Stone": [68, 68, 68],
    "Mega Compressed Messy Stone": [62, 62, 62],
    "Brown Mushroom Block": [193, 151, 119],
    "Red Mushroom Block": [226, 61, 48],
    "Mushroom Stem": [211, 206, 196],
    "Fireball Block": [236, 63, 49],
    "Iceball Block": [49, 123, 235],
    Pumpkin: [196, 104, 19],
    "Carved Pumpkin": [196, 104, 19],
    Melon: [245, 220, 0],
    "Iron Watermelon": [214, 209, 202],
    "Patterned Black Glass": [0, 0, 0],
    "Patterned Blue Glass": [32, 59, 118],
    "Patterned Brown Glass": [124, 82, 51],
    "Patterned Cyan Glass": [98, 179, 193],
    "Patterned Gray Glass": [86, 90, 93],
    "Patterned Light Gray Glass": [190, 194, 198],
    "Patterned Green Glass": [105, 125, 62],
    "Patterned Light Blue Glass": [135, 187, 242],
    "Patterned Lime Glass": [125, 199, 55],
    "Patterned Magenta Glass": [193, 73, 183],
    "Patterned Orange Glass": [242, 151, 82],
    "Patterned Pink Glass": [238, 116, 161],
    "Patterned Purple Glass": [126, 63, 177],
    "Patterned Red Glass": [143, 33, 33],
    "Patterned White Glass": [255, 255, 255],
    "Patterned Yellow Glass": [248, 214, 135],
    Bookshelf: [175, 143, 85],
    "Empty Bookshelf": [175, 143, 85],
    Mailbox: [100, 63, 45],
    "Tribe Protector": [146, 142, 142],
    "Faction Protector": [217, 87, 99],
    "Barkless Palm Log": [196, 139, 66],
    "Barkless Pear Log": [109, 76, 65],
    "Barkless Palm Log|TreeBase|Palm": [196, 139, 66],
    "Barkless Pear Log|TreeBase|Pear": [109, 76, 65],
    "Mystery Block": [238, 202, 78],
    Rocket: [52, 81, 51],
    "Super Rocket": [80, 58, 32],
    Grenade: [61, 49, 97],
    "Cherry Log": [54, 34, 46],
    "Barkless Cherry Log": [218, 170, 170],
    "Barkless Cherry Log|TreeBase|Cherry": [218, 170, 170],
    "Cherry Wood Planks": [233, 192, 187],
    "Cherry Leaves": [249, 194, 225],
    "Fallen Cherry Leaves": [249, 194, 225],
    "Cherry Log|TreeBase|Cherry": [54, 34, 46],
    "Cherry Leaves|TreeCanopy": [249, 194, 225],
    "Cherry Slab": [218, 170, 170],
    "Cherry Block": [228, 54, 139],
    "Bouncy Bomb Block": [183, 45, 183],
    "Obby Rocket": [52, 81, 51],
    "Corn Block": [236, 207, 17],
    "Melting Ice|Breaking": [64, 137, 254],
    "Yellow Paintball Explosive": [242, 176, 21],
    "White Paintball Explosive": [208, 214, 215],
    "Red Paintball Explosive": [143, 33, 33],
    "Purple Paintball Explosive": [101, 32, 157],
    "Pink Paintball Explosive": [214, 101, 143],
    "Orange Paintball Explosive": [225, 97, 0],
    "Magenta Paintball Explosive": [169, 48, 159],
    "Lime Paintball Explosive": [95, 170, 25],
    "Light Gray Paintball Explosive": [125, 125, 115],
    "Light Blue Paintball Explosive": [37, 138, 200],
    "Green Paintball Explosive": [73, 91, 36],
    "Gray Paintball Explosive": [55, 58, 62],
    "Cyan Paintball Explosive": [21, 119, 135],
    "Brown Paintball Explosive": [97, 60, 32],
    "Blue Paintball Explosive": [45, 47, 144],
    "Black Paintball Explosive": [9, 11, 16],
    "Yellow Quick Paintball Explosive": [255, 211, 64],
    "White Quick Paintball Explosive": [250, 250, 250],
    "Goal Block (Red)": [143, 33, 33],
    "Goal Block (Blue)": [45, 47, 144],
    "Red Quick Paintball Explosive": [176, 44, 37],
    "Purple Quick Paintball Explosive": [136, 45, 183],
    "Pink Quick Paintball Explosive": [254, 155, 188],
    "Orange Quick Paintball Explosive": [252, 133, 33],
    "Magenta Quick Paintball Explosive": [203, 74, 189],
    "Lime Quick Paintball Explosive": [134, 202, 29],
    "Light Gray Quick Paintball Explosive": [154, 154, 149],
    "Light Blue Quick Paintball Explosive": [59, 194, 230],
    "Green Quick Paintball Explosive": [95, 119, 32],
    "Gray Quick Paintball Explosive": [73, 79, 83],
    "Cyan Quick Paintball Explosive": [25, 153, 154],
    "Brown Quick Paintball Explosive": [125, 81, 44],
    "Blue Quick Paintball Explosive": [58, 68, 166],
    "Black Quick Paintball Explosive": [29, 31, 36],
    "Yellow Seeking Paintball Explosive": [242, 176, 21],
    "White Seeking Paintball Explosive": [208, 214, 215],
    "Red Seeking Paintball Explosive": [143, 33, 33],
    "Purple Seeking Paintball Explosive": [101, 32, 157],
    "Pink Seeking Paintball Explosive": [214, 101, 143],
    "Orange Seeking Paintball Explosive": [225, 97, 0],
    "Magenta Seeking Paintball Explosive": [169, 48, 159],
    "Lime Seeking Paintball Explosive": [95, 170, 25],
    "Light Gray Seeking Paintball Explosive": [125, 125, 115],
    "Light Blue Seeking Paintball Explosive": [37, 138, 200],
    "Green Seeking Paintball Explosive": [73, 91, 36],
    "Gray Seeking Paintball Explosive": [55, 58, 62],
    "Cyan Seeking Paintball Explosive": [21, 119, 135],
    "Brown Seeking Paintball Explosive": [97, 60, 32],
    "Blue Seeking Paintball Explosive": [45, 47, 144],
    "Black Seeking Paintball Explosive": [9, 11, 16],
    "Yellow Sticky Paintball Explosive": [242, 176, 21],
    "White Sticky Paintball Explosive": [208, 214, 215],
    "Red Sticky Paintball Explosive": [143, 33, 33],
    "Purple Sticky Paintball Explosive": [101, 32, 157],
    "Pink Sticky Paintball Explosive": [214, 101, 143],
    "Orange Sticky Paintball Explosive": [225, 97, 0],
    "Magenta Sticky Paintball Explosive": [169, 48, 159],
    "Lime Sticky Paintball Explosive": [95, 170, 25],
    "Light Gray Sticky Paintball Explosive": [125, 125, 115],
    "Light Blue Sticky Paintball Explosive": [37, 138, 200],
    "Green Sticky Paintball Explosive": [73, 91, 36],
    "Gray Sticky Paintball Explosive": [55, 58, 62],
    "Cyan Sticky Paintball Explosive": [21, 119, 135],
    "Brown Sticky Paintball Explosive": [97, 60, 32],
    "Blue Sticky Paintball Explosive": [45, 47, 144],
    "Black Sticky Paintball Explosive": [9, 11, 16],
    "Chili Pepper Block": [216, 0, 7],
    "Code Block": [227, 158, 100],
    "Toxin Ball Block": [8, 94, 53],
    "Spawn Block (Yellow)": [255, 211, 64],
    "Spawn Block (White)": [250, 250, 250],
    "Spawn Block (Red)": [176, 44, 37],
    "Spawn Block (Purple)": [136, 45, 183],
    "Spawn Block (Pink)": [254, 155, 188],
    "Spawn Block (Orange)": [252, 133, 33],
    "Spawn Block (Magenta)": [203, 74, 189],
    "Spawn Block (Lime)": [134, 202, 29],
    "Spawn Block (Light Gray)": [154, 154, 149],
    "Spawn Block (Light Blue)": [59, 194, 230],
    "Spawn Block (Green)": [95, 119, 32],
    "Spawn Block (Gray)": [73, 79, 83],
    "Spawn Block (Cyan)": [25, 153, 154],
    "Spawn Block (Brown)": [125, 81, 44],
    "Spawn Block (Blue)": [58, 68, 166],
    "Spawn Block (Black)": [29, 31, 36],
    "Checkpoint Block": [62, 230, 27],
    "Custom Lobby Block": [0, 0, 0],
    "Generator Spawn Block (Red)": [176, 44, 37],
    "Generator Spawn Block (Blue)": [58, 68, 166],
    "Generator Spawn Block (Lime)": [134, 202, 29],
    "Generator Spawn Block (Yellow)": [255, 211, 64],
    "Generator Spawn Block (Cyan)": [25, 153, 154],
    "Generator Spawn Block (White)": [250, 250, 250],
    "Generator Spawn Block (Pink)": [254, 155, 188],
    "Generator Spawn Block (Gray)": [73, 79, 83],
    "Trader Shop Spawn Block": [45, 45, 45],
    "Wizard Shop Spawn Block": [42, 122, 194],
    "Generator Spawn Block (Diamond)": [37, 171, 193],
    "Generator Spawn Block (Moonstone)": [152, 173, 217],
    "Generator Spawn Block (Ore)": [146, 142, 142],
    "Finish Block": [255, 255, 255],
    "Drop Location Block": [51, 51, 109],
    "Obby Death Block": [172, 50, 50],
    "Obby Absorb Block": [75, 75, 75],
    "Obby Absorb Death Block": [75, 47, 171],
    "Bone Block": [224, 228, 223],
    "Pig Spawner Block": [60, 83, 101],
    "Cow Spawner Block": [60, 83, 101],
    "Sheep Spawner Block": [60, 83, 101],
    "Cave Golem Spawner Block": [60, 83, 101],
    "Draugr Zombie Spawner Block": [60, 83, 101],
    "Draugr Skeleton Spawner Block": [60, 83, 101],
    "Empty Spawner Block": [60, 83, 101],
    "Frost Golem Spawner Block": [60, 83, 101],
    "Frost Zombie Spawner Block": [60, 83, 101],
    "Frost Skeleton Spawner Block": [60, 83, 101],
    "Snowy Messy Stone": [146, 142, 142],
    "Snowy Stone Slab": [128, 124, 124],
    "Draugr Knight Spawner Block": [60, 83, 101],
    "Packed Snow": [188, 219, 219],
    "Carved Messy Stone": [146, 142, 142],
    "Spectral Log": [29, 123, 107],
    "Barkless Spectral Log": [43, 132, 128],
    "Barkless Spectral Log|TreeBase|Spectral": [43, 132, 128],
    "Spectral Wood Planks": [54, 157, 145],
    "Spectral Leaves": [22, 136, 139],
    "Spectral Log|TreeBase|Spectral": [29, 123, 107],
    "Spectral Leaves|TreeCanopy": [22, 136, 139],
    "Spectral Slab": [43, 132, 128],
    "Pine Grass Block": [89, 151, 104],
    "Pine Grass Slab": [89, 151, 104],
    "Pine Cone Block": [133, 88, 38],
    "Wolf Spawner Block": [60, 83, 101],
    "Bear Spawner Block": [60, 83, 101],
    "Deer Spawner Block": [60, 83, 101],
    "Stag Spawner Block": [60, 83, 101],
    "Gold Watermelon Stag Spawner Block": [60, 83, 101],
    Chalk: [249, 251, 251],
    "Yellow Chalk": [252, 244, 180],
    "White Chalk": [225, 247, 248],
    "Red Chalk": [242, 133, 135],
    "Purple Chalk": [192, 155, 200],
    "Pink Chalk": [247, 173, 198],
    "Orange Chalk": [242, 160, 133],
    "Magenta Chalk": [230, 163, 224],
    "Lime Chalk": [172, 210, 149],
    "Light Gray Chalk": [182, 206, 204],
    "Light Blue Chalk": [160, 196, 231],
    "Green Chalk": [158, 179, 147],
    "Gray Chalk": [111, 128, 138],
    "Cyan Chalk": [172, 219, 210],
    "Brown Chalk": [182, 164, 151],
    "Blue Chalk": [131, 167, 222],
    "Black Chalk": [43, 57, 67],
    "Yellow Chalk Bricks": [252, 244, 180],
    "White Chalk Bricks": [225, 247, 248],
    "Red Chalk Bricks": [242, 133, 135],
    "Purple Chalk Bricks": [192, 155, 200],
    "Pink Chalk Bricks": [247, 173, 198],
    "Orange Chalk Bricks": [242, 160, 133],
    "Magenta Chalk Bricks": [230, 163, 224],
    "Lime Chalk Bricks": [172, 210, 149],
    "Light Gray Chalk Bricks": [182, 206, 204],
    "Light Blue Chalk Bricks": [160, 196, 231],
    "Green Chalk Bricks": [158, 179, 147],
    "Gray Chalk Bricks": [111, 128, 138],
    "Cyan Chalk Bricks": [172, 219, 210],
    "Brown Chalk Bricks": [182, 164, 151],
    "Blue Chalk Bricks": [131, 167, 222],
    "Black Chalk Bricks": [43, 57, 67],
    "Yellow Chalk Slab": [252, 244, 180],
    "White Chalk Slab": [225, 247, 248],
    "Red Chalk Slab": [242, 133, 135],
    "Purple Chalk Slab": [192, 155, 200],
    "Pink Chalk Slab": [247, 173, 198],
    "Orange Chalk Slab": [242, 160, 133],
    "Magenta Chalk Slab": [230, 163, 224],
    "Lime Chalk Slab": [172, 210, 149],
    "Light Gray Chalk Slab": [182, 206, 204],
    "Light Blue Chalk Slab": [160, 196, 231],
    "Green Chalk Slab": [158, 179, 147],
    "Gray Chalk Slab": [111, 128, 138],
    "Cyan Chalk Slab": [172, 219, 210],
    "Brown Chalk Slab": [182, 164, 151],
    "Blue Chalk Slab": [131, 167, 222],
    "Black Chalk Slab": [43, 57, 67],
    "Yellow Chalk Bricks Slab": [227, 214, 113],
    "White Chalk Bricks Slab": [178, 212, 214],
    "Red Chalk Bricks Slab": [233, 84, 86],
    "Purple Chalk Bricks Slab": [160, 112, 170],
    "Pink Chalk Bricks Slab": [236, 125, 163],
    "Orange Chalk Bricks Slab": [233, 119, 82],
    "Magenta Chalk Bricks Slab": [212, 114, 204],
    "Lime Chalk Bricks Slab": [137, 190, 106],
    "Light Gray Chalk Bricks Slab": [145, 168, 166],
    "Light Blue Chalk Bricks Slab": [109, 164, 218],
    "Green Chalk Bricks Slab": [121, 151, 106],
    "Gray Chalk Bricks Slab": [83, 97, 106],
    "Cyan Chalk Bricks Slab": [116, 201, 184],
    "Brown Chalk Bricks Slab": [154, 124, 102],
    "Blue Chalk Bricks Slab": [79, 129, 206],
    "Gorilla Spawner Block": [60, 83, 101],
    "Wildcat Spawner Block": [60, 83, 101],
    "Draugr Huntress Spawner Block": [60, 83, 101],
    "Magma Golem Spawner Block": [60, 83, 101],
    "Horse Spawner Block": [60, 83, 101],
    "Spirit Golem Spawner Block": [60, 83, 101],
    "Spirit Wolf Spawner Block": [60, 83, 101],
    "Spirit Bear Spawner Block": [60, 83, 101],
    "Spirit Stag Spawner Block": [60, 83, 101],
    "Spirit Gorilla Spawner Block": [60, 83, 101],
    "Black Chalk Bricks Slab": [26, 37, 44],
    "Jungle Grass Block": [15, 146, 8],
    "Jungle Grass Slab": [15, 146, 8],
    "Mango Log": [81, 73, 71],
    "Barkless Mango Log": [197, 183, 95],
    "Barkless Mango Log|TreeBase|Mango": [197, 183, 95],
    "Mango Wood Planks": [210, 196, 113],
    "Mango Leaves": [34, 109, 53],
    "Mango Log|TreeBase|Mango": [81, 73, 71],
    "Mango Leaves|TreeCanopy": [34, 109, 53],
    "Mango Slab": [197, 183, 95],
    "Mango Block": [250, 126, 4],
    "Banana Block": [234, 217, 113],
    "Fruity Maple Leaves": [56, 105, 31],
    "Pine Cone Leaves": [19, 36, 9],
    "Fruity Plum Leaves": [58, 112, 50],
    "Fruity Palm Leaves": [88, 174, 62],
    "Fruity Pear Leaves": [242, 248, 234],
    "Fruity Cherry Leaves": [249, 194, 225],
    "Fruity Mango Leaves": [29, 98, 46],
    "Leather Block": [129, 95, 72],
    "Autumn Aspen Leaves": [252, 215, 11],
    "Autumn Aspen Leaves|TreeCanopy": [252, 215, 11],
    "Iron Chest": [228, 224, 218],
    Crate: [183, 151, 93],
    "Carrot Block": [200, 101, 13],
    "Potato Block": [175, 132, 68],
    "Beetroot Block": [110, 36, 52],
    "Water": [66, 105, 245],
    "Lava": [227, 105, 54]
  };
  Object.freeze(averageColor);
  let minimapChunkDataField = null;
  const workerScriptContent = `
    self.onmessage = function(e) {
        const { chunkHash, myPos, MINIMAP_RANGE, isUnderground, ignoredBlockIds } = e.data;
        let processedData = [];
        const surfaceMap = new Map();
        if (isUnderground) {
            const myY = Math.floor(myPos[1]);
            for (const chunkKey in chunkHash) {
                const chunk = chunkHash[chunkKey];
                if (!chunk.data || !chunk.stride || !chunk.pos) continue;
                const { data, stride, pos: chunkOriginPos } = chunk;
                for (let i = 0; i < data.length; i++) {
                    const blockID = data[i];
                    if (blockID === 0 || blockID === 150 || (ignoredBlockIds && ignoredBlockIds.has(blockID))) continue;
                    const x = Math.floor(i / stride[0]), remX = i % stride[0], y = Math.floor(remX / stride[1]), z = remX % stride[1];
                    const worldY = chunkOriginPos[1] + y;
                    if (worldY > myY + 4 || worldY < myY - 10) continue;
                    const worldX = chunkOriginPos[0] + x, worldZ = chunkOriginPos[2] + z;
                    if (Math.abs(worldX - myPos[0]) > MINIMAP_RANGE || Math.abs(worldZ - myPos[2]) > MINIMAP_RANGE) continue;
                    const mapKey = \`\${worldX}|\${worldZ}\`;
                    if (!surfaceMap.has(mapKey) || worldY > surfaceMap.get(mapKey).y) {
                         surfaceMap.set(mapKey, { y: worldY, blockId: blockID, worldX: worldX, worldZ: worldZ });
                    }
                }
            }
        } else {
            for (const chunkKey in chunkHash) {
                const chunk = chunkHash[chunkKey];
                if (!chunk.data || !chunk.stride || !chunk.pos) continue;
                const { data, stride, pos: chunkOriginPos } = chunk;
                for (let i = 0; i < data.length; i++) {
                    const blockID = data[i];
                    if (blockID === 0 || blockID === 150 || (ignoredBlockIds && ignoredBlockIds.has(blockID))) continue;
                    const x = Math.floor(i / stride[0]), remX = i % stride[0], y = Math.floor(remX / stride[1]), z = remX % stride[1];
                    const worldX = chunkOriginPos[0] + x, worldZ = chunkOriginPos[2] + z;
                    if (Math.abs(worldX - myPos[0]) > MINIMAP_RANGE || Math.abs(worldZ - myPos[2]) > MINIMAP_RANGE) continue;
                    const mapKey = \`\${worldX}|\${worldZ}\`;
                    const worldY = chunkOriginPos[1] + y;
                    if (!surfaceMap.has(mapKey) || worldY > surfaceMap.get(mapKey).y) {
                        surfaceMap.set(mapKey, { y: worldY, blockId: blockID, worldX: worldX, worldZ: worldZ });
                    }
                }
            }
        }
        const heightLookupMap = new Map(Array.from(surfaceMap.values()).map(d => [\`\${d.worldX}|\${d.worldZ}\`, d.y]));
        processedData = Array.from(surfaceMap.values()).map(data => {
            let brightnessOffset = 0;
            const topNeighborY = heightLookupMap.get(\`\${data.worldX}|\${data.worldZ + 1}\`);
            const bottomNeighborY = heightLookupMap.get(\`\${data.worldX}|\${data.worldZ - 1}\`);
            if (topNeighborY !== undefined && data.y < topNeighborY) brightnessOffset = -0.25;
            else if (bottomNeighborY !== undefined && data.y < bottomNeighborY) brightnessOffset = 0.15;
            return { blockId: data.blockId, worldX: data.worldX, worldZ: data.worldZ, brightness: brightnessOffset * 100 };
        });
        self.postMessage({ surfaceData: processedData });
    };`;
  function setupMinimapWorker() {
    try {
      const blob = new Blob([workerScriptContent], {
        type: 'application/javascript'
      });
      minimapWorker = new Worker(URL.createObjectURL(blob));
      minimapWorker.onmessage = function(e) {
        lastSurfaceData = e.data.surfaceData;
        isWorkerBusy = false;
      };
    } catch (e) {
      minimapWorker = null;
    }
  }
  function getBlockName(blockId) {
    if (!Number.isFinite(blockId)) return null;
    if (blockNameCache.has(blockId)) return blockNameCache.get(blockId);
    let name = null;
    try {
      const blocksClient = Fuxny?.Props?.blocksClient;
      if (blocksClient) {
        const entry = blocksClient[blockId] ?? blocksClient[String(blockId)];
        if (typeof entry?.name === 'string') name = entry.name;
      }
    } catch (e) {}
    blockNameCache.set(blockId, name);
    return name;
  }
  function rgbToHex(rgb) {
    if (!rgb || rgb.length < 3) return '#BEBEBE';
    return "#" + rgb.map(c => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  }
  function getBlockColor(blockId) {
    if (blockId === 0) return '#00000000';
    const blockName = getBlockName(blockId);
    if (!blockName) return '#BEBEBE';
    const cleanBlockName = blockName.split('|')[0];
    const colorRgb = averageColor[cleanBlockName];
    return colorRgb ? rgbToHex(colorRgb) : '#BEBEBE';
  }
  function adjustColor(hex, percent) {
    const f = parseInt(hex.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent;
    const R = f >> 16,
      G = (f >> 8) & 0x00FF,
      B = f & 0x0000FF;
    return `#${(0x1000000 + (Math.round((t - R) * (p / 100)) + R) * 0x10000 + (Math.round((t - G) * (p / 100)) + G) * 0x100 + (Math.round((t - B) * (p / 100)) + B)).toString(16).slice(1)}`;
  }
  let isUndergroundCached = false,
    lastUndergroundCheckTime = 0,
    ignoredBlockIdsCached = new Set(),
    minimapAnimationId = null;
  function scanMinimapData() {
    if (!injectedBool || !minimapCanvas) return;
    const myPos = n.noa.getPosition(1);
    if (!myPos) return;
    const now = Date.now();
    if (now - lastUndergroundCheckTime > 1000) {
      lastUndergroundCheckTime = now;
      const blocksClient = Fuxny?.Props?.blocksClient;
      if (blocksClient) {
        const newIgnored = new Set();
        for (const id in blocksClient) {
          const b = blocksClient[id];
          if (b && typeof b.name === 'string') {
            const lowName = b.name.toLowerCase();
            if (lowName.includes('grass') && !lowName.includes('block')) {
              newIgnored.add(Number(id));
            }
          }
        }
        ignoredBlockIdsCached = newIgnored;
      }
      const myX = Math.floor(myPos[0]),
        myZ = Math.floor(myPos[2]),
        startY = Math.floor(myPos[1]) + 2;
      let isCurrentlyUnderground = false;
      for (let y = startY; y < 256; y++) {
        if (I.getBlockID(myX, y, myZ) !== 0 && !getBlockName(I.getBlockID(myX, y, myZ))?.toLowerCase().includes('leave')) {
          isCurrentlyUnderground = true;
          break;
        }
      }
      isUndergroundCached = isCurrentlyUnderground;
    }
    if (minimapWorker && !isWorkerBusy) {
      isWorkerBusy = true;
      const chunkHash = Fuxny.world[Fuxny.impKey].hash;
      if (!minimapChunkDataField) {
        const firstChunk = Object.values(chunkHash)[0];
        if (firstChunk) minimapChunkDataField = autoDetectChunkDataField(firstChunk);
      }
      const chunkHashForWorker = {};
      if (minimapChunkDataField) {
        for (const key in chunkHash) {
          const chunk = chunkHash[key];
          if (chunk[minimapChunkDataField]) chunkHashForWorker[key] = {
            data: chunk[minimapChunkDataField].data,
            stride: chunk[minimapChunkDataField].stride,
            pos: chunk.pos
          };
        }
      }
      minimapWorker.postMessage({
        chunkHash: chunkHashForWorker,
        myPos: myPos,
        MINIMAP_RANGE: MINIMAP_RANGE,
        isUnderground: isUndergroundCached,
        ignoredBlockIds: ignoredBlockIdsCached
      });
    }
  }
  function renderMinimapFrame() {
    if (!injectedBool || !minimapCanvas) {
      minimapAnimationId = requestAnimationFrame(renderMinimapFrame);
      return;
    }
    updateInterpolationTimer();
    const rawMyPos = n.noa.getPosition(1);
    if (!rawMyPos) {
      minimapAnimationId = requestAnimationFrame(renderMinimapFrame);
      return;
    }
    const myPos = getInterpolatedPosition(1, rawMyPos);
    const ctx = minimapCanvas.getContext('2d');
    const blockSize = MINIMAP_SIZE / (MINIMAP_RANGE * 2);
    const playerCanvasX = MINIMAP_SIZE / 2,
      playerCanvasY = MINIMAP_SIZE / 2;
    ctx.fillStyle = isUndergroundCached ? 'rgba(50, 45, 60, 0.7)' : 'rgba(26, 29, 33, 0.7)';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    if (lastSurfaceData.length > 0) {
      for (const data of lastSurfaceData) {
        ctx.fillStyle = adjustColor(getBlockColor(data.blockId), data.brightness);
        ctx.fillRect(playerCanvasX + (data.worldX - myPos[0]) * blockSize, playerCanvasY - (data.worldZ - myPos[2]) * blockSize, blockSize + 1, blockSize + 1);
      }
    }
    for (const id of n.noa.playerList) {
      if (id === 1) continue;
      const life = Fuxny.entities.getState(id, "genericLifeformState");
      if (life && !life.isAlive) continue;
      const rawEPos = n.noa.getPosition(id);
      if (!rawEPos) continue;
      const ePos = getInterpolatedPosition(id, rawEPos);
      const dx = ePos[0] - myPos[0],
        dz = ePos[2] - myPos[2];
      if (Math.abs(dx) <= MINIMAP_RANGE && Math.abs(dz) <= MINIMAP_RANGE) {
        const pX = playerCanvasX + dx * blockSize;
        const pY = playerCanvasY - dz * blockSize;
        const pHeading = n.noa.getMoveState(id)?.heading || 0;
        ctx.save();
        ctx.translate(pX, pY);
        ctx.rotate(pHeading);
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(3, 4);
        ctx.lineTo(-3, 4);
        ctx.closePath();
        ctx.fillStyle = '#FF4500';
        ctx.fill();
        ctx.strokeStyle = '#1a1d21';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    }
    const heading = Fuxny.camera.heading;
    ctx.save();
    ctx.translate(playerCanvasX, playerCanvasY);
    ctx.rotate(heading);
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(4, 5);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#1a1d21';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    minimapAnimationId = requestAnimationFrame(renderMinimapFrame);
  }
  function startMinimap() {
    if (minimapIntervalId) return;
    if (!minimapCanvas) {
      minimapCanvas = document.createElement('canvas');
      minimapCanvas.id = 'minimap-canvas';
      minimapCanvas.width = MINIMAP_SIZE;
      minimapCanvas.height = MINIMAP_SIZE;
      minimapCanvas.style.position = 'fixed';
      minimapCanvas.style.top = '20px';
      minimapCanvas.style.right = '20px';
      minimapCanvas.style.border = '3px solid var(--border-color)';
      minimapCanvas.style.borderRadius = '3px';
      minimapCanvas.style.zIndex = '999990';
      document.body.appendChild(minimapCanvas);
    }
    if (!minimapWorker) setupMinimapWorker();
    minimapCanvas.style.display = 'block';
    makeElementDraggable(minimapCanvas);
    minimapIntervalId = setInterval(scanMinimapData, MINIMAP_UPDATE_INTERVAL);
    scanMinimapData();
    minimapAnimationId = requestAnimationFrame(renderMinimapFrame);
  }
  function stopMinimap() {
    if (minimapIntervalId) {
      clearInterval(minimapIntervalId);
      minimapIntervalId = null;
    }
    if (minimapAnimationId) {
      cancelAnimationFrame(minimapAnimationId);
      minimapAnimationId = null;
    }
    if (minimapCanvas) {
      minimapCanvas.style.display = 'none';
    }
    if (minimapWorker) {
      minimapWorker.terminate();
      minimapWorker = null;
      isWorkerBusy = false;
      lastSurfaceData = [];
    }
  }
  function performInjection() {
    l.init();
    function inject() {
      let winDescriptors = Object.getOwnPropertyDescriptors(window);
      let wpName = Object.keys(winDescriptors).find(key => winDescriptors[key]?.set?.toString().includes("++"));
      let wpInstance = window[wpName] = window[wpName];
      wpInstance.push([
        [Math.floor(Math.random() * 90000) + 10000], {},
        function(wpRequire) {
          Fuxny.findModule = (code) => wpRequire(Object.keys(wpRequire.m)[Object.values(wpRequire.m).findIndex(m => m.toString().includes(code))]);
          Fuxny.Props = Object.values(Fuxny.findModule("nonBlocksClient:")).find(prop => typeof prop == "object");
          Fuxny.noa = Object.values(Fuxny.Props).find(prop => prop?.entities);
        }
      ]);
      if (!Fuxny.noa) return;
      let _cachedPlayerData = null;
      Object.defineProperty(Fuxny.noa, 'playerdata', {
        get: function() {
          if (_cachedPlayerData) return _cachedPlayerData;
          for (const key in this) {
            try {
              if (this[key] && typeof this[key] === 'object' && this[key].hasOwnProperty('crouchingSpeed')) {
                _cachedPlayerData = this[key];
                return _cachedPlayerData;
              }
            } catch (e) {}
          }
          return null;
        },
        configurable: true
      });
      const targetValue = r.values(Fuxny.noa.entities)[2];
      const entityEntries = Object.entries(Fuxny.noa.entities);
      Fuxny.impKey = entityEntries.find(([_, val]) => val === targetValue)?.[0];
      Fuxny.registry = r.values(Fuxny.noa)[17];
      Fuxny.rendering = r.values(Fuxny.noa)[12];
      Fuxny.entities = Fuxny.noa.entities;
      Fuxny.world = r.values(Fuxny.noa)[11];
      Fuxny.camera = Fuxny.noa.camera;
      Fuxny.bloxd = Fuxny.noa.bloxd;
      Fuxny.physics = Fuxny.noa.physics;
      Fuxny.entityList = r.values(Fuxny.noa)[30];
      let scene = r.values(Fuxny.rendering).find(value => value?.meshes?.[0]);
      let mesh = scene.meshes[0];
      Fuxny.Lion = {
        scene: scene,
        Mesh: mesh.constructor,
        StandardMaterial: mesh.material.constructor,
        Color3: mesh.material.diffuseColor.constructor
      };
      if (Fuxny.impKey) {
        const entity = Fuxny.noa.entities?.[Fuxny.impKey];
        if (entity?.moveState?.list?.[0] && entity?.movement?.list?.[0]) {
          playerKey = Fuxny.impKey;
          moveState = entity.moveState.list[0];
          physState = entity.movement.list[0];
        }
      }
      const maybeEntity = r.values(r.values(Fuxny.entities[Fuxny.impKey]).find(value => value?.list?.[0]?._blockItem).list[0])[1];
      if (maybeEntity) {
        if (typeof maybeEntity?.doAttack === 'function') playerEntity = maybeEntity;
        else if (typeof maybeEntity?.breakingItem?.doAttack === 'function') playerEntity = maybeEntity.breakingItem;
      }
      skyboxMesh = Fuxny.Lion.scene.getMeshByID("skyBox");
      playerInventoryParent = Fuxny.entities[Fuxny.impKey].inventory.list[0].opWrapper;
      function findOnlysendBytes(obj) {
        if (!obj) return null;
        const proto = Object.getPrototypeOf(obj);
        const props = Object.getOwnPropertyNames(proto);
        for (const key of props) {
          if (key === 'constructor') continue;
          const val = proto[key];
          if (typeof val === 'function') {
            const str = val.toString();
            if (val.length === 2 && /Protocol\.ROOM_DATA_BYTES/i.test(str) && str.includes('Uint8Array') && str.includes('.encode')) return key;
          }
        }
        return null;
      }
      colyRoom = r.values(Fuxny.bloxd.client.msgHandler)[0];
      sendBytesName = findOnlysendBytes(colyRoom);
      if (colyRoom && sendBytesName) blinkState.originalSendBytes = colyRoom[sendBytesName];
      injectedBool = true;
    }
    inject();
    startTargetFinder();
  }
  function waitForElement(selector, callback) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && node.matches(selector)) {
            observer.disconnect();
            callback(node);
            return;
          }
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  let playerEspIntervalId = null;
  function findThinMeshes() {
    if (!Fuxny.rendering) return [];
    const values = r.values(Fuxny.rendering);
    for (const val of values) {
      if (val?.thinMeshes && Array.isArray(val.thinMeshes)) return val.thinMeshes;
    }
    return [];
  }
  function updatePlayerESP() {
    if (!injectedBool) return;
    try {
      const thinMeshes = findThinMeshes();
      if (thinMeshes.length === 0) return;
      for (const item of thinMeshes) {
        const mesh = item?.meshVariations?.__DEFAULT__?.mesh;
        if (mesh && typeof mesh.renderingGroupId === "number") mesh.renderingGroupId = 2;
      }
    } catch (e) {
      setPlayerESP(false);
    }
  }
  function resetPlayerESP() {
    if (!injectedBool) return;
    try {
      const thinMeshes = findThinMeshes();
      for (const item of thinMeshes) {
        const mesh = item?.meshVariations?.__DEFAULT__?.mesh;
        if (mesh && typeof mesh.renderingGroupId === "number") mesh.renderingGroupId = 0;
      }
    } catch (e) {}
  }
  function setPlayerESP(enabled) {
    if (enabled) {
      if (playerEspIntervalId) return;
      playerEspIntervalId = setInterval(updatePlayerESP, 300);
      updatePlayerESP();
    } else {
      if (!playerEspIntervalId) return;
      clearInterval(playerEspIntervalId);
      playerEspIntervalId = null;
      resetPlayerESP();
    }
  }
  function setWireframe(enabled) {
    if (!injectedBool || !Fuxny.Lion?.scene?.meshes) return;
    const groupId = enabled ? 2 : 0;
    Fuxny.Lion.scene.meshes.forEach(mesh => {
      if (mesh && mesh.id !== "skyBox" && !mesh.id.includes("espbox") && !mesh.id.includes("NameTag")) {
        if (mesh.material) try {
          mesh.material.wireframe = enabled;
        } catch (e) {}
        if (typeof mesh.renderingGroupId !== "undefined" && mesh.renderingGroupId < 5) mesh.renderingGroupId = groupId;
      }
    });
  }
  function setBlink(enabled) {
    if (!colyRoom || !sendBytesName || !blinkState.originalSendBytes) return;
    blinkState.enabled = enabled;
    if (enabled) {
      colyRoom[sendBytesName] = (...args) => {
        blinkState.queued.push(args);
      };
    } else {
      colyRoom[sendBytesName] = blinkState.originalSendBytes;
      for (const args of blinkState.queued) {
        blinkState.originalSendBytes.apply(colyRoom, args);
      }
      blinkState.queued = [];
    }
  }
  function startFakeLag() {
    if (fakeLagIntervalId || !colyRoom) return;
    const performLag = () => {
      setBlink(true);
      setTimeout(() => {
        if (fakeLagIntervalId) setBlink(false);
      }, fakeLagModule.duration);
    };
    performLag();
    fakeLagIntervalId = setInterval(performLag, fakeLagModule.interval);
  }
  function stopFakeLag() {
    if (!fakeLagIntervalId) return;
    clearInterval(fakeLagIntervalId);
    fakeLagIntervalId = null;
    if (blinkState.enabled) setBlink(false);
  }
  function derpTick() {
    if (!derpState.isHooked || !Fuxny.camera) return;
    if (derpModule.backwards) {
      derpState.fakePitch = derpState.realPitch;
      derpState.fakeHeading = (derpState.realHeading + Math.PI) % (Math.PI * 2);
    } else {
      derpState.spinIndex += (derpModule.speed * 0.1);
      derpState.fakeHeading = derpState.spinIndex;
      derpState.fakePitch = derpState.spinIndex;
    }
  }
  function startDerp() {
    if (derpIntervalId || !Fuxny.camera) return;
    derpState.realHeading = Fuxny.camera.heading;
    derpState.realPitch = Fuxny.camera.pitch;
    derpState.spinIndex = Fuxny.camera.heading;
    derpState.isHooked = true;
    Object.defineProperty(Fuxny.camera, "heading", {
      get: () => {
        try {
          null.test();
        } catch (error) {
          if (error.stack && (error.stack.includes("Object.system") || error.stack.includes("encode") || error.stack.includes("send"))) {
            return derpState.fakeHeading;
          }
        }
        return derpState.realHeading;
      },
      set: (value) => {
        derpState.realHeading = value;
      },
      configurable: true
    });
    Object.defineProperty(Fuxny.camera, "pitch", {
      get: () => {
        try {
          null.test();
        } catch (error) {
          if (error.stack && (error.stack.includes("Object.system") || error.stack.includes("encode") || error.stack.includes("send"))) {
            return derpState.fakePitch;
          }
        }
        return derpState.realPitch;
      },
      set: (value) => {
        derpState.realPitch = value;
      },
      configurable: true
    });
    derpIntervalId = setInterval(derpTick, 15);
    showTemporaryNotification("Derp Activated", "#4CAF50");
  }
  function stopDerp() {
    if (!derpIntervalId) return;
    clearInterval(derpIntervalId);
    derpIntervalId = null;
    derpState.isHooked = false;
    if (Fuxny.camera) {
      const finalHeading = derpState.realHeading;
      const finalPitch = derpState.realPitch;
      try {
        delete Fuxny.camera.heading;
        delete Fuxny.camera.pitch;
      } catch (e) {}
      Fuxny.camera.heading = finalHeading;
      Fuxny.camera.pitch = finalPitch;
    }
    showTemporaryNotification("Derp Deactivated", "#FF9800");
  }
  class Killaura {
    constructor() {
      this.range = 5;
      this.includeMobs = false;
      this.reverseKb = false;
      this.swingEnabled = true;
      this.triggerbotEnabled = true;
      this.comboEnabled = false;
    }
    tryKill() {
      if (!document.isPointerDown && !this.triggerbotEnabled) return;
      const me = n.noa.getPosition(1);
      if (!me) return;
      const list = this.includeMobs ? n.noa.entityList : n.noa.playerList;
      if (!list) return;
      if (this.comboEnabled) {
        const ev = Fuxny.noa.inputs.down['_events'];
        if (killauraComboState === 1) {
          ev.HotBarSlot1();
          killauraComboState = 2;
        } else {
          ev.HotBarSlot2();
          killauraComboState = 1;
        }
      }
      let attacked = false;
      for (const id of list) {
        if (id === 1) continue;
        const pos = n.noa.getPosition(id);
        if (!pos) continue;
        if (S.distanceBetweenSqrt(me, pos) > this.range) continue;
        const life = Fuxny.entities.getState(id, "genericLifeformState");
        if (life && !life.isAlive) continue;
        let vec;
        let finalReverseKb = this.reverseKb;
        if (autoKnockbackModule.enabled) {
          const dist = S.distanceBetweenSqrt(me, pos);
          finalReverseKb = dist > autoKnockbackModule.threshold;
        }
        if (finalReverseKb) {
          const dx = me[0] - pos[0],
            dz = me[2] - pos[2],
            len = Math.hypot(dx, dz) || 1;
          vec = S.normalizeVector([(dx / len) * 0.1, -1, (dz / len) * 0.1]);
        } else {
          vec = S.normalizeVector([pos[0] - me[0], pos[1] - me[1], pos[2] - me[2]]);
        }
        n.noa.doAttack(vec, String(id), "LegLeftMesh");
        n.noa.doAttack(vec, String(id), "LegRightMesh");
        attacked = true;
      }
      if (attacked && this.swingEnabled) {
        n.noa.getHeldItem(1)?.trySwingBlock();
        moveState.setArmsAreSwinging();
      }
    }
  }
  const killauraModule = new Killaura();
  function startKillaura() {
    if (killauraInterval) return;
    killauraInterval = setInterval(() => killauraModule.tryKill(), killauraModule.delay);
  }
  function stopKillaura() {
    clearInterval(killauraInterval);
    killauraInterval = null;
  }
  function collectTargetsInRange(range) {
    const myPos = n.noa.getPosition(1);
    if (!myPos) return [];
    const allEntityIds = new Set([...n.noa.playerList, ...n.noa.entityList]);
    const results = [];
    allEntityIds.forEach(id => {
      if (id === 1) return;
      const isPlayer = n.noa.playerList.includes(id);
      if (!magicBulletModule.includeMobs && !isPlayer) return;
      if (!isValidTarget(id)) return;
      const pos = n.noa.getPosition(id);
      if (!pos) return;
      const distance = S.distanceBetweenSqrt(myPos, pos);
      if (distance > range) return;
      results.push({
        id,
        distance
      });
    });
    return results;
  }
  function magicbulletTick() {
    if (!Fuxny.entities || !Fuxny.impKey) return;
    try {
      const heldItemContainer = r.values(Fuxny.entities[Fuxny.impKey]).find(v => v?.list?.[0]?._blockItem);
      if (!heldItemContainer) return;
      const gun = heldItemContainer.list[0]._gunItem;
      if (!gun || !gun.fireBullet) return;
      if (!_FireBullet) _FireBullet = gun.fireBullet;
      if (gun.fireBullet === _FireBullet) {
        gun.fireBullet = function(...args) {
          const original = _FireBullet.apply(this, args);
          const targets = collectTargetsInRange(200);
          if (targets.length > 0) {
            targets.sort((a, b) => a.distance - b.distance);
            original.hitResult = 0;
            original.hitEId = targets[0].id.toString();
            original.meshNodeHit = "HeadMesh";
          }
          return original;
        };
      }
    } catch (e) {}
  }
  function startMagicBullet() {
    if (magicBulletInterval) return;
    magicBulletInterval = setInterval(magicbulletTick, 500);
    magicbulletTick();
  }
  function stopMagicBullet() {
    clearInterval(magicBulletInterval);
    magicBulletInterval = null;
    try {
      const container = r.values(Fuxny.entities[Fuxny.impKey]).find(v => v?.list?.[0]?._blockItem);
      if (container && _FireBullet) container.list[0]._gunItem.fireBullet = _FireBullet;
    } catch (e) {}
  }
  const HARVEST_KEYWORDS = {
    wood: 'Axe',
    granule: 'Spade',
    rock: 'Pickaxe',
    cuttable: ['Hoe', 'Shears']
  };
  function autoToolTick() {
    if (!injectedBool) return;
    const entity = Fuxny.entities?.[Fuxny.impKey];
    if (!entity) return;
    let breakingEntity;
    for (const v of Object.values(entity)) {
      if (v?.list?.[0]?._blockItem) {
        breakingEntity = v.list[0];
        break;
      }
    }
    if (!breakingEntity?._blockItem?.breakingItem?.attemptingToBreak) return;
    const inv = playerInventoryParent?.playerInventory;
    if (!inv) return;
    const blockID = getFastTargetBlockID();
    if (!blockID) return;
    const def = Fuxny.Props?.blocksClient?.[blockID];
    const required = def && HARVEST_KEYWORDS[def.harvestType];
    if (!required) return;
    const items = inv.items;
    let bestSlot = -1,
      bestRank = -1;
    for (let i = 0; i < 9; i++) {
      const item = items[i];
      if (!item || !item.name) continue;
      let match = false;
      if (Array.isArray(required)) match = required.some(k => item.name.includes(k));
      else if (item.name.includes(required)) {
        if (required === 'Axe' && item.name.includes('Pickaxe')) match = false;
        else match = true;
      }
      if (match) {
        const rank = getMaterialRankForItem(item);
        if (rank > bestRank) {
          bestRank = rank;
          bestSlot = i;
        }
      }
    }
    if (bestSlot !== -1) {
      const currentSlot = typeof inv.selectedSlot === 'number' ? inv.selectedSlot : inv._selectedSlotI;
      if (currentSlot !== bestSlot) Fuxny.noa.inputs.down._events[`HotBarSlot${bestSlot + 1}`]();
    }
  }
  function startAutoTool() {
    if (autoToolInterval) return;
    autoToolInterval = setInterval(autoToolTick, 100);
  }
  function stopAutoTool() {
    clearInterval(autoToolInterval);
    autoToolInterval = null;
  }
  function switchToBlock() {
    if (!playerInventoryParent?.playerInventory?.items) return false;
    const items = playerInventoryParent.playerInventory.items;
    const itemsClient = Fuxny.Props?.itemsClient;
    for (let i = 0; i < 9; i++) {
      const item = items[i];
      if (item && item.name) {
        const itemDef = itemsClient?.[item.name];
        if (itemDef && (itemDef.type === "CubeBlock" || itemDef.heldType === "CubeBlock")) {
          Fuxny.noa.inputs.down._events[`HotBarSlot${i + 1}`]();
          return true;
        }
      }
    }
    return false;
  }
  function performSurround(targetId, thickness) {
    try {
      if (!playerEntity) return;
      let pos;
      if (targetId === 1) pos = n.noa.getPosition(1);
      else {
        if (!lastClosestId || !Fuxny.entities.getState(lastClosestId, "genericLifeformState")?.isAlive) return;
        pos = n.noa.getPosition(lastClosestId);
      }
      if (!pos) return;
      const pX = pos[0],
        pY = pos[1],
        pZ = pos[2],
        footY = Math.floor(pY);
      const radius = 1.5 + thickness,
        radiusSq = radius * radius,
        range = Math.ceil(radius);
      const candidates = [];
      for (let y = Math.floor(pY - 1); y <= Math.ceil(pY + 2); y++) {
        for (let x = Math.floor(pX - range); x <= Math.ceil(pX + range); x++) {
          for (let z = Math.floor(pZ - range); z <= Math.ceil(pZ + range); z++) {
            const bx = x + 0.5,
              by = y + 0.5,
              bz = z + 0.5;
            const distSq = (bx - pX) ** 2 + (by - pY) ** 2 + (bz - pZ) ** 2;
            if (distSq > radiusSq) continue;
            const hDistSq = (bx - pX) ** 2 + (bz - pZ) ** 2;
            if ((y === footY || y === footY + 1) && hDistSq < 0.64) continue;
            candidates.push({
              x,
              y,
              z,
              hDistSq
            });
          }
        }
      }
      candidates.sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.hDistSq - b.hDistSq;
      });
      const validCandidates = candidates.filter(b => I.getBlockID(b.x, b.y, b.z) === 0);
      if (validCandidates.length > 0) {
        if (playerEntity.heldItemState?.heldType !== "CubeBlock") {
          if (!switchToBlock()) return;
        }
        for (const b of validCandidates) {
          wangPlace([b.x, b.y, b.z]);
        }
      }
      Fuxny.noa.inputs.down['_events'].HotBarSlot1();
    } catch (e) {}
  }
  function startTrapSelf() {
    if (trapSelfInterval) return;
    performSurround(1, trapSettings.selfThickness);
    trapSelfInterval = setInterval(() => performSurround(1, trapSettings.selfThickness), 100);
    showTemporaryNotification(`Trap Self Activated`, "#4CAF50");
  }
  function stopTrapSelf() {
    if (!trapSelfInterval) return;
    clearInterval(trapSelfInterval);
    trapSelfInterval = null;
    showTemporaryNotification(`Trap Self Deactivated`, "#FF9800");
  }
  function startTrapEnemy() {
    if (trapEnemyInterval) return;
    performSurround(lastClosestId, trapSettings.enemyThickness);
    trapEnemyInterval = setInterval(() => performSurround(lastClosestId, trapSettings.enemyThickness), 100);
    showTemporaryNotification(`Trap Enemy Activated`, "#4CAF50");
  }
  function stopTrapEnemy() {
    if (!trapEnemyInterval) return;
    clearInterval(trapEnemyInterval);
    trapEnemyInterval = null;
    showTemporaryNotification(`Trap Enemy Deactivated`, "#FF9800");
  }
  function isTargetPotion(item) {
    if (!item || !item.name) return false;
    const n = item.name.toLowerCase();
    return (n.includes("heal") || n.includes("shield")) && n.includes("splash") && n.includes("potion");
  }
  let isPotionActionRunning = false;
  let lastInventorySwapTime = 0;
  async function autoPotionTick() {
    if (!injectedBool || !playerInventoryParent || isPotionActionRunning) return;
    if (!playerInventoryParent.playerInventory) {
      getFreshInventory();
      return;
    }
    const inv = playerInventoryParent.playerInventory;
    const items = inv.items;
    const targetSlot = autoPotionModule.targetSlot;
    const itemInTarget = items[targetSlot];
    if (!isTargetPotion(itemInTarget)) {
      let foundIndex = -1;
      for (let i = 0; i < items.length; i++) {
        if (i === targetSlot) continue;
        if (isTargetPotion(items[i])) {
          foundIndex = i;
          break;
        }
      }
      if (foundIndex !== -1) {
        playerInventoryParent.swapPosClient(foundIndex, targetSlot);
        lastInventorySwapTime = Date.now();
      }
      return;
    }
    if (Date.now() - lastInventorySwapTime < 200) return;
    if (!autoPotionModule.autoThrow) return;
    if (Date.now() - lastPotionTime < autoPotionModule.cooldown) return;
    const hp = getPlayerHealth();
    if (hp > autoPotionModule.healthThreshold) return;
    isPotionActionRunning = true;
    const originalPitch = Fuxny.camera.pitch;
    const originalHeading = Fuxny.camera.heading;
    try {
      Fuxny.noa.inputs.down._events[`HotBarSlot${targetSlot + 1}`]();
      await sleep(30);
      if (Math.abs(Fuxny.camera.pitch - autoPotionModule.pitch) > 0.1) {
        Fuxny.camera.pitch = autoPotionModule.pitch;
        Fuxny.camera.heading = originalHeading + 0.001;
        await sleep(35);
      }
      const e = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      if (e) {
        const opts = {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 2,
          buttons: 2
        };
        e.dispatchEvent(new MouseEvent("mousedown", opts));
        e.dispatchEvent(new MouseEvent("mouseup", opts));
      }
      lastPotionTime = Date.now();
      await sleep(70);
    } catch (e) {} finally {
      if (Fuxny.camera) {
        Fuxny.camera.pitch = originalPitch;
        Fuxny.camera.heading = originalHeading;
      }
      isPotionActionRunning = false;
    }
  }
  function startAutoPotion() {
    if (autoPotionInterval) return;
    autoPotionInterval = setInterval(autoPotionTick, 100);
    showTemporaryNotification("Auto Potion Activated", "#4CAF50");
  }
  function stopAutoPotion() {
    clearInterval(autoPotionInterval);
    autoPotionInterval = null;
    isPotionActionRunning = false;
  }
  function getFreshInventory() {
    try {
      let ent = null;
      if (Fuxny.impKey && Fuxny.entities[Fuxny.impKey]) ent = Fuxny.entities[Fuxny.impKey];
      else if (Fuxny.entities['1']) ent = Fuxny.entities['1'];
      else if (Fuxny.entities[1]) ent = Fuxny.entities[1];
      if (!ent) return null;
      let invComp = ent.inventory;
      if (!invComp) {
        invComp = Object.values(ent).find(v => v && v.list && v.list[0] && v.list[0].opWrapper);
      }
      if (invComp && invComp.list && invComp.list[0] && invComp.list[0].opWrapper) {
        playerInventoryParent = invComp.list[0].opWrapper;
        return playerInventoryParent.playerInventory;
      }
    } catch (e) {}
    return null;
  }
  let triggerBotInterval = null;
  function triggerBotTick() {
    if (!playerEntity?.tryHitEntity) return;
    try {
      const hitResult = playerEntity.tryHitEntity();
      if (!hitResult || hitResult.hitEId == null) return;
      const targetId = hitResult.hitEId;
      const life = Fuxny.entities.getState(targetId, "genericLifeformState");
      if (life && !life.isAlive) return;
      const h = Fuxny.camera.heading,
        p = Fuxny.camera.pitch;
      const vec = [Math.sin(h) * Math.cos(p), Math.sin(p), Math.cos(h) * Math.cos(p)];
      n.noa.doAttack(vec, String(targetId), "BodyMesh");
      n.noa.getHeldItem(1)?.trySwingBlock();
      moveState.setArmsAreSwinging();
    } catch (e) {}
  }
  function startTriggerBot() {
    if (triggerBotInterval) return;
    triggerBotInterval = setInterval(triggerBotTick, 50);
  }
  function stopTriggerBot() {
    clearInterval(triggerBotInterval);
    triggerBotInterval = null;
  }
  let fastBreakInterval = null,
    originalHardness = {};
  function startFastBreak() {
    if (fastBreakInterval) return;
    const gunMod = C.findModule("Gun:class");
    if (!gunMod) return;
    const blocks = Object.values(Object.values(gunMod).find(v => typeof v === "object"));
    if (Object.keys(originalHardness).length === 0) {
      blocks.forEach((b, i) => {
        if (b && b.ttb) originalHardness[i] = b.ttb;
      });
    }
    fastBreakInterval = setInterval(() => {
      blocks.forEach((b, i) => {
        if (b && b.ttb && originalHardness[i]) b.ttb = originalHardness[i] / 2;
      });
    }, 500);
  }
  function stopFastBreak() {
    clearInterval(fastBreakInterval);
    fastBreakInterval = null;
  }
  let bhopAnimationId = null,
    isBhopEnabled = false,
    didJumpLastFrame = false;
  function bunnyHop() {
    if (!physState.isOnGround?.() || moveState.crouching || moveState.speed <= 0.05) return;
    const entity = Fuxny.entities?.[Fuxny.impKey];
    const inputComp = entity?.receivesInputs || entity?.receicesInputs;
    const isTouchMode = inputComp?.hash?.[myId]?.isTouchscreen;
    if (isTouchMode) moveState.jumping = true;
    else if (Fuxny.noa?.inputs?.state) Fuxny.noa.inputs.state["jump"] = true;
    physState._hadJumpInputPrevTick = false;
    didJumpLastFrame = true;
  }
  function bhopLoop() {
    if (!isBhopEnabled) {
      bhopAnimationId = null;
      return;
    }
    if (didJumpLastFrame) {
      moveState.jumping = false;
      if (Fuxny.noa?.inputs?.state) Fuxny.noa.inputs.state["jump"] = false;
      didJumpLastFrame = false;
    }
    bunnyHop();
    bhopAnimationId = requestAnimationFrame(bhopLoop);
  }
  function startBhop() {
    if (isBhopEnabled) return;
    isBhopEnabled = true;
    if (!bhopAnimationId) bhopAnimationId = requestAnimationFrame(bhopLoop);
  }
  function stopBhop() {
    isBhopEnabled = false;
    if (didJumpLastFrame) {
      moveState.jumping = false;
      if (Fuxny.noa?.inputs?.state) Fuxny.noa.inputs.state["jump"] = false;
      didJumpLastFrame = false;
    }
    cancelAnimationFrame(bhopAnimationId);
    bhopAnimationId = null;
  }
  class Aimbot {
    constructor() {
      this.smoothing = 0.5;
      this.intervalMs = 5;
      this.maxTargetDistance = 8;
    }
    angleDiff(a, b) {
      let d = a - b;
      if (d > Math.PI) d -= Math.PI * 2;
      else if (d < -Math.PI) d += Math.PI * 2;
      return d;
    }
    aimTick() {
      try {
        const myPos = n.noa.getPosition(1);
        const cam = Fuxny.camera;
        const list = n.noa.playerList;
        if (!myPos || !cam || !list) return;
        let bestId = null,
          bestDist = Infinity,
          bestH = 0,
          bestP = 0;
        const myEye = [myPos[0], myPos[1] + 1.6, myPos[2]];
        for (const id of list) {
          if (id === 1) continue;
          const ePos = n.noa.getPosition(id);
          if (!ePos) continue;
          const state = Fuxny.entities.getState(id, "genericLifeformState");
          if (!state?.isAlive) continue;
          const dist = S.distanceBetweenSqrt(myPos, ePos);
          if (dist > this.maxTargetDistance || dist >= bestDist) continue;
          const targetHead = [ePos[0], ePos[1] + 1.5, ePos[2]];
          const dx = targetHead[0] - myEye[0],
            dy = targetHead[1] - myEye[1],
            dz = targetHead[2] - myEye[2];
          const ax = Math.abs(dx) >= 0.5,
            ay = Math.abs(dy) >= 0.5,
            az = Math.abs(dz) >= 0.5;
          let h = cam.heading,
            p = cam.pitch;
          if (ax || az) h = Math.atan2(ax ? dx : 0, az ? dz : 0);
          if (ay) {
            const vd = Math.sqrt((ax ? dx * dx : 0) + dy * dy + (az ? dz * dz : 0));
            if (vd > 1e-4) p = -Math.asin(dy / vd);
          }
          bestId = id;
          bestDist = dist;
          bestH = h;
          bestP = p;
        }
        if (!bestId) return;
        cam.heading += this.angleDiff(bestH, cam.heading) * this.smoothing;
        cam.pitch += this.angleDiff(bestP, cam.pitch) * this.smoothing;
      } catch (e) {
        stopAimbot();
      }
    }
  }
  const aimbotModule = new Aimbot();
  function startAimbot() {
    if (!aimbotInterval) aimbotInterval = setInterval(() => aimbotModule.aimTick(), aimbotModule.intervalMs);
  }
  function stopAimbot() {
    clearInterval(aimbotInterval);
    aimbotInterval = null;
  }
  function setNight(enabled) {
    if (skyboxMesh) skyboxMesh.isVisible = !enabled;
  }
  function wangPlace(position) {
    let heldBlock = r.values(Fuxny.noa.entities[Fuxny.impKey]).find(value => value?.list?.[0]?._blockItem).list[0]._blockItem;
    let worldInstanceKey = Object.keys(heldBlock)[0],
      worldInstance = Object.values(heldBlock)[0],
      targetedBlockKey = Object.keys(worldInstance)[25],
      targetedBlock = worldInstance[targetedBlockKey];
    function spoofTargetedBlock(position) {
      return new Proxy({}, {
        get(target, prop) {
          if (prop === worldInstanceKey) {
            return new Proxy(worldInstance, {
              get(inner, key) {
                if (key === targetedBlockKey) {
                  let spoofed = structuredClone(targetedBlock) || {};
                  spoofed.position = position;
                  return spoofed;
                }
                return worldInstance[key];
              },
            });
          }
          if (prop == "checkTargetedBlockCanBePlacedOver") return () => true;
          if (typeof heldBlock[prop] == "function") return heldBlock[prop].bind(heldBlock);
          return heldBlock[prop];
        },
      });
    }
    heldBlock.placeBlock.call(spoofTargetedBlock(position));
  }
  let safescaffoldIntervalId = null,
    isBuildingBridge = false;
  const MAX_BUILD_RANGE = 7.0,
    MAX_PATH_LENGTH = 10;
  const SCAN_OFFSETS = (function() {
    const offsets = [],
      MAX_RADIUS = 7;
    for (let x = -MAX_RADIUS; x <= MAX_RADIUS; x++) {
      for (let y = -MAX_RADIUS; y <= MAX_RADIUS; y++) {
        for (let z = -MAX_RADIUS; z <= MAX_RADIUS; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          offsets.push({
            x,
            y,
            z,
            dist: x * x + y * y + z * z
          });
        }
      }
    }
    offsets.sort((a, b) => a.dist - b.dist);
    return offsets;
  })();
  function findClosestNonAirBlock(startPos) {
    const startX = Math.floor(startPos[0]);
    const startY = Math.floor(startPos[1]);
    const startZ = Math.floor(startPos[2]);

    // SCAN_OFFSETS（あらかじめ計算された距離順のリスト）を走査
    // I.getBlockID ではなく getFastRawBlock を使うことで爆速化
    for (const offset of SCAN_OFFSETS) {
        if (offset.dist > 64) break; // 半径8マス以上は重くなるので制限
        const checkX = startX + offset.x;
        const checkY = startY + offset.y;
        const checkZ = startZ + offset.z;
        
        if (getFastRawBlock(checkX, checkY, checkZ) !== 0) {
            return [checkX, checkY, checkZ];
        }
    }
    return null;
}
  function calculateBresenhamPath2D(x0, z0, x1, z1, y) {
    const path = [];
    const dx = Math.abs(x1 - x0),
      dz = Math.abs(z1 - z0),
      sx = (x0 < x1) ? 1 : -1,
      sz = (z0 < z1) ? 1 : -1;
    let currentX = x0,
      currentZ = z0,
      err = dx - dz;
    while (true) {
      path.push([currentX, y, currentZ]);
      if (currentX === x1 && currentZ === z1) break;
      const e2 = 2 * err;
      if (e2 > -dz) {
        err -= dz;
        currentX += sx;
      } else {
        err += dx;
        currentZ += sz;
      }
    }
    return path;
  }
function calculateVerticalThenDiagonalPath(startPos, endPos) {
        const startPath = [];
        let [currentX, currentY, currentZ] = startPos.map(Math.floor);
        const [targetX, targetY, targetZ] = endPos.map(Math.floor);
        startPath.push([currentX, currentY, currentZ]);
        while (currentY !== targetY) {
            currentY += Math.sign(targetY - currentY);
            startPath.push([currentX, currentY, currentZ]);
        }
        const bridgePath = calculateBresenhamPath2D(currentX, currentZ, targetX, targetZ, currentY);
        bridgePath.shift();
        return startPath.concat(bridgePath);
    }
  async function buildBridge(path) {
    if (isBuildingBridge) return;
    isBuildingBridge = true;
    const buildTimeout = setTimeout(() => {
      isBuildingBridge = false;
    }, 200);
    const checkPlace = (x, y, z) => (playerEntity.checkTargetedBlockCanBePlacedOver([x, y, z]) || r.values(Fuxny.world)[47].call(Fuxny.world, x, y, z) === 0);
    for (const placePos of path) {
      if (!isBuildingBridge) break;
      const playerPos = Fuxny.entities.getState(1, 'position')?.position;
      if (!playerPos) break;
      const distance = S.distanceBetweenSqrt(playerPos, placePos);
      if (distance <= MAX_BUILD_RANGE) {
        if (checkPlace(placePos[0], placePos[1], placePos[2])) wangPlace(placePos);
      }
    }
    clearTimeout(buildTimeout);
    isBuildingBridge = false;
  }
  function startSafeScaffold() {
    if (safescaffoldIntervalId) return;
    safescaffoldIntervalId = setInterval(() => {
      if (isBuildingBridge || !Fuxny.entities.getState(1, 'position') || !playerEntity || playerEntity.heldItemState.heldType !== "CubeBlock") return;
      const myPos = Fuxny.entities.getState(1, 'position')?.position;
      if (!myPos) return;
      const myFootPos = [Math.floor(myPos[0]), Math.floor(myPos[1] - 1), Math.floor(myPos[2])];
      if (I.getBlockID(myFootPos[0], myFootPos[1], myFootPos[2]) !== 0) return;
      const closestBlock = findClosestNonAirBlock(myFootPos);
      if (closestBlock) {
        const path = calculateVerticalThenDiagonalPath(closestBlock, myFootPos);
        if (path && path.length > 1 && path.length < MAX_PATH_LENGTH) buildBridge(path);
      }
    }, 5);
  }
  function stopSafeScaffold() {
    clearInterval(safescaffoldIntervalId);
    safescaffoldIntervalId = null;
    isBuildingBridge = false;
  }
  let scaffoldYLockIntervalId = null,
    isBuildingBridgeForYLock = false,
    lockedY = null,
    lastBlockPlacedTime = 0,
    lockTimeoutId = null;
  async function buildBridgeForYLock(path, targetFootPos) {
    if (isBuildingBridgeForYLock) return;
    isBuildingBridgeForYLock = true;
    const buildTimeout = setTimeout(() => {
      isBuildingBridgeForYLock = false;
    }, 200);
    const checkPlace = (x, y, z) => (playerEntity.checkTargetedBlockCanBePlacedOver([x, y, z]) || r.values(Fuxny.world)[47].call(Fuxny.world, x, y, z) === 0);
    for (const placePos of path) {
      if (!isBuildingBridgeForYLock) break;
      const playerPos = Fuxny.entities.getState(1, 'position')?.position;
      if (!playerPos) break;
      const distance = S.distanceBetweenSqrt(playerPos, placePos);
      if (distance <= MAX_BUILD_RANGE && checkPlace(placePos[0], placePos[1], placePos[2])) {
        wangPlace(placePos);
        lastBlockPlacedTime = Date.now();
        if (lockTimeoutId) clearTimeout(lockTimeoutId);
        lockTimeoutId = setTimeout(() => {
          if (Date.now() - lastBlockPlacedTime >= 500) {
            lockedY = null;
            showTemporaryNotification("Y-Lock Released", "#FF9800");
          }
        }, 500);
      }
    }
    if (lockedY === null) {
      lockedY = targetFootPos[1];
      showTemporaryNotification(`Y-Lock Acquired: ${lockedY}`, "#4CAF50");
    }
    clearTimeout(buildTimeout);
    isBuildingBridgeForYLock = false;
  }
  function startScaffoldYLock() {
    if (scaffoldYLockIntervalId) return;
    scaffoldYLockIntervalId = setInterval(() => {
      if (isBuildingBridgeForYLock || !Fuxny.entities.getState(1, 'position') || !playerEntity || playerEntity.heldItemState.heldType !== "CubeBlock") return;
      const myPos = Fuxny.entities.getState(1, 'position')?.position;
      if (!myPos) return;
      let targetFootPos, currentFootY = Math.floor(myPos[1] - 1);
      if (lockedY !== null) targetFootPos = [Math.floor(myPos[0]), lockedY, Math.floor(myPos[2])];
      else targetFootPos = [Math.floor(myPos[0]), currentFootY, Math.floor(myPos[2])];
      if (I.getBlockID(targetFootPos[0], targetFootPos[1], targetFootPos[2]) !== 0) return;
      const scanStartPos = [Math.floor(myPos[0]), currentFootY, Math.floor(myPos[2])];
      const closestBlock = findClosestNonAirBlock(scanStartPos);
      if (closestBlock) {
        const path = calculateVerticalThenDiagonalPath(closestBlock, targetFootPos);
        if (path && path.length > 1 && path.length < MAX_PATH_LENGTH) buildBridgeForYLock(path, targetFootPos);
      }
    }, 5);
  }
  function stopScaffoldYLock() {
    clearInterval(scaffoldYLockIntervalId);
    scaffoldYLockIntervalId = null;
    isBuildingBridgeForYLock = false;
    lockedY = null;
    if (lockTimeoutId) {
      clearTimeout(lockTimeoutId);
      lockTimeoutId = null;
    }
  }
  function startTargetFinder() {
    if (targetFinderId) clearInterval(targetFinderId);
    targetFinderId = setInterval(() => {
      if (!injectedBool || !Fuxny.entities) return;
      if (!Fuxny.entities.getState(myId, "genericLifeformState")?.isAlive) {
        lastClosestId = null;
        return;
      }
      const myPos = Fuxny.entities.getState(myId, 'position')?.position;
      if (!myPos) return;
      const playerIds = n.noa.playerList;
      if (!playerIds) return;
      let closestId = null,
        minDist = 100;
      for (const playerId of playerIds) {
        const pos = Fuxny.entities.getState(playerId, 'position')?.position;
        if (!pos) continue;
        const state = Fuxny.entities.getState(playerId, "genericLifeformState");
        if (!state || !state.isAlive) continue;
        const dist = S.distanceBetween(myPos, pos);
        if (dist < minDist) {
          minDist = dist;
          closestId = playerId;
        }
      }
      lastClosestId = closestId;
      targetEntityDistance = minDist;
    }, 20);
  }
  function fightBotTick() {
    const myPos = n.noa.getPosition(1);
    if (!myPos) return;
    const keys = Fuxny.noa.inputs.state;
    const target = n.noa.playerList.reduce((best, id) => {
      const pos = n.noa.getPosition(id);
      if (id === 1 || !pos || !Fuxny.entities.getState(id, "genericLifeformState")?.isAlive) return best;
      const dist = S.distanceBetweenSqrt(myPos, pos);
      return (dist < best.dist && dist <= fightBotModule.radius * 2) ? {
        id,
        pos,
        dist
      } : best;
    }, {
      dist: Infinity
    });
    if (!target.id) return stopMovement();
    const [dx, dy, dz] = [target.pos[0] - myPos[0], target.pos[1] - myPos[1], target.pos[2] - myPos[2]];
    if (Fuxny.camera) {
      Fuxny.camera.heading = Math.atan2(dx, dz);
      Fuxny.camera.pitch = -Math.asin(dy / target.dist);
    }
    let attackVec;
    let isPulling = false;
    if (autoKnockbackModule.enabled) {
      isPulling = target.dist > autoKnockbackModule.threshold;
    }
    if (isPulling) {
      const pullLen = Math.hypot(dx, dz) || 1;
      attackVec = S.normalizeVector([(-dx / pullLen) * 0.1, -1, (-dz / pullLen) * 0.1]);
    } else {
      attackVec = S.normalizeVector([dx, dy + 1.0, dz]);
    }
    n.noa.doAttack(attackVec, target.id.toString(), "BodyMesh");
    n.noa.getHeldItem(1)?.trySwingBlock?.();
    moveState.setArmsAreSwinging?.();
    keys.jump = fightBotModule.didJumpLastTick = !fightBotModule.didJumpLastTick && physState?.isOnGround?.() && !moveState.crouching;
    const now = Date.now();
    if (fightBotModule.isStrafing && now > fightBotModule.strafeEndTime) {
      fightBotModule.isStrafing = keys.left = keys.right = false;
      fightBotModule.nextStrafeTime = now + Math.random() * 200 + 700;
    } else if (!fightBotModule.isStrafing && now > fightBotModule.nextStrafeTime) {
      fightBotModule.isStrafing = true;
      keys[fightBotModule.strafeDirection = Math.random() < 0.5 ? 'left' : 'right'] = true;
      fightBotModule.strafeEndTime = now + Math.random() * 6000 + 1500;
    }
    const moveDir = target.dist > fightBotModule.desiredDistance + 0.1 ? 1 : (target.dist < fightBotModule.desiredDistance - 0.1 ? -1 : 0);
    keys.forward = moveDir === 1;
    keys.backward = moveDir === -1;
    Fuxny.noa.playerdata.walkingSpeed = moveDir ? 7 : 4;
  }
  function stopMovement() {
    const keys = Fuxny.noa.inputs.state;
    ["forward", "backward", "left", "right", "jump"].forEach(k => keys[k] = false);
    if (Fuxny.noa.playerdata) Fuxny.noa.playerdata.walkingSpeed = 4;
    fightBotModule.isStrafing = fightBotModule.didJumpLastTick = false;
  }
  function startFightBot() {
    if (!fightBotIntervalId) fightBotIntervalId = setInterval(fightBotTick, 5);
  }
  function stopFightBot() {
    if (fightBotIntervalId) {
      clearInterval(fightBotIntervalId);
      fightBotIntervalId = null;
      stopMovement();
    }
  }
  function clearESPBoxes() {
    for (const key in chestBoxes) {
      for (const {
          mesh,
          id
        }
        of chestBoxes[key]) {
        mesh.dispose();
        Fuxny.entities.deleteEntity(id);
      }
    }
    scannedChunks.clear();
    chestBoxes = {};
  }
  function reverseIndex(i, stride) {
    const x = Math.floor(i / stride[0]),
      remX = i % stride[0],
      y = Math.floor(remX / stride[1]),
      z = remX % stride[1];
    return [x, y, z];
  }
  function getChunkKey(chunk) {
    const [wx, wy, wz] = chunk.pos || [0, 0, 0], cx = Math.floor(wx / 32), cy = Math.floor(wy / 32), cz = Math.floor(wz / 32);
    return `${cx}|${cy}|${cz}|overworld`;
  }
  function scanChunk(chunk, blockIDsToScan) {
    const blockData = chunk[chunkDataField];
    if (!blockData) return;
    const {
      data,
      stride
    } = blockData, pos = chunk.pos || [0, 0, 0];
    if (!data || !stride) return;
    const chunkKey = getChunkKey(chunk);
    for (let i = 0; i < data.length; i++) {
      const blockID = data[i];
      if (!blockIDsToScan.includes(blockID)) continue;
      let wireframeColor;
      if ([204, 205, 206, 207].includes(blockID)) wireframeColor = new Fuxny.Lion.Color3(1, 0.5, 0);
      else if (blockID === 45) wireframeColor = new Fuxny.Lion.Color3(0, 1, 1);
      else if (blockID === 50) wireframeColor = new Fuxny.Lion.Color3(1, 1, 0);
      else if (blockID === 465) wireframeColor = new Fuxny.Lion.Color3(0.7, 0.5, 1);
      else wireframeColor = new Fuxny.Lion.Color3(0.75, 0.75, 0.75);
      const [x, y, z] = reverseIndex(i, stride);
      const worldX = pos[0] + x + 0.5,
        worldY = pos[1] + y + 0.5,
        worldZ = pos[2] + z + 0.5;
      const mesh = Fuxny.Lion.Mesh.CreateBox("espbox", 1.0, Fuxny.Lion.scene);
      mesh.position.set(worldX, worldY, worldZ);
      mesh.renderingGroupId = 1;
      mesh.material = new Fuxny.Lion.StandardMaterial("mat", Fuxny.Lion.scene);
      mesh.material.wireframe = true;
      mesh.material.emissiveColor = wireframeColor;
      const id = Fuxny.entities.add([worldX, worldY, worldZ], 1, 1, mesh, null, false);
      if (!chestBoxes[chunkKey]) chestBoxes[chunkKey] = [];
      chestBoxes[chunkKey].push({
        mesh,
        id
      });
    }
  }
  function autoDetectChunkDataField(chunk) {
    for (const key of Object.keys(chunk)) {
      const val = chunk[key];
      if (val && typeof val === "object" && Array.isArray(val.stride) && val.stride.length === 3 && (Array.isArray(val.data) || ArrayBuffer.isView(val.data))) return key;
    }
    return null;
  }
  function scanAllChunks() {
    if (!Fuxny?.world || !Fuxny?.world?.[Fuxny.impKey]?.hash) return;
    const chunkHash = Fuxny.world[Fuxny.impKey].hash;
    for (const scannedKey of scannedChunks) {
      if (!(scannedKey in chestBoxes)) continue;
      if (!Object.values(chunkHash).some(chunk => getChunkKey(chunk) === scannedKey)) {
        for (const {
            mesh,
            id
          }
          of chestBoxes[scannedKey]) {
          mesh.dispose();
          Fuxny.entities.deleteEntity(id);
        }
        delete chestBoxes[scannedKey];
        scannedChunks.delete(scannedKey);
      }
    }
    const blockIDsToScan = [];
    if (chestESPEnabled) blockIDsToScan.push(...[204, 205, 206, 207]);
    if (oreESPEnabled) blockIDsToScan.push(...[44, 45, 465, 50]);
    if (blockIDsToScan.length === 0) return;
    for (const chunkKey in chunkHash) {
      const chunk = chunkHash[chunkKey];
      if (!chunkDataField) chunkDataField = autoDetectChunkDataField(chunk);
      if (!chunkDataField || !chunk[chunkDataField]?.data || !chunk.pos) continue;
      const key = getChunkKey(chunk);
      if (scannedChunks.has(key)) continue;
      scannedChunks.add(key);
      scanChunk(chunk, blockIDsToScan);
    }
  }
  function updateEspInterval() {
    const anyEspEnabled = chestESPEnabled || oreESPEnabled;
    if (anyEspEnabled && !chestOreInterval) {
      chestOreInterval = setInterval(scanAllChunks, 3000);
    } else if (!anyEspEnabled && chestOreInterval) {
      clearInterval(chestOreInterval);
      chestOreInterval = null;
      clearESPBoxes();
    }
  }
  function setChestESP(enabled) {
    chestESPEnabled = enabled;
    updateEspInterval();
    if (enabled) {
      scanAllChunks();
    } else if (!oreESPEnabled) {
      clearESPBoxes();
    }
  }
  function setOreESP(enabled) {
    oreESPEnabled = enabled;
    updateEspInterval();
    if (enabled) {
      scanAllChunks();
    } else if (!chestESPEnabled) {
      clearESPBoxes();
    }
  }
  function moveItem(itemName, desiredSlot) {
    if (!playerInventoryParent || !playerInventoryParent.playerInventory?.items) return false;
    const items = playerInventoryParent.playerInventory.items;
    let oldSlot = null;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || typeof item.name !== 'string') continue;
      if (item.name.toLowerCase().includes(itemName)) {
        oldSlot = i;
        break;
      }
    }
    if (oldSlot === null) return false;
    playerInventoryParent.swapPosClient(oldSlot, desiredSlot, null);
    return true;
  }
  // --- ここから追加 ---
  function getFastRawBlock(wx, wy, wz) {
    // chunkDataField は ESP や Minimap の実行時に自動検出される想定
    if (!chunkDataField || !Fuxny.world[Fuxny.impKey]) return I.getBlockID(wx, wy, wz);
    
    const cx = Math.floor(wx / 32), cy = Math.floor(wy / 32), cz = Math.floor(wz / 32);
    const key = `${cx}|${cy}|${cz}|overworld`;
    const chunk = Fuxny.world[Fuxny.impKey].hash[key];
    
    if (!chunk || !chunk[chunkDataField]) return 0;

    const blockData = chunk[chunkDataField];
    const ox = Math.floor(wx - chunk.pos[0]);
    const oy = Math.floor(wy - chunk.pos[1]);
    const oz = Math.floor(wz - chunk.pos[2]);
    
    const idx = ox * blockData.stride[0] + oy * blockData.stride[1] + oz;
    return blockData.data[idx] || 0;
}

const entityLastPos = new Map();

// --- 3. 敵の前回座標との差分から速度を計算して予測 ---
function getPredictedEnemyPos(id) {
    try {
        const currentPos = n.noa.getPosition(id);
        const now = performance.now();
        const lastData = entityLastPos.get(id);
        
        // 初回、または時間が空きすぎている（1秒以上）場合は現在の座標を返す
        if (!lastData || (now - lastData.time) > 1000) {
            entityLastPos.set(id, { pos: [...currentPos], time: now });
            return [...currentPos];
        }

        const dt = (now - lastData.time) / 1000; // 秒換算
        if (dt <= 0) return [...currentPos];

        // 差分から速度(B/s)を算出
        const vel = [
            (currentPos[0] - lastData.pos[0]) / dt,
            (currentPos[1] - lastData.pos[1]) / dt,
            (currentPos[2] - lastData.pos[2]) / dt
        ];

        // 現在のデータを更新
        entityLastPos.set(id, { pos: [...currentPos], time: now });

        // 予測位置 = 現在地 + 速度 * LeadTime
        return [
            currentPos[0] + vel[0] * autoSWModule.leadTime,
            currentPos[1] + vel[1] * autoSWModule.leadTime,
            currentPos[2] + vel[2] * autoSWModule.leadTime
        ];
    } catch (e) { return n.noa.getPosition(id); }
}

// --- 4. 改良版 AutoSW メインロジック ---
const autoSWModule = {
    interval: 50,
    leadTime: 0.21, // ネットワーク環境に合わせて 0.1 ~ 0.2 で調整
    size: 1
};

async function executeAutoSW() {
    if (!lastClosestId || targetEntityDistance > 81 || !injectedBool) return;

    // A. 予測位置の算出
    const predPos = getPredictedEnemyPos(lastClosestId);
    const targetBlock = [
        Math.floor(predPos[0]), 
        Math.floor(predPos[1]), 
        Math.floor(predPos[2])
    ];

    try {
        // 2. 【重要】まず最初にネット（クモの巣）をインベントリから探して手に持つ
        // これを buildFoundation より先にやることで、支柱がすべてネットになります
        if (!(moveItem("net", webSlot) || moveItem("web", webSlot))) {
            return; // ネットを持っていない場合は中止
        }
        Fuxny.noa.inputs.down['_events'][`HotBarSlot${webSlot + 1}`]();

        // 3. 支柱（土台）構築ロジック
        const buildFoundationWithNet = () => {
            // 周囲にすでにブロックがあるかチェック
            const neighbors = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
            if (neighbors.some(n => getFastRawBlock(targetBlock[0]+n[0], targetBlock[1]+n[1], targetBlock[2]+n[2]) !== 0)) {
                return true;
            }

            // 地面を探す
            const anchor = findClosestNonAirBlock(targetBlock);
            if (!anchor) return false;

            // パス計算
            const path = calculateVerticalThenDiagonalPath(anchor, targetBlock);
            if (path.length > 8) return false;

            // 【変更点】switchToBlock を通さず、今持っている「ネット」でパスを埋める
            for (let i = 0; i < path.length; i++) {
                wangPlace(path[i]); // これで支柱がすべてネットになる
            }
            return true;
        };

        // 土台（ネットの柱）を構築
        if (!buildFoundationWithNet()) return;

        // 5. 配置の実行 (下の段から順に、一瞬で)
        const size = autoSWModule.size || 1;
        const half = Math.floor(size / 2);

        // アイテムの所持確認
        const hasWeb = moveItem("net", webSlot) || moveItem("web", webSlot);
        const hasSpikes = moveItem("spikes", spikeSlot);

        // A. 下段 (足元): ネット
        if (hasWeb) {
            Fuxny.noa.inputs.down['_events'][`HotBarSlot${webSlot + 1}`]();
            for (let dx = -half; dx <= half; dx++) {
                for (let dz = -half; dz <= half; dz++) {
                    wangPlace([targetBlock[0] + dx, targetBlock[1], targetBlock[2] + dz]);
                }
            }
        }

        // B. 中段 (胴体): スパイク
        if (hasSpikes) {
            Fuxny.noa.inputs.down['_events'][`HotBarSlot${spikeSlot + 1}`]();
            for (let dx = -half; dx <= half; dx++) {
                for (let dz = -half; dz <= half; dz++) {
                    wangPlace([targetBlock[0] + dx, targetBlock[1] + 1, targetBlock[2] + dz]);
                }
            }
        }

        // C. 上段 (頭上): ネット (Size > 1 の場合のみ)
        if (hasWeb && size > 1) {
            Fuxny.noa.inputs.down['_events'][`HotBarSlot${webSlot + 1}`]();
            for (let dx = -half; dx <= half; dx++) {
                for (let dz = -half; dz <= half; dz++) {
                    wangPlace([targetBlock[0] + dx, targetBlock[1] + 2, targetBlock[2] + dz]);
                }
            }
        }

    } catch (e) {
    } finally {
        // 即座に武器（スロット1）に戻る
        Fuxny.noa.inputs.down['_events'].HotBarSlot1();
    }
}
  function startAutoSW() {
    if (autoSWIntervalId) return;
    executeAutoSW();
    autoSWIntervalId = setInterval(executeAutoSW, autoSWModule.interval);
    showTemporaryNotification("AutoSW Activated (Holding)", "#4CAF50");
  }
  function stopAutoSW() {
    if (!autoSWIntervalId) return;
    clearInterval(autoSWIntervalId);
    autoSWIntervalId = null;
    showTemporaryNotification("AutoSW Deactivated", "#FF9800");
  }
  const materialRank = {
    "Wood": 0,
    "Stone": 1,
    "Iron": 2,
    "Gold": 3,
    "Diamond": 4,
    "Moonstone": 5,
    "Knight": 5
  };
  const armorTypes = {
    "Helmet": 46,
    "Chestplate": 47,
    "Gauntlets": 48,
    "Leggings": 49,
    "Boots": 50
  };
  function getMaterialRankForItem(item) {
    if (!item || !item.name) return -1;
    const mat = Object.keys(materialRank).find(m => item.name.includes(m));
    return mat ? materialRank[mat] : -1;
  }
  function cleanInventory() {
    if (!playerInventoryParent || !playerInventoryParent.playerInventory) return;
    const inv = playerInventoryParent.playerInventory,
      items = inv.items;
    function findIndices(predicate) {
      const result = [];
      for (let i = 0; i <= 45; i++) {
        const it = items[i];
        if (it && predicate(it, i)) result.push(i);
      }
      return result;
    }
    const dropNames = ["Seeds", "Sapling", "Mushroom", "Empty Bottle"];
    for (let i = 0; i <= 45; i++) {
      const item = items[i];
      if (!item) continue;
      if (dropNames.some(name => item.name.includes(name))) playerInventoryParent.removeItemClient(i, item.amount, true);
    }
    for (let i = 0; i <= 45; i++) {
      const item = items[i];
      if (!item) continue;
      const type = Object.keys(armorTypes).find(t => item.name.includes(t));
      if (!type) continue;
      const material = Object.keys(materialRank).find(m => item.name.includes(m));
      if (!material) continue;
      const targetSlot = armorTypes[type],
        currentArmorItem = items[targetSlot];
      if (!currentArmorItem) {
        playerInventoryParent.swapPosClient(i, targetSlot);
      } else {
        const currentMat = Object.keys(materialRank).find(m => currentArmorItem.name.includes(m));
        const currentRank = currentMat ? materialRank[currentMat] : -1;
        if (materialRank[material] > currentRank) playerInventoryParent.swapPosClient(i, targetSlot);
        else playerInventoryParent.removeItemClient(i, 1, true);
      }
    }
    const swordIndices = findIndices(it => it.name.includes("Sword"));
    let bestSwordIdx = -1,
      bestSwordRank = -1;
    for (const idx of swordIndices) {
      const rank = getMaterialRankForItem(items[idx]);
      if (rank > bestSwordRank) {
        bestSwordRank = rank;
        bestSwordIdx = idx;
      }
    }
    if (bestSwordIdx !== -1) {
      const hot0 = items[0];
      if (!hot0) {
        if (bestSwordIdx !== 0) playerInventoryParent.swapPosClient(bestSwordIdx, 0);
      } else {
        if (hot0.name.includes("Sword")) {
          const hot0Rank = getMaterialRankForItem(hot0);
          if (bestSwordRank > hot0Rank) playerInventoryParent.swapPosClient(bestSwordIdx, 0);
        } else playerInventoryParent.swapPosClient(bestSwordIdx, 0);
      }
      bestSwordIdx = 0;
    }
    for (const idx of swordIndices) {
      if (idx === bestSwordIdx) continue;
      const it = items[idx];
      if (!it || !it.name.includes("Sword")) continue;
      playerInventoryParent.removeItemClient(idx, it.amount, true);
    }
  }
  function startInventoryCleaner() {
    if (inventoryCleanerInterval) return;
    inventoryCleanerInterval = setInterval(cleanInventory, 250);
  }
  function stopInventoryCleaner() {
    clearInterval(inventoryCleanerInterval);
    inventoryCleanerInterval = null;
  }
  let autoArmorInterval = null,
    autoWeaponInterval = null;
  function autoEquipBestWeapon() {
    if (!playerInventoryParent?.playerInventory?.items) return;
    const items = playerInventoryParent.playerInventory.items,
      TARGET_WEAPON_SLOT = 0,
      WEAPON_KEYWORDS = ["Sword", "Axe"];
    let bestInInventory = {
      rank: -1,
      index: -1
    };
    for (let i = 0; i <= 45; i++) {
      const item = items[i];
      if (item && item.name && WEAPON_KEYWORDS.some(kw => item.name.includes(kw))) {
        const rank = getMaterialRankForItem(item);
        if (rank > bestInInventory.rank) bestInInventory = {
          rank: rank,
          index: i
        };
      }
    }
    const currentWeapon = items[TARGET_WEAPON_SLOT],
      currentRank = getMaterialRankForItem(currentWeapon);
    if (bestInInventory.rank > currentRank) playerInventoryParent.swapPosClient(bestInInventory.index, TARGET_WEAPON_SLOT, null);
  }
  function startAutoWeapon() {
    if (autoWeaponInterval) return;
    autoWeaponInterval = setInterval(autoEquipBestWeapon, 250);
  }
  function stopAutoWeapon() {
    clearInterval(autoWeaponInterval);
    autoWeaponInterval = null;
  }
  function autoEquipBestArmor() {
    if (!playerInventoryParent?.playerInventory?.items) return;
    const items = playerInventoryParent.playerInventory.items;
    for (const type in armorTypes) {
      const equipmentSlot = armorTypes[type];
      let bestInInventory = {
        rank: -1,
        index: -1
      };
      for (let i = 0; i <= 45; i++) {
        const item = items[i];
        if (item && item.name && item.name.includes(type)) {
          const rank = getMaterialRankForItem(item);
          if (rank > bestInInventory.rank) bestInInventory = {
            rank: rank,
            index: i
          };
        }
      }
      const equippedItem = items[equipmentSlot],
        equippedRank = getMaterialRankForItem(equippedItem);
      if (bestInInventory.rank > equippedRank) playerInventoryParent.swapPosClient(bestInInventory.index, equipmentSlot, null);
    }
  }
  function startAutoArmor() {
    if (autoArmorInterval) return;
    autoArmorInterval = setInterval(autoEquipBestArmor, 250);
  }
  function stopAutoArmor() {
    clearInterval(autoArmorInterval);
    autoArmorInterval = null;
  }
  function setInfinityXP(enabled) {
    if (!injectedBool || !Fuxny?.bloxd?.enchantingManager?.enchantingBounds) {
      if (enabled) showTemporaryNotification("Injection or Game Object missing!", "#FF5252");
      return;
    }
    const enchantingBounds = Fuxny.bloxd.enchantingManager.enchantingBounds;
    if (enabled) {
      if (!originalEnchantingBounds) {
        originalEnchantingBounds = JSON.parse(JSON.stringify(enchantingBounds));
      }
      for (const tableName in enchantingBounds) {
        const bounds = enchantingBounds[tableName];
        if (!Array.isArray(bounds)) continue;
        for (const b of bounds) {
          if (!b) continue;
          b.min = -375;
          b.max = -375;
        }
      }
      showTemporaryNotification("Infinity XP Enabled (All Tables)", "#4CAF50");
    } else {
      if (originalEnchantingBounds) {
        for (const tableName in enchantingBounds) {
          if (!originalEnchantingBounds[tableName]) continue;
          const bounds = enchantingBounds[tableName];
          const original = originalEnchantingBounds[tableName];
          for (let i = 0; i < bounds.length; i++) {
            if (!bounds[i] || !original[i]) continue;
            bounds[i].min = original[i].min;
            bounds[i].max = original[i].max;
          }
        }
        originalEnchantingBounds = null;
      }
      showTemporaryNotification("Infinity XP Disabled", "#FF9800");
    }
  }
  function sortInventory() {
    if (!playerInventoryParent || !playerInventoryParent.playerInventory?.items) {
      showTemporaryNotification("Inventory not accessible!", "#FF5252");
      return;
    }
    const inv = playerInventoryParent.playerInventory,
      items = inv.items;
    let swapped;
    do {
      swapped = false;
      for (let i = 10; i < 45; i++) {
        const currentItem = items[i],
          nextItem = items[i + 1];
        if ((!currentItem && nextItem) || (currentItem && nextItem && currentItem.name > nextItem.name)) {
          playerInventoryParent.swapPosClient(i, i + 1);
          swapped = true;
        }
      }
    } while (swapped);
    showTemporaryNotification("Inventory Sorted!", "#4CAF50");
  }
  // ▼▼▼ この2つの関数をまるごと貼り付けて、既存の sortChest と置き換える ▼▼▼

  function mergeStacks(items, opWrapper, offset = 0) {
    // この関数はアイテムのスタック（統合）のみを担当する
    for (let i = 0; i < items.length; i++) {
        const itemA = items[i];
        if (!itemA || !itemA.typeObj || itemA.typeObj.stackable === false) continue;
        const max = itemA.typeObj.maxStack || 999;
        if (itemA.amount >= max) continue;

        for (let j = i + 1; j < items.length; j++) {
            const itemB = items[j];
            if (itemB && itemB.name === itemA.name && itemB.amount > 0) {
                // moveItemIntoIdxsClientは部分的な移動が可能でスタックに適している
                const spaceInA = max - itemA.amount;
                const amountToMove = Math.min(spaceInA, itemB.amount);

                if (amountToMove > 0 && typeof opWrapper.moveItemIntoIdxsClient === "function") {
                    opWrapper.moveItemIntoIdxsClient(offset + j, offset + j + 1, offset + i, amountToMove);
                    
                    // スクリプト側の状態も即時更新して計算の矛盾を防ぐ
                    itemA.amount += amountToMove;
                    itemB.amount -= amountToMove;
                    if(itemB.amount <= 0) {
                        items[j] = null;
                    }
                }
                if (itemA.amount >= max) break;
            }
        }
    }
  }

  function sortChest() {
    try {
        if (!playerInventoryParent) getFreshInventory();
        if (!playerInventoryParent) return;

        const opWrapper = playerInventoryParent;
        let chest = r.values(opWrapper)[2];
        
        // チェストオブジェクトをより確実に見つける
        if (!chest || !chest.items) {
            const found = r.values(opWrapper).find(v => v && v.items && v !== opWrapper.playerInventory);
            if (found) chest = found;
        }

        if (!chest || !chest.items) {
            showTemporaryNotification("Chest not open!", "#FF5252");
            return;
        }
        
        showTemporaryNotification("Sorting chest...", "#3b82f6");

        // --- フェーズ1: スタック処理 ---
        // サーバーへの反映を待つため、非同期で実行
        setTimeout(() => {
            mergeStacks(chest.items, opWrapper, 51);

            // --- フェーズ2: ソート処理 ---
            // スタック処理の完了を待ってからソートを開始
            setTimeout(() => {
                const items = chest.items;
                let swapped;
                do {
                    swapped = false;
                    for (let i = 0; i < items.length - 1; i++) {
                        const currentItem = items[i];
                        const nextItem = items[i + 1];
                        if ((!currentItem && nextItem) || (currentItem && nextItem && currentItem.name > nextItem.name)) {
                            // swapPosClientはサーバーと同期するため、ソートに適している
                            opWrapper.swapPosClient(51 + i, 51 + i + 1);
                            
                            // スクリプト側の状態も更新
                            const temp = items[i];
                            items[i] = items[i+1];
                            items[i+1] = temp;

                            swapped = true;
                        }
                    }
                } while (swapped);
                
                showTemporaryNotification("Chest Sorted & Stacked!", "#4CAF50");
            }, 500); // スタック処理の反映を待つための0.5秒の待機
        }, 100);

    } catch(e) {
        showTemporaryNotification("An error occurred while sorting chest.", "#FF5252");
        console.error("Sort Chest Error:", e);
    }
  }

  // ▲▲▲ ここまでを貼り付ける ▲▲▲
  function findClassConstructorForPickupReach(obj) {
    let current = obj;
    while (current) {
      for (const key of Reflect.ownKeys(current)) {
        let val;
        try {
          const desc = Object.getOwnPropertyDescriptor(current, key);
          val = desc?.value ?? current[key];
        } catch {
          continue;
        }
        const fnStr = val?.toString() || '';
        if (typeof val === "function" && fnStr.includes("this.names.position") && fnStr.includes(".base[0]")) return val;
      }
      current = Object.getPrototypeOf(current);
    }
    return null;
  }
  function findGhMethodForPickupReach(clsConstructor) {
    const protoLocal = clsConstructor?.prototype;
    if (!protoLocal) return null;
    for (const key of Reflect.ownKeys(protoLocal)) {
      if (key === "constructor") continue;
      const fn = protoLocal[key],
        fnStr = fn?.toString() || '';
      if (typeof fn === "function" && fnStr.includes("this.names.position") && fnStr.includes(".base[0]")) return {
        fn,
        key
      };
    }
    return null;
  }
  function setPickupReach(enabled) {
    pickupReachEnabled = enabled;
    if (enabled) {
      if (!protoForPickupReach || !originalGetEntitiesInAABB) {
        const cls = findClassConstructorForPickupReach(Fuxny.noa.entities);
        if (!cls) return;
        const ghMethod = findGhMethodForPickupReach(cls);
        if (!ghMethod) return;
        protoForPickupReach = cls.prototype;
        originalGetEntitiesInAABB = ghMethod.fn;
        ghMethodKey = ghMethod.key;
      }
      protoForPickupReach[ghMethodKey] = function(box, name) {
        const center = [(box.base[0] + box.max[0]) / 2, (box.base[1] + box.max[1]) / 2, (box.base[2] + box.max[2]) / 2],
          halfSize = [(box.max[0] - box.base[0]) / 2, (box.max[1] - box.base[1]) / 2, (box.max[2] - box.base[2]) / 2],
          enlarged = {
            base: center.map((c, i) => c - halfSize[i] * RANGE_MULTIPLIER),
            max: center.map((c, i) => c + halfSize[i] * RANGE_MULTIPLIER)
          };
        return originalGetEntitiesInAABB.call(this, enlarged, name);
      };
    } else {
      if (protoForPickupReach && ghMethodKey && originalGetEntitiesInAABB) protoForPickupReach[ghMethodKey] = originalGetEntitiesInAABB;
    }
  }
  function updatePlayerCoords() {
    if (!Fuxny?.bloxd?.entityNames || !Fuxny?.entities?.getState) return;
    try {
      for (const entityId in Fuxny.bloxd.entityNames) {
        if (entityId === "1") continue;
        const entityData = Fuxny.bloxd.entityNames[entityId],
          positionData = Fuxny.entities.getState(entityId, "position");
        if (!positionData || !positionData.position) continue;
        const position = positionData.position,
          x = Math.round(position[0]),
          y = Math.round(position[1]),
          z = Math.round(position[2]),
          baseName = entityData.entityName.replace(/\s*\(\-?\d+,\s*\-?\d+,\s*\-?\d+\)$/, "");
        entityData.entityName = `${baseName} (${x}, ${y}, ${z})`;
      }
    } catch (error) {
      stopPlayerCoords();
    }
  }
  function startPlayerCoords() {
    if (playerCoordsIntervalId) return;
    playerCoordsIntervalId = setInterval(updatePlayerCoords, 100);
  }
  function stopPlayerCoords() {
    if (!playerCoordsIntervalId) return;
    clearInterval(playerCoordsIntervalId);
    playerCoordsIntervalId = null;
    showTemporaryNotification("Player Coords Disabled", "#FF9800");
  }
  function forceShowNametags() {
    if (!Fuxny?.entityList || !Fuxny?.Lion?.scene) return;
    try {
      for (const subGroup of Object.values(Fuxny.entityList)) {
        if (!subGroup) continue;
        for (const obj of Object.values(subGroup)) {
          if (obj?.lobbyLeaderboardValues) {
            try {
              Object.defineProperty(obj, 'hasPriorityNametag', {
                get: () => true,
                set(v) {},
                configurable: true
              });
              Object.defineProperty(obj, 'canSee', {
                get: () => true,
                set(v) {},
                configurable: true
              });
            } catch (e) {}
          }
        }
      }
      Fuxny.Lion.scene.meshes.forEach(mesh => {
        if (mesh?.id?.includes('NameTag')) {
          try {
            Object.defineProperty(mesh, '_isVisible', {
              get: () => true,
              set(v) {},
              configurable: true
            });
            Object.defineProperty(mesh, 'renderingGroupId', {
              get: () => 3,
              set(v) {},
              configurable: true
            });
          } catch (e) {}
        }
      });
    } catch (e) {
      stopNametags();
    }
  }
  function startNametags() {
    if (nametagsIntervalId) return;
    forceShowNametags();
    nametagsIntervalId = setInterval(forceShowNametags, 3000);
  }
  function stopNametags() {
    clearInterval(nametagsIntervalId);
    nametagsIntervalId = null;
    showTemporaryNotification("Nametags Disabled. Reload to reset.", "#FF9800");
  }
  let chestStealerInterval = null;
  const chestStealerModule = {
  onlyStack: false
};

// ▼▼▼ ここから下を貼り付けて、既存の関数と置き換える ▼▼▼

  function playerHasItem(inventory, itemName) {
    if (!inventory || !inventory.items) return false;
    for (const item of inventory.items) {
      if (item && item.name === itemName) {
        return true;
      }
    }
    return false;
  }
  // ▼▼▼ この関数をまるごと貼り付けて、既存の chestStealerTick と置き換える ▼▼▼

  function chestStealerTick() {
    try {
      let op = playerInventoryParent;
      if (!op) { // opWrapper を再検索するフォールバック
        if (!Fuxny.entities || !Fuxny.impKey) return;
        let ent = Fuxny.entities[Fuxny.impKey];
        if (!ent) return;
        op = ent.inventory?.list?.[0]?.opWrapper;
        if (!op)
          for (let v of r.values(ent))
            if (v?.list?.[0]?.opWrapper) {
              op = v.list[0].opWrapper;
              break;
            }
      }
      if (!op) return;

      const chest = r.values(op)[2];
      const inv = op.playerInventory;
      if (!chest || !inv || !chest.items || !inv.items) return;

      // --- パス1: スタック可能なアイテムをまとめる ---
      for (let i = 0; i < 36; i++) {
        const itemInChest = chest.items[i];
        if (!itemInChest) continue;
        
        // 「既存アイテムのみ」オプションのチェック
        if (chestStealerModule.onlyStack && !playerHasItem(inv, itemInChest.name)) continue;

        const type = itemInChest.typeObj;
        const isStackable = !type || type.stackable !== false;
        const maxStack = type?.maxStack || 999;

        if (isStackable && op.moveItemIntoIdxsClient) {
          for (let j = 0; j < inv.items.length; j++) {
            const playerItem = inv.items[j];
            if (playerItem && playerItem.name === itemInChest.name && playerItem.amount < maxStack) {
              const amountToMove = Math.min(maxStack - playerItem.amount, itemInChest.amount);
              if (amountToMove > 0) {
                op.moveItemIntoIdxsClient(j, j + 1, 51 + i, amountToMove);
                // アイテムが部分的に移動した場合、チェスト内の状態が変わるため、
                // 次のパスで再度チェックされる
              }
            }
          }
        }
      }

      // --- パス2: 残ったアイテムを空きスロットに移動 ---
      for (let i = 0; i < 36; i++) {
        const itemInChest = chest.items[i];
        if (!itemInChest) continue;
        
        // インベントリに空きがなければ処理を完全に終了
        if (inv.getNumFreeSlots && inv.getNumFreeSlots() === 0) return;
        
        // 「既存アイテムのみ」オプションの再チェック
        if (chestStealerModule.onlyStack && !playerHasItem(inv, itemInChest.name)) continue;

        // 最初の空きスロットを探して移動
        for (let j = 0; j < inv.items.length; j++) {
          if (inv.items[j] === null) {
            op.swapPosClient(51 + i, j);
            // 移動したら、このチェストスロットに対する処理は終わり、次のスロットへ
            break;
          }
        }
      }
    } catch (e) {
      // console.error("Chest Stealer Error:", e); // デバッグ用にエラー出力を有効にすることもできます
    }
  }

  // ▲▲▲ ここまでを貼り付ける ▲▲▲
  function startChestStealer() {
    chestStealerInterval = setInterval(() => {
      chestStealerTick();
    }, 50);
    showTemporaryNotification("Chest Stealer Activated", "#4CAF50");
  }
  function stopChestStealer() {
    clearInterval(chestStealerInterval);
    chestStealerInterval = null;
    showTemporaryNotification("Chest Stealer Deactivated", "#FF9800");
  }
  function getActiveHacks() {
    const activeHacks = [];
    for (const hack of HACK_LIST) {
      if (hack.type === 'toggle') {
        const element = document.getElementById(`hack-${hack.id}`);
        if (element && element.checked) {
          activeHacks.push(hack.name);
        }
      }
    }
    activeHacks.sort((a, b) => b.length - a.length);
    return activeHacks;
  }
  function updateArrayList() {
    let container = document.getElementById('arraylist-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'arraylist-container';
      document.body.appendChild(container);
    }
    const activeHacks = getActiveHacks();
    const currentItems = container.querySelectorAll('.arraylist-item');
    const currentNames = Array.from(currentItems).map(el => el.textContent);
    if (JSON.stringify(activeHacks) === JSON.stringify(currentNames)) {
      return;
    }
    container.innerHTML = '';
    activeHacks.forEach((hackName, index) => {
      const item = document.createElement('div');
      item.className = 'arraylist-item';
      item.textContent = hackName;
      item.style.animationDelay = `${index * 0.02}s`;
      container.appendChild(item);
    });
  }
  function startArrayList() {
    if (arrayListIntervalId) return;
    updateArrayList();
    arrayListIntervalId = setInterval(updateArrayList, 100);
  }
  function stopArrayList() {
    if (arrayListIntervalId) {
      clearInterval(arrayListIntervalId);
      arrayListIntervalId = null;
    }
    const container = document.getElementById('arraylist-container');
    if (container) {
      container.remove();
    }
  }
  function renderHealthTagsFrame() {
    try {
      if (!injectedBool || !Fuxny.Lion || !healthTagsCanvas) return;
      const scene = Fuxny.Lion.scene;
      const engine = scene.getEngine();
      const gameCanvasElement = engine.getRenderingCanvas();
      if (!gameCanvasElement) return;
      const rect = gameCanvasElement.getBoundingClientRect();
      if (healthTagsCanvas.width !== rect.width || healthTagsCanvas.height !== rect.height ||
        healthTagsCanvas.style.top !== rect.top + 'px' || healthTagsCanvas.style.left !== rect.left + 'px') {
        healthTagsCanvas.width = rect.width;
        healthTagsCanvas.height = rect.height;
        healthTagsCanvas.style.top = rect.top + 'px';
        healthTagsCanvas.style.left = rect.left + 'px';
      }
      updateInterpolationTimer();
      healthTagsCtx.clearRect(0, 0, healthTagsCanvas.width, healthTagsCanvas.height);
      const playerList = n.noa.playerList;
      if (!playerList) return;
      const rawMyPos = n.noa.getPosition(1);
      if (!rawMyPos) return;
      const myPos = getInterpolatedPosition(1, rawMyPos);
      const rawHeading = Fuxny.camera.heading;
      const rawPitch = Fuxny.camera.pitch;
      let offX = 0,
        offY = 0,
        offZ = 0;
      if (Fuxny.rendering && Fuxny.rendering.camera && Fuxny.rendering.camera._position) {
        offX = Fuxny.rendering.camera._position._x || 0;
        offY = Fuxny.rendering.camera._position._y || 0;
        offZ = Fuxny.rendering.camera._position._z || 0;
      }
      const pivotX = myPos[0];
      const pivotY = myPos[1] + 1.6;
      const pivotZ = myPos[2];
      const cosRH = Math.cos(rawHeading);
      const sinRH = Math.sin(rawHeading);
      const cosRP = Math.cos(rawPitch);
      const sinRP = Math.sin(rawPitch);
      const camX = pivotX + (offX * cosRH) + (offY * sinRH * sinRP) + (offZ * sinRH * cosRP);
      const camY = pivotY + (offY * cosRP) - (offZ * sinRP);
      const camZ = pivotZ - (offX * sinRH) + (offY * cosRH * sinRP) + (offZ * cosRH * cosRP);
      let viewHeading = rawHeading;
      let viewPitch = rawPitch;
      if (offZ > 0) {
        viewHeading += Math.PI;
        viewPitch = -rawPitch;
      }
      const viewCosH = Math.cos(viewHeading);
      const viewSinH = Math.sin(viewHeading);
      const viewCosP = Math.cos(viewPitch);
      const viewSinP = Math.sin(viewPitch);
      const fov = (Fuxny.rendering && Fuxny.rendering.camera) ? Fuxny.rendering.camera.fov : 1.92;
      const width = healthTagsCanvas.width;
      const height = healthTagsCanvas.height;
      const aspect = width / height;
      const tanFovHalf = Math.tan(fov * 0.5);
      for (const id of playerList) {
        if (id === 1) continue;
        const life = Fuxny.entities.getState(id, "genericLifeformState");
        if (life && !life.isAlive) continue;
        const rawPos = n.noa.getPosition(id);
        if (!rawPos) continue;
        const pos = getInterpolatedPosition(id, rawPos);
        const targetX = pos[0];
        const targetY = pos[1] + 2.85;
        const targetZ = pos[2];
        const dx = targetX - camX;
        const dy = targetY - camY;
        const dz = targetZ - camZ;
        const x1 = dx * viewCosH - dz * viewSinH;
        const z1 = dx * viewSinH + dz * viewCosH;
        const y2 = dy * viewCosP + z1 * viewSinP;
        const z2 = -dy * viewSinP + z1 * viewCosP;
        if (z2 <= 0.5) continue;
        const xProj = x1 / (z2 * tanFovHalf * aspect);
        const yProj = y2 / (z2 * tanFovHalf);
        const screenX = (xProj + 1) * 0.5 * width;
        const screenY = (1 - yProj) * 0.5 * height;
        const perspectiveScale = (height * 0.5) / (z2 * tanFovHalf);
        const barWidth = 2.4 * perspectiveScale;
        const barHeight = 0.10 * perspectiveScale;
        if (screenX < -barWidth || screenX > width + barWidth ||
          screenY < -barHeight || screenY > height + barHeight) continue;
        let hpPercent = 100;
        try {
          const myEntity = Fuxny.entities[Fuxny.impKey];
          if (myEntity?.entityName?.list) {
            const list = myEntity.entityName.list;
            const targetIdStr = String(id);
            for (const key in list) {
              const valArray = r.values(list[key]);
              if (String(valArray[0]) === targetIdStr) {
                const rawHp = valArray[8];
                if (typeof rawHp === 'number' && rawHp > 0) hpPercent = Math.round(rawHp * 100);
                break;
              }
            }
          }
        } catch (e) {}
        const startX = screenX - (barWidth / 2);
        const startY = screenY;
        healthTagsCtx.fillStyle = "rgba(10, 10, 10, 0.8)";
        healthTagsCtx.fillRect(startX, startY, barWidth, barHeight);
        const greenWidth = (Math.min(100, Math.max(0, hpPercent)) / 100) * barWidth;
        healthTagsCtx.fillStyle = "#00ff7f";
        healthTagsCtx.fillRect(startX, startY, greenWidth, barHeight);
        if (hpPercent < 100) {
          healthTagsCtx.fillStyle = "#e74c3c";
          healthTagsCtx.fillRect(startX + greenWidth, startY, barWidth - greenWidth, barHeight);
        }
      }
    } catch (e) {}
  }
  function startHealthTags() {
    if (healthTagsObserver) return;
    if (!healthTagsCanvas) {
      healthTagsCanvas = document.createElement('canvas');
      healthTagsCanvas.id = 'health-tags-canvas';
      Object.assign(healthTagsCanvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        pointerEvents: 'none',
        zIndex: '999'
      });
      document.body.appendChild(healthTagsCanvas);
      healthTagsCtx = healthTagsCanvas.getContext('2d');
    }
    healthTagsCanvas.style.display = 'block';
    if (Fuxny.Lion?.scene) {
      healthTagsObserver = Fuxny.Lion.scene.onAfterRenderObservable.add(renderHealthTagsFrame);
    }
  }
  function stopHealthTags() {
    if (healthTagsObserver && Fuxny.Lion?.scene) {
      Fuxny.Lion.scene.onAfterRenderObservable.remove(healthTagsObserver);
      healthTagsObserver = null;
    }
    if (healthTagsCanvas) {
      healthTagsCanvas.style.display = 'none';
      healthTagsCtx.clearRect(0, 0, healthTagsCanvas.width, healthTagsCanvas.height);
    }
  }
  function renderHitboxesFrame() {
    try {
      if (!injectedBool || !Fuxny.Lion || !hitboxesCanvas) return;
      const scene = Fuxny.Lion.scene;
      const engine = scene.getEngine();
      const gameCanvasElement = engine.getRenderingCanvas();
      if (!gameCanvasElement) return;
      const rect = gameCanvasElement.getBoundingClientRect();
      if (hitboxesCanvas.width !== rect.width || hitboxesCanvas.height !== rect.height ||
        hitboxesCanvas.style.top !== rect.top + 'px' || hitboxesCanvas.style.left !== rect.left + 'px') {
        hitboxesCanvas.width = rect.width;
        hitboxesCanvas.height = rect.height;
        hitboxesCanvas.style.top = rect.top + 'px';
        hitboxesCanvas.style.left = rect.left + 'px';
      }
      updateInterpolationTimer();
      hitboxesCtx.clearRect(0, 0, hitboxesCanvas.width, hitboxesCanvas.height);
      const playerList = n.noa.playerList;
      if (!playerList) return;
      const rawMyPos = n.noa.getPosition(1);
      if (!rawMyPos) return;
      const myPos = getInterpolatedPosition(1, rawMyPos);
      const rawHeading = Fuxny.camera.heading;
      const rawPitch = Fuxny.camera.pitch;
      let offX = 0,
        offY = 0,
        offZ = 0;
      if (Fuxny.rendering && Fuxny.rendering.camera && Fuxny.rendering.camera._position) {
        offX = Fuxny.rendering.camera._position._x || 0;
        offY = Fuxny.rendering.camera._position._y || 0;
        offZ = Fuxny.rendering.camera._position._z || 0;
      }
      const pivotX = myPos[0];
      const pivotY = myPos[1] + 1.6;
      const pivotZ = myPos[2];
      const cosRH = Math.cos(rawHeading);
      const sinRH = Math.sin(rawHeading);
      const cosRP = Math.cos(rawPitch);
      const sinRP = Math.sin(rawPitch);
      const camX = pivotX + (offX * cosRH) + (offY * sinRH * sinRP) + (offZ * sinRH * cosRP);
      const camY = pivotY + (offY * cosRP) - (offZ * sinRP);
      const camZ = pivotZ - (offX * sinRH) + (offY * cosRH * sinRP) + (offZ * cosRH * cosRP);
      let viewHeading = rawHeading;
      let viewPitch = rawPitch;
      if (offZ > 0) {
        viewHeading += Math.PI;
        viewPitch = -rawPitch;
      }
      const viewCosH = Math.cos(viewHeading);
      const viewSinH = Math.sin(viewHeading);
      const viewCosP = Math.cos(viewPitch);
      const viewSinP = Math.sin(viewPitch);
      const fov = (Fuxny.rendering && Fuxny.rendering.camera) ? Fuxny.rendering.camera.fov : 1.92;
      const width = hitboxesCanvas.width;
      const height = hitboxesCanvas.height;
      const aspect = width / height;
      const tanFovHalf = Math.tan(fov * 0.5);
      const boxWidthX = 1.0;
      const boxWidthZ = 1.0;
      const boxHeight = 2.0;
      for (const id of playerList) {
        if (id === 1) continue;
        const life = Fuxny.entities.getState(id, "genericLifeformState");
        if (life && !life.isAlive) continue;
        const rawPos = n.noa.getPosition(id);
        if (!rawPos) continue;
        const pos = getInterpolatedPosition(id, rawPos);
        const playerX = pos[0];
        const playerY = pos[1];
        const playerZ = pos[2];
        let playerHeading = 0;
        if (hitboxesModule.mode3d) {
          try {
            const moveStateData = Fuxny.entities.getState(id, "moveState");
            if (moveStateData && typeof moveStateData.heading === 'number') {
              playerHeading = moveStateData.heading;
            }
          } catch (e) {}
        }
        const cosPlayerH = Math.cos(-playerHeading);
        const sinPlayerH = Math.sin(-playerHeading);
        const localCorners = [
          [-boxWidthX / 2, 0, -boxWidthZ / 2],
          [+boxWidthX / 2, 0, -boxWidthZ / 2],
          [+boxWidthX / 2, 0, +boxWidthZ / 2],
          [-boxWidthX / 2, 0, +boxWidthZ / 2],
          [-boxWidthX / 2, boxHeight, -boxWidthZ / 2],
          [+boxWidthX / 2, boxHeight, -boxWidthZ / 2],
          [+boxWidthX / 2, boxHeight, +boxWidthZ / 2],
          [-boxWidthX / 2, boxHeight, +boxWidthZ / 2],
        ];
        const worldCorners = localCorners.map(lc => {
          if (hitboxesModule.mode3d) {
            const rotX = lc[0] * cosPlayerH - lc[2] * sinPlayerH;
            const rotZ = lc[0] * sinPlayerH + lc[2] * cosPlayerH;
            return [playerX + rotX, playerY + lc[1], playerZ + rotZ];
          } else {
            return [playerX + lc[0], playerY + lc[1], playerZ + lc[2]];
          }
        });
        const screenCorners = [];
        for (const corner of worldCorners) {
          const dx = corner[0] - camX;
          const dy = corner[1] - camY;
          const dz = corner[2] - camZ;
          const x1 = dx * viewCosH - dz * viewSinH;
          const z1 = dx * viewSinH + dz * viewCosH;
          const y2 = dy * viewCosP + z1 * viewSinP;
          const z2 = -dy * viewSinP + z1 * viewCosP;
          if (z2 <= 0.1) {
            screenCorners.push(null);
            continue;
          }
          const xProj = x1 / (z2 * tanFovHalf * aspect);
          const yProj = y2 / (z2 * tanFovHalf);
          const screenX = (xProj + 1) * 0.5 * width;
          const screenY = (1 - yProj) * 0.5 * height;
          screenCorners.push([screenX, screenY]);
        }
        if (screenCorners.every(c => c === null)) continue;
        hitboxesCtx.fillStyle = "rgba(255, 0, 0, 0.2)";
        if (hitboxesModule.mode3d) {
          const faces = [
            [0, 1, 2, 3],
            [4, 5, 6, 7],
            [0, 1, 5, 4],
            [2, 3, 7, 6],
            [0, 3, 7, 4],
            [1, 2, 6, 5],
          ];
          for (const face of faces) {
            const pts = face.map(i => screenCorners[i]);
            if (pts.some(p => p === null)) continue;
            hitboxesCtx.beginPath();
            hitboxesCtx.moveTo(pts[0][0], pts[0][1]);
            hitboxesCtx.lineTo(pts[1][0], pts[1][1]);
            hitboxesCtx.lineTo(pts[2][0], pts[2][1]);
            hitboxesCtx.lineTo(pts[3][0], pts[3][1]);
            hitboxesCtx.closePath();
            hitboxesCtx.fill();
          }
        } else {
          let minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity;
          for (const sc of screenCorners) {
            if (!sc) continue;
            minX = Math.min(minX, sc[0]);
            maxX = Math.max(maxX, sc[0]);
            minY = Math.min(minY, sc[1]);
            maxY = Math.max(maxY, sc[1]);
          }
          if (minX === Infinity) continue;
          if (maxX < 0 || minX > width || maxY < 0 || minY > height) continue;
          hitboxesCtx.fillRect(minX, minY, maxX - minX, maxY - minY);
        }
      }
    } catch (e) {}
  }
  function startHitboxes() {
    if (hitboxesObserver) return;
    if (!hitboxesCanvas) {
      hitboxesCanvas = document.createElement('canvas');
      hitboxesCanvas.id = 'hitboxes-canvas';
      Object.assign(hitboxesCanvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        pointerEvents: 'none',
        zIndex: '998'
      });
      document.body.appendChild(hitboxesCanvas);
      hitboxesCtx = hitboxesCanvas.getContext('2d');
    }
    hitboxesCanvas.style.display = 'block';
    if (Fuxny.Lion?.scene) {
      hitboxesObserver = Fuxny.Lion.scene.onAfterRenderObservable.add(renderHitboxesFrame);
    }
  }
  function stopHitboxes() {
    if (hitboxesObserver && Fuxny.Lion?.scene) {
      Fuxny.Lion.scene.onAfterRenderObservable.remove(hitboxesObserver);
      hitboxesObserver = null;
    }
    if (hitboxesCanvas) {
      hitboxesCanvas.style.display = 'none';
      hitboxesCtx.clearRect(0, 0, hitboxesCanvas.width, hitboxesCanvas.height);
    }
  }
  let targetHudInterval = null;
  function getLookAtTarget(maxDist) {
    if (!n.noa || !Fuxny.camera) return null;
    const myPos = n.noa.getPosition(1);
    if (!myPos) return null;
    const eyePos = [myPos[0], myPos[1] + 1.6, myPos[2]];
    const h = Fuxny.camera.heading;
    const p = Fuxny.camera.pitch;
    const lookVec = [
      Math.sin(h) * Math.cos(p),
      -Math.sin(p),
      Math.cos(h) * Math.cos(p)
    ];
    let bestTarget = null;
    let maxDot = -1.0;
    const limitDot = 0.866;
    const playerList = n.noa.playerList;
    if (!playerList) return null;
    for (const id of playerList) {
      if (id === 1) continue;
      const ePos = n.noa.getPosition(id);
      if (!ePos) continue;
      const life = Fuxny.entities.getState(id, "genericLifeformState");
      if (life && !life.isAlive) continue;
      const targetCenter = [ePos[0], ePos[1] + 1.0, ePos[2]];
      const dx = targetCenter[0] - eyePos[0];
      const dy = targetCenter[1] - eyePos[1];
      const dz = targetCenter[2] - eyePos[2];
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq > maxDist * maxDist) continue;
      const dist = Math.sqrt(distSq);
      const toTargetVec = [dx / dist, dy / dist, dz / dist];
      const dot = lookVec[0] * toTargetVec[0] + lookVec[1] * toTargetVec[1] + lookVec[2] * toTargetVec[2];
      if (dot > limitDot && dot > maxDot) {
        maxDot = dot;
        bestTarget = {
          id: id,
          distance: dist
        };
      }
    }
    return bestTarget;
  }
  let hudEl = null;
  let hudNameEl = null;
  let hudHpBarEl = null;
  function initTargetHUDElement() {
    if (hudEl || document.getElementById('target-hud-container')) return;
    const hud = document.createElement('div');
    hud.id = 'target-hud-container';
    hud.innerHTML = `
            <div class="hud-name" id="hud-target-name" style="margin-bottom: 6px;">None</div>
            <div style="width: 100%; background: rgba(0,0,0,0.6); height: 14px; border-radius: 3px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                <div id="hud-hp-bar" style="width: 100%; height: 100%; background-color: #FF69B4; transition: width 0.1s linear;"></div>
            </div>
        `;
    document.body.appendChild(hud);
    hudEl = hud;
    hudNameEl = document.getElementById('hud-target-name');
    hudHpBarEl = document.getElementById('hud-hp-bar');
  }
  function updateTargetHUD() {
    if (!hudEl) return;
    if (!injectedBool) {
      hudEl.style.opacity = '0';
      return;
    }
    const target = getLookAtTarget(7.0);
    if (!target) {
      hudEl.style.opacity = '0';
      return;
    }
    let name = "Unknown";
    try {
      if (Fuxny.bloxd && Fuxny.bloxd.entityNames && Fuxny.bloxd.entityNames[target.id]) {
        name = Fuxny.bloxd.entityNames[target.id].entityName.split(' (')[0];
      }
    } catch (e) {}
    let hpPercent = 100;
    try {
      const myEntity = Fuxny.entities[Fuxny.impKey];
      if (myEntity && myEntity.entityName && myEntity.entityName.list) {
        const list = myEntity.entityName.list;
        const targetIdStr = String(target.id);
        for (const key in list) {
          if (!Object.prototype.hasOwnProperty.call(list, key)) continue;
          const dataObj = list[key];
          if (!dataObj) continue;
          const valArray = r.values(dataObj);
          if (String(valArray[0]) === targetIdStr) {
            const rawHp = valArray[8];
            if (rawHp === null) {
              hpPercent = 100;
            } else if (typeof rawHp === 'number') {
              hpPercent = Math.round(rawHp * 100);
              if (hpPercent <= 0) {
                hpPercent = 100;
              }
            }
            break;
          }
        }
      }
    } catch (e) {}
    hudEl.style.opacity = '1';
    hudEl.style.display = 'block';
    if (hudNameEl) hudNameEl.textContent = name;
    if (hudHpBarEl) hudHpBarEl.style.width = hpPercent + '%';
  }
  function startTargetHUD() {
    if (targetHudInterval) return;
    initTargetHUDElement();
    updateTargetHUD();
    targetHudInterval = setInterval(updateTargetHUD, 50);
  }
  function stopTargetHUD() {
    if (targetHudInterval) {
      clearInterval(targetHudInterval);
      targetHudInterval = null;
    }
    if (hudEl) hudEl.style.display = 'none';
  }
  const HACK_CATEGORIES = {
    combat: [{
        id: 'killaura',
        name: 'Killaura',
        type: 'toggle',
        settings: [{
            id: 'interval',
            name: 'Interval (ms)',
            type: 'slider',
            min: 5,
            max: 100,
            step: 5,
            default: 50
          },
          {
            id: 'range',
            name: 'Range',
            type: 'slider',
            min: 3,
            max: 10,
            step: 0.5,
            default: 5
          },
          {
            id: 'swing',
            name: 'Swing',
            type: 'toggle',
            default: true
          },
          {
            id: 'mobs',
            name: 'Include Mobs',
            type: 'toggle',
            default: false
          },
          {
            id: 'kb',
            name: 'Reverse KB',
            type: 'toggle',
            default: false
          },
          {
            id: 'combo',
            name: 'Combo',
            type: 'toggle',
            default: false
          },
          {
            id: 'triggerbot',
            name: 'Triggerbot',
            type: 'toggle',
            default: 50
          }
        ]
      },
      {
        id: 'auto-knockback',
        name: 'Auto Knockback',
        type: 'toggle',
        settings: [{
          id: 'threshold',
          name: 'Threshold',
          type: 'slider',
          min: 3,
          max: 8,
          step: 0.1,
          default: 4.5
        }]
      },
      {
        id: 'trigger-bot',
        name: 'Trigger Bot (Auto)',
        type: 'toggle'
      },
      {
        id: 'magicbullet',
        name: 'Magic Bullet',
        type: 'toggle',
        settings: [{
          id: 'mobs',
          name: 'Include Mobs',
          type: 'toggle',
          default: false
        }]
      },
      {
        id: 'aimbot',
        name: 'Aimbot',
        type: 'toggle',
        settings: [{
            id: 'distance',
            name: 'Distance',
            type: 'slider',
            min: 4,
            max: 500,
            step: 1,
            default: 8
          },
          {
            id: 'smoothing',
            name: 'Smoothing',
            type: 'slider',
            min: 0.1,
            max: 1.0,
            step: 0.05,
            default: 0.5
          }
        ]
      },
      {
        id: 'fight-bot',
        name: 'Fight Bot',
        type: 'toggle',
        settings: [{
          id: 'radius',
          name: 'Radius',
          type: 'slider',
          min: 5,
          max: 50,
          step: 1,
          default: 7
        }]
      },
      {
        id: 'autosw',
        name: 'Auto SW (Hold)',
        type: 'hold',
        settings: [{
          id: 'interval',
          name: 'Interval (ms)',
          type: 'slider',
          min: 5,
          max: 100,
          step: 5,
          default: 50
        }, {
          id: 'lead',
          name: 'Lead Time',
          type: 'slider',
          min: 0.05,
          max: 0.5,
          step: 0.01,
          default: 0.24
        }, {
          id: 'size',
          name: 'Size',
          type: 'slider',
          min: 1,
          max: 5,
          step: 2,
          default: 1
        }]
      },
      {
        id: 'trap-enemy',
        name: 'Trap Enemy (Hold)',
        type: 'hold',
        settings: [{
          id: 'thickness',
          name: 'Thickness',
          type: 'slider',
          min: 1,
          max: 5,
          step: 1,
          default: 2
        }]
      },
      {
        id: 'trap-self',
        name: 'Trap Self (Hold)',
        type: 'hold',
        settings: [{
          id: 'thickness',
          name: 'Thickness',
          type: 'slider',
          min: 1,
          max: 5,
          step: 1,
          default: 2
        }]
      },
    ],
    render: [{
        id: 'player-esp',
        name: 'Player ESP',
        type: 'toggle'
      },
      {
        id: 'target-hud',
        name: 'Target HUD',
        type: 'toggle'
      },
      {
        id: 'health-tags',
        name: 'Health Tags',
        type: 'toggle'
      },
      {
        id: 'hitboxes',
        name: 'Hitboxes',
        type: 'toggle',
        settings: [{
          id: 'mode3d',
          name: '3D Mode',
          type: 'toggle',
          default: false
        }]
      },
      {
        id: 'minimap',
        name: 'Minimap',
        type: 'toggle'
      },
      {
        id: 'chest-esp',
        name: 'Chest ESP',
        type: 'toggle'
      },
      {
        id: 'ore-esp',
        name: 'Ore ESP',
        type: 'toggle'
      },
      {
        id: 'wireframe',
        name: 'Wireframe',
        type: 'toggle'
      },
      {
        id: 'nametags',
        name: 'Nametags',
        type: 'toggle'
      },
      {
        id: 'player-coords',
        name: 'Player Coords',
        type: 'toggle'
      },
      {
        id: 'night',
        name: 'Night',
        type: 'toggle'
      },
      {
        id: 'arraylist',
        name: 'ArrayList',
        type: 'toggle'
      },
    ],
    move: [{
        id: 'bhop',
        name: 'BHOP',
        type: 'toggle'
      },
      {
        id: 'crouch-speed',
        name: 'Crouch Speed',
        type: 'toggle'
      },
      {
        id: 'auto-sprint',
        name: 'Auto Sprint',
        type: 'toggle'
      },
      {
        id: 'safescaffold',
        name: 'Scaffold',
        type: 'toggle'
      },
      {
        id: 'scaffold-ylock',
        name: 'Scaffold Y-Lock',
        type: 'toggle'
      },
      {
        id: 'clientmove',
        name: 'Client Move',
        type: 'toggle'
      },
      {
        id: 'freeze',
        name: 'Freeze',
        type: 'toggle'
      },
    ],
    world: [{
        id: 'fast-place',
        name: 'Fast Place',
        type: 'toggle',
        settings: [{
          id: 'delay',
          name: 'Delay (ms)',
          type: 'slider',
          min: 0,
          max: 100,
          step: 5,
          default: 20
        }]
      },
      {
        id: "fastbreak",
        name: "Fast Break",
        type: 'toggle'
      },
      {
        id: 'ore-miner',
        name: 'Ore Miner',
        type: 'toggle'
      },
      {
        id: 'pickup-reach',
        name: 'Pickup Reach',
        type: 'toggle'
      },
      {
        id: 'blink',
        name: 'Blink',
        type: 'toggle'
      },
      {
        id: 'fake-lag',
        name: 'Fake Lag',
        type: 'toggle',
        settings: [{
          id: 'duration',
          name: 'Lag Duration (ms)',
          type: 'slider',
          min: 50,
          max: 1000,
          step: 10,
          default: 200
        }, {
          id: 'interval',
          name: 'Lag Interval (ms)',
          type: 'slider',
          min: 100,
          max: 3000,
          step: 10,
          default: 500
        }]
      },
    ],
    utility: [{
        id: 'inv-cleaner',
        name: 'Inv Cleaner',
        type: 'toggle'
      },
      {
        id: 'chest-stealer',
        name: 'Chest Stealer',
        type: 'toggle',
        settings: [{
          id: 'only-stack',
          name: 'OnlyStack',
          type: 'toggle',
          default: false
        }]
      },
      {
        id: 'infinity-xp',
        name: 'Infinity XP',
        type: 'toggle'
      },
      {
        id: 'auto-tool',
        name: 'Auto Tool',
        type: 'toggle'
      },
      {
        id: 'auto-armor',
        name: 'Auto Armor',
        type: 'toggle'
      },
      {
        id: 'auto-weapon',
        name: 'Auto Weapon',
        type: 'toggle'
      },
      {
        id: 'auto-potion',
        name: 'Auto Potion',
        type: 'toggle',
        settings: [{
            id: 'health',
            name: 'Health Threshold',
            type: 'slider',
            min: 1,
            max: 100,
            step: 1,
            default: 25
          },
          {
            id: 'pitch',
            name: 'Throw Pitch',
            type: 'slider',
            min: -1.5,
            max: 1.5,
            step: 0.1,
            default: 1.0
          },
          {
            id: 'target-slot',
            name: 'Slot (0-8)',
            type: 'slider',
            min: 0,
            max: 8,
            step: 1,
            default: 8
          },
          {
            id: 'auto-throw',
            name: 'Auto Throw',
            type: 'toggle',
            default: true
          }
        ]
      },
      {
        id: 'sort-inventory',
        name: 'Sort Inventory',
        type: 'action'
      },
      {
        id: 'sort-chest',
        name: 'Sort Chest',
        type: 'action'
      },
      {
        id: 'kill-softly',
        name: 'Swing Speed(Client)',
        type: 'toggle',
        settings: [{
          id: 'duration',
          name: 'Duration (ms)',
          type: 'slider',
          min: 0,
          max: 5000,
          step: 100,
          default: 200
        }]
      },
      {
        id: 'derp',
        name: 'Derp',
        type: 'toggle',
        settings: [{
          id: 'speed',
          name: 'Speed',
          type: 'slider',
          min: -100,
          max: 100,
          step: 5,
          default: 5
        }, {
          id: 'backwards',
          name: 'Backwards',
          type: 'toggle',
          default: false
        }]
      },
      {
        id: 'autorespawn',
        name: 'Auto Respawn',
        type: 'toggle'
      },
    ]
  };
  const HACK_LIST = [].concat(...Object.values(HACK_CATEGORIES));
  let keybinds = {};
  const style = document.createElement('style');
  style.textContent = `
        :root {
            --bg-color: rgba(15, 15, 20, 0.92); 
            --bg-secondary: rgba(25, 25, 30, 0.6);
            --primary-color: #3b82f6; 
            --primary-hover: #2563eb;
            --accent-color: #60a5fa;
            --text-color: #e0e0e0;
            --text-muted: #94a3b8;
            --border-color: rgba(255, 255, 255, 0.08);
            --hover-color: rgba(255, 255, 255, 0.04);
            --danger-color: #f43f5e;
            --success-color: #10b981;
            --transition-speed: 0.2s;
            --font-main: "Inter", system-ui, -apple-system, sans-serif;
            --radius-lg: 12px;
            --radius-md: 8px;
            --radius-sm: 4px;
            --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.15);
        }
        .hack-ui-container {
            position: fixed;
            top: 50px;
            left: 50px;
            z-index: 999999;
            font-family: var(--font-main);
            -webkit-font-smoothing: antialiased;
            font-size: 13px;
        }
        #simple-hack-ui {
            background-color: var(--bg-color);
            background-image: linear-gradient(to bottom right, rgba(255,255,255,0.03), transparent);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 0;
            color: var(--text-color);
            width: 580px;
            height: 480px;
            box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            transition: opacity 0.2s ease, transform 0.2s ease;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        #simple-hack-ui.hidden {
            opacity: 0;
            transform: scale(0.95);
            pointer-events: none;
        }
        .ui-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 16px;
            background: rgba(0,0,0,0.2);
            border-bottom: 1px solid var(--border-color);
            cursor: move;
            flex-shrink: 0;
            height: 48px; 
            box-sizing: border-box;
        }
        .ui-header h3 {
            margin: 0;
            font-size: 13px;
            font-weight: 600;
            color: #fff;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .ui-header h3::before {
             content: '';
             display: block;
             width: 6px;
             height: 6px;
             background: var(--primary-color);
             border-radius: 50%;
             box-shadow: 0 0 8px var(--primary-color);
        }
        .ui-header-controls {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .ui-control-btn {
            background: transparent;
            border: 1px solid transparent;
            color: var(--text-muted);
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 24px;
            height: 24px;
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
        }
        .ui-control-btn:hover {
            color: #fff;
            background-color: var(--hover-color);
        }
        .ui-control-btn.text-btn {
            font-size: 11px;
            font-weight: 600;
            width: auto;
            height: 26px;
            padding: 0 14px;
            background-color: rgba(255, 255, 255, 0.04); 
            color: #d1d5db;
            border: 1px solid rgba(255, 255, 255, 0.08); 
            display: inline-flex;
            align-items: center;
            border-radius: 6px;
            letter-spacing: 0.3px;
            transition: all 0.2s ease;
        }
        .ui-control-btn.text-btn:hover {
             background-color: rgba(255, 255, 255, 0.08);
             color: white;
             border-color: rgba(255, 255, 255, 0.15);
             transform: translateY(-1px);
        }
        .ui-control-btn.text-btn:active {
            transform: translateY(0);
            background-color: rgba(255, 255, 255, 0.02);
        }
        .ui-main {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        .ui-sidebar {
            width: 110px; 
            background-color: rgba(10, 10, 12, 0.3);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            padding: 8px;
            gap: 2px;
        }
        .ui-tab-btn {
            padding: 9px 12px;
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: var(--radius-sm);
            text-align: left;
            position: relative;
            display: flex;
            align-items: center;
        }
        .ui-tab-btn:hover {
            color: var(--text-color);
            background-color: var(--hover-color);
        }
        .ui-tab-btn.active {
            color: #fff;
            background-color: rgba(255, 255, 255, 0.05); 
            font-weight: 600;
        }
        .ui-tab-btn.active::after {
            content: '';
            position: absolute;
            right: 0px;
            top: 50%;
            transform: translateY(-50%);
            height: 20px;
            width: 3px;
            background-color: var(--primary-color);
            border-radius: 3px 0 0 3px;
            box-shadow: -2px 0 10px rgba(59, 130, 246, 0.4);
        }
        .ui-content {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: transparent;
        }
        .ui-tab-content {
            display: none;
            flex: 1;
            overflow-y: overlay;
            padding: 12px 16px;
            scroll-behavior: smooth;
        }
        .ui-tab-content.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .ui-tab-content::-webkit-scrollbar {
            width: 5px;
        }
        .ui-tab-content::-webkit-scrollbar-track {
            background: transparent;
        }
        .ui-tab-content::-webkit-scrollbar-thumb {
            background-color: rgba(255,255,255,0.08);
            border-radius: 3px;
        }
        .ui-tab-content::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255,255,255,0.15);
        }
        .hack-item {
            background-color: rgba(255,255,255,0.02);
            border-radius: var(--radius-md);
            margin-bottom: 8px;
            overflow: hidden;
            border: 1px solid transparent;
            transition: all 0.2s ease;
        }
        .hack-item:hover {
            border-color: rgba(255,255,255,0.06);
            background-color: rgba(255,255,255,0.035);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .hack-control {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 14px;
        }
        .hack-label-keybind {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .hack-label-keybind label {
            font-size: 13px;
            font-weight: 500;
            color: var(--text-color);
            cursor: pointer;
        }
        .keybind-btn {
            border: 1px solid var(--border-color);
            background-color: transparent;
            color: var(--text-muted);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-family: monospace;
            font-weight: 600;
            cursor: pointer;
            width: fit-content;
            transition: all 0.2s ease;
            text-transform: uppercase;
        }
        .keybind-btn:hover {
            border-color: var(--primary-color);
            color: var(--accent-color);
        }
        .keybind-btn.waiting {
            background-color: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        .hack-right {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .settings-icon {
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 10px;
            cursor: pointer;
            padding: 6px;
            transition: all 0.2s ease;
            opacity: 0.6;
        }
        .settings-icon:hover, .settings-icon.open {
            color: var(--primary-color);
            opacity: 1;
        }
        .settings-icon.open { transform: rotate(180deg); }
        .hold-btn {
            background-color: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border-color);
            color: var(--text-color);
            padding: 5px 14px;
            border-radius: 6px; 
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
            text-align: center;
            font-size: 11px;
            font-weight: 500;
        }
        .hold-btn:hover {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
        .hold-btn:active { transform: scale(0.96); }
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 36px;
            height: 20px;
            flex-shrink: 0;
        }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(255,255,255,0.1);
            transition: .25s;
            border-radius: 20px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 14px; width: 14px;
            left: 3px; bottom: 3px;
            background-color: #a0a0a0;
            transition: .25s cubic-bezier(0.18, 0.89, 0.32, 1.28); 
            border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--primary-color); }
        input:checked + .slider:before {
            transform: translateX(16px);
            background-color: #fff;
        }
        .hack-settings {
            display: none;
            background-color: rgba(0, 0, 0, 0.2);
            border-top: 1px solid var(--border-color);
            padding: 12px 14px;
        }
        .hack-settings.open { display: block; animation: slideDown 0.2s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .setting-control {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
        }
        .setting-control > label:not(.toggle-switch) {
            font-size: 12px;
            color: var(--text-muted);
            flex: 1;
            font-weight: 500;
        }
        .setting-control > .toggle-switch {
             flex: 0 0 30px !important; 
             width: 30px !important;
             min-width: 30px !important;
             height: 16px !important;
        }
        .setting-control > .toggle-switch .slider:before {
            height: 12px !important;
            width: 12px !important;
            left: 2px !important;
            bottom: 2px !important;
        }
        .setting-control > .toggle-switch input:checked + .slider:before {
            transform: translateX(14px) !important;
        }
        .setting-control input[type="range"] {
            -webkit-appearance: none; appearance: none;
            width: 100px; height: 4px;
            background: rgba(255,255,255,0.1);
            outline: none; border-radius: 2px;
        }
        .setting-control input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none;
            width: 12px; height: 12px;
            background: var(--text-muted);
            cursor: pointer; border-radius: 50%;
            transition: all 0.1s;
        }
        .setting-control input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            background: var(--primary-color);
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        .setting-value {
            font-size: 11px;
            color: var(--text-color);
            font-family: monospace;
            min-width: 34px;
            text-align: center;
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 4px;
            border-radius: 4px;
        }
        #reopen-hack-ui {
            position: fixed; top: 50px; left: 20px;
            background-color: var(--bg-color);
            border: 1px solid var(--border-color);
            color: var(--text-color);
            width: 42px; height: 42px;
            border-radius: 10px;
            font-size: 18px;
            cursor: pointer;
            display: flex; justify-content: center; align-items: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
            z-index: 999998;
            backdrop-filter: blur(10px);
        }
        #reopen-hack-ui:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }
        #reopen-hack-ui.hidden { pointer-events: none; opacity: 0; transform: scale(0); }
        #notification-container { position: fixed; bottom: 30px; right: 30px; z-index: 1000000; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
        .notification {
            padding: 10px 18px;
            color: #fff;
            background: rgba(18, 18, 24, 0.95);
            border-left: 3px solid var(--primary-color);
            border-radius: 6px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            backdrop-filter: blur(12px);
            opacity: 0;
            transform: translateX(30px);
            transition: all 0.3s ease;
            font-size: 13px;
        }
        #target-hud-container {
            position: fixed; top: 50%; left: 50%;
            margin-top: 15px; margin-left: 15px;
            background: rgba(26,29,33,.92);
            border: 1px solid #3a3f47;
            border-left: 3px solid #4a8cff;
            border-radius: 4px;
            padding: 8px 14px;
            min-width: 130px;
            color: #e8e8e8;
            font-family: "Segoe UI","Roboto",sans-serif;
            pointer-events: none;
            display: none;
            z-index: 999990;
            box-shadow: 0 4px 15px rgba(0,0,0,.4);
            backdrop-filter: blur(4px);
            opacity: 0;
            transition: opacity .2s ease;
            text-align: left;
        }
        .hud-name { font-weight: 600; font-size: 14px; color: #fff; margin-bottom: 3px; letter-spacing: .3px; white-space: nowrap; }
        .hud-info { font-size: 11px; color: #9a9a9a; font-weight: 500; display: flex; align-items: center; gap: 4px; }
        .hud-dist-val { color: #4a8cff; font-family: "Consolas", monospace; font-weight: 700; }
#arraylist-container {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    font-family: "Segoe UI", "Roboto", sans-serif;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
}
.arraylist-item {
    position: relative; 
    padding: 6px 14px;
    color: #f0f0f0;
    background: linear-gradient(145deg, #1e2028, #2a2f3a);
    border-left: 3px solid #5a7ab5;
    margin-bottom: 2px;
    font-size: 14px;
    font-weight: 500;
    text-shadow: 0 1px 3px rgba(0,0,0,0.7);
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    opacity: 0;
    animation: arraylist-slide-in 0.25s ease-out forwards;
    white-space: nowrap;
    width: fit-content;
}
.arraylist-item::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-top: 2px solid rgba(0,0,0,0.2);
    border-right: 2px solid rgba(0,0,0,0.2);
    pointer-events: none;
    border-radius: 0; 
}
@keyframes arraylist-slide-in {
    from {
        opacity: 0;
        transform: translateX(15px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
    `;
  document.head.appendChild(style);
  const uiContainer = document.createElement('div');
  uiContainer.id = 'hack-ui-container';
  uiContainer.className = 'hack-ui-container';
  const ui = document.createElement('div');
  ui.id = 'simple-hack-ui';
  let uiContent = `
        <div class="ui-header">
            <h3>Simple Client</h3>
            <div class="ui-header-controls">
                <button id="inject-btn" class="ui-control-btn text-btn">Inject</button>
                <button id="new-account-btn" class="ui-control-btn text-btn">NewAc</button>
                <button id="minimize-hack-ui" class="ui-control-btn">×</button>
            </div>
        </div>
        <div class="ui-main">
            <div class="ui-sidebar">
                ${Object.keys(HACK_CATEGORIES).map((cat, i) => `<button class="ui-tab-btn ${i === 0 ? 'active' : ''}" data-tab="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>`).join('')}
            </div>
            <div class="ui-content">
    `;
  Object.keys(HACK_CATEGORIES).forEach((category, index) => {
    uiContent += `<div id="tab-${category}" class="ui-tab-content ${index === 0 ? 'active' : ''}">`;
    HACK_CATEGORIES[category].forEach(hack => {
      uiContent += `<div class="hack-item" id="item-${hack.id}">`;
      uiContent += `
                <div class="hack-control" id="control-${hack.id}">
                    <div class="hack-label-keybind">
                        <label for="hack-${hack.id}">${hack.name}</label>
                        <button class="keybind-btn" data-hack-id="${hack.id}">None</button>
                    </div>
                    <div class="hack-right">
                        ${hack.settings ? `<button class="settings-icon" data-target="settings-${hack.id}">▼</button>` : ''}
                        ${hack.type === 'toggle'
                        ? `<label class="toggle-switch"><input type="checkbox" id="hack-${hack.id}"><span class="slider"></span></label>`
                        : hack.type === 'hold'
                            ? `<button class="hold-btn" id="hack-${hack.id}">Hold</button>`
                            : hack.type === 'action'
                                ? `<button class="hold-btn" id="hack-${hack.id}">Run</button>`
                                : ''
                    }
                    </div>
                </div>
            `;
      if (hack.settings) {
        uiContent += `<div class="hack-settings" id="settings-${hack.id}">`;
        hack.settings.forEach(setting => {
          if (setting.type === 'slider') {
            const savedValue = localStorage.getItem(`setting_${hack.id}_${setting.id}`);
            const defaultValue = savedValue !== null ? savedValue : setting.default;
            uiContent += `
                        <div class="setting-control" id="setting-${hack.id}-${setting.id}">
                           <label for="slider-${hack.id}-${setting.id}">${setting.name}</label>
                           <input type="range" id="slider-${hack.id}-${setting.id}" min="${setting.min}" max="${setting.max}" step="${setting.step}" value="${defaultValue}">
                           <span class="setting-value" id="value-${hack.id}-${setting.id}">${parseFloat(defaultValue).toFixed(setting.step < 1 ? 2 : 0)}</span>
                        </div>
                     `;
          } else if (setting.type === 'toggle') {
            const savedValue = localStorage.getItem(`setting_${hack.id}_${setting.id}`);
            const defaultValue = savedValue !== null ? JSON.parse(savedValue) : setting.default;
            uiContent += `
                        <div class="setting-control" id="setting-${hack.id}-${setting.id}">
                           <label for="toggle-${hack.id}-${setting.id}">${setting.name}</label>
                           <label class="toggle-switch">
                              <input type="checkbox" id="toggle-${hack.id}-${setting.id}" ${defaultValue ? 'checked' : ''}>
                              <span class="slider"></span>
                           </label>
                        </div>
                    `;
          }
        });
        uiContent += `</div>`;
      }
      uiContent += `</div>`;
    });
    uiContent += `</div>`;
  });
  uiContent += `</div></div>`;
  ui.innerHTML = uiContent;
  const reopenBtn = document.createElement('button');
  reopenBtn.id = 'reopen-hack-ui';
  reopenBtn.innerHTML = '☰';
  reopenBtn.style.display = 'none';
  uiContainer.appendChild(ui);
  document.body.appendChild(uiContainer);
  document.body.appendChild(reopenBtn);
  function showTemporaryNotification(message, color = '#3a78ff', duration = 2000) {
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      document.body.appendChild(container);
    }
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    notif.style.borderLeftColor = color;
    container.prepend(notif);
    setTimeout(() => {
      notif.style.opacity = '1';
      notif.style.transform = 'translateX(0)';
    }, 10);
    setTimeout(() => {
      notif.style.opacity = '0';
      notif.style.transform = 'translateX(20px)';
      setTimeout(() => notif.remove(), 500);
    }, duration);
  }
  function clearCookiesAndReload() {
    if (confirm("Are you sure? Get the fuck out bitch asshole🖕. You better to give me a paper quickly🖕")) {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i],
          eqPos = cookie.indexOf("="),
          name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
      location.reload();
    }
  }
  function loadPositions() {
    const uiPos = JSON.parse(localStorage.getItem('hack-ui-container_position'));
    if (uiPos && uiPos.top && uiPos.left) {
      uiContainer.style.top = uiPos.top;
      uiContainer.style.left = uiPos.left;
    }
    const reopenBtnPos = JSON.parse(localStorage.getItem('reopen-hack-ui_position'));
    if (reopenBtnPos && reopenBtnPos.top && reopenBtnPos.left) {
      reopenBtn.style.top = reopenBtnPos.top;
      reopenBtn.style.left = reopenBtnPos.left;
    }
  }
  function loadSettings() {
    for (const hack of HACK_LIST) {
      const savedKey = localStorage.getItem(`keybind_${hack.id}`) || 'None';
      keybinds[hack.id] = savedKey;
      document.querySelector(`.keybind-btn[data-hack-id="${hack.id}"]`).textContent = savedKey;
    }
    HACK_LIST.forEach(hack => {
      if (hack.settings) {
        hack.settings.forEach(setting => {
          if (setting.type === 'slider') {
            const savedValue = localStorage.getItem(`setting_${hack.id}_${setting.id}`),
              defaultValue = setting.default,
              valueToApply = savedValue !== null ? parseFloat(savedValue) : defaultValue;
            const slider = document.getElementById(`slider-${hack.id}-${setting.id}`),
              valueSpan = document.getElementById(`value-${hack.id}-${setting.id}`);
            if (slider && valueSpan) {
              slider.value = valueToApply;
              valueSpan.textContent = valueToApply.toFixed(setting.step < 1 ? 2 : 0);
              if (hack.id === 'auto-knockback' && setting.id === 'threshold') autoKnockbackModule.threshold = valueToApply;
              if (hack.id === 'killaura' && setting.id === 'delay') killauraModule.delay = valueToApply;
              if (hack.id === 'killaura' && setting.id === 'range') killauraModule.range = valueToApply;
              if (hack.id === 'aimbot' && setting.id === 'distance') aimbotModule.maxTargetDistance = valueToApply;
              if (hack.id === 'aimbot' && setting.id === 'smoothing') aimbotModule.smoothing = valueToApply;
              if (hack.id === 'autosw') {
                if (setting.id === 'interval') autoSWModule.interval = valueToApply;
                if (setting.id === 'lead') autoSWModule.leadTime = valueToApply;
                if (setting.id === 'size') autoSWModule.size = valueToApply;
              }
              if (hack.id === 'kill-softly' && setting.id === 'duration') killSoftlyModule.duration = valueToApply;
              if (hack.id === 'derp' && setting.id === 'speed') derpModule.speed = valueToApply;
              if (hack.id === 'fake-lag' && setting.id === 'duration') fakeLagModule.duration = valueToApply;
              if (hack.id === 'fake-lag' && setting.id === 'interval') fakeLagModule.interval = valueToApply;
              if (hack.id === 'fast-place' && setting.id === 'delay') fastPlaceModule.delay = valueToApply;
              if (hack.id === 'fight-bot' && setting.id === 'radius') fightBotModule.radius = valueToApply;
              if (hack.id === 'trap-enemy' && setting.id === 'thickness') trapSettings.enemyThickness = valueToApply;
              if (hack.id === 'trap-self' && setting.id === 'thickness') trapSettings.selfThickness = valueToApply;
              if (hack.id === 'auto-potion') {
                if (setting.id === 'health') autoPotionModule.healthThreshold = valueToApply;
                if (setting.id === 'pitch') autoPotionModule.pitch = valueToApply;
                if (setting.id === 'target-slot') autoPotionModule.targetSlot = valueToApply;
              }
              slider.addEventListener('input', () => {
                const rawValue = slider.value;
                const value = parseFloat(rawValue);
                valueSpan.textContent = value.toFixed(setting.step < 1 ? 2 : 0);
                localStorage.setItem(`setting_${hack.id}_${setting.id}`, rawValue);
                if (hack.id === 'fight-bot' && setting.id === 'radius') fightBotModule.radius = value;
                else if (hack.id === 'killaura' && setting.id === 'delay') {
                  killauraModule.delay = value;
                  if (killauraInterval) {
                    stopKillaura();
                    startKillaura();
                  }
                } else if (hack.id === 'killaura' && setting.id === 'range') killauraModule.range = value;
                else if (hack.id === 'aimbot' && setting.id === 'distance') aimbotModule.maxTargetDistance = value;
                else if (hack.id === 'aimbot' && setting.id === 'smoothing') aimbotModule.smoothing = value;
                else if (hack.id === 'autosw') {
                  if (setting.id === 'interval') {
                    autoSWModule.interval = value;
                    if (autoSWIntervalId) {
                      stopAutoSW();
                      startAutoSW();
                    }
                  } else if (setting.id === 'lead') autoSWModule.leadTime = value;
                  else if (setting.id === 'size') autoSWModule.size = value;
                }
                else if (hack.id === 'kill-softly' && setting.id === 'duration') {
                  killSoftlyModule.duration = value;
                  const toggle = document.getElementById('hack-kill-softly');
                  if (toggle && toggle.checked && playerEntity && playerEntity.heldItemState) playerEntity.heldItemState.swingDuration = value;
                } else if (hack.id === 'derp' && setting.id === 'speed') derpModule.speed = value;
                else if (hack.id === 'fake-lag') {
                  if (setting.id === 'duration') fakeLagModule.duration = value;
                  if (setting.id === 'interval') fakeLagModule.interval = value;
                  if (document.getElementById('hack-fake-lag').checked) {
                    stopFakeLag();
                    startFakeLag();
                  }
                } else if (hack.id === 'fast-place' && setting.id === 'delay') {
                  fastPlaceModule.delay = value;
                  if (fastPlaceIntervalId) {
                    stopFastPlace();
                    startFastPlace();
                  }
                } else if (hack.id === 'trap-enemy' && setting.id === 'thickness') trapSettings.enemyThickness = value;
                else if (hack.id === 'trap-self' && setting.id === 'thickness') trapSettings.selfThickness = value;
                else if (hack.id === 'auto-potion') {
                  if (setting.id === 'health') autoPotionModule.healthThreshold = value;
                  if (setting.id === 'pitch') autoPotionModule.pitch = value;
                  if (setting.id === 'target-slot') autoPotionModule.targetSlot = value;
                }
              });
            }
          } else if (setting.type === 'toggle') {
            const savedValue = localStorage.getItem(`setting_${hack.id}_${setting.id}`),
              defaultValue = setting.default,
              valueToApply = savedValue !== null ? JSON.parse(savedValue) : defaultValue;
            const checkbox = document.getElementById(`toggle-${hack.id}-${setting.id}`);
            if (checkbox) {
              checkbox.checked = valueToApply;
              if (hack.id === 'killaura' && setting.id === 'swing') killauraModule.swingEnabled = valueToApply;
              if (hack.id === 'killaura' && setting.id === 'triggerbot') killauraModule.triggerbotEnabled = valueToApply;
              if (hack.id === 'killaura' && setting.id === 'combo') killauraModule.comboEnabled = valueToApply;
              if (hack.id === 'killaura' && setting.id === 'mobs') killauraModule.includeMobs = valueToApply;
              if (hack.id === 'killaura' && setting.id === 'kb') killauraModule.reverseKb = valueToApply;
              if (hack.id === 'magicbullet' && setting.id === 'mobs') magicBulletModule.includeMobs = valueToApply;
              if (hack.id === 'chest-stealer' && setting.id === 'only-stack') chestStealerModule.onlyStack = valueToApply;
              if (hack.id === 'auto-potion' && setting.id === 'auto-throw') autoPotionModule.autoThrow = valueToApply;
              if (hack.id === 'derp' && setting.id === 'backwards') derpModule.backwards = valueToApply;
              if (hack.id === 'hitboxes' && setting.id === 'mode3d') hitboxesModule.mode3d = valueToApply;
              checkbox.addEventListener('change', (e) => {
                const isEnabled = e.currentTarget.checked;
                localStorage.setItem(`setting_${hack.id}_${setting.id}`, isEnabled);
                if (hack.id === 'killaura' && setting.id === 'swing') killauraModule.swingEnabled = isEnabled;
                if (hack.id === 'killaura' && setting.id === 'triggerbot') killauraModule.triggerbotEnabled = isEnabled;
                if (hack.id === 'killaura' && setting.id === 'combo') killauraModule.comboEnabled = isEnabled;
                if (hack.id === 'killaura' && setting.id === 'mobs') killauraModule.includeMobs = isEnabled;
                if (hack.id === 'killaura' && setting.id === 'kb') killauraModule.reverseKb = isEnabled;
                if (hack.id === 'magicbullet' && setting.id === 'mobs') magicBulletModule.includeMobs = isEnabled;
                if (hack.id === 'chest-stealer' && setting.id === 'only-stack') chestStealerModule.onlyStack = isEnabled;
                if (hack.id === 'auto-potion' && setting.id === 'auto-throw') autoPotionModule.autoThrow = isEnabled;
                if (hack.id === 'derp' && setting.id === 'backwards') derpModule.backwards = isEnabled;
                if (hack.id === 'hitboxes' && setting.id === 'mode3d') hitboxesModule.mode3d = isEnabled;
              });
            }
          }
        });
      }
    });
  }
  function saveKeybind(hackId, key) {
    keybinds[hackId] = key;
    localStorage.setItem(`keybind_${hackId}`, key);
    document.querySelector(`.keybind-btn[data-hack-id="${hackId}"]`).textContent = key;
  }
  let activeKeys = new Set();
  function handleKeydown(e) {
    if (e.code === 'ShiftRight') {
      const ui = document.getElementById('simple-hack-ui');
      if (ui.classList.contains('hidden')) document.getElementById('reopen-hack-ui').click();
      else document.getElementById('minimize-hack-ui').click();
      return;
    }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable || e.repeat) return;
    const pressedKey = e.code;
    if (activeKeys.has(pressedKey)) return;
    activeKeys.add(pressedKey);
    for (const hack of HACK_LIST) {
      if (keybinds[hack.id] === pressedKey) {
        const hackElement = document.getElementById(`hack-${hack.id}`);
        if (hack.type === 'toggle' || hack.type === 'action') {
          hackElement.click();
        } else if (hack.type === 'hold') {
          const startEvent = new MouseEvent('mousedown');
          hackElement.dispatchEvent(startEvent);
        }
      }
    }
  }
  function handleKeyup(e) {
    const releasedKey = e.code;
    if (activeKeys.has(releasedKey)) {
      activeKeys.delete(releasedKey);
      const hacks = HACK_LIST.filter(h => keybinds[h.id] === releasedKey && h.type === 'hold');
      for (const hack of hacks) {
        const hackElement = document.getElementById(`hack-${hack.id}`);
        if (hackElement) {
          const endEvent = new MouseEvent('mouseup');
          hackElement.dispatchEvent(endEvent);
        }
      }
    }
  }
  function makeElementDraggable(element) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    let isDragging = false;
    element.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      const targetElement = e.target;
      if (element.id === 'reopen-hack-ui' || element.id === 'minimap-canvas') {} else {
        if (!targetElement.closest('.ui-header')) return;
        if (targetElement.closest('input, button')) return;
      }
      e = e || window.event;
      if (e.button !== 0) return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      isDragging = false;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      isDragging = true;
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      let newTop = element.offsetTop - pos2,
        newLeft = element.offsetLeft - pos1;
      const screenWidth = window.innerWidth,
        screenHeight = window.innerHeight,
        header = element.querySelector('.ui-header'),
        headerHeight = header ? header.offsetHeight : 40,
        elementWidth = element.offsetWidth;
      if (newTop < 0) newTop = 0;
      if (newTop + headerHeight > screenHeight) newTop = screenHeight - headerHeight;
      if (newLeft < 0) newLeft = 0;
      if (newLeft + elementWidth > screenWidth) newLeft = screenWidth - elementWidth;
      element.style.top = newTop + "px";
      element.style.left = newLeft + "px";
      element.style.right = "auto";
      element.style.bottom = "auto";
    }
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
      element.dataset.dragged = isDragging;
      const position = {
        top: element.style.top,
        left: element.style.left
      };
      localStorage.setItem(`${element.id}_position`, JSON.stringify(position));
    }
  }
  const toggleActions = {
    'killaura': (en) => en ? startKillaura() : stopKillaura(),
    'trigger-bot': (en) => en ? startTriggerBot() : stopTriggerBot(),
    'infinity-xp': (en) => setInfinityXP(en),
    'magicbullet': (en) => en ? startMagicBullet() : stopMagicBullet(),
    'auto-tool': (en) => en ? startAutoTool() : stopAutoTool(),
    'auto-potion': (en) => en ? startAutoPotion() : stopAutoPotion(),
    'bhop': (en) => en ? startBhop() : stopBhop(),
    'crouch-speed': (en) => {
      if (Fuxny.noa.playerdata) Fuxny.noa.playerdata.crouchingSpeed = en ? 7 : 2;
    },
    'auto-sprint': (en) => {
      if (Fuxny.noa.playerdata) Fuxny.noa.playerdata.walkingSpeed = en ? 7 : 4;
    },
    'fight-bot': (en) => en ? startFightBot() : stopFightBot(),
    'aimbot': (en) => en ? startAimbot() : stopAimbot(),
    'chest-esp': (en) => setChestESP(en),
    'ore-esp': (en) => setOreESP(en),
    'kill-softly': (en) => {
      if (playerEntity && playerEntity.heldItemState) playerEntity.heldItemState.swingDuration = en ? killSoftlyModule.duration : 200;
    },
    'night': (en) => setNight(en),
    'derp': (en) => en ? startDerp() : stopDerp(),
    'fastbreak': (en) => en ? startFastBreak() : stopFastBreak(),
    'pickup-reach': (en) => setPickupReach(en),
    'chest-stealer': (en) => en ? startChestStealer() : stopChestStealer(),
    'fast-place': (en) => en ? startFastPlace() : stopFastPlace(),
    'safescaffold': (en) => en ? startSafeScaffold() : stopSafeScaffold(),
    'scaffold-ylock': (en) => en ? startScaffoldYLock() : stopScaffoldYLock(),
    'inv-cleaner': (en) => en ? startInventoryCleaner() : stopInventoryCleaner(),
    'auto-armor': (en) => en ? startAutoArmor() : stopAutoArmor(),
    'auto-weapon': (en) => en ? startAutoWeapon() : stopAutoWeapon(),
    'player-coords': (en) => en ? startPlayerCoords() : stopPlayerCoords(),
    'health-tags': (en) => en ? startHealthTags() : stopHealthTags(),
    'hitboxes': (en) => en ? startHitboxes() : stopHitboxes(),
    'nametags': (en) => en ? startNametags() : stopNametags(),
    'player-esp': (en) => setPlayerESP(en),
    'target-hud': (en) => en ? startTargetHUD() : stopTargetHUD(),
    'minimap': (en) => en ? startMinimap() : stopMinimap(),
    'wireframe': (en) => setWireframe(en),
    'blink': (en) => setBlink(en),
    'fake-lag': (en) => en ? startFakeLag() : stopFakeLag(),
    'ore-miner': (en) => en ? startOreMiner() : stopOreMiner(),
    'autorespawn': (en) => {
      if (Fuxny.noa.playerdata) Fuxny.noa.playerdata.autoRespawn = en;
    },
    'clientmove': (en) => {
      if (Fuxny.entities && Fuxny.entities[Fuxny.impKey] && Fuxny.entities[Fuxny.impKey].updateServerOfMovement) Fuxny.entities[Fuxny.impKey].updateServerOfMovement.list[0][Object.keys(Fuxny.entities[Fuxny.impKey].updateServerOfMovement.list[0])[0]] = en ? 0 : 1;
    },
    'freeze': (en) => {
      if (Fuxny.entities && Fuxny.entities[Fuxny.impKey] && Fuxny.entities[Fuxny.impKey].crouchingHandler) Fuxny.entities[Fuxny.impKey].crouchingHandler.list[0][Object.keys(Fuxny.entities[Fuxny.impKey].crouchingHandler.list[0])[0]] = en ? 0 : 1;
    },
    'auto-knockback': (en) => {
      autoKnockbackModule.enabled = en;
    },
    'arraylist': (en) => en ? startArrayList() : stopArrayList()
  };
  function reApplyActiveFeatures() {
    if (!injectedBool) return;
    HACK_LIST.forEach(hack => {
      if (hack.type === 'toggle') {
        const element = document.getElementById(`hack-${hack.id}`);
        if (element && element.checked) {
          if (toggleActions[hack.id]) {
            toggleActions[hack.id](true);
          }
        }
      }
    });
  }
  let isInjecting = false;
  async function handleInjectionSequence() {
    if (injectedBool || isInjecting) return;
    isInjecting = true;
    const MAX_RETRIES = 60;
    for (let i = 0; i < MAX_RETRIES; i++) {
      if (injectedBool) break;
      try {
        performInjection();
      } catch (e) {}
      await sleep(1000);
      if (injectedBool) {
        reApplyActiveFeatures();
        showTemporaryNotification("Injection successful! (Features Restored)", "#4CAF50");
        isInjecting = false;
        return;
      }
    }
    if (!injectedBool) {
      showTemporaryNotification("Auto Injection Failed.", "#FF5252");
    }
    isInjecting = false;
  }
  function startAutoInjectionWatcher() {
    const selector = 'div.MainLoadingState.FullyFancyText';
    const trigger = () => {
      if (!injectedBool) {
        handleInjectionSequence();
      }
    };
    if (document.querySelector(selector)) {
      trigger();
    }
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && node.matches(selector)) {
            injectedBool = false;
            trigger();
          }
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  function setupEventListeners() {
    const TRANSITION_DURATION = 200;
    document.getElementById('inject-btn').addEventListener('click', () => {
      showTemporaryNotification("Attempting to inject...", "#3a78ff");
      try {
        performInjection();
        if (injectedBool) showTemporaryNotification("Injection Successful!", "#4CAF50");
        else showTemporaryNotification("Injection Failed. Check console.", "#FF5252");
      } catch (e) {}
    });
    document.getElementById('new-account-btn').addEventListener('click', clearCookiesAndReload);
    document.getElementById('minimize-hack-ui').addEventListener('click', () => {
      ui.classList.add('hidden');
      setTimeout(() => {
        ui.style.display = 'none';
        reopenBtn.style.display = 'flex';
        requestAnimationFrame(() => reopenBtn.classList.remove('hidden'));
      }, TRANSITION_DURATION);
    });
    const openMenu = (e) => {
      if (e.type === 'click' && reopenBtn.dataset.dragged === 'true') return;
      if (e.type === 'touchstart' && e.cancelable) e.preventDefault();
      if (document.pointerLockElement) document.exitPointerLock();
      reopenBtn.classList.add('hidden');
      setTimeout(() => {
        reopenBtn.style.display = 'none';
        ui.style.display = 'flex';
        requestAnimationFrame(() => ui.classList.remove('hidden'));
      }, TRANSITION_DURATION);
    };
    reopenBtn.addEventListener('click', openMenu);
    reopenBtn.addEventListener('touchstart', openMenu, {
      passive: false
    });
    document.querySelectorAll('.ui-tab-btn').forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.dataset.tab;
        document.querySelectorAll('.ui-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.ui-tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
      });
    });
    document.querySelectorAll('.settings-icon').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = button.dataset.target;
        const settingsDiv = document.getElementById(targetId);
        if (settingsDiv) {
          const isOpen = settingsDiv.classList.toggle('open');
          button.classList.toggle('open', isOpen);
        }
      });
    });
    const preCheck = (featureName, el) => {
      if (!injectedBool) {
        showTemporaryNotification(`Injection is required for ${featureName}. Join a game to inject.`, "#FF5252");
        if (el && el.type === 'checkbox') el.checked = false;
        return false;
      }
      return true;
    };
    HACK_LIST.forEach(hack => {
      const element = document.getElementById(`hack-${hack.id}`),
        keybindBtn = document.querySelector(`.keybind-btn[data-hack-id="${hack.id}"]`);
      if (hack.type === 'toggle') {
        element.addEventListener('change', (e) => {
          if (!preCheck(hack.name, e.currentTarget)) return;
          const isEnabled = e.currentTarget.checked;
          if (toggleActions[hack.id]) {
            toggleActions[hack.id](isEnabled);
          }
          showTemporaryNotification(`${hack.name} ${isEnabled ? 'Enabled' : 'Disabled'}`);
        });
      } else if (hack.type === 'hold') {
        if (hack.id === 'autosw') {
          const start = () => {
            if (preCheck(hack.name)) startAutoSW();
          };
          const stop = () => stopAutoSW();
          element.addEventListener('mousedown', start);
          element.addEventListener('mouseup', stop);
          element.addEventListener('mouseleave', stop);
          element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            start();
          });
          element.addEventListener('touchend', stop);
        } else if (hack.id === 'trap-enemy') {
          const start = () => {
            if (preCheck(hack.name)) startTrapEnemy();
          };
          const stop = () => stopTrapEnemy();
          element.addEventListener('mousedown', start);
          element.addEventListener('mouseup', stop);
          element.addEventListener('mouseleave', stop);
          element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            start();
          });
          element.addEventListener('touchend', stop);
        } else if (hack.id === 'trap-self') {
          const start = () => {
            if (preCheck(hack.name)) startTrapSelf();
          };
          const stop = () => stopTrapSelf();
          element.addEventListener('mousedown', start);
          element.addEventListener('mouseup', stop);
          element.addEventListener('mouseleave', stop);
          element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            start();
          });
          element.addEventListener('touchend', stop);
        }
      } else if (hack.type === 'action') {
        element.addEventListener('click', () => {
          if (!preCheck(hack.name)) return;
          if (hack.id === 'sort-inventory') {
            sortInventory();
          } else if (hack.id === 'sort-chest') {
            sortChest();
          } 
        });
      }
      keybindBtn.addEventListener('click', () => {
        keybindBtn.textContent = '...';
        keybindBtn.classList.add('waiting');
        const keydownHandler = (e) => {
          if (e.isComposing || ['Convert', 'NonConvert', 'Alphanumeric', 'KanaMode', 'Process'].includes(e.code) || ['Convert', 'NonConvert', 'Alphanumeric', 'KanaMode', 'Process'].includes(e.key)) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          let newKey = (e.key === 'Escape') ? (keybinds[hack.id] || 'None') : (e.key === 'Delete' || e.key === 'Backspace' || e.code === 'Delete' || e.code === 'Backspace') ? 'None' : e.code;
          saveKeybind(hack.id, newKey);
          keybindBtn.classList.remove('waiting');
          window.removeEventListener('keydown', keydownHandler, true);
        };
        window.addEventListener('keydown', keydownHandler, true);
      });
    });
    makeElementDraggable(uiContainer);
    makeElementDraggable(reopenBtn);
  }
  (async () => {
    setupEventListeners();
    loadSettings();
    loadPositions();
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    startAutoInjectionWatcher();
  })();
})();
