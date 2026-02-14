struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) tex_coord: vec2<f32>,
};

@vertex
fn vertex_main(
    @builtin(vertex_index) index: u32,
) -> VertexOutput {
    const pos = array(
        vec2(0, 0), vec2(1, 0), vec2(1, 1),
        vec2(1, 1), vec2(0, 1), vec2(0, 0.0),
    );
    var result: VertexOutput;
    result.position = vec4(pos[index] * 2 - vec2(1), 0, 1);
    result.tex_coord = pos[index];
    return result;
}

@group(0) @binding(0) var<uniform> blur: f32;
@group(0) @binding(1) var<uniform> texture_size: vec2<f32>;
@group(0) @binding(2) var texture_sampler: sampler;
@group(1) @binding(0) var texture: texture_2d<f32>;

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    return textureSample(texture, texture_sampler, vertex.tex_coord * (blur * 0.0 + 1.0 + texture_size.x * 0.0));
}
