# Lab 1: Node.js and Express server

**Name:** Tilak Raj Patro  
**Registration Number:** 252U1R3096  
**Section:** CSE DS-2B

## How to Run

### Prerequisites
- Node.js installed
- NPM installed

### Installation

Clone the repository:

```bash
git clone https://github.com/rajtilak123/Backend-Development-Fundamentals-Labs.git
```

Navigate to the Lab 1 folder:

```bash
cd Backend-Development-Fundamentals-Labs/lab-01
```

Install the dependencies:

```bash
npm install
```

### Environment Variables

No environment variables are required for this lab.

### Start the Server

To run the basic Node.js HTTP server:

```bash
node server.js
```

To run the Express server, first stop the previous server using `Ctrl + C`, then execute:

```bash
node app.js
```

Open `http://localhost:3000` in your browser.

## Endpoints

## Endpoints

| Method | Path | Description | Status Code |
|---|---|---|---|
| GET | `/` | Displays the welcome message | 200 OK |
| GET | `/about` | Returns name and section in JSON format | 200 OK |
| GET | `/time` | Displays the current date and time | 200 OK |
| GET | Any unknown path | Returns a 404 Page Not Found message | 404 Not Found |

## Screenshots

### Home Route
![Home Route](screenshots/home.png)

### About Route
![About Route](screenshots/about.png)

### Time Route
![Time Route](screenshots/time.png)

### 404 Error
![404 Error](screenshots/not-found.png)

## Notes: Problems Faced and How They Were Solved

Initially, the server was not accessible through the browser because the JavaScript file had not been saved. After saving the file and restarting the server, the issue was resolved.

I also learned how to create a basic HTTP server using Node.js and implement routes using Express.js.