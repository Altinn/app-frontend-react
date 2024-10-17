# Introduce component library

- Status: Proposed
- Deciders: Team
- Date: 17.10.2024

## Result

A1: Component library is introduced, firstly as just a folder in our current setup, adding yarn workspaces or similar requires more research and testing

## Problem context

Today our UI components are tightly coupled to the app in which they are rendered.

This leads to several issues:

- Makes it hard to do component testing outside a fully rendered app.
- Makes refactoring the app framework a lot harder.
- Leads to unclear interfaces between UI components and the app framework.
- Makes developing UI components complex without deep understanding of the application.

## Decision drivers

A list of decision drivers. These are points which can differ in importance. If a point is "nice to have" rather than
"need to have", then prefix the description.

- B1: UI components should only receive data to display, notify the app when data is changed, and notify validity of user input.
- B2: UI components should live in a separate folder from the app itself, and have no dependencies to the app.
- B3: UI components should live in a lib separately to the src folder to have stricter control of dependencies.

## Alternatives considered

List the alternatives that were considered as a solution to the problem context.

- A1: Simply put a new folder inside the src folder.
- A2: Use yarn workspaces to manage the library separately from the src folder.
- A3: Set up NX.js to manage our app and libraries.

## Pros and cons

List the pros and cons with the alternatives. This should be in regards to the decision drivers.

### A1

- Good because B1 and B2 is covered
- Allows us to really quickly get started with a component library
- Bad, because it does not fulfill B3. If we simply use a new folder, it will be up to developers to enforce the rules of the UI components, like the avoiding dependencies to the app.

### A2

- Good, because this alternative adheres to B1, B2 and B3.
- This way our libs would live separately to the app, and it would be obvious that it is a lib.
- The con is that it takes more setup.

### A3

- Good, because this alternative adheres to B1, B2 and B3.
- This way our libs would live separately to the app, and it would be obvious that it is a lib.
- Also gives us powerful monorepo tooling.
- Bad because it takes a lot more time to set up, and might be overkill before we have decided to integrate frontend and backend into monorepo.
