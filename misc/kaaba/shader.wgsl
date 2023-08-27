struct VertexOutput {
    @location(0) tex_coord: vec2<f32>,
    @builtin(position) position: vec4<f32>,
};

@group(0)
@binding(0)
var<uniform> transform: mat4x4<f32>;

@vertex
fn vertex_main(
    @builtin(instance_index) index: u32,
    @location(0) position: vec4<u8>,
    @location(1) textureId: u8,
) -> VertexOutput {
    var result: VertexOutput;
    result.tex_coord = tex_coord;
    result.position = transform * vec4(position.xyz, 1.0);
    return result;
}

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(0, 1, 1, 1.0);
}
