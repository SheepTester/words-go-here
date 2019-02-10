window.runBenchmark = (() => {
const collecteyData = {assets: {}};

/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project file.
 */
const getProjectUrl = function (asset) {
    const assetIdParts = asset.assetId.split('.');
    const assetUrlParts = ['https://projects.scratch.mit.edu/', assetIdParts[0]];
    if (assetIdParts[1]) {
        assetUrlParts.push(assetIdParts[1]);
    }
    return collecteyData.projectJSON = assetUrlParts.join('');
};

/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project asset (PNG, WAV, etc.)
 */
const getAssetUrl = function (asset) {
    const assetUrlParts = [
        'https://cdn.assets.scratch.mit.edu/',
        'internalapi/asset/',
        asset.assetId,
        '.',
        asset.dataFormat,
        '/get/'
    ];
    return collecteyData.assets[asset.assetId] = assetUrlParts.join('');
};

/**
 * Run the benchmark with given parameters in the location's hash field or
 * using defaults.
 */
const runBenchmark = function (id) {
  return new Promise(res => {
    // Lots of global variables to make debugging easier
    // Instantiate the VM.
    const vm = new window.VirtualMachine();

    const storage = new ScratchStorage(); /* global ScratchStorage */
    const AssetType = storage.AssetType;
    storage.addWebStore([AssetType.Project], getProjectUrl);
    storage.addWebStore([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], getAssetUrl);
    vm.attachStorage(storage);

    vm.downloadProjectId(id);

    vm.on('workspaceUpdate', () => {
        res(collecteyData);
    });

    // Instantiate the renderer and connect it to the VM.

    // const canvas = document.getElementById('scratch-stage');
    // const rect = canvas.getBoundingClientRect();
    // const renderer = new window.ScratchRender(canvas);
    // renderer.resize(rect.width, rect.height);
    // Scratch.renderer = renderer;
    // vm.attachRenderer(renderer);
    // const audioEngine = new window.AudioEngine();
    // vm.attachAudioEngine(audioEngine);
    // vm.attachV2SVGAdapter(new ScratchSVGRenderer.SVGRenderer());
    // vm.attachV2BitmapAdapter(new ScratchSVGRenderer.BitmapAdapter());

    // Run threads
    vm.start();
  });
};
return runBenchmark;
})();
