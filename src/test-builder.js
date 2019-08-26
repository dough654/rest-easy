const Mocha = require('mocha')
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const requestSender = require('./request-sender')

// const mocha = new Mocha()
// const suite = Mocha.Suite.create(mocha.suite, 'A great test suite level 1')

// function func1(aThing) {
//     assert.deepEqual(aThing, 'blah')
// }

// suite.addTest(new Mocha.Test('Super Great Test', function () {
//     func1('blah')
// }))

// mocha.run()

module.exports = {
    buildTests: (directory, payloads) => {
        if (!fs.existsSync(directory)) throw new Error(`Tests directory "${directory}" does not exist`)
        const mocha = new Mocha()
        const suite = Mocha.Suite.create(mocha.suite, 'Rest Easy Tests')

        const walkSync = (dir, testSuite) => {
            fs.readdirSync(dir).forEach(file => {
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    testSuite.addSuite(walkSync(path.join(dir, file)))
                } else if (file.toLowerCase().includes('.js')) {
                    let testObj
                    try {
                        testObj = require(path.resolve(path.join(dir, file)))
                    } catch (err) {
                        throw new Error(`The Test Suite file ${path.join(dir, file)} is not valid ${err}`)
                    }
                    for (let prop in testObj) {
                        // Add joi validation here
                        const newSuite = Mocha.Suite.create(testSuite, `${testObj[prop].name} - (${testObj[prop].description})`)
                        for (const step of testObj[prop].steps) {
                            newSuite.addTest(new Mocha.Test(`${step.name} - (${step.description})`, function() {
                                const preResults = step.pre(requestSender.sendRequest, payloads)
                                step.tests(preResults, payloads)
                            }))
                        }
                    }

                }
            })
            return testSuite
        }
        walkSync(directory, suite)
        return mocha
    }
}