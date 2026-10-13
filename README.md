# Laundry Website HTTP Server

## Project Overview

Laundry Care is a small laundry service website made with HTML, CSS, and Node.js. It has Home, About, and Contact pages. The contact form checks the submitted details and shows a confirmation page. This assignment project does not save messages permanently.

## Project Objectives

- Build a website with several pages and working navigation.
- Learn how a Node.js HTTP server receives and answers requests.
- Serve HTML and CSS files using Node.js's built-in file system module.
- Process and validate a contact form sent with the POST method.
- Return useful HTTP status codes for successful and unsuccessful requests.

## Folder Structure

```text
laundry-server/
|-- server.js
|-- README.md
|-- pages/
|   |-- home.html
|   |-- about.html
|   |-- contact.html
|   |-- 404.html
|   `-- success.html
`-- public/
    `-- style.css
```

## Prerequisites

- A computer with Node.js installed. Download the current LTS version from [nodejs.org](https://nodejs.org/).
- Visual Studio Code (VS Code).
- A web browser.

Check that Node.js is available by opening a terminal and running:

```text
node --version
```

## Open the Project in VS Code

1. Open VS Code.
2. Choose **File > Open Folder**.
3. Select the `laundry-server` project folder.
4. Open the integrated terminal using **Terminal > New Terminal**.

## Start the Server

In the VS Code terminal, run this command from the project folder:

```text
node server.js
```

The server listens on port `8088` on this computer only (`127.0.0.1`). When it starts, the terminal prints its local address. Keep the terminal open while using the website. To stop the server, press `Ctrl+C` in the terminal.

## Local URLs

- Home: [http://localhost:8088/home](http://localhost:8088/home)
- About: [http://localhost:8088/about](http://localhost:8088/about)
- Contact: [http://localhost:8088/contact](http://localhost:8088/contact)
- CSS stylesheet: [http://localhost:8088/style.css](http://localhost:8088/style.css)

Opening [http://localhost:8088/](http://localhost:8088/) redirects to the Home page. A query string, such as `/home?source=menu`, does not stop a page from loading.

## Contact Form: POST `/submit`

The Contact page sends the name, email address, and message to `/submit` using the HTTP POST method. The server reads the form data, checks that all three fields are filled in and that the email address looks valid, and then shows a confirmation page. The name shown on that page is escaped so text entered by a visitor is displayed safely. Requests larger than 10 KB are rejected. Messages are not saved to a database or stored permanently.

## HTTP Status Codes

- `200 OK`: A page or a valid form submission was handled successfully.
- `302 Found`: The root address `/` redirects to `/home`.
- `400 Bad Request`: A form submission is missing required information or contains an invalid email address.
- `404 Not Found`: The requested page or route does not exist.
- `405 Method Not Allowed`: The request uses an unsupported method for the server.
- `413 Content Too Large`: The form request is larger than the allowed 10 KB limit.
- `500 Internal Server Error`: The server could not read a required file.

## Test the Website

1. Start the server with `node server.js`.
2. Open the Home URL in a browser and follow the navigation links to About and Contact.
3. Open the stylesheet URL to confirm the CSS file is available.
4. On the Contact page, submit a name, valid email address, and message. Confirm that the success page appears.
5. Try submitting a blank or invalid form to see the validation message.
6. Open a made-up path such as `http://localhost:8088/missing` to see the custom 404 page.

## How the Server Works

The server uses only Node.js built-in modules: `http` to create the web server, `fs` to read files asynchronously, and `path` to build file paths. It does not use Express or any other npm package, so no `npm install` step is needed.
