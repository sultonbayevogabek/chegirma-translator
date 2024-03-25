const fs = require('fs/promises');
const path = require('path')

module.exports = async (req, res) => {
  try {
    let { filesDirectory, key, lang, newValue } = req.body;
    const fileRoute = path.join(filesDirectory, lang);
    const fileContent = await fs.readFile(fileRoute, { encoding: 'utf-8' });
    const fileTranslation = JSON.parse(fileContent);

    fileTranslation[key] = newValue;
    await fs.writeFile(fileRoute, JSON.stringify(fileTranslation, null, 2));

    res.status(200).send({
      ok: true,
      message: `Fayl muvaffaqiyatli o'zgartirildi`
    })
  } catch (e) {
    res.status(400).send({
      ok: false,
      message: e.message
    })
  }
}
