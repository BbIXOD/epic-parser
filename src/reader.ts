import { createReadStream, statSync } from 'fs'

export async function* readStream(path: string, splitter: string | RegExp = '\n'): AsyncGenerator<string> {
  const stream = createReadStream(path)
  let last = ''

  for await (const chunk of stream) {
    const splited = (last + chunk).split(splitter)

    for (let i = 0; i < splited.length - 1; i++) {
      yield splited[i]
    }

    last = splited[splited.length - 1]
  }

  if (last !== '') yield last
}

export async function* readStreamWithPersents(path: string, splitter: string | RegExp = '\n'): AsyncGenerator<{ persent: number, content: string }> {
  const stream = readStream(path, splitter)
  const streamSize = statSync(path).size
  let readSize = 0

  for await (const chunk of stream) {
    readSize += chunk.length
    yield { persent: streamSize / readSize * 100, content: chunk }
  }
}
