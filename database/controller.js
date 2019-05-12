const { User, Place } = require('./models');

module.exports = {
    getPlaces: function (req, res){
        Place.find({user_id: req.body.user_id}).exec(function(err, results){
            if(err){
                return res.statusCode(500).send(err.message);    
            }
            return res.send(results);
        });
    },
    postPlace: function(req, res) {
        const place = req.body;
        Place.create(place).then(function(result){
            return res.send(result);
        }).catch(err => {
            return res.status(400).send(err.message);
        })
    }
};