const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const chalk = require('chalk');
const Case = require('case');
const pluralize = require('pluralize');

const TEMPLATES = {
  component: {
    react: {
      js: 'react/component.js.ejs',
      ts: 'react/component.ts.ejs',
    },
    vue: {
      js: 'vue/component.vue.ejs',
      ts: 'vue/component.ts.vue.ejs',
    }
  },
  hook: {
    react: {
      js: 'react/hook.js.ejs',
      ts: 'react/hook.ts.ejs',
    }
  },
  service: {
    js: 'common/service.js.ejs',
    ts: 'common/service.ts.ejs',
  },
  model: {
    js: 'common/model.js.ejs',
    ts: 'common/model.ts.ejs',
  },
  controller: {
    js: 'express/controller.js.ejs',
    ts: 'express/controller.ts.ejs',
  },
  route: {
    js: 'express/route.js.ejs',
    ts: 'express/route.ts.ejs',
  }
};

function getTemplate(type, config) {
    const { framework, typescript } = config;
    const extension = typescript ? 'ts' : 'js';

    // Framework-specific templates (React, Vue)
    if (TEMPLATES[type]?.[framework]) {
      return TEMPLATES[type][framework][extension];
    }

    // Common templates (services, models)
    if (TEMPLATES[type]?.[extension]) {
      return TEMPLATES[type][extension];
    }

    // Helper function to determine template path
    const getTemplatePath = () => {
      switch (type) {
        case 'component':
          return `${framework}/component.${extension}.ejs`;
        case 'hook':
          return framework === 'react' ? `react/hook.${extension}.ejs` : null;
        case 'controller':
          return `express/controller.${extension}.ejs`;
        case 'route':
          return `express/route.${extension}.ejs`;
        case 'service':
          return `common/service.${extension}.ejs`;
        case 'model':
          return `common/model.${extension}.ejs`;
        default:
          return null;
      }
    };

    const templatePath = getTemplatePath();

    // Validate template existence
    if (!templatePath || !templates[templatePath]) {
      console.error(chalk.red(`No template found for type: ${type} with framework: ${framework}`));
      return null;
    }

    return templatePath;
  }

async function generateCode(type, options) {
  const config = await getGeneratorConfig(type, options);
  const template = getTemplate(type, config);

  if (!template) {
    console.error(chalk.red(`No template found for type: ${type}`));
    return;
  }

  const content = await generateContent(template, config);
  await writeFile(content, config);

  console.log(chalk.green(`✨ Generated ${type}: ${config.name}`));
}

async function getGeneratorConfig(type, options) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'fields',
      message: 'Enter fields (comma-separated)',
      when: ['model', 'controller'].includes(type)
    },
    {
      type: 'confirm',
      name: 'withTest',
      message: 'Generate test file?',
      default: true
    },
    {
      type: 'confirm',
      name: 'withStory',
      message: 'Generate Storybook story?',
      default: true,
      when: type === 'component'
    }
  ]);

  return {
    ...options,
    ...answers,
    pascalName: Case.pascal(options.name),
    camelName: Case.camel(options.name),
    kebabName: Case.kebab(options.name),
    pluralName: pluralize(options.name),
    fields: answers.fields ? parseFields(answers.fields) : []
  };
}

function parseFields(fieldsString) {
  return fieldsString.split(',').map(field => {
    const [name, type = 'string'] = field.trim().split(':');
    return { name: name.trim(), type: type.trim() };
  });
}

// Template definitions
const templates = {
  // React Component Template
  'react/component.ts.ejs': `
import React from 'react';

interface <%= pascalName %>Props {
<% fields.forEach(function(field) { %>
  <%= field.name %>: <%= field.type %>;
<% }); %>
}

export const <%= pascalName %>: React.FC<<%= pascalName %>Props> = ({
<% fields.forEach(function(field) { %>
  <%= field.name %>,
<% }); %>
}) => {
  return (
    <div className="<%= kebabName %>">
      <h2><%= pascalName %></h2>
      <% fields.forEach(function(field) { %>
      <div className="<%= kebabName %>__<%= field.name %>">
        {<%= field.name %>}
      </div>
      <% }); %>
    </div>
  );
};
`,

  // React Hook Template
  'react/hook.ts.ejs': `
import { useState, useEffect } from 'react';

interface <%= pascalName %>Options {
<% fields.forEach(function(field) { %>
  <%= field.name %>: <%= field.type %>;
<% }); %>
}

export const use<%= pascalName %> = (options: <%= pascalName %>Options) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch<%= pascalName %> = async () => {
      try {
        // Implement your fetch logic here
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetch<%= pascalName %>();
  }, [options]);

  return { data, loading, error };
};
`,

  // Express Controller Template
  'express/controller.ts.ejs': `
import { Request, Response } from 'express';
import { <%= pascalName %>Service } from '../services/<%= camelName %>.service';

export class <%= pascalName %>Controller {
  private service: <%= pascalName %>Service;

  constructor() {
    this.service = new <%= pascalName %>Service();
  }

  async getAll(req: Request, res: Response) {
    try {
      const items = await this.service.findAll();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await this.service.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: 'Bad request' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const item = await this.service.update(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: 'Bad request' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
`,

  // Model Template
  'common/model.ts.ejs': `
export interface <%= pascalName %> {
<% fields.forEach(function(field) { %>
  <%= field.name %>: <%= field.type %>;
<% }); %>
  createdAt: Date;
  updatedAt: Date;
}

export class <%= pascalName %>Model {
<% fields.forEach(function(field) { %>
  <%= field.name %>: <%= field.type %>;
<% }); %>
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<<%= pascalName %>>) {
    <% fields.forEach(function(field) { %>
    this.<%= field.name %> = data.<%= field.name %>!;
    <% }); %>
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON(): <%= pascalName %> {
    return {
      <% fields.forEach(function(field) { %>
      <%= field.name %>: this.<%= field.name %>,
      <% }); %>
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
`,

  // Service Template
  'common/service.ts.ejs': `
import { <%= pascalName %>, <%= pascalName %>Model } from '../models/<%= camelName %>.model';

export class <%= pascalName %>Service {
  async findAll(): Promise<<%= pascalName %>[]> {
    // Implement your database query here
    return [];
  }

  async findById(id: string): Promise<<%= pascalName %> | null> {
    // Implement your database query here
    return null;
  }

  async create(data: Partial<<%= pascalName %>>): Promise<<%= pascalName %>> {
    const model = new <%= pascalName %>Model(data);
    // Implement your database creation here
    return model.toJSON();
  }

  async update(id: string, data: Partial<<%= pascalName %>>): Promise<<%= pascalName %>> {
    // Implement your database update here
    return new <%= pascalName %>Model(data).toJSON();
  }

  async delete(id: string): Promise<void> {
    // Implement your database deletion here
  }
}
`,

  // Route Template
  'express/route.ts.ejs': `
import { Router } from 'express';
import { <%= pascalName %>Controller } from '../controllers/<%= camelName %>.controller';

const router = Router();
const controller = new <%= pascalName %>Controller();

router.get('/<%= pluralName %>', controller.getAll.bind(controller));
router.get('/<%= pluralName %>/:id', controller.getById.bind(controller));
router.post('/<%= pluralName %>', controller.create.bind(controller));
router.put('/<%= pluralName %>/:id', controller.update.bind(controller));
router.delete('/<%= pluralName %>/:id', controller.delete.bind(controller));

export default router;
`
};

async function generateContent(templatePath, config) {
  const templateContent = templates[templatePath];
  return ejs.render(templateContent, config);
}

async function writeFile(content, config) {
  const { type, name, path: basePath } = config;
  const extension = config.typescript ? '.ts' : '.js';
  const filename = `${Case.kebab(name)}${extension}`;
  const filepath = path.join(basePath, type, filename);

  await fs.ensureDir(path.dirname(filepath));
  await fs.writeFile(filepath, content);

  if (config.withTest) {
    await generateTestFile(config);
  }

  if (config.withStory) {
    await generateStoryFile(config);
  }
}

module.exports = {
  generateCode
};