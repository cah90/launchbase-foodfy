const db = require("../../config/db")
const fs = require("fs")

module.exports = {
  create(data) {
    const query = `
    INSERT INTO files (
      name,
      path,
      src
    ) VALUES ($1, $2, $3)
    RETURNING id
    `
    const values = [ 
      data.filename,
      data.path,
      data.src
    ]

    return db.query(query, values) 
  },

  find(recipeId) {
    const query = `
      SELECT *
      FROM recipe_files
      INNER JOIN files ON recipe_files.file_id = files.id
      WHERE recipe_files.recipe_id = $1
    `
    
    return db.query(query, [recipeId])
  },

  update(data) {
    const query = `
    UPDATE files SET 
    name=$1,
    path=$2,
    src=$3
    WHERE id=$4
   `
   const values = [
     data.filename,
     data.path,
     data.src,
     data.id
   ]

   return db.query(query, values)
  },

  async delete(id) {

    try {
      const result = await db.query(`
      SELECT *
      FROM files
      WHERE id = $1
      `, [id])

      const file = result.rows[0]

      fs.unlinkSync(file.path) //remove a file from filesystem. It does not work on directories.
      
      await db.query(`
      DELETE FROM recipe_files
      WHERE file_id = $1
      `, [id])

      return db.query(`
      DELETE FROM files 
      WHERE id = $1
      `, [id])

    } catch(err) {
        console.log(err)
    }

  }
} 
