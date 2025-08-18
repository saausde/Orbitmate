# Orbitmate

## Overview
Orbitmate is a React-based web application designed to provide an interactive experience with AI functionalities. The application features a dashboard, chat interface, and various reusable components to enhance user interaction.

## Project Structure
The project is organized into the following directories and files:

- **public/**: Contains static files such as the favicon and main HTML file.
  - `favicon.ico`: The favicon for the application.
  - `index.html`: The main HTML file that serves as the entry point for the React application.
  - `robots.txt`: Instructions for web crawlers.

- **src/**: Contains the source code for the application.
  - **assets/**: Directory for image assets.
  - **components/**: Contains reusable components.
    - **common/**: Commonly used components like Button, Loading, and Header.
    - **dashboard/**: Dashboard component.
    - **chat/**: Chat interface component.
  - **contexts/**: Context provider for managing AI-related state.
  - **hooks/**: Custom hooks for managing AI responses.
  - **pages/**: Contains different pages of the application.
    - `Home.js`: Landing page component.
    - `Chat.js`: Chat page component.
    - `NotFound.js`: 404 error page component.
  - **services/**: Functions for interacting with AI services.
  - **styles/**: Global styles and theme-related constants.
  - **utils/**: Utility functions for the application.
  - `App.js`: Main application component.
  - `index.js`: Entry point for the React application.
  - `routes.js`: Defines application routes.

- **.eslintrc.js**: ESLint configuration file.
- **.gitignore**: Specifies files to be ignored by Git.
- **package.json**: Contains project metadata and dependencies.
- **README.md**: Documentation for the project.

## Getting Started

### Prerequisites
- Node.js and npm installed on your machine.

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/airiell1/Orbitmate.git
   ```
2. Navigate to the project directory:
   ```
   cd orbitmate
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Running the Application
To start the development server, run:
```
npm start
```
The application will be available at `http://localhost:3000`.

### Running Tests
To run the tests, use:
```
npm test
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.
