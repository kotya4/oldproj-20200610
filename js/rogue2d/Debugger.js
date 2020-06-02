//
var Debugger = {
  push(sender, args) {
    if (this.enabled) this.memory.push(sender + ' :: ' + JSON.stringify(args, null, 2));
  },

  enabled: false,
  memory: [],
};
