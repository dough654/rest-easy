const Mocha = require('mocha')
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const requestSender = require('./request-sender')
const clone = require('clone-deep')
const joi = require('joi')

const testSuiteSchema = joi.object().keys({
    name: joi.string().min(1).max(255),
    description: joi.string().min(1).max(255),
    feature: joi.string(),
    tests: joi.array().items(
        joi.object().keys({
            name: joi.string().min(1).max(255),
            description: joi.string().min(1).max(255),
            scenario: joi.string(),
            requests: joi.func(),
            assertions: joi.func()
        })
    ).min(1)
})

module.exports = {
    buildTests: (directory, payloads, features) => {
        console.log('features now', features)
        if (!fs.existsSync(directory)) throw new Error(`Tests directory "${directory}" does not exist`)
        const mocha = new Mocha()
        const suite = Mocha.Suite.create(mocha.suite, 'Rest Easy Tests')
        const walkFileTree = (dir, testSuite) => {
            fs.readdirSync(dir).forEach(file => {
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    testSuite.addSuite(walkFileTree(path.join(dir, file)))
                } else if (file.toLowerCase().includes('.js')) {
                    let testObj
                    try {
                        testObj = require(path.resolve(path.join(dir, file)))
                    } catch (err) {
                        throw new Error(`The Test Suite file ${path.join(dir, file)} is not valid ${err}`)
                    }
                    const fileSuite = Mocha.Suite.create(testSuite, `Test file -> ${file}`)
                    for (let prop in testObj) {
                        // Add joi validation here
                        const newSuite = Mocha.Suite.create(fileSuite, `${testObj[prop].name} - (${testObj[prop].description})`)
                        for (const test of testObj[prop].tests) {
                            let scenario
                            if (testObj[prop].feature && test.scenario) {
                                console.log('looking for feature', testObj[prop].feature, 'and scenario', test.scenario)
                                const matchingFeatures = features
                                    .filter(feat => feat.name.toLowerCase().trim() === testObj[prop].feature.toLowerCase().trim())
                                if (matchingFeatures.length === 0) throw new Error(`No Feature found named "${testObj[prop].feature}", in test file ${file}`)
                                const matchingScenarios = matchingFeatures[0].scenarios
                                    .filter(scenario => scenario.name.toLowerCase().trim() === test.scenario.toLowerCase().trim())
                                if (matchingScenarios.length === 0) throw new Error(`No Scenario named "${test.secenario}" in feature "${testObj.feature}", in file ${file}`)
                                console.log('matching', matchingScenarios)
                                scenario = matchingScenarios[0]
                            }
                            console.log('found the scenario', scenario)
                            const testDesc = test.scenario ? `Scenario: ${test.scenario}` : `${test.name} - (${test.description})`
                            newSuite.addTest(new Mocha.Test(testDesc, function () {
                                const payloadsCopy = clone(payloads)
                                const preResults = test.requests(requestSender.sendRequest, JSON.parse(JSON.stringify(payloadsCopy)))
                                try {
                                    test.assertions(preResults, JSON.parse(JSON.stringify(payloadsCopy)))
                                } catch (err) {
                                    if (scenario) {
                                        err.scenario = scenario.text
                                    }
                                    throw err
                                }
                            }))
                        }
                    }
                }
            })
            return testSuite
        }
        walkFileTree(directory, suite)
        return mocha
    }
}