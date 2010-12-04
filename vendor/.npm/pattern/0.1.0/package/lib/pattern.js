var Pattern = module.exports = Object.create(Object.prototype, {

  // Implement extend for easy prototypal inheritance
  extend: {value: function extend(obj) {
    if (typeof obj !== 'object') throw new Error("Extend requires an object");
    obj.__proto__ = this;

    // If there is no initialize function localally, clone the parent's one
    if (!obj.hasOwnProperty("initialize")) {
      Object.defineProperty(obj, 'initialize', {
        value: cloneFunction(this.initialize)
      });
    }

    // Link up the prototype
    Object.defineProperty(obj.initialize, "prototype", {value: obj});

    // Define a fast local new function
    var args = [];
    for (var i = 0, l = obj.initialize.length; i < l; i++) {
      args.push('v' + i);
    }
    args.push('return new this.initialize(' + args.join(",") + ');');
    Object.defineProperty(obj, "new", {value: Function.apply(null, args)});

    // Object.freeze(obj); // Lock the prototype to enforce no changes
    return obj;
  }},

  // There will always be a default constructor
  initialize: {value: function initailize() {} },

});
// Add a hidden prototype link
Object.defineProperty(Pattern.initialize, "prototype", {value: Pattern});

function cloneFunction (fn) {
  var args = [];
  for (var i = 0, l = fn.length; i < l; i++) {
    args.push('v' + i);
  }
  eval("var gen = function " + fn.name + "(" + args.join(", ") + ") {\n" +
       "  return fn.call(" + (["this"].concat(args)).join(', ') + ");\n" +
       "}");
  return gen;
}
//
//
// var Rectangle = Pattern.extend({
//   initialize: function initialize(width, height) {
//     this.width = width;
//     this.height = height;
//   },
//   get area() {
//     return this.width * this.height;
//   }
// });
//
// var rect = Rectangle.new(10,20);
// console.dir(rect);
// console.dir(rect instanceof Rectangle.initialize);
// console.dir(Rectangle.isPrototypeOf(rect));
// console.log(rect.area);
//
// var MagicRectangle = Rectangle.extend({
//   get area() {
//     return this.width * this.height * 100;
//   }
// });
//
// var rect2 = MagicRectangle.new(10,20);
// console.dir(rect2);
// console.dir(rect2 instanceof MagicRectangle.initialize);
// console.dir(MagicRectangle.isPrototypeOf(rect2));
// console.log(rect2.area);
