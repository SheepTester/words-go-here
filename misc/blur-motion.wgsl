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

@group(0) @binding(0) var texture_sampler: sampler;
@group(1) @binding(0) var texture: texture_2d<f32>;
@group(2) @binding(0) var<storage, read> positions: array<vec2<f32>>;

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    let length = arrayLength(&positions);
    if (length <= 1) {
        return textureSample(texture, texture_sampler, vertex.tex_coord);
    }

    var sum = vec4(0.0);
    var total = 0;
    for (var i: u32 = 0; i < length; i++) {
        var t = vertex.tex_coord + positions[i];
        if (t.x < 0 || t.x >= 1) {
           t.x = 1 - t.x;
        }
        if (t.y < 0 || t.y >= 1) {
           t.y = 1 - t.y;
        }
        sum += textureSample(texture, texture_sampler, t);
        total++;
    }
    return select(sum, sum / f32(total), total != 0);
}
