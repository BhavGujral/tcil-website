# TCIL Website Revamp

A full-stack web application revamp for Telecommunications Consultants India Limited (TCIL). This project includes a dynamic public-facing portal and a comprehensive Content Management System (CMS) for administrators.

## Tech Stack

*   **Frontend:** Next.js, React, Tailwind CSS
*   **Backend:** Node.js, Express
*   **Database:** PostgreSQL
*   **Object Storage:** MinIO
*   **Caching:** Redis
*   **Containerization:** Docker, Docker Compose

## Features

*   **Public Portal:** Displays the latest news, active tenders, career opportunities, annual reports, and comprehensive service pages.
*   **User Engagement:** Dedicated portals for submitting grievances and direct contact messages.
*   **Admin CMS:** Secure dashboard to manage all website content, handle user roles, and resolve submitted grievances/messages.
*   **File Management:** Integrated MinIO object storage for robust and scalable media, PDF, and document handling.
*   **Database Management:** Automated scripts for database initialization and seeding dummy content.

## Prerequisites

Ensure you have the following installed on your system:
*   [Docker](https://www.docker.com/products/docker-desktop)
*   [Git](https://git-scm.com/)

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/BhavGujral/tcil-website.git](https://github.com/BhavGujral/tcil-website.git)
    cd tcil-website
    ```

2.  **Build and start the application containers:**
    ```bash
    docker-compose up -d --build
    ```

3.  **Seed the database with initial content:**
    ```bash
    docker exec -it tcil_backend node src/seed_video.js
    ```
    *(Note: If the frontend caches old data, you may need to run `docker-compose restart frontend`)*

## Accessing the Application

*   **Public Website:** `http://localhost:3000`
*   **Admin Dashboard:** `http://localhost:3000/admin/login`
*   **MinIO Console:** *(Add your MinIO port here, typically `http://localhost:9001`)*

**Default Admin Credentials:**
*   **Email:** `admin@tcil.net.in`
*   **Password:** `password`

## Author

*   **Bhav Gujral**
