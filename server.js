const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL 연결 정보
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "1111", // 설치할 때 설정한 비번
  database: "Notice_Board", // 사용할 DB 이름
};

const port = 3001;

// 공지사항 조회
app.get("/api/notice", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM notice_board");
    res.json(rows);
  } catch (err) {
    console.error("Select error:", err);
    res.status(500).send("DB select 실패");
  } finally {
    if (connection) await connection.end();
  }
});

/* 공지사항 등록
app.post("/api/notice", async (req, res) => {
  const { subject, content, pwd } = req.body;
  const clientIP = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      `INSERT INTO notice_board (subject, content, pwd) VALUES (?, ?, ?)`,
      [subject, content, pwd]
    );
    await connection.end();
    res.status(200).send("성공적으로 추가됨");
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).send("DB insert 실패");
  }
});*/

app.get("/api/notice/:id", async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM notice_board WHERE idx = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("서버 오류:", error);
    res.status(500).send("서버 내부 오류 발생");
  } finally {
    if (connection) connection.end();
  }
});
//
//피드백
app.post("/api/feedback", async (req, res) => {
  const { type, idx } = req.body;
  const validTypes = ["happy", "neutral", "dissapointment"];
  if (!validTypes.includes(type)) {
    return res.status(400).send("유효하지 않은 피드백 타입");
  }
  if (!idx) {
    return res.status(400).send("공지 idx가 필요합니다");
  }
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO notice_feedback (idx, happy, neutral, dissapointment)
      VALUES (?, 0, 0, 0)
      ON DUPLICATE KEY UPDATE ${type} = ${type} + 1
    `;
    await connection.execute(query, [idx]);
    res.status(200).send("피드백이 저장되었습니다");
  } catch (err) {
    console.error("피드백 저장 오류:", err);
    res.status(500).send("DB 오류");
  } finally {
    if (connection) await connection.end();
  }
});

// server.js

// Q&A 목록 조회 (페이지네이션 기능 포함)
app.get("/api/qna", async (req, res) => {
  // 페이지 번호를 쿼리 파라미터에서 가져옵니다. 없으면 1페이지로 간주.
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 10; // 한 페이지에 보여줄 게시물 수
  const offset = (page - 1) * limit;

  let connection;
  try {
    //커넥션 풀을 사용하고 있다면 pool.getConnection()을 사용
    connection = await mysql.createConnection(dbConfig);

    // 1. 전체 게시물 수를 먼저 구해서 총 페이지 수를 계산
    const [countRows] = await connection.execute(
      "SELECT count(id) as total FROM Questions"
    );
    const totalPages = Math.ceil(countRows[0].total / limit);

    // 2. 현재 페이지에 해당하는 데이터만 잘라서 가져옵니다
    const sql = "SELECT * FROM Questions ORDER BY id DESC LIMIT ? OFFSET ?";
    const [rows] = await connection.execute(sql, [limit, offset]);

    // 3. 프론트엔드가 필요한 형식에 맞춰 응답
    res.json({ questions: rows, totalPages: totalPages });
  } catch (err) {
    console.error("Q&A 목록 조회 오류:", err);
    res.status(500).send("DB 조회 실패");
  } finally {
    if (connection) connection.end(); // 커넥션 풀 사용 시 connection.release()
  }
});

// Q&A 상세 조회
app.get("/api/qna/:id", async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "UPDATE Questions SET view_count = view_count + 1 WHERE id = ?",
      [id]
    );
    const sql = `SELECT q.*, u.nickname FROM Questions q JOIN Users u ON q.user_id = u.id WHERE q.id = ?`;
    const [rows] = await connection.execute(sql, [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send("해당 질문을 찾을 수 없습니다.");
    }
  } catch (err) {
    console.error("Q&A 상세 조회 오류:", err);
    res.status(500).send("DB select 실패");
  } finally {
    if (connection) await connection.end();
  }
});

// Q&A 질문 등록
app.post("/api/qna", async (req, res) => {
  const { user_id, subject, content, pwd, is_private } = req.body;
  if (!user_id || !subject || !content) {
    return res.status(400).send("필수 입력 항목이 누락되었습니다.");
  }
  if (is_private && !pwd) {
    return res.status(400).send("비밀글은 비밀번호가 필요합니다.");
  }
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const sql = `INSERT INTO Questions (user_id, subject, content, pwd, is_private) VALUES (?, ?, ?, ?, ?)`;
    await connection.execute(sql, [
      user_id,
      subject,
      content,
      is_private ? pwd : null,
      is_private ? 1 : 0,
    ]);
    res.status(201).send("질문이 성공적으로 등록되었습니다.");
  } catch (err) {
    console.error("Q&A 등록 오류:", err);
    res.status(500).send("DB insert 실패");
  } finally {
    if (connection) await connection.end();
  }
});

// Q&A 질문 삭제
app.delete("/api/qna/:id", async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.execute("DELETE FROM Questions WHERE id = ?", [id]);
    res.status(200).send("질문이 삭제되었습니다.");
  } catch (err) {
    console.error("Q&A 삭제 오류:", err);
    res.status(500).send("DB delete 실패");
  } finally {
    if (connection) await connection.end();
  }
});

// QnA 답변 조회
app.get("/api/answers/:question_id", async (req, res) => {
  const { question_id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const sql = `SELECT a.*, u.nickname FROM Answers a JOIN Users u ON a.user_id = u.id WHERE a.question_id = ?`;
    const [rows] = await connection.execute(sql, [question_id]);
    res.json(rows.length > 0 ? rows[0] : null);
  } catch (err) {
    console.error("답변 조회 오류:", err);
    res.status(500).send("DB select 실패");
  } finally {
    if (connection) await connection.end();
  }
});

//QnA 답변 등록
app.post("/api/answers", async (req, res) => {
  const { question_id, user_id, content } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const insertSql = `INSERT INTO Answers (question_id, user_id, content) VALUES (?, ?, ?)`;
    await connection.execute(insertSql, [question_id, user_id, content]);

    const updateSql = `UPDATE Questions SET status = '답변완료' WHERE id = ?`;
    await connection.execute(updateSql, [question_id]);

    res.status(201).send("답변이 등록되었습니다.");
  } catch (err) {
    console.error("답변 등록 오류:", err);
    res.status(500).send("DB insert 실패");
  } finally {
    if (connection) await connection.end();
  }
});

// --- 4. 서버 실행 ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
