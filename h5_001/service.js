 const http = require("http")
 const fs = require("fs")
 const path = require("path")
 const server = http.createServer()
 server.on("request", function(req, res) {
     const url = req.url
     console.log(url + "url")
     const fpath = path.join(__dirname, url)
     fs.readFile(fpath, (err, dataStr) => {
         if (err) return res.end("404 Not fount.")
         res.end(dataStr)
     })
 })
 server.listen(8089, function() {
     console.log("server listen at http://127.0.0.1")
 })