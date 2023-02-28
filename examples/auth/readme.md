# Example CEDDD Auth

## Sign Up

```bash
curl --location 'http://localhost:4000/api/cmd' \
--header 'Content-Type: application/json' \
--data-raw '{
    "topic": "cmd.auth.signUp",
    "data": {
        "firstName": "Juan Ignacio",
        "lastName": "Coronel",
        "email": "phjocoronel@gmail.com",
        "username": "hoffme",
        "password": "1234"
    }
}'
```

## Sign In

```bash
curl --location 'http://localhost:4000/api/cmd' \
--header 'Content-Type: application/json' \
--data '{
    "topic": "cmd.auth.signIn",
    "data": {
        "username": "hoffme",
        "password": "1234"
    }
}'
```

## Access

```bash
curl --location 'http://localhost:4000/api/cmd' \
--header 'Content-Type: application/json' \
--data '{
    "topic": "cmd.auth.access",
    "data": {
        "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoic2Vzc2lvbiIsImV4cGlyZWRBdCI6IjIwMjMtMDMtMjhUMjA6NDU6MDQuNzA1WiIsInNlc2lvbklkIjoiZjQ5YmExZGQtNmU1Yi00YjIyLWIyYTAtMTg3YjlmZTkzMTgwIiwiaWF0IjoxNjc3NjE3MTA0fQ.nZ-kkdi6KK4ePb_Z_kzVmpu8AvBUFzcY3YELbqtqAcY"
    }
}'
```

## Access Check

```bash
curl --location 'http://localhost:4000/api/cmd' \
--header 'Content-Type: application/json' \
--data '{
    "topic": "cmd.auth.access.check",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiYWNjZXNzIiwiZXhwaXJlZEF0IjoiMjAyMy0wMi0yOFQyMDo1NTozMS4wMDlaIiwic2Vzc2lvbklkIjoiZjQ5YmExZGQtNmU1Yi00YjIyLWIyYTAtMTg3YjlmZTkzMTgwIiwidXNlcklkIjoiYmU5ZjgwYTAtMWVhOC00NWQ3LTlhN2UtOTRlNTViNWE3ZWQ2IiwiaWF0IjoxNjc3NjE3MTMxfQ.p9_kn76rfgbPHiU5RbyqTPXjflSf7P8Ai98LYnXpIE8"
    }
}'
```

## Sign Out

```bash
curl --location 'http://localhost:4000/api/cmd' \
--header 'Content-Type: application/json' \
--data '{
    "topic": "cmd.auth.signOut",
    "data": {
       "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoic2Vzc2lvbiIsImV4cGlyZWRBdCI6IjIwMjMtMDMtMjhUMjA6NDU6MDQuNzA1WiIsInNlc2lvbklkIjoiZjQ5YmExZGQtNmU1Yi00YjIyLWIyYTAtMTg3YjlmZTkzMTgwIiwiaWF0IjoxNjc3NjE3MTA0fQ.nZ-kkdi6KK4ePb_Z_kzVmpu8AvBUFzcY3YELbqtqAcY"
    }
}'
```