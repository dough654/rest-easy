const fs = require('fs')
const path = require('path')
const gherkin = require('gherkin')

module.exports = {
    getFeatures: async (directory) => {
        if (!fs.existsSync(directory)) throw new Error(`Payload directory "${directory}" does not exist`)
        const walkSync = async (dir, baseObj) => {
            let features = []
            for (const file of fs.readdirSync(dir)) {
                console.log('looking at file', file)
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    baseObj[path.basename(file)] = walkSync(path.join(dir, file), {})
                } else if (file.toLowerCase().includes('.feature')) {
                    console.log('got a feature')
                    try {
                        const fileFeatures = (await getFeaturesFromFile(path.join(dir, file)))
                            .filter(file => file.gherkinDocument)
                            .map(obj => obj.gherkinDocument)
                            .map(doc => doc.feature)
                            .map(feature => ({
                                name: feature.name,
                                scenarios: feature.children
                                    .filter(child => child.scenario)
                                    .map(obj => obj.scenario)
                                    .map(scenario => ({
                                        name: scenario.name,
                                        text: scenario.steps.map(step => `${step.keyword}${step.text}`).join('\n')
                                    }))
                            }))
                        features = [...features, ...fileFeatures]
                        console.log('got features', JSON.stringify(features, null, 4))
                    } catch (err) {
                        throw new Error(`Could not load feature file ${path.join(dir, file)}: ${err}`)
                    }
                }
            }
            return features
        }
        return await walkSync(directory, {})
    }
}

function getFeaturesFromFile(filePath) {
    let features = []
    return new Promise((resolve, reject) => {
        const stream = gherkin.fromPaths([filePath])
        stream.on('data', function (data) {
            features.push(data)
        })
        stream.on('end', function () {
            resolve(features)
        })
    })
}