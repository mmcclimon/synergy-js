module.exports = class User {
  constructor(arg) {
    // hacky and dumb, but good enough for right now
    Object.keys(arg).forEach(key => {
      const val = arg[key];
      if (val === null) return;
      this[key] = val;
    });
  }
};
