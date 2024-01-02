import { Command } from 'commander'
import { collect } from 'metautil'
import { readStream, streamWithPersents } from './reader.js'
import Parser from './Parser.js'

const parser = new Parser()
const program = new Command()

const readFile = async (file: string, show: boolean, parser: Parser, separator: string | RegExp | undefined) => {
  const stream = show ? streamWithPersents(file, separator) : readStream(file, separator)
  for await (const chunk of stream) {
    const data = show ? (chunk as { content: string }).content : chunk as string
    parser.add(data.trim())
  }
}

const parse = (action: () => any, parser: Parser) => async (files: string[], show: boolean, separator: string | RegExp | undefined) => {
    const dc = collect(files)

    for (const file of files) dc.wait(file, readFile, file, show, parser, separator)

    await (dc as unknown as Promise<any>)

    return action()
}

program
  .name('epic-parser')
  .version('1.0.0')
  .description('Fast file parsing program (and maybe more)')

program.command('unique')
  .description('Get unique values')
  .arguments('<files...>')
  .option('-s, --show', 'Show progress')
  .option('-sp, --separator <splitter>', 'Separate values by', '\n')
  .action(async (files, options) => {
    const result = await parse(parser.getValues.bind(parser), parser)(files, options.show, options.separator)
    console.log(result)
  })

program.command('count')
  .description('Get count for each unique value')
  .arguments('<files...>')
  .option('-s, --show', 'Show progress')
  .option('-sp, --separator <splitter>', 'Separate values by', '\n')
  .action(async (files, options) =>  {
      const result = await parse(parser.getQuantities.bind(parser), parser)(files, options.show, options.separator)
      console.log(result)
    })

program.command('amount')
  .description('Get amount of given value')
  .arguments('<files...>')
  .requiredOption('-v, --value <value>', 'Value to count')
  .option('-s, --show', 'Show progress')
  .option('-sp, --separator <splitter>', 'Separate values by', '\n')
  .action(async (files, options) =>  {
    const result = await parse(parser.getQuantityOf.bind(parser, options.value), parser)(files, options.show, options.separator)
    console.log(result)
  })

program.command('by-amount') 
  .description('Find values which amount is in range')
  .arguments('<files...>')
  .option('-s, --show', 'Show progress')
  .option('-m, --min <min>', 'Min value')
  .option('-M, --max <max>', 'Max value')
  .option('-sp, --separator <splitter>', 'Separate values by', '\n')
  .action(async (files, options) =>  {
    const result = await parse(parser.getByQuantity.bind(parser, Number(options.min), Number(options.max)), parser)(files, options.show, options.separator)
    console.log(result)
  })


program.parse(process.argv)
