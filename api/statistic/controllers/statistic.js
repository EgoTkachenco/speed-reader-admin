"use strict";
const { format } = require("date-fns");
const _ = require("lodash");

module.exports = {
  async find(ctx) {
    const query = ctx.query;
    let all_data = await strapi.services.statistic.find({
      _limit: -1,
      ...query,
    });
    all_data = all_data.reduce(
      (acc, { user_id, count, date, average_speed, book }) => ({
        ...acc,
        [user_id]: [
          ...(acc[user_id] || []),
          { count, date, average_speed, book: book.name },
        ],
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
      statistic: data.map((stat) =>
        _.pick(stat, ["date", "count", "average_speed", "book.name"])
      ),
    };
    return result;
  },

  async create(ctx) {
    const body = ctx.request.body;
    if (!body.user_id) return ctx.badRequest("user_id required");
    if (!body.date) return ctx.badRequest("date required");
    if (!body.book) return ctx.badRequest("book required");
    if (!body.speed) return ctx.badRequest("speed required");

    const date_statistic = await strapi
      .query("statistic")
      .findOne({ date: body.date, user_id: body.user_id });

    let entity;

    const speed = body.speed;
    delete body.speed;
    if (date_statistic)
      entity = await strapi.services.statistic.update(
        { id: date_statistic.id },
        {
          count: date_statistic.count + body.count,
          average_speed: (date_statistic.average_speed + speed) / 2,
        }
      );
    else
      entity = await strapi.services.statistic.create({
        ...body,
        average_speed: speed,
      });

    return _.pick(entity, [
      "id",
      "user_id",
      "date",
      "count",
      "average_speed",
      "book.name",
    ]);
	},
	
	async getStatistic(ctx) {
		const { id } = ctx.params;
    const query = ctx.query;
    let data = await strapi.services.statistic.find({
      user_id: id,
      _limit: -1,
      ...query,
    });
		
		const groups = {}

		// Group data by days
		for (let i = 0; i < data.length; i++) {
			const date = format(data[i].date, 'yyyy-MM-dd');
			if (groups[date]) {
				groups[date].count += data[i].count;
				groups[date].average_speed += data[i].average_speed;
				groups[date].size += 1;
			} else {
				groups[date] = {
					count: data[i].count,
					average_speed: data[i].average_speed,
					size: 1
				};
			}
		}

		// Calculate average score
		const result = []
		for (const key in groups) {
			result.push({
				date: key,
				count: (groups[key].count / groups[key].size).toFixed(2),
				average_speed: (groups[key].average_speed / groups[key].size).toFixed(2)
			})
		}
    return result;
	}
};
