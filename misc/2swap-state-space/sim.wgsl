struct Node {
  pos: vec3f,
  vel: vec3f,
}

@binding(0) @group(0) var<storage, read> nodes_in: array<Node>;
@binding(1) @group(0) var<storage, read_write> nodes_out: array<Node>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u) {
  var index = global_invocation_id.x;

  var node_pos = nodes_in[index].pos;
  var node_vel = nodes_in[index].vel;
  var pos: vec3f;
  var vel: vec3f;

  for (var i = 0u; i < arrayLength(&nodes_in); i++) {
    if (i == index) {
      continue;
    }

    pos = nodes_in[i].pos.xyz;
    vel = nodes_in[i].vel.xyz;
  }

  nodes_out[index].pos = node_pos;
  nodes_out[index].vel = node_vel;
}
