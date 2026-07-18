import React from "react";

type PrimitiveStyleValue = string | number;
type StyleValue = PrimitiveStyleValue | StyleDefinition | undefined;
type VariantDefinition = Record<string, StyleDefinition>;
type VariantGroups = Record<string, VariantDefinition>;

export type StyleDefinition = {
  [property: string]: StyleValue;
  variants?: VariantGroups;
};

type StyledProps<TElement extends React.ElementType> =
  React.ComponentPropsWithoutRef<TElement> & {
    as?: React.ElementType;
    css?: StyleDefinition;
    className?: string;
    children?: React.ReactNode;
    [property: string]: unknown;
  };

const mediaAliases: Record<string, string> = {
  bp1: "(max-width: 480px)",
  bp2: "(max-width: 640px)",
  bp3: "(max-width: 768px)",
  bp4: "(max-width: 1024px)",
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "motion-reduce": "(prefers-reduced-motion: reduce)",
};

const tokenAliases: Record<string, string> = {
  BACKGROUND: "var(--color-background)",
  FOREGROUND: "var(--color-foreground)",
  SURFACE: "var(--color-surface)",
  SURFACE_MUTED: "var(--color-surface-muted)",
  BORDER: "var(--color-border)",
  MUTED: "var(--color-muted)",
  PRIMARY: "var(--color-primary)",
  SECONDARY: "var(--color-secondary)",
  GREY_950: "#111827",
  GREY_300: "#d1d5db",
};

const unitlessProperties = new Set([
  "animationIterationCount",
  "flex",
  "flexGrow",
  "flexShrink",
  "fontWeight",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
]);

function isStyleObject(value: StyleValue): value is StyleDefinition {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toKebabCase(property: string) {
  if (property.startsWith("--")) {
    return property;
  }

  return property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function resolveValue(property: string, value: PrimitiveStyleValue) {
  if (typeof value === "number" && value !== 0 && !unitlessProperties.has(property)) {
    return `${value}px`;
  }

  return String(value).replace(/\$([A-Z0-9_]+)/g, (_, token: string) => {
    return tokenAliases[token] ?? `$${token}`;
  });
}

function stableStringify(value: unknown): string {
  if (!value || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
    .join(",")}}`;
}

function hash(input: string) {
  let value = 5381;

  for (let index = 0; index < input.length; index += 1) {
    value = (value * 33) ^ input.charCodeAt(index);
  }

  return (value >>> 0).toString(36);
}

function splitStyle(style: StyleDefinition) {
  const { variants, ...baseStyle } = style;

  return { baseStyle, variants };
}

function nestedSelector(selector: string, key: string) {
  if (key.includes("&")) {
    return key.replace(/&/g, selector);
  }

  if (key.startsWith(":") || key.startsWith("[") || key.startsWith(".")) {
    return `${selector}${key}`;
  }

  return `${selector} ${key}`;
}

function buildRules(selector: string, style: StyleDefinition): string {
  const declarations: string[] = [];
  let nestedRules = "";

  Object.entries(style).forEach(([property, value]) => {
    if (property === "variants" || value === undefined) {
      return;
    }

    if (property.startsWith("@") && isStyleObject(value)) {
      const alias = property.slice(1);
      const media = mediaAliases[alias] ?? alias;
      nestedRules += `@media ${media}{${buildRules(selector, value)}}`;
      return;
    }

    if (isStyleObject(value)) {
      nestedRules += buildRules(nestedSelector(selector, property), value);
      return;
    }

    declarations.push(
      `${toKebabCase(property)}:${resolveValue(property, value as PrimitiveStyleValue)};`,
    );
  });

  const rule = declarations.length ? `${selector}{${declarations.join("")}}` : "";

  return `${rule}${nestedRules}`;
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function styled<TElement extends React.ElementType>(
  element: TElement,
  style: StyleDefinition,
) {
  const { baseStyle, variants } = splitStyle(style);
  const baseClassName = `s-${hash(`base:${stableStringify(baseStyle)}`)}`;
  const variantClassNames: Record<string, Record<string, string>> = {};
  const variantCss: string[] = [];

  Object.entries(variants ?? {}).forEach(([variantName, variantValues]) => {
    variantClassNames[variantName] = {};

    Object.entries(variantValues).forEach(([variantValue, variantStyle]) => {
      const className = `s-${hash(
        `variant:${variantName}:${variantValue}:${stableStringify(variantStyle)}`,
      )}`;

      variantClassNames[variantName][variantValue] = className;
      variantCss.push(buildRules(`.${className}`, variantStyle));
    });
  });

  const cssText = [
    buildRules(`.${baseClassName}`, baseStyle),
    ...variantCss,
  ].join("");

  function StyledComponent({
    as,
    css,
    className,
    children,
    ...props
  }: StyledProps<TElement>) {
    const Element = as ?? element;
    const forwardedProps = { ...props };
    const selectedVariantClassNames = Object.keys(variantClassNames).map(
      (variantName) => {
        const variantValue = forwardedProps[variantName];

        delete forwardedProps[variantName];

        if (variantValue === undefined || variantValue === false || variantValue === null) {
          return undefined;
        }

        return variantClassNames[variantName][String(variantValue)];
      },
    );
    const runtimeClassName = css
      ? `s-${hash(`runtime:${stableStringify(css)}`)}`
      : undefined;
    const runtimeCss = css ? buildRules(`.${runtimeClassName}`, css) : "";

    return (
      <>
        <style
          data-styled={classNames(baseClassName, runtimeClassName)}
          dangerouslySetInnerHTML={{ __html: `${cssText}${runtimeCss}` }}
        />
        {React.createElement(
          Element,
          {
            ...forwardedProps,
            className: classNames(
              baseClassName,
              ...selectedVariantClassNames,
              runtimeClassName,
              className,
            ),
          },
          children,
        )}
      </>
    );
  }

  return StyledComponent;
}
