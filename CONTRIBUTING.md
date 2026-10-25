# Contributing to Dubora

Thank you for your interest in contributing to Dubora! We welcome community contributions to expand AI provider integrations, improve audio timing algorithms, and enhance our localization studio.

---

## 1. Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/dubora.git
   cd dubora
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   Copy `.env.example` to `.env.local` and configure your API keys:
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

---

## 2. Testing Guidelines

Run all unit, integration, and media processing tests prior to submitting a pull request:
```bash
# Run unit & integration tests
npm test

# Run production build validation
npm run build
```

---

## 3. Pull Request Guidelines

- Ensure strict TypeScript typing with zero `any` declarations.
- Verify that no API keys or private storage keys are exposed.
- Include unit tests for any new provider adapters or audio timing functions.
- Follow conventional commits format (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
