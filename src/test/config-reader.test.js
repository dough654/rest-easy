const assert = require('assert')
const reader = require('../config-reader')
const sinon = require('sinon')
const joi = require('joi')
const path = require('path')

describe('getAndValidateConfig', function () {
    const sandbox = sinon.createSandbox()
    let joiValidateStub
    beforeEach(function () {
        const fakePayload = {
            name: 'bob smith'
        }
        joiValidateStub = sandbox.stub(joi, 'validate')
            .returns(fakePayload)
    })
    afterEach(function () {
        sandbox.restore()
    })
    it('should throw an error if the config path does not exist', function () {
        assert.throws(_ => {
            reader.getAndValidateConfig('./paththatdoesnotexist')
        }, err => {
            if (err.message === 'Configuration file "./paththatdoesnotexist" does not exist')
                return true
        })
    })
    it('should throw an error if the path exists, but the file can not be imported with require', function () {
        assert.throws(_ => {
            reader.getAndValidateConfig(path.join(__dirname, 'static-files', 'invalidfile.js'))
        }, err => {
            if (err.message.includes('Invalid configuration syntax'))
                return true
        })
    })
    it('should throw an error when the config is valid JS, but it does not pass joi validation', function () {
        joiValidateStub
            .returns({
                error: {
                    details: [
                        {
                            message: 'fake error'
                        }
                    ]
                }
            })
        assert.throws(_ => {
            reader.getAndValidateConfig(path.join(__dirname, 'static-files', 'validfile.js'))
        }, err => {
            if (err.message.includes('fake error') && err.message.includes('Invalid Configuration'))
                return true
        })
    })
    it('should return the validated payload returned from joi when successfully validated', function () {
        joiValidateStub
            .returns({
                value: 'the payload'
            })
        const actual = reader.getAndValidateConfig(path.join(__dirname, 'static-files', 'validfile.js'))
        assert.deepEqual(actual, 'the payload')
    })
})