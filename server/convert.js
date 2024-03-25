const {translate} = require("@vitalets/google-translate-api");
const {post} = require("axios");

module.exports = async (req, res) => {
  let { uz } = req.body;

  let ru = ''
  let en = ''

  Promise.all([
    translate(uz, {from: 'uz', to: 'ru'}),
    translate(uz, {from: 'uz', to: 'en'})
  ]).then(([{text: rus}, {text: eng}]) => {
    ru = rus;
    en = eng;

    res.send({
      uz,
      ru,
      key: en?.split(' ')?.join('.')?.toLowerCase()
    });
  }).catch(() => {
  })
}
