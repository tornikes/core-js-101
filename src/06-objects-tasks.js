/* ************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
}

Rectangle.prototype.getArea = function getArea() {
  return this.width * this.height;
};


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const res = JSON.parse(json);
  Object.setPrototypeOf(res, proto);
  return res;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class SimpleSelector {
  constructor() {
    this.el = null;
    this.elId = null;
    this.classes = [];
    this.attribute = null;
    this.pseudoClassEl = [];
    this.pseudoElementEl = [];
  }

  element(el) {
    if (this.elId || this.classes.length || this.attribute
        || this.pseudoClassEl.length || this.pseudoElementEl.length) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    if (this.el) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.el = el;
    return el;
  }

  id(val) {
    if (this.classes.length || this.attribute
      || this.pseudoClassEl.length || this.pseudoElementEl.length) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    if (this.elId) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.elId = val;
    return this;
  }

  class(...vals) {
    if (this.attribute || this.pseudoClassEl.length || this.pseudoElementEl.length) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.classes.push(...vals);
    return this;
  }

  attr(value) {
    if (this.pseudoClassEl.length || this.pseudoElementEl.length) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.attribute = value;
    return this;
  }

  pseudoClass(...values) {
    if (this.pseudoElementEl.length) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.pseudoClassEl.push(...values);
    return this;
  }

  pseudoElement(value) {
    if (this.pseudoElementEl.length) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.pseudoElementEl.push(value);
    return this;
  }

  stringify() {
    let output = '';
    if (this.el) {
      output += this.el;
    }
    if (this.elId) {
      output += `#${this.elId}`;
    }
    if (this.classes.length) {
      output += `.${this.classes.join('.')}`;
    }
    if (this.attribute) {
      output += `[${this.attribute}]`;
    }
    if (this.pseudoClassEl.length) {
      output += `:${this.pseudoClassEl.join(':')}`;
    }
    if (this.pseudoElementEl.length) {
      output += `::${this.pseudoElementEl.join('::')}`;
    }
    return output;
  }
}

function CombinedSelector(s1, sep, s2) {
  this.s1 = s1;
  this.sep = sep;
  this.s2 = s2;
}

CombinedSelector.prototype.stringify = function stringify() {
  return `${this.s1.stringify()} ${this.sep} ${this.s2.stringify()}`;
};


const cssSelectorBuilder = {
  element(value) {
    const s = new SimpleSelector();
    s.el = value;
    return s;
  },

  id(value) {
    return new SimpleSelector().id(value);
  },

  class(value) {
    return new SimpleSelector().class(value);
  },

  attr(value) {
    return new SimpleSelector().attr(value);
  },

  pseudoClass(value) {
    return new SimpleSelector().pseudoClass(value);
  },

  pseudoElement(value) {
    return new SimpleSelector().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new CombinedSelector(selector1, combinator, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
