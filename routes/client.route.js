const {Router} = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.json("Client route verified by JWT").status(200);
});

module.exports = router;