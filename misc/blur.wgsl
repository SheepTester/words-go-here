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
@group(0) @binding(3) var<uniform> blur: f32;
@group(0) @binding(4) var<uniform> resolution: i32;
@group(0) @binding(5) var<uniform> give_up: f32;
@group(1) @binding(0) var texture: texture_2d<f32>;

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    if (blur == 0.0) {
        return textureSample(texture, texture_sampler, vertex.tex_coord);
    }

    // log is natural log
    let radius = i32(ceil(blur * sqrt(-log(give_up / 255))));
    var sum = vec4(0.0);
    var count = 0.0;
    for (var i = 0; i <= radius; i += resolution) {
        let fi = f32(i);
        var ti: f32;
        var tex_coord: vec2<f32>;

        if (direction == 0) {
            ti = vertex.tex_coord.y - fi / texture_size.y;
            tex_coord = vec2(vertex.tex_coord.x, ti);
        } else {
            ti = vertex.tex_coord.x - fi / texture_size.x;
            tex_coord = vec2(ti, vertex.tex_coord.y);
        }
        let sample_left = textureSample(texture, texture_sampler, tex_coord);
        if (ti >= 0.0 && ti < 1.0) {
            let fi_blur = fi / blur;
            let gaussian = exp(-fi_blur * fi_blur);
            sum += sample_left * gaussian;
            count += gaussian;
        }

        if (direction == 0) {
            ti = vertex.tex_coord.y + fi / texture_size.y;
            tex_coord = vec2(vertex.tex_coord.x, ti);
        } else {
            ti = vertex.tex_coord.x + fi / texture_size.x;
            tex_coord = vec2(ti, vertex.tex_coord.y);
        }
        let sample_right = textureSample(texture, texture_sampler, tex_coord);
        if (i > 0 && ti >= 0.0 && ti < 1.0) {
            let fi_blur = fi / blur;
            let gaussian = exp(-fi_blur * fi_blur);
            sum += sample_right * gaussian;
            count += gaussian;
        }
    }
    return sum / count;
}
