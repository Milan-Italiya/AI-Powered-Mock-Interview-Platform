# Database Design

## Overview

Synthex AI uses **MongoDB** as its primary database. The database is designed to store user information, interview sessions, AI evaluations, weakness analysis, learning recommendations, and practice history.

---

# Database Collections

## 1. Users Collection

Stores user account information.

| Field | Type | Description |
|--------|------|-------------|
| _id | ObjectId | Unique user ID |
| fullName | String | User's full name |
| email | String | User email address |
| password | String | Hashed password |
| profileImage | String | Profile image URL |
| role | String | User role |
| createdAt | Date | Account creation date |
| updatedAt | Date | Last updated date |

---

## 2. Interviews Collection

Stores interview session details.

| Field | Type | Description |
|--------|------|-------------|
| _id | ObjectId | Interview ID |
| userId | ObjectId | Reference to User |
| role | String | Interview role |
| difficulty | String | Easy / Medium / Hard |
| technologies | Array | Selected technologies |
| interviewDate | Date | Interview date |
| totalQuestions | Number | Total questions |
| totalScore | Number | Overall score |
| duration | Number | Interview duration (minutes) |

---

## 3. Questions Collection

Stores AI-generated interview questions.

| Field | Type | Description |
|--------|------|-------------|
| _id | ObjectId | Question ID |
| interviewId | ObjectId | Interview reference |
| question | String | AI-generated question |
| topic | String | Related topic |
| difficulty | String | Difficulty level |

---

## 4. Responses Collection

Stores user answers.

| Field | Type | Description |
|--------|------|-------------|
| _id | ObjectId | Response ID |
| questionId | ObjectId | Question reference |
| interviewId | ObjectId | Interview reference |
| answer | String | User answer |
| score | Number | AI score |
| feedback | String | AI feedback |

---

## 5. Weakness Reports Collection

Stores weakness analysis.

| Field | Type | Description |
|--------|------|-------------|
| _id | ObjectId | Report ID |
| userId | ObjectId | User reference |
| interviewId | ObjectId | Interview reference |
| weakTopics | Array | Weak concepts |
| strengths | Array | Strong concepts |
| generatedAt | Date | Report generation date |

---

## 6. Learning Recommendations Collection

Stores AI learning recommendations.

| Field | Type | Description |
|--------|------|-------------|
| _id | ObjectId | Recommendation ID |
| userId | ObjectId | User reference |
| topic | String | Weak topic |
| recommendation | String | Suggested learning |
| resourceType | String | Documentation / Video / Article |
| resourceLink | String | Learning resource URL |

---

## 7. Practice Sessions Collection

Stores targeted practice sessions.

| Field | Type | Description |
|--------|------|-------------|
| _id | ObjectId | Practice session ID |
| userId | ObjectId | User reference |
| topic | String | Practice topic |
| score | Number | Practice score |
| completedAt | Date | Completion date |

---

# Entity Relationships

```text
User
 │
 ├── Interviews
 │      │
 │      ├── Questions
 │      ├── Responses
 │      └── Weakness Report
 │
 ├── Learning Recommendations
 │
 └── Practice Sessions
```

---

# Database Summary

| Collection | Purpose |
|------------|---------|
| Users | Store user accounts |
| Interviews | Store interview sessions |
| Questions | Store AI-generated questions |
| Responses | Store user answers and AI evaluation |
| Weakness Reports | Store detected weaknesses |
| Learning Recommendations | Store AI learning suggestions |
| Practice Sessions | Store targeted practice history |

---

# Benefits of This Design

- Modular and scalable.
- Easy to maintain.
- Supports future features.
- Optimized for MongoDB.
- Clear relationships between collections.

---

# Future Enhancements

- Resume Collection
- Coding Challenges Collection
- Certificates Collection
- Notifications Collection
- Company Interview Collection
- AI Chat History Collection