# Web asset usage

The shipped web assets are a focused subset of the supplied OmniTask identity system. Source files remain in `docs/ui`; runtime copies live under `frontend/src/assets` or `frontend/public`.

| Runtime asset                           | Source family                 | Use                                               |
| --------------------------------------- | ----------------------------- | ------------------------------------------------- |
| `brand/omnitask-horizontal-primary.svg` | Brand Kit logos               | Header logo on light surfaces                     |
| `brand/omnitask-horizontal-white.svg`   | Brand Kit logos               | Header logo on dark surfaces                      |
| `public/favicon.ico`                    | Brand Kit web                 | Browser favicon                                   |
| `fonts/FunnelDisplay-Variable.ttf`      | Brand Kit fonts               | Body, controls and data                           |
| `fonts/Unbounded-Variable.ttf`          | Brand Kit fonts               | Display headings                                  |
| `backgrounds/horizon-*-mobile.svg`      | Abstract Graphics backgrounds | Login background below 1024 px                    |
| `backgrounds/horizon-*-desktop.svg`     | Abstract Graphics backgrounds | Login background from 1024 px                     |
| `backgrounds/eclipse-*-mobile.svg`      | Abstract Graphics backgrounds | Registration background below 1024 px             |
| `backgrounds/eclipse-*-desktop.svg`     | Abstract Graphics backgrounds | Registration background from 1024 px              |
| `overlays/horizon-light.svg`            | Abstract Graphics overlays    | Slow ambient login layer in light theme           |
| `overlays/horizon-dark.svg`             | Abstract Graphics overlays    | Slow ambient login layer in dark theme            |
| `overlays/eclipse-light.svg`            | Abstract Graphics overlays    | Slow ambient registration layer in light theme    |
| `overlays/eclipse-dark.svg`             | Abstract Graphics overlays    | Slow ambient registration layer in dark theme     |
| `overlays/matrix-light.svg`             | Abstract Graphics overlays    | Task workspace and toolbar texture in light theme |
| `overlays/matrix-dark.svg`              | Abstract Graphics overlays    | Task workspace and toolbar texture in dark theme  |
| `fragments/interlock.svg`               | Abstract Graphics fragments   | Empty-task illustration                           |
| `patterns/tile-light.svg`               | Abstract Graphics patterns    | Subtle authenticated shell texture in light theme |
| `patterns/tile-dark.svg`                | Abstract Graphics patterns    | Subtle authenticated shell texture in dark theme  |

Each decorative image is hidden from assistive technology and leaves text contrast to semantic color tokens. Mobile and desktop background variants are selected with CSS media queries; light and dark variants follow the resolved document theme. Overlays use low opacity and slow translation and scale cycles. Continuous movement is disabled when `prefers-reduced-motion` is active.

The Brand Kit background collection is intentionally excluded from the application. The Abstract Graphics collection provides the requested Horizon, Eclipse, Matrix and Interlock visual language with fewer competing motifs. Unused fragments and overlays are not copied into the production bundle.
