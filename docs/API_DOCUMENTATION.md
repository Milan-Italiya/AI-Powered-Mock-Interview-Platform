# Synthex AI - API Documentation

<!-- *Base URL -->

http://localhost:5000/api/v1

---

<!-- *Authentication APIs -->

## Register User

POST /auth/register

## Login User

POST /auth/login

---

<!-- *User APIs -->

## Get Profile

GET /users/profile

Authorization: Bearer <token>

## Update Profile

PUT /users/profile

Authorization: Bearer <token>

---

<!-- *Interview APIs -->

## Create Interview

POST /interviews

Authorization: Bearer <token>

## Get All Interviews

GET /interviews

Authorization: Bearer <token>

## Get Interview By ID

GET /interviews/:interviewId

Authorization: Bearer <token>

## Delete Interview

DELETE /interviews/:interviewId

Authorization: Bearer <token>

---

<!-- *Question APIs -->

## Get Question By ID

GET /questions/:questionId

Authorization: Bearer <token>

## Submit Answer

POST /questions/:questionId/answer

Authorization: Bearer <token>