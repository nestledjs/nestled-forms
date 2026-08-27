# NestledJS

NestledJS is a powerful monorepo built on [Nx](https://nx.dev) that provides a collection of libraries and tools to accelerate full-stack application development. It simplifies setting up new projects by providing code generators, reusable form components, and helper utilities.

## Core Libraries

The NestledJS monorepo includes three primary libraries:

- **`@nestledjs/generators`**: A set of Nx generators to scaffold a complete full-stack application, including API, web frontend, and shared libraries. **(Under Development)**
- **`@nestledjs/forms`**: A robust library for building, validating, and managing forms in your applications. **(Ready for Use)**
- **`@nestledjs/helpers`**: A collection of helper functions and utilities to support development across the monorepo.

## Local Development with YALC

To test the NestledJS libraries in your local projects, you can use [YALC](https://github.com/wclr/yalc). YALC acts as a local package repository, allowing you to "publish" your packages locally and link them to other projects.

1.  **Publish a package locally:**

    ```sh
    yalc publish
    ```

2.  **In your consumer project, link the package:**

    ```sh
    yalc add @nestledjs/forms
    pnpm install
    ```

## Generators

The `@nestledjs/generators` library is designed to quickly scaffold a full-stack application. While it is still under development, it provides a solid foundation for new projects.

### Starting a new project

New projects clone `nestled-template` rather than being scaffolded command by
command, then run the setup generator once against the fresh clone:

```sh
nx g @nestledjs/generators:workspace-setup --name my-project
```

That renames the project throughout, ensures `.env` and Docker, applies the
Prisma migrations, generates models and seeds.

### Code generation

The remaining generators run against the Prisma schema as the app grows:

```sh
nx g @nestledjs/generators:models           # GraphQL ObjectTypes and enums from the Prisma schema
nx g @nestledjs/generators:crud             # CRUD libraries for Prisma models
nx g @nestledjs/generators:sdk              # the GraphQL SDK
nx g @nestledjs/generators:custom           # create or maintain the custom API library shell
nx g @nestledjs/generators:model-extension  # an additive model-specific API resolver module
```

## Forms

The `@nestledjs/forms` library is stable and ready for production use. It provides a comprehensive solution for form creation and management.

For detailed documentation on how to use the forms library, please see its dedicated [README.md](./forms/README.md).
