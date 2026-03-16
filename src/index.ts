/**
 * Remotion Entry Point
 *
 * This file is the webpack entry. It registers the Root component,
 * which contains all Composition registrations.
 *
 * Do not add logic here — keep it to this single line.
 */

import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
