var mockrequire = require('mockrequire');
var assert = require('assert');

var templates = require('../../lib/templates.json');
var mockId = '000d1745-5d3c-4997-ac0c-15df68bbbecz';
var mockId2 = '123123123';

function Fb(id) {
    this._id = id;
};
Fb.prototype.key = function () {
    return this._id;
};
Fb.prototype.on = function () {};
Fb.prototype.update = function () {};
Fb.prototype.remove = function () {};
Fb.prototype.push = function (data) {
   var fb = new Fb(mockId2);
   fb._val = data;
   return fb;
};
Fb.prototype.child = function () {
    return new Fb();
};

var mockModelInstance = {
    data: { session: { user: {
        id: 1,
        username: 'kate'
    } } },
    firebase: new Fb()
};
var mockModel = function() {
    return mockModelInstance;
};

// blocks doesn't frickin work because we can't require html files *cries*
var mockBlocks = function (id) {
    this.text = {
        id: 'text',
        className: 'text',
        template: '<p></p>',
        data: {
            name: 'Text',
            icon: '/images/blocks_text.png',
            attributes: {
                innerHTML: {
                    label: 'Text',
                    type: 'string',
                    value: 'I am a Headline'
                },
                color: {
                    label: 'Color',
                    type: 'color',
                    value: '#333444'
                }
            }
        }
    };
};

var App = mockrequire('../../lib/app', {
    './model': mockModel,
    './blocks': mockBlocks,
    'clone': require('clone'),
    './i18n': {
        get: function(key) {
            return key;
        }
    }
});

var app = new App(mockId);

describe('App instance', function () {
    describe('interface', function () {
        it('should have expected properties', function () {
            assert.equal(app.id, mockId);
            assert(app.storage instanceof Fb);
        });

        it('should have expected functions', function () {
            assert.equal(typeof app.insert, 'function');
            assert.equal(typeof app.remove, 'function');
            assert.equal(typeof app.update, 'function');
            assert.equal(typeof app.updateBlock, 'function');
            assert.equal(typeof app.removeApp, 'function');
        });
    });

    describe('insert', function () {
        it('should insert a block', function () {
            var blocks = [{}, {}];
            app.insert('text', blocks);
            assert.equal(blocks[0].id, 'text');
        });
        it('should do nothing if the blockId does not exist', function () {
            var blocks = [{}, {}];
            var oldLength = blocks.length;
            app.insert('banana', blocks);
            assert.equal(blocks.length, oldLength)
        });
    });

    describe('remove', function () {
        it('should remove a block', function () {
            var blocks = [{}, {}];
            app.remove(0, blocks);
            assert.equal(blocks.length, 1);
        });
        it('should do nothing if the block index does not exist', function () {
            var blocks = [{}, {}];
            var oldLength = blocks.length;
            app.remove(100, blocks);
            assert.equal(blocks.length, oldLength);
        });
    });

});

describe('App', function () {
    describe('#createApp', function () {
        it('should be a function', function () {
            assert.equal(typeof App.createApp, 'function');
        });
        it('should return undefined when no template or data is passed in', function () {
            assert.equal(typeof App.createApp(), 'undefined');
            assert.equal(typeof App.createApp({template: 'notrealid'}), 'undefined');
        });
        it('should return an app instance for valid template id', function () {
            var template = templates[2];
            var app = App.createApp({template: template.id, name: 'Bob is my cat'});
            assert.ok(app instanceof App);
            assert.ok(app.id && app.id !== template.id);
            assert.equal(app.storage._val.name, 'Bob is my cat');
        });
    });
});



