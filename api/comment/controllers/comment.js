"use strict";
const _ = require("lodash");

module.exports = {
  async find(ctx) {
    let entities;
    if (!ctx.query.exerciseId) return ctx.badRequest("Exercise id required");
    if (ctx.query._q) {
      entities = await strapi.services.comment.search(ctx.query);
    } else {
      entities = await strapi.services.comment.find(ctx.query);
    }

    return entities.map(format_comment);
  },
  async create(ctx) {
    let entity = await strapi.services.comment.create(ctx.request.body);
    return format_comment(entity);
  },
};

const format_comment = (comment) =>
  _.pick(comment, [
    "id",
    "username",
    "exerciseId",
    "userId",
    "content",
    "created_at",
  ]);
