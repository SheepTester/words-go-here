struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec3<f32>,
};

@group(0)
@binding(0)
var<uniform> perspective: mat4x4<f32>;

@group(0)
@binding(1)
var<uniform> camera: mat4x4<f32>;

fn to_i8(byte: u32) -> i32 {
    return i32(select(byte, byte - 256, byte >> 7 != 0));
}

@vertex
fn vertex_main(
    @builtin(vertex_index) index: u32,
    @location(0) data: vec2<u32>,
) -> VertexOutput {
    let position = vec3(
        to_i8(extractBits(data.x, 0, 8)),
        to_i8(extractBits(data.x, 8, 8)),
        to_i8(extractBits(data.x, 16, 8)),
    );
    let face = extractBits(data.x, 24, 3);
    let texture_id = extractBits(data.y, 0, 8);

    // The back face (facing away from the camera)
    const square_vertices = array(
        vec2(0, 0), vec2(0, 1), vec2(1, 1),
        vec2(1, 1), vec2(1, 0), vec2(0, 0),
    );
    let square_vertex = square_vertices[index];
    let flipped = select(
        vec3(square_vertex.x, square_vertex.y, 0),
        // Rotate ("flip") around center of cube
        vec3(-square_vertex.x + 1, square_vertex.y, 1),
        (face & 1) != 0,
    );
    let rotated = select(
        select(
            // 00x: back/front
            flipped,
            // 01x: left/right
            vec3(flipped.z, flipped.y, -flipped.x + 1),
            (face & 2) != 0
        ),
        // 10x: bottom/top
        vec3(flipped.x, flipped.z, -flipped.y + 1),
        (face & 4) != 0
    );
    var result: VertexOutput;
    result.position = perspective * camera * vec4(vec3<f32>(rotated + position.xyz), 1.0);
    // result.position = vec4(vec3<f32>(rotated + position.xyz) / 2, 1.0);
    _ = perspective * camera;
    // result.position = vec4(vec2<f32>(square_vertices[index]), 0, 1);
    result.color = vec3(
        select(0.0, 1.0, position.x % 2 == 1),
        select(0.0, 1.0, position.y % 2 == 1),
        select(0.0, 1.0, position.z % 2 == 1),
    );
    return result;
}

@fragment
fn fragment_main(vertex: VertexOutput) -> @location(0) vec4<f32> {
    return vec4<f32>(vertex.color, 1.0);
}
