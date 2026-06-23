# State

## Decisions

- Use npm.
- Use Tailwind CSS.
- Use React Hook Form for forms.
- Store admin JWT in HttpOnly cookie.
- Resolve tenant by subdomain; fallback local is `demo`.
- Theme colors come from backend `RestaurantConfig.theme`.
- Client browser calls Next Route Handlers, not backend directly.

## Blockers

- Backend must be running locally for runtime integration.
- Backend CORS is avoided by using Next Route Handlers as BFF.

## Preferences

- Keep communication terse using Caveman style.
