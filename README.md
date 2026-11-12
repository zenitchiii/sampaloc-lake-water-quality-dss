# sampaloc-lake-water-quality-dss
Development of an IoT-based Water Quality Monitoring System Using Multivariate Predictive Modeling of Dissolved Oxygen via Regression for Decision Support System of Sampaloc Lake

Next.js recreation of the supplied Sampaloc Lake landing page and dashboard designs. The UI uses native React components, SVG charts and illustrations, the original design tokens, and deterministic sample data.

## Run locally

Use Node.js 24 or newer. In PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

Open [localhost:3000](http://localhost:3000). Stop the server with Ctrl+C in its terminal.

| Page | Route |
|---|---|
| Landing | `/` |
| Home | `/dashboard` |
| History | `/dashboard/history` |
| DO prediction | `/dashboard/prediction` |
| Regression | `/dashboard/regression` |

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

The local prototype requires no Firebase credentials. Home shows the selected station’s measurements, a schematic map, the other stations, and four previous DO samples. History supports custom dates, a normal-range band, hover/touch/keyboard chart inspection, and an accessible data table. The demo toolbar can play, pause, step, or reset a simulated three-station monitoring cycle; each four-second update advances the sample timeline by twenty minutes and updates one station.

Readings and station positions are illustrative. Prediction checks pair the demonstration rule (prior sample DO minus 0.9 mg/L) with a later sample at the same station; they are not fitted-model results. The scientific prediction target and evaluation remain pending. Excel export still displays a mocked-export message. Actual Firebase mapping, model validation, Google Maps integration, and real workbook export follow separately.

The interface uses concise labels, expandable model details, softly fading graphs with solid fills, and short staggered card entrances. Light/dark mode follows the system preference and interpolates the shared color palette over 450 ms, including chart colors. Dashboard navigation crossfades content using React ViewTransition when supported, without delaying navigation or restarting the old page’s cards. Bottom tile rows scroll automatically in a seamless loop and pause on hover or keyboard focus. Their animation does not restart on data updates. Reduced motion disables theme/reveal animations and uses manual scrolling with no duplicate items. History filter changes replay the graph reveal; station and playback updates keep cards in place.

The landing page includes a credited photograph of Sampaloc Lake, an intended-system flow diagram, and the four confirmed student researchers with their institutional attribution. The sensor drawing is a concept illustration; actual prototype photos, individual researcher roles, contacts, and manuscript-backed copy have not been supplied. Photo attribution and license are included beside the image and in `public/images/ATTRIBUTION.txt`.

The original HTML and `handoff.md` were used as design references. The confirmed range wording from this conversation takes precedence over their Acceptable/Not Acceptable labels.

Full plan and outstanding decisions: [PLAN.md](PLAN.md).
