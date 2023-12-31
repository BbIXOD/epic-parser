import { program } from 'commander'
import { fileAccumulator } from './parser'
import { readStream, readStreamWithPersents } from './reader'

program
  .name('epic-parser')
  .version('1.0.0')
  .description('Fast file parsing program (and maybe more)')
  .parse(process.argv)

program
  .command('uniq [files...]', 'Find unique values in files')
  .option('-s', '--show', 'Show progress')
  .action(async (files: string[], options: { show: boolean }) => {
    
  })
