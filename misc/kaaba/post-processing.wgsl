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

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    let vignette = 16 * vertex.tex_coord.x * vertex.tex_coord.y * (1 - vertex.tex_coord.x) * (1 - vertex.tex_coord.y);
    let pixel = 1 / texture_size;
    return vec4(
        textureSample(texture, texture_sampler, vertex.tex_coord - pixel * (1 - vignette) * 5).r,
        textureSample(texture, texture_sampler, vertex.tex_coord).g,
        textureSample(texture, texture_sampler, vertex.tex_coord + pixel * (1 - vignette) * 5).b,
        1
    ) * (pow(vignette, 0.25) * 0.5 + 0.5);
}
