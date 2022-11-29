const Logs = require("../models/logs");

exports.test = async(req, res) => {
    
    let newLogs = new Logs();
    newLogs.body = JSON.stringify(req.body);
    newLogs.query = JSON.stringify(req.query);
    newLogs.params = JSON.stringify(req.params);
    await newLogs.save();
    
    res.status(200).json({
      status: "success",
      body: JSON.stringify(req.body),
      query: JSON.stringify(req.query),
      params: JSON.stringify(req.params),
    });
}