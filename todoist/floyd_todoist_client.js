const Todoist = require('todoist').v8;
const settings = require('../settings');
const sanitize = require('sanitize-filename');
const _ = require('lodash');

class FloydTodoistClient {
  constructor() {
    this.todoist = Todoist(settings.TODOIST_API_KEY);
  }

  async _init() {
    await this.todoist.sync();
    this.items = this.todoist.items.get();
    this.itemsById = _.keyBy(this.items, 'id');
    this.labelsById = _.keyBy(this.todoist.labels.get(), 'id');
    this.sectionsById = _.keyBy(this.todoist.sections.get(), 'id');
    this.notesByItemId = _.groupBy(this.todoist.notes.get(), 'item_id');
  }

  countItems() {
    return this.items.length;
  }

  *iterateItems() {
    for (const item of this.items) {
      yield new Item(this, item);
    }
  }
}

class Item {
  constructor(client, item) {
    this.client = client;
    this.item = item;
  }

  slug() {
    return [this.sectionName(), this.nestedName().map(sanitize).join(' > ')]
      .filter(Boolean)
      .join('/');
  }

  nestedName() {
    const names = [];
    let item = this.item;
    do {
      names.unshift(item.content);
      item = this.client.itemsById[item.parent_id];
    } while (item != null);
    return names;
  }

  sectionName() {
    return this.client.sectionsById[this.item.section_id]?.name;
  }

  url() {
    return `https://todoist.com/app/task/${this.item.id}`;
  }

  details() {
    const {item, client} = this;
    return {
      ...item,
      section_name: this.sectionName(),
      label_names: item.labels.map(
        (labelId) => client.labelsById[labelId]?.name
      ),
      notes: client.notesByItemId[item.id],
    };
  }
}

module.exports = {
  async init() {
    const client = new FloydTodoistClient();
    await client._init();
    return client;
  },
};
