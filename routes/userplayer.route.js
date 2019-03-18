const { Router } = require('express');
const router = Router();

const { UserPlayer, TournamentMatch, Player } = require('../sequelize.js');

router.post('/', (req, res) => {
    const userPlayerObject = new UserPlayer();
    userPlayerObject.tournamentId = req.body.tournamentId;
    userPlayerObject.userId = req.body.userId;
    userPlayerObject.playerId = req.body.playerId;

    return userPlayerObject.save().then((userplayer) => {
        res.json(userplayer).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });

});
    
router.put('/:id', (req, res) => {
    return UserPlayer.update({
        tournamentId: req.body.tournamentId,
        userId: req.body.userId,
        playerId: req.body.playerId,
    },
        { where: { id: req.params.id } }).then((userplayer) => {
            res.json(userplayer).status(200);
        }).catch((err) => {
            res.json({ "error": JSON.stringify(err) }).status(400);
        });
});

router.get('/:userId', (req, res) => {
    return UserPlayer.findAll({
        where: {
            userId: req.params.userId
        },
        include: [
        {
            model: Player,
        }]
    }).then((resp) => {
        console.log(resp);
        res.json(resp).status(200);
    }).catch((err) => {
        res.json({ "error": JSON.stringify(err) }).status(400);
    });
})

module.exports = router;