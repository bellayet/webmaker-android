var Blocks = require('./blocks');
var utils = require('./utils');
var i18n = require('./i18n');
var clone = require('clone');
var templates = require('./templates.json');

var model = require('./model')();
var blocks = new Blocks();

function newBlock(blockId) {
    var block = blocks[blockId];
    return block && clone(block);
}

function App (id, ref) {
    var self = this;

    self.id = id;
    self.storage = ref || model.firebase.child(self.id);
}

// Global Methods

// createApp(options)
//  - template: id of a template. Will overwrite options.data
//  - data: a set of app data to clone
//  - name: a name for the clone.
App.createApp = function (options) {
    var templateId;
    options = options || {};
    if (options.template) {
        templateId = utils.findInArray(templates, 'id', options.template);
        options.data = templates[templateId];
    }
    if (!options.data) return;

    var app = clone(options.data);

    // Remove undefined values
    for (var key in app) {
        if (app[key] === undefined) delete app[key];
    }

    // User
    var user = model.data.session.user;

    // Prepare the clone for use
    delete app.id;
    app.name = options.name || i18n.get('My {{template}} App');
    app.name = app.name.replace('{{template}}', options.data.name);

    app.userId = user.id;
    app.author = {
        id: user.id,
        username: user.username || i18n.get('Guest')
    };

    var ref = model.firebase.push(app);

    return new App(ref.key(), ref);
};

App.prototype.update = function (properties) {
    var self = this;
    self.storage.update(properties);
};

App.prototype.updateBlock = function (index, properties) {
    var self = this;
    self.storage.child('blocks/' + index).update(properties);
};

// Instance Methods
App.prototype.insert = function (blockId, blocks) {
    var self = this;
    var block = newBlock(blockId);
    if (!block) {
        console.error('Block type ' + blockId + ' not found.');
        return;
    }
    blocks = blocks || [];
    blocks.unshift(block);
    self.storage.update({
        blocks: clone(blocks)
    });

};

App.prototype.remove = function (blockIndex, blocks) {
    var self = this;
    if (!blocks) {
        console.error('You must pass a second param with an array of blocks');
        return;
    }
    if (!blocks[blockIndex]) {
        console.error('Block with index ' + blockIndex + ' does not exist.');
        return;
    }
    blocks.splice(blockIndex, 1);
    self.storage.update({
        blocks: clone(blocks)
    });
};

App.prototype.removeApp = function () {
    var self = this;
    self.storage.remove();
};

module.exports = App;
