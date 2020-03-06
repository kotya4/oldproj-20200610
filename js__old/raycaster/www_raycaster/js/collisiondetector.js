
function CollisionDetector() {
  const scale = (v, a) => v.map(e => e * a);
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const mag = v => Math.sqrt(dot(v, v));
  const normalize = (v) => { const m = mag(v); return [v[0] / m, v[1] / m]; }

  function collision_correction(player, cline) {
    const eps = 0.01;
    const line_start = cline[0];
    const line_end = cline[1];
    const player_start = player[0];
    const player_end = player[1];
    // The line to collide to, made from two points
    const line = sub(line_end, line_start);
    // The line normal
    const normal = normalize([line[1], -line[0]]);
    // The closest distance to the line from the origin (0, 0), is in the direction of the normal
    let d = dot(normal, line_start);
    // Check the distance from the line to the player start position
    const start_dist = dot(normal, player_start) - d;
    // If the distance is negative, that means the player is 'behind' the line
    // To correctly use the normal, if that is the case, invert the normal
    if(start_dist < 0) {
      normal[0] = -normal[0];
      normal[1] = -normal[1];
      d = -d;
    }
    // Check the distance from the line to the player end position
    // (using corrected normal if necessary, so playerStart is always in front of the line now)
    const end_dist = 1 * dot(normal, player_end) - d;
    // Check if playerEnd is behind the line
    if(end_dist < 0) {
     // Here a collision has occured.
     // Calculate the new position by moving playerEnd out to the line in the direction of the normal,
     // and a little bit further to counteract floating point inaccuracies
     return add(player_end, scale(normal, eps - end_dist));
     // eps should be something less than a visible pixel, so it's not noticeable
    }
    return null;
  }

  return collision_correction;
}
