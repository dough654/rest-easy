const fs = require('fs')
const path = require('path')
const joi = require('joi')

const configSchema = joi.object().keys({
    payloadDir: joi.string().default(path.resolve('./rest-easy/payloads')),
    testsDir: joi.string().default(path.resolve('./rest-easy/tests')),
    featuresDir: joi.string().default(path.resolve('./rest-easy/features'))
})

module.exports = {
    getAndValidateConfig: configPath => {
        if (!fs.existsSync(path.resolve(configPath))) throw new Error(`Configuration file "${configPath}" does not exist`)
        let config
        console.log('getting config', configPath)
        try { config = require(path.resolve(configPath)) } catch (err) { throw new Error(`Invalid configuration syntax ${err}`)}
        const { error, value: validatedConfig } = joi.validate(config, configSchema, { abortEarly: false })
        if (error) throw new Error(`Invalid Configuration: ${JSON.stringify(error.details.map(detail => detail.message))}`)
        return validatedConfig
    }
}