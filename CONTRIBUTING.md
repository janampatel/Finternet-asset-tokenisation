# Contributing to Finternet

Thank you for your interest in contributing to **Finternet**! We welcome contributions from everyone. By participating in this project, you agree to abide by our Code of Conduct.

## 🤝 How to Contribute

### 1. Reporting Bugs
- Ensure the bug was not already reported by searching on GitHub under [Issues](issues).
- If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a **title and clear description**, as many relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### 2. Suggesting Enhancements
- Open a new issue with a clear title and detailed description of the suggested enhancement.
- Explain why this enhancement would be useful to most users.

### 3. Pull Requests
- Fork the repo and create your branch from `main`.
- If you've added code that should be tested, add tests.
- Ensure the test suite passes.
- Make sure your code lints.
- Issue that pull request!

## 💻 Development Workflow

1.  **Clone your fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/Finternet.git
    ```
2.  **Create a branch**:
    ```bash
    git checkout -b feature/my-new-feature
    ```
3.  **Make changes and commit**:
    ```bash
    git commit -m 'feat: add some feature'
    ```
    *Note: We follow [Conventional Commits](https://www.conventionalcommits.org/)*.
4.  **Push and Open PR**:
    ```bash
    git push origin feature/my-new-feature
    ```

## 🧪 Testing

- **Smart Contracts**: `cd contracts && npx hardhat test`
- **Frontend**: `cd frontend && npm run build` (to check compilation)
- **Backend**: `cd backend && npm test` (if applicable)

## 📜 Style Guidelines

- **Solidity**: Follow standard Solidity Style Guide.
- **JavaScript/React**: Use ESLint and Prettier configurations provided in the repo.
