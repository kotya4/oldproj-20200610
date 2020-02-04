var ctx = null;
var client_rect = null;

var bones = [];

var current_bone_size = 10;
var current_bone = null;
var current_bone_x = 0;
var current_bone_y = 0;

var pressed_button = null;
var old_client_x = 0;
var old_client_y = 0;
var client_x = 0;
var client_y = 0;
var delta_x = 0;
var delta_y = 0;

var draw_bone_mode = false;

var focused_bones = [];
