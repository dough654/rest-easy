const assert = require('assert')

const baseURL = 'http://localhost:3000/api/v1'

// **************** POST User ******************

module.exports.createUserSuite = {
    name: 'Create A User',
    description: 'Creates a user using the /user route',
    steps: [
        {
            name: 'Create a basic user',
            description: 'Creates a user with the basic properties',
            pre: (executeRequest, payloads) => {
                return executeRequest({
                    url: `${baseURL}/user`,
                    method: 'POST',
                    body: payloads.users.success.bobsmith,
                })
            },
            tests: (results, payloads) => {
                assert.deepEqual(results.statusCode, 200)
                for (let prop in payloads.user) {
                    assert.deepEqual(results.body[prop], payloads.user[prop])
                }
                assert.ok(results.body._id)
            }
        },
        {
            name: 'Missing Fields',
            description: 'Fails when required fields are not present',
            pre: (executeRequest, payloads) => {
                const invalidUser = { ...payloads.users.success.bobsmith }
                delete invalidUser.email
                return executeRequest({
                    url: `${baseURL}/user`,
                    method: 'POST',
                    body: invalidUser,
                })
            },
            tests: (results, payloads) => {
                assert.deepEqual(results.statusCode, 400)
            }
        }
    ]

}

// **************** GET User ******************

module.exports.getUserSuite = {
    name: 'Get User',
    description: 'Gets an existing user by Id',
    steps: [
        {
            name: 'Successfully get an existing user',
            description: 'Successfully retrieves a user from the id provided',
            pre: (executeRequest, payloads) => {
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
            tests: (results) => {
                assert.deepEqual(results.getResponse.statusCode, 200)
                for (let prop in results.existingUser) {
                    assert.deepEqual(results.getResponse.body[prop], results.existingUser[prop])
                }
            }
        },
        {
            name: 'User not found',
            description: 'Should get a 404 back when id is valid but does not exist',
            pre: (executeRequest, payloads) => {
                return executeRequest({
                    url: `${baseURL}/user/123456789012345678901234`,
                    method: 'GET'
                })
            },
            tests: (results, payloads) => {
                assert.deepEqual(results.statusCode, 404)
            }
        }
    ]
}