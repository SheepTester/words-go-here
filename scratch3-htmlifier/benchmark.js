const Scratch = window.Scratch = window.Scratch || {};

const runBenchmark = function () {
  const vm = new window.NotVirtualMachine();
  Scratch.vm = vm;

  const storage = new ScratchStorage();
  const AssetType = storage.AssetType;
  storage.addWebStore([AssetType.Project], () => PROJECT_JSON);
  storage.addWebStore([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], asset => ASSETS[asset.assetId]);
  vm.attachStorage(storage);

  if (SRC === 'file') {
    fetch(FILE)
      .then(r => r.arrayBuffer())
      .then(b => Scratch.vm.loadProject(b));
  } else {
    Scratch.vm.downloadProjectId('');
  }
  vm.on('workspaceUpdate', () => {
    try {
      const storage = localStorage;
      const set = (name, value) => storage.setItem('[s3] ' + name, value);
      const get = name => storage.getItem('[s3] ' + name);
      const remove = name => storage.removeItem('[s3] ' + name);

      vm.setCloudProvider({
        createVariable({name, value}) {
          set(name, value);
        },
        updateVariable(name, value) {
          set(name, value);
        },
        renameVariable(oldName, newName) {
          set(newName, get(oldName));
          remove(oldName);
        },
        deleteVariable(name) {
          remove(name);
        },
        requestCloseConnection() {
          // do nothing
        }
      });

      setTimeout(() => {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key.slice(0, 5) === '[s3] ') {
            vm.postIOData('cloud', {
              varUpdate: {
                name: key.slice(5),
                value: storage.getItem(key)
              }
            });
          }
        }
      });
    } catch (e) {
      console.warn('Cannot use localStorage?', e);
    }

    vm.setCompatibilityMode(COMPAT);
    vm.setTurboMode(TURBO);
    vm.greenFlag();

    document.body.removeChild(document.getElementById('j'));
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.resize(rect.width, rect.height);
    monitorWrapper.style.transform = `scale(${rect.width / 480})`;
  }
  const monitorWrapper = document.getElementById('m');
  const canvas = document.getElementById('s');
  const renderer = new window.ScratchRender(canvas);
  resize();
  Scratch.renderer = renderer;
  vm.attachRenderer(renderer);
  const audioEngine = new window.AudioEngine();
  vm.attachAudioEngine(audioEngine);
  vm.attachV2SVGAdapter(new ScratchSVGRenderer.SVGRenderer());
  vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter());

  const getEventXY = e => {
    if (e.touches && e.touches[0]) {
      return {x: e.touches[0].clientX, y: e.touches[0].clientY};
    } else if (e.changedTouches && e.changedTouches[0]) {
      return {x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY};
    }
    return {x: e.clientX, y: e.clientY};
  };
  function mousemove(e) {
    const mouse = getEventXY(e);
    const rect = canvas.getBoundingClientRect();
    Scratch.vm.postIOData('mouse', {
      x: mouse.x - rect.left,
      y: mouse.y - rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height
    });
  }
  function mousedown(e) {
    const mouse = getEventXY(e);
    const rect = canvas.getBoundingClientRect();
    Scratch.vm.postIOData('mouse', {
      isDown: true,
      x: mouse.x - rect.left,
      y: mouse.y - rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height
    });
    e.preventDefault();
  }
  function mouseup(e) {
    const mouse = getEventXY(e);
    const rect = canvas.getBoundingClientRect();
    Scratch.vm.postIOData('mouse', {
      isDown: false,
      x: mouse.x - rect.left,
      y: mouse.y - rect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height
    });
    e.preventDefault();
  }
  document.addEventListener('mousemove', mousemove);
  canvas.addEventListener('mousedown', mousedown);
  document.addEventListener('mouseup', mouseup);
  document.addEventListener('touchmove', mousemove);
  canvas.addEventListener('touchstart', mousedown, {passive: false});
  document.addEventListener('touchend', mouseup, {passive: false});
  canvas.addEventListener('wheel', e => {
    Scratch.vm.postIOData('mouseWheel', {
      deltaX: e.deltaX,
      deltaY: e.deltaY
    });
    e.preventDefault();
  });
  window.addEventListener('resize', resize);

  document.addEventListener('keydown', e => {
    Scratch.vm.postIOData('keyboard', {
      keyCode: e.keyCode,
      key: e.key,
      isDown: true
    });
    e.preventDefault();
  });
  document.addEventListener('keyup', e => {
    Scratch.vm.postIOData('keyboard', {
      keyCode: e.keyCode,
      key: e.key,
      isDown: false
    });
  });

  Scratch.vm.runtime.addListener('QUESTION', question => {
    if (question !== null)
      Scratch.vm.runtime.emit('ANSWER', prompt(question));
  });

  const getVariable = (targetId, variableId) => {
      const target = targetId ?
          Scratch.vm.runtime.getTargetById(targetId) :
          Scratch.vm.runtime.getTargetForStage();
      return target.variables[variableId];
  };
  const monitorStates = {};
  let once = false;
  Scratch.vm.runtime.addListener('MONITORS_UPDATE', monitors => {
    monitors.forEach((record, id) => {
      if (!monitorStates[id]) {
        const monitor = document.createElement('div');
        monitor.className = 'monitor ' + record.mode;
        monitor.style.left = record.x + 'px';
        monitor.style.top = record.y + 'px';
        if (record.mode === 'list') {
          monitor.style.width = record.width + 'px';
          monitor.style.height = record.height + 'px';
        }
        const label = document.createElement('span');
        label.className = 'monitor-label';
        let name = record.params.VARIABLE || record.params.LIST || record.opcode;
        if (record.spriteName) name = `${record.spriteName}: ${name}`;
        label.textContent = name;
        monitor.appendChild(label);
        const value = document.createElement('span');
        value.className = 'monitor-value';
        monitor.appendChild(value);
        monitorStates[id] = {monitor, value};
        if (record.mode === 'slider') {
          const slider = document.createElement('input');
          slider.type = 'range';
          slider.min = record.sliderMin;
          slider.max = record.sliderMax;
          slider.step = record.isDiscrete ? 1 : 0.01;
          slider.addEventListener('input', e => {
            getVariable(record.targetId, id).value = slider.value;
          });
          slider.addEventListener('change', e => {
            getVariable(record.targetId, id).value = slider.value;
          });
          monitorStates[id].slider = slider;
          monitor.appendChild(slider);
        }
        monitorWrapper.appendChild(monitor);
      }
      monitorStates[id].monitor.style.display = record.visible ? null : 'none';
      if (record.visible) {
        let value = record.value;
        if (typeof value === 'number') {
          value = Number(value.toFixed(6));
        }
        if (typeof value === 'boolean') {
          value = value.toString();
        }
        if (Array.isArray(value)) {
          if (monitorStates[id].lastValue === JSON.stringify(value)) return;
          monitorStates[id].value.innerHTML = '';
          value.forEach(val => {
            const row = document.createElement('div');
            row.className = 'row';
            row.textContent = val;
            monitorStates[id].value.appendChild(row);
          });
        } else {
          monitorStates[id].value.textContent = value;
          if (monitorStates[id].slider) monitorStates[id].slider.value = value;
        }
      }
    });
  });

  Scratch.vm.postIOData('userData', {username: DESIRED_USERNAME});

  vm.start();
};

window.onload = function () {
  runBenchmark();
};
