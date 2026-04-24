## 2024-05-22 - [DataTable Accessibility and Resizer Usability]
**Learning:** Standard HTML tables benefit greatly from ARIA attributes for sort state and cell context. Column resizers need a larger invisible hit area than their visual representation to be user-friendly.
**Action:** Always include aria-sort on sortable headers and aria-label on cell inputs. Use a wrapper div for resizers to separate the hit area from the visual line.
