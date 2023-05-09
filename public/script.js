import { parseJsonStream } from './parseJsonStream.js'

async function main () {

	const batch = [
		['foo.bar', { id: 1 }],
		['foo.baz', { id: 2 }],
		['foo.qux', { id: 3 }],
	]

	const query = new URLSearchParams()
	query.set('procedures', JSON.stringify(batch.map(([name]) => name)))
	query.set('args', JSON.stringify(batch.map(([, args]) => args)))

	const response = await fetch(`/data?${query}`)
	for await (const [index, data] of parseJsonStream(response.body)) {
		const match = batch[index]
		console.log(match, data)
	}
}


main()