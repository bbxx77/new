# Bookstore Web Application

## Description
Bookstore is a web application developed using Node.js and Express. It serves as a platform for exploring books and integrates with external APIs to facilitate searches based on both author and title. The application also includes an admin panel for managing books and user accounts.

## Installation
1. **Clone Repository:**
    ```bash
    git clone https://github.com/johnsukadoe/new.git
    ```

2. **Navigate and Install:**
    ```bash
    cd new
    npm install
    ```

3. **Start Server:**
    ```bash
    npm start
    ```

## Admin Credentials
- **Name:** balzhan
- **Password:** 123

## APIs
1. **Books by Author:**
   - Endpoint: `https://openlibrary.org/search/authors.json`

2. **Books by Title:**
   - Endpoint: `https://openlibrary.org/search.json`

## Usage
- Access the application through the server URL (e.g., `http://localhost:5000`).
- Explore books by title, author, or enjoy a bonus quiz.
- Admin credentials provide access to admin-specific features.

## Endpoints
1. **Search Books by Title:**
    - **URL:** `/api/books_by_title`
    - **Method:** GET
    - **Description:** Renders the page to search and display books by title.

2. **Search Books by Author:**
    - **URL:** `/api/books_by_author`
    - **Method:** GET
    - **Description:** Renders the page to search and display books by author.

3. **Signup Page:**
    - **URL:** `/signup`
    - **Method:** GET
    - **Description:** Renders the signup page.

4. **Login Page:**
    - **URL:** `/login`
    - **Method:** GET
    - **Description:** Renders the login page.

5. **Search Author Page:**
    - **URL:** `/search-author`
    - **Method:** GET
    - **Description:** Renders the page to search authors.

6. **Admin Panel:**
    - **URL:** `/admin-panel`
    - **Method:** GET
    - **Description:** Renders the admin panel page.

7. **User Home Page:**
    - **URL:** `/home`
    - **Method:** GET
    - **Description:** Renders the home page displaying books.

8. **Logout:**
    - **URL:** `/logout`
    - **Method:** GET
    - **Description:** Logs out the user and redirects to the login page.

9. **Search History:**
    - **URL:** `/history`
    - **Method:** GET
    - **Description:** Renders the page displaying user search history.

10. **Secure Page (Authentication Required):**
    - **URL:** `/secure-page`
    - **Method:** GET
    - **Description:** Renders a secure page accessible only to authenticated users.

## Important Notes
- Ensure Node.js and npm are installed.

**Happy Reading!**
