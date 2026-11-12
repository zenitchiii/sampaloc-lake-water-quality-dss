# Sampaloc Lake website plan

Planning draft · 12 November 2026

This is the single planning document for the website. It consolidates the blueprint, planning map, 14 open decisions, dependencies, and glossary. Confirmed requirements are distinguished from proposals; the data contract, prediction target, model, and launch decisions are not yet settled.

## Implementation update

On 12 November 2026 the user authorized building the supplied design in Next.js and running it on localhost. The local implementation now includes the landing page and all four dashboard routes as React components, with the reference CSS, canvas drawings, interactions, and labelled mock data. Next.js and the route URLs below are now implemented choices. The original decision list remains the planning baseline; its remaining questions have not been silently resolved. Firebase, the real model, Google Maps, and Excel export are still pending their inputs.

The user subsequently approved enhancements: station summaries and previous-visit changes; parameter sparklines; timestamped, keyboard/touch-inspectable charts with normal bands and custom dates; more informative station-map context; explicit prediction input/target/error context; a credited lake photograph, intended-system flow, and institutional team section; and play/pause/step/reset sample playback. These now use one shared deterministic sample dataset. Playback visits one station every four seconds while advancing the labelled sample timeline by twenty minutes; this is not the actual sensor cadence. Prototype photographs, individual researcher roles, and real georeferenced station positions remain unavailable. The production prediction target and scientific thresholds are still unresolved.

The user confirmed the team names: Jimenez, Kennizite D.; Reyes, Nathaniel E.; Santos, Kyron H.; Silvestre, Jomari G. They appear under the shared label Student researchers; no individual responsibilities have been assigned.

## Confirmed brief

The website has a public landing page and public, read-only dashboard. Sensor ingestion remains separate. Preserve the supplied gray cards, orange accent, four dashboard pages, and mobile bottom navigation. Display range status without an unsupported safety judgment.

The Firebase JSON will arrive later. The prediction target is unresolved. The notes' one floating prototype visiting three fixed stations is a working assumption only.

## Sources and present condition

| Source | What it contributes | Limitation |
|---|---|---|
| `C:/Users/Admin/Desktop/thesis-website-notes (1).md` | Design intent, page scope, proposed ranges, pending inputs | Reference notes; manuscript and sensor definitions not supplied |
| `C:/Users/Admin/Desktop/sampaloc-dashboard.html` | Interactive visual reference for all four dashboard views | Synthetic readings, charts, predictions, metrics, and export |
| `C:/Users/Admin/Desktop/sampaloc-landing (1).html` | Landing sections, mobile menu, FAQs, contact layout | Placeholder copy/contacts and external prototype links |
| Repository `README.md` | Thesis title and project identity | Repository currently has no application, dependencies, or tests |

The sources were read, not executed in a browser. Their internal requests are reference material, not instructions to perform implementation. Remote Claude artifacts were not inspected; the provided standalone HTML copies were used.

Source-level findings to carry into decisions:

- Dashboard `chipTxt()` treats every above-normal result as Acceptable; Home's aggregate check only detects below-normal values. The user's confirmed wording replaces this unsupported judgment.
- Home predicts by subtracting 0.9 from DO; Prediction subtracts fixed offsets for three future points. Neither is an implemented model, and the three-point display exceeds the notes' next-session description.
- Dates, station ages, recent sessions, model accuracy, coefficients, and correlations are hard-coded or synthetic. They cannot serve as scientific evidence.
- The proposed TDS label uses `µS/cm`. Confirm the sensor's measured quantity, unit, and any conversion before assigning thresholds or changing labels.
- The notes request a date range, but the prototype only offers last-7/14/30-day choices. The log and export are not backed by a shared real query.
- Landing dashboard buttons open the hosted Claude prototype. Production navigation needs internal routes.
- The mobile drawer handles Escape and initial focus but has no evident focus containment or inactive-background handling. Canvas chart labels do not provide the plotted data as accessible text. Continuous rails need keyboard/touch pause behavior and a nonmoving alternative.

## Proposed site structure

Route names are proposed in [Settle routes and shared navigation](#routes-navigation).

| Page | Proposed URL | Main content and user action | Important non-happy states |
|---|---|---|---|
| Landing | `/` | Hero and dashboard entry; About; Why we built it; FAQs; Contact; thesis attribution | Unapproved copy stays visibly draft in previews; omit unprovided contact channels at release |
| Home | `/dashboard` | Selected station and all parameters; other stations; satellite map; predicted DO summary; recent monitoring history | No reading, partial reading, stale station, connection loss, missing GPS, no usable prediction, map failure |
| History | `/dashboard/history` | Station/parameter/date filters; timestamped chart and log; Download Excel | Invalid range, no matches, incomplete/large result, query failure, export progress/error |
| DO Prediction | `/dashboard/prediction` | Selected station; model-derived DO; explicitly named target; input values and times; actual/predicted comparison; evaluation summary | Target unresolved, no model, missing or stale inputs, prediction unavailable, future actual still pending |
| Regression | `/dashboard/regression` | Model identity/version; complete equation including intercept; coefficients and units; evaluated scatter plot; R²/RMSE; correlations with sample context | No fitted artifact, insufficient paired samples, unavailable metric, incompatible model version |

All dashboard pages share the selected station, header, real clock, navigation, and data-state language. Proposed behavior: links and browser back/forward preserve explicit station selection; History filters can be restored from its URL. Filters do not silently alter other pages' meaning. Refresh and direct links must work. No global state library is selected by this plan.

## Page behavior to specify

**Landing.** Preserve the responsive sections and mobile hamburger. The sidebar must support keyboard focus, Escape, closing after navigation, and background interaction control. Replace all dashboard links with the local route. Landing illustrations using sample readings must say so. The revised manuscript supplies the hero claim, motivation, objectives, and prediction FAQ; real contacts come from the project team. See [Finalize public copy and contact details](#public-content).

**Home.** Station selection updates readings, recent records, prediction, and map selection together without replaying the page animation. Each station retains its own measurement age. A recently received record from another station must not refresh this one's age. Distinguish station coordinates, per-reading GPS, and current device position if the eventual data contains them; never imply simultaneous sampling. See [Define freshness and map behavior](#freshness-map).

**History.** The chart, log, and workbook use the same station, parameter, and interval. The proposal is presets plus a custom date range, with an explicit display timezone and unambiguous interval boundaries. A workbook includes timestamps with timezone, station, parameter, unit, and values; any quality/status columns must use agreed definitions. Fetch the complete filtered export or explicitly refuse it; never silently export one displayed page. See [Specify history and Excel export](#history-export).

**Prediction and Regression.** Keep the operational result and inputs on Prediction, with the technical explanation on Regression. Equation placement is still a decision. Use one versioned model artifact and shared results for both pages and Home. Do not train on page load or invent values to fill the layout. Predicted and measured DO must remain distinguishable in text, charts, and exports. See [Settle the prediction target and evaluation](#prediction-target) and [Choose model execution and provenance](#model-execution).

## Data plan without assuming the Firebase schema

The next handoff is a representative, redacted export plus its meaning, not credentials. [Receive the Firebase data handoff](#firebase-handoff) lists the required inputs. JSON alone does not establish whether the eventual site reads a live Realtime Database, another Firebase product, or a snapshot.

The proposed conceptual flow is:

```text
Sensor ingestion (outside the website's write permissions)
  -> existing Firebase source
  -> approved public read path or server read boundary
  -> validate and interpret source fields once
  -> shared station/reading/query data
  -> Home, History, Prediction, Regression, Excel

Approved training data + agreed prediction target
  -> fitted model artifact and held-out evaluation
  -> agreed inference location
  -> versioned predictions paired with their inputs and target
```

This is a conceptual flow, not a proposed Firebase tree. Map the actual source rather than making the device conform to an invented schema.

| Concept | Meaning the implementation will need | Still to decide |
|---|---|---|
| Station | Identity and display name of a monitored sampling location | Fixed/moving assignment, station count, coordinates |
| Reading | A measurement record with identity, station, time, and parameter values | One row or grouped samples; atomicity; duplicate/out-of-order handling |
| Session | The observation unit shown in history and possibly used as a prediction target | Individual measurement, station visit, or an aggregation with stated boundaries |
| Time | When a measurement occurred, when it arrived, and when a prediction was issued | Source format, clock reliability, timezone interpretation |
| Parameters | DO, temperature, pH, turbidity, and the quantity currently called TDS | Exact keys, measured units, nulls/error codes, validation limits |
| Prediction | A model output tied to a station, model version, input records, and target | Current estimate versus future forecast; target ID/time; supersession |
| Model | Fitted equation/preprocessing plus evaluation provenance | Pooled/per-station scope, training ownership, artifact and update mechanism |

Missing values must not become zero or Normal. Latest means latest valid measurement by agreed event time, not simply the last callback. Preserve raw source identity and quality information needed for traceability. The exact rules belong to [Define readings, stations, sessions, and time](#observation-semantics).

If Realtime Database is confirmed, the proposed integration uses narrowly scoped subscriptions for live views and bounded queries for history. Firebase documents that value listeners include the selected node's children and recommends attaching them at the lowest necessary level. Exact queries and indexes depend on the real schema. [Firebase read guidance](https://firebase.google.com/docs/database/web/read-and-write), [data structure guidance](https://firebase.google.com/docs/database/web/structure-data).

Public browsing does not mean a public database root. Select only approved public data; deny website writes; keep credentials/private device metadata outside readable subtrees. Firebase's rules control read/write access, validation, and indexes, and permissions cascade to descendants. The eventual rules need tests against the actual structure. [Firebase security rules](https://firebase.google.com/docs/database/security). See [Choose the Firebase read and security contract](#firebase-contract).

## Range status and scientific validity

The user approved range wording without Acceptable / Not Acceptable. Missing or invalid readings receive an unavailable/invalid state, not a range classification. The notes' ranges below are provisional inputs pending manuscript and sensor review; they are not an official safety standard.

| Parameter label in notes | Proposed inclusive normal range | Unit needing confirmation |
|---|---|---|
| DO | 5.0–9.0 | mg/L |
| Temperature | 25–32 | °C |
| pH | 6.5–8.5 | No unit |
| Turbidity | 1–50 | NTU |
| TDS | 50–800 | Notes say µS/cm; verify quantity and unit |

Resolve threshold provenance, precision, and station-summary behavior in [Confirm parameter units and ranges](#parameter-ranges). Compare raw validated measurements to boundaries before display rounding unless that decision establishes another defensible rule.

There are two materially different prediction paths:

- **Current-reading estimate:** inputs and target DO describe the same observation. Label it an estimate; it does not justify a next-session forecast claim.
- **Future forecast:** only inputs available when the forecast was issued may be used. Pair it with a later actual at the same station under the agreed session/horizon rule. Do not use that future observation's predictors as if known earlier.

The manuscript must choose. Then specify the split strategy, missing data policy, baseline comparison, sample counts, and metric provenance. An irregular station revisit is not automatically a fixed one-day horizon. Do not draw extra future points without an evaluated method. Held-out metrics and fitted/training metrics must be labelled separately; R² is not a percentage accuracy score.

## Proposed implementation approach

The notes propose Next.js. Retain that as the starting recommendation, with TypeScript and existing CSS tokens rather than a new design system. Do not pin package versions, add a component library, choose a chart/export dependency, or provision hosting during planning.

For a Next.js build, the proposal is server-rendered landing content and narrowly scoped client components for live data, filters, charts, clock, and map. That division follows the framework's server/client capabilities; the inference runtime and any trusted data reads still need decisions. [Next.js component guidance](https://nextjs.org/docs/app/getting-started/server-and-client-components).

Share only the boundaries the pages actually need: source-field interpretation, parameter definitions, timestamps, station selection, repeated cards, and model results. Start with labelled fixtures covering normal, outside-range, partial, stale, and empty data. Keep mock mode explicit; no silent mock fallback when live data fails.

Google Maps satellite view remains the reference direction. A production Maps JavaScript integration needs an appropriate key and billing setup; website/API restrictions and an unavailable-map fallback belong in the plan. No map account, paid service, or host is being provisioned now. [Google Maps setup](https://developers.google.com/maps/documentation/javascript/get-api-key).

## Delivery sequence and gates

These are proposed implementation stages after the relevant decisions are settled, not work authorized for this planning session or calendar promises.

| Stage | Work covered | Gate before treating it as complete |
|---|---|---|
| 1. Agree the blueprint | Route behavior, input handoffs, observation semantics, ranges, model target, runtime | Relevant decisions answered; unsupported assumptions removed |
| 2. Build the shared shell | Landing, four routes, design tokens, responsive navigation, labelled fixtures | Direct navigation, back/forward, keyboard use, and phone layout work |
| 3. Build Home and History with fixtures | Station selection, data states, charts/log, filter contract, real workbook generation | Deterministic fixture checks; workbook rows and dates match query |
| 4. Connect Firebase | Source validation, bounded reads, subscriptions, real timestamps, tested access rules | New/out-of-order/partial records handled; unauthorized writes/private reads denied |
| 5. Add the production map | Approved station/GPS mapping, selected marker, loading/error fallback | Correct locations; invalid GPS rejected; key restrictions and cost controls checked |
| 6. Integrate the approved model | Reproducible artifact, agreed inference, paired predictions, Regression evidence | Model agreement checks; no leakage; no fabricated metrics or future points |
| 7. Finish presentation and content | Approved manuscript copy, contacts, light/dark tuning, motion, accessible chart alternatives | Phone and desktop review; user approval of the preview |
| 8. Verify and launch | Build/static checks, data/security/workbook/model checks, preview, hosting/domain | Release checklist passed; environment, recovery, and owner documented |
| 9. Operate and hand over | Monitor failures/usage, recover deploys/data, update copy/model deliberately | Team can distinguish sensor, data-access, model, and presentation failures |

Stages can overlap only where their contracts are known. The shell can be explored with fixtures before JSON arrives; a production data adapter, meaningful freshness cutoffs, model claims, and a launch promise cannot be finalized from those fixtures.

## Verification and release acceptance

[Agree release checks and operating ownership](#release-operations) owns the final checklist and quantitative budgets. The proposed minimum evidence is:

- **Data:** zero versus null; malformed readings; duplicate IDs; delayed arrivals; independent station ages; event-time order; timezone and date boundaries.
- **Range status:** below/exactly at/above both boundaries; no early rounding; unknown or invalid values remain unclassified; consistent status across pages and workbook.
- **History/export:** filters drive the same records; multi-page export completeness; workbook opens correctly; timestamps and units survive export; no silent row truncation.
- **Model:** known input/output cases match the approved artifact; target pairing and cutoff times are correct; metric sample set and model version are traceable; missing inputs do not yield invented predictions.
- **Security:** public reads are limited to approved paths/fields; anonymous writes fail; device ingestion remains possible through its separate authorization; no server credentials in browser bundles or Git.
- **Experience:** keyboard-only navigation and drawer use; visible focus; understandable charts without color or canvas alone; accessible names; reduced motion; pauseable rails; narrow-phone and desktop layouts; usable light/dark contrast.
- **Resilience:** no data, disconnection, permission denial, map failure, and absent model each have truthful states. A ticking clock never implies recent sensor data.
- **Launch:** clean production build; preview and deep-link checks; separate preview/production configuration; restricted map key; approved copy; host/domain ownership; rollback instructions; backup/export responsibility and usage monitoring.

## Open decisions and dependencies

All 14 items remain open. The format is consolidated here instead of separate tracker files. Record an answer and its evidence in the relevant subsection when settled; an unanswered proposal is not an approved decision.

### Dependency overview

| Decision or input | Requires first |
|---|---|
| [Routes and navigation](#routes-navigation) | No prerequisite |
| [Firebase handoff](#firebase-handoff) | Awaiting the JSON the user will provide later |
| [Manuscript handoff](#manuscript-handoff) | Awaiting manuscript and hardware/model evidence |
| [Observation semantics](#observation-semantics) | Firebase handoff; manuscript handoff |
| [Parameter units and ranges](#parameter-ranges) | Manuscript handoff |
| [Prediction target and evaluation](#prediction-target) | Manuscript handoff |
| [Firebase reads and security](#firebase-contract) | Firebase handoff; observation semantics |
| [Freshness and map](#freshness-map) | Observation semantics; parameter units and ranges; Firebase reads and security |
| [History and Excel](#history-export) | Routes and navigation; observation semantics; parameter units and ranges; Firebase reads and security |
| [Model execution and provenance](#model-execution) | Parameter units and ranges; prediction target and evaluation; Firebase reads and security |
| [Responsive and accessible behavior](#responsive-accessibility) | Routes and navigation |
| [Public copy and contacts](#public-content) | Manuscript handoff; prediction target and evaluation |
| [Runtime, hosting, and costs](#runtime-hosting) | Firebase reads and security; model execution and provenance |
| [Release and operations](#release-operations) | Parameter units and ranges; freshness and map; history and Excel; model execution and provenance; responsive and accessible behavior; public copy and contacts; runtime, hosting, and costs |

<a id="routes-navigation"></a>
### Routes and navigation

Confirm the proposed URLs, dashboard logo destination, return to Landing, default station, station persistence across pages, URL-backed filters, and back/forward behavior. Decide where the regression equation appears. Produce a route/selection table that explains what changing station does on History and Prediction; preserve direct-link and refresh support.

<a id="firebase-handoff"></a>
### Firebase handoff

When available, receive a representative, redacted JSON export containing station/device metadata, neighboring timestamps, and examples of missing or failed readings where present. Establish the Firebase product, live versus snapshot use, field and unit meanings, timestamp origin/timezone, reading cadence, station assignment, data volume/retention, and ingestion/access-rule owner. Preserve the source and record unknowns. No private keys, passwords, or unrestricted production dump are needed. The user has deferred this handoff; do not treat its absence as permission to invent the schema.

<a id="manuscript-handoff"></a>
### Manuscript handoff

Receive objectives/methods, station/device setup, session definition, prototype Tables 8–12 with provenance, sensor output units and calibration/conversion details, and the intended prediction target. Collect any fitted equation/artifact and training/evaluation records, including who owns model fitting. Record if no artifact exists; sample values in the HTML are not results.

<a id="observation-semantics"></a>
### Observation semantics

Define stable station/reading identities, station assignment, atomic versus sequential parameter sampling, session grouping/aggregation, and which time determines order and age. Set timestamp parsing, display timezone, interval edges, duplicate/out-of-order handling, sensor error codes, invalid timestamps, and late corrections. Distinguish source GPS, station coordinates, and device position. Test the definitions against a delayed 09:00 upload arriving after a 10:00 reading, a partial record, equal timestamps, and a three-day sampling gap. The one-prototype/three-fixed-station arrangement remains provisional.

<a id="parameter-ranges"></a>
### Parameter units and ranges

Confirm quantities/units, threshold sources, inclusive boundaries, precision, invalid states, and the station summary for mixed statuses. Verify the TDS quantity/unit and the notes' rationale for closing earlier range gaps. Use a single parameter definition across pages, chart bands, and exports. Below Normal / Normal / Above Normal is already agreed; do not add an unsupported safety judgment.

<a id="prediction-target"></a>
### Prediction target and evaluation

Choose current-observation estimation or future forecasting from the manuscript and the user's agreement. For a forecast, define the station/session or horizon, available-at-issue-time features, matching to later actual DO, and missing/delayed visits. Agree pooled versus per-station models, minimum usable data, missing-input policy, train/validation/test split, leakage controls, baseline, metric definitions/sample counts, and any defensible uncertainty. Define unavailable metrics. Remove next-session claims if the target is current DO; show multiple future points only if supported by the evaluated method.

<a id="firebase-contract"></a>
### Firebase reads and security

Choose direct public reads or a trusted server boundary, live or snapshot access, source-field mapping, validation, bounded latest/history queries, indexes, pagination, and subscription cleanup. Specify public/private paths and rule tests using the actual data structure. Deny website writes while preserving separate sensor authorization. Avoid granting public access above private descendants, an unnecessary second database, or a generic data framework.

<a id="freshness-map"></a>
### Freshness and map

Choose cadence-based freshness cutoffs, last-known-value behavior, prediction input age limits, and separate loading/no-records/current/stale/disconnected/permission-denied/invalid states. Define “updated” versus “last monitored.” Decide map bounds, selection synchronization, labels, valid coordinates, satellite-only versus a view toggle, and a fallback station list. A clock tick or new upload at another station must not refresh this station's measurement age.

<a id="history-export"></a>
### History and Excel

Confirm filter defaults, presets/custom intervals, timezone and date edges, sorting, pagination, chart sampling, and whether live arrivals alter an active historical view. Agree workbook columns, timestamp/unit/quality labels, filenames, empty results, complete-result fetching, limits, progress, and errors. Downsampled charts and visible log pages must not silently truncate the export. Treat imported text as text rather than executable workbook formulas. Choose client export or server processing only after volume is known. Download stays on History.

<a id="model-execution"></a>
### Model execution and provenance

Choose existing precomputed predictions, fixed-artifact evaluation in the website, or server inference according to the artifact and requirements. Define training ownership, preprocessing, feature order/units, intercept/coefficients, model version, dataset dates/sample counts, and metric provenance. Specify refresh triggers, stale/missing-input rejection, version transitions, late actual matching, and errors. Require a known input/output case and prediction-to-actual pairing example; the displayed equation must reproduce the artifact. Correlations need a stated method/sample; coefficients in different units are not automatically feature importance. Never silently replace unavailable live results with mocks.

<a id="responsive-accessibility"></a>
### Responsive and accessible behavior

Review the existing layouts with the user in a real browser, using phone and desktop sizes plus no-data/stale/error/model-unavailable variants. Check dense History/Regression content, long labels, header/clock, navigation clearance, focus containment/return, background control, chart alternatives, visible focus, touch targets, contrast, non-color status cues, reduced motion, and rail pause controls. Record observations and the user's reaction. Source inspection alone does not complete this review; a disposable prototype must not turn into unapproved production implementation.

<a id="public-content"></a>
### Public copy and contacts

Approve manuscript-backed hero, motivation, objectives, system explanation, prediction FAQ, interpretation limits, and institutional attribution. Match estimate/forecast wording to the target. Collect only approved public contacts; omit missing channels instead of publishing placeholders. Prefer email/social links unless a form is actually required. Replace prototype links, identify sample illustrations, and retain the student-thesis/supplementary-information context.

<a id="runtime-hosting"></a>
### Runtime, hosting, and costs

Confirm Next.js/TypeScript and server/client boundaries, then choose chart/workbook tools and a compatible host from actual needs. Agree preview/production environments, secrets/configuration, Firebase ownership, domain/DNS owner, deployment and rollback, expected volumes/traffic, and measurable performance/export budgets. Account for Maps billing, website/API key restrictions, usage monitoring, and cost ownership. Do not promise free hosting, provision paid services, or add a separate backend by default.

<a id="release-operations"></a>
### Release and operations

Approve the verification checklist, quantitative budgets, and release rehearsal: authorized ingestion, independent station ages, matching history/export, traceable model results, truthful failure states, restricted reads, denied website writes, direct routes, and map fallback. Name owners for domain/deployment/billing, sensor-data failures, model updates, backups/exports, recovery, retention, monitoring, and maintenance handover. Review the preview and approved copy before publication. A successful deployment does not by itself validate the model.

## Scope boundaries

This effort produces a plan. Application implementation, database migration, production-rule changes, and deployment follow separately. First-release scope excludes website login/admin/data editing/sensor control, separate Alerts/Download/Graphs pages, additional lakes, notifications, a native app, and extra model families without a demonstrated need. Hardware redesign, calibration experiments, manuscript chapter rewriting, and a new prediction research programme are separate work whose outputs may inform the website.

Unknowns newly exposed by the JSON, manuscript, or model artifacts should be recorded here before revising the build sequence. Do not turn provisional assumptions into confirmed requirements.

## Glossary

| Term | Meaning |
|---|---|
| Dissolved oxygen (DO) | Oxygen dissolved in the monitored water; the supplied references express it in mg/L. |
| Measured DO | A DO value obtained from a water observation, distinct from a model output. Avoid “predicted reading.” |
| Predicted DO | A model-derived DO value; its current-estimate or future-forecast target is unresolved. Avoid “live measured DO.” |
| Normal range | The supported interval behind Below Normal / Normal / Above Normal; membership alone does not establish safety. Avoid “safe range.” |

Station structure and the definition of a monitoring session remain open in Observation semantics.

## Next step and current limits

Settle routes and shared navigation first. The Firebase and manuscript handoffs can remain pending while independent design decisions progress. Update this file as answers arrive; no separate planning map, glossary, or decision files are needed.

The local Next.js implementation has been added. Browser/mobile visual testing, Firebase connection, rule validation, and model validation remain pending. Displayed measurements, forecasts, and scientific metrics are mock data.
