# State

## Decisions

- Use npm.
- Use Tailwind CSS.
- Use React Hook Form for forms.
- Store admin JWT in HttpOnly cookie.
- Resolve tenant by subdomain; fallback local is `demo`.
- Theme colors come from backend `RestaurantConfig.theme`.
- Client browser calls Next Route Handlers, not backend directly.
- Frontend organization follows the Cosmos layer-based convention: routes in `src/app`, screens in `src/views`, reusable UI in `src/components`, API code in `src/services`, layouts in `src/layouts`, and support code in `src/utils`, `src/constants`, and `src/types`.

## Blockers

- Backend must be running locally for runtime integration.
- Backend CORS is avoided by using Next Route Handlers as BFF.

## Preferences

- Keep communication terse using Caveman style.
