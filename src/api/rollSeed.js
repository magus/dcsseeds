const send = require('src/server/zeitSend');
const { randomElement } = require('src/server/random');
const { generateSeed } = require('src/server/seed');
const Species = require('src/utils/Species');
const Backgrounds = require('src/utils/Backgrounds');
const Version = require('src/Version');

// returns the random seed values for /new
// Example API Request
// http://localhost:3000/api/rollSeed

module.exports = async (req, res) => {
  try {
    const seed = generateSeed();
    const version = req.query.version || Version.v29;

    let species = req.query.species;
    let background = req.query.background;

    // choose random species
    if (!species) {
      // filter out banned combos
      // e.g. felid weapon backgrounds like gladiator, hunter, etc.
      // e.g. demigod god backgrounds like chaos knight, monk, etc.
      const speciesOptions = Version.getSpecies({ version, background }).filter((_) => !_.banned);
      species = randomElement(speciesOptions).value;
    }

    // choose random background
    if (!background) {
      const backgroundOptions = Version.getBackgrounds({ version, species }).filter((_) => !_.banned);
      background = randomElement(backgroundOptions).value;
    }

    // api response used by getInitialProps of pages/New
    return send(res, 200, { background, species, version, seed });
  } catch (err) {
    return send(res, 500, err);
  }
};
