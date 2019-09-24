#!/usr/bin/env python3

def mask(point, depth):
    # Point has to be normalized, outter rect's size is 1x1.
    # 00b -- Left Top
    # 01b -- Right Top
    # 10b -- Left Bottom
    # 11b -- Right Bottom
    mask = 0
    quad_size = 1.0
    quad_posx = 0
    quad_posy = 0
    quad_posz = 0
    for i in range(depth):
        quad_size /= 2.0
        if point[2] > quad_posz:
            mask |= 1 << ((i << 1) + 2)
            quad_posz += quad_size
        if point[1] > quad_posy:
            mask |= 1 << ((i << 1) + 1)
            quad_posy += quad_size
        if point[0] > quad_posx:
            mask |= 1 << ((i << 1) + 0)
            quad_posx += quad_size
    return mask
