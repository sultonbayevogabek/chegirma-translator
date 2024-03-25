const fs = require('fs/promises');
const path = require('path')

module.exports = async (req, res) => {
    try {
        let { filesDirectory, key, uz, ru} = req.body;

        const jsonsDirectory = path.join(filesDirectory);
        const jsonsFileNames = (await fs.readdir(jsonsDirectory)).filter(fileName => fileName.endsWith('.json'));

        if (jsonsFileNames.length) {
            const fileContentsPromises = jsonsFileNames.map(fileName => {
                return fs.readFile(path.join(jsonsDirectory, fileName), {encoding: 'utf-8'});
            })

            Promise.all(fileContentsPromises).then(fileContents => {
                fileContents?.forEach(async (content, index) => {
                    let translation = JSON.parse(content);
                    let fileName = jsonsFileNames[index];

                    switch (fileName) {
                        case 'uz.json':
                            translation[key] = uz;
                            break;
                        case 'ru.json':
                            translation[key] = ru;
                            break;
                    }

                    const sortedKeys = Object.keys(translation).sort();

                    const sortedTranslation = {};

                    sortedKeys.forEach(key => {
                        sortedTranslation[key] = translation[key];
                    })

                    await fs.writeFile(path.join(jsonsDirectory, fileName), JSON.stringify(sortedTranslation, null, 2));
                })

                res.send({
                    ok: true,
                    message: `Yangi so'z qo'shildi`
                })
            })
        }
    } catch (e) {
        res.send({
            ok: false,
            message: `Xatolik sodir bo'ldi`
        })
    }
}
