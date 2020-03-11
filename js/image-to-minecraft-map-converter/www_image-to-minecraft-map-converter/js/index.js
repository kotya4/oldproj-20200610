//
window.onload = function() {

  /// table

  const TABLE = [
    { name: 'GRASS', rgb: [127, 178, 56], blocks: 'Grass Block, Slime Block', },
    { name: 'SAND', rgb: [247, 233, 163], blocks: 'Sand, Birch (Planks, Log (vertical), Stripped Log, Wood, Stripped Wood, Sign, Pressure Plate, Trapdoor, Stairs, Slab, Fence Gate, Fence, Door), Sandstone (All variants, all slabs, all stairs, all walls), Glowstone, End Stone, End Stone Bricks (slab, stairs, wall), Bone Block, Turtle Egg, Scaffolding', },
    { name: 'WOOL', rgb: [199, 199, 199], blocks: 'Cobweb, Mushroom Stem, Bed (head)', },
    { name: 'FIRE', rgb: [255, 0, 0], blocks: 'Lava, TNT, Fire, Redstone Block', },
    { name: 'ICE', rgb: [160, 160, 255], blocks: 'Ice, Frosted Ice, Packed Ice, Blue Ice', },
    { name: 'METAL', rgb: [167, 167, 167], blocks: 'Block of Iron, Iron Door, Brewing Stand, Heavy Weighted Pressure Plate, Iron Trapdoor, Lantern, Anvil, Grindstone, Soul Fire Lantern‌[upcoming: JE 1.16]', },
    { name: 'PLANT', rgb: [0, 124, 0], blocks: 'Sapling, Flowers, Mushrooms,[until JE 1.16] Wheat, Sugar Cane, Pumpkin Stem, Melon Stem, Lily Pad, Cocoa, Carrots, Potatoes, Beetroots, Sweet Berry Bush, Grass, Fern, Vines, Leaves, Cactus, Bamboo, Fungi, Weeping Vines', },
    { name: 'SNOW', rgb: [255, 255, 255], blocks: 'Snow, Snow Block, White (Bed (foot), Wool, Stained Glass, Stained Glass Pane, Carpet, Banner, Shulker Box, Glazed Terracotta, Concrete, Concrete Powder)', },
    { name: 'CLAY', rgb: [164, 168, 184], blocks: 'Clay, Infested Block (Stone, Cobblestone, Stone Brick, Mossy Stone Brick, Cracked Stone Brick, Chiseled Stone Brick)', },
    { name: 'DIRT', rgb: [151, 109, 77], blocks: 'Dirt, Coarse Dirt, Farmland, Grass Path, Granite (slab, stairs, wall), Polished Granite (slab, stairs), Jungle (Planks, Log (vertical), Stripped Log, Wood, Stripped Wood, Sign, Pressure Plate, Trapdoor, Stairs, Slab, Fence Gate, Fence, Door), Jukebox, Brown Mushroom Block', },
    { name: 'STONE', rgb: [112, 112, 112], blocks: 'Stone (slab, stairs), Andesite (slab, stairs, wall), Polished Andesite (slab, stairs), Cobblestone (slab, stairs), Bedrock, Gold Ore, Iron Ore, Coal Ore, Lapis Lazuli Ore, Dispenser, Mossy Cobblestone (slab, stairs, wall), Spawner, Diamond Ore, Furnace, Stone Pressure Plate, Redstone Ore, Stone Bricks (all variants, all slabs, all stairs, all walls), Emerald Ore, Ender Chest, Dropper, Smooth Stone (slab, stairs), Observer, Smoker, Blast Furnace, Stonecutter, Sticky Piston, Piston, Piston Head, Gravel, Acacia Log (side), Cauldron, Hopper', },
    { name: 'WATER', rgb: [64, 64, 255], blocks: 'Kelp, Seagrass, Water, Bubble Column', },
    { name: 'WOOD', rgb: [143, 119, 72], blocks: 'Oak (Planks, Log (vertical), Stripped Log, Wood, Stripped Wood, Sign, Door, Pressure Plate, Fence, Trapdoor, Fence Gate, Slab, Stairs), Note Block, Bookshelf, Chest, Crafting Table, Trapped Chest, Daylight Detector, Loom, Barrel, Cartography Table, Fletching Table, Lectern, Smithing Table, Composter, Bamboo Sapling, Dead Bush, Petrified Oak Slab, Beehive, Bee Nest', },
    { name: 'QUARTZ', rgb: [255, 252, 245], blocks: 'Diorite, Polished Diorite, Birch Log (side), Quartz Block (all variants, all slabs, all stairs), Sea Lantern, Target', },
    { name: 'COLOR_ORANGE', rgb: [216, 127, 51], blocks: 'Acacia (Planks, Log (vertical), Stripped Log, Stripped Wood, Sign, Trapdoor, Slab), Red Sand, Orange (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Pumpkin, Carved Pumpkin, Jack o Lantern, Terracotta, Red Sandstone (all variants, all stairs, all slabs, all walls), Honey Block, Honeycomb Block', },
    { name: 'COLOR_MAGENTA', rgb: [178, 76, 216], blocks: 'Magenta (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Purpur (all variants, slab, stairs)', },
    { name: 'COLOR_LIGHT_BLUE', rgb: [102, 153, 216], blocks: 'Light Blue (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Soul Fire‌[upcoming: JE 1.16]', },
    { name: 'COLOR_YELLOW', rgb: [229, 229, 51], blocks: 'Sponge, Wet Sponge, Yellow (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Hay Bale, Horn Coral (Coral Block, Coral, Coral Fan)', },
    { name: 'COLOR_LIGHT_GREEN', rgb: [127, 204, 25], blocks: 'Lime (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Melon', },
    { name: 'COLOR_PINK', rgb: [242, 127, 165], blocks: 'Pink (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Brain Coral (Coral Block, Coral, Coral Fan)', },
    { name: 'COLOR_GRAY', rgb: [76, 76, 76], blocks: 'Acacia Wood, Gray (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Dead Coral (Coral Block, Coral, Coral Fan)', },
    { name: 'COLOR_LIGHT_GRAY', rgb: [153, 153, 153], blocks: 'Light Gray (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Structure Block, Jigsaw Block', },
    { name: 'COLOR_CYAN', rgb: [76, 127, 153], blocks: 'Cyan (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Prismarine (slab, stairs, wall), Warped (Stem, Stripped Stem, Hyphae, Stripped Hyphae, Nylium, Wart Block, Roots, Planks, Slab, Pressure Plate, Fence, Trapdoor, Fence Gate, Stairs, Door, Sign), Nether Sprouts', },
    { name: 'COLOR_PURPLE', rgb: [127, 63, 178], blocks: 'Shulker Box, Purple (Wool, Carpet, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Mycelium, Chorus Plant, Chorus Flower, Repeating Command Block, Bubble Coral (Coral Block, Coral, Coral Fan)', },
    { name: 'COLOR_BLUE', rgb: [51, 76, 178], blocks: 'Blue (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Tube Coral (Coral Block, Coral, Coral Fan)', },
    { name: 'COLOR_BROWN', rgb: [102, 76, 51], blocks: 'Dark Oak (Planks, Log, Stripped Log, Wood, Stripped Wood, Sign, Pressure Plate, Trapdoor, Stairs, Slab, Fence Gate, Fence, Door), Spruce Log (side), Brown (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Soul Sand, Command Block, Brown Mushroom‌[upcoming: JE 1.16], Soul Soil‌[upcoming: JE 1.16]', },
    { name: 'COLOR_GREEN', rgb: [102, 127, 51], blocks: 'Green (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), End Portal Frame, Chain Command Block, Dried Kelp Block, Sea Pickle', },
    { name: 'COLOR_RED', rgb: [153, 51, 51], blocks: 'Red (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Bricks (slab, stairs, wall), Red Mushroom Block, Nether Wart, Enchanting Table, Nether Wart Block, Fire Coral (Coral Block, Coral, Coral Fan), Red Mushroom,‌[upcoming: JE 1.16] Crimson (Stem, Stripped Stem, Hyphae, Stripped Hyphae, Nylium), Shroomlight', },
    { name: 'COLOR_BLACK', rgb: [25, 25, 25], blocks: 'Black (Wool, Carpet, Shulker Box, Bed (foot), Stained Glass, Stained Glass Pane, Banner, Glazed Terracotta, Concrete, Concrete Powder), Obsidian, End Portal, Dragon Egg, Coal Block, End Gateway, Basalt,‌[upcoming: JE 1.16] Block of Netherite, Ancient Debris, Crying Obsidian', },
    { name: 'GOLD', rgb: [250, 238, 77], blocks: 'Block of Gold, Light Weighted Pressure Plate, Bell', },
    { name: 'DIAMOND', rgb: [92, 219, 213], blocks: 'Block of Diamond, Beacon, Prismarine Bricks (slab, stairs), Dark Prismarine (slab, stairs), Conduit', },
    { name: 'LAPIS', rgb: [74, 128, 255], blocks: 'Lapis Lazuli Block', },
    { name: 'EMERALD', rgb: [0, 217, 58], blocks: 'Block of Emerald', },
    { name: 'PODZOL', rgb: [129, 86, 49], blocks: 'Podzol, Spruce (Planks, Log (vertical), Stripped Log, Wood, Stripped Wood, Sign, Pressure Plate, Trapdoor, Stairs, Slab, Fence Gate, Fence, Door), Oak Log (side), Jungle Log (side), Campfire', },
    { name: 'NETHER', rgb: [112, 2, 0], blocks: 'Netherrack, Nether Bricks (fence, slab, stairs, wall), Nether Quartz Ore, Magma Block, Red Nether Bricks (slab, stairs, wall), Crimson (Roots, Planks, Slab, Pressure Plate, Fence, Trapdoor, Fence Gate, Stairs, Door, Sign)', },
    { name: 'TERRACOTTA_WHITE', rgb: [209, 177, 161], blocks: 'White Terracotta', },
    { name: 'TERRACOTTA_ORANGE', rgb: [159, 82, 36], blocks: 'Orange Terracotta', },
    { name: 'TERRACOTTA_MAGENTA', rgb: [149, 87, 108], blocks: 'Magenta Terracotta', },
    { name: 'TERRACOTTA_LIGHT_BLUE', rgb: [112, 108, 138], blocks: 'Light Blue Terracotta', },
    { name: 'TERRACOTTA_YELLOW', rgb: [186, 133, 36], blocks: 'Yellow Terracotta', },
    { name: 'TERRACOTTA_LIGHT_GREEN', rgb: [103, 117, 53], blocks: 'Lime Terracotta', },
    { name: 'TERRACOTTA_PINK', rgb: [160, 77, 78], blocks: 'Pink Terracotta', },
    { name: 'TERRACOTTA_GRAY', rgb: [57, 41, 35], blocks: 'Gray Terracotta', },
    { name: 'TERRACOTTA_LIGHT_GRAY', rgb: [135, 107, 98], blocks: 'Light Gray Terracotta', },
    { name: 'TERRACOTTA_CYAN', rgb: [87, 92, 92], blocks: 'Cyan Terracotta', },
    { name: 'TERRACOTTA_PURPLE', rgb: [122, 73, 88], blocks: 'Purple (Terracotta, Shulker Box)', },
    { name: 'TERRACOTTA_BLUE', rgb: [76, 62, 92], blocks: 'Blue Terracotta', },
    { name: 'TERRACOTTA_BROWN', rgb: [76, 50, 35], blocks: 'Brown Terracotta', },
    { name: 'TERRACOTTA_GREEN', rgb: [76, 82, 42], blocks: 'Green Terracotta', },
    { name: 'TERRACOTTA_RED', rgb: [ 142, 60, 46], blocks: 'Red Terracotta', },
    { name: 'TERRACOTTA_BLACK', rgb: [37, 22, 16], blocks: 'Black Terracotta', },
  ].map(e => { e.hsl = rgbToHsl(...e.rgb); return e; });

  /// layout

  $('body').append(
    $.div('container'),
    $('<input type="file" class="file" name="file" />'),
  );

  /// file was choosen

  $('.file')[0].onchange = function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = window.URL.createObjectURL(file);

    $('.container').empty().append(
      $('<img class="image"></img>'),
      $('<div class="status">converting...</div>'),
      $('<canvas class="canvas" width="128" height="128"></canvas>'),
    );

    const image = $('.image')[0];
    const canvas = $('.canvas')[0];

    image.src = url;
    image.onload = function () {
      // canvas.height = image.height;
      // canvas.width = image.width;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, ctx.canvas.width, ctx.canvas.height);

      $('.image').css({ width: 128 }); // call only after drawImage

      convert_image(ctx);
    }
  }


  function convert_image(ctx) {


    const idata = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < idata.data.length; i += 4) {
      const r = idata.data[0+i];
      const g = idata.data[1+i];
      const b = idata.data[2+i];
      const pixel_hsl = rgbToHsl(r, g, b);

      let min_dist_value = 0xffff;
      let min_dist_index = 0;

      for (let t = 0; t < TABLE.length; ++t) {
        const table_hsl = TABLE[t].hsl;

        let dh = Math.abs(pixel_hsl[0]-table_hsl[0]); dh = Math.min(dh, 1-dh);
        let ds = Math.abs(pixel_hsl[1]-table_hsl[1]);
        let dl = Math.abs(pixel_hsl[2]-table_hsl[2]);

        let dist = Math.hypot(dh, ds, dl);

        if (min_dist_value > dist) {
          min_dist_value = dist;
          min_dist_index = t;
        }
      }

      idata.data[0+i] = TABLE[min_dist_index].rgb[0];
      idata.data[1+i] = TABLE[min_dist_index].rgb[1];
      idata.data[2+i] = TABLE[min_dist_index].rgb[2];
    }

    ctx.putImageData(idata, 0, 0);

    $('.status').html('done');
  }

}
