// Include the cluster module
const cluster = require('cluster');
const express = require('express');

const authRoute = require('./routes/auth.route');
const clientRoute = require('./routes/client.route');
const tournamentRoute = require('./routes/tournament.route');
const teamRoute = require('./routes/team.route');
const playerRoute = require('./routes/player.route');
const userRoute = require('./routes/user.route');
const tournamentMatchRoute = require('./routes/tournamentmatch.route');
const userPlayerRoute = require('./routes/userplayer.route');
const tournamentTeamRoute = require('./routes/tournamentteam.route');
const tournamentPointRoute = require('./routes/tournamentpoint.route');
const teamPlayerRoute = require('./routes/teamplayer.route');
const tournamentMatchPlayerScoreRoute = require('./routes/tournamentMatchPlayerScrore.route');

const bodyParser = require('body-parser');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const rfs = require('rotating-file-stream');
const { includeAllLogs, port } = require('./configs/general');
const passport = require('passport');
require('./configs/passport')(passport);

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');


let logDirectory = path.join(__dirname, 'logs');
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
let accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily you can also provide the file size limitation.
    path: logDirectory
});
let errorLogStream = rfs('error.log', {
    interval: '1d', // rotate daily you can also provide the file size limitation.
    path: logDirectory
});

var ImageDir = require('path').join(__dirname, '/assets/images/');
var ThumbnailImageDir = require('path').join(__dirname, '/assets/images/thumbnail/');

// Creating the express instance
let app = express();
app.use(cors());
// Adding middlewear to express
app.use(passport.initialize());
app.use(passport.session());
app.use('/images', express.static(ImageDir));
app.use('/images/thumbnail', express.static(ThumbnailImageDir));
// setup the logger
const logFormatter = (tokens, req, res) => {

    let log = {
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        responseLength: tokens.res(req, res, 'content-length'),
        responseTime: tokens['response-time'](req, res) + ' ms',
        remoteAddr: tokens['remote-addr'](req, res),
        remoteUser: tokens['remote-user'](req, res),
        requestHeaders: req["headers"],
        requestParams: req["params"],
        requestBody: req["body"]
    }

    return JSON.stringify(log);

}
// To include all request the logs set the flag `includeAllLogs` in true in general config.
if (includeAllLogs) {
    app.use(morgan(logFormatter, { stream: accessLogStream }))
}
// All the error logs should be added to fileSystem.
app.use(morgan(logFormatter, {
    skip: function (req, res) {
        return res.statusCode < 400
    },
    stream: errorLogStream
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/auth', authRoute);
app.use('/client', passport.authenticate('jwt', { session: false }), clientRoute);
app.use('/api/tournament', tournamentRoute);
app.use('/api/tournamentMatch', tournamentMatchRoute);
app.use('/api/team', teamRoute);
app.use('/api/player', playerRoute); // Remain FOr Swagger
app.use('/api/user', userRoute);
app.use('/api/userplayer', userPlayerRoute);
app.use('/api/tournamentteam', tournamentTeamRoute);
app.use('/api/teamplayer', teamPlayerRoute);
app.use('/api/tournamentpoint', tournamentPointRoute);
app.use('/api/tournamentmatchplayerscore', tournamentMatchPlayerScoreRoute);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        detail: err
    });
});
// Code to run if we're in the master process
if (cluster.isMaster) {
    // Count the machine's CPUs
    let cpuCount = require('os').cpus().length;
    // Create a worker for each CPU
    for (let i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
    // Listen for dying workers
    cluster.on('exit', (worker) => {
        // Replace the dead worker, we're not sentimental
        console.log('Worker %d died :(', worker.id);
        cluster.fork();

    });
    // Code to run if we're in a worker process
}
else {
    // Add a basic route – index page
    app.get('/', (request, response) => {
        console.log('Request to worker %d', cluster.worker.id);
        response.send('Hello from Worker ' + cluster.worker.id);
    });

    app.listen(8087);
    console.log('Worker %d running! on port = %d', cluster.worker.id, port);
}
