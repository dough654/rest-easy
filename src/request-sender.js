const joi = require('joi')
const request = require('sync-request')

const optionsSchema = joi.object().keys({
    url: joi.string().uri().required(),
    method: joi.string().uppercase().valid('POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS').default('GET'),
    headers: joi.object(),
    body: joi.any(),
    parseResponse: joi.bool().default(true)
})

module.exports.sendRequest = options => {
    const {error, value: validatedOptions} = joi.validate(options, optionsSchema)
    if (error) throw new Error(`Incorrect http request options provided ${JSON.stringify(error.details.map(detail => detail.message))}`)
    const method = validatedOptions.method
    const url = validatedOptions.url
    delete validatedOptions.method
    delete validatedOptions.url
    if (validatedOptions.body) validatedOptions.json = validatedOptions.body
    delete validatedOptions.body
    const res = request(method, url, validatedOptions)
    res.body = res.body.toString('utf8')
    if (validatedOptions.parseResponse) {
        try { res.body = JSON.parse(res.body) } catch (err) { throw new Error(`Could not validate response body ${err}`)}
    }
    return res
}