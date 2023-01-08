const commandLineArgs = require('command-line-args')
const path = require('path')
const configReader = require('./src/config-reader')
const payload = require('./src/payload')
const gherkin = require('./src/gherkin')
const testBuilder = require('./src/test-builder')

const optionDefinitions = [
    { name: 'config', alias: 'c', type: String, defaultValue: path.resolve('./rest-easy.config.js') },
    { name: 'reporter', alias: 'r', type: String }
]
const options = commandLineArgs(optionDefinitions)

async function go() {
    try {
        console.log(options)

        const config = configReader.getAndValidateConfig(options.config)

        console.log(config)

        const payloads = payload.getPayloads(config.payloadDir)

        console.log(payloads)

        const features = await gherkin.getFeatures(config.featuresDir)

        const mocha = testBuilder.buildTests(config.testsDir, payloads, features)
        mocha.reporter(path.resolve(path.join(__dirname, 'src', 'custom-reporter.js')))
        if (options.reporter) mocha.reporter(options.reporter)
        mocha.run()
    } catch (err) {
        throw err
    }
}

go()
    .then(x => console.log('done'))
    .catch(err => console.log(err))