struct VertexOutput {
    @builtin(position) position: vec4<f32>,
};

@vertex
fn vertex_main(
    @location(0) position: vec2<f32>,
) -> VertexOutput {
    var result: VertexOutput;
    result.position = vec4(position.xy, 0, 1);
    return result;
}

@group(0)
@binding(0)
var<uniform> red: f32;

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(red, vertex.position.x, 1, 1);
}
