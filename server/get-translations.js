const fs = require('fs/promises');
const path = require('path')

module.exports = async (req, res) => {
  let { filesDirectory, search = '', page = 0 } = req.body;
  let total = 0;

  const jsonsDirectory = path.join(filesDirectory);
  const jsonsFileNames = (await fs.readdir(jsonsDirectory))?.filter(fileName => fileName.endsWith('.json'))

  let translations = [];
  const translationsKeys = [];

  if (jsonsFileNames.length) {
    const firstJsonFileName = jsonsFileNames[0];
    const firstJsonContent = await fs.readFile(
      path.join(jsonsDirectory, firstJsonFileName),
      {encoding: 'utf-8'}
    );
    const firstTranslation = JSON.parse(firstJsonContent);

    for (const firstTranslationKey in firstTranslation) {
      translationsKeys.push(firstTranslationKey);
      translations.push({
        key: firstTranslationKey,
        [firstJsonFileName]: firstTranslation[firstTranslationKey]
      })
    }

    const fileContentsPromise = jsonsFileNames?.slice(1).map(fileName => {
      return fs.readFile(
        path.join(jsonsDirectory, fileName),
        {encoding: 'utf-8'}
      );
    })

    Promise.all(fileContentsPromise).then(fileContents => {
      fileContents.forEach((fileContent, index) => {
        const translation = JSON.parse(fileContent);

        translations.forEach(t => {
          t[jsonsFileNames[index + 1]] = translation[t.key];
        })
      })

      if (search.trim().length) {
        search = search?.trim()?.toLowerCase();
        translations = translations?.filter((item) => {
          return (
            item['key']?.toLowerCase()?.includes(search) ||
            item['uz.json']?.toLowerCase()?.includes(search) ||
            item['ru.json']?.toLowerCase()?.includes(search)
          );
        });
      }

      total = translations?.length;
      translations = translations?.slice(page * 50, (page + 1) * 50);

      res.send({
        total, translations, translationsKeys
      })
    })
  }
}
