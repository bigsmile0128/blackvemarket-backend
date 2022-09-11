const sql = require("./db.js");

// constructor
const Admin = function(admin) {
  this.name = admin.name;
  this.email = admin.email;
  this.password = admin.password;
};

Admin.create = (newAdmin, result) => {
  sql.query("INSERT INTO admins SET ?", newAdmin, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    // console.log("created user: ", { id: res.insertId, ...newAdmin });
    result(null, { id: res.insertId, ...newAdmin });
  });
};

// nft.findById = (id, result) => {
//   sql.query(`SELECT * FROM nfts WHERE id = ${id}`, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(err, null);
//       return;
//     }

//     if (res.length) {
//       console.log("found nft: ", res[0]);
//       result(null, res[0]);
//       return;
//     }

//     // not found nft with the id
//     result({ kind: "not_found" }, null);
//   });
// };

Admin.getAll = (title, result) => {
  let query = "SELECT * FROM admins";

  if (title) {
    query += ` WHERE email LIKE '%${title}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("users: ", res);
    result(null, res);
  });
};

// nft.getAllPublished = result => {
//   sql.query("SELECT * FROM nfts WHERE published=true", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log("nfts: ", res);
//     result(null, res);
//   });
// };

// nft.updateById = (id, nft, result) => {
//   sql.query(
//     "UPDATE nfts SET title = ?, description = ?, published = ? WHERE id = ?",
//     [nft.title, nft.description, nft.published, id],
//     (err, res) => {
//       if (err) {
//         console.log("error: ", err);
//         result(null, err);
//         return;
//       }

//       if (res.affectedRows == 0) {
//         // not found nft with the id
//         result({ kind: "not_found" }, null);
//         return;
//       }

//       console.log("updated nft: ", { id: id, ...nft });
//       result(null, { id: id, ...nft });
//     }
//   );
// };

// nft.remove = (id, result) => {
//   sql.query("DELETE FROM nfts WHERE id = ?", id, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     if (res.affectedRows == 0) {
//       // not found nft with the id
//       result({ kind: "not_found" }, null);
//       return;
//     }

//     console.log("deleted nft with id: ", id);
//     result(null, res);
//   });
// };

// nft.removeAll = result => {
//   sql.query("DELETE FROM nfts", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log(`deleted ${res.affectedRows} nfts`);
//     result(null, res);
//   });
// };

module.exports = Admin;
