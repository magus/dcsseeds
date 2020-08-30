const send = require('src/server/utils/zeitSend');
const { randomElement } = require('src/utils/random');
const { generateSeed } = require('src/utils/seed');
const Species = require('src/utils/Species');
const Backgrounds = require('src/utils/Backgrounds');

// returns the random seed values for /new
// Example API Request
// http://localhost:3000/api/rollSeed

module.exports = async (req, res) => {
  try {
    const seed = generateSeed();
    const species = randomElement(Object.values(Species.Names));
    const background = randomElement(Object.values(Backgrounds.Names));

    return send(res, 200, { background, species, seed });
  } catch (err) {
    return send(res, 500, err);
  }
};
