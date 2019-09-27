var Utils = Object.freeze({

  array_safe_value(arr, indices) {
    for (let i = 0; i < indices.length - 1; ++i)
      if (!((arr = arr[indices[i]]) instanceof Array))
        return null;
    return arr[indices[indices.length - 1]];
  },

});
