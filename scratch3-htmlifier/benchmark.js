const Scratch = window.Scratch = window.Scratch || {};

const runBenchmark = function () {
  const vm = new window.VirtualMachine();
  Scratch.vm = vm;

  const storage = new ScratchStorage();
  const AssetType = storage.AssetType;
  storage.addWebStore([AssetType.Project], () => PROJECT_JSON);
  storage.addWebStore([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], asset => ASSETS[asset.assetId]);
  vm.attachStorage(storage);

  Scratch.vm.downloadProjectId('');
  vm.on('workspaceUpdate', () => {
    vm.greenFlag();
    document.body.removeChild(document.getElementById('j'));
  });

  const canvas = document.getElementById('s');
  const rect = canvas.getBoundingClientRect();
  const renderer = new window.ScratchRender(canvas);
  renderer.resize(rect.width, rect.height);
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

  Scratch.vm.postIOData('userData', {username: DESIRED_USERNAME});

  vm.start();
};

window.onload = function () {
  runBenchmark();
};
