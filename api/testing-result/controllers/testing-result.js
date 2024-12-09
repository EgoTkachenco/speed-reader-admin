'use strict';

const { format } = require("date-fns");

module.exports = {
	async find(ctx) {
		let entities = await strapi.services['testing-result'].find(ctx.query);

		return entities.map(entity => {

			entity.correct_answers_count = 0
			entity.questions_count = entity.exercise?.questions?.length || 0
			if (entity?.exercise?.questions) {
				for (let i = 0; i < entity.exercise.questions.length; i++) {
					const correctId = entity.exercise.questions[i].variants.find(el => el.isCorrect)?.id
					if (entity.answers[i] === correctId) entity.correct_answers_count++
				}
			}

			return entity
		});
	},

	async getStatistics(ctx) {
		const user_id = ctx.query.user_id
		let entities = await strapi.services['testing-result'].find({ user_id, _limit: -1 });

		entities.map(entity => {

			entity.correct_answers_count = 0
			entity.questions_count = entity.exercise?.questions?.length || 0
			if (entity?.exercise?.questions) {
				for (let i = 0; i < entity.exercise.questions.length; i++) {
					const correctId = entity.exercise.questions[i].variants.find(el => el.isCorrect)?.id
					if (entity.answers[i] === correctId) entity.correct_answers_count++
				}
			}

			return entity
		});
		

		const groups = {}

		// Group entities by days
		for (let i = 0; i < entities.length; i++) {
			const date = format(entities[i].created_at, 'yyyy-MM-dd');
			const score = entities[i].correct_answers_count / entities[i].questions_count
			if (groups[date]) {
				groups[date].time += entities[i].reading_time;
				groups[date].score += score;
				groups[date].count += 1;
			} else {
				groups[date] = {
					time: entities[i].reading_time,
					score: score,
					count: 1
				};
			}
		}

		// Calculate average score
		const result = []
		for (const key in groups) {
			result.push({
				date: key,
				time: (groups[key].time / groups[key].count).toFixed(2),
				score: (groups[key].score / groups[key].count).toFixed(2)
			})
		}
    return result;
	}
};
