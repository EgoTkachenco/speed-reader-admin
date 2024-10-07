'use strict';

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
};
