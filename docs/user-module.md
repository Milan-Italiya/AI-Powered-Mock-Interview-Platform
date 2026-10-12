# User Model

## Overview

The User model stores account information, authentication details, profile data, and interview-related statistics.

---

# Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| fullName | String | Yes | User's full name |
| email | String | Yes | Unique email address |
| password | String | Yes | Hashed password |
| profilePicture | String | No | User profile image |
| role | String | Yes | User or Admin |
| isVerified | Boolean | Yes | Email verification status |
| selectedRole | String | No | Preferred interview role |
| experienceLevel | String | No | User experience level |
| skills | Array | No | Technical skills |
| interviewCount | Number | No | Total interviews completed |
| averageScore | Number | No | Overall interview score |
| weakTopics | Array | No | Weak technical concepts |

---

# Relationships

A user can have:

- Multiple Interviews
- Multiple Practice Sessions
- Multiple Weakness Reports
- Multiple Learning Recommendations

---

# Default Values

- role → user
- isVerified → false
- interviewCount → 0
- averageScore → 0
- skills → []
- weakTopics → []

---

# Indexes

- email (Unique)

---

# Timestamps

- createdAt
- updatedAt