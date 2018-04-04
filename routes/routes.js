
/**
 * Module Dependencies
 */

const router        = require("express").Router();
const saveCvFunc    = require("../middlewares/saveCv");
const winston       = require("winston");

/**
 * POST Track API
 */
router.post("/user/info/save", (req, res) => {
    console.log(req);

    saveCvFunc.save(req.body)
        .then(result => {
            res.send(result)
        })
        .catch(err => {
            winston.log("error", err);

            res.status(502);

            return res.json({
                status: 1001,
                title: "Oops!",
                text: "Something went wrong. Please try again."
            });
        });
});

router.get("/user/info/avatar/:id", (req, res) => {
    saveCvFunc.getAvatar(req, res, (readStream, file) => {
        res.header("Content-Type", file.contentType || file);
        readStream.pipe(res);
    });
});

router.get("/user/info/by/:id", (req, res) => {
    saveCvFunc.getCvInfo(req.params)
        .then(result => {
            res.send(result)
        })
});




/**
 * Not Found API
 */
router.use((req, res, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

module.exports = router;