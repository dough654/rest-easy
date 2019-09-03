const assert = require('assert')

const baseURL = 'http://localhost:3000/api/v1'

// **************** POST User ******************

module.exports.createUserSuite = {
    name: 'Create A User',
    description: 'Creates a user using the /user route',
    feature: 'User Creation',
    tests: [
        {
            scenario: 'Create a basic user',
            requests: (executeRequest, payloads) => {
                return executeRequest({
                    url: `${baseURL}/user`,
                    method: 'POST',
                    body: payloads.users.success.bobsmith,
                })
            },
            assertions: (results, payloads) => {
                assert.deepEqual(results.statusCode, 200)
                for (let prop in payloads.users.success.bobsmith) {
                    assert.deepEqual(results.body[prop], payloads.users.success.bobsmith[prop])
                }
                assert.ok(results.body._id)
            }
        },
        {
            name: 'Missing Fields',
            description: 'Fails when required fields are not present',
            requests: (executeRequest, payloads) => {
                const invalidUser = { ...payloads.users.success.bobsmith }
                delete invalidUser.email
                return executeRequest({
                    url: `${baseURL}/user`,
                    method: 'POST',
                    body: invalidUser,
                })
            },
            assertions: (results, payloads) => {
                assert.deepEqual(results.statusCode, 400)
            }
        }
    ]

}

// **************** GET User ******************

module.exports.getUserSuite = {
    name: 'Get User',
    description: 'Gets an existing user by Id',
    tests: [
        {
            name: 'Successfully get an existing user',
            description: 'Successfully retrieves a user from the id provided',
            requests: (executeRequest, payloads) => {
                const newUser = { ...payloads.users.success.bobsmith }
                newUser.email = "newEmail@email.com"
                const existingUser = executeRequest({
                    url: `${baseURL}/user`,
                    method: 'POST',
                    body: newUser,
                }).body
                return {
                    existingUser,
                    getResponse: executeRequest({
                        url: `${baseURL}/user/${existingUser._id}`,
                        method: 'GET'
                    })
                }
            },
            assertions: (results) => {
                assert.deepEqual(results.getResponse.statusCode, 200)
                for (let prop in results.existingUser) {
                    assert.deepEqual(results.getResponse.body[prop], results.existingUser[prop])
                }
            }
        },
        {
            name: 'User not found',
            description: 'Should get a 404 back when id is valid but does not exist',
            requests: (executeRequest, payloads) => {
                return executeRequest({
                    url: `${baseURL}/user/123456789012345678901234`,
                    method: 'GET'
                })
            },
            assertions: (results, payloads) => {
                assert.deepEqual(results.statusCode, 404)
            }
        }
    ]
}