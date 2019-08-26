const commandLineArgs = require('command-line-args')
const path = require('path')
const configReader = require('./src/config-reader')
const payload = require('./src/payload')
const testBuilder = require('./src/test-builder')

const optionDefinitions = [
    { name: 'config', alias: 'c', type: String, defaultValue: path.resolve('./rest-easy.config.js') },
    { name: 'reporter', alias: 'r', type: String }
]

const options = commandLineArgs(optionDefinitions)

console.log(options)

const config = configReader.getAndValidateConfig(options.config)

console.log(config)

const payloads = payload.getPayloads(config.payloadDir)

console.log(payloads)

const mocha = testBuilder.buildTests(config.testsDir, payloads)
if (options.reporter) mocha.reporter(options.reporter)
mocha.run()
