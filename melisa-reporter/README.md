# melisa



## Overview

Melisa is A standalone tool for sending Jest test coverage data from Next.js applications to the Venus coverage dashboard.

## Purpose
This tool automatically collects and sends Jest coverage metrics from your Next.js applications to the centralized Melisa coverage dashboard, enabling organization-wide test coverage monitoring.


## Features

- 📊 Real-time Coverage Dashboard: Monitor statements, branches, functions, and lines coverage
- 📈 Trend Analysis: Track coverage trends over time with interactive charts
- 🔄 Automated Reporting: Integrate with Jest to automatically send coverage data
- 🎯 Multi-project Support: Monitor coverage across multiple projects in your organization
- 📱 Responsive Design: Access your coverage data from any device


## Architecture
```
Melisa/
├── src/
│   ├── __tests__/
│   │   └── math.test.ts          # Example test files
│   ├── services/
│   │   └── coverage-api.ts       # API communication service
│   ├── types/
│   │   └── coverage.ts           # TypeScript definitions
│   └── utils/
│       └── coverage-parser.ts    # Coverage data parser
├── scripts/
│   └── send-coverage.ts          # Main execution script
├── coverage/                     # Generated coverage reports
├── jest.config.mjs              # Jest configuration
├── tsconfig.json                # TypeScript configuration
└── package.json
```

## Getting Started
### Prerequisites

- Node.js 18+

- Jest configured in your Next.js project

- Cooper Backend running on http://localhost:28080


## Quick Start
1. Install in Your Next.js Project
```
git clone https://gitlab.okala.com/okala/qa/melisa.git
cd melisa
npm install
```
2. Set up the backend
- Create a .env file:

```
COVERAGE_API_URL=http://localhost:28080
PROJECT_NAME=your-nextjs-app
BRANCH=main
COMMIT_HASH=git-rev-parse HEAD
DURATION=0
```
3. Run Coverage Reporting

```
npm run test:full
```

## Integration with Next.js Projects
### Method 1: Direct Usage
- Copy this project to your Next.js application directory and run:

```
cd melisa
npm run test:full
```

## Method 2: Package Script Integration
- Add to your Next.js project's package.json:
```
{
  "scripts": {
    "test:coverage": "jest --coverage",
    "send:coverage": "cd jest-coverage-reporter && npm run send-coverage",
    "test:full": "npm run test:coverage && npm run send:coverage"
  }
}
```

## Jest Configuration for Next.js
Ensure your Next.js project has proper Jest configuration. Example jest.config.js:

```
module.exports = {
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
};
```

## Supported Coverage Metrics
- Statements Coverage: Percentage of code statements executed

- Branches Coverage: Percentage of conditional branches executed

- Functions Coverage: Percentage of functions executed

- Lines Coverage: Percentage of code lines executed

- Test Results: Total, passed, and failed test counts

## Usage Examples
```
# Run tests and send coverage
npm run test:full
```

## Individual Commands
```
# Only run tests with coverage
npm run test:coverage

# Only send existing coverage to dashboard
npm run send-coverage
```

## With Custom Parameters
```
PROJECT_NAME=my-nextjs-app BRANCH=melika-feature npm run send-coverage
```

## How It Works
- Runs Jest with coverage enabled in your Next.js project

- Parses the generated coverage-final.json file

- Calculates coverage metrics across all files

- Sends data to Melisa backend API

- Updates the coverage dashboard in real-time

## Debug Mode

- After sending coverage data, access these features in Melisa:

- Project Overview: Coverage metrics across all projects

- Trend Analysis: Historical coverage data with charts

- Quality Gates: Set coverage thresholds and alerts

- Team Metrics: Coverage comparison across teams

## Contributing
- Fork the repository

- Create a feature branch

- Make your changes

- Add tests

- Submit a merge request

## License
This project is proprietary and confidential. Unauthorized copying, transfer, or reproduction is prohibited.

Jest Coverage Reporter - Seamlessly integrate your Next.js test coverage with Venus Analytics App.