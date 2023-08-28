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

// Flips a cube face around the center of the cube. [x; y; 1] -> [x; y; z]
// (Note: these constructors are column-major.)
const NO_FLIP: mat3x3<i32> = mat3x3(1, 0, 0, 0, 1, 0, 0, 0, 0);
const FLIP: mat3x3<i32> = mat3x3(-1, 0, 0, 0, 1, 0, 1, 0, 1);

// Rotates a cube face around the center of the cube. [x; y; z; 1]
const BACK_FRONT: mat4x4<i32> = mat4x4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
const LEFT_RIGHT: mat4x4<i32> = mat4x4(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);
const BOTTOM_TOP: mat4x4<i32> = mat4x4(1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1);

@vertex
fn vertex_main(
    @builtin(instance_index) index: u32,
    @location(0) data: vec2<u32>,
) -> VertexOutput {
    let position = vec3(extractBits(data.x, 0, 8), extractBits(data.x, 8, 8), extractBits(data.x, 16, 8));
    let face = extractBits(data.x, 24, 8);
    let texture_id = extractBits(data.y, 0, 8);

    // The back face (facing away from the camera)
    const square_vertices = array(
        vec2(0, 0), vec2(0, 1), vec2(1, 1),
        vec2(1, 1), vec2(1, 0), vec2(0, 0),
    );
    let vertex =
        select(select(BACK_FRONT, LEFT_RIGHT, (face & 2) != 0), BOTTOM_TOP, (face & 4) != 0) *
        vec4(select(NO_FLIP, FLIP, (face & 1) != 0) * vec3(square_vertices[index], 1), 1);
    var result: VertexOutput;
    result.position = perspective * camera * vec4<f32>(vertex + vec4(position.xyz, 1));
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
