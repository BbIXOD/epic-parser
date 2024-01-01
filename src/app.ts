import { Command } from 'commander'
import { collect } from 'metautil'
import { readStream, readStreamWithPersents } from './reader.js'
import Parser from './Parser.js'

const parser = new Parser()
const program = new Command()

const readFile = async (file: string, show: boolean, parser: Parser) => {
  const stream = show ? readStreamWithPersents(file) : readStream(file)
  for await (const chunk of stream) {
    const data = show ? (chunk as { content: string }).content : chunk as string
    parser.add(data.trim())
  }
}

const parse = (action: () => any, parser: Parser) => async (files: string[], show: boolean) => {
    const dc = collect(files)

    for (const file of files) dc.wait(file, readFile, file, show, parser)

    await (dc as unknown as Promise<any>)
    return action()
}

const parseAndOut = (action: () => any) => async (files: string[], show: boolean) => {
  const result = await parse(action, parser)(files, show)
  console.log(result)
}

program
  .name('epic-parser')
  .version('1.0.0')
  .description('Fast file parsing program (and maybe more)')

program.command('unique')
  .description('Get unique values')
  .arguments('<files...>')
  .option('-s', '--show', 'Show progress')
  .action(parseAndOut(parser.getValues.bind(parser)))

program.command('count')
  .description('Get count for each unique value')
  .arguments('<files...>')
  .option('-s', '--show', 'Show progress')
  .action(parseAndOut(parser.getQuantities.bind(parser)))

program.command('amount')
  .description('Get amount of given value')
  .arguments('<files...>')
  .requiredOption('-v, --value <value>', 'Value to count')
  .option('-s', '--show', 'Show progress')
  .action(parseAndOut(parser.getQuantityOf.bind(parser, program.opts().value)))


program.parse(process.argv)
