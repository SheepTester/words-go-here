struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) tex_coord: vec2<f32>,
};

@vertex
fn vertex_main(
    @builtin(vertex_index) index: u32,
) -> VertexOutput {
    const vertices = array(
        vec2(0.0, 0), vec2(0, 1), vec2(1, 1),
        vec2(1, 1), vec2(1, 0), vec2(0, 0),
    );

    var result: VertexOutput;
    result.position = vec4(vertices[index] * 2 - vec2(1, 1), 0, 1);
    result.tex_coord = vec2(vertices[index].x, 1 - vertices[index].y);
    return result;
}

@group(0) @binding(0) var<uniform> texture_size: vec2<f32>;
@group(0) @binding(1) var texture_sampler: sampler;
@group(1) @binding(0) var texture: texture_2d<f32>;

fn blur(center: vec2<f32>, axis: vec2<f32>) -> vec4<f32> {
    const samples = array(
        0.022190548492442994,
        0.04558899978527853,
        0.079811408240092,
        0.11906462996609923,
        0.1513608096777361,
        0.16396720767670223,
        0.1513608096777361,
        0.11906462996609923,
        0.079811408240092,
        0.04558899978527853,
        0.022190548492442994,
    );
    var sum: vec4<f32> = vec4();
    for (var x = -4; x <= 4; x++) {
        sum += textureSample(texture, texture_sampler, center + axis * f32(x)) * samples[x + 4];
    }
    return sum;
}

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    // 1 at middle of screen, 0 towards edges
    let vignette = 16 * vertex.tex_coord.x * vertex.tex_coord.y * (1 - vertex.tex_coord.x) * (1 - vertex.tex_coord.y);
    // from -width/2 to width/2, etc.
    let coord = (vertex.tex_coord - 0.5) * texture_size;
    // A pixel towards the center of the screen
    let pixel = -normalize(coord) / texture_size;
    let aberration = pixel * (1 - pow(vignette, 0.5)) * 8;
    let blur_spacing = pixel * (1 - pow(vignette, 0.5)) * 3;
    return vec4(
        blur(vertex.tex_coord + aberration, blur_spacing).r,
        blur(vertex.tex_coord, blur_spacing).g,
        blur(vertex.tex_coord - aberration, blur_spacing).b,
        1
    ) * (pow(vignette, 0.25) * 0.5 + 0.5);
}
