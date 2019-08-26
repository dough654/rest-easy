const fs = require('fs')
const path = require('path')

module.exports = {
    getPayloads: (directory) => {
        if (!fs.existsSync(directory)) throw new Error(`Payload directory "${directory}" does not exist`)
        const walkSync = (dir, baseObj) => {
            fs.readdirSync(dir).forEach(file => {
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    baseObj[path.basename(file)] = walkSync(path.join(dir, file), {})
                } else if (file.toLowerCase().includes('.json')) {
                    let payloadObj
                    try {
                        payloadObj = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
                    } catch (err) {
                        throw new Error(`Payload file ${path.join(dir, file)} is not valid JSON`)
                    }
                    baseObj[file.split('.')[0]] = payloadObj
                }
            })
            return baseObj
        }
        return walkSync(directory, {})
    }
}

