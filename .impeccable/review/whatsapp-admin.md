# WhatsApp settings — UI evidence

Request: configure Meta per restaurant from admin without recurring deploy; easy to find, organized within existing settings. Mode Operate; incumbent FlyFoods palette/components, no redesign. Six accordions retained, WhatsApp group inside Pedidos e alertas, shared Save changes.

Captures: desktop.png (1440x1000), mobile.png (390x844). Actual Next local render with isolated fake backend and synthetic credentials; configured state, password blank. No horizontal overflow. First capture/new-account state also inspected, overwritten by final confirmation.

Interaction checks: empty first ID/token blocks save; initial setup sends token then clears field; template-only update sends empty token; replacement token clears again. Schema/render tests enforce first-token validation and no saved token rendering. These are fixture UI tests; persistence/security tested separately with Go and isolated Mongo.

Impeccable launcher/context and detector could not run: engine/cache unavailable outside allowed filesystem. Existing code and craft floor used directly. Finish reviewer initial disposition fix: placeholder contrast. Scoped input placeholder now uses existing muted token rgb(100,112,125), opacity1; 5.05:1 over white. Reviewer final disposition ship covers this listed fix; other layout retained. Documenter: no changes, extension matches incumbent styles, no design files created.

31 web tests, TypeScript and eslint on changed files passed. Local Google Fonts download timed out: captures use the existing sans-serif fallback; production font rendering was not verified. Console fixture limitations: missing favicon and SSE stream closures; not Meta/send failures. No real token, number, WhatsApp message or deployment used.
