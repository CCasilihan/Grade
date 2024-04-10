// Import required modules
const express = require("express");
const pool = require("./database.js");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const { verifyToken, secretKey } = require("./verifyToken");

// Create a new router
const router = express.Router();

// Register route for courses
router.post("/addcourses", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;  

    // Decode the JWT to get the student_id
    const token = req.header("Authorization");
    const decoded = jwt.verify(token, secretKey);
    const student_id = decoded.id;

    // Insert the course into the database
    const newCourse = await pool.query(
      "INSERT INTO courses (name, student_id) VALUES ($1, $2) RETURNING *",
      [name, student_id]
    );

    res.json(newCourse.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update route for courses
router.put("/updatecourses", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    // Decode the JWT to get the student_id
    const token = req.header("Authorization");
    const decoded = jwt.verify(token, secretKey);
    const student_id = decoded.id;

    // Update the course in the database
    const updatedCourse = await pool.query(
      "UPDATE courses SET name = $1 WHERE id = $2 AND student_id = $3 RETURNING *",
      [name, req.body.courseId, student_id]
    );

    if (updatedCourse.rows.length > 0) {
      res.json(updatedCourse.rows[0]);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
    
// View route for courses
router.get("/viewcourses", verifyToken, async (req, res) => {
  try {
    // Decode the token to get the student_id
    const decodedToken = jwt.verify(req.headers.authorization, secretKey);
    const studentId = decodedToken.id;

    // Fetch the courses related to the student from the database
    const courses = await pool.query(
      "SELECT * FROM courses WHERE student_id = $1",
      [studentId]
    );

    if (courses.rows.length > 0) {
      res.json(courses.rows);
    } else {
      res
        .status(404)
        .json({ message: "Courses not found for the given student" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.delete("/deletecourses", verifyToken, async (req, res) => {
    try {
      // Decode the JWT to get the student_id
      const token = req.header("Authorization");
      const decoded = jwt.verify(token, secretKey);
      const student_id = decoded.id;
  
      // Start a transaction
      await pool.query('BEGIN');
  
      // Delete the grades related to the course
      await pool.query(
        "DELETE FROM grades WHERE course_id = $1 AND student_id = $2",
        [req.body.courseId, student_id]
      );
  
      // Delete the course from the database
      const deletedCourse = await pool.query(
        "DELETE FROM courses WHERE id = $1 AND student_id = $2 RETURNING *",
        [req.body.courseId, student_id]
      );
  
      // If the course was deleted successfully, commit the transaction
      if (deletedCourse.rows.length > 0) {
        await pool.query('COMMIT');
        res.json({ message: "Course and related grades deleted successfully." });
      } else {
        // If the course was not found, rollback the transaction
        await pool.query('ROLLBACK');
        res.status(404).json({ message: "Course not found" });
      }
    } catch (err) {
      // If an error occurred, rollback the transaction
      await pool.query('ROLLBACK');
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });

// Register route for grades
router.post("/addgrades", verifyToken, async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.headers.authorization, secretKey);
    const studentId = decodedToken.id;

    const { course_id, prelim_grade, mid_grade, semis_grade, final_grade } =
      req.body;

    // Insert the grade into the database
    const newGrade = await pool.query(
      "INSERT INTO grades (student_id, course_id, prelim_grade, mid_grade, semis_grade, final_grade) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [studentId, course_id, prelim_grade, mid_grade, semis_grade, final_grade]
    );

    res.json(newGrade.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update route for grades
router.put("/updategrades", verifyToken, async (req, res) => {
  try {
    const { grade_id, prelim_grade, mid_grade, semis_grade, final_grade } =
      req.body;

    // Update the grade in the database
    const updatedGrade = await pool.query(
        "UPDATE grades SET prelim_grade = $1, mid_grade = $2, semis_grade = $3, final_grade = $4 WHERE grade_id = $5 RETURNING *",
        [prelim_grade, mid_grade, semis_grade, final_grade, grade_id]
      );

    if (updatedGrade.rows.length > 0) {
      res.json(updatedGrade.rows[0]);
    } else {
      res.status(404).json({ message: "Grade not found" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/viewgrades", verifyToken, async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.headers.authorization, secretKey);
    const studentId = decodedToken.id;
    const { course_id } = req.query;

    // Fetch the grades from the database
    const grades = await pool.query(
      "SELECT * FROM grades WHERE student_id = $1 AND course_id = $2",
      [studentId, course_id]
    );

    if (grades.rows.length > 0) {
      res.json(grades.rows);
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Delete route for grades
router.delete("/deletegrades", verifyToken, async (req, res) => {
  try {
    const { grade_id } = req.body;

    // Delete the grade from the database
    const deletedGrade = await pool.query(
      "DELETE FROM grades WHERE grade_id = $1 RETURNING *",
      [grade_id]
    );

    if (deletedGrade.rows.length > 0) {
      res.json({ message: "Grade deleted successfully." });
    } else {
      res.status(404).json({ message: "Grade not found" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Export the router
module.exports = router;
