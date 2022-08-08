"use strict";
const _ = require("lodash");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.book.search(ctx.query);
    } else {
      entities = await strapi.services.book.find(ctx.query);
    }

    return entities.map((entity) => {
      entity.size = entity.file?.formats ? entity.file.formats["book-size"] : 0;
      return _.pick(entity, ["id", "name", "size"]);
    });
  },
  async findOneText(ctx) {
    return await strapi.services.book.findOneText(ctx.params, ctx.query);
  },
};
