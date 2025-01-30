# Advanced Code Generator

A flexible and powerful code generator for React, Vue, and Express applications. Generate components, services, controllers, and more with support for TypeScript, testing, and best practices.

## Installation

```bash
npm install -g advanced-code-generator
# or
yarn global add advanced-code-generator
```

## Features

- 🚀 Multiple framework support (React, Vue, Express)
- 📝 TypeScript support
- 🧪 Automatic test file generation
- 📚 Storybook story generation for components
- 🔄 CRUD operations for backend code
- 📦 Consistent file structure
- 🎨 Customizable templates

## Usage

### Basic Commands

```bash
generate component --name UserProfile --framework react --typescript
generate controller --name User --path src/controllers
generate service --name Authentication --typescript
```

### Available Generators

#### Frontend
- Components
```bash
generate component --name Button
  --framework react|vue
  --typescript      # Optional: Use TypeScript
  --path src/components
```

- Hooks (React)
```bash
generate hook --name useFetch
  --typescript      # Optional: Use TypeScript
  --path src/hooks
```

#### Backend
- Controllers
```bash
generate controller --name User
  --typescript      # Optional: Use TypeScript
  --path src/controllers
```

- Services
```bash
generate service --name Authentication
  --typescript      # Optional: Use TypeScript
  --path src/services
```

- Models
```bash
generate model --name Product
  --typescript      # Optional: Use TypeScript
  --path src/models
```

- Routes
```bash
generate route --name User
  --typescript      # Optional: Use TypeScript
  --path src/routes
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name` | Name of the item to generate | Required |
| `--framework` | Framework to use (react/vue) | `react` |
| `--path` | Generation path | Current directory |
| `--typescript` | Use TypeScript | `false` |

### Interactive Prompts

The generator will ask additional questions based on the type of code being generated:

- Field definitions for models and controllers
- Test file generation
- Storybook story generation for components

## Generated Structure

### React Component
```typescript
// UserProfile.tsx
import React from 'react';

interface UserProfileProps {
  name: string;
  email: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
}) => {
  return (
    <div className="user-profile">
      <h2>{name}</h2>
      <div className="user-profile__email">{email}</div>
    </div>
  );
};
```

### Express Controller
```typescript
// UserController.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  async getAll(req: Request, res: Response) {
    try {
      const users = await this.service.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  // ... other CRUD methods
}
```

## Custom Templates

You can customize the generated code by modifying the templates in the `templates` directory:

```
templates/
├── react/
│   ├── component.ts.ejs
│   └── hook.ts.ejs
├── vue/
│   └── component.vue.ejs
├── express/
│   ├── controller.ts.ejs
│   └── route.ts.ejs
└── common/
    ├── service.ts.ejs
    └── model.ts.ejs
```

## Best Practices

1. Always generate code in the appropriate directory structure
2. Use TypeScript for better type safety and developer experience
3. Generate test files along with your code
4. Follow naming conventions for your project
5. Review and adjust generated code as needed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Support

If you have any questions or need help, please:
1. Check the documentation
2. Open an issue
3. Contact the maintainers

## Roadmap

- [ ] Add GraphQL resolver generation
- [ ] Support for Next.js and Nuxt.js
- [ ] Database migration generation
- [ ] API documentation generation
- [ ] Custom plugin system
- [ ] Interactive UI for code generation