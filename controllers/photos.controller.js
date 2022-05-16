const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model')

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const file = req.files.file;
    const title = escape(req.fields.title);
    const author = escape(req.fields.author);
    const email = escape(req.fields.email)

    if(title.length <= 25 && author.length <= 50 && email && file.type.match('image.*')) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const voter = await Voter.findOne({ user: req.clientIp })
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      if (!voter) {
        const newVoter = new Voter({ user: req.clientIp, votes: req.params.id })
        await newVoter.save();
        photoToUpdate.votes++;
        photoToUpdate.save();
        res.send({ message: 'OK' });
      } else {
        const voteIndex = voter.votes.indexOf(req.params.id);
        if (voteIndex === -1) {
          photoToUpdate.votes++;
          await photoToUpdate.save();
          voter.votes.push(req.params.id)
          await voter.save();
          res.send({ message: 'OK' });
        } 
      }
    }
  } catch(err) {
    res.status(500).json(err);
  }
};
