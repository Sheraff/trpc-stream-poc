// Adapted from https://www.loginradius.com/blog/engineering/guest-post/http-streaming-with-nodejs-and-fetch-api/
// not sure whether async generators are faster / slower than a good old while loop
const textDecoder = new TextDecoder()

export async function* parseJsonStream (readableStream) {
	for await (const line of readLines(readableStream.getReader())) {
		const string = line[line.length - 1] === ','
			? line.substring(0, line.length - 1)
			: line

		if (string === '{' || string === '}') {
			continue
		}

		// parsing index out of start of line "0":{...}
		let i = 2 // start after first digit to save one iteration
		for (; i < 6; i++) { // assumes index will never be longer than 4 digits
			if (string[i] === '"') break
		}
		if (i === 5) throw new Error('Invalid JSON')

		const index = string.substring(1, i)
		const data = string.substring(i + 2)
		yield [index, JSON.parse(data)]
	}
}

async function* readLines (reader) {
	let partOfLine = ''
	for await (const chunk of readChunks(reader)) {
		const chunkText = textDecoder.decode(chunk)
		const chunkLines = chunkText.split('\n')
		if (chunkLines.length === 1) {
			partOfLine += chunkLines[0]
		} else if (chunkLines.length > 1) {
			yield partOfLine + chunkLines[0]
			for (let i = 1; i < chunkLines.length - 1; i++) {
				yield chunkLines[i]
			}
			partOfLine = chunkLines[chunkLines.length - 1]
		}
	}
}

function readChunks (reader) {
	return {
		async*[Symbol.asyncIterator] () {
			let readResult = await reader.read()
			while (!readResult.done) {
				yield readResult.value
				readResult = await reader.read()
			}
		},
	}
}