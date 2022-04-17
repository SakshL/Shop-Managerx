var assert = require('assert');
const nock = require('nock');
const isImageURL = require('./index').default;

describe('isImage', () => {
	describe('Loads image', () => {
		before(() => {
			nock('https://image.test')
				.log(console.log)
				.head('/photo.png')
				.reply(200, 'OK', { 'content-type': 'image/png' });
		});
		it('identifies image', async () => {
			const result = await isImageURL('https://image.test/photo.png');
			assert(result, 'isImage === true');
		});
	});
	describe('Rejects non-image', () => {
		before(() => {
			nock('https://image.test')
				.head('/not-photo.png')
				.reply(200, 'OK', { 'content-type': 'text/html' });
		});
		it('identifies image', async () => {
			const result = await isImageURL('https://image.test/not-photo.png');
			assert(!result, 'isImage === false');
		});
	});
});
