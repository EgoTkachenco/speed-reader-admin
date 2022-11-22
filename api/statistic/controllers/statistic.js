"use strict";
const _ = require("lodash");

module.exports = {
  async find(ctx) {
    const query = ctx.query;
    let all_data = await strapi.services.statistic.find({
      _limit: -1,
      ...query,
    });
    all_data = all_data.reduce(
      (acc, { user_id, count, date }) => ({
        ...acc,
        [user_id]: [...(acc[user_id] || []), { count, date }],
      }),
      {}
    );
    let result = [];
    for (const key in all_data) {
      result.push({
        user_id: key,
        total_count: all_data[key].reduce(
          (acc, stat) => (acc += stat.count),
          0
        ),
        statistic: all_data[key],
      });
    }

    return result;
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const query = ctx.query;
    let data = await strapi.services.statistic.find({
      user_id: id,
      _limit: -1,
      ...query,
    });
    let result = {
      user_id: id,
      total_count: data.reduce((acc, stat) => (acc += stat.count), 0),
      statistic: data.map((stat) => _.pick(stat, ["date", "count"])),
    };
    return result;
  },

  async create(ctx) {
    const body = ctx.request.body;
    if (!body.user_id) return ctx.badRequest("user_id required");
    if (!body.date) return ctx.badRequest("date required");

    const date_statistic = await strapi
      .query("statistic")
      .findOne({ date: body.date, user_id: body.user_id });

    let entity;

    if (date_statistic)
      entity = await strapi.services.statistic.update(
        { id: date_statistic.id },
        { count: date_statistic.count + body.count }
      );
    else entity = await strapi.services.statistic.create(body);

    return _.pick(entity, ["id", "user_id", "date", "count"]);
  },
};
