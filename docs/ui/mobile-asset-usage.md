# Mobile asset usage

The Flutter client uses supplied OmniTask assets without altering the logo geometry or brand colors.

| Product area | Asset |
| --- | --- |
| App bars and authentication | Horizontal primary and white logo signatures |
| Android and iOS launch identity | Blue OmniTask app icon |
| Login | Horizon mobile background |
| Registration | Eclipse mobile background |
| Task workspace | Matrix light and dark overlays |
| Empty task state | Blue orbit fragment |
| Typography | Funnel Display for interface text and Unbounded for display headings |

Backgrounds remain decorative and excluded from semantics. Their opacity preserves text contrast. Motion uses an 18-second reversible translation and scale with small amplitude. Flutter disables it when the platform reports reduced animations. Entry transitions use short ease-out curves, and task feedback uses native selection, light, medium and heavy haptic patterns according to impact.

English is the primary locale and French is complete in the ARB catalogs. Brand names and logo semantic labels remain unchanged across locales.
