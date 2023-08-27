// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

async function init(format) {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new TypeError('Failed to obtain WebGPU adapter.');
    }
    const device = await adapter.requestDevice();
    device.lost.then((info)=>{
        console.warn('WebGPU device lost. :(', info.message, info);
    });
    const module = device.createShaderModule({
        label: '😎 shaders 😎',
        code: await fetch('./shader-test.wgsl').then((r)=>r.text())
    });
    const pipeline = device.createRenderPipeline({
        label: '✨ pipeline ✨',
        layout: 'auto',
        vertex: {
            module,
            entryPoint: 'vertex_main',
            buffers: [
                {
                    arrayStride: 4 * 4,
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: 'float32x4'
                        }
                    ]
                }
            ]
        },
        fragment: {
            module,
            entryPoint: 'fragment_main',
            targets: [
                {
                    format
                }
            ]
        }
    });
    const vertexData = new Float32Array([
        0,
        0,
        1,
        0,
        -0.1,
        -0.5,
        0.5,
        0.5,
        -0.5,
        0,
        0,
        0
    ]);
    const vertices = device.createBuffer({
        label: 'vertex buffer vertices',
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(vertices, 0, vertexData);
    const uniform = device.createBuffer({
        label: 'Xx uniform buffer xX',
        size: 1 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    const group = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniform
                }
            }
        ]
    });
    return {
        device,
        render: (view)=>{
            device.queue.writeBuffer(uniform, 0, new Float32Array([
                0.4
            ]));
            const encoder = device.createCommandEncoder({
                label: 'Xx encoder xX '
            });
            const pass = encoder.beginRenderPass({
                label: 'Xx render pass xX',
                colorAttachments: [
                    {
                        view,
                        clearValue: [
                            0,
                            0,
                            0.4,
                            1
                        ],
                        loadOp: 'clear',
                        storeOp: 'store'
                    }
                ]
            });
            pass.setPipeline(pipeline);
            pass.setVertexBuffer(0, vertices);
            pass.setBindGroup(0, group);
            pass.draw(3, 6);
            pass.end();
            device.queue.submit([
                encoder.finish()
            ]);
        }
    };
}
const canvas = document.getElementById('canvas');
if (!(canvas instanceof HTMLCanvasElement)) {
    throw new TypeError('Failed to find the canvas element.');
}
const context = canvas.getContext('webgpu');
if (!context) {
    throw new TypeError('Failed to get WebGPU canvas context.');
}
if (!navigator.gpu) {
    throw new TypeError('Client does not support WebGPU. Sad!');
}
const format = navigator.gpu.getPreferredCanvasFormat();
const { device , render  } = await init(format);
context.configure({
    device,
    format
});
render(context.getCurrentTexture().createView());
