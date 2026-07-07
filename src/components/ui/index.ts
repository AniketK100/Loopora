/**
 * UI Component Barrel Export — InterviewLoop Design System
 *
 * All base design system components are re-exported from here
 * for convenient imports:
 *
 * ```tsx
 * import { Button, Card, Input, Badge, Accordion } from "@/components/ui";
 * ```
 *
 * @module components/ui
 */

export { Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export { Card } from "./Card";
export type { CardProps, CardDecoration } from "./Card";

export { Input } from "./Input";
export type { InputProps } from "./Input";

export { Badge, RankTab } from "./Badge";
export type { BadgeProps, BadgeVariant, RankTabProps } from "./Badge";

export { Accordion } from "./Accordion";
export type { AccordionProps, AccordionItem } from "./Accordion";

export { Select } from "./Select";
export type { SelectProps, SelectOption } from "./Select";

export { Toggle } from "./Toggle";
export type { ToggleProps } from "./Toggle";

export { CookieConsent } from "./CookieConsent";
