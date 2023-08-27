struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec2<f32>,
};

@group(0)
@binding(1)
var<uniform> perspective: mat4x4<f32>;

@group(0)
@binding(2)
var<uniform> camera: mat4x4<f32>;

@vertex
fn vertex_main(
    @builtin(vertex_index) index: u32,
    @location(0) position: vec4<f32>,
) -> VertexOutput {
    const pos = array(
        vec2(0, 0), vec2(1, 0), vec2(1, 1),
        vec2(1, 1), vec2(0, 1), vec2(0, 0.0),
    );
    var result: VertexOutput;
    result.position = perspective * camera * vec4(pos[index] + position.xy, -5, 1);
    result.color = position.zw;
    return result;
}

@group(0)
@binding(0)
var<uniform> red: f32;

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    return vec4(red, vertex.color, 1);
}
