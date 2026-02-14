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
// 0 = Y, 1 = X
@group(0) @binding(1) var<uniform> direction: i32;
@group(0) @binding(2) var<uniform> texture_size: vec2<f32>;
@group(0) @binding(3) var<uniform> resolution: u32;
@group(1) @binding(0) var texture: texture_2d<f32>;
@group(2) @binding(0) var<storage, read> weights: array<f32>;

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    if (arrayLength(&weights) <= 1) {
        return textureSample(texture, texture_sampler, vertex.tex_coord);
    }

    var sum = vec4(0.0);
    var count = 0.0;
    for (var i: u32 = 0; i < arrayLength(&weights); i++) {
        let gaussian = weights[i];
        let ti = f32(i * resolution) / select(texture_size.y, texture_size.x, direction != 0);
        var tex_coord: vec2<f32>;

        if (direction == 0) {
            tex_coord = vertex.tex_coord - vec2(0, ti);
        } else {
            tex_coord = vertex.tex_coord - vec2(ti, 0);
        }
        let sample_left = textureSample(texture, texture_sampler, tex_coord);
        if (ti >= 0.0 && ti < 1.0) {
            sum += sample_left * gaussian;
            count += gaussian;
        }

        if (direction == 0) {
            tex_coord = vertex.tex_coord + vec2(0, ti);
        } else {
            tex_coord = vertex.tex_coord + vec2(ti, 0);
        }
        let sample_right = textureSample(texture, texture_sampler, tex_coord);
        if (i > 0 && ti >= 0.0 && ti < 1.0) {
            sum += sample_right * gaussian;
            count += gaussian;
        }
    }
    return sum / count;
}
