'use strict';
const fs = require('fs')
const path = require('path')

module.exports = {
	async find(ctx) {
		let entities = await strapi.services['testing-exercise'].find(ctx.query);

		return entities.map(entity => {
			entity.size = entity.book?.formats ? entity.book.formats["book-size"] : 0;
			entity.words = entity.book?.formats
				? entity.book.formats["book-words-size"]
				: 0;
			delete entity.questions
			return entity
		});
	},
	async findOne(ctx) {
		const { id } = ctx.params;

		const entity = await strapi.services['testing-exercise'].findOne({ id });
		entity.book = fs.readFileSync(path.join(__dirname, '../../../public/' + entity.book.url)).toString()
		entity.questions = entity.questions.map(question => {
			question.variants = question.variants.map(variant => ({ text: variant.text, id: variant.id }))
			return question
		})
		return entity;
	},

	async submitQuiz(ctx) {
		const id = ctx.params.id
		const body = ctx.request.body
		return await strapi.services['testing-result'].create({ exercise: id, ...body });
	}
};
