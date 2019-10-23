#!/usr/bin/env python3

class Quadtree:
    def __init__(self, points, rect, depth):
        self.raw = self.__generate(points, rect, depth)


    def __in_rect(self, point, rect):
        """ Tests is point in rect or not. """
        return rect[0] <= point[0] and point[0] <= rect[0] + rect[2] and \
               rect[1] <= point[1] and point[1] <= rect[1] + rect[3]


    # points -- list(list(x, y)[, ...]), floats in range [0,1)
    # rect   -- list(left, top, width, height), floats
    # depth  -- nesting iterator (approximation accurancy), int
    def __generate(self, points, rect, depth):
        depth -= 1
        if len(points) == 0 or depth < 0: return None

        rect_L = rect[0]           # left
        rect_T = rect[1]           # top
        half_W = rect[2] / 2       # half width
        half_H = rect[3] / 2       # half height
        half_X = rect[0] + half_W  # horisontal center
        half_Y = rect[1] + half_H  # vertical center

        #          left    top     width   height
        rect_LT = (rect_L, rect_T, half_W, half_H) # left top
        rect_RT = (half_X, rect_T, half_W, half_H) # right top
        rect_LB = (rect_L, half_Y, half_W, half_H) # left bottom
        rect_RB = (half_X, half_Y, half_W, half_H) # right bottom

        points_LT = []
        points_RT = []
        points_LB = []
        points_RB = []
        for point in points:
            if   self.__in_rect(point, rect_LT): points_LT.append(point)
            elif self.__in_rect(point, rect_RT): points_RT.append(point)
            elif self.__in_rect(point, rect_LB): points_LB.append(point)
            elif self.__in_rect(point, rect_RB): points_RB.append(point)

        return {
            'points': points,
            'rect': rect,
            'LT': self.__generate(points_LT, rect_LT, depth),
            'RT': self.__generate(points_RT, rect_RT, depth),
            'LB': self.__generate(points_LB, rect_LB, depth),
            'RB': self.__generate(points_RB, rect_RB, depth),
        }
