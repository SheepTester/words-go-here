struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) tex_coord: vec2<f32>,
    @location(1) darkness: f32,
};

@group(0) @binding(0) var<uniform> perspective: mat4x4<f32>;
@group(0) @binding(1) var<uniform> camera: mat4x4<f32>;
@group(1) @binding(0) var<uniform> transform: mat4x4<f32>;

fn to_i8(byte: u32) -> i32 {
    return i32(select(byte, byte - 256, byte >> 7 != 0));
}

@vertex
fn vertex_main(
    @builtin(vertex_index) index: u32,
    @location(0) data: vec2<u32>,
) -> VertexOutput {
    let input = array(
        extractBits(data.x, 0 * 8, 8), // block x in chunk
        extractBits(data.x, 1 * 8, 8), // block y in chunk
        extractBits(data.x, 2 * 8, 8), // block z in chunk
        extractBits(data.x, 3 * 8, 8), // face direction
        extractBits(data.y, 0 * 8, 8), // texture id
        extractBits(data.y, 1 * 8, 8), // ao
        extractBits(data.y, 2 * 8, 8),
        extractBits(data.y, 3 * 8, 8),
    );
    let position = vec3<f32>(vec3(
        to_i8(input[0]),
        to_i8(input[1]),
        to_i8(input[2]),
    ));
    let face = input[3];

    const textures = array(
        vec2(0.0, 1.0), vec2(1.0, 1.0), vec2(2.0, 1.0),
    );
    let texture_id = input[4];

    // The back face (facing away from the camera)
    const square_vertices = array(
        vec2(0.0, 0.0), vec2(0.0, 1.0), vec2(1.0, 1.0),
        vec2(1.0, 1.0), vec2(1.0, 0.0), vec2(0.0, 0.0),
    );
    let square_vertex = square_vertices[index];
    let flipped = select(
        vec3(square_vertex.x, square_vertex.y, 0.0),
        // Rotate ("flip") around center of cube
        vec3(1.0 - square_vertex.x, square_vertex.y, 1.0),
        (face & 1) != 0,
    );
    let rotated = select(
        select(
            // 00x: back/front
            flipped,
            // 01x: left/right
            vec3(flipped.z, flipped.y, 1.0 - flipped.x),
            (face & 2) != 0
        ),
        // 10x: bottom/top
        vec3(flipped.x, flipped.z, 1.0 - flipped.y),
        (face & 4) != 0
    );

    const ao_indices = array<u32, 6>(0, 1, 3, 3, 2, 0);
    let corner_neighbors = (input[5] >> (2 * ao_indices[index])) & 3;

    let normal_dir = select(-1.0, 1.0, (face & 1) != 0);
    let normal = select(
        select(
            vec3(0, 0, normal_dir),
            vec3(normal_dir, 0, 0),
            (face & 2) != 0
        ),
        vec3(0, normal_dir, 0),
        (face & 4) != 0
    );
    const LIGHT = normalize(vec3(0.1, -1, -0.5));

    var result: VertexOutput;
    result.position = perspective * camera * transform * vec4((rotated + position.xyz), 1.0);
    result.tex_coord = textures[texture_id] + vec2(1 - f32(square_vertices[index].x), f32(square_vertices[index].y));
    result.darkness = (dot(normal, -LIGHT) / 8 + 0.875) * (1.0 - f32(corner_neighbors) / 3.0 * 0.5);
    return result;
}

@group(0) @binding(4) var<uniform> texture_size: vec2<f32>;
@group(0) @binding(2) var texture_sampler: sampler;
@group(0) @binding(3) var texture: texture_2d<f32>;

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    // Prevent texture atlas bleeding
    let frac_whole = modf(vertex.tex_coord);
    let coord = frac_whole.whole + clamp(frac_whole.fract, vec2(1/32.0, 1/32.0), vec2(31/32.0, 31/32.0));
    let sample = textureSample(texture, texture_sampler, coord / texture_size);
    if (sample.a == 0) {
        discard;
    }
    return vec4(sample.rgb * vertex.darkness, sample.a);
}
