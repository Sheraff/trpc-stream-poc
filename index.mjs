import express from 'express'

const app = express()

const HTTP_PORT = 3000

app.use(express.static("public"))

app.get("/data", async (req, res) => {
	const procedures = JSON.parse(req.query.procedures)
	const args = JSON.parse(req.query.args)

	res.setHeader('Content-Type', 'application/json; charset=utf-8')
	res.setHeader('Transfer-Encoding', 'chunked')
	res.status(200)

	res.write('{\n')
	let counter = 0
	await Promise.all(procedures.map(async (procedure, i, { length }) => {
		const result = await respondRandomDelay(procedure, args[i])
		counter++
		const data = JSON.stringify(result)
		const comma = counter < length ? ',' : ''
		res.write(`"${i}":${data}${comma}\n`)
	}))
	res.write('}')

	res.end()
})

async function respondRandomDelay (procedure, arg) {
	await new Promise((resolve) => setTimeout(resolve, Math.random() * 5_000))
	return {
		procedure,
		arg,
		text: `Hello from ${procedure}`,
	}
}

app.listen(HTTP_PORT, (err) => {
	if (err) {
		throw new Error(err)
	}
	console.log(`http://localhost:${HTTP_PORT}`)
})