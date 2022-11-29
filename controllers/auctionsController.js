
exports.test = async(req, res) => {
    console.log(req);
    res.status(200).json({
      status: "success",
    });
}